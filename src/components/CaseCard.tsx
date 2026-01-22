import { useState } from "react";
import { Copy, Check, BookOpen, Calendar, Building2, CheckCircle2, AlertTriangle, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

export interface CaseData {
  id: string;
  name: string;
  citation: string;
  year: number;
  court: string;
  verdict: string;
  summary: string;
  tags?: string[];
  precedent_strength?: number;
  citation_risk?: 'safe' | 'weak';
  outcome_alignment?: 'plaintiff' | 'defendant' | 'neutral';
  ratio_decidendi?: string;
  cited_by_count?: number;
}

type VerdictType = "Allowed" | "Reversed" | "Remanded" | "Dismissed" | "Settled";

interface CaseCardProps {
  caseData: CaseData;
  index?: number;
}

const verdictStyles: Record<VerdictType, string> = {
  Allowed: "bg-gold text-white border-gold",
  Reversed: "bg-red-600 text-white border-red-600",
  Remanded: "bg-amber-600 text-white border-amber-600",
  Dismissed: "bg-slate-500 text-white border-slate-500",
  Settled: "bg-blue-600 text-white border-blue-600",
};

const getVerdictStyle = (verdict: string): string => {
  return verdictStyles[verdict as VerdictType] || "bg-slate-400 text-white border-slate-400";
};

// Get the left border color based on verdict outcome
const getVerdictBorderColor = (verdict: string): string => {
  const wins = ["Allowed", "Reversed"];
  const losses = ["Dismissed"];
  
  if (wins.includes(verdict)) return "bg-emerald-500";
  if (losses.includes(verdict)) return "bg-red-500";
  return "bg-slate-400";
};

const CaseCard = ({ caseData, index = 0 }: CaseCardProps) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopyCitation = async () => {
    await navigator.clipboard.writeText(caseData.citation);
    setCopied(true);
    toast.success("Citation copied to clipboard", {
      description: caseData.citation,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const precedentStrength = caseData.precedent_strength ?? 75;
  const citationRisk = caseData.citation_risk ?? 'safe';
  const outcomeAlignment = caseData.outcome_alignment ?? 'neutral';
  const citedByCount = caseData.cited_by_count ?? 0;

  return (
    <TooltipProvider>
      <article 
        className="bg-card rounded-lg shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden flex opacity-0 animate-fade-in"
        style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Verdict Strip - Left Edge */}
        <div className={`w-1 ${getVerdictBorderColor(caseData.verdict)} flex-shrink-0`} />
        
        <div className="flex-1 flex flex-col">
          <div className="p-5 flex-1">
            {/* Top Row: Verdict Badge + Citation Risk */}
            <div className="flex items-start justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  className={`font-semibold text-xs uppercase tracking-wider px-3 py-1 ${getVerdictStyle(caseData.verdict)}`}
                >
                  {caseData.verdict}
                </Badge>
                {caseData.tags?.map((tag) => (
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
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {citationRisk === 'safe' ? (
                  <div className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-medium whitespace-nowrap">Safe to Cite</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs font-medium whitespace-nowrap">Weak Authority</span>
                  </div>
                )}
              </div>
            </div>

            {/* Case Title - Navy Serif */}
            <h3 className="font-serif font-bold text-xl text-navy leading-tight mb-3">
              {caseData.name}
            </h3>

            {/* Precedent Strength Bar */}
            <div className="mb-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">Precedent Strength</span>
                      <span className="text-xs font-bold text-gold">{precedentStrength}/100</span>
                    </div>
                    <Progress 
                      value={precedentStrength} 
                      className="h-2 bg-secondary"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">Based on court level, recency, and citation frequency.</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Outcome Alignment Badge */}
            <div className="mb-4">
              <Badge 
                variant="secondary" 
                className="bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium"
              >
                {outcomeAlignment === 'plaintiff' && 'Supports Plaintiff'}
                {outcomeAlignment === 'defendant' && 'Supports Defendant'}
                {outcomeAlignment === 'neutral' && 'Neutral Outcome'}
              </Badge>
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-gold" />
                <span className="font-medium">{caseData.citation}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gold" />
                <span>{caseData.year}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-gold" />
                <span>{caseData.court}</span>
              </div>
            </div>

            {/* Summary - Dark Gray Sans-Serif */}
            <p className="text-foreground/75 text-sm leading-relaxed font-sans mb-4">
              {caseData.summary}
            </p>

            {/* Ratio Decidendi Box */}
            {caseData.ratio_decidendi && (
              <div className="bg-navy/5 border border-navy/10 rounded-md p-3 mb-4">
                <div className="flex items-start gap-2">
                  <Quote className="h-4 w-4 text-navy mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-navy uppercase tracking-wide block mb-1">
                      Key Principle (Ratio Decidendi)
                    </span>
                    <p className="text-sm font-medium text-navy/80 leading-relaxed">
                      {caseData.ratio_decidendi}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Influence Metrics */}
            <div className="text-xs text-muted-foreground border-t border-border pt-3">
              <span className="font-medium">Cited in {citedByCount} later judgments</span>
            </div>
          </div>

          {/* Full-Width Quick Cite Button */}
          <button
            onClick={handleCopyCitation}
            className={`
              w-full py-4 px-5 flex items-center justify-center gap-2 
              font-medium text-sm transition-all duration-200
              ${isHovered ? "bg-navy-light" : "bg-navy"} 
              text-white
            `}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-gold" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Quick Cite</span>
              </>
            )}
          </button>
        </div>
      </article>
    </TooltipProvider>
  );
};

export default CaseCard;
