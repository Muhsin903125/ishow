import type { NextApiRequest, NextApiResponse } from "next";
import { requireApiUser } from "@/lib/server/auth";
import { ApiError, handleApiError, sendMethodNotAllowed, sendSuccess } from "@/lib/server/api";
import { writeServerAudit } from "@/lib/server/audit";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { formatDisplayDate, notifyProfile } from "@/lib/server/engagement";
import { ensureTrainerClientAccess } from "@/lib/server/payments";
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
  const auth = await requireApiUser(req, res, {
    roles: ["admin", "trainer", "customer"],
  });
  if (!auth) return;

  try {
    const service = createServiceRoleClient();

    if (req.method === "GET") {
      if (
        !enforceRateLimit(req, res, {
          bucket: "sessions:list",
          limit: 60,
          windowMs: 60_000,
          key: createRateLimitKey(req, "sessions:list", auth.user.id),
        })
      ) {
        return;
      }

      let query = service
        .from("sessions")
        .select("*")
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true });

      if (auth.profile.role === "customer") {
        query = query.eq("user_id", auth.user.id);
      } else if (auth.profile.role === "trainer") {
        query = query.eq("trainer_id", auth.user.id);
      } else {
        if (typeof req.query.userId === "string") {
          query = query.eq("user_id", req.query.userId);
        }
        if (typeof req.query.trainerId === "string") {
          query = query.eq("trainer_id", req.query.trainerId);
        }
        if (typeof req.query.status === "string") {
          query = query.eq("status", req.query.status);
        }
      }

      const { data, error } = await query;
      if (error) {
        throw new ApiError(500, "Failed to load sessions");
      }

      return sendSuccess(res, {
        ok: true,
        sessions: (data ?? []).map((row) => mapSession(row as Record<string, unknown>)),
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
        bucket: "sessions:create",
        limit: 20,
        windowMs: 60_000,
        key: createRateLimitKey(req, "sessions:create", auth.user.id),
      })
    ) {
      return;
    }

    const body = ensureObject(req.body);
    const payload = ensureObject(body.session, "Invalid session payload");

    const insert = {
      user_id: requiredString(payload.userId, "Client is required"),
      trainer_id:
        auth.profile.role === "trainer"
          ? auth.user.id
          : optionalString(payload.trainerId, 120),
      title: requiredString(payload.title, "Session title is required", {
        maxLength: 255,
      }),
      scheduled_date: requiredString(
        payload.scheduledDate,
        "Scheduled date is required"
      ),
      scheduled_time: requiredString(
        payload.scheduledTime,
        "Scheduled time is required"
      ),
      duration: optionalNumber(payload.duration, { min: 15, max: 480 }) ?? 60,
      status: enumValue(payload.status, SESSION_STATUSES, "Invalid session status"),
      notes: optionalString(payload.notes, 4000),
    };

    if (auth.profile.role === "trainer") {
      const assignment = await ensureTrainerClientAccess(
        service,
        auth.user.id,
        insert.user_id
      );

      if (!assignment) {
        throw new ApiError(403, "You can only schedule sessions for assigned clients");
      }
    }

    const { data, error } = await service
      .from("sessions")
      .insert(insert)
      .select("*")
      .single();

    if (error || !data) {
      throw new ApiError(500, "Failed to create session");
    }

    await notifyProfile(service, {
      userId: insert.user_id,
      notification: {
        type: "session_booked",
        title: "Session scheduled",
        body: `Your session "${insert.title}" is booked for ${insert.scheduled_date} at ${insert.scheduled_time}.`,
        href: "/sessions",
      },
      email: {
        type: "session-scheduled",
        data: {
          title: insert.title,
          date: formatDisplayDate(insert.scheduled_date),
          time: insert.scheduled_time,
          duration: insert.duration,
        },
      },
    });

    await writeServerAudit(service, {
      userId: auth.user.id,
      action: "session.create",
      entityType: "session",
      entityId: data.id as string,
      details: {
        userId: insert.user_id,
        trainerId: insert.trainer_id ?? null,
      },
    });

    return sendSuccess(res, { ok: true, session: mapSession(data) }, 201);
  } catch (error) {
    return handleApiError(res, error, "[api/sessions]");
  }
}
