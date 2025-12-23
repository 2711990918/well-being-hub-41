import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, MoreVertical, Eye, UserPlus, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

type Consultation = Database["public"]["Tables"]["consultations"]["Row"];

const ConsultationsManagement = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [consultantName, setConsultantName] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from("consultations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error("Error fetching consultations:", error);
      toast({ title: "获取咨询记录失败", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("consultations")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "状态已更新" });
      fetchConsultations();
    } catch (error) {
      toast({ title: "更新失败", variant: "destructive" });
    }
  };

  const handleViewDetails = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setNotes(consultation.notes || "");
    setDetailsOpen(true);
  };

  const handleAssign = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setConsultantName(consultation.consultant_name || "");
    setScheduledAt(consultation.scheduled_at ? consultation.scheduled_at.slice(0, 16) : "");
    setAssignOpen(true);
  };

  const saveAssignment = async () => {
    if (!selectedConsultation) return;
    
    try {
      const { error } = await supabase
        .from("consultations")
        .update({
          consultant_name: consultantName.trim() || null,
          scheduled_at: scheduledAt || null,
          status: consultantName.trim() ? "confirmed" : selectedConsultation.status,
        })
        .eq("id", selectedConsultation.id);

      if (error) throw error;
      toast({ title: "分配成功" });
      setAssignOpen(false);
      fetchConsultations();
    } catch (error) {
      toast({ title: "分配失败", variant: "destructive" });
    }
  };

  const saveNotes = async () => {
    if (!selectedConsultation) return;
    
    try {
      const { error } = await supabase
        .from("consultations")
        .update({ notes: notes.trim() || null })
        .eq("id", selectedConsultation.id);

      if (error) throw error;
      toast({ title: "备注已保存" });
      setDetailsOpen(false);
      fetchConsultations();
    } catch (error) {
      toast({ title: "保存失败", variant: "destructive" });
    }
  };

  const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "待处理", variant: "secondary" },
    confirmed: { label: "已确认", variant: "default" },
    completed: { label: "已完成", variant: "outline" },
    cancelled: { label: "已取消", variant: "destructive" },
  };

  const filteredConsultations = consultations.filter((c) => {
    const matchesSearch = c.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.consultant_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = consultations.filter(c => c.status === "pending").length;
  const confirmedCount = consultations.filter(c => c.status === "confirmed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">心理咨询</h2>
          <p className="text-muted-foreground">管理咨询预约</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            待处理: {pendingCount}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            已确认: {confirmedCount}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="搜索主题或咨询师..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="confirmed">已确认</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filteredConsultations.length} 个预约</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : filteredConsultations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">暂无咨询预约</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>主题</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>咨询师</TableHead>
                  <TableHead>预约时间</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsultations.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.topic}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {c.description || "-"}
                    </TableCell>
                    <TableCell>
                      {c.consultant_name || (
                        <span className="text-muted-foreground italic">待分配</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.scheduled_at ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(c.scheduled_at).toLocaleString("zh-CN")}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">待定</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusLabels[c.status]?.variant || "secondary"}>
                        {statusLabels[c.status]?.label || c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString("zh-CN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(c)}>
                            <Eye className="w-4 h-4 mr-2" />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssign(c)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            分配咨询师
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(c.id, "confirmed")}>确认预约</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(c.id, "completed")}>标记完成</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(c.id, "cancelled")} className="text-destructive">取消</DropdownMenuItem>
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

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>咨询详情</DialogTitle>
          </DialogHeader>
          {selectedConsultation && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">主题</Label>
                  <p className="font-medium">{selectedConsultation.topic}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">状态</Label>
                  <p>
                    <Badge variant={statusLabels[selectedConsultation.status]?.variant}>
                      {statusLabels[selectedConsultation.status]?.label}
                    </Badge>
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">描述</Label>
                <p className="text-sm">{selectedConsultation.description || "无"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">咨询师</Label>
                  <p>{selectedConsultation.consultant_name || "待分配"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">预约时间</Label>
                  <p>{selectedConsultation.scheduled_at ? new Date(selectedConsultation.scheduled_at).toLocaleString("zh-CN") : "待定"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>管理员备注</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="添加备注..." />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>关闭</Button>
                <Button variant="hero" onClick={saveNotes}>保存备注</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>分配咨询师</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>咨询师姓名</Label>
              <Input value={consultantName} onChange={(e) => setConsultantName(e.target.value)} placeholder="输入咨询师姓名" />
            </div>
            <div className="space-y-2">
              <Label>预约时间</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssignOpen(false)}>取消</Button>
              <Button variant="hero" onClick={saveAssignment}>确认分配</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsultationsManagement;
