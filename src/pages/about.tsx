import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PublicMarketingLayout from "@/components/marketing/PublicMarketingLayout";
import { getDefaultCMSContent, type EditableCMSContent } from "@/lib/cms/content";
import { loadPublicSiteContent } from "@/lib/api/site-content";
import { resolveCloudinaryImageUrl } from "@/lib/media/cloudinary";

export default function AboutPage() {
  const [content, setContent] = useState<EditableCMSContent["site_content"]["about"]>(
    getDefaultCMSContent().site_content.about
  );

  useEffect(() => {
    let active = true;

    loadPublicSiteContent()
      .then((response) => {
        if (active) {
          setContent(response.content.site_content.about);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <PublicMarketingLayout
      title={content.meta_title || "About iShow Transformation"}
      description={
        content.meta_description ||
        "Learn about the iShow Transformation coaching philosophy and what makes the system sustainable."
      }
    >
      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-14 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white/92 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.08)] sm:p-10">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
            {content.eyebrow || "About iShow"}
          </p>
          <h1 className="mt-6 text-5xl font-extrabold uppercase leading-[0.92] tracking-tight text-slate-950 sm:text-6xl">
            {content.title || "Built For Sustainable Transformation."}
          </h1>
          {content.intro ? (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              {content.intro}
            </p>
          ) : null}

          {content.stats?.length ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {content.stats.map((stat, index) => (
                <div
                  key={`${stat.label}-${index}`}
                  className="rounded-[1.5rem] border border-slate-200 bg-[#f8f3eb] p-5"
                >
                  <p className="text-2xl font-black uppercase tracking-tight text-slate-950">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[#140f0a] shadow-[0_30px_90px_rgba(15,23,42,0.14)]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-70"
            style={{
              backgroundImage: `url(${resolveCloudinaryImageUrl(content.hero_media)})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#140f0a] via-[#140f0a]/55 to-transparent" />
          <div className="relative flex min-h-[540px] flex-col justify-end p-8 sm:p-10">
            <p className="max-w-md text-sm font-medium leading-relaxed text-[rgba(255,250,246,0.8)]">
              {content.spotlight_quote ||
                "Coaching should help people build a life they can keep, not force them into routines that only work in perfect conditions."}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-4 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <div
              className="min-h-[340px] bg-cover bg-center"
              style={{
                backgroundImage: `url(${resolveCloudinaryImageUrl(content.feature_media)})`,
              }}
            />
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-500">
              Coaching Philosophy
            </p>
            <div className="mt-6 space-y-5">
              {(content.sections ?? []).map((section, index) => (
                <div
                  key={`${section.title}-${index}`}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
                >
                  <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-950">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-slate-600">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-10">
        <div className="rounded-[2.5rem] border border-slate-200 bg-[#140f0a] px-8 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 className="mt-6 text-4xl font-extrabold uppercase leading-[0.92] tracking-tight text-[#fffaf6] sm:text-5xl">
                {content.cta_title || "Ready To Talk Through Your Goals?"}
              </h2>
              {content.cta_body ? (
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-[rgba(255,250,246,0.72)]">
                  {content.cta_body}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href={content.cta_href || "/register"}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-orange-600"
              >
                {content.cta_label || "Start Your Assessment"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicMarketingLayout>
  );
}
