import { useState } from "react";
import { Filter } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface FilterSection {
  title: string;
  options: { id: string; label: string }[];
}

const courtLevels = [
  { id: "supreme", label: "Supreme Court" },
  { id: "high", label: "High Court" },
  { id: "appellate", label: "Appellate Court" },
  { id: "district", label: "District Court" },
  { id: "state", label: "State Court" },
];

const verdictTypes = [
  { id: "allowed", label: "Allowed" },
  { id: "dismissed", label: "Dismissed" },
  { id: "remanded", label: "Remanded" },
  { id: "reversed", label: "Reversed" },
  { id: "settled", label: "Settled" },
];

interface PillButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const PillButton = ({ label, isActive, onClick }: PillButtonProps) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2
      ${isActive 
        ? "bg-primary border-primary text-gold" 
        : "bg-white border-primary/30 text-primary hover:border-primary hover:bg-primary/5"
      }
    `}
  >
    {label}
  </button>
);

interface FilterSidebarProps {
  selectedFilters: Set<string>;
  onFilterChange: (id: string) => void;
  onClearAll: () => void;
  yearRange: [number, number];
  onYearRangeChange: (range: [number, number]) => void;
}

const FilterSidebar = ({
  selectedFilters,
  onFilterChange,
  onClearAll,
  yearRange,
  onYearRangeChange,
}: FilterSidebarProps) => {
  return (
    <aside className="w-64 min-h-full bg-primary flex-shrink-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 text-primary-foreground">
          <Filter className="h-5 w-5 text-gold" />
          <span className="font-serif font-semibold text-lg">Filters</span>
        </div>
        {selectedFilters.size > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-gold hover:text-gold-light transition-colors underline underline-offset-2"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Year Range Slider */}
        <div className="border-b border-sidebar-border p-4">
          <h3 className="text-primary-foreground font-medium text-sm mb-4">Year Range</h3>
          <div className="px-1">
            <Slider
              value={yearRange}
              onValueChange={(value) => onYearRangeChange(value as [number, number])}
              min={2015}
              max={2025}
              step={1}
              className="year-slider"
            />
            <div className="flex justify-between mt-3 text-xs text-primary-foreground/70">
              <span>{yearRange[0]}</span>
              <span>{yearRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Court Level Pills */}
        <div className="border-b border-sidebar-border p-4">
          <h3 className="text-primary-foreground font-medium text-sm mb-4">Court Level</h3>
          <div className="flex flex-wrap gap-2">
            {courtLevels.map((court) => (
              <PillButton
                key={court.id}
                label={court.label}
                isActive={selectedFilters.has(court.id)}
                onClick={() => onFilterChange(court.id)}
              />
            ))}
          </div>
        </div>

        {/* Verdict Type Pills */}
        <div className="border-b border-sidebar-border p-4">
          <h3 className="text-primary-foreground font-medium text-sm mb-4">Verdict Type</h3>
          <div className="flex flex-wrap gap-2">
            {verdictTypes.map((verdict) => (
              <PillButton
                key={verdict.id}
                label={verdict.label}
                isActive={selectedFilters.has(verdict.id)}
                onClick={() => onFilterChange(verdict.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
