import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Sparkles, MessageSquare, Settings, Save, Key, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const AIAssistantManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    useCustomApi: false,
    apiUrl: "",
    apiKey: "",
    model: "google/gemini-2.5-flash",
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const { data } = await supabase
      .from("system_settings")
      .select("*")
      .eq("key", "ai_config")
      .single();
    
    if (data?.value) {
      const value = data.value as Record<string, any>;
      setConfig({
        useCustomApi: value.useCustomApi || false,
        apiUrl: value.apiUrl || "",
        apiKey: value.apiKey || "",
        model: value.model || "google/gemini-2.5-flash",
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("system_settings")
        .upsert({
          key: "ai_config",
          value: config,
          description: "AI助手配置",
        }, { onConflict: "key" });

      if (error) throw error;
      toast({ title: "保存成功", description: "AI配置已更新" });
    } catch (error) {
      toast({ title: "保存失败", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">AI助手设置</h2>
          <p className="text-muted-foreground">管理AI健康助手的配置</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI助手状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">服务状态</p>
                  <p className="text-sm text-muted-foreground">AI助手服务运行正常</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-2">当前模型</p>
                <p className="text-sm text-muted-foreground">
                  {config.useCustomApi ? "自定义API" : "Lovable AI (Google Gemini 2.5 Flash)"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              用户入口
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                用户可以通过以下链接访问AI健康助手，获取健康咨询服务。
              </p>
              <Link to="/ai-assistant">
                <Button className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  访问AI助手页面
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            API 配置
          </CardTitle>
          <CardDescription>
            配置自定义AI API接口，支持OpenAI兼容的API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">使用自定义API</p>
              <p className="text-sm text-muted-foreground">
                启用后将使用您配置的API地址和密钥
              </p>
            </div>
            <Switch
              checked={config.useCustomApi}
              onCheckedChange={(checked) => setConfig({ ...config, useCustomApi: checked })}
            />
          </div>

          {config.useCustomApi && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  API 地址
                </Label>
                <Input
                  value={config.apiUrl}
                  onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                  placeholder="https://api.openai.com/v1/chat/completions"
                />
                <p className="text-xs text-muted-foreground">
                  支持OpenAI兼容的API接口
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API Key
                </Label>
                <Input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="sk-..."
                />
              </div>

              <div className="space-y-2">
                <Label>模型名称</Label>
                <Input
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  placeholder="gpt-4o-mini"
                />
              </div>
            </div>
          )}

          <Button onClick={handleSave} disabled={loading} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            保存配置
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>功能说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">🥗 营养饮食</h4>
              <p className="text-sm text-muted-foreground">
                健康饮食搭配、营养素知识、食疗养生建议
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">🏃 运动健身</h4>
              <p className="text-sm text-muted-foreground">
                适合不同人群的运动方案和注意事项
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">💭 心理健康</h4>
              <p className="text-sm text-muted-foreground">
                压力管理、情绪调节、睡眠改善指导
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">💊 慢病管理</h4>
              <p className="text-sm text-muted-foreground">
                高血压、糖尿病等慢性病的日常管理
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">🌿 中医养生</h4>
              <p className="text-sm text-muted-foreground">
                中医养生理念、穴位保健、四季养生
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">👴 老年健康</h4>
              <p className="text-sm text-muted-foreground">
                老年人健康保健和常见问题应对
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistantManagement;