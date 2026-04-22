import { createClient } from "@/lib/supabase/server";
import LandingClient from "@/components/LandingClient";
import { DM_Sans, Barlow_Condensed } from "next/font/google";

export const metadata = {
  title: "Home | iShow Transformation",
  description: "Dubai-based personal trainer Mohammed offers 1-on-1 coaching, custom training plans, and nutrition programs. Serving clients in Dubai, UAE, and online.",
};

const dm = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["400", "500", "600", "700"],
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["700", "800"],
});

export default async function HomePage() {
  const supabase = await createClient();
  
  const [testimonialsResponse, landingConfigResponse] = await Promise.all([
    supabase
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("landing_config")
      .select("content")
      .eq("key", "main")
      .single()
  ]);

  return (
    <LandingClient 
      testimonials={testimonialsResponse.data || []} 
      config={landingConfigResponse.data?.content}
      fonts={{ 
        dm: dm.variable, 
        barlow: barlow.variable 
      }} 
    />
  );
}
