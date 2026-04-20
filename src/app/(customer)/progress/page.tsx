"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { ProgressChart } from "@/components/ProgressChart";
import { listMeasurements, addMeasurement, type Measurement } from "@/lib/db/measurements";
import { TrendingUp, Plus, Loader2, X, Scale, Ruler, Percent } from "lucide-react";

const METRICS = [
  { key: "weightKg" as const, label: "Weight", unit: "kg", icon: Scale, color: "#f97316" },
  { key: "waistCm" as const, label: "Waist", unit: "cm", icon: Ruler, color: "#3b82f6" },
  { key: "bodyFatPct" as const, label: "Body Fat", unit: "%", icon: Percent, color: "#22c55e" },
];

export default function ProgressPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeMetric, setActiveMetric] = useState(0);
  const [form, setForm] = useState({
    recordedAt: new Date().toISOString().split("T")[0],
    weightKg: "",
    bodyFatPct: "",
    chestCm: "",
    waistCm: "",
    hipsCm: "",
    armsCm: "",
    notes: "",
  });

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user && user.role !== "customer") { router.push("/trainer/dashboard"); return; }
    if (!loading && user) {
      listMeasurements(user.id).then(d => { setMeasurements(d); setDataLoaded(true); });
    }
  }, [loading, user]); // eslint-disable-line

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="customer">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    );
  }

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await addMeasurement(user.id, {
      recordedAt: form.recordedAt,
      weightKg: form.weightKg ? parseFloat(form.weightKg) : undefined,
      bodyFatPct: form.bodyFatPct ? parseFloat(form.bodyFatPct) : undefined,
      chestCm: form.chestCm ? parseFloat(form.chestCm) : undefined,
      waistCm: form.waistCm ? parseFloat(form.waistCm) : undefined,
      hipsCm: form.hipsCm ? parseFloat(form.hipsCm) : undefined,
      armsCm: form.armsCm ? parseFloat(form.armsCm) : undefined,
      notes: form.notes || undefined,
    });
    const updated = await listMeasurements(user.id);
    setMeasurements(updated);
    setShowModal(false);
    setForm({
      recordedAt: new Date().toISOString().split("T")[0],
      weightKg: "", bodyFatPct: "", chestCm: "", waistCm: "", hipsCm: "", armsCm: "", notes: "",
    });
    setSaving(false);
  };

  const reversed = [...measurements].reverse();
  const latest = reversed[0];

  return (
    <DashboardLayout role="customer">
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">My Progress</h1>
              <p className="text-gray-500 text-sm">Track your body measurements over time</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-400 transition-colors"
          >
            <Plus className="w-4 h-4" /> Log Measurement
          </button>
        </div>

        {/* Latest Measurement Summary */}
        {latest && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Weight", value: latest.weightKg, unit: "kg" },
              { label: "Body Fat", value: latest.bodyFatPct, unit: "%" },
              { label: "Waist", value: latest.waistCm, unit: "cm" },
              { label: "Chest", value: latest.chestCm, unit: "cm" },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">
                  {stat.value != null ? `${stat.value}${stat.unit}` : "—"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Chart with metric tabs */}
        {measurements.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8 shadow-sm">
            <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
              {METRICS.map((m, i) => (
                <button
                  key={m.key}
                  onClick={() => setActiveMetric(i)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    activeMetric === i ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <ProgressChart
              measurements={measurements}
              metric={METRICS[activeMetric].key}
              label={METRICS[activeMetric].label}
              unit={METRICS[activeMetric].unit}
              color={METRICS[activeMetric].color}
            />
          </div>
        )}

        {/* History Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Measurement History</h2>
          </div>
          {reversed.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Weight</th>
                    <th className="px-4 py-3 text-left">Body Fat</th>
                    <th className="px-4 py-3 text-left">Chest</th>
                    <th className="px-4 py-3 text-left">Waist</th>
                    <th className="px-4 py-3 text-left">Hips</th>
                    <th className="px-4 py-3 text-left">Arms</th>
                    <th className="px-4 py-3 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reversed.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {new Date(m.recordedAt + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">{m.weightKg ?? "—"}</td>
                      <td className="px-4 py-3">{m.bodyFatPct != null ? `${m.bodyFatPct}%` : "—"}</td>
                      <td className="px-4 py-3">{m.chestCm ?? "—"}</td>
                      <td className="px-4 py-3">{m.waistCm ?? "—"}</td>
                      <td className="px-4 py-3">{m.hipsCm ?? "—"}</td>
                      <td className="px-4 py-3">{m.armsCm ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{m.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No measurements logged yet</p>
              <p className="text-sm mt-1">Start by logging your first measurement.</p>
            </div>
          )}
        </div>
      </div>

      {/* Log Measurement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Log Measurement</h2>
              <button title="Close" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={form.recordedAt} onChange={e => setForm(f => ({ ...f, recordedAt: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg)</label>
                  <input type="number" step="0.1" value={form.weightKg} onChange={e => setForm(f => ({ ...f, weightKg: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Body Fat (%)</label>
                  <input type="number" step="0.1" value={form.bodyFatPct} onChange={e => setForm(f => ({ ...f, bodyFatPct: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Chest (cm)</label>
                  <input type="number" step="0.1" value={form.chestCm} onChange={e => setForm(f => ({ ...f, chestCm: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Waist (cm)</label>
                  <input type="number" step="0.1" value={form.waistCm} onChange={e => setForm(f => ({ ...f, waistCm: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Hips (cm)</label>
                  <input type="number" step="0.1" value={form.hipsCm} onChange={e => setForm(f => ({ ...f, hipsCm: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Arms (cm)</label>
                  <input type="number" step="0.1" value={form.armsCm} onChange={e => setForm(f => ({ ...f, armsCm: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" placeholder="How are you feeling?" />
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full bg-orange-500 text-white py-2.5 rounded-xl font-semibold hover:bg-orange-400 disabled:opacity-50 transition-colors">
                {saving ? "Saving…" : "Save Measurement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
