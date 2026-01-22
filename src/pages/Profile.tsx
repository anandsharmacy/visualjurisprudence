import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserExpertise } from "@/hooks/useUserExpertise";
import { useUserActivity } from "@/hooks/useUserActivity";
import { 
  ArrowLeft, 
  User, 
  Briefcase, 
  Scale, 
  Calendar, 
  Mail, 
  Award,
  BookOpen,
  Loader2,
  Pencil,
  Save,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { format } from "date-fns";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading, updateYearsOfExperience, refetch: refetchProfile } = useUserProfile();
  const { expertise, isLoading: expertiseLoading } = useUserExpertise();
  const { userCases, isLoading: activityLoading } = useUserActivity();

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editYears, setEditYears] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name);
      setEditYears(String(profile.years_of_experience ?? 0));
    }
  }, [profile]);

  const getExperienceLabel = (years: number | null | undefined) => {
    if (years === null || years === undefined) return "New Member";
    if (years <= 2) return "Associate";
    if (years <= 5) return "Mid-Level";
    if (years <= 10) return "Senior";
    if (years <= 20) return "Expert";
    return "Distinguished";
  };

  const getTierColor = (years: number | null | undefined) => {
    if (years === null || years === undefined) return "bg-muted text-muted-foreground";
    if (years <= 2) return "bg-slate-100 text-slate-700";
    if (years <= 5) return "bg-blue-100 text-blue-700";
    if (years <= 10) return "bg-emerald-100 text-emerald-700";
    if (years <= 20) return "bg-amber-100 text-amber-700";
    return "bg-purple-100 text-purple-700";
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    
    setIsSaving(true);
    try {
      const numYears = parseInt(editYears, 10);
      
      // Update name if changed
      if (editName !== profile.full_name) {
        const { error } = await supabase
          .from("profiles")
          .update({ full_name: editName })
          .eq("user_id", user.id);
        
        if (error) {
          logger.error("Error updating name:", error);
          throw error;
        }
      }

      // Update years if changed
      if (numYears !== profile.years_of_experience) {
        await updateYearsOfExperience(numYears);
      } else if (editName !== profile.full_name) {
        // If only name changed, show success
        toast.success("Profile updated successfully");
      }

      await refetchProfile();
      setIsEditing(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(profile?.full_name ?? "");
    setEditYears(String(profile?.years_of_experience ?? 0));
    setIsEditing(false);
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full bg-primary text-primary-foreground py-4 px-6 shadow-lg">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Scale className="h-8 w-8 text-gold" />
            <h1 className="font-serif text-2xl font-semibold">My Profile</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Profile Card */}
        <Card className="border-navy/10">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-navy/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-navy" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-serif text-navy">
                    {profile?.full_name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </CardDescription>
                </div>
              </div>
              <Badge className={`text-sm px-3 py-1 ${getTierColor(profile?.years_of_experience)}`}>
                <Award className="h-3.5 w-3.5 mr-1.5" />
                {getExperienceLabel(profile?.years_of_experience)}
              </Badge>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-navy font-medium">Full Name</Label>
                    <Input
                      id="name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border-navy/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="years" className="text-navy font-medium">Years of Experience</Label>
                    <Input
                      id="years"
                      type="number"
                      min="0"
                      max="60"
                      value={editYears}
                      onChange={(e) => setEditYears(e.target.value)}
                      className="border-navy/20"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {parseInt(editYears) > 5 
                    ? "✓ You can add new cases to the database" 
                    : "Note: 5+ years of experience required to add cases"}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-navy hover:bg-navy/90"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Briefcase className="h-5 w-5 text-gold" />
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-medium text-navy">
                        {profile?.years_of_experience ?? 0} {profile?.years_of_experience === 1 ? 'year' : 'years'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-5 w-5 text-gold" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium text-navy">
                        {profile?.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : "—"}
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                  className="border-navy/20 text-navy hover:bg-navy/5"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expertise Areas */}
        <Card className="border-navy/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-serif text-navy">
              <BookOpen className="h-5 w-5 text-gold" />
              Areas of Expertise
            </CardTitle>
            <CardDescription>
              Your legal specializations selected during registration
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expertiseLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading expertise...
              </div>
            ) : expertise.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {expertise.map((exp) => (
                  <Badge 
                    key={exp} 
                    variant="secondary" 
                    className="bg-navy/10 text-navy border-navy/20 px-3 py-1"
                  >
                    {exp}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No expertise areas selected</p>
            )}
          </CardContent>
        </Card>

        {/* Activity History */}
        <Card className="border-navy/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-serif text-navy">
              <Scale className="h-5 w-5 text-gold" />
              Cases Added by You
            </CardTitle>
            <CardDescription>
              Your contributions to the legal case database
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading activity...
              </div>
            ) : userCases.length > 0 ? (
              <div className="space-y-3">
                {userCases.map((c) => (
                  <div 
                    key={c.id} 
                    className="p-4 rounded-lg border border-navy/10 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-navy truncate">{c.name}</h4>
                        <p className="text-sm text-muted-foreground">{c.citation}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {c.court}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={
                            c.verdict === "Allowed" 
                              ? "bg-emerald-100 text-emerald-700" 
                              : c.verdict === "Dismissed" 
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }
                        >
                          {c.verdict}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{c.year}</span>
                      <span>•</span>
                      <span>Added {format(new Date(c.created_at), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Scale className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">You haven't added any cases yet</p>
                {(profile?.years_of_experience ?? 0) > 5 && (
                  <Button 
                    variant="link" 
                    onClick={() => navigate("/dashboard")}
                    className="text-navy mt-2"
                  >
                    Go to Dashboard to add a case
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
