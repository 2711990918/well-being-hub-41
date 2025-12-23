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
import { Search, Plus, MoreVertical } from "lucide-react";
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

type ExercisePlan = Database["public"]["Tables"]["exercise_plans"]["Row"];

const ExercisePlansManagement = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<ExercisePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ExercisePlan | null>(null);
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [category, setCategory] = useState("cardio");
  const [duration, setDuration] = useState("");
  const [caloriesBurn, setCaloriesBurn] = useState("");
  const [equipment, setEquipment] = useState("");
  const [steps, setSteps] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("exercise_plans")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Error fetching exercise plans:", error);
      toast({ title: "获取运动计划失败", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDifficulty("beginner");
    setCategory("cardio");
    setDuration("");
    setCaloriesBurn("");
    setEquipment("");
    setSteps("");
    setImageUrl("");
    setIsActive(true);
    setEditingPlan(null);
  };

  const handleEdit = (plan: ExercisePlan) => {
    setTitle(plan.title);
    setDescription(plan.description || "");
    setDifficulty(plan.difficulty);
    setCategory(plan.category);
    setDuration(plan.duration_minutes?.toString() || "");
    setCaloriesBurn(plan.calories_burn?.toString() || "");
    setEquipment(plan.equipment?.join(", ") || "");
    setSteps(plan.steps?.join("\n") || "");
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
        difficulty,
        category,
        duration_minutes: duration ? parseInt(duration) : null,
        calories_burn: caloriesBurn ? parseInt(caloriesBurn) : null,
        equipment: equipment ? equipment.split(",").map(s => s.trim()) : [],
        steps: steps ? steps.split("\n").filter(s => s.trim()) : [],
        image_url: imageUrl.trim() || null,
        is_active: isActive,
        created_by: user?.id,
      };

      if (editingPlan) {
        const { error } = await supabase.from("exercise_plans").update(data).eq("id", editingPlan.id);
        if (error) throw error;
        toast({ title: "更新成功" });
      } else {
        const { error } = await supabase.from("exercise_plans").insert(data);
        if (error) throw error;
        toast({ title: "创建成功" });
      }

      setDialogOpen(false);
      resetForm();
      fetchPlans();
    } catch (error) {
      console.error("Error saving exercise plan:", error);
      toast({ title: "保存失败", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个运动计划吗？")) return;
    try {
      const { error } = await supabase.from("exercise_plans").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "删除成功" });
      fetchPlans();
    } catch (error) {
      toast({ title: "删除失败", variant: "destructive" });
    }
  };

  const difficultyLabels: Record<string, string> = {
    beginner: "入门",
    intermediate: "中级",
    advanced: "高级",
  };

  const categoryLabels: Record<string, string> = {
    cardio: "有氧运动",
    strength: "力量训练",
    yoga: "瑜伽",
    flexibility: "柔韧性",
    hiit: "高强度间歇",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">运动计划</h2>
          <p className="text-muted-foreground">管理健身运动方案</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="hero"><Plus className="w-4 h-4" />添加计划</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "编辑运动计划" : "添加运动计划"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>标题 *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="计划名称" />
                </div>
                <div className="space-y-2">
                  <Label>分类</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardio">有氧运动</SelectItem>
                      <SelectItem value="strength">力量训练</SelectItem>
                      <SelectItem value="yoga">瑜伽</SelectItem>
                      <SelectItem value="flexibility">柔韧性</SelectItem>
                      <SelectItem value="hiit">高强度间歇</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="简要描述" rows={2} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>难度</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">入门</SelectItem>
                      <SelectItem value="intermediate">中级</SelectItem>
                      <SelectItem value="advanced">高级</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>时长 (分钟)</Label>
                  <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>消耗热量</Label>
                  <Input type="number" value={caloriesBurn} onChange={(e) => setCaloriesBurn(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>器材 (用逗号分隔)</Label>
                <Input value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="哑铃, 瑜伽垫..." />
              </div>
              <div className="space-y-2">
                <Label>步骤 (每行一步)</Label>
                <Textarea value={steps} onChange={(e) => setSteps(e.target.value)} placeholder="第一步..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label>图片URL</Label>
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
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
                  <TableHead>分类</TableHead>
                  <TableHead>难度</TableHead>
                  <TableHead>时长</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.title}</TableCell>
                    <TableCell><Badge variant="outline">{categoryLabels[plan.category]}</Badge></TableCell>
                    <TableCell>{difficultyLabels[plan.difficulty]}</TableCell>
                    <TableCell>{plan.duration_minutes ? `${plan.duration_minutes}分钟` : "-"}</TableCell>
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

export default ExercisePlansManagement;
