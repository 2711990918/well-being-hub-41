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

type Course = Database["public"]["Tables"]["wellness_courses"]["Row"];

const CoursesManagement = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructor, setInstructor] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("wellness_courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      toast({ title: "获取课程失败", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setInstructor("");
    setCategory("");
    setDuration("");
    setPrice("");
    setMaxParticipants("");
    setLocation("");
    setImageUrl("");
    setIsActive(true);
    setEditingCourse(null);
  };

  const handleEdit = (course: Course) => {
    setTitle(course.title);
    setDescription(course.description || "");
    setInstructor(course.instructor || "");
    setCategory(course.category);
    setDuration(course.duration_minutes?.toString() || "");
    setPrice(course.price?.toString() || "0");
    setMaxParticipants(course.max_participants?.toString() || "");
    setLocation(course.location || "");
    setImageUrl(course.image_url || "");
    setIsActive(course.is_active ?? true);
    setEditingCourse(course);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !category.trim()) {
      toast({ title: "请填写必填项", variant: "destructive" });
      return;
    }

    try {
      const data = {
        title: title.trim(),
        description: description.trim() || null,
        instructor: instructor.trim() || null,
        category: category.trim(),
        duration_minutes: duration ? parseInt(duration) : null,
        price: price ? parseFloat(price) : 0,
        max_participants: maxParticipants ? parseInt(maxParticipants) : null,
        location: location.trim() || null,
        image_url: imageUrl.trim() || null,
        is_active: isActive,
        created_by: user?.id,
      };

      if (editingCourse) {
        const { error } = await supabase.from("wellness_courses").update(data).eq("id", editingCourse.id);
        if (error) throw error;
        toast({ title: "更新成功" });
      } else {
        const { error } = await supabase.from("wellness_courses").insert(data);
        if (error) throw error;
        toast({ title: "创建成功" });
      }

      setDialogOpen(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      toast({ title: "保存失败", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个课程吗？")) return;
    try {
      const { error } = await supabase.from("wellness_courses").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "删除成功" });
      fetchCourses();
    } catch (error) {
      toast({ title: "删除失败", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">课程活动</h2>
          <p className="text-muted-foreground">管理养生课程和活动</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="hero"><Plus className="w-4 h-4" />添加课程</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCourse ? "编辑课程" : "添加课程"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>课程名称 *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>分类 *</Label>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="瑜伽、冥想..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>讲师</Label>
                  <Input value={instructor} onChange={(e) => setInstructor(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>时长 (分钟)</Label>
                  <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>价格 (元)</Label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>最大人数</Label>
                  <Input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>地点</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} />
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
            <Badge variant="secondary">{courses.length} 个课程</Badge>
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
                  <TableHead>讲师</TableHead>
                  <TableHead>价格</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())).map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell><Badge variant="outline">{course.category}</Badge></TableCell>
                    <TableCell>{course.instructor || "-"}</TableCell>
                    <TableCell>{course.price ? `¥${course.price}` : "免费"}</TableCell>
                    <TableCell>
                      {course.is_active ? <Badge className="bg-primary">启用</Badge> : <Badge variant="secondary">禁用</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(course)}>编辑</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(course.id)} className="text-destructive">删除</DropdownMenuItem>
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

export default CoursesManagement;
