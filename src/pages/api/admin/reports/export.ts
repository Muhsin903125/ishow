import type { NextApiRequest, NextApiResponse } from "next";
import { requireApiUser } from "@/lib/server/auth";
import { handleApiError, sendMethodNotAllowed } from "@/lib/server/api";
import {
  buildAdminReportsOverview,
  parseReportRange,
  reportsOverviewToCsv,
} from "@/lib/server/reports";
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
      bucket: "admin:reports:export",
      limit: 10,
      windowMs: 60_000,
      key: createRateLimitKey(req, "admin:reports:export", auth.user.id),
    })
  ) {
    return;
  }

  try {
    const service = createServiceRoleClient();
    const range = parseReportRange(req.query.range);
    const overview = await buildAdminReportsOverview(service, range);
    const csv = reportsOverviewToCsv(overview);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="admin-reports-${range}.csv"`
    );

    return res.status(200).send(csv);
  } catch (error) {
    return handleApiError(res, error, "[api/admin/reports/export][GET]");
  }
}
