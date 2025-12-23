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
import { Search, Plus, MoreVertical, X } from "lucide-react";
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

type DietPlan = Database["public"]["Tables"]["diet_plans"]["Row"];

const DietPlansManagement = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DietPlan | null>(null);
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const [calories, setCalories] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("diet_plans")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Error fetching diet plans:", error);
      toast({ title: "获取饮食计划失败", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setMealType("breakfast");
    setCalories("");
    setIngredients("");
    setInstructions("");
    setImageUrl("");
    setIsActive(true);
    setEditingPlan(null);
  };

  const handleEdit = (plan: DietPlan) => {
    setTitle(plan.title);
    setDescription(plan.description || "");
    setMealType(plan.meal_type);
    setCalories(plan.calories?.toString() || "");
    setIngredients(plan.ingredients?.join(", ") || "");
    setInstructions(plan.instructions || "");
    setImageUrl(plan.image_url || "");
    setIsActive(plan.is_active ?? true);
    setEditingPlan(plan);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "请填写标题", variant: "destructive" });
      return;
    }

    try {
      const data = {
        title: title.trim(),
        description: description.trim() || null,
        meal_type: mealType,
        calories: calories ? parseInt(calories) : null,
        ingredients: ingredients ? ingredients.split(",").map(s => s.trim()) : [],
        instructions: instructions.trim() || null,
        image_url: imageUrl.trim() || null,
        is_active: isActive,
        created_by: user?.id,
      };

      if (editingPlan) {
        const { error } = await supabase
          .from("diet_plans")
          .update(data)
          .eq("id", editingPlan.id);
        if (error) throw error;
        toast({ title: "更新成功" });
      } else {
        const { error } = await supabase
          .from("diet_plans")
          .insert(data);
        if (error) throw error;
        toast({ title: "创建成功" });
      }

      setDialogOpen(false);
      resetForm();
      fetchPlans();
    } catch (error) {
      console.error("Error saving diet plan:", error);
      toast({ title: "保存失败", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个饮食计划吗？")) return;

    try {
      const { error } = await supabase
        .from("diet_plans")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast({ title: "删除成功" });
      fetchPlans();
    } catch (error) {
      console.error("Error deleting diet plan:", error);
      toast({ title: "删除失败", variant: "destructive" });
    }
  };

  const mealTypeLabels: Record<string, string> = {
    breakfast: "早餐",
    lunch: "午餐",
    dinner: "晚餐",
    snack: "加餐",
  };

  const filteredPlans = plans.filter((plan) =>
    plan.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">饮食推荐</h2>
          <p className="text-muted-foreground">管理健康饮食计划</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="hero">
              <Plus className="w-4 h-4" />
              添加计划
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "编辑饮食计划" : "添加饮食计划"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>标题 *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="计划名称" />
                </div>
                <div className="space-y-2">
                  <Label>餐类</Label>
                  <Select value={mealType} onValueChange={setMealType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">早餐</SelectItem>
                      <SelectItem value="lunch">午餐</SelectItem>
                      <SelectItem value="dinner">晚餐</SelectItem>
                      <SelectItem value="snack">加餐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="简要描述" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>卡路里 (kcal)</Label>
                  <Input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="热量" />
                </div>
                <div className="space-y-2">
                  <Label>图片URL</Label>
                  <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="图片链接" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>食材 (用逗号分隔)</Label>
                <Textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="鸡蛋, 西红柿, 橄榄油..." rows={2} />
              </div>
              <div className="space-y-2">
                <Label>制作步骤</Label>
                <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="详细步骤" rows={4} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label>启用</Label>
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
              <Input placeholder="搜索..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Badge variant="secondary">{plans.length} 个计划</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>餐类</TableHead>
                  <TableHead>卡路里</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.title}</TableCell>
                    <TableCell><Badge variant="outline">{mealTypeLabels[plan.meal_type]}</Badge></TableCell>
                    <TableCell>{plan.calories ? `${plan.calories} kcal` : "-"}</TableCell>
                    <TableCell>
                      {plan.is_active ? <Badge className="bg-primary">启用</Badge> : <Badge variant="secondary">禁用</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(plan)}>编辑</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(plan.id)} className="text-destructive">删除</DropdownMenuItem>
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

export default DietPlansManagement;
