
import Navigation from "@/components/Navigation";
import LuxuryHeroSection from "@/components/LuxuryHeroSection";
import CategorySelection from "@/components/CategorySelection";
import UploadCADModal from "@/components/UploadCADModal";
import PastProjects from "@/components/PastProjects";
import FeaturesSection from "@/components/FeaturesSection";
import AboutSection from "@/components/AboutSection";
import FAQSection from "@/components/FAQSection";
import LuxurySupportSection from "@/components/LuxurySupportSection";
import LuxuryFooter from "@/components/LuxuryFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <LuxuryHeroSection />
      <CategorySelection />
      <PastProjects />
      <FeaturesSection />
      <AboutSection />
      <FAQSection />
      <LuxurySupportSection />
      <LuxuryFooter />
      
      {/* Floating Elements */}
      <UploadCADModal />
    </div>
  );
};

export default Index;
