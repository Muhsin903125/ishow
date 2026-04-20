import Link from "next/link";
import Navbar from "@/components/Navbar";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import { DM_Sans, Barlow_Condensed } from "next/font/google";
import { 
  Instagram, ArrowRight, Target, Dumbbell, TrendingUp, 
  Calendar, Utensils, MessageSquare, Play, Star
} from "lucide-react";

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

const features = [
  {
    title: "Granular Analytics",
    desc: "Track every rep, pound, and milestone. View your progression over time with dynamic charting and beautiful analytics dashboards.",
    icon: TrendingUp,
  },
  {
    title: "1-on-1 Plan Generation",
    desc: "No templates. Every single training plan is built exclusively for your baseline, constraints, and ultimate fitness goals.",
    icon: Target,
  },
  {
    title: "Session Scheduling",
    desc: "Never miss a workout. Your assigned coach inputs your daily scheduled sessions directly onto your integrated calendar.",
    icon: Calendar,
  },
  {
    title: "Nutrition & Fueling",
    desc: "Receive macro breakdowns, daily caloric targets, and custom nutrition pathways designed to accelerate your exact objective.",
    icon: Utensils,
  },
];

const testimonials = [
  {
    name: "Alex M.",
    role: "Lost 15lbs in 8 Weeks",
    quote: "The structure is what changed everything. Having my entire week mapped out and tracked meant I didn't have to guess what to do when I got to the gym.",
    rating: 5
  },
  {
    name: "Sarah T.",
    role: "Strength & Conditioning",
    quote: "It's like having a premium PT in my pocket. The analytics dashboard shows exactly where I'm progressing and where I'm stalling. Invaluable.",
    rating: 5
  },
  {
    name: "James L.",
    role: "Muscle Building Phase",
    quote: "iShow completely streamlined my nutrition and training overlap. The check-ins hold me accountable and the resulting momentum is addictive.",
    rating: 5
  }
];

export default function HomePage() {
  return (
    <div className={`${dm.variable} ${barlow.variable} font-[family-name:var(--font-dm)] bg-zinc-950 text-white overflow-x-hidden`}>
      <Navbar />

      {/* 1. HERO WITH VIDEO BACKGROUND */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0 bg-black">
          <AutoPlayVideo
            src="/landing/5319084-uhd_3840_2160_25fps.mp4"
            poster="https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1600&q=80"
            className="w-full h-full object-cover opacity-60 mix-blend-screen"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-90" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 pt-24 pb-12">
          <div className="max-w-3xl">
            
            <h1 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-[0.85] tracking-tight text-white mb-6" style={{ fontSize: "clamp(55px, 9vw, 130px)" }}>
              The System For <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
                True Momentum.
              </span>
            </h1>
            
            <p className="text-zinc-400 text-lg md:text-xl leading-relaxed max-w-xl mb-10 font-medium">
              We replace guesswork with granular analytics, bespoke conditioning routines, and unyielding coach accountability. Your transformation, engineered.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4.5 rounded-xl transition-all shadow-xl shadow-orange-500/20 hover:-translate-y-0.5 text-sm uppercase tracking-wider w-full sm:w-auto"
              >
                Launch Your Plan <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 font-bold px-8 py-4.5 rounded-xl transition-all text-sm uppercase tracking-wider w-full sm:w-auto"
              >
                See Inside
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM METHODOLOGY */}
      <section id="how-it-works" className="relative min-h-[80vh] flex items-center overflow-hidden border-t border-zinc-900 bg-zinc-950 py-24 lg:py-32">
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
          <div className="max-w-2xl flex-1">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-orange-500 mb-6 drop-shadow-sm">
              Ready to start?
            </p>
            
            <h2 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-[0.85] tracking-tight mb-6 flex flex-col" style={{ fontSize: "clamp(48px, 8vw, 100px)" }}>
              <span className="text-white drop-shadow-lg">Start With</span>
              <span className="text-white drop-shadow-lg mt-1">A Clear Plan.</span>
              <span className="text-zinc-700/60 mt-1">Not Guesswork.</span>
            </h2>
            
            <p className="text-zinc-400 text-base md:text-lg leading-relaxed max-w-md mb-10 font-medium">
              Take the free assessment, share your goal, and let Mohammed map the next step with coaching that is built to stay realistic and effective.
            </p>
          </div>

          {/* Right Content - Stages overlay */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none flex flex-col z-20">
            <div className="border border-zinc-800/60 bg-zinc-950/40 backdrop-blur-md rounded-sm overflow-hidden divide-y divide-zinc-800/60">
              
              <div className="flex items-start gap-5 p-6 md:p-8 hover:bg-zinc-900/40 transition-colors group">
                <span className="font-[family-name:var(--font-barlow)] font-black text-3xl text-zinc-700 group-hover:text-orange-500 transition-colors leading-none">01.</span>
                <div>
                  <h3 className="text-white font-black uppercase tracking-widest mb-2 text-sm">Assessment</h3>
                  <p className="text-zinc-500 text-sm font-medium">Start with your real baseline before the plan begins.</p>
                </div>
              </div>

              <div className="flex items-start gap-5 p-6 md:p-8 hover:bg-zinc-900/40 transition-colors group">
                <span className="font-[family-name:var(--font-barlow)] font-black text-3xl text-zinc-700 group-hover:text-orange-500 transition-colors leading-none">02.</span>
                <div>
                  <h3 className="text-white font-black uppercase tracking-widest mb-2 text-sm">Plan Mapped</h3>
                  <p className="text-zinc-500 text-sm font-medium">Trainer-led programming shaped around your lifestyle.</p>
                </div>
              </div>

              <div className="flex items-start gap-5 p-6 md:p-8 hover:bg-zinc-900/40 transition-colors group">
                <span className="font-[family-name:var(--font-barlow)] font-black text-3xl text-zinc-700 group-hover:text-orange-500 transition-colors leading-none">03.</span>
                <div>
                  <h3 className="text-white font-black uppercase tracking-widest mb-2 text-sm">Coach Follow-Up</h3>
                  <p className="text-zinc-500 text-sm font-medium">Clear weekly direction and direct accountability.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. CAPABILITIES GRID */}
      <section id="capabilities" className="py-24 lg:py-32 bg-zinc-950 relative z-10 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4 block">Our Capabilities</h2>
            <h3 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-none text-white" style={{ fontSize: "clamp(40px, 6vw, 70px)" }}>
              A Unified Dashboard <br/> For Total Control
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 (Large Image Block) */}
            <div className="md:col-span-2 group relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors min-h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-zinc-950/20 z-10" />
              <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80" alt="Training Plan" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0" />
              <div className="relative z-20 p-8 md:p-10 h-full flex flex-col justify-end">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                  <Target className="w-6 h-6 text-orange-500" />
                </div>
                <h4 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase text-3xl md:text-4xl text-white mb-3 tracking-tight">1-on-1 Plan Generation</h4>
                <p className="text-zinc-400 font-medium max-w-sm">No templates. Every single training plan is built exclusively for your baseline, constraints, and ultimate fitness goals.</p>
              </div>
            </div>

            {/* Feature 2 (Small Square) */}
            <div className="group relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col min-h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/60 to-zinc-950/20 z-10" />
              <img src="https://images.unsplash.com/photo-1521804906057-1df8fdb718b7?auto=format&fit=crop&w=800&q=80" alt="Analytics" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0" />
              <div className="relative z-20 p-8 md:p-10 h-full flex flex-col justify-end">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                </div>
                <h4 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase text-2xl text-white mb-2 tracking-tight">Granular Analytics</h4>
                <p className="text-zinc-400 font-medium text-sm leading-relaxed">Track every rep and milestone. View progression with dynamic charting.</p>
              </div>
            </div>

            {/* Feature 3 (Small Square) */}
            <div className="group relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col min-h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/60 to-zinc-950/20 z-10" />
              <img src="https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?auto=format&fit=crop&w=800&q=80" alt="Session Scheduling" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0" />
              <div className="relative z-20 p-8 md:p-10 h-full flex flex-col justify-end">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                  <Calendar className="w-6 h-6 text-orange-500" />
                </div>
                <h4 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase text-2xl text-white mb-2 tracking-tight">Session Scheduling</h4>
                <p className="text-zinc-400 font-medium text-sm leading-relaxed">Never miss a workout. We log daily scheduled sessions to your calendar.</p>
              </div>
            </div>

            {/* Feature 4 (Large Image Block) */}
            <div className="md:col-span-2 group relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors min-h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-l from-zinc-950/90 via-zinc-950/60 to-zinc-950/20 z-10" />
              <img src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80" alt="Nutrition" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0" />
              <div className="relative z-20 p-8 md:p-10 h-full flex flex-col justify-end items-end text-right">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                  <Utensils className="w-6 h-6 text-orange-500" />
                </div>
                <h4 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase text-3xl md:text-4xl text-white mb-3 tracking-tight">Nutrition & Fueling</h4>
                <p className="text-zinc-400 font-medium max-w-sm">Receive macro breakdowns, daily caloric targets, and custom pathways designed to accelerate your exact objective.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR SERVICES */}
      <section id="services" className="py-24 lg:py-32 bg-[#0D0D0F] border-t border-zinc-900 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-xl">
              <h2 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4 block">Coaching Plans</h2>
              <h3 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-[0.9] tracking-tight text-white" style={{ fontSize: "clamp(44px, 6vw, 70px)" }}>
                Execution <br/> Meets Focus.
              </h3>
            </div>
            <p className="text-zinc-400 font-medium max-w-md md:text-right">
              Different goals require different methodologies. Choose the tier of support that aligns perfectly with your physical ambitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Complete Transformation",
                img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
                desc: "Full protocol encompassing precision training, macros, and extreme accountability to completely reshape your physique."
              },
              {
                title: "Elite Athleticism",
                img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
                desc: "Focus on explosive power, reactive agility, and raw strength designed specifically for competitive athletes."
              },
              {
                title: "Nutrition Only Hub",
                img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
                desc: "A strictly nutritional track for individuals who already have their training dialed in but need perfect fueling."
              }
            ].map((srv, idx) => (
              <div key={idx} className="group relative bg-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-full border border-zinc-800">
                <div className="aspect-[4/3] relative overflow-hidden">
                   <img src={srv.img} alt={srv.title} className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                </div>
                <div className="relative -mt-10 p-8 flex flex-col flex-grow bg-zinc-950/90 backdrop-blur-xl rounded-t-[2rem] border-t border-zinc-800 z-20">
                  <h4 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase text-3xl text-white mb-3 leading-[0.9]">{srv.title}</h4>
                  <p className="text-zinc-400 font-medium text-sm leading-relaxed mb-8 flex-grow">{srv.desc}</p>
                  <Link href="/register" className="mt-auto inline-flex items-center justify-between w-full text-zinc-300 font-bold hover:text-orange-500 transition-colors uppercase tracking-widest text-xs group-hover:text-orange-500">
                    Learn More <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. APP PLATFORM SHOWCASE WITH SECONDARY VIDEO */}
      <section className="py-24 bg-zinc-950 border-y border-zinc-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Content Left */}
            <div>
              <h2 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-[0.9] tracking-tight text-white mb-6" style={{ fontSize: "clamp(36px, 5vw, 64px)" }}>
                Execution <br/> Stays <span className="text-orange-500">Visual.</span>
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8 font-medium">
                We believe that seeing your progression mathematically is the ultimate motivation. Our platform pairs your physical training execution with high-level visual analytics so you never have to blindly guess if you are improving.
              </p>
              
              <ul className="space-y-5">
                {[
                  "Real-time workout scheduling alerts",
                  "Automated weekly check-ins with your assigned coach",
                  "Direct messaging support layer",
                  "Automated payment and invoicing hub"
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <CheckCheckIcon className="w-3.5 h-3.5 text-orange-500" />
                    </div>
                    <span className="text-zinc-300 font-bold">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/register" className="mt-10 inline-flex items-center gap-2 text-orange-400 font-bold hover:text-orange-300 transition-colors uppercase tracking-widest text-sm">
                Explore The App <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Playable Video Right */}
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-black border-8 border-zinc-900 bg-zinc-950">
              <AutoPlayVideo
                src="/landing/13692014_1920_1080_25fps.mp4"
                className="w-full aspect-[16/9] object-cover pointer-events-none"
              />
            </div>

          </div>
        </div>
      </section>

      {/* COACH SPOTLIGHT SECTION */}
      <section id="coach" className="py-24 lg:py-32 bg-zinc-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left: Image */}
            <div className="w-full max-w-md lg:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10 opacity-60" />
              <AutoPlayVideo 
                src="/landing/6390155-uhd_2160_3840_25fps.mp4"
                className="w-full aspect-[4/5] object-cover rounded-[3rem] border border-zinc-800 shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute -bottom-8 -right-8 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl z-20 hidden md:block group hover:-translate-y-2 transition-transform">
                <p className="text-orange-500 font-black text-4xl leading-none font-[family-name:var(--font-barlow)]">10+</p>
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-1">Years Coaching</p>
              </div>
            </div>
            
            {/* Right: Info */}
            <div className="w-full lg:w-1/2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4 block">Meet Your Head Coach</h2>
              <h3 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-none text-white mb-8 block" style={{ fontSize: "clamp(48px, 6vw, 80px)" }}>
                Mohammed
              </h3>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8 font-medium italic">
                &quot;I built iShow Transformation because the fitness industry is saturated with generic templates and empty promises. True physical adaptation requires a systematic, analytical approach tailored specifically to your exact biomechanics.&quot;
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 hover:bg-zinc-900 transition-colors">
                  <Dumbbell className="w-6 h-6 text-orange-500 mb-4" />
                  <p className="font-bold text-white mb-1">Elite Conditioning</p>
                  <p className="text-sm text-zinc-500">Specializing in raw strength and athletic conditioning.</p>
                </div>
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 hover:bg-zinc-900 transition-colors">
                  <TrendingUp className="w-6 h-6 text-orange-500 mb-4" />
                  <p className="font-bold text-white mb-1">Data-Driven Protocol</p>
                  <p className="text-sm text-zinc-500">Every macro and performance milestone tracked mathematically.</p>
                </div>
              </div>

              <Link href="/register" className="inline-flex items-center gap-2 text-white font-bold px-8 py-4.5 rounded-xl bg-orange-500 hover:bg-orange-600 transition-all uppercase tracking-widest text-sm shadow-xl shadow-orange-500/20 hover:scale-105">
                Start Working Together
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRANSFORMATIONS GALLERY (Images) */}
      <section id="results" className="py-24 lg:py-32 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4 block">Proven Results</h2>
              <h3 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-none text-white" style={{ fontSize: "clamp(40px, 5vw, 64px)" }}>
                The Proof Is In <br/> The Progress.
              </h3>
            </div>
            <Link href="/register" className="shrink-0 inline-flex items-center gap-2 bg-white hover:bg-gray-200 text-zinc-950 font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg text-sm uppercase tracking-wider">
              Start Your Journey
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80"
            ].map((imgUrl, idx) => (
              <div key={idx} className={`relative rounded-3xl overflow-hidden aspect-[4/5] group shadow-sm ${idx % 2 === 0 ? "md:translate-y-8" : ""}`}>
                <img src={imgUrl} alt={`Transformation ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-5 left-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <p className="text-white font-bold text-sm bg-black/40 backdrop-blur px-3 py-1.5 rounded-lg inline-block border border-white/10">View Story</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FULL WIDTH VIDEO DIVIDER */}
      <section className="relative py-32 lg:py-48 bg-zinc-950 overflow-hidden border-t border-zinc-900">
        <div className="absolute inset-0 z-0 bg-black">
          <AutoPlayVideo
            src="/landing/14170400_1920_1080_25fps.mp4"
            className="w-full h-full object-cover opacity-40 grayscale mix-blend-luminosity pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/90" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-transparent opacity-80" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 flex flex-col items-center text-center">
          <Play className="w-16 h-16 text-orange-500 mb-8 opacity-80" />
          <h2 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase text-white leading-[0.85] tracking-tight mb-6" style={{ fontSize: "clamp(50px, 8vw, 120px)" }}>
            No Excuses. <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Only Execution.</span>
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl">
            You don&apos;t need another generic PDF. You need a system that adapts to your baseline, forces accountability, and engineers results.
          </p>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="py-24 bg-[#0D0D0F] border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase leading-tight text-white mb-4" style={{ fontSize: "clamp(32px, 4vw, 54px)" }}>
              Don&apos;t Just Take Our Word For It
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, i) => (
              <div key={i} className="bg-zinc-900/50 rounded-3xl p-8 border border-zinc-800 shadow-xl relative">
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
                  <p className="text-xs text-orange-500 font-bold uppercase tracking-widest mt-1">{test.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="relative py-32 rounded-[3rem] mx-4 md:mx-10 mb-10 overflow-hidden shadow-[0_20px_50px_rgba(249,115,22,0.1)] border border-zinc-800">
        <div className="absolute inset-0 z-0 bg-black">
          <img 
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2000&q=80" 
            alt="CTA Background" 
            className="w-full h-full object-cover opacity-20 mix-blend-luminosity grayscale"
          />
          {/* Edge fades */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-transparent opacity-80" />
          {/* Orange glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-600/20 rounded-[100%] blur-[120px] pointer-events-none" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full shadow-sm">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">
              Only a Few Slots Remaining
            </span>
          </div>

          <h2 className="font-[family-name:var(--font-barlow)] font-extrabold uppercase text-white mb-6 leading-[0.9]" style={{ fontSize: "clamp(48px, 8vw, 100px)" }}>
            Stop Guessing. <br className="hidden sm:block" /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Start Training.</span>
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Take 2 minutes to fill out your baseline assessment. Our coaching staff will immediately begin mapping the architecture of your programming.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-black px-12 py-5 rounded-2xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/30 transition-all uppercase tracking-widest text-sm"
          >
            Take The Assessment <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
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
            © {new Date().getFullYear()} iShow Transformation. All rights reserved. Built in UAE.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Icon Helper for the App Showcase section
function CheckCheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 7 17l-5-5" />
      <path d="m22 10-7.5 7.5L13 16" />
    </svg>
  );
}
