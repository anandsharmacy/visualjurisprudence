import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  years_of_experience: number | null;
  approval_status: string;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      logger.error("Error fetching profile:", error);
      setProfile(null);
    } else {
      setProfile(data);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateYearsOfExperience = useCallback(async (years: number) => {
    if (!user || !profile) {
      toast.error("Unable to update profile");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ years_of_experience: years })
      .eq("user_id", user.id);

    if (error) {
      logger.error("Error updating profile:", error);
      toast.error("Failed to update experience");
      throw error;
    }

    setProfile((prev) => prev ? { ...prev, years_of_experience: years } : null);
    toast.success("Profile updated successfully");
  }, [user, profile]);

  const canAddCases = (profile?.years_of_experience ?? 0) > 5 && profile?.approval_status === "approved";
  const isPending = profile?.approval_status === "pending";
  const isRejected = profile?.approval_status === "rejected";

  return { profile, isLoading, canAddCases, isPending, isRejected, updateYearsOfExperience, refetch: fetchProfile };
};
