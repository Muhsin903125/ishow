import type { NextApiRequest, NextApiResponse } from "next";
import { sendError } from "@/lib/server/api";

type RateLimitConfig = {
  bucket: string;
  limit: number;
  windowMs: number;
  key?: string;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

declare global {
  var __ishowRateLimitStore__: Map<string, RateLimitState> | undefined;
}

function getStore() {
  if (!global.__ishowRateLimitStore__) {
    global.__ishowRateLimitStore__ = new Map<string, RateLimitState>();
  }

  return global.__ishowRateLimitStore__;
}

function getRequestIp(req: NextApiRequest) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return req.socket.remoteAddress || "unknown";
}

export function createRateLimitKey(
  req: NextApiRequest,
  bucket: string,
  extraKey?: string
) {
  return [bucket, extraKey || getRequestIp(req)].join(":");
}

export function enforceRateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  config: RateLimitConfig
) {
  const now = Date.now();
  const key = config.key || createRateLimitKey(req, config.bucket);
  const store = getStore();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return true;
  }

  if (existing.count >= config.limit) {
    res.setHeader("Retry-After", Math.ceil((existing.resetAt - now) / 1000));
    sendError(res, 429, "Too many requests");
    return false;
  }

  store.set(key, {
    ...existing,
    count: existing.count + 1,
  });
  return true;
}
