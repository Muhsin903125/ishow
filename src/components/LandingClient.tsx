"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { 
  Instagram, ArrowRight, Target, Dumbbell, TrendingUp, 
  Calendar, Utensils, MessageSquare, Play, Star, MapPin, CheckCheck
} from "lucide-react";
import Navbar from "@/components/Navbar";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import SmoothScroll from "@/components/SmoothScroll";

interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  result_label: string | null;
  quote: string;
  rating: number;
}

interface LandingClientProps {
  testimonials: Testimonial[];
  config?: any;
  fonts: {
    dm: string;
    barlow: string;
  };
}

export default function LandingClient({ testimonials, config, fonts }: LandingClientProps) {
  const containerRef = useRef(null);
  
  // Hero values
  const heroTitle = config?.hero?.title || "The System For True Momentum.";
  const heroSubtitle = config?.hero?.subtitle || "Real coaching. Real results. Based in Dubai, working with clients across the UAE — online and in person.";
  const ctaPrimary = config?.hero?.cta_primary || "Launch Your Plan";
  const ctaSecondary = config?.hero?.cta_secondary || "See Inside";

  // Methodology values
  const methodTitle = config?.methodology?.title || "Start With A Clear Plan. Not Guesswork.";
  const methodSteps = config?.methodology?.steps || [
    { title: "Assessment", description: "Start with your real baseline before the plan begins." },
    { title: "Plan Mapped", description: "Trainer-led programming shaped around your lifestyle." },
    { title: "Coach Follow-Up", description: "Clear weekly direction and direct accountability." }
  ];

  // Coach values
  const coachName = config?.coach?.name || "Mohammed Sufiyan";
  const coachQuote = config?.coach?.quote || "I started iShow because I was tired of seeing people waste months on plans that weren't built for them.";
  const coachExperience = config?.coach?.experience || "10+ Years";
  const coachSpecialty = config?.coach?.specialty || "Elite Transformation";

  // Hero Parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroBgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroContentY = useTransform(scrollYProgress, [0, 1], ["0%", "150%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Gallery Parallax Settings
  const galleryRef = useRef(null);
  const { scrollYProgress: galleryProgress } = useScroll({
    target: galleryRef,
    offset: ["start end", "end start"]
  });
  
  const slowY = useTransform(galleryProgress, [0, 1], ["0%", "15%"]);
  const superSlowY = useTransform(galleryProgress, [0, 1], ["0%", "8%"]);

  const fadeInScale = {
    initial: { opacity: 0, scale: 0.95, y: 30 },
    whileInView: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any }
    },
    viewport: { once: true, margin: "-100px" }
  };

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.1
      }
    },
    viewport: { once: true, margin: "-100px" }
  };

  const itemReveal = {
    initial: { opacity: 0, y: 20 },
    whileInView: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }
    }
  };

  return (
    <SmoothScroll>
      <div className={`${fonts.dm} ${fonts.barlow} font-[family-name:var(--font-dm)] bg-zinc-950 text-white overflow-x-hidden`} ref={containerRef}>
        <Navbar />

        {/* 1. HERO WITH VIDEO BACKGROUND */}
        <section className="relative h-screen flex items-center overflow-hidden">
          {/* Background Video with Parallax */}
          <motion.div style={{ y: heroBgY }} className="absolute inset-0 z-0 bg-black">
            <AutoPlayVideo
              src="/landing/5319084-uhd_3840_2160_25fps.mp4"
              poster="https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1600&q=80"
              className="w-full h-full object-cover opacity-60 mix-blend-screen scale-110"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-90" />
          </motion.div>

          <motion.div 
            style={{ y: heroContentY, opacity: heroOpacity }}
            className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 pt-24 pb-12"
          >
            <div className="max-w-3xl">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-full"
              >
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">
                  Based in Dubai · Online Coaching Available
                </span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-[0.85] tracking-tight text-white mb-6" 
                style={{ fontSize: "clamp(55px, 9vw, 130px)" }}
              >
                {heroTitle.split('<br/>').map((line: string, i: number) => (
                  <span key={i}>
                    {line}
                    {i === 0 && <br className="hidden md:block" />}
                  </span>
                ))}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="text-zinc-400 text-lg md:text-xl leading-relaxed max-w-xl mb-10 font-medium"
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
                  className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-5 rounded-xl transition-all shadow-xl shadow-orange-500/20 hover:-translate-y-1 text-sm uppercase tracking-wider w-full sm:w-auto"
                >
                  {ctaPrimary} <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 font-bold px-8 py-5 rounded-xl transition-all text-sm uppercase tracking-wider w-full sm:w-auto hover:bg-zinc-800/80"
                >
                  {ctaSecondary}
                </a>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* 2. PLATFORM METHODOLOGY */}
        <section id="how-it-works" className="relative transition-all duration-1000 min-h-[100vh] flex items-center overflow-hidden border-t border-zinc-900 bg-zinc-950 py-24 lg:py-32">
          {/* Background Video */}
          <div className="absolute inset-0 z-0 bg-black">
            <AutoPlayVideo
              src="/landing/14711435_2560_1440_25fps.mp4"
              className="w-full h-full object-cover opacity-40 mix-blend-luminosity grayscale"
            />
          </div>
          {/* Dark overlays for readability */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/70 to-zinc-950/40" />
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-100" />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 py-12 flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-20">
            
            {/* Left Content */}
            <motion.div 
              {...fadeInScale}
              className="max-w-2xl flex-1"
            >
              <p className="text-[10px] font-black tracking-[0.3em] uppercase text-orange-500 mb-6 drop-shadow-sm">
                How It Works
              </p>
              
              <h2 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-[0.85] tracking-tight mb-6 flex flex-col" style={{ fontSize: "clamp(48px, 8vw, 100px)" }}>
                {methodTitle.split('.').map((part: string, i: number) => (
                  <span key={i} className={`drop-shadow-lg ${i === 2 ? "text-zinc-700/60 mt-1" : "text-white " + (i === 1 ? "mt-1" : "")}`}>
                    {part}{part && "."}
                  </span>
                ))}
              </h2>
            </motion.div>

            {/* Right Content - Stages overlay */}
            <motion.div 
               variants={staggerContainer}
               initial="initial"
               whileInView="whileInView"
               viewport={{ once: true, margin: "-100px" }}
               className="flex-1 w-full max-w-lg lg:max-w-none flex flex-col z-20"
            >
              <div className="border border-zinc-800/60 bg-zinc-950/40 backdrop-blur-md rounded-sm overflow-hidden divide-y divide-zinc-800/60">
                {methodSteps.map((stage: any, i: number) => (
                  <motion.div 
                    key={i}
                    variants={itemReveal}
                    className="flex items-start gap-5 p-6 md:p-8 hover:bg-zinc-900/40 transition-colors group"
                  >
                    <span className="font-[family-name:var(--font-barlow)] font-black text-3xl text-zinc-700 group-hover:text-orange-500 transition-colors leading-none">0{i+1}.</span>
                    <div>
                      <h3 className="text-white font-black uppercase tracking-widest mb-2 text-sm">{stage.title}</h3>
                      <p className="text-zinc-500 text-sm font-medium">{stage.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ... existing sections ... */}

        {/* 6. COACH SPOTLIGHT */}
        <section id="coach" className="py-24 lg:py-32 bg-zinc-950 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[150px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <motion.div 
                {...fadeInScale}
                className="w-full max-w-md lg:w-1/2 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10 opacity-60" />
                <AutoPlayVideo 
                  src="/landing/6390155-uhd_2160_3840_25fps.mp4"
                  className="w-full aspect-[4/5] object-cover rounded-[3rem] border border-zinc-800 shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                />
                <motion.div 
                   whileHover={{ y: -10 }}
                   className="absolute -bottom-8 -right-8 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl z-20 hidden md:block group"
                >
                  <p className="text-orange-500 font-black text-4xl leading-none font-[family-name:var(--font-barlow)]">{coachExperience.split(' ')[0]}</p>
                  <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-1">{coachExperience.split(' ').slice(1).join(' ')}</p>
                </motion.div>
              </motion.div>
              
              <div className="w-full lg:w-1/2">
                <motion.div {...fadeInScale}>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4 block">Meet Your Head Coach</h2>
                  <h3 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-none text-white mb-8 block" style={{ fontSize: "clamp(48px, 6vw, 80px)" }}>
                    {coachName.split(' ').map((n: string, i: number) => (
                      <span key={i}>
                        {n} {i === 0 && <br/>}
                      </span>
                    ))}
                  </h3>
                  <p className="text-zinc-400 text-lg leading-relaxed mb-8 font-medium italic">
                    &quot;{coachQuote}&quot;
                  </p>
                </motion.div>
                
                <motion.div 
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="whileInView"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10"
                >
                  <motion.div variants={itemReveal} className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 hover:bg-zinc-900 transition-colors">
                    <Dumbbell className="w-6 h-6 text-orange-500 mb-4" />
                    <p className="font-bold text-white mb-1">Elite Conditioning</p>
                    <p className="text-sm text-zinc-500">Raw strength and athletic conditioning.</p>
                  </motion.div>
                  <motion.div variants={itemReveal} className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 hover:bg-zinc-900 transition-colors">
                    <TrendingUp className="w-6 h-6 text-orange-500 mb-4" />
                    <p className="font-bold text-white mb-1">{coachSpecialty}</p>
                    <p className="text-sm text-zinc-500">Every macro and milestone tracked mathematically.</p>
                  </motion.div>
                </motion.div>
                
                <motion.div {...fadeInScale}>
                  <Link href="/register" className="inline-flex items-center gap-2 text-white font-bold px-8 py-5 rounded-xl bg-orange-500 hover:bg-orange-600 transition-all uppercase tracking-widest text-sm shadow-xl shadow-orange-500/20">
                    Start Working Together
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ... remaining sections ... */}

        {/* 3. CAPABILITIES GRID */}
        <section id="capabilities" className="py-24 lg:py-32 bg-zinc-950 relative z-10 border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <motion.div 
              {...fadeInScale}
              className="text-center mb-20 max-w-3xl mx-auto"
            >
              <h2 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4 block">Our Capabilities</h2>
              <h3 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-none text-white" style={{ fontSize: "clamp(40px, 6vw, 70px)" }}>
                A Unified Dashboard <br/> For Total Control
              </h3>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Feature 1 */}
              <motion.div 
                variants={itemReveal}
                className="md:col-span-2 group relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors min-h-[400px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-zinc-950/20 z-10" />
                <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80" alt="Training plan" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0" />
                <div className="relative z-20 p-8 md:p-10 h-full flex flex-col justify-end">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                    <Target className="w-6 h-6 text-orange-500" />
                  </div>
                  <h4 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase text-3xl md:text-4xl text-white mb-3 tracking-tight">1-on-1 Plan Generation</h4>
                  <p className="text-zinc-400 font-medium max-w-sm">No templates. Every single training plan is built exclusively for your baseline and fitness goals.</p>
                </div>
              </motion.div>

              {/* Feature 2 */}
              <motion.div 
                 variants={itemReveal}
                 className="group relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col min-h-[400px]"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/60 to-zinc-950/20 z-10" />
                <img src="https://images.unsplash.com/photo-1521804906057-1df8fdb718b7?auto=format&fit=crop&w=800&q=80" alt="Analytics" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0" />
                <div className="relative z-20 p-8 md:p-10 h-full flex flex-col justify-end">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                  </div>
                  <h4 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase text-2xl text-white mb-2 tracking-tight">Granular Analytics</h4>
                  <p className="text-zinc-400 font-medium text-sm leading-relaxed">Track every rep and milestone. View progression with dynamic charting.</p>
                </div>
              </motion.div>

              {/* Feature 3 */}
              <motion.div 
                 variants={itemReveal}
                 className="group relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col min-h-[400px]"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/60 to-zinc-950/20 z-10" />
                <img src="https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?auto=format&fit=crop&w=800&q=80" alt="Scheduling" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0" />
                <div className="relative z-20 p-8 md:p-10 h-full flex flex-col justify-end">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                    <Calendar className="w-6 h-6 text-orange-500" />
                  </div>
                  <h4 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase text-2xl text-white mb-2 tracking-tight">Session Scheduling</h4>
                  <p className="text-zinc-400 font-medium text-sm leading-relaxed">Never miss a workout. We log daily scheduled sessions to your calendar.</p>
                </div>
              </motion.div>

              {/* Feature 4 */}
              <motion.div 
                 variants={itemReveal}
                 className="md:col-span-2 group relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors min-h-[400px]"
              >
                <div className="absolute inset-0 bg-gradient-to-l from-zinc-950/90 via-zinc-950/60 to-zinc-950/20 z-10" />
                <img src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80" alt="Nutrition" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0" />
                <div className="relative z-20 p-8 md:p-10 h-full flex flex-col justify-end items-end text-right">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                    <Utensils className="w-6 h-6 text-orange-500" />
                  </div>
                  <h4 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase text-3xl md:text-4xl text-white mb-3 tracking-tight">Nutrition & Fueling</h4>
                  <p className="text-zinc-400 font-medium max-w-sm">Receive macro breakdowns and daily caloric targets designed for your objective.</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 4. OUR SERVICES */}
        <section id="services" className="py-24 lg:py-32 bg-[#0D0D0F] border-t border-zinc-900 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
            <motion.div 
              {...fadeInScale}
              className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20"
            >
              <div className="max-w-xl">
                <h2 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4 block">Coaching Plans</h2>
                <h3 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-[0.9] tracking-tight text-white" style={{ fontSize: "clamp(44px, 6vw, 70px)" }}>
                  Execution <br/> Meets Focus.
                </h3>
              </div>
              <p className="text-zinc-400 font-medium max-w-md md:text-right">
                Whether you&apos;re here to lose fat, build strength, or dial in your nutrition — there&apos;s a plan that fits.
              </p>
            </motion.div>

            <motion.div 
               variants={staggerContainer}
               initial="initial"
               whileInView="whileInView"
               viewport={{ once: true }}
               className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                { title: "Complete Transformation", img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80", desc: "Full protocol encompassing precision training, macros, and extreme accountability." },
                { title: "Elite Athleticism", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80", desc: "Focus on explosive power, reactive agility, and raw strength for competitive athletes." },
                { title: "Nutrition Only Hub", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80", desc: "A strictly nutritional track for individuals who already have their training dialed in." }
              ].map((srv, idx) => (
                <motion.div 
                  key={idx} 
                  variants={itemReveal}
                  className="group relative bg-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-full border border-zinc-800"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                     <img src={srv.img} alt={srv.title} className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                     <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                  </div>
                  <div className="relative -mt-10 p-8 flex flex-col flex-grow bg-zinc-950/90 backdrop-blur-xl rounded-t-[2rem] border-t border-zinc-800 z-20">
                    <h4 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase text-3xl text-white mb-3 leading-[0.9]">{srv.title}</h4>
                    <p className="text-zinc-400 font-medium text-sm leading-relaxed mb-8 flex-grow">{srv.desc}</p>
                    <Link href="/register" className="mt-auto inline-flex items-center justify-between w-full text-zinc-300 font-bold hover:text-orange-500 transition-colors uppercase tracking-widest text-xs group-hover:text-orange-500">
                      Learn More <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 5. APP PLATFORM SHOWCASE */}
        <section className="py-24 bg-zinc-950 border-y border-zinc-900 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              
              <motion.div 
                {...fadeInScale}
                className="order-2 lg:order-1"
              >
                <h2 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-[0.9] tracking-tight text-white mb-6" style={{ fontSize: "clamp(36px, 5vw, 64px)" }}>
                  Execution <br/> Stays <span className="text-orange-500">Visual.</span>
                </h2>
                <p className="text-zinc-400 text-lg leading-relaxed mb-8 font-medium">
                  Every session is logged. Every week you can see exactly how far you&apos;ve come.
                </p>
                
                <ul className="space-y-5">
                  {["Real-time workout scheduling alerts", "Automated weekly check-ins", "Direct messaging support", "Automated payment hub"].map((item, i) => (
                    <motion.li 
                      key={i} 
                      whileInView={{ opacity: 1, x: 0 }}
                      initial={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4 items-start"
                    >
                      <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <CheckCheck className="w-3.5 h-3.5 text-orange-500" />
                      </div>
                      <span className="text-zinc-300 font-bold">{item}</span>
                    </motion.li>
                  ))}
                </ul>
                
                <Link href="/register" className="mt-10 inline-flex items-center gap-2 text-orange-400 font-bold hover:text-orange-300 transition-colors uppercase tracking-widest text-sm">
                  Explore The App <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              <motion.div 
                 initial={{ opacity: 0, rotateY: 20, scale: 0.9 }}
                 whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
                 transition={{ duration: 1 }}
                 viewport={{ once: true }}
                 className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-black border-8 border-zinc-900 bg-zinc-950 order-1 lg:order-2"
              >
                <AutoPlayVideo
                  src="/landing/13692014_1920_1080_25fps.mp4"
                  className="w-full aspect-[16/9] object-cover pointer-events-none"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* 6. COACH SPOTLIGHT */}
        <section id="coach" className="py-24 lg:py-32 bg-zinc-950 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[150px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <motion.div 
                {...fadeInScale}
                className="w-full max-w-md lg:w-1/2 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10 opacity-60" />
                <AutoPlayVideo 
                  src="/landing/6390155-uhd_2160_3840_25fps.mp4"
                  className="w-full aspect-[4/5] object-cover rounded-[3rem] border border-zinc-800 shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                />
                <motion.div 
                   whileHover={{ y: -10 }}
                   className="absolute -bottom-8 -right-8 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl z-20 hidden md:block group"
                >
                  <p className="text-orange-500 font-black text-4xl leading-none font-[family-name:var(--font-barlow)]">10+</p>
                  <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-1">Years Coaching</p>
                </motion.div>
              </motion.div>
              
              <div className="w-full lg:w-1/2">
                <motion.div {...fadeInScale}>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4 block">Meet Your Head Coach</h2>
                  <h3 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-none text-white mb-8 block" style={{ fontSize: "clamp(48px, 6vw, 80px)" }}>
                    Mohammed <br/> Sufiyan
                  </h3>
                  <p className="text-zinc-400 text-lg leading-relaxed mb-8 font-medium italic">
                    &quot;I started iShow because I was tired of seeing people waste months on plans that weren&apos;t built for them.&quot;
                  </p>
                </motion.div>
                
                <motion.div 
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="whileInView"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10"
                >
                  <motion.div variants={itemReveal} className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 hover:bg-zinc-900 transition-colors">
                    <Dumbbell className="w-6 h-6 text-orange-500 mb-4" />
                    <p className="font-bold text-white mb-1">Elite Conditioning</p>
                    <p className="text-sm text-zinc-500">Raw strength and athletic conditioning.</p>
                  </motion.div>
                  <motion.div variants={itemReveal} className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 hover:bg-zinc-900 transition-colors">
                    <TrendingUp className="w-6 h-6 text-orange-500 mb-4" />
                    <p className="font-bold text-white mb-1">Data-Driven Protocol</p>
                    <p className="text-sm text-zinc-500">Every macro and milestone tracked mathematically.</p>
                  </motion.div>
                </motion.div>

                <motion.div {...fadeInScale}>
                  <Link href="/register" className="inline-flex items-center gap-2 text-white font-bold px-8 py-5 rounded-xl bg-orange-500 hover:bg-orange-600 transition-all uppercase tracking-widest text-sm shadow-xl shadow-orange-500/20">
                    Start Working Together
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. TRANSFORMATIONS GALLERY - Parallax Depth */}
        <section id="results" className="py-24 lg:py-32 bg-zinc-950 overflow-hidden" ref={galleryRef}>
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <motion.div 
              {...fadeInScale}
              className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
            >
              <div className="max-w-2xl">
                <h2 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4 block">Proven Results</h2>
                <h3 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-none text-white" style={{ fontSize: "clamp(40px, 5vw, 64px)" }}>
                  The Proof Is In <br/> The Progress.
                </h3>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {[
                { url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80", speed: slowY },
                { url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80", speed: superSlowY },
                { url: "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=600&q=80", speed: slowY },
                { url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80", speed: superSlowY }
              ].map((img, idx) => (
                <motion.div 
                  key={idx} 
                  style={{ y: img.speed }}
                  className="relative rounded-3xl overflow-hidden aspect-[4/5] group shadow-sm bg-zinc-900 border border-zinc-800"
                >
                  <img src={img.url} alt="Result" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. VIDEO DIVIDER */}
        <section className="relative py-32 lg:py-48 bg-zinc-950 overflow-hidden border-t border-zinc-900">
          <div className="absolute inset-0 z-0 bg-black">
            <AutoPlayVideo
              src="/landing/14170400_1920_1080_25fps.mp4"
              className="w-full h-full object-cover opacity-40 grayscale mix-blend-luminosity pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/90" />
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-transparent opacity-80" />
          </div>
          
          <motion.div 
            {...fadeInScale}
            className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 flex flex-col items-center text-center"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
              <Play className="w-16 h-16 text-orange-500 mb-8 opacity-80" />
            </motion.div>
            <h2 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase text-white leading-[0.85] tracking-tight mb-6" style={{ fontSize: "clamp(50px, 8vw, 120px)" }}>
              No Excuses. <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Only Execution.</span>
            </h2>
          </motion.div>
        </section>

        {/* 9. TESTIMONIALS */}
        {testimonials && testimonials.length > 0 && (
          <section className="py-24 bg-[#0D0D0F] border-t border-zinc-900">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
              <motion.div {...fadeInScale} className="text-center mb-16 max-w-3xl mx-auto">
                <h2 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-tight text-white mb-4" style={{ fontSize: "clamp(32px, 4vw, 54px)" }}>
                  Don&apos;t Just Take Our Word For It
                </h2>
              </motion.div>

              <motion.div 
                 variants={staggerContainer}
                 initial="initial"
                 whileInView="whileInView"
                 className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {testimonials.map((test, i) => (
                  <motion.div 
                    key={test.id} 
                    variants={itemReveal}
                    className="bg-zinc-900/50 rounded-3xl p-8 border border-zinc-800 shadow-xl relative"
                  >
                    <MessageSquare className="absolute top-8 right-8 w-12 h-12 text-zinc-800 opacity-50" />
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(test.rating)].map((_, index) => (
                        <Star key={index} className="w-5 h-5 fill-orange-500 text-orange-500" />
                      ))}
                    </div>
                    <p className="text-zinc-300 font-medium italic leading-relaxed mb-8 relative z-10">
                      &quot;{test.quote}&quot;
                    </p>
                    <div>
                      <p className="font-bold text-white">{test.name}</p>
                      <p className="text-xs text-orange-500 font-bold uppercase tracking-widest mt-1">
                        {test.location} | {test.result_label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* FINAL CTA SECTION */}
        <section className="relative py-32 rounded-[3rem] mx-4 md:mx-10 mb-10 overflow-hidden shadow-[0_20px_50px_rgba(249,115,22,0.1)] border border-zinc-800">
          <div className="absolute inset-0 z-0 bg-black">
            <img 
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2000&q=80" 
              alt="CTA Background" 
              className="w-full h-full object-cover opacity-20 mix-blend-luminosity grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/40" />
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-transparent opacity-80" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-600/20 rounded-[100%] blur-[120px] pointer-events-none" />
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center"
          >
            <motion.div 
               animate={{ scale: [1, 1.1, 1] }} 
               transition={{ duration: 2, repeat: Infinity }}
               className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full shadow-sm"
            >
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">
                Taking new clients in Dubai & online
              </span>
            </motion.div>

            <h2 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase text-white mb-6 leading-[0.9]" style={{ fontSize: "clamp(48px, 8vw, 100px)" }}>
              Stop Guessing. <br className="hidden sm:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Start Training.</span>
            </h2>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-black px-12 py-6 rounded-2xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/30 transition-all uppercase tracking-widest text-sm"
            >
              Take The Assessment <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 border-t border-zinc-900 bg-zinc-950 text-center">
          <div className="max-w-7xl mx-auto px-6">
            <p className="font-[family-name:var(--font-barlow)] font-extrabold uppercase text-white text-2xl tracking-tight mb-4">
              iShow<span className="text-orange-500">Transformation</span>
            </p>
            <div className="flex items-center justify-center gap-6 mb-6">
              <Link href="/privacy" className="text-sm font-semibold text-zinc-500 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-sm font-semibold text-zinc-500 hover:text-white transition-colors">Terms of Service</Link>
              <a href="https://www.instagram.com/sufiyan_mohd26/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-orange-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest">
              Dubai, UAE
            </p>
          </div>
        </footer>
      </div>
    </SmoothScroll>
  );
}
