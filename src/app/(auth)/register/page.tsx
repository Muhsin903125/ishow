'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Dumbbell, Mail, Lock, User, Phone, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
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

    const user = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });

    setLoading(false);
    if (err) { setError(err); return; }
    if (needsConfirmation) { setEmailSent(true); return; }
    router.push('/assessment');
  };

    if (!user) {
      setError("An account with this email already exists");
      return;
    }

    router.push("/assessment");
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                    placeholder="••••••••"
                    required
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
