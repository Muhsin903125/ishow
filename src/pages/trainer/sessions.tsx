"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { loadTrainerWorkspace } from "@/lib/api/workspace";
import { createSession, updateSession, type TrainingSession } from "@/lib/db/sessions";
import { createProgram, updateProgram, deleteProgram, type Program } from "@/lib/db/programs";
import type { Profile } from "@/lib/db/profiles";
import type { Exercise } from "@/lib/db/master";
import { 
  Loader2, 
  User, 
  Plus, 
  Pencil, 
  X, 
  CheckCircle,
  Activity,
  Zap,
  Dumbbell,
  Trash2,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Layers,
} from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type ActivityRow = {
  day: string;
  exerciseName: string;
  exerciseId?: string;
  sets?: number;
  reps?: string;
  duration?: string;
  notes?: string;
};

const emptyProgramForm = () => ({
  userId: "",
  weekNumber: 1,
  title: "",
  description: "",
  activities: [] as ActivityRow[],
});

export default function TrainerOperationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Data State
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // UI State
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  // Session Modal State
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [sessionForm, setSessionForm] = useState({
    userId: "",
    title: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
    notes: "",
  });

  // Program Modal State
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [programForm, setProgramForm] = useState(emptyProgramForm());

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadData() {
    if (!user) return;
    try {
      const workspace = await loadTrainerWorkspace();
      setClients(workspace.clients);
      setPrograms(workspace.programs);
      setExercises(workspace.exercises);
      setSessions(
        [...workspace.sessions].sort((a, b) =>
          a.scheduledDate.localeCompare(b.scheduledDate)
        )
      );
    } catch (err) {
      console.error("Error loading operations data:", err);
    } finally {
      setDataLoaded(true);
    }
  }

  useEffect(() => {
    if (!loading) {
      if (!user) { router.replace("/login"); return; }
      if (user.role !== "trainer") { router.replace("/dashboard"); return; }

      let active = true;

      (async () => {
        try {
          const workspace = await loadTrainerWorkspace();

          if (!active) return;
          setClients(workspace.clients);
          setPrograms(workspace.programs);
          setExercises(workspace.exercises);
          setSessions(
            [...workspace.sessions].sort((a, b) =>
              a.scheduledDate.localeCompare(b.scheduledDate)
            )
          );
        } catch (err) {
          console.error("Error loading operations data:", err);
        } finally {
          if (active) {
            setDataLoaded(true);
          }
        }
      })();

      return () => {
        active = false;
      };
    }
  }, [user, loading, router]);

  // --- Session Logic ---
  const handleSaveSession = async () => {
    setFormError("");
    if (!sessionForm.userId || !sessionForm.title || !sessionForm.scheduledDate || !sessionForm.scheduledTime) {
      setFormError("Protocol incomplete. All operational fields required.");
      return;
    }
    setSaving(true);
    try {
      if (editingSession) {
        await updateSession(editingSession.id, {
          title: sessionForm.title,
          scheduledDate: sessionForm.scheduledDate,
          scheduledTime: sessionForm.scheduledTime,
          duration: sessionForm.duration,
          notes: sessionForm.notes,
        });
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
      }
      setShowSessionModal(false);
      await loadData();
    } catch {
      setFormError("Terminal error during sync. Retry protocol.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    const cancelReason = window.prompt(
      "Share the cancellation reason. This will be sent to the client."
    );

    if (cancelReason === null) return;
    if (!cancelReason.trim()) {
      setFormError("Cancellation reason required before synchronizing the client.");
      return;
    }

    await updateSession(sessionId, {
      status: "cancelled",
      cancelReason: cancelReason.trim(),
    });
    await loadData();
  };

  const handleMarkComplete = async (sessionId: string) => {
    await updateSession(sessionId, { status: "completed" });
    await loadData();
  };

  // --- Program Logic ---
  const addActivityRow = () => {
    setProgramForm((prev) => ({
      ...prev,
      activities: [...prev.activities, { day: "Monday", exerciseName: "" }],
    }));
  };

  const updateActivity = (index: number, updates: Partial<ActivityRow>) => {
    setProgramForm((prev) => ({
      ...prev,
      activities: prev.activities.map((a, i) => (i === index ? { ...a, ...updates } : a)),
    }));
  };

  const removeActivity = (index: number) => {
    setProgramForm((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  const handleExerciseChange = (index: number, val: string) => {
    const match = exercises.find((ex) => ex.name.toLowerCase() === val.toLowerCase());
    const currentActivity = programForm.activities[index];
    updateActivity(index, {
      exerciseName: val,
      exerciseId: match?.id,
      sets: match?.defaultSets ?? currentActivity.sets,
      reps: match?.defaultReps ?? currentActivity.reps,
      duration: match?.defaultDuration ?? currentActivity.duration,
    });
  };

  const handleSaveProgram = async () => {
    if (!programForm.userId || !programForm.title) {
      setFormError("Asset selection and protocol title required.");
      return;
    }
    setSaving(true);
    try {
      if (editingProgramId) {
        await updateProgram(
          editingProgramId,
          {
            title: programForm.title,
            description: programForm.description,
            weekNumber: programForm.weekNumber,
          },
          programForm.activities.map((a, i) => ({
            day: a.day,
            exerciseId: a.exerciseId,
            exerciseName: a.exerciseName,
            sets: a.sets,
            reps: a.reps,
            duration: a.duration,
            notes: a.notes,
            sortOrder: i,
          }))
        );
      } else {
        await createProgram(
          {
            userId: programForm.userId,
            trainerId: user!.id,
            weekNumber: programForm.weekNumber,
            title: programForm.title,
            description: programForm.description,
          },
          programForm.activities.map((a, i) => ({
            day: a.day,
            exerciseId: a.exerciseId,
            exerciseName: a.exerciseName,
            sets: a.sets,
            reps: a.reps,
            duration: a.duration,
            notes: a.notes,
            sortOrder: i,
          }))
        );
      }
      setShowProgramModal(false);
      setEditingProgramId(null);
      setProgramForm(emptyProgramForm());
      await loadData();
    } catch {
      setFormError("Syllabus sync failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!window.confirm("Confirm syllabus deletion. This action is irreversible.")) return;
    await deleteProgram(programId);
    await loadData();
  };

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="trainer">
        <div className="p-8 max-w-full mx-auto space-y-8 animate-pulse">
           <div className="h-10 w-64 bg-zinc-900 rounded-lg" />
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-4">
                 {[1,2,3].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-2xl" />)}
              </div>
              <div className="lg:col-span-4 space-y-4">
                 {[1,2].map(i => <div key={i} className="h-48 bg-zinc-900 rounded-2xl" />)}
              </div>
           </div>
        </div>
      </DashboardLayout>
    );
  }

  const upcoming = sessions.filter((s) => s.status === "scheduled");
  const past = sessions.filter((s) => s.status === "completed" || s.status === "cancelled");
  const today = new Date().toISOString().split("T")[0];

  return (
    <DashboardLayout role="trainer">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-10">
        <div className="max-w-full">
          
          {/* Header Area */}
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12 border-b border-zinc-900 pb-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-orange-500" />
                </div>
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                  Operations <span className="text-orange-500">Hub</span>
                </h1>
              </div>
              <p className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.4em] italic flex items-center gap-2">
                Unified Tactical Command <span className="w-1 h-1 bg-zinc-800 rounded-full" /> Execution & Curriculum Manifests
              </p>
            </motion.div>
            
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => {
                  setEditingSession(null);
                  setSessionForm({ userId: "", title: "", scheduledDate: "", scheduledTime: "", duration: 60, notes: "" });
                  setShowSessionModal(true);
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-white text-zinc-950 px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-95 group italic"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                Initialize Session
              </button>
              <button
                onClick={() => { setProgramForm(emptyProgramForm()); setShowProgramModal(true); }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-zinc-900 text-white border border-zinc-800 px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:border-orange-500/50 hover:text-orange-500 transition-all shadow-xl active:scale-95 group italic"
              >
                <Layers className="w-4 h-4 group-hover:scale-110 transition-transform" />
                New Syllabus
              </button>
            </div>
          </div>

          {/* Unified Operations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* LEFT COLUMN: EXECUTION TIMELINE (SESSIONS) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-12">
              
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3 italic">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    Pending Deployments ({upcoming.length})
                  </h2>
                </div>
                
                {upcoming.length > 0 ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {upcoming.map((s, idx) => (
                      <motion.div 
                        key={s.id} 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: idx * 0.05 }}
                        className="bg-zinc-900/50 border border-zinc-800/60 rounded-[2rem] p-6 flex items-center gap-5 group hover:border-blue-500/30 transition-all relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                          <Activity className="w-16 h-16 text-white" />
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all">
                          <p className="text-[8px] font-black uppercase opacity-40 leading-none">{new Date(s.scheduledDate).toLocaleString('en-US',{month:'short'})}</p>
                          <p className="text-lg font-black italic leading-none">{new Date(s.scheduledDate).getDate()}</p>
                        </div>
                        
                        <div className="flex-1 min-w-0 z-10">
                          <p className="font-black text-white text-base uppercase italic tracking-tight truncate mb-1">{s.title}</p>
                          <div className="flex items-center gap-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">
                            <span className="flex items-center gap-1.5 text-zinc-400">
                              <User className="w-3 h-3 text-blue-500" />
                              {clients.find(c => c.id === s.userId)?.name?.split(' ')[0] || "ASSET"}
                            </span>
                            <span>{s.scheduledTime}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 z-10">
                           {s.scheduledDate <= today && (
                            <button
                              onClick={() => handleMarkComplete(s.id)}
                              className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-90"
                              title="Complete"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                             onClick={() => {
                              setEditingSession(s);
                              setSessionForm({ userId: s.userId, title: s.title, scheduledDate: s.scheduledDate, scheduledTime: s.scheduledTime, duration: s.duration, notes: s.notes ?? "" });
                              setShowSessionModal(true);
                            }}
                            className="p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-white transition-all rounded-xl active:scale-90"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancelSession(s.id)}
                            className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all rounded-xl active:scale-90"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-[2.5rem] py-16 text-center">
                    <p className="text-zinc-700 font-black uppercase text-[10px] tracking-[0.3em] italic">No Active Deployments</p>
                  </div>
                )}
              </section>

              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] flex items-center gap-3 italic">
                    Historical Analysis ({past.length})
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                  {past.slice(0, 6).reverse().map((s) => (
                    <div key={s.id} className="bg-zinc-900/40 border border-zinc-800/40 rounded-2xl p-4 flex items-center gap-4 group hover:bg-zinc-900 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${s.status === 'completed' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
                        {s.status === 'completed' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-rose-500" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-zinc-300 uppercase truncate">{s.title}</p>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase mt-0.5">{new Date(s.scheduledDate).toLocaleDateString('en-GB', {day:'numeric', month:'short'})}</p>
                        {s.status === "cancelled" && s.cancelReason ? (
                          <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-rose-400/80">
                            {s.cancelReason}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* RIGHT COLUMN: CURRICULUM MANIFESTS (PROGRAMS) */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-8">
               <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3 italic">
                    <div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                    Syllabus Archive ({programs.length})
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
                        className="bg-zinc-900/80 border border-zinc-800 rounded-[2rem] overflow-hidden group hover:border-orange-500/30 transition-all shadow-xl"
                      >
                        <div className="p-6">
                           <div className="flex items-center gap-5 mb-6">
                              <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                <Dumbbell className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-white text-base uppercase italic tracking-tighter truncate">{prog.title}</p>
                                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] italic">Week {prog.weekNumber} <span className="opacity-30 mx-1">•</span> {prog.activities?.length || 0} Elements</p>
                              </div>
                           </div>

                           <div className="flex items-center gap-2">
                             <button
                               onClick={() => setExpandedProgram(expandedProgram === prog.id ? null : prog.id)}
                               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${expandedProgram === prog.id ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-zinc-600 hover:text-white'}`}
                             >
                               {expandedProgram === prog.id ? 'Hide Manifest' : 'View Manifest'}
                               {expandedProgram === prog.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                             </button>
                             <button
                               onClick={() => {
                                 setProgramForm({
                                   userId: prog.userId, weekNumber: prog.weekNumber, title: prog.title, description: prog.description ?? "",
                                   activities: (prog.activities ?? []).map(a => ({ day: a.day, exerciseId: a.exerciseId, exerciseName: a.exerciseName, sets: a.sets, reps: a.reps, duration: a.duration, notes: a.notes })),
                                 });
                                 setEditingProgramId(prog.id); setShowProgramModal(true);
                               }}
                               className="p-3 bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-white rounded-xl transition-all active:scale-90"
                             >
                               <Pencil className="w-4 h-4" />
                             </button>
                             <button
                               onClick={() => handleDeleteProgram(prog.id)}
                               className="p-3 bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-rose-500 rounded-xl transition-all active:scale-90"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>

                           <AnimatePresence>
                             {expandedProgram === prog.id && (
                               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-6 mt-6 border-t border-zinc-800">
                                  <div className="space-y-2">
                                     {prog.activities?.slice(0, 5).map((a, i) => (
                                       <div key={i} className="flex items-center justify-between text-[10px] font-black uppercase italic tracking-widest text-zinc-500 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/30">
                                          <span className="text-zinc-700">{a.day.substring(0,3)}</span>
                                          <span className="flex-1 px-4 truncate text-zinc-400">{a.exerciseName}</span>
                                          <span className="text-orange-500/60">{a.sets}x{a.reps}</span>
                                       </div>
                                     ))}
                                     {prog.activities && prog.activities.length > 5 && (
                                       <p className="text-[9px] text-center text-zinc-700 font-bold uppercase pt-2">+{prog.activities.length - 5} More Elements</p>
                                     )}
                                  </div>
                               </motion.div>
                             )}
                           </AnimatePresence>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-[2.5rem] py-20 text-center flex flex-col items-center">
                       <Dumbbell className="w-10 h-10 text-zinc-800 mb-4 opacity-20" />
                       <p className="text-zinc-700 font-black uppercase text-[10px] tracking-widest italic">Inventory Depleted</p>
                    </div>
                  )}
                </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Session Modal */}
      <AnimatePresence>
        {showSessionModal && (
          <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-xl flex items-center justify-center z-50 p-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-8 md:p-12 w-full max-w-lg shadow-2xl relative overflow-hidden">
               <button onClick={() => setShowSessionModal(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors"><X className="w-8 h-8" /></button>
               <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">{editingSession ? "Manifest Adjust" : "Mission Init"}</h2>
               <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic mb-10">Configuring operational parameters</p>
               
               <div className="space-y-6">
                 {formError && <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest italic">{formError}</div>}
                 <select value={sessionForm.userId} onChange={(e) => setSessionForm({...sessionForm, userId: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-sm text-white font-black uppercase focus:border-orange-500 outline-none transition-all appearance-none">
                    <option value="">SELECT TARGET ASSET...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name?.toUpperCase()}</option>)}
                 </select>
                 <input type="text" value={sessionForm.title} onChange={(e) => setSessionForm({...sessionForm, title: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-sm text-white font-black uppercase focus:border-orange-500 outline-none placeholder:text-zinc-800" placeholder="MISSION IDENTIFIER" />
                 <div className="grid grid-cols-2 gap-4">
                    <input type="date" value={sessionForm.scheduledDate} onChange={(e) => setSessionForm({...sessionForm, scheduledDate: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-5 text-xs text-white font-black uppercase outline-none" />
                    <input type="time" value={sessionForm.scheduledTime} onChange={(e) => setSessionForm({...sessionForm, scheduledTime: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-5 text-xs text-white font-black uppercase outline-none" />
                 </div>
                 <button onClick={handleSaveSession} disabled={saving} className="w-full bg-white text-zinc-950 hover:bg-orange-500 hover:text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Operation"}
                 </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Program Modal (Syllabus) */}
      <AnimatePresence>
        {showProgramModal && (
          <div className="fixed inset-0 bg-zinc-950/95 backdrop-blur-2xl flex items-start justify-center z-50 p-6 overflow-y-auto scrollbar-hide pt-12 md:pt-24 pb-24">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="bg-zinc-950 border border-zinc-800 rounded-[3rem] p-8 md:p-12 w-full max-w-5xl shadow-2xl relative">
              <button onClick={() => setShowProgramModal(false)} className="absolute top-10 right-10 text-zinc-600 hover:text-white transition-colors"><X className="w-8 h-8" /></button>
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-10">{editingProgramId ? "Adjust" : "Architect"} <span className="text-orange-500">Syllabus</span></h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                 <div className="lg:col-span-4 space-y-6">
                    <select value={programForm.userId} onChange={(e) => setProgramForm({...programForm, userId: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5 text-sm text-white font-black uppercase focus:border-orange-500 outline-none appearance-none">
                       <option value="">TARGET ASSET...</option>
                       {clients.map(c => <option key={c.id} value={c.id}>{c.name?.toUpperCase()}</option>)}
                    </select>
                    <input type="text" value={programForm.title} onChange={(e) => setProgramForm({...programForm, title: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5 text-sm text-white font-black uppercase focus:border-orange-500 outline-none" placeholder="SYLLABUS TITLE" />
                    <textarea value={programForm.description} onChange={(e) => setProgramForm({...programForm, description: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5 text-sm text-zinc-400 font-medium focus:border-zinc-700 outline-none h-40 scrollbar-hide" placeholder="TACTICAL OBJECTIVES..." />
                    <button onClick={handleSaveProgram} disabled={saving} className="w-full bg-white text-zinc-950 hover:bg-orange-500 hover:text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3">
                       {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy Syllabus"}
                    </button>
                 </div>

                 <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-[10px] font-black text-white tracking-[0.4em] italic uppercase">Deployment Elements</h3>
                       <button onClick={addActivityRow} className="text-orange-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
                          <PlusCircle className="w-4 h-4" /> Add Element
                       </button>
                    </div>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
                       {programForm.activities.map((act, i) => (
                         <div key={i} className="grid grid-cols-12 gap-3 items-center bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50">
                            <select value={act.day} onChange={e => updateActivity(i, { day: e.target.value })} className="col-span-3 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-[10px] font-black text-zinc-500 uppercase outline-none appearance-none">
                               {DAYS.map(d => <option key={d} value={d}>{d.toUpperCase().substring(0,3)}</option>)}
                            </select>
                            <input list={`exercises-${i}`} value={act.exerciseName} onChange={e => handleExerciseChange(i, e.target.value)} placeholder="ELEMENT SEARCH..." className="col-span-5 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-[10px] font-black text-white uppercase outline-none" />
                            <datalist id={`exercises-${i}`}>{exercises.filter(e => e.isActive).map(ex => <option key={ex.id} value={ex.name} />)}</datalist>
                            <input value={act.sets ?? ""} onChange={e => updateActivity(i, { sets: parseInt(e.target.value) || undefined })} placeholder="S" type="number" className="col-span-1 bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-3 text-[10px] font-black text-white text-center outline-none" />
                            <input value={act.reps ?? ""} onChange={e => updateActivity(i, { reps: e.target.value })} placeholder="R" className="col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-3 text-[10px] font-black text-white text-center outline-none" />
                            <button onClick={() => removeActivity(i)} className="col-span-1 text-zinc-800 hover:text-rose-500"><Trash2 className="w-4 h-4 mx-auto" /></button>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}
