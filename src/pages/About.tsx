import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap, Building2, User, Heart, Mail, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-sage/20 via-background to-wellness-lavender/20">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">关于本项目</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Main Title Card */}
          <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-primary/10 via-background to-wellness-lavender/20">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-primary to-wellness-lavender p-8 text-center">
                <div className="w-24 h-24 mx-auto bg-background/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                  <Heart className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  心理健康管理平台
                </h1>
                <p className="text-white/80 text-lg">Mental Health Management Platform</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    一个集心理健康监测、专业咨询服务、健康知识分享于一体的综合性平台，
                    旨在为用户提供全方位的心理健康管理解决方案。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Author Info */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">设计者信息</h2>
                  <p className="text-muted-foreground">Designer Information</p>
                </div>
              </div>
              
              <div className="grid gap-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">设计者</p>
                    <p className="text-lg font-semibold text-foreground">岳郁佳</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Institution Info */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-wellness-sage/20 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-wellness-sage" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">学校信息</h2>
                  <p className="text-muted-foreground">Institution Information</p>
                </div>
              </div>
              
              <div className="grid gap-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-wellness-sage/20 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-wellness-sage" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">学校</p>
                    <p className="text-lg font-semibold text-foreground">南昌航空大学</p>
                    <p className="text-sm text-muted-foreground">Nanchang Hangkong University</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-wellness-lavender/30 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">学院</p>
                    <p className="text-lg font-semibold text-foreground">信息工程学院</p>
                    <p className="text-sm text-muted-foreground">School of Information Engineering</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Info */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-wellness-peach/30 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">项目信息</h2>
                  <p className="text-muted-foreground">Project Information</p>
                </div>
              </div>
              
              <div className="grid gap-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-wellness-peach/30 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">项目类型</p>
                    <p className="text-lg font-semibold text-foreground">毕业设计</p>
                    <p className="text-sm text-muted-foreground">Graduation Design Project</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">项目名称</p>
                    <p className="text-lg font-semibold text-foreground">心理健康管理平台</p>
                    <p className="text-sm text-muted-foreground">Mental Health Management Platform</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">平台功能</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  "健康监测",
                  "专业咨询",
                  "AI 助手",
                  "健康课程",
                  "社区交流",
                  "健康商城",
                  "饮食计划",
                  "运动计划",
                  "知识文章",
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="p-4 text-center rounded-xl bg-gradient-to-br from-primary/5 to-wellness-lavender/10 hover:from-primary/10 hover:to-wellness-lavender/20 transition-all duration-300"
                  >
                    <span className="text-foreground font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              © 2024 心理健康管理平台 - 南昌航空大学信息工程学院
            </p>
            <p className="text-muted-foreground mt-2">
              设计制作：岳郁佳
            </p>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <Button
              onClick={() => navigate("/")}
              className="bg-primary hover:bg-primary/90"
            >
              返回首页
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
