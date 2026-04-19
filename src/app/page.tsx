import Link from "next/link";
import Navbar from "@/components/Navbar";
import { DM_Sans, Barlow_Condensed } from "next/font/google";
import { Instagram } from "lucide-react";

const dm = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["400", "500", "600", "700"],
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["700", "800"],
});

const marqueeWords = [
  "Strength", "Endurance", "Conditioning", "Nutrition",
  "Performance", "Recovery", "Mindset", "Discipline",
];

const services = [
  {
    num: "01", tag: "EXECUTION",
    title: "Programming That Fits",
    description: "Training blocks built around your schedule, goal, and recovery capacity.",
    tags: ["Split Design", "Exercise Selection", "Progression"],
  },
  {
    num: "02", tag: "FUEL",
    title: "Nutrition Direction",
    description: "Simple calorie and meal guidance that supports fat loss, muscle gain, and recovery without overcomplication.",
    tags: ["Targets", "Adjustments", "Sustainability"],
  },
  {
    num: "03", tag: "FEEDBACK",
    title: "Visible Progress Tracking",
    description: "Your check-ins, habits, and milestones stay measurable so the process stays motivating.",
    tags: ["Weekly Review", "Dashboard Visibility", "Momentum"],
  },
  {
    num: "04", tag: "SUPPORT",
    title: "Coach Accountability",
    description: "Regular follow-up keeps training decisions active and makes it harder to drift away from the plan.",
    tags: ["Direct Follow-up", "Clearer Standards", "Consistency"],
  },
];

const steps = [
  {
    num: "01", label: "Goals + current baseline",
    title: "Register & Assess",
    description: "Create your account and complete a detailed fitness assessment to help us understand your goals.",
    outcome: "You leave the first step with a clear starting point and direction.",
  },
  {
    num: "02", label: "Coach-built roadmap",
    title: "Get Your Plan",
    description: "Your expert trainer reviews your profile and designs a fully custom program built for you.",
    outcome: "Your training is shaped around your lifestyle instead of a generic template.",
  },
  {
    num: "03", label: "Daily execution",
    title: "Start Training",
    description: "Access your sessions, weekly programs, and daily activities via your personal dashboard.",
    outcome: "Each session, program, and task stays visible inside your dashboard.",
  },
  {
    num: "04", label: "Momentum that compounds",
    title: "Transform & Grow",
    description: "Track your progress, dominate your milestones, and watch your transformation unfold.",
    outcome: "Progress becomes measurable, motivating, and easier to sustain over time.",
  },
];

const trainingBlocks = [
  {
    tag: "CONDITIONING", label: "Pace, Output, Repeatability",
    title: "Strength Block",
    description: "A direct look at the kind of strength work that sits inside structured weekly programming.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
  },
  {
    tag: "COACH-LED", label: "Feedback, Form, Accountability",
    title: "Conditioning Push",
    description: "Cardio and conditioning work stays targeted so effort builds capacity instead of random fatigue.",
    image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80",
  },
  {
    tag: "EXECUTION", label: "Standards, Quality, Discipline",
    title: "Coach-Led Session",
    description: "Training footage is part of the feedback loop, making form review and execution standards easier to keep high.",
    image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80",
  },
];

const coachingStandards = [
  {
    num: "01", title: "Assessment before intensity",
    description: "Training starts by understanding your routine, current level, and target result before volume or intensity ramps up.",
  },
  {
    num: "02", title: "Weekly structure that adapts",
    description: "Your plan is built to move with real life, so consistency stays possible even when the week changes around you.",
  },
  {
    num: "03", title: "Direct accountability",
    description: "Mohammed keeps the process active with follow-up, check-ins, and clear expectations around execution.",
  },
];

export default function HomePage() {
  return (
    <div className={`${dm.variable} ${barlow.variable} font-[family-name:var(--font-dm)] bg-black text-white`}>
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen bg-black overflow-hidden flex items-center">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1920&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center right",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/92 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 py-36 lg:py-44">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 mb-8 border border-white/10 px-4 py-1.5">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                Coach-led Transformation · Dubai
              </span>
            </div>
            <h1
              className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-[0.87] tracking-tight text-white mb-8"
              style={{ fontSize: "clamp(66px, 10vw, 148px)" }}
            >
              Forge Your
              <br />
              Best Self.
            </h1>
            <p className="text-white/45 text-base sm:text-lg leading-relaxed max-w-md mb-10">
              Structured coaching from Mohammed Sufiyan — a clear plan and the
              accountability to turn consistent effort into visible progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 transition-colors uppercase text-sm tracking-widest"
              >
                Start Free Assessment
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/40 text-white/50 hover:text-white font-semibold px-8 py-4 transition-colors uppercase text-sm tracking-widest"
              >
                Already a Member
              </Link>
            </div>
          </div>

          <div className="mt-24 pt-8 border-t border-white/[0.08] flex flex-wrap gap-12">
            {[
              { label: "Assessment First", desc: "Start with your real baseline before the plan begins." },
              { label: "Custom Programming", desc: "Your training fits your lifestyle instead of fighting it." },
              { label: "Coach Follow-up", desc: "Stay accountable with clear direction from week to week." },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">{label}</p>
                  <p className="text-[10px] text-white/30 leading-relaxed max-w-[180px]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-orange-500 overflow-hidden py-3.5">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...marqueeWords, ...marqueeWords, ...marqueeWords, ...marqueeWords].map((word, i) => (
            <span
              key={i}
              className="inline-flex items-center mx-8 text-[10px] font-black uppercase tracking-[0.25em] text-white/80"
            >
              <span className="w-1 h-1 bg-white/40 rounded-full mr-8 flex-shrink-0" />
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* WHAT COACHING COVERS */}
      <section className="bg-[#0a0a0a] py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14 pb-10 border-b border-white/[0.07]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500 mb-4">
                Inside the experience
              </p>
              <h2
                className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-[0.9] tracking-tight text-white"
                style={{ fontSize: "clamp(38px, 6vw, 80px)" }}
              >
                What Coaching
                <br />
                Actually Covers
              </h2>
            </div>
            <p className="text-sm text-white/35 max-w-xs leading-relaxed lg:text-right">
              Programming, nutrition direction, accountability, and progress tracking
              built around one clear target: sustainable transformation.
            </p>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {services.map((s) => (
              <div
                key={s.num}
                className="group py-8 flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-12 hover:bg-white/[0.02] -mx-6 px-6 lg:-mx-10 lg:px-10 transition-colors cursor-default"
              >
                <span
                  className="font-[family-name:var(--font-barlow)] font-extrabold text-5xl text-white/[0.07] group-hover:text-orange-500/25 transition-colors flex-shrink-0 w-14"
                >
                  {s.num}
                </span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-bold text-white text-lg">{s.title}</h3>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500 bg-orange-500/[0.08] border border-orange-500/15 px-2.5 py-1 flex-shrink-0">
                      {s.tag}
                    </span>
                  </div>
                  <p className="text-sm text-white/35 leading-relaxed mb-5 max-w-xl">{s.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {s.tags.map((t) => (
                      <span key={t} className="text-[9px] font-bold uppercase tracking-widest text-white/25 border border-white/[0.08] px-2.5 py-1">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section
        className="relative py-24 lg:py-32 overflow-hidden"
        style={{
          backgroundImage: "url(https://images.unsplash.com/photo-1590646299178-1b26ab821e34?auto=format&fit=crop&w=1600&q=80)",
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/82" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <div className="mb-14">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500 mb-4">The process</p>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <h2
                className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-[0.9] tracking-tight text-white"
                style={{ fontSize: "clamp(38px, 6vw, 80px)" }}
              >
                Simple Path to
                <br />
                Transformation
              </h2>
              <p className="text-sm text-white/35 max-w-xs leading-relaxed">
                Clear from day one: understand your baseline, get a plan
                that fits your life, train with structure, and watch momentum build.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {steps.map((step) => (
              <div
                key={step.num}
                className="border border-white/[0.08] bg-white/[0.03] p-7 hover:border-orange-500/25 hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-start justify-between mb-7">
                  <span className="font-[family-name:var(--font-barlow)] font-extrabold text-5xl text-white/[0.08]">
                    {step.num}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-orange-500/50 text-right leading-tight max-w-[90px]">
                    {step.label}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base mb-3">{step.title}</h3>
                <p className="text-sm text-white/35 leading-relaxed mb-5">{step.description}</p>
                <p className="text-[11px] text-white/22 leading-relaxed border-t border-white/[0.07] pt-4">{step.outcome}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold px-8 py-4 hover:bg-white/90 transition-colors uppercase text-sm tracking-widest"
            >
              Start Free Assessment
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-white/35 hover:text-white font-semibold py-4 transition-colors uppercase text-sm tracking-widest"
            >
              Already a Member →
            </Link>
          </div>
        </div>
      </section>

      {/* REAL SESSIONS */}
      <section className="bg-black py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="mb-14 pb-10 border-b border-white/[0.07] flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500 mb-4">Training videos</p>
              <h2
                className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-[0.9] tracking-tight text-white"
                style={{ fontSize: "clamp(38px, 6vw, 80px)" }}
              >
                Real Sessions.
                <br />
                Real Training.
              </h2>
            </div>
            <p className="text-sm text-white/35 max-w-xs leading-relaxed">
              The platform carries actual training footage alongside the coaching flow,
              giving sessions and execution a more visual layer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {trainingBlocks.map((block) => (
              <div key={block.title} className="group relative overflow-hidden">
                <div
                  className="aspect-[3/4] bg-gray-900"
                  style={{
                    backgroundImage: `url(${block.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end p-7">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500 bg-black/60 border border-orange-500/20 px-2.5 py-1">
                      {block.tag}
                    </span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-white/30">
                      {block.label}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{block.title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{block.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEET THE COACH */}
      <section className="bg-[#0a0a0a] py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Photo + stats */}
            <div>
              <div className="relative">
                <div className="absolute top-5 left-5 z-10 flex flex-col gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-orange-500 bg-black/85 backdrop-blur-sm px-3 py-1.5 border border-orange-500/20">
                    Direct Coach Access
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 bg-black/85 backdrop-blur-sm px-3 py-1.5 border border-white/[0.08]">
                    Mohammed Sufiyan
                  </span>
                </div>
                <div
                  className="aspect-[3/4] bg-gray-900"
                  style={{
                    backgroundImage: "url(https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80)",
                    backgroundSize: "cover",
                    backgroundPosition: "center top",
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { label: "Programming", value: "Custom" },
                  { label: "Check-ins", value: "Weekly" },
                  { label: "Access", value: "Direct" },
                ].map(({ label, value }) => (
                  <div key={label} className="border border-white/[0.07] bg-white/[0.02] p-4 text-center">
                    <p className="font-[family-name:var(--font-barlow)] font-extrabold text-xl text-white mb-1">{value}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/25">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="lg:pt-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500 mb-4">Trainer details</p>
              <h2
                className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-[0.9] tracking-tight text-white mb-6"
                style={{ fontSize: "clamp(34px, 5vw, 72px)" }}
              >
                Meet The Coach
                <br />
                Behind The Structure
              </h2>
              <p className="text-sm font-semibold text-white/60 mb-3">Coach-led transformation.</p>
              <p className="text-sm text-white/35 leading-relaxed mb-10">
                The goal is not random intensity. The goal is structure you can repeat,
                track, and steadily progress. Mohammed Sufiyan leads iShow Transformation
                with practical programming, direct accountability, and a coaching standard
                that keeps progress measurable instead of motivational only.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-10">
                {[
                  { label: "Coaching Focus", value: "Strength, conditioning & body recomposition" },
                  { label: "Support Style", value: "High-accountability with weekly adjustments" },
                  { label: "Primary Contact", value: "Instagram @sufiyan_mohd26" },
                  { label: "Coaching Rhythm", value: "Assessment → Plan → Weekly follow-up" },
                ].map(({ label, value }) => (
                  <div key={label} className="border border-white/[0.07] p-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-orange-500/60 mb-1.5">{label}</p>
                    <p className="text-sm text-white/50">{value}</p>
                  </div>
                ))}
              </div>

              <div className="divide-y divide-white/[0.06] mb-10">
                {coachingStandards.map((s) => (
                  <div key={s.num} className="flex gap-5 py-5">
                    <span className="text-[10px] font-black text-orange-500/40 tracking-widest mt-0.5 flex-shrink-0 w-6">{s.num}</span>
                    <div>
                      <p className="font-semibold text-white text-sm mb-1">{s.title}</p>
                      <p className="text-xs text-white/30 leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3.5 transition-colors uppercase text-sm tracking-widest"
                >
                  Train with Mohammed
                </Link>
                <a
                  href="https://www.instagram.com/sufiyan_mohd26/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-white/12 hover:border-white/30 text-white/45 hover:text-white font-semibold px-6 py-3.5 transition-colors uppercase text-sm tracking-widest"
                >
                  <Instagram className="w-4 h-4" />
                  @sufiyan_mohd26
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="relative py-32 lg:py-44 overflow-hidden"
        style={{
          backgroundImage: "url(https://images.unsplash.com/photo-1773681823208-7f3657c0688f?auto=format&fit=crop&w=1400&q=80)",
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500 mb-6">Ready to start?</p>
              <h2
                className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-[0.88] tracking-tight text-white mb-8"
                style={{ fontSize: "clamp(44px, 7vw, 104px)" }}
              >
                Start With
                <br />
                A Clear Plan.
                <br />
                <span className="text-white/20">Not Guesswork.</span>
              </h2>
              <p className="text-sm text-white/35 leading-relaxed max-w-md mb-10">
                Take the free assessment, share your goal, and let Mohammed map the
                next step with coaching that is built to stay realistic and effective.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 transition-colors uppercase text-sm tracking-widest"
                >
                  Start For Free
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/35 text-white/45 hover:text-white font-semibold px-8 py-4 transition-colors uppercase text-sm tracking-widest"
                >
                  Already a Member
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { n: "01", label: "Assessment", desc: "Start with your real baseline before the plan begins." },
                { n: "02", label: "Plan Mapped", desc: "Trainer-led programming shaped around your lifestyle." },
                { n: "03", label: "Coach Follow-up", desc: "Clear weekly direction and direct accountability." },
              ].map(({ n, label, desc }) => (
                <div key={n} className="flex items-start gap-6 border border-white/[0.07] bg-white/[0.02] p-6 hover:border-orange-500/20 hover:bg-white/[0.04] transition-all group">
                  <span className="font-[family-name:var(--font-barlow)] font-extrabold text-3xl text-white/[0.07] group-hover:text-orange-500/20 transition-colors flex-shrink-0">
                    {n}
                  </span>
                  <div>
                    <p className="font-bold text-white text-sm mb-1 uppercase tracking-wider">{label}</p>
                    <p className="text-xs text-white/30 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black border-t border-white/[0.05] pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
            <div className="col-span-2 md:col-span-1">
              <p className="font-[family-name:var(--font-barlow)] font-extrabold uppercase text-white text-2xl tracking-tight mb-3">
                iShow
              </p>
              <p className="text-[11px] text-white/25 leading-relaxed mb-6">
                Coach-led transformation built around clear structure,
                accountability, and steady progress.
              </p>
              <a
                href="https://www.instagram.com/sufiyan_mohd26/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[10px] text-white/35 hover:text-white transition-colors uppercase tracking-widest font-semibold"
              >
                <Instagram className="w-3.5 h-3.5" />
                @sufiyan_mohd26
              </a>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/18 mb-5">Programs</p>
              <ul className="space-y-3">
                {["Foundation", "Transformation", "Elite Accountability", "Free Assessment"].map((p) => (
                  <li key={p}>
                    <Link href="/register" className="text-[11px] text-white/35 hover:text-white transition-colors tracking-wide">
                      {p}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/18 mb-5">Access</p>
              <ul className="space-y-3">
                {[
                  { label: "Sign In", href: "/login" },
                  { label: "Register", href: "/register" },
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Assessment", href: "/assessment" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-[11px] text-white/35 hover:text-white transition-colors tracking-wide">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/18 mb-5">Legal</p>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy" className="text-[11px] text-white/35 hover:text-white transition-colors tracking-wide">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-[11px] text-white/35 hover:text-white transition-colors tracking-wide">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <a href="https://www.instagram.com/sufiyan_mohd26/" target="_blank" rel="noopener noreferrer"
                    className="text-[11px] text-white/35 hover:text-white transition-colors tracking-wide">
                    Contact Coach
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-[10px] text-white/18 uppercase tracking-widest">
              © {new Date().getFullYear()} iShowTransformation. All rights reserved.
            </p>
            <p className="text-[10px] text-white/18 uppercase tracking-widest">Dubai, UAE</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
