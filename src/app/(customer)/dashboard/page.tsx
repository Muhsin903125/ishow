"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { getAssessment, type Assessment } from "@/lib/db/assessments";
import { getActivePlan, type Plan } from "@/lib/db/plans";
import { listSessions, type TrainingSession } from "@/lib/db/sessions";
import { listPayments, type Payment } from "@/lib/db/payments";
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
  Activity,
  Zap,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [assessment, setAssessment] = useState<Assessment | null | "loading">("loading");
  const [plan, setPlan] = useState<Plan | null | "loading">("loading");
  const [sessions, setSessions] = useState<TrainingSession[] | "loading">("loading");
  const [payments, setPayments] = useState<Payment[] | "loading">("loading");

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push("/login"); 
      return; 
    }
    
    if (user.role === "trainer") { router.push("/trainer/dashboard"); return; }
    if (user.role === "admin") { router.push("/admin/dashboard"); return; }

    getAssessment(user.id)
      .then((a) => {
        if (!a) { router.replace("/assessment"); return; }
        setAssessment(a);
      })
      .catch(() => setAssessment(null));

    getActivePlan(user.id)
      .then(setPlan)
      .catch(() => setPlan(null));

    listSessions({ userId: user.id })
      .then(setSessions)
      .catch(() => setSessions([]));

    listPayments({ userId: user.id })
      .then(setPayments)
      .catch(() => setPayments([]));
  }, [user, loading, router]);

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

  if (loading || assessment === "loading") {
    return (
      <DashboardLayout role="customer">
        <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
          <div className="h-40 bg-zinc-900 rounded-[2.5rem] animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[1,2,3,4].map(i => <div key={i} className="h-28 bg-zinc-900 rounded-3xl animate-pulse" />)}
          </div>
          <div className="h-64 bg-zinc-900 rounded-[2.5rem] animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="customer">
      <div className="min-h-screen bg-zinc-950 p-5 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ── Welcome Hero ─────────────────────────────────── */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 border border-zinc-800 p-8 md:p-10"
          >
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at top right, rgba(249,115,22,0.15) 0%, transparent 70%)",
              }}
            />
            <div className="relative flex items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-6">
                   <Zap className="w-3 h-3 fill-orange-500" /> Operational Status: Active
                </div>
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tight">
                  Status <span className="text-orange-500">Check</span>, {user?.name?.split(" ")[0]}
                </h1>
                <p className="text-zinc-500 text-sm mt-4 font-medium max-w-md leading-relaxed">
                  {todaySession
                    ? `Tactical session deployed for today. Final preparation advised.`
                    : "Mission parameters normalized. System awaiting next scheduled execution."}
                </p>
              </div>
              <div className="hidden lg:flex w-24 h-24 rounded-[2rem] bg-zinc-950 border border-zinc-800 items-center justify-center shrink-0 shadow-2xl relative">
                <div className="absolute inset-0 bg-orange-500/5 blur-2xl rounded-full" />
                <Flame className="w-10 h-10 text-orange-500 animate-pulse" />
              </div>
            </div>
          </motion.div>

          {/* ── Today's Session Alert ────────────────────────── */}
          {todaySession && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-6 rounded-[2rem] bg-orange-500 p-6 md:p-8 shadow-2xl shadow-orange-500/20 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-100 mb-1 opacity-80">Immediate Deployment</p>
                <p className="text-2xl font-black text-white uppercase italic tracking-tight">{todaySession.title}</p>
                <p className="text-orange-100 text-sm font-bold mt-1">
                  {todaySession.scheduledTime} <span className="mx-2 opacity-50">•</span> {todaySession.duration} MIN DURATION
                </p>
              </div>
              <Link
                href="/sessions"
                className="bg-zinc-950 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white hover:text-zinc-950 transition-all shadow-xl"
              >
                Commence
              </Link>
            </motion.div>
          )}

          {/* ── Stat Row ─────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Missions",
                value: sessions === "loading" ? null : upcomingSessions.length,
                icon: Calendar,
                color: "text-blue-500",
                bg: "bg-blue-500/10",
                href: "/sessions",
                delay: 0.1
              },
              {
                label: "Curriculum",
                value: plan === "loading" ? null : plan ? "Sync'd" : "Pending",
                icon: Target,
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
                href: "/my-plan",
                 delay: 0.2
              },
              {
                label: "Liability",
                value: payments === "loading" ? null : pendingPayments.length > 0 ? `AED ${pendingPayments.reduce((s, p) => s + (p.amount || 0), 0)}` : "Nominal",
                icon: CreditCard,
                color: pendingPayments.length > 0 ? "text-rose-500" : "text-zinc-600",
                bg: pendingPayments.length > 0 ? "bg-rose-500/10" : "bg-zinc-900",
                href: "/payments",
                 delay: 0.3
              },
              {
                label: "Analytics",
                value: "View",
                icon: Activity,
                color: "text-orange-500",
                bg: "bg-orange-500/10",
                href: "/progress",
                 delay: 0.4
              },
            ].map(({ label, value, icon: Icon, color, bg, href, delay }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay }}
              >
                <Link
                  href={href}
                  className="block h-full rounded-[2rem] bg-zinc-900 border border-zinc-800 p-6 hover:border-zinc-600 transition-all group relative overflow-hidden"
                >
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  {value === null ? (
                    <div className="h-6 bg-zinc-800 rounded-md w-16 animate-pulse mb-1" />
                  ) : (
                    <p className="text-xl font-black text-white italic uppercase tracking-tight">{value}</p>
                  )}
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">{label}</p>
                  
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                     <ChevronRight className="w-5 h-5 text-zinc-700" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* ── Active Framework ─────────────────────────────── */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-1 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 p-8 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-8 italic">Active Framework</h2>
                {plan === "loading" ? (
                  <div className="space-y-4">
                    <div className="h-6 bg-zinc-800 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-zinc-800 rounded w-1/2 animate-pulse" />
                  </div>
                ) : plan ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl inline-block mb-2">
                       <TrendingUp className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white uppercase italic tracking-tight leading-none">{plan.name}</p>
                      <p className="text-zinc-500 text-xs font-bold mt-2 uppercase tracking-widest">Premium Enrolment</p>
                    </div>
                    <div className="pt-6 border-t border-zinc-800">
                       <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Fee Structure</p>
                       <p className="text-xl font-black text-white italic">AED {plan.monthlyRate}<span className="text-[10px] text-zinc-600 ml-1">/ PERIOD</span></p>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <AlertCircle className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-600 font-black uppercase text-[10px] tracking-widest">No Framework Synchronized</p>
                  </div>
                )}
              </div>
              
              <Link
                href="/my-plan"
                className="mt-10 group flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-2xl hover:border-zinc-600 transition-all"
              >
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Protocol Details</span>
                <ArrowRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* ── Upcoming Manifest ────────────────────────────── */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.6 }}
               className="lg:col-span-2 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 p-8 md:p-10"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic flex items-center gap-3">
                   <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                   Deployment Manifest
                </h2>
                <Link href="/sessions" className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:text-white transition-colors">
                  Full Log
                </Link>
              </div>

              {sessions === "loading" ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-zinc-950 rounded-2xl animate-pulse" />)}
                </div>
              ) : upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.map((sess) => (
                    <div key={sess.id} className="flex items-center gap-5 p-4 md:p-5 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl hover:border-zinc-700 hover:bg-zinc-950 transition-all group">
                      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <Calendar className="w-6 h-6 text-zinc-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-white uppercase italic tracking-tight text-base truncate">{sess.title}</p>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-1">
                          {formatDate(sess.scheduledDate)} <span className="mx-1.5">•</span> {sess.scheduledTime}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-800 group-hover:text-zinc-500 transition-colors" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-zinc-950/50 border border-dashed border-zinc-800 rounded-2xl">
                  <Sparkles className="w-8 h-8 text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-600 font-black uppercase text-[10px] tracking-widest">All current missions executed.</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* ── Pending Liability Notice ──────────────────────── */}
          {payments !== "loading" && pendingPayments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link
                href="/payments"
                className="flex items-center gap-6 p-6 rounded-[2rem] bg-rose-500/5 border border-rose-500/20 hover:bg-rose-500/10 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-7 h-7 text-rose-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Financial Variance Detected</p>
                  <p className="text-lg font-black text-white uppercase italic tracking-tight">
                    {pendingPayments.length} Oustanding Settlement{pendingPayments.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-zinc-500 text-xs font-bold mt-1 uppercase tracking-widest">Immediate reconciliation required to maintain operational access.</p>
                </div>
                <div className="p-4 bg-white rounded-2xl text-zinc-950 group-hover:bg-rose-500 group-hover:text-white transition-all">
                   <ArrowRight className="w-5 h-5" />
                </div>
              </Link>
            </motion.div>
          )}

          {/* ── Secondary Quick Links ─────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-10">
            {[
              { href: "/programs",  icon: Dumbbell,    label: "Programs",  color: "text-orange-500" },
              { href: "/payments",  icon: CreditCard,  label: "Payments",  color: "text-blue-500" },
              { href: "/sessions",  icon: Calendar,    label: "Sessions",  color: "text-emerald-500" },
              { href: "/profile",   icon: User,        label: "Security",  color: "text-zinc-500" },
            ].map(({ href, icon: Icon, label, color }) => (
              <motion.div key={href} whileHover={{ y: -5 }}>
                <Link
                  href={href}
                  className="flex flex-col items-center gap-3 p-6 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] hover:border-zinc-700 transition-all group"
                >
                  <Icon className={`w-5 h-5 ${color} group-hover:scale-110 transition-transform`} />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
                </Link>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

function User({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
