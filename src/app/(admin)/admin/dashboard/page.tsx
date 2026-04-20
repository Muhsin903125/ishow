"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { listTrainers, listCustomers, type Profile } from "@/lib/db/profiles";
import { listAssessments, type Assessment } from "@/lib/db/assessments";
import { listSessions, type TrainingSession } from "@/lib/db/sessions";
import { listPayments, type Payment } from "@/lib/db/payments";
import { Users, UserCog, Calendar, CreditCard, ChevronRight, AlertCircle, Clock, Database } from "lucide-react";

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

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    const init = async () => {
      if (!loading && user) {
        if (user.role === 'customer') { router.push('/dashboard'); return; }
        if (user.role === 'trainer') { router.push('/trainer/dashboard'); return; }
        const [t, c, a, s, p] = await Promise.all([
          listTrainers(), listCustomers(), listAssessments(), listSessions(), listPayments(),
        ]);
        setTrainers(t);
        setCustomers(c);
        setAssessments(a);
        setSessions(s);
        setPayments(p);
      }
    };
    init();
  }, [loading, router, user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !user) return null;

  const today = new Date().toISOString().split("T")[0];
  const customerById = Object.fromEntries(customers.map((c) => [c.id, c]));
  const pendingAssessments = assessments.filter((a) => a.status === "pending");
  const todaySessions = sessions.filter((s) => s.status === "scheduled" && s.scheduledDate === today);
  const overduePayments = payments.filter((p) => p.status === "overdue");
  const upcomingSessions = sessions
    .filter((s) => s.status === "scheduled" && s.scheduledDate >= today)
    .sort((a, b) => (a.scheduledDate + a.scheduledTime).localeCompare(b.scheduledDate + b.scheduledTime))
    .slice(0, 6);

  const stats = [
    { label: "Trainers", value: trainers.length, icon: UserCog, accent: "bg-violet-500", light: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
    { label: "Clients", value: customers.length, icon: Users, accent: "bg-blue-500", light: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { label: "Sessions Today", value: todaySessions.length, icon: Calendar, accent: "bg-orange-500", light: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
    {
      label: "Overdue Payments", value: overduePayments.length, icon: CreditCard,
      accent: overduePayments.length > 0 ? "bg-red-500" : "bg-green-500",
      light: overduePayments.length > 0 ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-green-400 bg-green-500/10 border-green-500/20",
    },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="min-h-full bg-zinc-950 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-[120px]" />

        <div className="relative z-10 p-6 lg:p-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <p className="text-violet-400 text-xs font-bold tracking-[0.3em] uppercase mb-1.5">Administrator</p>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Platform Overview</h1>
            <p className="text-zinc-500 mt-2 text-sm">Trainers, clients, sessions, and billing at a glance.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
            {stats.map(({ label, value, icon: Icon, accent, light }) => (
              <div key={label} className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 relative overflow-hidden hover:border-zinc-700 transition-colors">
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent}`} />
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${light}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-3xl font-black text-white">{value}</p>
                <p className="text-zinc-500 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Two-col cards */}
          <div className="grid gap-5 lg:grid-cols-2 mb-5">
            {/* Trainers */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <UserCog className="w-4 h-4 text-violet-400" />
                  <h2 className="font-bold text-white text-sm">Trainers</h2>
                </div>
                <Link href="/admin/trainers" className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-violet-400 transition-colors">
                  Manage <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="p-5 space-y-2.5">
                {trainers.length === 0 ? (
                  <p className="text-sm text-zinc-500 py-4 text-center">No trainers yet. <Link href="/admin/trainers" className="text-violet-400 font-semibold">Invite one</Link>.</p>
                ) : trainers.map((trainer) => (
                  <div key={trainer.id} className="flex items-center gap-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50 px-4 py-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-violet-500/20">
                      {trainer.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{trainer.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{trainer.email ?? "—"}</p>
                    </div>
                    <span className="text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-2 py-0.5">
                      Trainer
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Assessments */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  <h2 className="font-bold text-white text-sm">Pending Assessments</h2>
                </div>
                <span className="text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-full px-2.5 py-0.5">
                  {pendingAssessments.length} pending
                </span>
              </div>
              <div className="p-5 space-y-2.5">
                {pendingAssessments.length === 0 ? (
                  <div className="rounded-xl border border-green-500/20 bg-green-500/8 px-4 py-4 text-green-400 text-sm font-medium">
                    All assessments are reviewed.
                  </div>
                ) : pendingAssessments.slice(0, 5).map((a) => (
                  <div key={a.id} className="rounded-xl border border-zinc-700/50 bg-zinc-800/60 p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white text-sm">{customerById[a.userId]?.name ?? "Unknown"}</p>
                      <p className="text-xs text-zinc-500">Submitted {formatDate(a.submittedAt)}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 text-xs font-bold text-orange-400">
                      <AlertCircle className="w-3 h-3" /> Pending
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden mb-5">
            <div className="flex items-center gap-2 px-6 pt-5 pb-4 border-b border-zinc-800">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h2 className="font-bold text-white text-sm">Upcoming Sessions</h2>
            </div>
            <div className="p-5">
              {upcomingSessions.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">No upcoming sessions.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {upcomingSessions.map((s) => (
                    <div key={s.id} className="rounded-xl border border-zinc-700/50 bg-zinc-800/60 p-4">
                      <p className="font-bold text-white text-sm">{s.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{customerById[s.userId]?.name ?? "—"}</p>
                      <div className="flex items-center gap-2 mt-2.5 text-xs text-zinc-500">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        {s.scheduledDate} · {s.scheduledTime} · {s.duration} min
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { href: "/admin/trainers", label: "Trainer Management", desc: "Invite new trainers and manage accounts.", icon: UserCog, color: "violet" },
              { href: "/admin/clients", label: "Client Directory", desc: "View all clients and their trainer assignments.", icon: Users, color: "blue" },
              { href: "/admin/master", label: "Master Data", desc: "Manage exercises, locations, goals, and templates.", icon: Database, color: "orange" },
            ].map(({ href, label, desc, icon: Icon, color }) => {
              const cm: Record<string, string> = {
                violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
                blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
              };
              return (
                <Link key={href} href={href}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-700 transition-all hover:-translate-y-0.5"
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 transition-colors ${cm[color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-white mb-1.5 text-sm">{label}</h3>
                  <p className="text-xs leading-relaxed text-zinc-500">{desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
