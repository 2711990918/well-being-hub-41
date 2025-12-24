import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Flame, Clock, Target } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Database } from "@/integrations/supabase/types";

type ExercisePlan = Database["public"]["Tables"]["exercise_plans"]["Row"];

const ExercisePlans = () => {
  const [plans, setPlans] = useState<ExercisePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase
        .from("exercise_plans")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setPlans(data || []);
      setLoading(false);
    };
    fetchPlans();
  }, []);

  const categories = ["all", "有氧运动", "力量训练", "柔韧训练", "康复训练"];
  const difficultyColors: Record<string, string> = {
    easy: "bg-green-500/10 text-green-600",
    medium: "bg-yellow-500/10 text-yellow-600",
    hard: "bg-red-500/10 text-red-600",
  };
  const difficultyLabels: Record<string, string> = {
    easy: "简单",
    medium: "中等",
    hard: "困难",
  };

  const filteredPlans = selectedCategory === "all" 
    ? plans 
    : plans.filter(p => p.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">运动健身</h1>
          <p className="text-muted-foreground">科学运动，增强体魄</p>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="flex-wrap h-auto">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat}>{cat === "all" ? "全部" : cat}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {filteredPlans.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>暂无运动计划</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {plan.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={plan.image_url} 
                      alt={plan.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{plan.category}</Badge>
                    <Badge className={difficultyColors[plan.difficulty] || ""}>
                      {difficultyLabels[plan.difficulty] || plan.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{plan.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {plan.duration_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {plan.duration_minutes} 分钟
                      </span>
                    )}
                    {plan.calories_burn && (
                      <span className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        {plan.calories_burn} 千卡
                      </span>
                    )}
                  </div>
                  {plan.equipment && plan.equipment.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {plan.equipment.map((eq, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{eq}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ExercisePlans;
