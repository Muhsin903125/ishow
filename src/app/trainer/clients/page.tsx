"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { getItems } from "@/lib/storage";
import { User as AuthUser } from "@/lib/auth";
import type { Assessment, Plan, Session } from "@/lib/mockData";
import { Users, ArrowRight, CheckCircle, Clock, AlertCircle, Loader2, Mail, Phone } from "lucide-react";

export default function TrainerClientsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<AuthUser[]>([]);
  const [dataMap, setDataMap] = useState<Record<string, { assessment?: Assessment; plan?: Plan; lastSession?: Session }>>({});
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push("/login"); return; }
      if (user.role !== "trainer") { router.push("/dashboard"); return; }

      const users = getItems<AuthUser>("ishow_users");
      const customerList = users.filter((u) => u.role === "customer");

      const assessments = getItems<Assessment>("ishow_assessments");
      const plans = getItems<Plan>("ishow_plans");
      const sessions = getItems<Session>("ishow_sessions");

      const map: Record<string, { assessment?: Assessment; plan?: Plan; lastSession?: Session }> = {};
      for (const client of customerList) {
        const assessment = assessments.find((a) => a.userId === client.id);
        const plan = plans.find((p) => p.userId === client.id && p.status === "active");
        const clientSessions = sessions
          .filter((s) => s.userId === client.id && s.status === "completed")
          .sort((a, b) => b.date.localeCompare(a.date));
        map[client.id] = { assessment, plan, lastSession: clientSessions[0] };
      }

      setClients(customerList);
      setDataMap(map);
      setDataLoaded(true);
    }
  }, [user, loading, router]);

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="trainer">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    );
  }

  const AssessmentBadge = ({ status }: { status?: string }) => {
    if (!status) return <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full text-xs font-medium">No Assessment</span>;
    if (status === "reviewed") return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" />Reviewed</span>;
    return <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><Clock className="w-3 h-3" />Pending</span>;
  };

  return (
    <DashboardLayout role="trainer">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Clients</h1>
            <p className="text-gray-500 mt-1">{clients.length} registered clients</p>
          </div>
        </div>

        {clients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clients.map((client) => {
              const { assessment, plan, lastSession } = dataMap[client.id] ?? {};
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
                        <span className="text-gray-700 text-xs">{new Date(lastSession.date + "T00:00:00").toLocaleDateString()}</span>
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
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h3 className="font-bold text-gray-600 text-lg mb-1">No Clients Yet</h3>
            <p className="text-gray-400 text-sm">Clients will appear here once they register.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
