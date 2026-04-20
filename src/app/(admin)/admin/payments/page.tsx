"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { listPayments, createPayment, updatePaymentStatus, deletePayment, type Payment } from "@/lib/db/payments";
import { listCustomers, type Profile } from "@/lib/db/profiles";
import { listAllPlans, type Plan } from "@/lib/db/plans";
import { CreditCard, CheckCircle, Clock, AlertCircle, Plus, Loader2, X, Trash2 } from "lucide-react";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(amount);

function PaymentBadge({ status }: { status: string }) {
  const map = {
    paid: { color: "green", icon: CheckCircle, label: "Paid" },
    pending: { color: "yellow", icon: Clock, label: "Pending" },
    overdue: { color: "red", icon: AlertCircle, label: "Overdue" },
  };
  const { color, icon: Icon, label } = map[status as keyof typeof map] ?? map.pending;
  const colorMap: Record<string, string> = {
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colorMap[color]}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </span>
  );
}

const emptyInvoice = () => ({
  userId: "",
  amount: "",
  description: "Monthly Training Fee",
  dueDate: "",
  planId: "",
});

export default function AdminPaymentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [dataLoaded, setDataLoaded] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoice());

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user && user.role !== "admin") { router.push("/trainer/dashboard"); return; }
    if (!loading && user) { loadData(); }
  }, [loading, user]); // eslint-disable-line

  const loadData = async () => {
    const [p, c, pl] = await Promise.all([listPayments(), listCustomers(), listAllPlans()]);
    setPayments(p);
    setCustomers(c);
    setPlans(pl);
    setDataLoaded(true);
  };

  const handleClientChange = (clientId: string) => {
    setInvoiceForm(f => ({ ...f, userId: clientId }));
    const activePlan = plans.find(p => p.userId === clientId && p.status === "active");
    if (activePlan?.monthlyRate) {
      setInvoiceForm(f => ({ ...f, amount: String(activePlan.monthlyRate), planId: activePlan.id }));
    } else {
      setInvoiceForm(f => ({ ...f, amount: "", planId: "" }));
    }
  };

  const handleCreateInvoice = async () => {
    if (!invoiceForm.userId || !invoiceForm.amount || !invoiceForm.dueDate) {
      setFormError("Client, amount, and due date are required.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await createPayment({
        userId: invoiceForm.userId,
        planId: invoiceForm.planId || undefined,
        amount: parseFloat(invoiceForm.amount),
        description: invoiceForm.description,
        dueDate: invoiceForm.dueDate,
        status: "pending",
      });
      setShowCreateModal(false);
      setInvoiceForm(emptyInvoice());
      await loadData();
    } catch {
      setFormError("Failed to create invoice.");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (paymentId: string) => {
    const today = new Date().toISOString().split("T")[0];
    await updatePaymentStatus(paymentId, "paid", today);
    await loadData();
  };

  const handleDelete = async (paymentId: string) => {
    if (!window.confirm("Delete this payment record? This cannot be undone.")) return;
    await deletePayment(paymentId);
    await loadData();
  };

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      </DashboardLayout>
    );
  }

  const filtered = filterStatus === "all" ? payments : payments.filter(p => p.status === filterStatus);

  const getClientName = (userId: string) =>
    customers.find(c => c.id === userId)?.name ?? "Unknown client";

  const getPlanName = (userId: string) => {
    const plan = plans.find(p => p.userId === userId && p.status === "active");
    return plan?.name ?? "—";
  };

  const totalRevenue = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = payments.filter(p => p.status === "pending").length;
  const pendingTotal = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  const overdueCount = payments.filter(p => p.status === "overdue").length;
  const overdueTotal = payments.filter(p => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0);

  // This month's revenue
  const thisMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const monthRevenue = payments
    .filter(p => p.status === "paid" && p.paidDate?.startsWith(thisMonth))
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardLayout role="admin">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Payments</h1>
              <p className="text-gray-500 text-sm">Manage all client payments and invoices</p>
            </div>
          </div>
          <button
            onClick={() => { setInvoiceForm(emptyInvoice()); setShowCreateModal(true); setFormError(""); }}
            className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-violet-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 font-medium text-sm mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" /> Total Revenue
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 font-medium text-sm mb-2">
              <CreditCard className="w-4 h-4 text-blue-500" /> This Month
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthRevenue)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 font-medium text-sm mb-2">
              <Clock className="w-4 h-4 text-yellow-500" /> Pending
            </div>
            <p className="text-2xl font-bold text-gray-900">{pendingCount} <span className="text-sm font-normal text-gray-400">({formatCurrency(pendingTotal)})</span></p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 font-medium text-sm mb-2">
              <AlertCircle className="w-4 h-4 text-red-500" /> Overdue
            </div>
            <p className="text-2xl font-bold text-gray-900">{overdueCount} <span className="text-sm font-normal text-gray-400">({formatCurrency(overdueTotal)})</span></p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-t-2xl border border-gray-100 border-b-0 overflow-hidden">
          <div className="flex border-b border-gray-100 p-1">
            {(["all", "paid", "pending", "overdue"] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex-1 sm:flex-none capitalize px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filterStatus === status ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-b-2xl shadow-sm overflow-hidden">
          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Paid Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-900">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-semibold">{getClientName(p.userId)}</td>
                      <td className="px-6 py-4 text-gray-500">{getPlanName(p.userId)}</td>
                      <td className="px-6 py-4 font-medium">{formatCurrency(p.amount)}</td>
                      <td className="px-6 py-4 text-gray-500">{p.description || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-500">{p.dueDate || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-500">{p.paidDate || "—"}</td>
                      <td className="px-6 py-4"><PaymentBadge status={p.status} /></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(p.status === "pending" || p.status === "overdue") && (
                            <button
                              onClick={() => handleMarkPaid(p.id)}
                              className="bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete payment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400">
              <CreditCard className="w-10 h-10 mx-auto mb-4 opacity-30" />
              <p className="text-base font-medium">No {filterStatus !== "all" ? filterStatus : ""} payments found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create Invoice</h2>
              <button title="Close" onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{formError}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select
                  value={invoiceForm.userId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                >
                  <option value="">Select a client...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name || c.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (AED)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                  placeholder="e.g. Monthly Training Fee"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={handleCreateInvoice}
                  disabled={saving}
                  className="flex-1 bg-violet-600 text-white flex items-center justify-center py-2.5 rounded-xl font-semibold hover:bg-violet-700 disabled:opacity-50 transition-all"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Invoice"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
