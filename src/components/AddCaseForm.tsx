import { useState, useCallback } from "react";
import { X, Upload, FileText, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import CaseCardPreview from "./CaseCardPreview";
import SuccessModal from "./SuccessModal";
import PdfDropzone from "./PdfDropzone";

interface AddCaseFormProps {
  onCancel: () => void;
  onSubmit: (caseData: {
    name: string;
    citation: string;
    year: number;
    court: string;
    verdict: string;
    summary: string;
    tags?: string[];
    precedent_strength?: number;
    citation_risk?: string;
    outcome_alignment?: string;
    ratio_decidendi?: string;
    cited_by_count?: number;
  }) => Promise<void>;
}

const AddCaseForm = ({ onCancel, onSubmit }: AddCaseFormProps) => {
  const [formData, setFormData] = useState({
    caseName: "",
    citation: "",
    year: "",
    court: "",
    verdict: "",
    summary: "",
    tags: "",
    precedentStrength: 75,
    citationRisk: "",
    outcomeAlignment: "",
    citedByCount: "",
    ratioDecidendi: "",
    obiterDicta: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedCaseName, setSubmittedCaseName] = useState("");

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSliderChange = (value: number[]) => {
    setFormData((prev) => ({ ...prev, precedentStrength: value[0] }));
  };

  // Handle PDF extracted data
  const handlePdfDataExtracted = useCallback((data: {
    caseName?: string;
    citation?: string;
    year?: number;
    courtLevel?: string;
    verdict?: string;
    summary?: string;
    ratioDecidendi?: string;
    precedentStrength?: number;
    citationRisk?: string;
    outcomeAlignment?: string;
    tags?: string[];
  }) => {
    setFormData((prev) => ({
      ...prev,
      caseName: data.caseName || prev.caseName,
      citation: data.citation || prev.citation,
      year: data.year?.toString() || prev.year,
      court: data.courtLevel || prev.court,
      verdict: data.verdict || prev.verdict,
      summary: data.summary || prev.summary,
      ratioDecidendi: data.ratioDecidendi || prev.ratioDecidendi,
      precedentStrength: data.precedentStrength ?? prev.precedentStrength,
      tags: data.tags?.join(", ") || prev.tags,
      // Map citationRisk to display format
      citationRisk: data.citationRisk === "safe" 
        ? "🟢 Safe to Cite" 
        : data.citationRisk === "caution" 
          ? "🟡 Use with Caution" 
          : data.citationRisk === "weak" 
            ? "🔴 Weak / Overruled" 
            : prev.citationRisk,
      // Map outcomeAlignment to display format
      outcomeAlignment: data.outcomeAlignment === "plaintiff"
        ? "Supports Plaintiff"
        : data.outcomeAlignment === "defendant"
          ? "Supports Defendant"
          : data.outcomeAlignment === "neutral"
            ? "Neutral/Mixed"
            : prev.outcomeAlignment,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.caseName || !formData.citation || !formData.year || !formData.court || !formData.verdict || !formData.summary) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Map citation risk to database format
      let citationRiskValue = 'safe';
      if (formData.citationRisk.includes('Caution')) {
        citationRiskValue = 'caution';
      } else if (formData.citationRisk.includes('Weak')) {
        citationRiskValue = 'weak';
      }

      // Map outcome alignment to database format
      let outcomeValue = 'neutral';
      if (formData.outcomeAlignment.includes('Plaintiff')) {
        outcomeValue = 'plaintiff';
      } else if (formData.outcomeAlignment.includes('Defendant')) {
        outcomeValue = 'defendant';
      }

      await onSubmit({
        name: formData.caseName,
        citation: formData.citation,
        year: parseInt(formData.year),
        court: formData.court,
        verdict: formData.verdict,
        summary: formData.summary,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
        precedent_strength: formData.precedentStrength,
        citation_risk: citationRiskValue,
        outcome_alignment: outcomeValue,
        ratio_decidendi: formData.ratioDecidendi || undefined,
        cited_by_count: formData.citedByCount ? parseInt(formData.citedByCount) : 0,
      });

      setSubmittedCaseName(formData.caseName);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error submitting case:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onCancel(); // Return to dashboard
  };

  // Prepare preview data
  const previewData = {
    name: formData.caseName,
    citation: formData.citation,
    year: formData.year,
    court: formData.court,
    verdict: formData.verdict,
    summary: formData.summary,
    tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    precedent_strength: formData.precedentStrength,
    citation_risk: formData.citationRisk || 'safe',
    outcome_alignment: formData.outcomeAlignment || 'neutral',
    ratio_decidendi: formData.ratioDecidendi,
    cited_by_count: formData.citedByCount ? parseInt(formData.citedByCount) : 0,
  };

  return (
    <>
      <div className="animate-fade-in">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-gold" />
              <h2 className="font-serif text-3xl font-bold text-navy">
                Submit New Legal Precedent
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="preview-toggle" className="text-sm text-muted-foreground">
                Draft Preview
              </Label>
              <Switch
                id="preview-toggle"
                checked={showPreview}
                onCheckedChange={setShowPreview}
              />
              {showPreview ? (
                <Eye className="h-4 w-4 text-gold" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <p className="text-muted-foreground">
            Add a new case to the jurisprudence database with comprehensive intelligence metrics.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-5' : 'lg:grid-cols-1 max-w-3xl'}`}>
          {/* Left Column - Form (60%) */}
          <form onSubmit={handleSubmit} className={`bg-card rounded-xl shadow-card p-8 ${showPreview ? 'lg:col-span-3' : ''}`}>
            {/* Section: PDF Upload */}
            <div className="mb-8">
              <h3 className="font-serif text-xl text-gold font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gold rounded-full" />
                AI-Powered Auto-Fill
              </h3>
              <PdfDropzone onDataExtracted={handlePdfDataExtracted} />
            </div>

            {/* Section: Core Identity */}
            <div className="mb-8">
              <h3 className="font-serif text-xl text-gold font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gold rounded-full" />
                Core Identity
              </h3>
              <div className="space-y-4">
                {/* Case Name */}
                <div className="space-y-2">
                  <Label htmlFor="caseName" className="text-navy font-medium">
                    Case Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="caseName"
                    type="text"
                    placeholder="e.g., Smith v. State of Maharashtra"
                    value={formData.caseName}
                    onChange={(e) => handleInputChange("caseName", e.target.value)}
                    className="h-12 border-2 border-navy/20 focus:border-gold focus:ring-gold/20 bg-white transition-all duration-200"
                  />
                </div>

                {/* Citation and Year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="citation" className="text-navy font-medium">
                      Citation <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="citation"
                      type="text"
                      placeholder="e.g., (2024) 5 SCC 1"
                      value={formData.citation}
                      onChange={(e) => handleInputChange("citation", e.target.value)}
                      className="h-12 border-2 border-navy/20 focus:border-gold focus:ring-gold/20 bg-white transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-navy font-medium">
                      Year <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="e.g., 2024"
                      min="1900"
                      max="2099"
                      value={formData.year}
                      onChange={(e) => handleInputChange("year", e.target.value)}
                      className="h-12 border-2 border-navy/20 focus:border-gold focus:ring-gold/20 bg-white transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Court Level and Verdict */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="court" className="text-navy font-medium">
                      Court Level <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.court}
                      onValueChange={(value) => handleInputChange("court", value)}
                    >
                      <SelectTrigger className="h-12 border-2 border-navy/20 focus:border-gold focus:ring-gold/20 bg-white">
                        <SelectValue placeholder="Select court level" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-navy/20">
                        <SelectItem value="Supreme Court">Supreme Court</SelectItem>
                        <SelectItem value="High Court">High Court</SelectItem>
                        <SelectItem value="Tribunal">Tribunal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verdict" className="text-navy font-medium">
                      Verdict <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.verdict}
                      onValueChange={(value) => handleInputChange("verdict", value)}
                    >
                      <SelectTrigger className="h-12 border-2 border-navy/20 focus:border-gold focus:ring-gold/20 bg-white">
                        <SelectValue placeholder="Select verdict" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-navy/20">
                        <SelectItem value="Allowed">ALLOWED</SelectItem>
                        <SelectItem value="Dismissed">DISMISSED</SelectItem>
                        <SelectItem value="Pending">PENDING</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-navy font-medium">
                    Tags (comma-separated)
                  </Label>
                  <Input
                    id="tags"
                    type="text"
                    placeholder="e.g., Constitutional Law, Civil Rights"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                    className="h-12 border-2 border-navy/20 focus:border-gold focus:ring-gold/20 bg-white transition-all duration-200"
                  />
                </div>

                {/* Case Summary */}
                <div className="space-y-2">
                  <Label htmlFor="summary" className="text-navy font-medium">
                    Case Summary <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="summary"
                    placeholder="Provide a concise summary of the case, including key holdings and legal principles established..."
                    value={formData.summary}
                    onChange={(e) => handleInputChange("summary", e.target.value)}
                    className="min-h-[120px] border-2 border-navy/20 focus:border-gold focus:ring-gold/20 bg-white resize-none transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Section: Intelligence Metrics */}
            <div className="mb-8">
              <h3 className="font-serif text-xl text-gold font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gold rounded-full" />
                Intelligence Metrics
              </h3>
              <div className="space-y-6">
                {/* Precedent Strength */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="precedentStrength" className="text-navy font-medium">
                      Precedent Strength (Authority Level)
                    </Label>
                    <span className="text-lg font-bold text-gold">{formData.precedentStrength}/100</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.precedentStrength}
                      onChange={(e) => handleInputChange("precedentStrength", parseInt(e.target.value) || 0)}
                      className="w-20 h-10 border-2 border-navy/20 focus:border-gold focus:ring-gold/20 bg-white text-center"
                    />
                    <Slider
                      value={[formData.precedentStrength]}
                      onValueChange={handleSliderChange}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Citation Risk and Outcome Alignment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="citationRisk" className="text-navy font-medium">
                      Citation Risk Indicator
                    </Label>
                    <Select
                      value={formData.citationRisk}
                      onValueChange={(value) => handleInputChange("citationRisk", value)}
                    >
                      <SelectTrigger className="h-12 border-2 border-navy/20 focus:border-gold focus:ring-gold/20 bg-white">
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-navy/20">
                        <SelectItem value="🟢 Safe to Cite">
                          <span className="flex items-center gap-2">🟢 Safe to Cite</span>
                        </SelectItem>
                        <SelectItem value="🟡 Use with Caution">
                          <span className="flex items-center gap-2">🟡 Use with Caution</span>
                        </SelectItem>
                        <SelectItem value="🔴 Weak / Overruled">
                          <span className="flex items-center gap-2">🔴 Weak / Overruled</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outcomeAlignment" className="text-navy font-medium">
                      Outcome Alignment
                    </Label>
                    <Select
                      value={formData.outcomeAlignment}
                      onValueChange={(value) => handleInputChange("outcomeAlignment", value)}
                    >
                      <SelectTrigger className="h-12 border-2 border-navy/20 focus:border-gold focus:ring-gold/20 bg-white">
                        <SelectValue placeholder="Select alignment" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-navy/20">
                        <SelectItem value="Supports Plaintiff">Supports Plaintiff</SelectItem>
                        <SelectItem value="Supports Defendant">Supports Defendant</SelectItem>
                        <SelectItem value="Neutral/Mixed">Neutral/Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Influence Metrics */}
                <div className="space-y-2">
                  <Label htmlFor="citedByCount" className="text-navy font-medium">
                    Total Citations in Later Judgments
                  </Label>
                  <Input
                    id="citedByCount"
                    type="number"
                    min="0"
                    placeholder="e.g., 142"
                    value={formData.citedByCount}
                    onChange={(e) => handleInputChange("citedByCount", e.target.value)}
                    className="h-12 border-2 border-navy/20 focus:border-gold focus:ring-gold/20 bg-white transition-all duration-200 max-w-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section: Legal Reasoning */}
            <div className="mb-8">
              <h3 className="font-serif text-xl text-gold font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gold rounded-full" />
                Legal Reasoning
              </h3>
              <div className="space-y-4">
                {/* Ratio Decidendi */}
                <div className="space-y-2">
                  <Label htmlFor="ratioDecidendi" className="text-navy font-medium">
                    Ratio Decidendi (Core Legal Ruling)
                  </Label>
                  <p className="text-xs text-muted-foreground -mt-1">
                    The essential legal principle that forms the binding precedent
                  </p>
                  <Textarea
                    id="ratioDecidendi"
                    placeholder="The court held that..."
                    value={formData.ratioDecidendi}
                    onChange={(e) => handleInputChange("ratioDecidendi", e.target.value)}
                    className="min-h-[100px] border-2 border-navy/20 focus:border-gold focus:ring-gold/20 bg-white resize-none transition-all duration-200"
                  />
                </div>

                {/* Obiter Dicta */}
                <div className="space-y-2">
                  <Label htmlFor="obiterDicta" className="text-navy font-medium">
                    Obiter Dicta (Non-binding Remarks)
                  </Label>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Additional observations or opinions not central to the final judgment
                  </p>
                  <Textarea
                    id="obiterDicta"
                    placeholder="The court also observed that..."
                    value={formData.obiterDicta}
                    onChange={(e) => handleInputChange("obiterDicta", e.target.value)}
                    className="min-h-[100px] border-2 border-navy/20 focus:border-gold focus:ring-gold/20 bg-white resize-none transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 font-medium bg-transparent text-navy border-2 border-navy/30 rounded-lg transition-all duration-200 hover:border-navy hover:bg-navy/5"
              >
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </div>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 font-medium bg-navy text-white border-2 border-navy rounded-lg transition-all duration-200 hover:bg-navy-light hover:border-gold disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>{isSubmitting ? "Publishing..." : "Publish Case"}</span>
                </div>
              </button>
            </div>
          </form>

          {/* Right Column - Real-time Preview (40%) */}
          {showPreview && (
            <div className="lg:col-span-2">
              <div className="sticky top-6">
                <div className="bg-cream-dark rounded-xl p-4 border border-navy/10">
                  <h4 className="font-serif text-lg text-navy font-semibold mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gold" />
                    Real-time Card Preview
                  </h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    This is how your case will appear on the dashboard
                  </p>
                  <CaseCardPreview caseData={previewData} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        caseName={submittedCaseName}
      />
    </>
  );
};

export default AddCaseForm;
