"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { ProgressChart } from "@/components/ProgressChart";
import { listMeasurements, addMeasurement, type Measurement } from "@/lib/db/measurements";
import { 
  TrendingUp, 
  Plus, 
  Loader2, 
  X, 
  Scale, 
  Ruler, 
  Percent, 
  History, 
  ChevronRight,
  Sparkles,
  Target,
} from "lucide-react";

const METRICS = [
  { key: "weightKg" as const, label: "Mass", unit: "kg", icon: Scale, color: "#f97316" },
  { key: "waistCm" as const, label: "Waist", unit: "cm", icon: Ruler, color: "#3b82f6" },
  { key: "bodyFatPct" as const, label: "Bio-Fat", unit: "%", icon: Percent, color: "#22c55e" },
];

export default function ProgressPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeMetric, setActiveMetric] = useState(0);
  const [form, setForm] = useState({
    recordedAt: new Date().toISOString().split("T")[0],
    weightKg: "",
    bodyFatPct: "",
    chestCm: "",
    waistCm: "",
    hipsCm: "",
    armsCm: "",
    notes: "",
  });

  useEffect(() => {
    if (!loading) {
      if (!user) { router.replace("/login"); return; }
      if (user.role !== "customer") { router.replace("/trainer/dashboard"); return; }
      
      (async () => {
        try {
          const d = await listMeasurements(user.id);
          setMeasurements(d);
        } catch (err) {
          console.error("Error loading measurements:", err);
        } finally {
          setDataLoaded(true);
        }
      })();
    }
  }, [loading, user, router]);

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="customer">
        <div className="p-8 max-w-full space-y-8">
          <div className="h-10 w-48 bg-zinc-900 rounded-lg animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[1,2,3,4].map(i => <div key={i} className="h-24 bg-zinc-900 rounded-2xl animate-pulse" />)}
          </div>
          <div className="h-80 bg-zinc-900 rounded-3xl animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await addMeasurement(user.id, {
        recordedAt: form.recordedAt,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : undefined,
        bodyFatPct: form.bodyFatPct ? parseFloat(form.bodyFatPct) : undefined,
        chestCm: form.chestCm ? parseFloat(form.chestCm) : undefined,
        waistCm: form.waistCm ? parseFloat(form.waistCm) : undefined,
        hipsCm: form.hipsCm ? parseFloat(form.hipsCm) : undefined,
        armsCm: form.armsCm ? parseFloat(form.armsCm) : undefined,
        notes: form.notes || undefined,
      });
      const updated = await listMeasurements(user.id);
      setMeasurements(updated);
      setShowModal(false);
      setForm({
        recordedAt: new Date().toISOString().split("T")[0],
        weightKg: "", bodyFatPct: "", chestCm: "", waistCm: "", hipsCm: "", armsCm: "", notes: "",
      });
    } finally {
      setSaving(false);
    }
  };

  const reversed = [...measurements].reverse();
  const latest = reversed[0];

  return (
    <DashboardLayout role="customer">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-10">
        <div className="max-w-full">
          
          <div className="flex items-center justify-between flex-wrap gap-6 mb-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">
                Anatomic <span className="text-orange-500">Analytics</span>
              </h1>
              <p className="text-zinc-500 mt-2 font-medium">Tracking variance in physiological metrics over time.</p>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setShowModal(true)}
              className="flex items-center gap-3 bg-white text-zinc-950 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-95 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
              Log Data Point
            </motion.button>
          </div>

          {/* Latest Metric Summary */}
          {latest && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              {[
                { label: "Gross Mass", value: latest.weightKg, unit: "KG", icon: Scale, color: "text-orange-500" },
                { label: "Bio-Fat Index", value: latest.bodyFatPct, unit: "%", icon: Percent, color: "text-emerald-500" },
                { label: "Waistline", value: latest.waistCm, unit: "CM", icon: Ruler, color: "text-blue-500" },
                { label: "Thoracic", value: latest.chestCm, unit: "CM", icon: Target, color: "text-rose-500" },
              ].map((stat, i) => (
                <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">{stat.label}</p>
                  </div>
                  <p className="text-2xl font-black text-white italic">
                    {stat.value != null ? (
                       <>
                         {stat.value}
                         <span className="text-[10px] text-zinc-500 ml-1 font-black align-top">{stat.unit}</span>
                       </>
                    ) : (
                      <span className="text-zinc-800">UNSET</span>
                    )}
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Graphical Interface */}
          {measurements.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 mb-10 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                 <TrendingUp className="w-32 h-32 text-white" />
              </div>

              <div className="flex items-center justify-between mb-10 flex-wrap gap-4 relative z-10">
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 shadow-inner">
                      <Sparkles className="w-5 h-5 text-orange-500" />
                   </div>
                   <h2 className="text-lg font-black text-white uppercase italic tracking-widest">Growth Variance</h2>
                </div>
                
                <div className="flex gap-1.5 bg-zinc-950/50 p-1.5 rounded-2xl border border-zinc-800/50">
                  {METRICS.map((m, i) => (
                    <button
                      key={m.key}
                      onClick={() => setActiveMetric(i)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeMetric === i 
                          ? "bg-zinc-800 text-white border border-zinc-700 shadow-xl" 
                          : "text-zinc-600 hover:text-zinc-300"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <ProgressChart
                measurements={measurements}
                metric={METRICS[activeMetric].key}
                label={METRICS[activeMetric].label}
                unit={METRICS[activeMetric].unit}
                color={METRICS[activeMetric].color}
              />
            </motion.div>
          )}

          {/* Detailed History Manifest */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] overflow-hidden"
          >
            <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-black text-white text-base uppercase tracking-widest italic flex items-center gap-3">
                <History className="w-5 h-5 text-zinc-500" />
                Data Inventory
              </h2>
            </div>
            
            {reversed.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-zinc-950/30 text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] italic text-left">
                      <th className="px-8 py-4">Epoch (Date)</th>
                      <th className="px-4 py-4">Mass</th>
                      <th className="px-4 py-4">Bio-Fat</th>
                      <th className="px-4 py-4">Waist</th>
                      <th className="px-4 py-4">Thoracic</th>
                      <th className="px-4 py-4">Log</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/30">
                    {reversed.map(m => (
                      <tr key={m.id} className="hover:bg-zinc-800/30 transition-colors group">
                        <td className="px-8 py-5 font-black text-white uppercase italic text-sm tracking-tight whitespace-nowrap">
                          {new Date(m.recordedAt + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-4 py-5 text-zinc-400 font-bold text-sm">{m.weightKg ?? "—"} <span className="text-[10px] opacity-30">KG</span></td>
                        <td className="px-4 py-5 text-zinc-400 font-bold text-sm">{m.bodyFatPct != null ? `${m.bodyFatPct}%` : "—"}</td>
                        <td className="px-4 py-5 text-zinc-400 font-bold text-sm">{m.waistCm ?? "—"} <span className="text-[10px] opacity-30">CM</span></td>
                        <td className="px-4 py-5 text-zinc-400 font-bold text-sm">{m.chestCm ?? "—"} <span className="text-[10px] opacity-30">CM</span></td>
                        <td className="px-4 py-5">
                             <div className="max-w-[150px] truncate group-hover:whitespace-normal group-hover:text-zinc-200 transition-all text-[10px] text-zinc-600 font-medium">
                               {m.notes || "No operational notes recorded."}
                             </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-20 text-center">
                <div className="w-20 h-20 rounded-full bg-zinc-950 flex items-center justify-center mx-auto mb-8 shadow-inner opacity-20">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <p className="text-zinc-700 font-black uppercase text-xs tracking-widest">No Historical Data Sync Found</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Log Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden relative"
            >
              <div className="px-8 py-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                <div>
                   <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Manual Log</h2>
                   <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-1 italic">Updating biometric manifest</p>
                </div>
                <button title="Close" onClick={() => setShowModal(false)} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-zinc-500" />
                </button>
              </div>
              
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Observation Epoch</label>
                  <input 
                    type="date" 
                    value={form.recordedAt} 
                    onChange={e => setForm(f => ({ ...f, recordedAt: e.target.value }))} 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-3.5 text-sm text-white font-black uppercase focus:border-orange-500 outline-none transition-colors" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Mass (kg)</label>
                    <input type="number" step="0.1" value={form.weightKg} onChange={e => setForm(f => ({ ...f, weightKg: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-orange-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Bio-Fat (%)</label>
                    <input type="number" step="0.1" value={form.bodyFatPct} onChange={e => setForm(f => ({ ...f, bodyFatPct: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Thoracic (cm)</label>
                    <input type="number" step="0.1" value={form.chestCm} onChange={e => setForm(f => ({ ...f, chestCm: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-rose-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Waist (cm)</label>
                    <input type="number" step="0.1" value={form.waistCm} onChange={e => setForm(f => ({ ...f, waistCm: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-blue-500 outline-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Field Notes</label>
                  <textarea 
                    value={form.notes} 
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} 
                    rows={2} 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-400 font-medium focus:border-zinc-500 outline-none" 
                    placeholder="Physical or psychological observations..." 
                  />
                </div>
                
                <button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="w-full bg-white hover:bg-orange-500 text-zinc-950 hover:text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all disabled:opacity-20 active:scale-95"
                >
                  {saving ? "Transmitting..." : "Update Manifest"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
