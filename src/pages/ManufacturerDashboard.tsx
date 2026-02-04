import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, Clock, TrendingUp, Briefcase, Star, MessageCircle, User, Edit } from "lucide-react";
import Navigation from "@/components/Navigation";
import ProjectRequests from "@/components/ProjectRequests";
import MessageNotificationBadge from "@/components/MessageNotificationBadge";
import ChatDrawer from "@/components/ChatDrawer";
import ChatTrigger from "@/components/ChatTrigger";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import CADPreview from "@/components/CADPreview";

const ManufacturerDashboard = () => {
  const [stats, setStats] = useState({
    totalBids: 0,
    activeBids: 0,
    wonProjects: 0,
    totalEarnings: 0,
    rating: 0,
    unreadMessages: 0
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      // Fetch bid stats
      const { data: bids } = await supabase
        .from('project_bids')
        .select('status, bid_amount')
        .eq('manufacturer_id', user.id);

      const totalBids = bids?.length || 0;
      const activeBids = bids?.filter(b => b.status === 'pending').length || 0;
      const wonProjects = bids?.filter(b => b.status === 'accepted').length || 0;
      const totalEarnings = bids?.filter(b => b.status === 'completed')
        .reduce((sum, bid) => sum + (bid.bid_amount || 0), 0) || 0;

      // Get unread messages count
      const { data: unreadCount } = await supabase
        .rpc('get_unread_message_count', { user_id: user.id });

      // Get rating from profile
      const rating = userProfile?.rating || 0;

      setStats({
        totalBids,
        activeBids,
        wonProjects,
        totalEarnings,
        rating,
        unreadMessages: unreadCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-light text-gray-900 mb-2">
                  Manufacturer Dashboard
                </h1>
                <p className="text-gray-600 font-light">
                  Manage your bids and track your manufacturing business
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => navigate('/manufacturer-profile')} 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  View & Edit Profile
                </Button>
                <ChatTrigger onClick={() => setIsChatOpen(true)} />
                <MessageNotificationBadge />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            <Card className="luxury-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-light text-gray-700">Total Bids</CardTitle>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800">
                  <Briefcase className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.totalBids}</div>
                <p className="text-xs text-gray-500 font-light">All time</p>
              </CardContent>
            </Card>

            <Card className="luxury-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-light text-gray-700">Active Bids</CardTitle>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800">
                  <Clock className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.activeBids}</div>
                <p className="text-xs text-gray-500 font-light">Pending</p>
              </CardContent>
            </Card>

            <Card className="luxury-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-light text-gray-700">Won Projects</CardTitle>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.wonProjects}</div>
                <p className="text-xs text-gray-500 font-light">Accepted</p>
              </CardContent>
            </Card>

            <Card className="luxury-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-light text-gray-700">Total Earnings</CardTitle>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">${stats.totalEarnings.toLocaleString()}</div>
                <p className="text-xs text-gray-500 font-light">Completed</p>
              </CardContent>
            </Card>

            <Card className="luxury-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-light text-gray-700">Rating</CardTitle>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800">
                  <Star className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.rating.toFixed(1)}</div>
                <p className="text-xs text-gray-500 font-light">Out of 5.0</p>
              </CardContent>
            </Card>

            <Card 
              className="luxury-card hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setIsChatOpen(true)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-light text-gray-700">Messages</CardTitle>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800">
                  <MessageCircle className="h-4 w-4 text-white" />
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
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px] bg-white shadow-sm">
              <TabsTrigger value="projects" className="font-light">Available Projects</TabsTrigger>
              <TabsTrigger value="bids" className="font-light">My Bids</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-6">
              <ProjectRequests />
            </TabsContent>

            <TabsContent value="bids" className="space-y-6">
              <Card className="luxury-card">
                <CardHeader>
                  <CardTitle className="font-light">My Bids</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Bid Management</h3>
                    <p className="text-gray-600 font-light">Advanced bid tracking and management features coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Chat Drawer */}
      <ChatDrawer 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </div>
  );
};

export default ManufacturerDashboard;
