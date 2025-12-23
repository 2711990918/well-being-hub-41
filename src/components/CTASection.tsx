import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 md:py-32 bg-primary relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-glow/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-glow/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/10 mb-8">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>

          {/* Heading */}
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            开启您的健康之旅
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-xl mx-auto">
            加入我们，获取专属健康建议，与志同道合的朋友一起追求更健康的生活
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="xl"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:scale-105 transition-all duration-300 font-semibold group"
            >
              免费注册
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
            >
              了解会员权益
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
