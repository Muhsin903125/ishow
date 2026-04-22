"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  UserPlus, Shield, Zap, Mail, Phone, Lock, 
  Search, Filter, MoreHorizontal, User as UserIcon,
  CheckCircle2, AlertCircle, Dumbbell, ChevronRight,
  LayoutGrid, List, MapPin, Star
} from "lucide-react";

interface TrainerProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function TrainerTeamPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTeam = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, created_at')
        .eq('role', 'trainer')
        .order('name');

      if (error) throw error;
      setTrainers(data || []);
    } catch (err) {
      console.error("Failed to fetch tactical team assets:", err);
    } finally {
      setDataLoaded(true);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    // Only trainers or admins should reach here (though this is the trainer portal)
    if (user.role !== 'trainer' && user.role !== 'admin') { 
      router.replace('/dashboard'); 
      return; 
    }
    fetchTeam();
  }, [loading, user, router]);

  const filteredTrainers = trainers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="trainer">
        <div className="p-8 max-w-full space-y-10 animate-pulse">
           <div className="h-12 w-64 bg-zinc-900 rounded-xl" />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-48 bg-zinc-900 rounded-[2rem]" />)}
           </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="trainer">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-10">
        <div className="max-w-full space-y-10 pb-20">
          
          {/* ── Page Header ─────────────────────────────────── */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-6">
                 <Shield className="w-3 h-3 fill-orange-500" /> Operational Unit
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                Tactical <span className="text-orange-500">Team</span>
              </h1>
              <p className="text-zinc-500 mt-4 font-medium max-w-xl italic">
                Authorized Personnel Manifest. View active operational units and high-performance tactical trainers.
              </p>
            </div>
          </motion.div>

          {/* ── Controls ────────────────────────────────────── */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl"
          >
             <div className="flex items-center gap-6">
                <div className="relative group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                   <input 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="FILTER PERSONNEL..."
                     className="bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-2.5 text-[10px] font-black tracking-widest text-white outline-none focus:border-orange-500/50 w-64 transition-all"
                   />
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? "bg-orange-500 text-white" : "text-zinc-500 hover:text-white"}`}>
                      <LayoutGrid className="w-4 h-4" />
                   </button>
                   <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? "bg-orange-500 text-white" : "text-zinc-500 hover:text-white"}`}>
                      <List className="w-4 h-4" />
                   </button>
                </div>
             </div>
             <div className="hidden md:block text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">
                Active Units in Field: <span className="text-white">{trainers.length}</span>
             </div>
          </motion.div>

          {/* ── Admin Gate Message ────────────────────────── */}
          {user?.role !== "admin" && (
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-zinc-900/30 border-l-4 border-orange-500 p-6 rounded-2xl flex items-center gap-6"
            >
               <div className="p-3 bg-orange-500/10 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-orange-500" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 italic">Tactical Clearance Level Required</p>
                  <p className="text-sm font-bold text-white italic">Personnel deployment must be initiated by System Admin. Contact HQ for new team recruitment.</p>
               </div>
            </motion.div>
          )}

          {/* ── Personnel Grid/List ────────────────────────── */}
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            <AnimatePresence mode="popLayout">
              {filteredTrainers.map((t, idx) => (
                <motion.div 
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`group relative bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden hover:border-zinc-700 transition-all ${viewMode === 'list' ? 'flex items-center gap-8 p-6' : 'p-8'}`}
                >
                  {/* Subtle Gradient Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[50px] pointer-events-none group-hover:bg-orange-500/10 transition-all" />

                  {/* Avatar / Icon */}
                  <div className={`relative ${viewMode === 'list' ? 'shrink-0' : 'mb-8 flex justify-between items-start'}`}>
                    <div className="w-16 h-16 rounded-3xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-black text-xl text-zinc-600 group-hover:bg-orange-500 group-hover:text-white transition-all transform group-hover:rotate-6">
                      {t.name.charAt(0)}
                    </div>
                    {viewMode === 'grid' && (
                      <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
                         <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Trainer</span>
                      </div>
                    )}
                  </div>

                  {/* Info Content */}
                  <div className={`flex-1 ${viewMode === 'list' ? 'grid grid-cols-12 items-center gap-6' : ''}`}>
                    <div className={viewMode === 'list' ? 'col-span-4' : 'mb-8'}>
                       <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1.5">{t.name}</h3>
                       <div className="flex items-center gap-3 text-zinc-500">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold tracking-tight">{t.email}</span>
                       </div>
                    </div>

                    {viewMode === 'list' && (
                      <div className="col-span-3">
                         <div className="flex items-center gap-2 text-zinc-600">
                            <Dumbbell className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest font-mono">Specialist</span>
                         </div>
                      </div>
                    )}

                    {viewMode === 'list' && (
                      <div className="col-span-3">
                        <div className="flex items-center gap-2 text-zinc-600">
                          <Star className="w-4 h-4 fill-orange-500/20 text-orange-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest font-mono text-white">Elite Status</span>
                        </div>
                      </div>
                    )}

                    <div className={viewMode === 'list' ? 'col-span-2 flex justify-end' : 'pt-6 border-t border-zinc-800/50 flex justify-between items-center'}>
                       <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Active Sync</span>
                       </div>
                       <button className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-600 hover:text-white hover:border-zinc-600 transition-all">
                          <ChevronRight className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── Empty State ────────────────────────────────── */}
          {filteredTrainers.length === 0 && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="border border-zinc-800 border-dashed rounded-[3rem] py-32 text-center bg-zinc-900/10"
            >
               <UserIcon className="w-16 h-16 text-zinc-800 mx-auto mb-6 opacity-20" />
               <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic">No Personnel Assets Detected</p>
            </motion.div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
