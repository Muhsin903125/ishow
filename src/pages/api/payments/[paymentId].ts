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
  syncOverduePayments,
} from "@/lib/server/payments";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { ensureObject, enumValue, optionalNumber, optionalString } from "@/lib/server/validation";

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
  const auth = await requireApiUser(req, res, { roles: ["admin", "trainer"] });
  if (!auth) return;

  const paymentId = typeof req.query.paymentId === "string" ? req.query.paymentId : null;
  if (!paymentId) {
    return res.status(400).json({ error: "Invalid payment id" });
  }

  if (
    !enforceRateLimit(req, res, {
      bucket: "payments:mutate",
      limit: 20,
      windowMs: 60_000,
      key: createRateLimitKey(req, "payments:mutate", auth.user.id),
    })
  ) {
    return;
  }

  try {
    const service = createServiceRoleClient();
    await syncOverduePayments(service);
    const { data: existing, error: existingError } = await service
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .maybeSingle();

    if (existingError || !existing) {
      throw new ApiError(404, "Payment not found");
    }

    if (auth.profile.role === "trainer") {
      const assignment = await ensureTrainerClientAccess(
        service,
        auth.user.id,
        existing.user_id as string,
        (existing.plan_id as string | null) ?? undefined
      );

      if (!assignment) {
        throw new ApiError(403, "Forbidden");
      }
    }

    if (req.method === "PUT") {
      const body = ensureObject(req.body);
      const payload = ensureObject(body.payment, "Invalid payment payload");

      const updates: Record<string, unknown> = {};
      const currentAmount = existing.amount as number;
      const currentPaidAmount = ((existing.paid_amount as number) ?? 0) as number;
      const requestedStatus =
        "status" in payload
          ? enumValue(payload.status, PAYMENT_STATUSES, "Invalid payment status")
          : null;
      const paymentReceivedAmount = optionalNumber(payload.paymentReceivedAmount, {
        min: 0,
        max: 1_000_000,
      });
      const paidAmountOverride = optionalNumber(payload.paidAmount, {
        min: 0,
        max: 1_000_000,
      });
      const paidDate = "paidDate" in payload ? optionalString(payload.paidDate, 40) : null;

      if ("status" in payload) {
        updates.status = requestedStatus;
      }

      if (paymentReceivedAmount !== null && paymentReceivedAmount !== undefined) {
        const nextPaidAmount = normalizePaidAmount(
          currentAmount,
          currentPaidAmount + paymentReceivedAmount
        );
        updates.paid_amount = nextPaidAmount;
        updates.status = derivePaymentStatus({
          amount: currentAmount,
          paidAmount: nextPaidAmount,
          dueDate: (existing.due_date as string | null) ?? null,
        });
        updates.paid_date = paidDate ?? new Date().toISOString().slice(0, 10);
      } else if (paidAmountOverride !== null && paidAmountOverride !== undefined) {
        const nextPaidAmount = normalizePaidAmount(currentAmount, paidAmountOverride);
        updates.paid_amount = nextPaidAmount;
        updates.status =
          requestedStatus === "paid"
            ? "paid"
            : derivePaymentStatus({
                amount: currentAmount,
                paidAmount: nextPaidAmount,
                dueDate: (existing.due_date as string | null) ?? null,
              });
        updates.paid_date =
          nextPaidAmount > 0
            ? paidDate ?? ((existing.paid_date as string | null) ?? new Date().toISOString().slice(0, 10))
            : null;
      } else if (requestedStatus === "paid") {
        updates.status = "paid";
        updates.paid_amount = currentAmount;
        updates.paid_date =
          paidDate ?? ((existing.paid_date as string | null) ?? new Date().toISOString().slice(0, 10));
      } else if ("paidDate" in payload) {
        updates.paid_date = paidDate;
      }

      if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No payment changes submitted");
      }

      const { data, error } = await service
        .from("payments")
        .update(updates)
        .eq("id", paymentId)
        .select("*")
        .maybeSingle();

      if (error || !data) {
        throw new ApiError(500, "Failed to update payment");
      }

      await writeServerAudit(service, {
        userId: auth.user.id,
        action: "payment.update",
        entityType: "payment",
        entityId: paymentId,
        details: updates,
      });

      if (updates.status === "paid" && existing.status !== "paid") {
        await notifyProfile(service, {
          userId: data.user_id as string,
          notification: {
            type: "payment_received",
            title: "Payment completed",
            body: `We recorded your full payment of AED ${data.amount as number}.`,
            href: "/payments",
          },
        });
      } else if (
        (updates.paid_amount as number | undefined) !== undefined &&
        (updates.status as string | undefined) !== "paid"
      ) {
        const paidAmount = (data.paid_amount as number) ?? 0;
        const balanceAmount = getPaymentBalance(data.amount as number, paidAmount);

        await notifyProfile(service, {
          userId: data.user_id as string,
          notification: {
            type: "payment_received",
            title: "Partial payment recorded",
            body: `We recorded AED ${paidAmount}. Remaining balance: AED ${balanceAmount}.`,
            href: "/payments",
          },
        });
      } else if (updates.status === "overdue" && existing.status !== "overdue") {
        await notifyProfile(service, {
          userId: data.user_id as string,
          notification: {
            type: "payment_overdue",
            title: "Payment overdue",
            body: `AED ${getPaymentBalance(
              data.amount as number,
              (data.paid_amount as number) ?? 0
            )} is now overdue.`,
            href: "/payments",
          },
        });
      }

      return sendSuccess(res, { ok: true, payment: mapPayment(data) });
    }

    if (req.method === "DELETE") {
      const { error } = await service.from("payments").delete().eq("id", paymentId);
      if (error) {
        throw new ApiError(500, "Failed to delete payment");
      }

      await writeServerAudit(service, {
        userId: auth.user.id,
        action: "payment.delete",
        entityType: "payment",
        entityId: paymentId,
      });

      return sendSuccess(res, { ok: true });
    }

    return sendMethodNotAllowed(res, ["PUT", "DELETE"]);
  } catch (error) {
    return handleApiError(res, error, "[api/payments][mutate]");
  }
}
