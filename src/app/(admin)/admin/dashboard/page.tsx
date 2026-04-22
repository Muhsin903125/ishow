"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
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
  Activity,
  Zap,
  Target,
  CheckCircle,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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
        <div className="p-6 lg:p-10 space-y-8">
           <Skeleton className="h-48 w-full rounded-3xl" />
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

  const today = new Date().toISOString().split("T")[0];
  const customerById = Object.fromEntries(customers.map((c) => [c.id, c]));
  const pendingAssessments = assessments.filter((a) => a.status === "pending");
  const todaySessions = sessions.filter((s) => s.status === "scheduled" && s.scheduledDate === today);
  const overduePayments = payments.filter((p) => p.status === "overdue");

  const stats = [
    { 
      label: "Sector 1 (Trainers)", 
      value: trainers.length, 
      icon: UserCog, 
      color: "text-orange-500", 
      bg: "bg-orange-500/10",
    },
    { 
      label: "Operational Assets", 
      value: customers.length, 
      icon: Users, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10",
    },
    { 
      label: "Active Missions Today", 
      value: todaySessions.length, 
      icon: Calendar, 
      color: "text-orange-500", 
      bg: "bg-orange-500/10",
    },
    {
      label: "Financial Variance", 
      value: overduePayments.length, 
      icon: CreditCard,
      color: overduePayments.length > 0 ? "text-rose-500" : "text-emerald-500",
      bg: overduePayments.length > 0 ? "bg-rose-500/10" : "bg-emerald-500/10",
    },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="p-6 lg:p-10 space-y-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Badge variant="outline" className="bg-orange-500/10 border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6 px-4 py-1.5">
              <Shield className="w-3 h-3 fill-orange-500 mr-2" /> Administrative Access Confirmed
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
             Command <span className="text-orange-500">Center</span>
          </h1>
          <p className="text-zinc-500 mt-4 font-medium max-w-xl">Global platform orchestration. Monitoring trainer performance, client logistics, and financial flow.</p>
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
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1 italic group-hover:text-zinc-400 transition-colors uppercase">{label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Trainers Module */}
          <Card className="rounded-[2.5rem] bg-zinc-900 border-zinc-800 overflow-hidden flex flex-col shadow-2xl">
            <CardHeader className="px-8 py-6 border-b border-zinc-800/50 flex-row items-center justify-between space-y-0 bg-zinc-950/20">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                 <CardTitle className="font-black text-white text-[10px] uppercase tracking-widest italic">Trainer Corps</CardTitle>
              </div>
              <Link 
                href="/admin/trainers" 
                className={cn(buttonVariants({ variant: "ghost" }), "h-auto p-0 text-[10px] font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-widest italic")}
              >
                Directory <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </CardHeader>
            
            <CardContent className="p-8 space-y-3">
              {trainers.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-zinc-800 rounded-2xl">
                   <UserCog className="w-10 h-10 text-zinc-800 mx-auto mb-4 opacity-20" />
                   <p className="text-zinc-700 font-black uppercase text-[10px] tracking-[0.2em] italic">No Certified Trainers</p>
                </div>
              ) : trainers.map((trainer) => (
                <div key={trainer.id} className="group flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl hover:border-orange-500/30 hover:bg-zinc-950 transition-all">
                  <div className="flex items-center gap-5">
                    <Avatar className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-all">
                      <AvatarFallback className="bg-transparent text-orange-500 font-black group-hover:text-white transition-all text-sm italic">
                        {trainer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-black text-white text-sm uppercase italic tracking-tight">{trainer.name}</p>
                      <p className="text-zinc-600 text-[10px] font-black mt-1 uppercase tracking-widest flex items-center gap-2">
                         <Mail className="w-3 h-3" /> {trainer.email}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-800 group-hover:text-white transition-colors" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending Assessments */}
          <Card className="rounded-[2.5rem] bg-zinc-900 border-zinc-800 overflow-hidden flex flex-col shadow-2xl">
            <CardHeader className="px-8 py-6 border-b border-zinc-800/50 flex-row items-center justify-between space-y-0 bg-zinc-950/20">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                 <CardTitle className="font-black text-white text-[10px] uppercase tracking-widest italic">Diagnostic Queue</CardTitle>
              </div>
              <Link 
                href="/admin/assessments" 
                className={cn(buttonVariants({ variant: "ghost" }), "h-auto p-0 text-[10px] font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-widest italic")}
              >
                Process All <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </CardHeader>

            <CardContent className="p-8 space-y-3">
              {pendingAssessments.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-zinc-800 rounded-2xl">
                   <CheckCircle className="w-10 h-10 text-zinc-800 mx-auto mb-4 opacity-20" />
                   <p className="text-zinc-700 font-black uppercase text-[10px] tracking-[0.2em] italic">Diagnostics Nominal</p>
                </div>
              ) : pendingAssessments.slice(0, 5).map((a) => (
                 <div key={a.id} className="group flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl hover:border-orange-500/30 hover:bg-zinc-950 transition-all">
                    <div className="flex-1 min-w-0">
                       <p className="font-black text-white text-sm uppercase italic tracking-tight">{customerById[a.userId]?.name || "Unknown Asset"}</p>
                       <p className="text-zinc-600 text-[10px] font-black mt-1 uppercase tracking-widest flex items-center gap-2">
                         <Clock className="w-3 h-3" /> Submitted {formatDate(a.submittedAt)}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-orange-500/5 border-orange-500/10 text-orange-500 text-[9px] font-black uppercase tracking-widest italic">
                      Pending Review
                    </Badge>
                 </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links / Grid Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-10">
          {[
            { href: "/admin/trainers", label: "Trainer Bureau", desc: "Command & Control Center", icon: UserCog, color: "text-orange-400" },
            { href: "/admin/clients", label: "Asset Directory", desc: "Operational Asset Database", icon: Users, color: "text-blue-400" },
            { href: "/admin/testimonials", label: "Success Archive", desc: "Performance Proof Logs", icon: MessageSquare, color: "text-orange-400" },
            { href: "/admin/master", label: "Core Database", desc: "Kinetic Master Data Sync", icon: Database, color: "text-emerald-400" },
          ].map(({ href, label, desc, icon: Icon, color }) => (
            <Link 
              key={href} 
              href={href}
              className="group block"
            >
              <Card className="relative h-full rounded-[2rem] bg-zinc-900 border-zinc-800 p-8 overflow-hidden hover:border-zinc-500 transition-all hover:-translate-y-1 shadow-xl">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-10 transition-opacity">
                   <Icon className="w-20 h-20 text-white" />
                </div>
                <CardContent className="p-0 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-2 italic group-hover:text-orange-500 transition-colors leading-none">{label}</h3>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
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
