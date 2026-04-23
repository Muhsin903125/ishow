"use client";

import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
  Instagram,
  ArrowRight,
  Target,
  Dumbbell,
  TrendingUp,
  Calendar,
  Utensils,
  Play,
  Star,
  MapPin,
  CheckCheck,
  Quote,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import SmoothScroll from "@/components/SmoothScroll";
import {
  resolveCloudinaryImageUrl,
  resolveCloudinaryVideoUrl,
} from "@/lib/media/cloudinary";
import type {
  LandingClientConfig,
  LandingClientTestimonial,
} from "@/lib/cms/content";

interface LandingClientProps {
  testimonials: LandingClientTestimonial[];
  config?: LandingClientConfig | null;
}

export default function LandingClient({
  testimonials,
  config,
}: LandingClientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const heroTitle = config?.hero?.title || "The System For True Momentum.";
  const heroSubtitle =
    config?.hero?.subtitle ||
    "Real coaching. Real results. Based in Dubai, working with clients across the UAE, online and in person.";
  const ctaPrimary = config?.hero?.cta_primary || "Launch Your Plan";
  const ctaSecondary = config?.hero?.cta_secondary || "See Inside";

  const methodTitle =
    config?.methodology?.title || "Start With A Clear Plan. Not Guesswork.";
  const methodSteps = config?.methodology?.steps || [
    {
      title: "Assessment",
      description: "Start with your real baseline before the plan begins.",
    },
    {
      title: "Plan Mapped",
      description: "Trainer-led programming shaped around your lifestyle.",
    },
    {
      title: "Coach Follow-Up",
      description: "Clear weekly direction and direct accountability.",
    },
  ];

  const coachName = config?.coach?.name || "Mohammed Sufiyan";
  const coachQuote =
    config?.coach?.quote ||
    "I started iShow because I was tired of seeing people waste months on plans that were not built for them.";
  const coachExperience = config?.coach?.experience || "10+ Years";
  const coachSpecialty = config?.coach?.specialty || "Elite Transformation";

  const capabilitiesTitle =
    config?.capabilities?.title || "A Unified Dashboard For Total Control";
  const capabilitiesItems = config?.capabilities?.items || [
    {
      title: "1-on-1 Plan Generation",
      description:
        "No templates. Every training plan is shaped around your baseline, schedule, and fitness goal.",
      icon: "Target",
      image:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Granular Analytics",
      description:
        "Track every rep, milestone, and trend with a cleaner weekly view of progress.",
      icon: "TrendingUp",
      image:
        "https://images.unsplash.com/photo-1521804906057-1df8fdb718b7?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Session Scheduling",
      description:
        "Stay synced with upcoming sessions, reschedules, and weekly commitments.",
      icon: "Calendar",
      image:
        "https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Nutrition And Fueling",
      description:
        "Macros, calorie direction, and check-ins stay connected to the way you train.",
      icon: "Utensils",
      image:
        "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const servicesItems = config?.services?.items || [
    {
      title: "Complete Transformation",
      image:
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
      description:
        "Full protocol with training, nutrition direction, and high-accountability coaching.",
    },
    {
      title: "Elite Athleticism",
      image:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
      description:
        "Explosive power, reactive agility, and raw strength for performance-minded clients.",
    },
    {
      title: "Nutrition Only Hub",
      image:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
      description:
        "A nutrition-first track for people who already have their training base dialed in.",
    },
  ];

  const packagesTitle =
    config?.packages?.title || "Choose The Coaching Depth That Fits Your Start.";
  const packageItems = config?.packages?.items || [
    {
      title: "Starter Reset",
      price: "AED 899",
      cadence: "per month",
      description:
        "A guided reset for clients rebuilding consistency, confidence, and weekly execution.",
      highlights: [
        "Weekly structure",
        "Session scheduling support",
        "Habit accountability",
      ],
    },
    {
      title: "Transformation Coaching",
      price: "AED 1499",
      cadence: "per month",
      description:
        "A fuller transformation track for clients who want closer oversight across training, nutrition, and progress reviews.",
      highlights: [
        "Training and nutrition direction",
        "Progress review rhythm",
        "Higher-touch accountability",
      ],
    },
    {
      title: "Performance Build",
      price: "Custom",
      cadence: "pricing on consult",
      description:
        "A custom scope for clients with advanced, performance, or schedule-heavy needs.",
      highlights: [
        "Custom scope and targets",
        "Priority programming support",
        "Built around your constraints",
      ],
    },
  ];

  const proofTitle =
    config?.proof?.title || "Better bodies. Better habits. No public shame.";
  const proofIntro =
    config?.proof?.intro ||
    "We are not selling humiliation content or fake perfection. We coach people through real-life progress they can actually keep.";
  const proofCards = config?.proof?.items?.length
    ? config.proof.items
    : [
        {
          eyebrow: "Wabi-Sabi Progress",
          title: "Visible change without fake perfection",
          description:
            "We coach for honest momentum: stronger habits, cleaner sessions, steadier energy, and a body that looks like someone living well.",
          metric: "Week by week",
          detail:
            "Measured through check-ins, adherence, and realistic progression.",
        },
        {
          eyebrow: "Public Confidence",
          title: "Feel better showing up outside the gym",
          description:
            "The goal is not staged comparison content. The goal is walking into work, brunch, or the beach with more confidence and less self-consciousness.",
          metric: "Daily life",
          detail: "Better fit, better posture, better presence in public.",
        },
        {
          eyebrow: "Respectful Coaching",
          title: "Direct support with zero public shaming",
          description:
            "No humiliation tactics. No pressure theater. Just clear standards, better accountability, and a coach who adjusts to real life.",
          metric: "1 coach",
          detail: "One relationship built on trust, not embarrassment.",
        },
      ];

  const resultsPillars = [
    {
      title: "Consistency",
      value: "Weekly rhythm",
      description:
        "Training becomes part of life instead of another reset that falls apart in ten days.",
    },
    {
      title: "Confidence",
      value: "More public ease",
      description:
        "You feel better in social spaces because the plan is changing how you move, carry yourself, and recover.",
    },
    {
      title: "Capability",
      value: "Strength that shows",
      description:
        "The proof is not only visual. It is stamina, structure, and knowing you can handle harder work well.",
    },
  ];

  const showcasePoints = [
    "Real-time workout scheduling alerts",
    "Automated weekly check-ins",
    "Direct messaging support",
    "Automated payment hub",
  ];

  const activeTestimonials = config?.testimonials || testimonials;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroBgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroContentY = useTransform(scrollYProgress, [0, 1], ["0%", "120%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

  const fadeInScale = {
    initial: { opacity: 0, scale: 0.96, y: 30 },
    whileInView: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.8, ease: easeOut },
    },
    viewport: { once: true, margin: "-100px" },
  };

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.1,
      },
    },
    viewport: { once: true, margin: "-100px" },
  };

  const itemReveal: Variants = {
    initial: { opacity: 0, y: 20 },
    whileInView: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: easeOut },
    },
  };

  return (
    <SmoothScroll>
      <div
        className="bg-[#f6f0e7] text-slate-950 overflow-x-hidden font-sans"
        ref={containerRef}
      >
        <Navbar />

        <section className="relative min-h-screen flex items-center overflow-hidden">
          <motion.div style={{ y: heroBgY }} className="absolute inset-0 z-0 bg-black">
            <AutoPlayVideo
              src={resolveCloudinaryVideoUrl("/landing/5319084-uhd_3840_2160_25fps.mp4")}
              poster="https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1600&q=80"
              className="w-full h-full object-cover opacity-60 mix-blend-screen scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#140f0a] via-transparent to-transparent opacity-90" />
          </motion.div>

          <motion.div
            style={{ y: heroContentY, opacity: heroOpacity }}
            className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 pt-24 pb-14"
          >
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-white/15 bg-white/6 backdrop-blur-md"
              >
                <MapPin className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold uppercase tracking-[0.26em] text-[#fffaf6]">
                  Based in Dubai · Online Coaching Available
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: easeOut }}
                className="font-extrabold uppercase leading-[0.85] tracking-tight text-[#fffaf6] mb-6"
                style={{ fontSize: "clamp(56px, 9vw, 132px)" }}
              >
                {heroTitle.split("<br/>").map((line, index) => (
                  <span key={index}>
                    {line}
                    {index === 0 ? <br className="hidden md:block" /> : null}
                  </span>
                ))}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="text-[rgba(255,250,246,0.78)] text-lg md:text-xl leading-relaxed max-w-2xl mb-10 font-medium"
              >
                {heroSubtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
              >
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-5 rounded-xl transition-all shadow-xl shadow-orange-500/20 hover:-translate-y-1 text-sm uppercase tracking-[0.18em] w-full sm:w-auto"
                >
                  {ctaPrimary} <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/14 text-[#fffaf6] border border-white/15 font-bold px-8 py-5 rounded-xl transition-all text-sm uppercase tracking-[0.18em] w-full sm:w-auto"
                >
                  {ctaSecondary}
                </a>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <section
          id="how-it-works"
          className="relative py-24 lg:py-32 bg-[#fcfaf6] border-t border-slate-200 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.14),transparent_72%)] pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-14 lg:gap-20 items-start">
            <motion.div {...fadeInScale} className="max-w-2xl">
              <p className="text-[10px] font-black tracking-[0.32em] uppercase text-orange-500 mb-6">
                How It Works
              </p>
              <h2
                className="font-extrabold uppercase leading-[0.88] tracking-tight text-slate-950"
                style={{ fontSize: "clamp(46px, 7vw, 94px)" }}
              >
                {methodTitle.split(".").map((part, index) => (
                  <span key={index} className="block">
                    {part}
                    {part ? "." : ""}
                  </span>
                ))}
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mt-8 max-w-xl">
                A premium coaching service works best when the process is clear. We keep the path simple, accountable, and built around real execution.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, margin: "-100px" }}
              className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)] overflow-hidden"
            >
              {methodSteps.map((stage, index) => (
                <motion.div
                  key={stage.title}
                  variants={itemReveal}
                  className={`flex items-start gap-5 p-6 md:p-8 ${index !== methodSteps.length - 1 ? "border-b border-slate-200" : ""}`}
                >
                  <span className="font-black text-3xl text-slate-300 leading-none">
                    0{index + 1}.
                  </span>
                  <div>
                    <h3 className="text-slate-950 font-black uppercase tracking-[0.18em] mb-2 text-sm">
                      {stage.title}
                    </h3>
                    <p className="text-slate-600 text-sm font-medium leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-24 lg:py-32 bg-[#f3ece2] border-t border-slate-200 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.12),transparent_72%)] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
            <motion.div {...fadeInScale} className="max-w-3xl mb-14">
              <h2 className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500 mb-4 block">
                Respectful Proof
              </h2>
              <h3
                className="font-extrabold uppercase leading-[0.9] tracking-tight text-slate-950"
                style={{ fontSize: "clamp(38px, 5vw, 62px)" }}
              >
                {proofTitle}
              </h3>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed mt-6 max-w-2xl">
                {proofIntro}
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {proofCards.map((card) => (
                <motion.div
                  key={card.title}
                  variants={itemReveal}
                  className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
                >
                  {card.media ? (
                    <div
                      className="mb-6 h-40 rounded-[1.5rem] bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${resolveCloudinaryImageUrl(card.media)})`,
                      }}
                    />
                  ) : null}
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500 mb-5">
                    {card.eyebrow}
                  </p>
                  <h4 className="text-3xl font-extrabold uppercase leading-[0.92] text-slate-950 mb-4">
                    {card.title}
                  </h4>
                  <p className="text-sm md:text-base leading-relaxed text-slate-600 mb-8">
                    {card.description}
                  </p>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8f4ee] px-5 py-4">
                    <p className="text-lg font-black uppercase tracking-tight text-slate-950">
                      {card.metric}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500 mt-2">
                      {card.detail}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section
          id="capabilities"
          className="py-24 lg:py-32 bg-[#fffdf9] border-t border-slate-200"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <motion.div {...fadeInScale} className="text-center mb-20 max-w-3xl mx-auto">
              <h2 className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500 mb-4 block">
                Our Capabilities
              </h2>
              <h3
                className="font-extrabold uppercase leading-none text-slate-950"
                style={{ fontSize: "clamp(40px, 6vw, 70px)" }}
              >
                {capabilitiesTitle.split("<br/>").map((line, index) => (
                  <span key={index}>
                    {line}
                    {index === 0 ? <br /> : null}
                  </span>
                ))}
              </h3>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {capabilitiesItems.map((cap, index) => (
                <motion.div
                  key={cap.title}
                  variants={itemReveal}
                  className={`${index === 0 || index === 3 ? "md:col-span-2" : ""} group relative rounded-[2rem] overflow-hidden border border-slate-200 min-h-[400px] shadow-[0_24px_60px_rgba(15,23,42,0.08)]`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    aria-hidden="true"
                      style={{
                        backgroundImage: `url(${resolveCloudinaryImageUrl(
                          cap.image ||
                            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80"
                        )})`,
                      }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/72 to-slate-950/28" />
                  <div
                    className={`relative z-10 p-8 md:p-10 h-full flex flex-col justify-end ${index === 3 ? "items-end text-right" : ""}`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/14 flex items-center justify-center mb-6 border border-orange-500/30">
                      {cap.icon === "Target" ? (
                        <Target className="w-6 h-6 text-orange-400" />
                      ) : null}
                      {cap.icon === "TrendingUp" ? (
                        <TrendingUp className="w-6 h-6 text-orange-400" />
                      ) : null}
                      {cap.icon === "Calendar" ? (
                        <Calendar className="w-6 h-6 text-orange-400" />
                      ) : null}
                      {cap.icon === "Utensils" ? (
                        <Utensils className="w-6 h-6 text-orange-400" />
                      ) : null}
                      {!["Target", "TrendingUp", "Calendar", "Utensils"].includes(
                        cap.icon ?? ""
                      ) ? (
                        <CheckCheck className="w-6 h-6 text-orange-400" />
                      ) : null}
                    </div>
                    <h4 className="font-extrabold uppercase text-3xl md:text-4xl text-[#fffaf6] mb-3 tracking-tight">
                      {cap.title}
                    </h4>
                    <p className="text-[rgba(255,250,246,0.78)] font-medium max-w-sm">
                      {cap.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section
          id="services"
          className="py-24 lg:py-32 bg-[#f3ece2] border-t border-slate-200 overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-full h-[420px] bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.12),transparent_72%)] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
            <motion.div
              {...fadeInScale}
              className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20"
            >
              <div className="max-w-xl">
                <h2 className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500 mb-4 block">
                  Coaching Plans
                </h2>
                <h3
                  className="font-extrabold uppercase leading-[0.9] tracking-tight text-slate-950"
                  style={{ fontSize: "clamp(44px, 6vw, 70px)" }}
                >
                  Execution <br /> Meets Focus.
                </h3>
              </div>
              <p className="text-slate-600 font-medium max-w-md md:text-right">
                Whether you are here to lose fat, build strength, or dial in your nutrition, there is a plan that fits.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {servicesItems.map((service) => (
                <motion.div
                  key={service.title}
                  variants={itemReveal}
                  className="group relative bg-white rounded-[2rem] overflow-hidden shadow-[0_24px_60px_rgba(15,23,42,0.08)] flex flex-col h-full border border-slate-200"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center transition-all duration-700 group-hover:scale-110"
                      aria-hidden="true"
                      style={{
                        backgroundImage: `url(${resolveCloudinaryImageUrl(
                          service.image ||
                            "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"
                        )})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/18 to-transparent" />
                  </div>
                  <div className="relative -mt-10 p-8 flex flex-col flex-grow bg-white/95 backdrop-blur-xl rounded-t-[2rem] border-t border-slate-200 z-10">
                    <h4 className="font-extrabold uppercase text-3xl text-slate-950 mb-3 leading-[0.9]">
                      {service.title}
                    </h4>
                    <p className="text-slate-600 font-medium text-sm leading-relaxed mb-8 flex-grow">
                      {service.description}
                    </p>
                    <Link
                      href="/register"
                      className="mt-auto inline-flex items-center justify-between w-full text-slate-700 font-bold hover:text-orange-500 transition-colors uppercase tracking-[0.18em] text-xs"
                    >
                      Learn More <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
 
        <section className="py-24 bg-[#fffdf9] border-y border-slate-200 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div {...fadeInScale} className="order-2 lg:order-1">
                <h2
                  className="font-extrabold uppercase leading-[0.9] tracking-tight text-slate-950 mb-6"
                  style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
                >
                  Execution <br /> Stays <span className="text-orange-500">Visual.</span>
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed mb-8 font-medium">
                  Every session is logged. Every week you can see how training, check-ins, and accountability are stacking up.
                </p>

                <ul className="space-y-5">
                  {showcasePoints.map((item, index) => (
                    <motion.li
                      key={item}
                      whileInView={{ opacity: 1, x: 0 }}
                      initial={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4 items-start"
                    >
                      <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <CheckCheck className="w-3.5 h-3.5 text-orange-500" />
                      </div>
                      <span className="text-slate-800 font-bold">{item}</span>
                    </motion.li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="mt-10 inline-flex items-center gap-2 text-orange-500 font-bold hover:text-orange-600 transition-colors uppercase tracking-[0.18em] text-sm"
                >
                  Explore The App <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, rotateY: 20, scale: 0.92 }}
                whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="relative rounded-[2rem] overflow-hidden shadow-[0_24px_60px_rgba(15,23,42,0.12)] border border-slate-200 bg-white order-1 lg:order-2"
              >
                <AutoPlayVideo
                  src="/landing/13692014_1920_1080_25fps.mp4"
                  className="w-full aspect-[16/9] object-cover pointer-events-none"
                />
              </motion.div>
            </div>
          </div>
        </section>

        <section
          id="coach"
          className="py-24 lg:py-32 bg-[#f6f0e7] relative overflow-hidden border-t border-slate-200"
        >
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[160px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <motion.div {...fadeInScale} className="w-full max-w-md lg:w-1/2 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#140f0a] via-transparent to-transparent z-10 opacity-60 rounded-[3rem]" />
                <AutoPlayVideo
                  src={resolveCloudinaryVideoUrl("/landing/6390155-uhd_2160_3840_25fps.mp4")}
                  className="w-full aspect-[4/5] object-cover rounded-[3rem] border border-slate-200 shadow-[0_30px_80px_rgba(15,23,42,0.12)] grayscale hover:grayscale-0 transition-all duration-700"
                />
                <motion.div
                  whileHover={{ y: -10 }}
                  className="absolute -bottom-8 -right-8 bg-white border border-slate-200 p-6 rounded-3xl shadow-xl z-20 hidden md:block"
                >
                  <p className="text-orange-500 font-black text-4xl leading-none">
                    {coachExperience.split(" ")[0]}
                  </p>
                  <p className="text-slate-500 font-bold uppercase tracking-[0.16em] text-xs mt-1">
                    {coachExperience.split(" ").slice(1).join(" ")}
                  </p>
                </motion.div>
              </motion.div>

              <div className="w-full lg:w-1/2">
                <motion.div {...fadeInScale}>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500 mb-4 block">
                    Meet Your Head Coach
                  </h2>
                  <h3
                    className="font-extrabold uppercase leading-none text-slate-950 mb-8 block"
                    style={{ fontSize: "clamp(48px, 6vw, 80px)" }}
                  >
                    {coachName.split(" ").map((name, index) => (
                      <span key={name}>
                        {name}
                        {index === 0 ? <br /> : " "}
                      </span>
                    ))}
                  </h3>
                  <p className="text-slate-600 text-lg leading-relaxed mb-8 font-medium italic">
                    &quot;{coachQuote}&quot;
                  </p>
                </motion.div>

                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="whileInView"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10"
                >
                  <motion.div
                    variants={itemReveal}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                  >
                    <Dumbbell className="w-6 h-6 text-orange-500 mb-4" />
                    <p className="font-bold text-slate-950 mb-1">Elite Conditioning</p>
                    <p className="text-sm text-slate-600">
                      Raw strength and athletic conditioning without generic templates.
                    </p>
                  </motion.div>
                  <motion.div
                    variants={itemReveal}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                  >
                    <TrendingUp className="w-6 h-6 text-orange-500 mb-4" />
                    <p className="font-bold text-slate-950 mb-1">{coachSpecialty}</p>
                    <p className="text-sm text-slate-600">
                      Every macro, milestone, and weekly commitment stays accountable.
                    </p>
                  </motion.div>
                </motion.div>

                <motion.div {...fadeInScale}>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 text-white font-bold px-8 py-5 rounded-xl bg-orange-500 hover:bg-orange-600 transition-all uppercase tracking-[0.18em] text-sm shadow-xl shadow-orange-500/20"
                  >
                    Start Working Together
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="results"
          className="py-24 lg:py-32 bg-[#fffaf4] overflow-hidden border-t border-slate-200"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <motion.div
              {...fadeInScale}
              className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
            >
              <div className="max-w-2xl">
                <h2 className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500 mb-4 block">
                  Proven Results
                </h2>
                <h3
                  className="font-extrabold uppercase leading-none text-slate-950"
                  style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
                >
                  The proof lives in <br /> the life you keep.
                </h3>
                <p className="text-slate-600 text-base md:text-lg leading-relaxed mt-6">
                  Instead of old comparison shots, we lead with the outcomes people actually care about: consistency, confidence, and a body that feels more capable in public.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {resultsPillars.map((pillar) => (
                <motion.div
                  key={pillar.title}
                  variants={itemReveal}
                  className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] flex flex-col"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500 mb-4">
                    {pillar.title}
                  </p>
                  <h4 className="text-3xl font-extrabold uppercase leading-[0.92] text-slate-950 mb-4">
                    {pillar.value}
                  </h4>
                  <p className="text-sm md:text-base leading-relaxed text-slate-600 flex-grow">
                    {pillar.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="relative py-32 lg:py-48 bg-[#140f0a] overflow-hidden border-t border-slate-200">
          <div className="absolute inset-0 z-0 bg-black">
                <AutoPlayVideo
                  src={resolveCloudinaryVideoUrl("/landing/14170400_1920_1080_25fps.mp4")}
                  className="w-full h-full object-cover opacity-40 grayscale mix-blend-luminosity pointer-events-none"
                />
            <div className="absolute inset-0 bg-gradient-to-t from-[#140f0a] via-[#140f0a]/70 to-[#140f0a]/90" />
          </div>

          <motion.div
            {...fadeInScale}
            className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 flex flex-col items-center text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Play className="w-16 h-16 text-orange-500 mb-8 opacity-80" />
            </motion.div>
            <h2
              className="font-extrabold uppercase text-[#fffaf6] leading-[0.85] tracking-tight mb-6"
              style={{ fontSize: "clamp(50px, 8vw, 120px)" }}
            >
              No Excuses. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                Only Execution.
              </span>
            </h2>
          </motion.div>
        </section>

        {activeTestimonials.length > 0 ? (
          <section className="py-24 bg-[#f3ece2] border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
              <motion.div {...fadeInScale} className="text-center mb-16 max-w-3xl mx-auto">
                <h2
                  className="font-extrabold uppercase leading-tight text-slate-950 mb-4"
                  style={{ fontSize: "clamp(32px, 4vw, 54px)" }}
                >
                  {config?.testimonials_title || "Do Not Just Take Our Word For It"}
                </h2>
              </motion.div>

              <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="whileInView"
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {activeTestimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id || index}
                    variants={itemReveal}
                    className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-[0_24px_60px_rgba(15,23,42,0.08)] relative"
                  >
                    <Quote className="absolute top-8 right-8 w-12 h-12 text-slate-200 opacity-80" />
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(testimonial.rating || 5)].map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className="w-4 h-4 fill-orange-500 text-orange-500"
                        />
                      ))}
                    </div>
                    <p className="text-slate-700 font-medium italic leading-relaxed mb-8 relative z-10 text-sm">
                      &quot;{testimonial.quote}&quot;
                    </p>
                    <div>
                      <p className="font-bold text-slate-950 text-sm">{testimonial.name}</p>
                      <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.18em] mt-1">
                        {testimonial.location || testimonial.role}
                        {testimonial.result_label ? ` | ${testimonial.result_label}` : ""}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        ) : null}

        <section className="relative py-32 rounded-[3rem] mx-4 md:mx-10 mb-10 overflow-hidden shadow-[0_20px_50px_rgba(249,115,22,0.12)] border border-slate-200">
          <div className="absolute inset-0 z-0 bg-black">
            <div
              className="w-full h-full bg-cover bg-center opacity-20 mix-blend-luminosity grayscale"
              aria-hidden="true"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2000&q=80)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#140f0a] via-[#140f0a]/80 to-[#140f0a]/40" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-600/18 rounded-[100%] blur-[120px] pointer-events-none" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 bg-white/8 border border-white/15 rounded-full shadow-sm"
            >
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#fffaf6]">
                Taking new clients in Dubai and online
              </span>
            </motion.div>

            <h2
              className="font-extrabold uppercase text-[#fffaf6] mb-6 leading-[0.9]"
              style={{ fontSize: "clamp(48px, 8vw, 100px)" }}
            >
              Stop Guessing. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                Start Training.
              </span>
            </h2>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-black px-12 py-6 rounded-2xl hover:-translate-y-1 transition-all uppercase tracking-[0.18em] text-sm"
            >
              Take The Assessment <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>

        <footer className="py-12 border-t border-slate-200 bg-[#140f0a] text-center">
          <div className="max-w-7xl mx-auto px-6">
            <p className="font-extrabold uppercase text-[#fffaf6] text-2xl tracking-tight mb-4">
              iShow<span className="text-orange-500">Transformation</span>
            </p>
            <div className="flex items-center justify-center gap-6 mb-6">
              <Link
                href="/privacy"
                className="text-sm font-semibold text-[rgba(255,250,246,0.6)] hover:text-[#fffaf6] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm font-semibold text-[rgba(255,250,246,0.6)] hover:text-[#fffaf6] transition-colors"
              >
                Terms of Service
              </Link>
              <a
                href="https://www.instagram.com/sufiyan_mohd26/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[rgba(255,250,246,0.6)] hover:text-orange-500 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs font-semibold text-[rgba(255,250,246,0.5)] uppercase tracking-[0.18em]">
              Dubai, UAE
            </p>
          </div>
        </footer>
      </div>
    </SmoothScroll>
  );
}
