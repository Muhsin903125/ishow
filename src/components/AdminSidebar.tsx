"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { SignOutModal } from "./SignOutModal";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Database,
  ClipboardList,
  CreditCard,
  BarChart2,
  LogOut,
  X,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard",   icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/assessments", icon: ClipboardList,   label: "Assessments" },
  { href: "/admin/trainers",    icon: UserCog,         label: "Trainers" },
  { href: "/admin/clients",     icon: Users,           label: "Clients" },
  { href: "/admin/payments",    icon: CreditCard,      label: "Payments" },
  { href: "/admin/reports",     icon: BarChart2,       label: "Reports" },
  { href: "/admin/master",      icon: Database,        label: "Master Data" },
];

interface Props {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: Props) {
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
        <div className="flex items-center justify-between px-5 py-5 border-b border-zinc-800/60">
          <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-base text-white tracking-tight">
              iShow<span className="text-orange-500">Admin</span>
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-orange-500/20">
              {user?.name?.charAt(0).toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm truncate">{user?.name}</p>
              <p className="text-xs text-orange-500 font-semibold tracking-wide uppercase">Administrator</p>
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
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-500/25"
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
