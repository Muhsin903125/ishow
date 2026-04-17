'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight, CheckCircle } from 'lucide-react';

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

export default function RegisterPage() {
  const router = useRouter();
  const { user, register, loginWithGoogle, loading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.push('/assessment');
  }, [authLoading, router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    const { error: err, needsConfirmation } = await register({
      name: name.trim(), email: email.trim(), password,
    });
    setLoading(false);
    if (err) { setError(err); return; }
    if (needsConfirmation) { setEmailSent(true); return; }
    router.push('/assessment');
  };

  const handleGoogle = async () => {
    setGLoading(true);
    const { error: err } = await loginWithGoogle();
    if (err) { setError(err); setGLoading(false); }
  };

  if (!authLoading && user) return null;

  if (emailSent) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-5">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Check your inbox</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-1">A confirmation link was sent to</p>
          <p className="font-semibold text-white text-sm mb-5">{email}</p>
          <p className="text-xs text-zinc-600 mb-6">Click the link to activate your account, then sign in.</p>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 px-6 py-3 text-sm font-black text-white transition-colors shadow-lg shadow-orange-500/20">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-baseline gap-0 mb-10">
          <span className="font-black text-xl text-white tracking-tight">iShow</span>
          <span className="font-black text-xl text-orange-500 tracking-tight">Transformation</span>
        </Link>

        <div className="mb-7">
          <h1 className="text-3xl font-black text-white tracking-tight">Create account</h1>
          <p className="text-zinc-500 text-sm mt-1.5">
            Already have one?{' '}
            <Link href="/login" className="text-orange-400 font-semibold hover:text-orange-300 transition-colors">Sign in</Link>
          </p>
        </div>

        <button type="button" onClick={handleGoogle} disabled={gLoading}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 py-3 px-4 text-sm font-semibold text-zinc-200 transition-all mb-5 disabled:opacity-50"
        >
          {gLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-xs text-zinc-600 font-medium">or with email</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Your full name" required autoComplete="name"
                className="w-full rounded-xl bg-zinc-800/60 border border-zinc-700 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/15 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email"
                className="w-full rounded-xl bg-zinc-800/60 border border-zinc-700 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/15 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters" required autoComplete="new-password"
                className="w-full rounded-xl bg-zinc-800/60 border border-zinc-700 pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/15 transition"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 active:bg-orange-600 py-3.5 text-sm font-black text-white transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20 mt-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account…</> : <>Create account <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-600 mt-8">
          <Link href="/" className="hover:text-zinc-400 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
