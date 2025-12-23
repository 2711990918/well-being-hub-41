import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, FileText, Apple, Dumbbell, Activity, Heart, 
  Brain, MessageSquare, Calendar, ShoppingBag, CreditCard,
  BarChart3, Settings, Menu, X, LogOut, Home,
  ChevronRight, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Admin modules
import UsersManagement from "@/components/admin/UsersManagement";
import ArticlesManagement from "@/components/admin/ArticlesManagement";
import DietPlansManagement from "@/components/admin/DietPlansManagement";
import ExercisePlansManagement from "@/components/admin/ExercisePlansManagement";
import HealthMonitoringManagement from "@/components/admin/HealthMonitoringManagement";
import ChronicDiseasesManagement from "@/components/admin/ChronicDiseasesManagement";
import ConsultationsManagement from "@/components/admin/ConsultationsManagement";
import CommunityManagement from "@/components/admin/CommunityManagement";
import CoursesManagement from "@/components/admin/CoursesManagement";
import ProductsManagement from "@/components/admin/ProductsManagement";
import OrdersManagement from "@/components/admin/OrdersManagement";
import StatisticsManagement from "@/components/admin/StatisticsManagement";
import AIAssistantManagement from "@/components/admin/AIAssistantManagement";
import SystemSettings from "@/components/admin/SystemSettings";

const menuItems = [
  { id: "users", icon: Users, label: "用户管理", description: "管理平台用户" },
  { id: "articles", icon: FileText, label: "资讯管理", description: "健康文章管理" },
  { id: "diet", icon: Apple, label: "饮食推荐", description: "健康饮食计划" },
  { id: "exercise", icon: Dumbbell, label: "运动计划", description: "健身方案管理" },
  { id: "monitoring", icon: Activity, label: "健康监测", description: "用户健康数据" },
  { id: "chronic", icon: Heart, label: "慢病管理", description: "慢性病记录" },
  { id: "consultations", icon: Brain, label: "心理咨询", description: "咨询预约管理" },
  { id: "community", icon: MessageSquare, label: "社区管理", description: "用户互动内容" },
  { id: "courses", icon: Calendar, label: "课程活动", description: "养生课程管理" },
  { id: "products", icon: ShoppingBag, label: "产品管理", description: "养生产品库" },
  { id: "orders", icon: CreditCard, label: "订单管理", description: "支付与结算" },
  { id: "statistics", icon: BarChart3, label: "数据统计", description: "数据分析报表" },
  { id: "ai-assistant", icon: Sparkles, label: "AI助手设置", description: "AI助手配置" },
  { id: "settings", icon: Settings, label: "系统设置", description: "平台配置" },
];

const Admin = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState("users");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    
    if (user) {
      checkAdminRole();
    }
  }, [user, authLoading, navigate]);

  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user!.id,
        _role: 'admin'
      });

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "访问被拒绝",
          description: "您没有管理员权限",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      
      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin role:", error);
      toast({
        title: "权限检查失败",
        description: "请稍后重试",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const renderModule = () => {
    switch (activeModule) {
      case "users":
        return <UsersManagement />;
      case "articles":
        return <ArticlesManagement />;
      case "diet":
        return <DietPlansManagement />;
      case "exercise":
        return <ExercisePlansManagement />;
      case "monitoring":
        return <HealthMonitoringManagement />;
      case "chronic":
        return <ChronicDiseasesManagement />;
      case "consultations":
        return <ConsultationsManagement />;
      case "community":
        return <CommunityManagement />;
      case "courses":
        return <CoursesManagement />;
      case "products":
        return <ProductsManagement />;
      case "orders":
        return <OrdersManagement />;
      case "statistics":
        return <StatisticsManagement />;
      case "ai-assistant":
        return <AIAssistantManagement />;
      case "settings":
        return <SystemSettings />;
      default:
        return <UsersManagement />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const currentModule = menuItems.find(item => item.id === activeModule);

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-card border-r border-border transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <span className="font-display text-lg font-semibold text-foreground">
              管理后台
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                activeModule === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-border bg-card">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <Home className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">返回首页</span>}
          </Link>
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">退出登录</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>管理后台</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{currentModule?.label}</span>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {renderModule()}
        </div>
      </main>
    </div>
  );
};

export default Admin;
