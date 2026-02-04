
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LogoutButton from "@/components/LogoutButton";

const Navigation = () => {
  const { user, userProfile } = useAuth();

  const getDashboardPath = () => {
    if (userProfile?.role === 'manufacturer') {
      return '/manufacturer-dashboard';
    }
    return '/customer-dashboard';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-light text-primary tracking-tight hover:scale-105 transition-transform duration-300">
              Millora
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <HoverCard>
              <HoverCardTrigger asChild>
                <a href="/#about" className="text-gray-600 hover:text-primary transition-colors font-light tracking-wide hover:scale-105 duration-300">
                  About
                </a>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">About Millora</h4>
                  <p className="text-sm text-muted-foreground">
                    Learn about our mission to connect manufacturers with customers in the hardware and electronics prototyping industry.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
            
            <HoverCard>
              <HoverCardTrigger asChild>
                <a href="/#features" className="text-gray-600 hover:text-primary transition-colors font-light tracking-wide hover:scale-105 duration-300">
                  Features
                </a>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Platform Features</h4>
                  <p className="text-sm text-muted-foreground">
                    Discover our comprehensive features including project management, manufacturer matching, and quality assurance.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
            
            <HoverCard>
              <HoverCardTrigger asChild>
                <a href="/#faq" className="text-gray-600 hover:text-primary transition-colors font-light tracking-wide hover:scale-105 duration-300">
                  FAQ
                </a>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Frequently Asked Questions</h4>
                  <p className="text-sm text-muted-foreground">
                    Find answers to common questions about our platform, pricing, and services.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
            
            <HoverCard>
              <HoverCardTrigger asChild>
                <Link to="/support" className="text-gray-600 hover:text-primary transition-colors font-light tracking-wide hover:scale-105 duration-300">
                  Support
                </Link>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Customer Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Get help with your projects, technical issues, and account management from our support team.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600 font-light">
                  Welcome, {userProfile?.full_name || user.email}
                </span>
                <Link to={getDashboardPath()}>
                  <Button variant="ghost" className="font-light tracking-wide hover:scale-105 transition-all duration-300">
                    Dashboard
                  </Button>
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Link to="/auth">
                      <Button variant="ghost" className="font-light tracking-wide hover:scale-105 transition-all duration-300">Sign In</Button>
                    </Link>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Sign In</h4>
                      <p className="text-sm text-muted-foreground">
                        Access your customer or manufacturer dashboard to manage projects and orders.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Link to="/manufacturer-registration">
                      <Button className="luxury-button luxury-button-primary hover:scale-105 transition-all duration-300">JOIN AS MANUFACTURER</Button>
                    </Link>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Manufacturer Registration</h4>
                      <p className="text-sm text-muted-foreground">
                        Join our network of trusted manufacturers and start receiving project requests from customers.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
