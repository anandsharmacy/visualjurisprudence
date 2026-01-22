import { Scale } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full bg-primary text-primary-foreground py-4 px-6 shadow-lg">
      <div className="flex items-center gap-3">
        <Scale className="h-8 w-8 text-gold" />
        <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-wide">
          Visual Jurisprudence Dashboard
        </h1>
      </div>
    </header>
  );
};

export default Header;
