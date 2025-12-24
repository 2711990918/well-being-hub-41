import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, Flame, Clock, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Database } from "@/integrations/supabase/types";

type DietPlan = Database["public"]["Tables"]["diet_plans"]["Row"];

const DietPlans = () => {
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase
        .from("diet_plans")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setPlans(data || []);
      setLoading(false);
    };
    fetchPlans();
  }, []);

  const mealTypes = ["all", "breakfast", "lunch", "dinner", "snack"];
  const mealTypeLabels: Record<string, string> = {
    all: "全部",
    breakfast: "早餐",
    lunch: "午餐",
    dinner: "晚餐",
    snack: "加餐",
  };

  const filteredPlans = selectedType === "all" 
    ? plans 
    : plans.filter(p => p.meal_type === selectedType);

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
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">饮食推荐</h1>
          <p className="text-muted-foreground">科学饮食，健康生活</p>
        </div>

        <Tabs value={selectedType} onValueChange={setSelectedType} className="mb-6">
          <TabsList>
            {mealTypes.map(type => (
              <TabsTrigger key={type} value={type}>{mealTypeLabels[type]}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {filteredPlans.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Utensils className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>暂无饮食计划</p>
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
                    <Badge variant="secondary">{mealTypeLabels[plan.meal_type] || plan.meal_type}</Badge>
                    {plan.calories && (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        {plan.calories} 千卡
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg">{plan.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {plan.ingredients && plan.ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {plan.ingredients.slice(0, 4).map((ing, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{ing}</Badge>
                      ))}
                      {plan.ingredients.length > 4 && (
                        <Badge variant="outline" className="text-xs">+{plan.ingredients.length - 4}</Badge>
                      )}
                    </div>
                  )}
                  {plan.suitable_for && plan.suitable_for.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      适合：{plan.suitable_for.join("、")}
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

export default DietPlans;
