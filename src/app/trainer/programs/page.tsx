"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { createProgram, updateProgram, deleteProgram, listPrograms, type Program, type ProgramActivity } from "@/lib/db/programs";
import { listCustomers, type Profile } from "@/lib/db/profiles";
import { getExercises, type Exercise } from "@/lib/db/master";
import { Dumbbell, Loader2, ChevronDown, ChevronUp, Plus, Pencil, Trash2 } from "lucide-react";

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
      if (!user) { router.push("/login"); return; }
      if (user.role !== "trainer") { router.push("/dashboard"); return; }
      loadData();
    }
  }, [user, loading, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    if (!user) return;
    const [progs, allClients, allExercises] = await Promise.all([
      listPrograms({ trainerId: user.id }),
      listCustomers(),
      getExercises()
    ]);
    setPrograms(progs);
    setClients(allClients);
    setExercises(allExercises);
    setDataLoaded(true);
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
      setFormError("Client and Title are required.");
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
      setFormError("Failed to save program.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    const confirmed = window.confirm(
      "Delete this program? This will also remove all its exercises. This cannot be undone."
    );
    if (!confirmed) return;
    await deleteProgram(programId);
    await loadData();
  };

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="trainer">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="trainer">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Programs</h1>
              <p className="text-gray-500 text-sm">Weekly training programs for all clients</p>
            </div>
          </div>
          <button
            onClick={() => {
              setProgramForm(emptyForm());
              setShowProgramModal(true);
            }}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Program
          </button>
        </div>

        {programs.length > 0 ? (
          <div className="space-y-4">
            {programs.map((prog) => (
              <div key={prog.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                  <button
                    onClick={() => setExpanded(expanded === prog.id ? null : prog.id)}
                    className="flex-1 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Dumbbell className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{prog.title}</p>
                        <p className="text-sm text-gray-500">
                          {clients.find(c => c.id === prog.userId)?.name || "Unknown"} · Week {prog.weekNumber} · {prog.activities?.length ?? 0} activities
                        </p>
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-1 pl-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
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
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProgram(prog.id);
                      }}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                      title="Delete program"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpanded(expanded === prog.id ? null : prog.id)}
                      className="p-2 ml-1"
                    >
                      {expanded === prog.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                {expanded === prog.id && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mt-3 mb-4">{prog.description}</p>
                    {prog.activities && prog.activities.length > 0 ? (
                      <div className="space-y-2">
                        {prog.activities.map((act, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                            <span className="font-bold text-orange-600 w-10 flex-shrink-0">{act.day.substring(0,3)}</span>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{act.exerciseName}</p>
                              <p className="text-gray-500 text-xs mt-0.5">
                                {act.sets && act.reps && `${act.sets} sets × ${act.reps}`}
                                {act.duration && ` · ${act.duration}`}
                                {act.notes && ` · ${act.notes}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No activities listed.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No programs yet</p>
            <p className="text-sm mt-1">Create programs for your clients to track their workouts.</p>
          </div>
        )}
      </div>

      {showProgramModal && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl my-8">
            <h2 className="text-lg font-bold mb-4 border-b pb-3">
              {editingProgramId ? "Edit Program" : "New Program"}
            </h2>
            
            <div className="space-y-4">
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <select 
                    value={programForm.userId}
                    onChange={(e) => setProgramForm({...programForm, userId: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">Select a client...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name || c.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Week Number</label>
                  <input 
                    type="number"
                    min="1"
                    value={programForm.weekNumber}
                    onChange={(e) => setProgramForm({...programForm, weekNumber: parseInt(e.target.value)})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text"
                  value={programForm.title}
                  onChange={(e) => setProgramForm({...programForm, title: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g. Strength Phase 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea 
                  value={programForm.description}
                  onChange={(e) => setProgramForm({...programForm, description: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm h-16"
                  placeholder="Focus on form and tempo..."
                />
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-sm">Activities</h3>
                  <button onClick={addActivityRow} className="text-orange-500 text-sm font-semibold hover:text-orange-600 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Exercise
                  </button>
                </div>
                
                <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2">
                  {programForm.activities.map((act, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <select 
                        value={act.day} 
                        onChange={e => updateActivity(i, { day: e.target.value })}
                        className="col-span-3 lg:col-span-2 rounded-lg border px-2 py-1.5 text-xs text-gray-700 bg-white"
                      >
                        {DAYS.map(d => <option key={d} value={d}>{d.substring(0,3)}</option>)}
                      </select>
                      
                      <div className="col-span-9 lg:col-span-4 relative">
                        <input
                          list={`exercises-${i}`}
                          value={act.exerciseName}
                          onChange={e => handleExerciseChange(i, e.target.value)}
                          placeholder="Exercise name"
                          className="w-full rounded-lg border px-2 py-1.5 text-xs bg-white"
                        />
                        <datalist id={`exercises-${i}`}>
                          {exercises.filter(e => e.isActive).map(ex => <option key={ex.id} value={ex.name} />)}
                        </datalist>
                      </div>
                      
                      <div className="col-span-4 lg:col-span-2">
                        <input 
                          value={act.sets ?? ""} 
                          onChange={e => updateActivity(i, { sets: parseInt(e.target.value) || undefined })}
                          placeholder="Sets (e.g. 3)" 
                          type="number" 
                          className="w-full rounded-lg border px-2 py-1.5 text-xs bg-white" 
                        />
                      </div>
                      
                      <div className="col-span-4 lg:col-span-2">
                        <input 
                          value={act.reps ?? ""} 
                          onChange={e => updateActivity(i, { reps: e.target.value })}
                          placeholder="Reps (e.g. 8-12)" 
                          className="w-full rounded-lg border px-2 py-1.5 text-xs bg-white" 
                        />
                      </div>
                      
                      <div className="col-span-3 lg:col-span-1 text-right">
                        <button onClick={() => removeActivity(i)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {programForm.activities.length === 0 && (
                     <div className="text-center py-4 text-xs text-gray-400 border border-dashed rounded-lg">
                       No activities added yet. Click "+ Add Exercise" to start building the program.
                     </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={handleSaveProgram} 
                disabled={saving}
                className="flex-1 bg-orange-500 text-white flex items-center justify-center py-2.5 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Program"}
              </button>
              <button 
                onClick={closeModal}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
