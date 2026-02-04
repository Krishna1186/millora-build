import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Package, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Manufacturer {
  id: string;
  company_name: string | null;
  full_name: string | null;
  type_of_manufacturing: string | null;
  city: string | null;
  state: string | null;
  rating: number | null;
  company_description: string | null;
}

const BrowseManufacturers = () => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const fetchManufacturers = async () => {
    try {
      console.log('Fetching manufacturers...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, company_name, full_name, type_of_manufacturing, city, state, rating, company_description')
        .eq('role', 'manufacturer')
        .order('rating', { ascending: false, nullsFirst: false });

      console.log('Manufacturers query result:', { data, error, count: data?.length });

      if (error) throw error;
      
      // Filter out manufacturers with insufficient data but be more lenient
      const validManufacturers = (data || []).filter(manufacturer => {
        const hasName = manufacturer.company_name || manufacturer.full_name;
        console.log('Manufacturer validation:', { 
          id: manufacturer.id, 
          hasName, 
          company_name: manufacturer.company_name,
          full_name: manufacturer.full_name 
        });
        return hasName;
      });
      
      console.log('Valid manufacturers found:', validManufacturers.length);
      setManufacturers(validManufacturers);
    } catch (error: any) {
      console.error('Error fetching manufacturers:', error);
      toast({
        title: "Error loading manufacturers",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (manufacturers.length === 0) {
    return (
      <div className="text-center py-12">
        <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Manufacturers Found</h3>
        <p className="text-gray-600">No registered manufacturers are currently available.</p>
        <Button 
          onClick={fetchManufacturers} 
          variant="outline" 
          className="mt-4"
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-light text-gray-900">Browse Manufacturers</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {manufacturers.length} manufacturer{manufacturers.length !== 1 ? 's' : ''} available
          </div>
          <Button 
            onClick={fetchManufacturers} 
            variant="outline" 
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {manufacturers.map((manufacturer) => (
          <Card key={manufacturer.id} className="luxury-card hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-medium mb-2">
                    {manufacturer.company_name || manufacturer.full_name || 'Unknown Manufacturer'}
                  </CardTitle>
                  
                  {manufacturer.type_of_manufacturing && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <Package className="w-4 h-4 mr-2" />
                      <span className="text-sm font-light">{manufacturer.type_of_manufacturing}</span>
                    </div>
                  )}
                  
                  {(manufacturer.city || manufacturer.state) && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm font-light">
                        {manufacturer.city && manufacturer.state 
                          ? `${manufacturer.city}, ${manufacturer.state}`
                          : manufacturer.city || manufacturer.state}
                      </span>
                    </div>
                  )}
                  
                  {manufacturer.rating ? (
                    <div className="flex items-center mb-2">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{manufacturer.rating.toFixed(1)}</span>
                      <span className="text-sm text-gray-600 ml-1">/5.0</span>
                    </div>
                  ) : (
                    <div className="flex items-center mb-2">
                      <Star className="w-4 h-4 text-gray-300 mr-1" />
                      <span className="text-sm text-gray-500">No rating yet</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {manufacturer.company_description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {manufacturer.company_description}
                </p>
              )}
              
              <div className="flex gap-2">
                <Button className="luxury-button luxury-button-primary flex-1" size="sm">
                  VIEW PROFILE
                </Button>
                <Button variant="outline" size="sm">
                  CONTACT
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BrowseManufacturers;
