import { apiRequest } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/client";

export interface BodyMeasurements {
  chest?: string;
  waist?: string;
  hips?: string;
  arms?: string;
}

export interface MedicalHistory {
  lowerBack?: boolean;
  knee?: boolean;
  shoulder?: boolean;
  heart?: boolean;
  diabetes?: boolean;
  hypertension?: boolean;
  other?: string;
}

export interface Assessment {
  id: string;
  userId: string;
  assignedTrainerId?: string;
  age?: number;
  weight?: string;
  height?: string;
  gender?: "male" | "female" | "prefer_not_to_say";
  bodyMeasurements: BodyMeasurements;
  goals: string[];
  experienceLevel?: string;
  healthConditions?: string;
  medicalHistory: MedicalHistory;
  daysPerWeek?: number;
  preferredTimes?: string;
  preferredDate?: string;
  preferredTimeSlot?: string;
  preferredLocationId?: string;
  preferredLocation?: string;
  status: "pending" | "reviewed" | "rejected";
  trainerNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  convertedToClientAt?: string;
}

function mapAssessment(row: Record<string, unknown>): Assessment {
  return {
    id: row.id as string,
    userId: row.user_id ? (row.user_id as string) : (row.userId as string),
    assignedTrainerId:
      (row.assigned_trainer_id as string) ??
      (row.assignedTrainerId as string) ??
      undefined,
    age: (row.age as number) ?? undefined,
    weight: (row.weight as string) ?? undefined,
    height: (row.height as string) ?? undefined,
    gender:
      ((row.gender as Assessment["gender"]) ??
        (row.gender as Assessment["gender"])) ?? undefined,
    bodyMeasurements:
      (row.body_measurements as BodyMeasurements) ??
      (row.bodyMeasurements as BodyMeasurements) ??
      {},
    goals: (row.goals as string[]) ?? [],
    experienceLevel:
      (row.experience_level as string) ??
      (row.experienceLevel as string) ??
      undefined,
    healthConditions:
      (row.health_conditions as string) ??
      (row.healthConditions as string) ??
      undefined,
    medicalHistory:
      (row.medical_history as MedicalHistory) ??
      (row.medicalHistory as MedicalHistory) ??
      {},
    daysPerWeek:
      (row.days_per_week as number) ?? (row.daysPerWeek as number) ?? undefined,
    preferredTimes:
      (row.preferred_times as string) ??
      (row.preferredTimes as string) ??
      undefined,
    preferredDate:
      (row.preferred_date as string) ??
      (row.preferredDate as string) ??
      undefined,
    preferredTimeSlot:
      (row.preferred_time_slot as string) ??
      (row.preferredTimeSlot as string) ??
      undefined,
    preferredLocationId:
      (row.preferred_location_id as string) ??
      (row.preferredLocationId as string) ??
      undefined,
    preferredLocation:
      (row.preferred_location as string) ??
      (row.preferredLocation as string) ??
      undefined,
    status: (row.status as Assessment["status"]) ?? "pending",
    trainerNotes:
      (row.trainer_notes as string) ??
      (row.trainerNotes as string) ??
      undefined,
    submittedAt:
      (row.submitted_at as string) ??
      (row.submittedAt as string) ??
      new Date().toISOString(),
    reviewedAt:
      (row.reviewed_at as string) ??
      (row.reviewedAt as string) ??
      undefined,
    convertedToClientAt:
      (row.converted_to_client_at as string) ??
      (row.convertedToClientAt as string) ??
      undefined,
  };
}

export async function getAssessment(userId: string): Promise<Assessment | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return mapAssessment(data);
}

export async function listAssessments(
  status?: Assessment["status"]
): Promise<Assessment[]> {
  const supabase = createClient();
  let query = supabase
    .from("assessments")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapAssessment);
}

export async function submitAssessment(
  userId: string,
  payload: Omit<
    Assessment,
    | "id"
    | "userId"
    | "status"
    | "submittedAt"
    | "reviewedAt"
    | "convertedToClientAt"
  >
): Promise<Assessment | null> {
  const response = await apiRequest<{
    ok: true;
    assessment: Record<string, unknown>;
  }>("/api/assessments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assessment: {
        ...payload,
        userId,
      },
    }),
  });

  return mapAssessment(response.assessment);
}

export async function reviewAssessment(
  assessmentId: string,
  trainerNotes: string,
  status: "reviewed" | "rejected" = "reviewed",
  assignedTrainerId?: string
): Promise<Assessment | null> {
  return updateAssessment(assessmentId, {
    trainerNotes,
    status,
    assignedTrainerId,
  });
}

export async function updateAssessment(
  assessmentId: string,
  updates: Partial<{
    trainerNotes: string;
    status: "pending" | "reviewed" | "rejected";
    assignedTrainerId?: string;
  }>
): Promise<Assessment | null> {
  const response = await apiRequest<{
    ok: true;
    assessment: Record<string, unknown>;
  }>(`/api/assessments/${assessmentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assessment: updates,
    }),
  });

  return mapAssessment(response.assessment);
}

export async function convertAssessmentToClient(
  assessmentId: string,
  workflow: {
    trainerNotes?: string;
    assignedTrainerId?: string;
    session?: {
      title: string;
      date: string;
      time: string;
      duration?: number | string;
      notes?: string;
    };
  }
): Promise<{
  assessment: Assessment;
  session: Record<string, unknown> | null;
}> {
  const response = await apiRequest<{
    ok: true;
    assessment: Record<string, unknown>;
    session: Record<string, unknown> | null;
  }>(`/api/admin/assessments/${assessmentId}/convert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ workflow }),
  });

  return {
    assessment: mapAssessment(response.assessment),
    session: response.session,
  };
}
