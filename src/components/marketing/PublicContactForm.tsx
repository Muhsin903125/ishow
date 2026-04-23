import { useState } from "react";
import { LoaderCircle, SendHorizonal } from "lucide-react";
import { submitPublicContactEnquiry } from "@/lib/api/site-content";

type PublicContactFormProps = {
  title: string;
  intro?: string;
  buttonLabel?: string;
  successMessage?: string;
};

const initialForm = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export default function PublicContactForm({
  title,
  intro,
  buttonLabel,
  successMessage,
}: PublicContactFormProps) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await submitPublicContactEnquiry({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        message: form.message,
      });

      setSuccess(successMessage || response.message);
      setForm(initialForm);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to send your enquiry right now."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="max-w-2xl">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-500">
          Open Enquiry
        </p>
        <h2 className="mt-4 text-3xl font-extrabold uppercase tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h2>
        {intro ? (
          <p className="mt-4 text-base leading-relaxed text-slate-600">{intro}</p>
        ) : null}
      </div>

      <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
            Name
          </span>
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition-colors focus:border-orange-400"
            placeholder="Your name"
            required
          />
        </label>

        <label className="grid gap-2">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
            Email
          </span>
          <input
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition-colors focus:border-orange-400"
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="grid gap-2 md:col-span-2">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
            Phone
          </span>
          <input
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition-colors focus:border-orange-400"
            placeholder="+971 ..."
          />
        </label>

        <label className="grid gap-2 md:col-span-2">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
            Message
          </span>
          <textarea
            value={form.message}
            onChange={(event) =>
              setForm((current) => ({ ...current, message: event.target.value }))
            }
            className="min-h-[160px] rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition-colors focus:border-orange-400"
            placeholder="Tell us what kind of help you need."
            required
          />
        </label>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 md:col-span-2">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 md:col-span-2">
            {success}
          </div>
        ) : null}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {submitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
            {buttonLabel || "Send Enquiry"}
          </button>
        </div>
      </form>
    </section>
  );
}
