"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, AlertCircle, Loader2, Zap, Eye, EyeOff, ArrowRight, Flame } from "lucide-react";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import { DM_Sans, Barlow_Condensed } from "next/font/google";

const dm = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["400", "500", "600", "700"],
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["700", "800"],
});

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, user, loading: authLoading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') router.push('/admin/dashboard');
      else if (user.role === 'trainer') router.push('/trainer/dashboard');
      else router.push('/dashboard');
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
    if (type === "trainer") {
      setEmail("ahmed.coach@ishow.ae");
      setPassword("Password1!");
    } else if (type === "admin") {
      setEmail("admin@ishow.ae");
      setPassword("Password1!");
    } else {
      setEmail("khalid@example.com");
      setPassword("Password1!");
    }
  };

  if (!authLoading && user) return null;

  return (
    <div className={`${dm.variable} ${barlow.variable} font-[family-name:var(--font-dm)] min-h-screen bg-zinc-950 flex items-center justify-center relative overflow-hidden p-6`}>
      
      {/* FULL SCREEN BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <AutoPlayVideo
          src="/landing/5319084-uhd_3840_2160_25fps.mp4"
          className="w-full h-full object-cover grayscale opacity-40 mix-blend-luminosity"
          poster="https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-zinc-950/60" />
        <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px]" />
      </div>

      <div className="w-full max-w-md relative z-10 transition-all duration-700 animate-in fade-in zoom-in-95">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Link href="/" className="group flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20 group-hover:scale-110 transition-transform">
               <Flame className="w-7 h-7 text-white fill-white" />
            </div>
            <span className="font-[family-name:var(--font-barlow)] font-black text-3xl text-white tracking-widest uppercase italic">
              iShow<span className="text-orange-500">Transformation</span>
            </span>
          </Link>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-3xl p-8 md:p-12 rounded-[3.5rem] border border-zinc-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-10 text-center">
              <h1 className="font-[family-name:var(--font-barlow)] font-black uppercase text-5xl text-white mb-3 tracking-tight">Sign in</h1>
              <p className="text-zinc-500 font-medium">
                New here?{' '}
                <Link href="/register" className="text-orange-500 font-bold hover:text-orange-400 transition-colors underline underline-offset-8 decoration-2">Create an account</Link>
              </p>
            </div>

            {/* Quick Access Demos */}
            {process.env.NODE_ENV !== "production" && (
              <div className="mb-10 p-6 bg-zinc-950/40 rounded-3xl border border-zinc-800/50">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-3.5 h-3.5 text-orange-500" />
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Developer Quick Access</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {["Admin", "Trainer", "Customer"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => fillDemo(role.toLowerCase() as any)}
                      className="bg-zinc-900/80 hover:bg-orange-500 hover:text-white border border-zinc-800 rounded-xl py-2.5 px-2 text-[10px] text-zinc-400 font-black uppercase tracking-widest transition-all"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400 mb-8 font-medium border-l-4 border-l-red-500">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3 px-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="email" required
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-2xl bg-zinc-950/50 border border-zinc-800 pl-14 pr-5 py-4.5 text-white placeholder-zinc-700 outline-none focus:border-orange-500/50 focus:bg-zinc-950 focus:ring-8 focus:ring-orange-500/5 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 px-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Password</label>
                  <Link href="/forgot-passwordux" className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500/70 hover:text-orange-500 transition-colors">Forgot?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type={showPw ? 'text' : 'password'} required
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl bg-zinc-950/50 border border-zinc-800 pl-14 pr-14 py-4.5 text-white placeholder-zinc-700 outline-none focus:border-orange-500/50 focus:bg-zinc-950 focus:ring-8 focus:ring-orange-500/5 transition-all font-medium"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">
                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading || authLoading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-white transition-all disabled:opacity-50 mt-10 shadow-[0_20px_40px_-12px_rgba(249,115,22,0.4)]"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Authorizing...</> : <>Enter The Arena <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>

            <div className="flex items-center gap-6 my-10">
              <div className="flex-1 h-px bg-zinc-800/50" />
              <span className="text-[10px] text-zinc-600 font-extrabold uppercase tracking-[0.2em] whitespace-nowrap">Unified Login</span>
              <div className="flex-1 h-px bg-zinc-800/50" />
            </div>

            <button type="button" onClick={handleGoogleLogin} disabled={gLoading || authLoading}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 py-4.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all disabled:opacity-50"
            >
              {gLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

            <div className="text-center mt-12">
              <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-colors flex items-center justify-center gap-2">
                <span className="w-6 h-px bg-zinc-800" /> Return to launchpad <span className="w-6 h-px bg-zinc-800" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

