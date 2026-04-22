"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getGoalTypes, upsertGoalType, deleteGoalType, type GoalType } from "@/lib/db/master";
import { 
  ArrowLeft, 
  Target, 
  Pencil, 
  Save, 
  Trash2, 
  X,
  Zap,
  Activity,
  Shield,
  Loader2,
  CheckCircle,
  ArrowRight,
  Plus,
} from "lucide-react";

type Form = { id?: string; name: string; slug: string; description: string; sortOrder: string };

function blankForm(): Form { return { name: "", slug: "", description: "", sortOrder: "0" }; }
function fromGoal(g: GoalType): Form {
  return { id: g.id, name: g.name, slug: g.slug, description: g.description ?? "", sortOrder: String(g.sortOrder) };
}
function toSlug(s: string) { return s.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""); }

export default function GoalTypesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState<GoalType[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState<Form>(blankForm());
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const loadData = async () => {
    try {
      setGoals(await getGoalTypes(false));
    } finally {
      setDataLoaded(true);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (user.role === 'customer') { router.replace('/dashboard'); return; }
    loadData();
  }, [loading, router, user]);

  if (loading || !dataLoaded || !user) {
    return (
      <DashboardLayout role="admin">
        <div className="p-8 max-w-4xl mx-auto animate-pulse space-y-10">
           <div className="h-10 w-48 bg-zinc-900 rounded-lg" />
           <div className="h-64 bg-zinc-900 rounded-[2.5rem]" />
           <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-zinc-900 rounded-2xl" />)}
           </div>
        </div>
      </DashboardLayout>
    );
  }

  const visible = showAll ? goals : goals.filter((g) => g.isActive);
  const role = user.role === "admin" ? "admin" : "trainer";

  function startEdit(g: GoalType) { 
    setForm(fromGoal(g)); 
    setEditing(true); 
    setError(""); 
    setSuccess(""); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() { setForm(blankForm()); setEditing(false); setError(""); setSuccess(""); }
  function update(field: keyof Form, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Identity label required."); return; }
    const slug = form.slug.trim() || toSlug(form.name);
    if (!slug) { setError("Slug coordinate required."); return; }
    
    setSaving(true);
    setError("");
    try {
      await upsertGoalType({
        id: form.id,
        name: form.name.trim(),
        slug,
        description: form.description.trim() || undefined,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: true,
      });
      setSuccess(form.id ? "Objective updated." : "Objective authorized.");
      setTimeout(() => {
        cancelEdit();
        loadData();
        setSaving(false);
      }, 800);
    } catch {
      setError("System Link Failure: Objective sync aborted.");
      setSaving(false);
    }
  }

  async function handleToggle(g: GoalType) {
    await upsertGoalType({ ...g, isActive: !g.isActive });
    await loadData();
  }

  async function handleDelete(g: GoalType) {
    if (!window.confirm(`Purge objective "${g.name.toUpperCase()}"? This cannot be reversed.`)) return;
    await deleteGoalType(g.id);
    await loadData();
  }

  return (
    <DashboardLayout role={role}>
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-8 text-white">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-6">
              <Link href="/admin/master" className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-500 transition-all shadow-xl">
                 <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">
                   Kinetic <span className="text-emerald-500">Objectives</span>
                </h1>
                <p className="text-zinc-500 mt-1 font-medium text-sm">Configuring tactical mission parameters for asset analysis.</p>
              </div>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit} 
            className="mb-12 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group hover:border-zinc-700 transition-all shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-10 transition-opacity">
               <Target className="w-24 h-24 text-white" />
            </div>

            <div className="flex items-center justify-between mb-10 relative z-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                     {editing ? <Pencil size={20} /> : <Plus size={20} />}
                  </div>
                  <div>
                     <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">{editing ? "Modify Objective" : "Authorize New Objective"}</h2>
                     <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-1 italic">Mission parameter integration</p>
                  </div>
               </div>
               {editing && (
                 <button type="button" onClick={cancelEdit} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-600 hover:text-white transition-colors">
                   <X size={20} />
                 </button>
               )}
            </div>

            <div className="grid gap-8 sm:grid-cols-12 relative z-10">
              <div className="sm:col-span-8">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Objective Label (Name)</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({ ...f, name, slug: f.slug || toSlug(name) }));
                  }} 
                  placeholder="E.G. HYPERTROPHY"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white font-black uppercase tracking-tight focus:border-emerald-500/50 outline-none transition-all placeholder:text-zinc-800"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Slug Coordinate</label>
                <input 
                  type="text" 
                  value={form.slug} 
                  onChange={(e) => update("slug", toSlug(e.target.value))} 
                  placeholder="HYPERTROPHY"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white font-black uppercase focus:border-zinc-600 outline-none transition-all placeholder:text-zinc-800 font-mono"
                />
              </div>
              <div className="sm:col-span-8">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Tactical Description</label>
                <input 
                  type="text" 
                  value={form.description} 
                  onChange={(e) => update("description", e.target.value)} 
                  placeholder="OPTIONAL MISSION INTEL..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white font-black uppercase focus:border-zinc-600 outline-none transition-all placeholder:text-zinc-800"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Priority Order</label>
                <input 
                  type="number" 
                  min="0" 
                  value={form.sortOrder} 
                  onChange={(e) => update("sortOrder", e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white font-black focus:border-zinc-600 outline-none text-center"
                />
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 relative z-10 border-t border-zinc-800/50 pt-10">
               <button 
                 type="submit" 
                 disabled={saving}
                 className="bg-white text-zinc-950 px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-white disabled:opacity-50 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 italic"
               >
                 {saving ? <Loader2 size={16} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
                 {editing ? "Update Objective" : "Authorize Objective"}
               </button>
               {editing && (
                 <button 
                   type="button" 
                   onClick={cancelEdit}
                   className="bg-zinc-950 text-zinc-600 border border-zinc-800 px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[.3em] transition-all italic"
                 >
                   Abort integration
                 </button>
               )}
               
               <AnimatePresence>
                 {success && (
                   <motion.div 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 20 }}
                     className="flex-1 flex items-center gap-3 px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl text-[10px] font-black uppercase tracking-widest italic"
                   >
                     <CheckCircle className="w-5 h-5" /> {success}
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </motion.form>

          {/* List Section */}
          <div className="space-y-4">
             <div className="flex items-center justify-between mb-8">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic">Objective Manifest</p>
                <label className="flex items-center gap-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest cursor-pointer group italic">
                   <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="hidden" />
                   <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${showAll ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-800 bg-zinc-900 text-transparent'}`}>
                       <CheckCircle size={12} />
                   </div>
                   Reveal Decommissioned
                </label>
             </div>

             <div className="grid gap-4">
               {visible.length === 0 && (
                 <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-[3rem] py-20 text-center">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-zinc-800 opacity-20" />
                    <p className="text-zinc-700 font-black uppercase text-[10px] tracking-[0.5em] italic">Manifest Silent · Targets Neutralized</p>
                 </div>
               )}
               <AnimatePresence mode="popLayout">
                 {visible.map((g, idx) => (
                   <motion.div 
                     layout
                     key={g.id} 
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     transition={{ delay: idx * 0.02 }}
                     className={`rounded-[2rem] border p-6 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all group relative overflow-hidden ${
                       g.isActive ? "bg-zinc-900 border-zinc-800 hover:border-zinc-600 shadow-2xl" : "bg-zinc-950 border-zinc-900 opacity-40 grayscale"
                     }`}
                   >
                     <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Target className="w-20 h-20 text-white" />
                     </div>

                     <div className="flex items-center gap-6 relative z-10 w-full sm:w-auto">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-emerald-500 transition-colors">
                           <Target size={20} />
                        </div>
                        <div>
                           <h3 className="text-sm font-black text-white italic uppercase tracking-widest leading-none mb-2">{g.name}</h3>
                           <div className="flex items-center gap-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">
                              <span className="text-zinc-400 font-mono tracking-tight">{g.slug}</span>
                              <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                              <span className="max-w-[200px] truncate">{g.description || "NOintel DATA"}</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-4 self-end sm:self-center relative z-10 shrink-0">
                        <button 
                           onClick={() => handleToggle(g)} 
                           className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest italic border transition-all ${
                             g.isActive 
                               ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                               : "bg-zinc-800 border-zinc-700 text-zinc-600"
                           }`}
                        >
                           {g.isActive ? "Operational" : "Neutralized"}
                        </button>
                        <div className="flex gap-2">
                           <button onClick={() => startEdit(g)} className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-600 hover:text-white hover:border-zinc-600 transition-all">
                              <Pencil size={14} />
                           </button>
                           <button onClick={() => handleDelete(g)} className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-600 hover:text-rose-500 hover:border-rose-500/30 transition-all">
                              <Trash2 size={14} />
                           </button>
                        </div>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
