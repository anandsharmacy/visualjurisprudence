import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import FilterSidebar from "@/components/FilterSidebar";
import SearchBar from "@/components/SearchBar";
import ResultsGrid from "@/components/ResultsGrid";
import AddCaseForm from "@/components/AddCaseForm";
import ComparisonSelectionBar from "@/components/ComparisonSelectionBar";
import CaseComparisonPanel from "@/components/CaseComparisonPanel";
import { Button } from "@/components/ui/button";
import { Sparkles, X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserExpertise } from "@/hooks/useUserExpertise";
import { useLegalCases } from "@/hooks/useLegalCases";
import { CaseData } from "@/components/CaseCard";

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
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { expertise: userExpertise, isLoading: expertiseLoading } = useUserExpertise();
  const { cases, isLoading: casesLoading, addCase } = useLegalCases();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [yearRange, setYearRange] = useState<[number, number]>([2015, 2024]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRelevantOnly, setShowRelevantOnly] = useState(true);
  
  // Case comparison state
  const [selectedCasesForComparison, setSelectedCasesForComparison] = useState<CaseData[]>([]);
  const [showComparisonPanel, setShowComparisonPanel] = useState(false);
  const selectedCaseIds = useMemo(() => new Set(selectedCasesForComparison.map(c => c.id)), [selectedCasesForComparison]);
  const maxSelectionsReached = selectedCasesForComparison.length >= 3;

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

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

  // Case comparison handlers
  const handleToggleCaseSelect = useCallback((caseData: CaseData) => {
    setSelectedCasesForComparison(prev => {
      const isAlreadySelected = prev.some(c => c.id === caseData.id);
      if (isAlreadySelected) {
        return prev.filter(c => c.id !== caseData.id);
      }
      if (prev.length >= 3) {
        return prev; // Max 3 selections
      }
      return [...prev, caseData];
    });
  }, []);

  const handleClearCaseSelection = useCallback(() => {
    setSelectedCasesForComparison([]);
  }, []);

  const handleRemoveCaseFromSelection = useCallback((caseId: string) => {
    setSelectedCasesForComparison(prev => prev.filter(c => c.id !== caseId));
  }, []);

  const handleOpenComparison = useCallback(() => {
    if (selectedCasesForComparison.length >= 2) {
      setShowComparisonPanel(true);
    }
  }, [selectedCasesForComparison.length]);

  const handleCloseComparison = useCallback(() => {
    setShowComparisonPanel(false);
  }, []);

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
    let results = cases.map((c) => ({
      id: c.id,
      name: c.name,
      citation: c.citation,
      year: c.year,
      court: c.court,
      verdict: c.verdict,
      summary: c.summary,
      tags: c.tags || [],
      precedent_strength: c.precedent_strength ?? undefined,
      citation_risk: (c.citation_risk as 'safe' | 'weak') ?? undefined,
      outcome_alignment: (c.outcome_alignment as 'plaintiff' | 'defendant' | 'neutral') ?? undefined,
      ratio_decidendi: c.ratio_decidendi ?? undefined,
      cited_by_count: c.cited_by_count ?? undefined,
    }));

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
        const courtMap: Record<string, string> = {
          "Supreme Court": "supreme",
          "High Court": "high",
          "Appellate Court": "appellate",
          "District Court": "district",
          "State Court": "state",
        };

        const verdictMap: Record<string, string> = {
          "Allowed": "allowed",
          "Dismissed": "dismissed",
          "Remanded": "remanded",
          "Reversed": "reversed",
          "Settled": "settled",
        };

        const courtFilterActive = selectedFilters.has(courtMap[c.court]);
        const verdictFilterActive = selectedFilters.has(verdictMap[c.verdict]);

        const hasCourtFilters = ["supreme", "high", "appellate", "district", "state"].some(
          (court) => selectedFilters.has(court)
        );

        const hasVerdictFilters = ["allowed", "dismissed", "remanded", "reversed", "settled"].some(
          (verdict) => selectedFilters.has(verdict)
        );

        if (hasCourtFilters && hasVerdictFilters) {
          return courtFilterActive && verdictFilterActive;
        }

        if (hasCourtFilters) {
          return courtFilterActive;
        }

        if (hasVerdictFilters) {
          return verdictFilterActive;
        }

        return true;
      });
    }

    return results;
  }, [cases, searchTerm, selectedFilters, yearRange, showRelevantOnly, userExpertise, relevantTags]);

  if (authLoading || expertiseLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

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
              onSubmit={async (caseData) => {
                await addCase(caseData);
                setShowAddForm(false);
              }}
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

              {casesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-navy" />
                </div>
              ) : (
                <ResultsGrid 
                  cases={filteredCases} 
                  searchTerm={searchTerm}
                  selectedCaseIds={selectedCaseIds}
                  onToggleCaseSelect={handleToggleCaseSelect}
                  maxSelectionsReached={maxSelectionsReached}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Comparison Selection Bar */}
      <ComparisonSelectionBar
        selectedCases={selectedCasesForComparison}
        onClearSelection={handleClearCaseSelection}
        onCompare={handleOpenComparison}
        onRemoveCase={handleRemoveCaseFromSelection}
      />

      {/* Comparison Panel Modal */}
      {showComparisonPanel && (
        <CaseComparisonPanel
          selectedCases={selectedCasesForComparison}
          onClose={handleCloseComparison}
          onRemoveCase={handleRemoveCaseFromSelection}
        />
      )}
    </div>
  );
};

export default Dashboard;
