"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Dumbbell, 
  MapPin, 
  Target, 
  FileText, 
  Database, 
  Zap, 
  Activity, 
  Shield, 
  ChevronRight 
} from "lucide-react";

const sections = [
  { 
    href: "/admin/master/exercises", 
    label: "Element Library", 
    desc: "Architect kinetic movements and performance elements.", 
    icon: Dumbbell, 
    color: "text-orange-500", 
    bg: "bg-orange-500/5", 
    border: "border-orange-500/10" 
  },
  { 
    href: "/admin/master/locations", 
    label: "Sector Locations", 
    desc: "Managing gym networks and training base options.", 
    icon: MapPin, 
    color: "text-blue-500", 
    bg: "bg-blue-500/5", 
    border: "border-blue-500/10" 
  },
  { 
    href: "/admin/master/goals", 
    label: "Kinetic Objectives", 
    desc: "Define the core fitness goal parameters for analysis.", 
    icon: Target, 
    color: "text-emerald-500", 
    bg: "bg-emerald-500/5", 
    border: "border-emerald-500/10" 
  },
  { 
    href: "/admin/master/plan-templates", 
    label: "Syllabus Blueprints", 
    desc: "Engineering reusable protocol blueprints for deployment.", 
    icon: FileText, 
    color: "text-violet-500", 
    bg: "bg-violet-500/5", 
    border: "border-violet-500/10" 
  },
];

export default function AdminMasterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) { router.replace("/login"); return; }
    if (!loading && user && user.role === "customer") { router.replace("/dashboard"); }
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <DashboardLayout role="admin">
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-pulse">
           <div className="h-10 w-48 bg-zinc-900 rounded-lg" />
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-48 bg-zinc-900 rounded-[2rem]" />)}
           </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={user.role === "admin" ? "admin" : "trainer"}>
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 italic">
                <Database className="w-3 h-3 fill-emerald-500" /> Kinetic Database Initialized
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
               Master <span className="text-emerald-500">Logistics</span>
            </h1>
            <p className="text-zinc-500 font-medium max-w-xl">Architecting the fundamental reference data that powers the iShow operational framework.</p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {sections.map((s, idx) => (
              <motion.div
                key={s.href}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  href={s.href}
                  className={`group relative flex flex-col h-full rounded-[2.5rem] border border-zinc-800 bg-zinc-900 p-8 hover:border-zinc-500 transition-all hover:-translate-y-1 shadow-xl overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-10 transition-opacity">
                    <s.icon className="w-24 h-24 text-white" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className={`w-14 h-14 rounded-2xl ${s.bg} border ${s.border} flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform`}>
                      <s.icon className={`w-7 h-7 ${s.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-white italic uppercase tracking-tight mb-3 group-hover:text-emerald-500 transition-colors leading-none">{s.label}</h3>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed mb-8">{s.desc}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                       <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest italic group-hover:text-zinc-400">Initialize Control</span>
                       <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-white group-hover:border-zinc-500 transition-all">
                          <ChevronRight size={16} />
                       </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
