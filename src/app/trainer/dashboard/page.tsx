"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { listCustomers, type Profile } from "@/lib/db/profiles";
import { listAssessments, type Assessment } from "@/lib/db/assessments";
import { listSessions, type TrainingSession } from "@/lib/db/sessions";
import { listPayments, type Payment } from "@/lib/db/payments";
import { SkeletonCard, SkeletonSessionRow } from "@/components/ui/Skeleton";
import { 
  Users, 
  ClipboardList, 
  Calendar, 
  DollarSign, 
  ArrowRight, 
  Clock, 
  CheckCircle,
  TrendingUp,
  LayoutGrid
} from "lucide-react";

export default function TrainerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [clients, setClients] = useState<Profile[] | "loading">("loading");
  const [pendingAssessments, setPendingAssessments] = useState<Assessment[] | "loading">("loading");
  const [sessions, setSessions] = useState<TrainingSession[] | "loading">("loading");
  const [payments, setPayments] = useState<Payment[] | "loading">("loading");

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (user.role === "customer") { router.push("/dashboard"); return; }
    if (user.role === "admin") { router.push("/admin/dashboard"); return; }

    // Fetch data in parallel
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

  if (loading) {
    return (
      <DashboardLayout role="trainer">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-pulse">
          <div className="h-20 bg-zinc-900 border border-zinc-800 rounded-2xl w-full" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-zinc-900 border border-zinc-800 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonCard className="h-64" />
            <SkeletonCard className="h-64" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { 
      label: "Total Clients", 
      value: clients === "loading" ? "..." : clients.length, 
      icon: Users, 
      accent: "bg-blue-500", 
      light: "text-blue-400 bg-blue-500/10 border-blue-500/20" 
    },
    { 
      label: "Pending Assessments", 
      value: pendingAssessments === "loading" ? "..." : pendingAssessments.length, 
      icon: ClipboardList, 
      accent: "bg-orange-500", 
      light: "text-orange-400 bg-orange-500/10 border-orange-500/20" 
    },
    { 
      label: "Today's Sessions", 
      value: sessions === "loading" ? "..." : todaySessions.length, 
      icon: Calendar, 
      accent: "bg-emerald-500", 
      light: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
    },
    { 
      label: "Monthly Revenue", 
      value: payments === "loading" ? "..." : `AED ${monthlyRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      accent: "bg-violet-500", 
      light: "text-violet-400 bg-violet-500/10 border-violet-500/20" 
    },
  ];

  return (
    <DashboardLayout role="trainer">
      <div className="min-h-full bg-zinc-950 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-[120px]" />
        
        <div className="relative z-10 p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="text-orange-500 text-xs font-bold tracking-[0.3em] uppercase mb-1.5">Elite Coaching</p>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Trainer Dashboard</h1>
            <p className="text-zinc-500 mt-2 text-sm max-w-lg">
              Welcome back, {user?.name?.split(" ")[0]}! Managing {clients === "loading" ? 'your' : clients.length} high-performance clients today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, value, icon: Icon, accent, light }) => (
              <div key={label} className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 relative overflow-hidden hover:border-zinc-700 transition-colors">
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent}`} />
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-4 ${light}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-zinc-500 text-xs mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pending Assessments Section */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-orange-400" />
                  <h2 className="font-bold text-white text-sm">Review Required</h2>
                </div>
                {pendingAssessments !== "loading" && pendingAssessments.length > 0 && (
                  <span className="text-[10px] font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {pendingAssessments.length} New
                  </span>
                )}
              </div>
              
              <div className="p-5 flex-1 flex flex-col gap-3">
                {pendingAssessments === "loading" ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonSessionRow key={i} />)
                ) : pendingAssessments.length > 0 ? (
                  pendingAssessments.map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/50 hover:border-orange-500/30 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-black text-sm shrink-0">
                          {getClientName(assessment.userId).charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{getClientName(assessment.userId)}</p>
                          <p className="text-zinc-500 text-xs mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDate(assessment.submittedAt)}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/trainer/clients/${assessment.userId}`}
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-orange-500 text-zinc-400 hover:text-white border border-zinc-700 transition-all"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
                      <CheckCircle className="w-6 h-6 text-emerald-500/50" />
                    </div>
                    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest leading-relaxed">
                      All caught up.<br/><span className="opacity-60 font-medium">No pending reviews.</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Today's Schedule Section */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <h2 className="font-bold text-white text-sm">Today&apos;s Lineup</h2>
                </div>
                <Link href="/trainer/sessions" className="text-xs font-bold text-zinc-500 hover:text-white transition-colors">
                  Full Schedule
                </Link>
              </div>

              <div className="p-5 flex-1 flex flex-col gap-3">
                {sessions === "loading" ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonSessionRow key={i} />)
                ) : todaySessions.length > 0 ? (
                  todaySessions.map((session) => (
                    <div key={session.id} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/50">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Clock className="w-4.5 h-4.5 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">{session.title}</p>
                        <p className="text-zinc-500 text-xs mt-0.5 truncate">
                          {getClientName(session.userId)} · {session.scheduledTime} · {session.duration}min
                        </p>
                      </div>
                      <span className="text-[10px] font-black text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 uppercase tracking-wider shrink-0">
                        {session.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
                      <Calendar className="w-6 h-6 text-zinc-700" />
                    </div>
                    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest leading-relaxed">
                      Zero sessions today.<br/><span className="opacity-60 font-medium">Time for planning.</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Grid: Quick Actions & Recent Clients */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-1 grid grid-cols-1 gap-4">
              {[
                { label: "Client Directory", icon: Users, href: "/trainer/clients", color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "Manage Programs", icon: TrendingUp, href: "/trainer/programs", color: "text-purple-400", bg: "bg-purple-500/10" },
                { label: "Team Comms", icon: LayoutGrid, href: "/trainer/team", color: "text-orange-400", bg: "bg-orange-500/10" },
              ].map((action) => (
                <Link 
                  key={action.label} 
                  href={action.href}
                  className="group rounded-2xl bg-zinc-900 border border-zinc-800 p-5 flex items-center justify-between hover:border-zinc-700 transition-all hover:bg-zinc-800/50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center transition-colors group-hover:border-zinc-600`}>
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <span className="font-bold text-white text-sm">{action.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                </Link>
              ))}
            </div>

            {/* Recent Clients Snapshot */}
            <div className="lg:col-span-2 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800/50">
                <h2 className="font-bold text-white text-sm">Recent Clients</h2>
                <Link href="/trainer/clients" className="text-xs font-bold text-zinc-500 hover:text-white transition-colors">
                  See All
                </Link>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {clients === "loading" ? (
                   Array.from({ length: 4 }).map((_, i) => <SkeletonSessionRow key={i} />)
                ) : clients.length > 0 ? (
                  clients.slice(0, 4).map((client) => (
                    <Link
                      key={client.id}
                      href={`/trainer/clients/${client.id}`}
                      className="flex items-center gap-3 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/30 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-white font-black text-xs shrink-0 group-hover:from-orange-500 group-hover:to-orange-700 transition-all">
                        {client.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">{client.name}</p>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest truncate">{client.customerStatus || 'Inactive'}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-white" />
                    </Link>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-6 text-zinc-500 text-sm">No clients assigned yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
