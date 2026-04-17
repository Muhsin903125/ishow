"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { listPayments, type Payment } from "@/lib/db/payments";
import DashboardLayout from "@/components/DashboardLayout";
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  FileText,
  TrendingUp,
  Filter,
} from "lucide-react";

type StatusFilter = "all" | "paid" | "pending" | "overdue";

const statusConfig = {
  paid: {
    label: "Paid",
    icon: CheckCircle,
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-500",
    row: "",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    badge: "bg-yellow-100 text-yellow-700",
    dot: "bg-yellow-400",
    row: "bg-yellow-50/40",
  },
  overdue: {
    label: "Overdue",
    icon: AlertTriangle,
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-500",
    row: "bg-red-50/40",
  },
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PaymentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    const load = async () => {
      if (!loading && user) {
        if (user.role === 'admin') { router.push('/admin/dashboard'); return; }
        if (user.role === 'trainer') { router.push('/trainer/dashboard'); return; }
        const all = await listPayments(user.id);
        setPayments(
          all.sort((a, b) => {
            const order = { overdue: 0, pending: 1, paid: 2 };
            return order[a.status] - order[b.status];
          })
        );
      }
    };
    load();
  }, [loading, user, router]);

  if (loading || !user) return null;

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "pending" || p.status === "overdue").reduce((s, p) => s + p.amount, 0);
  const overdue = payments.filter((p) => p.status === "overdue");
  const pending = payments.filter((p) => p.status === "pending");

  const filtered = filter === "all" ? payments : payments.filter((p) => p.status === filter);

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="w-full max-w-5xl p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1">Your billing history and upcoming payments</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 text-white rounded-2xl p-5">
            <DollarSign className="w-5 h-5 opacity-75 mb-2" />
            <p className="text-3xl font-black">AED {totalPaid}</p>
            <p className="text-sm opacity-60 font-medium mt-0.5">Total Paid</p>
          </div>
          <div className="bg-green-600 text-white rounded-2xl p-5">
            <CheckCircle className="w-5 h-5 opacity-75 mb-2" />
            <p className="text-3xl font-black">{payments.filter((p) => p.status === "paid").length}</p>
            <p className="text-sm opacity-75 font-medium mt-0.5">Paid Invoices</p>
          </div>
          <div className={`${pending.length > 0 ? "bg-yellow-500" : "bg-gray-100"} ${pending.length > 0 ? "text-white" : "text-gray-500"} rounded-2xl p-5`}>
            <Clock className="w-5 h-5 opacity-75 mb-2" />
            <p className="text-3xl font-black">{pending.length}</p>
            <p className="text-sm opacity-75 font-medium mt-0.5">Pending</p>
          </div>
          <div className={`${overdue.length > 0 ? "bg-red-500 text-white" : "bg-gray-100 text-gray-500"} rounded-2xl p-5`}>
            <AlertTriangle className="w-5 h-5 opacity-75 mb-2" />
            <p className="text-3xl font-black">{overdue.length}</p>
            <p className="text-sm opacity-75 font-medium mt-0.5">Overdue</p>
          </div>
        </div>

        {/* Overdue alert */}
        {overdue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-bold text-red-800">You have {overdue.length} overdue payment{overdue.length > 1 ? "s" : ""}</p>
              <p className="text-red-600 text-sm mt-0.5">
                Total outstanding: AED {overdue.reduce((s, p) => s + p.amount, 0)} — please contact your trainer to settle.
              </p>
            </div>
          </div>
        )}

        {/* Pending alert */}
        {pending.length > 0 && overdue.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-bold text-yellow-800">Upcoming payment due</p>
              <p className="text-yellow-700 text-sm mt-0.5">
                AED {totalPending} due on {formatDate(pending[0].dueDate)} — {pending[0].description}
              </p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {totalPaid + totalPending > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-bold text-gray-900">Payment Progress</span>
              </div>
              <span className="text-sm text-gray-500">
                AED {totalPaid} of AED {totalPaid + totalPending} paid
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all"
                style={{
                  width: `${Math.round((totalPaid / (totalPaid + totalPending)) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {Math.round((totalPaid / (totalPaid + totalPending)) * 100)}% of total plan cost paid
            </p>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 mr-1" />
          {(["all", "paid", "pending", "overdue"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all capitalize ${
                filter === f
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>

        {/* Payment list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No payments found</p>
            </div>
          ) : (
            filtered.map((payment) => {
              const cfg = statusConfig[payment.status];
              const Icon = cfg.icon;
              return (
                <div
                  key={payment.id}
                  className={`bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow ${cfg.row}`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-6 h-6 text-gray-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-bold text-gray-900">{payment.description}</p>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {payment.reference}
                          </span>
                          {payment.paidDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {payment.status === "paid" ? "Paid " : "Due "}{formatDate(payment.status === "paid" ? payment.paidDate : payment.dueDate)}
                            </span>
                          )}
                          {payment.status !== "paid" && payment.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-orange-400" />
                              Due {formatDate(payment.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-2xl font-black text-gray-900">AED {payment.amount}</span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
