import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin, writeAdminAudit } from "@/lib/api/admin";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import {
  attachLeadProfileMatches,
  mapLeadRow,
  normalizeLeadDraft,
  toLeadInsert,
  type Lead,
} from "@/lib/leads";

type ErrorResponse = { error: string };
type LeadsResponse =
  | {
      ok: true;
      leads: Lead[];
      summary: Record<string, number>;
    }
  | ErrorResponse;
type LeadMutationResponse = { ok: true; lead: Lead } | ErrorResponse;

function hasLeadPayload(body: unknown): body is { lead: Record<string, unknown> } {
  return !!body && typeof body === "object" && "lead" in body;
}

function buildLeadSummary(leads: Lead[]) {
  return leads.reduce<Record<string, number>>(
    (summary, lead) => {
      summary.total += 1;
      summary[lead.status] = (summary[lead.status] ?? 0) + 1;
      return summary;
    },
    { total: 0, new: 0, contacted: 0, qualified: 0, converted: 0, lost: 0 }
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeadsResponse | LeadMutationResponse>
) {
  const admin = await requireAdmin(req, res);
  if (!admin.ok) return;

  const { supabase, userId } = admin;

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[api/admin/leads][GET]", error);
      return res.status(500).json({ error: "Failed to load leads" });
    }

    const leads = await attachLeadProfileMatches(
      supabase,
      ((data ?? []) as Record<string, unknown>[]).map(mapLeadRow)
    );

    return res.status(200).json({
      ok: true,
      leads,
      summary: buildLeadSummary(leads),
    });
  }

  if (req.method === "POST") {
    if (
      !enforceRateLimit(req, res, {
        bucket: "admin:leads:create",
        limit: 30,
        windowMs: 60_000,
        key: createRateLimitKey(req, "admin:leads:create", userId),
      })
    ) {
      return;
    }

    if (!hasLeadPayload(req.body)) {
      return res.status(400).json({ error: "Invalid lead payload" });
    }

    const leadInput = normalizeLeadDraft(req.body.lead);
    if (!leadInput.name) {
      return res.status(400).json({ error: "Lead name is required" });
    }

    const { data, error } = await supabase
      .from("leads")
      .insert(toLeadInsert(leadInput))
      .select("*")
      .single();

    if (error || !data) {
      console.error("[api/admin/leads][POST]", error);
      return res.status(500).json({ error: "Failed to create lead" });
    }

    const [lead] = await attachLeadProfileMatches(supabase, [
      mapLeadRow(data as Record<string, unknown>),
    ]);

    await writeAdminAudit(supabase, {
      userId,
      action: "lead.create",
      entityType: "lead",
      entityId: lead.id,
      details: {
        status: lead.status,
        email: lead.email,
      },
    });

    return res.status(201).json({ ok: true, lead });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
