"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { SignOutModal } from "./SignOutModal";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Dumbbell,
  Layers,
  MapPin,
  Target,
  FileText,
  LogOut,
  UserPlus,
  CreditCard,
  Settings,
  X,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/trainer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/trainer/clients",   icon: Users,           label: "Clients" },
  { href: "/trainer/sessions",  icon: Calendar,        label: "Sessions" },
  { href: "/trainer/payments",  icon: CreditCard,      label: "Payments" },
  { href: "/trainer/programs",  icon: Dumbbell,        label: "Programs" },
  { href: "/trainer/team",      icon: UserPlus,        label: "Team" },
  { href: "/trainer/settings",  icon: Settings,        label: "Settings" },
];

const masterItems = [
  { href: "/admin/master/exercises",       icon: Dumbbell,  label: "Exercises" },
  { href: "/admin/master/locations",       icon: MapPin,    label: "Locations" },
  { href: "/admin/master/goals",           icon: Target,    label: "Goals" },
  { href: "/admin/master/plan-templates",  icon: FileText,  label: "Plan Templates" },
];

interface Props {
  onClose?: () => void;
}

export default function TrainerSidebar({ onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showSignOut, setShowSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await logout();
    router.push("/");
    if (onClose) onClose();
  };

  return (
    <>
      <SignOutModal
        open={showSignOut}
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOut(false)}
        loading={signingOut}
      />

      <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800/60">
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-zinc-800/60">
          <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-base text-white tracking-tight">
              iShow<span className="text-blue-400">Fitness</span>
            </span>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* User card */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-blue-500/20">
              {user?.name?.charAt(0).toUpperCase() ?? "T"}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm truncate">{user?.name}</p>
              <p className="text-xs text-blue-400 font-semibold tracking-wide uppercase">Trainer</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-3 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600 px-3 mb-2 mt-1">Menu</p>
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-zinc-400 hover:bg-zinc-800/80 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? "text-white" : "text-zinc-500 group-hover:text-white"
                  }`}
                />
                {label}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
              </Link>
            );
          })}

          {/* Master data section */}
          <div className="pt-4">
            <div className="flex items-center gap-2 px-3 mb-2">
              <Layers className="w-3 h-3 text-zinc-600" />
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">Master Data</p>
            </div>
            {masterItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-500 hover:bg-zinc-800/80 hover:text-zinc-300"
                  }`}
                >
                  <Icon className="w-[16px] h-[16px] shrink-0 group-hover:scale-110 transition-transform" />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sign out */}
        <div className="px-4 pb-5 pt-3 border-t border-zinc-800/60">
          <button
            onClick={() => setShowSignOut(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:bg-red-500/10 hover:text-red-400 w-full font-semibold transition-all duration-150 group"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0 group-hover:scale-110 transition-transform" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
