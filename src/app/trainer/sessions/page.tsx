"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { listSessions, createSession, updateSession, type TrainingSession } from "@/lib/db/sessions";
import { listCustomers, type Profile } from "@/lib/db/profiles";
import { notify } from "@/lib/email/notify";
import { Calendar, Loader2, Clock, User, Plus, Pencil, X, CheckCircle } from "lucide-react";

export default function TrainerSessionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [sessionForm, setSessionForm] = useState({
    userId: "",
    title: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
    notes: "",
  });
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
    const [allSessions, allCustomers] = await Promise.all([
      listSessions({ trainerId: user.id }),
      listCustomers()
    ]);
    // For now we show all customers
    setClients(allCustomers);
    setSessions(allSessions.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)));
    setDataLoaded(true);
  };

  const handleSaveSession = async () => {
    setFormError("");
    if (!sessionForm.userId || !sessionForm.title || !sessionForm.scheduledDate || !sessionForm.scheduledTime) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      const client = clients.find(c => c.id === sessionForm.userId);
      const clientName = client?.name || "Client";
      const clientEmail = client?.email || "";

      if (editingSession) {
        await updateSession(editingSession.id, {
          title: sessionForm.title,
          scheduledDate: sessionForm.scheduledDate,
          scheduledTime: sessionForm.scheduledTime,
          duration: sessionForm.duration,
          notes: sessionForm.notes,
        });
        if (clientEmail) {
          await notify("session-rescheduled", clientEmail, {
            clientName,
            sessionTitle: sessionForm.title,
            newDate: sessionForm.scheduledDate,
            newTime: sessionForm.scheduledTime,
          });
        }
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
        if (clientEmail) {
          await notify("session-scheduled", clientEmail, {
            clientName,
            sessionTitle: sessionForm.title,
            sessionDate: sessionForm.scheduledDate,
            sessionTime: sessionForm.scheduledTime,
            duration: String(sessionForm.duration),
            notes: sessionForm.notes || "None",
          });
        }
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setFormError("Failed to save session. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSession = async (sessionId: string, sessionTitle: string, user_id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this session? The client will be notified."
    );
    if (!confirmed) return;
    
    await updateSession(sessionId, { status: "cancelled" });
    
    const client = clients.find(c => c.id === user_id);
    if (client?.email) {
      await notify("session-cancelled", client.email, {
        clientName: client.name || "Client",
        sessionTitle: sessionTitle,
      }).catch(console.error);
    }
    
    await loadData();
  };

  const handleMarkComplete = async (sessionId: string) => {
    await updateSession(sessionId, { status: "completed" });
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

  const upcoming = sessions.filter((s) => s.status === "scheduled");
  const past = sessions.filter((s) => s.status === "completed" || s.status === "cancelled");

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const today = new Date().toISOString().split("T")[0];

  return (
    <DashboardLayout role="trainer">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Sessions</h1>
              <p className="text-gray-500 text-sm">All client sessions</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingSession(null);
              setSessionForm({
                userId: "",
                title: "",
                scheduledDate: "",
                scheduledTime: "",
                duration: 60,
                notes: "",
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-400 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Session
          </button>
        </div>

        {/* Upcoming */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-gray-700 mb-3">Upcoming ({upcoming.length})</h2>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map((s) => (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{s.title}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(s.scheduledDate)} · {s.scheduledTime} · {s.duration} min
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3" />{clients.find(c => c.id === s.userId)?.name || "Unknown client"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.scheduledDate <= today && (
                      <button
                        onClick={() => handleMarkComplete(s.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Complete
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingSession(s);
                        setSessionForm({
                          userId: s.userId,
                          title: s.title,
                          scheduledDate: s.scheduledDate,
                          scheduledTime: s.scheduledTime,
                          duration: s.duration,
                          notes: s.notes ?? "",
                        });
                        setShowModal(true);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      title="Edit session"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancelSession(s.id, s.title, s.userId)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                      title="Cancel session"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium ml-2">Scheduled</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No upcoming sessions</p>
            </div>
          )}
        </div>

        {/* Past */}
        <div>
          <h2 className="text-base font-bold text-gray-700 mb-3">Past ({past.length})</h2>
          {past.length > 0 ? (
            <div className="space-y-3">
              {past.map((s) => (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 opacity-80">
                  <div className="w-10 h-10 rounded-lg bg-gray-300 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{s.title}</p>
                    <p className="text-sm text-gray-500">{formatDate(s.scheduledDate)} · {s.scheduledTime} · {s.duration} min</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3" />{clients.find(c => c.id === s.userId)?.name || "Unknown client"}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                    s.status === "completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>{s.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
              <p className="text-sm">No past sessions</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4 border-b pb-3">
              {editingSession ? "Edit Session" : "New Session"}
            </h2>
            
            <div className="space-y-4">
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select 
                  value={sessionForm.userId}
                  onChange={(e) => setSessionForm({...sessionForm, userId: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">Select a client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name || c.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text"
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm({...sessionForm, title: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="e.g. Upper Body Focus"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date"
                    value={sessionForm.scheduledDate}
                    onChange={(e) => setSessionForm({...sessionForm, scheduledDate: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input 
                    type="time"
                    value={sessionForm.scheduledTime}
                    onChange={(e) => setSessionForm({...sessionForm, scheduledTime: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                <select 
                  value={sessionForm.duration}
                  onChange={(e) => setSessionForm({...sessionForm, duration: parseInt(e.target.value)})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins</option>
                  <option value={90}>90 mins</option>
                  <option value={120}>120 mins</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea 
                  value={sessionForm.notes}
                  onChange={(e) => setSessionForm({...sessionForm, notes: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 h-20"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={handleSaveSession} 
                disabled={saving}
                className="flex-1 bg-orange-500 text-white flex items-center justify-center py-2.5 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save"}
              </button>
              <button 
                onClick={() => setShowModal(false)}
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
