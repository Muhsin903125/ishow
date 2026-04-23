import { useEffect, useState } from "react";
import MarketingPageShell from "@/components/MarketingPageShell";
import { getDefaultCMSContent, type EditableCMSContent } from "@/lib/cms/content";
import { loadPublicSiteContent } from "@/lib/api/site-content";

export default function FaqPage() {
  const [content, setContent] = useState<EditableCMSContent["site_content"]["faq"]>(
    getDefaultCMSContent().site_content.faq
  );

  useEffect(() => {
    let active = true;

    loadPublicSiteContent()
      .then((response) => {
        if (active) {
          setContent(response.content.site_content.faq);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <MarketingPageShell
      page={content}
      defaultTitle="Frequently Asked Questions | iShow Transformation"
      defaultDescription="Answers to common questions about iShow Transformation coaching and assessments."
    >
      {content.items?.length ? (
        <div className="space-y-4">
          {content.items.map((item, index) => (
            <section
              key={`${item.question}-${index}`}
              className="rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-sm sm:p-8"
            >
              <h2 className="mb-3 text-2xl font-black text-slate-950">
                {item.question}
              </h2>
              <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">
                {item.answer}
              </p>
            </section>
          ))}
        </div>
      ) : null}
    </MarketingPageShell>
  );
}
