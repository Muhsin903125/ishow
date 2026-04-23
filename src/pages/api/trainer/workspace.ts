import type { NextApiRequest, NextApiResponse } from "next";
import { requireApiUser } from "@/lib/server/auth";
import { ApiError, handleApiError, sendMethodNotAllowed, sendSuccess } from "@/lib/server/api";
import {
  mapAssessment,
  mapExercise,
  mapPayment,
  mapProfile,
  mapProgram,
  mapSession,
} from "@/lib/server/mappers";
import { listPaymentsForRole, syncOverduePayments } from "@/lib/server/payments";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return sendMethodNotAllowed(res, ["GET"]);
  }

  const auth = await requireApiUser(req, res, { roles: ["trainer"] });
  if (!auth) return;

  if (
    !enforceRateLimit(req, res, {
      bucket: "trainer:workspace",
      limit: 60,
      windowMs: 60_000,
      key: createRateLimitKey(req, "trainer:workspace", auth.user.id),
    })
  ) {
    return;
  }

  try {
    const service = createServiceRoleClient();
    await syncOverduePayments(service);
    const [clientsResponse, assessmentsResponse, sessionsResponse, programsResponse, paymentsRows, exercisesResponse] =
      await Promise.all([
        service.from("profiles").select("*").eq("role", "customer").order("name"),
        service
          .from("assessments")
          .select("*")
          .eq("status", "pending")
          .order("submitted_at", { ascending: false }),
        service
          .from("sessions")
          .select("*")
          .eq("trainer_id", auth.user.id)
          .order("scheduled_date", { ascending: true })
          .order("scheduled_time", { ascending: true }),
        service
          .from("programs")
          .select("*, program_activities(*)")
          .eq("trainer_id", auth.user.id)
          .order("week_number", { ascending: true }),
        listPaymentsForRole(service, {
          role: "trainer",
          authUserId: auth.user.id,
        }),
        service.from("exercises").select("*").eq("is_active", true).order("name"),
      ]);

    if (
      clientsResponse.error ||
      assessmentsResponse.error ||
      sessionsResponse.error ||
      programsResponse.error ||
      exercisesResponse.error
    ) {
      throw new ApiError(500, "Failed to load trainer workspace");
    }

    return sendSuccess(res, {
      ok: true,
      clients: (clientsResponse.data ?? []).map((row) =>
        mapProfile(row as Record<string, unknown>)
      ),
      pendingAssessments: (assessmentsResponse.data ?? []).map((row) =>
        mapAssessment(row as Record<string, unknown>)
      ),
      sessions: (sessionsResponse.data ?? []).map((row) =>
        mapSession(row as Record<string, unknown>)
      ),
      programs: (programsResponse.data ?? []).map((row) =>
        mapProgram(row as Record<string, unknown>)
      ),
      payments: (paymentsRows ?? []).map((row) =>
        mapPayment(row as Record<string, unknown>)
      ),
      exercises: (exercisesResponse.data ?? []).map((row) =>
        mapExercise(row as Record<string, unknown>)
      ),
    });
  } catch (error) {
    return handleApiError(res, error, "[api/trainer/workspace][GET]");
  }
}
