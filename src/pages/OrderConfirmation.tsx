
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Calendar, DollarSign, Building, Eye, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProjectDetails {
  id: string;
  project_name: string;
  description: string | null;
  material: string;
  manufacturing_type: string;
  file_url: string;
}

interface BidDetails {
  bid_id: string;
  price: number;
  estimated_delivery_time: number;
  notes: string | null;
  manufacturer: {
    id: string;
    company_name: string;
    full_name: string;
    type_of_manufacturing: string | null;
    city: string | null;
    state: string | null;
  };
}

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const projectId = searchParams.get('projectId');
  const bidId = searchParams.get('bidId');
  
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [bid, setBid] = useState<BidDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Delivery address form state
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [saveForFuture, setSaveForFuture] = useState(false);

  // Indian states and cities data
  const indianStatesAndCities = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
    "Delhi": ["New Delhi", "Central Delhi", "North Delhi", "South Delhi"],
    "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala"]
  };

  useEffect(() => {
    // Check authentication first
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to view order confirmation",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!projectId || !bidId) {
      navigate('/customer-dashboard');
      return;
    }

    fetchProjectAndBidDetails();
  }, [projectId, bidId, user]);

  const fetchProjectAndBidDetails = async () => {
    try {
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user!.id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch bid details with manufacturer info including id
      const { data: bidData, error: bidError } = await supabase
        .from('bids')
        .select(`
          bid_id,
          price,
          estimated_delivery_time,
          notes,
          manufacturer:profiles!manufacturer_id (
            id,
            company_name,
            full_name,
            type_of_manufacturing,
            city,
            state
          )
        `)
        .eq('bid_id', bidId)
        .eq('project_id', projectId)
        .single();

      if (bidError) throw bidError;
      setBid(bidData);

    } catch (error: any) {
      console.error('Error fetching details:', error);
      toast({
        title: "Error loading order details",
        description: error.message,
        variant: "destructive"
      });
      navigate('/customer-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!project || !bid || !user) return;
    
    if (!streetAddress || !city || !state || !pincode) {
      toast({
        title: "Missing delivery address",
        description: "Please fill in all required address fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      let deliveryAddressId = null;

      // Save delivery address if requested
      if (saveForFuture) {
        const { data: addressData, error: addressError } = await supabase
          .from('delivery_addresses')
          .insert({
            user_id: user.id,
            street_address: streetAddress,
            city,
            state,
            pincode,
            landmark: landmark || null
          })
          .select()
          .single();

        if (addressError) throw addressError;
        deliveryAddressId = addressData.id;
      }

      // Create the order
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          project_id: project.id,
          bid_id: bid.bid_id,
          customer_id: user.id,
          manufacturer_id: bid.manufacturer.id,
          delivery_address_id: deliveryAddressId
        });

      if (orderError) throw orderError;

      toast({
        title: "Order confirmed successfully!",
        description: "The manufacturer has been notified and will begin work on your project."
      });

      navigate('/customer-dashboard');

    } catch (error: any) {
      console.error('Error confirming order:', error);
      toast({
        title: "Failed to confirm order",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveForFutureChange = (checked: boolean | "indeterminate") => {
    setSaveForFuture(Boolean(checked));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64 pt-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!project || !bid) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="text-center py-12 pt-20">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
          <Button onClick={() => navigate('/customer-dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/customer-dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <h1 className="text-3xl font-light text-gray-900 mb-2">
              Order Confirmation
            </h1>
            <p className="text-gray-600 font-light">
              Review your order details and provide delivery information
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <div className="space-y-6">
              <Card className="luxury-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">{project.project_name}</h3>
                    {project.description && (
                      <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Material:</span>
                      <div className="font-medium">{project.material}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Method:</span>
                      <div className="font-medium">{project.manufacturing_type}</div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(project.file_url, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View CAD File
                  </Button>
                </CardContent>
              </Card>

              <Card className="luxury-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Manufacturer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">
                      {bid.manufacturer.company_name || bid.manufacturer.full_name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {bid.manufacturer.type_of_manufacturing}
                    </p>
                    {(bid.manufacturer.city || bid.manufacturer.state) && (
                      <p className="text-gray-600 text-sm">
                        {bid.manufacturer.city}, {bid.manufacturer.state}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            ₹{bid.price.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Total Cost</div>
                        </div>
                      </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {bid.estimated_delivery_time}
                        </div>
                        <div className="text-xs text-gray-600">Days</div>
                      </div>
                    </div>
                  </div>
                  
                  {bid.notes && (
                    <div className="p-3 bg-gray-50 rounded">
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Manufacturer Notes:</h4>
                      <p className="text-sm text-gray-600">{bid.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Delivery Address */}
            <div>
              <Card className="luxury-card">
                <CardHeader>
                  <CardTitle>Delivery Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="streetAddress">Street Address *</Label>
                    <Input
                      id="streetAddress"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="Enter street address"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <select
                        id="state"
                        value={state}
                        onChange={(e) => {
                          setState(e.target.value);
                          setCity(""); // Reset city when state changes
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select State</option>
                        {Object.keys(indianStatesAndCities).map((stateName) => (
                          <option key={stateName} value={stateName}>{stateName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <select
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={!state}
                      >
                        <option value="">Select City</option>
                        {state && indianStatesAndCities[state as keyof typeof indianStatesAndCities]?.map((cityName) => (
                          <option key={cityName} value={cityName}>{cityName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Pincode"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                    <Input
                      id="landmark"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Nearby landmark"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="saveForFuture"
                      checked={saveForFuture}
                      onCheckedChange={handleSaveForFutureChange}
                    />
                    <Label htmlFor="saveForFuture" className="text-sm">
                      Save this address for future orders
                    </Label>
                  </div>
                  
                  <Button
                    onClick={handleConfirmOrder}
                    disabled={submitting}
                    className="w-full luxury-button luxury-button-primary"
                    size="lg"
                  >
                    {submitting ? "Confirming Order..." : "Confirm Order"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
