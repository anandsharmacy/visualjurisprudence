import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/lib/logger";

export const useUserExpertise = () => {
  const { user } = useAuth();
  const [expertise, setExpertise] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExpertise = async () => {
      if (!user) {
        setExpertise([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_expertise")
        .select("expertise")
        .eq("user_id", user.id);

      if (error) {
        logger.error("Error fetching expertise:", error);
        setExpertise([]);
      } else {
        setExpertise(data?.map((row) => row.expertise) || []);
      }
      setIsLoading(false);
    };

    fetchExpertise();
  }, [user]);

  return { expertise, isLoading };
};
