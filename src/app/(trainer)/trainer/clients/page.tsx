"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getItems } from "@/lib/storage";
import type { User } from "@/lib/auth";
import type { Assessment, Payment, Plan, Session } from "@/lib/mockData";
import { Users, ClipboardList, Calendar, CreditCard, Phone, Mail, CheckCircle } from "lucide-react";

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TrainerClientsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [customers, setCustomers] = useState<User[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (!loading && user) {
      if (user.role !== "trainer") {
        router.push("/dashboard");
        return;
      }

      setCustomers(getItems<User>("ishow_users").filter((item) => item.role === "customer"));
      setAssessments(getItems<Assessment>("ishow_assessments"));
      setPlans(getItems<Plan>("ishow_plans"));
      setSessions(getItems<Session>("ishow_sessions"));
      setPayments(getItems<Payment>("ishow_payments"));
    }
  }, [loading, router, user]);

  if (loading || !user) return null;

  const today = new Date().toISOString().split("T")[0];

  return (
    <DashboardLayout role="TRAINER">
      <div className="w-full max-w-6xl p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">Overview of each client, their plan status, and next action.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {customers.map((customer) => {
            const assessment = assessments.find((item) => item.userId === customer.id);
            const plan = plans.find((item) => item.userId === customer.id && item.status === "active");
            const nextSession = sessions
              .filter((item) => item.userId === customer.id && item.status === "scheduled" && item.date >= today)
              .sort((left, right) => (left.date + left.time).localeCompare(right.date + right.time))[0];
            const paymentIssue = payments.find(
              (item) => item.userId === customer.id && (item.status === "pending" || item.status === "overdue")
            );

            return (
              <div key={customer.id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
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
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                    plan ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    {plan ? "Active plan" : "No active plan"}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 mb-5">
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                      <ClipboardList className="w-4 h-4 text-orange-500" />
                      Assessment
                    </div>
                    <p className="text-sm text-gray-600">
                      {assessment
                        ? `${assessment.status === "reviewed" ? "Reviewed" : "Pending"} · ${assessment.goals.map((goal) => goal.replaceAll("_", " ")).join(", ")}`
                        : "No assessment submitted yet."}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                      <Calendar className="w-4 h-4 text-blue-700" />
                      Next session
                    </div>
                    <p className="text-sm text-gray-600">
                      {nextSession ? `${nextSession.title} · ${formatDate(nextSession.date)} at ${nextSession.time}` : "No upcoming session scheduled."}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                      <CreditCard className="w-4 h-4 text-red-500" />
                      Billing
                    </div>
                    <p className="text-sm text-gray-600">
                      {paymentIssue ? `${paymentIssue.status.toUpperCase()} · $${paymentIssue.amount}` : "Billing is currently clear."}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                      <Users className="w-4 h-4 text-green-600" />
                      Active plan
                    </div>
                    <p className="text-sm text-gray-600">
                      {plan ? `${plan.name} · ${plan.duration}` : "Awaiting plan assignment."}
                    </p>
                  </div>
                </div>

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
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}