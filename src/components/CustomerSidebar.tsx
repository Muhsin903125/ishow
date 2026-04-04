"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Target,
  Calendar,
  Dumbbell,
  CreditCard,
  LogOut,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/assessment", icon: ClipboardList, label: "Assessment" },
  { href: "/my-plan", icon: Target, label: "My Plan" },
  { href: "/sessions", icon: Calendar, label: "Sessions" },
  { href: "/programs", icon: Dumbbell, label: "Programs" },
  { href: "/payments", icon: CreditCard, label: "Payments" },
];

interface Props {
  onClose?: () => void;
}

export default function CustomerSidebar({ onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <Link href="/" className="whitespace-nowrap leading-none">
          <span className="font-black text-base text-gray-900 tracking-tight">iShow</span>
          <span className="font-black text-base text-orange-500 tracking-tight">Transformation</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-5 py-4 mx-3 mt-3 rounded-xl bg-gradient-to-r from-orange-50 to-white border border-orange-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-orange-200">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{user?.name}</p>
            <p className="text-xs text-orange-500 font-medium tracking-wide uppercase">Member</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
                isActive
                  ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => { logout(); router.push("/"); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 w-full font-medium transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
