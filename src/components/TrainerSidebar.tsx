"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Dumbbell,
  ClipboardList,
  Layers,
  MapPin,
  Target,
  FileText,
  LogOut,
  X,
} from "lucide-react";

const navItems = [
  { href: "/trainer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/trainer/clients", icon: Users, label: "Clients" },
  { href: "/trainer/assessments", icon: ClipboardList, label: "Assessments" },
  { href: "/trainer/sessions", icon: Calendar, label: "Sessions" },
  { href: "/trainer/programs", icon: Dumbbell, label: "Programs" },
];

const masterItems = [
  { href: "/admin/master/exercises", icon: Dumbbell, label: "Exercises" },
  { href: "/admin/master/locations", icon: MapPin, label: "Locations" },
  { href: "/admin/master/goals", icon: Target, label: "Goals" },
  { href: "/admin/master/plan-templates", icon: FileText, label: "Plan Templates" },
];

interface Props {
  onClose?: () => void;
}

export default function TrainerSidebar({ onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/60">
        <Link href="/" className="whitespace-nowrap leading-none">
          <span className="font-black text-base text-white tracking-tight">iShow</span>
          <span className="font-black text-base text-orange-500 tracking-tight">Transformation</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        )}
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-orange-500/20">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-sm truncate">{user?.name}</p>
            <p className="text-xs text-orange-400 font-semibold tracking-wide uppercase">Trainer</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "text-zinc-400 hover:bg-zinc-800/70 hover:text-white"
              }`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {label}
            </Link>
          );
        })}

        <div className="pt-5">
          <div className="flex items-center gap-2 px-3 pb-2">
            <Layers className="w-3 h-3 text-zinc-600" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Master Data</p>
          </div>
          {masterItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:bg-zinc-800/70 hover:text-zinc-300"
                }`}
              >
                <Icon className="w-[16px] h-[16px] shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="px-4 pb-5 border-t border-zinc-800/60 pt-4">
        <button
          onClick={() => { logout(); router.push("/"); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:bg-red-500/10 hover:text-red-400 w-full font-semibold transition-all"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
