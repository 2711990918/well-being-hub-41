import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, MoreVertical, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Database } from "@/integrations/supabase/types";

type Article = Database["public"]["Tables"]["articles"]["Row"];

const ArticlesManagement = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("general");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");
  const [readTime, setReadTime] = useState("5");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast({
        title: "获取文章失败",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setExcerpt("");
    setCategory("general");
    setCoverImage("");
    setTags("");
    setReadTime("5");
    setIsPublished(false);
    setEditingArticle(null);
  };

  const handleEdit = (article: Article) => {
    setTitle(article.title);
    setContent(article.content);
    setExcerpt(article.excerpt || "");
    setCategory(article.category);
    setCoverImage(article.cover_image || "");
    setTags(article.tags?.join(", ") || "");
    setReadTime(article.read_time?.toString() || "5");
    setIsPublished(article.is_published ?? false);
    setEditingArticle(article);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: "请填写标题和内容", variant: "destructive" });
      return;
    }

    try {
      const data = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || null,
        category,
        cover_image: coverImage.trim() || null,
        tags: tags ? tags.split(",").map(t => t.trim()) : [],
        read_time: parseInt(readTime) || 5,
        is_published: isPublished,
        author_id: user!.id,
      };

      if (editingArticle) {
        const { error } = await supabase
          .from("articles")
          .update(data)
          .eq("id", editingArticle.id);
        if (error) throw error;
        toast({ title: "更新成功" });
      } else {
        const { error } = await supabase
          .from("articles")
          .insert(data);
        if (error) throw error;
        toast({ title: "创建成功" });
      }

      setDialogOpen(false);
      resetForm();
      fetchArticles();
    } catch (error) {
      console.error("Error saving article:", error);
      toast({ title: "保存失败", variant: "destructive" });
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from("articles")
        .update({ is_published: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast({ title: currentStatus ? "已取消发布" : "已发布" });
      fetchArticles();
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast({ title: "操作失败", variant: "destructive" });
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm("确定要删除这篇文章吗？")) return;
    
    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "文章已删除" });
      fetchArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({ title: "删除失败", variant: "destructive" });
    }
  };

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryLabels: Record<string, string> = {
    nutrition: "营养膳食",
    fitness: "运动健身",
    tcm: "中医养生",
    mental: "心理健康",
    sleep: "睡眠调理",
    chronic: "慢病管理",
    general: "综合",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">资讯管理</h2>
          <p className="text-muted-foreground">管理健康养生文章</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="hero">
              <Plus className="w-4 h-4" />
              添加文章
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingArticle ? "编辑文章" : "添加文章"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>标题 *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="文章标题" />
                </div>
                <div className="space-y-2">
                  <Label>分类</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">综合</SelectItem>
                      <SelectItem value="nutrition">营养膳食</SelectItem>
                      <SelectItem value="fitness">运动健身</SelectItem>
                      <SelectItem value="tcm">中医养生</SelectItem>
                      <SelectItem value="mental">心理健康</SelectItem>
                      <SelectItem value="sleep">睡眠调理</SelectItem>
                      <SelectItem value="chronic">慢病管理</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>摘要</Label>
                <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="文章摘要" rows={2} />
              </div>
              <div className="space-y-2">
                <Label>内容 *</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="文章内容" rows={10} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>封面图片URL</Label>
                  <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="图片链接" />
                </div>
                <div className="space-y-2">
                  <Label>阅读时间 (分钟)</Label>
                  <Input type="number" value={readTime} onChange={(e) => setReadTime(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>标签 (用逗号分隔)</Label>
                <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="健康, 养生, 运动..." />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                <Label>立即发布</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>取消</Button>
                <Button variant="hero" onClick={handleSave}>保存</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索文章..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">{articles.length} 篇文章</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">暂无文章</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>阅读量</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {article.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categoryLabels[article.category] || article.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {article.is_published ? (
                        <Badge className="bg-primary">已发布</Badge>
                      ) : (
                        <Badge variant="secondary">草稿</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {article.views_count || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(article.created_at).toLocaleDateString("zh-CN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(article)}>
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => togglePublish(article.id, article.is_published)}
                          >
                            {article.is_published ? "取消发布" : "发布"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteArticle(article.id)}
                            className="text-destructive"
                          >
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticlesManagement;
