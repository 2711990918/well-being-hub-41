import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, ShoppingCart, Package, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

const Products = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const categories = ["all", ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBuy = async (product: Product) => {
    if (!user) {
      toast({ title: "请先登录", variant: "destructive" });
      return;
    }
    
    try {
      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        item_id: product.id,
        item_name: product.name,
        order_type: "product",
        total_price: product.price,
        quantity: 1,
        status: "pending",
      });
      
      if (error) throw error;
      toast({ title: "下单成功", description: "请前往订单页面完成支付" });
    } catch (error) {
      toast({ title: "下单失败", variant: "destructive" });
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
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">健康商城</h1>
          <p className="text-muted-foreground">精选养生保健产品</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索产品..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "all" ? "全部" : cat}
              </Button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>暂无产品</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                {product.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{product.category}</Badge>
                    {product.stock !== null && product.stock > 0 && (
                      <span className="text-xs text-muted-foreground">库存: {product.stock}</span>
                    )}
                  </div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                </CardHeader>
                <CardFooter className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">¥{product.price}</span>
                  <Button size="sm" onClick={() => handleBuy(product)}>
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    购买
                  </Button>
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

export default Products;
