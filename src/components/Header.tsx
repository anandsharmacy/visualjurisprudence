import { Scale, Plus } from "lucide-react";

interface HeaderProps {
  onAddCase?: () => void;
  showAddButton?: boolean;
}

const Header = ({ onAddCase, showAddButton = true }: HeaderProps) => {
  return (
    <header className="w-full bg-primary text-primary-foreground py-4 px-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale className="h-8 w-8 text-gold" />
          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-wide">
            Visual Jurisprudence Dashboard
          </h1>
        </div>
        
        {showAddButton && onAddCase && (
          <button
            onClick={onAddCase}
            className="
              flex items-center gap-2 px-4 py-2.5
              bg-transparent text-gold font-medium
              border-2 border-gold rounded-lg
              transition-all duration-200
              hover:bg-gold hover:text-navy
            "
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add New Case</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
