"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { listSessions, createSession, updateSession, type TrainingSession } from "@/lib/db/sessions";
import { listCustomers, type Profile } from "@/lib/db/profiles";
import { notify } from "@/lib/email/notify";
import { 
  Calendar, 
  Loader2, 
  Clock, 
  User, 
  Plus, 
  Pencil, 
  X, 
  CheckCircle,
  Activity,
  Zap,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function TrainerSessionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [sessionForm, setSessionForm] = useState({
    userId: "",
    title: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user) { router.replace("/login"); return; }
      if (user.role !== "trainer") { router.replace("/dashboard"); return; }
      loadData();
    }
  }, [user, loading, router]); // eslint-disable-line

  const loadData = async () => {
    if (!user) return;
    try {
      const [allSessions, allCustomers] = await Promise.all([
        listSessions({ trainerId: user.id }),
        listCustomers()
      ]);
      setClients(allCustomers);
      setSessions(allSessions.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)));
    } catch (err) {
      console.error("Error loading sessions:", err);
    } finally {
      setDataLoaded(true);
    }
  };

  const handleSaveSession = async () => {
    setFormError("");
    if (!sessionForm.userId || !sessionForm.title || !sessionForm.scheduledDate || !sessionForm.scheduledTime) {
      setFormError("Protocol incomplete. All operational fields required.");
      return;
    }
    setSaving(true);
    try {
      const client = clients.find(c => c.id === sessionForm.userId);
      const clientName = client?.name || "Client";
      const clientEmail = client?.email || "";

      if (editingSession) {
        await updateSession(editingSession.id, {
          title: sessionForm.title,
          scheduledDate: sessionForm.scheduledDate,
          scheduledTime: sessionForm.scheduledTime,
          duration: sessionForm.duration,
          notes: sessionForm.notes,
        });
        if (clientEmail) {
          await notify("session-rescheduled", clientEmail, {
            clientName,
            sessionTitle: sessionForm.title,
            newDate: sessionForm.scheduledDate,
            newTime: sessionForm.scheduledTime,
          });
        }
      } else {
        await createSession({
          userId: sessionForm.userId,
          trainerId: user!.id,
          title: sessionForm.title,
          scheduledDate: sessionForm.scheduledDate,
          scheduledTime: sessionForm.scheduledTime,
          duration: sessionForm.duration,
          status: "scheduled",
          notes: sessionForm.notes,
        });
        if (clientEmail) {
          await notify("session-scheduled", clientEmail, {
            clientName,
            sessionTitle: sessionForm.title,
            sessionDate: sessionForm.scheduledDate,
            sessionTime: sessionForm.scheduledTime,
            duration: String(sessionForm.duration),
            notes: sessionForm.notes || "None",
          });
        }
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setFormError("Terminal error during sync. Retry protocol.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSession = async (sessionId: string, sessionTitle: string, user_id: string) => {
    if (!window.confirm("Confirm mission termination. Client will be synchronized.")) return;
    
    await updateSession(sessionId, { status: "cancelled" });
    
    const client = clients.find(c => c.id === user_id);
    if (client?.email) {
      await notify("session-cancelled", client.email, {
        clientName: client.name || "Client",
        sessionTitle: sessionTitle,
      }).catch(console.error);
    }
    
    await loadData();
  };

  const handleMarkComplete = async (sessionId: string) => {
    await updateSession(sessionId, { status: "completed" });
    await loadData();
  };

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="trainer">
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-pulse">
           <div className="h-10 w-48 bg-zinc-900 rounded-lg" />
           <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-zinc-900 rounded-2xl" />)}
           </div>
        </div>
      </DashboardLayout>
    );
  }

  const upcoming = sessions.filter((s) => s.status === "scheduled");
  const past = sessions.filter((s) => s.status === "completed" || s.status === "cancelled");

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const today = new Date().toISOString().split("T")[0];

  return (
    <DashboardLayout role="trainer">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="flex items-center justify-between flex-wrap gap-6 mb-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">
                 Deployment <span className="text-orange-500">Timeline</span>
              </h1>
              <p className="text-zinc-500 mt-2 font-medium">Synchronized training ops and historical mission logs.</p>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                setEditingSession(null);
                setSessionForm({
                  userId: "",
                  title: "",
                  scheduledDate: "",
                  scheduledTime: "",
                  duration: 60,
                  notes: "",
                });
                setShowModal(true);
              }}
              className="flex items-center gap-3 bg-white text-zinc-950 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-95 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
              Initialize Session
            </motion.button>
          </div>

          {/* Upcoming */}
          <div className="mb-12">
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-3 italic">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
              Pending Deployments ({upcoming.length})
            </h2>
            
            {upcoming.length > 0 ? (
              <div className="space-y-4">
                {upcoming.map((s, idx) => (
                  <motion.div 
                    key={s.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 flex items-center gap-6 group hover:border-zinc-700 transition-all overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-10 transition-opacity">
                      <Zap className="w-20 h-20 text-white" />
                    </div>

                    <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white group-hover:border-transparent transition-all shadow-inner">
                      <p className="text-[9px] font-black uppercase opacity-40 leading-none mb-1">{new Date(s.scheduledDate).toLocaleString('en-US',{month:'short'})}</p>
                      <p className="text-xl font-black italic leading-none">{new Date(s.scheduledDate).getDate()}</p>
                    </div>
                    
                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-black text-white text-lg uppercase italic tracking-tight">{s.title}</p>
                        <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/5 border border-orange-500/10 px-2 py-0.5 rounded-md italic">Scheduled</span>
                      </div>
                      
                      <div className="flex items-center gap-6 flex-wrap">
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-1.5 group-hover:text-zinc-300">
                          <User className="w-3.5 h-3.5 text-orange-500" />
                          {clients.find(c => c.id === s.userId)?.name || "ASSET UNKNOWN"}
                        </p>
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest flex items-center gap-1.5 italic">
                          <Clock className="w-3.5 h-3.5" />
                          {s.scheduledTime} <span className="opacity-30">•</span> {s.duration} MIN
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                      {s.scheduledDate <= today && (
                        <button
                          onClick={() => handleMarkComplete(s.id)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-500/5 active:scale-95"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Complete
                        </button>
                      )}
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingSession(s);
                            setSessionForm({
                              userId: s.userId,
                              title: s.title,
                              scheduledDate: s.scheduledDate,
                              scheduledTime: s.scheduledTime,
                              duration: s.duration,
                              notes: s.notes ?? "",
                            });
                            setShowModal(true);
                          }}
                          className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-white hover:border-zinc-700 transition-all"
                          title="Adjust Parameters"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCancelSession(s.id, s.title, s.userId)}
                          className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-rose-500 hover:border-rose-500/30 transition-all"
                          title="Terminate Mission"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-[2.5rem] py-20 text-center">
                <Sparkles className="w-10 h-10 mx-auto mb-4 text-zinc-800 opacity-30" />
                <p className="text-zinc-600 font-black uppercase text-[10px] tracking-[0.2em] italic">No Pending Operations</p>
              </div>
            )}
          </div>

          {/* Past */}
          <div>
            <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-3 italic">
               Archived Campaigns ({past.length})
            </h2>
            
            {past.length > 0 ? (
              <div className="space-y-2">
                {past.slice().reverse().map((s) => (
                  <motion.div 
                    key={s.id} 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 md:p-6 flex items-center gap-5 group hover:bg-zinc-900 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      s.status === "completed" ? "bg-emerald-500/5 border-emerald-500/10" : "bg-zinc-950 border-zinc-800"
                    }`}>
                      {s.status === "completed" ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <X className="w-5 h-5 text-zinc-700" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white text-sm uppercase italic tracking-tight">{s.title}</p>
                      <div className="flex items-center gap-4 mt-1 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 truncate">
                           <User className="w-3 h-3" />
                           {clients.find(c => c.id === s.userId)?.name || "ASSET UNKNOWN"}
                        </span>
                        <span className="opacity-30">•</span>
                        <span>{formatDate(s.scheduledDate)}</span>
                        <span className="opacity-30">•</span>
                        <span>{s.status}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-800 group-hover:text-zinc-600 transition-colors" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-900/20 border border-zinc-800 rounded-[2rem] py-10 text-center">
                <p className="text-zinc-700 font-black uppercase text-[10px] tracking-widest">History Manifest Empty</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 w-full max-w-lg shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setShowModal(false)} className="text-zinc-600 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-8 pr-12">
                 <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                   {editingSession ? "Manifest Adjust" : "Mission Init"}
                 </h2>
                 <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-1 italic">Configuring operational parameters</p>
              </div>
              
              <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2 scrollbar-hide">
                {formError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center gap-2 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest italic"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {formError}
                  </motion.div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Select Asset</label>
                    <select 
                      value={sessionForm.userId}
                      onChange={(e) => setSessionForm({...sessionForm, userId: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white font-black uppercase focus:border-orange-500 outline-none transition-colors appearance-none"
                    >
                      <option value="">AWAITING SELECTION...</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name?.toUpperCase() || c.email?.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Op Title</label>
                    <input 
                      type="text"
                      value={sessionForm.title}
                      onChange={(e) => setSessionForm({...sessionForm, title: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white font-black uppercase focus:border-orange-500 outline-none placeholder:text-zinc-800"
                      placeholder="E.G. LOWER BODY FORCE"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Deployment Date</label>
                    <input 
                      type="date"
                      value={sessionForm.scheduledDate}
                      onChange={(e) => setSessionForm({...sessionForm, scheduledDate: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white font-black uppercase focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Execution Time</label>
                    <input 
                      type="time"
                      value={sessionForm.scheduledTime}
                      onChange={(e) => setSessionForm({...sessionForm, scheduledTime: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white font-black uppercase focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Mission Duration</label>
                    <select 
                      value={sessionForm.duration}
                      onChange={(e) => setSessionForm({...sessionForm, duration: parseInt(e.target.value)})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white font-black uppercase focus:border-orange-500 outline-none appearance-none"
                    >
                      {[30, 45, 60, 90, 120].map(mins => (
                        <option key={mins} value={mins}>{mins} MINUTES</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Tactical Briefing (Notes)</label>
                  <textarea 
                    value={sessionForm.notes}
                    onChange={(e) => setSessionForm({...sessionForm, notes: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-400 font-medium focus:border-zinc-500 outline-none h-24 scrollbar-hide"
                    placeholder="Physical objectives, constraints, or instructional reminders..."
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button 
                  onClick={handleSaveSession} 
                  disabled={saving}
                  className="flex-1 bg-white text-zinc-950 hover:bg-orange-500 hover:text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all disabled:opacity-20 active:scale-95 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Protocol"}
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-zinc-800 text-white hover:bg-zinc-700 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                >
                  Abortion
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}
