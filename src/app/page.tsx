import Link from "next/link";
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
  ChevronRight,
} from "lucide-react";

const services = [
  {
    icon: Dumbbell,
    title: "Personalized Training",
    description: "Custom workout plans tailored to your fitness level, goals, and schedule.",
    color: "blue",
  },
  {
    icon: Heart,
    title: "Nutrition Guidance",
    description: "Comprehensive dietary advice to fuel your performance and recovery.",
    color: "orange",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Monitor your improvements with detailed analytics and milestone tracking.",
    color: "blue",
  },
  {
    icon: Users,
    title: "1-on-1 Sessions",
    description: "Personal attention and real-time corrections during your training sessions.",
    color: "orange",
  },
];

const steps = [
  {
    number: "01",
    title: "Register & Assess",
    description: "Sign up and complete our comprehensive fitness assessment form.",
  },
  {
    number: "02",
    title: "Get Your Plan",
    description: "Your trainer reviews your profile and creates a custom program just for you.",
  },
  {
    number: "03",
    title: "Start Training",
    description: "Access your sessions, weekly programs, and daily activities on your dashboard.",
  },
  {
    number: "04",
    title: "Transform & Grow",
    description: "Track your progress and watch yourself achieve your fitness goals.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Lost 25 lbs in 3 months",
    text: "The personalized approach made all the difference. My trainer understood my limitations and pushed me in the right way.",
    rating: 5,
  },
  {
    name: "James K.",
    role: "Marathon Runner",
    text: "Went from couch potato to finishing my first marathon. The structured programs and accountability were game-changers.",
    rating: 5,
  },
  {
    name: "Elena R.",
    role: "Gained 15 lbs of muscle",
    text: "Finally found a trainer who takes the time to understand your goals. The online portal makes tracking everything so easy.",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500 rounded-full filter blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-36">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-orange-300 text-sm font-medium">Transform Your Body & Mind</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black leading-tight tracking-tight mb-6">
              Achieve Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                Fitness Goals
              </span>
              With Expert Coaching
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mb-10 leading-relaxed">
              Get a personalized training program, 1-on-1 sessions, and daily workout activities
              designed specifically for your body and goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/#how-it-works"
                className="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:bg-white/10"
              >
                How It Works
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex items-center gap-8 mt-12 pt-8 border-t border-white/10">
              <div>
                <p className="text-3xl font-black text-white">200+</p>
                <p className="text-blue-300 text-sm">Happy Clients</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-3xl font-black text-white">98%</p>
                <p className="text-blue-300 text-sm">Success Rate</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-3xl font-black text-white">5★</p>
                <p className="text-blue-300 text-sm">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-4">
              <Trophy className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 text-sm font-medium">What We Offer</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Everything You Need to
              <span className="text-orange-500"> Succeed</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Comprehensive fitness services tailored to your unique needs and goals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              const isBlue = service.color === "blue";
              return (
                <div
                  key={service.title}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:-translate-y-1 group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isBlue ? "bg-blue-100 group-hover:bg-blue-700" : "bg-orange-100 group-hover:bg-orange-500"} transition-colors`}>
                    <Icon className={`w-6 h-6 ${isBlue ? "text-blue-700 group-hover:text-white" : "text-orange-500 group-hover:text-white"} transition-colors`} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-2 mb-4">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span className="text-orange-700 text-sm font-medium">Simple Process</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              How It <span className="text-blue-700">Works</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Get started in minutes and be on your way to your dream physique.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-orange-200 z-0 -translate-x-4" />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 text-white font-black text-2xl flex items-center justify-center mb-4 shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 text-sm font-medium">Success Stories</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Real Results from
              <span className="text-orange-400"> Real People</span>
            </h2>
            <p className="text-blue-200 text-lg max-w-2xl mx-auto">
              Join hundreds of clients who have transformed their lives.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-blue-100 mb-6 leading-relaxed italic">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-bold text-white">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-orange-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-3xl p-12 border border-orange-100">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Ready to Transform
              <span className="text-orange-500"> Your Life?</span>
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
              Join today and get a free fitness assessment with your personalized training plan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:-translate-y-0.5"
              >
                Register Now — It&apos;s Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-blue-700 text-gray-700 hover:text-blue-700 px-8 py-4 rounded-full font-bold text-lg transition-all"
              >
                Already a Member? Login
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                No commitment required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Cancel anytime
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Expert trainer
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">iShow<span className="text-orange-400">Fitness</span></span>
            </div>
            <p className="text-sm">© 2026 iShowFitness. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
