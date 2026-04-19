"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { getItems } from "@/lib/storage";
import type { Session } from "@/lib/mockData";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
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
  const [sessions, setSessions] = useState<Session[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push("/login"); return; }
      if (user.role !== "customer") { router.push("/trainer/dashboard"); return; }

      const allSessions = getItems<Session>("ishow_sessions");
      const userSessions = allSessions
        .filter((s) => s.userId === user.id)
        .sort((a, b) => a.date.localeCompare(b.date));
      setSessions(userSessions);
      setDataLoaded(true);
    }
  }, [user, loading, router]);

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
  const upcomingSessions = sessions.filter((s) => s.date >= today && s.status === "scheduled");
  const pastSessions = sessions.filter((s) => s.date < today || s.status !== "scheduled");
  const completedCount = sessions.filter((s) => s.status === "completed").length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
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
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <User className="w-3.5 h-3.5" />
                              <span>{s.trainerName}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(s.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {s.time}
                              </span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium">
                                {s.duration} min
                              </span>
                            </div>
                            {s.notes && (
                              <p className="text-gray-500 text-sm mt-2 italic bg-gray-50 rounded-lg px-3 py-2">{s.notes}</p>
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
                              <span>{formatDate(s.date)}</span>
                              <span>•</span>
                              <span>{s.time}</span>
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
    </DashboardLayout>
  );
}
