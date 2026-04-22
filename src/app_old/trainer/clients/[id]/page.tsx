"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
        <div className="flex items-center justify-center h-full bg-zinc-950">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Synchronizing Operational Data...</p>
          </div>
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
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-10 pb-32">
        <div className="max-w-full">
          
          {/* Back button */}
          <Link href="/trainer/clients" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-10 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Return to Manifest</span>
          </Link>
  
          {/* Client Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-8 md:p-10 mb-8 relative overflow-hidden"
          >
            {/* Subtle Gradient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-8">
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 rounded-[2rem] bg-zinc-950 border border-zinc-800 flex items-center justify-center text-3xl font-black text-orange-500 shadow-2xl rotate-3">
                  {client?.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">{client?.name}</h1>
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active Client</span>
                  </div>
                  <div className="flex flex-wrap gap-6 mt-4">
                    <p className="text-zinc-500 flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight italic">
                      <Mail className="w-3.5 h-3.5 text-orange-500/50" />
                      {client?.email}
                    </p>
                    {client?.phone && (
                      <p className="text-zinc-500 flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight italic">
                        <Phone className="w-3.5 h-3.5 text-orange-500/50" />
                        {client.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 flex-wrap">
                <Link
                  href={`/trainer/clients/${clientId}/assign-plan`}
                  className="bg-white hover:bg-orange-500 text-zinc-950 hover:text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  {plan ? "Update Protocol" : "Assign Plan"}
                </Link>
                {/* Add logic same as before but styled */}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Assessment */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                 <ClipboardList className="w-32 h-32 text-white" />
              </div>

              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                    <ClipboardList className="w-6 h-6 text-orange-500" />
                  </div>
                  <h2 className="text-lg font-black text-white italic uppercase tracking-widest">Manifest Assessment</h2>
                </div>
                {assessment && (
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                    assessment.status === "reviewed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }`}>
                    {assessment.status === "reviewed" ? "Operational" : "Pending Intel"}
                  </div>
                )}
              </div>

              {assessment ? (
                <div className="relative z-10">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                    {[
                      { label: "Age Group", value: assessment.age ? `${assessment.age} yr` : "N/A" },
                      { label: "Mass Index", value: assessment.weight || "N/A" },
                      { label: "Height Ref", value: assessment.height || "N/A" },
                      { label: "Exp Level", value: assessment.experienceLevel, capitalize: true },
                      { label: "Duty Cycle", value: `${assessment.daysPerWeek} days/wk` },
                      { label: "Operational Window", value: assessment.preferredTimes, capitalize: true },
                    ].map((item, i) => (
                      <div key={i} className="border-l-2 border-zinc-800 pl-4 py-1">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1 italic">{item.label}</p>
                        <p className={`text-sm font-black text-white italic ${item.capitalize ? 'capitalize' : ''}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {assessment.goals.length > 0 && (
                    <div className="mb-10">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 italic">Strategic Objectives</p>
                      <div className="flex flex-wrap gap-2">
                        {assessment.goals.map((g) => (
                          <span key={g} className="bg-zinc-950 border border-zinc-800 text-orange-500 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-tighter italic">
                            {g.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {assessment.healthConditions && assessment.healthConditions !== "None" && (
                    <div className="mb-10 p-5 bg-zinc-950 border border-zinc-800 rounded-3xl">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 italic">Physiological Constraints</p>
                      <p className="text-xs font-medium text-zinc-400 leading-relaxed italic">{assessment.healthConditions}</p>
                    </div>
                  )}

                  {assessment.status === "pending" && (
                    <button
                      onClick={markAssessmentReviewed}
                      disabled={reviewingAssessment}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40 shadow-xl active:scale-95 flex items-center justify-center gap-3"
                    >
                      {reviewingAssessment ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      {reviewingAssessment ? "Processing Intel..." : "Certify Assessment"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 bg-zinc-950/50 border border-zinc-800 rounded-3xl border-dashed">
                  <ClipboardList className="w-16 h-16 mx-auto mb-6 opacity-10" />
                  <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] italic">No Intel Logged</p>
                </div>
              )}
            </motion.div>

            {/* Plan */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                 <Target className="w-32 h-32 text-white" />
              </div>

              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Target className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-lg font-black text-white italic uppercase tracking-widest">Assigned Protocol</h2>
              </div>
  
              {plan ? (
                <div className="relative z-10">
                  <h3 className="font-black text-orange-500 text-2xl uppercase italic tracking-tighter mb-2">{plan.name}</h3>
                  <p className="text-zinc-500 text-[11px] font-medium leading-relaxed italic mb-10">{plan.description}</p>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-zinc-950 p-6 rounded-3xl border border-zinc-800/50">
                      <div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1 italic">Amortization Rate</p>
                        <p className="font-black text-white text-xl italic"><span className="text-orange-500 text-xs align-top mr-1">AED</span>{plan.monthlyRate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1 italic">Epoch Start</p>
                        <p className="font-black text-white text-sm italic">{formatDate(plan.startDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">{plan.status} - Active Link</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-zinc-950/50 border border-zinc-800 rounded-3xl border-dashed">
                  <Target className="w-16 h-16 mx-auto mb-6 opacity-10" />
                  <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] italic mb-8">No Active Protocol</p>
                  <Link
                    href={`/trainer/clients/${clientId}/assign-plan`}
                    className="inline-flex items-center gap-3 bg-zinc-800 hover:bg-orange-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
                  >
                    Initiate Assignment
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
  
          {/* Sessions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                <Calendar className="w-32 h-32 text-white" />
            </div>

            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Calendar className="w-6 h-6 text-emerald-500" />
                </div>
                <h2 className="text-lg font-black text-white italic uppercase tracking-widest">Deployment Logs ({sessions.length})</h2>
              </div>
            </div>
  
            {sessions.length > 0 ? (
              <div className="space-y-4 relative z-10">
                {sessions.slice(0, 8).map((session) => (
                  <div key={session.id} className="flex items-center gap-6 p-6 bg-zinc-950 border border-zinc-900 rounded-3xl hover:border-zinc-700 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform">
                      <Dumbbell className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-white uppercase italic tracking-tight text-lg mb-1">{session.title}</p>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />{formatDate(session.date)}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{session.time} · {session.duration}MIN</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] italic border ${
                        session.status === "completed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        session.status === "scheduled" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                        "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}>{session.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-zinc-950/50 border border-zinc-800 rounded-3xl border-dashed">
                <Calendar className="w-16 h-16 mx-auto mb-6 opacity-10" />
                <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] italic">No Logs Found</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
