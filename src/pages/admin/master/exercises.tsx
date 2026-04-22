"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  getExercises, upsertExercise, deleteExercise,
  uploadExerciseVideo, deleteExerciseVideo,
  type Exercise,
} from "@/lib/db/master";
import {
  ArrowLeft, 
  Dumbbell, 
  Pencil, 
  Plus, 
  Save, 
  Trash2, 
  X,
  Upload, 
  Video, 
  Play, 
  AlertCircle, 
  Loader2, 
  CheckCircle,
  Zap,
  Activity,
  Shield,
  Target,
  ArrowRight,
} from "lucide-react";

const CATEGORIES = ["strength", "cardio", "mobility", "flexibility", "other"] as const;
type Category = typeof CATEGORIES[number];

const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB
const ACCEPTED_VIDEO = "video/mp4,video/quicktime,video/webm,video/x-msvideo";

type Form = {
  id?: string;
  name: string;
  category: Category | "";
  muscleGroup: string;
  equipment: string;
  defaultSets: string;
  defaultReps: string;
  defaultDuration: string;
  existingVideoUrl: string;
};

function blankForm(): Form {
  return {
    name: "", category: "", muscleGroup: "", equipment: "",
    defaultSets: "", defaultReps: "", defaultDuration: "", existingVideoUrl: "",
  };
}

function fromExercise(e: Exercise): Form {
  return {
    id: e.id,
    name: e.name,
    category: e.category ?? "",
    muscleGroup: e.muscleGroup ?? "",
    equipment: e.equipment ?? "",
    defaultSets: e.defaultSets ? String(e.defaultSets) : "",
    defaultReps: e.defaultReps ?? "",
    defaultDuration: e.defaultDuration ?? "",
    existingVideoUrl: e.videoUrl ?? "",
  };
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function ExercisesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState<Form>(blankForm());
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Video upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoError, setVideoError] = useState("");
  const [removeExisting, setRemoveExisting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<"idle" | "uploading" | "done">("idle");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewModal, setPreviewModal] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setExercises(await getExercises(false));
    } finally {
      setDataLoaded(true);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (user.role === 'customer') { router.replace('/dashboard'); return; }
    loadData();
  }, [loading, router, user]);

  if (loading || !dataLoaded || !user) {
    return (
      <DashboardLayout role="admin">
        <div className="p-8 max-w-5xl mx-auto animate-pulse space-y-10">
           <div className="h-10 w-48 bg-zinc-900 rounded-lg" />
           <div className="h-96 bg-zinc-900 rounded-[2.5rem]" />
           <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-zinc-900 rounded-2xl" />)}
           </div>
        </div>
      </DashboardLayout>
    );
  }

  const filtered = exercises
    .filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()) || (e.muscleGroup ?? "").toLowerCase().includes(search.toLowerCase()))
    .filter(e => showAll || e.isActive);

  function startEdit(ex: Exercise) {
    setForm(fromExercise(ex));
    setEditing(true);
    setVideoFile(null);
    setVideoError("");
    setRemoveExisting(false);
    setUploadProgress("idle");
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setForm(blankForm());
    setEditing(false);
    setVideoFile(null);
    setVideoError("");
    setRemoveExisting(false);
    setUploadProgress("idle");
    setError("");
    setSuccess("");
  }

  function update(field: keyof Form, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function pickVideo(file: File) {
    setVideoError("");
    if (file.size > MAX_VIDEO_BYTES) {
      setVideoError(`Mass overflow. Limits capped at 50 MB (Selection: ${formatBytes(file.size)}).`);
      return;
    }
    if (!file.type.startsWith("video/")) {
      setVideoError("Invalid kinetic format. MP4/MOV/WebM required.");
      return;
    }
    setVideoFile(file);
    setRemoveExisting(false);
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) pickVideo(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) pickVideo(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Element identifier required."); return; }
    setSaving(true);
    setError("");

    const videoUrl = removeExisting ? undefined : (form.existingVideoUrl || undefined);

    const saved = await upsertExercise({
      id: form.id,
      name: form.name.trim(),
      category: (form.category as Category) || undefined,
      muscleGroup: form.muscleGroup.trim() || undefined,
      equipment: form.equipment.trim() || undefined,
      defaultSets: form.defaultSets ? Number(form.defaultSets) : undefined,
      defaultReps: form.defaultReps.trim() || undefined,
      defaultDuration: form.defaultDuration.trim() || undefined,
      videoUrl,
      isActive: true,
    });

    if (!saved) { setError("Database sync failed."); setSaving(false); return; }

    if (videoFile) {
      setUploadProgress("uploading");
      const uploaded = await uploadExerciseVideo(saved.id, videoFile);
      setUploadProgress(uploaded ? "done" : "idle");
      if (uploaded) {
        await upsertExercise({ ...saved, videoUrl: uploaded });
      } else {
        setError("Element synced but kinetic feed failed. Dispatch retry.");
      }
    }

    if (removeExisting && form.existingVideoUrl) {
      await deleteExerciseVideo(form.existingVideoUrl);
    }

    setSuccess(form.id ? "Element updated." : "Element integrated.");
    setTimeout(() => {
        cancelEdit();
        loadData();
        setSaving(false);
    }, 1000);
  }

  async function handleToggle(ex: Exercise) {
    await upsertExercise({ ...ex, isActive: !ex.isActive });
    await loadData();
  }

  async function handleDelete(ex: Exercise) {
    if (!window.confirm(`Purge element "${ex.name.toUpperCase()}"? This cannot be undone.`)) return;
    if (ex.videoUrl) await deleteExerciseVideo(ex.videoUrl);
    await deleteExercise(ex.id);
    await loadData();
  }

  const role = user.role === "admin" ? "admin" : "trainer";
  const hasVideo = !!videoFile || (!removeExisting && !!form.existingVideoUrl);

  return (
    <DashboardLayout role={role}>
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-6">
              <Link href="/admin/master" className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-500 transition-all shadow-xl">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">
                   Element <span className="text-orange-500">Library</span>
                </h1>
                <p className="text-zinc-500 mt-1 font-medium text-sm">Managing the kinetic fundamental database for program architecture.</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
             
             {/* Left Col: Master Controls */}
             <div className="lg:col-span-12">
                <motion.form 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSubmit} 
                  className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group hover:border-zinc-700 transition-all shadow-2xl"
                >
                  <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-10 transition-opacity">
                    <Activity className="w-24 h-24 text-white" />
                  </div>

                  <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-inner">
                          {editing ? <Pencil size={20} /> : <Plus size={20} />}
                       </div>
                       <div>
                          <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">{editing ? "Adjust Element" : "Integrate New Element"}</h2>
                          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-1 italic">Reference sync protocols</p>
                       </div>
                    </div>
                    {editing && (
                      <button type="button" onClick={cancelEdit} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-600 hover:text-white transition-colors">
                        <X size={20} />
                      </button>
                    )}
                  </div>

                  <div className="grid gap-8 sm:grid-cols-12 relative z-10">
                    <div className="sm:col-span-8">
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Element Identifier (Name)</label>
                      <input 
                        type="text" 
                        value={form.name} 
                        onChange={e => update("name", e.target.value)} 
                        placeholder="E.G. BARBELL DEADS"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white font-black uppercase tracking-tight focus:border-orange-500/50 outline-none transition-all placeholder:text-zinc-800"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Classification</label>
                      <select 
                        value={form.category} 
                        onChange={e => update("category", e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white font-black uppercase outline-none focus:border-zinc-600 appearance-none italic"
                      >
                        <option value="">— UNCATEGORIZED —</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c?.toUpperCase()}</option>)}
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Target Group</label>
                      <input 
                        type="text" 
                        value={form.muscleGroup} 
                        onChange={e => update("muscleGroup", e.target.value)} 
                        placeholder="LEGS / BACK"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white font-black uppercase focus:border-zinc-600 outline-none transition-all placeholder:text-zinc-800"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Required Hardware</label>
                      <input 
                        type="text" 
                        value={form.equipment} 
                        onChange={e => update("equipment", e.target.value)} 
                        placeholder="DUMBBELL / BARBELL"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white font-black uppercase focus:border-zinc-600 outline-none transition-all placeholder:text-zinc-800"
                      />
                    </div>

                    <div className="sm:col-span-4">
                       <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Manifest Parameters (Default S/R)</label>
                       <div className="flex gap-2">
                          <input 
                            type="number" 
                            min="0" 
                            value={form.defaultSets} 
                            onChange={e => update("defaultSets", e.target.value)} 
                            placeholder="SETS"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-4 text-sm text-white font-black focus:border-zinc-600 outline-none text-center"
                          />
                          <input 
                            type="text" 
                            value={form.defaultReps} 
                            onChange={e => update("defaultReps", e.target.value)} 
                            placeholder="REPS"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-4 text-sm text-white font-black uppercase focus:border-zinc-600 outline-none text-center"
                          />
                       </div>
                    </div>

                    {/* Kinetic Feed (Video) */}
                    <div className="sm:col-span-12">
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 italic">Kinetic Feed (Demo Video)</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         
                         {/* Video Status/Preview Area */}
                         <div className="flex flex-col gap-4">
                            {form.existingVideoUrl && !removeExisting && !videoFile && (
                              <div className="group/vid relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 h-full min-h-[160px] flex flex-col items-center justify-center">
                                <Video className="w-8 h-8 text-zinc-800 mb-4 group-hover/vid:text-blue-500 transition-colors" />
                                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest italic group-hover/vid:text-white transition-all">Operational Feed Active</p>
                                <div className="mt-4 flex gap-2 relative z-10">
                                   <button type="button" onClick={() => setPreviewModal(form.existingVideoUrl)} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-400 transition-all flex items-center gap-2 italic">
                                      <Play size={10} fill="currentColor" /> Preview Feed
                                   </button>
                                   <button type="button" onClick={() => setRemoveExisting(true)} className="px-4 py-2 bg-zinc-900 text-zinc-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-rose-500 transition-all flex items-center gap-2 italic">
                                      <Trash2 size={10} /> Purge
                                   </button>
                                </div>
                              </div>
                            )}

                            {removeExisting && (
                              <div className="rounded-3xl border border-dashed border-rose-500/30 bg-rose-500/5 px-8 py-10 text-center flex flex-col items-center justify-center h-full">
                                <AlertCircle className="w-8 h-8 text-rose-500 mb-4 animate-pulse" />
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic">Feed Scheduled for Purge</p>
                                <button type="button" onClick={() => setRemoveExisting(false)} className="mt-4 text-[9px] font-black text-white border-b border-white pb-1 italic opacity-50 hover:opacity-100 transition-opacity">Cancel Purge</button>
                              </div>
                            )}

                            {videoFile && (
                              <div className="rounded-3xl border border-orange-500/30 bg-orange-500/5 px-8 py-10 text-center flex flex-col items-center justify-center h-full">
                                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white mb-4 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                                   {uploadProgress === "uploading" ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle size={24} />}
                                </div>
                                <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic truncate max-w-[200px]">{videoFile.name}</p>
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1 italic">{formatBytes(videoFile.size)}</p>
                                <button type="button" onClick={() => setVideoFile(null)} className="mt-6 text-[9px] font-black text-zinc-400 hover:text-white transition-all uppercase tracking-widest italic flex items-center gap-2">
                                   <X size={12} /> Discard Feed
                                </button>
                              </div>
                            )}

                            {!videoFile && !form.existingVideoUrl || (removeExisting && !videoFile) ? (
                               <div
                                 onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                 onDragLeave={() => setDragOver(false)}
                                 onDrop={handleDrop}
                                 onClick={() => fileInputRef.current?.click()}
                                 className={`flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed px-8 py-10 cursor-pointer transition-all h-full min-h-[160px] ${
                                   dragOver
                                     ? "border-orange-500/60 bg-orange-500/8"
                                     : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-950"
                                 }`}
                               >
                                 <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-orange-500 transition-colors">
                                   <Upload size={20} />
                                 </div>
                                 <div className="text-center">
                                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic group-hover:text-white transition-colors">Upload Kinetic Feed</p>
                                   <p className="text-[9px] text-zinc-800 font-black uppercase tracking-[0.2em] mt-2">MP4 · MOV · 50MB MAX</p>
                                 </div>
                               </div>
                            ) : null}
                         </div>

                         {/* Info/Constraints */}
                         <div className="flex flex-col justify-end pb-4 space-y-4">
                             <div className="p-5 bg-zinc-950/40 border border-zinc-800 rounded-2xl border-l-[4px] border-l-violet-500/50">
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest italic leading-relaxed">DEMO VIDEOS ENABLE TRAINERS TO VISUALIZE PROPER KINETIC FORM DURING PROGRAM COMPOSITION. ENSURE HIGH-CONTRAST LIGHTING AND CLEAR EXECUTION.</p>
                             </div>
                             <input ref={fileInputRef} type="file" accept={ACCEPTED_VIDEO} className="hidden" onChange={handleFilePick} />
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 flex flex-col sm:flex-row gap-4 relative z-10 border-t border-zinc-800/50 pt-10">
                    <button 
                      type="submit" 
                      disabled={saving || !!videoError}
                      className="bg-white text-zinc-950 px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-orange-500 hover:text-white disabled:opacity-10 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 italic"
                    >
                      {saving ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> {uploadProgress === "uploading" ? "Syncing Feed..." : "Processing..."}</>
                      ) : (
                        <><Zap className="w-4 h-4 fill-current" /> {editing ? "Update Database" : "Integrate Element"}</>
                      )}
                    </button>
                    {editing && (
                      <button 
                        type="button" 
                        onClick={cancelEdit}
                        className="bg-zinc-950 text-zinc-600 hover:text-white border border-zinc-800 px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[.3em] transition-all italic"
                      >
                        Abort Sync
                      </button>
                    )}
                    
                    <AnimatePresence>
                      {success && (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex-1 flex items-center gap-3 px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl text-[10px] font-black uppercase tracking-widest italic"
                        >
                          <CheckCircle className="w-5 h-5" /> {success}
                        </motion.div>
                      )}
                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex-1 flex items-center gap-3 px-6 py-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest italic"
                        >
                          <AlertCircle className="w-5 h-5" /> {error}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.form>
             </div>

             {/* Right Col: Library List */}
             <div className="lg:col-span-12">
                <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                   <div className="relative flex-1 group w-full">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-white transition-colors" />
                      <input 
                        type="text" 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        placeholder="FILTER DATABASE..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black text-white uppercase tracking-[0.2em] outline-none focus:border-zinc-600 placeholder:text-zinc-800"
                      />
                   </div>
                   <div className="flex items-center gap-6 self-end md:self-center">
                      <label className="flex items-center gap-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest cursor-pointer group italic">
                         <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} className="hidden" />
                         <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${showAll ? 'bg-orange-500 border-orange-500 text-white' : 'border-zinc-800 bg-zinc-900 text-transparent'}`}>
                             <CheckCircle size={12} />
                         </div>
                         Reveal Archive
                      </label>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="md:col-span-2 lg:col-span-3 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-[3rem] py-20 text-center"
                      >
                        <Shield className="w-12 h-12 mx-auto mb-4 text-zinc-800 opacity-20" />
                        <p className="text-zinc-700 font-black uppercase text-[10px] tracking-[0.5em] italic">Database Empty or Isolated</p>
                      </motion.div>
                    ) : filtered.map((ex, exIdx) => (
                      <motion.div
                        layout
                        key={ex.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ delay: exIdx * 0.02 }}
                        className={`rounded-[2rem] border p-6 flex flex-col justify-between gap-6 transition-all group relative overflow-hidden ${
                          ex.isActive ? "bg-zinc-900 border-zinc-800 hover:border-zinc-600" : "bg-zinc-950 border-zinc-900 opacity-40 grayscale"
                        }`}
                      >
                        <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-10 transition-opacity pointer-events-none">
                           <Dumbbell className="w-16 h-16 text-white" />
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-orange-500 transition-colors">
                              <Dumbbell size={18} />
                            </div>
                            <div className="flex items-center gap-2">
                               {ex.videoUrl && (
                                 <button
                                   type="button"
                                   onClick={() => setPreviewModal(ex.videoUrl!)}
                                   className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-900/20"
                                 >
                                   <Play size={12} fill="currentColor" />
                                 </button>
                               )}
                               <button 
                                 onClick={() => handleToggle(ex)}
                                 className={`w-4 h-4 rounded-full border transition-all ${ex.isActive ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800 border-zinc-700'}`}
                                 title={ex.isActive ? "Deactivate Element" : "Activate Element"}
                               />
                            </div>
                          </div>
                          
                          <h3 className="text-sm font-black text-white uppercase italic tracking-widest leading-tight mb-2 group-hover:text-orange-500 transition-colors">{ex.name}</h3>
                          <div className="flex flex-wrap gap-2">
                             {[ex.category, ex.muscleGroup].filter(Boolean).map(tag => (
                               <span key={tag} className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic border border-zinc-800/50 px-2 py-0.5 rounded-md">{tag}</span>
                             ))}
                          </div>
                        </div>

                        <div className="relative z-10 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              {ex.defaultSets && (
                                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">
                                   DEF: <span className="text-white">{ex.defaultSets}S</span> <span className="text-zinc-800">×</span> <span className="text-white">{ex.defaultReps || "VAR"}</span>
                                </p>
                              )}
                           </div>
                           <div className="flex gap-1">
                              <button onClick={() => startEdit(ex)} className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-700 hover:text-white hover:border-zinc-600 transition-all">
                                 <Pencil size={12} />
                              </button>
                              <button onClick={() => handleDelete(ex)} className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-700 hover:text-rose-500 hover:border-rose-500/30 transition-all">
                                 <Trash2 size={12} />
                              </button>
                           </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Kinetic Feed Preview Modal */}
      <AnimatePresence>
        {previewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/90 backdrop-blur-xl p-6 overflow-hidden">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="relative w-full max-w-4xl rounded-[4rem] border border-zinc-800 bg-zinc-950 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 z-10">
                <button onClick={() => setPreviewModal(null)} className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-600 hover:text-white flex items-center justify-center transition-all">
                   <X size={24} />
                </button>
              </div>
              <div className="p-4 md:p-8">
                 <div className="relative aspect-video rounded-[3rem] overflow-hidden bg-black shadow-inner shadow-zinc-900">
                    <video
                      src={previewModal}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                 </div>
                 <div className="mt-8 flex items-center justify-between px-6">
                    <div>
                       <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic mb-2">Kinetic Analysis Feed</p>
                       <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">Operational <span className="text-blue-500">Demo</span></h4>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest italic animate-pulse">
                          <Activity size={14} /> Feed Live
                       </div>
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

function Search({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
