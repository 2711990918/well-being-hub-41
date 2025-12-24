import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const CTASection = () => {
  const navigate = useNavigate();
  const [showBenefits, setShowBenefits] = useState(false);

  const benefits = [
    "无限制访问所有健康文章和资讯",
    "专属AI健康助手一对一咨询",
    "个性化饮食和运动计划定制",
    "专业健康顾问在线咨询服务",
    "健康数据监测与分析报告",
    "会员专属健康课程和直播",
    "健康商城会员专享折扣",
    "社区优先发言和互动权益",
  ];

  return (
    <>
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
                onClick={() => navigate("/auth")}
              >
                免费注册
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                onClick={() => setShowBenefits(true)}
              >
                了解会员权益
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Dialog */}
      <Dialog open={showBenefits} onOpenChange={setShowBenefits}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">会员权益</DialogTitle>
            <DialogDescription className="text-center">
              成为会员，享受更多专属健康服务
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-4">
            <Button onClick={() => { setShowBenefits(false); navigate("/auth"); }}>
              立即注册
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CTASection;
