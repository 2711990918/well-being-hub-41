import { Card, CardContent } from "@/components/ui/card";
import { Apple, Dumbbell, Brain, Moon, Leaf, Heart } from "lucide-react";

const categories = [
  {
    icon: Apple,
    title: "营养膳食",
    description: "科学饮食搭配，均衡营养摄入",
    color: "wellness-peach",
    iconColor: "text-accent",
  },
  {
    icon: Dumbbell,
    title: "运动健身",
    description: "适量运动，强健体魄",
    color: "wellness-sky",
    iconColor: "text-primary",
  },
  {
    icon: Leaf,
    title: "中医养生",
    description: "传统智慧，调理身心",
    color: "wellness-mint",
    iconColor: "text-primary",
  },
  {
    icon: Brain,
    title: "心理健康",
    description: "心理调适，情绪管理",
    color: "wellness-lavender",
    iconColor: "text-accent",
  },
  {
    icon: Moon,
    title: "睡眠调理",
    description: "优质睡眠，精力充沛",
    color: "wellness-sky",
    iconColor: "text-primary",
  },
  {
    icon: Heart,
    title: "慢病管理",
    description: "科学防控，健康生活",
    color: "wellness-peach",
    iconColor: "text-accent",
  },
];

const CategorySection = () => {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            健康分类
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            全方位覆盖您的健康需求，从饮食到运动，从身体到心理
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Card
              key={category.title}
              variant="category"
              className="group animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 md:p-8 flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-2xl bg-${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className={`w-8 h-8 ${category.iconColor}`} />
                </div>
                <h3 className="font-display text-lg md:text-xl font-semibold text-foreground mb-2">
                  {category.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
