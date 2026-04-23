"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import type { Payment } from "@/lib/db/payments";
import type { Plan } from "@/lib/db/plans";
import { loadCustomerWorkspace } from "@/lib/api/workspace";
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  History,
} from "lucide-react";

function PaymentStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
    paid: { 
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", 
      icon: <CheckCircle className="w-3 h-3" />,
      text: "Settled" 
    },
    partial: {
      color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      icon: <DollarSign className="w-3 h-3" />,
      text: "Partial"
    },
    pending: { 
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20", 
      icon: <Clock className="w-3 h-3" />,
      text: "Pending" 
    },
    overdue: { 
      color: "bg-rose-500/10 text-rose-500 border-rose-500/20", 
      icon: <AlertTriangle className="w-3 h-3" />,
      text: "Overdue" 
    },
  };
  const config = configs[status.toLowerCase()] || configs.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.color}`}>
      {config.icon}
      {config.text}
    </span>
  );
}

function getDisplayStatus(payment: Payment) {
  if (payment.status !== "paid" && payment.paidAmount > 0 && payment.balanceAmount > 0) {
    return "partial";
  }

  return payment.status;
}

export default function PaymentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.replace("/login"); return; }
      if (user.role !== "customer") { router.replace("/trainer/dashboard"); return; }

      (async () => {
        try {
          const workspace = await loadCustomerWorkspace();
          setPayments(workspace.payments);
          setPlan(workspace.plan);
        } catch (err) {
          console.error("Error loading payments:", err);
        } finally {
          setDataLoaded(true);
        }
      })();
    }
  }, [user, loading, router]);

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="customer">
        <div className="p-8 max-w-full space-y-8">
          <div className="h-10 w-48 bg-zinc-900 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-zinc-900 rounded-2xl animate-pulse" />
            <div className="h-32 bg-zinc-900 rounded-2xl animate-pulse" />
            <div className="h-32 bg-zinc-900 rounded-2xl animate-pulse" />
          </div>
          <div className="h-64 bg-zinc-900 rounded-3xl animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  const totalPaidValue = payments.reduce((sum, p) => sum + p.paidAmount, 0);
  const pendingAmountValue = payments.reduce((sum, p) => sum + p.balanceAmount, 0);
  const overduePayments = payments.filter((p) => p.status === "overdue");

  return (
    <DashboardLayout role="customer">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-10">
        <div className="max-w-full">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">
              Financial <span className="text-orange-500">Ledger</span>
            </h1>
            <p className="text-zinc-500 mt-2 font-medium">Transaction history and subscription economics.</p>
          </motion.div>

          {/* Overdue Alert */}
          {overduePayments.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 mb-8 flex items-start gap-4"
            >
              <div className="p-2 bg-rose-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              </div>
              <div>
                <p className="font-black text-rose-500 uppercase tracking-wider text-sm italic">Critical: Late Amortization</p>
                <p className="text-rose-400/80 text-xs mt-1 font-bold leading-relaxed">
                  System detected {overduePayments.length} overdue settlement{overduePayments.length > 1 ? "s" : ""}. 
                  Contact headquarters immediately to maintain infrastructure access.
                </p>
              </div>
            </motion.div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp className="w-12 h-12 text-orange-500" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <DollarSign className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Total Settled</span>
              </div>
              <p className="text-3xl font-black text-white italic">
                <span className="text-orange-500 text-sm align-top mr-1 font-black leading-none">AED</span>
                {totalPaidValue.toLocaleString()}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Clock className="w-12 h-12 text-amber-500" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Outstanding</span>
              </div>
              <p className="text-3xl font-black text-white italic">
                <span className="text-amber-500 text-sm align-top mr-1 font-black leading-none">AED</span>
                {pendingAmountValue.toLocaleString()}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <CreditCard className="w-12 h-12 text-orange-500" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <CreditCard className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Operational Rate</span>
              </div>
              <p className="text-3xl font-black text-white italic">
                <span className="text-orange-500 text-sm align-top mr-1 font-black leading-none">AED</span>
                {plan?.monthlyRate || "0"}
              </p>
            </motion.div>
          </div>

          {/* Active Subscription Details */}
          {plan && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 mb-10 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-zinc-800/20 blur-3xl rounded-full" />
              <div className="relative z-10">
                <h2 className="font-black text-white uppercase tracking-widest text-xs italic mb-8 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                  Active Protocol: <span className="text-orange-500">{plan.name}</span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div>
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">Billing Loop</p>
                    <p className="font-black text-white text-sm uppercase tracking-tight italic">{plan.paymentFrequency}</p>
                  </div>
                  <div>
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">Rate</p>
                    <p className="font-black text-white text-sm uppercase tracking-tight italic">AED {plan.monthlyRate}</p>
                  </div>
                  <div>
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">Initiated</p>
                    <p className="font-black text-white text-sm uppercase tracking-tight italic">
                      {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : "TBD"}
                    </p>
                  </div>
                  <div className="flex justify-end items-end">
                    <button className="flex items-center gap-2 bg-white text-zinc-950 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all transform active:scale-95">
                      Update Method
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Payment History List */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
              <h2 className="font-black text-white text-base uppercase tracking-widest italic flex items-center gap-3">
                <History className="w-5 h-5 text-zinc-500" />
                Transaction Manifest
              </h2>
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                {payments.length} Records Found
              </span>
            </div>

            {payments.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-6 opacity-20">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <p className="text-zinc-600 font-black uppercase text-xs tracking-widest">Empty Manifest</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {payments.map((payment) => (
                  <motion.div 
                    key={payment.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 md:p-8 flex items-center justify-between hover:bg-zinc-800/30 transition-all flex-wrap gap-6"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
                        payment.status === "paid" ? "bg-emerald-500/10 border-emerald-500/20" :
                        payment.status === "overdue" ? "bg-rose-500/10 border-rose-500/20" : "bg-amber-500/10 border-amber-500/20"
                      }`}>
                        {payment.status === "paid" ? (
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                        ) : payment.status === "overdue" ? (
                          <AlertTriangle className="w-6 h-6 text-rose-500" />
                        ) : (
                          <Clock className="w-6 h-6 text-amber-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-white uppercase tracking-tight italic text-base">
                          {payment.description || "Sub-Terminal Access"}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : "TBD"}
                          </span>
                          {payment.paidDate && payment.status === "paid" && (
                            <span className="text-emerald-500">
                              SETTLEMENT: {new Date(payment.paidDate).toLocaleDateString()}
                            </span>
                          )}
                          {payment.reference && (
                            <span className="opacity-40">TX_{payment.reference.slice(0, 8)}</span>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-widest">
                          <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-zinc-400">
                            Invoice AED {payment.amount.toLocaleString()}
                          </span>
                          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-400">
                            Paid AED {payment.paidAmount.toLocaleString()}
                          </span>
                          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-amber-400">
                            Balance AED {payment.balanceAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 ml-auto">
                      <div className="text-right">
                        <p className="text-xl font-black text-white italic leading-none">
                          <span className="text-[10px] text-zinc-500 mr-1">AED</span>
                          {payment.amount.toLocaleString()}
                        </p>
                        {payment.balanceAmount > 0 ? (
                          <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-amber-400">
                            Balance AED {payment.balanceAmount.toLocaleString()}
                          </p>
                        ) : null}
                      </div>
                      <PaymentStatusBadge status={getDisplayStatus(payment)} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
