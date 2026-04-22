"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { listPayments, createPayment, updatePaymentStatus, type Payment } from "@/lib/db/payments";
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
  ChevronRight,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowRight,
  Zap,
} from "lucide-react";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-AE", { 
    style: "currency", 
    currency: "AED", 
    maximumFractionDigits: 0 
  }).format(amount);

function PaymentBadge({ status }: { status: string }) {
  const map = {
    paid: { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle, label: "CLEARED" },
    pending: { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: Clock, label: "PENDING" },
    overdue: { color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: AlertCircle, label: "OVERDUE" },
  };
  const { color, bg, border, icon: Icon, label } = map[status as keyof typeof map] ?? map.pending;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest italic border ${bg} ${color} ${border}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}

const emptyInvoice = () => ({
  userId: "", 
  amount: "", 
  description: "Monthly Performance Fee", 
  dueDate: "", 
  planId: "",
});

export default function TrainerPaymentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [dataLoaded, setDataLoaded] = useState(false);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoice());

  useEffect(() => {
    if (!loading) {
      if (!user) { router.replace("/login"); return; }
      if (user.role === "customer") { router.replace("/dashboard"); return; }
      loadData();
    }
  }, [loading, user, router]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [p, c, allPlans] = await Promise.all([
        listPayments({ userId: undefined }), 
        listCustomers(),
        listAllPlans()
      ]);
      setPayments(p);
      setClients(c);
      setPlans(allPlans);
    } catch (err) {
      console.error("Error loading payments:", err);
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
      setFormError("Asset, quantum, and deadline required.");
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
      setShowInvoiceModal(false);
      setInvoiceForm(emptyInvoice());
      await loadData();
    } catch (err) {
      setFormError("Data sync protocol failure.");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (paymentId: string) => {
    await updatePaymentStatus(paymentId, "paid", new Date().toISOString().split("T")[0]);
    await loadData();
  };

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="trainer">
        <div className="p-8 max-w-full space-y-8 animate-pulse">
           <div className="h-10 w-48 bg-zinc-900 rounded-lg" />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-28 bg-zinc-900 rounded-[2rem]" />)}
           </div>
           <div className="h-96 bg-zinc-900 rounded-[2.5rem]" />
        </div>
      </DashboardLayout>
    );
  }

  const filtered = filterStatus === "all" ? payments : payments.filter(p => p.status === filterStatus);

  const getClientName = (userId: string) =>
    clients.find(c => c.id === userId)?.name ?? "UNKNOWN ASSET";

  const totalPaid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = payments.filter(p => p.status === "pending").length;
  const overdueCount = payments.filter(p => p.status === "overdue").length;

  return (
    <DashboardLayout role="trainer">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-10">
        <div className="max-w-full">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">
                 Yield <span className="text-orange-500">Manifest</span>
              </h1>
              <p className="text-zinc-500 mt-2 font-medium">Financial auditing and mission compensation logs.</p>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => { setInvoiceForm(emptyInvoice()); setShowInvoiceModal(true); setFormError(""); }}
              className="flex items-center gap-3 bg-white text-zinc-950 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-95 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
              Generate Invoice
            </motion.button>
          </div>

          {/* Summary Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { label: "Total Yield", value: formatCurrency(totalPaid), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "Pending Collection", value: pendingCount, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
              { label: "Critical Delays", value: overdueCount, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
            ].map((stat, idx) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden group hover:border-zinc-700 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-black text-white italic truncate">{stat.value}</p>
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1 italic uppercase">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Data Grid */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
             className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="flex border-b border-zinc-800/50 p-2 bg-zinc-950/20 backdrop-blur-sm">
              {(["all", "paid", "pending", "overdue"] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`flex-1 sm:flex-none px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1.2rem] transition-all relative ${
                    filterStatus === status ? "bg-white text-zinc-950 shadow-lg" : "text-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  {status === "all" ? "Whole Manifest" : status}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto scrollbar-hide">
              {filtered.length > 0 ? (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="text-[10px] font-black text-zinc-600 uppercase tracking-widest bg-zinc-950/50 border-b border-zinc-800/50 italic">
                    <tr>
                      <th className="px-8 py-5">Asset Identification</th>
                      <th className="px-8 py-5">Op Scope</th>
                      <th className="px-8 py-5">Quantum</th>
                      <th className="px-8 py-5">Deadline</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Ops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50 text-white font-medium">
                    {filtered.map((p, pIdx) => (
                      <motion.tr 
                        key={p.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + pIdx * 0.05 }}
                        className="hover:bg-zinc-800/30 transition-colors group"
                      >
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-700 italic group-hover:text-orange-500 transition-colors">
                                 {getClientName(p.userId).charAt(0)}
                              </div>
                              <span className="font-black italic uppercase tracking-tighter">{getClientName(p.userId)}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-zinc-500 text-[10px] font-black uppercase tracking-widest truncate max-w-[200px]">{p.description || "—"}</td>
                        <td className="px-8 py-6 font-black italic text-orange-500 text-base">{formatCurrency(p.amount)}</td>
                        <td className="px-8 py-6 text-zinc-600 text-[10px] font-black uppercase tracking-widest">{p.dueDate || "—"}</td>
                        <td className="px-8 py-6">
                           <PaymentBadge status={p.status} />
                        </td>
                        <td className="px-8 py-6 text-right">
                          {(p.status === "pending" || p.status === "overdue") && (
                            <button
                              onClick={() => handleMarkPaid(p.id)}
                              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest italic inline-flex items-center gap-2 transition-all active:scale-95 shadow-xl shadow-emerald-500/5"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Sign-off
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-24 text-center">
                  <Activity className="w-12 h-12 mx-auto mb-6 text-zinc-800 opacity-20" />
                  <p className="text-zinc-700 font-black uppercase text-[10px] tracking-[0.3em] italic">No Financial Delta Found</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Invoice Modal */}
      <AnimatePresence>
        {showInvoiceModal && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 w-full max-w-lg shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setShowInvoiceModal(false)} className="text-zinc-600 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-8 pr-12">
                 <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                   Invoice <span className="text-orange-500">Generation</span>
                 </h2>
                 <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-1 italic">Authorized financial protocol</p>
              </div>
              
              <div className="space-y-6">
                {formError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center gap-2 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest italic"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {formError}
                  </motion.div>
                )}
                
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Target Asset</label>
                  <select 
                    value={invoiceForm.userId}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white font-black uppercase focus:border-orange-500 outline-none transition-colors appearance-none"
                  >
                    <option value="">AWAITING ASSET SELECTION...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name?.toUpperCase() || c.email?.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Quantum (AED)</label>
                    <div className="relative">
                       <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                       <input 
                        type="number"
                        min="0"
                        step="0.01"
                        value={invoiceForm.amount}
                        onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-6 py-4 text-sm text-white font-black uppercase focus:border-orange-500 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Deadline</label>
                    <input 
                      type="date"
                      value={invoiceForm.dueDate}
                      onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white font-black uppercase focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Operational Scope</label>
                  <input 
                    type="text"
                    value={invoiceForm.description}
                    onChange={(e) => setInvoiceForm({...invoiceForm, description: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white font-black uppercase focus:border-orange-500 outline-none placeholder:text-zinc-800"
                    placeholder="E.G. MONTHLY PERFORMANCE FEE"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={handleCreateInvoice} 
                    disabled={saving}
                    className="flex-1 bg-white text-zinc-950 hover:bg-orange-500 hover:text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all disabled:opacity-20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authorize Yield"}
                  </button>
                  <button 
                    onClick={() => setShowInvoiceModal(false)}
                    className="flex-1 bg-zinc-800 text-white hover:bg-zinc-700 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                  >
                    Abort
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}
