import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils, Dumbbell, BookOpen, Heart, Brain, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Categories = () => {
  const [stats, setStats] = useState({
    articles: 0,
    dietPlans: 0,
    exercisePlans: 0,
    courses: 0,
    products: 0,
    community: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [articles, diet, exercise, courses, products, community] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("diet_plans").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("exercise_plans").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("wellness_courses").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("community_posts").select("id", { count: "exact", head: true }).eq("is_published", true),
      ]);
      setStats({
        articles: articles.count || 0,
        dietPlans: diet.count || 0,
        exercisePlans: exercise.count || 0,
        courses: courses.count || 0,
        products: products.count || 0,
        community: community.count || 0,
      });
    };
    fetchStats();
  }, []);

  const categories = [
    {
      title: "健康资讯",
      description: "专业健康知识与养生文章",
      icon: BookOpen,
      count: stats.articles,
      link: "/articles",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "饮食推荐",
      description: "科学饮食计划与营养指南",
      icon: Utensils,
      count: stats.dietPlans,
      link: "/diet-plans",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "运动健身",
      description: "运动方案与健身指导",
      icon: Dumbbell,
      count: stats.exercisePlans,
      link: "/exercise-plans",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "养生课程",
      description: "专业养生课程与活动",
      icon: Heart,
      count: stats.courses,
      link: "/courses",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "健康商城",
      description: "精选养生保健产品",
      icon: Brain,
      count: stats.products,
      link: "/products",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "健康社区",
      description: "分享交流健康心得",
      icon: Users,
      count: stats.community,
      link: "/community",
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">健康分类</h1>
          <p className="text-muted-foreground">探索全方位的健康养生服务</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link key={cat.title} to={cat.link}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl ${cat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <cat.icon className={`w-6 h-6 ${cat.color}`} />
                    </div>
                    <Badge variant="secondary">{cat.count} 项</Badge>
                  </div>
                  <CardTitle className="mt-4">{cat.title}</CardTitle>
                  <CardDescription>{cat.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Categories;
