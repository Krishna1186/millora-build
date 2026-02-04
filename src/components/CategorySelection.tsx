
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Star, Building, MapPin } from "lucide-react";

// Import background images
import printingBg from "@/assets/3d-printing-bg.jpg";
import cncBg from "@/assets/cnc-machining-bg.jpg";
import laserBg from "@/assets/laser-cutting-bg.jpg";
import sheetMetalBg from "@/assets/sheet-metal-bg.jpg";
import injectionBg from "@/assets/injection-molding-bg.jpg";
import castingBg from "@/assets/casting-bg.jpg";

const CategorySelection = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { 
      id: "3d-printing", 
      name: "3D Printing",
      backgroundImage: printingBg
    },
    { 
      id: "cnc", 
      name: "CNC Machining",
      backgroundImage: cncBg
    },
    { 
      id: "injection", 
      name: "Injection Molding",
      backgroundImage: injectionBg
    },
    { 
      id: "sheet-metal", 
      name: "Sheet Metal",
      backgroundImage: sheetMetalBg
    },
    { 
      id: "laser-cutting", 
      name: "Laser Cutting",
      backgroundImage: laserBg
    },
    { 
      id: "casting", 
      name: "Casting",
      backgroundImage: castingBg
    }
  ];

  useEffect(() => {
    if (selectedCategory) {
      fetchVerifiedManufacturers();
    }
  }, [selectedCategory]);

  const fetchVerifiedManufacturers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'manufacturer')
        .eq('verification_status', 'Verified')
        .limit(6);

      if (error) {
        console.error('Error fetching manufacturers:', error);
        setManufacturers([]);
        return;
      }
      
      // Filter manufacturers that have valid data
      const validManufacturers = (data || []).filter(manufacturer => 
        manufacturer.company_name || manufacturer.full_name
      );
      
      setManufacturers(validManufacturers);
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
      setManufacturers([]);
    } finally {
      setLoading(false);
    }
  };

  const getManufacturerDisplayName = (manufacturer: any) => {
    return manufacturer?.company_name || manufacturer?.full_name || 'Unknown Manufacturer';
  };

  const getManufacturerLocation = (manufacturer: any) => {
    if (manufacturer?.city && manufacturer?.state) {
      return `${manufacturer.city}, ${manufacturer.state}`;
    }
    return manufacturer?.city || manufacturer?.state || 'India';
  };

  const getManufacturerRating = (manufacturer: any) => {
    return manufacturer?.rating || 4.5;
  };

  const getManufacturerReviews = (manufacturer: any) => {
    return manufacturer?.total_reviews || 0;
  };

  return (
    <section className="py-20 bg-gray-50 section-divider">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gray-900 mb-4">
            Select Manufacturing Type
          </h2>
          <div className="w-24 h-px bg-gray-300 mx-auto"></div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className={`group cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:shadow-lg ${
                selectedCategory === category.id 
                  ? 'border-primary shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={category.backgroundImage} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white p-2">
                  <h3 className="text-sm font-semibold text-center">{category.name}</h3>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Manufacturers Display */}
        {selectedCategory && (
          <div className="animate-fade-in">
            <h3 className="text-2xl font-light mb-8 text-center">
              Top Verified Manufacturers for {categories.find(c => c.id === selectedCategory)?.name}
            </h3>
            
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : manufacturers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {manufacturers.map((manufacturer) => (
                  <Card key={manufacturer.id} className="luxury-card group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-sm bg-gray-200 flex items-center justify-center overflow-hidden">
                          {manufacturer.company_logo ? (
                            <img 
                              src={manufacturer.company_logo}
                              alt={getManufacturerDisplayName(manufacturer)}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <Building className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-lg mb-1">
                            {getManufacturerDisplayName(manufacturer)}
                          </h4>
                          <div className="flex items-center text-gray-600 mb-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            <p className="text-sm">{getManufacturerLocation(manufacturer)}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs font-medium text-green-600 border-green-600">
                              Verified
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${
                                i < Math.floor(getManufacturerRating(manufacturer)) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                          <span className="text-sm font-medium ml-1">
                            {getManufacturerRating(manufacturer).toFixed(1)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          ({getManufacturerReviews(manufacturer)} reviews)
                        </span>
                      </div>

                      {manufacturer.type_of_manufacturing && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {manufacturer.type_of_manufacturing.split(',').slice(0, 2).map((type: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {type.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Response: 2-4 hours
                        </span>
                        <span className="text-sm text-primary font-medium cursor-pointer hover:underline">
                          View Profile
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Verified Manufacturers</h3>
                <p className="text-gray-600">No verified manufacturers found for this category yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySelection;
