import type { SupabaseClient } from "@supabase/supabase-js";

export async function writeServerAudit(
  supabase: SupabaseClient,
  input: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: Record<string, unknown> | null;
  }
) {
  try {
    await supabase.from("audit_logs").insert({
      user_id: input.userId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId,
      details: input.details ?? null,
    });
  } catch {
    // Audit logging must never block the primary operation.
  }
}
