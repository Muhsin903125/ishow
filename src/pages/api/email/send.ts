import type { NextApiRequest, NextApiResponse } from "next";
import { sendEmail, validateEmailPayload } from "@/lib/email/sender";
import { requireApiUser } from "@/lib/server/auth";
import {
  ApiError,
  handleApiError,
  sendMethodNotAllowed,
  sendSuccess,
} from "@/lib/server/api";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { writeServerAudit } from "@/lib/server/audit";
import { createServiceRoleClient } from "@/lib/supabase/service";

type SuccessResponse = { ok: true };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return sendMethodNotAllowed(res, ["POST"]);
  }

  const auth = await requireApiUser(req, res, {
    roles: ["admin", "trainer", "customer"],
  });
  if (!auth) return;

  if (
    !enforceRateLimit(req, res, {
      bucket: "email:send",
      limit: auth.profile.role === "customer" ? 8 : 25,
      windowMs: 60_000,
      key: createRateLimitKey(req, "email:send", auth.user.id),
    })
  ) {
    return;
  }

  const service = createServiceRoleClient();

  try {
    if (!process.env.RESEND_API_KEY) {
      throw new ApiError(503, "Email service is not configured");
    }

    const payload = validateEmailPayload(req.body, {
      role: auth.profile.role,
      email: auth.profile.email ?? auth.user.email ?? null,
    });

    const ok = await sendEmail(payload);

    await writeServerAudit(service, {
      userId: auth.user.id,
      action: ok ? "email.send" : "email.send_failed",
      entityType: "email",
      entityId: payload.type,
      details: {
        to: payload.to,
        template: payload.type,
      },
    });

    if (!ok) {
      throw new ApiError(502, "Failed to send email");
    }

    return sendSuccess(res, { ok: true });
  } catch (error) {
    await writeServerAudit(service, {
      userId: auth.user.id,
      action: "email.send_rejected",
      entityType: "email",
      entityId: "request",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    if (error instanceof Error && !(error instanceof ApiError)) {
      return handleApiError(res, new ApiError(400, error.message), "[api/email/send]");
    }

    return handleApiError(res, error, "[api/email/send]");
  }
}
