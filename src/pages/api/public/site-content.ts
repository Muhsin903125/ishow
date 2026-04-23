import type { NextApiRequest, NextApiResponse } from "next";
import { normalizeCMSContent, type CMSContent } from "@/lib/cms/content";
import { ApiError, handleApiError, sendMethodNotAllowed, sendSuccess } from "@/lib/server/api";
import { mapLandingTestimonial } from "@/lib/server/mappers";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return sendMethodNotAllowed(res, ["GET"]);
  }

  if (
    !enforceRateLimit(req, res, {
      bucket: "public:site-content",
      limit: 180,
      windowMs: 60_000,
      key: createRateLimitKey(req, "public:site-content"),
    })
  ) {
    return;
  }

  try {
    const service = createServiceRoleClient();
    const [configResponse, testimonialsResponse] = await Promise.all([
      service.from("landing_config").select("content").eq("key", "main").maybeSingle(),
      service
        .from("testimonials")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false }),
    ]);

    if (configResponse.error || testimonialsResponse.error) {
      throw new ApiError(500, "Failed to load public site content");
    }

    return sendSuccess(res, {
      ok: true,
      content: normalizeCMSContent((configResponse.data?.content as CMSContent | null) ?? null),
      testimonials: (testimonialsResponse.data ?? []).map((row) =>
        mapLandingTestimonial(row as Record<string, unknown>)
      ),
    });
  } catch (error) {
    return handleApiError(res, error, "[api/public/site-content][GET]");
  }
}

