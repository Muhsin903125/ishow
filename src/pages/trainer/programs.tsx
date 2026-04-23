"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { loadTrainerWorkspace } from "@/lib/api/workspace";
import {
  createProgram,
  deleteProgram,
  duplicateProgramToNextWeek,
  updateProgram,
  type Program,
} from "@/lib/db/programs";
import type { Profile } from "@/lib/db/profiles";
import type { Exercise } from "@/lib/db/master";
import {
  Copy,
  Dumbbell,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

type ActivityRow = {
  day: string;
  exerciseName: string;
  exerciseId?: string;
  sets?: number;
  reps?: string;
  duration?: string;
  notes?: string;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const emptyProgramForm = () => ({
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
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProgramForm());

  async function loadData() {
    if (!user) return;

    try {
      const workspace = await loadTrainerWorkspace();
      setPrograms(workspace.programs);
      setClients(workspace.clients);
      setExercises(workspace.exercises);
    } finally {
      setDataLoaded(true);
    }
  }

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "trainer") {
      router.replace("/dashboard");
      return;
    }

    let active = true;

    (async () => {
      try {
        const workspace = await loadTrainerWorkspace();

        if (!active) return;
        setPrograms(workspace.programs);
        setClients(workspace.clients);
        setExercises(workspace.exercises);
      } finally {
        if (active) {
          setDataLoaded(true);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [loading, router, user]);

  function updateActivity(index: number, updates: Partial<ActivityRow>) {
    setForm((prev) => ({
      ...prev,
      activities: prev.activities.map((activity, activityIndex) =>
        activityIndex === index ? { ...activity, ...updates } : activity
      ),
    }));
  }

  function addActivityRow() {
    setForm((prev) => ({
      ...prev,
      activities: [...prev.activities, { day: "Monday", exerciseName: "" }],
    }));
  }

  function removeActivity(index: number) {
    setForm((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, activityIndex) => activityIndex !== index),
    }));
  }

  function openCreate() {
    setEditingProgramId(null);
    setForm(emptyProgramForm());
    setError("");
    setShowModal(true);
  }

  function openEdit(program: Program) {
    setEditingProgramId(program.id);
    setForm({
      userId: program.userId,
      weekNumber: program.weekNumber,
      title: program.title,
      description: program.description || "",
      activities:
        program.activities?.map((activity) => ({
          day: activity.day,
          exerciseId: activity.exerciseId,
          exerciseName: activity.exerciseName,
          sets: activity.sets,
          reps: activity.reps,
          duration: activity.duration,
          notes: activity.notes,
        })) ?? [],
    });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    if (!user) return;

    if (!form.userId || !form.title.trim()) {
      setError("Choose a client and enter a program title.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const activities = form.activities.map((activity, index) => ({
        day: activity.day,
        exerciseId: activity.exerciseId,
        exerciseName: activity.exerciseName,
        sets: activity.sets,
        reps: activity.reps,
        duration: activity.duration,
        notes: activity.notes,
        sortOrder: index,
      }));

      if (editingProgramId) {
        await updateProgram(
          editingProgramId,
          {
            title: form.title,
            description: form.description,
            weekNumber: form.weekNumber,
          },
          activities
        );
      } else {
        await createProgram(
          {
            userId: form.userId,
            trainerId: user.id,
            weekNumber: form.weekNumber,
            title: form.title,
            description: form.description,
          },
          activities
        );
      }

      setShowModal(false);
      setEditingProgramId(null);
      setForm(emptyProgramForm());
      await loadData();
    } catch {
      setError("We could not save this program. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(programId: string) {
    if (!window.confirm("Delete this program?")) return;
    await deleteProgram(programId);
    await loadData();
  }

  async function handleDuplicate(programId: string) {
    await duplicateProgramToNextWeek(programId);
    await loadData();
  }

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="trainer">
        <div className="flex min-h-full items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-5 py-4 shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm font-semibold text-slate-600">
              Loading training programs...
            </span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="trainer">
      <div className="min-h-screen bg-[linear-gradient(180deg,#f5f9ff_0%,#ffffff_40%,#f7f3ec_100%)] p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-blue-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Trainer programs
                </div>
                <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950">
                  Program Builder
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
                  Build weekly programs, duplicate proven structures, and keep
                  exercise prescriptions organized in one place.
                </p>
              </div>

              <button
                onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                New Program
              </button>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            {programs.map((program) => {
              const client = clients.find((item) => item.id === program.userId);
              return (
                <article
                  key={program.id}
                  className="rounded-[1.75rem] border border-slate-200/80 bg-white/92 p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-700">
                        Week {program.weekNumber}
                      </p>
                      <h2 className="mt-3 text-2xl font-black text-slate-950">
                        {program.title}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600">
                        {client?.name || "Unassigned client"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDuplicate(program.id)}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-700"
                        title="Duplicate to next week"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEdit(program)}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-700"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(program.id)}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-600 transition-colors hover:border-rose-200 hover:text-rose-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {program.description ? (
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">
                      {program.description}
                    </p>
                  ) : null}

                  <div className="mt-5 grid gap-3">
                    {(program.activities ?? []).length > 0 ? (
                      program.activities?.map((activity) => (
                        <div
                          key={activity.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
                              {activity.day}
                            </span>
                            <span className="text-sm font-semibold text-slate-900">
                              {activity.exerciseName}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">
                            {[activity.sets ? `${activity.sets} sets` : null, activity.reps, activity.duration]
                              .filter(Boolean)
                              .join(" · ") || "Custom prescription"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                        No activities added yet.
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-6 backdrop-blur-md">
          <div className="w-full max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_100px_rgba(15,23,42,0.2)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-700">
                  {editingProgramId ? "Edit program" : "Create program"}
                </p>
                <h2 className="mt-3 text-3xl font-black text-slate-950">
                  {editingProgramId ? "Update the weekly plan." : "Build a new weekly plan."}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                {error}
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Client
                </span>
                <select
                  value={form.userId}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, userId: event.target.value }))
                  }
                  className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900"
                >
                  <option value="">Select client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Week Number
                </span>
                <input
                  type="number"
                  min="1"
                  value={form.weekNumber}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      weekNumber: Number(event.target.value) || 1,
                    }))
                  }
                  className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900"
                />
              </label>

              <label className="grid gap-2 md:col-span-2">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Title
                </span>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900"
                />
              </label>

              <label className="grid gap-2 md:col-span-2">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Description
                </span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="min-h-[110px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                />
              </label>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-slate-950">Activities</p>
                <p className="text-sm text-slate-600">
                  Add each exercise block with sets, reps, or duration.
                </p>
              </div>
              <button
                onClick={addActivityRow}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-slate-700"
              >
                <Plus className="h-4 w-4" />
                Add Activity
              </button>
            </div>

            <div className="mt-4 max-h-[320px] space-y-4 overflow-y-auto pr-1">
              {form.activities.map((activity, index) => (
                <div
                  key={`${activity.exerciseName}-${index}`}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Day
                      </span>
                      <select
                        value={activity.day}
                        onChange={(event) =>
                          updateActivity(index, { day: event.target.value })
                        }
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                      >
                        {DAYS.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Exercise
                      </span>
                      <input
                        list={`exercise-list-${index}`}
                        value={activity.exerciseName}
                        onChange={(event) => {
                          const value = event.target.value;
                          const match = exercises.find(
                            (exercise) =>
                              exercise.name.toLowerCase() === value.toLowerCase()
                          );

                          updateActivity(index, {
                            exerciseName: value,
                            exerciseId: match?.id,
                            sets: match?.defaultSets ?? activity.sets,
                            reps: match?.defaultReps ?? activity.reps,
                            duration: match?.defaultDuration ?? activity.duration,
                          });
                        }}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                      />
                      <datalist id={`exercise-list-${index}`}>
                        {exercises.map((exercise) => (
                          <option key={exercise.id} value={exercise.name} />
                        ))}
                      </datalist>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Sets
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={activity.sets ?? ""}
                        onChange={(event) =>
                          updateActivity(index, {
                            sets: event.target.value
                              ? Number(event.target.value)
                              : undefined,
                          })
                        }
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Reps
                      </span>
                      <input
                        value={activity.reps ?? ""}
                        onChange={(event) =>
                          updateActivity(index, { reps: event.target.value || undefined })
                        }
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Duration
                      </span>
                      <input
                        value={activity.duration ?? ""}
                        onChange={(event) =>
                          updateActivity(index, {
                            duration: event.target.value || undefined,
                          })
                        }
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Notes
                      </span>
                      <input
                        value={activity.notes ?? ""}
                        onChange={(event) =>
                          updateActivity(index, { notes: event.target.value || undefined })
                        }
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                      />
                    </label>
                  </div>

                  <button
                    onClick={() => removeActivity(index)}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove activity
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Dumbbell className="h-4 w-4" />}
                {editingProgramId ? "Update Program" : "Save Program"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
