
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Package } from "lucide-react";

const PastProjects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedProjects();
  }, []);

  const fetchCompletedProjects = async () => {
    try {
      // First try to fetch real completed projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:customer_id(company_name, full_name)
        `)
        .eq('status', 'completed')
        .limit(6);

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
      }

      // If we have real data, use it; otherwise use sample data
      if (projectsData && projectsData.length > 0) {
        setProjects(projectsData);
      } else {
        // Fallback to sample data for demo purposes
        setProjects([
          {
            id: 1,
            project_name: "Precision Medical Device Housing",
            file_url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center",
            profiles: { company_name: "Precision Tech Manufacturing" },
            manufacturing_type: "CNC Machining",
            material: "Medical Grade Aluminum",
            created_at: "2024-01-15T00:00:00Z"
          },
          {
            id: 2,
            project_name: "Electronic Prototype Enclosure",
            file_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop&crop=center",
            profiles: { company_name: "Advanced Prototypes Ltd" },
            manufacturing_type: "3D Printing",
            material: "ABS Plastic",
            created_at: "2024-01-10T00:00:00Z"
          },
          {
            id: 3,
            project_name: "Automotive Sensor Mount",
            file_url: "https://images.unsplash.com/photo-1565484815032-19e6b13eaa8c?w=400&h=300&fit=crop&crop=center",
            profiles: { company_name: "Industrial Solutions Pro" },
            manufacturing_type: "Injection Molding",
            material: "Nylon 66",
            created_at: "2024-01-05T00:00:00Z"
          }
        ]);
      }
    } catch (error) {
      console.error('Error in fetchCompletedProjects:', error);
      // Set empty array on error to prevent crashes
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getProjectThumbnail = (project: any) => {
    return project?.file_url || "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center";
  };

  const getManufacturerName = (project: any) => {
    if (project?.profiles?.company_name) {
      return project.profiles.company_name;
    }
    if (project?.profiles?.full_name) {
      return project.profiles.full_name;
    }
    return project?.customer_company || "Manufacturing Partner";
  };

  const getProjectName = (project: any) => {
    return project?.project_name || "Unnamed Project";
  };

  const getManufacturingType = (project: any) => {
    return project?.manufacturing_type || "Custom Manufacturing";
  };

  const getMaterial = (project: any) => {
    return project?.material || "Various Materials";
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Recently";
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gray-900 mb-4">
            Successful Projects
          </h2>
          <div className="w-24 h-px bg-gray-300 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-light">
            Real results from our manufacturing network
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : projects.length > 0 ? (
          <Carousel className="w-full max-w-6xl mx-auto">
            <CarouselContent>
              {projects.map((project) => (
                <CarouselItem key={project.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="luxury-card overflow-hidden group">
                    <div className="aspect-video overflow-hidden relative">
                      <img 
                        src={getProjectThumbnail(project)} 
                        alt={getProjectName(project)}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-2 line-clamp-2">
                        {getProjectName(project)}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm font-medium">4.8</span>
                        <span className="text-sm text-gray-500">• {getManufacturerName(project)}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className="text-xs">
                          {getManufacturingType(project)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getMaterial(project)}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600">
                        Completed: {formatDate(project.created_at)}
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Projects Yet</h3>
            <p className="text-gray-600">Completed projects will appear here once available.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PastProjects;
