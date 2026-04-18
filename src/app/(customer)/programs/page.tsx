"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { getItems } from "@/lib/storage";
import type { Program, DayActivity } from "@/lib/mockData";
import { Dumbbell, Calendar, Activity, Loader2 } from "lucide-react";

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ProgramsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push("/login"); return; }
      if (user.role !== "customer") { router.push("/trainer/dashboard"); return; }

      const allPrograms = getItems<Program>("ishow_programs");
      const userPrograms = allPrograms
        .filter((p) => p.userId === user.id)
        .sort((a, b) => b.weekNumber - a.weekNumber);
      setPrograms(userPrograms);
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

  return (
    <DashboardLayout role="customer">
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">My Programs</h1>
          <p className="text-gray-500 mt-1">Weekly workout programs assigned by your trainer</p>
        </div>

        {programs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Programs Yet</h2>
            <p className="text-gray-500 max-w-sm mx-auto">
              Your trainer will assign weekly programs once your plan is active.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {programs.map((program) => {
              // Group activities by day
              const byDay: Record<string, DayActivity[]> = {};
              program.activities.forEach((activity) => {
                if (!byDay[activity.day]) byDay[activity.day] = [];
                byDay[activity.day].push(activity);
              });

              const orderedDays = DAY_ORDER.filter((d) => byDay[d]);

              return (
                <div key={program.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Program Header */}
                  <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-6 text-white">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-xs mb-3">
                          <Calendar className="w-3 h-3" />
                          Week {program.weekNumber}
                        </div>
                        <h2 className="text-xl font-bold">{program.title}</h2>
                        {program.description && (
                          <p className="text-blue-200 text-sm mt-1 max-w-xl">{program.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-blue-200">
                        <span className="flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          {program.activities.length} activities
                        </span>
                        <span>{orderedDays.length} days</span>
                      </div>
                    </div>
                  </div>

                  {/* Activities by Day */}
                  <div className="p-6">
                    {orderedDays.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">No activities assigned yet</p>
                    ) : (
                      <div className="space-y-5">
                        {orderedDays.map((day) => (
                          <div key={day}>
                            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                              <div className="w-5 h-5 rounded bg-orange-100 flex items-center justify-center">
                                <span className="text-orange-600 text-xs font-bold">{day.charAt(0)}</span>
                              </div>
                              {day}
                            </h3>
                            <div className="space-y-2 pl-2">
                              {byDay[day].map((activity, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Dumbbell className="w-4 h-4 text-blue-700" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm">{activity.exercise}</p>
                                    {activity.notes && (
                                      <p className="text-gray-400 text-xs mt-0.5 truncate">{activity.notes}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {activity.sets && activity.reps && (
                                      <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                                        {activity.sets} × {activity.reps}
                                      </span>
                                    )}
                                    {activity.duration && (
                                      <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                                        {activity.duration}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
