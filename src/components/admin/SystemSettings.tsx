import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

const SystemSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">系统设置</h2>
        <p className="text-muted-foreground">平台配置与维护</p>
      </div>

      <div className="grid gap-6">
        <Card variant="wellness">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              基础设置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              系统设置功能开发中...
            </div>
          </CardContent>
        </Card>

        <Card variant="wellness">
          <CardHeader>
            <CardTitle>平台信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">平台版本</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">系统状态</span>
              <span className="text-primary font-medium">运行正常</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">最后更新</span>
              <span className="font-medium">{new Date().toLocaleDateString("zh-CN")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemSettings;
