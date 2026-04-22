"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getPlanTemplates, upsertPlanTemplate, deletePlanTemplate, type PlanTemplate } from "@/lib/db/master";
import { 
  ArrowLeft, 
  FileText, 
  Pencil, 
  Save, 
  Trash2, 
  X,
  Zap,
  Activity,
  Shield,
  Loader2,
  CheckCircle,
  Clock,
  CreditCard,
  Target,
  Plus,
} from "lucide-react";

type Form = {
  id?: string;
  name: string;
  description: string;
  monthlyRate: string;
  paymentFrequency: "monthly" | "weekly";
  duration: string;
};

function blankForm(): Form {
  return { name: "", description: "", monthlyRate: "", paymentFrequency: "monthly", duration: "" };
}

function fromTemplate(t: PlanTemplate): Form {
  return {
    id: t.id,
    name: t.name,
    description: t.description ?? "",
    monthlyRate: t.monthlyRate ? String(t.monthlyRate) : "",
    paymentFrequency: t.paymentFrequency,
    duration: t.duration ?? "",
  };
}

export default function PlanTemplatesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<PlanTemplate[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState<Form>(blankForm());
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const loadData = async () => {
    try {
      setTemplates(await getPlanTemplates(false));
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

  const visible = showAll ? templates : templates.filter((t) => t.isActive);
  const role = user.role === "admin" ? "admin" : "trainer";

  function startEdit(t: PlanTemplate) { 
    setForm(fromTemplate(t)); 
    setEditing(true); 
    setError(""); 
    setSuccess(""); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function cancelEdit() { setForm(blankForm()); setEditing(false); setError(""); setSuccess(""); }
  function update(field: keyof Form, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Directive identity required."); return; }
    setSaving(true);
    setError("");
    try {
      await upsertPlanTemplate({
        id: form.id,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        monthlyRate: form.monthlyRate ? Number(form.monthlyRate) : undefined,
        paymentFrequency: form.paymentFrequency,
        duration: form.duration.trim() || undefined,
        isActive: true,
      });
      setSuccess(form.id ? "Blueprint updated." : "Blueprint authorized.");
      setTimeout(() => {
        cancelEdit();
        loadData();
        setSaving(false);
      }, 800);
    } catch {
      setError("System Link Failure: Blueprint sync aborted.");
      setSaving(false);
    }
  }

  async function handleToggle(t: PlanTemplate) {
    await upsertPlanTemplate({ ...t, isActive: !t.isActive });
    await loadData();
  }

  async function handleDelete(t: PlanTemplate) {
    if (!window.confirm(`Purge blueprint "${t.name.toUpperCase()}"? This action is terminal.`)) return;
    await deletePlanTemplate(t.id);
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
                   Syllabus <span className="text-violet-500">Blueprints</span>
                </h1>
                <p className="text-zinc-500 mt-1 font-medium text-sm">Designing baseline operational directives and program logistics.</p>
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
               <FileText className="w-24 h-24 text-white" />
            </div>

            <div className="flex items-center justify-between mb-10 relative z-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 shadow-inner">
                     {editing ? <Pencil size={20} /> : <Plus size={20} />}
                  </div>
                  <div>
                     <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">{editing ? "Modify Blueprint" : "Establish New Blueprint"}</h2>
                     <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-1 italic">Tactical program integration</p>
                  </div>
               </div>
               {editing && (
                 <button type="button" onClick={cancelEdit} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-600 hover:text-white transition-colors">
                   <X size={20} />
                 </button>
               )}
            </div>

            <div className="grid gap-8 sm:grid-cols-12 relative z-10">
              <div className="sm:col-span-12">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Blueprint Code (Name)</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={(e) => update("name", e.target.value)} 
                  placeholder="E.G. 12-WEEK KINETIC OVERHAUL"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white font-black uppercase tracking-tight focus:border-violet-500/50 outline-none transition-all placeholder:text-zinc-800"
                />
              </div>
              <div className="sm:col-span-12">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Program Logistics (Description)</label>
                <textarea 
                  value={form.description} 
                  onChange={(e) => update("description", e.target.value)} 
                  rows={2}
                  placeholder="DESCRIBE THE CORE OPERATIONAL PARAMETERS..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white font-black uppercase focus:border-zinc-600 outline-none transition-all placeholder:text-zinc-800 resize-none"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Gross Rate (AED)</label>
                <div className="relative">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 font-black italic">AED</div>
                   <input 
                     type="number" 
                     min="0" 
                     value={form.monthlyRate} 
                     onChange={(e) => update("monthlyRate", e.target.value)}
                     placeholder="2000"
                     className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-16 pr-6 py-4 text-sm text-white font-black focus:border-zinc-600 outline-none transition-all"
                   />
                </div>
              </div>
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Settle Cadence</label>
                <select 
                   value={form.paymentFrequency} 
                   onChange={(e) => update("paymentFrequency", e.target.value as "monthly" | "weekly")}
                   className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-xs text-white font-black uppercase tracking-widest italic outline-none focus:border-zinc-600 appearance-none"
                >
                   <option value="monthly">MONTHLY SETTLE</option>
                   <option value="weekly">WEEKLY SETTLE</option>
                </select>
              </div>
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Deployment Span</label>
                <input 
                  type="text" 
                  value={form.duration} 
                  onChange={(e) => update("duration", e.target.value)} 
                  placeholder="E.G. 12 WEEKS"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white font-black uppercase focus:border-zinc-600 outline-none transition-all placeholder:text-zinc-800"
                />
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 relative z-10 border-t border-zinc-800/50 pt-10">
               <button 
                 type="submit" 
                 disabled={saving}
                 className="bg-white text-zinc-950 px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-violet-600 hover:text-white disabled:opacity-50 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 italic"
               >
                 {saving ? <Loader2 size={16} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
                 {editing ? "Update Blueprint" : "Authorize Blueprint"}
               </button>
               {editing && (
                 <button 
                   type="button" 
                   onClick={cancelEdit}
                   className="bg-zinc-950 text-zinc-600 border border-zinc-800 px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[.3em] transition-all italic"
                 >
                   Abort establishment
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
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic">Blueprint Manifest</p>
                <label className="flex items-center gap-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest cursor-pointer group italic">
                   <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="hidden" />
                   <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${showAll ? 'bg-violet-500 border-violet-500 text-white' : 'border-zinc-800 bg-zinc-900 text-transparent'}`}>
                       <CheckCircle size={12} />
                   </div>
                   Reveal Decommissioned
                </label>
             </div>

             <div className="grid gap-4">
               {visible.length === 0 && (
                 <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-[3rem] py-20 text-center">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-zinc-800 opacity-20" />
                    <p className="text-zinc-700 font-black uppercase text-[10px] tracking-[0.5em] italic">Manifest Silent · Blueprints Isolated</p>
                 </div>
               )}
               <AnimatePresence mode="popLayout">
                 {visible.map((t, idx) => (
                   <motion.div 
                     layout
                     key={t.id} 
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     transition={{ delay: idx * 0.02 }}
                     className={`rounded-[2rem] border p-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-all group relative overflow-hidden ${
                       t.isActive ? "bg-zinc-900 border-zinc-800 hover:border-zinc-600 shadow-2xl" : "bg-zinc-950 border-zinc-900 opacity-40 grayscale"
                     }`}
                   >
                     <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-10 transition-opacity pointer-events-none">
                        <FileText className="w-24 h-24 text-white" />
                     </div>

                     <div className="flex items-center gap-8 relative z-10 w-full md:w-auto">
                        <div className="w-16 h-16 rounded-[2rem] bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-violet-500 transition-colors shadow-inner shrink-0">
                           <Target size={28} />
                        </div>
                        <div>
                           <h3 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none mb-3">{t.name}</h3>
                           <div className="flex flex-wrap items-center gap-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">
                              <span className="bg-zinc-950 px-2 py-1 rounded text-zinc-400 border border-zinc-800/50 flex items-center gap-2">
                                 <CreditCard size={10} /> {t.monthlyRate ? `AED ${t.monthlyRate} / ${t.paymentFrequency}` : "COMMERCIAL VALUATION PENDING"}
                              </span>
                              <span className="bg-zinc-950 px-2 py-1 rounded text-zinc-400 border border-zinc-800/50 flex items-center gap-2">
                                 <Clock size={10} /> {t.duration || "OPEN SPAN"}
                              </span>
                              <span className="w-full md:w-auto mt-2 md:mt-0 font-bold text-zinc-700 tracking-tight normal-case italic line-clamp-1">{t.description}</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-4 self-end md:self-center relative z-10 shrink-0">
                        <button 
                           onClick={() => handleToggle(t)} 
                           className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest italic border transition-all ${
                             t.isActive 
                               ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                               : "bg-zinc-800 border-zinc-700 text-zinc-600"
                           }`}
                        >
                           {t.isActive ? "Authorized" : "Decommissioned"}
                        </button>
                        <div className="flex gap-2">
                           <button onClick={() => startEdit(t)} className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 hover:text-white hover:border-zinc-600 transition-all">
                              <Pencil size={16} />
                           </button>
                           <button onClick={() => handleDelete(t)} className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 hover:text-rose-500 hover:border-rose-500/30 transition-all">
                              <Trash2 size={16} />
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
