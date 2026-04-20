"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateProfile } from "@/lib/db/profiles";
import { User, Lock, Save, Loader2 } from "lucide-react";

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
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user && user.role === "customer") { router.push("/dashboard"); return; }
    if (!loading && user) {
      getProfile(user.id).then(p => {
        setProfileForm({ name: p?.name ?? "", phone: p?.phone ?? "" });
        setDataLoaded(true);
      });
    }
  }, [loading, user]); // eslint-disable-line

  if (loading || !dataLoaded || !user) {
    return (
      <DashboardLayout role="trainer">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
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
      setProfileMsg("Profile updated successfully.");
      setTimeout(() => setProfileMsg(""), 3000);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMsg("");
    setPasswordError(false);
    if (passwordForm.newPass.length < 8) {
      setPasswordMsg("Password must be at least 8 characters.");
      setPasswordError(true);
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordMsg("Passwords do not match.");
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
        setPasswordMsg("Password updated successfully.");
        setPasswordError(false);
        setTimeout(() => setPasswordMsg(""), 3000);
      }
    } catch {
      setPasswordMsg("Failed to update password. Please try again.");
      setPasswordError(true);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <DashboardLayout role="trainer">
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your profile and password</p>
        </div>

        {/* Personal Information */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" /> Personal Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                value={profileForm.name}
                onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                value={profileForm.phone}
                onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                type="tel"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                value={user.email}
                disabled
                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
            </div>
            {profileMsg && <p className="text-sm text-green-600">{profileMsg}</p>}
            <button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" /> {profileSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </section>

        {/* Change Password */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" /> Change Password
          </h2>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="New password (min 8 chars)"
              value={passwordForm.newPass}
              onChange={e => setPasswordForm(f => ({ ...f, newPass: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={passwordForm.confirm}
              onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            {passwordMsg && (
              <p className={`text-sm ${passwordError ? "text-red-500" : "text-green-600"}`}>{passwordMsg}</p>
            )}
            <button
              onClick={handleChangePassword}
              disabled={passwordSaving}
              className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              <Lock className="w-4 h-4" /> {passwordSaving ? "Updating…" : "Update Password"}
            </button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
