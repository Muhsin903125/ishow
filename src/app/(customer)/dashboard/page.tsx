"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { getItems } from "@/lib/storage";
import type { Assessment, Plan, Session, Payment } from "@/lib/mockData";
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
  Loader2,
} from "lucide-react";

export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [todaySession, setTodaySession] = useState<Session | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
        return;
      }
      if (user.role !== "customer") {
        router.push("/trainer/dashboard");
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const allAssessments = getItems<Assessment>("ishow_assessments");
      const userAssessment = allAssessments.find((a) => a.userId === user.id) ?? null;

      const allPlans = getItems<Plan>("ishow_plans");
      const activePlan = allPlans.find((p) => p.userId === user.id && p.status === "active") ?? null;

      const allSessions = getItems<Session>("ishow_sessions");
      const todaySess = allSessions.find((s) => s.userId === user.id && s.date === today && s.status === "scheduled") ?? null;
      const upcoming = allSessions
        .filter((s) => s.userId === user.id && s.date >= today && s.status === "scheduled")
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 3);

      const allPayments = getItems<Payment>("ishow_payments");
      const pending = allPayments.filter(
        (p) => p.userId === user.id && (p.status === "pending" || p.status === "overdue")
      );

      // Gate: new customers must complete assessment before accessing dashboard
      if (!userAssessment) {
        router.push("/assessment");
        return;
      }

      setAssessment(userAssessment);
      setPlan(activePlan);
      setUpcomingSessions(upcoming);
      setTodaySession(todaySess);
      setPendingPayments(pending);
      setDataLoaded(true);
    }
  }, [user, loading, router]);

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="customer">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
        </div>
      </DashboardLayout>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout role="customer">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-gray-500 mt-1">
            {todaySession
              ? "You have a session today — let's crush it!"
              : "Here's your fitness overview"}
          </p>
        </div>

        {/* Today's Session Alert */}
        {todaySession && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-5 mb-6 flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">Today&apos;s Session: {todaySession.title}</p>
              <p className="text-blue-100 text-sm mt-0.5">
                {todaySession.time} · {todaySession.duration} minutes · with {todaySession.trainerName}
              </p>
            </div>
            <Link
              href="/sessions"
              className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              View Details
            </Link>
          </div>
        )}

        {/* Alert: No assessment */}
        {!assessment && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5 mb-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-orange-900">Complete Your Assessment</p>
              <p className="text-orange-700 text-sm mt-1">
                Fill out your fitness assessment to get started with a personalized plan.
              </p>
              <Link
                href="/assessment"
                className="inline-flex items-center gap-1 mt-3 bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
              >
                Start Assessment <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* Alert: Assessment pending */}
        {assessment && assessment.status === "pending" && !plan && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-blue-900">Assessment Under Review</p>
              <p className="text-blue-700 text-sm mt-1">
                Your fitness assessment has been submitted. Your trainer will review it and assign your plan soon.
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-blue-700" />
            </div>
            <p className="text-2xl font-black text-gray-900">{plan ? "Active" : "None"}</p>
            <p className="text-gray-500 text-sm mt-1">Training Plan</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-black text-gray-900">{upcomingSessions.length}</p>
            <p className="text-gray-500 text-sm mt-1">Upcoming Sessions</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-black text-gray-900">
              {assessment ? (assessment.status === "reviewed" ? "Done" : "Pending") : "None"}
            </p>
            <p className="text-gray-500 text-sm mt-1">Assessment</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-black text-gray-900">{pendingPayments.length}</p>
            <p className="text-gray-500 text-sm mt-1">Pending Payments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plan Overview */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-lg">Current Plan</h2>
              <Link href="/my-plan" className="text-blue-700 text-sm font-medium hover:underline flex items-center gap-1">
                View details <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {plan ? (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">{plan.name}</p>
                  <p className="text-gray-500 text-sm">Trainer: {plan.trainerName}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {plan.goals.slice(0, 2).map((goal, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {goal.length > 30 ? goal.slice(0, 30) + "..." : goal}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Active
                    </span>
                    <span className="text-gray-900 font-bold">
                      ${plan.monthlyRate}/month
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No plan assigned yet</p>
                <p className="text-sm mt-1">Complete your assessment to get started</p>
              </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-lg">Upcoming Sessions</h2>
              <Link href="/sessions" className="text-blue-700 text-sm font-medium hover:underline">
                All
              </Link>
            </div>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.map((sess) => (
                  <div key={sess.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{sess.title}</p>
                      <p className="text-gray-500 text-xs">
                        {formatDate(sess.date)} at {sess.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No upcoming sessions</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: "/assessment", icon: ClipboardList, label: "Assessment", bg: "bg-orange-100", color: "text-orange-600" },
            { href: "/programs", icon: Dumbbell, label: "Programs", bg: "bg-blue-100", color: "text-blue-700" },
            { href: "/payments", icon: CreditCard, label: "Payments", bg: "bg-green-100", color: "text-green-600" },
            { href: "/sessions", icon: Calendar, label: "Sessions", bg: "bg-purple-100", color: "text-purple-600" },
          ].map(({ href, icon: Icon, label, bg, color }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="font-medium text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
