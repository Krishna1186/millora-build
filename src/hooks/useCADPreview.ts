
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCADPreview = (projectId: string, fileUrl?: string) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`🔍 [useCADPreview] Hook called with:`, { projectId, fileUrl });
    
    if (!fileUrl) {
      console.log(`⚠️ [useCADPreview] No fileUrl provided, exiting early`);
      return;
    }
    
    if (!projectId) {
      console.log(`⚠️ [useCADPreview] No projectId provided, exiting early`);
      return;
    }

    const generatePreview = async () => {
      console.log(`🚀 [useCADPreview] Starting generatePreview for project: ${projectId}`);
      setLoading(true);
      setError(null);

      try {
        // Check if preview already exists
        console.log(`📊 [useCADPreview] Checking for existing preview for project: ${projectId}`);
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('preview_url')
          .eq('id', projectId)
          .single();

        if (projectError) {
          console.error(`❌ [useCADPreview] Error fetching project:`, projectError);
          setError(`Database error: ${projectError.message}`);
          setLoading(false);
          return;
        }

        console.log(`📋 [useCADPreview] Project data:`, project);

        if (project?.preview_url) {
          console.log(`✅ [useCADPreview] Found existing preview_url: ${project.preview_url}`);
          // Get preview URL from storage
          const { data } = supabase.storage
            .from('project-files')
            .getPublicUrl(project.preview_url);
          
          console.log(`🔗 [useCADPreview] Generated public URL: ${data.publicUrl}`);
          setPreviewUrl(data.publicUrl);
          setLoading(false);
          return;
        }

        // Generate new preview - pass the full fileUrl for proper path extraction
        console.log(`🔄 [useCADPreview] Generating new CAD preview for:`, { projectId, fileUrl });

        const { data, error } = await supabase.functions.invoke('convert-cad', {
          body: { projectId, fileName: fileUrl }
        });

        console.log(`📨 [useCADPreview] Edge function response:`, { data, error });

        if (error) {
          console.error(`❌ [useCADPreview] Edge function error:`, error);
          setError(`Conversion failed: ${error.message || 'Unknown error'}`);
          setLoading(false);
          return;
        }

        if (data?.previewUrl) {
          console.log(`✅ [useCADPreview] Preview generated successfully: ${data.previewUrl}`);
          const { data: publicUrlData } = supabase.storage
            .from('project-files')
            .getPublicUrl(data.previewUrl);
          
          console.log(`🔗 [useCADPreview] Final preview URL: ${publicUrlData.publicUrl}`);
          setPreviewUrl(publicUrlData.publicUrl);
        } else {
          console.warn(`⚠️ [useCADPreview] No preview URL returned from edge function`);
          setError('No preview URL returned from conversion service');
        }

      } catch (err: any) {
        console.error(`❌ [useCADPreview] Preview generation error:`, err);
        setError(`Preview generation failed: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    // Only generate preview for CAD files
    const isCADFile = fileUrl.match(/\.(dwg|dxf)$/i);
    console.log(`🔍 [useCADPreview] File extension check:`, { fileUrl, isCADFile: !!isCADFile });
    
    if (isCADFile) {
      console.log(`✅ [useCADPreview] CAD file detected, starting preview generation`);
      generatePreview();
    } else {
      console.log(`⚠️ [useCADPreview] Not a CAD file, skipping preview generation`);
    }
  }, [projectId, fileUrl]);

  return { previewUrl, loading, error };
};
