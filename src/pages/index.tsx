import { useEffect, useState } from "react";
import LandingClient from "@/components/LandingClient";
import type {
  EditableCMSContent,
  LandingClientTestimonial,
} from "@/lib/cms/content";
import { getDefaultCMSContent } from "@/lib/cms/content";
import { loadPublicSiteContent } from "@/lib/api/site-content";
import Head from "next/head";

export default function HomePage() {
  const [testimonials, setTestimonials] = useState<LandingClientTestimonial[]>([]);
  const [config, setConfig] = useState<EditableCMSContent>(getDefaultCMSContent());

  useEffect(() => {
    let active = true;

    loadPublicSiteContent()
      .then((response) => {
        if (!active) return;
        setTestimonials(response.testimonials);
        setConfig(response.content);
      })
      .catch(() => {
        // Keep the default content when the API is unavailable.
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Head>
        <title>Home | iShow Transformation</title>
        <meta name="description" content="Dubai-based personal trainer Mohammed offers 1-on-1 coaching, custom training plans, and nutrition programs. Serving clients in Dubai, UAE, and online." />
      </Head>
      <LandingClient 
        testimonials={testimonials} 
        config={config}
      />
    </>
  );
}
