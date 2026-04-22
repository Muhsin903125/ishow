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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
        <div className="p-6 lg:p-8 space-y-6">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <Skeleton className="h-80 rounded-3xl" />
             <Skeleton className="lg:col-span-2 h-80 rounded-3xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="customer">
      <div className="p-6 lg:p-8 space-y-8">
        
        {/* ── Welcome Hero ─────────────────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="relative overflow-hidden bg-zinc-900 border-zinc-800 rounded-[2rem]">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background: "radial-gradient(circle at top right, var(--color-orange-500) 0%, transparent 70%)",
              }}
            />
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex-1 space-y-6">
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] italic">
                    <Zap className="w-3 h-3 mr-2 fill-current" /> Operational Status: Active
                  </Badge>
                  <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-tight">
                    Status <span className="text-orange-500">Check</span>, {user?.name?.split(" ")[0]}
                  </h1>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed italic max-w-lg">
                    {todaySession
                      ? `Tactical session deployed for today. Final preparation advised.`
                      : "Mission parameters normalized. System awaiting next scheduled execution."}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Button asChild className="bg-white text-zinc-950 hover:bg-orange-500 hover:text-white rounded-xl h-12 px-8 font-black uppercase italic tracking-wider text-[11px]">
                      <Link href="/sessions">Training Hub</Link>
                    </Button>
                    <Button asChild variant="outline" className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700 rounded-xl h-12 px-8 font-black uppercase italic tracking-wider text-[11px]">
                      <Link href="/assessments">Assessments</Link>
                    </Button>
                  </div>
                </div>
                
                <div className="hidden lg:flex w-40 h-40 rounded-3xl bg-zinc-950 border border-zinc-800 items-center justify-center shrink-0 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-orange-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Flame className="w-16 h-16 text-zinc-900 group-hover:text-orange-500 transition-all rotate-12 group-hover:rotate-0" />
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center">
                     <CheckCircle2 className="w-5 h-5 text-orange-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Today's Session Alert ────────────────────────── */}
        {todaySession && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-orange-600 border-none shadow-2xl shadow-orange-500/20 overflow-hidden rounded-[2rem]">
              <CardContent className="p-8 md:p-10 relative flex flex-col md:flex-row items-center gap-8">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
                  <Activity className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <Badge className="bg-white/20 text-orange-100 border-none mb-3 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] italic">Immediate Deployment</Badge>
                  <p className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">{todaySession.title}</p>
                  <p className="text-orange-100 text-xs font-bold mt-3 uppercase tracking-widest italic opacity-80">
                    {todaySession.scheduledTime} <span className="mx-3">•</span> {todaySession.duration} MIN DURATION
                  </p>
                </div>
                <Button asChild className="bg-zinc-950 text-white hover:bg-white hover:text-zinc-950 rounded-xl h-14 px-10 font-black uppercase italic tracking-wider text-[11px] w-full md:w-auto">
                  <Link href="/sessions">Commence Op</Link>
                </Button>
              </CardContent>
            </Card>
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay }}
              className="h-full"
            >
              <Link href={href} className="block h-full group">
                <Card className="h-full bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all rounded-[1.5rem] overflow-hidden relative">
                  <CardContent className="p-6 md:p-8">
                    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    {value === null ? (
                      <Skeleton className="h-8 w-16 mb-2" />
                    ) : (
                      <p className="text-2xl font-black text-white italic uppercase tracking-tight">{value}</p>
                    )}
                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1 italic group-hover:text-zinc-400 transition-colors">{label}</p>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                       <ChevronRight className="w-4 h-4 text-zinc-700" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── Active Framework ─────────────────────────────── */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-4"
          >
            <Card className="h-full bg-zinc-900 border-zinc-800 rounded-[2rem] flex flex-col overflow-hidden group">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <CardTitle className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic">Active Framework</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-4 flex-1 flex flex-col justify-between">
                <div className="space-y-8">
                  {plan === "loading" ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ) : plan ? (
                    <>
                      <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                         <Target className="w-8 h-8 text-emerald-500 transition-colors" />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{plan.name}</p>
                        <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5 mt-4 px-2 py-0 text-[9px] font-black uppercase tracking-widest italic">Premium Enrolment Active</Badge>
                      </div>
                      <div className="pt-8 border-t border-zinc-800/50">
                         <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-2 italic">Fee Structure</p>
                         <p className="text-2xl font-black text-white italic">AED {plan.monthlyRate}<span className="text-[10px] text-zinc-600 ml-2 tracking-widest">/ PERIOD</span></p>
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center bg-zinc-950/30 rounded-2xl border border-dashed border-zinc-800">
                      <AlertCircle className="w-10 h-10 text-zinc-800 mx-auto mb-4 opacity-30" />
                      <p className="text-zinc-700 font-black uppercase text-[10px] tracking-widest italic leading-loose">Awaiting operational<br/>framework deployment</p>
                    </div>
                  )}
                </div>
                
                <Button asChild variant="ghost" className="mt-12 w-full justify-between h-14 bg-zinc-950 border border-zinc-800 hover:border-orange-500/30 hover:bg-zinc-950 rounded-xl px-6 group/btn">
                  <Link href="/sessions">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic group-hover:text-white transition-colors">Syllabus Manifest</span>
                    <ArrowRight className="w-4 h-4 text-orange-500 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Upcoming Manifest ────────────────────────────── */}
          <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6 }}
             className="lg:col-span-8"
          >
            <Card className="h-full bg-zinc-900 border-zinc-800 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 md:p-10 pb-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                   <CardTitle className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic">Deployment Manifest</CardTitle>
                </div>
                <Button asChild variant="link" className="text-[10px] font-black text-orange-500 uppercase tracking-widest p-0 h-auto hover:text-white italic">
                  <Link href="/sessions">Training Log</Link>
                </Button>
              </CardHeader>
              <CardContent className="p-8 md:p-10 pt-4">
                {sessions === "loading" ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                  </div>
                ) : upcomingSessions.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingSessions.map((sess) => (
                      <Link key={sess.id} href="/sessions" className="block group">
                        <Card className="bg-zinc-950/50 border-zinc-800/50 rounded-2xl hover:border-zinc-600 transition-all overflow-hidden relative">
                          <CardContent className="p-5 flex items-center gap-6">
                            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all">
                              <Calendar className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-white uppercase italic tracking-tight text-base truncate">{sess.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <Badge variant="outline" className="text-[9px] border-zinc-800 text-zinc-500 px-1.5 py-0 font-black uppercase italic tracking-wider">{formatDate(sess.scheduledDate)}</Badge>
                                 <span className="text-[9px] text-zinc-700 font-black uppercase italic tracking-widest">{sess.scheduledTime}</span>
                                 <span className="text-[9px] text-orange-500/60 font-black uppercase italic tracking-widest">• {sess.duration} MIN</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-white transition-colors" />
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-zinc-950/20 border border-dashed border-zinc-800 rounded-[1.5rem]">
                    <Sparkles className="w-8 h-8 text-zinc-800 mx-auto mb-4 opacity-20" />
                    <p className="text-zinc-700 font-black uppercase text-[10px] tracking-[0.3em] italic">All current missions executed.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Pending Liability Notice ──────────────────────── */}
        {payments !== "loading" && pendingPayments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Link href="/payments" className="block group">
              <Card className="bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40 transition-all rounded-[2rem] overflow-hidden">
                <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <Badge variant="destructive" className="bg-rose-500/20 text-rose-500 border-none mb-3 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] italic">Financial Variance Detected</Badge>
                    <p className="text-2xl font-black text-white uppercase italic tracking-tight">
                      {pendingPayments.length} Oustanding Settlement{pendingPayments.length > 1 ? "s" : ""}
                    </p>
                    <p className="text-zinc-600 text-[10px] font-black mt-2 uppercase tracking-widest italic opacity-70">Immediate reconciliation required to maintain operational access.</p>
                  </div>
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-zinc-950 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-xl active:scale-95">
                     <ArrowRight className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

      </div>
    </DashboardLayout>
  );
}
