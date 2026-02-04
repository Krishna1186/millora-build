import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileIcon, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProjectUploadForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState("");
  const [manufacturingType, setManufacturingType] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const materials = [
    // Plastics
    "PLA Plastic",
    "ABS Plastic", 
    "PETG Plastic",
    "Nylon (PA)",
    "Polycarbonate (PC)",
    "POM (Delrin)",
    "PEEK",
    "TPU (Flexible)",
    
    // Metals
    "Aluminum",
    "Stainless Steel",
    "Steel",
    "Brass",
    "Copper",
    "Titanium",
    "Zinc Alloy",
    "Magnesium",
    
    // Composites & Others
    "Carbon Fiber",
    "Fiberglass", 
    "MDF Wood",
    "Acrylic (PMMA)",
    "Silicone",
    "Rubber",
    "Glass",
    
    // Custom Option
    "Other (Specify)"
  ];

  const [customMaterial, setCustomMaterial] = useState("");
  const [showCustomMaterial, setShowCustomMaterial] = useState(false);

  const manufacturingTypes = [
    "3D Printing",
    "CNC Machining", 
    "Injection Molding",
    "Sheet Metal Fabrication",
    "Laser Cutting",
    "Waterjet Cutting",
    "Investment Casting",
    "Sand Casting"
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['.dwg', '.dxf', '.step', '.stp', '.iges', '.igs', '.stl', '.obj', '.pdf'];
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (allowedTypes.includes(fileExt)) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a CAD file (.dwg, .dxf, .step, .stl, .pdf, etc.)",
          variant: "destructive"
        });
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleChooseFileClick = () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    fileInput?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !user || !projectName || !material || !manufacturingType) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and select a file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(fileName);

      // Save project to database
      const { data: insertData, error: dbError } = await supabase
        .from('projects')
        .insert({
          project_name: projectName,
          description: description || null,
          material,
          manufacturing_type: manufacturingType,
          file_url: publicUrl,
          user_id: user.id,
          status: 'open',
          expected_delivery_date: expectedDeliveryDate || null
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Trigger CAD preview generation immediately for CAD files
      const isCADFile = selectedFile.name.match(/\.(dwg|dxf)$/i);
      if (isCADFile && insertData) {
        console.log('🚀 [ProjectUpload] Triggering immediate CAD preview generation');
        try {
          const { error: previewError } = await supabase.functions.invoke('convert-cad', {
            body: { 
              projectId: insertData.id, 
              fileName: publicUrl 
            }
          });
          
          if (previewError) {
            console.error('❌ [ProjectUpload] Preview generation failed:', previewError);
          } else {
            console.log('✅ [ProjectUpload] Preview generation initiated successfully');
          }
        } catch (previewErr) {
          console.error('❌ [ProjectUpload] Preview generation error:', previewErr);
        }
      }

      toast({
        title: "Project uploaded successfully!",
        description: "Your project has been submitted and manufacturers can now bid on it."
      });

      // Reset form
      setProjectName("");
      setDescription("");
      setMaterial("");
      setManufacturingType("");
      setExpectedDeliveryDate("");
      setSelectedFile(null);
      onSuccess();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="projectName">Project Name</Label>
        <Input
          id="projectName"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Enter project name"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your project requirements..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="expectedDeliveryDate">Expected Delivery Date (Optional)</Label>
        <Input
          id="expectedDeliveryDate"
          type="date"
          value={expectedDeliveryDate}
          onChange={(e) => setExpectedDeliveryDate(e.target.value)}
        />
      </div>

        <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Material</Label>
          <Select 
            value={material} 
            onValueChange={(value) => {
              setMaterial(value);
              setShowCustomMaterial(value === "Other (Specify)");
            }} 
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent className="max-h-48 overflow-y-auto">
              {materials.map((mat) => (
                <SelectItem key={mat} value={mat}>{mat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showCustomMaterial && (
            <Input
              placeholder="Specify custom material"
              value={customMaterial}
              onChange={(e) => setCustomMaterial(e.target.value)}
              className="mt-2"
              required
            />
          )}
        </div>

        <div>
          <Label>Manufacturing Method</Label>
          <Select value={manufacturingType} onValueChange={setManufacturingType} required>
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {manufacturingTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>CAD File</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          {selectedFile ? (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <FileIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                Drop your CAD file here or click to browse
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Supports: DWG, DXF, STEP, STL, PDF, IGES, OBJ (Max 50MB)
              </p>
              <input
                type="file"
                accept=".dwg,.dxf,.step,.stp,.iges,.igs,.stl,.obj,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <Button 
                variant="outline" 
                type="button"
                onClick={handleChooseFileClick}
              >
                CHOOSE FILE
              </Button>
            </>
          )}
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full luxury-button luxury-button-primary" 
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "UPLOAD PROJECT"}
      </Button>
    </form>
  );
};

export default ProjectUploadForm;
