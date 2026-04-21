"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, User, Phone, AlertCircle, Loader2, ArrowRight, Eye, EyeOff, CheckCircle2, Flame } from "lucide-react";
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

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
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
  };

  if (!authLoading && user) return null;

  return (
    <div className={`${dm.variable} ${barlow.variable} font-[family-name:var(--font-dm)] min-h-screen bg-zinc-950 flex items-center justify-center relative overflow-hidden p-6`}>
      
      {/* FULL SCREEN BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <AutoPlayVideo
          src="/landing/14711435_2560_1440_25fps.mp4"
          className="w-full h-full object-cover grayscale opacity-40 mix-blend-luminosity"
          poster="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-zinc-950/60" />
        <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px]" />
      </div>

      <div className="w-full max-w-lg relative z-10 transition-all duration-700 animate-in fade-in zoom-in-95">
        {/* Logo */}
        <div className="flex justify-center mb-10">
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
          
          <div className="relative z-10">
            <div className="mb-10 text-center">
              <h1 className="font-[family-name:var(--font-barlow)] font-black uppercase text-5xl text-white mb-3 tracking-tight">Create account</h1>
              <p className="text-zinc-500 font-medium">
                Already have one?{' '}
                <Link href="/login" className="text-orange-500 font-bold hover:text-orange-400 transition-colors underline underline-offset-8 decoration-2">Sign in</Link>
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400 mb-8 font-medium border-l-4 border-l-red-500">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
              </div>
            )}

            <button type="button" onClick={handleGoogle} disabled={gLoading || authLoading}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 py-4.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all disabled:opacity-50 mb-8"
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

            <div className="flex items-center gap-6 mb-8">
              <div className="flex-1 h-px bg-zinc-800/50" />
              <span className="text-[10px] text-zinc-600 font-extrabold uppercase tracking-[0.2em] whitespace-nowrap">or with email</span>
              <div className="flex-1 h-px bg-zinc-800/50" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 px-2">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                    <input
                      type="text" name="name" value={formData.name} onChange={handleChange}
                      placeholder="John Doe" required autoComplete="name"
                      className="w-full rounded-2xl bg-zinc-950/50 border border-zinc-800 pl-14 pr-5 py-4 text-white placeholder-zinc-700 outline-none focus:border-orange-500/50 focus:bg-zinc-950 focus:ring-8 focus:ring-orange-500/5 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 px-2">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                    <input
                      type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      placeholder="+971 50 123 4567" required autoComplete="tel"
                      className="w-full rounded-2xl bg-zinc-950/50 border border-zinc-800 pl-14 pr-5 py-4 text-white placeholder-zinc-700 outline-none focus:border-orange-500/50 focus:bg-zinc-950 focus:ring-8 focus:ring-orange-500/5 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 px-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="you@example.com" required autoComplete="email"
                    className="w-full rounded-2xl bg-zinc-950/50 border border-zinc-800 pl-14 pr-5 py-4 text-white placeholder-zinc-700 outline-none focus:border-orange-500/50 focus:bg-zinc-950 focus:ring-8 focus:ring-orange-500/5 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 px-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type={showPw ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                    placeholder="Min. 8 characters" required autoComplete="new-password"
                    className="w-full rounded-2xl bg-zinc-950/50 border border-zinc-800 pl-14 pr-14 py-4 text-white placeholder-zinc-700 outline-none focus:border-orange-500/50 focus:bg-zinc-950 focus:ring-8 focus:ring-orange-500/5 transition-all font-medium"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">
                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading || authLoading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-white transition-all disabled:opacity-50 mt-10 shadow-[0_20px_40px_-12px_rgba(249,115,22,0.4)]"
              >
                {loading ? <><Loader3 className="w-5 h-5 animate-spin" />Building Protocol...</> : <>Build Your Transformation <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>

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

function Loader3(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

