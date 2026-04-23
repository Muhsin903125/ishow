import type { NextApiRequest, NextApiResponse } from "next";
import { requireApiUser } from "@/lib/server/auth";
import {
  ApiError,
  handleApiError,
  sendMethodNotAllowed,
  sendSuccess,
} from "@/lib/server/api";
import { writeServerAudit } from "@/lib/server/audit";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import {
  formatDisplayDate,
  notifyProfile,
} from "@/lib/server/engagement";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  ensureObject,
  optionalNumber,
  optionalString,
  requiredString,
} from "@/lib/server/validation";

function mapAssessment(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    assignedTrainerId: (row.assigned_trainer_id as string) ?? undefined,
    age: (row.age as number) ?? undefined,
    weight: (row.weight as string) ?? undefined,
    height: (row.height as string) ?? undefined,
    gender: (row.gender as string) ?? undefined,
    bodyMeasurements: (row.body_measurements as Record<string, unknown>) ?? {},
    goals: (row.goals as string[]) ?? [],
    experienceLevel: (row.experience_level as string) ?? undefined,
    healthConditions: (row.health_conditions as string) ?? undefined,
    medicalHistory: (row.medical_history as Record<string, unknown>) ?? {},
    daysPerWeek: (row.days_per_week as number) ?? undefined,
    preferredTimes: (row.preferred_times as string) ?? undefined,
    preferredDate: (row.preferred_date as string) ?? undefined,
    preferredTimeSlot: (row.preferred_time_slot as string) ?? undefined,
    preferredLocationId: (row.preferred_location_id as string) ?? undefined,
    preferredLocation: (row.preferred_location as string) ?? undefined,
    status: row.status as string,
    trainerNotes: (row.trainer_notes as string) ?? undefined,
    submittedAt: row.submitted_at as string,
    reviewedAt: (row.reviewed_at as string) ?? undefined,
    convertedToClientAt: (row.converted_to_client_at as string) ?? undefined,
  };
}

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
    createdAt: row.created_at as string,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return sendMethodNotAllowed(res, ["POST"]);
  }

  const auth = await requireApiUser(req, res, { roles: ["admin"] });
  if (!auth) return;

  if (
    !enforceRateLimit(req, res, {
      bucket: "admin:assessments:convert",
      limit: 15,
      windowMs: 60_000,
      key: createRateLimitKey(req, "admin:assessments:convert", auth.user.id),
    })
  ) {
    return;
  }

  try {
    const assessmentId =
      typeof req.query.assessmentId === "string" ? req.query.assessmentId : null;

    if (!assessmentId) {
      throw new ApiError(400, "Invalid assessment id");
    }

    const body = ensureObject(req.body);
    const payload = ensureObject(body.workflow, "Invalid workflow payload");
    const service = createServiceRoleClient();

    const { data: existing, error: existingError } = await service
      .from("assessments")
      .select("*")
      .eq("id", assessmentId)
      .maybeSingle();

    if (existingError || !existing) {
      throw new ApiError(404, "Assessment not found");
    }

    const assignedTrainerId =
      optionalString(payload.assignedTrainerId, 120) ??
      ((existing.assigned_trainer_id as string | null) ?? null);
    const trainerNotes = optionalString(payload.trainerNotes, 4000);
    const sessionPayload =
      payload.session && typeof payload.session === "object"
        ? (payload.session as Record<string, unknown>)
        : null;

    const { error: profileError } = await service
      .from("profiles")
      .update({
        customer_status: "client",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.user_id as string);

    if (profileError) {
      throw new ApiError(500, "Failed to convert customer profile");
    }

    const assessmentUpdates: Record<string, unknown> = {
      status: "reviewed",
      reviewed_at: new Date().toISOString(),
      converted_to_client_at: new Date().toISOString(),
      assigned_trainer_id: assignedTrainerId,
    };

    if (trainerNotes !== null) {
      assessmentUpdates.trainer_notes = trainerNotes;
    }

    const { data: assessment, error: assessmentError } = await service
      .from("assessments")
      .update(assessmentUpdates)
      .eq("id", assessmentId)
      .select("*")
      .maybeSingle();

    if (assessmentError || !assessment) {
      throw new ApiError(500, "Failed to update assessment");
    }

    let session: Record<string, unknown> | null = null;
    if (sessionPayload) {
      const title = requiredString(
        sessionPayload.title,
        "Session title is required",
        { maxLength: 255 }
      );
      const scheduledDate = requiredString(
        sessionPayload.date,
        "Scheduled date is required"
      );
      const scheduledTime = requiredString(
        sessionPayload.time,
        "Scheduled time is required"
      );
      const duration = optionalNumber(sessionPayload.duration, {
        min: 15,
        max: 480,
      });
      const notes = optionalString(sessionPayload.notes, 4000);

      const { data: createdSession, error: sessionError } = await service
        .from("sessions")
        .insert({
          user_id: existing.user_id as string,
          trainer_id: assignedTrainerId,
          title,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime,
          duration: duration ?? 60,
          status: "scheduled",
          notes,
        })
        .select("*")
        .maybeSingle();

      if (sessionError || !createdSession) {
        throw new ApiError(500, "Failed to create first session");
      }

      session = createdSession;
    }

    await writeServerAudit(service, {
      userId: auth.user.id,
      action: "assessment.convert_to_client",
      entityType: "assessment",
      entityId: assessmentId,
      details: {
        customerId: existing.user_id as string,
        assignedTrainerId,
        sessionId: (session?.id as string | undefined) ?? null,
      },
    });

    await notifyProfile(service, {
      userId: existing.user_id as string,
      notification: {
        type: "assessment_converted",
        title: "You are ready to begin",
        body: session
          ? `Your assessment is approved and your first session is booked for ${session.scheduled_date as string}.`
          : "Your assessment is approved and your coaching setup is now active.",
        href: session ? "/sessions" : "/dashboard",
      },
      email: {
        type: "assessment-reviewed",
        data: {
          notes: (assessment.trainer_notes as string | null) ?? undefined,
        },
      },
    });

    if (session) {
      await notifyProfile(service, {
        userId: existing.user_id as string,
        notification: {
          type: "session_booked",
          title: "First session scheduled",
          body: `Your session "${session.title as string}" is booked for ${session.scheduled_date as string} at ${session.scheduled_time as string}.`,
          href: "/sessions",
        },
        email: {
          type: "session-scheduled",
          data: {
            title: session.title as string,
            date: formatDisplayDate(session.scheduled_date as string),
            time: session.scheduled_time as string,
            duration: (session.duration as number) ?? 60,
            location:
              (assessment.preferred_location as string | null) ?? undefined,
          },
        },
      });
    }

    return sendSuccess(res, {
      ok: true,
      assessment: mapAssessment(assessment),
      session: session ? mapSession(session) : null,
    });
  } catch (error) {
    return handleApiError(res, error, "[api/admin/assessments/convert][POST]");
  }
}
