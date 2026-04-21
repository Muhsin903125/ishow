"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { SignOutModal } from "./SignOutModal";
import {
  LayoutDashboard,
  ClipboardList,
  Target,
  Calendar,
  Dumbbell,
  CreditCard,
  TrendingUp,
  User,
  Settings,
  X,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",   icon: LayoutDashboard, label: "Command Centre" },
  { href: "/assessments", icon: Activity,        label: "Assessments" },
  { href: "/sessions",    icon: Target,          label: "Training Hub" },
  { href: "/payments",    icon: CreditCard,      label: "Payments" },
  { href: "/settings",    icon: Settings,        label: "Settings" },
];

interface Props {
  onClose?: () => void;
}

export default function CustomerSidebar({ onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showSignOut, setShowSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await logout();
    if (onClose) onClose();
    window.location.href = "/";
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
        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-900/50">
          <Link href="/" className="flex items-center gap-3.5" onClick={onClose}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/30 ring-1 ring-white/20">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="font-black text-xl text-white tracking-tighter italic">
              iShow<span className="text-orange-500">Fitness</span>
            </span>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors border border-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User card */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 group hover:border-orange-500/30 transition-all cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-black text-lg shrink-0 shadow-xl shadow-orange-500/20 group-hover:scale-105 transition-transform">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="font-black text-white text-base truncate tracking-tight">{user?.name}</p>
              <p className="text-[10px] text-orange-500 font-black tracking-[0.2em] uppercase italic opacity-70">Operative</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-6 py-6 space-y-1 overflow-y-auto scrollbar-hide">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 px-4 mb-4 mt-2 italic">Control Center</p>
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-black uppercase italic tracking-wider transition-all duration-200 group ${
                  isActive
                    ? "bg-white text-zinc-950 shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-[1.02]"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-all duration-300 ${
                    isActive ? "text-zinc-950 scale-110" : "text-zinc-700 group-hover:text-orange-500 group-hover:scale-110"
                  }`}
                />
                {label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-6 rounded-full bg-orange-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-6 pb-8 pt-4 border-t border-zinc-900">
          <button
            onClick={() => setShowSignOut(true)}
            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-xs font-black uppercase italic tracking-widest text-zinc-600 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-200 group border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
