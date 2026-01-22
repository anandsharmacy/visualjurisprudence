import { Scale, Plus, LogOut, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  onAddCase?: () => void;
  showAddButton?: boolean;
  canAddCases?: boolean;
}

const Header = ({ onAddCase, showAddButton = true, canAddCases = true }: HeaderProps) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  return (
    <header className="w-full bg-primary text-primary-foreground py-4 px-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale className="h-8 w-8 text-gold" />
          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-wide">
            Visual Jurisprudence Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {showAddButton && onAddCase && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onAddCase}
                    className={`
                      flex items-center gap-2 px-4 py-2.5
                      font-medium border-2 rounded-lg
                      transition-all duration-200
                      ${canAddCases 
                        ? "bg-transparent text-gold border-gold hover:bg-gold hover:text-navy" 
                        : "bg-transparent text-white/50 border-white/30 cursor-not-allowed"
                      }
                    `}
                  >
                    {canAddCases ? (
                      <Plus className="h-5 w-5" />
                    ) : (
                      <ShieldAlert className="h-5 w-5" />
                    )}
                    <span className="hidden sm:inline">Add New Case</span>
                  </button>
                </TooltipTrigger>
                {!canAddCases && (
                  <TooltipContent side="bottom" className="bg-navy text-white">
                    <p>Requires more than 5 years of experience</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}

          {user && (
            <button
              onClick={handleSignOut}
              className="
                flex items-center gap-2 px-4 py-2.5
                bg-transparent text-white/80 font-medium
                border-2 border-white/30 rounded-lg
                transition-all duration-200
                hover:border-white hover:text-white
              "
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
