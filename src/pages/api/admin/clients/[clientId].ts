import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin, writeAdminAudit } from "@/lib/api/admin";
import {
  ApiError,
  handleApiError,
  sendMethodNotAllowed,
  sendSuccess,
} from "@/lib/server/api";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { ensureObject, optionalString } from "@/lib/server/validation";

function mapProfile(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    email: (row.email as string) ?? undefined,
    phone: (row.phone as string) ?? undefined,
    role: row.role as "trainer" | "customer" | "admin",
    customerStatus:
      (row.customer_status as "request" | "client" | undefined) ?? undefined,
    avatarUrl: (row.avatar_url as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

function mapPlan(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    trainerId: (row.trainer_id as string) ?? undefined,
    name: row.name as string,
    status: row.status as "active" | "inactive" | "pending",
    createdAt: row.created_at as string,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return sendMethodNotAllowed(res, ["PUT"]);
  }

  const auth = await requireAdmin(req, res);
  if (!auth.ok) return;

  const clientId = typeof req.query.clientId === "string" ? req.query.clientId : null;
  if (!clientId) {
    return res.status(400).json({ error: "Invalid client id" });
  }

  if (
    !enforceRateLimit(req, res, {
      bucket: "admin:clients:update",
      limit: 25,
      windowMs: 60_000,
      key: createRateLimitKey(req, "admin:clients:update", auth.userId),
    })
  ) {
    return;
  }

  try {
    const body = ensureObject(req.body);
    const payload = ensureObject(body.client, "Invalid client payload");
    const service = createServiceRoleClient();

    let updatedProfile: Record<string, unknown> | null = null;
    let updatedPlan: Record<string, unknown> | null = null;

    if ("customerStatus" in payload) {
      const customerStatus = optionalString(payload.customerStatus, 32);
      if (customerStatus !== "request" && customerStatus !== "client") {
        throw new ApiError(400, "Invalid customer status");
      }

      const { data, error } = await service
        .from("profiles")
        .update({
          customer_status: customerStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", clientId)
        .eq("role", "customer")
        .select("*")
        .maybeSingle();

      if (error || !data) {
        throw new ApiError(500, "Failed to update client status");
      }

      updatedProfile = data as Record<string, unknown>;

      await writeAdminAudit(auth.supabase, {
        userId: auth.userId,
        action: "client.status_update",
        entityType: "profile",
        entityId: clientId,
        details: { customerStatus },
      });
    }

    if ("trainerId" in payload) {
      const trainerId = optionalString(payload.trainerId, 120);
      if (!trainerId) {
        throw new ApiError(400, "Trainer is required");
      }

      const { data: activePlan, error: planLookupError } = await service
        .from("plans")
        .select("*")
        .eq("user_id", clientId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planLookupError) {
        throw new ApiError(500, "Failed to load client plan");
      }
      if (!activePlan) {
        throw new ApiError(409, "Asset has no active mission plan. Deployment required first.");
      }

      const { data, error } = await service
        .from("plans")
        .update({ trainer_id: trainerId })
        .eq("id", activePlan.id as string)
        .select("*")
        .maybeSingle();

      if (error || !data) {
        throw new ApiError(500, "Failed to assign trainer");
      }

      updatedPlan = data as Record<string, unknown>;

      await writeAdminAudit(auth.supabase, {
        userId: auth.userId,
        action: "client.assign_trainer",
        entityType: "plan",
        entityId: activePlan.id as string,
        details: {
          clientId,
          trainerId,
        },
      });
    }

    return sendSuccess(res, {
      ok: true,
      profile: updatedProfile ? mapProfile(updatedProfile) : null,
      plan: updatedPlan ? mapPlan(updatedPlan) : null,
    });
  } catch (error) {
    return handleApiError(res, error, "[api/admin/clients][PUT]");
  }
}
