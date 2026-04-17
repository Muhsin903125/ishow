"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getAssessment, submitAssessment } from "@/lib/db/assessments";
import { getLocations, getGoalTypes, type Location, type GoalType } from "@/lib/db/master";
import { notify } from "@/lib/email/notify";
import DashboardLayout from "@/components/DashboardLayout";
import { CheckCircle, Loader2, Send } from "lucide-react";

const GOALS_FALLBACK = [
  "Weight Loss", "Muscle Gain", "Strength Training", "Improved Endurance",
  "Flexibility & Mobility", "Athletic Performance", "General Fitness", "Rehabilitation",
];

const LOCATIONS_FALLBACK = [
  "Dubai Sports City Gym", "Abu Dhabi Performance Centre", "JLT Fitness Hub",
  "Jumeirah Beach Fitness Club", "Mirdif Community Gym", "Other / Online",
];

const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Athlete"];

const DAYS = [2, 3, 4, 5, 6];

const TIME_SLOTS = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM",
];

const MEDICAL_CONDITIONS = [
  "Lower back issues", "Knee problems", "Shoulder injury", "Heart condition",
  "Diabetes", "Hypertension", "Asthma", "Joint pain / Arthritis",
];

type Form = {
  age: string;
  gender: "male" | "female" | "prefer_not_to_say" | "";
  weight: string;
  height: string;
  goals: string[];
  experienceLevel: string;
  daysPerWeek: string;
  preferredDate: string;
  preferredTimeSlot: string;
  preferredLocation: string;
  medicalConditions: string[];
  otherHealth: string;
};

function blank(): Form {
  return {
    age: "", gender: "", weight: "", height: "", goals: [],
    experienceLevel: "", daysPerWeek: "3",
    preferredDate: "", preferredTimeSlot: "", preferredLocation: "",
    medicalConditions: [], otherHealth: "",
  };
}

function toggle(arr: string[], v: string) {
  return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all ${
        active
          ? "border-orange-500/60 bg-orange-500/15 text-orange-300"
          : "border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
      }`}
    >
      {active && <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">{children}</p>;
}

function Input({ label, type = "text", value, onChange, placeholder, min }: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; min?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} min={min}
        className="w-full rounded-xl bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10 transition"
      />
    </div>
  );
}

export default function AssessmentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [goalTypes, setGoalTypes] = useState<GoalType[]>([]);
  const [form, setForm] = useState<Form>(blank());

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (!authLoading && user) {
      if (user.role !== 'customer') {
        router.push(user.role === 'admin' ? '/admin/dashboard' : '/trainer/dashboard');
        return;
      }
      const init = async () => {
        const [existing, locs, goals] = await Promise.all([
          getAssessment(user.id),
          getLocations(true),
          getGoalTypes(true),
        ]);
        if (existing) { router.push("/dashboard"); return; }
        setLocations(locs);
        setGoalTypes(goals);
        setChecking(false);
      };
      init();
    }
  }, [authLoading, user, router]);

  function set<K extends keyof Form>(field: K, value: Form[K]) {
    setForm(f => ({ ...f, [field]: value }));
  }

  const goalList = goalTypes.length > 0 ? goalTypes.map(g => g.name) : GOALS_FALLBACK;
  const locationList = locations.length > 0 ? locations.map(l => l.name) : LOCATIONS_FALLBACK;

  const canSubmit = form.age && form.gender && form.weight && form.height &&
    form.goals.length > 0 && form.experienceLevel &&
    form.preferredDate && form.preferredTimeSlot && form.preferredLocation;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !canSubmit) return;
    setError('');
    setSubmitting(true);
    try {
      await submitAssessment(user.id, {
        age: parseInt(form.age),
        gender: form.gender as "male" | "female" | "prefer_not_to_say",
        weight: form.weight,
        height: form.height,
        goals: form.goals,
        experienceLevel: form.experienceLevel,
        daysPerWeek: parseInt(form.daysPerWeek),
        preferredDate: form.preferredDate,
        preferredTimeSlot: form.preferredTimeSlot,
        preferredLocation: form.preferredLocation,
        healthConditions: [
          ...form.medicalConditions,
          form.otherHealth.trim() ? `Other: ${form.otherHealth.trim()}` : "",
        ].filter(Boolean).join(", ") || undefined,
        medicalHistory: {
          conditions: form.medicalConditions,
          other: form.otherHealth.trim() || undefined,
        },
      });
      // Notify user by email (non-blocking)
      if (user.email) {
        notify('assessment-submitted', user.email, { name: user.name ?? user.email });
      }
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (checking || authLoading) {
    return (
      <DashboardLayout role="CUSTOMER">
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="min-h-full bg-zinc-950">
        <div className="max-w-2xl p-6 lg:p-8">

          {/* Header */}
          <div className="mb-8">
            <p className="text-orange-500 text-xs font-bold tracking-[0.3em] uppercase mb-1.5">New Request</p>
            <h1 className="text-3xl font-black text-white tracking-tight">Assessment Request</h1>
            <p className="text-zinc-500 text-sm mt-2">Fill in your details so your trainer can design the perfect plan.</p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Personal Info */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
              <SectionLabel>Personal Info</SectionLabel>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Age *" type="number" value={form.age} onChange={v => set("age", v)} placeholder="28" min="13" />
                <Input label="Weight *" value={form.weight} onChange={v => set("weight", v)} placeholder="75 kg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Height *" value={form.height} onChange={v => set("height", v)} placeholder="175 cm" />
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Gender *</label>
                  <div className="flex flex-col gap-2">
                    {(["male", "female", "prefer_not_to_say"] as const).map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => set("gender", g)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all text-left ${
                          form.gender === g
                            ? "border-orange-500/60 bg-orange-500/15 text-orange-300"
                            : "border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                        }`}
                      >
                        {g === "prefer_not_to_say" ? "Prefer not to say" : g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Goals */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
              <SectionLabel>Fitness Goals * (select all that apply)</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {goalList.map(goal => (
                  <Chip key={goal} active={form.goals.includes(goal)} onClick={() => set("goals", toggle(form.goals, goal))}>
                    {goal}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Experience & Schedule */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-5">
              <SectionLabel>Experience & Schedule</SectionLabel>

              <div>
                <p className="text-xs font-semibold text-zinc-400 mb-2">Experience Level *</p>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map(l => (
                    <Chip key={l} active={form.experienceLevel === l} onClick={() => set("experienceLevel", l)}>{l}</Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-400 mb-2">Training days per week</p>
                <div className="flex gap-2">
                  {DAYS.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => set("daysPerWeek", String(d))}
                      className={`w-11 h-11 rounded-xl border text-sm font-bold transition-all ${
                        form.daysPerWeek === String(d)
                          ? "border-orange-500/60 bg-orange-500/15 text-orange-300"
                          : "border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Session Preferences */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-5">
              <SectionLabel>Session Preferences</SectionLabel>

              <Input
                label="Preferred Start Date *"
                type="date"
                value={form.preferredDate}
                onChange={v => set("preferredDate", v)}
                min={new Date().toISOString().split("T")[0]}
              />

              <div>
                <p className="text-xs font-semibold text-zinc-400 mb-2">Preferred Time *</p>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => set("preferredTimeSlot", slot)}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        form.preferredTimeSlot === slot
                          ? "border-orange-500/60 bg-orange-500/15 text-orange-300"
                          : "border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-400 mb-2">Location *</p>
                <div className="flex flex-col gap-2">
                  {locationList.map(loc => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => set("preferredLocation", loc)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all ${
                        form.preferredLocation === loc
                          ? "border-orange-500/60 bg-orange-500/15 text-orange-300"
                          : "border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                      }`}
                    >
                      {form.preferredLocation === loc && <CheckCircle className="w-4 h-4 shrink-0" />}
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Health (optional) */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
              <SectionLabel>Health & Injuries <span className="normal-case font-normal text-zinc-600">(optional)</span></SectionLabel>
              <div className="flex flex-wrap gap-2">
                {MEDICAL_CONDITIONS.map(cond => (
                  <Chip
                    key={cond}
                    active={form.medicalConditions.includes(cond)}
                    onClick={() => set("medicalConditions", toggle(form.medicalConditions, cond))}
                  >
                    {cond}
                  </Chip>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Other notes</label>
                <textarea
                  value={form.otherHealth}
                  onChange={e => set("otherHealth", e.target.value)}
                  rows={2}
                  placeholder="Any other conditions your trainer should know about…"
                  className="w-full rounded-xl bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10 transition resize-none"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 py-4 text-sm font-black text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
            >
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting request…</>
                : <><Send className="w-4 h-4" />Submit Assessment Request</>
              }
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
