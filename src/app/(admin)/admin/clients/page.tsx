"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { listCustomers, listTrainers, updateProfile, type Profile } from "@/lib/db/profiles";
import { listAssessments, type Assessment } from "@/lib/db/assessments";
import { listAllPlans, type Plan } from "@/lib/db/plans";
import { Mail, Phone, CheckCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminClientsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [customers, setCustomers] = useState<Profile[]>([]);
  const [trainers, setTrainers] = useState<Profile[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const loadData = async () => {
    const [c, t, a, p] = await Promise.all([
      listCustomers(), listTrainers(), listAssessments(), listAllPlans(),
    ]);
    setCustomers(c);
    setTrainers(t);
    setAssessments(a);
    setPlans(p);
  };

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    const init = async () => {
      if (!loading && user) {
        if (user.role !== 'admin') { router.push('/trainer/dashboard'); return; }
        await loadData();
      }
    };
    init();
  }, [loading, router, user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !user) return null;

  const assessmentByUserId = Object.fromEntries(assessments.map((a) => [a.userId, a]));
  const activePlanByUserId = Object.fromEntries(plans.filter((p) => p.status === "active").map((p) => [p.userId, p]));

  return (
    <DashboardLayout role="ADMIN">
      <div className="w-full max-w-5xl p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">All registered clients across trainers.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-7">
          <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm text-center">
            <p className="text-2xl font-black text-gray-900">{customers.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total Clients</p>
          </div>
          <div className="rounded-2xl bg-green-50 border border-green-100 p-4 shadow-sm text-center">
            <p className="text-2xl font-black text-green-600">{customers.filter((c) => c.customerStatus === "client").length}</p>
            <p className="text-xs text-green-500 mt-0.5">Active</p>
          </div>
          <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4 shadow-sm text-center">
            <p className="text-2xl font-black text-orange-600">{customers.filter((c) => c.customerStatus === "request").length}</p>
            <p className="text-xs text-orange-400 mt-0.5">Requests</p>
          </div>
        </div>

        <div className="space-y-3">
          {customers.length === 0 && (
            <p className="text-gray-400 text-center py-10">No clients yet.</p>
          )}

          {customers.map((customer) => {
            const expanded = expandedId === customer.id;
            const assessment = assessmentByUserId[customer.id];
            const activePlan = activePlanByUserId[customer.id];

            return (
              <div key={customer.id} className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedId(expanded ? null : customer.id)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{customer.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{customer.email ?? "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      customer.customerStatus === "client"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-600"
                    }`}>
                      {customer.customerStatus === "client"
                        ? <CheckCircle className="w-3 h-3" />
                        : <Clock className="w-3 h-3" />}
                      {customer.customerStatus === "client" ? "Client" : "Request"}
                    </span>
                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-gray-100 p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-2xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-400 mb-1">Assessment</p>
                        <p className="text-sm font-semibold text-gray-800 capitalize">
                          {assessment ? assessment.status : "Not submitted"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-400 mb-1">Active Plan</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {activePlan ? activePlan.name : "None"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-400 mb-1">Member Since</p>
                        <p className="text-sm font-semibold text-gray-800">{formatDate(customer.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                      {customer.email && (
                        <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{customer.email}</span>
                      )}
                      {customer.phone && (
                        <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{customer.phone}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {customer.customerStatus === "request" && (
                        <button
                          onClick={async () => {
                            await updateProfile(customer.id, { customerStatus: "client" });
                            await loadData();
                          }}
                          className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
                        >
                          Convert to Client
                        </button>
                      )}
                      {/* Assign trainer */}
                      {trainers.length > 0 && (
                        <div className="flex items-center gap-2">
                          {assigningId === customer.id ? (
                            <>
                              <select
                                defaultValue=""
                                onChange={async (e) => {
                                  if (!e.target.value) return;
                                  // trainer assignment would go on plans/sessions — for now just update status
                                  setAssigningId(null);
                                }}
                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                              >
                                <option value="">Select trainer…</option>
                                {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                              </select>
                              <button onClick={() => setAssigningId(null)} className="text-sm text-gray-400 hover:text-gray-600">Cancel</button>
                            </>
                          ) : (
                            <button
                              onClick={() => setAssigningId(customer.id)}
                              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                            >
                              Assign Trainer
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
