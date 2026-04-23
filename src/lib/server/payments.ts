import { createServiceRoleClient } from "@/lib/supabase/service";

type ServiceClient = ReturnType<typeof createServiceRoleClient>;
type AppRole = "admin" | "trainer" | "customer";

export function normalizePaidAmount(amount: number, paidAmount: number) {
  return Math.min(Math.max(paidAmount, 0), amount);
}

export function getPaymentBalance(amount: number, paidAmount: number) {
  return Math.max(amount - normalizePaidAmount(amount, paidAmount), 0);
}

export function derivePaymentStatus(input: {
  amount: number;
  paidAmount: number;
  dueDate?: string | null;
  today?: string;
}) {
  const { amount, dueDate, today = new Date().toISOString().slice(0, 10) } = input;
  const paidAmount = normalizePaidAmount(amount, input.paidAmount);

  if (paidAmount >= amount) {
    return "paid" as const;
  }

  if (dueDate && dueDate < today) {
    return "overdue" as const;
  }

  return "pending" as const;
}

export async function syncOverduePayments(
  service: ServiceClient,
  today = new Date().toISOString().slice(0, 10)
) {
  await service
    .from("payments")
    .update({ status: "overdue" })
    .in("status", ["pending", "overdue"])
    .lt("due_date", today);
}

export async function getTrainerClientIds(
  service: ServiceClient,
  trainerId: string
) {
  const { data, error } = await service
    .from("plans")
    .select("user_id")
    .eq("trainer_id", trainerId);

  if (error) {
    throw error;
  }

  return [...new Set((data ?? []).map((row) => row.user_id as string).filter(Boolean))];
}

export async function ensureTrainerClientAccess(
  service: ServiceClient,
  trainerId: string,
  userId: string,
  planId?: string | null
) {
  let query = service
    .from("plans")
    .select("id, user_id, trainer_id, status")
    .eq("trainer_id", trainerId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (planId) {
    query = query.eq("id", planId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function listPaymentsForRole(
  service: ServiceClient,
  options: {
    role: AppRole;
    authUserId: string;
    requestedUserId?: string | null;
  }
) {
  const { role, authUserId, requestedUserId } = options;

  let query = service
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (role === "customer") {
    query = query.eq("user_id", authUserId);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  if (role === "trainer") {
    const clientIds = await getTrainerClientIds(service, authUserId);
    if (clientIds.length === 0) {
      return [];
    }

    const scopedClientIds = requestedUserId
      ? clientIds.filter((clientId) => clientId === requestedUserId)
      : clientIds;

    if (scopedClientIds.length === 0) {
      return [];
    }

    const { data, error } = await query.in("user_id", scopedClientIds);
    if (error) throw error;
    return data ?? [];
  }

  if (requestedUserId) {
    query = query.eq("user_id", requestedUserId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
