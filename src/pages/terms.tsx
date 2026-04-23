import PublicMarketingLayout from "@/components/marketing/PublicMarketingLayout";

const termsSections = [
  {
    title: "Eligibility and Account Use",
    body: "You are responsible for maintaining accurate registration details and safeguarding access to your account. iShowTransformation may suspend or terminate access if misuse, abuse, fraud, or unauthorized activity is detected.",
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
    body: "Training plans, written coaching materials, program structures, and platform content remain the property of iShowTransformation unless otherwise stated. They may not be copied, resold, redistributed, or republished without permission.",
  },
  {
    title: "Liability and Platform Changes",
    body: "The platform and coaching services are provided on an as-available basis. To the fullest extent permitted by law, iShowTransformation is not liable for indirect, incidental, or consequential loss arising from use of the platform or coaching materials. Services, features, and pricing may be updated from time to time.",
  },
];

export default function TermsPage() {
  return (
    <PublicMarketingLayout
      title="Terms of Service | iShowTransformation"
      description="Terms governing access to the iShowTransformation platform and coaching services."
    >
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10 backdrop-blur-sm">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">Effective Date: April 3, 2026</p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Terms of Service</h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">
              These Terms of Service govern your access to the iShowTransformation website, customer dashboard,
              coaching plans, assessments, and related communication channels. By using the platform, you agree to
              these terms.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {termsSections.map((section) => (
              <section key={section.title} className="rounded-[1.75rem] border border-slate-200/80 bg-white/92 p-6 shadow-sm sm:p-8">
                <h2 className="mb-3 text-2xl font-black text-slate-950">{section.title}</h2>
                <p className="text-base leading-relaxed text-slate-600">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
    </PublicMarketingLayout>
  );
}
