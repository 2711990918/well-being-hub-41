import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Database } from "@/integrations/supabase/types";

type ChronicDisease = Database["public"]["Tables"]["chronic_diseases"]["Row"];

const ChronicDiseasesManagement = () => {
  const [records, setRecords] = useState<ChronicDisease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("chronic_diseases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching chronic diseases:", error);
      toast({ title: "获取慢病记录失败", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((r) =>
    r.disease_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">慢病管理</h2>
        <p className="text-muted-foreground">查看用户慢性病记录</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="搜索疾病名称..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Badge variant="secondary">{records.length} 条记录</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">暂无慢病记录</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>疾病名称</TableHead>
                  <TableHead>诊断日期</TableHead>
                  <TableHead>当前状态</TableHead>
                  <TableHead>用药</TableHead>
                  <TableHead>下次复查</TableHead>
                  <TableHead>创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.disease_name}</TableCell>
                    <TableCell>{record.diagnosis_date ? new Date(record.diagnosis_date).toLocaleDateString("zh-CN") : "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.current_status || "未知"}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{record.medications?.join(", ") || "-"}</TableCell>
                    <TableCell>{record.next_checkup ? new Date(record.next_checkup).toLocaleDateString("zh-CN") : "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(record.created_at).toLocaleDateString("zh-CN")}</TableCell>
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

export default ChronicDiseasesManagement;
