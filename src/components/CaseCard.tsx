import { useState } from "react";
import { Copy, Check, BookOpen, Calendar, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface CaseData {
  id: string;
  name: string;
  citation: string;
  year: number;
  court: string;
  verdict: "Affirmed" | "Reversed" | "Remanded" | "Dismissed" | "Settled";
  summary: string;
}

interface CaseCardProps {
  caseData: CaseData;
}

const verdictStyles: Record<CaseData["verdict"], string> = {
  Affirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Reversed: "bg-red-100 text-red-800 border-red-200",
  Remanded: "bg-amber-100 text-amber-800 border-amber-200",
  Dismissed: "bg-slate-100 text-slate-800 border-slate-200",
  Settled: "bg-blue-100 text-blue-800 border-blue-200",
};

const CaseCard = ({ caseData }: CaseCardProps) => {
  const [copied, setCopied] = useState(false);

  const formatCitation = () => {
    return `${caseData.name}, ${caseData.citation} (${caseData.year})`;
  };

  const handleCopyCitation = async () => {
    const citation = formatCitation();
    await navigator.clipboard.writeText(citation);
    setCopied(true);
    toast.success("Citation copied to clipboard", {
      description: citation,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="bg-card rounded-lg shadow-card hover:shadow-elevated transition-shadow duration-300 overflow-hidden gold-border-left animate-fade-in">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-serif font-semibold text-lg text-foreground leading-tight">
            {caseData.name}
          </h3>
          <Badge
            variant="outline"
            className={`shrink-0 font-medium ${verdictStyles[caseData.verdict]}`}
          >
            {caseData.verdict}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span>{caseData.citation}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{caseData.year}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4" />
            <span>{caseData.court}</span>
          </div>
        </div>

        <p className="text-foreground/80 text-sm leading-relaxed mb-4">
          {caseData.summary}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground font-medium">
            Quick Citation
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCitation}
            className="gap-2 text-primary hover:bg-primary hover:text-primary-foreground border-primary/30"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>One-Click Cite</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
};

export default CaseCard;
