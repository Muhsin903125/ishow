import type { Metadata } from "next";
import Link from "next/link";

const termsSections = [
  {
    title: "Eligibility and Account Use",
    body: "You are responsible for maintaining accurate registration details and safeguarding access to your account. iShowTransformatio may suspend or terminate access if misuse, abuse, fraud, or unauthorized activity is detected.",
  },
  {
    title: "Coaching Scope",
    body: "Coaching plans, assessments, progress feedback, and communication are provided to support training and accountability. They are not medical treatment, diagnosis, or emergency care. You are responsible for seeking qualified medical advice when needed before beginning or modifying any exercise or nutrition plan.",
  },
  {
    title: "Billing, Renewals, and Cancellations",
    body: "Paid coaching plans are billed according to the offer selected at checkout. Unless otherwise stated in writing, coaching fees are charged in advance for the applicable billing period. Cancellation and refund decisions may depend on the active plan terms, completed coaching work, and applicable law.",
  },
  {
    title: "Client Responsibilities",
    body: "Results depend on your consistency, communication, adherence, and disclosed limitations. You agree to provide honest assessment details, follow safe training practices, and communicate relevant issues that may affect your plan or progress.",
  },
  {
    title: "Intellectual Property and Content",
    body: "Training plans, written coaching materials, program structures, and platform content remain the property of iShowTransformatio unless otherwise stated. They may not be copied, resold, redistributed, or republished without permission.",
  },
  {
    title: "Liability and Platform Changes",
    body: "The platform and coaching services are provided on an as-available basis. To the fullest extent permitted by law, iShowTransformatio is not liable for indirect, incidental, or consequential loss arising from use of the platform or coaching materials. Services, features, and pricing may be updated from time to time.",
  },
];

export const metadata: Metadata = {
  title: "Terms of Service | iShowTransformation",
  description: "Terms governing access to the iShowTransformation platform and coaching services.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-semibold tracking-[0.2em] uppercase text-orange-300/80 hover:text-orange-200 transition-colors">
          Back to Home
        </Link>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 sm:p-10 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-blue-200/70 mb-4">Effective Date: April 3, 2026</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Terms of Service</h1>
          <p className="mt-5 text-lg leading-relaxed text-white/72 max-w-3xl">
            These Terms of Service govern your access to the iShowTransformation website, customer dashboard,
            coaching plans, assessments, and related communication channels. By using the platform, you agree to
            these terms.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {termsSections.map((section) => (
            <section key={section.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 sm:p-8">
              <h2 className="text-2xl font-black text-white mb-3">{section.title}</h2>
              <p className="text-base leading-relaxed text-white/72">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-orange-400/20 bg-orange-500/10 p-6 sm:p-8">
          <h2 className="text-2xl font-black text-white mb-3">Need Clarification?</h2>
          <p className="text-base leading-relaxed text-white/78">
            Questions about billing, plan scope, or platform use should be raised before purchasing a coaching plan.
            You can contact the iShowTransformation coaching team through the official account contact channel listed on the site.
          </p>
        </div>
      </div>
    </main>
  );
}