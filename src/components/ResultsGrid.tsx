import CaseCard, { CaseData } from "@/components/CaseCard";
import { FileSearch } from "lucide-react";

interface ResultsGridProps {
  cases: CaseData[];
  searchTerm: string;
}

const ResultsGrid = ({ cases, searchTerm }: ResultsGridProps) => {
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
          Showing <span className="font-semibold text-foreground">{cases.length}</span> results
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {cases.map((caseData, index) => (
          <div
            key={caseData.id}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CaseCard caseData={caseData} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsGrid;
