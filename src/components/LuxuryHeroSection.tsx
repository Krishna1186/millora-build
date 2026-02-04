
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const LuxuryHeroSection = () => {
  const { user, userProfile } = useAuth();

  const getDashboardLink = () => {
    if (user && userProfile) {
      return userProfile.role === 'manufacturer' ? '/manufacturer-dashboard' : '/customer-dashboard';
    }
    return '/auth';
  };

  const getDashboardText = () => {
    if (user && userProfile) {
      return 'GO TO DASHBOARD';
    }
    return 'POST YOUR PROJECT';
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2070&q=80')`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h1 className="text-5xl md:text-7xl font-light mb-6 tracking-tight">
          Connect with the Future of <br />
          <span className="font-normal">Hardware Manufacturing</span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto font-light opacity-90 leading-relaxed">
          Find the best suppliers for electronics prototyping and manufacturing.
          Precision meets innovation in every project.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="luxury-button luxury-button-primary h-12 px-8 text-sm tracking-wider hover:bg-primary/90 hover:scale-105 transition-all duration-300"
            asChild
          >
            <Link to={getDashboardLink()}>
              {getDashboardText()}
            </Link>
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="luxury-button border-white text-black bg-white hover:bg-gray-100 hover:scale-105 h-12 px-8 text-sm tracking-wider transition-all duration-300"
            asChild
          >
            <Link to="/browse-manufacturers">BROWSE MANUFACTURERS</Link>
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white opacity-60">
        <div className="w-px h-16 bg-white/30 mx-auto mb-2"></div>
        <p className="text-xs uppercase tracking-widest">Scroll</p>
      </div>
    </section>
  );
};

export default LuxuryHeroSection;
