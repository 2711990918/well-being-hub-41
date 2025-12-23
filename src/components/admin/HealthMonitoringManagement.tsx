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

type HealthMonitoring = Database["public"]["Tables"]["health_monitoring"]["Row"];

const HealthMonitoringManagement = () => {
  const [records, setRecords] = useState<HealthMonitoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("health_monitoring")
        .select("*")
        .order("record_date", { ascending: false })
        .limit(100);

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching health monitoring:", error);
      toast({ title: "获取健康监测数据失败", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">健康监测</h2>
        <p className="text-muted-foreground">查看用户健康数据记录</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="搜索..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Badge variant="secondary">{records.length} 条记录</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">暂无健康监测数据</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日期</TableHead>
                  <TableHead>血压</TableHead>
                  <TableHead>心率</TableHead>
                  <TableHead>血糖</TableHead>
                  <TableHead>睡眠</TableHead>
                  <TableHead>饮水</TableHead>
                  <TableHead>步数</TableHead>
                  <TableHead>心情</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.record_date).toLocaleDateString("zh-CN")}</TableCell>
                    <TableCell>
                      {record.blood_pressure_systolic && record.blood_pressure_diastolic
                        ? `${record.blood_pressure_systolic}/${record.blood_pressure_diastolic}`
                        : "-"}
                    </TableCell>
                    <TableCell>{record.heart_rate ? `${record.heart_rate} bpm` : "-"}</TableCell>
                    <TableCell>{record.blood_sugar ? `${record.blood_sugar} mmol/L` : "-"}</TableCell>
                    <TableCell>{record.sleep_hours ? `${record.sleep_hours}h` : "-"}</TableCell>
                    <TableCell>{record.water_intake ? `${record.water_intake}ml` : "-"}</TableCell>
                    <TableCell>{record.steps || "-"}</TableCell>
                    <TableCell>{record.mood || "-"}</TableCell>
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

export default HealthMonitoringManagement;
