import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, User } from "lucide-react";

const articles = [
  {
    id: 1,
    title: "春季养生：顺应自然，调理身心",
    excerpt: "春季是万物复苏的季节，也是养生的黄金时期。本文将为您详细介绍春季养生的要点...",
    author: "张医师",
    readTime: "5分钟",
    category: "中医养生",
    categoryColor: "bg-wellness-mint text-primary",
    image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "科学膳食：如何搭配一日三餐",
    excerpt: "均衡的饮食是健康的基础。了解如何科学搭配碳水化合物、蛋白质和脂肪...",
    author: "李营养师",
    readTime: "8分钟",
    category: "营养膳食",
    categoryColor: "bg-wellness-peach text-accent",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "冥想入门：每天10分钟的心灵净化",
    excerpt: "冥想可以帮助减轻压力、提高专注力。即使每天只有10分钟，也能带来显著改变...",
    author: "王心理师",
    readTime: "6分钟",
    category: "心理健康",
    categoryColor: "bg-wellness-lavender text-foreground",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop",
  },
];

const ArticlesSection = () => {
  return (
    <section className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              养生资讯
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              精选健康文章，专业知识分享，助您掌握养生之道
            </p>
          </div>
          <Button variant="ghost" className="mt-4 md:mt-0 group">
            查看全部
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {articles.map((article, index) => (
            <Card
              key={article.id}
              variant="wellness"
              className="group overflow-hidden animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${article.categoryColor}`}>
                    {article.category}
                  </span>
                </div>
              </div>

              <CardHeader className="pb-2">
                <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
              </CardHeader>

              <CardContent>
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {article.excerpt}
                </p>
              </CardContent>

              <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{article.readTime}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection;
