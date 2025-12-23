import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const AIAssistantManagement = () => {
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
                <p className="font-medium mb-2">模型信息</p>
                <p className="text-sm text-muted-foreground">
                  使用 Google Gemini 2.5 Flash 模型，专为健康咨询优化
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
              <p className="text-xs text-muted-foreground text-center">
                建议在首页添加AI助手入口，方便用户访问
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

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
