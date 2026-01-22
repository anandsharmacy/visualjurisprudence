import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, Mail, Lock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    // Simulate login delay for UX
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    toast.success("Welcome back!", {
      description: "Redirecting to dashboard...",
    });
    
    setTimeout(() => {
      navigate("/dashboard");
    }, 500);
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Login Card */}
      <div className="w-full max-w-md bg-card rounded-xl shadow-elevated p-8 animate-fade-in">
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
            Please sign in to access legal precedents.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
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

          {/* Login Button */}
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
              <span className="animate-pulse">Signing in...</span>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Secondary Actions */}
        <div className="mt-6 space-y-3 text-center">
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
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a 
              href="#" 
              className="text-navy font-medium hover:text-gold transition-colors"
              onClick={(e) => {
                e.preventDefault();
                toast.info("Please contact your administrator for access");
              }}
            >
              Request Access
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
