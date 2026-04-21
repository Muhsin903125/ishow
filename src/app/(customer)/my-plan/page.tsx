"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { getActivePlan, type Plan } from "@/lib/db/plans";
import { getAssessment, type Assessment } from "@/lib/db/assessments";
import { getProfile, type Profile } from "@/lib/db/profiles";
import {
  Target,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  Clock,
  ArrowRight,
  Zap,
  Loader2,
  Shield,
  ZapOff,
} from "lucide-react";

export default function MyPlanPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [trainer, setTrainer] = useState<Profile | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
        return;
      }
      if (user.role !== "customer") {
        router.replace("/trainer/dashboard");
        return;
      }

      (async () => {
        try {
          const [activePlan, userAssessment] = await Promise.all([
            getActivePlan(user.id),
            getAssessment(user.id)
          ]);
          
          setPlan(activePlan);
          setAssessment(userAssessment);

          if (activePlan?.trainerId) {
            const trainerData = await getProfile(activePlan.trainerId);
            setTrainer(trainerData);
          }
        } catch (err) {
          console.error("Error loading plan data:", err);
        } finally {
          setDataLoaded(true);
        }
      })();
    }
  }, [user, loading, router]);

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="customer">
        <div className="p-8 max-w-4xl mx-auto space-y-8">
          <div className="h-10 w-48 bg-zinc-900 rounded-lg animate-pulse" />
          <div className="h-64 w-full bg-zinc-900 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-40 bg-zinc-900 rounded-2xl animate-pulse" />
            <div className="h-40 bg-zinc-900 rounded-2xl animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="customer">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">
              My Training <span className="text-orange-500">Block</span>
            </h1>
            <p className="text-zinc-500 mt-2 font-medium">Your personalized architecture for high performance.</p>
          </motion.div>

          {plan ? (
            <AnimatePresence>
              <div className="space-y-8">
                {/* Plan Hero Card */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group overflow-hidden bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5 pointer-events-none" />
                  
                  <div className="flex items-start justify-between flex-wrap gap-8 relative z-10">
                    <div className="flex-1 min-w-[300px]">
                      <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-xs font-black uppercase text-emerald-500 mb-6 tracking-widest">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Operational
                      </div>
                      <h2 className="text-4xl font-black text-white mb-4 italic uppercase leading-none">{plan.name}</h2>
                      <p className="text-zinc-400 leading-relaxed max-w-xl font-medium">
                        {plan.description || "Building the foundation for your physical transformation through structured, progressive overload."}
                      </p>
                    </div>
                    
                    <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 text-center min-w-[180px]">
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Standard Rate</p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-zinc-500 text-sm font-bold">AED</span>
                        <span className="text-4xl font-black text-white">{plan.monthlyRate || "—"}</span>
                      </div>
                      <div className="mt-3 px-3 py-1 bg-white/5 rounded-lg text-zinc-400 text-[10px] font-black uppercase tracking-wider">
                        {plan.paymentFrequency} billing
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Goals */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-orange-500" />
                      </div>
                      <h3 className="font-black text-white uppercase tracking-wider text-sm italic">Strategic Objectives</h3>
                    </div>
                    <div className="space-y-3">
                      {plan.goals.length > 0 ? plan.goals.map((goal, i) => (
                        <div key={i} className="flex items-center gap-3 group">
                          <div className="w-5 h-5 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700 group-hover:border-orange-500/50 transition-colors">
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                          </div>
                          <span className="text-zinc-300 text-sm font-bold uppercase tracking-tight">{goal.replace(/_/g, ' ')}</span>
                        </div>
                      )) : (
                        <span className="text-zinc-600 text-xs font-bold uppercase">No specific targets defined yet.</span>
                      )}
                    </div>
                  </motion.div>

                  {/* Trainer Info */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-500" />
                      </div>
                      <h3 className="font-black text-white uppercase tracking-wider text-sm italic">Command & Control</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      {trainer?.avatarUrl ? (
                        <img src={trainer.avatarUrl} className="w-14 h-14 rounded-2xl object-cover border border-white/10" alt={trainer.name} />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-white border border-white/10 shadow-inner">
                          <Shield className="w-6 h-6 text-zinc-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-black text-white uppercase tracking-tight">{trainer?.name || "Unassigned"}</p>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-0.5">Head Coach / Strategist</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Status</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Logistics */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-zinc-400" />
                      </div>
                      <h3 className="font-black text-white uppercase tracking-wider text-sm italic">Logistics</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Deployment Date</span>
                        <span className="text-sm font-black text-white uppercase tracking-tight">
                          {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mission Duration</span>
                        <span className="text-sm font-black text-white uppercase tracking-tight">{plan.duration || "Indefinite"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Profile Status</span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[10px] font-black uppercase tracking-widest">
                          {plan.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Actions */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-orange-500 rounded-3xl p-6 shadow-xl shadow-orange-500/20"
                  >
                    <h3 className="font-black text-zinc-950 uppercase tracking-wider text-sm italic mb-6">Execution Hub</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Link href="/sessions" className="flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-colors">
                        <Calendar className="w-3.5 h-3.5" />
                        Sessions
                      </Link>
                      <Link href="/payments" className="flex items-center justify-center gap-2 bg-zinc-950/20 hover:bg-zinc-950/30 text-zinc-950 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-colors">
                        <DollarSign className="w-3.5 h-3.5" />
                        Billing
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>
            </AnimatePresence>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-12 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
              
              {!assessment ? (
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-orange-500/20">
                    <Target className="w-10 h-10 text-orange-500" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-3 uppercase italic">No Assessment Found</h2>
                  <p className="text-zinc-500 mb-10 max-w-md mx-auto font-medium">
                    Initiate your physical analysis to enable blueprint creation. Your coach cannot strategize without your baseline data.
                  </p>
                  <Link href="/assessment" className="inline-flex items-center gap-4 bg-orange-500 text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 group">
                    Initialize Assessment
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ) : (
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/20">
                    <Clock className="w-10 h-10 text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-3 uppercase italic">Strategizing in Progress</h2>
                  <p className="text-zinc-500 mb-8 max-w-md mx-auto font-medium">
                    Our team is analyzing your baseline metrics ([assessment_v1]). Your hyper-personalized protocol will be deployed shortly.
                  </p>
                  <div className="inline-flex items-center gap-3 bg-zinc-950 border border-zinc-800 text-blue-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    Review Status: Priority Processing
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
