"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { listCustomers, type Profile } from "@/lib/db/profiles";
import { listAssessments, type Assessment } from "@/lib/db/assessments";
import {
  listPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  duplicateProgramToNextWeek,
  type Program,
  type ProgramActivity,
} from "@/lib/db/programs";
import {
  Calendar,
  Copy,
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
  exerciseName: string;
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
  return { day: "Monday", exerciseName: "", sets: "", reps: "", duration: "", notes: "" };
}

function createBlankForm(userId = ""): ProgramFormState {
  return { userId, weekNumber: "1", title: "", description: "", activities: [createBlankActivity()] };
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function toActivityPayload(activity: ProgramActivityForm): Omit<ProgramActivity, "id" | "programId"> | null {
  const name = activity.exerciseName.trim();
  if (!name) return null;
  const parsedSets = activity.sets.trim() ? Number(activity.sets.trim()) : undefined;
  return {
    day: activity.day,
    exerciseName: name,
    sets: Number.isFinite(parsedSets) ? parsedSets : undefined,
    reps: activity.reps.trim() || undefined,
    duration: activity.duration.trim() || undefined,
    notes: activity.notes.trim() || undefined,
    sortOrder: 0,
  };
}

function fromActivity(activity: ProgramActivity): ProgramActivityForm {
  return {
    day: activity.day,
    exerciseName: activity.exerciseName,
    sets: activity.sets ? String(activity.sets) : "",
    reps: activity.reps ?? "",
    duration: activity.duration ?? "",
    notes: activity.notes ?? "",
  };
}

function ClientCombobox({
  value,
  onChange,
  customers,
  includeAll = false,
  className,
}: {
  value: string;
  onChange: (id: string) => void;
  customers: Profile[];
  includeAll?: boolean;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const allOptions = includeAll ? [{ id: "all", name: "All clients" }, ...customers] : customers;
  const filtered = query ? allOptions.filter((o) => o.name.toLowerCase().includes(query.toLowerCase())) : allOptions;
  const displayValue = open ? query : value === "all" ? "All clients" : customers.find((c) => c.id === value)?.name ?? "";

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <input
        type="text"
        value={displayValue}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={includeAll ? "All clients" : "Select client"}
        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-blue-500"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-lg">
          {filtered.map((option) => (
            <li
              key={option.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(option.id); setQuery(""); setOpen(false); }}
              className={`cursor-pointer px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 ${
                option.id === value ? "bg-blue-50 text-blue-700" : "text-gray-900"
              }`}
            >
              {option.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TrainerProgramsContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = searchParams.get("client") ?? "all";

  const [programs, setPrograms] = useState<Program[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [clientFilter, setClientFilter] = useState("all");
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [form, setForm] = useState<ProgramFormState>(createBlankForm());
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadData = async () => {
    const [nextCustomers, nextPrograms, nextAssessments] = await Promise.all([
      listCustomers(),
      listPrograms(),
      listAssessments(),
    ]);
    const sorted = nextCustomers.sort((a, b) => a.name.localeCompare(b.name));
    const customerNameById = Object.fromEntries(sorted.map((c) => [c.id, c.name]));
    const sortedPrograms = [...nextPrograms].sort((l, r) => {
      const nc = (customerNameById[l.userId] ?? "").localeCompare(customerNameById[r.userId] ?? "");
      if (nc !== 0) return nc;
      if (r.weekNumber !== l.weekNumber) return r.weekNumber - l.weekNumber;
      return r.createdAt.localeCompare(l.createdAt);
    });
    setCustomers(sorted);
    setPrograms(sortedPrograms);
    setAssessments(nextAssessments);
  };

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    const init = async () => {
      if (!loading && user) {
        if (user.role === 'customer') { router.push('/dashboard'); return; }
        if (user.role === 'admin') { router.push('/admin/dashboard'); return; }
        await loadData();
      }
    };
    init();
  }, [loading, router, user]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const customerById = Object.fromEntries(customers.map((c) => [c.id, c]));
  const visiblePrograms = programs.filter((p) => clientFilter === "all" || p.userId === clientFilter);
  const visibleCustomers = clientFilter === "all" ? customers : customers.filter((c) => c.id === clientFilter);
  const activityCount = visiblePrograms.reduce((t, p) => t + (p.activities?.length ?? 0), 0);
  const currentWeek = visiblePrograms.reduce((h, p) => Math.max(h, p.weekNumber), 0);
  const assessmentByUserId = Object.fromEntries(assessments.map((a) => [a.userId, a]));
  const selectedClientAssessment = form.userId ? assessmentByUserId[form.userId] : undefined;
  const assessmentBlocked = !editingProgramId && form.userId && (!selectedClientAssessment || selectedClientAssessment.status !== "reviewed");

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
      activities: program.activities?.length ? program.activities.map(fromActivity) : [createBlankActivity()],
    });
  }

  function updateActivityField(index: number, field: keyof ProgramActivityForm, value: string) {
    setForm((current) => ({
      ...current,
      activities: current.activities.map((act, i) => i === index ? { ...act, [field]: value } : act),
    }));
  }

  function addActivityRow() {
    setForm((current) => ({ ...current, activities: [...current.activities, createBlankActivity()] }));
  }

  function removeActivityRow(index: number) {
    setForm((current) => ({
      ...current,
      activities: current.activities.length === 1
        ? [createBlankActivity()]
        : current.activities.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const weekNumber = Number(form.weekNumber);
    const activities = form.activities.map(toActivityPayload).filter((a) => a !== null) as Omit<ProgramActivity, "id" | "programId">[];

    if (!form.userId) { setErrorMessage("Select a client before saving a program."); return; }
    if (!form.title.trim()) { setErrorMessage("Program title is required."); return; }
    if (!Number.isFinite(weekNumber) || weekNumber < 1) { setErrorMessage("Week number must be 1 or higher."); return; }
    if (!activities.length) { setErrorMessage("Add at least one exercise or activity to the program."); return; }

    if (editingProgramId) {
      await updateProgram(editingProgramId, {
        weekNumber,
        title: form.title.trim(),
        description: form.description.trim(),
      }, activities);
      setSuccessMessage("Program updated successfully.");
    } else {
      await createProgram({
        userId: form.userId,
        trainerId: user?.id,
        weekNumber,
        title: form.title.trim(),
        description: form.description.trim(),
      }, activities);
      setSuccessMessage("Program created successfully.");
    }
    await loadData();
    resetForm(form.userId);
  }

  async function handleDelete(program: Program) {
    const confirmed = window.confirm(`Delete "${program.title}" for ${customerById[program.userId]?.name ?? "this client"}?`);
    if (!confirmed) return;
    await deleteProgram(program.id);
    setSuccessMessage("Program deleted.");
    if (editingProgramId === program.id) resetForm(program.userId);
    await loadData();
  }

  async function handleDuplicate(program: Program) {
    await duplicateProgramToNextWeek(program.id);
    setSuccessMessage(`Duplicated Week ${program.weekNumber} → Week ${program.weekNumber + 1}.`);
    await loadData();
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
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <ClientCombobox
                value={clientFilter}
                onChange={(nextValue) => {
                  setClientFilter(nextValue);
                  if (!editingProgramId) {
                    setForm((current) => ({
                      ...current,
                      userId: nextValue === "all" ? customers[0]?.id ?? "" : nextValue,
                    }));
                  }
                }}
                customers={customers}
                includeAll
                className="min-w-[160px]"
              />
            </div>

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

            {editingProgramId && (
              <button
                type="button"
                onClick={() => resetForm()}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="text-sm font-semibold text-gray-700">
              Client
              <ClientCombobox
                value={form.userId}
                onChange={(id) => setForm((current) => ({ ...current, userId: id }))}
                customers={customers}
                className="mt-1"
              />
            </div>

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
                      {DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
                    </select>

                    <input
                      type="text"
                      value={activity.exerciseName}
                      onChange={(event) => updateActivityField(index, "exerciseName", event.target.value)}
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

          {errorMessage && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          {assessmentBlocked && (
            <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700">
              <strong>Assessment not reviewed.</strong> The selected client&apos;s assessment must be marked as reviewed before setting up a program. Go to the Assessments page to review it first.
            </div>
          )}

          {successMessage && (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {successMessage}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={!!assessmentBlocked}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
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
            const customerPrograms = visiblePrograms.filter((p) => p.userId === customer.id);

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
                      const activeDays = Array.from(new Set((program.activities ?? []).map((a) => a.day)));
                      const previewActivities = (program.activities ?? []).slice(0, 4);

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
                                onClick={() => handleDuplicate(program)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                                title={`Duplicate as Week ${program.weekNumber + 1}`}
                              >
                                <Copy className="h-4 w-4" />
                                Duplicate
                              </button>
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
                              <p className="mt-2 text-sm font-semibold text-gray-900">{program.activities?.length ?? 0} total items</p>
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
                                <div key={`${activity.day}-${activity.exerciseName}-${index}`} className="flex items-start gap-3 text-sm text-gray-600">
                                  <Dumbbell className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                                  <div>
                                    <span className="font-medium text-gray-900">{activity.day}:</span> {activity.exerciseName}
                                    {activity.sets && activity.reps ? ` · ${activity.sets} × ${activity.reps}` : ""}
                                    {activity.duration ? ` · ${activity.duration}` : ""}
                                    {activity.notes ? ` · ${activity.notes}` : ""}
                                  </div>
                                </div>
                              ))}
                              {(program.activities?.length ?? 0) > previewActivities.length && (
                                <p className="pt-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                                  +{(program.activities?.length ?? 0) - previewActivities.length} more items
                                </p>
                              )}
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
