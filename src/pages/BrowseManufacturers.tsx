
import Navigation from "@/components/Navigation";
import LuxuryFooter from "@/components/LuxuryFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Badge } from "lucide-react";

const BrowseManufacturers = () => {
  const manufacturers = [
    {
      name: "Precision Tech Manufacturing",
      location: "San Francisco, CA",
      rating: 4.8,
      reviews: 127,
      responseTime: "2-4 hours",
      specialties: ["CNC Machining", "3D Printing", "Sheet Metal"],
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Advanced Prototypes Ltd",
      location: "Austin, TX",
      rating: 4.9,
      reviews: 203,
      responseTime: "1-3 hours",
      specialties: ["Injection Molding", "PCB Assembly", "Rapid Prototyping"],
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Industrial Solutions Co",
      location: "Detroit, MI",
      rating: 4.7,
      reviews: 156,
      responseTime: "3-6 hours",
      specialties: ["CNC Machining", "Metal Fabrication", "Assembly"],
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=400&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-gray-900 mb-4">
              Browse Manufacturers
            </h1>
            <div className="w-24 h-px bg-gray-300 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              Discover vetted manufacturers ready to bring your projects to life
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {manufacturers.map((manufacturer, index) => (
              <Card key={index} className="luxury-card hover:shadow-lg transition-all duration-300">
                <CardHeader className="p-0">
                  <div 
                    className="h-48 bg-cover bg-center rounded-t-sm"
                    style={{ backgroundImage: `url(${manufacturer.image})` }}
                  />
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl font-light mb-2">{manufacturer.name}</CardTitle>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm font-light">{manufacturer.location}</span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{manufacturer.rating}</span>
                    <span className="text-sm text-gray-600 ml-1">({manufacturer.reviews} reviews)</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm font-light">Responds in {manufacturer.responseTime}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {manufacturer.specialties.map((specialty, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-light">
                        {specialty}
                      </span>
                    ))}
                  </div>
                  
                  <Button className="luxury-button luxury-button-primary w-full">
                    VIEW PROFILE
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <LuxuryFooter />
    </div>
  );
};

export default BrowseManufacturers;
