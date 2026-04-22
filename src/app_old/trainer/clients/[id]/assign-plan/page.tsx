"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { getItems, addItem, updateItem } from "@/lib/storage";
import type { User as AuthUserFull } from "@/lib/auth";
import type { Plan } from "@/lib/mockData";
import { ArrowLeft, Target, Loader2, CheckCircle } from "lucide-react";

export default function AssignPlanPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<AuthUserFull | null>(null);
  const [existingPlan, setExistingPlan] = useState<Plan | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    monthlyRate: "",
    paymentFrequency: "monthly" as "weekly" | "monthly",
    goals: "",
    startDate: new Date().toISOString().split("T")[0],
    duration: "3 months",
  });

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push("/login"); return; }
      if (user.role !== "trainer") { router.push("/dashboard"); return; }

      const users = getItems<AuthUserFull>("ishow_users");
      const foundClient = users.find((u) => u.id === clientId) ?? null;
      if (!foundClient) { router.push("/trainer/clients"); return; }
      setClient(foundClient);

      const plans = getItems<Plan>("ishow_plans");
      const active = plans.find((p) => p.userId === clientId && p.status === "active") ?? null;
      if (active) {
        setExistingPlan(active);
        setFormData({
          name: active.name,
          description: active.description,
          monthlyRate: String(active.monthlyRate),
          paymentFrequency: active.paymentFrequency,
          goals: active.goals.join(", "),
          startDate: active.startDate,
          duration: active.duration,
        });
      }
      setDataLoaded(true);
    }
  }, [user, loading, router, clientId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !client) return;
    setSubmitting(true);

    const planData = {
      name: formData.name,
      description: formData.description,
      monthlyRate: parseFloat(formData.monthlyRate),
      paymentFrequency: formData.paymentFrequency,
      goals: formData.goals.split(",").map((g) => g.trim()).filter(Boolean),
      startDate: formData.startDate,
      status: "active" as const,
      trainerName: user.name,
      duration: formData.duration,
      userId: clientId,
    };

    if (existingPlan) {
      updateItem<Plan>("ishow_plans", existingPlan.id, planData);
    } else {
      addItem<Plan>("ishow_plans", { id: `plan_${Date.now()}`, ...planData });
    }

    setSubmitting(false);
    setSaved(true);
    setTimeout(() => router.push(`/trainer/clients/${clientId}`), 1500);
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
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <Link href={`/trainer/clients/${clientId}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to {client?.name}
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Target className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              {existingPlan ? "Update Plan" : "Assign Plan"}
            </h1>
            <p className="text-gray-500 text-sm">for {client?.name}</p>
          </div>
        </div>

        {saved ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Plan Saved!</h2>
            <p className="text-gray-500 text-sm">Redirecting back to client profile…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Plan Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                placeholder="e.g. Elite Performance Pack"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 resize-none"
                rows={3}
                placeholder="Describe the training plan…"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Monthly Rate ($)</label>
                <input
                  type="number"
                  value={formData.monthlyRate}
                  onChange={(e) => setFormData((p) => ({ ...p, monthlyRate: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                  placeholder="299"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Frequency</label>
                <select
                  value={formData.paymentFrequency}
                  onChange={(e) => setFormData((p) => ({ ...p, paymentFrequency: e.target.value as "weekly" | "monthly" }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Duration</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData((p) => ({ ...p, duration: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                >
                  <option value="1 month">1 month</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="12 months">12 months</option>
                  <option value="Ongoing">Ongoing</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Goals <span className="text-gray-400 font-normal">(comma-separated)</span></label>
              <input
                type="text"
                value={formData.goals}
                onChange={(e) => setFormData((p) => ({ ...p, goals: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                placeholder="Muscle gain, Improve strength, Weight loss"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-bold text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving…" : existingPlan ? "Update Plan" : "Assign Plan"}
            </button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
