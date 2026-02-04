import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Upload, FileIcon, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  project_name: string;
  description: string | null;
  material: string;
  manufacturing_type: string;
  file_url: string;
  expected_delivery_date: string | null;
}

interface EditProjectModalProps {
  project: Project;
  onProjectUpdated: () => void;
}

const EditProjectModal = ({ project, onProjectUpdated }: EditProjectModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState(project.project_name);
  const [description, setDescription] = useState(project.description || "");
  const [material, setMaterial] = useState(project.material);
  const [manufacturingType, setManufacturingType] = useState(project.manufacturing_type);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(project.expected_delivery_date || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const materials = [
    "PLA Plastic", "ABS Plastic", "PETG Plastic", "Nylon (PA)", "Polycarbonate (PC)",
    "POM (Delrin)", "PEEK", "TPU (Flexible)", "Aluminum", "Stainless Steel",
    "Steel", "Brass", "Copper", "Titanium", "Zinc Alloy", "Magnesium",
    "Carbon Fiber", "Fiberglass", "MDF Wood", "Acrylic (PMMA)", "Silicone",
    "Rubber", "Glass", "Other (Specify)"
  ];

  const manufacturingTypes = [
    "3D Printing", "CNC Machining", "Injection Molding", "Sheet Metal Fabrication",
    "Laser Cutting", "Waterjet Cutting", "Investment Casting", "Sand Casting"
  ];

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setProjectName(project.project_name);
      setDescription(project.description || "");
      setMaterial(project.material);
      setManufacturingType(project.manufacturing_type);
      setExpectedDeliveryDate(project.expected_delivery_date || "");
      setSelectedFile(null);
    }
  }, [isOpen, project]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !projectName || !material || !manufacturingType) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setUpdating(true);

    try {
      let fileUrl = project.file_url;

      // Upload new file if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('project-files')
          .getPublicUrl(fileName);

        fileUrl = publicUrl;

        // Trigger CAD preview generation for CAD files
        const isCADFile = selectedFile.name.match(/\.(dwg|dxf)$/i);
        if (isCADFile) {
          console.log('🚀 [EditProject] Triggering CAD preview generation for updated file');
          try {
            await supabase.functions.invoke('convert-cad', {
              body: { 
                projectId: project.id, 
                fileName: publicUrl 
              }
            });
          } catch (previewErr) {
            console.error('❌ [EditProject] Preview generation error:', previewErr);
          }
        }
      }

      // Update project in database
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          project_name: projectName,
          description: description || null,
          material,
          manufacturing_type: manufacturingType,
          file_url: fileUrl,
          expected_delivery_date: expectedDeliveryDate || null
        })
        .eq('id', project.id);

      if (updateError) throw updateError;

      toast({
        title: "Project updated successfully!",
        description: "Your project changes have been saved."
      });

      setIsOpen(false);
      onProjectUpdated();

    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="luxury-button">
          <Edit className="w-4 h-4 mr-2" />
          Edit Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project requirements..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
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
              <Select value={material} onValueChange={setMaterial} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  {materials.map((mat) => (
                    <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Label>Update CAD File (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {selectedFile ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <FileIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
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
                  <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Choose a new file to replace the current one
                  </p>
                  <input
                    type="file"
                    accept=".dwg,.dxf,.step,.stp,.iges,.igs,.stl,.obj,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload-edit"
                  />
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => document.getElementById('file-upload-edit')?.click()}
                  >
                    Choose New File
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="luxury-button luxury-button-primary flex-1" 
              disabled={updating}
            >
              {updating ? "Updating..." : "Update Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectModal;