"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { getAssessment, type Assessment } from "@/lib/db/assessments";
import { getActivePlan, type Plan } from "@/lib/db/plans";
import { listSessions, type TrainingSession } from "@/lib/db/sessions";
import { listPayments, type Payment } from "@/lib/db/payments";
import { SkeletonCard, SkeletonSessionRow, SkeletonText } from "@/components/ui/Skeleton";
import {
  Calendar,
  Dumbbell,
  CreditCard,
  ArrowRight,
  Clock,
  TrendingUp,
  Target,
  Flame,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ─── Skeleton Placeholders ───────────────────────────────────
function HeroSkeleton() {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-800" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-zinc-800 rounded-md w-1/3" />
          <div className="h-3 bg-zinc-800 rounded-md w-1/2" />
        </div>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 animate-pulse">
      <div className="w-8 h-8 rounded-lg bg-zinc-800 mb-3" />
      <div className="h-6 bg-zinc-800 rounded w-16 mb-1" />
      <div className="h-3 bg-zinc-800 rounded w-24" />
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────
export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [assessment, setAssessment] = useState<Assessment | null | "loading">("loading");
  const [plan, setPlan] = useState<Plan | null | "loading">("loading");
  const [sessions, setSessions] = useState<TrainingSession[] | "loading">("loading");
  const [payments, setPayments] = useState<Payment[] | "loading">("loading");

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "customer") { router.push("/trainer/dashboard"); return; }

    // Load assessment first — determines if we redirect
    getAssessment(user.id)
      .then((a) => {
        if (!a) { router.replace("/assessment"); return; }
        setAssessment(a);
      })
      .catch(() => setAssessment(null));

    // Load remaining data in parallel, independently
    getActivePlan(user.id)
      .then(setPlan)
      .catch(() => setPlan(null));

    listSessions({ userId: user.id })
      .then(setSessions)
      .catch(() => setSessions([]));

    listPayments({ userId: user.id })
      .then(setPayments)
      .catch(() => setPayments([]));
  }, [user?.id, loading, router]);

  const today = new Date().toISOString().split("T")[0];

  const todaySession =
    sessions !== "loading"
      ? sessions.find((s) => s.scheduledDate === today && s.status === "scheduled") ?? null
      : null;

  const upcomingSessions =
    sessions !== "loading"
      ? sessions.filter((s) => s.scheduledDate >= today && s.status === "scheduled").slice(0, 3)
      : [];

  const pendingPayments =
    payments !== "loading"
      ? payments.filter((p) => p.status === "pending" || p.status === "overdue")
      : [];

  const formatDate = (dateStr: string) =>
    new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  // Only block render briefly while auth resolves — everything else loads per-section
  if (loading) {
    return (
      <DashboardLayout role="customer">
        <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-4">
          <HeroSkeleton />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
          <SkeletonCard className="h-52" />
          <SkeletonCard className="h-40" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="customer">
      <div className="p-5 lg:p-8 max-w-5xl mx-auto space-y-5">

        {/* ── Welcome Hero ─────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-900 border border-zinc-800 p-6">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse at top right, rgba(249,115,22,0.35) 0%, transparent 60%)",
            }}
          />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="text-zinc-400 text-sm font-medium mb-0.5">Welcome back</p>
              <h1 className="text-2xl font-black text-white">
                {user?.name?.split(" ")[0]} 👋
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                {todaySession
                  ? `You have a session today — let's crush it.`
                  : "Track your progress and stay on target."}
              </p>
            </div>
            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/30 items-center justify-center shrink-0">
              <Flame className="w-7 h-7 text-orange-400" />
            </div>
          </div>
        </div>

        {/* ── Today's Session ──────────────────────────────── */}
        {sessions === "loading" ? (
          <SkeletonCard className="h-24" />
        ) : todaySession ? (
          <div className="flex items-center gap-4 rounded-2xl bg-orange-500 p-5 shadow-lg shadow-orange-500/25">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white">{todaySession.title}</p>
              <p className="text-orange-100 text-sm mt-0.5">
                {todaySession.scheduledTime} · {todaySession.duration} min
              </p>
            </div>
            <Link
              href="/sessions"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap"
            >
              View
            </Link>
          </div>
        ) : null}

        {/* ── Assessment Notice ────────────────────────────── */}
        {assessment !== "loading" && assessment?.status === "pending" && plan === null && (
          <div className="flex items-start gap-3 rounded-2xl bg-zinc-900 border border-zinc-700 p-4">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Assessment under review</p>
              <p className="text-zinc-400 text-sm mt-0.5">
                Your coach is building your personalized program — hang tight.
              </p>
            </div>
          </div>
        )}

        {/* ── Stat Row ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Sessions",
              value: sessions === "loading" ? null : upcomingSessions.length,
              icon: Calendar,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              href: "/sessions",
            },
            {
              label: "Plan",
              value: plan === "loading" ? null : plan ? "Active" : "Pending",
              icon: TrendingUp,
              color: "text-green-400",
              bg: "bg-green-500/10",
              href: "/my-plan",
            },
            {
              label: "Due",
              value: payments === "loading" ? null : pendingPayments.length > 0 ? `AED ${pendingPayments.reduce((s, p) => s + (p.amount || 0), 0)}` : "Clear",
              icon: CreditCard,
              color: pendingPayments.length > 0 ? "text-red-400" : "text-zinc-400",
              bg: pendingPayments.length > 0 ? "bg-red-500/10" : "bg-zinc-800",
              href: "/payments",
            },
            {
              label: "Programs",
              value: null,
              icon: Dumbbell,
              color: "text-purple-400",
              bg: "bg-purple-500/10",
              href: "/programs",
            },
          ].map(({ label, value, icon: Icon, color, bg, href }) => (
            <Link
              key={label}
              href={href}
              className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 hover:border-zinc-700 transition-all group"
            >
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} />
              </div>
              {value === null ? (
                <div className="h-5 bg-zinc-800 rounded-md w-12 animate-pulse mb-1" />
              ) : (
                <p className="text-base font-black text-white">{value}</p>
              )}
              <p className="text-xs text-zinc-500 font-medium">{label}</p>
            </Link>
          ))}
        </div>

        {/* ── Active Plan ───────────────────────────────────── */}
        {plan === "loading" ? (
          <SkeletonCard />
        ) : plan ? (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white">{plan.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-zinc-400 text-sm">AED {plan.monthlyRate}/mo</span>
                  <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-2 py-0.5 rounded-full font-semibold">
                    Active
                  </span>
                </div>
              </div>
              <Link
                href="/my-plan"
                className="flex items-center gap-1 text-sm text-orange-400 font-semibold hover:text-orange-300 transition-colors"
              >
                Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : null}

        {/* ── Upcoming Sessions ─────────────────────────────── */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Upcoming Sessions</h2>
            <Link href="/sessions" className="text-sm text-orange-400 font-semibold hover:text-orange-300 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {sessions === "loading" ? (
            <div className="space-y-1">
              <SkeletonSessionRow />
              <SkeletonSessionRow />
              <SkeletonSessionRow />
            </div>
          ) : upcomingSessions.length > 0 ? (
            <div className="space-y-1">
              {upcomingSessions.map((sess) => (
                <div key={sess.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/60 transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{sess.title}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {formatDate(sess.scheduledDate)} · {sess.scheduledTime}
                    </p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">No upcoming sessions yet.</p>
              <p className="text-zinc-600 text-xs mt-0.5">Your coach will schedule them soon.</p>
            </div>
          )}
        </div>

        {/* ── Pending Payments Alert ────────────────────────── */}
        {payments !== "loading" && pendingPayments.length > 0 && (
          <Link
            href="/payments"
            className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-red-300 text-sm">
                {pendingPayments.length} payment{pendingPayments.length > 1 ? "s" : ""} due
              </p>
              <p className="text-red-400/70 text-xs mt-0.5">Tap to review and pay</p>
            </div>
            <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}

        {/* ── Quick Links ───────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/programs",  icon: Dumbbell,    label: "Programs",  color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
            { href: "/payments",  icon: CreditCard,  label: "Payments",  color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
            { href: "/sessions",  icon: Calendar,    label: "Sessions",  color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20" },
            { href: "/my-plan",   icon: Target,      label: "My Plan",   color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
          ].map(({ href, icon: Icon, label, color, bg }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-2xl border p-4 hover:scale-[1.02] transition-all flex flex-col items-center gap-2.5 ${bg}`}
            >
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-xs font-bold text-zinc-300">{label}</span>
            </Link>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}
