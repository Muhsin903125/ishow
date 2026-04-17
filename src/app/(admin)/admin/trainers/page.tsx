"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { listTrainers, updateProfile, deleteProfile, type Profile } from "@/lib/db/profiles";
import { UserCog, Plus, Mail, Phone, Pencil, Trash2, X, Send, CheckCircle } from "lucide-react";

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

  const loadData = async () => {
    setTrainers(await listTrainers());
  };

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    const init = async () => {
      if (!loading && user) {
        if (user.role !== 'admin') { router.push('/trainer/dashboard'); return; }
        await loadData();
      }
    };
    init();
  }, [loading, router, user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !user) return null;

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
    if (!editingId || !editName.trim()) { setEditError("Name is required."); return; }
    await updateProfile(editingId, { name: editName.trim(), phone: editPhone.trim() || undefined });
    cancelEdit();
    await loadData();
  }

  async function handleDelete(trainer: Profile) {
    if (!window.confirm(`Remove trainer account for ${trainer.name}? This cannot be undone.`)) return;
    await deleteProfile(trainer.id);
    await loadData();
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError("");
    if (!inviteName.trim() || !inviteEmail.trim()) { setInviteError("Name and email are required."); return; }
    setInviting(true);
    try {
      const res = await fetch("/api/admin/invite-trainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inviteName.trim(), email: inviteEmail.trim(), phone: invitePhone.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { setInviteError(json.error ?? "Failed to send invite."); return; }
      setInviteSuccess(`Invite sent to ${inviteEmail}. They'll receive an email to set their password.`);
      setInviteName(""); setInviteEmail(""); setInvitePhone("");
      await loadData();
    } catch {
      setInviteError("Network error. Please try again.");
    } finally {
      setInviting(false);
    }
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="w-full max-w-4xl p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Trainers</h1>
            <p className="text-gray-500 mt-1">Invite and manage trainer accounts.</p>
          </div>
          <button
            onClick={() => { setMode("invite"); setInviteError(""); setInviteSuccess(""); }}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:-translate-y-0.5 transition-all hover:bg-blue-800"
          >
            <Plus className="w-4 h-4" />
            Invite Trainer
          </button>
        </div>

        {/* Invite form */}
        {mode === "invite" && (
          <form onSubmit={handleInvite} className="mb-8 rounded-3xl border border-blue-100 bg-blue-50 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-900">Invite a New Trainer</h2>
              <button type="button" onClick={() => setMode("idle")} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 flex items-center gap-3 text-sm font-medium text-green-700">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {inviteSuccess}
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Full Name *
                    <input
                      type="text"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="Jane Smith"
                      className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    Email Address *
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    Phone (optional)
                    <input
                      type="tel"
                      value={invitePhone}
                      onChange={(e) => setInvitePhone(e.target.value)}
                      placeholder="+971 50 000 0000"
                      className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </label>
                </div>

                {inviteError && (
                  <p className="mt-3 text-sm font-medium text-red-600">{inviteError}</p>
                )}

                <button
                  type="submit"
                  disabled={inviting}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-6 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {inviting ? "Sending..." : "Send Invite Email"}
                </button>
              </>
            )}
          </form>
        )}

        {/* Trainer list */}
        <div className="space-y-4">
          {trainers.length === 0 && (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
              <UserCog className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-500">No trainers yet.</p>
              <p className="text-sm text-gray-400 mt-1">Use the button above to invite your first trainer.</p>
            </div>
          )}

          {trainers.map((trainer) => (
            <div key={trainer.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              {mode === "edit" && editingId === trainer.id ? (
                <div>
                  <div className="grid gap-3 sm:grid-cols-2 mb-3">
                    <label className="text-sm font-semibold text-gray-700">
                      Name
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </label>
                    <label className="text-sm font-semibold text-gray-700">
                      Phone
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </label>
                  </div>
                  {editError && <p className="text-sm font-medium text-red-600 mb-3">{editError}</p>}
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800">Save</button>
                    <button onClick={cancelEdit} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {trainer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{trainer.name}</p>
                      <div className="flex flex-wrap gap-3 mt-0.5">
                        {trainer.email && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="w-3 h-3" />{trainer.email}
                          </span>
                        )}
                        {trainer.phone && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <Phone className="w-3 h-3" />{trainer.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(trainer)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(trainer)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
