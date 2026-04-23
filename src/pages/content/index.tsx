import Link from "next/link";
import { useEffect, useState } from "react";
import PublicMarketingLayout from "@/components/marketing/PublicMarketingLayout";
import { loadPublicSiteContent } from "@/lib/api/site-content";
import { getDefaultCMSContent, type ContentArticle, type EditableCMSContent } from "@/lib/cms/content";

export default function ContentHubPage() {
  const [page, setPage] = useState<EditableCMSContent["site_content"]["content_hub"]>(
    getDefaultCMSContent().site_content.content_hub
  );

  useEffect(() => {
    let active = true;

    loadPublicSiteContent()
      .then((response) => {
        if (active) {
          setPage(response.content.site_content.content_hub);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const articles = page.articles ?? [];
  const title = page.meta_title || "Training Insights | iShow Transformation";
  const description =
    page.meta_description ||
    "Read practical coaching insights from iShow Transformation.";

  return (
    <PublicMarketingLayout title={title} description={description}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10 backdrop-blur-sm">
          {page.eyebrow ? (
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
              {page.eyebrow}
            </p>
          ) : null}
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            {page.title || "Content Hub"}
          </h1>
          {page.intro ? (
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">
              {page.intro}
            </p>
          ) : null}
        </div>

        {page.sections?.length ? (
          <div className="mt-8 space-y-4">
            {page.sections.map((section, index) => (
              <section
                key={`${section.title}-${index}`}
                className="rounded-[1.75rem] border border-slate-200/80 bg-white/92 p-6 shadow-sm sm:p-8"
              >
                <h2 className="mb-3 text-2xl font-black text-slate-950">
                  {section.title}
                </h2>
                <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </PublicMarketingLayout>
  );
}

function ArticleCard({ article }: { article: ContentArticle }) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200/80 bg-white/92 p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">
        {article.category}
      </p>
      <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
        {article.title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-slate-600">
        {article.excerpt}
      </p>
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          {article.read_time || "Insight"}
        </p>
        <Link
          href={`/content/${article.slug}`}
          className="inline-flex items-center rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-orange-600"
        >
          Read More
        </Link>
      </div>
    </article>
  );
}
