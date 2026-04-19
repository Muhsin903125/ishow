'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Dumbbell, Mail, Lock, AlertCircle, Loader2, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') router.push('/admin/dashboard');
      else if (user.role === 'trainer') router.push('/trainer/dashboard');
      else router.push('/dashboard');
    }
  }, [authLoading, router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const user = await login(email, password);
    setLoading(false);
    if (err) setError('Invalid email or password. Please try again.');
  };

    if (!user) {
      setError("Invalid email or password. Please try again.");
    } else {
      if (user.role === "trainer") {
        router.push("/trainer/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  };

  const fillDemo = (type: "trainer" | "customer") => {
    if (type === "trainer") {
      setEmail("trainer@ishow.com");
      setPassword("trainer123");
    } else {
      setEmail("john@example.com");
      setPassword("demo123");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[520px] xl:w-[580px] shrink-0 relative overflow-hidden bg-[#0D0D0F] px-12 py-14">
        {/* decorative glow */}
        <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 rounded-full bg-blue-600/8 blur-[80px]" />

        <div className="relative">
          <Link href="/" className="inline-flex items-baseline gap-0 mb-16">
            <span className="font-black text-xl text-white tracking-tight">iShow</span>
            <span className="font-black text-xl text-orange-500 tracking-tight">Transformation</span>
          </Link>
          <h1 className="text-3xl font-black text-white mt-4">Welcome Back</h1>
          <p className="text-blue-300 mt-2">Sign in to continue your fitness journey</p>
        </div>

          <p className="text-zinc-400 text-base leading-relaxed max-w-sm">
            Your programs, sessions, and progress — all in one place. Sign in to pick up where you left off.
          </p>
        </div>

        {/* Stats strip */}
        <div className="relative grid grid-cols-3 gap-4">
          {[
            { value: '1-on-1', label: 'Coaching' },
            { value: '100%', label: 'Personalised' },
            { value: 'UAE', label: 'Based' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm">
              <p className="text-xl font-black text-white mb-0.5">{s.value}</p>
              <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 sm:px-10">
        {/* Mobile logo */}
        <Link href="/" className="inline-flex items-baseline gap-0 mb-10 lg:hidden">
          <span className="font-black text-xl text-white tracking-tight">iShow</span>
          <span className="font-black text-xl text-orange-500 tracking-tight">Transformation</span>
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white tracking-tight">Sign in</h2>
            <p className="text-zinc-500 text-sm mt-1.5">
              New here?{' '}
              <Link href="/register" className="text-orange-400 font-semibold hover:text-orange-300 transition-colors">
                Create an account
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-orange-500" />
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Demo Accounts — Click to Fill</p>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillDemo("trainer")}
                className="w-full bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-2.5 text-xs text-blue-700 text-left transition-colors border border-blue-100"
              >
                <span className="font-bold">Trainer Account:</span> trainer@ishow.com / trainer123
              </button>
              <button
                type="button"
                onClick={() => fillDemo("customer")}
                className="w-full bg-orange-50 hover:bg-orange-100 rounded-lg px-3 py-2.5 text-xs text-orange-700 text-left transition-colors border border-orange-100"
              >
                <span className="font-bold">Customer Account:</span> john@example.com / demo123
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email" icon={Mail} />

            <InputField label="Password" type={showPw ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)} placeholder="Your password"
              autoComplete="current-password" icon={Lock}
              rightEl={
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-zinc-500 hover:text-orange-400 transition-colors font-medium">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading || authLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 active:bg-orange-600 py-3.5 text-sm font-black text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</> : <>Sign in<ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-600 mt-8">
            <Link href="/" className="hover:text-zinc-400 transition-colors">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
