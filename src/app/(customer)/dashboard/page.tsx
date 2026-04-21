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
  Layers,
  User,
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
        <div className="p-6 lg:p-10 max-w-full space-y-6 animate-pulse">
          <div className="h-40 bg-zinc-900 rounded-[2.5rem]" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[1,2,3,4].map(i => <div key={i} className="h-28 bg-zinc-900 rounded-3xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="h-64 bg-zinc-900 rounded-[2.5rem]" />
             <div className="lg:col-span-2 h-64 bg-zinc-900 rounded-[2.5rem]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="customer">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-10">
        <div className="max-w-full space-y-8">

          {/* ── Welcome Hero ─────────────────────────────────── */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 border border-zinc-800 p-8 md:p-12 mb-4"
          >
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at top right, rgba(249,115,22,0.15) 0%, transparent 70%)",
              }}
            />
            <div className="relative flex flex-wrap items-center justify-between gap-10">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-6">
                   <Zap className="w-3 h-3 fill-orange-500" /> Operational Status: Active
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-tight">
                  Status <span className="text-orange-500">Check</span>, {user?.name?.split(" ")[0]}
                </h1>
                <p className="text-zinc-500 text-sm mt-6 font-medium leading-relaxed italic">
                  {todaySession
                    ? `Tactical session deployed for today. Final preparation advised.`
                    : "Mission parameters normalized. System awaiting next scheduled execution."}
                </p>
                <div className="flex gap-4 mt-8">
                   <Link href="/sessions" className="bg-white text-zinc-950 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-95">
                      Training Hub
                   </Link>
                   <Link href="/assessments" className="bg-zinc-800 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all active:scale-95">
                      Assessments
                   </Link>
                </div>
              </div>
              
              <div className="hidden lg:flex w-32 h-32 rounded-[2.5rem] bg-zinc-950 border border-zinc-800 items-center justify-center shrink-0 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-orange-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <Flame className="w-12 h-12 text-zinc-800 group-hover:text-orange-500 transition-all rotate-12 group-hover:rotate-0" />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center">
                   <CheckCircle2 className="w-4 h-4 text-orange-500" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Today's Session Alert ────────────────────────── */}
          {todaySession && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-8 rounded-[2.5rem] bg-orange-600 p-8 md:p-10 shadow-2xl shadow-orange-500/20 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-100 mb-2 opacity-80 italic">Immediate Deployment</p>
                <p className="text-3xl font-black text-white uppercase italic tracking-tight">{todaySession.title}</p>
                <p className="text-orange-100 text-sm font-bold mt-2 uppercase tracking-widest italic opacity-70">
                  {todaySession.scheduledTime} <span className="mx-3">•</span> {todaySession.duration} MIN DURATION
                </p>
              </div>
              <Link
                href="/sessions"
                className="bg-zinc-950 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-zinc-950 transition-all shadow-xl active:scale-95 italic"
              >
                Commence Op
              </Link>
            </motion.div>
          )}

          {/* ── Stat Row ─────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                label: "Framework",
                value: plan === "loading" ? null : plan ? "Sync'd" : "Pending",
                icon: Layers,
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
                href: "/sessions",
                delay: 0.2
              },
              {
                label: "Liability",
                value: payments === "loading" ? null : pendingPayments.length > 0 ? `AED ${pendingPayments.reduce((s, p) => s + (p.amount || 0), 0)}` : "Nominal",
                icon: CreditCard,
                color: pendingPayments.length > 0 ? "text-rose-500" : "text-zinc-600",
                bg: pendingPayments.length > 0 ? "bg-rose-500/10" : "bg-zinc-900/50",
                href: "/payments",
                 delay: 0.3
              },
              {
                label: "Analytics",
                value: "Log",
                icon: Activity,
                color: "text-white",
                bg: "bg-zinc-800",
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
                  className="block h-full rounded-[2rem] bg-zinc-900 border border-zinc-800 p-8 hover:border-zinc-700 transition-all group relative overflow-hidden"
                >
                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  {value === null ? (
                    <div className="h-8 bg-zinc-800 rounded-md w-16 animate-pulse mb-1" />
                  ) : (
                    <p className="text-2xl font-black text-white italic uppercase tracking-tight">{value}</p>
                  )}
                  <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1 italic group-hover:text-zinc-400 transition-colors">{label}</p>
                  
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all">
                     <ChevronRight className="w-5 h-5 text-zinc-700" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ── Active Framework ─────────────────────────────── */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-4 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 p-10 flex flex-col justify-between group"
            >
              <div>
                <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-10 italic flex items-center gap-3">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                   Active Framework
                </h2>
                {plan === "loading" ? (
                  <div className="space-y-4">
                    <div className="h-8 bg-zinc-800 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-zinc-800 rounded w-1/2 animate-pulse" />
                  </div>
                ) : plan ? (
                  <div className="space-y-8">
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-[1.5rem] flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                       <Target className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{plan.name}</p>
                      <p className="text-emerald-500 text-[10px] font-black mt-3 uppercase tracking-widest italic opacity-70">Premium Enrolment Active</p>
                    </div>
                    <div className="pt-8 border-t border-zinc-800/50">
                       <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-2 italic">Fee Structure</p>
                       <p className="text-2xl font-black text-white italic">AED {plan.monthlyRate}<span className="text-[10px] text-zinc-600 ml-2 tracking-widest">/ PERIOD</span></p>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center bg-zinc-950/30 rounded-3xl border border-dashed border-zinc-800">
                    <AlertCircle className="w-12 h-12 text-zinc-800 mx-auto mb-6 opacity-30" />
                    <p className="text-zinc-700 font-black uppercase text-[10px] tracking-widest italic leading-loose">Awaiting operational<br/>framework deployment</p>
                  </div>
                )}
              </div>
              
              <Link
                href="/sessions"
                className="mt-12 group flex items-center justify-between px-6 py-5 bg-zinc-950 border border-zinc-800 rounded-2xl hover:border-orange-500/30 transition-all shadow-inner"
              >
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic group-hover:text-white transition-colors">Syllabus Manifest</span>
                <ArrowRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* ── Upcoming Manifest ────────────────────────────── */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.6 }}
               className="lg:col-span-8 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 p-10 md:p-12"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic flex items-center gap-3">
                   <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                   Deployment Manifest
                </h2>
                <Link href="/sessions" className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:text-white transition-colors italic">
                  Training Log
                </Link>
              </div>

              {sessions === "loading" ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-20 bg-zinc-950 rounded-2xl animate-pulse" />)}
                </div>
              ) : upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((sess) => (
                    <div key={sess.id} className="flex items-center gap-6 p-6 bg-zinc-950/50 border border-zinc-800/50 rounded-[2rem] hover:border-zinc-600 hover:bg-zinc-950 transition-all group overflow-hidden relative shadow-inner">
                      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] transition-opacity">
                         <Calendar className="w-20 h-20 text-white" />
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-inner">
                        <Calendar className="w-6 h-6 text-zinc-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-white uppercase italic tracking-tight text-lg truncate mb-1">{sess.title}</p>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] italic flex items-center gap-3">
                           <span className="text-zinc-400">{formatDate(sess.scheduledDate)}</span>
                           <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                           <span>{sess.scheduledTime}</span>
                           <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                           <span className="text-orange-500/60">{sess.duration} MIN</span>
                        </p>
                      </div>
                      <div className="shrink-0 bg-white/5 p-3 rounded-xl border border-white/5 opacity-0 group-hover:opacity-100 transition-all">
                        <ChevronRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-zinc-950/20 border border-dashed border-zinc-800 rounded-[2.5rem]">
                  <Sparkles className="w-10 h-10 text-zinc-800 mx-auto mb-6 opacity-20" />
                  <p className="text-zinc-700 font-black uppercase text-[10px] tracking-[0.3em] italic">All current missions executed.</p>
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
                className="flex items-center gap-8 p-8 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/20 hover:bg-rose-500/10 transition-all group shadow-xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 shadow-inner">
                  <AlertCircle className="w-8 h-8 text-rose-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-2 italic">Financial Variance Detected</p>
                  <p className="text-2xl font-black text-white uppercase italic tracking-tight">
                    {pendingPayments.length} Oustanding Settlement{pendingPayments.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-zinc-600 text-[10px] font-black mt-2 uppercase tracking-widest italic opacity-70">Immediate reconciliation required to maintain operational access.</p>
                </div>
                <div className="p-5 bg-white rounded-2xl text-zinc-950 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-2xl active:scale-90">
                   <ArrowRight className="w-6 h-6" />
                </div>
              </Link>
            </motion.div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
