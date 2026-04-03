"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getItems } from "@/lib/storage";
import type { User } from "@/lib/auth";
import type { Program } from "@/lib/mockData";
import { Calendar, Dumbbell, Layers, Target, Users, CheckCircle } from "lucide-react";

export default function TrainerProgramsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);

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

      setPrograms(getItems<Program>("ishow_programs").sort((left, right) => right.weekNumber - left.weekNumber));
      setCustomers(getItems<User>("ishow_users").filter((item) => item.role === "customer"));
    }
  }, [loading, router, user]);

  if (loading || !user) return null;

  const customerById = Object.fromEntries(customers.map((customer) => [customer.id, customer.name]));
  const assignedClients = new Set(programs.map((program) => program.userId)).size;
  const activityCount = programs.reduce((total, program) => total + program.activities.length, 0);

  return (
    <DashboardLayout role="TRAINER">
      <div className="w-full max-w-6xl p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Programs</h1>
          <p className="text-gray-500 mt-1">Assigned weekly programs, activity volume, and client progression.</p>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Program Weeks", value: programs.length, icon: Layers, tone: "bg-gray-900 text-white" },
            { label: "Assigned Clients", value: assignedClients, icon: Users, tone: "bg-blue-700 text-white" },
            { label: "Activities", value: activityCount, icon: Dumbbell, tone: "bg-orange-500 text-white" },
            { label: "Current Focus", value: programs[0]?.weekNumber ?? 0, icon: Target, tone: "bg-green-600 text-white" },
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

        <div className="space-y-5">
          {programs.map((program) => {
            const activeDays = Array.from(new Set(program.activities.map((item) => item.day)));
            const previewActivities = program.activities.slice(0, 5);

            return (
              <div key={program.id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500 mb-2">Week {program.weekNumber}</p>
                    <h2 className="text-xl font-black text-gray-900">{program.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{customerById[program.userId] ?? "Unknown Client"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      <Calendar className="w-3.5 h-3.5" />
                      {activeDays.length} training days
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {program.activities.length} activities
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-5">{program.description}</p>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-5">
                  {activeDays.map((day) => (
                    <div key={day} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="font-semibold text-gray-900 text-sm">{day}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {program.activities.filter((item) => item.day === day).length} planned items
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Activity preview</p>
                  <div className="space-y-2">
                    {previewActivities.map((activity, index) => (
                      <div key={`${activity.day}-${activity.exercise}-${index}`} className="flex items-start gap-3 text-sm text-gray-600">
                        <Dumbbell className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-900">{activity.day}:</span> {activity.exercise}
                          {activity.sets && activity.reps ? ` · ${activity.sets} x ${activity.reps}` : ""}
                          {activity.duration ? ` · ${activity.duration}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}