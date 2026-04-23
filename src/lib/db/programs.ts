import { apiRequest } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/client";

export interface ProgramActivity {
  id: string;
  programId: string;
  day: string;
  exerciseId?: string;
  exerciseName: string;
  sets?: number;
  reps?: string;
  duration?: string;
  notes?: string;
  sortOrder: number;
}

export interface Program {
  id: string;
  userId: string;
  trainerId?: string;
  weekNumber: number;
  title: string;
  description?: string;
  createdAt: string;
  activities?: ProgramActivity[];
}

function mapActivity(row: Record<string, unknown>): ProgramActivity {
  return {
    id: row.id as string,
    programId: (row.program_id as string) ?? (row.programId as string),
    day: row.day as string,
    exerciseId:
      (row.exercise_id as string) ?? (row.exerciseId as string) ?? undefined,
    exerciseName:
      (row.exercise_name as string) ?? (row.exerciseName as string),
    sets: (row.sets as number) ?? undefined,
    reps: (row.reps as string) ?? undefined,
    duration: (row.duration as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    sortOrder:
      ((row.sort_order as number) ?? (row.sortOrder as number) ?? 0) as number,
  };
}

function mapProgram(row: Record<string, unknown>, activities?: ProgramActivity[]): Program {
  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? (row.userId as string),
    trainerId:
      (row.trainer_id as string) ?? (row.trainerId as string) ?? undefined,
    weekNumber:
      ((row.week_number as number) ?? (row.weekNumber as number)) as number,
    title: row.title as string,
    description: (row.description as string) ?? undefined,
    createdAt: (row.created_at as string) ?? (row.createdAt as string),
    activities: activities ?? [],
  };
}

export async function listPrograms(filters?: {
  userId?: string;
  trainerId?: string;
}): Promise<Program[]> {
  const supabase = createClient();
  let query = supabase
    .from("programs")
    .select("*, program_activities(*)")
    .order("week_number", { ascending: true });

  if (filters?.userId) query = query.eq("user_id", filters.userId);
  if (filters?.trainerId) query = query.eq("trainer_id", filters.trainerId);

  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((row: Record<string, unknown>) => {
    const acts = ((row.program_activities as Record<string, unknown>[]) ?? []).map(
      mapActivity
    );
    return mapProgram(row, acts.sort((a, b) => a.sortOrder - b.sortOrder));
  });
}

export async function createProgram(
  payload: Omit<Program, "id" | "createdAt">,
  activities: Omit<ProgramActivity, "id" | "programId">[]
): Promise<Program | null> {
  const response = await apiRequest<{
    ok: true;
    program: Record<string, unknown>;
  }>("/api/programs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      program: payload,
      activities,
    }),
  });

  const acts = ((response.program.activities as Record<string, unknown>[]) ?? []).map(
    mapActivity
  );
  return mapProgram(response.program, acts.sort((a, b) => a.sortOrder - b.sortOrder));
}

export async function updateProgram(
  programId: string,
  updates: Partial<Pick<Program, "title" | "description" | "weekNumber">>,
  activities?: Omit<ProgramActivity, "id" | "programId">[]
): Promise<Program | null> {
  const response = await apiRequest<{
    ok: true;
    program: Record<string, unknown>;
  }>(`/api/programs/${programId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      program: updates,
      activities,
    }),
  });

  const acts = ((response.program.activities as Record<string, unknown>[]) ?? []).map(
    mapActivity
  );
  return mapProgram(response.program, acts.sort((a, b) => a.sortOrder - b.sortOrder));
}

export async function deleteProgram(programId: string): Promise<boolean> {
  await apiRequest<{ ok: true }>(`/api/programs/${programId}`, {
    method: "DELETE",
  });
  return true;
}

export async function duplicateProgramToNextWeek(
  programId: string
): Promise<Program | null> {
  const response = await apiRequest<{
    ok: true;
    program: Record<string, unknown>;
  }>(`/api/programs/${programId}/duplicate`, {
    method: "POST",
  });

  const acts = ((response.program.activities as Record<string, unknown>[]) ?? []).map(
    mapActivity
  );
  return mapProgram(response.program, acts.sort((a, b) => a.sortOrder - b.sortOrder));
}
