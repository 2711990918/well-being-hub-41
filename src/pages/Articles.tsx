import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Eye, Clock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Article {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  cover_image: string | null;
  views_count: number | null;
  read_time: number | null;
  created_at: string;
  tags: string[] | null;
}

const categoryLabels: Record<string, string> = {
  nutrition: "营养健康",
  exercise: "运动健身",
  mental: "心理健康",
  chronic: "慢病管理",
  elderly: "老年养生",
  tcm: "中医养生",
};

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async (articleId: string) => {
    await supabase
      .from("articles")
      .update({ views_count: (articles.find(a => a.id === articleId)?.views_count || 0) + 1 })
      .eq("id", articleId);
  };

  const handleReadArticle = (article: Article) => {
    setSelectedArticle(article);
    incrementViewCount(article.id);
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => setSelectedArticle(null)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回文章列表
          </Button>

          <article className="prose prose-lg max-w-none">
            {selectedArticle.cover_image && (
              <img
                src={selectedArticle.cover_image}
                alt={selectedArticle.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            
            <Badge className="mb-4">{categoryLabels[selectedArticle.category] || selectedArticle.category}</Badge>
            
            <h1 className="text-3xl font-display font-bold text-foreground mb-4">
              {selectedArticle.title}
            </h1>

            <div className="flex items-center gap-4 text-muted-foreground mb-8">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(selectedArticle.created_at).toLocaleDateString("zh-CN")}
              </span>
              {selectedArticle.read_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedArticle.read_time} 分钟阅读
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {selectedArticle.views_count || 0} 次阅读
              </span>
            </div>

            <div 
              className="text-foreground leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
            />

            {selectedArticle.tags && selectedArticle.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </article>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">健康资讯</h1>
          <p className="text-muted-foreground">浏览最新的健康养生文章和资讯</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索文章..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              全部
            </Button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">加载中...</div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">暂无文章</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card 
                key={article.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                onClick={() => handleReadArticle(article)}
              >
                {article.cover_image && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={article.cover_image}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      {categoryLabels[article.category] || article.category}
                    </Badge>
                    {article.read_time && (
                      <span className="text-xs text-muted-foreground">
                        {article.read_time} 分钟
                      </span>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 text-lg">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {article.excerpt || article.content.slice(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(article.created_at).toLocaleDateString("zh-CN")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {article.views_count || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Articles;
