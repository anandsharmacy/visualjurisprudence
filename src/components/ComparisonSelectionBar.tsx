import { Scale, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CaseData } from "./CaseCard";

interface ComparisonSelectionBarProps {
  selectedCases: CaseData[];
  onClearSelection: () => void;
  onCompare: () => void;
  onRemoveCase: (caseId: string) => void;
}

const ComparisonSelectionBar = ({ 
  selectedCases, 
  onClearSelection, 
  onCompare,
  onRemoveCase 
}: ComparisonSelectionBarProps) => {
  if (selectedCases.length === 0) return null;

  const canCompare = selectedCases.length >= 2;
  const maxReached = selectedCases.length >= 3;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-in-bottom">
      <div className="bg-navy rounded-xl shadow-2xl px-5 py-4 flex items-center gap-4 border border-gold/20">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gold/20 rounded-lg">
            <Scale className="h-5 w-5 text-gold" />
          </div>
          <div className="text-white">
            <p className="text-sm font-medium">
              {selectedCases.length} case{selectedCases.length !== 1 ? 's' : ''} selected
            </p>
            {!canCompare && (
              <p className="text-xs text-white/60">Select {2 - selectedCases.length} more to compare</p>
            )}
            {maxReached && (
              <p className="text-xs text-gold">Maximum 3 cases</p>
            )}
          </div>
        </div>

        <div className="h-8 w-px bg-white/20" />

        {/* Selected Case Pills */}
        <div className="flex items-center gap-2 max-w-md overflow-x-auto">
          {selectedCases.map((caseData) => (
            <div 
              key={caseData.id}
              className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-white text-xs font-medium whitespace-nowrap"
            >
              <span className="max-w-[120px] truncate">{caseData.name}</span>
              <button
                onClick={() => onRemoveCase(caseData.id)}
                className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="h-8 w-px bg-white/20" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            Clear
          </Button>
          <Button
            size="sm"
            disabled={!canCompare}
            onClick={onCompare}
            className="bg-gold hover:bg-gold/90 text-navy font-semibold disabled:opacity-50"
          >
            <span>Compare</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSelectionBar;
