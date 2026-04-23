import type { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/lib/supabase/api";
import { createServiceRoleClient } from "@/lib/supabase/service";

type AdminGuardResult =
  | {
      ok: true;
      supabase: ReturnType<typeof createApiClient>;
      userId: string;
    }
  | { ok: false };

export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AdminGuardResult> {
  const supabase = createApiClient(req, res);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    res.status(401).json({ error: "Unauthorized" });
    return { ok: false };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return { ok: false };
  }

  return { ok: true, supabase, userId: user.id };
}

export async function writeAdminAudit(
  _supabase: ReturnType<typeof createApiClient>,
  input: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: Record<string, unknown>;
  }
) {
  try {
    const service = createServiceRoleClient();
    await service.from("audit_logs").insert({
      user_id: input.userId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId,
      details: input.details ?? null,
    });
  } catch {
    // Audit logging should not block the main request.
  }
}
