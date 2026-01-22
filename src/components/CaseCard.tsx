import { useState } from "react";
import { Copy, Check, BookOpen, Calendar, Building2, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface CaseData {
  id: string;
  name: string;
  citation: string;
  year: number;
  court: string;
  verdict: "Allowed" | "Reversed" | "Remanded" | "Dismissed" | "Settled";
  summary: string;
  tags?: string[];
}

interface CaseCardProps {
  caseData: CaseData;
  index?: number;
}

const verdictStyles: Record<CaseData["verdict"], string> = {
  Allowed: "bg-gold text-white border-gold",
  Reversed: "bg-red-600 text-white border-red-600",
  Remanded: "bg-amber-600 text-white border-amber-600",
  Dismissed: "bg-slate-500 text-white border-slate-500",
  Settled: "bg-blue-600 text-white border-blue-600",
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

  return (
    <article 
      className="bg-card rounded-lg shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden border-t-4 border-t-gold opacity-0 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-5">
        {/* Verdict Badge - Top Left */}
        <div className="flex items-center gap-2 mb-4">
          <Badge
            className={`font-semibold text-xs uppercase tracking-wider px-3 py-1 ${verdictStyles[caseData.verdict]}`}
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

        {/* Case Title - Navy Serif */}
        <h3 className="font-serif font-bold text-xl text-navy leading-tight mb-3">
          {caseData.name}
        </h3>

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
        <p className="text-foreground/75 text-sm leading-relaxed font-sans">
          {caseData.summary}
        </p>
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
    </article>
  );
};

export default CaseCard;
