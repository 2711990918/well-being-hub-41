import { Lightbulb, CheckCircle2 } from "lucide-react";

const tips = [
  "每天饮水量建议在1500-2000毫升",
  "保持规律作息，晚上11点前入睡最佳",
  "每周至少进行150分钟中等强度运动",
  "多吃蔬果，保证每日摄入足够膳食纤维",
  "学会减压，适当进行冥想或深呼吸练习",
  "定期体检，做到疾病早发现早治疗",
];

const TipsSection = () => {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                每日健康小贴士
              </h2>
              <p className="text-muted-foreground">简单易行的健康习惯</p>
            </div>
          </div>

          {/* Tips Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors duration-200 animate-fade-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TipsSection;
