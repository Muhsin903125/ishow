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
    userId: row.user_id as string,
    type: row.type as string,
    title: row.title as string,
    body: (row.body as string) ?? undefined,
    href: (row.href as string) ?? undefined,
    isRead: (row.is_read as boolean) ?? false,
    createdAt: row.created_at as string,
  };
}

export async function listNotifications(userId: string, limit = 20): Promise<AppNotification[]> {
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
  const supabase = createClient();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);
}

export async function markRead(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
}

export async function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  href?: string;
}): Promise<void> {
  const supabase = createClient();
  try {
    await supabase.from("notifications").insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      href: input.href ?? null,
    });
  } catch {
    // Non-blocking — notification failure should never break the main flow
  }
}
