import { ApiError } from "@/lib/server/api";
import { syncOverduePayments } from "@/lib/server/payments";
import { createServiceRoleClient } from "@/lib/supabase/service";

type ServiceClient = ReturnType<typeof createServiceRoleClient>;

export type ReportRange = "30d" | "90d" | "365d" | "all";

export type ReportsOverview = {
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

export function parseReportRange(value: unknown): ReportRange {
  if (value === "30d" || value === "90d" || value === "365d" || value === "all") {
    return value;
  }

  return "90d";
}

function getRangeStart(range: ReportRange) {
  if (range === "all") {
    return null;
  }

  const days = range === "30d" ? 30 : range === "90d" ? 90 : 365;
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function inRange(value: string | null | undefined, rangeStart: string | null) {
  if (!rangeStart) return true;
  if (!value) return false;
  return value >= rangeStart;
}

function groupRevenueByMonth(
  payments: Array<{ status: string; amount: number; paid_date: string | null }>
) {
  const map: Record<string, number> = {};

  for (const payment of payments) {
    if (payment.status !== "paid" || !payment.paid_date) continue;
    const key = payment.paid_date.slice(0, 7);
    map[key] = (map[key] ?? 0) + payment.amount;
  }

  return Object.entries(map)
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-12)
    .map(([key, amount]) => ({
      month: new Date(`${key}-01`).toLocaleDateString("en-US", {
        month: "short",
      }),
      amount,
    }));
}

export async function buildAdminReportsOverview(
  service: ServiceClient,
  range: ReportRange
): Promise<ReportsOverview> {
  await syncOverduePayments(service);

  const [
    paymentsResponse,
    customersResponse,
    trainersResponse,
    sessionsResponse,
    plansResponse,
    assessmentsResponse,
    auditResponse,
  ] = await Promise.all([
    service
      .from("payments")
      .select("id, user_id, amount, status, paid_date, due_date, created_at")
      .order("created_at", { ascending: false }),
    service
      .from("profiles")
      .select("id, name, customer_status")
      .eq("role", "customer")
      .order("name"),
    service
      .from("profiles")
      .select("id, name")
      .eq("role", "trainer")
      .order("name"),
    service.from("sessions").select("id, status, trainer_id, scheduled_date"),
    service.from("plans").select("id, trainer_id, status"),
    service.from("assessments").select("id, status, submitted_at"),
    service
      .from("audit_logs")
      .select("id, action, entity_type, entity_id, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  if (
    paymentsResponse.error ||
    customersResponse.error ||
    trainersResponse.error ||
    sessionsResponse.error ||
    plansResponse.error ||
    assessmentsResponse.error ||
    auditResponse.error
  ) {
    throw new ApiError(500, "Failed to load reporting data");
  }

  const payments = paymentsResponse.data ?? [];
  const customers = customersResponse.data ?? [];
  const trainers = trainersResponse.data ?? [];
  const sessions = sessionsResponse.data ?? [];
  const plans = plansResponse.data ?? [];
  const assessments = assessmentsResponse.data ?? [];
  const auditRows = auditResponse.data ?? [];
  const rangeStart = getRangeStart(range);
  const monthKey = new Date().toISOString().slice(0, 7);

  const chartPayments = payments.filter((payment) =>
    inRange(
      ((payment.paid_date as string | null) ?? (payment.created_at as string | null))?.slice(0, 10),
      rangeStart
    )
  );
  const chartSessions = sessions.filter((session) =>
    inRange((session.scheduled_date as string | null) ?? null, rangeStart)
  );
  const chartAssessments = assessments.filter((assessment) =>
    inRange((assessment.submitted_at as string | null) ?? null, rangeStart)
  );
  const filteredAuditRows = auditRows.filter((row) =>
    inRange((row.created_at as string | null)?.slice(0, 10) ?? null, rangeStart)
  );

  const totalRevenue = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const monthRevenue = payments
    .filter(
      (payment) =>
        payment.status === "paid" && (payment.paid_date as string | null)?.startsWith(monthKey)
    )
    .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const activeClients = customers.filter(
    (customer) => customer.customer_status === "client"
  ).length;
  const pendingAssessments = chartAssessments.filter(
    (assessment) => assessment.status === "pending"
  ).length;
  const overduePayments = payments.filter(
    (payment) => payment.status === "overdue"
  ).length;
  const scheduledSessions = chartSessions.filter(
    (session) => session.status === "scheduled"
  ).length;
  const completedSessions = chartSessions.filter(
    (session) => session.status === "completed"
  ).length;
  const cancelledSessions = chartSessions.filter(
    (session) => session.status === "cancelled"
  ).length;
  const completionRate =
    chartSessions.length > 0
      ? Math.round((completedSessions / chartSessions.length) * 100)
      : 0;

  const sessionBreakdown = [
    { name: "Completed", value: completedSessions },
    { name: "Scheduled", value: scheduledSessions },
    { name: "Cancelled", value: cancelledSessions },
  ].filter((item) => item.value > 0);

  const clientsByTrainer = trainers
    .map((trainer) => ({
      trainerName: (trainer.name as string) || "Trainer",
      clientCount: plans.filter(
        (plan) =>
          plan.trainer_id === trainer.id && plan.status === "active"
      ).length,
    }))
    .sort((left, right) => right.clientCount - left.clientCount);

  const actorIds = [
    ...new Set(
      filteredAuditRows
        .map((row) => row.user_id as string | null)
        .filter((value): value is string => Boolean(value))
    ),
  ];

  const actorMap = new Map<string, string>();
  if (actorIds.length > 0) {
    const { data: actors } = await service
      .from("profiles")
      .select("id, name")
      .in("id", actorIds);

    for (const actor of actors ?? []) {
      actorMap.set(actor.id as string, (actor.name as string) || "Unknown");
    }
  }

  return {
    metrics: {
      totalRevenue,
      monthRevenue,
      activeClients,
      totalCustomers: customers.length,
      retentionRate:
        customers.length > 0
          ? Math.round((activeClients / customers.length) * 100)
          : 0,
      pendingAssessments,
      overduePayments,
      totalSessions: chartSessions.length,
      completionRate,
    },
    revenueByMonth: groupRevenueByMonth(
      chartPayments.map((payment) => ({
        status: payment.status as string,
        amount: Number(payment.amount ?? 0),
        paid_date: (payment.paid_date as string | null) ?? null,
      }))
    ),
    sessionBreakdown,
    clientsByTrainer,
    recentAudit: filteredAuditRows.slice(0, 12).map((row) => ({
      id: row.id as string,
      action: row.action as string,
      entityType: row.entity_type as string,
      entityId: row.entity_id as string,
      createdAt: row.created_at as string,
      actorName: actorMap.get(row.user_id as string) || "System",
    })),
    appliedRange: range,
  };
}

export function reportsOverviewToCsv(overview: ReportsOverview) {
  const lines = [
    ["Metric", "Value"],
    ["Applied Range", overview.appliedRange],
    ["Total Revenue", String(overview.metrics.totalRevenue)],
    ["Current Month Revenue", String(overview.metrics.monthRevenue)],
    ["Active Clients", String(overview.metrics.activeClients)],
    ["Total Customers", String(overview.metrics.totalCustomers)],
    ["Retention Rate", String(overview.metrics.retentionRate)],
    ["Pending Assessments", String(overview.metrics.pendingAssessments)],
    ["Overdue Payments", String(overview.metrics.overduePayments)],
    ["Total Sessions In Range", String(overview.metrics.totalSessions)],
    ["Completion Rate", String(overview.metrics.completionRate)],
    [],
    ["Revenue Month", "Amount"],
    ...overview.revenueByMonth.map((item) => [item.month, String(item.amount)]),
    [],
    ["Audit Action", "Entity Type", "Entity Id", "Actor", "Created At"],
    ...overview.recentAudit.map((item) => [
      item.action,
      item.entityType,
      item.entityId,
      item.actorName,
      item.createdAt,
    ]),
  ];

  return lines
    .map((row) =>
      row
        .map((cell = "") => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
}
