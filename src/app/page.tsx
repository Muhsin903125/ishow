import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Dumbbell,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Zap,
  Heart,
  Trophy,
  Flame,
  Target,
  Activity,
  Shield,
  ChevronRight,
  ChevronDown,
  ClipboardList,
  ExternalLink,
} from "lucide-react";

// --- DATA ---

const marqueeItems = [
  "STRENGTH", "ENDURANCE", "CONDITIONING", "NUTRITION",
  "PERFORMANCE", "RECOVERY", "MINDSET", "DISCIPLINE",
];

const services = [
  {
    icon: Dumbbell,
    title: "Programming That Fits",
    description: "Training blocks built around your schedule, goal, and recovery capacity.",
    eyebrow: "Execution",
    detail: "Split design, exercise selection, progression",
    accent: "from-orange-500/20 via-orange-500/5 to-transparent",
    marker: "01",
  },
  {
    icon: Heart,
    title: "Nutrition Direction",
    description: "Simple calorie and meal guidance that supports fat loss, muscle gain, and recovery without overcomplication.",
    eyebrow: "Fuel",
    detail: "Targets, adjustments, sustainability",
    accent: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    marker: "02",
  },
  {
    icon: TrendingUp,
    title: "Visible Progress Tracking",
    description: "Your check-ins, habits, and milestones stay measurable so the process stays motivating.",
    eyebrow: "Feedback",
    detail: "Weekly review, dashboard visibility, momentum",
    accent: "from-blue-500/20 via-blue-500/5 to-transparent",
    marker: "03",
  },
  {
    icon: Users,
    title: "Coach Accountability",
    description: "Regular follow-up keeps training decisions active and makes it harder to drift away from the plan.",
    eyebrow: "Support",
    detail: "Direct follow-up, clearer standards, consistency",
    accent: "from-orange-400/20 via-blue-500/5 to-transparent",
    marker: "04",
  },
];

const heroHighlights = [
  {
    title: "Assessment first",
    description: "Start with your real baseline before the plan begins.",
  },
  {
    title: "Custom programming",
    description: "Your training fits your lifestyle instead of fighting it.",
  },
  {
    title: "Coach follow-up",
    description: "Stay accountable with clear direction from week to week.",
  },
];

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Register & Assess",
    focus: "Goals + current baseline",
    outcome: "You leave the first step with a clear starting point and direction.",
    description: "Create your account and complete a detailed fitness assessment to help us understand your goals.",
  },
  {
    number: "02",
    icon: Target,
    title: "Get Your Plan",
    focus: "Coach-built roadmap",
    outcome: "Your training is shaped around your lifestyle instead of a generic template.",
    description: "Your expert trainer reviews your profile and designs a fully custom program built for you.",
  },
  {
    number: "03",
    icon: Activity,
    title: "Start Training",
    focus: "Daily execution",
    outcome: "Each session, program, and task stays visible inside your dashboard.",
    description: "Access your sessions, weekly programs, and daily activities via your personal dashboard.",
  },
  {
    number: "04",
    icon: Trophy,
    title: "Transform & Grow",
    focus: "Momentum that compounds",
    outcome: "Progress becomes measurable, motivating, and easier to sustain over time.",
    description: "Track your progress, dominate your milestones, and watch your transformation unfold.",
  },
];

const journeyHighlights = [
  { value: "4", label: "focused stages" },
  { value: "1", label: "tailored roadmap" },
  { value: "Live", label: "progress tracking" },
];

const programs = [
  {
    name: "Foundation",
    price: 99,
    tag: "Start Here" as string | null,
    sessions: "3-day plan + assessment",
    summary: "A clear starting point for building routine, improving form, and creating early momentum.",
    bestFor: "Beginners and restart clients",
    featured: false,
    features: [
      "Fitness assessment and goal mapping",
      "3-day structured workout split",
      "Habit targets with dashboard tracking",
      "Weekly progress check-in",
    ],
    marker: "01",
    paceLabel: "Build routine first",
    surface: "from-orange-500/18 via-orange-500/8 to-transparent",
    barAccent: "from-orange-500 via-yellow-400",
    bars: [36, 58, 78],
    cta: "Build My Foundation",
  },
  {
    name: "Transformation",
    price: 199,
    tag: "Most Popular" as string | null,
    sessions: "4-day plan + weekly coaching",
    summary: "The core iShowTransformatio package for fat loss, muscle gain, and consistent weekly progress.",
    bestFor: "Clients who want structure and accountability",
    featured: true,
    features: [
      "Everything in Foundation",
      "Custom nutrition targets",
      "Weekly trainer plan updates",
      "Video form analysis",
      "WhatsApp support",
    ],
    marker: "02",
    paceLabel: "Drive visible change",
    surface: "from-blue-500/18 via-orange-500/10 to-transparent",
    barAccent: "from-blue-500 via-orange-400",
    bars: [52, 76, 94],
    cta: "Choose Transformation",
  },
  {
    name: "Elite Accountability",
    price: 299,
    tag: "Highest Support" as string | null,
    sessions: "5-day plan + priority access",
    summary: "Closer coaching, faster adjustments, and tighter accountability for ambitious transformation goals.",
    bestFor: "Busy clients chasing faster progress",
    featured: false,
    features: [
      "Everything in Transformation",
      "Priority trainer responses",
      "Advanced progression programming",
      "Recovery and lifestyle coaching",
      "Monthly strategy review",
    ],
    marker: "03",
    paceLabel: "Highest support level",
    surface: "from-orange-500/18 via-yellow-500/10 to-transparent",
    barAccent: "from-orange-500 via-yellow-400",
    bars: [68, 88, 100],
    cta: "Go Elite",
  },
];

const trainerSnapshot = [
  {
    label: "Coaching focus",
    value: "Strength, conditioning, and body recomposition",
  },
  {
    label: "Support style",
    value: "High-accountability follow-up with weekly adjustments",
  },
  {
    label: "Primary contact",
    value: "Instagram @sufiyan_mohd26",
  },
];

const trainerPillars = [
  {
    icon: ClipboardList,
    title: "Assessment before intensity",
    description: "Training starts by understanding your routine, current level, and target result before volume or intensity ramps up.",
  },
  {
    icon: Calendar,
    title: "Weekly structure that adapts",
    description: "Your plan is built to move with real life, so consistency stays possible even when the week changes around you.",
  },
  {
    icon: Users,
    title: "Direct accountability",
    description: "Mohammed keeps the process active with follow-up, check-ins, and clear expectations around execution.",
  },
];

const trainerPromises = [
  "Assessment-led programming instead of generic workout templates.",
  "Clear weekly direction so every session has a purpose.",
  "A coaching relationship built around accountability and repeatable progress.",
  "Direct Instagram access for closer communication and follow-through.",
];

// --- PAGE ---

export default function LandingPage() {
  return (
    <div className="landing-shell min-h-screen overflow-x-hidden bg-white">
      <Navbar />

      {/* 1. HERO */}
      <section className="landing-section relative flex min-h-screen items-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.24),transparent_26%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_32%),linear-gradient(135deg,#020617_0%,#0f172a_46%,#020617_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.12]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.16)_55%,rgba(2,6,23,0.84)_100%)]" />
        <div className="absolute top-1/4 right-1/3 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />
        <div className="pointer-events-none absolute right-[-12rem] top-24 hidden h-[34rem] w-[34rem] rounded-full border border-white/10 bg-white/5 blur-[2px] xl:block" />
        <div className="pointer-events-none absolute right-20 top-1/2 hidden h-72 w-72 -translate-y-1/2 rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-md xl:block" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-36">
          <div className="max-w-3xl landing-reveal landing-delay-1">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 backdrop-blur-sm rounded-full px-5 py-2.5 mb-8">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-orange-300 text-sm font-semibold tracking-widest uppercase">Coach-Led Transformation</span>
            </div>

            <h1 className="text-7xl sm:text-8xl lg:text-[108px] font-black leading-[0.88] tracking-tighter text-white mb-7">
              FORGE
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-400">
                YOUR BEST
              </span>
              SELF.
            </h1>

            <p className="text-xl lg:text-2xl text-white/60 max-w-2xl mb-10 leading-relaxed font-light">
              iShowTransformatio gives you structured coaching from Mohammed Sufiyan, a clear plan,
              and the accountability needed to turn effort into visible progress.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 group"
              >
                Start Free Assessment
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/#programs"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-full font-bold text-lg transition-all backdrop-blur-sm"
              >
                Explore Programs
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex flex-wrap gap-8 pt-8 border-t border-white/10">
              {heroHighlights.map((item) => (
                <div key={item.title} className="max-w-[220px]">
                  <p className="text-base font-black uppercase tracking-[0.18em] text-white">{item.title}</p>
                  <p className="text-white/45 text-sm mt-2 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="landing-reveal landing-delay-3 hidden xl:flex flex-col gap-4 absolute right-8 top-1/2 -translate-y-1/2">
            {[
              { icon: ClipboardList, bg: "bg-orange-500/25", ic: "text-orange-400", title: "Assessment-Led Start", sub: "Goals, baseline, and constraints first" },
              { icon: Target,        bg: "bg-green-500/25",  ic: "text-green-400",  title: "Custom Programming",   sub: "Weekly structure built around your routine" },
              { icon: Users,         bg: "bg-blue-500/25",   ic: "text-blue-400",   title: "Coach Accountability", sub: "Direct follow-up from Mohammed Sufiyan" },
            ].map((card, ci) => {
              const Icon = card.icon;
              return (
                <div key={ci} className="landing-panel animate-float bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4 w-64 shadow-2xl">
                  <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${card.ic}`} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{card.title}</p>
                    <p className="text-white/50 text-xs">{card.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="landing-reveal landing-delay-2 absolute bottom-14 right-8 hidden xl:block">
            <div className="landing-panel relative w-80 rounded-[2rem] border border-white/10 bg-black/35 p-6 backdrop-blur-xl shadow-2xl">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-orange-500/10 via-transparent to-blue-500/10" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-orange-300/80 mb-4">Coaching Flow</p>
                <div className="space-y-3">
                  {[
                    { label: "Assessment", value: "01" },
                    { label: "Programming", value: "02" },
                    { label: "Accountability", value: "03" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <span className="text-sm font-medium text-white/80">{item.label}</span>
                      <span className="text-xl font-black text-white/30">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <ChevronDown className="w-6 h-6 text-white" />
        </div>
      </section>

      {/* 2. MARQUEE */}
      <div className="bg-orange-500 py-4 overflow-hidden select-none">
        <div className="animate-marquee whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-4 mx-6 text-white font-black text-lg tracking-[0.2em]">
              <span className="w-2 h-2 rounded-full bg-white/50 inline-block" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* 3. SERVICES */}
      <section id="services" className="landing-section py-28 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 landing-reveal landing-delay-1">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-4">
              <Trophy className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 text-sm font-semibold tracking-widest uppercase">Inside The Experience</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black mb-4">
              What Coaching
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                Actually Covers
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Programming, nutrition direction, accountability, and progress tracking built around one clear target: sustainable transformation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc, index) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.title}
                  className="landing-panel landing-reveal group relative overflow-hidden rounded-3xl aspect-[3/4] border border-white/10 bg-[#0b1220]"
                  style={{ animationDelay: `${0.12 + index * 0.08}s` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${svc.accent}`} />
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.08]" />
                  <div className="absolute -right-5 top-6 opacity-[0.08]">
                    <Icon className="h-28 w-28 text-white" />
                  </div>
                  <div className="relative flex h-full flex-col justify-between p-6">
                    <div className="flex items-start justify-between gap-4">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/65">
                        {svc.eyebrow}
                      </span>
                      <span className="text-6xl font-black leading-none text-white/10">{svc.marker}</span>
                    </div>

                    <div>
                      <div className="w-12 h-12 rounded-xl bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-orange-300" />
                      </div>
                      <h3 className="font-black text-white text-xl mb-2">{svc.title}</h3>
                      <p className="text-gray-300 text-sm leading-relaxed max-w-xs mb-4">
                        {svc.description}
                      </p>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                        {svc.detail}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="landing-section relative overflow-hidden bg-neutral-950 py-28 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.24),transparent_36%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:88px_88px] opacity-[0.08]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div className="landing-reveal landing-delay-1 lg:sticky lg:top-28 self-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 mb-6 backdrop-blur-sm">
                <Calendar className="w-4 h-4 text-orange-300" />
                <span className="text-orange-200 text-sm font-semibold tracking-[0.24em] uppercase">The Process</span>
              </div>

              <h2 className="text-5xl lg:text-7xl font-black leading-[0.92] tracking-tight mb-6">
                Simple Path to
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-blue-400">
                  Transformation
                </span>
              </h2>

              <p className="max-w-xl text-lg text-white/70 leading-relaxed mb-8">
                This is built to feel clear from day one: understand your baseline, get a plan that fits your life,
                train with structure, and watch momentum stack into visible results.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                {journeyHighlights.map((highlight, index) => (
                  <div
                    key={highlight.label}
                    className="landing-panel rounded-3xl border border-white/10 bg-white/5 px-5 py-6 backdrop-blur-sm"
                    style={{ animationDelay: `${0.1 + index * 0.06}s` }}
                  >
                    <p className="text-3xl font-black text-white">{highlight.value}</p>
                    <p className="mt-2 text-sm text-white/55">{highlight.label}</p>
                  </div>
                ))}
              </div>

              <div className="landing-panel rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-orange-200/80 mb-4">What Changes</p>
                <div className="space-y-4">
                  {[
                    "You know exactly where to begin instead of guessing.",
                    "Your program is shaped around your schedule and goals.",
                    "Progress stays visible, measurable, and motivating.",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                      <p className="text-sm leading-relaxed text-white/72">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-8 py-4 text-lg font-bold text-white transition-all shadow-lg shadow-orange-500/25 hover:-translate-y-0.5 hover:bg-orange-400"
                >
                  Start Free Assessment
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/#programs"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/10"
                >
                  Explore Programs
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-8 top-4 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-orange-400 via-white/15 to-blue-400 sm:block" />

              <div className="space-y-5">
                {steps.map((step, i) => {
                  const Icon = step.icon;

                  return (
                    <article
                      key={step.number}
                      className={`landing-panel landing-reveal relative overflow-hidden rounded-[2rem] border border-white/10 p-6 sm:p-8 ${
                        i % 2 === 0 ? "bg-white/5 sm:mr-12" : "bg-white/10 sm:ml-12"
                      }`}
                      style={{ animationDelay: `${0.14 + i * 0.08}s` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/8 via-transparent to-transparent opacity-40" />

                      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
                        <div className="flex items-center gap-4 sm:w-24 sm:flex-col sm:items-start sm:gap-3">
                          <div
                            className={`relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ${
                              i % 2 === 0
                                ? "bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/30"
                                : "bg-gradient-to-br from-blue-600 to-blue-700 shadow-blue-700/30"
                            }`}
                          >
                            <Icon className="h-7 w-7 text-white" />
                          </div>
                          <span className="text-5xl font-black leading-none tracking-tight text-white/10 sm:text-6xl">
                            {step.number}
                          </span>
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-[0.24em] text-white/55">
                              STEP {step.number}
                            </span>
                            <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs font-semibold text-orange-200">
                              {step.focus}
                            </span>
                          </div>

                          <h3 className="mt-4 text-2xl font-black text-white sm:text-3xl">{step.title}</h3>
                          <p className="mt-3 text-base leading-relaxed text-white/70">{step.description}</p>

                          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                            <p className="text-sm leading-relaxed text-white/80">{step.outcome}</p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PROGRAMS */}
      <section id="programs" className="landing-section py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 landing-reveal landing-delay-1">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-4">
              <Dumbbell className="w-4 h-4 text-blue-700" />
              <span className="text-blue-700 text-sm font-semibold tracking-widest uppercase">Coaching Plans</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-4">
              Choose Your <span className="text-orange-500">Coaching Plan</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Pick the level of structure and accountability that matches your current stage. Every option starts with assessment, programming, and coach-led direction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {programs.map((prog, index) => (
              <div
                key={prog.name}
                className={`landing-panel landing-reveal relative rounded-3xl overflow-hidden shadow-xl ${
                  prog.featured ? "ring-2 ring-orange-500 shadow-orange-500/20 md:scale-105 z-10" : ""
                }`}
                style={{ animationDelay: `${0.12 + index * 0.08}s` }}
              >
                <div className={`p-8 ${prog.featured ? "bg-gray-900 text-white" : "bg-white"}`}>
                  {prog.tag && (
                    <div className={`mb-6 inline-flex text-white text-xs font-black px-4 py-2 rounded-full tracking-wider ${
                      prog.featured ? "bg-orange-500" : "bg-blue-700"
                    }`}>
                      {prog.tag}
                    </div>
                  )}

                  <div className={`relative mb-8 overflow-hidden rounded-[2rem] border p-6 ${
                    prog.featured ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"
                  }`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${prog.surface}`} />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:52px_52px] opacity-[0.08]" />

                    <div className="relative flex items-start justify-between gap-4">
                      <div>
                        <p className={`text-xs font-bold uppercase tracking-[0.24em] ${prog.featured ? "text-orange-300" : "text-gray-500"}`}>
                          {prog.sessions}
                        </p>
                        <p className={`mt-3 text-lg font-semibold ${prog.featured ? "text-white/85" : "text-gray-800"}`}>
                          {prog.paceLabel}
                        </p>
                      </div>
                      <span className={`text-6xl font-black leading-none ${prog.featured ? "text-white/10" : "text-gray-900/10"}`}>
                        {prog.marker}
                      </span>
                    </div>

                    <div className="relative mt-8 space-y-3">
                      {prog.bars.map((bar, barIndex) => (
                        <div
                          key={`${prog.name}-${barIndex}`}
                          className={`h-3 rounded-full overflow-hidden ${prog.featured ? "bg-white/10" : "bg-gray-200"}`}
                        >
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${prog.barAccent}`}
                            style={{ width: `${bar}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${prog.featured ? "text-orange-400" : "text-gray-400"}`}>
                    {prog.sessions}
                  </p>
                  <h3 className={`text-2xl font-black mb-3 ${prog.featured ? "text-white" : "text-gray-900"}`}>
                    {prog.name}
                  </h3>
                  <p className={`text-sm leading-relaxed mb-5 ${prog.featured ? "text-gray-300" : "text-gray-600"}`}>
                    {prog.summary}
                  </p>
                  <div className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold mb-6 ${
                    prog.featured
                      ? "bg-white/10 text-orange-200 border border-white/10"
                      : "bg-blue-50 text-blue-700 border border-blue-100"
                  }`}>
                    Best for: {prog.bestFor}
                  </div>
                  <div className="flex items-end gap-1 mb-6">
                    <span className={`text-5xl font-black leading-none ${prog.featured ? "text-white" : "text-gray-900"}`}>
                      ${prog.price}
                    </span>
                    <span className={`text-base pb-1 ${prog.featured ? "text-gray-400" : "text-gray-500"}`}>/mo</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {prog.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm">
                        <CheckCircle className={`w-4 h-4 shrink-0 ${prog.featured ? "text-orange-400" : "text-blue-600"}`} />
                        <span className={prog.featured ? "text-gray-300" : "text-gray-600"}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/register"
                    className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-base transition-all hover:-translate-y-0.5 ${
                      prog.featured
                        ? "bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/30"
                        : "bg-gray-900 hover:bg-blue-900 text-white"
                    }`}
                  >
                    {prog.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TRAINER */}
      <section id="trainer" className="landing-section relative overflow-hidden bg-slate-950 py-28 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_34%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
            <div className="landing-reveal landing-delay-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 mb-6 backdrop-blur-sm">
                <Shield className="w-4 h-4 text-blue-300" />
                <span className="text-blue-200 text-sm font-semibold tracking-[0.24em] uppercase">Trainer Details</span>
              </div>

              <h2 className="text-5xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-5">
                Train Directly With
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-200 to-orange-400">
                  Mohammed Sufiyan
                </span>
              </h2>

              <p className="max-w-2xl text-lg leading-relaxed text-white/72 mb-8">
                Mohammed leads the iShowTransformatio coaching experience with practical programming,
                weekly accountability, and a clear focus on sustainable body transformation. The goal is not
                random intensity. The goal is structure you can repeat and progress you can measure.
              </p>

              <div className="space-y-3">
                {trainerSnapshot.map((item, index) => (
                  <div
                    key={item.label}
                    className="landing-panel landing-reveal rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm"
                    style={{ animationDelay: `${0.14 + index * 0.08}s` }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-200/70 mb-2">{item.label}</p>
                    <p className="text-base font-medium text-white/90 leading-relaxed">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-orange-500/30 hover:-translate-y-0.5"
                >
                  Start With Mohammed
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="https://www.instagram.com/sufiyan_mohd26/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-lg font-bold text-white hover:bg-white/10"
                >
                  Instagram @sufiyan_mohd26
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              {trainerPillars.map((pillar, index) => {
                const Icon = pillar.icon;

                return (
                  <article
                    key={pillar.title}
                    className="landing-panel landing-reveal rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm"
                    style={{ animationDelay: `${0.18 + index * 0.08}s` }}
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-orange-200/70 mb-3">
                          Coaching Standard {String(index + 1).padStart(2, "0")}
                        </p>
                        <h3 className="text-2xl font-black text-white mb-3">{pillar.title}</h3>
                        <p className="text-base leading-relaxed text-white/72">{pillar.description}</p>
                      </div>
                    </div>
                  </article>
                );
              })}

              <div
                className="landing-panel landing-reveal rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/8 to-white/4 p-6 sm:p-8"
                style={{ animationDelay: "0.42s" }}
              >
                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-blue-200/70 mb-3">Inside The Coaching Relationship</p>
                    <h3 className="text-3xl font-black text-white leading-tight">
                      High accountability, clear direction, and progress that stays repeatable.
                    </h3>
                  </div>
                  <div className="grid gap-3">
                    {trainerPromises.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                        <p className="text-sm leading-relaxed text-white/80">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="landing-section relative py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_34%),linear-gradient(135deg,#020617_0%,#111827_50%,#020617_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.08]" />
        <div className="absolute left-[-8rem] bottom-[-10rem] h-72 w-72 rounded-full bg-orange-500/10 blur-[110px]" />
        <div className="absolute right-[-4rem] top-10 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center landing-reveal landing-delay-1">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 rounded-full px-5 py-2.5 mb-8">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-semibold tracking-widest uppercase">Ready to Start?</span>
          </div>
          <h2 className="text-6xl lg:text-8xl font-black text-white leading-[0.9] mb-6">
            Start With
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400"> A Clear Plan</span>
            <span className="block">Not Guesswork.</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Take the free assessment, share your goal, and let Mohammed map the next step with coaching that is built to stay realistic and effective.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-10 py-5 rounded-full font-black text-xl transition-all shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/60 hover:-translate-y-1 group"
            >
              Start For Free
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/30 text-white px-10 py-5 rounded-full font-bold text-xl transition-all backdrop-blur-sm"
            >
              Already a Member?
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-sm">
            {["Assessment first", "Trainer-led programming", "Clear weekly follow-up"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black border-t border-gray-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="mb-4 whitespace-nowrap leading-none">
                <span className="font-black text-xl text-white tracking-tight sm:text-2xl">iShow</span>
                <span className="font-black text-xl text-orange-400 tracking-tight sm:text-2xl">Transformatio</span>
              </div>
              <p className="text-gray-500 max-w-xs leading-relaxed mb-6 text-sm">
                Coach-led transformation built around clear structure, accountability, and steady progress.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <Link
                  href="https://www.instagram.com/sufiyan_mohd26/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Instagram
                </Link>
                <Link href="/register" className="text-gray-400 hover:text-white transition-colors">
                  Start Free Assessment
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">Programs</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                {["Foundation", "Transformation", "Elite Accountability", "Free Assessment"].map((item) => (
                  <li key={item}>
                    <Link href="/register" className="hover:text-orange-400 transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">Access</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                {[
                  { label: "Login",      href: "/login" },
                  { label: "Register",   href: "/register" },
                  { label: "Dashboard",  href: "/dashboard" },
                  { label: "Assessment", href: "/assessment" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-white transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                {[
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Contact Coach", href: "https://www.instagram.com/sufiyan_mohd26/" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                      className="hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>© 2026 iShowTransformatio. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
              <Link
                href="https://www.instagram.com/sufiyan_mohd26/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-gray-400 transition-colors"
              >
                Follow Mohammed on Instagram
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
