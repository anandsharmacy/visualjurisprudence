import { X, Scale, ArrowRight, CheckCircle2, AlertTriangle, Quote } from "lucide-react";
import { CaseData } from "./CaseCard";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CaseComparisonPanelProps {
  selectedCases: CaseData[];
  onClose: () => void;
  onRemoveCase: (caseId: string) => void;
}

const CaseComparisonPanel = ({ selectedCases, onClose, onRemoveCase }: CaseComparisonPanelProps) => {
  if (selectedCases.length < 2) return null;

  const getVerdictColor = (verdict: string) => {
    const wins = ["Allowed", "Reversed"];
    const losses = ["Dismissed"];
    if (wins.includes(verdict)) return "text-emerald-600";
    if (losses.includes(verdict)) return "text-red-600";
    return "text-slate-600";
  };

  const getVerdictBg = (verdict: string) => {
    const wins = ["Allowed", "Reversed"];
    const losses = ["Dismissed"];
    if (wins.includes(verdict)) return "bg-emerald-50 border-emerald-200";
    if (losses.includes(verdict)) return "bg-red-50 border-red-200";
    return "bg-slate-50 border-slate-200";
  };

  const maxStrength = Math.max(...selectedCases.map(c => c.precedent_strength ?? 0));
  const maxCitations = Math.max(...selectedCases.map(c => c.cited_by_count ?? 0));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-navy/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold/10 rounded-lg">
              <Scale className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy">Case Comparison</h2>
              <p className="text-sm text-muted-foreground">
                Analyzing {selectedCases.length} cases side-by-side
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Comparison Content */}
        <ScrollArea className="flex-1 p-6">
          <div className={`grid gap-6 ${selectedCases.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {selectedCases.map((caseData) => {
              const precedentStrength = caseData.precedent_strength ?? 0;
              const citedByCount = caseData.cited_by_count ?? 0;
              const isStrongest = precedentStrength === maxStrength && maxStrength > 0;
              const isMostCited = citedByCount === maxCitations && maxCitations > 0;

              return (
                <div 
                  key={caseData.id} 
                  className={`bg-white rounded-xl border-2 overflow-hidden ${isStrongest ? 'border-gold ring-2 ring-gold/20' : 'border-border'}`}
                >
                  {/* Case Header */}
                  <div className="p-4 bg-navy/5 border-b border-border relative">
                    <button
                      onClick={() => onRemoveCase(caseData.id)}
                      className="absolute top-2 right-2 p-1 rounded-full hover:bg-navy/10 transition-colors"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {isStrongest && (
                      <Badge className="absolute top-2 left-2 bg-gold text-white text-xs">
                        Strongest
                      </Badge>
                    )}
                    <h3 className="font-serif font-bold text-lg text-navy pr-8 mt-4">
                      {caseData.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {caseData.citation} • {caseData.year}
                    </p>
                  </div>

                  {/* Comparison Metrics */}
                  <div className="p-4 space-y-5">
                    {/* Verdict */}
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                        Verdict
                      </span>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getVerdictBg(caseData.verdict)}`}>
                        <span className={`font-bold ${getVerdictColor(caseData.verdict)}`}>
                          {caseData.verdict}
                        </span>
                      </div>
                    </div>

                    {/* Court Level */}
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                        Court Level
                      </span>
                      <span className="text-sm font-medium text-navy">{caseData.court}</span>
                    </div>

                    {/* Precedent Strength */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Precedent Strength
                        </span>
                        <span className={`text-sm font-bold ${isStrongest ? 'text-gold' : 'text-navy'}`}>
                          {precedentStrength}/100
                        </span>
                      </div>
                      <Progress 
                        value={precedentStrength} 
                        className="h-3 bg-secondary"
                      />
                    </div>

                    {/* Citation Risk */}
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                        Citation Risk
                      </span>
                      {caseData.citation_risk === 'safe' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm font-medium">Safe to Cite</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">Weak Authority</span>
                        </div>
                      )}
                    </div>

                    {/* Outcome Alignment */}
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                        Outcome Alignment
                      </span>
                      <Badge 
                        variant="secondary" 
                        className="bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        {caseData.outcome_alignment === 'plaintiff' && 'Supports Plaintiff'}
                        {caseData.outcome_alignment === 'defendant' && 'Supports Defendant'}
                        {(!caseData.outcome_alignment || caseData.outcome_alignment === 'neutral') && 'Neutral Outcome'}
                      </Badge>
                    </div>

                    {/* Citations */}
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                        Influence
                      </span>
                      <div className={`text-sm ${isMostCited ? 'text-gold font-bold' : 'text-navy font-medium'}`}>
                        {citedByCount} citations
                        {isMostCited && <span className="ml-1 text-xs">(Most cited)</span>}
                      </div>
                    </div>

                    {/* Key Principle */}
                    {caseData.ratio_decidendi && (
                      <div className="bg-navy/5 rounded-lg p-3 border border-navy/10">
                        <div className="flex items-start gap-2">
                          <Quote className="h-4 w-4 text-navy mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs font-semibold text-navy uppercase tracking-wide block mb-1">
                              Key Principle
                            </span>
                            <p className="text-sm text-navy/80 leading-relaxed">
                              {caseData.ratio_decidendi}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Analysis Summary */}
          <div className="mt-8 p-5 bg-navy/5 rounded-xl border border-navy/10">
            <h4 className="font-serif text-lg font-bold text-navy mb-3 flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-gold" />
              Quick Analysis
            </h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-white rounded-lg p-4 border border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
                  Strongest Authority
                </span>
                <p className="text-sm font-bold text-navy">
                  {selectedCases.find(c => (c.precedent_strength ?? 0) === maxStrength)?.name || 'N/A'}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
                  Most Cited
                </span>
                <p className="text-sm font-bold text-navy">
                  {selectedCases.find(c => (c.cited_by_count ?? 0) === maxCitations)?.name || 'N/A'}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
                  Safe to Cite
                </span>
                <p className="text-sm font-bold text-navy">
                  {selectedCases.filter(c => c.citation_risk === 'safe').length} of {selectedCases.length} cases
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-cream-dark">
          <Button onClick={onClose} className="w-full bg-navy hover:bg-navy-light text-white">
            Close Comparison
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CaseComparisonPanel;
