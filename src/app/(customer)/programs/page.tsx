"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { listPrograms, type Program, type ProgramActivity as DayActivity } from "@/lib/db/programs";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Dumbbell,
  Calendar,
  ChevronDown,
  ChevronUp,
  Target,
  Clock,
  RotateCcw,
  CheckCircle,
} from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const dayColors: Record<string, string> = {
  Monday:    "bg-blue-50 border-blue-200 text-blue-700",
  Tuesday:   "bg-violet-50 border-violet-200 text-violet-700",
  Wednesday: "bg-green-50 border-green-200 text-green-700",
  Thursday:  "bg-orange-50 border-orange-200 text-orange-700",
  Friday:    "bg-red-50 border-red-200 text-red-700",
  Saturday:  "bg-teal-50 border-teal-200 text-teal-700",
  Sunday:    "bg-gray-50 border-gray-200 text-gray-500",
};

export default function ProgramsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    const load = async () => {
      if (!loading && user) {
        if (user.role === 'admin') { router.push('/admin/dashboard'); return; }
        if (user.role === 'trainer') { router.push('/trainer/dashboard'); return; }
        const mine = await listPrograms(user.id);
        setPrograms(mine);
        if (mine.length > 0) setExpanded(mine[mine.length - 1].id);
      }
    };
    load();
  }, [loading, user, router]);

  if (loading || !user) return null;

  function groupByDay(activities: DayActivity[]) {
    const map: Record<string, DayActivity[]> = {};
    for (const act of activities) {
      if (!map[act.day]) map[act.day] = [];
      map[act.day].push(act);
    }
    return map;
  }

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="w-full max-w-5xl p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Training Programs</h1>
          <p className="text-gray-500 mt-1">Your weekly workout programs designed by your trainer</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 text-white rounded-2xl p-5">
            <Calendar className="w-5 h-5 opacity-75 mb-2" />
            <p className="text-3xl font-black">{programs.length}</p>
            <p className="text-sm opacity-60 font-medium mt-0.5">Total Weeks</p>
          </div>
          <div className="bg-orange-500 text-white rounded-2xl p-5">
            <Target className="w-5 h-5 opacity-75 mb-2" />
            <p className="text-3xl font-black">
              {programs.reduce((acc, p) => acc + (p.activities?.length ?? 0), 0)}
            </p>
            <p className="text-sm opacity-75 font-medium mt-0.5">Total Exercises</p>
          </div>
          <div className="bg-blue-700 text-white rounded-2xl p-5">
            <Dumbbell className="w-5 h-5 opacity-75 mb-2" />
            <p className="text-3xl font-black">
              {programs.length > 0 ? programs[programs.length - 1].weekNumber : 0}
            </p>
            <p className="text-sm opacity-75 font-medium mt-0.5">Current Week</p>
          </div>
        </div>

        {programs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Dumbbell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-gray-600">No programs yet</p>
            <p className="text-gray-400 text-sm mt-1">Your trainer will assign your first program soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {programs.map((program) => {
              const isOpen = expanded === program.id;
              const grouped = groupByDay(program.activities ?? []);
              const daysPresent = DAYS.filter((d) => grouped[d]);

              return (
                <div
                  key={program.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
                >
                  {/* Program header */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : program.id)}
                    className="w-full flex items-center gap-4 p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white font-black text-lg">{program.weekNumber}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
                          Week {program.weekNumber}
                        </span>
                      </div>
                      <h3 className="font-black text-gray-900 text-lg leading-tight mt-0.5">{program.title}</h3>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-1">{program.description}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="hidden sm:flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-medium">
                          {(program.activities?.length ?? 0)} exercises · {daysPresent.length} days
                        </span>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="border-t border-gray-100">
                      {/* Description */}
                      {program.description && (
                        <div className="px-6 py-4 bg-blue-50/60 border-b border-blue-100">
                          <p className="text-blue-800 text-sm leading-relaxed">{program.description}</p>
                        </div>
                      )}

                      {/* Days */}
                      <div className="p-6 space-y-5">
                        {daysPresent.map((day) => {
                          const acts = grouped[day];
                          const colorCls = dayColors[day] ?? "bg-gray-50 border-gray-200 text-gray-600";
                          const isSunday = day === "Sunday";
                          return (
                            <div key={day}>
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold mb-3 ${colorCls}`}>
                                <Calendar className="w-3.5 h-3.5" />
                                {day}
                              </div>

                              <div className={`space-y-2 ${isSunday ? "opacity-70" : ""}`}>
                                {acts.map((act, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl p-3.5"
                                  >
                                    <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                                      {isSunday ? (
                                        <CheckCircle className="w-4 h-4 text-gray-400" />
                                      ) : (
                                        <Dumbbell className="w-4 h-4 text-gray-500" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-gray-900 text-sm">{act.exerciseName}</p>
                                      <div className="flex flex-wrap gap-3 mt-1">
                                        {act.sets && act.reps && (
                                          <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <RotateCcw className="w-3 h-3" />
                                            {act.sets} × {act.reps}
                                          </span>
                                        )}
                                        {act.duration && (
                                          <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            {act.duration}
                                          </span>
                                        )}
                                        {act.notes && (
                                          <span className="text-xs text-orange-600 font-medium italic">
                                            · {act.notes}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
