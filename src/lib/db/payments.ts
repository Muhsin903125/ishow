import { apiRequest } from "@/lib/api/client";

export interface Payment {
  id: string;
  userId: string;
  planId?: string;
  amount: number;
  paidAmount: number;
  balanceAmount: number;
  paidDate?: string;
  dueDate?: string;
  status: "paid" | "pending" | "overdue";
  reference?: string;
  description?: string;
  createdAt: string;
}

function mapPayment(row: Record<string, unknown>): Payment {
  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? (row.userId as string),
    planId: (row.plan_id as string) ?? (row.planId as string) ?? undefined,
    amount: row.amount as number,
    paidAmount: ((row.paid_amount as number) ?? (row.paidAmount as number) ?? 0) as number,
    balanceAmount:
      ((row.balance_amount as number) ??
        (row.balanceAmount as number) ??
        ((row.amount as number) -
          (((row.paid_amount as number) ?? (row.paidAmount as number) ?? 0) as number))) as number,
    paidDate: (row.paid_date as string) ?? (row.paidDate as string) ?? undefined,
    dueDate: (row.due_date as string) ?? (row.dueDate as string) ?? undefined,
    status: row.status as Payment["status"],
    reference: (row.reference as string) ?? undefined,
    description: (row.description as string) ?? undefined,
    createdAt: (row.created_at as string) ?? (row.createdAt as string),
  };
}

export async function listPayments(filters?: { userId?: string }): Promise<Payment[]> {
  const params = new URLSearchParams();
  if (filters?.userId) {
    params.set("userId", filters.userId);
  }

  const response = await apiRequest<{
    ok: true;
    payments: Record<string, unknown>[];
  }>(`/api/payments${params.size ? `?${params.toString()}` : ""}`);

  return response.payments.map(mapPayment);
}

export async function createPayment(
  payload: Omit<Payment, "id" | "createdAt" | "balanceAmount">
): Promise<Payment | null> {
  const response = await apiRequest<{
    ok: true;
    payment: Record<string, unknown>;
  }>("/api/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payment: payload }),
  });

  return mapPayment(response.payment);
}

export async function updatePaymentStatus(
  paymentId: string,
  status: Payment["status"],
  paidDate?: string,
  paymentReceivedAmount?: number
): Promise<Payment | null> {
  const response = await apiRequest<{
    ok: true;
    payment: Record<string, unknown>;
  }>(`/api/payments/${paymentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payment: {
        status,
        paidDate,
        paymentReceivedAmount,
      },
    }),
  });

  return mapPayment(response.payment);
}

export async function recordPaymentInstallment(
  paymentId: string,
  payload: {
    paymentReceivedAmount: number;
    paidDate?: string;
  }
): Promise<Payment | null> {
  const response = await apiRequest<{
    ok: true;
    payment: Record<string, unknown>;
  }>(`/api/payments/${paymentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payment: payload,
    }),
  });

  return mapPayment(response.payment);
}

export async function deletePayment(paymentId: string): Promise<boolean> {
  await apiRequest<{ ok: true }>(`/api/payments/${paymentId}`, {
    method: "DELETE",
  });
  return true;
}
