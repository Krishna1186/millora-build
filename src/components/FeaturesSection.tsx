
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, MessageSquare, Lock, Star, Globe, BarChart3 } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      title: "Verified Manufacturers",
      description: "All manufacturers undergo rigorous verification to ensure quality and reliability.",
      icon: Shield
    },
    {
      title: "Streamlined Communication",
      description: "Direct messaging system between customers and manufacturers for efficient project collaboration.",
      icon: MessageSquare
    },
    {
      title: "Secure Transactions",
      description: "Protected payment processing with milestone-based payments and dispute resolution.",
      icon: Lock
    },
    {
      title: "Quality Assurance",
      description: "Built-in quality control processes and manufacturer ratings based on past performance.",
      icon: Star
    },
    {
      title: "Global Reach",
      description: "Connect with manufacturers worldwide, from local partners to international suppliers.",
      icon: Globe
    },
    {
      title: "Project Management",
      description: "Track your projects from concept to completion with integrated project management tools.",
      icon: BarChart3
    }
  ];

  return (
    <section id="features" className="py-20 bg-white section-divider">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gray-900 mb-4">
            Why Choose Millora?
          </h2>
          <div className="w-24 h-px bg-gray-300 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
            We've built the most comprehensive platform for hardware manufacturing connections, 
            designed to accelerate innovation and streamline production.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="luxury-card group cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-gray-600 group-hover:text-primary transition-colors duration-300" strokeWidth={1.5} />
                </div>
                <CardTitle className="text-xl font-light">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 font-light leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
