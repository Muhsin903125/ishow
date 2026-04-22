"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getAssessment, submitAssessment } from "@/lib/db/assessments";
import { getGoalTypes, getLocations } from "@/lib/db/master";
import type { GoalType, Location } from "@/lib/db/master";
import { notify } from "@/lib/email/notify";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Target,
  Activity,
  MapPin,
  Flame,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const STEPS = ["Discovery", "Bio", "Logistics"];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", desc: "Just starting out", icon: "🌱" },
  { value: "intermediate", label: "Intermediate", desc: "1–3 years training", icon: "⚡" },
  { value: "advanced", label: "Advanced", desc: "3+ years consistency", icon: "🔥" },
];

const DAYS_OPTIONS = [
  { value: 2, label: "2–3 days", desc: "Sustainable" },
  { value: 4, label: "4–5 days", desc: "Dedicated" },
  { value: 6, label: "6–7 days", desc: "Hardcore" },
];

const TIME_OPTIONS = [
  { value: "morning", label: "Morning", desc: "Dawn patrol", icon: "🌅" },
  { value: "afternoon", label: "Afternoon", desc: "Midday grind", icon: "☀️" },
  { value: "evening", label: "Evening", desc: "Night owl", icon: "🌑" },
];

const FALLBACK_GOALS: GoalType[] = [
  { id: "weight_loss", slug: "weight_loss", name: "Weight Loss", description: "Lose fat & tighten up", icon: "Target", isActive: true, sortOrder: 1 },
  { id: "muscle_gain", slug: "muscle_gain", name: "Muscle Gain", description: "Hypertrophy focus", icon: "Dumbbell", isActive: true, sortOrder: 2 },
  { id: "athletic", slug: "athletic", name: "Athletic Performance", description: "Speed & explosiveness", icon: "Activity", isActive: true, sortOrder: 3 },
  { id: "general", slug: "general", name: "General Health", description: "Moving better daily", icon: "Sparkles", isActive: true, sortOrder: 4 },
];

export default function AssessmentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for back
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [checking, setChecking] = useState(true);

  // Master data
  const [goalTypes, setGoalTypes] = useState<GoalType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  // Form state
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(null);
  const [preferredTime, setPreferredTime] = useState("");
  const [healthConditions, setHealthConditions] = useState("");
  const [preferredLocationId, setPreferredLocationId] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }
    if (user.role === "trainer") { router.replace("/trainer/dashboard"); return; }
    if (user.role === "admin") { router.replace("/admin"); return; }

    (async () => {
      const existing = await getAssessment(user.id);
      if (existing) {
        router.replace("/dashboard");
        return;
      }
      const [goals, locs] = await Promise.all([getGoalTypes(), getLocations()]);
      setGoalTypes(goals);
      setLocations(locs);
      setChecking(false);
    })();
  }, [authLoading, user, router]);

  const nextStep = () => {
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const toggleGoal = (slug: string) => {
    setSelectedGoals((prev) =>
      prev.includes(slug) ? prev.filter((g) => g !== slug) : [...prev, slug]
    );
  };

  const canProceed = () => {
    if (step === 0) return selectedGoals.length > 0;
    if (step === 1) return experienceLevel !== "" && daysPerWeek !== null;
    if (step === 2) return preferredTime !== "";
    return false;
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await submitAssessment(user.id, {
        goals: selectedGoals,
        experienceLevel,
        daysPerWeek: daysPerWeek ?? 3,
        preferredTimes: preferredTime,
        healthConditions: healthConditions.trim() || undefined,
        preferredLocationId: preferredLocationId || undefined,
        preferredLocation: locations.find((l) => l.id === preferredLocationId)?.name,
        bodyMeasurements: {},
        medicalHistory: {},
      });

      notify("assessment-submitted", user.email, { name: user.name });

      setSubmitted(true);
      setTimeout(() => router.replace("/dashboard"), 3000);
    } catch {
      setSubmitting(false);
    }
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-orange-500" />
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-zinc-950 z-0" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm z-10"
        >
          <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/20">
            <CheckCircle className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">Profile Locked In</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            We&apos;re building your custom environment now. Preparing your dashboard...
          </p>
          <motion.div 
            className="mt-8 h-1 bg-zinc-900 rounded-full overflow-hidden"
          >
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5 }}
              className="h-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]"
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-[family-name:var(--font-dm)]">
      {/* Mesh Background */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
        
        {/* Left Side: Progress & Branding */}
        <div className="lg:col-span-4 flex flex-col justify-between py-4">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-12"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-black text-white italic">i</div>
              <span className="font-black text-white tracking-widest uppercase text-lg italic">
                iShow<span className="text-orange-500">Fit</span>
              </span>
            </motion.div>

            <div className="space-y-6">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-4 group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                    step === i 
                      ? "bg-orange-500 border-orange-500 text-white shadow-xl shadow-orange-500/30" 
                      : step > i 
                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-500" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-600"
                  }`}>
                    {step > i ? <CheckCircle className="w-5 h-5" /> : <span className="font-bold text-sm">{i + 1}</span>}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-black uppercase tracking-widest transition-colors ${
                      step === i ? "text-orange-500" : "text-zinc-600"
                    }`}>{s}</span>
                    <span className={`text-sm font-medium transition-colors ${
                      step === i ? "text-white" : "text-zinc-500"
                    }`}>
                      {i === 0 ? "Goal Definition" : i === 1 ? "User Profile" : "Training Logistics"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden lg:block p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Pro Tip</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Being detailed helps Mohammed build a more precise programming block for you.
            </p>
          </motion.div>
        </div>

        {/* Right Side: Form Content */}
        <div className="lg:col-span-8">
          <div className="bg-zinc-900/50 backdrop-blur-2xl border border-zinc-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col">
            
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="flex-1"
              >
                {/* Step 0: Goals */}
                {step === 0 && (
                  <div className="h-full">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Target className="w-6 h-6 text-orange-500" />
                      </div>
                      <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Main Objective</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(goalTypes.length > 0 ? goalTypes : FALLBACK_GOALS).map((g) => {
                        const slug = g.slug;
                        const active = selectedGoals.includes(slug);
                        return (
                          <button
                            key={slug}
                            onClick={() => toggleGoal(slug)}
                            className={`group relative text-left p-4 rounded-2xl border transition-all duration-300 ${
                              active
                                ? "bg-orange-500 border-orange-500 shadow-[0_10px_30px_rgba(249,115,22,0.15)]"
                                : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-sm font-black uppercase tracking-wider transition-colors ${
                                active ? "text-white" : "text-zinc-300"
                              }`}>
                                {g.name}
                              </span>
                              {active && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                            <span className={`text-xs block font-medium leading-relaxed transition-colors ${
                              active ? "text-orange-50" : "text-zinc-500"
                            }`}>
                              {g.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 1: About You */}
                {step === 1 && (
                  <div className="h-full">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Activity className="w-6 h-6 text-orange-500" />
                      </div>
                      <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Body & Baseline</h2>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 block">
                          Experience Level
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {EXPERIENCE_LEVELS.map((lvl) => (
                            <button
                              key={lvl.value}
                              onClick={() => setExperienceLevel(lvl.value)}
                              className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 ${
                                experienceLevel === lvl.value
                                  ? "bg-zinc-800 border-orange-500 shadow-xl"
                                  : "bg-zinc-900/40 border-zinc-800 hover:bg-zinc-800/40"
                              }`}
                            >
                              <span className="text-2xl mb-2">{lvl.icon}</span>
                              <span className={`text-xs font-black uppercase tracking-wider mb-1 ${
                                experienceLevel === lvl.value ? "text-white" : "text-zinc-400"
                              }`}>{lvl.label}</span>
                              <span className="text-[10px] text-zinc-600 font-bold">{lvl.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 block">
                            Commitment
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {DAYS_OPTIONS.map((d) => (
                              <button
                                key={d.value}
                                onClick={() => setDaysPerWeek(d.value)}
                                className={`py-3 px-1 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                  daysPerWeek === d.value
                                    ? "bg-orange-500 border-orange-500 text-white"
                                    : "bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:bg-zinc-800/40"
                                }`}
                              >
                                {d.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 block">
                            Health Constraints
                          </label>
                          <input
                            type="text"
                            value={healthConditions}
                            onChange={(e) => setHealthConditions(e.target.value)}
                            placeholder="Any injuries?"
                            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Logistics */}
                {step === 2 && (
                  <div className="h-full">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Flame className="w-6 h-6 text-orange-500" />
                      </div>
                      <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Final Logistics</h2>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 block">
                          Preferred Launch Time
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {TIME_OPTIONS.map((t) => (
                            <button
                              key={t.value}
                              onClick={() => setPreferredTime(t.value)}
                              className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 ${
                                preferredTime === t.value
                                  ? "bg-orange-500 border-orange-500 text-white"
                                  : "bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:bg-zinc-800/40"
                              }`}
                            >
                              <span className="text-2xl mb-2">{t.icon}</span>
                              <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {locations.length > 0 && (
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 block">
                            Base Camp (Location)
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {locations.map((loc) => (
                              <button
                                key={loc.id}
                                onClick={() => setPreferredLocationId(loc.id)}
                                className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-black uppercase tracking-wider transition-all ${
                                  preferredLocationId === loc.id
                                    ? "bg-zinc-800 border-orange-500 text-white"
                                    : "bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:bg-zinc-800/40"
                                }`}
                              >
                                <MapPin className={`w-4 h-4 ${preferredLocationId === loc.id ? "text-orange-500" : "text-zinc-700"}`} />
                                <span className="truncate">{loc.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Nav Footer */}
            <div className="mt-auto pt-8 flex items-center justify-between border-t border-zinc-800/50">
              <button
                onClick={prevStep}
                disabled={step === 0}
                className={`flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] transition-all ${
                  step === 0 ? "opacity-0 pointer-events-none" : "text-zinc-500 hover:text-white"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex gap-1.5 lg:hidden">
                {STEPS.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-300 ${
                    step === i ? "w-8 bg-orange-500" : "w-2 bg-zinc-800"
                  }`} />
                ))}
              </div>

              {step < STEPS.length - 1 ? (
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] disabled:opacity-20 transition-all hover:bg-orange-500 hover:text-white group"
                >
                  Next Stage
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || submitting}
                  className="flex items-center gap-3 bg-orange-500 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] disabled:opacity-40 transition-all hover:bg-orange-600 shadow-xl shadow-orange-500/20 group"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      Launch Now
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
