"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { listAssessments, reviewAssessment, type Assessment } from "@/lib/db/assessments";
import { listCustomers, updateProfile, type Profile } from "@/lib/db/profiles";
import { listSessions, createSession, updateSession, type TrainingSession } from "@/lib/db/sessions";
import { createClient } from "@/lib/supabase/client";
import { notify } from "@/lib/email/notify";
import {
  CheckCircle, Clock, ChevronDown, ChevronUp, CalendarDays, MapPin,
  Mail, Phone, UserCheck, Calendar, Pencil, X, Loader2, RefreshCw,
} from "lucide-react";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtLong(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

type Filter = "all" | "pending" | "reviewed";

type ScheduleForm = {
  title: string;
  date: string;
  time: string;
  duration: string;
  notes: string;
};

function blankSchedule(a: Assessment, clientName: string): ScheduleForm {
  return {
    title: `Session – ${clientName}`,
    date: a.preferredDate ?? "",
    time: a.preferredTimeSlot ?? "",
    duration: "60",
    notes: "",
  };
}

const TIME_SLOTS = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM",
];

export default function AdminAssessmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Notes editing
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Session scheduling
  const [schedulingId, setSchedulingId] = useState<string | null>(null); // assessmentId
  const [rescheduleSessionId, setRescheduleSessionId] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({ title: "", date: "", time: "", duration: "60", notes: "" });
  const [savingSession, setSavingSession] = useState(false);
  const [sessionError, setSessionError] = useState("");

  // Actions
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const loadData = async () => {
    const [a, c, s] = await Promise.all([listAssessments(), listCustomers(), listSessions()]);
    setAssessments(a);
    setCustomers(c);
    setSessions(s);
  };

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    const init = async () => {
      if (!loading && user) {
        if (user.role !== 'admin') { router.push('/trainer/dashboard'); return; }
        await loadData();
      }
    };
    init();
  }, [loading, router, user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !user) return null;

  const customerById = Object.fromEntries(customers.map(c => [c.id, c]));
  const sessionByUserId: Record<string, TrainingSession[]> = {};
  for (const s of sessions) {
    if (!sessionByUserId[s.userId]) sessionByUserId[s.userId] = [];
    sessionByUserId[s.userId].push(s);
  }

  const pending = assessments.filter(a => a.status === "pending").length;
  const reviewed = assessments.filter(a => a.status === "reviewed").length;
  const filtered = filter === "all" ? assessments : assessments.filter(a => a.status === filter);

  function openSchedule(assessment: Assessment, existingSession?: TrainingSession) {
    const name = customerById[assessment.userId]?.name ?? "Client";
    if (existingSession) {
      setRescheduleSessionId(existingSession.id);
      setScheduleForm({
        title: existingSession.title,
        date: existingSession.scheduledDate,
        time: existingSession.scheduledTime,
        duration: String(existingSession.duration),
        notes: existingSession.notes ?? "",
      });
    } else {
      setRescheduleSessionId(null);
      setScheduleForm(blankSchedule(assessment, name));
    }
    setSchedulingId(assessment.id);
    setSessionError("");
  }

  function closeSchedule() {
    setSchedulingId(null);
    setRescheduleSessionId(null);
    setSessionError("");
  }

  async function handleSaveSession(assessment: Assessment) {
    if (!scheduleForm.date || !scheduleForm.time || !scheduleForm.title) {
      setSessionError("Title, date and time are required.");
      return;
    }
    setSavingSession(true);
    setSessionError("");
    try {
      const client = customerById[assessment.userId];
      const emailData = {
        name: client?.name ?? 'there',
        title: scheduleForm.title,
        date: new Date(scheduleForm.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        time: scheduleForm.time,
        duration: scheduleForm.duration,
        notes: scheduleForm.notes || undefined,
        location: assessment.preferredLocation,
      };

      if (rescheduleSessionId) {
        const existing = sessions.find(s => s.id === rescheduleSessionId);
        await updateSession(rescheduleSessionId, {
          title: scheduleForm.title,
          scheduledDate: scheduleForm.date,
          scheduledTime: scheduleForm.time,
          duration: parseInt(scheduleForm.duration) || 60,
          notes: scheduleForm.notes || undefined,
        });
        if (client?.email) {
          notify('session-rescheduled', client.email, {
            ...emailData,
            oldDate: existing ? new Date(existing.scheduledDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
            oldTime: existing?.scheduledTime,
          });
        }
      } else {
        await createSession({
          userId: assessment.userId,
          trainerId: user!.id,
          title: scheduleForm.title,
          scheduledDate: scheduleForm.date,
          scheduledTime: scheduleForm.time,
          duration: parseInt(scheduleForm.duration) || 60,
          status: "scheduled",
          notes: scheduleForm.notes || undefined,
        });
        if (client?.email) notify('session-scheduled', client.email, emailData);
      }
      closeSchedule();
      await loadData();
    } catch {
      setSessionError("Failed to save session. Please try again.");
    } finally {
      setSavingSession(false);
    }
  }

  async function handleSaveNotes(assessmentId: string) {
    setSavingNotes(true);
    const supabase = createClient();
    await supabase.from("assessments").update({ trainer_notes: notesText }).eq("id", assessmentId);
    setSavingNotes(false);
    setEditingNotesId(null);
    await loadData();
  }

  async function handleMarkReviewed(assessmentId: string) {
    const a = assessments.find(x => x.id === assessmentId);
    await reviewAssessment(assessmentId, a?.trainerNotes ?? "", "reviewed");
    const client = customerById[a?.userId ?? ''];
    if (client?.email) {
      notify('assessment-reviewed', client.email, {
        name: client.name,
        notes: a?.trainerNotes || undefined,
      });
    }
    await loadData();
  }

  async function handleConvert(customerId: string, assessmentId: string) {
    setConvertingId(customerId);
    const a = assessments.find(x => x.id === assessmentId);
    await Promise.all([
      updateProfile(customerId, { customerStatus: "client" }),
      reviewAssessment(assessmentId, a?.trainerNotes ?? "", "reviewed"),
    ]);
    const client = customerById[customerId];
    if (client?.email) {
      notify('assessment-reviewed', client.email, {
        name: client.name,
        notes: a?.trainerNotes || undefined,
      });
    }
    setConvertingId(null);
    await loadData();
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="min-h-full bg-zinc-950">
        <div className="max-w-5xl p-6 lg:p-8">

          {/* Header */}
          <div className="mb-8">
            <p className="text-violet-400 text-xs font-bold tracking-[0.3em] uppercase mb-1.5">Admin</p>
            <h1 className="text-3xl font-black text-white tracking-tight">Assessment Requests</h1>
            <p className="text-zinc-500 mt-2 text-sm">Review, schedule sessions, and convert clients.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-7">
            {[
              { label: "Total", value: assessments.length, accent: "bg-zinc-500", light: "text-zinc-300 bg-zinc-800 border-zinc-700" },
              { label: "Pending", value: pending, accent: "bg-orange-500", light: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
              { label: "Reviewed", value: reviewed, accent: "bg-green-500", light: "text-green-400 bg-green-500/10 border-green-500/20" },
            ].map(({ label, value, accent, light }) => (
              <div key={label} className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent}`} />
                <p className={`text-2xl font-black ${light.split(' ')[0]}`}>{value}</p>
                <p className="text-zinc-500 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            {(["all", "pending", "reviewed"] as Filter[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors capitalize ${
                  filter === f
                    ? "bg-violet-600 text-white"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <p className="text-zinc-600 text-center py-12 text-sm">No assessments to show.</p>
            )}

            {filtered.map(assessment => {
              const expanded = expandedId === assessment.id;
              const client = customerById[assessment.userId];
              const name = client?.name ?? "Unknown";
              const userSessions = sessionByUserId[assessment.userId] ?? [];
              const scheduledSession = userSessions.find(s => s.status === "scheduled");
              const isSchedulingThis = schedulingId === assessment.id;
              const isConverted = client?.customerStatus === "client";

              return (
                <div key={assessment.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                  {/* Row header */}
                  <button
                    onClick={() => setExpandedId(expanded ? null : assessment.id)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-orange-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                        {name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white">{name}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-0.5">
                          <p className="text-xs text-zinc-500">Submitted {fmt(assessment.submittedAt)}</p>
                          {assessment.preferredDate && (
                            <span className="inline-flex items-center gap-1 text-xs text-blue-400 font-medium">
                              <CalendarDays className="w-3 h-3" />
                              {new Date(assessment.preferredDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              {assessment.preferredTimeSlot && ` · ${assessment.preferredTimeSlot}`}
                            </span>
                          )}
                          {(assessment.preferredLocation) && (
                            <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                              <MapPin className="w-3 h-3" />{assessment.preferredLocation}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isConverted && (
                        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/20 px-2.5 py-1 text-[10px] font-bold text-green-400">
                          <CheckCircle className="w-3 h-3" /> Client
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                        assessment.status === "pending"
                          ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                          : "bg-green-500/10 border-green-500/20 text-green-400"
                      }`}>
                        {assessment.status === "pending" ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {assessment.status === "pending" ? "Pending" : "Reviewed"}
                      </span>
                      {expanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {expanded && (
                    <div className="border-t border-zinc-800 p-5 space-y-5">

                      {/* Contact + Appointment */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/60 p-4">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3">Client Contact</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                              <Mail className="w-4 h-4 text-zinc-500 shrink-0" />{client?.email ?? "—"}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                              <Phone className="w-4 h-4 text-zinc-500 shrink-0" />{client?.phone ?? "—"}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-blue-500/20 bg-blue-500/8 p-4">
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-3">Requested Appointment</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                              <CalendarDays className="w-4 h-4 text-blue-400 shrink-0" />
                              {assessment.preferredDate ? fmtLong(assessment.preferredDate) : <span className="text-zinc-600">No date selected</span>}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                              {assessment.preferredTimeSlot ?? <span className="text-zinc-600">No time selected</span>}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                              {assessment.preferredLocation ?? <span className="text-zinc-600">No location selected</span>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Existing session status */}
                      {scheduledSession && (
                        <div className="rounded-xl border border-orange-500/20 bg-orange-500/8 p-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-orange-400 shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-white">{scheduledSession.title}</p>
                              <p className="text-xs text-zinc-400 mt-0.5">
                                {new Date(scheduledSession.scheduledDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                {" · "}{scheduledSession.scheduledTime} · {scheduledSession.duration} min
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold rounded-full bg-orange-500/20 border border-orange-500/30 px-2 py-1 text-orange-300">Scheduled</span>
                        </div>
                      )}

                      {/* Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { label: "Age", value: assessment.age ? `${assessment.age} yrs` : "—" },
                          { label: "Gender", value: assessment.gender ?? "—" },
                          { label: "Weight", value: assessment.weight ?? "—" },
                          { label: "Height", value: assessment.height ?? "—" },
                          { label: "Experience", value: assessment.experienceLevel ?? "—" },
                          { label: "Days/week", value: assessment.daysPerWeek ? `${assessment.daysPerWeek}x` : "—" },
                        ].map(({ label, value }) => (
                          <div key={label} className="rounded-xl bg-zinc-800/60 border border-zinc-700/50 p-3">
                            <p className="text-[10px] text-zinc-500 mb-0.5">{label}</p>
                            <p className="text-sm font-semibold text-white capitalize">{value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Goals */}
                      {assessment.goals.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Goals</p>
                          <div className="flex flex-wrap gap-2">
                            {assessment.goals.map(g => (
                              <span key={g} className="rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium px-3 py-1 capitalize">
                                {g.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Health conditions */}
                      {assessment.healthConditions && (
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Health / Injuries</p>
                          <p className="text-sm text-zinc-400">{assessment.healthConditions}</p>
                        </div>
                      )}

                      {/* Trainer notes */}
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Trainer Notes</p>
                        {editingNotesId === assessment.id ? (
                          <div>
                            <textarea
                              value={notesText}
                              onChange={e => setNotesText(e.target.value)}
                              rows={3}
                              placeholder="Add notes for this client…"
                              className="w-full rounded-xl bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500/60 resize-none transition"
                            />
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => setEditingNotesId(null)}
                                className="text-xs text-zinc-500 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-700 transition-colors"
                              >Cancel</button>
                              <button onClick={() => handleSaveNotes(assessment.id)} disabled={savingNotes}
                                className="text-xs text-white bg-orange-500 hover:bg-orange-400 disabled:opacity-50 px-3 py-1.5 rounded-lg font-bold transition-colors"
                              >
                                {savingNotes ? "Saving…" : "Save Notes"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => { setEditingNotesId(assessment.id); setNotesText(assessment.trainerNotes ?? ""); }}
                            className="min-h-[48px] rounded-xl border border-dashed border-zinc-700 px-4 py-3 text-sm text-zinc-500 cursor-pointer hover:border-orange-500/40 hover:text-zinc-300 transition-colors flex items-center gap-2"
                          >
                            <Pencil className="w-3.5 h-3.5 shrink-0" />
                            {assessment.trainerNotes || "Click to add notes…"}
                          </div>
                        )}
                      </div>

                      {/* Schedule session inline form */}
                      {isSchedulingThis && (
                        <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-white">
                              {rescheduleSessionId ? "Reschedule Session" : "Schedule Session"}
                            </p>
                            <button onClick={closeSchedule} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-zinc-500 mb-1">Title</label>
                              <input
                                type="text" value={scheduleForm.title}
                                onChange={e => setScheduleForm(f => ({ ...f, title: e.target.value }))}
                                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/60 transition"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-zinc-500 mb-1">Date</label>
                              <input
                                type="date" value={scheduleForm.date}
                                min={new Date().toISOString().split("T")[0]}
                                onChange={e => setScheduleForm(f => ({ ...f, date: e.target.value }))}
                                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/60 transition"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-zinc-500 mb-1">Duration (min)</label>
                              <input
                                type="number" value={scheduleForm.duration} min="15" step="15"
                                onChange={e => setScheduleForm(f => ({ ...f, duration: e.target.value }))}
                                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/60 transition"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-zinc-500 mb-2">Time</label>
                              <div className="flex flex-wrap gap-1.5">
                                {TIME_SLOTS.map(slot => (
                                  <button key={slot} type="button"
                                    onClick={() => setScheduleForm(f => ({ ...f, time: slot }))}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                                      scheduleForm.time === slot
                                        ? "border-orange-500/60 bg-orange-500/15 text-orange-300"
                                        : "border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                                    }`}
                                  >{slot}</button>
                                ))}
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-zinc-500 mb-1">Notes (optional)</label>
                              <input
                                type="text" value={scheduleForm.notes} placeholder="Any notes for the session…"
                                onChange={e => setScheduleForm(f => ({ ...f, notes: e.target.value }))}
                                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500/60 transition"
                              />
                            </div>
                          </div>
                          {sessionError && <p className="text-xs text-red-400">{sessionError}</p>}
                          <button
                            onClick={() => handleSaveSession(assessment)} disabled={savingSession}
                            className="flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 px-5 py-2.5 text-sm font-bold text-white transition-colors shadow-lg shadow-orange-500/20"
                          >
                            {savingSession
                              ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                              : <><Calendar className="w-4 h-4" />{rescheduleSessionId ? "Update Session" : "Confirm Session"}</>
                            }
                          </button>
                        </div>
                      )}

                      {/* Actions row */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {/* Schedule / Reschedule */}
                        {!isSchedulingThis && (
                          scheduledSession ? (
                            <button
                              onClick={() => openSchedule(assessment, scheduledSession)}
                              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" /> Reschedule
                            </button>
                          ) : (
                            <button
                              onClick={() => openSchedule(assessment)}
                              className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-300 transition-colors"
                            >
                              <Calendar className="w-4 h-4" /> Schedule Session
                            </button>
                          )
                        )}

                        {/* Mark reviewed */}
                        {assessment.status === "pending" && (
                          <button
                            onClick={() => handleMarkReviewed(assessment.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-300 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" /> Mark Reviewed
                          </button>
                        )}

                        {/* Convert to client */}
                        {!isConverted && (
                          <button
                            onClick={() => handleConvert(assessment.userId, assessment.id)}
                            disabled={convertingId === assessment.userId}
                            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-4 py-2 text-sm font-bold text-white transition-colors shadow-lg shadow-violet-500/20"
                          >
                            {convertingId === assessment.userId
                              ? <><Loader2 className="w-4 h-4 animate-spin" />Converting…</>
                              : <><UserCheck className="w-4 h-4" />Convert to Client</>
                            }
                          </button>
                        )}

                        {isConverted && (
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-2 text-sm font-semibold text-green-400">
                            <CheckCircle className="w-4 h-4" /> Converted to Client
                          </span>
                        )}

                        {assessment.reviewedAt && (
                          <span className="text-xs text-zinc-600 flex items-center gap-1 ml-auto">
                            Reviewed {fmt(assessment.reviewedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
