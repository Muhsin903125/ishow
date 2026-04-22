"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateProfile } from "@/lib/db/profiles";
import { 
  User, 
  Lock, 
  Save, 
  Loader2, 
  Shield, 
  ShieldCheck, 
  Smartphone, 
  Mail,
  Zap,
  Activity,
  AlertCircle,
  Key,
} from "lucide-react";

export default function TrainerSettingsPage() {
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
    if (!loading && !user) { router.replace("/login"); return; }
    if (!loading && user && user.role === "customer") { router.replace("/dashboard"); return; }
    if (!loading && user) {
      getProfile(user.id).then(p => {
        setProfileForm({ name: p?.name ?? "", phone: p?.phone ?? "" });
        setDataLoaded(true);
      });
    }
  }, [loading, user, router]);

  if (loading || !dataLoaded || !user) {
    return (
      <DashboardLayout role="trainer">
        <div className="p-8 max-w-full space-y-8 animate-pulse">
           <div className="h-10 w-48 bg-zinc-900 rounded-lg" />
           <div className="h-96 bg-zinc-900 rounded-[2.5rem]" />
           <div className="h-64 bg-zinc-900 rounded-[2.5rem]" />
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
      setProfileMsg("Manifest updated successfully.");
      setTimeout(() => setProfileMsg(""), 3000);
    } catch (err) {
      setProfileMsg("Sync failure. Retry protocol.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMsg("");
    setPasswordError(false);
    if (passwordForm.newPass.length < 8) {
      setPasswordMsg("Access cipher must exceed 7 characters.");
      setPasswordError(true);
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordMsg("Cipher mismatch detected.");
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
        setPasswordMsg("Cipher successfully rotated.");
        setPasswordError(false);
        setTimeout(() => setPasswordMsg(""), 3000);
      }
    } catch {
      setPasswordMsg("Protocol breach. Rotation failed.");
      setPasswordError(true);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <DashboardLayout role="trainer">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-10">
        <div className="max-w-full space-y-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">
               Director <span className="text-orange-500">Settings</span>
            </h1>
            <p className="text-zinc-500 mt-2 font-medium">Configuring operational identity and security protocols.</p>
          </motion.div>

          <div className="space-y-6">
            
            {/* Identity Manifest */}
            <motion.section 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group hover:border-zinc-700 transition-all shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-10 transition-opacity">
                <User className="w-24 h-24 text-white" />
              </div>

              <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                    <Shield className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">Identity Manifest</h2>
                    <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-1">Core credential parameters</p>
                 </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Authorized Name</label>
                  <div className="relative group/field">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within/field:text-orange-500 transition-colors" />
                    <input
                      value={profileForm.name}
                      onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-6 py-4 text-sm text-white font-black uppercase focus:border-orange-500 outline-none transition-all placeholder:text-zinc-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Comms Frequency (Phone)</label>
                  <div className="relative group/field">
                    <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within/field:text-orange-500 transition-colors" />
                    <input
                      value={profileForm.phone}
                      onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                      type="tel"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-6 py-4 text-sm text-white font-black uppercase focus:border-orange-500 outline-none transition-all placeholder:text-zinc-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Terminal Email</label>
                  <div className="relative opacity-40">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                    <input
                      value={user.email || ""}
                      disabled
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl pl-12 pr-6 py-4 text-sm text-zinc-600 font-black uppercase cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest mt-3 flex items-center gap-2">
                     <AlertCircle className="w-3 h-3" /> Static identifier. Contact sys-admin for rotation.
                  </p>
                </div>

                <div className="pt-4">
                  <AnimatePresence mode="wait">
                    {profileMsg && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl text-[10px] font-black uppercase tracking-widest italic"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        {profileMsg}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <button
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="flex items-center gap-3 bg-white text-zinc-950 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-500 hover:text-white disabled:opacity-20 transition-all shadow-xl active:scale-95 group/btn italic"
                  >
                    {profileSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> 
                        Commit Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.section>

            {/* Cipher Rotation */}
            <motion.section 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.2 }}
               className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group hover:border-zinc-700 transition-all shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-10 transition-opacity">
                <Lock className="w-24 h-24 text-white" />
              </div>

              <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
                    <Key className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">Cipher Rotation</h2>
                    <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-1">Access encryption protocols</p>
                 </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="group/field">
                  <input
                    type="password"
                    placeholder="NEW ACCESS CIPHER"
                    value={passwordForm.newPass}
                    onChange={e => setPasswordForm(f => ({ ...f, newPass: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white font-black uppercase tracking-widest focus:border-violet-500 outline-none transition-all placeholder:text-zinc-800 italic"
                  />
                </div>
                <div className="group/field">
                  <input
                    type="password"
                    placeholder="CONFIRM NEW CIPHER"
                    value={passwordForm.confirm}
                    onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white font-black uppercase tracking-widest focus:border-violet-500 outline-none transition-all placeholder:text-zinc-800 italic"
                  />
                </div>
                
                <div className="pt-4">
                  <AnimatePresence mode="wait">
                    {passwordMsg && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mb-4 flex items-center gap-2 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest italic border ${
                          passwordError ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                        }`}
                      >
                        {passwordError ? <AlertCircle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        {passwordMsg}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleChangePassword}
                    disabled={passwordSaving}
                    className="flex items-center gap-3 bg-zinc-800 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-violet-500 disabled:opacity-20 transition-all shadow-xl active:scale-95 group/btn italic"
                  >
                    {passwordSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> 
                        Rotate Cipher
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
