"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ClipboardList,
  Target,
  Calendar,
  Dumbbell,
  CreditCard,
  LogOut,
  Dumbbell as FitnessIcon,
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
  const { data: session } = useSession();

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-700 to-orange-500 rounded-lg flex items-center justify-center">
            <FitnessIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">iShow<span className="text-orange-500">Fitness</span></span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-orange-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold">
            {session?.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{session?.user?.name}</p>
            <p className="text-xs text-gray-500">Customer</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
                isActive
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-700"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 w-full font-medium transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
