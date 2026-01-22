import { useState } from "react";
import { X, Upload, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AddCaseFormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

const AddCaseForm = ({ onCancel, onSubmit }: AddCaseFormProps) => {
  const [formData, setFormData] = useState({
    caseName: "",
    citation: "",
    year: "",
    court: "",
    verdict: "",
    summary: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.caseName || !formData.citation || !formData.year || !formData.court || !formData.verdict || !formData.summary) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Case Submitted Successfully!", {
      description: `"${formData.caseName}" has been added to the database.`,
    });

    setIsSubmitting(false);
    onSubmit();
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Page Title */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-8 w-8 text-gold" />
          <h2 className="font-serif text-3xl font-bold text-navy">
            Submit New Legal Precedent
          </h2>
        </div>
        <p className="text-muted-foreground">
          Add a new case to the jurisprudence database. All fields are required.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-card p-8">
        <div className="space-y-6">
          {/* Case Name */}
          <div className="space-y-2">
            <Label htmlFor="caseName" className="text-navy font-medium">
              Case Name
            </Label>
            <Input
              id="caseName"
              type="text"
              placeholder="e.g., Smith v. State of Maharashtra"
              value={formData.caseName}
              onChange={(e) => handleInputChange("caseName", e.target.value)}
              className="h-12 border-2 border-navy/20 focus:border-navy bg-white"
            />
          </div>

          {/* Citation and Year - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="citation" className="text-navy font-medium">
                Citation
              </Label>
              <Input
                id="citation"
                type="text"
                placeholder="e.g., (2024) 5 SCC 1"
                value={formData.citation}
                onChange={(e) => handleInputChange("citation", e.target.value)}
                className="h-12 border-2 border-navy/20 focus:border-navy bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="text-navy font-medium">
                Year
              </Label>
              <Input
                id="year"
                type="number"
                placeholder="e.g., 2024"
                min="1900"
                max="2099"
                value={formData.year}
                onChange={(e) => handleInputChange("year", e.target.value)}
                className="h-12 border-2 border-navy/20 focus:border-navy bg-white"
              />
            </div>
          </div>

          {/* Court Level and Verdict - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="court" className="text-navy font-medium">
                Court Level
              </Label>
              <Select
                value={formData.court}
                onValueChange={(value) => handleInputChange("court", value)}
              >
                <SelectTrigger className="h-12 border-2 border-navy/20 focus:border-navy bg-white">
                  <SelectValue placeholder="Select court level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Supreme Court">Supreme Court</SelectItem>
                  <SelectItem value="High Court">High Court</SelectItem>
                  <SelectItem value="Tribunal">Tribunal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verdict" className="text-navy font-medium">
                Verdict
              </Label>
              <Select
                value={formData.verdict}
                onValueChange={(value) => handleInputChange("verdict", value)}
              >
                <SelectTrigger className="h-12 border-2 border-navy/20 focus:border-navy bg-white">
                  <SelectValue placeholder="Select verdict" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Allowed">ALLOWED</SelectItem>
                  <SelectItem value="Dismissed">DISMISSED</SelectItem>
                  <SelectItem value="Pending">PENDING</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Case Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary" className="text-navy font-medium">
              Case Summary
            </Label>
            <Textarea
              id="summary"
              placeholder="Provide a concise summary of the case, including key holdings and legal principles established..."
              value={formData.summary}
              onChange={(e) => handleInputChange("summary", e.target.value)}
              className="min-h-[150px] border-2 border-navy/20 focus:border-navy bg-white resize-none"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="
              px-6 py-3 font-medium
              bg-transparent text-navy
              border-2 border-navy/30 rounded-lg
              transition-all duration-200
              hover:border-navy hover:bg-navy/5
            "
          >
            <div className="flex items-center gap-2">
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </div>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="
              px-6 py-3 font-medium
              bg-navy text-white
              border-2 border-navy rounded-lg
              transition-all duration-200
              hover:bg-navy-light hover:border-gold
              disabled:opacity-70 disabled:cursor-not-allowed
            "
          >
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>{isSubmitting ? "Publishing..." : "Publish Case"}</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCaseForm;
