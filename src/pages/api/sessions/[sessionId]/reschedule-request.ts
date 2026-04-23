import type { NextApiRequest, NextApiResponse } from "next";
import { sendEmail } from "@/lib/email/sender";
import { writeServerAudit } from "@/lib/server/audit";
import { requireApiUser } from "@/lib/server/auth";
import { ApiError, handleApiError, sendMethodNotAllowed, sendSuccess } from "@/lib/server/api";
import { createUserNotification } from "@/lib/server/engagement";
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

  const auth = await requireApiUser(req, res, { roles: ["customer"] });
  if (!auth) return;

  const sessionId = typeof req.query.sessionId === "string" ? req.query.sessionId : null;
  if (!sessionId) {
    return res.status(400).json({ error: "Invalid session id" });
  }

  if (
    !enforceRateLimit(req, res, {
      bucket: "sessions:reschedule-request",
      limit: 10,
      windowMs: 60_000,
      key: createRateLimitKey(req, "sessions:reschedule-request", auth.user.id),
    })
  ) {
    return;
  }

  try {
    const body = ensureObject(req.body);
    const payload = ensureObject(body.request, "Invalid reschedule request");
    const preferredDate = requiredString(payload.preferredDate, "Preferred date is required");
    const note = optionalString(payload.note, 1000);
    const service = createServiceRoleClient();

    const { data: session, error: sessionError } = await service
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .maybeSingle();

    if (sessionError || !session) {
      throw new ApiError(404, "Session not found");
    }

    if ((session.user_id as string) !== auth.user.id) {
      throw new ApiError(403, "Forbidden");
    }

    if (!(session.trainer_id as string | null)) {
      throw new ApiError(400, "This session has no assigned trainer");
    }

    const { data: trainer, error: trainerError } = await service
      .from("profiles")
      .select("id, name, email")
      .eq("id", session.trainer_id as string)
      .maybeSingle();

    if (trainerError || !trainer?.email) {
      throw new ApiError(404, "Trainer contact not found");
    }

    await sendEmail({
      type: "session-reschedule-request",
      to: trainer.email as string,
      data: {
        clientName: auth.profile.name,
        sessionTitle: session.title as string,
        currentDate: session.scheduled_date as string,
        preferredDate,
        note: note ?? undefined,
      },
    });

    await createUserNotification(service, {
      userId: trainer.id as string,
      type: "session_reschedule_request",
      title: "Client requested a session change",
      body: `${auth.profile.name} asked to move "${session.title as string}" to ${preferredDate}.`,
      href: "/trainer/sessions",
    });

    await writeServerAudit(service, {
      userId: auth.user.id,
      action: "session.reschedule_request",
      entityType: "session",
      entityId: sessionId,
      details: {
        preferredDate,
        note: note ?? undefined,
      },
    });

    return sendSuccess(res, { ok: true });
  } catch (error) {
    return handleApiError(res, error, "[api/sessions/reschedule-request][POST]");
  }
}
