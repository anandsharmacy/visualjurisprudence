import { BookOpen, Gavel, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CaseData } from "@/components/CaseCard";
import { format, parseISO } from "date-fns";

interface SuggestionCardProps {
  caseData: CaseData;
  onClick: () => void;
}

const getVerdictStyle = (verdict: string): string => {
  const styles: Record<string, string> = {
    Allowed: "bg-gold text-white",
    Reversed: "bg-red-600 text-white",
    Remanded: "bg-amber-600 text-white",
    Dismissed: "bg-slate-500 text-white",
    Settled: "bg-blue-600 text-white",
  };
  return styles[verdict] || "bg-slate-400 text-white";
};

const SuggestionCard = ({ caseData, onClick }: SuggestionCardProps) => {
  const citationRisk = caseData.citation_risk ?? "safe";

  return (
    <button
      onClick={onClick}
      className="
        flex-shrink-0 w-72 bg-card rounded-lg shadow-card 
        hover:shadow-elevated transition-all duration-300 
        overflow-hidden text-left group cursor-pointer
        border border-border hover:border-gold/50
        hover:scale-[1.02]
      "
    >
      {/* Gold top accent */}
      <div className="h-1 bg-gold" />

      <div className="p-4">
        {/* Verdict + Risk */}
        <div className="flex items-center justify-between mb-2">
          <Badge className={`text-xs font-semibold ${getVerdictStyle(caseData.verdict)}`}>
            {caseData.verdict}
          </Badge>
          {citationRisk === "safe" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
        </div>

        {/* Case Name */}
        <h4 className="font-serif font-bold text-sm text-navy leading-tight mb-2 line-clamp-2 group-hover:text-gold transition-colors">
          {caseData.name}
        </h4>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {caseData.tags?.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs border-primary/20 text-primary/70 bg-secondary/30"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-gold" />
            <span className="truncate max-w-[100px]">{caseData.citation}</span>
          </div>
          {caseData.lastHearingDate && (
            <div className="flex items-center gap-1">
              <Gavel className="h-3 w-3 text-gold" />
              <span>{format(parseISO(caseData.lastHearingDate), "MMM yyyy")}</span>
            </div>
          )}
        </div>

        {/* Precedent Strength Mini Bar */}
        <div className="mt-3">
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-500"
              style={{ width: `${caseData.precedent_strength ?? 75}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Strength: {caseData.precedent_strength ?? 75}%
          </p>
        </div>
      </div>
    </button>
  );
};

export default SuggestionCard;
