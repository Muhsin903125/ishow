import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail, type EmailType } from "@/lib/email/sender";

export type ProfileSnapshot = {
  id: string;
  name: string;
  email: string | null;
};

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://ishowtransformation.com"
  );
}

export function formatDisplayDate(date: string) {
  if (!date) return "";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export async function getProfileSnapshot(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileSnapshot | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id as string,
    name: (data.name as string) || "there",
    email: (data.email as string | null) ?? null,
  };
}

export async function createUserNotification(
  supabase: SupabaseClient,
  input: {
    userId: string;
    type: string;
    title: string;
    body?: string | null;
    href?: string | null;
  }
) {
  try {
    await supabase.from("notifications").insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      href: input.href ?? null,
    });
  } catch {
    // Non-blocking by design.
  }
}

export async function notifyProfile(
  supabase: SupabaseClient,
  input: {
    userId: string;
    profile?: ProfileSnapshot | null;
    notification?: {
      type: string;
      title: string;
      body?: string | null;
      href?: string | null;
    };
    email?: {
      type: EmailType;
      data: Record<string, string | number | undefined>;
    };
  }
) {
  const profile = input.profile ?? (await getProfileSnapshot(supabase, input.userId));

  if (!profile) {
    return null;
  }

  if (input.notification) {
    await createUserNotification(supabase, {
      userId: profile.id,
      ...input.notification,
    });
  }

  if (input.email?.type && profile.email) {
    try {
      await sendEmail({
        type: input.email.type,
        to: profile.email,
        data: {
          name: profile.name,
          clientName: profile.name,
          ...input.email.data,
          siteUrl: siteUrl(),
        },
      });
    } catch {
      // Non-blocking by design.
    }
  }

  return profile;
}
