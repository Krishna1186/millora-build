
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log(`🚀 [convert-cad] Starting edge function`)
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    console.log(`📨 [convert-cad] Request body:`, requestBody)
    
    const { projectId, fileName } = requestBody
    const cloudConvertApiKey = Deno.env.get('CLOUDCONVERT_API_KEY')
    
    console.log(`🔑 [convert-cad] Environment check:`, {
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      hasCloudConvertKey: !!cloudConvertApiKey,
      projectId,
      fileName
    })
    
    if (!cloudConvertApiKey) {
      console.error('❌ [convert-cad] CloudConvert API key not configured')
      throw new Error('CloudConvert API key not configured')
    }

    console.log(`🔄 [convert-cad] Starting CAD conversion for project ${projectId}, file: ${fileName}`)

    // Extract the file path from the full file URL if needed
    let filePath = fileName
    console.log(`📂 [convert-cad] Original fileName: ${fileName}`)
    
    if (fileName.includes('/object/public/project-files/')) {
      // Extract path after project-files/
      filePath = fileName.split('/object/public/project-files/')[1]
      console.log(`🔄 [convert-cad] Extracted path from full URL: ${filePath}`)
    } else if (fileName.startsWith('http')) {
      // If it's a full URL, extract the path
      const url = new URL(fileName)
      filePath = url.pathname.split('/object/public/project-files/')[1]
      console.log(`🌐 [convert-cad] Extracted path from HTTP URL: ${filePath}`)
    } else {
      console.log(`📝 [convert-cad] Using fileName as-is: ${filePath}`)
    }

    console.log(`📥 [convert-cad] Attempting to download file from storage path: ${filePath}`)

    // Get the CAD file from storage
    console.log(`💾 [convert-cad] Downloading from bucket 'project-files', path: '${filePath}'`)
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('project-files')
      .download(filePath)

    if (downloadError) {
      console.error(`❌ [convert-cad] Download error details:`, downloadError)
      console.error(`❌ [convert-cad] Failed storage path: '${filePath}'`)
      throw new Error(`Failed to download file: ${downloadError.message}`)
    }

    console.log(`✅ [convert-cad] Successfully downloaded file, size: ${fileData.size} bytes`)

    // Step 1: Create a CloudConvert job
    console.log(`🔄 [convert-cad] Creating CloudConvert job...`)
    const jobPayload = {
      tasks: {
        'import-file': {
          operation: 'import/upload'
        },
        'convert-file': {
          operation: 'convert',
          input: 'import-file',
          output_format: 'png'
        },
        'export-file': {
          operation: 'export/url',
          input: 'convert-file'
        }
      }
    }
    console.log(`📤 [convert-cad] Job payload:`, JSON.stringify(jobPayload, null, 2))
    
    const jobResponse = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cloudConvertApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobPayload)
    })

    console.log(`📨 [convert-cad] Job creation response status: ${jobResponse.status}`)

    if (!jobResponse.ok) {
      const errorText = await jobResponse.text()
      console.error(`❌ [convert-cad] CloudConvert job creation failed:`, errorText)
      throw new Error(`CloudConvert job creation failed: ${errorText}`)
    }

    const jobData = await jobResponse.json()
    console.log(`✅ [convert-cad] Job created successfully, ID: ${jobData.data.id}`)
    console.log(`📋 [convert-cad] Job data:`, JSON.stringify(jobData, null, 2))
    
    const uploadTask = jobData.data.tasks.find((task: any) => task.name === 'import-file')
    
    if (!uploadTask?.result?.form) {
      console.error('Upload task not found in CloudConvert response:', jobData)
      throw new Error('Upload task not found in CloudConvert response')
    }

    console.log('Uploading file to CloudConvert...')

    // Step 2: Upload the file to CloudConvert
    const formData = new FormData()
    Object.entries(uploadTask.result.form.parameters).forEach(([key, value]) => {
      formData.append(key, value as string)
    })
    
    // Use just the filename for the CloudConvert upload
    const simpleFileName = filePath.split('/').pop() || 'file.dwg'
    formData.append('file', fileData, simpleFileName)

    const uploadResponse = await fetch(uploadTask.result.form.url, {
      method: 'POST',
      body: formData
    })

    if (!uploadResponse.ok) {
      const uploadErrorText = await uploadResponse.text()
      console.error('File upload to CloudConvert failed:', uploadErrorText)
      throw new Error(`File upload to CloudConvert failed: ${uploadResponse.statusText}`)
    }

    console.log('File uploaded successfully to CloudConvert')

    // Step 3: Wait for conversion to complete
    let jobStatus = jobData.data
    let attempts = 0
    const maxAttempts = 60 // 60 seconds timeout
    
    while (jobStatus.status !== 'finished' && jobStatus.status !== 'error' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const statusResponse = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobStatus.id}`, {
        headers: {
          'Authorization': `Bearer ${cloudConvertApiKey}`,
        }
      })
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        jobStatus = statusData.data
        console.log(`Job status: ${jobStatus.status}`)
      }
      
      attempts++
    }

    if (jobStatus.status === 'error') {
      const errorDetails = jobStatus.tasks?.find((t: any) => t.status === 'error')?.message || 'Unknown error'
      throw new Error(`CloudConvert conversion failed: ${errorDetails}`)
    }
    
    if (jobStatus.status !== 'finished') {
      throw new Error('CloudConvert conversion timeout')
    }

    // Step 4: Get the converted file URL
    const exportTask = jobStatus.tasks.find((task: any) => task.name === 'export-file')
    if (!exportTask?.result?.files?.[0]?.url) {
      throw new Error('No converted file URL found')
    }

    const convertedFileUrl = exportTask.result.files[0].url

    // Step 5: Download and re-upload to our storage
    const convertedFileResponse = await fetch(convertedFileUrl)
    if (!convertedFileResponse.ok) {
      throw new Error('Failed to download converted file from CloudConvert')
    }

    const convertedFileData = await convertedFileResponse.blob()
    const previewFileName = `previews/${projectId}_preview.png`
    
    const { error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(previewFileName, convertedFileData, {
        upsert: true,
        contentType: 'image/png'
      })

    if (uploadError) {
      throw new Error(`Failed to upload preview: ${uploadError.message}`)
    }

    // Update project with preview URL
    const { error: updateError } = await supabase
      .from('projects')
      .update({ preview_url: previewFileName })
      .eq('id', projectId)

    if (updateError) {
      throw new Error(`Failed to update project: ${updateError.message}`)
    }

    console.log(`Successfully converted CAD file for project ${projectId}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        previewUrl: previewFileName 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('CAD conversion error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
