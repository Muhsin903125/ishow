import type { NextApiRequest, NextApiResponse } from "next";
import type { User } from "@supabase/supabase-js";
import { createApiClient } from "@/lib/supabase/api";
import { sendError } from "@/lib/server/api";

export type ApiRole = "admin" | "trainer" | "customer";

export type ApiProfile = {
  id: string;
  name: string;
  email: string | null;
  role: ApiRole;
  customerStatus: "request" | "client" | null;
};

export type ApiAuthContext = {
  supabase: ReturnType<typeof createApiClient>;
  user: User;
  profile: ApiProfile;
};

export async function requireApiUser(
  req: NextApiRequest,
  res: NextApiResponse,
  options?: { roles?: ApiRole[] }
): Promise<ApiAuthContext | null> {
  const supabase = createApiClient(req, res);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    sendError(res, 401, "Unauthorized");
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, email, role, customer_status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    sendError(res, 403, "Forbidden");
    return null;
  }

  const mappedProfile: ApiProfile = {
    id: profile.id as string,
    name: profile.name as string,
    email: (profile.email as string | null) ?? null,
    role: profile.role as ApiRole,
    customerStatus:
      (profile.customer_status as ApiProfile["customerStatus"]) ?? null,
  };

  if (options?.roles?.length && !options.roles.includes(mappedProfile.role)) {
    sendError(res, 403, "Forbidden");
    return null;
  }

  return { supabase, user, profile: mappedProfile };
}
