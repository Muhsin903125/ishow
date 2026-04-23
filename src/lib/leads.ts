import type { SupabaseClient } from "@supabase/supabase-js";

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type LeadProfileMatch = {
  id: string;
  name: string;
  email: string | null;
  customerStatus: "request" | "client" | null;
};

export type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  notes: string | null;
  matchedProfileId: string | null;
  convertedProfileId: string | null;
  convertedAt: string | null;
  createdAt: string;
  updatedAt: string;
  profileMatch: LeadProfileMatch | null;
};

export type LeadDraft = {
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  notes: string | null;
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  lost: "Lost",
};

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && LEAD_STATUSES.includes(value as LeadStatus);
}

function cleanOptionalString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeLeadDraft(input: Partial<LeadDraft> | null | undefined): LeadDraft {
  return {
    name: typeof input?.name === "string" ? input.name.trim() : "",
    email: cleanOptionalString(input?.email),
    phone: cleanOptionalString(input?.phone),
    source: cleanOptionalString(input?.source),
    status: isLeadStatus(input?.status) ? input.status : "new",
    notes: cleanOptionalString(input?.notes),
  };
}

export function normalizeLeadPatch(input: Partial<LeadDraft> | null | undefined) {
  const patch: Partial<LeadDraft> = {};

  if (!input || typeof input !== "object") return patch;
  if ("name" in input && typeof input.name === "string") patch.name = input.name.trim();
  if ("email" in input) patch.email = cleanOptionalString(input.email);
  if ("phone" in input) patch.phone = cleanOptionalString(input.phone);
  if ("source" in input) patch.source = cleanOptionalString(input.source);
  if ("notes" in input) patch.notes = cleanOptionalString(input.notes);
  if ("status" in input && isLeadStatus(input.status)) patch.status = input.status;

  return patch;
}

export function toLeadInsert(input: LeadDraft) {
  return {
    name: input.name,
    email: input.email,
    phone: input.phone,
    source: input.source,
    status: input.status,
    notes: input.notes,
  };
}

export function toLeadUpdate(input: Partial<LeadDraft>) {
  const updates: Record<string, unknown> = {};

  if ("name" in input) updates.name = input.name ?? "";
  if ("email" in input) updates.email = input.email ?? null;
  if ("phone" in input) updates.phone = input.phone ?? null;
  if ("source" in input) updates.source = input.source ?? null;
  if ("status" in input) updates.status = input.status ?? "new";
  if ("notes" in input) updates.notes = input.notes ?? null;

  return updates;
}

export function mapLeadRow(row: Record<string, unknown>): Lead {
  return {
    id: row.id as string,
    name: row.name as string,
    email: (row.email as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    source: (row.source as string | null) ?? null,
    status: row.status as LeadStatus,
    notes: (row.notes as string | null) ?? null,
    matchedProfileId: (row.matched_profile_id as string | null) ?? null,
    convertedProfileId: (row.converted_profile_id as string | null) ?? null,
    convertedAt: (row.converted_at as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    profileMatch: null,
  };
}

function mapLeadProfileRow(row: Record<string, unknown>): LeadProfileMatch {
  return {
    id: row.id as string,
    name: row.name as string,
    email: (row.email as string | null) ?? null,
    customerStatus: (row.customer_status as LeadProfileMatch["customerStatus"]) ?? null,
  };
}

export async function attachLeadProfileMatches(
  supabase: SupabaseClient,
  leads: Lead[]
): Promise<Lead[]> {
  if (leads.length === 0) return leads;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, customer_status")
    .eq("role", "customer")
    .not("email", "is", null);

  if (error || !data) {
    return leads.map((lead) => ({ ...lead, profileMatch: null }));
  }

  const profileByEmail = new Map<string, LeadProfileMatch>();
  for (const row of data as Record<string, unknown>[]) {
    const email = typeof row.email === "string" ? row.email.trim().toLowerCase() : "";
    if (!email || profileByEmail.has(email)) continue;
    profileByEmail.set(email, mapLeadProfileRow(row));
  }

  return leads.map((lead) => ({
    ...lead,
    profileMatch: lead.email ? profileByEmail.get(lead.email.trim().toLowerCase()) ?? null : null,
  }));
}

export async function findCustomerProfileByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<LeadProfileMatch | null> {
  const normalizedEmail = email.trim();
  if (!normalizedEmail) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, customer_status")
    .eq("role", "customer")
    .ilike("email", normalizedEmail)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return mapLeadProfileRow(data as Record<string, unknown>);
}
