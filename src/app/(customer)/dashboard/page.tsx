"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { getItems, addItem } from "@/lib/storage";
import type { Assessment, Plan, Session, Payment } from "@/lib/mockData";
import {
  Calendar,
  Dumbbell,
  CreditCard,
  ArrowRight,
  ClipboardList,
  Clock,
  TrendingUp,
  Loader2,
  CheckCircle,
} from "lucide-react";

const GOALS = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "general_fitness", label: "General Fitness" },
  { value: "athletic_performance", label: "Athletic Performance" },
];

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [todaySession, setTodaySession] = useState<Session | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Modal Submitting States
  const [formGoal, setFormGoal] = useState("");
  const [formLevel, setFormLevel] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

      setAssessment(userAssessment);
      setPlan(activePlan);
      setUpcomingSessions(upcoming);
      setTodaySession(todaySess);
      setPendingPayments(pending);
      setDataLoaded(true);
    }
  }, [user, loading, router]);

  const handleAssessmentSubmit = () => {
    if (!user) return;
    setSubmitting(true);
    
    // Simulate tiny network delay
    setTimeout(() => {
      const newAssessment: Assessment = {
        id: `assessment_${Date.now()}`,
        userId: user.id,
        goals: [formGoal],
        experienceLevel: formLevel,
        healthConditions: "None",
        daysPerWeek: 3,
        preferredTimes: "morning",
        status: "pending",
        submittedAt: new Date().toISOString(),
      };
      
      addItem<Assessment>("ishow_assessments", newAssessment);
      setAssessment(newAssessment);
      setSubmitting(false);
    }, 1000);
  };

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="customer">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
        </div>
      </DashboardLayout>
    );
  }

  // Blocking Assessment Gate
  if (!assessment) {
    const canSubmit = formGoal !== "" && formLevel !== "";
    return (
      <DashboardLayout role="customer">
        <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col items-center justify-center px-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-10 transform scale-100 animate-in fade-in zoom-in duration-300">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <ClipboardList className="w-7 h-7 text-orange-600" />
            </div>
            
            <h1 className="text-3xl font-black text-gray-900 mb-2">Almost there!</h1>
            <p className="text-gray-500 mb-8 font-medium">
              Help us customize your dashboard by answering two quick questions about your fitness baseline.
            </p>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 block">Primary Goal</p>
                <div className="grid grid-cols-2 gap-3">
                  {GOALS.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setFormGoal(g.value)}
                      className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all text-left ${
                        formGoal === g.value
                          ? "border-blue-700 bg-blue-50 text-blue-800 shadow-sm"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 block">Fitness Level</p>
                <div className="grid grid-cols-3 gap-2">
                  {LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setFormLevel(level.value)}
                      className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all text-center ${
                        formLevel === level.value
                          ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleAssessmentSubmit}
              disabled={!canSubmit || submitting}
              className="w-full mt-10 py-4 rounded-xl bg-gray-900 text-white text-sm font-bold shadow-xl shadow-gray-900/10 hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
              ) : (
                <><CheckCircle className="w-5 h-5 text-white/50" /> Submit To Unlock</>
              )}
            </button>
          </div>
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
          <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-xl p-5 mb-6 flex items-center gap-4 shadow-lg shadow-blue-700/20">
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
              className="bg-white text-blue-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              View Details
            </Link>
          </div>
        )}

        {/* Alert: Assessment pending */}
        {assessment && assessment.status === "pending" && !plan && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 mb-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="font-bold text-orange-900 text-sm">Assessment Under Review</p>
              <p className="text-orange-700 text-sm mt-0.5">
                Your initial assessment has been successfully submitted! Your assigned coach is reviewing your profile and will update your dashboard with your first program blocks.
              </p>
            </div>
          </div>
        )}

        {/* Active Plan */}
        {plan && (
          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-6 mb-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Your Active Plan</h2>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg">{plan.name}</p>
                <p className="text-gray-500 text-sm">Trainer: {plan.trainerName}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {plan.goals.slice(0, 2).map((goal, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">
                      {goal}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                    Active
                  </span>
                  <span className="text-gray-900 font-bold">
                    ${plan.monthlyRate}/month
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-lg">Upcoming Sessions</h2>
            <Link href="/sessions" className="text-blue-700 hover:text-blue-800 text-sm font-bold transition-colors">
              View All
            </Link>
          </div>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.map((sess) => (
                <div key={sess.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{sess.title}</p>
                    <p className="text-gray-500 text-xs font-medium">
                      {formatDate(sess.date)} at {sess.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-sm font-medium">No upcoming sessions scheduled yet.</p>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: "/programs", icon: Dumbbell, label: "Programs", bg: "bg-blue-100", color: "text-blue-700" },
            { href: "/payments", icon: CreditCard, label: "Payments", bg: "bg-green-100", color: "text-green-700" },
            { href: "/sessions", icon: Calendar, label: "Sessions", bg: "bg-purple-100", color: "text-purple-700" },
            { href: "/my-plan", icon: TrendingUp, label: "My Plan", bg: "bg-orange-100", color: "text-orange-700" },
          ].map(({ href, icon: Icon, label, bg, color }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-[1.25rem] p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col items-center justify-center gap-3 group"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg} group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <span className="font-bold text-gray-700 text-sm">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
