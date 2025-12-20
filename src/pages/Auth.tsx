import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Mail, Phone, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
  });

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendOTP = () => {
    if (!formData.phone || formData.phone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "OTP Sent!",
      description: "Check your phone for the verification code (Demo: use 123456)",
    });
    setStep(2);
  };

  const handleVerifyOTP = () => {
    if (formData.otp === "123456" || formData.otp.length === 6) {
      toast({
        title: "Verified!",
        description: mode === "login" ? "Welcome back!" : "Account created successfully!",
      });
      navigate("/");
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct verification code",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      handleSendOTP();
    } else {
      handleVerifyOTP();
    }
  };

  const validateUsername = (username: string) => {
    return /^[a-z0-9]{6,7}$/i.test(username);
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-xl">IK</span>
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">
              {mode === "login" ? "Welcome Back!" : "Create Account"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {mode === "login"
                ? "Sign in to continue to IPU KA ADDA"
                : "Join the GGSIPU student marketplace"}
            </p>
          </div>

          <Card className="p-6 shadow-lg">
            {/* Mode Toggle */}
            <div className="flex bg-secondary rounded-lg p-1 mb-6">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  mode === "login" ? "bg-background shadow" : "text-muted-foreground"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  mode === "signup" ? "bg-background shadow" : "text-muted-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  {mode === "signup" && (
                    <>
                      {/* First Name */}
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="Enter your first name"
                          value={formData.firstName}
                          onChange={(e) => updateForm("firstName", e.target.value)}
                          required
                        />
                      </div>

                      {/* Username */}
                      <div className="space-y-2">
                        <Label htmlFor="username">Username (6-7 characters)</Label>
                        <Input
                          id="username"
                          placeholder="e.g., abc1234"
                          value={formData.username}
                          onChange={(e) => updateForm("username", e.target.value.slice(0, 7))}
                          required
                          maxLength={7}
                        />
                        {formData.username && !validateUsername(formData.username) && (
                          <p className="text-xs text-destructive">
                            Username must be 6-7 alphanumeric characters
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            className="pl-10"
                            value={formData.email}
                            onChange={(e) => updateForm("email", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter 10-digit number"
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) => updateForm("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                        required
                        maxLength={10}
                      />
                    </div>
                  </div>

                  {/* Password (for signup) */}
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={(e) => updateForm("password", e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full">
                    {mode === "login" ? "Send OTP" : "Create Account"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  {/* OTP Verification */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="font-semibold text-lg">Verify Your Phone</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      We sent a 6-digit code to +91 {formData.phone}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={formData.otp}
                      onChange={(e) => updateForm("otp", e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="text-center text-2xl tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Verify & Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-sm text-primary hover:underline"
                    >
                      Change phone number
                    </button>
                    <span className="mx-2 text-muted-foreground">•</span>
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className="text-sm text-primary hover:underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                </>
              )}
            </form>

            {step === 1 && (
              <p className="text-center text-sm text-muted-foreground mt-6">
                {mode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="text-primary font-medium hover:underline"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-primary font-medium hover:underline"
                    >
                      Login
                    </button>
                  </>
                )}
              </p>
            )}
          </Card>

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;
