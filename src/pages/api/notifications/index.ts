import type { NextApiRequest, NextApiResponse } from "next";
import { requireApiUser } from "@/lib/server/auth";
import { ApiError, handleApiError, sendMethodNotAllowed, sendSuccess } from "@/lib/server/api";
import { writeServerAudit } from "@/lib/server/audit";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { ensureObject, optionalString, requiredString } from "@/lib/server/validation";

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
      bucket: "notifications:create",
      limit: 30,
      windowMs: 60_000,
      key: createRateLimitKey(req, "notifications:create", auth.user.id),
    })
  ) {
    return;
  }

  try {
    if (!["admin", "trainer"].includes(auth.profile.role)) {
      throw new ApiError(403, "Forbidden");
    }

    const body = ensureObject(req.body);
    const payload = ensureObject(body.notification, "Invalid notification payload");
    const service = createServiceRoleClient();

    const insert = {
      user_id: requiredString(payload.userId, "Notification user is required"),
      type: requiredString(payload.type, "Notification type is required"),
      title: requiredString(payload.title, "Notification title is required"),
      body: optionalString(payload.body, 2000),
      href: optionalString(payload.href, 255),
    };

    const { data, error } = await service
      .from("notifications")
      .insert(insert)
      .select("*")
      .single();

    if (error || !data) {
      throw new ApiError(500, "Failed to create notification");
    }

    await writeServerAudit(service, {
      userId: auth.user.id,
      action: "notification.create",
      entityType: "notification",
      entityId: data.id as string,
      details: {
        userId: insert.user_id,
        type: insert.type,
      },
    });

    return sendSuccess(res, { ok: true, notification: data }, 201);
  } catch (error) {
    return handleApiError(res, error, "[api/notifications][POST]");
  }
}
