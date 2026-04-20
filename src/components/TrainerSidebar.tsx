"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
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
} from "lucide-react";

const navItems = [
  { href: "/trainer/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
  { href: "/trainer/clients",      icon: Users,           label: "Clients" },
  { href: "/trainer/sessions",     icon: Calendar,        label: "Sessions" },
  { href: "/trainer/payments",     icon: CreditCard,      label: "Payments" },
  { href: "/trainer/programs",     icon: Dumbbell,        label: "Programs" },
  { href: "/trainer/team",         icon: UserPlus,        label: "Team" },
  { href: "/trainer/settings",     icon: Settings,        label: "Settings" },
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
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    if (onClose) onClose();
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2" onClick={onClose}>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-700 to-orange-500 rounded-lg flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">iShow<span className="text-orange-500">Fitness</span></span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-orange-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-orange-500 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0).toUpperCase() ?? "T"}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
            <p className="text-xs text-orange-600 font-medium">Trainer</p>
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
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-700"
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

      {/* Sign out */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 w-full font-medium transition-all"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
