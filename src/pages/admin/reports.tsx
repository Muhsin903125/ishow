"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import {
  DashboardPageEmpty,
  DashboardPageError,
  DashboardPageLoading,
} from "@/components/dashboard/PageState";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Activity,
  BarChart2,
  CalendarCheck,
  Download,
  DollarSign,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ReportRange = "30d" | "90d" | "365d" | "all";

type ReportsOverview = {
  metrics: {
    totalRevenue: number;
    monthRevenue: number;
    activeClients: number;
    totalCustomers: number;
    retentionRate: number;
    pendingAssessments: number;
    overduePayments: number;
    totalSessions: number;
    completionRate: number;
  };
  revenueByMonth: Array<{ month: string; amount: number }>;
  sessionBreakdown: Array<{ name: string; value: number }>;
  clientsByTrainer: Array<{ trainerName: string; clientCount: number }>;
  recentAudit: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    createdAt: string;
    actorName: string;
  }>;
  appliedRange: ReportRange;
};

const PIE_COLORS = ["#f97316", "#0f766e", "#64748b"];
const RANGE_OPTIONS: Array<{ value: ReportRange; label: string }> = [
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "365d", label: "Last 12 months" },
  { value: "all", label: "All time" },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(amount);
}

function prettifyAction(action: string) {
  return action.replaceAll(".", " ");
}

export default function AdminReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [overview, setOverview] = useState<ReportsOverview | null>(null);
  const [fetching, setFetching] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [range, setRange] = useState<ReportRange>("90d");

  const loadOverview = async (selectedRange: ReportRange) => {
    setFetching(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/reports/overview?range=${selectedRange}`);
      const payload =
        (await response.json()) as
          | { ok: true; overview: ReportsOverview }
          | { error: string };

      if (!response.ok || !("ok" in payload)) {
        throw new Error("error" in payload ? payload.error : "Failed to load reports");
      }

      setOverview(payload.overview);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : "Failed to load reports"
      );
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/trainer/dashboard");
      return;
    }

    void loadOverview(range);
  }, [loading, range, router, user]);

  const kpis = useMemo(() => {
    if (!overview) return [];

    return [
      {
        label: "Total Revenue",
        value: formatCurrency(overview.metrics.totalRevenue),
        sub: `${overview.metrics.activeClients} active clients`,
        icon: DollarSign,
      },
      {
        label: "This Month",
        value: formatCurrency(overview.metrics.monthRevenue),
        sub: `${overview.metrics.pendingAssessments} pending assessments`,
        icon: TrendingUp,
      },
      {
        label: "Session Completion",
        value: `${overview.metrics.completionRate}%`,
        sub: `${overview.metrics.totalSessions} sessions in range`,
        icon: CalendarCheck,
      },
      {
        label: "Retention",
        value: `${overview.metrics.retentionRate}%`,
        sub: `${overview.metrics.overduePayments} overdue payments`,
        icon: Users,
      },
    ];
  }, [overview]);

  const handleExport = async () => {
    setExporting(true);

    try {
      const response = await fetch(`/api/admin/reports/export?range=${range}`);
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ error: "Export failed" }))) as {
          error?: string;
        };
        throw new Error(payload.error || "Export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `admin-reports-${range}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(
        exportError instanceof Error ? exportError.message : "Export failed"
      );
    } finally {
      setExporting(false);
    }
  };

  if (loading || fetching) {
    return (
      <DashboardLayout role="admin">
        <DashboardPageLoading
          role="admin"
          label="Loading server-backed reporting, audit activity, and trend lines."
        />
      </DashboardLayout>
    );
  }

  if (!overview || error) {
    return (
      <DashboardLayout role="admin">
        <DashboardPageError
          role="admin"
          title="We could not load the reporting overview."
          description={error || "Please refresh and try again."}
          action={
            <Button
              onClick={() => void loadOverview(range)}
              className="bg-slate-950 text-white hover:bg-slate-800"
            >
              Try again
            </Button>
          }
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7f3ec_0%,#fffdf9_38%,#f3f8ff_100%)] p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-orange-600">
                  <Shield className="h-3.5 w-3.5" />
                  Admin reporting
                </div>
                <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950">
                  Operational Visibility
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
                  Revenue, delivery health, and audit activity are now summarized on
                  the server. Use the reporting window to review shorter operational
                  periods without losing full-platform totals.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Window
                  <select
                    value={range}
                    onChange={(event) => setRange(event.target.value as ReportRange)}
                    className="mt-2 block w-full bg-transparent text-sm font-semibold normal-case tracking-normal text-slate-900 outline-none"
                  >
                    {RANGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={exporting}
                  className="h-[54px] rounded-2xl border-slate-200 bg-white px-5 text-sm font-bold uppercase tracking-[0.18em] text-slate-700 hover:bg-slate-50"
                >
                  {exporting ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Export CSV
                </Button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="mt-5 text-3xl font-black tracking-tight text-slate-950">
                  {item.value}
                </p>
                <p className="mt-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-3 text-sm text-slate-600">{item.sub}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
            <div className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    Revenue Trajectory
                  </h2>
                  <p className="text-sm text-slate-600">
                    Paid revenue inside the selected reporting window.
                  </p>
                </div>
              </div>
              <div className="mt-6 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={overview.revenueByMonth}>
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                      contentStyle={{
                        borderRadius: "16px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 20px 50px rgba(15,23,42,0.08)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#f97316"
                      fill="url(#revenueFill)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-950">
                      Session Mix
                    </h2>
                    <p className="text-sm text-slate-600">
                      Delivery health for the selected time window.
                    </p>
                  </div>
                </div>
                <div className="mt-6 h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overview.sessionBreakdown}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={92}
                        paddingAngle={4}
                      >
                        {overview.sessionBreakdown.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <BarChart2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-950">
                      Trainer Load
                    </h2>
                    <p className="text-sm text-slate-600">
                      Active client assignments by trainer.
                    </p>
                  </div>
                </div>
                <div className="mt-6 h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overview.clientsByTrainer}>
                      <CartesianGrid stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="trainerName"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
                      />
                      <Tooltip />
                      <Bar dataKey="clientCount" radius={[12, 12, 0, 0]} fill="#0f766e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Recent Audit Activity
                </h2>
                <p className="text-sm text-slate-600">
                  Latest server-side actions inside the selected reporting window.
                </p>
              </div>
            </div>

            <div className="mt-6">
              {overview.recentAudit.length > 0 ? (
                <div className="grid gap-3">
                  {overview.recentAudit.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-3 rounded-[1.5rem] border border-slate-200/80 bg-slate-50 px-5 py-4 md:grid-cols-[1.1fr_0.8fr_0.8fr]"
                    >
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-600">
                          {item.actorName}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900 capitalize">
                          {prettifyAction(item.action)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                          Entity
                        </p>
                        <p className="mt-2 text-sm text-slate-700">
                          {item.entityType} · {item.entityId.slice(0, 8)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                          When
                        </p>
                        <p className="mt-2 text-sm text-slate-700">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <DashboardPageEmpty
                  role="admin"
                  title="No audit records in this range yet."
                  description="Try a wider reporting window or export the current summary for offline review."
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
