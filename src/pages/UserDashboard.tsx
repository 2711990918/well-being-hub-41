import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Activity, 
  Heart, 
  Utensils, 
  Brain, 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  ShoppingBag,
  Plus,
  Save,
  Sparkles
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type HealthMonitoring = Database["public"]["Tables"]["health_monitoring"]["Row"];
type ChronicDisease = Database["public"]["Tables"]["chronic_diseases"]["Row"];
type Consultation = Database["public"]["Tables"]["consultations"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<{ username: string | null } | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthMonitoring[]>([]);
  const [chronicDiseases, setChronicDiseases] = useState<ChronicDisease[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Health record form
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [healthForm, setHealthForm] = useState({
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    heart_rate: "",
    blood_sugar: "",
    sleep_hours: "",
    water_intake: "",
    steps: "",
    mood: "normal",
    notes: ""
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      const [profileRes, healthRes, diseaseRes, consultRes, orderRes] = await Promise.all([
        supabase.from("profiles").select("username").eq("user_id", user!.id).single(),
        supabase.from("health_monitoring").select("*").eq("user_id", user!.id).order("record_date", { ascending: false }).limit(10),
        supabase.from("chronic_diseases").select("*").eq("user_id", user!.id),
        supabase.from("consultations").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
        supabase.from("orders").select("*").eq("user_id", user!.id).order("created_at", { ascending: false })
      ]);

      setProfile(profileRes.data);
      setHealthRecords(healthRes.data || []);
      setChronicDiseases(diseaseRes.data || []);
      setConsultations(consultRes.data || []);
      setOrders(orderRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHealthRecord = async () => {
    try {
      const { error } = await supabase.from("health_monitoring").insert({
        user_id: user!.id,
        blood_pressure_systolic: healthForm.blood_pressure_systolic ? parseInt(healthForm.blood_pressure_systolic) : null,
        blood_pressure_diastolic: healthForm.blood_pressure_diastolic ? parseInt(healthForm.blood_pressure_diastolic) : null,
        heart_rate: healthForm.heart_rate ? parseInt(healthForm.heart_rate) : null,
        blood_sugar: healthForm.blood_sugar ? parseFloat(healthForm.blood_sugar) : null,
        sleep_hours: healthForm.sleep_hours ? parseFloat(healthForm.sleep_hours) : null,
        water_intake: healthForm.water_intake ? parseInt(healthForm.water_intake) : null,
        steps: healthForm.steps ? parseInt(healthForm.steps) : null,
        mood: healthForm.mood,
        notes: healthForm.notes || null
      });

      if (error) throw error;

      toast({ title: "保存成功", description: "健康记录已保存" });
      setShowHealthForm(false);
      setHealthForm({
        blood_pressure_systolic: "",
        blood_pressure_diastolic: "",
        heart_rate: "",
        blood_sugar: "",
        sleep_hours: "",
        water_intake: "",
        steps: "",
        mood: "normal",
        notes: ""
      });
      fetchAllData();
    } catch (error) {
      console.error("Error saving health record:", error);
      toast({ title: "保存失败", variant: "destructive" });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  const moodLabels: Record<string, string> = {
    happy: "😊 开心",
    normal: "😐 一般",
    sad: "😢 低落",
    anxious: "😰 焦虑"
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            欢迎回来，{profile?.username || user?.email?.split("@")[0]}
          </h1>
          <p className="text-muted-foreground">管理您的健康数据，开启健康生活</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/ai-assistant")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">AI助手</p>
                <p className="text-xs text-muted-foreground">健康咨询</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowHealthForm(true)}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-sm">记录健康</p>
                <p className="text-xs text-muted-foreground">添加数据</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/articles")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-sm">养生资讯</p>
                <p className="text-xs text-muted-foreground">浏览文章</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="font-medium text-sm">预约咨询</p>
                <p className="text-xs text-muted-foreground">专家服务</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Record Form Modal */}
        {showHealthForm && (
          <Card className="mb-8 animate-fade-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                记录今日健康数据
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>收缩压 (mmHg)</Label>
                  <Input
                    type="number"
                    value={healthForm.blood_pressure_systolic}
                    onChange={(e) => setHealthForm({ ...healthForm, blood_pressure_systolic: e.target.value })}
                    placeholder="120"
                  />
                </div>
                <div className="space-y-2">
                  <Label>舒张压 (mmHg)</Label>
                  <Input
                    type="number"
                    value={healthForm.blood_pressure_diastolic}
                    onChange={(e) => setHealthForm({ ...healthForm, blood_pressure_diastolic: e.target.value })}
                    placeholder="80"
                  />
                </div>
                <div className="space-y-2">
                  <Label>心率 (次/分)</Label>
                  <Input
                    type="number"
                    value={healthForm.heart_rate}
                    onChange={(e) => setHealthForm({ ...healthForm, heart_rate: e.target.value })}
                    placeholder="72"
                  />
                </div>
                <div className="space-y-2">
                  <Label>血糖 (mmol/L)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={healthForm.blood_sugar}
                    onChange={(e) => setHealthForm({ ...healthForm, blood_sugar: e.target.value })}
                    placeholder="5.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>睡眠时长 (小时)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={healthForm.sleep_hours}
                    onChange={(e) => setHealthForm({ ...healthForm, sleep_hours: e.target.value })}
                    placeholder="8"
                  />
                </div>
                <div className="space-y-2">
                  <Label>饮水量 (ml)</Label>
                  <Input
                    type="number"
                    value={healthForm.water_intake}
                    onChange={(e) => setHealthForm({ ...healthForm, water_intake: e.target.value })}
                    placeholder="2000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>步数</Label>
                  <Input
                    type="number"
                    value={healthForm.steps}
                    onChange={(e) => setHealthForm({ ...healthForm, steps: e.target.value })}
                    placeholder="10000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>心情</Label>
                  <Select value={healthForm.mood} onValueChange={(v) => setHealthForm({ ...healthForm, mood: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="happy">😊 开心</SelectItem>
                      <SelectItem value="normal">😐 一般</SelectItem>
                      <SelectItem value="sad">😢 低落</SelectItem>
                      <SelectItem value="anxious">😰 焦虑</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>备注</Label>
                <Textarea
                  value={healthForm.notes}
                  onChange={(e) => setHealthForm({ ...healthForm, notes: e.target.value })}
                  placeholder="记录今天的健康状况..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowHealthForm(false)}>取消</Button>
                <Button onClick={handleSaveHealthRecord}>
                  <Save className="w-4 h-4 mr-2" />
                  保存记录
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="health" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="health">
              <Heart className="w-4 h-4 mr-1" />
              健康
            </TabsTrigger>
            <TabsTrigger value="chronic">
              <Brain className="w-4 h-4 mr-1" />
              慢病
            </TabsTrigger>
            <TabsTrigger value="consult">
              <MessageSquare className="w-4 h-4 mr-1" />
              咨询
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingBag className="w-4 h-4 mr-1" />
              订单
            </TabsTrigger>
          </TabsList>

          {/* Health Records */}
          <TabsContent value="health" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  健康监测记录
                </CardTitle>
                <CardDescription>您最近的健康数据</CardDescription>
              </CardHeader>
              <CardContent>
                {healthRecords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>暂无健康记录</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowHealthForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      添加记录
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {healthRecords.map((record) => (
                      <div key={record.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">{new Date(record.record_date).toLocaleDateString("zh-CN")}</span>
                          <Badge variant="outline">{moodLabels[record.mood || "normal"] || "😐 一般"}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          {record.blood_pressure_systolic && (
                            <span>血压: {record.blood_pressure_systolic}/{record.blood_pressure_diastolic}</span>
                          )}
                          {record.heart_rate && <span>心率: {record.heart_rate}</span>}
                          {record.blood_sugar && <span>血糖: {record.blood_sugar}</span>}
                          {record.sleep_hours && <span>睡眠: {record.sleep_hours}h</span>}
                          {record.steps && <span>步数: {record.steps}</span>}
                          {record.water_intake && <span>饮水: {record.water_intake}ml</span>}
                        </div>
                        {record.notes && <p className="text-xs text-muted-foreground mt-2">{record.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chronic Diseases */}
          <TabsContent value="chronic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  慢病管理
                </CardTitle>
                <CardDescription>您的慢性病管理记录</CardDescription>
              </CardHeader>
              <CardContent>
                {chronicDiseases.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>暂无慢病记录</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chronicDiseases.map((disease) => (
                      <div key={disease.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{disease.disease_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              确诊日期: {disease.diagnosis_date ? new Date(disease.diagnosis_date).toLocaleDateString("zh-CN") : "未知"}
                            </p>
                          </div>
                          <Badge>{disease.current_status || "管理中"}</Badge>
                        </div>
                        {disease.medications && disease.medications.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm">用药: {disease.medications.join(", ")}</p>
                          </div>
                        )}
                        {disease.doctor_notes && (
                          <p className="text-sm text-muted-foreground mt-2">{disease.doctor_notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consultations */}
          <TabsContent value="consult" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  咨询记录
                </CardTitle>
                <CardDescription>您的健康咨询预约</CardDescription>
              </CardHeader>
              <CardContent>
                {consultations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>暂无咨询记录</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {consultations.map((consult) => (
                      <div key={consult.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{consult.topic}</h4>
                            <p className="text-sm text-muted-foreground">
                              {consult.consultant_name || "待分配顾问"}
                            </p>
                          </div>
                          <Badge variant={consult.status === "completed" ? "default" : "secondary"}>
                            {consult.status === "pending" ? "待处理" : consult.status === "completed" ? "已完成" : consult.status}
                          </Badge>
                        </div>
                        {consult.scheduled_at && (
                          <p className="text-sm mt-2">预约时间: {new Date(consult.scheduled_at).toLocaleString("zh-CN")}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  我的订单
                </CardTitle>
                <CardDescription>您的购买记录</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>暂无订单记录</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{order.item_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {order.order_type} · 数量: {order.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-primary">¥{order.total_price}</p>
                            <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                              {order.status === "pending" ? "待付款" : order.status === "completed" ? "已完成" : order.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(order.created_at).toLocaleString("zh-CN")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;
