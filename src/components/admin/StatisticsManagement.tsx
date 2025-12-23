import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, ShoppingBag, CreditCard, TrendingUp, Activity } from "lucide-react";

const StatisticsManagement = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArticles: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalCourses: 0,
    totalConsultations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: usersCount },
        { count: articlesCount },
        { count: productsCount },
        { count: ordersCount },
        { count: coursesCount },
        { count: consultationsCount },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("articles").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("wellness_courses").select("*", { count: "exact", head: true }),
        supabase.from("consultations").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalUsers: usersCount || 0,
        totalArticles: articlesCount || 0,
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalCourses: coursesCount || 0,
        totalConsultations: consultationsCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "注册用户", value: stats.totalUsers, icon: Users, color: "text-primary" },
    { title: "文章总数", value: stats.totalArticles, icon: FileText, color: "text-accent" },
    { title: "产品数量", value: stats.totalProducts, icon: ShoppingBag, color: "text-primary" },
    { title: "订单总数", value: stats.totalOrders, icon: CreditCard, color: "text-accent" },
    { title: "课程数量", value: stats.totalCourses, icon: TrendingUp, color: "text-primary" },
    { title: "咨询预约", value: stats.totalConsultations, icon: Activity, color: "text-accent" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">数据统计</h2>
        <p className="text-muted-foreground">平台数据概览</p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title} variant="wellness">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display text-foreground">
                  {stat.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>数据趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            图表功能开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsManagement;
