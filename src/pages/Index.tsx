import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import WhyDifferentSection from "@/components/WhyDifferentSection";
import TemplatesSection from "@/components/TemplatesSection";
import VideoGenerationSection from "@/components/VideoGenerationSection";
import VideoModuleComparisonSection from "@/components/VideoModuleComparisonSection";
import SocialProofSection from "@/components/SocialProofSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <WhyDifferentSection />
      <TemplatesSection />
      <VideoGenerationSection />
      <VideoModuleComparisonSection />
      <SocialProofSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
