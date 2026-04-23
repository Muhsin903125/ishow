import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PublicMarketingLayout from "@/components/marketing/PublicMarketingLayout";
import { loadPublicSiteContent } from "@/lib/api/site-content";
import { type ContentArticle } from "@/lib/cms/content";

export default function ContentArticlePage() {
  const router = useRouter();
  const [article, setArticle] = useState<ContentArticle | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    let active = true;
    const slug = String(router.query.slug ?? "");

    loadPublicSiteContent()
      .then((response) => {
        if (!active) return;
        const nextArticle =
          response.content.site_content.content_hub.articles?.find(
            (entry) => entry.slug === slug
          ) ?? null;
        setArticle(nextArticle);
        setReady(true);
      })
      .catch(() => {
        if (active) {
          setReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, [router.isReady, router.query.slug]);

  if (!ready) {
    return (
      <PublicMarketingLayout
        title="Loading Article | iShow Transformation"
        description="Loading content from iShow Transformation."
      >
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-8 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Loading article
          </p>
        </div>
        </div>
      </PublicMarketingLayout>
    );
  }

  if (!article) {
    return (
      <PublicMarketingLayout
        title="Article Not Found | iShow Transformation"
        description="This article is not available yet."
      >
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-8 shadow-sm sm:p-10">
          <Link
            href="/content"
            className="text-sm font-semibold tracking-[0.2em] uppercase text-orange-600 hover:text-orange-700 transition-colors"
          >
            Back to Content
          </Link>
          <h1 className="mt-8 text-4xl font-black tracking-tight">Article Not Found</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            This article is not available yet.
          </p>
        </div>
        </div>
      </PublicMarketingLayout>
    );
  }

  return (
    <PublicMarketingLayout
      title={article.meta_title || article.title}
      description={article.meta_description || article.excerpt}
    >
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/content"
            className="text-sm font-semibold tracking-[0.2em] uppercase text-orange-600 hover:text-orange-700 transition-colors"
          >
            Back to Content
          </Link>

          <article className="mt-8 rounded-[2rem] border border-slate-200/80 bg-white/92 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">
              {article.category}
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight">
              {article.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {article.published_at ? <span>{article.published_at}</span> : null}
              {article.read_time ? <span>{article.read_time}</span> : null}
            </div>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              {article.excerpt}
            </p>
            <div className="mt-8 whitespace-pre-line text-base leading-8 text-slate-700">
              {article.body}
            </div>
          </article>
        </div>
    </PublicMarketingLayout>
  );
}
