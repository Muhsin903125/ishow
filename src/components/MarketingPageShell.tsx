import Head from "next/head";
import Link from "next/link";
import type { ReactNode } from "react";
import WebsiteFooter from "@/components/marketing/WebsiteFooter";
import WebsiteHeader from "@/components/marketing/WebsiteHeader";
import type { BasicMarketingPage, SitePageSection } from "@/lib/cms/content";

interface MarketingPageShellProps {
  page: BasicMarketingPage;
  defaultTitle: string;
  defaultDescription: string;
  children?: ReactNode;
}

function renderSection(section: SitePageSection, index: number) {
  return (
    <section
      key={`${section.title}-${index}`}
      className="rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-sm sm:p-8"
    >
      <h2 className="mb-3 text-2xl font-black text-slate-950">{section.title}</h2>
      <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">
        {section.body}
      </p>
    </section>
  );
}

export default function MarketingPageShell({
  page,
  defaultTitle,
  defaultDescription,
  children,
}: MarketingPageShellProps) {
  const title = page.meta_title || defaultTitle;
  const description = page.meta_description || defaultDescription;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7f3ec_0%,#fffdf9_30%,#f8fbff_100%)] text-slate-950">
        <WebsiteHeader />
        <main className="pt-24 sm:pt-28">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10 backdrop-blur-sm">
            {page.eyebrow ? (
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
                {page.eyebrow}
              </p>
            ) : null}
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
              {page.title || defaultTitle}
            </h1>
            {page.intro ? (
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">
                {page.intro}
              </p>
            ) : null}
          </div>

          {page.sections?.length ? (
            <div className="mt-8 space-y-4">
              {page.sections.map(renderSection)}
            </div>
          ) : null}

          {children ? <div className="mt-8 space-y-4">{children}</div> : null}

          {(page.cta_title || page.cta_body || page.cta_label) && (
            <section className="mt-8 rounded-[1.75rem] border border-orange-200/70 bg-white p-6 shadow-sm sm:p-8">
              {page.cta_title ? (
                <h2 className="text-2xl font-black text-slate-950">{page.cta_title}</h2>
              ) : null}
              {page.cta_body ? (
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
                  {page.cta_body}
                </p>
              ) : null}
              {page.cta_label ? (
                <Link
                  href={page.cta_href || "/register"}
                  className="mt-6 inline-flex items-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-orange-600"
                >
                  {page.cta_label}
                </Link>
              ) : null}
            </section>
          )}
        </div>
        </main>
        <WebsiteFooter />
      </div>
    </>
  );
}
