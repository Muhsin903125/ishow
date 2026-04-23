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
  if (req.method !== "POST") {
    return sendMethodNotAllowed(res, ["POST"]);
  }

  const auth = await requireApiUser(req, res);
  if (!auth) return;

  if (
    !enforceRateLimit(req, res, {
      bucket: "notifications:mark-all-read",
      limit: 20,
      windowMs: 60_000,
      key: createRateLimitKey(req, "notifications:mark-all-read", auth.user.id),
    })
  ) {
    return;
  }

  try {
    const service = createServiceRoleClient();
    const { error } = await service
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", auth.user.id)
      .eq("is_read", false);

    if (error) {
      throw new ApiError(500, "Failed to update notifications");
    }

    await writeServerAudit(service, {
      userId: auth.user.id,
      action: "notification.mark_all_read",
      entityType: "notification",
      entityId: auth.user.id,
    });

    return sendSuccess(res, { ok: true });
  } catch (error) {
    return handleApiError(res, error, "[api/notifications][mark-all-read]");
  }
}
