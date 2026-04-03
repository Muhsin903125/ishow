"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { addItem, deleteItem, getItems, updateItem } from "@/lib/storage";
import type { User } from "@/lib/auth";
import type { DayActivity, Program } from "@/lib/mockData";
import {
  Calendar,
  Dumbbell,
  Layers,
  Pencil,
  Plus,
  Save,
  Target,
  Trash2,
  Users,
  X,
} from "lucide-react";

type ProgramActivityForm = {
  day: string;
  exercise: string;
  sets: string;
  reps: string;
  duration: string;
  notes: string;
};

type ProgramFormState = {
  userId: string;
  weekNumber: string;
  title: string;
  description: string;
  activities: ProgramActivityForm[];
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function createBlankActivity(): ProgramActivityForm {
  return {
    day: "Monday",
    exercise: "",
    sets: "",
    reps: "",
    duration: "",
    notes: "",
  };
}

function createBlankForm(userId = ""): ProgramFormState {
  return {
    userId,
    weekNumber: "1",
    title: "",
    description: "",
    activities: [createBlankActivity()],
  };
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toActivity(activity: ProgramActivityForm): DayActivity | null {
  const exercise = activity.exercise.trim();
  if (!exercise) return null;

  const setsValue = activity.sets.trim();
  const parsedSets = setsValue ? Number(setsValue) : undefined;

  return {
    day: activity.day,
    exercise,
    sets: Number.isFinite(parsedSets) ? parsedSets : undefined,
    reps: activity.reps.trim() || undefined,
    duration: activity.duration.trim() || undefined,
    notes: activity.notes.trim() || undefined,
  };
}

function fromActivity(activity: DayActivity): ProgramActivityForm {
  return {
    day: activity.day,
    exercise: activity.exercise,
    sets: activity.sets ? String(activity.sets) : "",
    reps: activity.reps ?? "",
    duration: activity.duration ?? "",
    notes: activity.notes ?? "",
  };
}

function TrainerProgramsContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = searchParams.get("client") ?? "all";

  const [programs, setPrograms] = useState<Program[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [clientFilter, setClientFilter] = useState("all");
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [form, setForm] = useState<ProgramFormState>(createBlankForm());
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function loadData() {
    const nextCustomers = getItems<User>("ishow_users")
      .filter((item) => item.role === "customer")
      .sort((left, right) => left.name.localeCompare(right.name));

    const customerNameById = Object.fromEntries(nextCustomers.map((customer) => [customer.id, customer.name]));

    const nextPrograms = getItems<Program>("ishow_programs").sort((left, right) => {
      const nameCompare = (customerNameById[left.userId] ?? "").localeCompare(customerNameById[right.userId] ?? "");
      if (nameCompare !== 0) return nameCompare;
      if (right.weekNumber !== left.weekNumber) return right.weekNumber - left.weekNumber;
      return right.createdAt.localeCompare(left.createdAt);
    });

    setCustomers(nextCustomers);
    setPrograms(nextPrograms);
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (!loading && user) {
      if (user.role !== "trainer") {
        router.push("/dashboard");
        return;
      }

      loadData();
    }
  }, [loading, router, user]);

  useEffect(() => {
    setClientFilter(queryClient === "all" ? "all" : queryClient);
  }, [queryClient]);

  useEffect(() => {
    if (!customers.length || editingProgramId) return;

    setForm((current) => {
      if (current.userId) return current;
      const defaultUserId = clientFilter === "all" ? customers[0]?.id ?? "" : clientFilter;
      return { ...current, userId: defaultUserId };
    });
  }, [clientFilter, customers, editingProgramId]);

  if (loading || !user) return null;

  const customerById = Object.fromEntries(customers.map((customer) => [customer.id, customer]));
  const visiblePrograms = programs.filter((program) => clientFilter === "all" || program.userId === clientFilter);
  const visibleCustomers = clientFilter === "all"
    ? customers
    : customers.filter((customer) => customer.id === clientFilter);

  const activityCount = visiblePrograms.reduce((total, program) => total + program.activities.length, 0);
  const currentWeek = visiblePrograms.reduce((highest, program) => Math.max(highest, program.weekNumber), 0);

  function resetForm(preferredUserId?: string) {
    const fallbackUserId = preferredUserId ?? (clientFilter === "all" ? customers[0]?.id ?? "" : clientFilter);
    setEditingProgramId(null);
    setForm(createBlankForm(fallbackUserId));
    setErrorMessage("");
  }

  function startCreate(userId?: string) {
    setSuccessMessage("");
    resetForm(userId);
  }

  function startEdit(program: Program) {
    setEditingProgramId(program.id);
    setSuccessMessage("");
    setErrorMessage("");
    setForm({
      userId: program.userId,
      weekNumber: String(program.weekNumber),
      title: program.title,
      description: program.description,
      activities: program.activities.length ? program.activities.map(fromActivity) : [createBlankActivity()],
    });
  }

  function updateActivityField(index: number, field: keyof ProgramActivityForm, value: string) {
    setForm((current) => ({
      ...current,
      activities: current.activities.map((activity, activityIndex) =>
        activityIndex === index ? { ...activity, [field]: value } : activity
      ),
    }));
  }

  function addActivityRow() {
    setForm((current) => ({
      ...current,
      activities: [...current.activities, createBlankActivity()],
    }));
  }

  function removeActivityRow(index: number) {
    setForm((current) => ({
      ...current,
      activities:
        current.activities.length === 1
          ? [createBlankActivity()]
          : current.activities.filter((_, activityIndex) => activityIndex !== index),
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const weekNumber = Number(form.weekNumber);
    const activities = form.activities.map(toActivity).filter((item): item is DayActivity => item !== null);

    if (!form.userId) {
      setErrorMessage("Select a client before saving a program.");
      return;
    }

    if (!form.title.trim()) {
      setErrorMessage("Program title is required.");
      return;
    }

    if (!Number.isFinite(weekNumber) || weekNumber < 1) {
      setErrorMessage("Week number must be 1 or higher.");
      return;
    }

    if (!activities.length) {
      setErrorMessage("Add at least one exercise or activity to the program.");
      return;
    }

    const payload: Program = {
      id: editingProgramId ?? `program_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId: form.userId,
      weekNumber,
      title: form.title.trim(),
      description: form.description.trim(),
      activities,
      createdAt: editingProgramId
        ? programs.find((program) => program.id === editingProgramId)?.createdAt ?? new Date().toISOString()
        : new Date().toISOString(),
    };

    if (editingProgramId) {
      updateItem<Program>("ishow_programs", editingProgramId, payload);
      setSuccessMessage("Program updated successfully.");
    } else {
      addItem<Program>("ishow_programs", payload);
      setSuccessMessage("Program created successfully.");
    }

    loadData();
    resetForm(payload.userId);
  }

  function handleDelete(program: Program) {
    const confirmed = window.confirm(`Delete ${program.title} for ${customerById[program.userId]?.name ?? "this client"}?`);
    if (!confirmed) return;

    deleteItem("ishow_programs", program.id);
    setSuccessMessage("Program deleted.");
    if (editingProgramId === program.id) resetForm(program.userId);
    loadData();
  }

  return (
    <DashboardLayout role="TRAINER">
      <div className="w-full max-w-7xl p-6 lg:p-8">
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Programs</h1>
            <p className="mt-1 text-gray-500">Create, update, and remove weekly customer programs from one place.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
              <Users className="h-4 w-4 text-gray-400" />
              <select
                value={clientFilter}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setClientFilter(nextValue);
                  if (!editingProgramId) {
                    setForm((current) => ({
                      ...current,
                      userId: nextValue === "all" ? customers[0]?.id ?? "" : nextValue,
                    }));
                  }
                }}
                className="bg-transparent font-medium text-gray-900 outline-none"
              >
                <option value="all">All clients</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => startCreate()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-900"
            >
              <Plus className="h-4 w-4" />
              New Program
            </button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            { label: "Program Weeks", value: visiblePrograms.length, icon: Layers, tone: "bg-gray-900 text-white" },
            { label: "Visible Clients", value: clientFilter === "all" ? customers.length : visibleCustomers.length, icon: Users, tone: "bg-blue-700 text-white" },
            { label: "Activities", value: activityCount, icon: Dumbbell, tone: "bg-orange-500 text-white" },
            { label: "Current Week", value: currentWeek, icon: Target, tone: "bg-green-600 text-white" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`${card.tone} rounded-2xl p-5`}>
                <Icon className="mb-2 h-5 w-5 opacity-80" />
                <p className="text-3xl font-black">{card.value}</p>
                <p className="mt-0.5 text-sm font-medium opacity-75">{card.label}</p>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="mb-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">
                {editingProgramId ? "Edit Program" : "Create Program"}
              </p>
              <h2 className="text-xl font-black text-gray-900">
                {editingProgramId ? "Update a customer program" : "Build a new customer program"}
              </h2>
            </div>

            {editingProgramId ? (
              <button
                type="button"
                onClick={() => resetForm()}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                Cancel Edit
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm font-semibold text-gray-700">
              Client
              <select
                value={form.userId}
                onChange={(event) => setForm((current) => ({ ...current, userId: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500"
              >
                <option value="">Select client</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold text-gray-700">
              Week Number
              <input
                type="number"
                min="1"
                value={form.weekNumber}
                onChange={(event) => setForm((current) => ({ ...current, weekNumber: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500"
              />
            </label>

            <label className="text-sm font-semibold text-gray-700 md:col-span-2">
              Program Title
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Example: Strength Rebuild Week"
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500"
              />
            </label>
          </div>

          <label className="mt-4 block text-sm font-semibold text-gray-700">
            Program Description
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={3}
              placeholder="Describe the focus of this week and what the client should prioritize."
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500"
            />
          </label>

          <div className="mt-6 rounded-3xl border border-gray-100 bg-gray-50 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-gray-900">Activities</p>
                <p className="text-xs text-gray-500">Add exercises, conditioning blocks, or recovery work for the week.</p>
              </div>

              <button
                type="button"
                onClick={addActivityRow}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-100"
              >
                <Plus className="h-4 w-4" />
                Add Activity
              </button>
            </div>

            <div className="space-y-4">
              {form.activities.map((activity, index) => (
                <div key={`${activity.day}-${index}`} className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900">Activity {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeActivityRow(index)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-6">
                    <select
                      value={activity.day}
                      onChange={(event) => updateActivityField(index, "day", event.target.value)}
                      className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500"
                    >
                      {DAYS.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={activity.exercise}
                      onChange={(event) => updateActivityField(index, "exercise", event.target.value)}
                      placeholder="Exercise"
                      className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 lg:col-span-2"
                    />

                    <input
                      type="number"
                      min="0"
                      value={activity.sets}
                      onChange={(event) => updateActivityField(index, "sets", event.target.value)}
                      placeholder="Sets"
                      className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500"
                    />

                    <input
                      type="text"
                      value={activity.reps}
                      onChange={(event) => updateActivityField(index, "reps", event.target.value)}
                      placeholder="Reps"
                      className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500"
                    />

                    <input
                      type="text"
                      value={activity.duration}
                      onChange={(event) => updateActivityField(index, "duration", event.target.value)}
                      placeholder="Duration"
                      className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500"
                    />
                  </div>

                  <textarea
                    value={activity.notes}
                    onChange={(event) => updateActivityField(index, "notes", event.target.value)}
                    rows={2}
                    placeholder="Optional notes or coaching cue"
                    className="mt-3 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {successMessage}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-orange-600"
            >
              <Save className="h-4 w-4" />
              {editingProgramId ? "Save Changes" : "Create Program"}
            </button>

            <button
              type="button"
              onClick={() => resetForm()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              Reset Form
            </button>
          </div>
        </form>

        <div className="space-y-6">
          {visibleCustomers.map((customer) => {
            const customerPrograms = visiblePrograms.filter((program) => program.userId === customer.id);

            return (
              <section key={customer.id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">Client Programs</p>
                    <h2 className="text-xl font-black text-gray-900">{customer.name}</h2>
                    <p className="mt-1 text-sm text-gray-500">{customer.email} · {customerPrograms.length} program week{customerPrograms.length === 1 ? "" : "s"}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => startCreate(customer.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add Program For {customer.name.split(" ")[0]}
                  </button>
                </div>

                {customerPrograms.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-sm text-gray-500">
                    No program assigned yet. Use the button above to create the first training week.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customerPrograms.map((program) => {
                      const activeDays = Array.from(new Set(program.activities.map((activity) => activity.day)));
                      const previewActivities = program.activities.slice(0, 4);

                      return (
                        <article key={program.id} className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
                          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                            <div>
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                                  <Calendar className="h-3.5 w-3.5" />
                                  Week {program.weekNumber}
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                                  <Users className="h-3.5 w-3.5" />
                                  {activeDays.length} training days
                                </span>
                              </div>
                              <h3 className="text-lg font-black text-gray-900">{program.title}</h3>
                              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-gray-600">{program.description}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(program)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(program)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </div>

                          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-2xl border border-white bg-white px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Created</p>
                              <p className="mt-2 text-sm font-semibold text-gray-900">{formatDate(program.createdAt)}</p>
                            </div>
                            <div className="rounded-2xl border border-white bg-white px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Activities</p>
                              <p className="mt-2 text-sm font-semibold text-gray-900">{program.activities.length} total items</p>
                            </div>
                            <div className="rounded-2xl border border-white bg-white px-4 py-3 sm:col-span-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Days Covered</p>
                              <p className="mt-2 text-sm font-semibold text-gray-900">{activeDays.join(", ")}</p>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white bg-white p-4">
                            <p className="mb-3 text-sm font-semibold text-gray-900">Activity Preview</p>
                            <div className="space-y-2">
                              {previewActivities.map((activity, index) => (
                                <div key={`${activity.day}-${activity.exercise}-${index}`} className="flex items-start gap-3 text-sm text-gray-600">
                                  <Dumbbell className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                                  <div>
                                    <span className="font-medium text-gray-900">{activity.day}:</span> {activity.exercise}
                                    {activity.sets && activity.reps ? ` · ${activity.sets} x ${activity.reps}` : ""}
                                    {activity.duration ? ` · ${activity.duration}` : ""}
                                    {activity.notes ? ` · ${activity.notes}` : ""}
                                  </div>
                                </div>
                              ))}
                              {program.activities.length > previewActivities.length ? (
                                <p className="pt-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                                  +{program.activities.length - previewActivities.length} more items
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function TrainerProgramsPage() {
  return (
    <Suspense fallback={<DashboardLayout role="TRAINER"><div className="w-full max-w-7xl p-6 lg:p-8" /></DashboardLayout>}>
      <TrainerProgramsContent />
    </Suspense>
  );
}