import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { isDemoAuthEnabled, useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, AlertCircle, Loader2, Zap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, user, loading: authLoading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const demoEnabled = isDemoAuthEnabled();
  const redirecting = !authLoading && !!user;

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') router.replace('/admin');
      else if (user.role === 'trainer') router.replace('/trainer/dashboard');
      else router.replace('/dashboard');
    }
  }, [authLoading, router, user]);

  const handleGoogleLogin = async () => {
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
    setLoading(true);

    const { error: err } = await login(email, password);
    setLoading(false);
    if (err) setError('Invalid email or password. Please try again.');
  };

  const fillDemo = (type: "trainer" | "customer" | "admin") => {
    const demoCredentials = {
      admin: { email: "admin@ishow.ae", password: "ishow2024" },
      trainer: { email: "trainer@ishow.ae", password: "ishow2024" },
      customer: { email: "client@ishow.ae", password: "ishow2024" },
    } as const;

    setEmail(demoCredentials[type].email);
    setPassword(demoCredentials[type].password);
  };

  if ((!authLoading && user) || redirecting) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-5 py-4 shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
          <div>
            <p className="text-sm font-semibold text-foreground">Opening your dashboard</p>
            <p className="text-xs text-muted-foreground">Finishing sign-in and loading your workspace.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-[420px] space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2.5 mb-2 group">
            <div className="w-10 h-10 bg-foreground text-background rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
               <Zap className="w-6 h-6 fill-current" />
            </div>
            <span className="font-bold text-2xl text-foreground tracking-tight">
              iShow<span className="text-orange-600">Fitness</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign in to your account</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Welcome back! Access your professional portal.
          </p>
        </div>

        <Card className="shadow-sm border-border">
          <CardContent className="pt-8 space-y-6">
            {error && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email" 
                    required
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="pl-10 h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-orange-600 hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPw ? 'text' : 'password'} 
                    required
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 h-10"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading || authLoading} className="w-full h-10 font-bold bg-foreground text-background hover:bg-foreground/90 mt-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {loading ? "Authenticating..." : "Sign In"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                <span className="bg-background px-3">Third Party Login</span>
              </div>
            </div>

            <Button variant="outline" type="button" onClick={handleGoogleLogin} disabled={gLoading || authLoading} className="w-full h-10 font-semibold border-border">
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
          </CardContent>

          {demoEnabled ? (
            <CardFooter className="flex flex-col gap-4 bg-muted/30 border-t border-border p-6 sm:p-8 rounded-b-xl">
               <div className="flex items-center gap-2 mb-1 w-full">
                  <Zap className="w-3.5 h-3.5 text-orange-600 fill-current" />
                  <p className="text-[10px] text-foreground font-bold uppercase tracking-widest">Rapid Sandbox Access</p>
               </div>
               <div className="grid grid-cols-3 gap-2 w-full">
                  {(["Admin", "Trainer", "Customer"] as const).map((role) => (
                    <Button
                      key={role}
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemo(role.toLowerCase() as "admin" | "trainer" | "customer")}
                      className="bg-background hover:bg-orange-600 hover:text-white border-border text-[10px] font-bold uppercase tracking-tight h-8 shadow-sm transition-all"
                    >
                      {role}
                    </Button>
                  ))}
               </div>
            </CardFooter>
          ) : null}
        </Card>

        <div className="text-center space-y-4 pt-2">
          <p className="text-sm text-muted-foreground font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-orange-600 font-bold hover:underline">Join Now</Link>
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
