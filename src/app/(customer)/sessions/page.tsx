"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getItems } from "@/lib/storage";
import type { Session } from "@/lib/mockData";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight,
  Dumbbell,
  Filter,
} from "lucide-react";

type Filter = "all" | "scheduled" | "completed" | "cancelled";

const statusConfig = {
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-400",
  },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function isToday(dateStr: string) {
  return dateStr === new Date().toISOString().split("T")[0];
}

export default function SessionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user) {
      if (user.role !== "customer") { router.push("/trainer/dashboard"); return; }
      const all = getItems<Session>("ishow_sessions");
      setSessions(
        all
          .filter((s) => s.userId === user.id)
          .sort((a, b) => {
            // upcoming first, then past descending
            const today = new Date().toISOString().split("T")[0];
            if (a.status === "scheduled" && b.status !== "scheduled") return -1;
            if (b.status === "scheduled" && a.status !== "scheduled") return 1;
            if (a.status === "scheduled") return a.date.localeCompare(b.date);
            return b.date.localeCompare(a.date);
          })
      );
    }
  }, [loading, user, router]);

  if (loading || !user) return null;

  const filtered = filter === "all" ? sessions : sessions.filter((s) => s.status === filter);
  const upcoming = sessions.filter((s) => s.status === "scheduled");
  const completed = sessions.filter((s) => s.status === "completed");
  const today = sessions.filter((s) => isToday(s.date) && s.status === "scheduled");

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Training Sessions</h1>
          <p className="text-gray-500 mt-1">Your scheduled and past sessions with your trainer</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Sessions", value: sessions.length, icon: Dumbbell, color: "bg-gray-900 text-white" },
            { label: "Upcoming", value: upcoming.length, icon: Calendar, color: "bg-blue-700 text-white" },
            { label: "Completed", value: completed.length, icon: CheckCircle, color: "bg-green-600 text-white" },
            { label: "Today", value: today.length, icon: AlertCircle, color: "bg-orange-500 text-white" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`${color} rounded-2xl p-5`}>
              <Icon className="w-5 h-5 opacity-80 mb-2" />
              <p className="text-3xl font-black">{value}</p>
              <p className="text-sm opacity-75 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Today Alert */}
        {today.length > 0 && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-5 mb-6 text-white flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-lg">Session Today!</p>
              <p className="text-orange-100 text-sm">
                {today[0].title} at {formatTime(today[0].time)} · {today[0].duration} min with {today[0].trainerName}
              </p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 mr-1" />
          {(["all", "scheduled", "completed", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all capitalize ${
                filter === f
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f === "all" ? "All Sessions" : f}
            </button>
          ))}
        </div>

        {/* Sessions list */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No sessions found</p>
            </div>
          ) : (
            filtered.map((session) => {
              const cfg = statusConfig[session.status];
              const Icon = cfg.icon;
              const todayHighlight = isToday(session.date) && session.status === "scheduled";
              return (
                <div
                  key={session.id}
                  className={`bg-white rounded-2xl border p-5 transition-all hover:shadow-md ${
                    todayHighlight
                      ? "border-orange-300 ring-1 ring-orange-200 shadow-orange-50"
                      : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Date box */}
                    <div className={`rounded-2xl p-3 flex flex-col items-center justify-center min-w-[60px] text-center flex-shrink-0 ${
                      todayHighlight ? "bg-orange-500 text-white" :
                      session.status === "scheduled" ? "bg-blue-50 text-blue-700" :
                      session.status === "completed" ? "bg-green-50 text-green-700" :
                      "bg-gray-100 text-gray-400"
                    }`}>
                      <p className="text-xs font-semibold uppercase">
                        {new Date(session.date + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}
                      </p>
                      <p className="text-2xl font-black leading-none">
                        {new Date(session.date + "T00:00:00").getDate()}
                      </p>
                      {todayHighlight && <p className="text-xs font-bold mt-0.5">TODAY</p>}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="font-black text-gray-900 text-base">{session.title}</h3>
                          <p className="text-gray-500 text-sm mt-0.5">
                            {formatDate(session.date)}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${cfg.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {formatTime(session.time)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Dumbbell className="w-4 h-4 text-gray-400" />
                          {session.duration} min
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-gray-400" />
                          {session.trainerName}
                        </span>
                      </div>

                      {session.notes && (
                        <div className={`mt-3 p-3 rounded-xl text-sm ${
                          session.status === "completed"
                            ? "bg-green-50 text-green-800 border border-green-100"
                            : "bg-blue-50 text-blue-800 border border-blue-100"
                        }`}>
                          <span className="font-semibold">
                            {session.status === "completed" ? "Trainer Notes: " : "Session Focus: "}
                          </span>
                          {session.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
