import type { NextApiRequest, NextApiResponse } from "next";
import { requireApiUser } from "@/lib/server/auth";
import { ApiError, handleApiError, sendMethodNotAllowed, sendSuccess } from "@/lib/server/api";
import { writeServerAudit } from "@/lib/server/audit";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { notifyProfile } from "@/lib/server/engagement";
import {
  derivePaymentStatus,
  ensureTrainerClientAccess,
  getPaymentBalance,
  normalizePaidAmount,
  listPaymentsForRole,
  syncOverduePayments,
} from "@/lib/server/payments";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { ensureObject, enumValue, optionalNumber, optionalString, requiredString } from "@/lib/server/validation";

const PAYMENT_STATUSES = ["paid", "pending", "overdue"] as const;

function mapPayment(row: Record<string, unknown>) {
  const amount = row.amount as number;
  const paidAmount = ((row.paid_amount as number) ?? 0) as number;

  return {
    id: row.id as string,
    userId: row.user_id as string,
    planId: (row.plan_id as string) ?? undefined,
    amount,
    paidAmount,
    balanceAmount: getPaymentBalance(amount, paidAmount),
    paidDate: (row.paid_date as string) ?? undefined,
    dueDate: (row.due_date as string) ?? undefined,
    status: row.status as string,
    reference: (row.reference as string) ?? undefined,
    description: (row.description as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await requireApiUser(req, res, {
    roles: ["admin", "trainer", "customer"],
  });
  if (!auth) return;

  try {
    const service = createServiceRoleClient();
    await syncOverduePayments(service);

    if (req.method === "GET") {
      if (
        !enforceRateLimit(req, res, {
          bucket: "payments:list",
          limit: 60,
          windowMs: 60_000,
          key: createRateLimitKey(req, "payments:list", auth.user.id),
        })
      ) {
        return;
      }

      const requestedUserId =
        typeof req.query.userId === "string" ? req.query.userId : undefined;
      const payments = await listPaymentsForRole(service, {
        role: auth.profile.role,
        authUserId: auth.user.id,
        requestedUserId,
      });

      return sendSuccess(res, {
        ok: true,
        payments: payments.map((row) => mapPayment(row as Record<string, unknown>)),
      });
    }

    if (req.method !== "POST") {
      return sendMethodNotAllowed(res, ["GET", "POST"]);
    }

    if (auth.profile.role === "customer") {
      throw new ApiError(403, "Forbidden");
    }

    if (
      !enforceRateLimit(req, res, {
        bucket: "payments:create",
        limit: 15,
        windowMs: 60_000,
        key: createRateLimitKey(req, "payments:create", auth.user.id),
      })
    ) {
      return;
    }

    const body = ensureObject(req.body);
    const payload = ensureObject(body.payment, "Invalid payment payload");

    const insert = {
      user_id: requiredString(payload.userId, "Client is required"),
      plan_id: optionalString(payload.planId, 120),
      amount: optionalNumber(payload.amount, { min: 0.01, max: 1_000_000 }),
      paid_amount: optionalNumber(payload.paidAmount, { min: 0, max: 1_000_000 }) ?? 0,
      paid_date: optionalString(payload.paidDate, 40),
      due_date: optionalString(payload.dueDate, 40),
      reference: optionalString(payload.reference, 255),
      description: optionalString(payload.description, 1000),
    };

    if (insert.amount === null) {
      throw new ApiError(400, "Invoice amount is required");
    }

    insert.paid_amount = normalizePaidAmount(insert.amount, insert.paid_amount);
    const requestedStatus = enumValue(
      payload.status,
      PAYMENT_STATUSES,
      "Invalid payment status"
    );
    const derivedStatus =
      requestedStatus === "paid" && insert.paid_amount === 0
        ? "paid"
        : derivePaymentStatus({
            amount: insert.amount,
            paidAmount: insert.paid_amount,
            dueDate: insert.due_date,
          });

    const finalPaidAmount =
      requestedStatus === "paid" && insert.paid_amount === 0 ? insert.amount : insert.paid_amount;

    insert.paid_amount = finalPaidAmount;
    const status = requestedStatus === "paid" ? "paid" : derivedStatus;
    const paidDate =
      status === "paid" || finalPaidAmount > 0
        ? insert.paid_date ?? new Date().toISOString().slice(0, 10)
        : null;

    if (auth.profile.role === "trainer") {
      const assignment = await ensureTrainerClientAccess(
        service,
        auth.user.id,
        insert.user_id,
        insert.plan_id
      );

      if (!assignment) {
        throw new ApiError(403, "You can only invoice assigned clients");
      }
    }

    const { data, error } = await service
      .from("payments")
      .insert({
        ...insert,
        status,
        paid_amount: finalPaidAmount,
        paid_date: paidDate,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new ApiError(500, "Failed to create payment");
    }

    let planName = "Coaching plan";
    if (insert.plan_id) {
      const { data: plan } = await service
        .from("plans")
        .select("name")
        .eq("id", insert.plan_id)
        .maybeSingle();

      if (plan?.name) {
        planName = plan.name as string;
      }
    }

    await notifyProfile(service, {
      userId: insert.user_id,
      notification: {
        type: "payment_due",
        title: "Payment scheduled",
        body: `AED ${getPaymentBalance(insert.amount, finalPaidAmount)} is due on ${insert.due_date ?? "your due date"}.`,
        href: "/payments",
      },
      email:
        insert.due_date && getPaymentBalance(insert.amount, finalPaidAmount) > 0
          ? {
              type: "payment-due-reminder",
              data: {
                amount: getPaymentBalance(insert.amount, finalPaidAmount),
                dueDate: insert.due_date,
                planName,
              },
            }
          : undefined,
    });

    await writeServerAudit(service, {
      userId: auth.user.id,
      action: "payment.create",
      entityType: "payment",
      entityId: data.id as string,
      details: {
        userId: insert.user_id,
        amount: insert.amount,
        paidAmount: finalPaidAmount,
      },
    });

    return sendSuccess(res, { ok: true, payment: mapPayment(data) }, 201);
  } catch (error) {
    return handleApiError(res, error, "[api/payments]");
  }
}
