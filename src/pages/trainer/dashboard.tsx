"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { listCustomers, type Profile } from "@/lib/db/profiles";
import { listAssessments, type Assessment } from "@/lib/db/assessments";
import { listSessions, type TrainingSession } from "@/lib/db/sessions";
import { listPayments, type Payment } from "@/lib/db/payments";
import { 
  Users, 
  ClipboardList, 
  Calendar, 
  DollarSign, 
  ArrowRight, 
  Clock, 
  CheckCircle,
  Activity,
  Zap,
  ChevronRight,
  Target,
  Shield,
  TrendingUp,
  Plus,
  Settings,
  UserCog,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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

    listCustomers().then(setClients).catch(() => setClients([]));
    listAssessments("pending").then(setPendingAssessments).catch(() => setPendingAssessments([]));
    listSessions({ trainerId: user.id }).then(setSessions).catch(() => setSessions([]));
    listPayments().then(setPayments).catch(() => setPayments([]));
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
      <div className="flex flex-col h-full bg-muted/20">
        {/* Header */}
        <div className="bg-background border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Zap className="w-4 h-4 text-orange-600 fill-current" />
             </div>
             <div>
                <h1 className="text-lg font-bold text-foreground leading-none">Trainer Hub</h1>
                <p className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">Performance Oversight</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Schedule
            </Button>
            <Button size="sm" className="h-8 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Client
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon: Icon, color, bg, trend }, idx) => (
              <Card key={label} className="shadow-sm border-border bg-background">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`w-4.5 h-4.5 ${color}`} />
                    </div>
                    <Badge variant="ghost" className="text-[10px] font-medium text-muted-foreground p-0">
                      {trend}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
                  </div>
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
                <div className="p-4 rounded-xl border border-border bg-background hover:border-orange-500/30 hover:shadow-md transition-all h-full">
                  <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <h3 className="text-xs font-bold text-foreground mb-0.5">{label}</h3>
                  <p className="text-[10px] text-muted-foreground font-medium">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
