import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Users, MessageSquare, Heart, Plus, Send } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Database } from "@/integrations/supabase/types";

type CommunityPost = Database["public"]["Tables"]["community_posts"]["Row"];

const Community = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "" });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  const handleSubmitPost = async () => {
    if (!user) {
      toast({ title: "请先登录", variant: "destructive" });
      return;
    }
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({ title: "请填写标题和内容", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("community_posts").insert({
        user_id: user.id,
        title: newPost.title,
        content: newPost.content,
        category: newPost.category || "分享",
        is_published: true,
      });

      if (error) throw error;
      toast({ title: "发布成功" });
      setShowNewPost(false);
      setNewPost({ title: "", content: "", category: "" });
      fetchPosts();
    } catch (error) {
      toast({ title: "发布失败", variant: "destructive" });
    }
  };

  const handleLike = async (postId: string, currentLikes: number) => {
    try {
      await supabase
        .from("community_posts")
        .update({ likes_count: currentLikes + 1 })
        .eq("id", postId);
      fetchPosts();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">健康社区</h1>
            <p className="text-muted-foreground">分享健康心得，交流养生经验</p>
          </div>
          <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                发布帖子
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>发布新帖子</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>标题</Label>
                  <Input
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="输入标题..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>分类</Label>
                  <Input
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    placeholder="如：分享、求助、讨论..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>内容</Label>
                  <Textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="分享您的健康心得..."
                    rows={5}
                  />
                </div>
                <Button className="w-full" onClick={handleSubmitPost}>
                  <Send className="w-4 h-4 mr-2" />
                  发布
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>暂无帖子，来发布第一个吧！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{post.category || "分享"}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>
                </CardContent>
                <CardFooter className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id, post.likes_count || 0)}
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    {post.likes_count || 0}
                  </Button>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {post.comments_count || 0}
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Community;
