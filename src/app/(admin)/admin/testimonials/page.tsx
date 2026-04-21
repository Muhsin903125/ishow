"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  CheckCircle2, AlertCircle, ChevronLeft, Globe, MapPin 
} from "lucide-react";

export default function AdminTestimonialsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
      console.error("Failed to fetch testimonials:", err);
    }
  };

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user) {
      if (user.role !== 'admin') { router.push('/dashboard'); return; }
      fetchTestimonials();
    }
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
      console.error("Failed to save testimonial:", err);
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
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await deleteTestimonial(id);
      fetchTestimonials();
    } catch (err) {
      console.error("Failed to delete testimonial:", err);
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

  if (loading || !user) return null;

  return (
    <DashboardLayout role="admin">
      <div className="min-h-full bg-zinc-950 relative overflow-hidden p-6 lg:p-8">
        <div className="pointer-events-none absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-[120px]" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-4">
                <ChevronLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-orange-500" />
                Testimonials
              </h1>
              <p className="text-zinc-500 mt-2 text-sm">Manage client success stories for the landing page.</p>
            </div>
            
            {!isAdding && (
              <button 
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20"
              >
                <Plus className="w-5 h-5" /> Add Testimonial
              </button>
            )}
          </div>

          {/* Form Area */}
          {isAdding && (
            <div className="mb-10 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                <h2 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
                  {editingId ? <Edit3 className="w-4 h-4 text-orange-500" /> : <Plus className="w-4 h-4 text-orange-500" />}
                  {editingId ? "Edit Testimonial" : "Create New Testimonial"}
                </h2>
                <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Client Name</label>
                    <input 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                      placeholder="e.g. Khalid A."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Location</label>
                      <input 
                        value={formData.location ?? ""}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                        placeholder="e.g. Dubai"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Result Label</label>
                      <input 
                        value={formData.result_label ?? ""}
                        onChange={(e) => setFormData({...formData, result_label: e.target.value})}
                        className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                        placeholder="e.g. Lost 12kg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Rating (1-5)</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button 
                          key={r}
                          type="button"
                          onClick={() => setFormData({...formData, rating: r})}
                          className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${formData.rating >= r ? "bg-orange-500/10 border-orange-500 text-orange-500" : "bg-zinc-800 border-zinc-700 text-zinc-500"}`}
                        >
                          <Star className={`w-5 h-5 ${formData.rating >= r ? "fill-orange-500" : ""}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Success Story Quote</label>
                    <textarea 
                      required
                      value={formData.quote}
                      onChange={(e) => setFormData({...formData, quote: e.target.value})}
                      rows={5}
                      className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all resize-none"
                      placeholder="Enter the client's story..."
                    />
                  </div>
                  <div className="flex items-center gap-3 bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                    <input 
                      type="checkbox"
                      id="is_published"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                      className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-orange-500 focus:ring-orange-500"
                    />
                    <label htmlFor="is_published" className="text-sm font-bold text-zinc-300 cursor-pointer">Publish immediately</label>
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-zinc-800">
                   <button 
                    type="button"
                    onClick={() => { setIsAdding(false); setEditingId(null); }}
                    className="px-6 py-3 rounded-xl border border-zinc-800 text-zinc-400 font-bold hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="inline-flex items-center gap-2 bg-white text-black font-bold px-8 py-3 rounded-xl hover:bg-zinc-200 transition-colors shadow-lg"
                  >
                    <Save className="w-5 h-5" /> {editingId ? "Update Testimonial" : "Save Testimonial"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.length === 0 ? (
              <div className="md:col-span-3 text-center py-20 bg-zinc-900 border border-dashed border-zinc-800 rounded-3xl">
                <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 font-medium">No testimonials yet. Add your first success story!</p>
              </div>
            ) : (
              testimonials.map((t) => (
                <div key={t.id} className="group bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-all flex flex-col relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
                      ))}
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${t.is_published ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-zinc-800 border-zinc-700 text-zinc-500"}`}>
                      {t.is_published ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {t.is_published ? "Published" : "Draft"}
                    </div>
                  </div>
                  
                  <p className="text-zinc-400 text-sm italic mb-6 flex-grow leading-relaxed line-clamp-4">
                    &quot;{t.quote}&quot;
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-zinc-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">{t.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold uppercase">
                          <MapPin className="w-3 h-3" /> {t.location ?? "UAE"}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-orange-500 uppercase font-black">
                          {t.result_label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(t)}
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Subtle Publish Toggle */}
                  <button 
                    onClick={() => togglePublish(t)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-8 h-4 rounded-full bg-zinc-800 relative shadow-inner overflow-hidden border border-zinc-700">
                      <div className={`absolute top-0 bottom-0 w-1/2 transition-all ${t.is_published ? "left-1/2 bg-green-500" : "left-0 bg-zinc-600"}`} />
                    </div>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
