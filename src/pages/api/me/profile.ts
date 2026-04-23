import type { NextApiRequest, NextApiResponse } from "next";
import { requireApiUser } from "@/lib/server/auth";
import { ApiError, handleApiError, sendMethodNotAllowed, sendSuccess } from "@/lib/server/api";
import { mapProfile } from "@/lib/server/mappers";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { ensureObject, optionalString } from "@/lib/server/validation";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await requireApiUser(req, res);
  if (!auth) return;

  if (
    !enforceRateLimit(req, res, {
      bucket: "me:profile",
      limit: 60,
      windowMs: 60_000,
      key: createRateLimitKey(req, "me:profile", auth.user.id),
    })
  ) {
    return;
  }

  try {
    const service = createServiceRoleClient();

    if (req.method === "GET") {
      const { data, error } = await service
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .maybeSingle();

      if (error || !data) {
        throw new ApiError(404, "Profile not found");
      }

      return sendSuccess(res, {
        ok: true,
        profile: mapProfile(data as Record<string, unknown>),
      });
    }

    if (req.method === "PUT") {
      const body = ensureObject(req.body);
      const payload = ensureObject(body.profile, "Invalid profile payload");
      const updates: Record<string, unknown> = {};

      if ("name" in payload) updates.name = optionalString(payload.name, 255);
      if ("phone" in payload) updates.phone = optionalString(payload.phone, 80);
      if ("avatarUrl" in payload) {
        updates.avatar_url = optionalString(payload.avatarUrl, 1000);
      }

      if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No profile changes submitted");
      }

      const { data, error } = await service
        .from("profiles")
        .update(updates)
        .eq("id", auth.user.id)
        .select("*")
        .maybeSingle();

      if (error || !data) {
        throw new ApiError(500, "Failed to update profile");
      }

      return sendSuccess(res, {
        ok: true,
        profile: mapProfile(data as Record<string, unknown>),
      });
    }

    return sendMethodNotAllowed(res, ["GET", "PUT"]);
  } catch (error) {
    return handleApiError(res, error, "[api/me/profile]");
  }
}

