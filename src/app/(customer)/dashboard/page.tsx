"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getItems } from "@/lib/storage";
import type { Assessment, Plan, Session, Payment } from "@/lib/mockData";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import {
  Target,
  Calendar,
  Dumbbell,
  CreditCard,
  ArrowRight,
  ClipboardList,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Flame,
  Zap,
} from "lucide-react";

export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (!loading && user) {
      if (user.role !== "customer") {
        router.push("/trainer/dashboard");
        return;
      }
      const assessments = getItems<Assessment>("ishow_assessments");
      setAssessment(assessments.find((a) => a.userId === user.id) ?? null);

      const plans = getItems<Plan>("ishow_plans");
      setPlan(plans.find((p) => p.userId === user.id && p.status === "active") ?? null);

      const today = new Date().toISOString().split("T")[0];
      const allSessions = getItems<Session>("ishow_sessions");
      setSessions(
        allSessions
          .filter((s) => s.userId === user.id && s.status === "scheduled" && s.date >= today)
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(0, 3)
      );

      const payments = getItems<Payment>("ishow_payments");
      setPendingPayments(
        payments.filter((p) => p.userId === user.id && (p.status === "pending" || p.status === "overdue"))
      );
    }
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="min-h-full bg-gray-50 relative overflow-hidden">

        {/* Background design elements */}
        <div className="absolute top-[-120px] right-[-80px] w-[450px] h-[450px] bg-orange-400/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-80px] w-[350px] h-[350px] bg-blue-400/8 rounded-full blur-[80px] pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.4) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-0 left-0 w-1 h-64 bg-gradient-to-b from-orange-500 to-transparent pointer-events-none" />

        <div className="relative z-10 p-6 lg:p-8 w-full max-w-6xl">

          {/* Welcome Header */}
          <div className="mb-8 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-1 h-14 bg-gradient-to-b from-orange-500 to-orange-200 rounded-full mt-1 flex-shrink-0" />
              <div>
                <p className="text-orange-500 text-xs font-bold tracking-[0.3em] uppercase mb-1">Welcome Back</p>
                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-none">
                  {user?.name?.split(" ")[0]}!
                </h1>
                <p className="text-gray-500 mt-2 text-sm">Keep pushing — your transformation continues.</p>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1 mt-1">
              <p className="text-gray-400 text-xs uppercase tracking-widest">Today</p>
              <p className="text-gray-700 font-bold text-sm">
                {new Date().toLocaleDateString("en-AE", { weekday: "short", month: "short", day: "numeric" })}
              </p>
            </div>
          </div>

          {/* Alert: No assessment */}
          {!assessment && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5 mb-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-orange-900">Complete Your Assessment</p>
                <p className="text-orange-700 text-sm mt-1">Fill out your fitness assessment to get a personalized plan.</p>
                <Link
                  href="/assessment"
                  className="inline-flex items-center gap-1.5 mt-3 bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
                >
                  Start Assessment <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Alert: Assessment under review */}
          {assessment && assessment.status === "pending" && !plan && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-900">Assessment Under Review</p>
                <p className="text-blue-700 text-sm mt-1">Your trainer will review it and assign your plan soon.</p>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-100 rounded-xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-orange-500" />
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-2xl font-black text-gray-900">{plan ? "Active" : "None"}</p>
              <p className="text-gray-500 text-xs mt-1">Training Plan</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-gray-900">{sessions.length}</p>
              <p className="text-gray-500 text-xs mt-1">Upcoming Sessions</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-500" />
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-black text-gray-900">
                {assessment ? (assessment.status === "reviewed" ? "Done" : "Pending") : "None"}
              </p>
              <p className="text-gray-500 text-xs mt-1">Assessment</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className={`absolute top-0 left-0 right-0 h-0.5 ${pendingPayments.length > 0 ? "bg-red-500" : "bg-gray-200"}`} />
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${pendingPayments.length > 0 ? "bg-red-100" : "bg-gray-100"}`}>
                <CreditCard className={`w-5 h-5 ${pendingPayments.length > 0 ? "text-red-600" : "text-gray-400"}`} />
              </div>
              <p className="text-2xl font-black text-gray-900">{pendingPayments.length}</p>
              <p className="text-gray-500 text-xs mt-1">Pending Payments</p>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Current Plan */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <h2 className="font-bold text-gray-900">Current Plan</h2>
                </div>
                <Link href="/my-plan" className="text-orange-500 text-sm font-medium hover:text-orange-600 flex items-center gap-1 transition-colors">
                  View details <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="p-6">
                {plan ? (
                  <div className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-white border border-orange-100 rounded-xl p-5 overflow-hidden">
                    <Flame className="absolute bottom-2 right-3 w-20 h-20 text-orange-300/40" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-0.5 rounded tracking-widest uppercase">Active</span>
                      </div>
                      <p className="font-black text-gray-900 text-xl leading-tight">{plan.name}</p>
                      <p className="text-gray-500 text-sm mt-1">Coach: {plan.trainerName}</p>
                      {plan.goals && plan.goals.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {plan.goals.map((g) => (
                            <span key={g} className="text-xs bg-white text-gray-600 px-2.5 py-1 rounded border border-gray-200">{g}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-end gap-1 mt-4">
                        <p className="text-orange-600 font-black text-2xl">AED {plan.monthlyRate}</p>
                        <p className="text-gray-400 text-sm mb-0.5">/month</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Target className="w-7 h-7 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No plan assigned yet</p>
                    <p className="text-gray-400 text-sm mt-1">Complete your assessment to get started</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <h2 className="font-bold text-gray-900">Sessions</h2>
                </div>
                <Link href="/sessions" className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">All</Link>
              </div>
              <div className="p-5">
                {sessions.length > 0 ? (
                  <div className="space-y-3">
                    {sessions.map((sess) => (
                      <div key={sess.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{sess.title}</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(sess.date).toLocaleDateString("en-AE", { month: "short", day: "numeric" })} · {sess.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No upcoming sessions</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/assessment" className="flex items-center gap-3 p-4 rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md hover:border-orange-200 transition-all group">
              <ClipboardList className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <span className="font-semibold text-gray-700 text-sm">Assessment</span>
              <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-orange-500 transition-colors" />
            </Link>
            <Link href="/programs" className="flex items-center gap-3 p-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
              <Dumbbell className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="font-semibold text-gray-700 text-sm">Programs</span>
              <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-blue-600 transition-colors" />
            </Link>
            <Link href="/payments" className="flex items-center gap-3 p-4 rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-white shadow-sm hover:shadow-md hover:border-green-200 transition-all group">
              <CreditCard className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="font-semibold text-gray-700 text-sm">Payments</span>
              <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-green-600 transition-colors" />
            </Link>
            <Link href="/sessions" className="flex items-center gap-3 p-4 rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white shadow-sm hover:shadow-md hover:border-purple-200 transition-all group">
              <Zap className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <span className="font-semibold text-gray-700 text-sm">Sessions</span>
              <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-purple-600 transition-colors" />
            </Link>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
