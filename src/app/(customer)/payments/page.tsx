"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { getItems } from "@/lib/storage";
import type { Payment, Plan } from "@/lib/mockData";
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Loader2,
  Calendar,
} from "lucide-react";

function PaymentStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { color: string; icon: React.ReactNode }> = {
    paid: { color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
    pending: { color: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-3 h-3" /> },
    overdue: { color: "bg-red-100 text-red-700", icon: <AlertTriangle className="w-3 h-3" /> },
  };
  const config = configs[status.toLowerCase()] || configs.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${config.color}`}>
      {config.icon}
      {status}
    </span>
  );
}

export default function PaymentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push("/login"); return; }
      if (user.role !== "customer") { router.push("/trainer/dashboard"); return; }

      const allPayments = getItems<Payment>("ishow_payments");
      const userPayments = allPayments
        .filter((p) => p.userId === user.id)
        .sort((a, b) => b.dueDate.localeCompare(a.dueDate));

      const allPlans = getItems<Plan>("ishow_plans");
      const activePlan = allPlans.find((p) => p.userId === user.id && p.status === "active") ?? null;

      setPayments(userPayments);
      setPlan(activePlan);
      setDataLoaded(true);
    }
  }, [user, loading, router]);

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="customer">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
        </div>
      </DashboardLayout>
    );
  }

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter((p) => p.status === "pending" || p.status === "overdue").reduce((sum, p) => sum + p.amount, 0);
  const overduePayments = payments.filter((p) => p.status === "overdue");

  return (
    <DashboardLayout role="customer">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1">Payment history and subscription details</p>
        </div>

        {/* Overdue Alert */}
        {overduePayments.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Overdue Payments</p>
              <p className="text-red-700 text-sm mt-0.5">
                You have {overduePayments.length} overdue payment{overduePayments.length > 1 ? "s" : ""}.
                Please contact your trainer to arrange payment.
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-gray-500 text-sm">Total Paid</p>
            </div>
            <p className="text-2xl font-black text-gray-900">${totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-gray-500 text-sm">Pending</p>
            </div>
            <p className="text-2xl font-black text-gray-900">${pendingAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-gray-500 text-sm">Monthly Rate</p>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {plan ? `$${plan.monthlyRate}` : "—"}
            </p>
          </div>
        </div>

        {/* Subscription Info */}
        {plan && (
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-6 text-white mb-6">
            <h2 className="font-bold text-lg mb-4">Active Subscription</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-blue-300 text-xs">Plan</p>
                <p className="font-semibold mt-0.5">{plan.name}</p>
              </div>
              <div>
                <p className="text-blue-300 text-xs">Monthly Rate</p>
                <p className="font-semibold mt-0.5">${plan.monthlyRate}</p>
              </div>
              <div>
                <p className="text-blue-300 text-xs">Billing</p>
                <p className="font-semibold mt-0.5 capitalize">{plan.paymentFrequency}</p>
              </div>
              <div>
                <p className="text-blue-300 text-xs">Start Date</p>
                <p className="font-semibold mt-0.5">
                  {new Date(plan.startDate + "T00:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-lg">Payment History</h2>
          </div>
          {payments.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No payment history yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {payments.map((payment) => (
                <div key={payment.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      payment.status === "paid" ? "bg-green-100" :
                      payment.status === "overdue" ? "bg-red-100" : "bg-yellow-100"
                    }`}>
                      {payment.status === "paid" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : payment.status === "overdue" ? (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{payment.description}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(payment.dueDate + "T00:00:00").toLocaleDateString("en-US", {
                            month: "long", day: "numeric", year: "numeric",
                          })}
                        </span>
                        {payment.date && payment.status === "paid" && (
                          <span className="text-green-600 font-medium">
                            Paid: {new Date(payment.date + "T00:00:00").toLocaleDateString()}
                          </span>
                        )}
                        {payment.reference && (
                          <span className="text-gray-400 text-xs">Ref: {payment.reference}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900 text-lg">${payment.amount}</span>
                    <PaymentStatusBadge status={payment.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
