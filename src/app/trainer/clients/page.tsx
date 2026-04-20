"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { listCustomers, type Profile } from "@/lib/db/profiles";
import { listAssessments, type Assessment } from "@/lib/db/assessments";
import { listAllPlans, type Plan } from "@/lib/db/plans";
import { listSessions, type TrainingSession } from "@/lib/db/sessions";
import {
  Users,
  ArrowRight,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  Phone,
  Search,
} from "lucide-react";

type FilterStatus = "all" | "active" | "request" | "no-plan";

export default function TrainerClientsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Profile[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // TR3: Search & filter state
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push("/login"); return; }
      if (user.role === "customer") { router.push("/dashboard"); return; }
      loadData();
    }
  }, [user, loading, router]); // eslint-disable-line

  const loadData = async () => {
    const [c, a, p, s] = await Promise.all([
      listCustomers(),
      listAssessments(),
      listAllPlans(),
      listSessions(),
    ]);
    setClients(c);
    setAssessments(a);
    setPlans(p);
    setSessions(s);
    setDataLoaded(true);
  };

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="trainer">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    );
  }

  const assessmentByUserId = Object.fromEntries(assessments.map((a) => [a.userId, a]));

  const getActivePlan = (clientId: string) =>
    plans.find((p) => p.userId === clientId && p.status === "active");

  const getLastSession = (clientId: string) =>
    sessions
      .filter((s) => s.userId === clientId && s.status === "completed")
      .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate))[0];

  // TR3: Filter logic
  const displayedClients = clients.filter(client => {
    // Search filter
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      client.name.toLowerCase().includes(q) ||
      (client.email ?? "").toLowerCase().includes(q);

    // Status filter
    const clientPlan = getActivePlan(client.id);
    const matchesStatus = filterStatus === "all" ? true :
      filterStatus === "active" ? client.customerStatus === "client" && !!clientPlan :
      filterStatus === "request" ? client.customerStatus === "request" :
      filterStatus === "no-plan" ? !clientPlan : true;

    return matchesSearch && matchesStatus;
  });

  const AssessmentBadge = ({ status }: { status?: string }) => {
    if (!status) return <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full text-xs font-medium">No Assessment</span>;
    if (status === "reviewed") return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" />Reviewed</span>;
    return <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><Clock className="w-3 h-3" />Pending</span>;
  };

  return (
    <DashboardLayout role="trainer">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Clients</h1>
            <p className="text-gray-500 mt-1">{clients.length} registered clients</p>
          </div>
        </div>

        {/* TR3: Search bar and filter tabs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clients by name or email…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(["all", "active", "request", "no-plan"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  filterStatus === f ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f === "no-plan" ? "No Plan" : f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        <p className="text-sm text-gray-500 mb-4">
          Showing {displayedClients.length} of {clients.length} clients
        </p>

        {displayedClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedClients.map((client) => {
              const assessment = assessmentByUserId[client.id];
              const plan = getActivePlan(client.id);
              const lastSession = getLastSession(client.id);
              return (
                <div key={client.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{client.name}</p>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </p>
                        {client.phone && (
                          <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Assessment</span>
                      <AssessmentBadge status={assessment?.status} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Plan</span>
                      {plan ? (
                        <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">{plan.name}</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full text-xs font-medium">No Plan</span>
                      )}
                    </div>
                    {lastSession && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Last Session</span>
                        <span className="text-gray-700 text-xs">{new Date(lastSession.scheduledDate + "T00:00:00").toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/trainer/clients/${client.id}`}
                      className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      View Details <ArrowRight className="w-3 h-3" />
                    </Link>
                    {!plan && assessment && (
                      <Link
                        href={`/trainer/clients/${client.id}/assign-plan`}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        Assign Plan
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            {clients.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <h3 className="font-bold text-gray-600 text-lg mb-1">No Clients Yet</h3>
                <p className="text-gray-400 text-sm">Clients will appear here once they register.</p>
              </div>
            ) : (
              <>
                <p className="text-gray-500 text-sm">No clients match your search.</p>
                <button
                  onClick={() => { setSearch(""); setFilterStatus("all"); }}
                  className="mt-2 text-orange-500 text-sm font-semibold hover:text-orange-600 transition-colors"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
