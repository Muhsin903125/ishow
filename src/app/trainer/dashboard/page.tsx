"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { getItems } from "@/lib/storage";
import { User as AuthUser } from "@/lib/auth";
import type { Assessment, Session, Payment } from "@/lib/mockData";
import { Users, ClipboardList, Calendar, DollarSign, ArrowRight, Clock, CheckCircle, Loader2 } from "lucide-react";

export default function TrainerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<AuthUser[]>([]);
  const [pendingAssessments, setPendingAssessments] = useState<Assessment[]>([]);
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push("/login"); return; }
      if (user.role !== "trainer") { router.push("/dashboard"); return; }

      const users = getItems<AuthUser>("ishow_users");
      const customerList = users.filter((u) => u.role === "customer");

      const allAssessments = getItems<Assessment>("ishow_assessments");
      const pending = allAssessments.filter((a) => a.status === "pending");

      const today = new Date().toISOString().split("T")[0];
      const allSessions = getItems<Session>("ishow_sessions");
      const todayList = allSessions.filter((s) => s.date === today);

      const allPayments = getItems<Payment>("ishow_payments");
      const thisMonth = new Date().toISOString().slice(0, 7);
      const revenue = allPayments
        .filter((p) => p.status === "paid" && p.date?.startsWith(thisMonth))
        .reduce((sum, p) => sum + p.amount, 0);

      setClients(customerList);
      setPendingAssessments(pending);
      setTodaySessions(todayList);
      setMonthlyRevenue(revenue);
      setDataLoaded(true);
    }
  }, [user, loading, router]);

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="trainer">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    );
  }

  const getClientName = (userId: string) => {
    return clients.find((c) => c.id === userId)?.name ?? "Unknown";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <DashboardLayout role="trainer">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Trainer Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name?.split(" ")[0]}! Here&apos;s your overview.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Total Clients", value: clients.length, color: "blue", bg: "bg-blue-100", text: "text-blue-700" },
            { icon: ClipboardList, label: "Pending Assessments", value: pendingAssessments.length, color: "orange", bg: "bg-orange-100", text: "text-orange-600" },
            { icon: Calendar, label: "Today's Sessions", value: todaySessions.length, color: "green", bg: "bg-green-100", text: "text-green-600" },
            { icon: DollarSign, label: "Monthly Revenue", value: `$${monthlyRevenue}`, color: "purple", bg: "bg-purple-100", text: "text-purple-600" },
          ].map(({ icon: Icon, label, value, bg, text }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${text}`} />
              </div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-gray-500 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Assessments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-lg">Pending Assessments</h2>
              <Link href="/trainer/clients" className="text-orange-500 text-sm font-medium hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {pendingAssessments.length > 0 ? (
              <div className="space-y-3">
                {pendingAssessments.map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{getClientName(assessment.userId)}</p>
                        <p className="text-gray-500 text-xs">Submitted {formatDate(assessment.submittedAt.split("T")[0])}</p>
                      </div>
                    </div>
                    <Link
                      href={`/trainer/clients/${assessment.userId}`}
                      className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-300" />
                <p className="text-sm">All assessments reviewed!</p>
              </div>
            )}
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-lg">Today&apos;s Schedule</h2>
              <Link href="/trainer/sessions" className="text-blue-700 text-sm font-medium hover:underline flex items-center gap-1">
                All Sessions <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {todaySessions.length > 0 ? (
              <div className="space-y-3">
                {todaySessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{session.title}</p>
                      <p className="text-gray-500 text-xs">{getClientName(session.userId)} · {session.time} · {session.duration}min</p>
                    </div>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium capitalize">{session.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No sessions today</p>
              </div>
            )}
          </div>

          {/* Recent Clients */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-lg">Recent Clients</h2>
              <Link href="/trainer/clients" className="text-blue-700 text-sm font-medium hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {clients.slice(0, 4).map((client) => (
                <Link
                  key={client.id}
                  href={`/trainer/clients/${client.id}`}
                  className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-gray-200 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{client.name}</p>
                    <p className="text-gray-500 text-xs">{client.email}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
