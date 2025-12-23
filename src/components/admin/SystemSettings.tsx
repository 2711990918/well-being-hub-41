import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Settings, Globe, Bell, Shield, Palette, Save, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description: string | null;
}

const SystemSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Site settings
  const [siteName, setSiteName] = useState("养生堂");
  const [siteDescription, setSiteDescription] = useState("专业健康养生平台");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  
  // Feature toggles
  const [enableRegistration, setEnableRegistration] = useState(true);
  const [enableComments, setEnableComments] = useState(true);
  const [enableOrders, setEnableOrders] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [consultationNotifications, setConsultationNotifications] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*");

      if (error) throw error;

      if (data) {
        data.forEach((setting: SystemSetting) => {
          const value = setting.value;
          switch (setting.key) {
            case "site_name": setSiteName(value as string); break;
            case "site_description": setSiteDescription(value as string); break;
            case "contact_email": setContactEmail(value as string); break;
            case "contact_phone": setContactPhone(value as string); break;
            case "enable_registration": setEnableRegistration(value as boolean); break;
            case "enable_comments": setEnableComments(value as boolean); break;
            case "enable_orders": setEnableOrders(value as boolean); break;
            case "maintenance_mode": setMaintenanceMode(value as boolean); break;
            case "email_notifications": setEmailNotifications(value as boolean); break;
            case "order_notifications": setOrderNotifications(value as boolean); break;
            case "consultation_notifications": setConsultationNotifications(value as boolean); break;
          }
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: any, description?: string) => {
    const { data: existing } = await supabase
      .from("system_settings")
      .select("id")
      .eq("key", key)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("system_settings")
        .update({ value, updated_by: user?.id })
        .eq("key", key);
    } else {
      await supabase
        .from("system_settings")
        .insert({ key, value, description, updated_by: user?.id });
    }
  };

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting("site_name", siteName, "网站名称"),
        saveSetting("site_description", siteDescription, "网站描述"),
        saveSetting("contact_email", contactEmail, "联系邮箱"),
        saveSetting("contact_phone", contactPhone, "联系电话"),
      ]);
      toast({ title: "保存成功" });
    } catch (error) {
      toast({ title: "保存失败", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFeatures = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting("enable_registration", enableRegistration, "允许用户注册"),
        saveSetting("enable_comments", enableComments, "允许评论"),
        saveSetting("enable_orders", enableOrders, "允许下单"),
        saveSetting("maintenance_mode", maintenanceMode, "维护模式"),
      ]);
      toast({ title: "保存成功" });
    } catch (error) {
      toast({ title: "保存失败", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting("email_notifications", emailNotifications, "邮件通知"),
        saveSetting("order_notifications", orderNotifications, "订单通知"),
        saveSetting("consultation_notifications", consultationNotifications, "咨询通知"),
      ]);
      toast({ title: "保存成功" });
    } catch (error) {
      toast({ title: "保存失败", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">加载中...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">系统设置</h2>
        <p className="text-muted-foreground">平台配置与维护</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="w-4 h-4" />
            基础设置
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Settings className="w-4 h-4" />
            功能开关
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            通知设置
          </TabsTrigger>
          <TabsTrigger value="info" className="gap-2">
            <Shield className="w-4 h-4" />
            系统信息
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>基础信息</CardTitle>
              <CardDescription>配置网站基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>网站名称</Label>
                  <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>联系邮箱</Label>
                  <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="admin@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>网站描述</Label>
                <Textarea value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>联系电话</Label>
                <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="400-xxx-xxxx" />
              </div>
              <div className="flex justify-end">
                <Button variant="hero" onClick={handleSaveGeneral} disabled={saving}>
                  <Save className="w-4 h-4" />
                  {saving ? "保存中..." : "保存设置"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>功能开关</CardTitle>
              <CardDescription>控制平台功能模块</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>用户注册</Label>
                  <p className="text-sm text-muted-foreground">允许新用户注册账号</p>
                </div>
                <Switch checked={enableRegistration} onCheckedChange={setEnableRegistration} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>评论功能</Label>
                  <p className="text-sm text-muted-foreground">允许用户发表评论</p>
                </div>
                <Switch checked={enableComments} onCheckedChange={setEnableComments} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>订单功能</Label>
                  <p className="text-sm text-muted-foreground">允许用户下单购买</p>
                </div>
                <Switch checked={enableOrders} onCheckedChange={setEnableOrders} />
              </div>
              <div className="flex items-center justify-between border-t pt-6">
                <div>
                  <Label className="text-destructive">维护模式</Label>
                  <p className="text-sm text-muted-foreground">开启后普通用户无法访问</p>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>
              <div className="flex justify-end">
                <Button variant="hero" onClick={handleSaveFeatures} disabled={saving}>
                  <Save className="w-4 h-4" />
                  {saving ? "保存中..." : "保存设置"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>通知设置</CardTitle>
              <CardDescription>配置系统通知方式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>邮件通知</Label>
                  <p className="text-sm text-muted-foreground">通过邮件发送系统通知</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>订单通知</Label>
                  <p className="text-sm text-muted-foreground">新订单时通知管理员</p>
                </div>
                <Switch checked={orderNotifications} onCheckedChange={setOrderNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>咨询通知</Label>
                  <p className="text-sm text-muted-foreground">新咨询预约时通知管理员</p>
                </div>
                <Switch checked={consultationNotifications} onCheckedChange={setConsultationNotifications} />
              </div>
              <div className="flex justify-end">
                <Button variant="hero" onClick={handleSaveNotifications} disabled={saving}>
                  <Save className="w-4 h-4" />
                  {saving ? "保存中..." : "保存设置"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>系统信息</CardTitle>
              <CardDescription>平台运行状态</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">平台版本</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">系统状态</span>
                  <span className="text-primary font-medium">运行正常</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">最后更新</span>
                  <span className="font-medium">{new Date().toLocaleDateString("zh-CN")}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">数据库状态</span>
                  <span className="text-primary font-medium">连接正常</span>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={fetchSettings}>
                  <RefreshCw className="w-4 h-4" />
                  刷新状态
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
