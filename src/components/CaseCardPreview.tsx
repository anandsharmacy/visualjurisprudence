import { Copy, BookOpen, Calendar, Building2, CheckCircle2, AlertTriangle, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface PreviewCaseData {
  name: string;
  citation: string;
  year: number | string;
  court: string;
  verdict: string;
  summary: string;
  tags?: string[];
  precedent_strength?: number;
  citation_risk?: string;
  outcome_alignment?: string;
  ratio_decidendi?: string;
  cited_by_count?: number;
}

interface CaseCardPreviewProps {
  caseData: PreviewCaseData;
}

const verdictStyles: Record<string, string> = {
  Allowed: "bg-gold text-white border-gold",
  Reversed: "bg-red-600 text-white border-red-600",
  Remanded: "bg-amber-600 text-white border-amber-600",
  Dismissed: "bg-slate-500 text-white border-slate-500",
  Settled: "bg-blue-600 text-white border-blue-600",
  Pending: "bg-slate-400 text-white border-slate-400",
};

const getVerdictStyle = (verdict: string): string => {
  return verdictStyles[verdict] || "bg-slate-400 text-white border-slate-400";
};

const getVerdictBorderColor = (verdict: string): string => {
  const wins = ["Allowed", "Reversed"];
  const losses = ["Dismissed"];
  
  if (wins.includes(verdict)) return "bg-emerald-500";
  if (losses.includes(verdict)) return "bg-red-500";
  return "bg-slate-400";
};

const getCitationRiskDisplay = (risk: string) => {
  if (risk === 'safe' || risk.includes('Safe')) {
    return { icon: CheckCircle2, label: 'Safe to Cite', color: 'text-emerald-600' };
  }
  if (risk === 'caution' || risk.includes('Caution')) {
    return { icon: AlertTriangle, label: 'Use with Caution', color: 'text-amber-600' };
  }
  return { icon: AlertTriangle, label: 'Weak Authority', color: 'text-red-600' };
};

const getOutcomeLabel = (alignment: string) => {
  if (alignment === 'plaintiff' || alignment.includes('Plaintiff')) return 'Supports Plaintiff';
  if (alignment === 'defendant' || alignment.includes('Defendant')) return 'Supports Defendant';
  return 'Neutral Outcome';
};

const CaseCardPreview = ({ caseData }: CaseCardPreviewProps) => {
  const precedentStrength = caseData.precedent_strength ?? 75;
  const citationRisk = caseData.citation_risk ?? 'safe';
  const outcomeAlignment = caseData.outcome_alignment ?? 'neutral';
  const citedByCount = caseData.cited_by_count ?? 0;
  const riskDisplay = getCitationRiskDisplay(citationRisk);
  const RiskIcon = riskDisplay.icon;

  return (
    <TooltipProvider>
      <article className="bg-card rounded-lg shadow-card overflow-hidden flex">
        {/* Verdict Strip - Left Edge */}
        <div className={`w-1 ${getVerdictBorderColor(caseData.verdict)} flex-shrink-0`} />
        
        <div className="flex-1 flex flex-col">
          <div className="p-4 flex-1">
            {/* Top Row: Verdict Badge + Citation Risk */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                {caseData.verdict && (
                  <Badge
                    className={`font-semibold text-xs uppercase tracking-wider px-2 py-0.5 ${getVerdictStyle(caseData.verdict)}`}
                  >
                    {caseData.verdict}
                  </Badge>
                )}
                {caseData.tags?.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs font-medium border-primary/30 text-primary bg-secondary/50"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              
              {/* Citation Risk Indicator */}
              <div className={`flex items-center gap-1 flex-shrink-0 ${riskDisplay.color}`}>
                <RiskIcon className="h-3.5 w-3.5" />
                <span className="text-xs font-medium whitespace-nowrap">{riskDisplay.label}</span>
              </div>
            </div>

            {/* Case Title - Navy Serif */}
            <h3 className="font-serif font-bold text-lg text-navy leading-tight mb-2 line-clamp-2">
              {caseData.name || 'Case Title Preview'}
            </h3>

            {/* Precedent Strength Bar */}
            <div className="mb-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">Precedent Strength</span>
                      <span className="text-xs font-bold text-gold">{precedentStrength}/100</span>
                    </div>
                    <Progress 
                      value={precedentStrength} 
                      className="h-1.5 bg-secondary"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">Based on court level, recency, and citation frequency.</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Outcome Alignment Badge */}
            <div className="mb-3">
              <Badge 
                variant="secondary" 
                className="bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium"
              >
                {getOutcomeLabel(outcomeAlignment)}
              </Badge>
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
              {caseData.citation && (
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3 text-gold" />
                  <span className="font-medium">{caseData.citation}</span>
                </div>
              )}
              {caseData.year && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gold" />
                  <span>{caseData.year}</span>
                </div>
              )}
              {caseData.court && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-gold" />
                  <span>{caseData.court}</span>
                </div>
              )}
            </div>

            {/* Summary */}
            <p className="text-foreground/75 text-xs leading-relaxed font-sans mb-3 line-clamp-3">
              {caseData.summary || 'Case summary will appear here...'}
            </p>

            {/* Ratio Decidendi Box */}
            {caseData.ratio_decidendi && (
              <div className="bg-navy/5 border border-navy/10 rounded-md p-2 mb-3">
                <div className="flex items-start gap-1.5">
                  <Quote className="h-3 w-3 text-navy mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-navy uppercase tracking-wide block mb-0.5">
                      Key Principle
                    </span>
                    <p className="text-xs font-medium text-navy/80 leading-relaxed line-clamp-2">
                      {caseData.ratio_decidendi}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Influence Metrics */}
            <div className="text-xs text-muted-foreground border-t border-border pt-2">
              <span className="font-medium">Cited in {citedByCount} later judgments</span>
            </div>
          </div>

          {/* Quick Cite Button Preview */}
          <div className="w-full py-3 px-4 flex items-center justify-center gap-2 font-medium text-xs bg-navy text-white">
            <Copy className="h-3 w-3" />
            <span>Quick Cite</span>
          </div>
        </div>
      </article>
    </TooltipProvider>
  );
};

export default CaseCardPreview;
