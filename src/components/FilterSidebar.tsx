import { useState } from "react";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FilterSection {
  title: string;
  options: { id: string; label: string; count?: number }[];
}

const filterSections: FilterSection[] = [
  {
    title: "Year",
    options: [
      { id: "2024", label: "2024", count: 156 },
      { id: "2023", label: "2023", count: 342 },
      { id: "2022", label: "2022", count: 289 },
      { id: "2021", label: "2021", count: 198 },
      { id: "2020", label: "2020", count: 167 },
    ],
  },
  {
    title: "Court Level",
    options: [
      { id: "supreme", label: "Supreme Court", count: 89 },
      { id: "appellate", label: "Appellate Court", count: 234 },
      { id: "district", label: "District Court", count: 567 },
      { id: "state", label: "State Court", count: 312 },
    ],
  },
  {
    title: "Verdict Type",
    options: [
      { id: "affirmed", label: "Affirmed", count: 423 },
      { id: "reversed", label: "Reversed", count: 187 },
      { id: "remanded", label: "Remanded", count: 134 },
      { id: "dismissed", label: "Dismissed", count: 98 },
      { id: "settled", label: "Settled", count: 56 },
    ],
  },
];

interface FilterSectionComponentProps {
  section: FilterSection;
  selectedFilters: Set<string>;
  onFilterChange: (id: string) => void;
}

const FilterSectionComponent = ({
  section,
  selectedFilters,
  onFilterChange,
}: FilterSectionComponentProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-sidebar-border last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-4 text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
      >
        <span className="font-medium text-sm">{section.title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gold" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gold" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-3 space-y-2 animate-fade-in">
          {section.options.map((option) => (
            <div key={option.id} className="flex items-center gap-3">
              <Checkbox
                id={option.id}
                checked={selectedFilters.has(option.id)}
                onCheckedChange={() => onFilterChange(option.id)}
                className="border-sidebar-foreground/40 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
              />
              <Label
                htmlFor={option.id}
                className="flex-1 text-sm text-sidebar-foreground/90 cursor-pointer flex justify-between"
              >
                <span>{option.label}</span>
                {option.count && (
                  <span className="text-sidebar-foreground/50 text-xs">
                    ({option.count})
                  </span>
                )}
              </Label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface FilterSidebarProps {
  selectedFilters: Set<string>;
  onFilterChange: (id: string) => void;
  onClearAll: () => void;
}

const FilterSidebar = ({
  selectedFilters,
  onFilterChange,
  onClearAll,
}: FilterSidebarProps) => {
  return (
    <aside className="w-64 min-h-full bg-primary flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 text-primary-foreground">
          <Filter className="h-5 w-5 text-gold" />
          <span className="font-serif font-semibold text-lg">Filters</span>
        </div>
        {selectedFilters.size > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-gold hover:text-gold-light transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
      <div className="overflow-y-auto">
        {filterSections.map((section) => (
          <FilterSectionComponent
            key={section.title}
            section={section}
            selectedFilters={selectedFilters}
            onFilterChange={onFilterChange}
          />
        ))}
      </div>
    </aside>
  );
};

export default FilterSidebar;
