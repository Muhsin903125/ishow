"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getGoalTypes, upsertGoalType, deleteGoalType, type GoalType } from "@/lib/db/master";
import { ArrowLeft, Target, Pencil, Save, Trash2, X } from "lucide-react";

type Form = { id?: string; name: string; slug: string; description: string; sortOrder: string };

function blankForm(): Form { return { name: "", slug: "", description: "", sortOrder: "0" }; }
function fromGoal(g: GoalType): Form {
  return { id: g.id, name: g.name, slug: g.slug, description: g.description ?? "", sortOrder: String(g.sortOrder) };
}
function toSlug(s: string) { return s.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""); }

export default function GoalTypesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState<GoalType[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState<Form>(blankForm());
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => setGoals(await getGoalTypes(false));

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    const init = async () => {
      if (!loading && user) {
        if (user.role === 'customer') { router.push('/dashboard'); return; }
        await loadData();
      }
    };
    init();
  }, [loading, router, user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !user) return null;

  const visible = showAll ? goals : goals.filter((g) => g.isActive);
  const role = user.role === "admin" ? "ADMIN" : "TRAINER";

  function startEdit(g: GoalType) { setForm(fromGoal(g)); setEditing(true); setError(""); setSuccess(""); }
  function cancelEdit() { setForm(blankForm()); setEditing(false); setError(""); }
  function update(field: keyof Form, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    const slug = form.slug.trim() || toSlug(form.name);
    if (!slug) { setError("Slug is required."); return; }
    await upsertGoalType({
      id: form.id,
      name: form.name.trim(),
      slug,
      description: form.description.trim() || undefined,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: true,
    });
    setSuccess(form.id ? "Goal type updated." : "Goal type added.");
    cancelEdit();
    await loadData();
  }

  async function handleToggle(g: GoalType) {
    await upsertGoalType({ ...g, isActive: !g.isActive });
    await loadData();
  }

  async function handleDelete(g: GoalType) {
    if (!window.confirm(`Delete "${g.name}"?`)) return;
    await deleteGoalType(g.id);
    await loadData();
  }

  return (
    <DashboardLayout role={role as "ADMIN" | "TRAINER"}>
      <div className="w-full max-w-3xl p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href={role === "ADMIN" ? "/admin/master" : "/trainer/master"} className="text-sm text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Goal Types</h1>
            <p className="text-gray-500 mt-0.5 text-sm">Configure fitness goals clients can choose in their assessment.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mb-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-gray-900">{editing ? "Edit Goal Type" : "Add Goal Type"}</h2>
            {editing && <button type="button" onClick={cancelEdit} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-gray-700">
              Name *
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({ ...f, name, slug: f.slug || toSlug(name) }));
                }}
                placeholder="Weight Loss"
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </label>

            <label className="text-sm font-semibold text-gray-700">
              Slug *
              <input type="text" value={form.slug} onChange={(e) => update("slug", toSlug(e.target.value))} placeholder="weight_loss" className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-mono outline-none focus:border-blue-500" />
            </label>

            <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
              Description
              <input type="text" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Optional short description" className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </label>

            <label className="text-sm font-semibold text-gray-700">
              Sort Order
              <input type="number" min="0" value={form.sortOrder} onChange={(e) => update("sortOrder", e.target.value)} className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </label>
          </div>

          {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
          {success && <p className="mt-3 text-sm font-medium text-green-600">{success}</p>}

          <div className="mt-4 flex gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700">
              <Save className="w-4 h-4" /> {editing ? "Save Changes" : "Add Goal Type"}
            </button>
            {editing && <button type="button" onClick={cancelEdit} className="rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>}
          </div>
        </form>

        <div className="mb-4 flex justify-end">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer select-none">
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="rounded" />
            Show inactive
          </label>
        </div>

        <div className="space-y-2">
          {visible.length === 0 && <p className="text-gray-400 text-center py-8">No goal types yet.</p>}
          {visible.map((g) => (
            <div key={g.id} className={`rounded-2xl border ${g.isActive ? "bg-white border-gray-100" : "bg-gray-50 border-gray-200 opacity-60"} p-4 flex items-center justify-between gap-4`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{g.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">{g.slug}{g.description ? ` · ${g.description}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleToggle(g)} className={`text-xs font-bold px-3 py-1.5 rounded-full ${g.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                  {g.isActive ? "Active" : "Inactive"}
                </button>
                <button onClick={() => startEdit(g)} className="p-2 text-gray-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(g)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
