"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import type { Program, ProgramActivity } from "@/lib/db/programs";
import { loadCustomerWorkspace } from "@/lib/api/workspace";
import { 
  Dumbbell, 
  Calendar, 
  Layers,
} from "lucide-react";

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ProgramsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.replace("/login"); return; }
      if (user.role !== "customer") { router.replace("/trainer/dashboard"); return; }

      (async () => {
        try {
          const workspace = await loadCustomerWorkspace();
          setPrograms(
            [...workspace.programs].sort((a, b) => b.weekNumber - a.weekNumber)
          );
        } catch (err) {
          console.error("Error loading programs:", err);
        } finally {
          setDataLoaded(true);
        }
      })();
    }
  }, [user, loading, router]);

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="customer">
        <div className="p-8 max-w-5xl mx-auto space-y-8">
          <div className="h-10 w-48 bg-zinc-900 rounded-lg animate-pulse" />
          <div className="space-y-6">
            <div className="h-64 bg-zinc-900 rounded-[2.5rem] animate-pulse" />
            <div className="h-64 bg-zinc-900 rounded-[2.5rem] animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="customer">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">
              Syllabus & <span className="text-orange-500">Modules</span>
            </h1>
            <p className="text-zinc-500 mt-2 font-medium">Weekly operational frameworks for your physical development.</p>
          </motion.div>

          {!programs.length ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-16 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-orange-500/20">
                <Layers className="w-10 h-10 text-orange-500" />
              </div>
              <h2 className="text-xl font-black text-white uppercase italic mb-4">No Curriculum Assigned</h2>
              <p className="text-zinc-500 max-w-sm mx-auto text-sm font-medium leading-relaxed">
                Your instructional modules have not been deployed by your coach yet. 
                Focus on baseline consistency in the meantime.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-12">
              {programs.map((program, pIdx) => {
                const byDay: Record<string, ProgramActivity[]> = {};
                (program.activities || []).forEach((activity) => {
                  if (!byDay[activity.day]) byDay[activity.day] = [];
                  byDay[activity.day].push(activity);
                });

                const orderedDays = DAY_ORDER.filter((d) => byDay[d]);

                return (
                  <motion.div 
                    key={program.id} 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: pIdx * 0.1 }}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] overflow-hidden"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 md:p-10 border-b border-zinc-800 relative group overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-blue-500/5 group-hover:opacity-1 transition-opacity opacity-0" />
                      
                      <div className="flex items-start justify-between flex-wrap gap-8 relative z-10">
                        <div>
                          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">
                            <Calendar className="w-3 h-3 text-orange-500" />
                            Operational Week {program.weekNumber}
                          </div>
                          <h2 className="text-3xl font-black text-white italic uppercase tracking-tight underline decoration-orange-500/30 underline-offset-8">
                            {program.title}
                          </h2>
                          {program.description && (
                            <p className="text-zinc-500 text-sm mt-6 max-w-2xl font-medium leading-relaxed">
                              {program.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">Density</p>
                            <p className="text-xl font-black text-white italic">{(program.activities || []).length}</p>
                            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mt-0.5">Tasks</p>
                          </div>
                          <div className="text-center">
                            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">Coverage</p>
                            <p className="text-xl font-black text-white italic">{orderedDays.length}</p>
                            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mt-0.5">Days</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-10 space-y-10">
                      {!orderedDays.length ? (
                        <div className="py-10 text-center border border-dashed border-zinc-800 rounded-2xl">
                          <p className="text-zinc-700 font-black uppercase text-[10px] tracking-widest">Awaiting task assignments...</p>
                        </div>
                      ) : (
                        orderedDays.map((day) => (
                          <div key={day} className="relative">
                            <h3 className="font-black text-white uppercase tracking-[0.2em] text-[10px] mb-6 flex items-center gap-3">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                              {day}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l border-zinc-800/50 ml-0.5">
                              {byDay[day].map((activity, idx) => (
                                <div
                                  key={idx}
                                  className="group flex items-center justify-between gap-4 p-5 bg-zinc-950/50 border border-zinc-800 rounded-2xl hover:border-zinc-600 transition-all"
                                >
                                  <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500 transition-all">
                                      <Dumbbell className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-black text-white uppercase italic text-sm truncate">{activity.exerciseName}</p>
                                      {activity.notes && (
                                        <p className="text-zinc-600 text-[10px] font-bold mt-1 truncate max-w-[200px]">{activity.notes}</p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {activity.sets && activity.reps && (
                                      <div className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg">
                                        <p className="text-[10px] font-black text-white uppercase tracking-tight italic">
                                          {activity.sets} <span className="text-zinc-600 mx-0.5">X</span> {activity.reps}
                                        </p>
                                      </div>
                                    )}
                                    {activity.duration && (
                                      <div className="bg-zinc-900/50 border border-zinc-800 px-3 py-1.5 rounded-lg">
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-tight italic">
                                          {activity.duration}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
