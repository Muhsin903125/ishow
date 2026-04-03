import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import {
  Dumbbell,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Zap,
  Heart,
  Trophy,
  Play,
  Flame,
  Target,
  Activity,
  Shield,
  Award,
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
    title: "Personalized Training",
    description: "Custom workout plans built around your fitness level, goals, and lifestyle.",
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&h=900&auto=format&fit=crop&q=80",
  },
  {
    icon: Heart,
    title: "Nutrition Guidance",
    description: "Comprehensive dietary strategies to fuel performance and accelerate recovery.",
    img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=700&h=900&auto=format&fit=crop&q=80",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Real-time analytics and milestone tracking so you see exactly how far you have come.",
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&h=900&auto=format&fit=crop&q=80",
  },
  {
    icon: Users,
    title: "1-on-1 Sessions",
    description: "Personal coaching with live form correction, motivation, and full accountability.",
    img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=700&h=900&auto=format&fit=crop&q=80",
  },
];

const stats = [
  { value: "200+", label: "Clients Transformed", icon: Users },
  { value: "98%",  label: "Success Rate",        icon: Trophy },
  { value: "5.0★", label: "Average Rating",      icon: Star },
  { value: "8+",   label: "Years Experience",    icon: Award },
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
    cta: "Build My Foundation",
    img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=700&h=400&auto=format&fit=crop&q=80",
  },
  {
    name: "Transformation",
    price: 199,
    tag: "Most Popular" as string | null,
    sessions: "4-day plan + weekly coaching",
    summary: "The core iShowTransformation package for fat loss, muscle gain, and consistent weekly progress.",
    bestFor: "Clients who want structure and accountability",
    featured: true,
    features: [
      "Everything in Foundation",
      "Custom nutrition targets",
      "Weekly trainer plan updates",
      "Video form analysis",
      "WhatsApp support",
    ],
    cta: "Choose Transformation",
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&h=400&auto=format&fit=crop&q=80",
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
    cta: "Go Elite",
    img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=700&h=400&auto=format&fit=crop&q=80",
  },
];

const gallery = [
  { src: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=900&h=500&auto=format&fit=crop&q=80", alt: "Athletes training", wide: true },
  { src: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=600&auto=format&fit=crop&q=80", alt: "Strength training", wide: false },
  { src: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&h=600&auto=format&fit=crop&q=80", alt: "Workout session", wide: false },
  { src: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=600&auto=format&fit=crop&q=80", alt: "Cardio running", wide: false },
  { src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&auto=format&fit=crop&q=80", alt: "Gym equipment", wide: false },
  { src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=600&auto=format&fit=crop&q=80", alt: "Personal coaching", wide: false },
];

const testimonials = [
  {
    name: "Sarah M.",
    result: "Lost 25 lbs in 3 months",
    text: "The personalized approach made all the difference. My trainer understood my limitations and pushed me in exactly the right way.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&auto=format&fit=crop&q=80",
  },
  {
    name: "James K.",
    result: "Completed first marathon",
    text: "Went from couch potato to finishing my first marathon. The structured programs and accountability were absolute game-changers.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&auto=format&fit=crop&q=80",
  },
  {
    name: "Elena R.",
    result: "Gained 15 lbs of muscle",
    text: "Finally found a trainer who takes the time to understand your goals. The online portal makes tracking everything incredibly easy.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&auto=format&fit=crop&q=80",
  },
];

// --- PAGE ---

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Navbar />

      {/* 1. HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=1080&auto=format&fit=crop&q=80"
            alt="Professional gym training"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>
        <div className="absolute top-1/4 right-1/3 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 backdrop-blur-sm rounded-full px-5 py-2.5 mb-8">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-orange-300 text-sm font-semibold tracking-widest uppercase">Elite Personal Training</span>
            </div>

            <h1 className="text-7xl sm:text-8xl lg:text-[108px] font-black leading-[0.88] tracking-tighter text-white mb-7">
              FORGE
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-400">
                YOUR BEST
              </span>
              SELF.
            </h1>

            <p className="text-xl lg:text-2xl text-white/60 max-w-xl mb-10 leading-relaxed font-light">
              Science-backed training. Expert coaching. Real results.
              Your transformation starts the moment you decide.
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
                href="/#services"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-full font-bold text-lg transition-all backdrop-blur-sm"
              >
                Explore Programs
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex flex-wrap gap-8 pt-8 border-t border-white/10">
              {[
                { v: "200+",   l: "Clients Transformed" },
                { v: "98%",    l: "Success Rate" },
                { v: "8+ yrs", l: "Experience" },
                { v: "5.0★",   l: "Rating" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="text-4xl font-black text-white">{s.v}</p>
                  <p className="text-white/45 text-sm mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden xl:flex flex-col gap-4 absolute right-8 top-1/2 -translate-y-1/2">
            {[
              { icon: Trophy,       bg: "bg-orange-500/25", ic: "text-orange-400", title: "Certified Trainer", sub: "NASM & CSCS Certified" },
              { icon: CheckCircle,  bg: "bg-green-500/25",  ic: "text-green-400",  title: "Proven Methods",   sub: "200+ success stories" },
              { icon: Star,         bg: "bg-blue-500/25",   ic: "text-blue-400",   title: "5-Star Rated",     sub: "Across 200+ reviews" },
            ].map((card, ci) => {
              const Icon = card.icon;
              return (
                <div key={ci} className="animate-float bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4 w-64 shadow-2xl">
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
      <section id="services" className="py-28 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-4">
              <Trophy className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 text-sm font-semibold tracking-widest uppercase">What We Offer</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black mb-4">
              Everything You Need
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                To Succeed
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Comprehensive fitness services designed around your unique goals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <div key={svc.title} className="group relative overflow-hidden rounded-3xl aspect-[3/4] cursor-pointer">
                  <Image
                    src={svc.img}
                    alt={svc.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent group-hover:from-black/90 transition-all duration-500" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/30 backdrop-blur-sm border border-orange-500/30 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="font-black text-white text-xl mb-2">{svc.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300">
                      {svc.description}
                    </p>
                    <p className="mt-3 flex items-center gap-2 text-orange-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300">
                      Learn More <ArrowRight className="w-4 h-4" />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. STATS BANNER */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1920&h=700&auto=format&fit=crop&q=80"
            alt="Intense training"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-blue-950/90" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5 backdrop-blur-sm">
                    <Icon className="w-8 h-8 text-orange-400" />
                  </div>
                  <p className="text-5xl lg:text-6xl font-black text-white mb-2">{stat.value}</p>
                  <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. VIDEO */}
      <section className="py-28 bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2 mb-4">
              <Play className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-semibold tracking-widest uppercase">See It In Action</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-4">
              Watch Our Training
              <span className="text-orange-400"> Philosophy</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Science-backed methods combined with personalised coaching to deliver extraordinary results.
            </p>
          </div>
          <div className="relative rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(251,146,60,0.15)] border border-white/5 aspect-video">
            <iframe
              src="https://www.youtube-nocookie.com/embed/IODxDxX7oi4?rel=0&modestbranding=1&color=white"
              title="iShowTransformation Training Philosophy"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* 6. GALLERY */}
      <section id="gallery" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-4">
              Built in the <span className="text-orange-400">Gym</span>
            </h2>
            <p className="text-gray-500 text-lg">Real training. Real effort. Real results.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {gallery.map((img, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-2xl group cursor-pointer ${
                  img.wide ? "col-span-2 aspect-[16/7]" : "aspect-square"
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <p className="absolute bottom-4 left-4 text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  {img.alt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS */}
      <section id="how-it-works" className="relative overflow-hidden bg-neutral-950 py-28 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.24),transparent_36%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:88px_88px] opacity-[0.08]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 self-start">
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
                {journeyHighlights.map((highlight) => (
                  <div
                    key={highlight.label}
                    className="rounded-3xl border border-white/10 bg-white/5 px-5 py-6 backdrop-blur-sm"
                  >
                    <p className="text-3xl font-black text-white">{highlight.value}</p>
                    <p className="mt-2 text-sm text-white/55">{highlight.label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
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
                  href="/#services"
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
                      className={`relative overflow-hidden rounded-[2rem] border border-white/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 sm:p-8 ${
                        i % 2 === 0 ? "bg-white/5 sm:mr-12" : "bg-white/10 sm:ml-12"
                      }`}
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

      {/* 8. PROGRAMS */}
      <section className="py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-4">
              <Dumbbell className="w-4 h-4 text-blue-700" />
              <span className="text-blue-700 text-sm font-semibold tracking-widest uppercase">Coaching Plans</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-4">
              Choose Your <span className="text-orange-500">Program</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Pick the level of structure and accountability that matches your current stage. Every option starts with assessment, programming, and coach-led direction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {programs.map((prog) => (
              <div
                key={prog.name}
                className={`relative rounded-3xl overflow-hidden shadow-xl transition-all hover:-translate-y-1 ${
                  prog.featured ? "ring-2 ring-orange-500 shadow-orange-500/20 md:scale-105 z-10" : ""
                }`}
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={prog.img}
                    alt={prog.name}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                  {prog.tag && (
                    <div className={`absolute top-4 right-4 text-white text-xs font-black px-4 py-2 rounded-full tracking-wider ${
                      prog.featured ? "bg-orange-500" : "bg-blue-700"
                    }`}>
                      {prog.tag}
                    </div>
                  )}
                </div>

                <div className={`p-8 ${prog.featured ? "bg-gray-900 text-white" : "bg-white"}`}>
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

      {/* 9. TRAINER SPOTLIGHT */}
      <section id="trainer" className="py-28 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-6">
                <Shield className="w-4 h-4 text-blue-700" />
                <span className="text-blue-700 text-sm font-semibold tracking-widest uppercase">Trainer Details</span>
              </div>
              <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-3 leading-tight">Mohammed Sufiyan</h2>
              <h3 className="text-xl font-semibold text-blue-700 mb-6">Transformation Coach and Accountability-Led Trainer</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Mohammed Sufiyan anchors the iShowTransformation coaching experience with structured programming,
                disciplined weekly check-ins, and a practical focus on sustainable body transformation. The goal is
                simple: consistent training, clear progress markers, and coaching that keeps clients moving.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Target, label: "Coaching Focus", sub: "Strength, conditioning, and body recomposition" },
                  { icon: Users, label: "Style", sub: "High-accountability coaching with weekly follow-up" },
                  { icon: Trophy, label: "Sessions", sub: "1-on-1 guidance with custom progression" },
                  { icon: Star, label: "Instagram", sub: "@sufiyan_mohd26" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <Icon className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                        <p className="text-gray-500 text-xs leading-relaxed">{item.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gray-950 rounded-3xl p-6 text-white mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-400 mb-3">What Clients Get</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Assessment-first training decisions",
                    "Progressive weekly workout structure",
                    "Clear session direction and follow-through",
                    "A direct line to Mohammed on Instagram",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-gray-200">
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-700/30 hover:-translate-y-0.5"
                >
                  Start with Mohammed
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="https://www.instagram.com/sufiyan_mohd26/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-full font-bold text-lg transition-all border border-gray-200 shadow-sm"
                >
                  View Instagram
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl col-span-2">
                  <Image
                    src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&h=1100&auto=format&fit=crop&q=80"
                    alt="Coach guiding a strength training session"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <div className="absolute left-6 bottom-6 right-6 rounded-2xl bg-black/55 backdrop-blur-md border border-white/10 p-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-orange-300 mb-2">Mohammed Sufiyan</p>
                    <p className="text-2xl font-black leading-tight">Focused coaching built around transformation, routine, and repeatable progress.</p>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden aspect-[5/4] shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=700&h=560&auto=format&fit=crop&q=80"
                    alt="One-on-one gym coaching"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                <div className="relative rounded-2xl overflow-hidden aspect-[5/4] shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&h=560&auto=format&fit=crop&q=80"
                    alt="Structured gym training environment"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              </div>

              <div className="absolute -left-4 top-10 lg:-left-8 bg-white rounded-2xl p-5 shadow-2xl border border-gray-100 animate-float">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500 mb-1">Instagram</p>
                <p className="font-black text-gray-900 text-sm">@sufiyan_mohd26</p>
                <p className="text-gray-500 text-xs">Public trainer profile</p>
              </div>

              <div className="absolute -right-3 bottom-10 lg:-right-6 bg-gray-900 rounded-2xl p-5 shadow-2xl animate-float" style={{ animationDelay: "1.5s" }}>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-3xl font-black text-orange-400">1:1</p>
                    <p className="text-gray-400 text-xs">Coaching</p>
                  </div>
                  <div className="w-px h-10 bg-gray-700" />
                  <div>
                    <p className="font-bold text-white text-sm">Trainer-Led</p>
                    <p className="text-gray-500 text-xs">Programs and follow-up</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. TESTIMONIALS */}
      <section className="py-28 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-500/15 border border-yellow-500/30 rounded-full px-4 py-2 mb-4">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-semibold tracking-widest uppercase">Success Stories</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black mb-4">
              Real Results from
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
                Real People
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Join hundreds of clients who have permanently changed their lives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white/5 hover:bg-white/8 border border-white/10 rounded-3xl p-8 transition-all hover:-translate-y-1"
              >
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-lg leading-relaxed mb-8 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      width={56}
                      height={56}
                      className="rounded-full object-cover ring-2 ring-orange-500/40"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-gray-950" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">{t.name}</p>
                    <p className="text-orange-400 text-sm font-semibold">{t.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. CTA */}
      <section className="relative py-36 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1920&h=900&auto=format&fit=crop&q=80"
            alt="Intense fitness training"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/96 to-gray-950/75" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 rounded-full px-5 py-2.5 mb-8">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-semibold tracking-widest uppercase">Ready to Start?</span>
          </div>
          <h2 className="text-6xl lg:text-8xl font-black text-white leading-[0.9] mb-6">
            Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400"> Dream Body</span>
            <span className="block">Awaits.</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop waiting. Get a free assessment, build your personalised plan, and start transforming today.
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
            {["Free fitness assessment", "No commitment required", "Cancel anytime"].map((item) => (
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="mb-4 whitespace-nowrap leading-none">
                <span className="font-black text-xl text-white tracking-tight sm:text-2xl">iShow</span>
                <span className="font-black text-xl text-orange-400 tracking-tight sm:text-2xl">Transformation</span>
              </div>
              <p className="text-gray-500 max-w-xs leading-relaxed mb-6 text-sm">
                Elite personal training designed to help you achieve extraordinary results through
                science-backed methods and expert coaching.
              </p>
              <div className="flex gap-3">
                {[Shield, Award, Trophy].map((Icon, i) => (
                  <div key={i} className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center cursor-pointer transition-colors">
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
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
              <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">Account</h4>
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
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>© 2026 iShowTransformation. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-gray-400 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-gray-400 cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
