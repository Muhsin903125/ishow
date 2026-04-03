"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle,
  Flame,
  Shield,
  Star,
  Users,
} from "lucide-react";

const demoAccounts = [
  {
    label: "Trainer Demo",
    email: "trainer@ishow.com",
    password: "trainer123",
    accent: "from-blue-700 to-blue-900",
    note: "Opens the trainer dashboard",
  },
  {
    label: "Customer Demo",
    email: "customer@ishow.com",
    password: "customer123",
    accent: "from-orange-500 to-orange-700",
    note: "Opens the customer dashboard",
  },
] as const;

const highlights = [
  { icon: Shield, title: "Trainer-led system", text: "Structured plans and real follow-up" },
  { icon: Users, title: "One place", text: "Assessment, sessions, programs, payments" },
  { icon: Star, title: "Coach access", text: "Mohammed Sufiyan and demo-ready flows" },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push(user.role === "trainer" ? "/trainer/dashboard" : "/dashboard");
    }
  }, [authLoading, router, user]);

  const applyDemo = (nextEmail: string, nextPassword: string) => {
    setEmail(nextEmail);
    setPassword(nextPassword);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (authLoading) {
      setError("Preparing demo data. Try again in a moment.");
      return;
    }

    setLoading(true);
    const signedInUser = await login(email.trim(), password);
    setLoading(false);

    if (!signedInUser) {
      setError("Invalid email or password. Use a demo card above or check your credentials.");
      return;
    }

    router.push(signedInUser.role === "trainer" ? "/trainer/dashboard" : "/dashboard");
  };

  if (!authLoading && user) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1920&h=1400&auto=format&fit=crop&q=80"
          alt="Athlete training in the gym"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-slate-950/85 to-blue-950/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_32%)]" />
      </div>

      <div className="relative z-10 min-h-screen grid lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:flex flex-col justify-between px-8 py-10 xl:px-14 xl:py-12">
          <div>
            <Link href="/" className="inline-flex whitespace-nowrap leading-none">
              <span className="font-black text-2xl text-white tracking-tight">iShow</span>
              <span className="font-black text-2xl text-orange-400 tracking-tight">Transformation</span>
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-4 py-2 mt-10 mb-6">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">Member Login</span>
            </div>

            <h1 className="max-w-2xl text-5xl xl:text-7xl font-black leading-[0.92] tracking-tight text-white">
              Return to the plan and keep your momentum moving.
            </h1>

            <p className="max-w-xl text-lg xl:text-xl text-white/60 mt-6 leading-relaxed">
              Sign in to access assessments, sessions, weekly programs, and the coach-led system built for
              real transformation.
            </p>
          </div>

          <div className="grid max-w-xl gap-4 md:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <Icon className="w-5 h-5 text-orange-400 mb-4" />
                  <p className="font-bold text-white text-sm mb-1">{item.title}</p>
                  <p className="text-xs leading-relaxed text-white/55">{item.text}</p>
                </div>
              );
            })}
          </div>

          <div className="relative max-w-xl overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
            <div className="relative aspect-[16/10]">
              <Image
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=760&auto=format&fit=crop&q=80"
                alt="Structured gym training"
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 50vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300 mb-2">
                  Coach Spotlight
                </p>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-2xl font-black text-white">Mohammed Sufiyan</p>
                    <p className="text-sm text-white/65">Trainer-led accountability and structured transformation</p>
                  </div>
                  <Link
                    href="https://www.instagram.com/sufiyan_mohd26/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
                  >
                    Instagram
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-xl">
            <div className="mb-6 text-center lg:hidden">
              <Link href="/" className="inline-flex whitespace-nowrap leading-none">
                <span className="font-black text-2xl text-white tracking-tight">iShow</span>
                <span className="font-black text-2xl text-orange-400 tracking-tight">Transformation</span>
              </Link>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/95 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-500 mb-3">Sign In</p>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950">Welcome back</h2>
                <p className="text-gray-500 mt-3 leading-relaxed">
                  Use your account or tap a demo profile to autofill working credentials instantly.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 mb-6">
                {demoAccounts.map((account) => (
                  <button
                    key={account.label}
                    type="button"
                    onClick={() => applyDemo(account.email, account.password)}
                    className="rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                  >
                    <div className={`h-1.5 rounded-full bg-gradient-to-r ${account.accent} mb-4`} />
                    <p className="font-black text-gray-900 text-sm">{account.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{account.note}</p>
                    <p className="text-sm font-semibold text-gray-700 mt-4">{account.email}</p>
                    <p className="text-xs text-gray-400">{account.password}</p>
                  </button>
                ))}
              </div>

              {authLoading && (
                <div className="mb-5 flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Preparing demo data...
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-4 text-gray-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      placeholder="customer@ishow.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-4 text-gray-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || authLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-950 px-6 py-4 text-base font-black text-white transition-all hover:-translate-y-0.5 hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Enter Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Demo accounts are pre-seeded automatically when the app loads.
              </div>

              <div className="mt-6 border-t border-gray-100 pt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="font-semibold text-orange-500 transition-colors hover:text-orange-600">
                    Create one here
                  </Link>
                </p>
              </div>
            </div>

            <p className="text-center text-sm text-white/50 mt-5">
              <Link href="/" className="transition-colors hover:text-white/80">
                Back to home
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
