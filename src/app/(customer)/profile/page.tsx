"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateProfile } from "@/lib/db/profiles";
import { 
  User, 
  Lock, 
  Save, 
  Loader2, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Key,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function CustomerProfilePage() {
  const { user, loading, updatePassword } = useAuth();
  const router = useRouter();

  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ newPass: "", confirm: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.replace("/login"); return; }
      if (user.role !== "customer") { router.replace("/trainer/dashboard"); return; }
      
      (async () => {
        try {
          const p = await getProfile(user.id);
          setProfileForm({ name: p?.name ?? "", phone: p?.phone ?? "" });
        } catch (err) {
          console.error("Error loading profile:", err);
        } finally {
          setDataLoaded(true);
        }
      })();
    }
  }, [loading, user, router]);

  if (loading || !dataLoaded || !user) {
    return (
      <DashboardLayout role="customer">
        <div className="p-8 max-w-2xl mx-auto space-y-8">
           <div className="h-10 w-48 bg-zinc-900 rounded-lg animate-pulse" />
           <div className="h-64 bg-zinc-900 rounded-[2.5rem] animate-pulse" />
           <div className="h-64 bg-zinc-900 rounded-[2.5rem] animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) return;
    setProfileSaving(true);
    setProfileMsg("");
    try {
      await updateProfile(user.id, { name: profileForm.name, phone: profileForm.phone });
      setProfileMsg("Credential manifest updated successfully.");
      setTimeout(() => setProfileMsg(""), 3000);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMsg("");
    setPasswordError(false);
    if (passwordForm.newPass.length < 8) {
      setPasswordMsg("Entropy insufficient. Minimum 8 characters required.");
      setPasswordError(true);
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordMsg("Cipher mismatch. Confirm password must be identical.");
      setPasswordError(true);
      return;
    }
    setPasswordSaving(true);
    try {
      const { error } = await updatePassword(passwordForm.newPass);
      if (error) {
        setPasswordMsg(error);
        setPasswordError(true);
      } else {
        setPasswordForm({ newPass: "", confirm: "" });
        setPasswordMsg("Access cipher synchronized successfully.");
        setPasswordError(false);
        setTimeout(() => setPasswordMsg(""), 3000);
      }
    } catch {
      setPasswordMsg("System failure during synchronization. Retry recommended.");
      setPasswordError(true);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <DashboardLayout role="customer">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">
              Control <span className="text-orange-500">Panel</span>
            </h1>
            <p className="text-zinc-500 mt-2 font-medium">Manage operational identity and access security protocols.</p>
          </motion.div>

          {/* Personal Information */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 mb-8 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
               <User className="w-32 h-32 text-white" />
            </div>

            <h2 className="text-sm font-black text-white mb-8 flex items-center gap-3 uppercase tracking-[0.2em] italic">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
              </div>
              Identity Manifest
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Full Operational Name</label>
                  <div className="relative">
                     <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                     <input
                       value={profileForm.name}
                       onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                       className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-white font-black uppercase focus:outline-none focus:border-orange-500 transition-colors"
                     />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Contact Frequency (Phone)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                    <input
                      value={profileForm.phone}
                      onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                      type="tel"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-white font-black uppercase focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Primary Comm-Link (Email)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800" />
                  <input
                    value={user.email}
                    disabled
                    className="w-full bg-zinc-950/50 border border-zinc-900 rounded-2xl pl-12 pr-4 py-4 text-sm text-zinc-600 font-black cursor-not-allowed"
                  />
                  <p className="text-[10px] text-zinc-700 mt-2 font-bold italic">Comm-link address is locked for security.</p>
                </div>
              </div>

              <AnimatePresence>
                {profileMsg && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-emerald-500 font-black uppercase text-[10px] tracking-widest"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {profileMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="w-full md:w-auto bg-white hover:bg-orange-500 text-zinc-950 hover:text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all disabled:opacity-20 active:scale-95 shadow-xl flex items-center justify-center gap-3"
              >
                {profileSaving ? (
                   <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {profileSaving ? "Transmitting..." : "Update Manifest"}
              </button>
            </div>
          </motion.section>

          {/* Change Password */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 overflow-hidden relative"
          >
             <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
               <Key className="w-32 h-32 text-white" />
            </div>

            <h2 className="text-sm font-black text-white mb-8 flex items-center gap-3 uppercase tracking-[0.2em] italic">
               <div className="p-2 bg-blue-500/10 rounded-lg">
                <Lock className="w-4 h-4 text-blue-500" />
              </div>
              Encryption Protocols
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">New Access Cipher</label>
                   <input
                    type="password"
                    placeholder="MIN 8 CHARS"
                    value={passwordForm.newPass}
                    onChange={e => setPasswordForm(f => ({ ...f, newPass: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white font-black uppercase focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-800"
                  />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Confirm Cipher</label>
                   <input
                    type="password"
                    placeholder="RE-ENTER"
                    value={passwordForm.confirm}
                    onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white font-black uppercase focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-800"
                  />
                </div>
              </div>

              <AnimatePresence>
                {passwordMsg && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`flex items-center gap-2 font-black uppercase text-[10px] tracking-widest ${passwordError ? "text-rose-500" : "text-emerald-500"}`}
                  >
                    {passwordError ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    {passwordMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleChangePassword}
                disabled={passwordSaving}
                className="w-full md:w-auto bg-zinc-800 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all disabled:opacity-20 active:scale-95 shadow-xl flex items-center justify-center gap-3"
              >
                {passwordSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Key className="w-4 h-4" />
                )}
                {passwordSaving ? "Synchronizing..." : "Update Cipher"}
              </button>
            </div>
          </motion.section>
        </div>
      </div>
    </DashboardLayout>
  );
}
