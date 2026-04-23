import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextApiRequest, NextApiResponse } from "next";

export function createApiClient(req: NextApiRequest, res: NextApiResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.headers.cookie ? parseCookie(req.headers.cookie) : [];
        },
        setAll(cookiesToSet) {
          res.setHeader(
            "Set-Cookie",
            cookiesToSet.map(({ name, value, options }) =>
              serializeCookie(name, value, options)
            )
          );
        },
      },
    }
  );
}

function parseCookie(str: string) {
  return str
    .split(";")
    .map((value) => value.split("="))
    .map(([name, value]) => ({
      name: name.trim(),
      value: decodeURIComponent(value ?? ""),
    }));
}

function serializeCookie(name: string, value: string, options: CookieOptions) {
  let cookie = `${name}=${encodeURIComponent(value)}`;

  if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
  if (options.domain) cookie += `; Domain=${options.domain}`;
  if (options.path) cookie += `; Path=${options.path}`;
  if (options.httpOnly) cookie += "; HttpOnly";
  if (options.secure) cookie += "; Secure";
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;

  return cookie;
}
