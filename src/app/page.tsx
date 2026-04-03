import Image from "next/image";
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
  PlayCircle,
} from "lucide-react";

// --- DATA ---

const marqueeItems = [
  "STRENGTH", "ENDURANCE", "CONDITIONING", "NUTRITION",
  "PERFORMANCE", "RECOVERY", "MINDSET", "DISCIPLINE",
];

const photoLibrary = {
  heroBackdrop: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2200&q=80",
  heroFeature: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1400&q=80",
  programming: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80",
  nutrition: "https://images.unsplash.com/photo-1543353071-c953d88f7033?auto=format&fit=crop&w=1200&q=80",
  progress: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
  accountability: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=1200&q=80",
  process: "https://images.unsplash.com/photo-1590646299178-1b26ab821e34?auto=format&fit=crop&w=1600&q=80",
  videoBackdrop: "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=2200&q=80",
  trainerBackdrop: "https://images.unsplash.com/photo-1648542036561-e1d66a5ae2b1?auto=format&fit=crop&w=2200&q=80",
  trainerFeature: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1400&q=80",
  ctaBackdrop: "https://images.unsplash.com/photo-1649134296132-56606326c566?auto=format&fit=crop&w=2200&q=80",
  ctaFeature: "https://images.unsplash.com/photo-1773681823208-7f3657c0688f?auto=format&fit=crop&w=1400&q=80",
};

const services = [
  {
    icon: Dumbbell,
    title: "Programming That Fits",
    description: "Training blocks built around your schedule, goal, and recovery capacity.",
    eyebrow: "Execution",
    detail: "Split design, exercise selection, progression",
    accent: "from-orange-500/20 via-orange-500/5 to-transparent",
    marker: "01",
    art: photoLibrary.programming,
  },
  {
    icon: Heart,
    title: "Nutrition Direction",
    description: "Simple calorie and meal guidance that supports fat loss, muscle gain, and recovery without overcomplication.",
    eyebrow: "Fuel",
    detail: "Targets, adjustments, sustainability",
    accent: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    marker: "02",
    art: photoLibrary.nutrition,
  },
  {
    icon: TrendingUp,
    title: "Visible Progress Tracking",
    description: "Your check-ins, habits, and milestones stay measurable so the process stays motivating.",
    eyebrow: "Feedback",
    detail: "Weekly review, dashboard visibility, momentum",
    accent: "from-blue-500/20 via-blue-500/5 to-transparent",
    marker: "03",
    art: photoLibrary.progress,
  },
  {
    icon: Users,
    title: "Coach Accountability",
    description: "Regular follow-up keeps training decisions active and makes it harder to drift away from the plan.",
    eyebrow: "Support",
    detail: "Direct follow-up, clearer standards, consistency",
    accent: "from-orange-400/20 via-blue-500/5 to-transparent",
    marker: "04",
    art: photoLibrary.accountability,
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

const trainingVideos = [
  {
    title: "Strength Block",
    tag: "Strength",
    focus: "Loaded lifts and clean execution",
    description: "A direct look at the kind of strength work that sits inside structured weekly programming.",
    videoSrc: "https://videos.pexels.com/video-files/4945157/4945157-sd_960_506_24fps.mp4",
    poster: photoLibrary.programming,
  },
  {
    title: "Conditioning Push",
    tag: "Conditioning",
    focus: "Pace, output, repeatability",
    description: "Cardio and conditioning work stays targeted so effort builds capacity instead of random fatigue.",
    videoSrc: "https://videos.pexels.com/video-files/6891854/6891854-sd_640_360_25fps.mp4",
    poster: photoLibrary.process,
  },
  {
    title: "Coach-Led Session",
    tag: "Coach-led",
    focus: "Feedback, form, accountability",
    description: "Training footage is part of the feedback loop, making form review and execution standards easier to keep high.",
    videoSrc: "https://videos.pexels.com/video-files/8027708/8027708-sd_960_506_25fps.mp4",
    poster: photoLibrary.accountability,
  },
];

const heroSignals = [
  { label: "Coach sync", value: "Weekly" },
  { label: "Plan state", value: "Adaptive" },
  { label: "Progress feed", value: "Live" },
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

const trainerPanelStats = [
  { label: "Programming", value: "Custom" },
  { label: "Check-ins", value: "Weekly" },
  { label: "Access", value: "Direct" },
];

const ctaSequence = [
  { label: "Assessment", value: "01" },
  { label: "Plan mapped", value: "02" },
  { label: "Coach follow-up", value: "03" },
];

const landingArt = {
  texture: "/landing/mesh-lines.svg",
  heroBackdrop: photoLibrary.heroBackdrop,
  hero: photoLibrary.heroFeature,
  journey: photoLibrary.process,
  videosBackdrop: photoLibrary.videoBackdrop,
  trainerBackdrop: photoLibrary.trainerBackdrop,
  trainer: photoLibrary.trainerFeature,
  ctaBackdrop: photoLibrary.ctaBackdrop,
  cta: photoLibrary.ctaFeature,
};

function SectionTexture({ className = "opacity-20 mix-blend-screen" }: { className?: string }) {
  return (
    <Image
      src={landingArt.texture}
      alt=""
      fill
      sizes="100vw"
      className={`pointer-events-none object-cover ${className}`}
    />
  );
}

function SectionBackdropImage({ src, alt = "", className = "opacity-25" }: { src: string; alt?: string; className?: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="100vw"
      className={`pointer-events-none object-cover ${className}`}
    />
  );
}

// --- PAGE ---

export default function LandingPage() {
  return (
    <div className="landing-shell min-h-screen overflow-x-hidden bg-white">
      <Navbar />

      {/* 1. HERO */}
      <section className="landing-section relative flex min-h-screen items-center overflow-hidden">
        <SectionBackdropImage src={landingArt.heroBackdrop} className="opacity-[0.3]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.24),transparent_26%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_32%),linear-gradient(135deg,#020617_0%,#0f172a_46%,#020617_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.12]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.16)_55%,rgba(2,6,23,0.84)_100%)]" />
        <div className="absolute top-1/4 right-1/3 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />
        <SectionTexture className="opacity-[0.2] mix-blend-screen" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-28 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8">
          <div className="grid items-center gap-10 sm:gap-14 xl:grid-cols-[minmax(0,1fr)_30rem]">
            <div className="max-w-3xl landing-reveal landing-delay-1">
              <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/20 px-4 py-2 backdrop-blur-sm sm:mb-8 sm:px-5 sm:py-2.5">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300 sm:text-sm sm:tracking-widest">Coach-Led Transformation</span>
              </div>

              <h1 className="mb-6 text-5xl font-black leading-[0.9] tracking-tighter text-white sm:mb-7 sm:text-7xl lg:text-[108px]">
                FORGE
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-400">
                  YOUR BEST
                </span>
                SELF.
              </h1>

              <p className="mb-8 max-w-2xl text-base leading-relaxed font-light text-white/60 sm:mb-10 sm:text-xl lg:text-2xl">
                iShowTransformation gives you structured coaching from Mohammed Sufiyan, a clear plan,
                and the accountability needed to turn effort into visible progress.
              </p>

              <div className="mb-12 flex flex-col gap-3 sm:mb-16 sm:flex-row sm:gap-4">
                <Link
                  href="/register"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3.5 text-base font-bold text-white shadow-2xl shadow-orange-500/30 transition-all hover:-translate-y-1 hover:bg-orange-400 hover:shadow-orange-500/50 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
                >
                  Start Free Assessment
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/#videos"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-base font-bold text-white transition-all backdrop-blur-sm hover:border-white/50 hover:bg-white/20 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
                >
                  Watch Training Videos
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="grid gap-5 border-t border-white/10 pt-6 sm:flex sm:flex-wrap sm:gap-8 sm:pt-8">
                {heroHighlights.map((item) => (
                  <div key={item.title} className="max-w-[220px]">
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-white sm:text-base sm:tracking-[0.18em]">{item.title}</p>
                    <p className="text-sm leading-relaxed text-white/45 mt-2">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="landing-reveal landing-delay-2 mx-auto w-full max-w-[30rem] xl:max-w-none">
              <div className="landing-panel relative overflow-hidden rounded-[2.35rem] border border-white/10 bg-white/6 p-3 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/16 via-transparent to-blue-500/16" />
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.85rem]">
                  <Image
                    src={landingArt.hero}
                    alt="Athlete training intensely in a gym environment"
                    fill
                    priority
                    sizes="(max-width: 1280px) 100vw, 30rem"
                    className="object-cover"
                  />
                </div>

                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70 backdrop-blur-sm sm:left-8 sm:top-8 sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.26em]">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  Live coaching dashboard
                </div>

                <div className="absolute inset-x-4 bottom-4 grid gap-3 sm:inset-x-8 sm:bottom-8 sm:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/78 p-4 backdrop-blur-md sm:p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-orange-200/70">Momentum check</p>
                    <p className="mt-2 max-w-[15rem] text-xs leading-relaxed text-white/78 sm:text-sm">
                      Assessment, plan updates, and coach follow-up all stay visible in one trackable flow.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-1 sm:gap-3">
                    {heroSignals.map((item) => (
                      <div key={item.label} className="rounded-[1.2rem] border border-white/10 bg-slate-950/72 px-3 py-2.5 backdrop-blur-md sm:rounded-[1.35rem] sm:px-4 sm:py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/45">{item.label}</p>
                        <p className="mt-1 text-sm font-black text-white sm:text-lg">{item.value}</p>
                      </div>
                    ))}
                  </div>
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
      <div className="overflow-hidden bg-orange-500 py-3 select-none sm:py-4">
        <div className="animate-marquee whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="mx-4 inline-flex items-center gap-3 text-base font-black tracking-[0.16em] text-white sm:mx-6 sm:gap-4 sm:text-lg sm:tracking-[0.2em]">
              <span className="w-2 h-2 rounded-full bg-white/50 inline-block" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* 3. SERVICES */}
      <section id="services" className="landing-section relative overflow-hidden bg-gray-950 py-20 text-white sm:py-28">
        <SectionTexture className="opacity-[0.16] mix-blend-screen" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="landing-reveal landing-delay-1 mb-12 text-center sm:mb-16">
            <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/20 px-4 py-2">
              <Trophy className="w-4 h-4 text-orange-400" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-400 sm:text-sm sm:tracking-widest">Inside The Experience</span>
            </div>
            <h2 className="mb-4 text-4xl font-black sm:text-5xl lg:text-6xl">
              What Coaching
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                Actually Covers
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-base text-gray-400 sm:text-lg">
              Programming, nutrition direction, accountability, and progress tracking built around one clear target: sustainable transformation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc, index) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.title}
                  className="landing-panel landing-reveal group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1220]"
                  style={{ animationDelay: `${0.12 + index * 0.08}s` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${svc.accent}`} />
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.08]" />
                  <div className="absolute -right-5 top-6 opacity-[0.08]">
                    <Icon className="h-28 w-28 text-white" />
                  </div>
                  <div className="relative flex h-full flex-col p-6">
                    <div className="relative mb-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/70">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/10 via-transparent to-slate-950/55" />
                      <Image
                        src={svc.art}
                        alt=""
                        width={720}
                        height={720}
                        className="h-44 w-full object-cover"
                      />

                      <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70 backdrop-blur-sm">
                        {svc.eyebrow}
                      </div>

                      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-500/30 bg-orange-500/20 backdrop-blur-sm">
                          <Icon className="w-6 h-6 text-orange-300" />
                        </div>
                        <span className="text-5xl font-black leading-none text-white/20">{svc.marker}</span>
                      </div>
                    </div>

                    <div className="mt-auto">
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
      <section id="how-it-works" className="landing-section relative overflow-hidden bg-neutral-950 py-20 text-white sm:py-28">
        <SectionBackdropImage src={landingArt.journey} className="opacity-[0.24]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.24),transparent_36%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:88px_88px] opacity-[0.08]" />
        <SectionTexture className="opacity-[0.14] mix-blend-screen" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div className="landing-reveal landing-delay-1 lg:sticky lg:top-28 self-start">
              <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 backdrop-blur-sm sm:mb-6">
                <Calendar className="w-4 h-4 text-orange-300" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-200 sm:text-sm sm:tracking-[0.24em]">The Process</span>
              </div>

              <h2 className="mb-5 text-4xl font-black leading-[0.94] tracking-tight sm:mb-6 sm:text-5xl lg:text-7xl">
                Simple Path to
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-blue-400">
                  Transformation
                </span>
              </h2>

              <p className="mb-6 max-w-xl text-base leading-relaxed text-white/70 sm:mb-8 sm:text-lg">
                This is built to feel clear from day one: understand your baseline, get a plan that fits your life,
                train with structure, and watch momentum stack into visible results.
              </p>

              <div className="landing-panel relative mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 backdrop-blur-sm shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/14 via-transparent to-blue-500/14" />
                <div className="relative aspect-[1.08/1] overflow-hidden rounded-[1.5rem]">
                  <Image
                    src={landingArt.journey}
                    alt="Runner building momentum outdoors during a conditioning session"
                    fill
                    sizes="(max-width: 1024px) 100vw, 42rem"
                    className="object-cover"
                  />
                </div>

                <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/72 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm sm:left-6 sm:top-6 sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.24em]">
                  4-stage roadmap
                </div>

              </div>

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

              <div className="landing-panel rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-6">
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

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/register"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3.5 text-base font-bold text-white transition-all shadow-lg shadow-orange-500/25 hover:-translate-y-0.5 hover:bg-orange-400 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
                >
                  Start Free Assessment
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/#videos"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-base font-bold text-white transition-all hover:bg-white/10 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
                >
                  View Training Videos
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
                      className={`landing-panel landing-reveal relative overflow-hidden rounded-[2rem] border border-white/10 p-5 sm:p-8 ${
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

      {/* 5. VIDEOS */}
      <section id="videos" className="landing-section relative overflow-hidden bg-neutral-950 py-20 text-white sm:py-28">
        <SectionBackdropImage src={landingArt.videosBackdrop} className="opacity-[0.24]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.92)_0%,rgba(2,6,23,0.68)_48%,rgba(15,23,42,0.94)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:88px_88px] opacity-[0.08]" />
        <SectionTexture className="opacity-[0.14] mix-blend-screen" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-14">
            <div className="landing-reveal landing-delay-1 lg:sticky lg:top-28 self-start">
              <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 backdrop-blur-sm sm:mb-6">
                <PlayCircle className="w-4 h-4 text-orange-300" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-200 sm:text-sm sm:tracking-[0.24em]">Training Videos</span>
              </div>

              <h2 className="mb-5 text-4xl font-black leading-[0.96] tracking-tight sm:mb-6 sm:text-5xl lg:text-7xl">
                Real Sessions.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-blue-400">
                  Real Training.
                </span>
              </h2>

              <p className="mb-6 max-w-xl text-base leading-relaxed text-white/70 sm:mb-8 sm:text-lg">
                The platform can carry actual training footage alongside the rest of the coaching flow, giving sessions,
                movement quality, and execution a more visual layer instead of leaving everything as text only.
              </p>

              <div className="landing-panel relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 backdrop-blur-sm shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/14 via-transparent to-blue-500/14" />
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                  <Image
                    src={landingArt.videosBackdrop}
                    alt="Dumbbells and training equipment arranged in a gym"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40rem"
                    className="object-cover"
                  />
                </div>

                <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/72 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm sm:left-6 sm:top-6 sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.24em]">
                  HD media backgrounds
                </div>

              </div>
            </div>

            <div className="grid gap-6">
              {trainingVideos.map((video, index) => (
                <article
                  key={video.title}
                  className="landing-panel landing-reveal rounded-[2rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                  style={{ animationDelay: `${0.14 + index * 0.08}s` }}
                >
                  <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-950/70">
                    <video
                      className="h-56 w-full object-cover sm:h-64"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="none"
                      poster={video.poster}
                    >
                      <source src={video.videoSrc} type="video/mp4" />
                    </video>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/18 to-transparent" />
                    <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70 backdrop-blur-sm">
                      {video.tag}
                    </div>
                    <div className="absolute inset-x-5 bottom-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-orange-200/75">{video.focus}</p>
                      <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">{video.title}</h3>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-white/72">{video.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRAINER */}
      <section id="trainer" className="landing-section relative overflow-hidden bg-slate-950 py-20 text-white sm:py-28">
        <SectionBackdropImage src={landingArt.trainerBackdrop} className="opacity-[0.24]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_34%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:88px_88px] opacity-[0.06]" />
        <SectionTexture className="opacity-[0.16] mix-blend-screen" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="landing-reveal landing-delay-1 mb-10 max-w-3xl sm:mb-12 lg:mb-14">
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 backdrop-blur-sm sm:mb-6">
              <Shield className="h-4 w-4 text-blue-300" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-200 sm:text-sm sm:tracking-[0.24em]">Trainer Details</span>
            </div>

            <h2 className="mb-5 text-4xl font-black leading-[0.96] tracking-tight sm:text-5xl lg:text-7xl">
              Meet The Coach
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-200 to-orange-400">
                Behind The Structure
              </span>
            </h2>

            <p className="max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
              Mohammed Sufiyan leads iShowTransformation with practical programming, direct accountability,
              and a coaching standard that keeps progress measurable instead of motivational only.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.88fr_1.12fr] xl:items-start">
            <div className="grid gap-4 xl:sticky xl:top-28 self-start">
              <div className="landing-panel landing-reveal landing-delay-2 relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/5 p-3 sm:p-4 backdrop-blur-sm shadow-[0_28px_90px_rgba(0,0,0,0.26)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.2),transparent_32%),linear-gradient(155deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.8rem]">
                  <Image
                    src={landingArt.trainer}
                    alt="Coach assisting a client during a gym session"
                    fill
                    sizes="(max-width: 1280px) 100vw, 34rem"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
                </div>

                <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-slate-950/72 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm sm:left-6 sm:top-6 sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.24em]">
                  Direct coach access
                </div>

                <div className="absolute inset-x-5 bottom-5 sm:inset-x-6 sm:bottom-6">
                  <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/72 p-4 backdrop-blur-md sm:p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-orange-200/70">Mohammed Sufiyan</p>
                    <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">Coach-led transformation.</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/78 sm:text-base">
                      The goal is not random intensity. The goal is structure you can repeat,
                      track, and steadily progress.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {trainerSnapshot.map((item, index) => (
                  <div
                    key={item.label}
                    className="landing-panel landing-reveal rounded-[1.6rem] border border-white/10 bg-white/5 px-5 py-5 backdrop-blur-sm"
                    style={{ animationDelay: `${0.16 + index * 0.06}s` }}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-orange-200/70 sm:text-xs">{item.label}</p>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-white/90 sm:text-base">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="landing-panel landing-reveal rounded-[2.4rem] border border-white/10 bg-gradient-to-br from-white/9 via-white/5 to-transparent p-6 sm:p-8 backdrop-blur-sm shadow-[0_28px_90px_rgba(0,0,0,0.18)]" style={{ animationDelay: "0.12s" }}>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-blue-200/70">Meet Your Coach</p>
                    <h3 className="mt-3 text-3xl font-black leading-[1] text-white sm:text-4xl lg:text-5xl">
                      Train Directly With
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-200 to-orange-400">
                        Mohammed Sufiyan
                      </span>
                    </h3>

                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/72 sm:text-lg">
                      Mohammed leads the iShowTransformation coaching experience with practical programming,
                      weekly accountability, and a clear focus on sustainable body transformation. Every block is designed
                      to match your real routine so the system stays usable outside perfect weeks.
                    </p>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
                      <Link
                        href="/register"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 hover:bg-orange-400 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
                      >
                        Start With Mohammed
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                      <Link
                        href="https://www.instagram.com/sufiyan_mohd26/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-base font-bold text-white transition-all hover:bg-white/10 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
                      >
                        Instagram @sufiyan_mohd26
                        <ExternalLink className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-white/10 bg-slate-950/58 p-5 backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-orange-200/70">Coaching rhythm</p>
                    <div className="mt-4 grid gap-3">
                      {trainerPanelStats.map((item) => (
                        <div key={item.label} className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/45">{item.label}</p>
                          <p className="mt-1 text-lg font-black text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.98fr_1.02fr] lg:items-start">
                <div className="landing-panel landing-reveal rounded-[2rem] border border-white/10 bg-black/20 p-6 sm:p-8 backdrop-blur-sm" style={{ animationDelay: "0.18s" }}>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-blue-200/70">Inside The Coaching Relationship</p>
                  <h3 className="mt-3 text-2xl font-black leading-tight text-white sm:text-3xl">
                    High accountability, clear direction, and progress that stays repeatable.
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/64">
                    The coaching layer is built to keep feedback, decision-making, and follow-through visible,
                    so momentum does not disappear the moment the week gets busy.
                  </p>

                  <div className="mt-6 grid gap-3">
                    {trainerPromises.map((item, index) => (
                      <div key={item} className="flex items-start gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-[11px] font-black text-orange-200">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="text-sm leading-relaxed text-white/80">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                  {trainerPillars.map((pillar, index) => {
                    const Icon = pillar.icon;

                    return (
                      <article
                        key={pillar.title}
                        className="landing-panel landing-reveal rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-7 backdrop-blur-sm"
                        style={{ animationDelay: `${0.22 + index * 0.08}s` }}
                      >
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25">
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-orange-200/70">
                              Coaching Standard {String(index + 1).padStart(2, "0")}
                            </p>
                            <h3 className="mb-3 text-2xl font-black text-white">{pillar.title}</h3>
                            <p className="text-base leading-relaxed text-white/72">{pillar.description}</p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="landing-section relative overflow-hidden py-24 sm:py-36">
        <SectionBackdropImage src={landingArt.ctaBackdrop} className="opacity-[0.26]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_34%),linear-gradient(135deg,#020617_0%,#111827_50%,#020617_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.08]" />
        <div className="absolute left-[-8rem] bottom-[-10rem] h-72 w-72 rounded-full bg-orange-500/10 blur-[110px]" />
        <div className="absolute right-[-4rem] top-10 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />
        <SectionTexture className="opacity-[0.16] mix-blend-screen" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center landing-reveal landing-delay-1">
          <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/20 px-4 py-2 sm:mb-8 sm:px-5 sm:py-2.5">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-400 sm:text-sm sm:tracking-widest">Ready to Start?</span>
          </div>
          <h2 className="mb-5 text-4xl font-black leading-[0.95] text-white sm:mb-6 sm:text-6xl lg:text-8xl">
            Start With
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400"> A Clear Plan</span>
            <span className="block">Not Guesswork.</span>
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-gray-300 sm:mb-10 sm:text-xl">
            Take the free assessment, share your goal, and let Mohammed map the next step with coaching that is built to stay realistic and effective.
          </p>
          <div className="mb-8 flex flex-col justify-center gap-3 sm:mb-10 sm:flex-row sm:gap-4">
            <Link
              href="/register"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-4 text-base font-black text-white shadow-2xl shadow-orange-500/30 transition-all hover:-translate-y-1 hover:bg-orange-400 hover:shadow-orange-500/60 sm:w-auto sm:px-10 sm:py-5 sm:text-xl"
            >
              Start For Free
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-4 text-base font-bold text-white transition-all backdrop-blur-sm hover:bg-white/20 sm:w-auto sm:px-10 sm:py-5 sm:text-xl"
            >
              Already a Member?
            </Link>
          </div>

          <div className="landing-panel relative mx-auto mb-10 max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/14 via-transparent to-blue-500/14" />
            <div className="relative aspect-[5/3] overflow-hidden rounded-[1.5rem]">
              <Image
                src={landingArt.cta}
                alt="Athlete running outdoors at sunrise"
                fill
                sizes="(max-width: 1024px) 100vw, 48rem"
                className="object-cover"
              />
            </div>

            <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/72 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm sm:left-6 sm:top-6 sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.24em]">
              Start sequence
            </div>

            <div className="absolute inset-x-4 bottom-4 grid grid-cols-3 gap-2 sm:inset-x-6 sm:bottom-6 sm:gap-3">
              {ctaSequence.map((item) => (
                <div key={item.label} className="rounded-[1.2rem] border border-white/10 bg-slate-950/78 px-3 py-2.5 text-left backdrop-blur-md sm:rounded-[1.35rem] sm:px-4 sm:py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/45">{item.label}</p>
                  <p className="mt-1 text-sm font-black text-white sm:text-lg">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400 sm:gap-6 sm:text-sm">
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
                <span className="font-black text-xl text-orange-400 tracking-tight sm:text-2xl">Transformation</span>
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
            <p>© 2026 iShowTransformation. All rights reserved.</p>
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
