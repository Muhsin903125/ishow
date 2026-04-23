import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin, writeAdminAudit } from "@/lib/api/admin";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import {
  attachLeadProfileMatches,
  mapLeadRow,
  normalizeLeadPatch,
  toLeadUpdate,
  type Lead,
} from "@/lib/leads";

type ErrorResponse = { error: string };
type LeadResponse = { ok: true; lead: Lead } | ErrorResponse;
type DeleteResponse = { ok: true } | ErrorResponse;

function hasLeadPayload(body: unknown): body is { lead: Record<string, unknown> } {
  return !!body && typeof body === "object" && "lead" in body;
}

function getLeadId(query: NextApiRequest["query"]) {
  const leadId = query.leadId;
  return typeof leadId === "string" ? leadId : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeadResponse | DeleteResponse>
) {
  const admin = await requireAdmin(req, res);
  if (!admin.ok) return;

  const { supabase, userId } = admin;
  const leadId = getLeadId(req.query);

  if (!leadId) {
    return res.status(400).json({ error: "Invalid lead id" });
  }

  if (req.method === "PUT") {
    if (
      !enforceRateLimit(req, res, {
        bucket: "admin:leads:update",
        limit: 45,
        windowMs: 60_000,
        key: createRateLimitKey(req, "admin:leads:update", userId),
      })
    ) {
      return;
    }

    if (!hasLeadPayload(req.body)) {
      return res.status(400).json({ error: "Invalid lead payload" });
    }

    const leadPatch = normalizeLeadPatch(req.body.lead);
    if ("name" in leadPatch && !leadPatch.name) {
      return res.status(400).json({ error: "Lead name is required" });
    }
    if (Object.keys(leadPatch).length === 0) {
      return res.status(400).json({ error: "No lead changes submitted" });
    }

    const { data, error } = await supabase
      .from("leads")
      .update(toLeadUpdate(leadPatch))
      .eq("id", leadId)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("[api/admin/leads][PUT]", error);
      return res.status(500).json({ error: "Failed to update lead" });
    }

    if (!data) {
      return res.status(404).json({ error: "Lead not found" });
    }

    const [lead] = await attachLeadProfileMatches(supabase, [
      mapLeadRow(data as Record<string, unknown>),
    ]);

    await writeAdminAudit(supabase, {
      userId,
      action: "lead.update",
      entityType: "lead",
      entityId: lead.id,
      details: leadPatch,
    });

    return res.status(200).json({ ok: true, lead });
  }

  if (req.method === "DELETE") {
    if (
      !enforceRateLimit(req, res, {
        bucket: "admin:leads:delete",
        limit: 20,
        windowMs: 60_000,
        key: createRateLimitKey(req, "admin:leads:delete", userId),
      })
    ) {
      return;
    }

    const { error } = await supabase.from("leads").delete().eq("id", leadId);

    if (error) {
      console.error("[api/admin/leads][DELETE]", error);
      return res.status(500).json({ error: "Failed to delete lead" });
    }

    await writeAdminAudit(supabase, {
      userId,
      action: "lead.delete",
      entityType: "lead",
      entityId: leadId,
    });

    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "PUT, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
