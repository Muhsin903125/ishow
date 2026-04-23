import type { NextApiRequest, NextApiResponse } from "next";
import { requireApiUser } from "@/lib/server/auth";
import { ApiError, handleApiError, sendMethodNotAllowed, sendSuccess } from "@/lib/server/api";
import { writeServerAudit } from "@/lib/server/audit";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return sendMethodNotAllowed(res, ["PUT"]);
  }

  const auth = await requireApiUser(req, res);
  if (!auth) return;

  const notificationId =
    typeof req.query.notificationId === "string" ? req.query.notificationId : null;
  if (!notificationId) {
    return res.status(400).json({ error: "Invalid notification id" });
  }

  if (
    !enforceRateLimit(req, res, {
      bucket: "notifications:mark-read",
      limit: 60,
      windowMs: 60_000,
      key: createRateLimitKey(req, "notifications:mark-read", auth.user.id),
    })
  ) {
    return;
  }

  try {
    const service = createServiceRoleClient();
    const { data: notification, error: fetchError } = await service
      .from("notifications")
      .select("id, user_id")
      .eq("id", notificationId)
      .maybeSingle();

    if (fetchError || !notification) {
      throw new ApiError(404, "Notification not found");
    }

    if (notification.user_id !== auth.user.id) {
      throw new ApiError(403, "Forbidden");
    }

    const { error } = await service
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      throw new ApiError(500, "Failed to update notification");
    }

    await writeServerAudit(service, {
      userId: auth.user.id,
      action: "notification.mark_read",
      entityType: "notification",
      entityId: notificationId,
    });

    return sendSuccess(res, { ok: true });
  } catch (error) {
    return handleApiError(res, error, "[api/notifications][PUT]");
  }
}
