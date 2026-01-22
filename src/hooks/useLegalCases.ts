import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface LegalCase {
  id: string;
  name: string;
  citation: string;
  year: number;
  court: string;
  verdict: string;
  summary: string;
  tags: string[];
  created_by: string | null;
  created_at: string;
  precedent_strength: number | null;
  citation_risk: string | null;
  outcome_alignment: string | null;
  ratio_decidendi: string | null;
  cited_by_count: number | null;
}

export const useLegalCases = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCases = async () => {
    const { data, error } = await supabase
      .from("legal_cases")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cases:", error);
      toast.error("Failed to load cases");
    } else {
      setCases(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchCases();
    }
  }, [user]);

  const addCase = async (caseData: {
    name: string;
    citation: string;
    year: number;
    court: string;
    verdict: string;
    summary: string;
    tags?: string[];
  }) => {
    if (!user) {
      toast.error("You must be logged in to add a case");
      return { error: new Error("Not authenticated") };
    }

    const { data, error } = await supabase.from("legal_cases").insert({
      ...caseData,
      tags: caseData.tags || [],
      created_by: user.id,
    }).select().single();

    if (error) {
      console.error("Error adding case:", error);
      toast.error("Failed to add case");
      return { error };
    }

    setCases((prev) => [data, ...prev]);
    return { error: null, data };
  };

  return { cases, isLoading, addCase, refetch: fetchCases };
};
