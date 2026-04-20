"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getPlanTemplates, upsertPlanTemplate, deletePlanTemplate, type PlanTemplate } from "@/lib/db/master";
import { ArrowLeft, FileText, Pencil, Save, Trash2, X } from "lucide-react";

type Form = {
  id?: string;
  name: string;
  description: string;
  monthlyRate: string;
  paymentFrequency: "monthly" | "weekly";
  duration: string;
};

function blankForm(): Form {
  return { name: "", description: "", monthlyRate: "", paymentFrequency: "monthly", duration: "" };
}

function fromTemplate(t: PlanTemplate): Form {
  return {
    id: t.id,
    name: t.name,
    description: t.description ?? "",
    monthlyRate: t.monthlyRate ? String(t.monthlyRate) : "",
    paymentFrequency: t.paymentFrequency,
    duration: t.duration ?? "",
  };
}

export default function PlanTemplatesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<PlanTemplate[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState<Form>(blankForm());
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => setTemplates(await getPlanTemplates(false));

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

  const visible = showAll ? templates : templates.filter((t) => t.isActive);
  const role = user.role === "admin" ? "admin" : "trainer";

  function startEdit(t: PlanTemplate) { setForm(fromTemplate(t)); setEditing(true); setError(""); setSuccess(""); }
  function cancelEdit() { setForm(blankForm()); setEditing(false); setError(""); }
  function update(field: keyof Form, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    await upsertPlanTemplate({
      id: form.id,
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      monthlyRate: form.monthlyRate ? Number(form.monthlyRate) : undefined,
      paymentFrequency: form.paymentFrequency,
      duration: form.duration.trim() || undefined,
      isActive: true,
    });
    setSuccess(form.id ? "Template updated." : "Template added.");
    cancelEdit();
    await loadData();
  }

  async function handleToggle(t: PlanTemplate) {
    await upsertPlanTemplate({ ...t, isActive: !t.isActive });
    await loadData();
  }

  async function handleDelete(t: PlanTemplate) {
    if (!window.confirm(`Delete "${t.name}"?`)) return;
    await deletePlanTemplate(t.id);
    await loadData();
  }

  return (
    <DashboardLayout role={role}>
      <div className="w-full max-w-3xl p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href={role === "admin" ? "/admin/master" : "/trainer/master"} className="text-sm text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Plan Templates</h1>
            <p className="text-gray-500 mt-0.5 text-sm">Reusable plan blueprints trainers can apply to clients.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mb-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-gray-900">{editing ? "Edit Template" : "Add Template"}</h2>
            {editing && <button type="button" onClick={cancelEdit} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
              Template Name *
              <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="3-Month Transformation" className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </label>

            <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
              Description
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={2} placeholder="What this plan covers…" className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 resize-none" />
            </label>

            <label className="text-sm font-semibold text-gray-700">
              Rate (AED)
              <input type="number" min="0" value={form.monthlyRate} onChange={(e) => update("monthlyRate", e.target.value)} placeholder="2000" className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </label>

            <label className="text-sm font-semibold text-gray-700">
              Billing Frequency
              <select value={form.paymentFrequency} onChange={(e) => update("paymentFrequency", e.target.value)} className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500">
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </label>

            <label className="text-sm font-semibold text-gray-700">
              Duration
              <input type="text" value={form.duration} onChange={(e) => update("duration", e.target.value)} placeholder="3 months / 12 weeks" className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </label>
          </div>

          {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
          {success && <p className="mt-3 text-sm font-medium text-green-600">{success}</p>}

          <div className="mt-4 flex gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700">
              <Save className="w-4 h-4" /> {editing ? "Save Changes" : "Add Template"}
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
          {visible.length === 0 && <p className="text-gray-400 text-center py-8">No plan templates yet.</p>}
          {visible.map((t) => (
            <div key={t.id} className={`rounded-2xl border ${t.isActive ? "bg-white border-gray-100" : "bg-gray-50 border-gray-200 opacity-60"} p-4 flex items-center justify-between gap-4`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-violet-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {t.monthlyRate ? `AED ${t.monthlyRate} / ${t.paymentFrequency}` : "No rate set"}
                    {t.duration ? ` · ${t.duration}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleToggle(t)} className={`text-xs font-bold px-3 py-1.5 rounded-full ${t.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                  {t.isActive ? "Active" : "Inactive"}
                </button>
                <button onClick={() => startEdit(t)} className="p-2 text-gray-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(t)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
