"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getAssessment, type Assessment } from "@/lib/db/assessments";
import { getActivePlan, type Plan } from "@/lib/db/plans";
import { listSessions, type TrainingSession } from "@/lib/db/sessions";
import { listPayments, type Payment } from "@/lib/db/payments";
import { getProfile } from "@/lib/db/profiles";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import {
  Target,
  Calendar,
  Dumbbell,
  CreditCard,
  ArrowRight,
  ClipboardList,
  CheckCircle,
  Clock,
  AlertCircle,
  Flame,
  Zap,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [trainerName, setTrainerName] = useState<string>('');
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    const load = async () => {
      if (!loading && user) {
        if (user.role === 'admin') { router.push('/admin/dashboard'); return; }
        if (user.role === 'trainer') { router.push('/trainer/dashboard'); return; }

        const [a, p, allSessions, payments] = await Promise.all([
          getAssessment(user.id),
          getActivePlan(user.id),
          listSessions(user.id),
          listPayments(user.id),
        ]);

        setAssessment(a);
        setPlan(p);

        if (p?.trainerId) {
          getProfile(p.trainerId).then(tp => setTrainerName(tp?.name ?? 'Your Trainer'));
        }

        const today = new Date().toISOString().split("T")[0];
        setSessions(
          allSessions
            .filter(s => s.status === "scheduled" && s.scheduledDate >= today)
            .slice(0, 3)
        );
        setPendingPayments(payments.filter(p => p.status === "pending" || p.status === "overdue"));
      }
    };
    load();
  }, [loading, user, router]);

  if (loading || !user) return null;

  const firstName = user?.name?.split(" ")[0];
  const today = new Date().toLocaleDateString("en-AE", { weekday: "long", month: "long", day: "numeric" });

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="min-h-full bg-zinc-950 relative overflow-hidden">
        {/* Background glows */}
        <div className="pointer-events-none absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-orange-500/6 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[100px]" />

        <div className="relative z-10 p-6 lg:p-8 max-w-6xl">

          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-orange-500 text-xs font-bold tracking-[0.3em] uppercase mb-1.5">Member Portal</p>
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">
                Hey, {firstName}
              </h1>
              <p className="text-zinc-500 mt-2 text-sm">Keep pushing — your transformation continues.</p>
            </div>
            <div className="hidden sm:block text-right shrink-0 mt-1">
              <p className="text-zinc-600 text-xs uppercase tracking-widest mb-1">Today</p>
              <p className="text-zinc-300 font-semibold text-sm">{today}</p>
            </div>
          </div>

          {/* Alerts */}
          {!assessment && (
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/8 p-5 mb-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">Complete Your Assessment</p>
                <p className="text-zinc-400 text-sm mt-0.5">Fill out your fitness assessment to get a personalised plan.</p>
                <Link
                  href="/assessment"
                  className="inline-flex items-center gap-1.5 mt-3 bg-orange-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20"
                >
                  Start Assessment <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {assessment && assessment.status === "pending" && !plan && (
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/8 p-5 mb-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Assessment Under Review</p>
                <p className="text-zinc-400 text-sm mt-0.5">Your trainer will review it and assign your plan soon.</p>
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[
              {
                label: "Training Plan",
                value: plan ? "Active" : "None",
                icon: Target,
                color: "orange",
                href: "/my-plan",
              },
              {
                label: "Upcoming Sessions",
                value: String(sessions.length),
                icon: Calendar,
                color: "blue",
                href: "/sessions",
              },
              {
                label: "Assessment",
                value: assessment ? (assessment.status === "reviewed" ? "Done" : "Pending") : "None",
                icon: CheckCircle,
                color: "green",
                href: "/assessment",
              },
              {
                label: "Pending Payments",
                value: String(pendingPayments.length),
                icon: CreditCard,
                color: pendingPayments.length > 0 ? "red" : "zinc",
                href: "/payments",
              },
            ].map(({ label, value, icon: Icon, color, href }) => {
              const colorMap: Record<string, string> = {
                orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
                blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                green: "text-green-400 bg-green-500/10 border-green-500/20",
                red: "text-red-400 bg-red-500/10 border-red-500/20",
                zinc: "text-zinc-500 bg-zinc-800 border-zinc-700",
              };
              const accentMap: Record<string, string> = {
                orange: "bg-orange-500",
                blue: "bg-blue-500",
                green: "bg-green-500",
                red: "bg-red-500",
                zinc: "bg-zinc-700",
              };
              return (
                <Link key={label} href={href}
                  className="group rounded-2xl bg-zinc-900 border border-zinc-800 p-5 hover:border-zinc-700 transition-all relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 right-0 h-0.5 ${accentMap[color]}`} />
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${colorMap[color]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-zinc-500 text-xs mt-1">{label}</p>
                </Link>
              );
            })}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

            {/* Current Plan */}
            <div className="lg:col-span-2 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  <h2 className="font-bold text-white text-sm">Current Plan</h2>
                </div>
                <Link href="/my-plan" className="text-xs text-zinc-500 hover:text-orange-400 flex items-center gap-1 transition-colors font-medium">
                  View details <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="p-6">
                {plan ? (
                  <div className="relative rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent p-5 overflow-hidden">
                    <Flame className="absolute bottom-2 right-3 w-24 h-24 text-orange-500/10" />
                    <div className="relative">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-[10px] font-bold text-green-400 tracking-widest uppercase mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Active
                      </span>
                      <p className="font-black text-white text-xl leading-tight">{plan.name}</p>
                      <p className="text-zinc-400 text-sm mt-1">Coach: {trainerName || 'Your Trainer'}</p>
                      {plan.goals && plan.goals.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {plan.goals.map((g) => (
                            <span key={g} className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-700">{g}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-end gap-1 mt-4">
                        <p className="text-orange-400 font-black text-2xl">AED {plan.monthlyRate}</p>
                        <p className="text-zinc-500 text-sm mb-0.5">/month</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-3">
                      <Target className="w-6 h-6 text-zinc-600" />
                    </div>
                    <p className="text-zinc-400 font-semibold text-sm">No plan assigned yet</p>
                    <p className="text-zinc-600 text-xs mt-1">Complete your assessment to get started</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sessions */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <h2 className="font-bold text-white text-sm">Sessions</h2>
                </div>
                <Link href="/sessions" className="text-xs text-zinc-500 hover:text-blue-400 font-medium transition-colors">All</Link>
              </div>
              <div className="p-5">
                {sessions.length > 0 ? (
                  <div className="space-y-2.5">
                    {sessions.map((sess) => (
                      <div key={sess.id} className="flex items-center gap-3 p-3 bg-zinc-800/60 rounded-xl border border-zinc-700/50 hover:border-zinc-600 transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm truncate">{sess.title}</p>
                          <p className="text-zinc-500 text-xs">
                            {new Date(sess.scheduledDate).toLocaleDateString("en-AE", { month: "short", day: "numeric" })} · {sess.scheduledTime}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-5 h-5 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 text-sm font-medium">No upcoming sessions</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { href: "/assessment", icon: ClipboardList, label: "Assessment", color: "orange" },
              { href: "/programs", icon: Dumbbell, label: "Programs", color: "blue" },
              { href: "/payments", icon: CreditCard, label: "Payments", color: "green" },
              { href: "/sessions", icon: Zap, label: "Sessions", color: "violet" },
            ].map(({ href, icon: Icon, label, color }) => {
              const colorMap: Record<string, string> = {
                orange: "text-orange-400 bg-orange-500/10 border-orange-500/20 group-hover:border-orange-500/40",
                blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40",
                green: "text-green-400 bg-green-500/10 border-green-500/20 group-hover:border-green-500/40",
                violet: "text-violet-400 bg-violet-500/10 border-violet-500/20 group-hover:border-violet-500/40",
              };
              return (
                <Link key={href} href={href}
                  className="group flex items-center gap-3 p-4 rounded-2xl border border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all"
                >
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${colorMap[color]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-zinc-300 group-hover:text-white text-sm transition-colors">{label}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-700 ml-auto group-hover:text-zinc-500 transition-colors" />
                </Link>
              );
            })}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
