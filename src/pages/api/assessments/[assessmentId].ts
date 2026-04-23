import type { NextApiRequest, NextApiResponse } from "next";
import { requireApiUser } from "@/lib/server/auth";
import { ApiError, handleApiError, sendMethodNotAllowed, sendSuccess } from "@/lib/server/api";
import { writeServerAudit } from "@/lib/server/audit";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { notifyProfile } from "@/lib/server/engagement";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { ensureObject, optionalString } from "@/lib/server/validation";

const REVIEW_STATUSES = new Set(["pending", "reviewed", "rejected"]);

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return sendMethodNotAllowed(res, ["PUT"]);
  }

  const auth = await requireApiUser(req, res, { roles: ["admin", "trainer"] });
  if (!auth) return;

  if (
    !enforceRateLimit(req, res, {
      bucket: "assessments:update",
      limit: 25,
      windowMs: 60_000,
      key: createRateLimitKey(req, "assessments:update", auth.user.id),
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
    const payload = ensureObject(body.assessment, "Invalid assessment payload");
    const service = createServiceRoleClient();

    const status =
      typeof payload.status === "string" && REVIEW_STATUSES.has(payload.status)
        ? payload.status
        : undefined;

    const assignedTrainerId =
      auth.profile.role === "trainer"
        ? auth.user.id
        : optionalString(payload.assignedTrainerId, 120);

    const updates: Record<string, unknown> = {};
    if ("trainerNotes" in payload) {
      updates.trainer_notes = optionalString(payload.trainerNotes, 4000);
    }
    if (status) {
      updates.status = status;
      updates.reviewed_at = new Date().toISOString();
    }
    if (assignedTrainerId !== undefined) {
      updates.assigned_trainer_id = assignedTrainerId;
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "No assessment changes submitted");
    }

    const { data, error } = await service
      .from("assessments")
      .update(updates)
      .eq("id", assessmentId)
      .select("*")
      .maybeSingle();

    if (error || !data) {
      throw new ApiError(500, "Failed to update assessment");
    }

    await writeServerAudit(service, {
      userId: auth.user.id,
      action: "assessment.update",
      entityType: "assessment",
      entityId: assessmentId,
      details: {
        status: updates.status ?? null,
        assignedTrainerId: updates.assigned_trainer_id ?? null,
      },
    });

    if (status === "reviewed") {
      await notifyProfile(service, {
        userId: data.user_id as string,
        notification: {
          type: "assessment_reviewed",
          title: "Assessment reviewed",
          body: "Your assessment has been reviewed and your next coaching step is ready.",
          href: "/dashboard",
        },
        email: {
          type: "assessment-reviewed",
          data: {
            notes: (updates.trainer_notes as string | null) ?? undefined,
          },
        },
      });
    }

    return sendSuccess(res, { ok: true, assessment: mapAssessment(data) });
  } catch (error) {
    return handleApiError(res, error, "[api/assessments][PUT]");
  }
}
