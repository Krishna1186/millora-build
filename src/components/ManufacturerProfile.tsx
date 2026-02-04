
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, Mail, Globe, Building, Award, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ManufacturerProfileProps {
  manufacturerId: string;
  onClose?: () => void;
}

const ManufacturerProfile = ({ manufacturerId, onClose }: ManufacturerProfileProps) => {
  const [manufacturer, setManufacturer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchManufacturerProfile();
  }, [manufacturerId]);

  const fetchManufacturerProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', manufacturerId)
        .eq('role', 'manufacturer')
        .single();

      if (fetchError) {
        setError('Failed to load manufacturer profile');
        console.error('Error fetching manufacturer profile:', fetchError);
        return;
      }

      setManufacturer(data);
    } catch (error) {
      console.error('Error in fetchManufacturerProfile:', error);
      setError('Failed to load manufacturer profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !manufacturer) {
    return (
      <div className="text-center py-12">
        <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
        <p className="text-gray-600">{error || 'Manufacturer profile could not be loaded'}</p>
        {onClose && (
          <Button onClick={onClose} variant="outline" className="mt-4">
            Close
          </Button>
        )}
      </div>
    );
  }

  const getDisplayName = () => {
    return manufacturer.company_name || manufacturer.full_name || 'Unknown Manufacturer';
  };

  const getLocation = () => {
    if (manufacturer.city && manufacturer.state) {
      return `${manufacturer.city}, ${manufacturer.state}`;
    }
    return manufacturer.city || manufacturer.state || 'India';
  };

  const getRating = () => {
    return manufacturer.rating || 0;
  };

  const getManufacturingTypes = () => {
    if (!manufacturer.type_of_manufacturing) return [];
    return manufacturer.type_of_manufacturing.split(',').map((type: string) => type.trim());
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="luxury-card">
        <CardHeader>
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
              {manufacturer.company_logo ? (
                <img 
                  src={manufacturer.company_logo}
                  alt={getDisplayName()}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Building className="w-10 h-10 text-gray-400" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-light text-gray-900 mb-2">
                    {getDisplayName()}
                  </h1>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{getLocation()}</span>
                    </div>
                    
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < Math.floor(getRating()) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                      <span className="text-sm font-medium ml-1">
                        {getRating().toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        ({manufacturer.total_reviews || 0} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={manufacturer.verification_status === 'Verified' ? 'default' : 'secondary'}
                      className={manufacturer.verification_status === 'Verified' 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : ''
                      }
                    >
                      {manufacturer.verification_status || 'Not Verified'}
                    </Badge>
                    
                    {manufacturer.years_of_experience && (
                      <Badge variant="outline">
                        {manufacturer.years_of_experience} years experience
                      </Badge>
                    )}
                  </div>
                </div>

                {onClose && (
                  <Button onClick={onClose} variant="outline" size="sm">
                    Close
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contact Information */}
      <Card className="luxury-card">
        <CardHeader>
          <CardTitle className="text-lg font-light">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {manufacturer.email && (
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{manufacturer.email}</span>
            </div>
          )}
          
          {manufacturer.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{manufacturer.phone}</span>
            </div>
          )}
          
          {manufacturer.website_link && (
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-gray-500" />
              <a 
                href={manufacturer.website_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {manufacturer.website_link}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* About */}
      {manufacturer.company_description && (
        <Card className="luxury-card">
          <CardHeader>
            <CardTitle className="text-lg font-light">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 leading-relaxed">
              {manufacturer.company_description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Manufacturing Capabilities */}
      {getManufacturingTypes().length > 0 && (
        <Card className="luxury-card">
          <CardHeader>
            <CardTitle className="text-lg font-light">Manufacturing Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getManufacturingTypes().map((type, index) => (
                <Badge key={index} variant="secondary">
                  {type}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      {manufacturer.certificates && manufacturer.certificates.length > 0 && (
        <Card className="luxury-card">
          <CardHeader>
            <CardTitle className="text-lg font-light flex items-center gap-2">
              <Award className="w-5 h-5" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {manufacturer.certificates.map((cert: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">{cert}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Projects */}
      {manufacturer.sample_projects && manufacturer.sample_projects.length > 0 && (
        <Card className="luxury-card">
          <CardHeader>
            <CardTitle className="text-lg font-light flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Sample Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {manufacturer.sample_projects.map((project: string, index: number) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <img 
                    src={project}
                    alt={`Sample project ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <ImageIcon className="w-8 h-8 text-gray-400 hidden" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManufacturerProfile;
