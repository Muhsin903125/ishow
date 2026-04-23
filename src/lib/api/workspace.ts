import { apiRequest } from "@/lib/api/client";
import type { Assessment } from "@/lib/db/assessments";
import type { Payment } from "@/lib/db/payments";
import type { Plan } from "@/lib/db/plans";
import type { Profile } from "@/lib/db/profiles";
import type { Program } from "@/lib/db/programs";
import type { TrainingSession } from "@/lib/db/sessions";
import type { Exercise } from "@/lib/db/master";

export interface CustomerWorkspace {
  profile: Profile | null;
  assessment: Assessment | null;
  plan: Plan | null;
  trainer: Profile | null;
  sessions: TrainingSession[];
  programs: Program[];
  payments: Payment[];
}

export interface TrainerWorkspace {
  clients: Profile[];
  pendingAssessments: Assessment[];
  sessions: TrainingSession[];
  programs: Program[];
  payments: Payment[];
  exercises: Exercise[];
}

export async function loadCustomerWorkspace() {
  const response = await apiRequest<{ ok: true } & CustomerWorkspace>(
    "/api/customer/workspace"
  );

  return response;
}

export async function loadTrainerWorkspace() {
  const response = await apiRequest<{ ok: true } & TrainerWorkspace>(
    "/api/trainer/workspace"
  );

  return response;
}

