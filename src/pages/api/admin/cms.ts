import type { NextApiRequest, NextApiResponse } from "next";
import {
  getDefaultCMSContent,
  normalizeCMSContent,
  type CMSContent,
} from "@/lib/cms/content";
import { requireAdmin, writeAdminAudit } from "@/lib/api/admin";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";

type ErrorResponse = { error: string };
type CmsResponse =
  | {
      ok: true;
      content: ReturnType<typeof normalizeCMSContent>;
      updatedAt: string | null;
    }
  | ErrorResponse;

const CMS_KEY = "main";

function hasCmsPayload(body: unknown): body is { content: CMSContent | null } {
  return !!body && typeof body === "object" && "content" in body;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CmsResponse>
) {
  const admin = await requireAdmin(req, res);
  if (!admin.ok) return;

  const { supabase, userId } = admin;

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("landing_config")
      .select("content, updated_at")
      .eq("key", CMS_KEY)
      .maybeSingle();

    if (error) {
      console.error("[api/admin/cms][GET]", error);
      return res.status(500).json({ error: "Failed to load CMS content" });
    }

    const content = data?.content
      ? normalizeCMSContent(data.content as CMSContent)
      : getDefaultCMSContent();

    return res.status(200).json({
      ok: true,
      content,
      updatedAt: data?.updated_at ?? null,
    });
  }

  if (req.method === "PUT") {
    if (
      !enforceRateLimit(req, res, {
        bucket: "admin:cms:update",
        limit: 20,
        windowMs: 60_000,
        key: createRateLimitKey(req, "admin:cms:update", userId),
      })
    ) {
      return;
    }

    if (!hasCmsPayload(req.body)) {
      return res.status(400).json({ error: "Invalid CMS payload" });
    }

    const normalized = normalizeCMSContent(req.body.content);
    const updatedAt = new Date().toISOString();

    const { error } = await supabase.from("landing_config").upsert(
      {
        key: CMS_KEY,
        content: normalized,
        updated_at: updatedAt,
      },
      { onConflict: "key" }
    );

    if (error) {
      console.error("[api/admin/cms][PUT]", error);
      return res.status(500).json({ error: "Failed to save CMS content" });
    }

    await writeAdminAudit(supabase, {
      userId,
      action: "cms.update",
      entityType: "landing_config",
      entityId: CMS_KEY,
      details: {
        sections: Object.keys(normalized),
      },
    });

    return res.status(200).json({
      ok: true,
      content: normalized,
      updatedAt,
    });
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ error: "Method not allowed" });
}
