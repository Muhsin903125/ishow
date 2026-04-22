import { createClient } from "@/lib/supabase/server";
import LandingClient, {
  type LandingClientConfig,
  type LandingClientTestimonial,
} from "@/components/LandingClient";
import { DM_Sans, Barlow_Condensed } from "next/font/google";
import { GetServerSideProps } from 'next';
import Head from 'next/head';

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

type HomePageProps = {
  testimonials: LandingClientTestimonial[];
  config: LandingClientConfig | null;
};

export default function HomePage({ testimonials, config }: HomePageProps) {
  return (
    <>
      <Head>
        <title>Home | iShow Transformation</title>
        <meta name="description" content="Dubai-based personal trainer Mohammed offers 1-on-1 coaching, custom training plans, and nutrition programs. Serving clients in Dubai, UAE, and online." />
      </Head>
      <LandingClient 
        testimonials={testimonials} 
        config={config}
        fonts={{ 
          dm: dm.variable, 
          barlow: barlow.variable 
        }} 
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = await createClient(context);
  
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

  return {
    props: {
      testimonials: testimonialsResponse.data || [],
      config: landingConfigResponse.data?.content || null
    }
  };
};
