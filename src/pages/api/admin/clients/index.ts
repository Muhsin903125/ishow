import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/api/admin";
import {
  handleApiError,
  sendMethodNotAllowed,
  sendSuccess,
  ApiError,
} from "@/lib/server/api";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";

function mapProfile(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    email: (row.email as string) ?? undefined,
    phone: (row.phone as string) ?? undefined,
    role: row.role as "trainer" | "customer" | "admin",
    customerStatus:
      (row.customer_status as "request" | "client" | undefined) ?? undefined,
    avatarUrl: (row.avatar_url as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

function mapAssessment(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? (row.userId as string),
    assignedTrainerId:
      (row.assigned_trainer_id as string) ??
      (row.assignedTrainerId as string) ??
      undefined,
    preferredDate:
      (row.preferred_date as string) ?? (row.preferredDate as string) ?? undefined,
    preferredTimeSlot:
      (row.preferred_time_slot as string) ??
      (row.preferredTimeSlot as string) ??
      undefined,
    preferredLocation:
      (row.preferred_location as string) ??
      (row.preferredLocation as string) ??
      undefined,
    status: row.status as string,
    trainerNotes:
      (row.trainer_notes as string) ?? (row.trainerNotes as string) ?? undefined,
    submittedAt:
      (row.submitted_at as string) ??
      (row.submittedAt as string) ??
      new Date().toISOString(),
    reviewedAt:
      (row.reviewed_at as string) ?? (row.reviewedAt as string) ?? undefined,
    convertedToClientAt:
      (row.converted_to_client_at as string) ??
      (row.convertedToClientAt as string) ??
      undefined,
  };
}

function mapPlan(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? (row.userId as string),
    trainerId:
      (row.trainer_id as string) ?? (row.trainerId as string) ?? undefined,
    templateId:
      (row.template_id as string) ?? (row.templateId as string) ?? undefined,
    name: row.name as string,
    description: (row.description as string) ?? undefined,
    monthlyRate:
      (row.monthly_rate as number) ?? (row.monthlyRate as number) ?? undefined,
    paymentFrequency:
      ((row.payment_frequency as "weekly" | "monthly") ??
        (row.paymentFrequency as "weekly" | "monthly")) ?? "monthly",
    goals: (row.goals as string[]) ?? [],
    startDate:
      (row.start_date as string) ?? (row.startDate as string) ?? undefined,
    duration: (row.duration as string) ?? undefined,
    status: row.status as "active" | "inactive" | "pending",
    createdAt: (row.created_at as string) ?? (row.createdAt as string),
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return sendMethodNotAllowed(res, ["GET"]);
  }

  const auth = await requireAdmin(req, res);
  if (!auth.ok) return;

  if (
    !enforceRateLimit(req, res, {
      bucket: "admin:clients:list",
      limit: 30,
      windowMs: 60_000,
      key: createRateLimitKey(req, "admin:clients:list", auth.userId),
    })
  ) {
    return;
  }

  try {
    const service = createServiceRoleClient();
    const [customersResponse, trainersResponse, assessmentsResponse, plansResponse] =
      await Promise.all([
        service
          .from("profiles")
          .select("*")
          .eq("role", "customer")
          .order("name"),
        service
          .from("profiles")
          .select("*")
          .eq("role", "trainer")
          .order("name"),
        service
          .from("assessments")
          .select("*")
          .order("submitted_at", { ascending: false }),
        service.from("plans").select("*").order("created_at", { ascending: false }),
      ]);

    if (
      customersResponse.error ||
      trainersResponse.error ||
      assessmentsResponse.error ||
      plansResponse.error
    ) {
      throw new ApiError(500, "Failed to load admin client directory");
    }

    return sendSuccess(res, {
      ok: true,
      customers: (customersResponse.data ?? []).map((row) =>
        mapProfile(row as Record<string, unknown>)
      ),
      trainers: (trainersResponse.data ?? []).map((row) =>
        mapProfile(row as Record<string, unknown>)
      ),
      assessments: (assessmentsResponse.data ?? []).map((row) =>
        mapAssessment(row as Record<string, unknown>)
      ),
      plans: (plansResponse.data ?? []).map((row) =>
        mapPlan(row as Record<string, unknown>)
      ),
    });
  } catch (error) {
    return handleApiError(res, error, "[api/admin/clients][GET]");
  }
}
