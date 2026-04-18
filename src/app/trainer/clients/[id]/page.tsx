"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { getItems, updateItem } from "@/lib/storage";
import { User as AuthUser } from "@/lib/auth";
import type { Assessment, Plan, Session } from "@/lib/mockData";
import {
  ArrowLeft, User, ClipboardList, Target, Calendar, CheckCircle, Clock,
  Dumbbell, Loader2, Mail, Phone, Edit3
} from "lucide-react";

export default function ClientDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<AuthUser | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [reviewingAssessment, setReviewingAssessment] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push("/login"); return; }
      if (user.role !== "trainer") { router.push("/dashboard"); return; }

      const users = getItems<AuthUser>("ishow_users");
      const foundClient = users.find((u) => u.id === clientId) ?? null;
      if (!foundClient) { router.push("/trainer/clients"); return; }

      const assessments = getItems<Assessment>("ishow_assessments");
      const clientAssessment = assessments.find((a) => a.userId === clientId) ?? null;

      const plans = getItems<Plan>("ishow_plans");
      const clientPlan = plans.find((p) => p.userId === clientId && p.status === "active") ?? null;

      const allSessions = getItems<Session>("ishow_sessions");
      const clientSessions = allSessions
        .filter((s) => s.userId === clientId)
        .sort((a, b) => b.date.localeCompare(a.date));

      setClient(foundClient);
      setAssessment(clientAssessment);
      setPlan(clientPlan);
      setSessions(clientSessions);
      setDataLoaded(true);
    }
  }, [user, loading, router, clientId]);

  const markAssessmentReviewed = () => {
    if (!assessment) return;
    setReviewingAssessment(true);
    const updated = updateItem<Assessment>("ishow_assessments", assessment.id, {
      status: "reviewed",
      reviewedAt: new Date().toISOString(),
      trainerNotes: "Assessment reviewed. Plan assigned accordingly.",
    });
    if (updated) setAssessment(updated as Assessment);
    setReviewingAssessment(false);
  };

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="trainer">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
  };

  return (
    <DashboardLayout role="trainer">
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Back button */}
        <Link href="/trainer/clients" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Link>

        {/* Client Header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-2xl font-black">
                {client?.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-black">{client?.name}</h1>
                <p className="text-slate-300 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-4 h-4" />
                  {client?.email}
                </p>
                {client?.phone && (
                  <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5" />
                    {client.phone}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              {!plan && assessment && (
                <Link
                  href={`/trainer/clients/${clientId}/assign-plan`}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                >
                  Assign Plan
                </Link>
              )}
              <Link
                href={`/trainer/clients/${clientId}/assign-plan`}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                {plan ? "Update Plan" : "Create Plan"}
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assessment */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="font-bold text-gray-900">Assessment</h2>
            </div>

            {assessment ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Status</span>
                  {assessment.status === "reviewed" ? (
                    <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />Reviewed
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />Pending
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  {assessment.age !== undefined && (
                    <div className="flex justify-between"><span className="text-gray-500">Age</span><span className="font-medium text-gray-900">{assessment.age} years</span></div>
                  )}
                  {assessment.weight && (
                    <div className="flex justify-between"><span className="text-gray-500">Weight</span><span className="font-medium text-gray-900">{assessment.weight}</span></div>
                  )}
                  {assessment.height && (
                    <div className="flex justify-between"><span className="text-gray-500">Height</span><span className="font-medium text-gray-900">{assessment.height}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-gray-500">Experience</span><span className="font-medium text-gray-900 capitalize">{assessment.experienceLevel}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Days/Week</span><span className="font-medium text-gray-900">{assessment.daysPerWeek}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Preferred Time</span><span className="font-medium text-gray-900 capitalize">{assessment.preferredTimes}</span></div>
                </div>

                {assessment.goals.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1.5">Goals</p>
                    <div className="flex flex-wrap gap-1.5">
                      {assessment.goals.map((g) => (
                        <span key={g} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{g.replace("_", " ")}</span>
                      ))}
                    </div>
                  </div>
                )}

                {assessment.healthConditions && assessment.healthConditions !== "None" && (
                  <div className="mt-3 p-2.5 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-yellow-700 font-medium">Health Notes: {assessment.healthConditions}</p>
                  </div>
                )}

                {assessment.status === "pending" && (
                  <button
                    onClick={markAssessmentReviewed}
                    disabled={reviewingAssessment}
                    className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    {reviewingAssessment ? "Marking..." : "Mark as Reviewed"}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No assessment submitted yet</p>
              </div>
            )}
          </div>

          {/* Plan */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-700" />
              </div>
              <h2 className="font-bold text-gray-900">Current Plan</h2>
            </div>

            {plan ? (
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-3">{plan.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Monthly Rate</span><span className="font-bold text-gray-900">${plan.monthlyRate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Start Date</span><span className="font-medium text-gray-900">{formatDate(plan.startDate)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold capitalize">{plan.status}</span></div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No plan assigned yet</p>
                <Link
                  href={`/trainer/clients/${clientId}/assign-plan`}
                  className="mt-3 inline-flex items-center gap-1 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors"
                >
                  Assign Plan
                </Link>
              </div>
            )}
          </div>

          {/* Sessions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="font-bold text-gray-900">Sessions ({sessions.length})</h2>
            </div>

            {sessions.length > 0 ? (
              <div className="space-y-2">
                {sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{session.title}</p>
                      <p className="text-gray-500 text-xs">{formatDate(session.date)} · {session.time} · {session.duration}min</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                      session.status === "completed" ? "bg-green-100 text-green-700" :
                      session.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700"
                    }`}>{session.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No sessions yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
