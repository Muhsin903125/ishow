"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { listSessions, updateSession, type TrainingSession } from "@/lib/db/sessions";
import { getActivePlan } from "@/lib/db/plans";
import { getProfile } from "@/lib/db/profiles";
import { notify } from "@/lib/email/notify";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  RefreshCw,
  Loader2,
  User,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { color: string; icon: React.ReactNode }> = {
    scheduled: {
      color: "bg-blue-100 text-blue-700",
      icon: <Clock className="w-3 h-3" />,
    },
    completed: {
      color: "bg-green-100 text-green-700",
      icon: <CheckCircle className="w-3 h-3" />,
    },
    cancelled: {
      color: "bg-red-100 text-red-700",
      icon: <XCircle className="w-3 h-3" />,
    },
  };
  const config = configs[status.toLowerCase()] || configs.scheduled;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${config.color}`}>
      {config.icon}
      {status}
    </span>
  );
}

export default function SessionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [trainerEmail, setTrainerEmail] = useState("");

  // Reschedule modal state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleSession, setRescheduleSession] = useState<TrainingSession | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleNote, setRescheduleNote] = useState("");
  const [rescheduleSending, setRescheduleSending] = useState(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

  const loadData = async () => {
    if (!user) return;
    const userSessions = await listSessions({ userId: user.id });
    setSessions(userSessions);

    // Get trainer email for reschedule notifications
    const activePlan = await getActivePlan(user.id);
    if (activePlan?.trainerId) {
      const trainerProfile = await getProfile(activePlan.trainerId);
      if (trainerProfile?.email) setTrainerEmail(trainerProfile.email);
    }

    setDataLoaded(true);
  };

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push("/login"); return; }
      if (user.role !== "customer") { router.push("/trainer/dashboard"); return; }
      loadData();
    }
  }, [user, loading, router]); // eslint-disable-line

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="customer">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
        </div>
      </DashboardLayout>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const upcomingSessions = sessions.filter((s) => s.scheduledDate >= today && s.status === "scheduled");
  const pastSessions = sessions.filter((s) => s.scheduledDate < today || s.status !== "scheduled");
  const completedCount = sessions.filter((s) => s.status === "completed").length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const handleCancelSession = async (sessionId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this session? Your trainer will be notified."
    );
    if (!confirmed) return;
    await updateSession(sessionId, { status: "cancelled" });
    await loadData();
  };

  const handleRescheduleRequest = async () => {
    if (!rescheduleDate || !rescheduleSession) return;
    setRescheduleSending(true);
    try {
      if (trainerEmail) {
        await notify("session-rescheduled", trainerEmail, {
          name: user?.name ?? "A client",
          title: rescheduleSession.title,
          date: rescheduleDate,
          time: rescheduleSession.scheduledTime,
          duration: String(rescheduleSession.duration),
          oldDate: rescheduleSession.scheduledDate,
          oldTime: rescheduleSession.scheduledTime,
        });
      }
      setRescheduleSuccess(true);
      setTimeout(() => {
        setShowRescheduleModal(false);
        setRescheduleNote("");
        setRescheduleDate("");
        setRescheduleSuccess(false);
      }, 2000);
    } finally {
      setRescheduleSending(false);
    }
  };

  return (
    <DashboardLayout role="customer">
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">My Sessions</h1>
          <p className="text-gray-500 mt-1">Your scheduled and past training sessions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-black text-blue-700">{upcomingSessions.length}</p>
            <p className="text-gray-500 text-sm">Upcoming</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-black text-green-600">{completedCount}</p>
            <p className="text-gray-500 text-sm">Completed</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-black text-gray-900">{sessions.length}</p>
            <p className="text-gray-500 text-sm">Total</p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Sessions Yet</h2>
            <p className="text-gray-500 max-w-sm mx-auto">
              Your trainer will schedule sessions after your plan is active.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Sessions */}
            {upcomingSessions.length > 0 && (
              <div>
                <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  Upcoming Sessions
                </h2>
                <div className="space-y-3">
                  {upcomingSessions.map((s) => (
                    <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">{s.title}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(s.scheduledDate)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {s.scheduledTime}
                              </span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium">
                                {s.duration} min
                              </span>
                            </div>
                            {s.notes && (
                              <p className="text-gray-500 text-sm mt-2 italic bg-gray-50 rounded-lg px-3 py-2">{s.notes}</p>
                            )}

                            {/* C3 & C4: Action buttons */}
                            {s.status === "scheduled" && (
                              <div className="flex items-center gap-3 mt-3">
                                <button
                                  onClick={() => handleCancelSession(s.id)}
                                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" /> Cancel Session
                                </button>
                                <button
                                  onClick={() => {
                                    setRescheduleSession(s);
                                    setRescheduleDate("");
                                    setRescheduleNote("");
                                    setRescheduleSuccess(false);
                                    setShowRescheduleModal(true);
                                  }}
                                  className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" /> Request Reschedule
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <StatusBadge status={s.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Sessions */}
            {pastSessions.length > 0 && (
              <div>
                <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                  Past Sessions
                </h2>
                <div className="space-y-3">
                  {pastSessions.slice().reverse().map((s) => (
                    <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            s.status === "completed" ? "bg-green-100" : "bg-gray-100"
                          }`}>
                            {s.status === "completed" ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <XCircle className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{s.title}</p>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                              <span>{formatDate(s.scheduledDate)}</span>
                              <span>•</span>
                              <span>{s.scheduledTime}</span>
                              <span>•</span>
                              <span>{s.duration} min</span>
                            </div>
                            {s.notes && (
                              <p className="text-gray-400 text-sm mt-1.5 italic">&ldquo;{s.notes}&rdquo;</p>
                            )}
                          </div>
                        </div>
                        <StatusBadge status={s.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reschedule Request Modal (C4) */}
      {showRescheduleModal && rescheduleSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            {rescheduleSuccess ? (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="font-bold text-gray-900 text-lg">Request Sent!</p>
                <p className="text-gray-500 text-sm mt-1">Your trainer will review your reschedule request.</p>
              </div>
            ) : (
              <>
                <h2 className="text-base font-bold mb-1">Request Reschedule</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Current: {rescheduleSession.title} on {formatDate(rescheduleSession.scheduledDate)}
                </p>

                <label className="block text-sm font-medium mb-1">Preferred new date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={e => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />

                <label className="block text-sm font-medium mb-1">Note (optional)</label>
                <textarea
                  value={rescheduleNote}
                  onChange={e => setRescheduleNote(e.target.value)}
                  rows={3}
                  placeholder="e.g., I'm travelling on that day"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleRescheduleRequest}
                    disabled={rescheduleSending || !rescheduleDate}
                    className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-orange-400 transition-colors"
                  >
                    {rescheduleSending ? "Sending…" : "Send Request"}
                  </button>
                  <button
                    onClick={() => setShowRescheduleModal(false)}
                    className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
