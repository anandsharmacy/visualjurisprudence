import { useState, useMemo } from "react";
import Header from "@/components/Header";
import FilterSidebar from "@/components/FilterSidebar";
import SearchBar from "@/components/SearchBar";
import ResultsGrid from "@/components/ResultsGrid";
import { sampleCases } from "@/data/sampleCases";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());

  const handleFilterChange = (filterId: string) => {
    setSelectedFilters((prev) => {
      const newFilters = new Set(prev);
      if (newFilters.has(filterId)) {
        newFilters.delete(filterId);
      } else {
        newFilters.add(filterId);
      }
      return newFilters;
    });
  };

  const handleClearFilters = () => {
    setSelectedFilters(new Set());
  };

  const filteredCases = useMemo(() => {
    let results = sampleCases;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.citation.toLowerCase().includes(term) ||
          c.summary.toLowerCase().includes(term) ||
          c.court.toLowerCase().includes(term)
      );
    }

    // Filter by selected filters
    if (selectedFilters.size > 0) {
      results = results.filter((c) => {
        // Year filter
        if (selectedFilters.has(c.year.toString())) return true;
        
        // Court level filter
        const courtMap: Record<string, string> = {
          "Supreme Court": "supreme",
          "Appellate Court": "appellate",
          "District Court": "district",
          "State Court": "state",
        };
        if (selectedFilters.has(courtMap[c.court])) return true;
        
        // Verdict filter
        if (selectedFilters.has(c.verdict.toLowerCase())) return true;
        
        return false;
      });
    }

    return results;
  }, [searchTerm, selectedFilters]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1 w-full">
        <FilterSidebar
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearFilters}
        />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
            <ResultsGrid cases={filteredCases} searchTerm={searchTerm} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
