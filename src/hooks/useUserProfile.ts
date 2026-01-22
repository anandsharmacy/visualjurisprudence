import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/lib/logger";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  years_of_experience: number | null;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
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
    };

    fetchProfile();
  }, [user]);

  const canAddCases = (profile?.years_of_experience ?? 0) > 5;

  return { profile, isLoading, canAddCases };
};
