"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getItems, updateItem, addItem, deleteItem, setItems } from "@/lib/storage";
import type { User } from "@/lib/auth";
import type { Assessment, Payment, Plan, Program, Session } from "@/lib/mockData";
import {
  Users, ClipboardList, Calendar, CreditCard, Phone, Mail,
  CheckCircle, Target, Dumbbell, ArrowRight, Search, Plus,
  Pencil, Trash2, X, XCircle,
} from "lucide-react";

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

const emptyForm = { name: "", email: "", password: "", phone: "" };

export default function TrainerClientsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [customers, setCustomers] = useState<User[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  function loadData() {
    setCustomers(getItems<User>("ishow_users").filter((u) => u.role === "customer"));
    setAssessments(getItems<Assessment>("ishow_assessments"));
    setPlans(getItems<Plan>("ishow_plans"));
    setSessions(getItems<Session>("ishow_sessions"));
    setPrograms(getItems<Program>("ishow_programs"));
    setPayments(getItems<Payment>("ishow_payments"));
  }

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user) {
      if (user.role !== "trainer") { router.push("/dashboard"); return; }
      loadData();
    }
  }, [loading, router, user]);

  if (loading || !user) return null;

  const q = search.trim().toLowerCase();
  const filteredCustomers = q
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone ?? "").toLowerCase().includes(q)
      )
    : customers;

  function markAssessmentReviewed(assessmentId: string) {
    updateItem<Assessment>("ishow_assessments", assessmentId, {
      status: "reviewed",
      reviewedAt: new Date().toISOString(),
    });
    loadData();
  }

  function cancelPlan(planId: string) {
    updateItem<Plan>("ishow_plans", planId, { status: "inactive" });
    loadData();
  }

  function openAdd() {
    setForm(emptyForm);
    setFormError("");
    setAddOpen(true);
  }

  function openEdit(customer: User) {
    setForm({ name: customer.name, email: customer.email, password: "", phone: customer.phone ?? "" });
    setFormError("");
    setEditTarget(customer);
  }

  function submitAdd() {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError("Name, email, and password are required.");
      return;
    }
    const all = getItems<User>("ishow_users");
    if (all.some((u) => u.email.toLowerCase() === form.email.trim().toLowerCase())) {
      setFormError("A user with this email already exists.");
      return;
    }
    addItem<User>("ishow_users", {
      id: `user_${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      phone: form.phone.trim() || undefined,
      role: "customer",
      customerStatus: "client",
      createdAt: new Date().toISOString(),
    });
    setAddOpen(false);
    loadData();
  }

  function submitEdit() {
    if (!editTarget) return;
    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Name and email are required.");
      return;
    }
    const all = getItems<User>("ishow_users");
    if (all.some((u) => u.email.toLowerCase() === form.email.trim().toLowerCase() && u.id !== editTarget.id)) {
      setFormError("A user with this email already exists.");
      return;
    }
    const updates: Partial<User> = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || undefined,
    };
    if (form.password.trim()) updates.password = form.password.trim();
    updateItem<User>("ishow_users", editTarget.id, updates);
    setEditTarget(null);
    loadData();
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    deleteItem("ishow_users", id);
    setItems("ishow_assessments", getItems<Assessment>("ishow_assessments").filter((a) => a.userId !== id));
    setItems("ishow_plans", getItems<Plan>("ishow_plans").filter((p) => p.userId !== id));
    setItems("ishow_sessions", getItems<Session>("ishow_sessions").filter((s) => s.userId !== id));
    setItems("ishow_programs", getItems<Program>("ishow_programs").filter((p) => p.userId !== id));
    setItems("ishow_payments", getItems<Payment>("ishow_payments").filter((p) => p.userId !== id));
    setDeleteTarget(null);
    loadData();
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <DashboardLayout role="TRAINER">
      <div className="w-full max-w-6xl p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Clients</h1>
            <p className="text-gray-500 mt-1">Overview of each client, their plan status, and next action.</p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        </div>

        <div className="mb-5 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients by name, email or phone..."
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white pl-11 pr-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 shadow-sm"
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {filteredCustomers.length === 0 && (
            <p className="text-gray-500 col-span-2 py-8 text-center">No clients match your search.</p>
          )}
          {filteredCustomers.map((customer) => {
            const assessment = assessments.find((item) => item.userId === customer.id);
            const plan = plans.find((item) => item.userId === customer.id && item.status === "active");
            const customerPrograms = programs.filter((item) => item.userId === customer.id);
            const customerSessions = sessions.filter((item) => item.userId === customer.id);
            const nextSession = sessions
              .filter((item) => item.userId === customer.id && item.status === "scheduled" && item.date >= today)
              .sort((l, r) => (l.date + l.time).localeCompare(r.date + r.time))[0];
            const paymentIssue = payments.find(
              (item) => item.userId === customer.id && (item.status === "pending" || item.status === "overdue")
            );

            return (
              <div key={customer.id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                {/* Card header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-orange-500 flex items-center justify-center text-white font-black">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-black text-gray-900 text-lg">{customer.name}</h2>
                      <p className="text-sm text-gray-500">Joined {formatDate(customer.createdAt.split("T")[0])}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                      plan ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      {plan ? "Active plan" : "No plan"}
                    </span>
                    <button
                      onClick={() => openEdit(customer)}
                      title="Edit client"
                      className="p-2 rounded-xl text-gray-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(customer)}
                      title="Delete client"
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 mb-5">
                  {/* Assessment */}
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <ClipboardList className="w-4 h-4 text-orange-500" />
                        Assessment
                      </div>
                      {assessment?.status === "pending" && (
                        <button
                          onClick={() => markAssessmentReviewed(assessment.id)}
                          className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700 hover:bg-orange-200 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Mark reviewed
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {assessment
                        ? `${assessment.status === "reviewed" ? "Reviewed" : "Pending"} · ${assessment.goals.map((g) => g.replaceAll("_", " ")).join(", ")}`
                        : "No assessment submitted yet."}
                    </p>
                  </div>

                  {/* Next session */}
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                      <Calendar className="w-4 h-4 text-blue-700" />
                      Next session
                    </div>
                    <p className="text-sm text-gray-600">
                      {nextSession
                        ? `${nextSession.title} · ${formatDate(nextSession.date)} at ${nextSession.time}`
                        : "No upcoming session scheduled."}
                    </p>
                  </div>

                  {/* Billing */}
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                      <CreditCard className="w-4 h-4 text-red-500" />
                      Billing
                    </div>
                    <p className="text-sm text-gray-600">
                      {paymentIssue
                        ? `${paymentIssue.status.toUpperCase()} · AED ${paymentIssue.amount}`
                        : "Billing is currently clear."}
                    </p>
                  </div>

                  {/* Active plan + cancel */}
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <Users className="w-4 h-4 text-green-600" />
                        Active plan
                      </div>
                      {plan && (
                        <button
                          onClick={() => cancelPlan(plan.id)}
                          className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-200 transition-colors"
                        >
                          <XCircle className="w-3 h-3" />
                          Cancel
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {plan ? `${plan.name} · ${plan.duration}` : "Awaiting plan assignment."}
                    </p>
                  </div>

                  {/* Programs */}
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                      <Target className="w-4 h-4 text-blue-700" />
                      Program weeks
                    </div>
                    <p className="text-sm text-gray-600">
                      {customerPrograms.length > 0
                        ? `${customerPrograms.length} assigned week${customerPrograms.length === 1 ? "" : "s"}`
                        : "No program assigned yet."}
                    </p>
                  </div>

                  {/* Sessions */}
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                      <Dumbbell className="w-4 h-4 text-orange-500" />
                      Custom sessions
                    </div>
                    <p className="text-sm text-gray-600">
                      {customerSessions.length > 0
                        ? `${customerSessions.length} total session${customerSessions.length === 1 ? "" : "s"}`
                        : "No custom sessions scheduled yet."}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
                  <span className="inline-flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {customer.email}
                  </span>
                  {customer.phone && (
                    <span className="inline-flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {customer.phone}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/trainer/programs?client=${encodeURIComponent(customer.id)}`}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-800"
                  >
                    Manage Programs
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/trainer/sessions?client=${encodeURIComponent(customer.id)}`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    Manage Sessions
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Add Client Modal ── */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-gray-900">Add Client</h2>
              <button onClick={() => setAddOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {formError && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{formError}</p>}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="Ahmad Al Mansouri" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="ahmad@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password *</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="Minimum 6 characters" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="+971 50 123 4567" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setAddOpen(false)}
                className="flex-1 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={submitAdd}
                className="flex-1 rounded-2xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Client Modal ── */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-gray-900">Edit Client</h2>
              <button onClick={() => setEditTarget(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {formError && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{formError}</p>}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">New Password (leave blank to keep)</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditTarget(null)}
                className="flex-1 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={submitEdit}
                className="flex-1 rounded-2xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-900">Delete Client</h2>
              <button onClick={() => setDeleteTarget(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">{deleteTarget.name}</span>?
            </p>
            <p className="text-xs text-gray-400 mb-6">
              This will permanently remove the client and all their assessments, plans, sessions, programs, and payments.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={confirmDelete}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
