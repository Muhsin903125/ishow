import type { NextApiRequest, NextApiResponse } from "next";
import { requireApiUser } from "@/lib/server/auth";
import { ApiError, handleApiError, sendMethodNotAllowed, sendSuccess } from "@/lib/server/api";
import { writeServerAudit } from "@/lib/server/audit";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";

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

  const programId = typeof req.query.programId === "string" ? req.query.programId : null;
  if (!programId) {
    return res.status(400).json({ error: "Invalid program id" });
  }

  if (
    !enforceRateLimit(req, res, {
      bucket: "programs:duplicate",
      limit: 10,
      windowMs: 60_000,
      key: createRateLimitKey(req, "programs:duplicate", auth.user.id),
    })
  ) {
    return;
  }

  try {
    const service = createServiceRoleClient();
    const { data: source, error: sourceError } = await service
      .from("programs")
      .select("*, program_activities(*)")
      .eq("id", programId)
      .single();

    if (sourceError || !source) {
      throw new ApiError(404, "Program not found");
    }

    const { data: newProgram, error: createError } = await service
      .from("programs")
      .insert({
        user_id: source.user_id,
        trainer_id:
          auth.profile.role === "trainer" ? auth.user.id : source.trainer_id,
        week_number: (source.week_number as number) + 1,
        title: `${source.title as string} (Week ${(source.week_number as number) + 1})`,
        description: source.description,
      })
      .select("*")
      .single();

    if (createError || !newProgram) {
      throw new ApiError(500, "Failed to duplicate program");
    }

    const activities = ((source.program_activities as Record<string, unknown>[]) ?? []).map(
      (activity, index) => ({
        program_id: newProgram.id,
        day: activity.day,
        exercise_id: activity.exercise_id ?? null,
        exercise_name: activity.exercise_name,
        sets: activity.sets ?? null,
        reps: activity.reps ?? null,
        duration: activity.duration ?? null,
        notes: activity.notes ?? null,
        sort_order: activity.sort_order ?? index,
      })
    );

    if (activities.length > 0) {
      const { error } = await service.from("program_activities").insert(activities);
      if (error) {
        throw new ApiError(500, "Failed to duplicate program activities");
      }
    }

    const { data: finalProgram } = await service
      .from("programs")
      .select("*, program_activities(*)")
      .eq("id", newProgram.id)
      .single();

    await writeServerAudit(service, {
      userId: auth.user.id,
      action: "program.duplicate",
      entityType: "program",
      entityId: newProgram.id as string,
      details: {
        sourceProgramId: programId,
      },
    });

    return sendSuccess(res, { ok: true, program: mapProgram(finalProgram as Record<string, unknown>) }, 201);
  } catch (error) {
    return handleApiError(res, error, "[api/programs][duplicate]");
  }
}
