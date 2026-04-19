import type { Metadata } from "next";
import Link from "next/link";

const privacySections = [
  {
    title: "Information We Collect",
    body: "iShowTransformation may collect account details such as your name, email address, phone number, fitness assessment responses, coaching notes, training progress, payment status metadata, and messages shared through the platform or approved support channels.",
  },
  {
    title: "How We Use Your Information",
    body: "We use this information to create and manage your coaching plan, review assessment data, track progress, improve communication, manage billing and account access, and maintain the quality and safety of the coaching experience.",
  },
  {
    title: "Sharing and Disclosure",
    body: "Your personal information is not sold. It may be shared only with service providers that help operate the platform, process payments, or support communication, or when disclosure is required by law or necessary to protect rights, safety, or platform integrity.",
  },
  {
    title: "Retention and Security",
    body: "We retain information only for as long as needed to provide coaching services, comply with legal obligations, resolve disputes, and maintain business records. Reasonable administrative and technical safeguards are used to reduce unauthorized access or misuse.",
  },
  {
    title: "Your Choices",
    body: "You may request access, correction, or deletion of your information, subject to legal and operational requirements. Privacy-related requests can be submitted through your account contact channel or by reaching out to the official iShowTransformation coach contact listed on the site.",
  },
];

export const metadata: Metadata = {
  title: "Privacy Policy | iShowTransformation",
  description: "How iShowTransformation collects, uses, and protects customer and coaching data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-semibold tracking-[0.2em] uppercase text-orange-300/80 hover:text-orange-200 transition-colors">
          Back to Home
        </Link>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 sm:p-10 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-blue-200/70 mb-4">Effective Date: April 3, 2026</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Privacy Policy</h1>
          <p className="mt-5 text-lg leading-relaxed text-white/72 max-w-3xl">
            This Privacy Policy explains how iShowTransformation handles information collected through its website,
            coaching workflows, assessments, and account features. By using the platform, you acknowledge the
            collection and use of information as described below.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {privacySections.map((section) => (
            <section key={section.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 sm:p-8">
              <h2 className="text-2xl font-black text-white mb-3">{section.title}</h2>
              <p className="text-base leading-relaxed text-white/72">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-orange-400/20 bg-orange-500/10 p-6 sm:p-8">
          <h2 className="text-2xl font-black text-white mb-3">Questions About Privacy</h2>
          <p className="text-base leading-relaxed text-white/78">
            If you need help with a privacy request, account correction, or data deletion inquiry, contact the
            iShowTransformation coaching team through your account support channel or the official Instagram profile.
          </p>
        </div>
      </div>
    </main>
  );
}