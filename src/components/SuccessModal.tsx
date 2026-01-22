import { CheckCircle, BookOpen, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseName: string;
}

const SuccessModal = ({ isOpen, onClose, caseName }: SuccessModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-2 border-gold/30">
        <DialogHeader className="text-center items-center pt-4">
          <div className="relative mb-4">
            {/* Animated success ring */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center animate-pulse">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            {/* Sparkle decorations */}
            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-gold animate-pulse" />
            <Sparkles className="absolute -bottom-1 -left-1 w-4 h-4 text-gold/70 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          
          <DialogTitle className="font-serif text-2xl text-navy text-center">
            Precedent Successfully Indexed
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground mt-2">
            into Jurisprudence Database
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 mb-6">
          <div className="bg-navy/5 border border-navy/10 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-gold" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                New Entry
              </span>
            </div>
            <p className="font-serif text-lg text-navy font-semibold">
              {caseName}
            </p>
          </div>
        </div>

        <div className="flex justify-center pb-2">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-navy text-white font-medium rounded-lg transition-all duration-200 hover:bg-navy-light hover:shadow-lg"
          >
            Continue to Dashboard
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
