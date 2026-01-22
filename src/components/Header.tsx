import { Scale, Plus, LogOut, ShieldAlert, User, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onAddCase?: () => void;
  showAddButton?: boolean;
  canAddCases?: boolean;
  userName?: string;
  yearsOfExperience?: number | null;
}

const Header = ({ 
  onAddCase, 
  showAddButton = true, 
  canAddCases = true,
  userName,
  yearsOfExperience 
}: HeaderProps) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const getExperienceLabel = (years: number | null | undefined) => {
    if (years === null || years === undefined) return "New Member";
    if (years <= 2) return "Associate";
    if (years <= 5) return "Mid-Level";
    if (years <= 10) return "Senior";
    if (years <= 20) return "Expert";
    return "Distinguished";
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

        <div className="flex items-center gap-4">
          {/* User Profile Info */}
          {user && userName && (
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg border border-white/20">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gold" />
                <span className="text-sm font-medium text-white">{userName}</span>
              </div>
              <div className="w-px h-4 bg-white/30" />
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gold" />
                <span className="text-sm text-white/80">
                  {yearsOfExperience ?? 0} {yearsOfExperience === 1 ? 'year' : 'years'}
                </span>
              </div>
              <Badge 
                variant="secondary" 
                className="bg-gold/20 text-gold border-gold/30 text-xs"
              >
                {getExperienceLabel(yearsOfExperience)}
              </Badge>
            </div>
          )}

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
