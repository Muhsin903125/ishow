import { createClient } from "@/lib/supabase/client";

export async function logAction(input: {
  actorId: string;
  actorRole: string;
  action: string;
  targetType?: string;
  targetId?: string;
  targetUserId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const supabase = createClient();
  try {
    await supabase.from("audit_logs").insert({
      actor_id: input.actorId,
      actor_role: input.actorRole,
      action: input.action,
      target_type: input.targetType ?? null,
      target_id: input.targetId ?? null,
      target_user_id: input.targetUserId ?? null,
      metadata: input.metadata ?? null,
    });
  } catch {
    // Don't throw on audit failure — audit should not block the main action
  }
}
