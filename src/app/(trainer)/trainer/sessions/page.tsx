"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { addItem, deleteItem, getItems, updateItem } from "@/lib/storage";
import type { User } from "@/lib/auth";
import type { Session } from "@/lib/mockData";
import {
  Calendar,
  CheckCircle,
  Clock,
  Dumbbell,
  Filter,
  Pencil,
  Plus,
  Save,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";

type SessionFilter = "all" | "scheduled" | "completed" | "cancelled";

type SessionFormState = {
  userId: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  status: Session["status"];
  notes: string;
};

const statusStyles = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function createBlankSessionForm(userId = ""): SessionFormState {
  return {
    userId,
    title: "",
    date: new Date().toISOString().split("T")[0],
    time: "07:00",
    duration: "60",
    status: "scheduled",
    notes: "",
  };
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TrainerSessionsContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = searchParams.get("client") ?? "all";

  const [sessions, setSessions] = useState<Session[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [filter, setFilter] = useState<SessionFilter>("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [form, setForm] = useState<SessionFormState>(createBlankSessionForm());
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function loadData() {
    const nextCustomers = getItems<User>("ishow_users")
      .filter((item) => item.role === "customer")
      .sort((left, right) => left.name.localeCompare(right.name));

    const customerNameById = Object.fromEntries(nextCustomers.map((customer) => [customer.id, customer.name]));

    const nextSessions = getItems<Session>("ishow_sessions").sort((left, right) => {
      const nameCompare = (customerNameById[left.userId] ?? "").localeCompare(customerNameById[right.userId] ?? "");
      if (nameCompare !== 0) return nameCompare;
      return (right.date + right.time).localeCompare(left.date + left.time);
    });

    setCustomers(nextCustomers);
    setSessions(nextSessions);
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
    if (!customers.length || editingSessionId) return;

    setForm((current) => {
      if (current.userId) return current;
      const defaultUserId = clientFilter === "all" ? customers[0]?.id ?? "" : clientFilter;
      return { ...current, userId: defaultUserId };
    });
  }, [clientFilter, customers, editingSessionId]);

  if (loading || !user) return null;

  const today = new Date().toISOString().split("T")[0];
  const customerById = Object.fromEntries(customers.map((customer) => [customer.id, customer]));
  const clientScopedSessions = sessions.filter((session) => clientFilter === "all" || session.userId === clientFilter);
  const orderedSessions = (filter === "all"
    ? clientScopedSessions
    : clientScopedSessions.filter((session) => session.status === filter)
  ).sort((left, right) => {
    if (left.status === "scheduled" && right.status !== "scheduled") return -1;
    if (right.status === "scheduled" && left.status !== "scheduled") return 1;
    return (right.date + right.time).localeCompare(left.date + left.time);
  });

  function resetForm(preferredUserId?: string) {
    const fallbackUserId = preferredUserId ?? (clientFilter === "all" ? customers[0]?.id ?? "" : clientFilter);
    setEditingSessionId(null);
    setForm(createBlankSessionForm(fallbackUserId));
    setErrorMessage("");
  }

  function startCreate(userId?: string) {
    setSuccessMessage("");
    resetForm(userId);
  }

  function startEdit(session: Session) {
    setEditingSessionId(session.id);
    setErrorMessage("");
    setSuccessMessage("");
    setForm({
      userId: session.userId,
      title: session.title,
      date: session.date,
      time: session.time,
      duration: String(session.duration),
      status: session.status,
      notes: session.notes ?? "",
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const duration = Number(form.duration);

    if (!form.userId) {
      setErrorMessage("Select a client before saving a session.");
      return;
    }

    if (!form.title.trim()) {
      setErrorMessage("Session title is required.");
      return;
    }

    if (!form.date || !form.time) {
      setErrorMessage("Date and time are required.");
      return;
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      setErrorMessage("Duration must be a positive number of minutes.");
      return;
    }

    const payload: Session = {
      id: editingSessionId ?? `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId: form.userId,
      title: form.title.trim(),
      date: form.date,
      time: form.time,
      duration,
      status: form.status,
      notes: form.notes.trim() || undefined,
      trainerName: user?.name ?? "Trainer",
    };

    if (editingSessionId) {
      updateItem<Session>("ishow_sessions", editingSessionId, payload);
      setSuccessMessage("Session updated successfully.");
    } else {
      addItem<Session>("ishow_sessions", payload);
      setSuccessMessage("Session created successfully.");
    }

    loadData();
    resetForm(payload.userId);
  }

  function handleDelete(session: Session) {
    const confirmed = window.confirm(`Delete ${session.title} for ${customerById[session.userId]?.name ?? "this client"}?`);
    if (!confirmed) return;

    deleteItem("ishow_sessions", session.id);
    setSuccessMessage("Session deleted.");
    if (editingSessionId === session.id) resetForm(session.userId);
    loadData();
  }

  const stats = [
    { label: "Visible Sessions", value: clientScopedSessions.length, icon: Dumbbell, tone: "bg-gray-900 text-white" },
    { label: "Scheduled", value: clientScopedSessions.filter((item) => item.status === "scheduled").length, icon: Calendar, tone: "bg-blue-700 text-white" },
    { label: "Completed", value: clientScopedSessions.filter((item) => item.status === "completed").length, icon: CheckCircle, tone: "bg-green-600 text-white" },
    { label: "Today", value: clientScopedSessions.filter((item) => item.status === "scheduled" && item.date === today).length, icon: Clock, tone: "bg-orange-500 text-white" },
  ];

  return (
    <DashboardLayout role="TRAINER">
      <div className="w-full max-w-7xl p-6 lg:p-8">
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Sessions</h1>
            <p className="mt-1 text-gray-500">Create custom sessions, update their status, and keep every client schedule current.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
              <Users className="h-4 w-4 text-gray-400" />
              <select
                value={clientFilter}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setClientFilter(nextValue);
                  if (!editingSessionId) {
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
              New Session
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {stats.map((card) => {
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

        <div className="mb-5 flex items-center gap-2 flex-wrap">
          <Filter className="mr-1 h-4 w-4 text-gray-400" />
          {(["all", "scheduled", "completed", "cancelled"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all capitalize ${
                filter === item ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {item === "all" ? "All sessions" : item}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mb-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">
                {editingSessionId ? "Edit Session" : "Create Session"}
              </p>
              <h2 className="text-xl font-black text-gray-900">
                {editingSessionId ? "Update a client session" : "Schedule a custom client session"}
              </h2>
            </div>

            {editingSessionId ? (
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

            <label className="text-sm font-semibold text-gray-700 md:col-span-3">
              Session Title
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Example: Lower Body Rebuild"
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500"
              />
            </label>

            <label className="text-sm font-semibold text-gray-700">
              Date
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500"
              />
            </label>

            <label className="text-sm font-semibold text-gray-700">
              Time
              <input
                type="time"
                value={form.time}
                onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500"
              />
            </label>

            <label className="text-sm font-semibold text-gray-700">
              Duration (min)
              <input
                type="number"
                min="15"
                step="5"
                value={form.duration}
                onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500"
              />
            </label>

            <label className="text-sm font-semibold text-gray-700">
              Status
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as Session["status"] }))}
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          </div>

          <label className="mt-4 block text-sm font-semibold text-gray-700">
            Notes
            <textarea
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              rows={3}
              placeholder="Session focus, coaching notes, or completion summary"
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500"
            />
          </label>

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
              {editingSessionId ? "Save Changes" : "Create Session"}
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

        <div className="space-y-4">
          {orderedSessions.map((session) => (
            <div key={session.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-lg font-black text-gray-900">{session.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{customerById[session.userId]?.name ?? "Unknown Client"}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${statusStyles[session.status]}`}>
                    {session.status === "completed" ? <CheckCircle className="h-3.5 w-3.5" /> : null}
                    {session.status === "cancelled" ? <XCircle className="h-3.5 w-3.5" /> : null}
                    {session.status === "scheduled" ? <Clock className="h-3.5 w-3.5" /> : null}
                    {session.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => startEdit(session)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(session)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {formatDate(session.date)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {session.time} · {session.duration} min
                </span>
                <span className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  {session.trainerName}
                </span>
              </div>

              {session.notes ? (
                <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  {session.notes}
                </div>
              ) : null}
            </div>
          ))}

          {!orderedSessions.length ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500">
              No sessions match the current client and status filters.
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function TrainerSessionsPage() {
  return (
    <Suspense fallback={<DashboardLayout role="TRAINER"><div className="w-full max-w-7xl p-6 lg:p-8" /></DashboardLayout>}>
      <TrainerSessionsContent />
    </Suspense>
  );
}