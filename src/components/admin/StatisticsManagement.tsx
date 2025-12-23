import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, ShoppingBag, CreditCard, TrendingUp, Activity, Heart, MessageSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const StatisticsManagement = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArticles: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalCourses: 0,
    totalConsultations: 0,
    totalDietPlans: 0,
    totalExercisePlans: 0,
  });
  const [orderStats, setOrderStats] = useState<{ status: string; count: number }[]>([]);
  const [articleStats, setArticleStats] = useState<{ category: string; count: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<{ date: string; count: number; total: number }[]>([]);
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
        { count: dietPlansCount },
        { count: exercisePlansCount },
        { data: orders },
        { data: articles },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("articles").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("wellness_courses").select("*", { count: "exact", head: true }),
        supabase.from("consultations").select("*", { count: "exact", head: true }),
        supabase.from("diet_plans").select("*", { count: "exact", head: true }),
        supabase.from("exercise_plans").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("status, total_price, created_at"),
        supabase.from("articles").select("category"),
      ]);

      setStats({
        totalUsers: usersCount || 0,
        totalArticles: articlesCount || 0,
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalCourses: coursesCount || 0,
        totalConsultations: consultationsCount || 0,
        totalDietPlans: dietPlansCount || 0,
        totalExercisePlans: exercisePlansCount || 0,
      });

      // Order status distribution
      if (orders) {
        const statusCount = orders.reduce((acc: Record<string, number>, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {});
        setOrderStats(Object.entries(statusCount).map(([status, count]) => ({
          status: statusLabels[status] || status,
          count,
        })));

        // Recent orders by date (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        const ordersByDate = last7Days.map(date => {
          const dayOrders = orders.filter(o => o.created_at.startsWith(date));
          return {
            date: date.slice(5),
            count: dayOrders.length,
            total: dayOrders.reduce((sum, o) => sum + Number(o.total_price || 0), 0),
          };
        });
        setRecentOrders(ordersByDate);
      }

      // Article category distribution
      if (articles) {
        const categoryCount = articles.reduce((acc: Record<string, number>, article) => {
          acc[article.category] = (acc[article.category] || 0) + 1;
          return acc;
        }, {});
        setArticleStats(Object.entries(categoryCount).map(([category, count]) => ({
          category: categoryLabels[category] || category,
          count,
        })));
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusLabels: Record<string, string> = {
    pending: "待支付",
    paid: "已支付",
    completed: "已完成",
    cancelled: "已取消",
  };

  const categoryLabels: Record<string, string> = {
    nutrition: "营养膳食",
    fitness: "运动健身",
    tcm: "中医养生",
    mental: "心理健康",
    sleep: "睡眠调理",
    chronic: "慢病管理",
    general: "综合",
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(142, 76%, 36%)'];

  const statCards = [
    { title: "注册用户", value: stats.totalUsers, icon: Users, color: "text-primary" },
    { title: "文章总数", value: stats.totalArticles, icon: FileText, color: "text-accent" },
    { title: "产品数量", value: stats.totalProducts, icon: ShoppingBag, color: "text-primary" },
    { title: "订单总数", value: stats.totalOrders, icon: CreditCard, color: "text-accent" },
    { title: "课程数量", value: stats.totalCourses, icon: TrendingUp, color: "text-primary" },
    { title: "咨询预约", value: stats.totalConsultations, icon: Activity, color: "text-accent" },
    { title: "饮食计划", value: stats.totalDietPlans, icon: Heart, color: "text-primary" },
    { title: "运动计划", value: stats.totalExercisePlans, icon: MessageSquare, color: "text-accent" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">数据统计</h2>
        <p className="text-muted-foreground">平台数据概览与分析</p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display text-foreground">
                    {stat.value.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Order Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">近7天订单趋势</CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={recentOrders}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="count" name="订单数" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line type="monotone" dataKey="total" name="金额" stroke="hsl(var(--accent))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">暂无订单数据</div>
                )}
              </CardContent>
            </Card>

            {/* Order Status Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">订单状态分布</CardTitle>
              </CardHeader>
              <CardContent>
                {orderStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={orderStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {orderStats.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">暂无订单数据</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Article Category Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">文章分类统计</CardTitle>
            </CardHeader>
            <CardContent>
              {articleStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={articleStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" name="文章数" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">暂无文章数据</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default StatisticsManagement;
