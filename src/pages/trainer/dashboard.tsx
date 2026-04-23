"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import type { Profile } from "@/lib/db/profiles";
import type { Assessment } from "@/lib/db/assessments";
import type { TrainingSession } from "@/lib/db/sessions";
import type { Payment } from "@/lib/db/payments";
import { loadTrainerWorkspace } from "@/lib/api/workspace";
import { 
  Users, 
  ClipboardList, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle,
  Zap,
  ChevronRight,
  Target,
  Settings,
  UserCog,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TrainerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [clients, setClients] = useState<Profile[] | "loading">("loading");
  const [pendingAssessments, setPendingAssessments] = useState<Assessment[] | "loading">("loading");
  const [sessions, setSessions] = useState<TrainingSession[] | "loading">("loading");
  const [payments, setPayments] = useState<Payment[] | "loading">("loading");

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push("/login"); 
      return; 
    }
    
    if (user.role === "customer") { router.push("/dashboard"); return; }
    if (user.role === "admin") { router.push("/admin"); return; }

    loadTrainerWorkspace()
      .then((workspace) => {
        setClients(workspace.clients);
        setPendingAssessments(workspace.pendingAssessments);
        setSessions(workspace.sessions);
        setPayments(workspace.payments);
      })
      .catch(() => {
        setClients([]);
        setPendingAssessments([]);
        setSessions([]);
        setPayments([]);
      });
  }, [user, loading, router]);

  const today = new Date().toISOString().split("T")[0];
  const todaySessions = sessions !== "loading" 
    ? sessions.filter(s => s.scheduledDate === today && s.status === "scheduled")
    : [];

  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthlyRevenue = payments !== "loading"
    ? payments
        .filter(p => p.status === "paid" && p.paidDate?.startsWith(thisMonth))
        .reduce((sum, p) => sum + (p.amount || 0), 0)
    : 0;

  const getClientName = (userId: string) => {
    if (clients === "loading") return "Loading...";
    return clients.find((c) => c.id === userId)?.name ?? "Unknown";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric" 
    });
  };

  if (loading || clients === "loading") {
    return (
      <DashboardLayout role="trainer">
        <div className="p-6 space-y-6 bg-muted/20 min-h-screen">
           <Skeleton className="h-8 w-48 mb-2" />
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-96 rounded-2xl" />
              <Skeleton className="h-96 rounded-2xl" />
           </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { 
      label: "Active Clients", 
      value: clients.length, 
      icon: Users, 
      color: "text-blue-600", 
      bg: "bg-blue-100",
      trend: "Full capacity"
    },
    { 
      label: "Pending Reviews", 
      value: pendingAssessments === "loading" ? "..." : pendingAssessments.length, 
      icon: ClipboardList, 
      color: "text-orange-600", 
      bg: "bg-orange-100",
      trend: "Urgent action"
    },
    { 
      label: "Sessions Today", 
      value: sessions === "loading" ? "..." : todaySessions.length, 
      icon: Calendar, 
      color: "text-purple-600", 
      bg: "bg-purple-100",
      trend: "Next in 2h"
    },
    { 
      label: "Revenue (MTD)", 
      value: payments === "loading" ? "..." : `AED ${monthlyRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      color: "text-emerald-600", 
      bg: "bg-emerald-100",
      trend: "+8.2% vs target"
    },
  ];

  return (
    <DashboardLayout role="trainer">
      <div className="flex flex-col h-full bg-transparent">
        <div className="flex-1 overflow-y-auto space-y-6 p-6 md:p-8">
          <section className="rounded-[2rem] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#f8fafc_100%)] p-6 shadow-[0_24px_60px_rgba(37,99,235,0.08)] md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700">
                  <Zap className="h-3.5 w-3.5" />
                  Trainer dashboard
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Trainer Hub</h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
                    Review assessments, manage client momentum, and keep today&apos;s training queue moving from one place.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Clients</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{clients.length}</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Reviews</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{pendingAssessments === "loading" ? "..." : pendingAssessments.length}</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm sm:col-span-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Revenue</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">AED {monthlyRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700">
                <Link href="/trainer/clients">
                  <Users className="mr-2 h-4 w-4" />
                  Open clients
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-xl border-border bg-white/80 px-5 text-sm font-semibold">
                <Link href="/trainer/sessions">
                  <Calendar className="mr-2 h-4 w-4" />
                  View operations
                </Link>
              </Button>
            </div>
          </section>

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
                  <p className="text-2xl font-bold text-slate-950">{value}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Review Queue */}
            <Card className="lg:col-span-2 shadow-sm border-border bg-background">
              <CardHeader className="py-4 border-b border-border flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm font-bold">Review Queue</CardTitle>
                  <CardDescription className="text-[11px]">Assessments awaiting trainer feedback.</CardDescription>
                </div>
                <Link href="/trainer/clients" className="text-xs font-semibold text-orange-600 hover:underline">
                  View All
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {pendingAssessments !== "loading" && pendingAssessments.length > 0 ? (
                    pendingAssessments.map((assessment) => (
                      <div key={assessment.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-lg border border-border">
                            <AvatarFallback className="text-xs bg-muted text-foreground font-bold">
                              {getClientName(assessment.userId).charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold text-foreground">{getClientName(assessment.userId)}</p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                               <Clock className="w-3 h-3" /> Submitted {formatDate(assessment.submittedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Badge variant="outline" className="text-[9px] h-5 bg-orange-50 text-orange-700 border-orange-200">Pending Review</Badge>
                           <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                             <Link href={`/trainer/clients/${assessment.userId}`}>
                               <ChevronRight className="w-4 h-4" />
                             </Link>
                           </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-16 text-center">
                       <CheckCircle className="w-8 h-8 text-emerald-500/30 mx-auto mb-3" />
                       <p className="text-xs font-medium text-muted-foreground">All assessments reviewed</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card className="shadow-sm border-border bg-background flex flex-col">
              <CardHeader className="py-4 border-b border-border">
                <CardTitle className="text-sm font-bold">Today&apos;s Schedule</CardTitle>
                <CardDescription className="text-[11px]">Training deployments for {formatDate(today)}.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <div className="divide-y divide-border">
                  {todaySessions.length > 0 ? (
                    todaySessions.map((session) => (
                      <div key={session.id} className="px-5 py-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-start justify-between mb-1.5">
                          <div>
                            <p className="text-xs font-bold text-foreground">{session.title}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{getClientName(session.userId)}</p>
                          </div>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{session.scheduledTime}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                           <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground/70 uppercase">
                             <Target className="w-2.5 h-2.5" /> {session.duration}m
                           </div>
                           <Badge variant="ghost" className="text-[9px] p-0 text-emerald-600 font-bold uppercase tracking-wider">{session.status}</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-16 text-center">
                       <Calendar className="w-8 h-8 text-muted/20 mx-auto mb-3" />
                       <p className="text-xs font-medium text-muted-foreground">No sessions today</p>
                    </div>
                  )}
                </div>
                {todaySessions.length > 0 && (
                   <div className="p-3 bg-muted/10 border-t border-border text-center">
                      <Link href="/trainer/sessions" className="text-[10px] font-bold text-blue-600 hover:underline">
                        View Full Calendar
                      </Link>
                   </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6">
            {[
              { href: "/trainer/clients", label: "My Clients", desc: "Manage program", icon: Users, color: "text-blue-600" },
              { href: "/admin/master/plan-templates", label: "Library", desc: "Templates", icon: Target, color: "text-orange-600" },
              { href: "/trainer/team", label: "Colleagues", desc: "Trainer network", icon: UserCog, color: "text-purple-600" },
              { href: "/trainer/settings", label: "Profile", desc: "Account setup", icon: Settings, color: "text-muted-foreground" },
            ].map(({ href, label, desc, icon: Icon, color }) => (
              <Link key={href} href={href} className="group">
                <div className="h-full rounded-[1.5rem] border border-border/80 bg-white/92 p-4 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
                  <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 transition-transform group-hover:scale-110`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <h3 className="mb-0.5 text-xs font-bold text-slate-950">{label}</h3>
                  <p className="text-[10px] font-medium text-slate-500">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
