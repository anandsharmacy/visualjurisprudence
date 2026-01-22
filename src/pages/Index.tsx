import { useNavigate } from "react-router-dom";
import { Scale, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="animate-fade-in">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-navy rounded-full shadow-lg">
              <Scale className="h-12 w-12 text-gold" />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-navy mb-4 leading-tight">
            Visual Jurisprudence
            <br />
            Dashboard
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-muted-foreground font-sans max-w-lg mx-auto mb-8">
            A modern platform for legal research. Search, filter, and cite case law with professional precision.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => navigate("/auth")}
            className="
              inline-flex items-center gap-3 px-8 py-4
              bg-navy text-white font-medium text-lg
              rounded-lg shadow-lg
              transition-all duration-300
              border-2 border-navy
              hover:border-gold hover:shadow-elevated hover:scale-[1.02]
            "
          >
            <span>Access Dashboard</span>
            <ArrowRight className="h-5 w-5" />
          </button>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold" />
              <span>Institutional-Grade Security</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold" />
              <span>Verified Citations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold" />
              <span>Comprehensive Database</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-border">
        <p className="text-sm text-muted-foreground">
          © 2024 Visual Jurisprudence Dashboard. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Index;
