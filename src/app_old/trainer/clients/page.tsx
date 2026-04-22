"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { listCustomers, type Profile } from "@/lib/db/profiles";
import { listAssessments, type Assessment } from "@/lib/db/assessments";
import { listAllPlans, type Plan } from "@/lib/db/plans";
import { listSessions, type TrainingSession } from "@/lib/db/sessions";
import {
  Users,
  ArrowRight,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  Phone,
  Search,
  Filter,
  ChevronRight,
  Activity,
  Zap,
} from "lucide-react";

type FilterStatus = "all" | "active" | "request" | "no-plan";

export default function TrainerClientsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Profile[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // TR3: Search & filter state
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  useEffect(() => {
    if (!loading) {
      if (!user) { router.replace("/login"); return; }
      if (user.role === "customer") { router.replace("/dashboard"); return; }
      
      (async () => {
        try {
          const [c, a, p, s] = await Promise.all([
            listCustomers(),
            listAssessments(),
            listAllPlans(),
            listSessions(),
          ]);
          setClients(c);
          setAssessments(a);
          setPlans(p);
          setSessions(s);
        } catch (err) {
          console.error("Error loading trainer clients:", err);
        } finally {
          setDataLoaded(true);
        }
      })();
    }
  }, [user, loading, router]);

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="trainer">
        <div className="p-8 max-w-full space-y-8 animate-pulse">
           <div className="h-10 w-48 bg-zinc-900 rounded-lg" />
           <div className="h-14 bg-zinc-900 rounded-2xl w-full" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-64 bg-zinc-900 rounded-3xl" />)}
           </div>
        </div>
      </DashboardLayout>
    );
  }

  const assessmentByUserId = Object.fromEntries(assessments.map((a) => [a.userId, a]));

  const getActivePlan = (clientId: string) =>
    plans.find((p) => p.userId === clientId && p.status === "active");

  const getLastSession = (clientId: string) =>
    sessions
      .filter((s) => s.userId === clientId && s.status === "completed")
      .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate))[0];

  const displayedClients = clients.filter(client => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      client.name.toLowerCase().includes(q) ||
      (client.email ?? "").toLowerCase().includes(q);

    const clientPlan = getActivePlan(client.id);
    const matchesStatus = filterStatus === "all" ? true :
      filterStatus === "active" ? client.customerStatus === "client" && !!clientPlan :
      filterStatus === "request" ? client.customerStatus === "request" :
      filterStatus === "no-plan" ? !clientPlan : true;

    return matchesSearch && matchesStatus;
  });

  const AssessmentBadge = ({ status }: { status?: string }) => {
    if (!status) return <span className="bg-zinc-800 text-zinc-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-zinc-700/50 italic">None</span>;
    if (status === "reviewed") return <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/25 italic flex items-center gap-1.5"><CheckCircle className="w-3 h-3" />Synced</span>;
    return <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-500/25 italic flex items-center gap-1.5"><Clock className="w-3 h-3" />Awaiting</span>;
  };

  return (
    <DashboardLayout role="trainer">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-10">
        <div className="max-w-full">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">
               Force <span className="text-orange-500">Directory</span>
            </h1>
            <p className="text-zinc-500 mt-2 font-medium">Monitoring operational availability and curriculum status for all registered assets.</p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col lg:flex-row gap-4 mb-10"
          >
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-700 group-focus-within:text-orange-500 transition-colors" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="PROBE OPERATIONAL DATABASE (NAME OR EMAIL)..."
                className="w-full pl-14 pr-6 py-5 bg-zinc-900 border border-zinc-800 rounded-[2rem] text-sm text-white font-black uppercase tracking-widest focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-800"
              />
            </div>

            <div className="flex gap-1.5 bg-zinc-900 border border-zinc-800 p-2 rounded-[2rem] relative overflow-hidden">
               <div className="absolute right-0 top-0 p-4 opacity-[0.02] pointer-events-none">
                  <Filter className="w-12 h-12 text-white" />
               </div>
              {(["all", "active", "request", "no-plan"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${
                    filterStatus === f ? "bg-white text-zinc-950 shadow-xl" : "text-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  {f === "no-plan" ? "Unassigned" : f === "all" ? "Whole Force" : f}
                </button>
              ))}
            </div>
          </motion.div>

          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
             Manifesting {displayedClients.length} Match Records
          </p>

          <AnimatePresence mode="popLayout">
            {displayedClients.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {displayedClients.map((client, cIdx) => {
                  const assessment = assessmentByUserId[client.id];
                  const plan = getActivePlan(client.id);
                  const lastSession = getLastSession(client.id);
                  return (
                    <motion.div 
                      key={client.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: cIdx * 0.05 }}
                      className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 hover:border-zinc-700 transition-all group overflow-hidden relative"
                    >
                      <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-5 transition-opacity">
                        <Activity className="w-24 h-24 text-white" />
                      </div>

                      <div className="flex items-start justify-between flex-wrap gap-8 mb-10 relative z-10">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-3xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-700 font-black text-xl italic group-hover:text-orange-500 group-hover:border-orange-500/30 transition-all">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-white text-xl uppercase italic tracking-tighter">{client.name}</p>
                            <div className="space-y-1 mt-2">
                               <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:text-zinc-400">
                                 <Mail className="w-3.5 h-3.5 text-orange-500/50" />
                                 {client.email}
                               </p>
                               {client.phone && (
                                 <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                   <Phone className="w-3.5 h-3.5 text-zinc-800" />
                                   {client.phone}
                                 </p>
                               )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                           <div className="bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-900">
                              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{client.customerStatus || 'Standby'}</span>
                           </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 pt-8 border-t border-zinc-800/50 relative z-10">
                        <div className="bg-zinc-950/50 rounded-[1.5rem] p-4 border border-zinc-800/30">
                           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 italic">Diagnostic Data</p>
                           <AssessmentBadge status={assessment?.status} />
                        </div>
                        <div className="bg-zinc-950/50 rounded-[1.5rem] p-4 border border-zinc-800/30">
                           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 italic">Assigned Syllabus</p>
                           {plan ? (
                             <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/25 italic">{plan.name}</span>
                           ) : (
                             <span className="text-zinc-800 text-[10px] font-black uppercase tracking-widest italic">UNASSIGNED</span>
                           )}
                        </div>
                      </div>

                      {lastSession && (
                         <div className="mb-8 px-6 py-3 bg-zinc-950/20 border border-dashed border-zinc-800 rounded-2xl flex items-center justify-between">
                            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">Last Operational Sync</span>
                            <span className="text-[10px] font-black text-zinc-400 italic">{new Date(lastSession.scheduledDate + "T00:00:00").toLocaleDateString()}</span>
                         </div>
                      )}

                      <div className="flex gap-4 relative z-10">
                        <Link
                          href={`/trainer/clients/${client.id}`}
                          className="flex-1 bg-white text-zinc-950 hover:bg-orange-500 hover:text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group-hover:shadow-2xl active:scale-95 shadow-xl"
                        >
                          View Parameters <ChevronRight className="w-4 h-4" />
                        </Link>
                        {!plan && assessment && (
                          <Link
                            href={`/trainer/clients/${client.id}/assign-plan`}
                            className="flex-1 bg-zinc-800 text-white hover:bg-white hover:text-zinc-950 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                          >
                            Set Protocol <Zap className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32 bg-zinc-900 border border-zinc-800 rounded-[2.5rem]"
              >
                {clients.length === 0 ? (
                  <>
                    <Users className="w-16 h-16 mx-auto mb-6 text-zinc-800" />
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Zero Asset Records</h3>
                    <p className="text-zinc-500 text-sm font-medium tracking-wide">Database is currently empty. Awaiting mission enlistment.</p>
                  </>
                ) : (
                  <>
                    <Search className="w-16 h-16 mx-auto mb-6 text-zinc-800" />
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Probe Failure</h3>
                    <p className="text-zinc-500 text-sm font-medium tracking-wide">No asset records match the specified search parameters.</p>
                    <button
                      onClick={() => { setSearch(""); setFilterStatus("all"); }}
                      className="mt-8 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
                    >
                      Reset Filter Manifest
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
