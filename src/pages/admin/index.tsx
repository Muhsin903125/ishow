"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { listTrainers, listCustomers, type Profile } from "@/lib/db/profiles";
import { listAssessments, type Assessment } from "@/lib/db/assessments";
import { listSessions, type TrainingSession } from "@/lib/db/sessions";
import { listPayments, type Payment } from "@/lib/db/payments";
import { 
  Users, 
  UserCog, 
  Calendar, 
  CreditCard, 
  ChevronRight, 
  Clock, 
  Database, 
  MessageSquare,
  TrendingUp,
  UserRoundPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [trainers, setTrainers] = useState<Profile[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.replace("/login"); 
      return; 
    }
    
    if (user.role === 'customer') { router.replace('/dashboard'); return; }
    if (user.role === 'trainer') { router.replace('/trainer/dashboard'); return; }

    const init = async () => {
      try {
        const [t, c, a, s, p] = await Promise.all([
          listTrainers(), listCustomers(), listAssessments(), listSessions(), listPayments(),
        ]);
        setTrainers(t);
        setCustomers(c);
        setAssessments(a);
        setSessions(s);
        setPayments(p);
      } catch (err) {
        console.error("Error loading admin dashboard:", err);
      } finally {
        setDataLoaded(true);
      }
    };
    init();
  }, [loading, router, user]);

  if (loading || !dataLoaded || !user) {
    return (
      <DashboardLayout role="admin">
        <div className="p-6 space-y-6 bg-muted/20 min-h-screen">
           <div className="flex items-center justify-between mb-2">
             <Skeleton className="h-8 w-48" />
             <Skeleton className="h-10 w-32" />
           </div>
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

  const today = new Date().toISOString().split("T")[0];
  const customerById = Object.fromEntries(customers.map((c) => [c.id, c]));
  const pendingAssessments = assessments.filter((a) => a.status === "pending");
  const todaySessions = sessions.filter((s) => s.status === "scheduled" && s.scheduledDate === today);
  const overduePayments = payments.filter((p) => p.status === "overdue");

  const stats = [
    { 
      label: "Total Trainers", 
      value: trainers.length, 
      icon: UserCog, 
      color: "text-orange-600", 
      bg: "bg-orange-100",
      trend: "+2 this month"
    },
    { 
      label: "Active Clients", 
      value: customers.length, 
      icon: Users, 
      color: "text-blue-600", 
      bg: "bg-blue-100",
      trend: "+12.5% vs last month"
    },
    { 
      label: "Sessions Today", 
      value: todaySessions.length, 
      icon: Calendar, 
      color: "text-purple-600", 
      bg: "bg-purple-100",
      trend: "4 remaining"
    },
    {
      label: "Pending Dues", 
      value: overduePayments.length, 
      icon: CreditCard,
      color: overduePayments.length > 0 ? "text-red-600" : "text-emerald-600",
      bg: overduePayments.length > 0 ? "bg-red-100" : "bg-emerald-100",
      trend: overduePayments.length > 0 ? "Requires action" : "All clear"
    },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="flex flex-col h-full bg-transparent">
        <div className="flex-1 overflow-y-auto space-y-6 p-6 md:p-8">
          <section className="rounded-[2rem] border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_55%,#f8fafc_100%)] p-6 shadow-[0_24px_60px_rgba(16,185,129,0.08)] md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  <Shield className="h-3.5 w-3.5" />
                  Admin dashboard
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Operations overview</h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
                    Monitor trainers, clients, sessions, and payments from a single command layer built for daily admin operations.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Trainers</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{trainers.length}</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Clients</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{customers.length}</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm sm:col-span-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Queue</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{pendingAssessments.length} pending</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700">
                <Link href="/admin/clients">
                  <Users className="mr-2 h-4 w-4" />
                  Manage clients
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-xl border-border bg-white/80 px-5 text-sm font-semibold">
                <Link href="/admin/leads">
                  <UserRoundPlus className="mr-2 h-4 w-4" />
                  Open leads
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-xl border-border bg-white/80 px-5 text-sm font-semibold">
                <Link href="/admin/reports">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Open reports
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
            {/* Trainers Table/List */}
            <Card className="lg:col-span-2 shadow-sm border-border bg-background">
              <CardHeader className="py-4 border-b border-border flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm font-bold">Trainer Corps</CardTitle>
                  <CardDescription className="text-[11px]">Active certified professionals in the field.</CardDescription>
                </div>
                <Link href="/admin/trainers" className="text-xs font-semibold text-orange-600 hover:underline">
                  View Directory
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border">
                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trainer</th>
                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contact</th>
                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {trainers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-10 text-center text-xs text-muted-foreground">No trainers found</td>
                        </tr>
                      ) : trainers.map((trainer) => (
                        <tr key={trainer.id} className="hover:bg-muted/20 transition-colors group">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarFallback className="text-[10px] bg-orange-100 text-orange-700 font-bold">
                                  {trainer.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-semibold text-foreground">{trainer.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-xs text-muted-foreground">{trainer.email}</td>
                          <td className="px-6 py-3">
                            <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Pending Assessments Queue */}
            <Card className="shadow-sm border-border bg-background">
              <CardHeader className="py-4 border-b border-border">
                <CardTitle className="text-sm font-bold">Priority Queue</CardTitle>
                <CardDescription className="text-[11px]">Assessments awaiting review.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {pendingAssessments.length === 0 ? (
                    <div className="py-10 text-center text-xs text-muted-foreground">Queue clear</div>
                  ) : pendingAssessments.slice(0, 5).map((a) => (
                    <div key={a.id} className="px-5 py-4 hover:bg-muted/20 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-xs font-bold text-foreground truncate max-w-[150px]">
                          {customerById[a.userId]?.name || "New Asset"}
                        </p>
                        <Badge variant="outline" className="text-[8px] h-4 font-bold uppercase tracking-tighter bg-orange-50 text-orange-700 border-orange-200">
                          Pending
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Submitted {formatDate(a.submittedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {pendingAssessments.length > 5 && (
                  <div className="p-3 bg-muted/10 border-t border-border text-center">
                    <Link href="/admin/assessments" className="text-[10px] font-bold text-orange-600 hover:underline">
                      View {pendingAssessments.length - 5} more...
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Grid Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6">
            {[
              { href: "/admin/cms", label: "Page Editor", desc: "Manage content", icon: MessageSquare, color: "text-blue-600" },
              { href: "/admin/clients", label: "Clients", desc: "Manage assets", icon: Users, color: "text-orange-600" },
              { href: "/admin/assessments", label: "Assessments", desc: "Review queue", icon: Calendar, color: "text-purple-600" },
              { href: "/admin/master", label: "Master Data", desc: "System config", icon: Database, color: "text-emerald-600" },
            ].map(({ href, label, desc, icon: Icon, color }) => (
              <Link key={href} href={href} className="group">
                <div className="h-full rounded-[1.5rem] border border-border/80 bg-white/92 p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 transition-transform group-hover:scale-110">
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

function Shield({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
