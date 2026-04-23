import PublicMarketingLayout from "@/components/marketing/PublicMarketingLayout";

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

export default function PrivacyPage() {
  return (
    <PublicMarketingLayout
      title="Privacy Policy | iShowTransformation"
      description="How iShowTransformation collects, uses, and protects customer and coaching data."
    >
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-8 sm:p-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">Effective Date: April 3, 2026</p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Privacy Policy</h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">
              This Privacy Policy explains how iShowTransformation handles information collected through its website,
              coaching workflows, assessments, and account features. By using the platform, you acknowledge the
              collection and use of information as described below.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {privacySections.map((section) => (
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
