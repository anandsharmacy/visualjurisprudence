import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";

// Use the bundled worker from the package
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface ExtractedCaseData {
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
}

interface PdfDropzoneProps {
  onDataExtracted: (data: ExtractedCaseData) => void;
}

type AnalysisStatus = "idle" | "extracting" | "analyzing" | "success" | "error";

const PdfDropzone = ({ onDataExtracted }: PdfDropzoneProps) => {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";
    const numPages = Math.min(pdf.numPages, 50); // Limit to first 50 pages

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  };

  const analyzeCaseText = async (text: string): Promise<ExtractedCaseData> => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-case-pdf`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new Error("AI credits depleted. Please add funds to continue.");
      }
      throw new Error(errorData.error || "Failed to analyze document");
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Analysis failed");
    }

    return result.data;
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.includes("pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }

    setFileName(file.name);
    setErrorMessage("");
    setStatus("extracting");

    try {
      // Step 1: Extract text from PDF
      const extractedText = await extractTextFromPdf(file);
      
      if (!extractedText.trim()) {
        throw new Error("Could not extract text from PDF. The file may be scanned or image-based.");
      }

      // Step 2: Send to AI for analysis
      setStatus("analyzing");
      const analysisResult = await analyzeCaseText(extractedText);
      
      setStatus("success");
      toast.success("PDF analyzed successfully! Form fields populated.");
      onDataExtracted(analysisResult);

      // Reset after a delay
      setTimeout(() => {
        setStatus("idle");
        setFileName("");
      }, 3000);
    } catch (error) {
      console.error("PDF processing error:", error);
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to process PDF");
      toast.error(error instanceof Error ? error.message : "Failed to process PDF");
    }
  }, [onDataExtracted]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = () => {
    if (status === "idle" || status === "error" || status === "success") {
      fileInputRef.current?.click();
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input to allow selecting the same file again
    e.target.value = "";
  };

  const getStatusContent = () => {
    switch (status) {
      case "extracting":
        return (
          <>
            <Loader2 className="h-8 w-8 text-gold animate-spin" />
            <div className="text-center">
              <p className="font-medium text-navy">Extracting text from PDF...</p>
              <p className="text-sm text-muted-foreground">{fileName}</p>
            </div>
          </>
        );
      case "analyzing":
        return (
          <>
            <Loader2 className="h-8 w-8 text-gold animate-spin" />
            <div className="text-center">
              <p className="font-medium text-navy">AI analyzing legal content...</p>
              <p className="text-sm text-muted-foreground">Extracting case details, citations, and legal principles</p>
            </div>
          </>
        );
      case "success":
        return (
          <>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div className="text-center">
              <p className="font-medium text-green-700">Analysis Complete!</p>
              <p className="text-sm text-muted-foreground">Form fields have been populated</p>
            </div>
          </>
        );
      case "error":
        return (
          <>
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div className="text-center">
              <p className="font-medium text-red-600">Analysis Failed</p>
              <p className="text-sm text-red-500">{errorMessage}</p>
              <p className="text-xs text-muted-foreground mt-2">Click to try again</p>
            </div>
          </>
        );
      default:
        return (
          <>
            <div className={`p-3 rounded-full ${isDragOver ? "bg-gold/20" : "bg-navy/5"} transition-colors`}>
              {isDragOver ? (
                <FileText className="h-8 w-8 text-gold" />
              ) : (
                <Upload className="h-8 w-8 text-navy/60" />
              )}
            </div>
            <div className="text-center">
              <p className="font-medium text-navy">
                {isDragOver ? "Drop PDF here" : "Upload Court Judgment (PDF)"}
              </p>
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to select • AI will auto-fill form fields
              </p>
            </div>
          </>
        );
    }
  };

  const isClickable = status === "idle" || status === "error" || status === "success";

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-200
        ${isDragOver 
          ? "border-gold bg-gold/5" 
          : status === "error"
            ? "border-red-300 bg-red-50"
            : status === "success"
              ? "border-green-300 bg-green-50"
              : "border-navy/30 hover:border-gold/60 hover:bg-gold/5"
        }
        ${isClickable ? "cursor-pointer" : "cursor-default"}
        min-h-[120px]
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileInput}
        className="hidden"
      />
      {getStatusContent()}
    </div>
  );
};

export default PdfDropzone;
