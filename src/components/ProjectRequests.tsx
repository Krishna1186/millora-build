import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, Package, Wrench, FileText, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BidSubmissionModal from "./BidSubmissionModal";
import CADPreview from "./CADPreview";
interface ProjectRequest {
  id: string;
  project_name: string;
  description: string | null;
  material: string;
  manufacturing_type: string;
  file_url: string;
  preview_url?: string;
  status: string;
  created_at: string;
  user_id: string;
  hasExistingBid?: boolean;
}
const ProjectRequests = () => {
  const [projects, setProjects] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    user,
    userProfile
  } = useAuth();
  const {
    toast
  } = useToast();
  useEffect(() => {
    fetchProjectRequests();
  }, [user, userProfile]);
  const fetchProjectRequests = async () => {
    if (!user || !userProfile || userProfile.role !== 'manufacturer') return;
    try {
      const {
        data,
        error
      } = await supabase.from('projects').select('id, project_name, description, material, manufacturing_type, file_url, preview_url, status, created_at, user_id').eq('status', 'open').neq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;

      // Filter projects based on manufacturer's expertise
      let filteredProjects = data || [];
      if (userProfile.type_of_manufacturing) {
        const manufacturerTypes = userProfile.type_of_manufacturing.split(',').map((t: string) => t.trim());
        filteredProjects = filteredProjects.filter(project => manufacturerTypes.includes(project.manufacturing_type));
      }

      // Check for existing bids
      if (filteredProjects.length > 0) {
        const {
          data: existingBids
        } = await supabase.from('bids').select('project_id').eq('manufacturer_id', user.id).in('project_id', filteredProjects.map(p => p.id));
        const bidProjectIds = new Set(existingBids?.map(bid => bid.project_id) || []);
        filteredProjects = filteredProjects.map(project => ({
          ...project,
          hasExistingBid: bidProjectIds.has(project.id)
        }));
      }
      setProjects(filteredProjects);
    } catch (error: any) {
      console.error('Error fetching project requests:', error);
      toast({
        title: "Error loading projects",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleBidSubmitted = () => {
    fetchProjectRequests(); // Refresh the list to update bid status
  };
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just posted';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return created.toLocaleDateString();
  };
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>;
  }
  if (projects.length === 0) {
    return <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Projects</h3>
        <p className="text-gray-600 font-light">
          {userProfile?.type_of_manufacturing ? "No projects matching your manufacturing expertise are currently available." : "Complete your profile with manufacturing capabilities to see relevant projects."}
        </p>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-light text-gray-900">Available Projects</h2>
        <Badge variant="outline" className="text-sm font-light">
          {projects.length} Project{projects.length !== 1 ? 's' : ''} Available
        </Badge>
      </div>

      <div className="grid gap-6">
        {projects.map(project => <Card key={project.id} className="luxury-card hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <CardTitle className="text-lg font-medium truncate">
                      {project.project_name}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="text-white border-green-200 font-light bg-slate-800 shrink-0">
                        <Package className="w-3 h-3 mr-1" />
                        OPEN FOR BIDS
                      </Badge>
                      {project.hasExistingBid && <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-light shrink-0">
                          BID SUBMITTED
                        </Badge>}
                    </div>
                  </div>
                  {project.description && <p className="text-sm text-gray-600 font-light mt-2 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>}
                  
                  {/* Time info on mobile */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2 md:hidden">
                    <Clock className="w-4 h-4" />
                    <span className="font-light">{getTimeAgo(project.created_at)}</span>
                  </div>
                </div>
                
                {/* CAD Preview for Manufacturer Dashboard */}
                <div className="flex-shrink-0 self-center md:self-start">
                  <CADPreview 
                    projectId={project.id}
                    fileUrl={project.file_url}
                    previewUrl={project.preview_url}
                    className="w-24 h-24 sm:w-32 sm:h-32 shadow-lg rounded-lg border"
                  />
                </div>
                
                {/* Time info on desktop */}
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span className="font-light">{getTimeAgo(project.created_at)}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Package className="w-4 h-4 text-slate-600 " />
                  <div>
                    <span className="text-xs text-gray-500 font-light block">Material</span>
                    <span className="text-sm font-medium text-gray-900">{project.material}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Wrench className="w-4 h-4 text-slate-600 " />
                  <div>
                    <span className="text-xs text-gray-500 font-light block">Method</span>
                    <span className="text-sm font-medium text-gray-900">{project.manufacturing_type}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-slate-600 " />
                  <div>
                    <span className="text-xs text-gray-500 font-light block">Posted</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="sm" onClick={() => window.open(project.file_url, '_blank')} className="luxury-button flex-1 sm:flex-none">
                  <FileText className="w-4 h-4 mr-2" />
                  VIEW CAD FILE
                </Button>
                
                <div className="flex-1 sm:flex-none">
                  <BidSubmissionModal projectId={project.id} projectName={project.project_name} onBidSubmitted={handleBidSubmitted} hasExistingBid={project.hasExistingBid} />
                </div>
              </div>
            </CardContent>
          </Card>)}
      </div>
    </div>;
};
export default ProjectRequests;