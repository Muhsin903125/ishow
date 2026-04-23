import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin, writeAdminAudit } from "@/lib/api/admin";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import {
  attachLeadProfileMatches,
  findCustomerProfileByEmail,
  mapLeadRow,
  type Lead,
} from "@/lib/leads";

type ConvertResponse =
  | {
      ok: true;
      lead: Lead;
      profile: {
        id: string;
        name: string;
        email: string | null;
        customerStatus: "request" | "client" | null;
      };
    }
  | { error: string };

function getLeadId(query: NextApiRequest["query"]) {
  const leadId = query.leadId;
  return typeof leadId === "string" ? leadId : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConvertResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const admin = await requireAdmin(req, res);
  if (!admin.ok) return;

  const { supabase, userId } = admin;

  if (
    !enforceRateLimit(req, res, {
      bucket: "admin:leads:convert",
      limit: 15,
      windowMs: 60_000,
      key: createRateLimitKey(req, "admin:leads:convert", userId),
    })
  ) {
    return;
  }

  const leadId = getLeadId(req.query);

  if (!leadId) {
    return res.status(400).json({ error: "Invalid lead id" });
  }

  const { data: leadRow, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();

  if (leadError) {
    console.error("[api/admin/leads/convert][lead]", leadError);
    return res.status(500).json({ error: "Failed to load lead" });
  }

  if (!leadRow) {
    return res.status(404).json({ error: "Lead not found" });
  }

  const lead = mapLeadRow(leadRow as Record<string, unknown>);
  if (!lead.email) {
    return res.status(400).json({
      error: "This lead has no email. Conversion requires an existing customer account email match.",
    });
  }

  const profile = await findCustomerProfileByEmail(supabase, lead.email);
  if (!profile) {
    return res.status(409).json({
      error:
        "No customer account matches this lead email yet. Ask the customer to sign up first, then convert the lead.",
    });
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ customer_status: "client" })
    .eq("id", profile.id);

  if (profileError) {
    console.error("[api/admin/leads/convert][profile]", profileError);
    return res.status(500).json({ error: "Failed to convert matching customer profile" });
  }

  const convertedAt = new Date().toISOString();
  const { data: updatedLeadRow, error: updatedLeadError } = await supabase
    .from("leads")
    .update({
      status: "converted",
      matched_profile_id: profile.id,
      converted_profile_id: profile.id,
      converted_at: convertedAt,
    })
    .eq("id", leadId)
    .select("*")
    .maybeSingle();

  if (updatedLeadError || !updatedLeadRow) {
    console.error("[api/admin/leads/convert][lead-update]", updatedLeadError);
    return res.status(500).json({ error: "Lead matched, but lead conversion record failed to update" });
  }

  const [updatedLead] = await attachLeadProfileMatches(supabase, [
    mapLeadRow(updatedLeadRow as Record<string, unknown>),
  ]);

  await writeAdminAudit(supabase, {
    userId,
    action: "lead.convert",
    entityType: "lead",
    entityId: updatedLead.id,
    details: {
      profileId: profile.id,
      email: profile.email,
    },
  });

  return res.status(200).json({
    ok: true,
    lead: updatedLead,
    profile: {
      ...profile,
      customerStatus: "client",
    },
  });
}
