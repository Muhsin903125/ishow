"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import type { Assessment } from "@/lib/db/assessments";
import type { Plan } from "@/lib/db/plans";
import type { TrainingSession } from "@/lib/db/sessions";
import type { Payment } from "@/lib/db/payments";
import { loadCustomerWorkspace } from "@/lib/api/workspace";
import {
  Calendar,
  CreditCard,
  ArrowRight,
  Target,
  Flame,
  CheckCircle2,
  AlertCircle,
  Activity,
  ChevronRight,
  Sparkles,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [plan, setPlan] = useState<Plan | null | "loading">("loading");
  const [sessions, setSessions] = useState<TrainingSession[] | "loading">("loading");
  const [payments, setPayments] = useState<Payment[] | "loading">("loading");
  const [bootState, setBootState] = useState<"loading" | "ready" | "redirecting">("loading");

  useEffect(() => {
    let active = true;

    if (loading) return;
    
    if (!user) {
      router.replace("/login");
      return;
    }
    
    if (user.role === "trainer") {
      router.replace("/trainer/dashboard");
      return;
    }

    if (user.role === "admin") {
      router.replace("/admin");
      return;
    }
    (async () => {
      const workspaceResult = await Promise.allSettled([loadCustomerWorkspace()]);

      if (!active) return;

      const workspace =
        workspaceResult[0].status === "fulfilled" ? workspaceResult[0].value : null;
      const resolvedAssessment = workspace?.assessment ?? null;

      if (!resolvedAssessment) {
        router.replace("/assessment");
        return;
      }

      setAssessment(resolvedAssessment);
      setPlan(workspace?.plan ?? null);
      setSessions(workspace?.sessions ?? []);
      setPayments(workspace?.payments ?? []);
      setBootState("ready");
    })();

    return () => {
      active = false;
    };
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

  if (loading || bootState !== "ready") {
    return (
      <DashboardLayout role="customer">
        <div className="p-6 space-y-6 bg-muted/20 min-h-screen">
          <Skeleton className="h-8 w-48 mb-2" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <Skeleton className="h-80 rounded-2xl" />
             <Skeleton className="lg:col-span-2 h-80 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      label: "Upcoming Sessions",
      value: sessions === "loading" ? null : upcomingSessions.length,
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-100",
      trend: "Next in 4h"
    },
    {
      label: "Active Plan",
      value: plan === "loading" ? null : plan ? plan.name : "None",
      icon: Target,
      color: "text-orange-600",
      bg: "bg-orange-100",
      trend: "Good progress"
    },
    {
      label: "Pending Dues",
      value: payments === "loading" ? null : pendingPayments.length > 0 ? `AED ${pendingPayments.reduce((s, p) => s + (p.amount || 0), 0)}` : "None",
      icon: CreditCard,
      color: pendingPayments.length > 0 ? "text-red-600" : "text-emerald-600",
      bg: pendingPayments.length > 0 ? "bg-red-100" : "bg-emerald-100",
      trend: pendingPayments.length > 0 ? "Requires action" : "All clear"
    },
    {
      label: "Activity Level",
      value: "High",
      icon: Activity,
      color: "text-purple-600",
      bg: "bg-purple-100",
      trend: "Top 10%"
    },
  ];

  return (
    <DashboardLayout role="customer">
      <div className="flex flex-col h-full bg-transparent">
        <div className="flex-1 overflow-y-auto space-y-6 p-6 md:p-8">
          <section className="rounded-[2rem] border border-orange-100 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_55%,#eff6ff_100%)] p-6 shadow-[0_24px_60px_rgba(249,115,22,0.08)] md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-700">
                  <Flame className="h-3.5 w-3.5" />
                  Customer dashboard
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Welcome back, {user?.name?.split(" ")[0]}</h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
                    Your plan, assessment, upcoming sessions, and billing status are all organized in one clean workspace.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Plan</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{plan === "loading" ? "Loading" : plan?.name ?? "Pending"}</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Sessions</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{upcomingSessions.length} upcoming</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm sm:col-span-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Location</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{assessment?.preferredLocation ?? "Flexible"}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600">
                <Link href="/sessions">
                  <Calendar className="mr-2 h-4 w-4" />
                  View schedule
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-xl border-border bg-white/80 px-5 text-sm font-semibold">
                <Link href="/my-plan">
                  <Target className="mr-2 h-4 w-4" />
                  Review plan
                </Link>
              </Button>
            </div>
          </section>
          {/* Today's Alert */}
          {todaySession && (
            <Card className="overflow-hidden rounded-[1.75rem] border border-orange-100 bg-white/92 shadow-sm">
              <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100">
                    <Activity className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <Badge className="mb-2 border-none bg-orange-100 text-orange-700">Next session</Badge>
                    <p className="text-lg font-semibold text-slate-950">{todaySession.title}</p>
                    <p className="text-sm text-slate-600">Starts at {todaySession.scheduledTime} • {todaySession.duration} min</p>
                  </div>
                </div>
                <Button asChild className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800">
                  <Link href="/sessions">Open sessions</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon: Icon, color, bg, trend }) => (
              <Card key={label} className="rounded-[1.5rem] border border-border/80 bg-white/92 shadow-sm">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${bg}`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <Badge variant="outline" className="border-transparent bg-slate-100 text-[10px] font-semibold text-slate-600">
                      {trend}
                    </Badge>
                  </div>
                  <p className="truncate text-2xl font-bold text-slate-950">{value ?? "..."}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Active Plan */}
            <Card className="lg:col-span-4 shadow-sm border-border bg-background flex flex-col">
              <CardHeader className="py-4 border-b border-border">
                <CardTitle className="text-sm font-bold">Active Plan</CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col justify-between">
                {plan === "loading" ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : plan ? (
                  <div className="space-y-6">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                       <Target className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground">{plan.name}</p>
                      <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 mt-2 text-[10px] font-semibold">Premium Member</Badge>
                    </div>
                    <div className="pt-6 border-t border-border">
                       <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Monthly Investment</p>
                       <p className="text-2xl font-bold text-foreground">AED {plan.monthlyRate}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center bg-muted/30 rounded-xl border border-dashed border-border">
                    <AlertCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-xs font-medium text-muted-foreground">Awaiting plan assignment</p>
                  </div>
                )}
                <Button asChild variant="outline" className="mt-8 w-full justify-between h-10 border-border hover:bg-muted text-xs font-semibold">
                  <Link href="/sessions">
                    <span>View Curriculum</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Sessions */}
            <Card className="lg:col-span-8 shadow-sm border-border bg-background">
              <CardHeader className="py-4 border-b border-border flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-bold">Training Schedule</CardTitle>
                <Link href="/sessions" className="text-xs font-semibold text-orange-600 hover:underline">
                  Full History
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {sessions === "loading" ? (
                    <div className="p-6 space-y-4">
                      {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                    </div>
                  ) : upcomingSessions.length > 0 ? (
                    upcomingSessions.map((sess) => (
                      <div key={sess.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{sess.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                               <Badge variant="ghost" className="text-[10px] p-0 text-muted-foreground font-semibold uppercase">{formatDate(sess.scheduledDate)}</Badge>
                               <span className="text-[10px] text-muted-foreground opacity-30">•</span>
                               <span className="text-[10px] text-orange-600 font-bold uppercase">{sess.scheduledTime}</span>
                            </div>
                          </div>
                        </div>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Link href="/sessions">
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center">
                      <Sparkles className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-xs font-medium text-muted-foreground">No upcoming sessions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-7 shadow-sm border-border bg-background">
              <CardHeader className="py-4 border-b border-border">
                <CardTitle className="text-sm font-bold">Assessment Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-orange-600" />
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Goals</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {assessment?.goals?.length ? (
                        assessment.goals.map((goal) => (
                          <Badge key={goal} variant="outline" className="text-[10px] font-semibold uppercase bg-orange-50 text-orange-700 border-orange-200">
                            {goal.replace(/_/g, " ")}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">No goals saved</span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Experience</p>
                    </div>
                    <p className="text-sm font-bold text-foreground uppercase">
                      {assessment?.experienceLevel?.replace(/_/g, " ") ?? "Not set"}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      {assessment?.daysPerWeek ? `${assessment.daysPerWeek} training days/week` : "Training frequency pending"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Location</p>
                    </div>
                    <p className="text-sm font-bold text-foreground uppercase">
                      {assessment?.preferredLocation ?? "Online / flexible"}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      {assessment?.preferredTimes?.replace(/_/g, " ") ?? "Preferred time pending"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-5 shadow-sm border-border bg-background">
              <CardHeader className="py-4 border-b border-border">
                <CardTitle className="text-sm font-bold">Assessment Status</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Assessment completed</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted {assessment ? new Date(assessment.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "recently"}.
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">One-time onboarding</p>
                  <p className="text-xs text-muted-foreground">
                    Your assessment is locked in and used as the base for your dashboard, plan setup, and trainer review workflow.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Payment Alert */}
          {payments !== "loading" && pendingPayments.length > 0 && (
            <Card className="bg-red-50 border border-red-100 rounded-xl overflow-hidden shadow-sm">
              <CardContent className="p-5 flex items-center gap-6">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <Badge variant="destructive" className="bg-red-600 text-white border-none mb-1 text-[9px] font-bold uppercase tracking-wider">Payment Due</Badge>
                  <p className="text-base font-bold text-foreground">
                    {pendingPayments.length} Pending Settlement{pendingPayments.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-red-700/60 text-[10px] font-medium mt-0.5 uppercase tracking-wider">Total: AED {pendingPayments.reduce((s, p) => s + (p.amount || 0), 0)}</p>
                </div>
                <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold px-6">
                  <Link href="/payments">Pay Now</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
