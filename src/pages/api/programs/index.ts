import type { NextApiRequest, NextApiResponse } from "next";
import { requireApiUser } from "@/lib/server/auth";
import { ApiError, handleApiError, sendMethodNotAllowed, sendSuccess } from "@/lib/server/api";
import { writeServerAudit } from "@/lib/server/audit";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { ensureObject, optionalNumber, optionalString, requiredString } from "@/lib/server/validation";

function mapActivity(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    programId: row.program_id as string,
    day: row.day as string,
    exerciseId: (row.exercise_id as string) ?? undefined,
    exerciseName: row.exercise_name as string,
    sets: (row.sets as number) ?? undefined,
    reps: (row.reps as string) ?? undefined,
    duration: (row.duration as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    sortOrder: (row.sort_order as number) ?? 0,
  };
}

function mapProgram(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    trainerId: (row.trainer_id as string) ?? undefined,
    weekNumber: row.week_number as number,
    title: row.title as string,
    description: (row.description as string) ?? undefined,
    createdAt: row.created_at as string,
    activities: ((row.program_activities as Record<string, unknown>[]) ?? []).map(
      mapActivity
    ),
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return sendMethodNotAllowed(res, ["POST"]);
  }

  const auth = await requireApiUser(req, res, { roles: ["admin", "trainer"] });
  if (!auth) return;

  if (
    !enforceRateLimit(req, res, {
      bucket: "programs:create",
      limit: 15,
      windowMs: 60_000,
      key: createRateLimitKey(req, "programs:create", auth.user.id),
    })
  ) {
    return;
  }

  try {
    const body = ensureObject(req.body);
    const payload = ensureObject(body.program, "Invalid program payload");
    const activitiesRaw = Array.isArray(body.activities) ? body.activities : [];
    const service = createServiceRoleClient();

    const insert = {
      user_id: requiredString(payload.userId, "Client is required"),
      trainer_id:
        auth.profile.role === "trainer"
          ? auth.user.id
          : optionalString(payload.trainerId, 120),
      week_number: optionalNumber(payload.weekNumber, { min: 1, max: 52 }) ?? 1,
      title: requiredString(payload.title, "Program title is required", {
        maxLength: 255,
      }),
      description: optionalString(payload.description, 4000),
    };

    const { data: programRow, error: programError } = await service
      .from("programs")
      .insert(insert)
      .select("*")
      .single();

    if (programError || !programRow) {
      throw new ApiError(500, "Failed to create program");
    }

    if (activitiesRaw.length > 0) {
      const activityRows = activitiesRaw.map((activity, index) => {
        const item = ensureObject(activity, "Invalid program activity");
        return {
          program_id: programRow.id,
          day: requiredString(item.day, "Activity day is required"),
          exercise_id: optionalString(item.exerciseId, 120),
          exercise_name: requiredString(
            item.exerciseName,
            "Exercise name is required"
          ),
          sets: optionalNumber(item.sets, { min: 0, max: 100 }),
          reps: optionalString(item.reps, 80),
          duration: optionalString(item.duration, 80),
          notes: optionalString(item.notes, 2000),
          sort_order: optionalNumber(item.sortOrder, { min: 0, max: 1000 }) ?? index,
        };
      });

      const { error: activityError } = await service
        .from("program_activities")
        .insert(activityRows);

      if (activityError) {
        throw new ApiError(500, "Failed to create program activities");
      }
    }

    const { data: finalProgramRow } = await service
      .from("programs")
      .select("*, program_activities(*)")
      .eq("id", programRow.id)
      .single();

    await writeServerAudit(service, {
      userId: auth.user.id,
      action: "program.create",
      entityType: "program",
      entityId: programRow.id as string,
      details: {
        userId: insert.user_id,
        trainerId: insert.trainer_id ?? null,
      },
    });

    return sendSuccess(
      res,
      { ok: true, program: mapProgram(finalProgramRow as Record<string, unknown>) },
      201
    );
  } catch (error) {
    return handleApiError(res, error, "[api/programs][POST]");
  }
}
