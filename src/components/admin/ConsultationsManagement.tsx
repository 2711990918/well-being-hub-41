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

type Consultation = Database["public"]["Tables"]["consultations"]["Row"];

const ConsultationsManagement = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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

  const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "待处理", variant: "secondary" },
    confirmed: { label: "已确认", variant: "default" },
    completed: { label: "已完成", variant: "outline" },
    cancelled: { label: "已取消", variant: "destructive" },
  };

  const filteredConsultations = consultations.filter((c) =>
    c.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">心理咨询</h2>
        <p className="text-muted-foreground">管理咨询预约</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="搜索主题..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Badge variant="secondary">{consultations.length} 个预约</Badge>
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
                    <TableCell>{c.consultant_name || "待分配"}</TableCell>
                    <TableCell>{c.scheduled_at ? new Date(c.scheduled_at).toLocaleString("zh-CN") : "待定"}</TableCell>
                    <TableCell>
                      <Badge variant={statusLabels[c.status]?.variant || "secondary"}>
                        {statusLabels[c.status]?.label || c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString("zh-CN")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
    </div>
  );
};

export default ConsultationsManagement;
