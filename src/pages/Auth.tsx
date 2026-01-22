import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, Mail, Lock, ArrowRight, User, Briefcase, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const EXPERTISE_OPTIONS = [
  "Criminal Cases",
  "Domestic Cases",
  "Family Cases",
  "Constitutional Cases",
  "Corporate / Commercial Cases",
  "Intellectual Property (IP) Cases",
  "Labor / Employment Cases",
  "Administrative / Regulatory Cases",
  "Property / Real Estate Cases",
  "Consumer Cases",
  "Environmental Cases",
  "Cyber & Technology Law Cases",
  "Human Rights Cases",
  "Taxation Cases",
  "Arbitration & ADR",
  "Banking & Finance Cases",
  "International Law Cases",
  "Immigration & Citizenship Cases",
  "Public Interest Litigation (PIL)",
  "Military / Defense Cases",
];

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleExpertiseToggle = (expertise: string) => {
    setSelectedExpertise((prev) =>
      prev.includes(expertise)
        ? prev.filter((e) => e !== expertise)
        : [...prev, expertise]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in email and password");
      return;
    }

    if (isSignUp) {
      if (!fullName) {
        toast.error("Please enter your full name");
        return;
      }
      if (selectedExpertise.length === 0) {
        toast.error("Please select at least one area of expertise");
        return;
      }
      if (!yearsOfExperience || parseInt(yearsOfExperience) < 0) {
        toast.error("Please enter valid years of experience");
        return;
      }
    }

    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (isSignUp) {
      // Store user expertise for personalized filtering
      localStorage.setItem("userExpertise", JSON.stringify(selectedExpertise));
      localStorage.setItem("userYearsExperience", yearsOfExperience);
      localStorage.setItem("userName", fullName);
      
      toast.success("Account created successfully!", {
        description: "Welcome to Visual Jurisprudence Dashboard",
      });
    } else {
      toast.success("Welcome back!", {
        description: "Redirecting to dashboard...",
      });
    }

    setTimeout(() => {
      navigate("/dashboard");
    }, 500);

    setIsLoading(false);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setYearsOfExperience("");
    setSelectedExpertise([]);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className={`w-full ${isSignUp ? "max-w-2xl" : "max-w-md"} bg-card rounded-xl shadow-elevated p-8 animate-fade-in`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-navy rounded-full">
              <Scale className="h-8 w-8 text-gold" />
            </div>
          </div>
          <h1 className="font-serif text-2xl font-bold text-navy mb-2">
            Visual Jurisprudence Dashboard
          </h1>
          <p className="text-muted-foreground font-sans text-sm">
            {isSignUp
              ? "Create your account to access legal precedents."
              : "Please sign in to access legal precedents."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="text-navy font-medium text-sm flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 border-2 border-navy/20 focus:border-navy focus:ring-navy/20 bg-white"
              />
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-navy font-medium text-sm flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@lawfirm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border-2 border-navy/20 focus:border-navy focus:ring-navy/20 bg-white"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-navy font-medium text-sm flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 border-2 border-navy/20 focus:border-navy focus:ring-navy/20 bg-white"
            />
          </div>

          {isSignUp && (
            <>
              {/* Years of Experience */}
              <div className="space-y-2">
                <Label
                  htmlFor="experience"
                  className="text-navy font-medium text-sm flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Years of Experience
                </Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  max="60"
                  placeholder="e.g., 5"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  className="h-12 border-2 border-navy/20 focus:border-navy focus:ring-navy/20 bg-white"
                />
              </div>

              {/* Expertise Areas */}
              <div className="space-y-3">
                <Label className="text-navy font-medium text-sm flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Areas of Expertise
                </Label>
                <p className="text-xs text-muted-foreground">
                  Select all areas you specialize in
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border-2 border-navy/20 rounded-lg p-3 bg-white">
                  {EXPERTISE_OPTIONS.map((expertise) => (
                    <div
                      key={expertise}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={expertise}
                        checked={selectedExpertise.includes(expertise)}
                        onCheckedChange={() => handleExpertiseToggle(expertise)}
                        className="border-navy/40 data-[state=checked]:bg-navy data-[state=checked]:border-navy"
                      />
                      <label
                        htmlFor={expertise}
                        className="text-xs text-navy cursor-pointer leading-tight"
                      >
                        {expertise}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedExpertise.length > 0 && (
                  <p className="text-xs text-gold font-medium">
                    {selectedExpertise.length} area(s) selected
                  </p>
                )}
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full h-12 mt-2 
              bg-navy text-white font-medium 
              rounded-lg flex items-center justify-center gap-2
              transition-all duration-200
              border-2 border-navy
              hover:border-gold hover:shadow-lg
              disabled:opacity-70 disabled:cursor-not-allowed
            "
          >
            {isLoading ? (
              <span className="animate-pulse">
                {isSignUp ? "Creating Account..." : "Signing in..."}
              </span>
            ) : (
              <>
                <span>{isSignUp ? "Create Account" : "Login"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Secondary Actions */}
        <div className="mt-6 space-y-3 text-center">
          {!isSignUp && (
            <a
              href="#"
              className="text-sm text-navy hover:text-gold transition-colors font-medium block"
              onClick={(e) => {
                e.preventDefault();
                toast.info("Password reset functionality coming soon");
              }}
            >
              Forgot Password?
            </a>
          )}
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <a
              href="#"
              className="text-navy font-medium hover:text-gold transition-colors"
              onClick={(e) => {
                e.preventDefault();
                resetForm();
                setIsSignUp(!isSignUp);
              }}
            >
              {isSignUp ? "Sign In" : "Create Account"}
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Protected by institutional-grade security
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
