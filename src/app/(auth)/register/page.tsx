"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  ClipboardList,
  Target,
  Shield,
} from "lucide-react";

const setupSteps = [
  { icon: ClipboardList, title: "Create your account", text: "Start with your details and secure your member access." },
  { icon: Target, title: "Complete assessment", text: "Tell us your goals, experience, and weekly training capacity." },
  { icon: Shield, title: "Get trainer direction", text: "Receive a structured plan with coach-led accountability." },
] as const;

const benefits = [
  "Assessment-first onboarding",
  "Trainer-led weekly structure",
  "Customer dashboard with sessions and payments",
  "Built for body transformation, not guesswork",
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const { user, register, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push(user.role === "trainer" ? "/trainer/dashboard" : "/dashboard");
    }
  }, [authLoading, router, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (authLoading) {
      setError("Preparing the app. Try again in a moment.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const newUser = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
    });

    setLoading(false);

    if (!newUser) {
      setError("An account with this email already exists.");
      return;
    }

    router.push("/assessment");
  };

  if (!authLoading && user) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1920&h=1400&auto=format&fit=crop&q=80"
          alt="Personal training session"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/96 via-slate-950/88 to-orange-950/78" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_30%)]" />
      </div>

      <div className="relative z-10 min-h-screen grid lg:grid-cols-[0.94fr_1.06fr]">
        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10 order-2 lg:order-1">
          <div className="w-full max-w-xl">
            <div className="mb-6 text-center lg:hidden">
              <Link href="/" className="inline-flex whitespace-nowrap leading-none">
                <span className="font-black text-2xl text-white tracking-tight">iShow</span>
                <span className="font-black text-2xl text-orange-400 tracking-tight">Transformatio</span>
              </Link>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/95 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-500 mb-3">Create Account</p>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950">Build your member profile</h1>
                <p className="text-gray-500 mt-3 leading-relaxed">
                  Register once, then head straight into the assessment so your training plan starts with real context.
                </p>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-4 text-gray-900 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                      placeholder="Your full name"
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-4 text-gray-900 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-4 text-gray-900 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                      placeholder="+1 (555) 000-0000"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-4 text-gray-900 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-4 text-gray-900 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                        placeholder="Repeat password"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || authLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-base font-black text-white transition-all hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Continue to Assessment
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                After signup you will be taken directly to the assessment form.
              </div>

              <div className="mt-6 border-t border-gray-100 pt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-blue-700 transition-colors hover:text-blue-800">
                    Sign in here
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

        <section className="hidden lg:flex flex-col justify-between px-8 py-10 xl:px-14 xl:py-12 order-1 lg:order-2">
          <div>
            <Link href="/" className="inline-flex whitespace-nowrap leading-none">
              <span className="font-black text-2xl text-white tracking-tight">iShow</span>
              <span className="font-black text-2xl text-orange-400 tracking-tight">Transformatio</span>
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-4 py-2 mt-10 mb-6">
              <Target className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">Start Strong</span>
            </div>

            <h2 className="max-w-2xl text-5xl xl:text-7xl font-black leading-[0.92] tracking-tight text-white">
              Build the profile your training plan can actually use.
            </h2>

            <p className="max-w-xl text-lg xl:text-xl text-white/60 mt-6 leading-relaxed">
              Registration is just the first step. The real value starts when your assessment, coaching direction,
              and weekly structure line up.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 max-w-2xl">
            {setupSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <Icon className="w-5 h-5 text-orange-400 mb-4" />
                  <p className="font-bold text-white text-sm mb-1">{step.title}</p>
                  <p className="text-xs leading-relaxed text-white/55">{step.text}</p>
                </div>
              );
            })}
          </div>

          <div className="max-w-2xl grid grid-cols-2 gap-4">
            <div className="col-span-2 relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl aspect-[16/10]">
              <Image
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=760&auto=format&fit=crop&q=80"
                alt="Progress-driven gym training"
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 50vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute left-6 right-6 bottom-6 rounded-2xl bg-black/45 p-5 backdrop-blur-md border border-white/10">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300 mb-2">Onboarding</p>
                <p className="text-2xl font-black text-white leading-tight">Join, assess, and move directly into a structured transformation flow.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300 mb-4">Why it works</p>
              <div className="space-y-3">
                {benefits.slice(0, 2).map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-white/75">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300 mb-4">What follows</p>
              <div className="space-y-3">
                {benefits.slice(2).map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-white/75">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
