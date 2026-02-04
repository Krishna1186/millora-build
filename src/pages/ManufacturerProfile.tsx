
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, User, Save, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";

interface FormData {
  company_name: string;
  full_name: string;
  email: string;
  phone: string;
  company_description: string;
  manufacturing_types: string[];
  state: string;
  city: string;
  website_link: string;
}

const ManufacturerProfile = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>();
  const [selectedManufacturingTypes, setSelectedManufacturingTypes] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const manufacturingTypes = [
    "CNC Machining",
    "3D Printing", 
    "Injection Molding",
    "Die Casting",
    "Sheet Metal Fabrication",
    "PCB Manufacturing",
    "Plastic Molding",
    "Metal Stamping",
    "Laser Cutting",
    "Welding",
    "Assembly Services",
    "Prototyping"
  ];

  const indianStatesAndCities = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Kolhapur"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davangere"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh"],
    "Delhi": ["New Delhi", "Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Allahabad"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Malda"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Alwar"],
    "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak"],
    "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"]
  };

  useEffect(() => {
    if (user && userProfile) {
      loadProfileData();
    }
  }, [user, userProfile]);

  const loadProfileData = async () => {
    try {
      setProfileLoading(true);
      
      if (!userProfile) return;

      // Pre-fill form with existing data
      setValue('company_name', userProfile.company_name || '');
      setValue('full_name', userProfile.full_name || '');
      setValue('email', userProfile.email || '');
      setValue('phone', userProfile.phone || '');
      setValue('company_description', userProfile.company_description || '');
      setValue('website_link', userProfile.website_link || '');
      
      if (userProfile.state) setSelectedState(userProfile.state);
      if (userProfile.city) setSelectedCity(userProfile.city);
      
      if (userProfile.type_of_manufacturing) {
        const types = userProfile.type_of_manufacturing.split(',').map(t => t.trim());
        setSelectedManufacturingTypes(types);
      }
      
      if (userProfile.company_logo) {
        setLogoPreview(userProfile.company_logo);
      }
      
    } catch (error) {
      console.error('Error loading profile data:', error);
      toast({
        title: "Error loading profile",
        description: "Failed to load your profile data",
        variant: "destructive"
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleManufacturingTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedManufacturingTypes([...selectedManufacturingTypes, type]);
    } else {
      setSelectedManufacturingTypes(selectedManufacturingTypes.filter(t => t !== type));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCompanyLogo(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // TODO: Handle logo upload to Supabase storage if needed
      
      const updateData = {
        company_name: data.company_name,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        company_description: data.company_description,
        type_of_manufacturing: selectedManufacturingTypes.join(', '),
        state: selectedState,
        city: selectedCity,
        website_link: data.website_link,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Profile updated successfully",
        description: "Your manufacturer profile has been updated.",
      });

    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message || "Failed to update your profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-20 flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button 
              onClick={() => navigate('/manufacturer-dashboard')} 
              variant="outline"
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-light text-gray-900 mb-2">
                  My Profile
                </h1>
                <p className="text-gray-600">
                  Manage your manufacturer profile and business information
                </p>
              </div>
              
              {userProfile?.verification_status && (
                <Badge 
                  variant={userProfile.verification_status === 'Verified' ? 'default' : 'secondary'}
                  className={userProfile.verification_status === 'Verified' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : ''
                  }
                >
                  {userProfile.verification_status}
                </Badge>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Company Logo */}
                <div>
                  <Label>Company Logo</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    {logoPreview ? (
                      <div className="space-y-4">
                        <img src={logoPreview} alt="Logo preview" className="mx-auto h-24 w-24 object-cover rounded-lg border" />
                        <p className="text-sm text-gray-600">{companyLogo?.name || 'Current logo'}</p>
                        <div className="flex gap-2 justify-center">
                          <label htmlFor="logo" className="cursor-pointer">
                            <Button type="button" variant="outline" size="sm" asChild>
                              <span>Change Logo</span>
                            </Button>
                            <input
                              id="logo"
                              type="file"
                              accept=".jpg,.jpeg,.png,.gif"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>
                          <Button
                            type="button"
                            onClick={() => {
                              setCompanyLogo(null);
                              setLogoPreview("");
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Remove Logo
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <User className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2">
                          <label htmlFor="logo" className="cursor-pointer">
                            <span className="text-primary hover:text-primary/80 font-medium">Upload company logo</span>
                            <input
                              id="logo"
                              type="file"
                              accept=".jpg,.jpeg,.png,.gif"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">JPG, JPEG, PNG, GIF up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      {...register("company_name", { required: "Company name is required" })}
                      className="mt-1"
                    />
                    {errors.company_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.company_name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      {...register("full_name", { required: "Full name is required" })}
                      className="mt-1"
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email", { 
                        required: "Email is required",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Invalid email address"
                        }
                      })}
                      className="mt-1"
                      disabled
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone" 
                      {...register("phone", { required: "Phone number is required" })}
                      className="mt-1"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>State *</Label>
                    <Select value={selectedState} onValueChange={(value) => {
                      setSelectedState(value);
                      setSelectedCity("");
                    }}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(indianStatesAndCities).map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>City/Town *</Label>
                    <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedState && indianStatesAndCities[selectedState as keyof typeof indianStatesAndCities]?.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Manufacturing Types */}
                <div>
                  <Label>Type of Manufacturing *</Label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {manufacturingTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={selectedManufacturingTypes.includes(type)}
                          onCheckedChange={(checked) => handleManufacturingTypeChange(type, checked as boolean)}
                        />
                        <Label htmlFor={type} className="text-sm">{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Company Description */}
                <div>
                  <Label htmlFor="company_description">Company Description *</Label>
                  <Textarea
                    id="company_description"
                    {...register("company_description", { required: "Description is required" })}
                    placeholder="Describe your company, capabilities, and experience..."
                    className="mt-1 h-32"
                  />
                  {errors.company_description && (
                    <p className="text-red-500 text-sm mt-1">{errors.company_description.message}</p>
                  )}
                </div>

                {/* Website Link */}
                <div>
                  <Label htmlFor="website_link">Website/Portfolio URL</Label>
                  <Input
                    id="website_link"
                    type="url"
                    {...register("website_link")}
                    placeholder="https://yourcompany.com"
                    className="mt-1"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button type="submit" disabled={loading} className="w-full py-3 text-lg">
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerProfile;
