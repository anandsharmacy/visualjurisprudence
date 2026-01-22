import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import FilterSidebar from "@/components/FilterSidebar";
import SearchBar from "@/components/SearchBar";
import ResultsGrid from "@/components/ResultsGrid";
import AddCaseForm from "@/components/AddCaseForm";
import { sampleCases } from "@/data/sampleCases";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";

// Map expertise areas to case tags
const expertiseToTagMap: Record<string, string[]> = {
  "Criminal Cases": ["Criminal Law", "PMLA"],
  "Constitutional Cases": ["Constitutional Law", "Civil Rights", "Reservation"],
  "Family Cases": ["Family Law"],
  "Domestic Cases": ["Domestic Law", "Family Law"],
  "Corporate / Commercial Cases": ["Corporate Law", "Commercial Law"],
  "Intellectual Property (IP) Cases": ["IP Law", "Intellectual Property"],
  "Labor / Employment Cases": ["Labor Law", "Employment Law"],
  "Administrative / Regulatory Cases": ["Administrative Law", "Regulatory"],
  "Property / Real Estate Cases": ["Property Law", "Real Estate"],
  "Consumer Cases": ["Consumer Law"],
  "Environmental Cases": ["Environmental Law"],
  "Cyber & Technology Law Cases": ["Cyber Law", "Technology Law"],
  "Human Rights Cases": ["Human Rights", "Civil Rights"],
  "Taxation Cases": ["Tax Law", "Taxation"],
  "Arbitration & ADR": ["Arbitration", "ADR"],
  "Banking & Finance Cases": ["Banking Law", "Finance Law"],
  "International Law Cases": ["International Law"],
  "Immigration & Citizenship Cases": ["Immigration Law", "Citizenship"],
  "Public Interest Litigation (PIL)": ["PIL", "Public Interest"],
  "Military / Defense Cases": ["Military Law", "Defense Law"],
};

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [yearRange, setYearRange] = useState<[number, number]>([2015, 2024]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRelevantOnly, setShowRelevantOnly] = useState(true);
  const [userExpertise, setUserExpertise] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("userExpertise");
    if (stored) {
      try {
        setUserExpertise(JSON.parse(stored));
      } catch {
        setUserExpertise([]);
      }
    }
  }, []);

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

  // Get all tags that match user's expertise
  const relevantTags = useMemo(() => {
    const tags = new Set<string>();
    userExpertise.forEach((exp) => {
      const mappedTags = expertiseToTagMap[exp] || [];
      mappedTags.forEach((tag) => tags.add(tag.toLowerCase()));
    });
    return tags;
  }, [userExpertise]);

  const filteredCases = useMemo(() => {
    let results = sampleCases;

    // Filter by user expertise (relevance) if enabled and user has expertise
    if (showRelevantOnly && userExpertise.length > 0 && relevantTags.size > 0) {
      results = results.filter((c) =>
        c.tags?.some((tag) => relevantTags.has(tag.toLowerCase()))
      );
    }

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
  }, [searchTerm, selectedFilters, yearRange, showRelevantOnly, userExpertise, relevantTags]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        onAddCase={() => setShowAddForm(true)} 
        showAddButton={!showAddForm}
      />
      <div className="flex flex-1 w-full">
        <FilterSidebar
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearFilters}
          yearRange={yearRange}
          onYearRangeChange={setYearRange}
        />
        <main className="flex-1 p-6 overflow-auto">
          {showAddForm ? (
            <AddCaseForm
              onCancel={() => setShowAddForm(false)}
              onSubmit={() => setShowAddForm(false)}
            />
          ) : (
            <div className="max-w-6xl mx-auto space-y-6">
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
              
              {/* Relevance Toggle */}
              {userExpertise.length > 0 && (
                <div className="flex items-center gap-3">
                  <Button
                    variant={showRelevantOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowRelevantOnly(!showRelevantOnly)}
                    className={
                      showRelevantOnly
                        ? "bg-navy text-white border-navy hover:bg-navy/90"
                        : "border-navy/30 text-navy hover:bg-navy/5"
                    }
                  >
                    {showRelevantOnly ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Showing Relevant Cases
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Show Relevant Only
                      </>
                    )}
                  </Button>
                  {showRelevantOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRelevantOnly(false)}
                      className="text-muted-foreground hover:text-navy"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Show All Cases
                    </Button>
                  )}
                </div>
              )}
              
              <ResultsGrid cases={filteredCases} searchTerm={searchTerm} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
