"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { listCustomers, type Profile } from "@/lib/db/profiles";
import { listAssessments, type Assessment } from "@/lib/db/assessments";
import { listAllPlans, type Plan } from "@/lib/db/plans";
import { listSessions, type TrainingSession as Session } from "@/lib/db/sessions";
import { listPrograms, type Program } from "@/lib/db/programs";
import { listPayments, type Payment } from "@/lib/db/payments";
import {
  Users,
  ClipboardList,
  Calendar,
  Target,
  CreditCard,
  ArrowRight,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function TrainerDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [customers, setCustomers] = useState<Profile[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const load = async () => {
      if (!loading && user) {
        if (user.role === 'customer') { router.push('/dashboard'); return; }
        if (user.role === 'admin') { router.push('/admin/dashboard'); return; }
        const [c, a, p, s, prog, pay] = await Promise.all([
          listCustomers(),
          listAssessments(),
          listAllPlans(),
          listSessions(),
          listPrograms(),
          listPayments(),
        ]);
        setCustomers(c);
        setAssessments(a);
        setPlans(p);
        setSessions(s);
        setPrograms(prog);
        setPayments(pay);
      }
    };
    load();
  }, [loading, router, user]);

  if (loading || !user) return null;

  const customerById = Object.fromEntries(customers.map((customer) => [customer.id, customer]));
  const today = new Date().toISOString().split("T")[0];

  const pendingAssessments = assessments.filter((assessment) => assessment.status === "pending");
  const activePlans = plans.filter((plan) => plan.status === "active");
  const todaySessions = sessions.filter(
    (session) => session.status === "scheduled" && session.scheduledDate === today
  );
  const pendingPayments = payments.filter(
    (payment) => payment.status === "pending" || payment.status === "overdue"
  );
  const upcomingSessions = sessions
    .filter((session) => session.status === "scheduled" && session.scheduledDate >= today)
    .sort((left, right) => (left.scheduledDate + left.scheduledTime).localeCompare(right.scheduledDate + right.scheduledTime))
    .slice(0, 4);
  const clientSummaries = customers.map((customer) => {
    const clientPrograms = programs.filter((program) => program.userId === customer.id);
    const clientSessions = sessions.filter((session) => session.userId === customer.id);
    const nextSession = clientSessions
      .filter((session) => session.status === "scheduled" && session.scheduledDate >= today)
      .sort((left, right) => (left.scheduledDate + left.scheduledTime).localeCompare(right.scheduledDate + right.scheduledTime))[0];
    const activePlan = plans.find((plan) => plan.userId === customer.id && plan.status === "active");
    const pendingAssessment = assessments.find(
      (assessment) => assessment.userId === customer.id && assessment.status === "pending"
    );

    return {
      customer,
      clientPrograms,
      clientSessions,
      nextSession,
      activePlan,
      pendingAssessment,
    };
  });

  return (
    <DashboardLayout role="TRAINER">
      <div className="w-full max-w-6xl p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Trainer Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor clients, assessments, programs, and upcoming sessions.</p>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Clients", value: customers.length, icon: Users, tone: "bg-gray-900 text-white" },
            { label: "Pending Assessments", value: pendingAssessments.length, icon: ClipboardList, tone: "bg-orange-500 text-white" },
            { label: "Sessions Today", value: todaySessions.length, icon: Calendar, tone: "bg-blue-700 text-white" },
            { label: "Active Programs", value: activePlans.length || programs.length, icon: Target, tone: "bg-green-600 text-white" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`${card.tone} rounded-2xl p-5`}>
                <Icon className="w-5 h-5 opacity-80 mb-2" />
                <p className="text-3xl font-black">{card.value}</p>
                <p className="text-sm font-medium opacity-75 mt-0.5">{card.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] mb-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500 mb-2">Needs Attention</p>
                <h2 className="text-xl font-black text-gray-900">Pending assessments</h2>
              </div>
              <Link href="/trainer/clients" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800">
                View clients
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {pendingAssessments.length === 0 ? (
                <div className="rounded-2xl bg-green-50 border border-green-100 px-4 py-5 text-green-700 text-sm font-medium">
                  All client assessments are reviewed.
                </div>
              ) : (
                pendingAssessments.map((assessment) => {
                  const customer = customerById[assessment.userId];
                  return (
                    <div key={assessment.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-gray-900">{customer?.name ?? "Unknown Client"}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Goals: {assessment.goals.map((goal) => goal.replaceAll("_", " ")).join(", ")}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700 mb-2">Schedule</p>
                <h2 className="text-xl font-black text-gray-900">Upcoming sessions</h2>
              </div>
              <Link href="/trainer/sessions" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800">
                Full calendar
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {upcomingSessions.length === 0 ? (
                <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-5 text-gray-500 text-sm font-medium">
                  No upcoming sessions scheduled.
                </div>
              ) : (
                upcomingSessions.map((session) => {
                  const customer = customerById[session.userId];
                  return (
                    <div key={session.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-gray-900">{session.title}</p>
                          <p className="text-sm text-gray-500 mt-1">{customer?.name ?? "Unknown Client"}</p>
                        </div>
                        <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                          {new Date(session.scheduledDate + "T00:00:00").toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-3 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {session.scheduledTime} · {session.duration} min
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">Client Management</p>
              <h2 className="text-xl font-black text-gray-900">Programs and custom sessions by client</h2>
            </div>
            <p className="text-sm text-gray-500">Open a client row to manage their program weeks and session schedule.</p>
          </div>

          <div className="space-y-4">
            {clientSummaries.map((summary) => (
              <div key={summary.customer.id} className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-black text-gray-900">{summary.customer.name}</h3>
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                        summary.pendingAssessment ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                      }`}>
                        {summary.pendingAssessment ? <AlertCircle className="w-3.5 h-3.5" /> : null}
                        {summary.pendingAssessment ? "Assessment pending" : "Assessment reviewed"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{summary.activePlan?.name ?? "No active plan yet"}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
                    <div className="rounded-2xl border border-white bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Program Weeks</p>
                      <p className="mt-2 text-sm font-black text-gray-900">{summary.clientPrograms.length}</p>
                    </div>
                    <div className="rounded-2xl border border-white bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Custom Sessions</p>
                      <p className="mt-2 text-sm font-black text-gray-900">{summary.clientSessions.length}</p>
                    </div>
                    <div className="rounded-2xl border border-white bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Next Session</p>
                      <p className="mt-2 text-sm font-black text-gray-900">
                        {summary.nextSession ? `${summary.nextSession.scheduledDate} ${summary.nextSession.scheduledTime}` : "Not scheduled"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/trainer/programs?client=${encodeURIComponent(summary.customer.id)}`}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-800"
                  >
                    Manage Programs
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/trainer/sessions?client=${encodeURIComponent(summary.customer.id)}`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    Manage Sessions
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Billing watchlist</h2>
                <p className="text-sm text-gray-500">Clients with pending or overdue payments</p>
              </div>
            </div>

            <div className="space-y-3">
              {pendingPayments.length === 0 ? (
                <p className="text-sm text-gray-500">No pending payment issues.</p>
              ) : (
                pendingPayments.map((payment) => (
                  <div key={payment.id} className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{customerById[payment.userId]?.name ?? "Unknown Client"}</p>
                        <p className="text-sm text-red-700 mt-1">{payment.description}</p>
                      </div>
                      <span className="text-sm font-black text-red-600">AED {payment.amount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                href: "/trainer/clients",
                title: "Client directory",
                text: "Review assessments, plan status, and contact details.",
                icon: Users,
              },
              {
                href: "/trainer/sessions",
                title: "Session board",
                text: "Check scheduled workouts, notes, and upcoming training blocks.",
                icon: Calendar,
              },
              {
                href: "/trainer/programs",
                title: "Program library",
                text: "Track assigned weeks, activity counts, and client progression.",
                icon: Target,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <Icon className="w-5 h-5 text-orange-500 mb-4" />
                  <h3 className="font-black text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{item.text}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}