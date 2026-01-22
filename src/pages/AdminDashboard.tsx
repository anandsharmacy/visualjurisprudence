import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Scale, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users,
  Loader2,
  RefreshCw,
  UserCheck,
  UserX,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";
import { logger } from "@/lib/logger";

interface PendingUser {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  years_of_experience: number;
  approval_status: string;
  created_at: string;
  roles?: string[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, session } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminRole();
  
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allUsers, setAllUsers] = useState<PendingUser[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPendingUsers = useCallback(async () => {
    if (!session?.access_token) return;
    
    try {
      const { data, error } = await supabase.functions.invoke("admin-operations", {
        body: { action: "get_pending_users" },
      });

      if (error) throw error;
      setPendingUsers(data?.data || []);
    } catch (error) {
      logger.error("Error fetching pending users:", error);
      toast.error("Failed to fetch pending users");
    }
  }, [session?.access_token]);

  const fetchAllUsers = useCallback(async () => {
    if (!session?.access_token) return;
    
    try {
      const { data, error } = await supabase.functions.invoke("admin-operations", {
        body: { action: "get_all_users" },
      });

      if (error) throw error;
      setAllUsers(data?.data || []);
    } catch (error) {
      logger.error("Error fetching all users:", error);
      toast.error("Failed to fetch users");
    }
  }, [session?.access_token]);

  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    await Promise.all([fetchPendingUsers(), fetchAllUsers()]);
    setIsLoadingData(false);
  }, [fetchPendingUsers, fetchAllUsers]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (!adminLoading && !isAdmin && user) {
      toast.error("Admin access required");
      navigate("/dashboard");
      return;
    }

    if (isAdmin && session?.access_token) {
      loadData();
    }
  }, [user, authLoading, isAdmin, adminLoading, session?.access_token, navigate, loadData]);

  const handleApprove = async (profileId: string) => {
    setActionLoading(profileId);
    try {
      const { error } = await supabase.functions.invoke("admin-operations", {
        body: { action: "approve_user", profileId },
      });

      if (error) throw error;
      toast.success("User approved successfully");
      loadData();
    } catch (error) {
      logger.error("Error approving user:", error);
      toast.error("Failed to approve user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (profileId: string) => {
    setActionLoading(profileId);
    try {
      const { error } = await supabase.functions.invoke("admin-operations", {
        body: { action: "reject_user", profileId },
      });

      if (error) throw error;
      toast.success("User rejected");
      loadData();
    } catch (error) {
      logger.error("Error rejecting user:", error);
      toast.error("Failed to reject user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleAdmin = async (targetUserId: string, currentlyAdmin: boolean) => {
    setActionLoading(targetUserId);
    try {
      const { error } = await supabase.functions.invoke("admin-operations", {
        body: { action: "set_admin", targetUserId, isAdmin: !currentlyAdmin },
      });

      if (error) throw error;
      toast.success(currentlyAdmin ? "Admin role removed" : "Admin role granted");
      loadData();
    } catch (error) {
      logger.error("Error toggling admin:", error);
      toast.error("Failed to update admin role");
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full bg-primary text-primary-foreground py-4 px-6 shadow-lg">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Shield className="h-8 w-8 text-gold" />
            <h1 className="font-serif text-2xl font-semibold">Admin Dashboard</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoadingData}
            className="border-white/30 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingData ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="border-navy/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <span className="text-2xl font-bold text-navy">{pendingUsers.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-navy/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold text-navy">{allUsers.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-navy/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="text-2xl font-bold text-navy">
                  {allUsers.filter(u => u.approval_status === "approved").length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="pending" className="data-[state=active]:bg-navy data-[state=active]:text-white">
              Pending Approvals ({pendingUsers.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-navy data-[state=active]:text-white">
              All Users ({allUsers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card className="border-navy/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-serif text-navy">
                  <Clock className="h-5 w-5 text-gold" />
                  Users Awaiting Approval
                </CardTitle>
                <CardDescription>
                  Users with 5+ years of experience require admin approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-navy" />
                  </div>
                ) : pendingUsers.length > 0 ? (
                  <div className="space-y-3">
                    {pendingUsers.map((u) => (
                      <div
                        key={u.id}
                        className="p-4 rounded-lg border border-navy/10 bg-muted/30"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium text-navy">{u.full_name}</h4>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                            <div className="flex items-center gap-3 mt-2 text-sm">
                              <span className="text-navy font-medium">
                                {u.years_of_experience} years experience
                              </span>
                              <span className="text-muted-foreground">
                                Applied {format(new Date(u.created_at), "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(u.id)}
                              disabled={actionLoading === u.id}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              {actionLoading === u.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(u.id)}
                              disabled={actionLoading === u.id}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                    <p className="text-muted-foreground">No pending approvals</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card className="border-navy/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-serif text-navy">
                  <Users className="h-5 w-5 text-gold" />
                  All Users
                </CardTitle>
                <CardDescription>
                  Manage user accounts and admin permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-navy" />
                  </div>
                ) : allUsers.length > 0 ? (
                  <div className="space-y-3">
                    {allUsers.map((u) => {
                      const isUserAdmin = u.roles?.includes("admin");
                      const isCurrentUser = u.user_id === user?.id;
                      
                      return (
                        <div
                          key={u.id}
                          className="p-4 rounded-lg border border-navy/10 bg-muted/30"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-navy">{u.full_name}</h4>
                                {isUserAdmin && (
                                  <Badge className="bg-purple-100 text-purple-700">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Admin
                                  </Badge>
                                )}
                                {isCurrentUser && (
                                  <Badge variant="outline" className="text-xs">You</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{u.email}</p>
                              <div className="flex items-center gap-3 mt-2 text-sm">
                                <span>{u.years_of_experience} years</span>
                                {getStatusBadge(u.approval_status)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {u.approval_status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(u.id)}
                                    disabled={actionLoading === u.id || actionLoading === u.user_id}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReject(u.id)}
                                    disabled={actionLoading === u.id || actionLoading === u.user_id}
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              {!isCurrentUser && u.approval_status === "approved" && (
                                <Button
                                  size="sm"
                                  variant={isUserAdmin ? "outline" : "secondary"}
                                  onClick={() => handleToggleAdmin(u.user_id, isUserAdmin)}
                                  disabled={actionLoading === u.user_id}
                                >
                                  {actionLoading === u.user_id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : isUserAdmin ? (
                                    "Remove Admin"
                                  ) : (
                                    <>
                                      <Crown className="h-4 w-4 mr-1" />
                                      Make Admin
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
