import { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { CaseData } from "@/components/CaseCard";
import SuggestionCard from "@/components/SuggestionCard";
import { Button } from "@/components/ui/button";

interface RecommendationsSectionProps {
  allCases: CaseData[];
  viewedTags: string[];
  viewedCaseIds: string[];
  onCaseClick: (caseData: CaseData) => void;
  isVisible: boolean;
}

const RecommendationsSection = ({
  allCases,
  viewedTags,
  viewedCaseIds,
  onCaseClick,
  isVisible,
}: RecommendationsSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get the most recent tag for the title
  const mostRecentTag = viewedTags.length > 0 ? viewedTags[0] : null;

  // Filter recommendations: cases that match viewed tags but haven't been clicked
  const recommendations = useMemo(() => {
    if (viewedTags.length === 0) return [];

    const viewedSet = new Set(viewedCaseIds);
    const tagSet = new Set(viewedTags.map((t) => t.toLowerCase()));

    return allCases
      .filter((c) => {
        // Exclude already viewed cases
        if (viewedSet.has(c.id)) return false;
        // Include if any tag matches
        return c.tags?.some((tag) => tagSet.has(tag.toLowerCase()));
      })
      .slice(0, 10); // Limit to 10 recommendations
  }, [allCases, viewedTags, viewedCaseIds]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Don't render if no history or no recommendations
  if (!isVisible || recommendations.length === 0) {
    return null;
  }

  return (
    <div
      className="mb-6 opacity-0 animate-fade-in"
      style={{ animationFillMode: "forwards" }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" />
          <h2 className="font-serif text-lg font-semibold text-navy">
            Because you viewed{" "}
            <span className="text-gold">"{mostRecentTag}"</span>...
          </h2>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("left")}
            className="h-8 w-8 text-muted-foreground hover:text-navy hover:bg-secondary"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("right")}
            className="h-8 w-8 text-muted-foreground hover:text-navy hover:bg-secondary"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        className="
          flex gap-4 overflow-x-auto pb-4 scrollbar-thin 
          scrollbar-thumb-gold/30 scrollbar-track-transparent
          scroll-smooth
        "
        style={{
          scrollbarWidth: "thin",
          msOverflowStyle: "none",
        }}
      >
        {recommendations.map((caseData, index) => (
          <div
            key={caseData.id}
            className="opacity-0 animate-fade-in"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: "forwards",
            }}
          >
            <SuggestionCard
              caseData={caseData}
              onClick={() => onCaseClick(caseData)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsSection;
