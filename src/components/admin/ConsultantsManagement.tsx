import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Star, UserCheck, UserMinus } from "lucide-react";

interface Consultant {
  id: string;
  user_id: string;
  specialty: string;
  bio: string | null;
  experience_years: number;
  rating: number;
  total_consultations: number;
  is_available: boolean;
  hourly_rate: number;
  username?: string;
}

interface UserOption {
  user_id: string;
  username: string | null;
}

const ConsultantsManagement = () => {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newConsultant, setNewConsultant] = useState({
    specialty: "心理咨询",
    experience_years: 1,
    hourly_rate: 100,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchConsultants();
    fetchAvailableUsers();
  }, []);

  const fetchConsultants = async () => {
    try {
      const { data: consultantData, error } = await supabase
        .from("consultant_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (consultantData && consultantData.length > 0) {
        const userIds = consultantData.map(c => c.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, username")
          .in("user_id", userIds);

        const consultantsWithNames = consultantData.map(c => ({
          ...c,
          username: profiles?.find(p => p.user_id === c.user_id)?.username || "未设置"
        }));
        setConsultants(consultantsWithNames);
      } else {
        setConsultants([]);
      }
    } catch (error) {
      console.error("Error fetching consultants:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      // Get all profiles
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("user_id, username");

      // Get existing consultant user_ids
      const { data: existingConsultants } = await supabase
        .from("consultant_profiles")
        .select("user_id");

      const existingIds = existingConsultants?.map(c => c.user_id) || [];
      
      // Filter out users who are already consultants
      const available = allProfiles?.filter(p => !existingIds.includes(p.user_id)) || [];
      setAvailableUsers(available);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleAddConsultant = async () => {
    if (!selectedUserId) {
      toast({ title: "请选择用户", variant: "destructive" });
      return;
    }

    try {
      // Add consultant role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: selectedUserId, role: "consultant" });

      if (roleError && !roleError.message.includes("duplicate")) throw roleError;

      // Add consultant profile
      const { error: profileError } = await supabase
        .from("consultant_profiles")
        .insert({
          user_id: selectedUserId,
          specialty: newConsultant.specialty,
          experience_years: newConsultant.experience_years,
          hourly_rate: newConsultant.hourly_rate,
          is_available: true,
        });

      if (profileError) throw profileError;

      toast({ title: "添加成功", description: "已将用户设为咨询师" });
      setShowAddDialog(false);
      setSelectedUserId("");
      setNewConsultant({ specialty: "心理咨询", experience_years: 1, hourly_rate: 100 });
      fetchConsultants();
      fetchAvailableUsers();
    } catch (error) {
      console.error("Error adding consultant:", error);
      toast({ title: "添加失败", variant: "destructive" });
    }
  };

  const handleToggleAvailability = async (consultant: Consultant) => {
    try {
      const { error } = await supabase
        .from("consultant_profiles")
        .update({ is_available: !consultant.is_available })
        .eq("id", consultant.id);

      if (error) throw error;

      toast({ title: consultant.is_available ? "已暂停接单" : "已开启接单" });
      fetchConsultants();
    } catch (error) {
      toast({ title: "操作失败", variant: "destructive" });
    }
  };

  const handleRemoveConsultant = async (consultant: Consultant) => {
    if (!confirm("确定要移除该咨询师吗？")) return;

    try {
      // Remove consultant profile
      await supabase
        .from("consultant_profiles")
        .delete()
        .eq("id", consultant.id);

      // Remove consultant role
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", consultant.user_id)
        .eq("role", "consultant");

      toast({ title: "移除成功" });
      fetchConsultants();
      fetchAvailableUsers();
    } catch (error) {
      toast({ title: "移除失败", variant: "destructive" });
    }
  };

  const filteredConsultants = consultants.filter(c => 
    c.username?.includes(searchTerm) || c.specialty.includes(searchTerm)
  );

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">咨询师管理</h2>
          <p className="text-muted-foreground">管理心理咨询师团队</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加咨询师
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加咨询师</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>选择用户 *</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择要设为咨询师的用户" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map(user => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.username || user.user_id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>专业方向</Label>
                <Input
                  value={newConsultant.specialty}
                  onChange={(e) => setNewConsultant({ ...newConsultant, specialty: e.target.value })}
                  placeholder="如：心理咨询、婚姻家庭..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>从业年限</Label>
                  <Input
                    type="number"
                    value={newConsultant.experience_years}
                    onChange={(e) => setNewConsultant({ ...newConsultant, experience_years: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>时薪 (元)</Label>
                  <Input
                    type="number"
                    value={newConsultant.hourly_rate}
                    onChange={(e) => setNewConsultant({ ...newConsultant, hourly_rate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <Button className="w-full" onClick={handleAddConsultant}>
                <UserCheck className="w-4 h-4 mr-2" />
                确认添加
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="搜索咨询师..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary">{consultants.length} 名咨询师</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>咨询师</TableHead>
                <TableHead>专业方向</TableHead>
                <TableHead>从业年限</TableHead>
                <TableHead>评分</TableHead>
                <TableHead>咨询量</TableHead>
                <TableHead>时薪</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsultants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    暂无咨询师数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredConsultants.map((consultant) => (
                  <TableRow key={consultant.id}>
                    <TableCell className="font-medium">{consultant.username}</TableCell>
                    <TableCell>{consultant.specialty}</TableCell>
                    <TableCell>{consultant.experience_years} 年</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {consultant.rating}
                      </div>
                    </TableCell>
                    <TableCell>{consultant.total_consultations}</TableCell>
                    <TableCell>¥{consultant.hourly_rate}/小时</TableCell>
                    <TableCell>
                      <Badge variant={consultant.is_available ? "default" : "secondary"}>
                        {consultant.is_available ? "接单中" : "已暂停"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleAvailability(consultant)}>
                            {consultant.is_available ? "暂停接单" : "开启接单"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRemoveConsultant(consultant)}
                            className="text-destructive"
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            移除咨询师
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsultantsManagement;
