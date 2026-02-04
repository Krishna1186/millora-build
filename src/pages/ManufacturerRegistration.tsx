
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Image, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";

interface FormData {
  userName: string;
  email: string;
  password: string;
  companyName: string;
  phoneNumber: string;
  manufacturingTypes: string[];
  state: string;
  city: string;
  description: string;
}

const ManufacturerRegistration = () => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>();
  const [selectedManufacturingTypes, setSelectedManufacturingTypes] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [certificates, setCertificates] = useState<File[]>([]);
  const [projectImages, setProjectImages] = useState<File[]>([]);
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  
  const { signUp, user, updateUserRole } = useAuth();
  const navigate = useNavigate();

  // Check for pre-filled data from signup flow
  useEffect(() => {
    const signupData = localStorage.getItem('manufacturerSignupData');
    if (signupData) {
      const data = JSON.parse(signupData);
      setValue('email', data.email);
      setValue('password', data.password);
      setValue('userName', data.fullName);
      
      // Check if this is from Google sign-in (user already exists)
      if (user) {
        setIsExistingUser(true);
      }
    }
  }, [setValue, user]);

  // Redirect if already authenticated as manufacturer
  useEffect(() => {
    if (user && !localStorage.getItem('manufacturerSignupData')) {
      navigate('/manufacturer-dashboard');
    }
  }, [user, navigate]);

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
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tezpur", "Bomdila"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Bihar Sharif"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Korba", "Bilaspur", "Durg", "Rajnandgaon"],
    "Delhi": ["New Delhi", "Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh"],
    "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak"],
    "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Una", "Kullu"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davangere"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Dewas"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Kolhapur"],
    "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur"],
    "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh"],
    "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur", "Puri"],
    "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Alwar"],
    "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar"],
    "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailasahar"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Allahabad"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Malda"]
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
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCertificates([...certificates, ...Array.from(e.target.files)]);
    }
  };

  const handleProjectImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProjectImages([...projectImages, ...Array.from(e.target.files)]);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    try {
      if (isExistingUser && user) {
        // For existing users (Google sign-in), just update their profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            role: 'manufacturer',
            full_name: data.userName,
            company_name: data.companyName,
            phone: data.phoneNumber,
            state: selectedState,
            city: selectedCity,
            company_description: data.description,
            type_of_manufacturing: selectedManufacturingTypes.join(', ')
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
        } else {
          localStorage.removeItem('manufacturerSignupData');
          navigate('/manufacturer-dashboard');
        }
      } else {
        // For new users, sign them up first
        const { error: signupError } = await signUp(data.email, data.password, data.userName, 'manufacturer');
        
        if (!signupError) {
          localStorage.removeItem('manufacturerSignupData');
          navigate('/auth');
        }
      }

      // TODO: Handle file uploads to Supabase storage
      // This would involve uploading companyLogo, certificates, and projectImages
      
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Manufacturer Registration
            </h1>
            <p className="text-lg text-gray-600">
              Join Millora's network of verified manufacturers and connect with customers worldwide
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* User Name */}
                <div>
                  <Label htmlFor="userName">User Name *</Label>
                  <Input
                    id="userName"
                    {...register("userName", { required: "User name is required" })}
                    className="mt-1"
                  />
                  {errors.userName && (
                    <p className="text-red-500 text-sm mt-1">{errors.userName.message}</p>
                  )}
                </div>

                {/* Email */}
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
                    disabled={isExistingUser}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password - only show for new users */}
                {!isExistingUser && (
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      {...register("password", { required: "Password is required" })}
                      className="mt-1"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </div>
                )}

                {/* Company Logo Upload */}
                <div>
                  <Label>Company Logo</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    {logoPreview ? (
                      <div className="space-y-4">
                        <img src={logoPreview} alt="Logo preview" className="mx-auto h-24 w-24 object-cover rounded-lg border" />
                        <p className="text-sm text-gray-600">{companyLogo?.name}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setCompanyLogo(null);
                            setLogoPreview("");
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove Logo
                        </button>
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

                {/* GST/Udyam Number */}
                <div>
                  <Label htmlFor="gstNumber">GST Number / Udyam Registration Number</Label>
                  <Input
                    id="gstNumber"
                    placeholder="Enter GST or Udyam registration number"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for business verification and tax compliance
                  </p>
                </div>

                {/* Company Name */}
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    {...register("companyName", { required: "Company name is required" })}
                    className="mt-1"
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    {...register("phoneNumber", { required: "Phone number is required" })}
                    className="mt-1"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
                  )}
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

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>State *</Label>
                    <Select value={selectedState} onValueChange={(value) => {
                      setSelectedState(value);
                      setSelectedCity(""); // Reset city when state changes
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

                {/* Description */}
                <div>
                  <Label htmlFor="description">Company Description *</Label>
                  <Textarea
                    id="description"
                    {...register("description", { required: "Description is required" })}
                    placeholder="Describe your company, capabilities, and experience..."
                    className="mt-1 h-32"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                {/* Certificates Upload */}
                <div>
                  <Label>Certificates & Quality Certifications</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="certificates" className="cursor-pointer">
                        <span className="text-primary hover:text-primary/80 font-medium">Upload certificates</span>
                        <input
                          id="certificates"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleCertificateUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ISO certifications, quality standards, industry compliance docs
                    </p>
                    <p className="text-xs text-gray-400">PDF, DOC, DOCX, JPG, PNG up to 10MB each</p>
                  </div>
                  {certificates.length > 0 && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Uploaded certificates:</p>
                      <ul className="space-y-1">
                        {certificates.map((file, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Business Registration Document */}
                <div>
                  <Label>Business Registration Document</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="businessDoc" className="cursor-pointer">
                        <span className="text-primary hover:text-primary/80 font-medium">Upload business registration</span>
                        <input
                          id="businessDoc"
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Company incorporation certificate, partnership deed, or proprietorship registration
                    </p>
                  </div>
                </div>

                {/* Sample Projects Upload */}
                <div>
                  <Label>Sample Projects & Portfolio</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="projects" className="cursor-pointer">
                        <span className="text-primary hover:text-primary/80 font-medium">Upload project photos</span>
                        <input
                          id="projects"
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.gif"
                          onChange={handleProjectImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Showcase your best work - finished products, machinery, facility photos
                    </p>
                    <p className="text-xs text-gray-400">JPG, JPEG, PNG, GIF up to 5MB each</p>
                  </div>
                  {projectImages.length > 0 && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Uploaded project images:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {projectImages.slice(0, 8).map((file, index) => (
                          <div key={index} className="text-xs text-gray-600 p-2 bg-white rounded border">
                            <Image className="w-4 h-4 mx-auto mb-1" />
                            <p className="truncate">{file.name}</p>
                          </div>
                        ))}
                      </div>
                      {projectImages.length > 8 && (
                        <p className="text-xs text-gray-500 mt-2">
                          +{projectImages.length - 8} more files
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button type="submit" disabled={loading} className="w-full py-3 text-lg">
                    {loading ? 'Processing...' : (isExistingUser ? 'Complete Registration' : 'Register Now')}
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

export default ManufacturerRegistration;
