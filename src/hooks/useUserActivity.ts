import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/lib/logger";

export interface UserCase {
  id: string;
  name: string;
  citation: string;
  year: number;
  court: string;
  verdict: string;
  created_at: string;
}

export const useUserActivity = () => {
  const { user } = useAuth();
  const [userCases, setUserCases] = useState<UserCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserCases = useCallback(async () => {
    if (!user) {
      setUserCases([]);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("legal_cases")
      .select("id, name, citation, year, court, verdict, created_at")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching user cases:", error);
      setUserCases([]);
    } else {
      setUserCases(data || []);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchUserCases();
  }, [fetchUserCases]);

  return { userCases, isLoading, refetch: fetchUserCases };
};
