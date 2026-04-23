import type { NextApiRequest, NextApiResponse } from "next";
import { requireApiUser } from "@/lib/server/auth";
import { ApiError, handleApiError, sendMethodNotAllowed, sendSuccess } from "@/lib/server/api";
import { writeServerAudit } from "@/lib/server/audit";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  ensureObject,
  optionalNumber,
  optionalString,
  optionalStringArray,
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
      bucket: "assessments:create",
      limit: 8,
      windowMs: 60_000,
      key: createRateLimitKey(req, "assessments:create", auth.user.id),
    })
  ) {
    return;
  }

  try {
    const body = ensureObject(req.body);
    const payload = ensureObject(body.assessment, "Invalid assessment payload");
    const service = createServiceRoleClient();

    const insert = {
      user_id: auth.user.id,
      age: optionalNumber(payload.age, { min: 0, max: 120 }),
      weight: optionalString(payload.weight, 80),
      height: optionalString(payload.height, 80),
      gender: optionalString(payload.gender, 32),
      body_measurements:
        (payload.bodyMeasurements as Record<string, unknown> | undefined) ?? {},
      goals: optionalStringArray(payload.goals) ?? [],
      experience_level: optionalString(payload.experienceLevel, 80),
      health_conditions: optionalString(payload.healthConditions, 1000),
      medical_history:
        (payload.medicalHistory as Record<string, unknown> | undefined) ?? {},
      days_per_week: optionalNumber(payload.daysPerWeek, { min: 0, max: 14 }),
      preferred_times: optionalString(payload.preferredTimes, 100),
      preferred_date: optionalString(payload.preferredDate, 40),
      preferred_time_slot: optionalString(payload.preferredTimeSlot, 80),
      preferred_location_id: optionalString(payload.preferredLocationId, 120),
      preferred_location: optionalString(payload.preferredLocation, 255),
      status: "pending",
    };

    const { data, error } = await service
      .from("assessments")
      .insert(insert)
      .select("*")
      .single();

    if (error || !data) {
      throw new ApiError(500, "Failed to submit assessment");
    }

    await writeServerAudit(service, {
      userId: auth.user.id,
      action: "assessment.submit",
      entityType: "assessment",
      entityId: data.id as string,
      details: {
        goals: insert.goals,
      },
    });

    return sendSuccess(res, { ok: true, assessment: mapAssessment(data) }, 201);
  } catch (error) {
    return handleApiError(res, error, "[api/assessments][POST]");
  }
}
