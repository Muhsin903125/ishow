"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { listTrainers, updateProfile, deleteProfile, type Profile } from "@/lib/db/profiles";
import { 
  UserCog, 
  Plus, 
  Mail, 
  Phone, 
  Pencil, 
  Trash2, 
  X, 
  Send, 
  CheckCircle,
  Shield,
  Zap,
  Activity,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  Loader2,
  Smartphone,
  Search,
} from "lucide-react";

type Mode = "idle" | "invite" | "edit";

export default function AdminTrainersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [trainers, setTrainers] = useState<Profile[]>([]);
  const [mode, setMode] = useState<Mode>("idle");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviting, setInviting] = useState(false);

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editError, setEditError] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      setTrainers(await listTrainers());
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
           <div className="grid grid-cols-1 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-3xl" />)}
           </div>
        </div>
      </DashboardLayout>
    );
  }

  function startEdit(trainer: Profile) {
    setEditingId(trainer.id);
    setEditName(trainer.name);
    setEditPhone(trainer.phone ?? "");
    setEditError("");
    setMode("edit");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError("");
    setMode("idle");
  }

  async function saveEdit() {
    if (!editingId || !editName.trim()) { setEditError("Identity identifier required."); return; }
    await updateProfile(editingId, { name: editName.trim(), phone: editPhone.trim() || undefined });
    cancelEdit();
    await loadData();
  }

  async function handleDelete(trainer: Profile) {
    if (!window.confirm(`Purge credentials for ${trainer.name.toUpperCase()}? This action is irreversible.`)) return;
    await deleteProfile(trainer.id);
    await loadData();
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError("");
    if (!inviteName.trim() || !inviteEmail.trim()) { setInviteError("Full identifier and terminal email required."); return; }
    setInviting(true);
    try {
      const res = await fetch("/api/admin/invite-trainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inviteName.trim(), email: inviteEmail.trim(), phone: invitePhone.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { setInviteError(json.error ?? "Invitation dispatch failed."); return; }
      setInviteSuccess(`Invitation dispatched to ${inviteEmail}. Cipher synchronization required.`);
      setInviteName(""); setInviteEmail(""); setInvitePhone("");
      await loadData();
    } catch {
      setInviteError("Network interference detected.");
    } finally {
      setInviting(false);
    }
  }

  const filteredTrainers = trainers.filter(t => 
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.email?.toLowerCase().includes(searchQuery.toLowerCase())
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
                 Trainer <span className="text-orange-500">Corps</span>
              </h1>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest italic">Operational Personnel Directory</p>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  type="text" 
                  placeholder="SEARCH MANIFEST..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black text-white uppercase tracking-widest focus:border-orange-500/50 outline-none transition-all placeholder:text-zinc-800"
                />
              </div>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => { setMode("invite"); setInviteError(""); setInviteSuccess(""); }}
                className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Deploy New Asset
              </motion.button>
            </div>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                  { label: "Active Assets", value: trainers.length, icon: Shield, color: "text-orange-500" },
                  { label: "Avg Managed Nodes", value: "~12", icon: Activity, color: "text-zinc-500" },
                  { label: "Corps Health", value: "Optimal", icon: Zap, color: "text-emerald-500" },
                  { label: "Deployment Zones", value: "08", icon: ArrowRight, color: "text-blue-500" },
              ].map((stat, i) => (
                  <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden group"
                  >
                      <stat.icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity ${stat.color.replace('text-', 'fill-')}`} />
                      <p className={`text-[9px] font-bold uppercase tracking-[0.2em] mb-2 italic ${stat.color}`}>{stat.label}</p>
                      <p className="text-2xl font-black text-white italic truncate">{stat.value}</p>
                  </motion.div>
              ))}
          </div>

          {/* Invitation Overlay / Modalish */}
          <AnimatePresence>
            {mode === "invite" && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-[3rem] p-8 md:p-12 shadow-2xl relative"
                >
                  <button onClick={() => setMode("idle")} className="absolute top-8 right-8 p-3 bg-zinc-950 border border-zinc-800 rounded-2xl hover:text-orange-500 transition-colors">
                     <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-5 mb-10">
                     <div className="w-16 h-16 rounded-[2rem] bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                        <UserCog className="w-8 h-8" />
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Deploy Asset</h2>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Personnel Authorization Protocol</p>
                     </div>
                  </div>

                  {inviteSuccess ? (
                    <div className="space-y-6 text-center py-8">
                       <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto text-emerald-500 mb-6">
                           <CheckCircle className="w-10 h-10" />
                       </div>
                       <p className="text-emerald-500 font-black uppercase text-xs italic tracking-[0.3em]">{inviteSuccess}</p>
                       <button onClick={() => setMode("idle")} className="bg-white text-black px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">Understood</button>
                    </div>
                  ) : (
                    <form onSubmit={handleInvite} className="space-y-8">
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic ml-4">Full Identifier</label>
                          <input
                            type="text"
                            value={inviteName}
                            onChange={(e) => setInviteName(e.target.value)}
                            placeholder="OPERATIVE NAME"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-sm text-white font-black uppercase tracking-widest focus:border-orange-500 outline-none transition-all placeholder:text-zinc-800"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic ml-4">Terminal Email</label>
                          <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="ID@MISSION.SH"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-sm text-white font-black uppercase tracking-widest focus:border-orange-500 outline-none transition-all placeholder:text-zinc-800"
                          />
                        </div>
                      </div>

                      {inviteError && (
                        <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2 bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">
                           <AlertCircle className="w-4 h-4" /> {inviteError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={inviting}
                        className="w-full bg-orange-500 text-white py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-orange-600 disabled:opacity-20 transition-all shadow-xl shadow-orange-950/20 active:scale-95 flex items-center justify-center gap-4 italic"
                      >
                        {inviting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Authorize Dispatch</>}
                      </button>
                    </form>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Directory Manifest */}
          <div className="grid grid-cols-1 gap-4">
            {filteredTrainers.length === 0 ? (
              <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-[3rem] py-40 text-center">
                <UserCog className="w-20 h-20 mx-auto mb-8 text-zinc-800 opacity-20" />
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Manifest Silent</h3>
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest italic">No operational assets detected in current sector.</p>
              </div>
            ) : (
              filteredTrainers.map((trainer, tIdx) => (
                <motion.div 
                  key={trainer.id} 
                  initial={{ opacity: 0, y: 10, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: tIdx * 0.05 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 hover:border-orange-500/30 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                     <Shield className="w-32 h-32 text-orange-500 shadow-2xl" />
                  </div>

                  {mode === "edit" && editingId === trainer.id ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10"
                    >
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic ml-4">Identity Identifier</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-xs text-white font-black uppercase focus:border-orange-500 outline-none"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic ml-4">COMMS Uplink</label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-xs text-white font-black uppercase focus:border-orange-500 outline-none"
                        />
                      </div>
                      <div className="md:col-span-2 flex gap-4 pt-4 border-t border-zinc-800/50">
                        <button onClick={saveEdit} className="bg-orange-500 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-950/40 hover:bg-orange-400 transition-all italic">Commit Protocol</button>
                        <button onClick={cancelEdit} className="bg-zinc-800 text-zinc-400 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-700 hover:text-white transition-all italic">Abort Changes</button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
                      <div className="flex items-center gap-8">
                        <div className="w-20 h-20 rounded-[2rem] bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white font-black text-3xl italic shadow-inner group-hover:border-orange-500/50 transition-colors">
                          {trainer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-4 mb-3">
                             <p className="font-black text-white text-2xl uppercase italic tracking-tighter leading-none">{trainer.name}</p>
                             <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-3 py-1 rounded-lg">
                                <Shield className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase tracking-widest italic">Authorized Operative</span>
                             </div>
                          </div>
                          <div className="flex flex-wrap gap-6 text-zinc-500">
                            {trainer.email && (
                              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest italic group-hover:text-zinc-300 transition-colors">
                                <Mail className="w-4 h-4 text-orange-500" />{trainer.email}
                              </div>
                            )}
                            {trainer.phone && (
                              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest italic group-hover:text-zinc-300 transition-colors">
                                <Smartphone className="w-4 h-4 text-orange-500" />{trainer.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                          onClick={() => startEdit(trainer)}
                          className="flex-1 md:flex-none p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-orange-500 hover:text-orange-500 transition-all text-zinc-600"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(trainer)}
                          className="flex-1 md:flex-none p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-rose-500 hover:text-rose-500 transition-all text-zinc-600"
                        >
                          <Trash2 size={18} />
                        </button>
                        <div className="hidden md:flex ml-4 w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl items-center justify-center text-zinc-700 group-hover:text-orange-500 group-hover:border-orange-500 transition-all">
                           <ArrowRight size={20} />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
