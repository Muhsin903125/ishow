import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PublicMarketingLayout from "@/components/marketing/PublicMarketingLayout";
import { getDefaultCMSContent, type EditableCMSContent } from "@/lib/cms/content";
import { loadPublicSiteContent } from "@/lib/api/site-content";
import { resolveCloudinaryImageUrl } from "@/lib/media/cloudinary";

export default function ServicesPage() {
  const defaultContent = getDefaultCMSContent();
  const [page, setPage] = useState<EditableCMSContent["site_content"]["services"]>(
    defaultContent.site_content.services
  );
  const [services, setServices] = useState<EditableCMSContent["services"]["items"]>(
    defaultContent.services.items
  );

  useEffect(() => {
    let active = true;

    loadPublicSiteContent()
      .then((response) => {
        if (!active) return;
        setPage(response.content.site_content.services);
        setServices(response.content.services.items);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <PublicMarketingLayout
      title={page.meta_title || "Fitness Services | iShow Transformation"}
      description={
        page.meta_description ||
        "Explore iShow Transformation coaching services, packages, and training formats in Dubai and online."
      }
    >
      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-14 pt-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white/92 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.08)] sm:p-10">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
            {page.eyebrow || "Services"}
          </p>
          <h1 className="mt-6 text-5xl font-extrabold uppercase leading-[0.92] tracking-tight text-slate-950 sm:text-6xl">
            {page.title || "Fitness Services Built Around Real Adherence."}
          </h1>
          {page.intro ? (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              {page.intro}
            </p>
          ) : null}

          {page.stats?.length ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {page.stats.map((stat, index) => (
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

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href={page.cta_href || "/register"}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-orange-600"
            >
              {page.cta_label || "Start Your Assessment"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[#140f0a] shadow-[0_30px_90px_rgba(15,23,42,0.14)]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-75"
            style={{
              backgroundImage: `url(${resolveCloudinaryImageUrl(page.hero_media)})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#140f0a] via-[#140f0a]/55 to-transparent" />
          <div className="relative flex min-h-[540px] flex-col justify-end p-8 sm:p-10">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-6 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-400">
                Service fit
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[rgba(255,250,246,0.82)]">
                {page.spotlight_quote ||
                  "The right service is the one you can execute consistently, not the one that looks hardest on paper."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {services.length ? (
        <section className="mx-auto max-w-7xl px-6 py-4 lg:px-10">
          <div className="mb-10 max-w-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-500">
              Service Tracks
            </p>
            <h2 className="mt-4 text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-slate-950 sm:text-5xl">
              Coaching categories built around how people actually train.
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
              >
                {service.image ? (
                  <div
                    className="h-56 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${resolveCloudinaryImageUrl(service.image)})`,
                    }}
                  />
                ) : null}
                <div className="p-6">
                  <h3 className="text-2xl font-extrabold uppercase leading-[0.94] text-slate-950">
                    {service.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">
                    {service.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <div
              className="min-h-[340px] bg-cover bg-center"
              style={{
                backgroundImage: `url(${resolveCloudinaryImageUrl(page.feature_media)})`,
              }}
            />
          </div>

          <div className="space-y-5">
            {(page.sections ?? []).map((section, index) => (
              <div
                key={`${section.title}-${index}`}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
              >
                <h2 className="text-xl font-extrabold uppercase leading-[0.95] text-slate-950">
                  {section.title}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-600">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </PublicMarketingLayout>
  );
}
