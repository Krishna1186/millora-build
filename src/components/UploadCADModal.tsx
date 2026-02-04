
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import ProjectUploadForm from "./ProjectUploadForm";

const UploadCADModal = () => {
  const [open, setOpen] = useState(false);
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleUploadClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (userProfile?.role === 'customer') {
      setOpen(true);
    } else if (userProfile?.role === 'manufacturer') {
      // Manufacturers shouldn't upload projects, redirect to their dashboard
      navigate('/manufacturer-dashboard');
    } else {
      // No role set, redirect to role selector
      navigate('/role-selector');
    }
  };

  const handleUploadSuccess = () => {
    setOpen(false);
  };

  const triggerButton = (
    <Button 
      className="floating-upload"
      onClick={handleUploadClick}
    >
      <Upload className="w-4 h-4 mr-2" />
      UPLOAD PROJECT
    </Button>
  );

  // If user is not a customer, just show the trigger button (which will redirect)
  if (!user || userProfile?.role !== 'customer') {
    return triggerButton;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light">Upload New Project</DialogTitle>
        </DialogHeader>
        
        <ProjectUploadForm onSuccess={handleUploadSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default UploadCADModal;
