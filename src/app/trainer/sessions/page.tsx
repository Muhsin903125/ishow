"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { getItems } from "@/lib/storage";
import type { Session } from "@/lib/mockData";
import { Calendar, Loader2, Clock, User } from "lucide-react";

export default function TrainerSessionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push("/login"); return; }
      if (user.role !== "trainer") { router.push("/dashboard"); return; }
      const allSessions = getItems<Session>("ishow_sessions");
      setSessions(allSessions.sort((a, b) => a.date.localeCompare(b.date)));
      setDataLoaded(true);
    }
  }, [user, loading, router]);

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

  return (
    <DashboardLayout role="trainer">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Sessions</h1>
            <p className="text-gray-500 text-sm">All client sessions</p>
          </div>
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
                      {formatDate(s.date)} · {s.time} · {s.duration} min
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3" />{s.trainerName}
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">Scheduled</span>
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
                    <p className="text-sm text-gray-500">{formatDate(s.date)} · {s.time} · {s.duration} min</p>
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
    </DashboardLayout>
  );
}
