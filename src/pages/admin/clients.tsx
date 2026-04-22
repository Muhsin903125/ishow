"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { listCustomers, listTrainers, updateProfile, type Profile } from "@/lib/db/profiles";
import { listAssessments, type Assessment } from "@/lib/db/assessments";
import { listAllPlans, updatePlan, type Plan } from "@/lib/db/plans";
import { 
  Mail, 
  Phone, 
  CheckCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Target, 
  Zap, 
  UserCog, 
  Shield, 
  ArrowRight,
  Loader2,
  Calendar,
  Search,
  Filter,
  AlertCircle,
  X,
  Activity,
  Smartphone
} from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminClientsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [customers, setCustomers] = useState<Profile[]>([]);
  const [trainers, setTrainers] = useState<Profile[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [globalMessage, setGlobalMessage] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAssignTrainer = async (customerId: string, trainerId: string) => {
    const activePlan = plans.find(
      (p) => p.userId === customerId && p.status === "active"
    );

    if (activePlan) {
      await updatePlan(activePlan.id, { trainerId });
    } else {
      setGlobalMessage("Operational Error: Asset has no active mission plan. Deployment required first.");
      setAssigningId(null);
      setTimeout(() => setGlobalMessage(""), 5000);
      return;
    }

    setAssigningId(null);
    await loadData();
  };

  const loadData = async () => {
    try {
      const [c, t, a, p] = await Promise.all([
        listCustomers(), listTrainers(), listAssessments(), listAllPlans(),
      ]);
      setCustomers(c);
      setTrainers(t);
      setAssessments(a);
      setPlans(p);
    } catch (err) {
      console.error("Error loading admin clients:", err);
    } finally {
      setDataLoaded(true);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (user.role !== 'admin') { router.replace('/trainer/dashboard'); return; }
    loadData();
  }, [loading, router, user]);

  if (loading || !dataLoaded || !user) {
    return (
      <DashboardLayout role="admin">
        <div className="p-8 max-w-full space-y-8 animate-pulse">
           <div className="h-12 w-64 bg-zinc-900 rounded-2xl" />
           <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-24 bg-zinc-900 rounded-3xl" />)}
           </div>
           <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-28 bg-zinc-900 rounded-[2.5rem]" />)}
           </div>
        </div>
      </DashboardLayout>
    );
  }

  const assessmentByUserId = Object.fromEntries(assessments.map((a) => [a.userId, a]));
  const activePlanByUserId = Object.fromEntries(plans.filter((p) => p.status === "active").map((p) => [p.userId, p]));

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-10">
        <div className="max-w-full space-y-10">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-3">
                 Asset <span className="text-orange-500">Directory</span>
              </h1>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest italic">Operational Management Interface</p>
              </div>
            </motion.div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input 
                type="text" 
                placeholder="SEARCH IDENTIFIER..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black text-white uppercase tracking-widest focus:border-orange-500/50 outline-none transition-all placeholder:text-zinc-800"
              />
            </div>
          </div>

          <AnimatePresence>
            {globalMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-3xl text-[10px] font-black uppercase tracking-widest italic flex items-center justify-between shadow-lg shadow-orange-950/20"
              >
                <div className="flex items-center gap-4">
                   <AlertCircle className="w-5 h-5" />
                   {globalMessage}
                </div>
                <button onClick={() => setGlobalMessage("")} className="p-2 hover:bg-orange-500/10 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Metrics Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Assets", value: customers.length, color: "text-zinc-400", icon: Users },
              { label: "Active Nodes", value: customers.filter((c) => c.customerStatus === "client").length, color: "text-emerald-500", icon: CheckCircle },
              { label: "Pending Requests", value: customers.filter((c) => c.customerStatus === "request").length, color: "text-orange-500", icon: Clock },
              { label: "Assigned Plans", value: plans.filter(p => p.status === 'active' && p.trainerId).length, color: "text-blue-500", icon: Target },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 group hover:border-zinc-700 transition-colors"
              >
                <p className={`text-[9px] font-black uppercase tracking-widest mb-3 italic ${stat.color}`}>{stat.label}</p>
                <div className="flex items-end justify-between">
                    <p className="text-3xl font-black text-white italic truncate">{stat.value}</p>
                    <stat.icon className="w-6 h-6 text-zinc-800 group-hover:text-zinc-700 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Manifest List */}
          <div className="space-y-4">
            {filteredCustomers.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-[3rem] py-40 text-center"
              >
                <Users className="w-20 h-20 mx-auto mb-8 text-zinc-800 opacity-20" />
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Manifest Silent</h3>
                <p className="text-zinc-600 font-bold text-[10px] uppercase tracking-widest italic">No files matching current parameters.</p>
              </motion.div>
            ) : (
              filteredCustomers.map((customer, cIdx) => {
                const expanded = expandedId === customer.id;
                const assessment = assessmentByUserId[customer.id];
                const activePlan = activePlanByUserId[customer.id];

                return (
                  <motion.div 
                    key={customer.id} 
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: cIdx * 0.02 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden hover:border-orange-500/30 transition-all shadow-2xl relative group"
                  >
                    <button
                      onClick={() => setExpandedId(expanded ? null : customer.id)}
                      className={`w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 text-left transition-all ${expanded ? 'bg-zinc-950/40' : 'hover:bg-zinc-950/20'}`}
                    >
                      <div className="flex items-center gap-8">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white font-black text-2xl italic shrink-0 group-hover:border-orange-500/50 transition-colors shadow-inner">
                          {customer.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-black text-white text-2xl uppercase italic tracking-tighter leading-none mb-2">{customer.name}</p>
                          <div className="flex items-center gap-4 text-zinc-600">
                             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic group-hover:text-zinc-400">
                                <Mail className="w-3.5 h-3.5 text-orange-500" /> {customer.email}
                             </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 self-end md:self-center">
                        <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest italic border flex items-center gap-2 ${
                          customer.customerStatus === "client"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                            : "bg-orange-500/10 border-orange-500/20 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.05)]"
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${customer.customerStatus === "client" ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`} />
                          {customer.customerStatus === "client" ? "Active Asset" : "Access Request"}
                        </div>
                        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl group-hover:text-orange-500 transition-colors">
                           {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {expanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-zinc-800/50 bg-zinc-950/20"
                        >
                          <div className="p-8 md:p-12 space-y-12">
                            
                            {/* Analysis Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 group/item hover:border-zinc-700 transition-colors">
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4 italic">Diagnostic Status</p>
                                <div className="flex items-center justify-between">
                                   <p className="text-base font-black text-white uppercase italic truncate">
                                     {assessment ? assessment.status : "NOT DETECTED"}
                                   </p>
                                   <Activity className={`w-5 h-5 ${assessment ? 'text-emerald-500' : 'text-zinc-800'}`} />
                                </div>
                              </div>
                              <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 group/item hover:border-zinc-700 transition-colors">
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4 italic">Deployment Plan</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-base font-black text-white uppercase italic truncate">
                                    {activePlan ? activePlan.name : "NONE ASSIGNED"}
                                  </p>
                                  <Target className={`w-5 h-5 ${activePlan ? 'text-orange-500' : 'text-zinc-800'}`} />
                                </div>
                              </div>
                              <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 group/item hover:border-zinc-700 transition-colors">
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4 italic">Manifest Initiation</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-base font-black text-white uppercase italic truncate">{formatDate(customer.createdAt)}</p>
                                  <Calendar className="w-5 h-5 text-blue-500" />
                                </div>
                              </div>
                            </div>

                            {/* Logistics & Command */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                
                               {/* Logistics Details */}
                               <div className="space-y-6">
                                 <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic mb-8 border-l-2 border-orange-500 pl-4">Client Logistics</h4>
                                 <div className="grid grid-cols-1 gap-4">
                                     <div className="flex items-center gap-5 p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl group/link hover:border-zinc-600 transition-colors cursor-pointer">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover/link:text-orange-500 transition-colors">
                                           <Mail className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">TERMINAL EMAIL</p>
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest italic">{customer.email || "IDENTIFIER MISSING"}</p>
                                        </div>
                                     </div>
                                     <div className="flex items-center gap-5 p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl group/link hover:border-zinc-600 transition-colors cursor-pointer">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover/link:text-orange-500 transition-colors">
                                           <Smartphone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">COMMS UPLINK</p>
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest italic">{customer.phone || "CHANNELS SILENT"}</p>
                                        </div>
                                     </div>
                                 </div>
                               </div>

                               {/* Command & Control */}
                               <div className="space-y-6">
                                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic mb-8 border-l-2 border-orange-500 pl-4">Administrative Protocol</h4>
                                  
                                  <div className="flex flex-col gap-6">
                                    {customer.customerStatus === "request" && (
                                      <button
                                        onClick={async () => {
                                          await updateProfile(customer.id, { customerStatus: "client" });
                                          await loadData();
                                        }}
                                        className="bg-emerald-500 text-white p-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-emerald-400 transition-all active:scale-95 flex items-center justify-center gap-4 italic shadow-xl shadow-emerald-950/20"
                                      >
                                        <CheckCircle className="w-5 h-5" /> Initialize Client Conversion
                                      </button>
                                    )}

                                    {trainers.length > 0 && (
                                      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 space-y-8">
                                        {(() => {
                                          const activePlan = plans.find((p) => p.userId === customer.id && p.status === "active");
                                          const assignedTrainer = activePlan?.trainerId
                                            ? trainers.find(t => t.id === activePlan.trainerId)
                                            : null;

                                          return (
                                            <>
                                              <div className="flex items-center justify-between">
                                                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Asset Handler Assignment</p>
                                                 {assignedTrainer && <span className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)]" />}
                                              </div>
                                              
                                              <div className="flex items-center gap-6">
                                                {assignedTrainer ? (
                                                  <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-xl italic shadow-inner">
                                                      {assignedTrainer.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-black text-white italic uppercase tracking-tighter leading-none mb-1">
                                                        {assignedTrainer.name}
                                                        </p>
                                                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">Authorized Personal Trainer</p>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <div className="flex items-center gap-4 py-4 text-zinc-800">
                                                      <Shield className="w-8 h-8 opacity-20" />
                                                      <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">AWAITING HANDLER AUTHORIZATION</p>
                                                  </div>
                                                )}
                                              </div>
                                              
                                              <div className="pt-2">
                                                {assigningId === customer.id ? (
                                                   <motion.div 
                                                     initial={{ opacity: 0, y: 10 }}
                                                     animate={{ opacity: 1, y: 0 }}
                                                     className="flex flex-col gap-3"
                                                   >
                                                      <select
                                                        defaultValue={activePlan?.trainerId ?? ""}
                                                        onChange={async (e) => {
                                                          if (!e.target.value) return;
                                                          setSaving(true);
                                                          await handleAssignTrainer(customer.id, e.target.value);
                                                          setSaving(false);
                                                        }}
                                                        disabled={saving}
                                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-[10px] font-black text-white uppercase tracking-[0.2em] outline-none focus:border-orange-500 appearance-none italic transition-all"
                                                      >
                                                        <option value="">SELECT HANDLER...</option>
                                                        {trainers.map((t) => <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>)}
                                                      </select>
                                                      <button 
                                                        onClick={() => setAssigningId(null)}
                                                        className="w-full py-4 bg-zinc-900 text-zinc-600 hover:text-white rounded-2xl border border-zinc-800 transition-all font-black text-[9px] uppercase tracking-widest italic"
                                                      >
                                                        ABORT ASSIGNMENT
                                                      </button>
                                                   </motion.div>
                                                ) : (
                                                  <button
                                                    onClick={() => setAssigningId(customer.id)}
                                                    className="w-full flex items-center justify-center gap-4 bg-white text-black hover:bg-orange-500 hover:text-white py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-xl italic"
                                                  >
                                                    <UserCog className="w-4 h-4" /> 
                                                    {assignedTrainer ? "Reassign Asset Handler" : "Authorize handler mission"}
                                                  </button>
                                                )}
                                              </div>
                                            </>
                                          );
                                        })()}
                                      </div>
                                    )}
                                  </div>
                               </div>

                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
