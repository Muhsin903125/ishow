import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPasswordPage() {
  const { sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    const { error: sendError } = await sendPasswordResetEmail(email.trim());
    setLoading(false);

    if (sendError) {
      setError(sendError);
      return;
    }

    setSent(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-baseline gap-0 mb-10">
          <span className="font-black text-xl text-white tracking-tight">iShow</span>
          <span className="font-black text-xl text-orange-500 tracking-tight">Transformation</span>
        </Link>

        {sent ? (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-7 h-7 text-green-400" />
            </div>
            <h2 className="text-xl font-black text-white mb-2">Check your inbox</h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-1">A reset link was sent to</p>
            <p className="font-semibold text-white text-sm mb-5">{email}</p>
            <p className="text-xs text-zinc-600 mb-6">
              Didn&apos;t receive it?{" "}
              <button onClick={() => setSent(false)} className="text-orange-400 hover:text-orange-300 font-medium">
                Try again
              </button>
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors font-medium">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-black text-white tracking-tight">Reset password</h2>
              <p className="text-zinc-400 text-sm mt-1.5">Enter your email and we&apos;ll send a reset link.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl bg-zinc-800/60 border border-zinc-700 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/15 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 py-3.5 text-sm font-black text-white transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</> : "Send reset link"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-200 transition-colors font-medium">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
