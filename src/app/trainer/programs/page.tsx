"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { createProgram, updateProgram, deleteProgram, listPrograms, type Program } from "@/lib/db/programs";
import { listCustomers, type Profile } from "@/lib/db/profiles";
import { getExercises, type Exercise } from "@/lib/db/master";
import { 
  Dumbbell, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Pencil, 
  Trash2,
  Activity,
  Zap,
  Target,
  ArrowRight,
  X,
  PlusCircle,
  Copy,
  ChevronRight,
  AlertCircle,
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

const emptyForm = () => ({
  userId: "",
  weekNumber: 1,
  title: "",
  description: "",
  activities: [] as ActivityRow[],
});

export default function TrainerProgramsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Modal State
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [programForm, setProgramForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user) { router.replace("/login"); return; }
      if (user.role !== "trainer") { router.replace("/dashboard"); return; }
      loadData();
    }
  }, [user, loading, router]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [progs, allClients, allExercises] = await Promise.all([
        listPrograms({ trainerId: user.id }),
        listCustomers(),
        getExercises()
      ]);
      setPrograms(progs);
      setClients(allClients);
      setExercises(allExercises);
    } catch (err) {
      console.error("Error loading programs:", err);
    } finally {
      setDataLoaded(true);
    }
  };

  const closeModal = () => {
    setShowProgramModal(false);
    setEditingProgramId(null);
    setProgramForm(emptyForm());
    setFormError("");
  };

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
      closeModal();
      await loadData();
    } catch (e) {
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
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-pulse">
           <div className="h-10 w-48 bg-zinc-900 rounded-lg" />
           <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-zinc-900 rounded-2xl" />)}
           </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="trainer">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">
                 Curriculum <span className="text-orange-500">Director</span>
              </h1>
              <p className="text-zinc-500 mt-2 font-medium">Managing force-wide training protocols and weekly syllabus.</p>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => { setProgramForm(emptyForm()); setShowProgramModal(true); }}
              className="flex items-center gap-3 bg-white text-zinc-950 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-95 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
              New Syllabus
            </motion.button>
          </div>

          <div className="space-y-6">
            {programs.length > 0 ? (
              programs.map((prog, pIdx) => (
                <motion.div 
                  key={prog.id} 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: pIdx * 0.05 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden group hover:border-zinc-700 transition-all shadow-2xl"
                >
                  <div className="p-6 md:p-8 flex flex-wrap items-center justify-between gap-6">
                    <button
                      onClick={() => setExpanded(expanded === prog.id ? null : prog.id)}
                      className="flex-1 flex items-center gap-6 text-left"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white group-hover:border-transparent transition-all shadow-inner">
                        <Dumbbell className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-3 mb-1">
                            <p className="font-black text-white text-xl uppercase italic tracking-tighter">{prog.title}</p>
                            <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/5 border border-orange-500/10 px-2 py-0.5 rounded-md italic">Week {prog.weekNumber}</span>
                         </div>
                         <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest flex items-center gap-2 italic">
                            <Target className="w-3.5 h-3.5 text-zinc-800" />
                            Target Asset: <span className="text-zinc-400">{clients.find(c => c.id === prog.userId)?.name || "ASSET REMOVED"}</span>
                            <span className="opacity-30 mx-1">•</span>
                            {prog.activities?.length ?? 0} Elements
                         </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                       <button
                         onClick={() => {
                           setProgramForm({
                             userId: prog.userId,
                             weekNumber: prog.weekNumber,
                             title: prog.title,
                             description: prog.description ?? "",
                             activities: (prog.activities ?? []).map(a => ({
                               day: a.day,
                               exerciseId: a.exerciseId,
                               exerciseName: a.exerciseName,
                               sets: a.sets,
                               reps: a.reps,
                               duration: a.duration,
                               notes: a.notes,
                             })),
                           });
                           setEditingProgramId(prog.id);
                           setShowProgramModal(true);
                         }}
                         className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-white hover:border-zinc-700 transition-all"
                         title="Adjust Syllabus"
                       >
                         <Pencil className="w-4 h-4" />
                       </button>
                       <button
                         onClick={() => handleDeleteProgram(prog.id)}
                         className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-rose-500 hover:border-rose-500/30 transition-all"
                         title="Purge Protocol"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                       <button
                         onClick={() => setExpanded(expanded === prog.id ? null : prog.id)}
                         className={`p-3 rounded-xl transition-all ${expanded === prog.id ? "bg-white text-zinc-950" : "bg-zinc-950 text-zinc-600 hover:text-white"}`}
                       >
                         {expanded === prog.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                       </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expanded === prog.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-zinc-800/50 bg-zinc-950/20"
                      >
                        <div className="p-8">
                           {prog.description && (
                             <div className="mb-8 p-6 bg-zinc-950/50 border border-zinc-800 rounded-3xl relative overflow-hidden">
                               <div className="absolute top-0 right-0 p-4 opacity-5">
                                 <Activity className="w-12 h-12 text-white" />
                               </div>
                               <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 italic">Operational Objective</p>
                               <p className="text-sm text-zinc-400 font-medium leading-relaxed italic">{prog.description}</p>
                             </div>
                           )}

                           <div className="space-y-3">
                              <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 italic">
                                 <Zap className="w-3 h-3 text-orange-500" /> Deployment Elements
                              </p>
                              {prog.activities && prog.activities.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {prog.activities.map((act, i) => (
                                    <div key={i} className="flex items-center gap-4 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl group/item hover:border-zinc-700 transition-colors">
                                      <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-900 text-[10px] font-black text-zinc-500 uppercase tracking-widest italic group-hover/item:text-orange-500 transition-colors">
                                         {act.day.substring(0,3)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-black text-white text-xs uppercase italic tracking-widest truncate">{act.exerciseName}</p>
                                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1.5">
                                          {act.sets && act.reps && <span className="text-zinc-400">{act.sets} <span className="text-zinc-700">×</span> {act.reps}</span>}
                                          {act.duration && <span><span className="text-zinc-800 opacity-30 mx-1">•</span> {act.duration}</span>}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-10 text-center border border-dashed border-zinc-800 rounded-3xl">
                                   <p className="text-zinc-700 font-black uppercase text-[10px] tracking-widest">No activities defined for this syllabus.</p>
                                </div>
                              )}
                           </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-[3rem] py-32 text-center">
                <Dumbbell className="w-16 h-16 mx-auto mb-6 text-zinc-800 opacity-20" />
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Manifest Silent</h3>
                <p className="text-zinc-600 text-sm font-medium tracking-wide">No training protocols registered in active database.</p>
                <button
                  onClick={() => setShowProgramModal(true)}
                  className="mt-10 text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-colors"
                >
                  Generate Initial Protocol
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Program Modal */}
      <AnimatePresence>
        {showProgramModal && (
          <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-xl flex items-start justify-center z-50 p-6 overflow-y-auto scrollbar-hide pt-12 md:pt-24 pb-24">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="bg-zinc-950 border border-zinc-800 rounded-[3rem] p-8 md:p-12 w-full max-w-4xl shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10">
                <button onClick={closeModal} className="text-zinc-600 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-900 border border-transparent hover:border-zinc-800">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="mb-12 pr-16">
                 <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                   {editingProgramId ? "Adjust" : "Compose"} <span className="text-orange-500">Syllabus</span>
                 </h2>
                 <p className="text-zinc-600 text-xs font-black uppercase tracking-[0.3em] mt-3 italic">Architecting operational fitness protocols</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Protocol Info */}
                <div className="lg:col-span-5 space-y-8">
                  {formError && (
                    <div className="flex items-center gap-3 p-5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-3xl text-[10px] font-black uppercase tracking-widest italic animate-shake">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      {formError}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Assignment Asset</label>
                      <select 
                        value={programForm.userId}
                        onChange={(e) => setProgramForm({...programForm, userId: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5 text-sm text-white font-black uppercase focus:border-orange-500 outline-none transition-all appearance-none"
                      >
                        <option value="">AWAITING SELECTION...</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name?.toUpperCase() || c.email?.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div>
                         <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Week Block</label>
                         <input 
                           type="number"
                           min="1"
                           value={programForm.weekNumber}
                           onChange={(e) => setProgramForm({...programForm, weekNumber: parseInt(e.target.value)})}
                           className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5 text-sm text-white font-black focus:border-orange-500 outline-none"
                         />
                       </div>
                       <div>
                         <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Status</label>
                         <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5 text-[10px] font-black text-orange-500 uppercase tracking-widest italic flex items-center justify-center border-orange-500/10 bg-orange-500/5">
                            LIVE FEED
                         </div>
                       </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Protocol Identifier (Title)</label>
                      <input 
                        type="text"
                        value={programForm.title}
                        onChange={(e) => setProgramForm({...programForm, title: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5 text-sm text-white font-black uppercase focus:border-orange-500 outline-none placeholder:text-zinc-800 italic"
                        placeholder="E.G. HYPERTROPHY ALPHA"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Strategic Objective (Description)</label>
                      <textarea 
                        value={programForm.description}
                        onChange={(e) => setProgramForm({...programForm, description: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5 text-sm text-zinc-400 font-medium focus:border-zinc-700 outline-none h-40 scrollbar-hide italic leading-relaxed"
                        placeholder="Define constraints, kinetic goals, and operational focus..."
                      />
                    </div>
                  </div>

                  <div className="hidden lg:flex gap-4 pt-4">
                    <button 
                      onClick={handleSaveProgram} 
                      disabled={saving}
                      className="flex-1 bg-white text-zinc-950 hover:bg-orange-500 hover:text-white py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all disabled:opacity-20 active:scale-95 flex items-center justify-center gap-3 italic"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-4 h-4 fill-current" /> Deploy Syllabus</>}
                    </button>
                    <button 
                      onClick={closeModal}
                      className="flex-1 bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-800 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 italic"
                    >
                      Abort
                    </button>
                  </div>
                </div>

                {/* Elements / Activities */}
                <div className="lg:col-span-7 flex flex-col h-full overflow-hidden">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic flex items-center gap-3">
                         <div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                         Protocol Elements
                      </h3>
                      <button onClick={addActivityRow} className="group flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:border-orange-500/50 hover:text-orange-500 transition-all italic">
                        <PlusCircle className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Add Element
                      </button>
                   </div>
                   
                   <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-3 scrollbar-hide pb-20">
                     {programForm.activities.map((act, i) => (
                       <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-12 gap-3 items-center bg-zinc-900/50 p-4 rounded-[1.5rem] border border-zinc-800/50 group/row hover:border-zinc-700 transition-all"
                       >
                         <div className="col-span-12 lg:col-span-3">
                            <select 
                              value={act.day} 
                              onChange={e => updateActivity(i, { day: e.target.value })}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] outline-none focus:border-zinc-600 italic appearance-none"
                            >
                              {DAYS.map(d => <option key={d} value={d}>{d?.toUpperCase()}</option>)}
                            </select>
                         </div>
                         
                         <div className="col-span-12 lg:col-span-5 relative">
                           <input
                             list={`exercises-${i}`}
                             value={act.exerciseName}
                             onChange={e => handleExerciseChange(i, e.target.value)}
                             placeholder="Search Elements..."
                             className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-[10px] font-black text-white uppercase tracking-[0.2em] outline-none focus:border-orange-500/50 placeholder:text-zinc-800 italic"
                           />
                           <datalist id={`exercises-${i}`}>
                             {exercises.filter(e => e.isActive).map(ex => <option key={ex.id} value={ex.name} />)}
                           </datalist>
                         </div>
                         
                         <div className="col-span-12 lg:col-span-3 flex gap-2">
                           <div className="relative flex-1">
                              <input 
                                value={act.sets ?? ""} 
                                onChange={e => updateActivity(i, { sets: parseInt(e.target.value) || undefined })}
                                placeholder="SETS" 
                                type="number" 
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-[10px] font-black text-white text-center outline-none focus:border-zinc-600 appearance-none scrollbar-hide" 
                              />
                           </div>
                           <div className="relative flex-1">
                              <input 
                                value={act.reps ?? ""} 
                                onChange={e => updateActivity(i, { reps: e.target.value })}
                                placeholder="REPS" 
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-[10px] font-black text-white text-center outline-none focus:border-zinc-600 placeholder:text-zinc-800" 
                              />
                           </div>
                         </div>
                         
                         <div className="col-span-12 lg:col-span-1 text-center">
                           <button onClick={() => removeActivity(i)} className="p-3 text-zinc-800 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl border border-transparent hover:border-rose-500/10 transition-all">
                             <Trash2 className="w-4 h-4 mx-auto" />
                           </button>
                         </div>
                       </motion.div>
                     ))}
                     {programForm.activities.length === 0 && (
                        <div className="text-center py-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center">
                          <Activity className="w-10 h-10 text-zinc-800 mb-4 opacity-30" />
                          <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">Protocol currently silent.</p>
                        </div>
                     )}
                   </div>
                </div>

                {/* Mobile Actions (Sticky-ish) */}
                <div className="lg:hidden flex gap-4 pt-10 border-t border-zinc-800">
                  <button 
                    onClick={handleSaveProgram} 
                    disabled={saving}
                    className="flex-1 bg-white text-zinc-950 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all disabled:opacity-20 active:scale-95 flex items-center justify-center gap-3 italic"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy Protocol"}
                  </button>
                  <button 
                    onClick={closeModal}
                    className="flex-1 bg-zinc-900 text-zinc-500 border border-zinc-800 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                  >
                    Abort
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}
