import { apiRequest } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/client";

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  href?: string;
  isRead: boolean;
  createdAt: string;
}

function mapNotification(row: Record<string, unknown>): AppNotification {
  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? (row.userId as string),
    type: row.type as string,
    title: row.title as string,
    body: (row.body as string) ?? undefined,
    href: (row.href as string) ?? undefined,
    isRead: ((row.is_read as boolean) ?? (row.isRead as boolean) ?? false) as boolean,
    createdAt: (row.created_at as string) ?? (row.createdAt as string),
  };
}

export async function listNotifications(
  userId: string,
  limit = 20
): Promise<AppNotification[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map(mapNotification);
}

export async function markAllRead(userId: string): Promise<void> {
  await apiRequest<{ ok: true }>("/api/notifications/mark-all-read", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });
}

export async function markRead(id: string): Promise<void> {
  await apiRequest<{ ok: true }>(`/api/notifications/${id}`, {
    method: "PUT",
  });
}

export async function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  href?: string;
}): Promise<void> {
  await apiRequest<{ ok: true }>("/api/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notification: input,
    }),
  });
}
