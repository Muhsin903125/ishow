import type { NextApiRequest, NextApiResponse } from "next";
import { requireApiUser } from "@/lib/server/auth";
import { ApiError, handleApiError, sendMethodNotAllowed, sendSuccess } from "@/lib/server/api";
import { writeServerAudit } from "@/lib/server/audit";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { ensureObject, optionalNumber, optionalString } from "@/lib/server/validation";

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
  const auth = await requireApiUser(req, res, { roles: ["admin", "trainer"] });
  if (!auth) return;

  const programId = typeof req.query.programId === "string" ? req.query.programId : null;
  if (!programId) {
    return res.status(400).json({ error: "Invalid program id" });
  }

  if (
    !enforceRateLimit(req, res, {
      bucket: "programs:mutate",
      limit: 20,
      windowMs: 60_000,
      key: createRateLimitKey(req, "programs:mutate", auth.user.id),
    })
  ) {
    return;
  }

  try {
    const service = createServiceRoleClient();

    if (req.method === "PUT") {
      const body = ensureObject(req.body);
      const payload = ensureObject(body.program, "Invalid program payload");
      const activitiesRaw = Array.isArray(body.activities) ? body.activities : undefined;

      const updates: Record<string, unknown> = {};
      if ("title" in payload) updates.title = optionalString(payload.title, 255);
      if ("description" in payload) {
        updates.description = optionalString(payload.description, 4000);
      }
      if ("weekNumber" in payload) {
        updates.week_number = optionalNumber(payload.weekNumber, { min: 1, max: 52 });
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await service
          .from("programs")
          .update(updates)
          .eq("id", programId);

        if (error) {
          throw new ApiError(500, "Failed to update program");
        }
      }

      if (activitiesRaw !== undefined) {
        await service.from("program_activities").delete().eq("program_id", programId);

        if (activitiesRaw.length > 0) {
          const activityRows = activitiesRaw.map((activity, index) => {
            const item = ensureObject(activity, "Invalid program activity");
            return {
              program_id: programId,
              day: optionalString(item.day, 80),
              exercise_id: optionalString(item.exerciseId, 120),
              exercise_name: optionalString(item.exerciseName, 255),
              sets: optionalNumber(item.sets, { min: 0, max: 100 }),
              reps: optionalString(item.reps, 80),
              duration: optionalString(item.duration, 80),
              notes: optionalString(item.notes, 2000),
              sort_order: optionalNumber(item.sortOrder, { min: 0, max: 1000 }) ?? index,
            };
          });

          const { error } = await service
            .from("program_activities")
            .insert(activityRows);

          if (error) {
            throw new ApiError(500, "Failed to update program activities");
          }
        }
      }

      const { data } = await service
        .from("programs")
        .select("*, program_activities(*)")
        .eq("id", programId)
        .single();

      await writeServerAudit(service, {
        userId: auth.user.id,
        action: "program.update",
        entityType: "program",
        entityId: programId,
        details: updates,
      });

      return sendSuccess(res, { ok: true, program: mapProgram(data as Record<string, unknown>) });
    }

    if (req.method === "DELETE") {
      const { error } = await service.from("programs").delete().eq("id", programId);
      if (error) {
        throw new ApiError(500, "Failed to delete program");
      }

      await writeServerAudit(service, {
        userId: auth.user.id,
        action: "program.delete",
        entityType: "program",
        entityId: programId,
      });

      return sendSuccess(res, { ok: true });
    }

    return sendMethodNotAllowed(res, ["PUT", "DELETE"]);
  } catch (error) {
    return handleApiError(res, error, "[api/programs][mutate]");
  }
}
