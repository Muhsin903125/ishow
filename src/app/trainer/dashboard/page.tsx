"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    if (user.role === "admin") { router.push("/admin/dashboard"); return; }

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
        <div className="p-6 lg:p-10 space-y-8">
           <Skeleton className="h-64 w-full rounded-3xl" />
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-80 rounded-3xl" />
              <Skeleton className="h-80 rounded-3xl" />
           </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { 
      label: "Force Count", 
      value: clients.length, 
      icon: Users, 
      color: "text-orange-500", 
      bg: "bg-orange-500/10",
    },
    { 
      label: "Review Queue", 
      value: pendingAssessments === "loading" ? "..." : pendingAssessments.length, 
      icon: ClipboardList, 
      color: "text-orange-500", 
      bg: "bg-orange-500/10",
    },
    { 
      label: "Today's Ops", 
      value: sessions === "loading" ? "..." : todaySessions.length, 
      icon: Calendar, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10",
    },
    { 
      label: "Yield (Month)", 
      value: payments === "loading" ? "..." : `AED ${monthlyRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      color: "text-white", 
      bg: "bg-orange-600/10",
    },
  ];

  return (
    <DashboardLayout role="trainer">
      <div className="p-6 lg:p-10 space-y-8">
        
        {/* Welcome Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="relative overflow-hidden bg-zinc-900 border-zinc-800 rounded-3xl">
            <div className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                background: "radial-gradient(circle at top right, rgba(249,115,22,0.1) 0%, transparent 70%)"
              }}
            />
            <CardContent className="p-8 md:p-12 relative z-10 flex flex-wrap items-center justify-between gap-10">
              <div className="max-w-xl">
                 <Badge variant="outline" className="bg-orange-500/10 border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6 px-4 py-1.5">
                    <Zap className="w-3 h-3 fill-orange-500 mr-2" /> Command Center Active
                 </Badge>
                 <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
                    Performance <span className="text-orange-500">Director</span>
                 </h1>
                 <p className="text-zinc-500 text-sm mt-6 font-medium leading-relaxed">
                   Syncing operational data for <span className="text-white font-bold">{clients.length} Elite Clients</span>. 
                   Review pending manifests and coordinate upcoming training deployments.
                 </p>
                  <div className="flex gap-4 mt-8">
                    <Link 
                      href="/trainer/clients" 
                      className={cn(buttonVariants(), "bg-white text-zinc-950 hover:bg-orange-500 hover:text-white rounded-xl px-8 h-12 text-[10px] font-black uppercase tracking-widest italic")}
                    >
                      Deploy Program
                    </Link>
                    <Link 
                      href="/trainer/sessions" 
                      className={cn(buttonVariants({ variant: "outline" }), "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 rounded-xl px-8 h-12 text-[10px] font-black uppercase tracking-widest italic")}
                    >
                      Sync Calendar
                    </Link>
                  </div>
              </div>

              <div className="hidden lg:flex w-32 h-32 rounded-[2.5rem] bg-zinc-950 border border-zinc-800 items-center justify-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-orange-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                 <Target className="w-12 h-12 text-zinc-800 group-hover:text-orange-500 transition-all rotate-12 group-hover:rotate-0" />
                 <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                 </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg }, idx) => (
            <motion.div 
              key={label} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-zinc-900 border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all group overflow-hidden">
                <CardContent className="p-6">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <p className="text-2xl font-black text-white italic truncate">{value}</p>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1 italic group-hover:text-zinc-400 transition-colors">{label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Pending Assessments */}
          <Card className="bg-zinc-900 border-zinc-800 rounded-3xl overflow-hidden flex flex-col">
            <CardHeader className="px-8 py-6 border-b border-zinc-800/50 flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                 <CardTitle className="text-[10px] font-black text-white uppercase tracking-widest italic">Review Required</CardTitle>
              </div>
              {pendingAssessments !== "loading" && pendingAssessments.length > 0 && (
                <Link 
                  href="/trainer/clients" 
                  className={cn(buttonVariants({ variant: "ghost" }), "h-auto p-0 text-[10px] font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-widest italic")}
                >
                  View Manifest <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              )}
            </CardHeader>
            <CardContent className="p-8 flex-1 space-y-3">
              {pendingAssessments !== "loading" && pendingAssessments.length > 0 ? (
                pendingAssessments.map((assessment) => (
                  <Link
                    key={assessment.id}
                    href={`/trainer/clients/${assessment.userId}`}
                    className="group flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl hover:border-orange-500/30 hover:bg-zinc-950 transition-all"
                  >
                    <div className="flex items-center gap-5">
                      <Avatar className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        <AvatarFallback className="bg-transparent text-orange-500 font-black group-hover:text-white transition-all text-sm italic">
                          {getClientName(assessment.userId).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black text-white text-sm uppercase italic tracking-tight">{getClientName(assessment.userId)}</p>
                        <p className="text-zinc-600 text-[10px] font-black mt-1 uppercase tracking-widest flex items-center gap-2">
                           <Clock className="w-3 h-3" /> Submitted {formatDate(assessment.submittedAt)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-800 group-hover:text-white transition-colors" />
                  </Link>
                ))
              ) : (
                <div className="py-20 text-center border border-dashed border-zinc-800 rounded-2xl">
                   <CheckCircle className="w-10 h-10 text-zinc-800 mx-auto mb-4 opacity-20" />
                   <p className="text-zinc-700 font-black uppercase text-[10px] tracking-[0.2em] italic">Manifests Synchronized</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Deployments */}
          <Card className="bg-zinc-900 border-zinc-800 rounded-3xl overflow-hidden flex flex-col">
            <CardHeader className="px-8 py-6 border-b border-zinc-800/50 flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                 <CardTitle className="text-[10px] font-black text-white uppercase tracking-widest italic">Today's Lineup</CardTitle>
              </div>
              <Link 
                href="/trainer/sessions" 
                className={cn(buttonVariants({ variant: "ghost" }), "h-auto p-0 text-[10px] font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-widest italic")}
              >
                Full Calendar <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </CardHeader>
            <CardContent className="p-8 flex-1 space-y-3">
              {todaySessions.length > 0 ? (
                todaySessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-5 p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl hover:border-zinc-700 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                       <Clock className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white text-sm uppercase italic tracking-tight truncate">{session.title}</p>
                      <p className="text-zinc-600 text-[10px] font-black mt-1 uppercase tracking-widest flex items-center gap-2 truncate">
                         {getClientName(session.userId)} <span className="mx-1.5 opacity-30">•</span> {session.scheduledTime} <span className="mx-1.5 opacity-30">•</span> {session.duration} MIN
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-blue-500/5 border-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest italic">
                      {session.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center border border-dashed border-zinc-800 rounded-2xl">
                   <Calendar className="w-10 h-10 text-zinc-800 mx-auto mb-4 opacity-20" />
                   <p className="text-zinc-700 font-black uppercase text-[10px] tracking-[0.2em] italic">Zero Tactical Sessions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Client Snapshot */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-zinc-900 border-zinc-800 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="px-8 pt-10 pb-4 md:px-10 flex-row items-center justify-between space-y-0">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <Users className="w-5 h-5 text-orange-500" />
                  </div>
                  <CardTitle className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Active Deployments (Clients)</CardTitle>
               </div>
               <Link 
                 href="/trainer/payments" 
                 className={cn(buttonVariants({ variant: "outline" }), "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest italic")}
               >
                 Review Ledger
               </Link>
            </CardHeader>

            <CardContent className="p-8 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {clients.slice(0, 4).map((client) => (
                  <Link
                    key={client.id}
                    href={`/trainer/clients/${client.id}`}
                    className="group relative h-48 rounded-[2rem] bg-zinc-950 border border-zinc-800 p-6 overflow-hidden hover:border-orange-500/50 transition-all"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Activity className="w-20 h-20 text-white" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <Avatar className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 group-hover:bg-orange-500 group-hover:border-transparent transition-all">
                        <AvatarFallback className="bg-transparent text-zinc-500 font-black group-hover:text-white transition-all italic text-lg">
                          {client.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black text-white uppercase italic text-base tracking-tight leading-none truncate">{client.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic group-hover:text-zinc-400 transition-colors">{client.customerStatus || 'Active'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
