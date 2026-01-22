import CaseCard, { CaseData } from "@/components/CaseCard";
import { FileSearch, Scale } from "lucide-react";

interface ResultsGridProps {
  cases: CaseData[];
  searchTerm: string;
  selectedCaseIds?: Set<string>;
  onToggleCaseSelect?: (caseData: CaseData) => void;
  maxSelectionsReached?: boolean;
}

const ResultsGrid = ({ 
  cases, 
  searchTerm, 
  selectedCaseIds = new Set(), 
  onToggleCaseSelect,
  maxSelectionsReached = false 
}: ResultsGridProps) => {
  if (cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileSearch className="h-16 w-16 text-muted-foreground/40 mb-4" />
        <h3 className="font-serif text-xl text-foreground mb-2">No cases found</h3>
        <p className="text-muted-foreground max-w-md">
          {searchTerm
            ? `No results match "${searchTerm}". Try adjusting your search or filters.`
            : "Apply filters or enter a search term to find relevant cases."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{cases.length}</span> result{cases.length !== 1 ? 's' : ''}
        </p>
        {onToggleCaseSelect && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Scale className="h-4 w-4 text-gold" />
            <span>Click checkbox to compare cases</span>
          </div>
        )}
      </div>
      <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
        {cases.map((caseData, index) => (
          <CaseCard 
            key={caseData.id} 
            caseData={caseData} 
            index={index}
            isSelected={selectedCaseIds.has(caseData.id)}
            onToggleSelect={onToggleCaseSelect}
            selectionDisabled={maxSelectionsReached && !selectedCaseIds.has(caseData.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsGrid;
