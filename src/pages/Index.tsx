import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import ArticlesSection from "@/components/ArticlesSection";
import TipsSection from "@/components/TipsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CategorySection />
        <ArticlesSection />
        <TipsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
