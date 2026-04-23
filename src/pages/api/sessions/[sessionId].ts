import type { NextApiRequest, NextApiResponse } from "next";
import { requireApiUser } from "@/lib/server/auth";
import { ApiError, handleApiError, sendMethodNotAllowed, sendSuccess } from "@/lib/server/api";
import { writeServerAudit } from "@/lib/server/audit";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { formatDisplayDate, notifyProfile } from "@/lib/server/engagement";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { ensureObject, enumValue, optionalNumber, optionalString, requiredString } from "@/lib/server/validation";

const SESSION_STATUSES = ["scheduled", "completed", "cancelled"] as const;

function mapSession(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    trainerId: (row.trainer_id as string) ?? undefined,
    title: row.title as string,
    scheduledDate: row.scheduled_date as string,
    scheduledTime: row.scheduled_time as string,
    duration: (row.duration as number) ?? 60,
    status: row.status as string,
    notes: (row.notes as string) ?? undefined,
    cancelReason:
      (row.cancel_reason as string) ?? (row.cancelReason as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await requireApiUser(req, res);
  if (!auth) return;

  const sessionId = typeof req.query.sessionId === "string" ? req.query.sessionId : null;
  if (!sessionId) {
    return res.status(400).json({ error: "Invalid session id" });
  }

  if (
    !enforceRateLimit(req, res, {
      bucket: "sessions:mutate",
      limit: 30,
      windowMs: 60_000,
      key: createRateLimitKey(req, "sessions:mutate", auth.user.id),
    })
  ) {
    return;
  }

  try {
    const service = createServiceRoleClient();
    const { data: existing, error: existingError } = await service
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .maybeSingle();

    if (existingError || !existing) {
      throw new ApiError(404, "Session not found");
    }

    if (
      auth.profile.role === "customer" &&
      existing.user_id !== auth.user.id
    ) {
      throw new ApiError(403, "Forbidden");
    }

    if (
      auth.profile.role === "trainer" &&
      existing.trainer_id &&
      existing.trainer_id !== auth.user.id
    ) {
      throw new ApiError(403, "Forbidden");
    }

    if (req.method === "PUT") {
      const body = ensureObject(req.body);
      const payload = ensureObject(body.session, "Invalid session payload");
      const updates: Record<string, unknown> = {};

      if (auth.profile.role === "customer") {
        const allowedKeys = Object.keys(payload);
        if (
          payload.status !== "cancelled" ||
          allowedKeys.some((key) => !["status", "cancelReason"].includes(key))
        ) {
          throw new ApiError(403, "Customers can only cancel their own sessions");
        }
        updates.status = "cancelled";
        if ("cancelReason" in payload) {
          updates.cancel_reason = optionalString(payload.cancelReason, 500);
        }
      } else {
        if ("title" in payload) updates.title = optionalString(payload.title, 255);
        if ("scheduledDate" in payload) {
          updates.scheduled_date = optionalString(payload.scheduledDate, 40);
        }
        if ("scheduledTime" in payload) {
          updates.scheduled_time = optionalString(payload.scheduledTime, 40);
        }
        if ("duration" in payload) {
          updates.duration = optionalNumber(payload.duration, { min: 15, max: 480 });
        }
        if ("status" in payload && payload.status !== undefined) {
          updates.status = enumValue(
            payload.status,
            SESSION_STATUSES,
            "Invalid session status"
          );
        }
        if ("notes" in payload) updates.notes = optionalString(payload.notes, 4000);
        if ("trainerId" in payload) {
          updates.trainer_id =
            auth.profile.role === "trainer"
              ? auth.user.id
              : optionalString(payload.trainerId, 120);
        }
        if ("status" in payload && payload.status === "cancelled") {
          updates.cancel_reason = requiredString(
            payload.cancelReason,
            "Cancel reason is required",
            { maxLength: 500 }
          );
        } else if ("cancelReason" in payload) {
          updates.cancel_reason = optionalString(payload.cancelReason, 500);
        }
      }

      if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No session changes submitted");
      }

      const { data, error } = await service
        .from("sessions")
        .update(updates)
        .eq("id", sessionId)
        .select("*")
        .maybeSingle();

      if (error || !data) {
        throw new ApiError(500, "Failed to update session");
      }

      await writeServerAudit(service, {
        userId: auth.user.id,
        action: "session.update",
        entityType: "session",
        entityId: sessionId,
        details: updates,
      });

      const statusChanged =
        "status" in updates && updates.status !== existing.status;
      const timingChanged =
        ("scheduled_date" in updates &&
          updates.scheduled_date !== existing.scheduled_date) ||
        ("scheduled_time" in updates &&
          updates.scheduled_time !== existing.scheduled_time) ||
        ("duration" in updates && updates.duration !== existing.duration);

      if (statusChanged && updates.status === "cancelled") {
        const cancelReason =
          (data.cancel_reason as string | null) ?? (existing.cancel_reason as string | null);
        await notifyProfile(service, {
          userId: data.user_id as string,
          notification: {
            type: "session_cancelled",
            title: "Session cancelled",
            body: cancelReason
              ? `Your session "${data.title as string}" was cancelled: ${cancelReason}.`
              : `Your session "${data.title as string}" has been cancelled.`,
            href: "/sessions",
          },
          email: {
            type: "session-cancelled",
            data: {
              date: formatDisplayDate(data.scheduled_date as string),
              time: data.scheduled_time as string,
              duration: (data.duration as number) ?? 60,
              reason: cancelReason ?? undefined,
            },
          },
        });
      } else if (statusChanged && updates.status === "completed") {
        await notifyProfile(service, {
          userId: data.user_id as string,
          notification: {
            type: "session_completed",
            title: "Session completed",
            body: `Your session "${data.title as string}" has been marked complete.`,
            href: "/sessions",
          },
        });
      } else if (timingChanged) {
        await notifyProfile(service, {
          userId: data.user_id as string,
          notification: {
            type: "session_rescheduled",
            title: "Session updated",
            body: `Your session "${data.title as string}" has been moved to ${data.scheduled_date as string} at ${data.scheduled_time as string}.`,
            href: "/sessions",
          },
          email: {
            type: "session-rescheduled",
            data: {
              date: formatDisplayDate(data.scheduled_date as string),
              time: data.scheduled_time as string,
              oldDate: formatDisplayDate(existing.scheduled_date as string),
              oldTime: existing.scheduled_time as string,
              duration: (data.duration as number) ?? 60,
            },
          },
        });
      }

      return sendSuccess(res, { ok: true, session: mapSession(data) });
    }

    if (req.method === "DELETE") {
      if (!["admin", "trainer"].includes(auth.profile.role)) {
        throw new ApiError(403, "Forbidden");
      }

      const { error } = await service.from("sessions").delete().eq("id", sessionId);
      if (error) {
        throw new ApiError(500, "Failed to delete session");
      }

      await writeServerAudit(service, {
        userId: auth.user.id,
        action: "session.delete",
        entityType: "session",
        entityId: sessionId,
      });

      return sendSuccess(res, { ok: true });
    }

    return sendMethodNotAllowed(res, ["PUT", "DELETE"]);
  } catch (error) {
    return handleApiError(res, error, "[api/sessions][mutate]");
  }
}
