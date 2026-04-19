"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { getItems } from "@/lib/storage";
import type { Program } from "@/lib/mockData";
import { Dumbbell, Loader2, ChevronDown, ChevronUp } from "lucide-react";

export default function TrainerProgramsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push("/login"); return; }
      if (user.role !== "trainer") { router.push("/dashboard"); return; }
      setPrograms(getItems<Program>("ishow_programs"));
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

  return (
    <DashboardLayout role="trainer">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Programs</h1>
            <p className="text-gray-500 text-sm">Weekly training programs for all clients</p>
          </div>
        </div>

        {programs.length > 0 ? (
          <div className="space-y-4">
            {programs.map((prog) => (
              <div key={prog.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === prog.id ? null : prog.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{prog.title}</p>
                      <p className="text-sm text-gray-500">Week {prog.weekNumber} · {prog.activities?.length ?? 0} activities</p>
                    </div>
                  </div>
                  {expanded === prog.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {expanded === prog.id && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mt-3 mb-4">{prog.description}</p>
                    {prog.activities && prog.activities.length > 0 ? (
                      <div className="space-y-2">
                        {prog.activities.map((act, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                            <span className="font-bold text-orange-600 w-10 flex-shrink-0">{act.day}</span>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{act.exercise}</p>
                              <p className="text-gray-500 text-xs mt-0.5">
                                {act.sets && act.reps && `${act.sets} sets × ${act.reps}`}
                                {act.duration && ` · ${act.duration}`}
                                {act.notes && ` · ${act.notes}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No activities listed.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No programs yet</p>
            <p className="text-sm mt-1">Create programs for your clients from their profile pages.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
