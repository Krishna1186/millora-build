import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Package, DollarSign, Clock, TrendingUp, Users, MessageCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import ProjectUploadForm from "@/components/ProjectUploadForm";
import MyProjects from "@/components/MyProjects";
import BrowseManufacturers from "@/components/BrowseManufacturers";
import MessageNotificationBadge from "@/components/MessageNotificationBadge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
const CustomerDashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalSpent: 0,
    unreadMessages: 0
  });
  const [refreshProjects, setRefreshProjects] = useState(0);
  const {
    user
  } = useAuth();
  useEffect(() => {
    fetchStats();
  }, [user, refreshProjects]);
  const fetchStats = async () => {
    if (!user) return;
    try {
      // Fetch project stats
      const {
        data: projects
      } = await supabase.from('projects').select('status').eq('user_id', user.id);
      const totalProjects = projects?.length || 0;
      const activeProjects = projects?.filter(p => p.status === 'open' || p.status === 'in_progress').length || 0;
      const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;

      // Get unread messages count
      const {
        data: unreadCount
      } = await supabase.rpc('get_unread_message_count', {
        user_id: user.id
      });

      // TODO: Calculate total spent from completed project bids
      const totalSpent = 0;
      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        totalSpent,
        unreadMessages: unreadCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  const handleProjectUpload = () => {
    setRefreshProjects(prev => prev + 1);
  };
  return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-light text-gray-900 mb-2">
                  Customer Dashboard
                </h1>
                <p className="text-gray-600 font-light">
                  Manage your manufacturing projects and connect with manufacturers
                </p>
              </div>
              <div className="flex items-center gap-4">
                <MessageNotificationBadge />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="luxury-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-light text-gray-700">Total Projects</CardTitle>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800">
                  <Package className="h-4 w-4 text-white " />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.totalProjects}</div>
                <p className="text-xs text-gray-500 font-light">All time</p>
              </CardContent>
            </Card>

            <Card className="luxury-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-light text-gray-700">Active Projects</CardTitle>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800">
                  <Clock className="h-4 w-4 text-white " />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.activeProjects}</div>
                <p className="text-xs text-gray-500 font-light">In progress</p>
              </CardContent>
            </Card>

            <Card className="luxury-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-light text-gray-700">Completed</CardTitle>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800">
                  <TrendingUp className="h-4 w-4 text-white " />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.completedProjects}</div>
                <p className="text-xs text-gray-500 font-light">Finished</p>
              </CardContent>
            </Card>

            <Card className="luxury-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-light text-gray-700">Messages</CardTitle>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800">
                  <MessageCircle className="h-4 w-4 text-white " />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</div>
                <p className="text-xs text-gray-500 font-light">Unread</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="projects" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[500px] bg-white shadow-sm">
              <TabsTrigger value="projects" className="font-light">My Projects</TabsTrigger>
              <TabsTrigger value="upload" className="font-light">Upload Project</TabsTrigger>
              <TabsTrigger value="manufacturers" className="font-light">Browse Manufacturers</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-6">
              <MyProjects key={refreshProjects} />
            </TabsContent>

            <TabsContent value="upload" className="space-y-6">
              <Card className="luxury-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-light">
                    <Upload className="h-5 w-5" />
                    Upload New Project
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectUploadForm onSuccess={handleProjectUpload} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manufacturers" className="space-y-6">
              <BrowseManufacturers />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>;
};
export default CustomerDashboard;