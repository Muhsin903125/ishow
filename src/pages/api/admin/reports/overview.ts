import type { NextApiRequest, NextApiResponse } from "next";
import { requireApiUser } from "@/lib/server/auth";
import {
  handleApiError,
  sendMethodNotAllowed,
  sendSuccess,
} from "@/lib/server/api";
import { buildAdminReportsOverview, parseReportRange } from "@/lib/server/reports";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return sendMethodNotAllowed(res, ["GET"]);
  }

  const auth = await requireApiUser(req, res, { roles: ["admin"] });
  if (!auth) return;

  if (
    !enforceRateLimit(req, res, {
      bucket: "admin:reports:overview",
      limit: 20,
      windowMs: 60_000,
      key: createRateLimitKey(req, "admin:reports:overview", auth.user.id),
    })
  ) {
    return;
  }

  try {
    const service = createServiceRoleClient();
    const range = parseReportRange(req.query.range);
    const overview = await buildAdminReportsOverview(service, range);

    return sendSuccess(res, {
      ok: true,
      overview,
    });
  } catch (error) {
    return handleApiError(res, error, "[api/admin/reports/overview][GET]");
  }
}
