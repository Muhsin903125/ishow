"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getItems, addItem } from "@/lib/storage";
import type { Assessment } from "@/lib/mockData";
import { Dumbbell, CheckCircle, Loader2, Clock, ChevronRight, ChevronLeft } from "lucide-react";

const daysMap: Record<string, number> = { "2-3": 2, "4-5": 4, "6-7": 6 };

const GOALS = [
  { value: "weight_loss",          label: "Weight Loss",          emoji: "🔥" },
  { value: "muscle_gain",          label: "Muscle Gain",          emoji: "💪" },
  { value: "general_fitness",      label: "General Fitness",      emoji: "⚡" },
  { value: "athletic_performance", label: "Athletic Performance", emoji: "🏆" },
];

const LEVELS = [
  { value: "beginner",     label: "Beginner",     desc: "Just starting out" },
  { value: "intermediate", label: "Intermediate", desc: "Some experience" },
  { value: "advanced",     label: "Advanced",     desc: "Regular trainer" },
];

const DAYS = [
  { value: "2-3", label: "2–3 days" },
  { value: "4-5", label: "4–5 days" },
  { value: "6-7", label: "6–7 days" },
];

const TIMES = [
  { value: "morning",   label: "Morning",   sub: "5 am – 12 pm" },
  { value: "afternoon", label: "Afternoon", sub: "12 pm – 5 pm" },
  { value: "evening",   label: "Evening",   sub: "5 pm – 9 pm" },
];

const STEPS = [
  { title: "What's your goal?",        sub: "Pick the one that fits best" },
  { title: "Your fitness background",  sub: "Level & availability" },
  { title: "When do you train?",       sub: "Pick a preferred time" },
];

export default function AssessmentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingAssessment, setExistingAssessment] = useState<Assessment | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [form, setForm] = useState({
    goal: "",
    experienceLevel: "",
    daysPerWeek: "",
    preferredTime: "",
    healthConditions: "",
  });

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push("/login"); return; }
      if (user.role !== "customer") { router.push("/trainer/dashboard"); return; }
      const existing = getItems<Assessment>("ishow_assessments").find((a) => a.userId === user.id) ?? null;
      setExistingAssessment(existing);
      setDataLoaded(true);
    }
  }, [user, loading, router]);

  const canNext = [
    form.goal !== "",
    form.experienceLevel !== "" && form.daysPerWeek !== "",
    form.preferredTime !== "",
  ];

  const handleSubmit = () => {
    if (!user) return;
    setSubmitting(true);
    addItem<Assessment>("ishow_assessments", {
      id: `assessment_${Date.now()}`,
      userId: user.id,
      goals: [form.goal],
      experienceLevel: form.experienceLevel,
      healthConditions: form.healthConditions || "None",
      daysPerWeek: daysMap[form.daysPerWeek] ?? 3,
      preferredTimes: form.preferredTime,
      status: "pending",
      submittedAt: new Date().toISOString(),
    });
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  };

  // ── Loading ──────────────────────────────────────────────────
  if (loading || !dataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  // ── Already submitted ────────────────────────────────────────
  if (existingAssessment && !submitted) {
    const reviewed = existingAssessment.status === "reviewed";
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">iShow<span className="text-orange-400">Fitness</span></span>
          </Link>
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${reviewed ? "bg-green-100" : "bg-yellow-100"}`}>
              {reviewed
                ? <CheckCircle className="w-7 h-7 text-green-600" />
                : <Clock className="w-7 h-7 text-yellow-600" />}
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">
              {reviewed ? "Assessment Reviewed!" : "Under Review"}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {reviewed
                ? "Your trainer has reviewed your assessment and prepared your plan."
                : "Your trainer will review this and reach out with your personalised plan."}
            </p>
            {reviewed && existingAssessment.trainerNotes && (
              <div className="bg-blue-50 rounded-xl p-4 mb-5 text-left">
                <p className="text-xs font-semibold text-blue-900 mb-1">Trainer&apos;s Notes</p>
                <p className="text-sm text-blue-700 italic">&ldquo;{existingAssessment.trainerNotes}&rdquo;</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-left mb-6 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 font-medium mb-0.5">Goal</p>
                <p className="font-semibold text-gray-900 capitalize">{existingAssessment.goals[0]?.replace(/_/g, " ")}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 font-medium mb-0.5">Experience</p>
                <p className="font-semibold text-gray-900 capitalize">{existingAssessment.experienceLevel}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 font-medium mb-0.5">Days / Week</p>
                <p className="font-semibold text-gray-900">{existingAssessment.daysPerWeek} days</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 font-medium mb-0.5">Time</p>
                <p className="font-semibold text-gray-900 capitalize">{existingAssessment.preferredTimes}</p>
              </div>
            </div>
            <Link href="/dashboard" className="inline-block w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold text-sm transition-colors">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-sm w-full">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">All done!</h2>
          <p className="text-gray-500 text-sm">Your trainer will review and build your plan. Redirecting…</p>
        </div>
      </div>
    );
  }

  // ── Stepper form ─────────────────────────────────────────────
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">iShow<span className="text-orange-400">Fitness</span></span>
        </Link>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm font-semibold">Step {step + 1} of {STEPS.length}</span>
            <span className="text-slate-400 text-xs">{Math.round(progress)}% complete</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-between mt-3">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-2 h-2 rounded-full transition-all ${i <= step ? "bg-orange-400" : "bg-slate-600"}`} />
                <span className={`text-xs hidden sm:block transition-colors ${i === step ? "text-white font-medium" : "text-slate-500"}`}>
                  {s.title.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Card header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100">
            <h1 className="text-xl font-black text-gray-900">{STEPS[step].title}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{STEPS[step].sub}</p>
          </div>

          {/* Card body */}
          <div className="px-6 py-5">

            {/* ── Step 0: Goal ── */}
            {step === 0 && (
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, goal: g.value }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      form.goal === g.value
                        ? "border-blue-700 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-2xl mb-2">{g.emoji}</div>
                    <p className={`text-sm font-semibold leading-tight ${form.goal === g.value ? "text-blue-700" : "text-gray-800"}`}>
                      {g.label}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* ── Step 1: Level + Days ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Experience Level</p>
                  <div className="space-y-2">
                    {LEVELS.map((l) => (
                      <button
                        key={l.value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, experienceLevel: l.value }))}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                          form.experienceLevel === l.value
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          form.experienceLevel === l.value ? "border-orange-500" : "border-gray-300"
                        }`}>
                          {form.experienceLevel === l.value && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                        </div>
                        <div className="text-left">
                          <p className={`text-sm font-semibold ${form.experienceLevel === l.value ? "text-orange-700" : "text-gray-800"}`}>{l.label}</p>
                          <p className="text-xs text-gray-400">{l.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Days per Week</p>
                  <div className="grid grid-cols-3 gap-2">
                    {DAYS.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, daysPerWeek: d.value }))}
                        className={`py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                          form.daysPerWeek === d.value
                            ? "border-blue-700 bg-blue-700 text-white"
                            : "border-gray-200 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Time + Health ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Preferred Time</p>
                  <div className="space-y-2">
                    {TIMES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, preferredTime: t.value }))}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                          form.preferredTime === t.value
                            ? "border-blue-700 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span className={`text-sm font-semibold ${form.preferredTime === t.value ? "text-blue-700" : "text-gray-800"}`}>{t.label}</span>
                        <span className="text-xs text-gray-400">{t.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                    Injuries / health conditions <span className="normal-case font-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.healthConditions}
                    onChange={(e) => setForm((p) => ({ ...p, healthConditions: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. lower back pain, knee injury"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card footer — nav buttons */}
          <div className="px-6 pb-6 flex items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext[step]}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canNext[step] || submitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><CheckCircle className="w-4 h-4" /> Submit</>}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          You can always update details when you meet your trainer.
        </p>
      </div>
    </div>
  );
}
