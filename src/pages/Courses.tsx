import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Clock, MapPin, Users, Calendar, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Database } from "@/integrations/supabase/types";

type Course = Database["public"]["Tables"]["wellness_courses"]["Row"];

const Courses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase
        .from("wellness_courses")
        .select("*")
        .eq("is_active", true)
        .order("start_date", { ascending: true });
      setCourses(data || []);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const handleEnroll = async (course: Course) => {
    if (!user) {
      toast({ title: "请先登录", variant: "destructive" });
      return;
    }
    
    try {
      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        item_id: course.id,
        item_name: course.title,
        order_type: "course",
        total_price: course.price || 0,
        status: "pending",
      });
      
      if (error) throw error;
      toast({ title: "报名成功", description: "请前往订单页面完成支付" });
    } catch (error) {
      toast({ title: "报名失败", variant: "destructive" });
    }
  };

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
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">养生课程</h1>
          <p className="text-muted-foreground">专业导师，科学养生</p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>暂无课程</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                {course.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={course.image_url} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{course.category}</Badge>
                    {course.price !== null && (
                      <span className="text-lg font-bold text-primary">
                        ¥{course.price}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {course.instructor && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        讲师：{course.instructor}
                      </div>
                    )}
                    {course.start_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(course.start_date).toLocaleDateString("zh-CN")}
                      </div>
                    )}
                    {course.duration_minutes && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {course.duration_minutes} 分钟
                      </div>
                    )}
                    {course.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {course.location}
                      </div>
                    )}
                    {course.max_participants && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        名额：{course.current_participants || 0}/{course.max_participants}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleEnroll(course)}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    立即报名
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Courses;
