"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getItems } from "@/lib/storage";
import type { User } from "@/lib/auth";
import type { Session } from "@/lib/mockData";
import { Calendar, Clock, CheckCircle, XCircle, Users, Filter, Dumbbell } from "lucide-react";

type SessionFilter = "all" | "scheduled" | "completed" | "cancelled";

const statusStyles = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function TrainerSessionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [filter, setFilter] = useState<SessionFilter>("all");

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

      setSessions(getItems<Session>("ishow_sessions"));
      setCustomers(getItems<User>("ishow_users").filter((item) => item.role === "customer"));
    }
  }, [loading, router, user]);

  if (loading || !user) return null;

  const customerById = Object.fromEntries(customers.map((customer) => [customer.id, customer.name]));
  const today = new Date().toISOString().split("T")[0];

  const filteredSessions =
    filter === "all" ? sessions : sessions.filter((session) => session.status === filter);

  const orderedSessions = filteredSessions.sort((left, right) => {
    if (left.status === "scheduled" && right.status !== "scheduled") return -1;
    if (right.status === "scheduled" && left.status !== "scheduled") return 1;
    return (right.date + right.time).localeCompare(left.date + left.time);
  });

  return (
    <DashboardLayout role="TRAINER">
      <div className="w-full max-w-6xl p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Sessions</h1>
          <p className="text-gray-500 mt-1">Track every scheduled, completed, and cancelled client session.</p>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {[
            { label: "All Sessions", value: sessions.length, icon: Dumbbell, tone: "bg-gray-900 text-white" },
            { label: "Scheduled", value: sessions.filter((item) => item.status === "scheduled").length, icon: Calendar, tone: "bg-blue-700 text-white" },
            { label: "Completed", value: sessions.filter((item) => item.status === "completed").length, icon: CheckCircle, tone: "bg-green-600 text-white" },
            { label: "Today", value: sessions.filter((item) => item.status === "scheduled" && item.date === today).length, icon: Clock, tone: "bg-orange-500 text-white" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`${card.tone} rounded-2xl p-5`}>
                <Icon className="w-5 h-5 opacity-80 mb-2" />
                <p className="text-3xl font-black">{card.value}</p>
                <p className="text-sm font-medium opacity-75 mt-0.5">{card.label}</p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 mr-1" />
          {(["all", "scheduled", "completed", "cancelled"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all capitalize ${
                filter === item ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {item === "all" ? "All sessions" : item}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {orderedSessions.map((session) => (
            <div key={session.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-black text-gray-900 text-lg">{session.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{customerById[session.userId] ?? "Unknown Client"}</p>
                </div>
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${statusStyles[session.status]}`}>
                  {session.status === "completed" ? <CheckCircle className="w-3.5 h-3.5" /> : null}
                  {session.status === "cancelled" ? <XCircle className="w-3.5 h-3.5" /> : null}
                  {session.status === "scheduled" ? <Clock className="w-3.5 h-3.5" /> : null}
                  {session.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-4">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(session.date + "T00:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {session.time} · {session.duration} min
                </span>
                <span className="inline-flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  {session.trainerName}
                </span>
              </div>

              {session.notes && (
                <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  {session.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}