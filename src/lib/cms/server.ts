import type { GetServerSidePropsContext } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  getDefaultCMSContent,
  normalizeCMSContent,
  type CMSContent,
} from "@/lib/cms/content";

export async function getCMSContent(context: GetServerSidePropsContext) {
  const supabase = createClient(context);
  const { data } = await supabase
    .from("landing_config")
    .select("content")
    .eq("key", "main")
    .maybeSingle();

  if (!data?.content) {
    return getDefaultCMSContent();
  }

  return normalizeCMSContent(data.content as CMSContent);
}
