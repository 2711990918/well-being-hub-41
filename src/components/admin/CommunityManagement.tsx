import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, MoreVertical } from "lucide-react";
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

type CommunityPost = Database["public"]["Tables"]["community_posts"]["Row"];

const CommunityManagement = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      toast({ title: "获取社区帖子失败", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from("community_posts")
        .update({ is_published: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast({ title: currentStatus ? "已隐藏" : "已显示" });
      fetchPosts();
    } catch (error) {
      toast({ title: "操作失败", variant: "destructive" });
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("确定要删除这个帖子吗？")) return;
    try {
      const { error } = await supabase.from("community_posts").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "帖子已删除" });
      fetchPosts();
    } catch (error) {
      toast({ title: "删除失败", variant: "destructive" });
    }
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">社区管理</h2>
        <p className="text-muted-foreground">管理用户社区帖子</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="搜索帖子..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Badge variant="secondary">{posts.length} 个帖子</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">暂无社区帖子</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>点赞</TableHead>
                  <TableHead>评论</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>发布时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                    <TableCell><Badge variant="outline">{post.category || "综合"}</Badge></TableCell>
                    <TableCell>{post.likes_count || 0}</TableCell>
                    <TableCell>{post.comments_count || 0}</TableCell>
                    <TableCell>
                      {post.is_published ? <Badge className="bg-primary">显示</Badge> : <Badge variant="secondary">隐藏</Badge>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(post.created_at).toLocaleDateString("zh-CN")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => togglePublish(post.id, post.is_published)}>
                            {post.is_published ? "隐藏" : "显示"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deletePost(post.id)} className="text-destructive">删除</DropdownMenuItem>
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

export default CommunityManagement;
