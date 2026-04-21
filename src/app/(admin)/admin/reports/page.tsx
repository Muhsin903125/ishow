"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { listPayments, type Payment } from "@/lib/db/payments";
import { listCustomers, listTrainers, type Profile } from "@/lib/db/profiles";
import { listSessions, type TrainingSession } from "@/lib/db/sessions";
import { listAllPlans, type Plan } from "@/lib/db/plans";
import {
  BarChart2,
  DollarSign,
  Users,
  CalendarCheck,
  TrendingUp,
  Loader2,
  Activity,
  Zap,
  ArrowUpRight,
  Target,
  PieChart as PieChartIcon,
  Shield,
  Layers,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from "recharts";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-AE", { 
    style: "currency", 
    currency: "AED", 
    maximumFractionDigits: 0 
  }).format(amount);

function groupRevenueByMonth(payments: Payment[]): { month: string; amount: number }[] {
  const map: Record<string, number> = {};
  for (const p of payments) {
    if (p.status !== "paid" || !p.paidDate) continue;
    const key = p.paidDate.slice(0, 7);
    map[key] = (map[key] ?? 0) + p.amount;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([key, amount]) => ({
      month: new Date(key + "-01").toLocaleDateString("en-US", { month: "short" }),
      amount,
    }));
}

function computeSessionStats(sessions: TrainingSession[]) {
  const total = sessions.length;
  const completed = sessions.filter((s) => s.status === "completed").length;
  const cancelled = sessions.filter((s) => s.status === "cancelled").length;
  const scheduled = sessions.filter((s) => s.status === "scheduled").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, cancelled, scheduled, completionRate };
}

function groupClientsByTrainer(plans: Plan[], trainers: Profile[]) {
  return trainers
    .map((trainer) => {
      const trainerPlans = plans.filter((p) => p.trainerId === trainer.id && p.status === "active");
      return { trainerName: trainer.name, clientCount: trainerPlans.length };
    })
    .sort((a, b) => b.clientCount - a.clientCount);
}

const COLORS = ["#8b5cf6", "#f59e0b", "#10b981", "#3b82f6", "#f43f5e"];

export default function AdminReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [trainers, setTrainers] = useState<Profile[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (user.role !== "admin") { router.replace("/trainer/dashboard"); return; }
    
    (async () => {
      try {
        const [p, c, t, s, pl] = await Promise.all([
          listPayments(),
          listCustomers(),
          listTrainers(),
          listSessions(),
          listAllPlans(),
        ]);
        setPayments(p);
        setCustomers(c);
        setTrainers(t);
        setSessions(s);
        setPlans(pl);
      } catch (err) {
        console.error("Error loading intelligence data:", err);
      } finally {
        setDataLoaded(true);
      }
    })();
  }, [loading, user, router]);

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="admin">
        <div className="p-8 max-w-6xl mx-auto space-y-10 animate-pulse">
          <div className="h-10 w-64 bg-zinc-900 rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             {[1,2,3,4].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-[2rem]" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="h-80 bg-zinc-900 rounded-[2.5rem]" />
             <div className="h-80 bg-zinc-900 rounded-[2.5rem]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthRevenue = payments
    .filter((p) => p.status === "paid" && p.paidDate?.startsWith(thisMonth))
    .reduce((s, p) => s + p.amount, 0);
  const sessionStats = computeSessionStats(sessions);
  const activeClients = customers.filter((c) => c.customerStatus === "client").length;
  const retentionRate = customers.length > 0 ? Math.round((activeClients / customers.length) * 100) : 0;
  const revenueByMonth = groupRevenueByMonth(payments);
  const clientsByTrainer = groupClientsByTrainer(plans, trainers);

  const sessionPieData = [
    { name: "Completed", value: sessionStats.completed },
    { name: "Cancelled", value: sessionStats.cancelled },
    { name: "Scheduled", value: sessionStats.scheduled },
  ].filter((d) => d.value > 0);

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
          
          {/* ── Page Header ─────────────────────────────────── */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12"
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-orange-400 mb-6">
                 <Shield className="w-3 h-3 fill-orange-500" /> Operational Intelligence
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                Intelligence <span className="text-orange-500">Manifest</span>
              </h1>
              <p className="text-zinc-500 mt-4 font-medium max-w-xl italic">Aggregating cross-portal performance vectors, financial reconciliation, and logistic efficiency.</p>
            </div>
            <div className="flex gap-4">
               <button className="bg-zinc-900 text-zinc-400 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-zinc-800 hover:border-zinc-600 transition-all">
                  Export Data
               </button>
            </div>
          </motion.div>

          {/* ── KPI Grid ────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue Audit", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", delay: 0.1 },
              { label: "Cyclic Yield (Month)", value: formatCurrency(monthRevenue), icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10", delay: 0.2 },
              { label: "Session Saturation", value: `${sessionStats.completionRate}%`, icon: CalendarCheck, color: "text-orange-500", bg: "bg-orange-500/10", sub: `${sessionStats.completed}/${sessionStats.total} Sessions`, delay: 0.3 },
              { label: "Retention Index", value: `${retentionRate}%`, icon: Users, color: "text-orange-500", bg: "bg-orange-500/10", sub: `${activeClients} Active Assets`, delay: 0.4 },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: stat.delay }}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative group overflow-hidden"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-black text-white italic leading-none">{stat.value}</p>
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-3 italic group-hover:text-zinc-400 transition-colors uppercase">{stat.label}</p>
                {stat.sub && <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-tight mt-1">{stat.sub}</p>}
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* ── Revenue Volatility Chart ─────────────────────── */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 p-8 md:p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                 <Activity className="w-40 h-40 text-white" />
              </div>
              
              <div className="flex items-center justify-between mb-10">
                <div>
                   <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic mb-1">Financial Trajectory</h2>
                   <p className="text-zinc-500 text-xs font-medium">Monthly revenue audit across the normalized timeline</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                   <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                   <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Real-Time</span>
                </div>
              </div>

              {revenueByMonth.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueByMonth}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: "#4b5563", fontWeight: 800 }} 
                        dy={10} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: "#4b5563", fontWeight: 800 }} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "16px", padding: "12px" }}
                        itemStyle={{ color: "#fff", fontWeight: 900, fontSize: "12px", textTransform: "uppercase" }}
                        labelStyle={{ color: "#71717a", marginBottom: "4px", fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}
                        formatter={(v: any) => [`AED ${v.toLocaleString()}`, "Revenue"]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#f97316" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorRev)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center border border-dashed border-zinc-800 rounded-3xl">
                   <p className="text-zinc-700 font-black uppercase text-[10px] tracking-widest">Awaiting Transaction Data</p>
                </div>
              )}
            </motion.div>

            {/* ── Deployment Distribution ─────────────────────── */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="rounded-[2.5rem] bg-zinc-900 border border-zinc-800 p-8 md:p-10 shadow-2xl"
            >
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic mb-1">Session Saturation</h2>
              <p className="text-zinc-500 text-xs font-medium mb-10">Cross-portal status distribution</p>
              
              {sessionPieData.length > 0 ? (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sessionPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        dataKey="value"
                        paddingAngle={8}
                        stroke="none"
                      >
                        {sessionPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                         contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "12px" }}
                         itemStyle={{ color: "#fff", fontWeight: 900, fontSize: "11px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-6 grid grid-cols-2 gap-3">
                     {sessionPieData.map((entry, i) => (
                       <div key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest truncate">{entry.name}</span>
                          <span className="text-[9px] font-black text-white ml-auto">{entry.value}</span>
                       </div>
                     ))}
                  </div>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center border border-dashed border-zinc-800 rounded-3xl">
                   <p className="text-zinc-700 font-black uppercase text-[10px] tracking-widest">No Active Records</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* ── Trainer Performance Archive ──────────────────── */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[2.5rem] bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl"
          >
            <div className="px-10 py-8 border-b border-zinc-800 bg-zinc-950/30 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Deployment Matrix (By Trainer)</h2>
                <p className="text-zinc-600 font-medium text-[10px] mt-1">Personnel performance and financial yield tracking</p>
              </div>
              <Layers className="w-5 h-5 text-zinc-800" />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-800/50 bg-zinc-950/10">
                    <th className="px-10 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Commander</th>
                    <th className="px-10 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic text-center">Active Units</th>
                    <th className="px-10 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic text-right">Total Aggregate</th>
                    <th className="px-10 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic text-right">Settled Yield</th>
                    <th className="px-10 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {trainers.map((trainer, idx) => {
                    const trainerClientIds = plans
                      .filter((p) => p.trainerId === trainer.id && p.status === "active")
                      .map((p) => p.userId);
                    const trainerPayments = payments.filter((p) => trainerClientIds.includes(p.userId));
                    const totalBilled = trainerPayments.reduce((s, p) => s + p.amount, 0);
                    const totalPaid = trainerPayments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
                    const pending = trainerPayments.filter((p) => p.status === "pending" || p.status === "overdue").reduce((s, p) => s + p.amount, 0);
                    
                    return (
                      <motion.tr 
                        key={trainer.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-zinc-800/30 transition-colors group cursor-default"
                      >
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-600/20 flex items-center justify-center text-orange-500 font-black text-sm italic group-hover:bg-orange-600 group-hover:text-white transition-all">
                                 {trainer.name.charAt(0)}
                              </div>
                              <span className="font-black text-white text-sm uppercase italic tracking-tight">{trainer.name}</span>
                           </div>
                        </td>
                        <td className="px-10 py-6 text-center">
                           <span className="text-zinc-400 font-black text-base italic">{trainerClientIds.length}</span>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <span className="text-zinc-500 font-black text-sm italic">{formatCurrency(totalBilled)}</span>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <span className="text-emerald-500 font-black text-sm italic">{formatCurrency(totalPaid)}</span>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <span className={`font-black text-sm italic ${pending > 0 ? "text-rose-500" : "text-zinc-800"}`}>
                              {pending > 0 ? formatCurrency(pending) : "NOMINAL"}
                           </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {trainers.length === 0 && (
               <div className="p-20 text-center">
                  <Zap className="w-10 h-10 text-zinc-800 mx-auto mb-4 opacity-20" />
                  <p className="text-zinc-700 font-black uppercase text-[10px] tracking-widest italic">Zero Operational Personnel Detected</p>
               </div>
            )}
          </motion.div>

        </div>
      </div>
    </DashboardLayout>
  );
}
