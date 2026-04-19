"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  getExercises, upsertExercise, deleteExercise,
  uploadExerciseVideo, deleteExerciseVideo,
  type Exercise,
} from "@/lib/db/master";
import {
  ArrowLeft, Dumbbell, Pencil, Plus, Save, Trash2, X,
  Upload, Video, Play, AlertCircle, Loader2, CheckCircle,
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

  // Video upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoError, setVideoError] = useState("");
  const [removeExisting, setRemoveExisting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<"idle" | "uploading" | "done">("idle");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewModal, setPreviewModal] = useState<string | null>(null);

  const loadData = async () => setExercises(await getExercises(false));

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    const init = async () => {
      if (!loading && user) {
        if (user.role === 'customer') { router.push('/dashboard'); return; }
        await loadData();
      }
    };
    init();
  }, [loading, router, user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !user) return null;

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
  }

  function cancelEdit() {
    setForm(blankForm());
    setEditing(false);
    setVideoFile(null);
    setVideoError("");
    setRemoveExisting(false);
    setUploadProgress("idle");
    setError("");
  }

  function update(field: keyof Form, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function pickVideo(file: File) {
    setVideoError("");
    if (file.size > MAX_VIDEO_BYTES) {
      setVideoError(`File too large. Maximum size is 50 MB (this file is ${formatBytes(file.size)}).`);
      return;
    }
    if (!file.type.startsWith("video/")) {
      setVideoError("Please select a valid video file (MP4, MOV, WebM).");
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
    if (!form.name.trim()) { setError("Exercise name is required."); return; }
    setSaving(true);
    setError("");

    let videoUrl = removeExisting ? undefined : (form.existingVideoUrl || undefined);

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

    if (!saved) { setError("Failed to save exercise."); setSaving(false); return; }

    if (videoFile) {
      setUploadProgress("uploading");
      const uploaded = await uploadExerciseVideo(saved.id, videoFile);
      setUploadProgress(uploaded ? "done" : "idle");
      if (uploaded) {
        await upsertExercise({ ...saved, videoUrl: uploaded });
      } else {
        setError("Exercise saved but video upload failed. Try uploading again by editing the exercise.");
      }
    }

    if (removeExisting && form.existingVideoUrl) {
      await deleteExerciseVideo(form.existingVideoUrl);
    }

    setSuccess(form.id ? "Exercise updated." : "Exercise added.");
    cancelEdit();
    await loadData();
    setSaving(false);
  }

  async function handleToggle(ex: Exercise) {
    await upsertExercise({ ...ex, isActive: !ex.isActive });
    await loadData();
  }

  async function handleDelete(ex: Exercise) {
    if (!window.confirm(`Delete "${ex.name}"?`)) return;
    if (ex.videoUrl) await deleteExerciseVideo(ex.videoUrl);
    await deleteExercise(ex.id);
    await loadData();
  }

  const role = user.role === "admin" ? "ADMIN" : "TRAINER";
  const masterBase = role === "ADMIN" ? "/admin/master" : "/trainer/master";

  const hasVideo = !!videoFile || (!removeExisting && !!form.existingVideoUrl);
  const localVideoUrl = videoFile ? URL.createObjectURL(videoFile) : null;

  return (
    <DashboardLayout role={role as "ADMIN" | "TRAINER"}>
      <div className="min-h-full bg-zinc-950">
        <div className="max-w-5xl p-6 lg:p-8">

          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <Link href={masterBase} className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white">Exercise Library</h1>
              <p className="text-zinc-500 mt-0.5 text-sm">Add and manage exercises for program building.</p>
            </div>
          </div>

          {/* Add/Edit Form */}
          <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                {editing ? <><Pencil className="w-4 h-4 text-orange-400" />Edit Exercise</> : <><Plus className="w-4 h-4 text-orange-400" />Add Exercise</>}
              </h2>
              {editing && (
                <button type="button" onClick={cancelEdit} className="p-1 text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 lg:col-span-2">
                Name *
                <input type="text" value={form.name} onChange={e => update("name", e.target.value)} placeholder="Barbell Back Squat"
                  className="mt-1.5 w-full rounded-xl bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10 transition"
                />
              </label>

              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Category
                <select value={form.category} onChange={e => update("category", e.target.value)}
                  className="mt-1.5 w-full rounded-xl bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-sm text-white outline-none focus:border-orange-500/60 transition"
                >
                  <option value="">— select —</option>
                  {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </label>

              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Muscle Group
                <input type="text" value={form.muscleGroup} onChange={e => update("muscleGroup", e.target.value)} placeholder="Legs / Back / etc."
                  className="mt-1.5 w-full rounded-xl bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500/60 transition"
                />
              </label>

              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Equipment
                <input type="text" value={form.equipment} onChange={e => update("equipment", e.target.value)} placeholder="Barbell / Dumbbell / None"
                  className="mt-1.5 w-full rounded-xl bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500/60 transition"
                />
              </label>

              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Default Sets
                <input type="number" min="0" value={form.defaultSets} onChange={e => update("defaultSets", e.target.value)} placeholder="4"
                  className="mt-1.5 w-full rounded-xl bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500/60 transition"
                />
              </label>

              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Default Reps
                <input type="text" value={form.defaultReps} onChange={e => update("defaultReps", e.target.value)} placeholder="8-10 / Max"
                  className="mt-1.5 w-full rounded-xl bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500/60 transition"
                />
              </label>

              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Default Duration
                <input type="text" value={form.defaultDuration} onChange={e => update("defaultDuration", e.target.value)} placeholder="30 min / 45 sec"
                  className="mt-1.5 w-full rounded-xl bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500/60 transition"
                />
              </label>
            </div>

            {/* Video Upload */}
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                Demo Video <span className="normal-case font-normal text-zinc-600">(optional · max 50 MB · MP4, MOV, WebM)</span>
              </p>

              {/* Show existing video (when editing and not removed) */}
              {form.existingVideoUrl && !removeExisting && !videoFile && (
                <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">Current video</p>
                    <button type="button" onClick={() => setPreviewModal(form.existingVideoUrl)}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 mt-0.5"
                    >
                      <Play className="w-3 h-3" /> Preview
                    </button>
                  </div>
                  <button type="button" onClick={() => setRemoveExisting(true)}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              )}

              {removeExisting && (
                <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 mb-3">
                  <p className="text-sm text-red-400 font-medium">Video will be removed on save.</p>
                  <button type="button" onClick={() => setRemoveExisting(false)} className="text-xs text-zinc-400 hover:text-white">Undo</button>
                </div>
              )}

              {/* New file selected */}
              {videoFile && (
                <div className="flex items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/8 px-4 py-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-500/15 border border-orange-500/20 flex items-center justify-center shrink-0">
                    {uploadProgress === "uploading"
                      ? <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                      : uploadProgress === "done"
                        ? <CheckCircle className="w-4 h-4 text-green-400" />
                        : <Video className="w-4 h-4 text-orange-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{videoFile.name}</p>
                    <p className="text-xs text-zinc-500">{formatBytes(videoFile.size)}</p>
                  </div>
                  <button type="button" onClick={() => { setVideoFile(null); setVideoError(""); }}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Drop zone — hide when file already selected */}
              {!videoFile && (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 cursor-pointer transition-all ${
                    dragOver
                      ? "border-orange-500/60 bg-orange-500/8"
                      : "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/40"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-zinc-300">Drop video here or <span className="text-orange-400">click to browse</span></p>
                    <p className="text-xs text-zinc-600 mt-0.5">MP4 · MOV · WebM — max 50 MB</p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_VIDEO}
                className="hidden"
                onChange={handleFilePick}
              />

              {videoError && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />{videoError}
                </div>
              )}
            </div>

            {error && <p className="mt-4 text-sm font-medium text-red-400 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{error}</p>}
            {success && <p className="mt-4 text-sm font-medium text-green-400 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" />{success}</p>}

            <div className="mt-5 flex gap-3">
              <button type="submit" disabled={saving || !!videoError}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 px-5 py-2.5 text-sm font-bold text-white transition-colors shadow-lg shadow-orange-500/20"
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" />{uploadProgress === "uploading" ? "Uploading video…" : "Saving…"}</>
                  : <><Save className="w-4 h-4" />{editing ? "Save Changes" : "Add Exercise"}</>
                }
              </button>
              {editing && (
                <button type="button" onClick={cancelEdit}
                  className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Filter */}
          <div className="mb-4 flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search exercises…"
              className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-700 transition"
            />
            <label className="flex items-center gap-2 text-sm font-semibold text-zinc-500 cursor-pointer select-none whitespace-nowrap">
              <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} className="rounded" />
              Show inactive
            </label>
          </div>

          {/* Exercise list */}
          <div className="space-y-2">
            {filtered.length === 0 && (
              <p className="text-zinc-600 text-center py-10 text-sm">No exercises found.</p>
            )}
            {filtered.map(ex => (
              <div
                key={ex.id}
                className={`rounded-2xl border p-4 flex items-center justify-between gap-4 transition-colors ${
                  ex.isActive ? "bg-zinc-900 border-zinc-800" : "bg-zinc-900/50 border-zinc-800 opacity-50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white text-sm">{ex.name}</p>
                      {ex.videoUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewModal(ex.videoUrl!)}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 hover:bg-blue-500/25 transition-colors"
                        >
                          <Play className="w-2.5 h-2.5" /> Video
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">
                      {[ex.category, ex.muscleGroup, ex.equipment].filter(Boolean).join(" · ") || "—"}
                      {ex.defaultSets && ex.defaultReps ? ` · ${ex.defaultSets}×${ex.defaultReps}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(ex)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                      ex.isActive
                        ? "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                        : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-white"
                    }`}
                  >
                    {ex.isActive ? "Active" : "Inactive"}
                  </button>
                  <button onClick={() => startEdit(ex)} className="p-2 text-zinc-500 hover:text-orange-400 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(ex)} className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video preview modal */}
      {previewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewModal(null)}
        >
          <div className="relative w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewModal(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <video
              src={previewModal}
              controls
              autoPlay
              className="w-full rounded-2xl bg-black"
              style={{ maxHeight: "70vh" }}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
