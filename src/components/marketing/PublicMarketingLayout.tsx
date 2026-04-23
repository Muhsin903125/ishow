import Head from "next/head";
import type { ReactNode } from "react";
import WebsiteFooter from "@/components/marketing/WebsiteFooter";
import WebsiteHeader from "@/components/marketing/WebsiteHeader";

interface PublicMarketingLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function PublicMarketingLayout({
  title,
  description,
  children,
}: PublicMarketingLayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      <div className="min-h-screen bg-[linear-gradient(180deg,#faf5ee_0%,#fffdf9_24%,#f8fbff_100%)] text-slate-950">
        <WebsiteHeader />
        <main className="pt-24 sm:pt-28">{children}</main>
        <WebsiteFooter />
      </div>
    </>
  );
}
