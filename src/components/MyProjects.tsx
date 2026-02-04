
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, Package, Wrench, FileText, MessageCircle, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProjectBidsModal from "./ProjectBidsModal";
import CADPreview from "./CADPreview";
import EditProjectModal from "./EditProjectModal";

interface Project {
  id: string;
  project_name: string;
  description: string | null;
  material: string;
  manufacturing_type: string;
  file_url: string;
  preview_url?: string;
  status: string;
  created_at: string;
  bid_count: number;
  latest_bid_date: string | null;
  expected_delivery_date: string | null;
}

const MyProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      console.log('Fetching projects for user:', user.id);

      // Get projects with bid counts
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      if (!projectsData || projectsData.length === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }

      // Get bid counts for each project
      const projectIds = projectsData.map(p => p.id);
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select('project_id, submitted_at')
        .in('project_id', projectIds);

      if (bidsError) throw bidsError;

      // Calculate bid counts and latest bid dates
      const bidCounts = (bidsData || []).reduce((acc, bid) => {
        if (!acc[bid.project_id]) {
          acc[bid.project_id] = { count: 0, latestDate: null };
        }
        acc[bid.project_id].count += 1;
        if (!acc[bid.project_id].latestDate || new Date(bid.submitted_at) > new Date(acc[bid.project_id].latestDate)) {
          acc[bid.project_id].latestDate = bid.submitted_at;
        }
        return acc;
      }, {} as Record<string, { count: number; latestDate: string | null }>);

      const enrichedProjects = projectsData.map(project => ({
        ...project,
        bid_count: bidCounts[project.id]?.count || 0,
        latest_bid_date: bidCounts[project.id]?.latestDate || null
      }));

      console.log('Enriched projects:', enrichedProjects);
      setProjects(enrichedProjects);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error loading projects",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <TrendingUp className="w-4 h-4 bg-slate-800" />;
      case 'in_progress':
        return <Package className="w-4 h-4" />;
      case 'completed':
        return <Package className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
        <p className="text-gray-600 font-light">Upload your first project to get started with manufacturers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-light text-gray-900">My Projects</h2>
        <Badge variant="outline" className="text-sm font-light">
          {projects.length} Project{projects.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-6">
        {projects.map(project => (
          <Card key={project.id} className="luxury-card hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg font-medium mb-2">
                    {project.project_name}
                  </CardTitle>
                  {project.description && (
                    <p className="text-sm text-gray-600 font-light mb-3 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>
                
                {/* CAD Preview - Larger and more prominent */}
                <div className="flex-shrink-0">
                  <CADPreview 
                    projectId={project.id}
                    fileUrl={project.file_url}
                    previewUrl={project.preview_url}
                    className="w-32 h-32 shadow-lg rounded-lg border"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  {project.bid_count > 0 && (
                    <Badge variant="secondary" className="bg-slate-800 text-white font-medium">
                      {project.bid_count} Bid{project.bid_count !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Package className="w-4 h-4 text-slate-600" />
                  <div>
                    <span className="text-xs text-gray-500 font-light block">Material</span>
                    <span className="text-sm font-medium text-gray-900">{project.material}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Wrench className="w-4 h-4 text-slate-600" />
                  <div>
                    <span className="text-xs text-gray-500 font-light block">Method</span>
                    <span className="text-sm font-medium text-gray-900">{project.manufacturing_type}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <div>
                    <span className="text-xs text-gray-500 font-light block">Posted</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {project.latest_bid_date && (
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm font-medium text-green-700">
                      Latest bid received on {new Date(project.latest_bid_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(project.file_url, '_blank')} 
                  className="luxury-button"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  VIEW CAD FILE
                </Button>
                
                <EditProjectModal 
                  project={project}
                  onProjectUpdated={fetchProjects}
                />
                
                <ProjectBidsModal 
                  projectId={project.id} 
                  projectName={project.project_name} 
                  bidCount={project.bid_count} 
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyProjects;
