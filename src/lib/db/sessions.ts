import { apiRequest } from "@/lib/api/client";

export interface TrainingSession {
  id: string;
  userId: string;
  trainerId?: string;
  title: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  cancelReason?: string;
  createdAt: string;
}

function mapSession(row: Record<string, unknown>): TrainingSession {
  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? (row.userId as string),
    trainerId:
      (row.trainer_id as string) ?? (row.trainerId as string) ?? undefined,
    title: row.title as string,
    scheduledDate:
      (row.scheduled_date as string) ?? (row.scheduledDate as string),
    scheduledTime:
      (row.scheduled_time as string) ?? (row.scheduledTime as string),
    duration: ((row.duration as number) ?? 60) as number,
    status:
      ((row.status as TrainingSession["status"]) ?? "scheduled") as TrainingSession["status"],
    notes: (row.notes as string) ?? undefined,
    cancelReason:
      (row.cancel_reason as string) ?? (row.cancelReason as string) ?? undefined,
    createdAt: (row.created_at as string) ?? (row.createdAt as string),
  };
}

export async function listSessions(filters?: {
  userId?: string;
  trainerId?: string;
  status?: string;
}): Promise<TrainingSession[]> {
  const params = new URLSearchParams();
  if (filters?.userId) params.set("userId", filters.userId);
  if (filters?.trainerId) params.set("trainerId", filters.trainerId);
  if (filters?.status) params.set("status", filters.status);

  const response = await apiRequest<{
    ok: true;
    sessions: Record<string, unknown>[];
  }>(`/api/sessions${params.size ? `?${params.toString()}` : ""}`);

  return response.sessions.map(mapSession);
}

export async function createSession(
  payload: Omit<TrainingSession, "id" | "createdAt">
): Promise<TrainingSession | null> {
  const response = await apiRequest<{
    ok: true;
    session: Record<string, unknown>;
  }>("/api/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session: payload }),
  });

  return mapSession(response.session);
}

export async function updateSession(
  sessionId: string,
  updates: Partial<Omit<TrainingSession, "id" | "userId" | "createdAt">>
): Promise<TrainingSession | null> {
  const response = await apiRequest<{
    ok: true;
    session: Record<string, unknown>;
  }>(`/api/sessions/${sessionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session: updates }),
  });

  return mapSession(response.session);
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  await apiRequest<{ ok: true }>(`/api/sessions/${sessionId}`, {
    method: "DELETE",
  });
  return true;
}
