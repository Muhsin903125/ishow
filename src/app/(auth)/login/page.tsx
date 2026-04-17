'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function InputField({
  label, type = 'text', value, onChange, placeholder, autoComplete, icon: Icon, rightEl, error,
}: {
  label: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; autoComplete?: string;
  icon: React.ComponentType<{ className?: string }>;
  rightEl?: React.ReactNode; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type={type} value={value} onChange={onChange}
          placeholder={placeholder} autoComplete={autoComplete}
          className={`w-full rounded-xl bg-zinc-800/60 border pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:bg-zinc-800 focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/15 ${error ? 'border-red-500/60' : 'border-zinc-700'}`}
        />
        {rightEl && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightEl}</div>}
      </div>
      {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loginWithGoogle, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
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
    const { error: err } = await login(email.trim(), password);
    setLoading(false);
    if (err) setError('Invalid email or password. Please try again.');
  };

  const handleGoogle = async () => {
    setGLoading(true);
    const { error: err } = await loginWithGoogle();
    if (err) { setError(err); setGLoading(false); }
  };

  if (!authLoading && user) return null;

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

          <div className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-orange-400">
              Member Portal
            </span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-black text-white leading-[0.95] tracking-tight mb-6">
            Back to<br />
            <span className="text-orange-500">your</span><br />
            journey.
          </h1>

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

          {/* Google */}
          <button
            type="button" onClick={handleGoogle} disabled={gLoading}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 py-3 px-4 text-sm font-semibold text-zinc-200 transition-all mb-5 disabled:opacity-50"
          >
            {gLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-600 font-medium">or email</span>
            <div className="flex-1 h-px bg-zinc-800" />
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
