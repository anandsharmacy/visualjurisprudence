import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/lib/logger";

const LOCAL_STORAGE_TAGS_KEY = "legal_viewed_tags";
const LOCAL_STORAGE_CASES_KEY = "legal_viewed_cases";
const MAX_TAGS = 20;
const MAX_VIEWED_CASES = 50;

interface ViewedTagsData {
  tags: string[];
  viewedCaseIds: string[];
}

export const useViewedTags = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ViewedTagsData>({ tags: [], viewedCaseIds: [] });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const pendingSync = useRef<{ caseId: string; tags: string[] } | null>(null);

  // Load from localStorage (fallback/cache)
  const loadFromLocalStorage = useCallback((): ViewedTagsData => {
    try {
      const storedTags = localStorage.getItem(LOCAL_STORAGE_TAGS_KEY);
      const storedCases = localStorage.getItem(LOCAL_STORAGE_CASES_KEY);
      return {
        tags: storedTags ? JSON.parse(storedTags) : [],
        viewedCaseIds: storedCases ? JSON.parse(storedCases) : [],
      };
    } catch (error) {
      logger.error("Error loading from localStorage:", error);
      return { tags: [], viewedCaseIds: [] };
    }
  }, []);

  // Save to localStorage
  const saveToLocalStorage = useCallback((newData: ViewedTagsData) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_TAGS_KEY, JSON.stringify(newData.tags));
      localStorage.setItem(LOCAL_STORAGE_CASES_KEY, JSON.stringify(newData.viewedCaseIds));
    } catch (error) {
      logger.error("Error saving to localStorage:", error);
    }
  }, []);

  // Load from database for logged-in users
  const loadFromDatabase = useCallback(async () => {
    if (!user) return null;

    try {
      const { data: historyData, error } = await supabase
        .from("user_view_history")
        .select("case_id, tags, viewed_at")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(MAX_VIEWED_CASES);

      if (error) {
        logger.error("Error loading view history from database:", error);
        return null;
      }

      if (!historyData || historyData.length === 0) {
        return { tags: [], viewedCaseIds: [] };
      }

      // Extract unique tags (most recent first) and case IDs
      const allTags: string[] = [];
      const viewedCaseIds: string[] = [];

      historyData.forEach((entry) => {
        viewedCaseIds.push(entry.case_id);
        entry.tags.forEach((tag: string) => {
          if (!allTags.includes(tag)) {
            allTags.push(tag);
          }
        });
      });

      return {
        tags: allTags.slice(0, MAX_TAGS),
        viewedCaseIds: viewedCaseIds.slice(0, MAX_VIEWED_CASES),
      };
    } catch (error) {
      logger.error("Error fetching view history:", error);
      return null;
    }
  }, [user]);

  // Sync to database
  const syncToDatabase = useCallback(async (caseId: string, tags: string[]) => {
    if (!user) return;

    try {
      // Upsert the view history entry
      const { error } = await supabase
        .from("user_view_history")
        .upsert(
          {
            user_id: user.id,
            case_id: caseId,
            tags: tags,
            viewed_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,case_id",
          }
        );

      if (error) {
        logger.error("Error syncing view to database:", error);
      }
    } catch (error) {
      logger.error("Error syncing to database:", error);
    }
  }, [user]);

  // Initialize data on mount and when user changes
  useEffect(() => {
    const initialize = async () => {
      setIsInitialized(false);

      if (user) {
        // Try to load from database first
        const dbData = await loadFromDatabase();
        if (dbData) {
          setData(dbData);
          saveToLocalStorage(dbData); // Cache locally
        } else {
          // Fallback to localStorage
          const localData = loadFromLocalStorage();
          setData(localData);
        }
      } else {
        // Not logged in - use localStorage only
        const localData = loadFromLocalStorage();
        setData(localData);
      }

      setIsInitialized(true);
    };

    initialize();
  }, [user, loadFromDatabase, loadFromLocalStorage, saveToLocalStorage]);

  // Track when a case is viewed
  const trackCaseView = useCallback((caseId: string, caseTags: string[]) => {
    setData((prev) => {
      // Add case ID to viewed list if not already present
      const updatedViewedCases = prev.viewedCaseIds.includes(caseId)
        ? prev.viewedCaseIds
        : [caseId, ...prev.viewedCaseIds].slice(0, MAX_VIEWED_CASES);

      // Add tags to the beginning (most recent first), avoiding duplicates
      const newTags = caseTags.filter((tag) => !prev.tags.includes(tag));
      const updatedTags = [...newTags, ...prev.tags].slice(0, MAX_TAGS);

      const newData = {
        tags: updatedTags,
        viewedCaseIds: updatedViewedCases,
      };

      // Save to localStorage immediately
      saveToLocalStorage(newData);

      return newData;
    });

    // Sync to database for logged-in users (async, non-blocking)
    if (user) {
      syncToDatabase(caseId, caseTags);
    }
  }, [user, saveToLocalStorage, syncToDatabase]);

  // Get the most recently viewed tag for display
  const getMostRecentTag = useCallback(() => {
    return data.tags.length > 0 ? data.tags[0] : null;
  }, [data.tags]);

  // Check if a case has been viewed
  const hasViewedCase = useCallback(
    (caseId: string) => {
      return data.viewedCaseIds.includes(caseId);
    },
    [data.viewedCaseIds]
  );

  // Clear all history
  const clearHistory = useCallback(async () => {
    // Clear localStorage
    try {
      localStorage.removeItem(LOCAL_STORAGE_TAGS_KEY);
      localStorage.removeItem(LOCAL_STORAGE_CASES_KEY);
    } catch (error) {
      logger.error("Error clearing localStorage:", error);
    }

    // Clear database for logged-in users
    if (user) {
      try {
        const { error } = await supabase
          .from("user_view_history")
          .delete()
          .eq("user_id", user.id);

        if (error) {
          logger.error("Error clearing view history from database:", error);
        }
      } catch (error) {
        logger.error("Error clearing database history:", error);
      }
    }

    setData({ tags: [], viewedCaseIds: [] });
  }, [user]);

  return {
    viewedTags: data.tags,
    viewedCaseIds: data.viewedCaseIds,
    trackCaseView,
    getMostRecentTag,
    hasViewedCase,
    clearHistory,
    hasHistory: data.tags.length > 0,
    isInitialized,
    isSyncing,
  };
};
