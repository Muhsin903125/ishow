import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, MessageSquareText, Phone } from "lucide-react";
import PublicContactForm from "@/components/marketing/PublicContactForm";
import PublicMarketingLayout from "@/components/marketing/PublicMarketingLayout";
import { getDefaultCMSContent, type EditableCMSContent } from "@/lib/cms/content";
import { loadPublicSiteContent } from "@/lib/api/site-content";
import { resolveCloudinaryImageUrl } from "@/lib/media/cloudinary";

export default function ContactPage() {
  const [content, setContent] = useState<EditableCMSContent["site_content"]["contact"]>(
    getDefaultCMSContent().site_content.contact
  );

  useEffect(() => {
    let active = true;

    loadPublicSiteContent()
      .then((response) => {
        if (active) {
          setContent(response.content.site_content.contact);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <PublicMarketingLayout
      title={content.meta_title || "Contact iShow Transformation"}
      description={
        content.meta_description ||
        "Contact iShow Transformation and send an open enquiry without logging in."
      }
    >
      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-14 pt-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white/92 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.08)] sm:p-10">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
            {content.eyebrow || "Contact"}
          </p>
          <h1 className="mt-6 text-5xl font-extrabold uppercase leading-[0.92] tracking-tight text-slate-950 sm:text-6xl">
            {content.title || "Start The Conversation."}
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#140f0a] via-[#140f0a]/60 to-transparent" />
          <div className="relative flex min-h-[540px] flex-col justify-end p-8 sm:p-10">
            <div className="rounded-[1.75rem] border border-white/12 bg-white/8 p-6 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-400">
                What to share
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[rgba(255,250,246,0.82)]">
                {content.spotlight_quote ||
                  "Tell us what you are struggling with, what kind of support you need, and what a realistic weekly schedule looks like."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-4 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            {content.channels?.length ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8">
                <div className="flex items-center gap-3">
                  <MessageSquareText className="h-5 w-5 text-orange-500" />
                  <h2 className="text-2xl font-extrabold uppercase tracking-tight text-slate-950">
                    Contact Channels
                  </h2>
                </div>
                <div className="mt-6 grid gap-4">
                  {content.channels.map((channel, index) => (
                    <a
                      key={`${channel.label}-${index}`}
                      href={channel.href || "#"}
                      className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 transition-colors hover:border-orange-200 hover:bg-orange-50"
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        {channel.label}
                      </p>
                      <p className="mt-2 text-lg font-bold text-slate-950">{channel.value}</p>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {content.service_areas?.length ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  <h2 className="text-2xl font-extrabold uppercase tracking-tight text-slate-950">
                    Service Areas
                  </h2>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  {content.service_areas.map((area, index) => (
                    <span
                      key={`${area}-${index}`}
                      className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <div
                className="min-h-[320px] bg-cover bg-center"
                style={{
                  backgroundImage: `url(${resolveCloudinaryImageUrl(content.feature_media)})`,
                }}
              />
            </div>

            {(content.sections ?? []).map((section, index) => (
              <div
                key={`${section.title}-${index}`}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-orange-500" />
                  <h2 className="text-xl font-extrabold uppercase leading-[0.95] text-slate-950">
                    {section.title}
                  </h2>
                </div>
                <p className="mt-4 text-base leading-relaxed text-slate-600">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <PublicContactForm
            title={content.form_title || "Start With A Simple Enquiry"}
            intro={content.form_intro}
            buttonLabel={content.form_button_label}
            successMessage={content.form_success_message}
          />

          <div className="rounded-[2rem] border border-slate-200 bg-[#140f0a] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-400">
              Next Step
            </p>
            <h2 className="mt-4 text-4xl font-extrabold uppercase leading-[0.94] tracking-tight text-[#fffaf6]">
              {content.cta_title || "Prefer A Guided Start?"}
            </h2>
            {content.cta_body ? (
              <p className="mt-4 text-base leading-relaxed text-[rgba(255,250,246,0.74)]">
                {content.cta_body}
              </p>
            ) : null}

            <Link
              href={content.cta_href || "/register"}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-orange-600"
            >
              {content.cta_label || "Take The Assessment"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </PublicMarketingLayout>
  );
}
