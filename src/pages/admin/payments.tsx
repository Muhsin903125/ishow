"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  listPayments,
  createPayment,
  updatePaymentStatus,
  recordPaymentInstallment,
  deletePayment,
  type Payment,
} from "@/lib/db/payments";
import { listCustomers, type Profile } from "@/lib/db/profiles";
import { listAllPlans, type Plan } from "@/lib/db/plans";
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Loader2, 
  X, 
  Trash2,
  TrendingUp,
  DollarSign,
  Activity,
  Shield,
  Zap,
} from "lucide-react";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(amount);

function PaymentBadge({ status }: { status: string }) {
  const map = {
    paid: { color: "emerald", icon: CheckCircle, label: "Settled" },
    partial: { color: "orange", icon: DollarSign, label: "Partial" },
    pending: { color: "orange", icon: Clock, label: "Pending" },
    overdue: { color: "rose", icon: AlertCircle, label: "Overdue" },
  };
  const { color, icon: Icon, label } = map[status as keyof typeof map] ?? map.pending;
  
  const styles: Record<string, string> = {
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    orange: "bg-orange-500/10 border-orange-500/20 text-orange-500",
    rose: "bg-rose-500/10 border-rose-500/20 text-rose-500",
  };

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic border ${styles[color]}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </span>
  );
}

function getDisplayStatus(payment: Payment) {
  if (payment.status !== "paid" && payment.paidAmount > 0 && payment.balanceAmount > 0) {
    return "partial";
  }

  return payment.status;
}

const emptyInvoice = () => ({
  userId: "",
  amount: "",
  description: "Operational Syllabus Fee",
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
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoice());
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [settlementAmount, setSettlementAmount] = useState("");
  const [settlementDate, setSettlementDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (user.role !== "admin") { router.replace("/trainer/dashboard"); return; }
    loadData();
  }, [loading, user, router]);

  const loadData = async () => {
    try {
      const [p, c, pl] = await Promise.all([listPayments(), listCustomers(), listAllPlans()]);
      setPayments(p);
      setCustomers(c);
      setPlans(pl);
    } finally {
      setDataLoaded(true);
    }
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
      setFormError("Identifier mismatch: Client, magnitude, and timestamp required.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await createPayment({
        userId: invoiceForm.userId,
        planId: invoiceForm.planId || undefined,
        amount: parseFloat(invoiceForm.amount),
        paidAmount: 0,
        description: invoiceForm.description,
        dueDate: invoiceForm.dueDate,
        status: "pending",
      });
      setShowCreateModal(false);
      setInvoiceForm(emptyInvoice());
      await loadData();
    } catch {
      setFormError("System Link Failure: Invoice dispatch aborted.");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (paymentId: string) => {
    const today = new Date().toISOString().split("T")[0];
    await updatePaymentStatus(paymentId, "paid", today, undefined);
    await loadData();
  };

  const openSettlementModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setSettlementAmount(payment.balanceAmount.toString());
    setSettlementDate(new Date().toISOString().slice(0, 10));
    setFormError("");
    setShowSettlementModal(true);
  };

  const handleRecordSettlement = async () => {
    if (!selectedPayment) return;

    const received = Number(settlementAmount);
    if (Number.isNaN(received) || received <= 0) {
      setFormError("Settlement amount must be greater than zero.");
      return;
    }

    if (received > selectedPayment.balanceAmount) {
      setFormError("Settlement amount cannot exceed the outstanding balance.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      await recordPaymentInstallment(selectedPayment.id, {
        paymentReceivedAmount: received,
        paidDate: settlementDate,
      });
      setShowSettlementModal(false);
      setSelectedPayment(null);
      setSettlementAmount("");
      await loadData();
    } catch {
      setFormError("Unable to record this settlement right now.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (paymentId: string) => {
    if (!window.confirm("Purge financial record? This action is permanent.")) return;
    await deletePayment(paymentId);
    await loadData();
  };

  if (loading || !dataLoaded || !user) {
    return (
      <DashboardLayout role="admin">
        <div className="p-8 max-w-6xl mx-auto animate-pulse space-y-12">
           <div className="h-12 w-64 bg-zinc-900 rounded-lg" />
           <div className="grid grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-[2rem]" />)}
           </div>
           <div className="h-96 bg-zinc-900 rounded-[3rem]" />
        </div>
      </DashboardLayout>
    );
  }

  const filtered = filterStatus === "all" ? payments : payments.filter(p => p.status === filterStatus);
  const getClientName = (userId: string) => customers.find(c => c.id === userId)?.name ?? "UNKNOWN ASSET";
  const getPlanName = (userId: string) => plans.find(p => p.userId === userId && p.status === "active")?.name ?? "N/A";

  const totalRevenue = payments.reduce((sum, p) => sum + p.paidAmount, 0);
  const pendingTotal = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.balanceAmount, 0);
  const overdueTotal = payments.filter(p => p.status === "overdue").reduce((sum, p) => sum + p.balanceAmount, 0);
  
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthRevenue = payments
    .filter(p => p.paidDate?.startsWith(thisMonth))
    .reduce((sum, p) => sum + p.paidAmount, 0);

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-8 text-white">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
            >
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-6 italic">
                <Shield className="w-3 h-3 fill-orange-500" /> Secure Financial Link Active
              </div>
              <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-none">
                 Fiscal <span className="text-orange-500">Manifest</span>
              </h1>
              <p className="text-zinc-500 font-medium mt-4">Auditing platform revenue, settlement protocols, and operational yield.</p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => { setInvoiceForm(emptyInvoice()); setShowCreateModal(true); setFormError(""); }}
              className="bg-white text-zinc-950 hover:bg-orange-500 hover:text-white px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-4 italic shadow-2xl shadow-white/5 active:scale-95"
            >
              <Plus className="w-5 h-5" /> Initialize Invoice
            </motion.button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Gross Yield", value: formatCurrency(totalRevenue), color: "text-emerald-500", icon: TrendingUp },
              { label: "Temporal Yield", value: formatCurrency(monthRevenue), color: "text-white", icon: Activity },
              { label: "Pending Settle", value: formatCurrency(pendingTotal), color: "text-orange-500", icon: Clock },
              { label: "Overdue Delta", value: formatCurrency(overdueTotal), color: "text-rose-500", icon: AlertCircle },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-colors"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <stat.icon className="w-12 h-12" />
                </div>
                <p className={`text-2xl font-black italic ${stat.color} truncate`}>{stat.value}</p>
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1 italic">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Table Controls */}
          <div className="mb-6 flex flex-wrap gap-3">
             {(["all", "paid", "pending", "overdue"] as const).map(status => (
               <button
                 key={status}
                 onClick={() => setFilterStatus(status)}
                 className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all italic border ${
                    filterStatus === status
                      ? "bg-white text-zinc-950 border-white"
                      : "bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-white"
                 }`}
               >
                 {status}
               </button>
             ))}
          </div>

          {/* Records Table */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl relative"
          >
             {filtered.length > 0 ? (
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-[11px] whitespace-nowrap">
                   <thead>
                     <tr className="bg-zinc-950/50 text-zinc-700 font-black uppercase tracking-[0.2em] italic border-b border-zinc-800">
                       <th className="px-8 py-6">Asset Identifier</th>
                       <th className="px-8 py-6">Mission Plan</th>
                       <th className="px-8 py-6">Invoice</th>
                       <th className="px-8 py-6">Paid</th>
                       <th className="px-8 py-6">Balance</th>
                       <th className="px-8 py-6">Due Timestamp</th>
                       <th className="px-8 py-6">Status</th>
                       <th className="px-8 py-6 text-right">Control</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-800/50">
                     {filtered.map((p, idx) => (
                       <motion.tr 
                         key={p.id} 
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: idx * 0.02 }}
                         className="hover:bg-zinc-950/40 transition-colors group"
                       >
                         <td className="px-8 py-6 font-black text-white italic uppercase tracking-tight">{getClientName(p.userId)}</td>
                         <td className="px-8 py-6 text-zinc-500 font-bold uppercase tracking-widest">{getPlanName(p.userId)}</td>
                         <td className="px-8 py-6 font-black text-white italic">{formatCurrency(p.amount)}</td>
                         <td className="px-8 py-6 font-black text-emerald-400 italic">{formatCurrency(p.paidAmount)}</td>
                         <td className="px-8 py-6 font-black text-amber-400 italic">{formatCurrency(p.balanceAmount)}</td>
                         <td className="px-8 py-6 text-zinc-500 font-bold uppercase tracking-widest">{p.dueDate || "N/A"}</td>
                         <td className="px-8 py-6"><PaymentBadge status={getDisplayStatus(p)} /></td>
                         <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                               {p.balanceAmount > 0 && (
                                 <button
                                   onClick={() => openSettlementModal(p)}
                                   className="bg-zinc-950 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest italic border border-zinc-800 hover:border-orange-500/40 hover:text-orange-400 transition-all flex items-center gap-2"
                                 >
                                   <DollarSign size={12} />
                                   Record Partial
                                 </button>
                               )}
                               {(p.status === "pending" || p.status === "overdue") && p.balanceAmount > 0 && (
                                 <button
                                   onClick={() => handleMarkPaid(p.id)}
                                   className="bg-orange-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest italic hover:bg-orange-400 transition-all flex items-center gap-2"
                                 >
                                   <Zap size={12} fill="currentColor" /> Authorize Settlement
                                 </button>
                               )}
                               <button 
                                 onClick={() => handleDelete(p.id)}
                                 className="w-10 h-10 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-700 hover:text-rose-500 hover:border-rose-500/30 transition-all"
                               >
                                  <Trash2 size={16} />
                               </button>
                            </div>
                         </td>
                       </motion.tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             ) : (
               <div className="p-32 text-center flex flex-col items-center justify-center">
                  <CreditCard className="w-12 h-12 text-zinc-800 opacity-20 mb-6" />
                  <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em] italic">Manifest Silent · Financial Log Empty</p>
               </div>
             )}
          </motion.div>
        </div>
      </div>

      {/* Invoice Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/90 backdrop-blur-xl p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-[3rem] w-full max-w-xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-10 z-10">
                <button onClick={() => setShowCreateModal(false)} className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-white flex items-center justify-center transition-all">
                   <X size={24} />
                </button>
              </div>

              <div className="p-10 md:p-14">
                <header className="mb-12">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-orange-500 flex items-center justify-center text-white mb-8 shadow-2xl shadow-orange-900/40">
                      <CreditCard size={32} />
                   </div>
                   <h2 className="text-3xl font-black italic uppercase tracking-tighter">Induct <span className="text-orange-500">Invoice</span></h2>
                   <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-2 italic">Initializing fiscal settlement protocol</p>
                </header>

                <div className="space-y-8">
                  {formError && (
                    <div className="p-5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest italic flex items-center gap-3">
                       <AlertCircle size={16} /> {formError}
                    </div>
                  )}

                  <div className="grid gap-8">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 italic">Target Asset Identifier</label>
                      <select
                        value={invoiceForm.userId}
                        onChange={(e) => handleClientChange(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-xs font-black text-white uppercase tracking-widest italic outline-none focus:border-zinc-600 appearance-none"
                      >
                        <option value="">— SELECT TARGET —</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name?.toUpperCase() || "UNIDENTIFIED"}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 italic">Magnitude (AED)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={invoiceForm.amount}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-xs font-black text-white uppercase tracking-widest italic outline-none focus:border-zinc-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 italic">Temporal Limit (Due Date)</label>
                        <input
                          type="date"
                          value={invoiceForm.dueDate}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-xs font-black text-white uppercase tracking-widest italic outline-none focus:border-zinc-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 italic">Deployment Memo (Description)</label>
                      <input
                        type="text"
                        value={invoiceForm.description}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-xs font-black text-white uppercase tracking-widest italic outline-none focus:border-zinc-600 placeholder:text-zinc-900"
                        placeholder="E.G. SYLLABUS INDUCTION FEED"
                      />
                    </div>
                  </div>

                  <div className="pt-10">
                    <button
                      onClick={handleCreateInvoice}
                      disabled={saving}
                      className="w-full bg-orange-500 text-white flex items-center justify-center gap-4 py-6 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.4em] italic hover:bg-orange-400 disabled:opacity-50 transition-all shadow-2xl shadow-orange-900/40 active:scale-95"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap size={16} fill="currentColor" /> Dispatch Settlement</>}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettlementModal && selectedPayment ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/90 backdrop-blur-xl p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-[3rem] w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-10 z-10">
                <button onClick={() => setShowSettlementModal(false)} className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-white flex items-center justify-center transition-all">
                  <X size={24} />
                </button>
              </div>
              <div className="p-10 md:p-14">
                <header className="mb-12">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-orange-500 flex items-center justify-center text-white mb-8 shadow-2xl shadow-orange-900/40">
                    <DollarSign size={32} />
                  </div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                    Record <span className="text-orange-500">Settlement</span>
                  </h2>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-2 italic">
                    Split or partial payment against the selected invoice
                  </p>
                </header>

                {formError ? (
                  <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest italic flex items-center gap-3">
                    <AlertCircle size={16} /> {formError}
                  </div>
                ) : null}

                <div className="grid gap-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Invoice</p>
                      <p className="mt-2 text-sm font-black italic text-white">{formatCurrency(selectedPayment.amount)}</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Paid</p>
                      <p className="mt-2 text-sm font-black italic text-emerald-400">{formatCurrency(selectedPayment.paidAmount)}</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Balance</p>
                      <p className="mt-2 text-sm font-black italic text-amber-400">{formatCurrency(selectedPayment.balanceAmount)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 italic">Received Amount (AED)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={settlementAmount}
                      onChange={(e) => setSettlementAmount(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-xs font-black text-white uppercase tracking-widest italic outline-none focus:border-zinc-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 italic">Settlement Date</label>
                    <input
                      type="date"
                      value={settlementDate}
                      onChange={(e) => setSettlementDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-xs font-black text-white uppercase tracking-widest italic outline-none focus:border-zinc-600"
                    />
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={handleRecordSettlement}
                      disabled={saving}
                      className="w-full bg-orange-500 text-white flex items-center justify-center gap-4 py-6 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.4em] italic hover:bg-orange-400 disabled:opacity-50 transition-all shadow-2xl shadow-orange-900/40 active:scale-95"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><DollarSign size={16} /> Record Payment</>}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </DashboardLayout>
  );
}
