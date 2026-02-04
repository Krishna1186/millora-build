import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, DollarSign, MessageCircle, Star, Building, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ChatModal from "./ChatModal";
interface Bid {
  bid_id: string;
  price: number;
  estimated_delivery_time: number;
  expected_delivery_date: string | null;
  notes: string | null;
  submitted_at: string;
  manufacturer: {
    id: string;
    company_name: string;
    full_name: string;
    rating: number | null;
    type_of_manufacturing: string | null;
    city: string | null;
    state: string | null;
  } | null;
}
interface ProjectBidsModalProps {
  projectId: string;
  projectName: string;
  bidCount?: number;
}
interface SelectedBid {
  bidId: string;
  manufacturerId: string;
  manufacturerName: string;
}
const ProjectBidsModal = ({
  projectId,
  projectName,
  bidCount = 0
}: ProjectBidsModalProps) => {
  const [open, setOpen] = useState(false);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBidForChat, setSelectedBidForChat] = useState<SelectedBid | null>(null);
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const fetchBids = async () => {
    if (!user || !projectId) {
      console.log('Missing user or projectId:', {
        user: !!user,
        projectId
      });
      return;
    }
    setLoading(true);
    try {
      console.log('Fetching bids for project:', projectId);
      const {
        data,
        error
      } = await supabase.from('bids').select(`
          bid_id,
          price,
          estimated_delivery_time,
          expected_delivery_date,
          notes,
          submitted_at,
          manufacturer:profiles!manufacturer_id (
            id,
            company_name,
            full_name,
            rating,
            type_of_manufacturing,
            city,
            state
          )
        `).eq('project_id', projectId).order('submitted_at', {
        ascending: false
      });
      console.log('Bids query result:', {
        data,
        error
      });
      if (error) throw error;

      // Filter out bids where manufacturer data is null or invalid
      const validBids = (data || []).filter(bid => {
        const hasValidManufacturer = bid.manufacturer !== null;
        console.log('Bid validation:', {
          bid_id: bid.bid_id,
          hasValidManufacturer
        });
        return hasValidManufacturer;
      });
      console.log('Valid bids found:', validBids.length);
      setBids(validBids);
    } catch (error: any) {
      console.error('Error fetching bids:', error);
      toast({
        title: "Error loading bids",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleAcceptBid = (bidId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to accept bids",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    // Navigate to order confirmation page with bid details
    navigate(`/order-confirmation?projectId=${projectId}&bidId=${bidId}`);
  };
  const handleChatClick = (bid: Bid) => {
    if (!bid.manufacturer) return;
    setSelectedBidForChat({
      bidId: bid.bid_id,
      manufacturerId: bid.manufacturer.id,
      manufacturerName: bid.manufacturer.company_name || bid.manufacturer.full_name || 'Unknown Manufacturer'
    });
  };
  useEffect(() => {
    if (open && projectId) {
      fetchBids();
    }
  }, [open, projectId]);
  return <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="luxury-button">
            <Eye className="w-4 h-4 mr-2" />
            View Bids
            {bidCount > 0 && <Badge variant="secondary" className="ml-2 bg-blue-100 text-slate-800 ">
                {bidCount}
              </Badge>}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-light">Bids for {projectName}</DialogTitle>
          </DialogHeader>
          
          {loading ? <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div> : bids.length === 0 ? <div className="text-center py-12 text-gray-500">
              <DollarSign className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Bids Yet</h3>
              <p className="text-gray-600 font-light">No manufacturers have submitted bids for this project yet.</p>
            </div> : <div className="grid gap-6">
              {bids.map(bid => {
            // Safety check for manufacturer data
            if (!bid.manufacturer) {
              return null;
            }
            return <div key={bid.bid_id} className="luxury-card p-6 border rounded-lg hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-medium mb-2">
                          {bid.manufacturer.company_name || bid.manufacturer.full_name || 'Unknown Manufacturer'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {bid.manufacturer.type_of_manufacturing && <div className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              <span className="font-light">{bid.manufacturer.type_of_manufacturing}</span>
                            </div>}
                          {(bid.manufacturer.city || bid.manufacturer.state) && <div className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              <span className="font-light">
                                {bid.manufacturer.city && bid.manufacturer.state ? `${bid.manufacturer.city}, ${bid.manufacturer.state}` : bid.manufacturer.city || bid.manufacturer.state}
                              </span>
                            </div>}
                          {bid.manufacturer.rating && <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="font-medium">{bid.manufacturer.rating.toFixed(1)}</span>
                              <span className="text-gray-500">/5.0</span>
                            </div>}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          ${bid.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center justify-end">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span className="font-light">{bid.estimated_delivery_time} days</span>
                        </div>
                        {bid.expected_delivery_date && <div className="text-xs text-gray-500 mt-1 font-light">
                            Expected: {new Date(bid.expected_delivery_date).toLocaleDateString()}
                          </div>}
                      </div>
                    </div>
                    
                    {bid.notes && <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Notes from Manufacturer:</h4>
                        <p className="text-sm text-gray-600 font-light leading-relaxed">{bid.notes}</p>
                      </div>}
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500 font-light">
                        Submitted on {new Date(bid.submitted_at).toLocaleDateString()}
                      </span>
                      
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" onClick={() => handleChatClick(bid)} className="luxury-button">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                        
                        <Button className="luxury-button luxury-button-primary" size="sm" onClick={() => handleAcceptBid(bid.bid_id)}>
                          Accept Bid
                        </Button>
                      </div>
                    </div>
                  </div>;
          })}
            </div>}
          
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => setOpen(false)} className="luxury-button">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedBidForChat && <ChatModal projectId={projectId} bidId={selectedBidForChat.bidId} projectName={projectName} manufacturerId={selectedBidForChat.manufacturerId} manufacturerName={selectedBidForChat.manufacturerName} isOpen={!!selectedBidForChat} onClose={() => setSelectedBidForChat(null)} />}
    </>;
};
export default ProjectBidsModal;