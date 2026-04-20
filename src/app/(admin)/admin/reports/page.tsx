"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "recharts";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(amount);

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
      month: new Date(key + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
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

const PIE_COLORS = { completed: "#22c55e", cancelled: "#ef4444", upcoming: "#3b82f6" };

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
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user && user.role !== "admin") { router.push("/trainer/dashboard"); return; }
    if (!loading && user) { loadData(); }
  }, [loading, user]); // eslint-disable-line

  const loadData = async () => {
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
    setDataLoaded(true);
  };

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
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
  const requestClients = customers.filter((c) => c.customerStatus === "request").length;
  const retentionRate = customers.length > 0 ? Math.round((activeClients / customers.length) * 100) : 0;
  const revenueByMonth = groupRevenueByMonth(payments);
  const clientsByTrainer = groupClientsByTrainer(plans, trainers);

  const sessionPieData = [
    { name: "Completed", value: sessionStats.completed },
    { name: "Cancelled", value: sessionStats.cancelled },
    { name: "Upcoming", value: sessionStats.scheduled },
  ].filter((d) => d.value > 0);

  return (
    <DashboardLayout role="admin">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
            <BarChart2 className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-500 text-sm">Platform-wide performance overview</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-2">
              <DollarSign className="w-4 h-4 text-green-500" /> Total Revenue
            </div>
            <p className="text-2xl font-black text-gray-900">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" /> This Month
            </div>
            <p className="text-2xl font-black text-gray-900">{formatCurrency(monthRevenue)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-2">
              <CalendarCheck className="w-4 h-4 text-violet-500" /> Session Completion
            </div>
            <p className="text-2xl font-black text-gray-900">{sessionStats.completionRate}%</p>
            <p className="text-xs text-gray-400 mt-1">{sessionStats.completed}/{sessionStats.total} sessions</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-2">
              <Users className="w-4 h-4 text-orange-500" /> Client Retention
            </div>
            <p className="text-2xl font-black text-gray-900">{retentionRate}%</p>
            <p className="text-xs text-gray-400 mt-1">{activeClients} active · {requestClients} pending</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* RP2: Monthly Revenue */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Monthly Revenue (AED)</h3>
            {revenueByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <Tooltip
                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                    formatter={(v: any) => [`AED ${v.toLocaleString()}`, "Revenue"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="amount" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm text-center py-12">No paid payments yet</p>
            )}
          </div>

          {/* RP3: Session Status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-1">Session Status</h3>
            <p className="text-3xl font-black text-gray-900 mb-4">
              {sessionStats.completionRate}%
              <span className="text-sm font-normal text-gray-500 ml-2">completion rate</span>
            </p>
            {sessionPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sessionPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {sessionPieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[entry.name.toLowerCase() as keyof typeof PIE_COLORS] ?? "#e5e7eb"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm text-center py-12">No sessions yet</p>
            )}
          </div>
        </div>

        {/* RP4: Clients by Trainer */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
          <h3 className="font-bold text-gray-900 mb-4">Clients by Trainer</h3>
          {clientsByTrainer.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(200, clientsByTrainer.length * 48)}>
              <BarChart data={clientsByTrainer} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="trainerName" tick={{ fontSize: 11 }} width={120} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Tooltip formatter={(v: any) => [v, "Clients"]} />
                <Bar dataKey="clientCount" fill="#7c3aed" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No trainers with active clients</p>
          )}
        </div>

        {/* Revenue by Trainer Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Revenue by Trainer</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="px-6 py-3">Trainer</th>
                  <th className="px-6 py-3">Active Clients</th>
                  <th className="px-6 py-3">Total Billed</th>
                  <th className="px-6 py-3">Total Paid</th>
                  <th className="px-6 py-3">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {trainers.map((trainer) => {
                  const trainerClientIds = plans
                    .filter((p) => p.trainerId === trainer.id && p.status === "active")
                    .map((p) => p.userId);
                  const trainerPayments = payments.filter((p) => trainerClientIds.includes(p.userId));
                  const totalBilled = trainerPayments.reduce((s, p) => s + p.amount, 0);
                  const totalPaid = trainerPayments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
                  const pending = trainerPayments.filter((p) => p.status === "pending" || p.status === "overdue").reduce((s, p) => s + p.amount, 0);
                  return (
                    <tr key={trainer.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3 font-semibold text-gray-900">{trainer.name}</td>
                      <td className="px-6 py-3">{trainerClientIds.length}</td>
                      <td className="px-6 py-3">{formatCurrency(totalBilled)}</td>
                      <td className="px-6 py-3 text-green-600">{formatCurrency(totalPaid)}</td>
                      <td className="px-6 py-3 text-yellow-600">{formatCurrency(pending)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
