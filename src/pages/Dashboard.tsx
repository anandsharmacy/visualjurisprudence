import { useState, useMemo } from "react";
import Header from "@/components/Header";
import FilterSidebar from "@/components/FilterSidebar";
import SearchBar from "@/components/SearchBar";
import ResultsGrid from "@/components/ResultsGrid";
import { sampleCases } from "@/data/sampleCases";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [yearRange, setYearRange] = useState<[number, number]>([2015, 2024]);

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
    setYearRange([2015, 2024]);
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
          c.court.toLowerCase().includes(term) ||
          c.tags?.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    // Filter by year range
    results = results.filter(
      (c) => c.year >= yearRange[0] && c.year <= yearRange[1]
    );

    // Filter by selected filters (court level and verdict type)
    if (selectedFilters.size > 0) {
      results = results.filter((c) => {
        // Court level filter
        const courtMap: Record<string, string> = {
          "Supreme Court": "supreme",
          "High Court": "high",
          "Appellate Court": "appellate",
          "District Court": "district",
          "State Court": "state",
        };
        
        // Verdict filter
        const verdictMap: Record<string, string> = {
          "Allowed": "allowed",
          "Dismissed": "dismissed",
          "Remanded": "remanded",
          "Reversed": "reversed",
          "Settled": "settled",
        };

        const courtFilterActive = selectedFilters.has(courtMap[c.court]);
        const verdictFilterActive = selectedFilters.has(verdictMap[c.verdict]);

        // Check if any court filters are selected
        const hasCourtFilters = ["supreme", "high", "appellate", "district", "state"].some(
          (court) => selectedFilters.has(court)
        );
        
        // Check if any verdict filters are selected
        const hasVerdictFilters = ["allowed", "dismissed", "remanded", "reversed", "settled"].some(
          (verdict) => selectedFilters.has(verdict)
        );

        // If both types of filters exist, case must match at least one from each
        if (hasCourtFilters && hasVerdictFilters) {
          return courtFilterActive && verdictFilterActive;
        }
        
        // If only court filters exist
        if (hasCourtFilters) {
          return courtFilterActive;
        }
        
        // If only verdict filters exist
        if (hasVerdictFilters) {
          return verdictFilterActive;
        }

        return true;
      });
    }

    return results;
  }, [searchTerm, selectedFilters, yearRange]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1 w-full">
        <FilterSidebar
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearFilters}
          yearRange={yearRange}
          onYearRangeChange={setYearRange}
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

export default Dashboard;
