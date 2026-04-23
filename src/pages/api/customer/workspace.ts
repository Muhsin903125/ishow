import type { NextApiRequest, NextApiResponse } from "next";
import { requireApiUser } from "@/lib/server/auth";
import { ApiError, handleApiError, sendMethodNotAllowed, sendSuccess } from "@/lib/server/api";
import {
  mapAssessment,
  mapPayment,
  mapPlan,
  mapProfile,
  mapProgram,
  mapSession,
} from "@/lib/server/mappers";
import { syncOverduePayments } from "@/lib/server/payments";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return sendMethodNotAllowed(res, ["GET"]);
  }

  const auth = await requireApiUser(req, res, { roles: ["customer"] });
  if (!auth) return;

  if (
    !enforceRateLimit(req, res, {
      bucket: "customer:workspace",
      limit: 60,
      windowMs: 60_000,
      key: createRateLimitKey(req, "customer:workspace", auth.user.id),
    })
  ) {
    return;
  }

  try {
    const service = createServiceRoleClient();
    await syncOverduePayments(service);
    const [profileResponse, assessmentResponse, planResponse, sessionsResponse, programsResponse, paymentsResponse] =
      await Promise.all([
        service.from("profiles").select("*").eq("id", auth.user.id).maybeSingle(),
        service
          .from("assessments")
          .select("*")
          .eq("user_id", auth.user.id)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        service
          .from("plans")
          .select("*")
          .eq("user_id", auth.user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        service
          .from("sessions")
          .select("*")
          .eq("user_id", auth.user.id)
          .order("scheduled_date", { ascending: true })
          .order("scheduled_time", { ascending: true }),
        service
          .from("programs")
          .select("*, program_activities(*)")
          .eq("user_id", auth.user.id)
          .order("week_number", { ascending: true }),
        service
          .from("payments")
          .select("*")
          .eq("user_id", auth.user.id)
          .order("created_at", { ascending: false }),
      ]);

    if (
      profileResponse.error ||
      assessmentResponse.error ||
      planResponse.error ||
      sessionsResponse.error ||
      programsResponse.error ||
      paymentsResponse.error
    ) {
      throw new ApiError(500, "Failed to load customer workspace");
    }

    let trainer: ReturnType<typeof mapProfile> | null = null;
    const trainerId = planResponse.data?.trainer_id as string | undefined;
    if (trainerId) {
      const trainerResponse = await service
        .from("profiles")
        .select("*")
        .eq("id", trainerId)
        .maybeSingle();

      if (trainerResponse.error) {
        throw new ApiError(500, "Failed to load assigned trainer");
      }

      trainer = trainerResponse.data
        ? mapProfile(trainerResponse.data as Record<string, unknown>)
        : null;
    }

    return sendSuccess(res, {
      ok: true,
      profile: profileResponse.data
        ? mapProfile(profileResponse.data as Record<string, unknown>)
        : null,
      assessment: assessmentResponse.data
        ? mapAssessment(assessmentResponse.data as Record<string, unknown>)
        : null,
      plan: planResponse.data
        ? mapPlan(planResponse.data as Record<string, unknown>)
        : null,
      trainer,
      sessions: (sessionsResponse.data ?? []).map((row) =>
        mapSession(row as Record<string, unknown>)
      ),
      programs: (programsResponse.data ?? []).map((row) =>
        mapProgram(row as Record<string, unknown>)
      ),
      payments: (paymentsResponse.data ?? []).map((row) =>
        mapPayment(row as Record<string, unknown>)
      ),
    });
  } catch (error) {
    return handleApiError(res, error, "[api/customer/workspace][GET]");
  }
}
