"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { listSessions, updateSession, type TrainingSession } from "@/lib/db/sessions";
import { listPrograms, type Program, type ProgramActivity } from "@/lib/db/programs";
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
  Zap,
  Dumbbell,
  Target,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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

export default function TrainingHubPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Data State
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [trainerEmail, setTrainerEmail] = useState("");

  // UI State
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  // Reschedule Modal State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleSession, setRescheduleSession] = useState<TrainingSession | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleNote, setRescheduleNote] = useState("");
  const [rescheduleSending, setRescheduleSending] = useState(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      const [userSessions, userPrograms, activePlan] = await Promise.all([
        listSessions({ userId: user.id }),
        listPrograms({ userId: user.id }),
        getActivePlan(user.id)
      ]);
      
      setSessions(userSessions);
      setPrograms(userPrograms.sort((a, b) => b.weekNumber - a.weekNumber));

      if (activePlan?.trainerId) {
        const trainerProfile = await getProfile(activePlan.trainerId);
        if (trainerProfile?.email) setTrainerEmail(trainerProfile.email);
      }
    } catch (err) {
      console.error("Error loading hub data:", err);
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
        <div className="p-8 max-w-full mx-auto space-y-8 animate-pulse">
          <div className="h-10 w-64 bg-zinc-900 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-8 space-y-4">
                {[1,2].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-2xl" />)}
             </div>
             <div className="lg:col-span-4 space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-24 bg-zinc-900 rounded-2xl" />)}
             </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const upcomingSessions = sessions.filter((s) => s.scheduledDate >= today && s.status === "scheduled");
  const pastSessions = sessions.filter((s) => s.scheduledDate < today || s.status !== "scheduled");

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
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-10">
        <div className="max-w-full">
          
          {/* Header */}
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12 border-b border-zinc-900 pb-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.1)]">
                  <Target className="w-7 h-7 text-orange-500" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                    Training <span className="text-orange-500">Hub</span>
                  </h1>
                </div>
              </div>
              <p className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.4em] italic flex items-center gap-2">
                Operational Dashboard <span className="w-1 h-1 bg-zinc-800 rounded-full" /> Live Deployment Feed
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* LEFT COLUMN: DEPLOYMENTS (SESSIONS) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-12">
              
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3 italic">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    Incoming Operations ({upcomingSessions.length})
                  </h2>
                </div>

                {upcomingSessions.length > 0 ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {upcomingSessions.map((s, idx) => (
                      <motion.div 
                        key={s.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-zinc-900/50 border border-zinc-800/60 rounded-[2.5rem] p-8 group hover:border-blue-500/30 transition-all relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                          <Activity className="w-24 h-24 text-white" />
                        </div>
                        
                        <div className="flex items-start justify-between mb-8">
                           <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-inner">
                              <p className="text-[10px] font-black uppercase opacity-40 leading-none mb-1">{new Date(s.scheduledDate).toLocaleString('en-US',{month:'short'})}</p>
                              <p className="text-2xl font-black italic leading-none">{new Date(s.scheduledDate).getDate()}</p>
                           </div>
                           <StatusBadge status={s.status} />
                        </div>

                        <div className="mb-8">
                          <p className="text-xl font-black text-white uppercase italic tracking-tight mb-2 truncate">{s.title}</p>
                          <div className="flex items-center gap-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">
                            <span className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-blue-500" />
                              {s.scheduledTime}
                            </span>
                            <span className="flex items-center gap-2">
                              <Activity className="w-3.5 h-3.5 text-orange-500" />
                              {s.duration} Min
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 border-t border-zinc-800 pt-6">
                           <button
                             onClick={() => {
                               setRescheduleSession(s);
                               setRescheduleDate("");
                               setShowRescheduleModal(true);
                             }}
                            className="text-[10px] font-black text-blue-500 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Re-sync
                          </button>
                          <button
                            onClick={() => handleCancelSession(s.id)}
                            className="text-[10px] font-black text-zinc-600 hover:text-rose-500 uppercase tracking-widest transition-colors"
                          >
                            Abort
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-[2.5rem] py-20 text-center">
                    <p className="text-zinc-700 font-black uppercase text-[10px] tracking-[0.3em] italic">No Pending Deployments</p>
                  </div>
                )}
              </section>

              <section>
                 <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic">Historical Output</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                   {pastSessions.slice(0, 6).reverse().map((s) => (
                     <div key={s.id} className="bg-zinc-900/40 border border-zinc-800/40 rounded-2xl p-5 flex items-center gap-4 hover:bg-zinc-900 transition-colors">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${s.status === 'completed' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' : 'bg-zinc-800 border-zinc-700/50 text-zinc-500'}`}>
                           {s.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                           <p className="text-xs font-black text-zinc-300 uppercase truncate">{s.title}</p>
                           <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1">{formatDate(s.scheduledDate)}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </section>

            </div>

            {/* RIGHT COLUMN: SYLLABUS / MODULES (PROGRAMS) */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-8">
               <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3 italic">
                    <div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                    Operational Syllabus ({programs.length})
                  </h2>
                </div>

                <div className="space-y-4">
                  {programs.length > 0 ? (
                    programs.map((prog, pIdx) => (
                      <motion.div 
                        key={prog.id} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: pIdx * 0.05 }}
                        className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden group hover:border-orange-500/30 transition-all shadow-xl"
                      >
                         <div className="p-8">
                            <div className="flex items-center gap-5 mb-8">
                               <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner">
                                 <Layers className="w-6 h-6" />
                               </div>
                               <div>
                                 <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest italic mb-1">Week {prog.weekNumber}</p>
                                 <p className="font-black text-white text-xl uppercase italic tracking-tighter truncate leading-none">{prog.title}</p>
                               </div>
                            </div>
                            
                            <button
                               onClick={() => setExpandedProgram(expandedProgram === prog.id ? null : prog.id)}
                               className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${expandedProgram === prog.id ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-zinc-500 hover:text-white'}`}
                             >
                               {expandedProgram === prog.id ? 'Hide Modules' : 'View Modules'}
                               {expandedProgram === prog.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                             </button>

                             <AnimatePresence>
                                {expandedProgram === prog.id && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-8 mt-8 border-t border-zinc-800">
                                     <div className="space-y-3">
                                        {DAY_ORDER.map(day => {
                                          const dayActs = prog.activities?.filter(a => a.day === day) || [];
                                          if (dayActs.length === 0) return null;
                                          return (
                                            <div key={day} className="space-y-2">
                                              <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] italic mb-3 flex items-center gap-2">
                                                <span className="w-1 h-1 bg-zinc-800 rounded-full" /> {day}
                                              </p>
                                              {dayActs.map((a, i) => (
                                                <div key={i} className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex items-center justify-between group/item hover:border-zinc-700 transition-colors">
                                                   <div className="min-w-0">
                                                      <p className="text-[11px] font-black text-zinc-300 uppercase italic truncate">{a.exerciseName}</p>
                                                      <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1 italic">{a.sets} Sets <span className="opacity-30 mx-1">•</span> {a.reps} Reps</p>
                                                   </div>
                                                   <Dumbbell className="w-4 h-4 text-zinc-800 group-hover/item:text-orange-500 transition-colors" />
                                                </div>
                                              ))}
                                            </div>
                                          )
                                        })}
                                     </div>
                                  </motion.div>
                                )}
                             </AnimatePresence>
                         </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-[2.5rem] py-20 text-center flex flex-col items-center">
                       <Layers className="w-10 h-10 text-zinc-800 mb-4 opacity-20" />
                       <p className="text-zinc-700 font-black uppercase text-[10px] tracking-widest italic">Inventory Silent</p>
                    </div>
                  )}
                </div>

            </div>

          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showRescheduleModal && rescheduleSession && (
          <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-xl flex items-center justify-center z-50 p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setShowRescheduleModal(false)} className="absolute top-10 right-10 text-zinc-600 hover:text-white transition-colors"><X className="w-8 h-8" /></button>
              
              {rescheduleSuccess ? (
                <div className="text-center py-10">
                   <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8">
                     <CheckCircle className="w-10 h-10 text-emerald-500" />
                   </div>
                   <p className="text-2xl font-black text-white uppercase italic mb-2">Request Logged</p>
                   <p className="text-zinc-500 text-sm font-medium italic uppercase tracking-wider">Syncing with Command...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-10">
                     <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                       <RefreshCw className="w-7 h-7 text-blue-500" />
                     </div>
                     <div>
                       <h2 className="text-2xl font-black text-white uppercase italic leading-none">Manual Sync</h2>
                       <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-2">Requesting date adjustment</p>
                     </div>
                  </div>
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-4 italic">Target Date</label>
                      <input type="date" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} min={today} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-white text-sm font-black uppercase outline-none focus:border-blue-500 transition-all shadow-inner" />
                    </div>
                    <button onClick={handleRescheduleRequest} disabled={rescheduleSending || !rescheduleDate} className="w-full bg-white text-zinc-950 hover:bg-blue-500 hover:text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl transition-all disabled:opacity-20 active:scale-95 italic">
                       {rescheduleSending ? "Transmitting..." : "Authorize Request"}
                    </button>
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
