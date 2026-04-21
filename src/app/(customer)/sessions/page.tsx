"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { listSessions, updateSession, type TrainingSession } from "@/lib/db/sessions";
import { getActivePlan } from "@/lib/db/plans";
import { getProfile } from "@/lib/db/profiles";
import { notify } from "@/lib/email/notify";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  Activity,
  ChevronRight,
  MapPin,
  MessageSquare,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
    scheduled: {
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: <Clock className="w-3 h-3" />,
      text: "Tactical"
    },
    completed: {
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      icon: <CheckCircle className="w-3 h-3" />,
      text: "Executed"
    },
    cancelled: {
      color: "bg-zinc-800 text-zinc-500 border-zinc-700/50",
      icon: <XCircle className="w-3 h-3" />,
      text: "Aborted"
    },
  };
  const config = configs[status.toLowerCase()] || configs.scheduled;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.color}`}>
      {config.icon}
      {config.text}
    </span>
  );
}

export default function SessionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [trainerEmail, setTrainerEmail] = useState("");

  // Reschedule modal state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleSession, setRescheduleSession] = useState<TrainingSession | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleNote, setRescheduleNote] = useState("");
  const [rescheduleSending, setRescheduleSending] = useState(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      const userSessions = await listSessions({ userId: user.id });
      setSessions(userSessions);

      const activePlan = await getActivePlan(user.id);
      if (activePlan?.trainerId) {
        const trainerProfile = await getProfile(activePlan.trainerId);
        if (trainerProfile?.email) setTrainerEmail(trainerProfile.email);
      }
    } catch (err) {
      console.error("Error loading sessions:", err);
    } finally {
      setDataLoaded(true);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) { router.replace("/login"); return; }
      if (user.role !== "customer") { router.replace("/trainer/dashboard"); return; }
      loadData();
    }
  }, [user, loading, router]); // eslint-disable-line

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="customer">
        <div className="p-8 max-w-5xl mx-auto space-y-8">
          <div className="h-10 w-48 bg-zinc-900 rounded-lg animate-pulse" />
          <div className="grid grid-cols-3 gap-6">
            <div className="h-24 bg-zinc-900 rounded-2xl animate-pulse" />
            <div className="h-24 bg-zinc-900 rounded-2xl animate-pulse" />
            <div className="h-24 bg-zinc-900 rounded-2xl animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-32 bg-zinc-900 rounded-2xl animate-pulse" />
            <div className="h-32 bg-zinc-900 rounded-2xl animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const upcomingSessions = sessions.filter((s) => s.scheduledDate >= today && s.status === "scheduled");
  const pastSessions = sessions.filter((s) => s.scheduledDate < today || s.status !== "scheduled");
  const completedCount = sessions.filter((s) => s.status === "completed").length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleCancelSession = async (sessionId: string) => {
    if (!window.confirm("Confirm session abortion. Your coach will be synchronized immediately.")) return;
    await updateSession(sessionId, { status: "cancelled" });
    await loadData();
  };

  const handleRescheduleRequest = async () => {
    if (!rescheduleDate || !rescheduleSession) return;
    setRescheduleSending(true);
    try {
      if (trainerEmail) {
        await notify("session-rescheduled", trainerEmail, {
          name: user?.name ?? "A client",
          title: rescheduleSession.title,
          date: rescheduleDate,
          time: rescheduleSession.scheduledTime,
          duration: String(rescheduleSession.duration),
          oldDate: rescheduleSession.scheduledDate,
          oldTime: rescheduleSession.scheduledTime,
        });
      }
      setRescheduleSuccess(true);
      setTimeout(() => {
        setShowRescheduleModal(false);
        setRescheduleNote("");
        setRescheduleDate("");
        setRescheduleSuccess(false);
      }, 2000);
    } finally {
      setRescheduleSending(false);
    }
  };

  return (
    <DashboardLayout role="customer">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">
              Mission <span className="text-orange-500">Timeline</span>
            </h1>
            <p className="text-zinc-500 mt-2 font-medium">Scheduled deployments and historical execution logs.</p>
          </motion.div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 flex flex-col items-center justify-center text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-2xl font-black text-white italic">{sessions.length}</p>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Gross Load</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 flex flex-col items-center justify-center text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-white italic">{upcomingSessions.length}</p>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Pending Orders</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 flex flex-col items-center justify-center text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-white italic">{completedCount}</p>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Successful Ops</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 flex flex-col items-center justify-center text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5 text-zinc-600" />
              </div>
              <p className="text-2xl font-black text-white italic">
                {sessions.reduce((acc, s) => acc + (s.status === "completed" ? s.duration : 0), 0)}
              </p>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Minutes In-Zone</p>
            </motion.div>
          </div>

          {!sessions.length ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-16 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-zinc-950 flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Calendar className="w-10 h-10 text-zinc-800" />
              </div>
              <h2 className="text-xl font-black text-white uppercase italic mb-4">No Sessions Synchronized</h2>
              <p className="text-zinc-600 max-w-sm mx-auto text-sm font-medium">
                Your command center has not yet pushed any tactical sessions. 
                Ensure your <span className="text-orange-500">Plan</span> is active to begin scheduling.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-12">
              
              {/* Upcoming */}
              {upcomingSessions.length > 0 && (
                <div>
                  <h2 className="font-black text-white uppercase tracking-widest text-xs italic mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    Incoming Deployments
                  </h2>
                  <div className="space-y-4">
                    {upcomingSessions.map((s) => (
                      <motion.div 
                        key={s.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-zinc-900 border border-blue-500/10 hover:border-blue-500/30 rounded-3xl p-6 md:p-8 transition-all group overflow-hidden relative"
                      >
                         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                           <Calendar className="w-16 h-16 text-blue-500" />
                         </div>
                        
                        <div className="flex items-start justify-between flex-wrap gap-6 relative z-10">
                          <div className="flex items-start gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all">
                               <p className="text-[10px] font-black uppercase leading-none mb-1 opacity-60">
                                 {new Date(s.scheduledDate).toLocaleString('en-US', { month: 'short' })}
                               </p>
                               <p className="text-2xl font-black leading-none italic">
                                 {new Date(s.scheduledDate).getDate()}
                               </p>
                            </div>
                            <div>
                              <p className="text-xl font-black text-white uppercase italic tracking-tight mb-2">{s.title}</p>
                              <div className="flex items-center gap-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest flex-wrap">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                                  {s.scheduledTime}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Activity className="w-3.5 h-3.5 text-orange-500" />
                                  {s.duration} Min
                                </span>
                              </div>
                              {s.notes && (
                                <p className="mt-4 text-zinc-500 text-xs italic font-medium bg-zinc-950/50 rounded-xl px-4 py-3 border border-zinc-800 max-w-lg">
                                  &ldquo;{s.notes}&rdquo;
                                </p>
                              )}

                              <div className="flex items-center gap-6 mt-6">
                                <button
                                  onClick={() => handleCancelSession(s.id)}
                                  className="text-[10px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-[0.2em] transition-colors"
                                >
                                  Abort Session
                                </button>
                                <button
                                  onClick={() => {
                                    setRescheduleSession(s);
                                    setRescheduleDate("");
                                    setRescheduleNote("");
                                    setRescheduleSuccess(false);
                                    setShowRescheduleModal(true);
                                  }}
                                  className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-[0.2em] transition-colors flex items-center gap-2"
                                >
                                  Request Re-sync <RefreshCw className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <StatusBadge status={s.status} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past */}
              {pastSessions.length > 0 && (
                <div>
                  <h2 className="font-black text-zinc-600 uppercase tracking-widest text-xs italic mb-6 flex items-center gap-3">
                    Execution Archives
                  </h2>
                  <div className="space-y-3">
                    {pastSessions.slice().reverse().map((s) => (
                      <motion.div 
                        key={s.id} 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 md:p-6 hover:bg-zinc-900 transition-colors"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                              s.status === "completed" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-zinc-800 border-zinc-700/50"
                            }`}>
                              {s.status === "completed" ? (
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-zinc-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-black text-white uppercase italic tracking-tight">{s.title}</p>
                              <div className="flex items-center gap-4 mt-1 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                <span>{formatDate(s.scheduledDate)}</span>
                                <span>•</span>
                                <span>{s.scheduledTime}</span>
                                <span>•</span>
                                <span>{s.duration} MIN</span>
                              </div>
                            </div>
                          </div>
                          <StatusBadge status={s.status} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showRescheduleModal && rescheduleSession && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setShowRescheduleModal(false)} className="text-zinc-600 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {rescheduleSuccess ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-black text-white uppercase italic tracking-tight mb-2">Request Transmitted</p>
                  <p className="text-zinc-500 text-sm font-medium px-4">Our systems have synchronized with your coach. Await operational confirmation.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-8">
                     <div className="p-3 bg-blue-500/10 rounded-xl">
                       <RefreshCw className="w-6 h-6 text-blue-500" />
                     </div>
                     <div>
                       <h2 className="text-xl font-black text-white uppercase italic leading-none">Reschedule Op</h2>
                       <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Requesting manual re-sync</p>
                     </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Desired Sync Date</label>
                      <input
                        type="date"
                        value={rescheduleDate}
                        onChange={e => setRescheduleDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm font-black uppercase focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Reasoning Manifest</label>
                      <textarea
                        value={rescheduleNote}
                        onChange={e => setRescheduleNote(e.target.value)}
                        rows={3}
                        placeholder="Log reason for adjustment..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-800"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handleRescheduleRequest}
                        disabled={rescheduleSending || !rescheduleDate}
                        className="flex-1 bg-white hover:bg-blue-500 text-zinc-950 hover:text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest disabled:opacity-20 transition-all shadow-xl active:scale-95"
                      >
                        {rescheduleSending ? "Transmitting..." : "Send Request"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
