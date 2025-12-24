import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Calendar, 
  MessageSquare, 
  User,
  Save,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Award,
  TrendingUp
} from "lucide-react";

interface ConsultantProfile {
  id: string;
  user_id: string;
  specialty: string;
  bio: string | null;
  experience_years: number;
  rating: number;
  total_consultations: number;
  is_available: boolean;
  hourly_rate: number;
  certifications: string[] | null;
}

interface Consultation {
  id: string;
  user_id: string;
  topic: string;
  description: string | null;
  status: string;
  scheduled_at: string | null;
  notes: string | null;
  created_at: string;
  consultant_id: string | null;
}

const ConsultantDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<{ username: string | null } | null>(null);
  const [consultantProfile, setConsultantProfile] = useState<ConsultantProfile | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [pendingConsultations, setPendingConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConsultant, setIsConsultant] = useState(false);

  const [profileForm, setProfileForm] = useState({
    specialty: "心理咨询",
    bio: "",
    experience_years: 0,
    hourly_rate: 100,
    certifications: "",
    is_available: true
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkConsultantRole();
    }
  }, [user]);

  const checkConsultantRole = async () => {
    try {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "consultant")
        .single();

      if (roleData) {
        setIsConsultant(true);
        fetchAllData();
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      const [profileRes, consultantRes, myConsultationsRes, pendingRes] = await Promise.all([
        supabase.from("profiles").select("username").eq("user_id", user!.id).single(),
        supabase.from("consultant_profiles").select("*").eq("user_id", user!.id).single(),
        supabase.from("consultations").select("*").eq("consultant_id", user!.id).order("created_at", { ascending: false }),
        supabase.from("consultations").select("*").is("consultant_id", null).eq("status", "pending").order("created_at", { ascending: false })
      ]);

      setProfile(profileRes.data);
      
      if (consultantRes.data) {
        setConsultantProfile(consultantRes.data);
        setProfileForm({
          specialty: consultantRes.data.specialty,
          bio: consultantRes.data.bio || "",
          experience_years: consultantRes.data.experience_years,
          hourly_rate: consultantRes.data.hourly_rate,
          certifications: consultantRes.data.certifications?.join(", ") || "",
          is_available: consultantRes.data.is_available
        });
      }
      
      setConsultations(myConsultationsRes.data || []);
      setPendingConsultations(pendingRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const certArray = profileForm.certifications.split(",").map(s => s.trim()).filter(Boolean);
      
      if (consultantProfile) {
        const { error } = await supabase
          .from("consultant_profiles")
          .update({
            specialty: profileForm.specialty,
            bio: profileForm.bio || null,
            experience_years: profileForm.experience_years,
            hourly_rate: profileForm.hourly_rate,
            certifications: certArray.length > 0 ? certArray : null,
            is_available: profileForm.is_available
          })
          .eq("user_id", user!.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("consultant_profiles")
          .insert({
            user_id: user!.id,
            specialty: profileForm.specialty,
            bio: profileForm.bio || null,
            experience_years: profileForm.experience_years,
            hourly_rate: profileForm.hourly_rate,
            certifications: certArray.length > 0 ? certArray : null,
            is_available: profileForm.is_available
          });

        if (error) throw error;
      }

      toast({ title: "保存成功", description: "个人资料已更新" });
      fetchAllData();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: "保存失败", variant: "destructive" });
    }
  };

  const handleAcceptConsultation = async (consultationId: string) => {
    try {
      const { error } = await supabase
        .from("consultations")
        .update({ 
          consultant_id: user!.id,
          status: "confirmed"
        })
        .eq("id", consultationId);

      if (error) throw error;

      toast({ title: "接单成功", description: "已接受该咨询预约" });
      fetchAllData();
    } catch (error) {
      toast({ title: "操作失败", variant: "destructive" });
    }
  };

  const handleCompleteConsultation = async (consultationId: string) => {
    try {
      const { error } = await supabase
        .from("consultations")
        .update({ status: "completed" })
        .eq("id", consultationId);

      if (error) throw error;

      // Update total consultations count
      if (consultantProfile) {
        await supabase
          .from("consultant_profiles")
          .update({ total_consultations: consultantProfile.total_consultations + 1 })
          .eq("user_id", user!.id);
      }

      toast({ title: "咨询完成", description: "已标记为完成" });
      fetchAllData();
    } catch (error) {
      toast({ title: "操作失败", variant: "destructive" });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!isConsultant) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 mt-16 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">无访问权限</h2>
              <p className="text-muted-foreground mb-4">您不是心理咨询师，无法访问此页面</p>
              <Button onClick={() => navigate("/user-dashboard")}>返回个人中心</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "待接单", variant: "secondary" },
    confirmed: { label: "已确认", variant: "default" },
    completed: { label: "已完成", variant: "outline" },
    cancelled: { label: "已取消", variant: "destructive" },
  };

  const confirmedConsultations = consultations.filter(c => c.status === "confirmed");
  const completedConsultations = consultations.filter(c => c.status === "completed");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            咨询师工作台 - {profile?.username || user?.email?.split("@")[0]}
          </h1>
          <p className="text-muted-foreground">管理您的咨询预约和个人资料</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingConsultations.length}</p>
                  <p className="text-xs text-muted-foreground">待接单</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{confirmedConsultations.length}</p>
                  <p className="text-xs text-muted-foreground">进行中</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{consultantProfile?.total_consultations || 0}</p>
                  <p className="text-xs text-muted-foreground">总完成</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{consultantProfile?.rating || 5.0}</p>
                  <p className="text-xs text-muted-foreground">评分</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="pending">待接单</TabsTrigger>
            <TabsTrigger value="my">我的咨询</TabsTrigger>
            <TabsTrigger value="history">历史记录</TabsTrigger>
            <TabsTrigger value="profile">个人资料</TabsTrigger>
          </TabsList>

          {/* Pending Consultations */}
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  待接单咨询
                </CardTitle>
                <CardDescription>查看并接受用户的咨询预约</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingConsultations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">暂无待接单的咨询</p>
                ) : (
                  <div className="space-y-4">
                    {pendingConsultations.map((consultation) => (
                      <Card key={consultation.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{consultation.topic}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{consultation.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(consultation.created_at).toLocaleDateString()}
                                </span>
                                {consultation.scheduled_at && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    期望: {new Date(consultation.scheduled_at).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button size="sm" onClick={() => handleAcceptConsultation(consultation.id)}>
                              接单
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Consultations */}
          <TabsContent value="my" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  进行中的咨询
                </CardTitle>
              </CardHeader>
              <CardContent>
                {confirmedConsultations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">暂无进行中的咨询</p>
                ) : (
                  <div className="space-y-4">
                    {confirmedConsultations.map((consultation) => (
                      <Card key={consultation.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{consultation.topic}</h4>
                                <Badge variant={statusLabels[consultation.status]?.variant}>
                                  {statusLabels[consultation.status]?.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{consultation.description}</p>
                              {consultation.scheduled_at && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  预约时间: {new Date(consultation.scheduled_at).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <Button size="sm" variant="outline" onClick={() => handleCompleteConsultation(consultation.id)}>
                              标记完成
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  咨询历史
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedConsultations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">暂无历史记录</p>
                ) : (
                  <div className="space-y-4">
                    {completedConsultations.map((consultation) => (
                      <Card key={consultation.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{consultation.topic}</h4>
                                <Badge variant="outline">已完成</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{consultation.description}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                完成时间: {new Date(consultation.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  咨询师资料
                </CardTitle>
                <CardDescription>设置您的专业信息，让用户更了解您</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>专业方向</Label>
                    <Input
                      value={profileForm.specialty}
                      onChange={(e) => setProfileForm({ ...profileForm, specialty: e.target.value })}
                      placeholder="如：心理咨询、婚姻家庭..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>从业年限</Label>
                    <Input
                      type="number"
                      value={profileForm.experience_years}
                      onChange={(e) => setProfileForm({ ...profileForm, experience_years: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>咨询费用 (元/小时)</Label>
                    <Input
                      type="number"
                      value={profileForm.hourly_rate}
                      onChange={(e) => setProfileForm({ ...profileForm, hourly_rate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>资质证书 (逗号分隔)</Label>
                    <Input
                      value={profileForm.certifications}
                      onChange={(e) => setProfileForm({ ...profileForm, certifications: e.target.value })}
                      placeholder="国家二级心理咨询师, 婚姻家庭咨询师..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>个人简介</Label>
                  <Textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="介绍您的专业背景和服务特色..."
                    rows={4}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={profileForm.is_available}
                      onCheckedChange={(checked) => setProfileForm({ ...profileForm, is_available: checked })}
                    />
                    <Label>接受新咨询</Label>
                  </div>
                  <Button onClick={handleSaveProfile}>
                    <Save className="w-4 h-4 mr-2" />
                    保存资料
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default ConsultantDashboard;
