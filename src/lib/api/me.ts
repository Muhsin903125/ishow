import { apiRequest } from "@/lib/api/client";
import type { Profile } from "@/lib/db/profiles";

export async function loadMyProfile() {
  const response = await apiRequest<{ ok: true; profile: Profile }>(
    "/api/me/profile"
  );
  return response.profile;
}

export async function saveMyProfile(
  profile: Partial<Pick<Profile, "name" | "phone" | "avatarUrl">>
) {
  const response = await apiRequest<{ ok: true; profile: Profile }>(
    "/api/me/profile",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ profile }),
    }
  );

  return response.profile;
}

