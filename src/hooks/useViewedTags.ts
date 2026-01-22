import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "legal_viewed_tags";
const VIEWED_CASES_KEY = "legal_viewed_cases";
const MAX_TAGS = 20;
const MAX_VIEWED_CASES = 50;

interface ViewedTagsData {
  tags: string[];
  viewedCaseIds: string[];
}

export const useViewedTags = () => {
  const [data, setData] = useState<ViewedTagsData>({ tags: [], viewedCaseIds: [] });
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedTags = localStorage.getItem(STORAGE_KEY);
      const storedCases = localStorage.getItem(VIEWED_CASES_KEY);
      
      setData({
        tags: storedTags ? JSON.parse(storedTags) : [],
        viewedCaseIds: storedCases ? JSON.parse(storedCases) : [],
      });
    } catch (error) {
      console.error("Error loading viewed tags from localStorage:", error);
      setData({ tags: [], viewedCaseIds: [] });
    }
    setIsInitialized(true);
  }, []);

  // Track when a case is viewed
  const trackCaseView = useCallback((caseId: string, caseTags: string[]) => {
    setData((prev) => {
      // Add case ID to viewed list
      const updatedViewedCases = prev.viewedCaseIds.includes(caseId)
        ? prev.viewedCaseIds
        : [caseId, ...prev.viewedCaseIds].slice(0, MAX_VIEWED_CASES);

      // Add tags to the beginning (most recent first), avoiding duplicates
      const newTags = caseTags.filter((tag) => !prev.tags.includes(tag));
      const updatedTags = [...newTags, ...prev.tags].slice(0, MAX_TAGS);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTags));
        localStorage.setItem(VIEWED_CASES_KEY, JSON.stringify(updatedViewedCases));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }

      return {
        tags: updatedTags,
        viewedCaseIds: updatedViewedCases,
      };
    });
  }, []);

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
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(VIEWED_CASES_KEY);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
    setData({ tags: [], viewedCaseIds: [] });
  }, []);

  return {
    viewedTags: data.tags,
    viewedCaseIds: data.viewedCaseIds,
    trackCaseView,
    getMostRecentTag,
    hasViewedCase,
    clearHistory,
    hasHistory: data.tags.length > 0,
    isInitialized,
  };
};
