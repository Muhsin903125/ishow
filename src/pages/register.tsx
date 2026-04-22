import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, User, Phone, AlertCircle, Loader2, Eye, EyeOff, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle, user, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/assessment');
    }
  }, [authLoading, router, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGoogle = async () => {
    setGLoading(true);
    try {
      const { error: err } = await loginWithGoogle();
      if (err) throw new Error(err);
    } catch {
      setError("Google sign-in failed. Please try again.");
      setGLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) { setError('Please enter your name.'); return; }
    if (!formData.phone.trim()) { setError('Mobile number is mandatory for your assessment.'); return; }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    
    setLoading(true);
    const { error: err } = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });

    setLoading(false);
    if (err) { setError(err); return; }
    setConfirmationSent(true);
  };

  if (!authLoading && user) return null;

  if (confirmationSent) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-6 sm:p-8">
        <Card className="w-full max-w-[450px] shadow-sm border-border">
          <CardContent className="pt-10 pb-8 px-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Check your inbox</h1>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              We created your account. If email confirmation is enabled, use the verification link we sent before signing in.
            </p>
            <div className="pt-2">
              <Button asChild className="h-10 font-bold bg-foreground text-background hover:bg-foreground/90">
                <Link href="/login">Go to Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-[450px] space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2.5 mb-2 group">
            <div className="w-10 h-10 bg-foreground text-background rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
               <Zap className="w-6 h-6 fill-current" />
            </div>
            <span className="font-bold text-2xl text-foreground tracking-tight">
              iShow<span className="text-orange-600">Fitness</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Join iShow Fitness to start your transformation
          </p>
        </div>

        <Card className="shadow-sm border-border">
          <CardContent className="pt-8 space-y-6">
            {error && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
              </div>
            )}

            <Button variant="outline" type="button" onClick={handleGoogle} disabled={gLoading || authLoading} className="w-full h-10 font-semibold border-border">
              {gLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                <span className="bg-background px-3">Registration Form</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange}
                      placeholder="John Doe" 
                      required
                      className="pl-10 h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange}
                      placeholder="+971 50 123 4567" 
                      required
                      className="pl-10 h-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange}
                    placeholder="name@example.com" 
                    required
                    className="pl-10 h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPw ? 'text' : 'password'} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange}
                    placeholder="Min. 8 characters" 
                    required
                    className="pl-10 h-10"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading || authLoading} className="w-full h-10 font-bold bg-foreground text-background hover:bg-foreground/90 mt-4">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {loading ? "Creating Account..." : "Join iShow Fitness"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center space-y-4 pt-2">
          <p className="text-sm text-muted-foreground font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-600 font-bold hover:underline">Sign in</Link>
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/" className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors">Return home</Link>
            <span className="w-1 h-1 rounded-full bg-border" />
            <Link href="/privacy" className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors">Security & Privacy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
