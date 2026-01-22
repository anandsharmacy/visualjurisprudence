import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search cases by name, citation, keywords, or legal issues..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-14 pl-12 pr-4 text-base bg-card border-2 border-primary/20 rounded-lg focus:border-gold focus:ring-gold/20 placeholder:text-muted-foreground/60"
      />
    </div>
  );
};

export default SearchBar;
