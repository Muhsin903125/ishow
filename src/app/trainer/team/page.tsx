"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { getItems, addItem } from "@/lib/storage";
import { User } from "@/lib/auth";
import {
  UserPlus, Loader2, CheckCircle, AlertCircle,
  Mail, Lock, User as UserIcon, Phone, Dumbbell,
} from "lucide-react";

export default function TrainerTeamPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [trainers, setTrainers] = useState<User[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
  });

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push("/login"); return; }
      if (user.role !== "trainer") { router.push("/dashboard"); return; }
      const allUsers = getItems<User>("ishow_users");
      setTrainers(allUsers.filter((u) => u.role === "trainer"));
      setDataLoaded(true);
    }
  }, [user, loading, router]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const allUsers = getItems<User>("ishow_users");
    if (allUsers.find((u) => u.email.toLowerCase() === form.email.toLowerCase())) {
      setError("An account with this email already exists.");
      return;
    }

    setSubmitting(true);
    const newTrainer: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone || undefined,
      role: "trainer",
      createdAt: new Date().toISOString(),
    };
    addItem<User>("ishow_users", newTrainer);
    setTrainers((prev) => [...prev, newTrainer]);
    setSuccess(`Trainer account created for ${form.name}.`);
    setForm({ name: "", email: "", password: "", phone: "" });
    setShowForm(false);
    setSubmitting(false);
  };

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="trainer">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="trainer">
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Team</h1>
              <p className="text-gray-500 text-sm">Manage trainer accounts</p>
            </div>
          </div>
          <button
            onClick={() => { setShowForm((v) => !v); setError(""); setSuccess(""); }}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            {showForm ? "Cancel" : "Add Trainer"}
          </button>
        </div>

        {/* Success banner */}
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-5 text-sm text-green-800">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Create Trainer Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">New Trainer Account</h2>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Alex Carter"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1 555 000 0000"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="trainer@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Min. 6 characters"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60"
              >
                {submitting ? "Creating…" : "Create Trainer Account"}
              </button>
            </form>
          </div>
        )}

        {/* Trainers list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="font-bold text-gray-900 text-sm">{trainers.length} Trainer{trainers.length !== 1 ? "s" : ""}</p>
          </div>
          {trainers.length > 0 ? (
            <ul className="divide-y divide-gray-50">
              {trainers.map((t) => (
                <li key={t.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{t.name}</p>
                    <p className="text-gray-500 text-xs truncate">{t.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full text-xs font-semibold">
                    <Dumbbell className="w-3 h-3" />
                    Trainer
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No trainers yet. Add the first one above.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
