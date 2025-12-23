import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Eye, Trash2, Plus, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Article = Database["public"]["Tables"]["articles"]["Row"];
type ArticleInsert = Database["public"]["Tables"]["articles"]["Insert"];



const categories = [
  { value: "nutrition", label: "营养膳食" },
  { value: "fitness", label: "运动健身" },
  { value: "tcm", label: "中医养生" },
  { value: "mental", label: "心理健康" },
  { value: "sleep", label: "睡眠调理" },
  { value: "chronic", label: "慢病管理" },
];

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("nutrition");
  const [coverImage, setCoverImage] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchArticles();
    }
  }, [user]);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("author_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast({
        title: "获取文章失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setExcerpt("");
    setContent("");
    setCategory("nutrition");
    setCoverImage("");
    setIsPublished(false);
    setEditingArticle(null);
  };

  const handleNewArticle = () => {
    resetForm();
    setShowEditor(true);
  };

  const handleEditArticle = (article: Article) => {
    setTitle(article.title);
    setExcerpt(article.excerpt || "");
    setContent(article.content);
    setCategory(article.category);
    setCoverImage(article.cover_image || "");
    setIsPublished(article.is_published);
    setEditingArticle(article);
    setShowEditor(true);
  };

  const handleSaveArticle = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "请填写必填项",
        description: "标题和内容不能为空",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const articleData: ArticleInsert = {
        title: title.trim(),
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        category,
        cover_image: coverImage.trim() || null,
        is_published: isPublished,
        author_id: user!.id,
        read_time: Math.ceil(content.length / 500),
      };

      if (editingArticle) {
        const { error } = await supabase
          .from("articles")
          .update(articleData)
          .eq("id", editingArticle.id);

        if (error) throw error;
        toast({
          title: "更新成功",
          description: "文章已保存",
        });
      } else {
        const { error } = await supabase
          .from("articles")
          .insert(articleData);

        if (error) throw error;
        toast({
          title: "创建成功",
          description: "新文章已保存",
        });
      }

      setShowEditor(false);
      resetForm();
      fetchArticles();
    } catch (error) {
      console.error("Error saving article:", error);
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("确定要删除这篇文章吗？")) return;

    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({
        title: "删除成功",
        description: "文章已删除",
      });
      fetchArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({
        title: "删除失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Link>
            <h1 className="font-display text-xl font-semibold text-foreground">
              文章管理
            </h1>
          </div>
          <Button variant="hero" onClick={handleNewArticle}>
            <Plus className="w-4 h-4" />
            新建文章
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showEditor ? (
          /* Article Editor */
          <Card variant="wellness" className="max-w-4xl mx-auto animate-fade-up">
            <CardHeader>
              <CardTitle>
                {editingArticle ? "编辑文章" : "新建文章"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">标题 *</Label>
                <Input
                  id="title"
                  placeholder="请输入文章标题"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">摘要</Label>
                <Textarea
                  id="excerpt"
                  placeholder="请输入文章摘要（可选）"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">分类</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverImage">封面图片URL</Label>
                  <Input
                    id="coverImage"
                    placeholder="请输入图片链接"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">内容 *</Label>
                <Textarea
                  id="content"
                  placeholder="请输入文章内容"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="published"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                  <Label htmlFor="published">发布文章</Label>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowEditor(false);
                      resetForm();
                    }}
                  >
                    取消
                  </Button>
                  <Button 
                    variant="hero" 
                    onClick={handleSaveArticle}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "保存中..." : "保存"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Articles List */
          <div className="space-y-6">
            {articles.length === 0 ? (
              <Card variant="wellness" className="text-center py-12">
                <CardContent>
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">还没有文章，开始创作吧！</p>
                  <Button variant="hero" onClick={handleNewArticle}>
                    <Plus className="w-4 h-4" />
                    新建文章
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {articles.map((article) => (
                  <Card 
                    key={article.id} 
                    variant="wellness" 
                    className="animate-fade-up"
                  >
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {article.title}
                          </h3>
                          {article.is_published ? (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                              已发布
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                              草稿
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {categories.find(c => c.value === article.category)?.label || article.category}
                          {" · "}
                          {new Date(article.created_at).toLocaleDateString("zh-CN")}
                          {" · "}
                          {article.views_count} 阅读
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditArticle(article)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteArticle(article.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
