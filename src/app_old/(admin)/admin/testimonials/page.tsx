"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { 
  listTestimonials, 
  createTestimonial, 
  updateTestimonial, 
  deleteTestimonial,
  type Testimonial 
} from "@/lib/db/testimonials";
import { 
  MessageSquare, Star, Plus, Trash2, Edit3, Save, X, 
  CheckCircle2, AlertCircle, ChevronLeft, Globe, MapPin,
  Zap, Quote, Shield, Filter, Search, MoreHorizontal,
  LayoutGrid, List
} from "lucide-react";

export default function AdminTestimonialsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [formData, setFormData] = useState<Omit<Testimonial, 'id' | 'created_at'>>({
    name: "",
    location: "",
    result_label: "",
    quote: "",
    rating: 5,
    is_published: false
  });

  const fetchTestimonials = async () => {
    try {
      const data = await listTestimonials();
      setTestimonials(data);
    } catch (err) {
      console.error("Failed to fetch intelligence assets:", err);
    } finally {
      setDataLoaded(true);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (user.role !== 'admin') { router.replace('/dashboard'); return; }
    fetchTestimonials();
  }, [loading, router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTestimonial(editingId, formData);
      } else {
        await createTestimonial(formData);
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: "", location: "", result_label: "", quote: "", rating: 5, is_published: false });
      fetchTestimonials();
    } catch (err) {
      console.error("Failed to sync testimonial data:", err);
    }
  };

  const handleEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setFormData({
      name: t.name,
      location: t.location ?? "",
      result_label: t.result_label ?? "",
      quote: t.quote,
      rating: t.rating,
      is_published: t.is_published
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm asset termination? This action cannot be reversed.")) return;
    try {
      await deleteTestimonial(id);
      fetchTestimonials();
    } catch (err) {
      console.error("Failed to terminate testimonial asset:", err);
    }
  };

  const togglePublish = async (t: Testimonial) => {
    try {
      await updateTestimonial(t.id, { is_published: !t.is_published });
      fetchTestimonials();
    } catch (err) {
      console.error("Failed to toggle publish status:", err);
    }
  };

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="admin">
        <div className="p-8 max-w-6xl mx-auto space-y-10 animate-pulse">
           <div className="h-12 w-64 bg-zinc-900 rounded-xl" />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-64 bg-zinc-900 rounded-[2.5rem]" />)}
           </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
          
          {/* ── Page Header ─────────────────────────────────── */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4"
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-6">
                 <Shield className="w-3 h-3 fill-orange-500" /> Success Manifest
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                Elite <span className="text-orange-500">Testimonials</span>
              </h1>
              <p className="text-zinc-500 mt-4 font-medium max-w-xl italic">Curating strategic success vectors and transformation narratives for the primary landing interface.</p>
            </div>
            <div className="flex gap-4">
              {!isAdding && (
                <button 
                  onClick={() => setIsAdding(true)}
                  className="bg-orange-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add New Asset
                </button>
              )}
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
                     placeholder="FILTER MANIFEST..."
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
             <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">
                Active Assets: <span className="text-white">{testimonials.length}</span>
             </div>
          </motion.div>

          {/* ── Form Modalish Overlay ───────────────────────── */}
          <AnimatePresence>
            {isAdding && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative z-50"
              >
                <div className="p-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/20">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                        <Zap className="w-5 h-5 text-orange-500 fill-orange-500" />
                     </div>
                     <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">
                       {editingId ? "Modify Tactical Asset" : "Initialize Success Deployment"}
                     </h2>
                  </div>
                  <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="p-2 text-zinc-500 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 italic px-2">Assigned Subject</label>
                      <input 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-orange-500/50 outline-none transition-all placeholder:text-zinc-800"
                        placeholder="Subject Name..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 italic px-2">Deployment Zone</label>
                        <input 
                          value={formData.location ?? ""}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-orange-500/50 outline-none transition-all placeholder:text-zinc-800"
                          placeholder="Zone (e.g. Dubai)..."
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 italic px-2">Tactical Metric</label>
                        <input 
                          value={formData.result_label ?? ""}
                          onChange={(e) => setFormData({...formData, result_label: e.target.value})}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-orange-500 font-black focus:border-orange-500/50 outline-none transition-all placeholder:text-zinc-800 uppercase italic"
                          placeholder="Metric (e.g. -12KG)..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 italic px-2">Confidence Level (Rating)</label>
                      <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <button 
                            key={r}
                            type="button"
                            onClick={() => setFormData({...formData, rating: r})}
                            className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${formData.rating >= r ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-zinc-950 border-zinc-800 text-zinc-700 hover:border-zinc-600"}`}
                          >
                            <Star className={`w-6 h-6 ${formData.rating >= r ? "fill-white" : ""}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col h-full space-y-8">
                    <div className="flex-1 min-h-[200px]">
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 italic px-2">Success Narrative (Quote)</label>
                      <textarea 
                        required
                        value={formData.quote}
                        onChange={(e) => setFormData({...formData, quote: e.target.value})}
                        className="w-full h-full bg-zinc-950 border border-zinc-800 rounded-3xl px-6 py-6 text-white font-medium focus:border-orange-500/50 outline-none transition-all resize-none placeholder:text-zinc-800 leading-relaxed italic"
                        placeholder="Enter the tactical transformation report..."
                      />
                    </div>
                    <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 p-6 rounded-3xl group">
                      <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.is_published ? "bg-emerald-500" : "bg-zinc-800"}`}
                        onClick={() => setFormData({...formData, is_published: !formData.is_published})}
                      >
                         <div className={`w-4 h-4 bg-white rounded-full transition-all ${formData.is_published ? "translate-x-6" : "translate-x-0"}`} />
                      </div>
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest cursor-pointer group-hover:text-white transition-colors italic">Interface Deployment (Public)</label>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-6 pt-10 border-t border-zinc-800">
                     <button 
                      type="button"
                      onClick={() => { setIsAdding(false); setEditingId(null); }}
                      className="px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                    >
                      Abort Sync
                    </button>
                    <button 
                      type="submit"
                      className="bg-white text-zinc-950 px-12 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-3"
                    >
                      <Save className="w-4 h-4" /> {editingId ? "Synchronize Asset" : "Deploy To Primary"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Testimonial Grid ────────────────────────────── */}
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
            {testimonials.length === 0 ? (
              <div className="col-span-full border border-zinc-800 border-dashed rounded-[3rem] py-32 text-center bg-zinc-900/20">
                 <Quote className="w-16 h-16 text-zinc-800 mx-auto mb-6 opacity-20" />
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic">No Strategic Assets Calibrated</p>
              </div>
            ) : (
              testimonials.map((t, idx) => (
                <motion.div 
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className={`group relative bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 hover:border-zinc-700 transition-all flex flex-col ${viewMode === 'list' ? 'flex-row items-center gap-8 py-6' : ''}`}
                >
                  <div className={`mb-6 flex items-center justify-between ${viewMode === 'list' && 'mb-0 shrink-0'}`}>
                    <div className="flex gap-1.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? "fill-orange-500 text-orange-500" : "text-zinc-800"}`} />
                      ))}
                    </div>
                    {viewMode === 'grid' && (
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${t.is_published ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-zinc-800 border-zinc-700 text-zinc-500"}`}>
                        {t.is_published ? "Live" : "Standby"}
                      </div>
                    )}
                  </div>
                  
                  <div className={`relative ${viewMode === 'list' ? 'flex-1 grid grid-cols-12 gap-8 items-center' : ''}`}>
                    <div className={viewMode === 'list' ? 'col-span-4' : 'mb-8'}>
                       <p className="text-zinc-400 text-sm italic font-medium leading-relaxed group-hover:text-zinc-200 transition-colors">
                         &quot;{t.quote}&quot;
                       </p>
                    </div>
                    
                    <div className={viewMode === 'list' ? 'col-span-4 flex items-center gap-6' : 'mt-auto pt-6 border-t border-zinc-800 flex items-center justify-between'}>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-black text-zinc-600 italic group-hover:bg-orange-500 group-hover:text-white group-hover:border-transparent transition-all">
                             {t.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-white text-sm uppercase italic tracking-tight">{t.name}</p>
                            <div className="flex items-center gap-4 mt-1.5">
                              <span className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                                <MapPin className="w-3 h-3" /> {t.location || "UAE"}
                              </span>
                            </div>
                          </div>
                       </div>
                       
                       {viewMode === 'grid' && (
                         <div className="bg-orange-500/5 border border-orange-500/10 px-3 py-1.5 rounded-lg">
                           <span className="text-[10px] font-black text-orange-500 uppercase italic tracking-widest">{t.result_label}</span>
                         </div>
                       )}
                    </div>
                    
                    {viewMode === 'list' && (
                      <div className="col-span-2">
                         <div className="bg-orange-500/5 border border-orange-500/10 px-4 py-2 rounded-xl inline-block">
                           <span className="text-[11px] font-black text-orange-500 uppercase italic tracking-[0.1em]">{t.result_label}</span>
                         </div>
                      </div>
                    )}

                    <div className={viewMode === 'list' ? 'col-span-2 flex justify-end gap-3' : 'absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 flex gap-2'}>
                      <button 
                        onClick={() => handleEdit(t)}
                        className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-white transition-all flex items-center justify-center hover:border-zinc-600"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-rose-500 transition-all flex items-center justify-center hover:border-rose-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
