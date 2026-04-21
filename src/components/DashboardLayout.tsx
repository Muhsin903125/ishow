"use client";

import { useState } from "react";
import { Menu, Bell, Search, Zap, ChevronRight } from "lucide-react";
import CustomerSidebar from "./CustomerSidebar";
import TrainerSidebar from "./TrainerSidebar";
import AdminSidebar from "./AdminSidebar";
import { NotificationBell } from "./NotificationBell";
import { usePathname } from "next/navigation";

interface Props {
  children: React.ReactNode;
  role: "customer" | "trainer" | "admin";
}

// Derive a human-readable page title from the route
function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return "Dashboard";
  return last
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

// Color scheme per role
const roleConfig = {
  customer: { accent: "from-orange-500 to-orange-600", dot: "bg-orange-500" },
  trainer:  { accent: "from-blue-500 to-blue-700",     dot: "bg-blue-500" },
  admin:    { accent: "from-violet-500 to-violet-700", dot: "bg-violet-500" },
};

export default function DashboardLayout({ children, role }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const { dot } = roleConfig[role];

  const SidebarComponent = role === "trainer"
    ? TrainerSidebar
    : role === "admin"
    ? AdminSidebar
    : CustomerSidebar;

  return (
    <div data-role={role} className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-80 lg:flex-shrink-0">
        <SidebarComponent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex w-80">
            <SidebarComponent onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between px-4 lg:px-8 py-3.5 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800/60 sticky top-0 z-30">
          {/* Left: mobile menu toggle + page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile brand */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${roleConfig[role].accent} flex items-center justify-center`}>
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-black text-sm text-white">
                iShow<span className="text-orange-500">Fitness</span>
              </span>
            </div>

            {/* Desktop breadcrumb / page title */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-lg border border-zinc-800">
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{role}</span>
              </div>
              <span className="text-zinc-700 font-bold">/</span>
              <span className="text-sm font-black text-white uppercase italic tracking-wider">{pageTitle}</span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto min-w-0 bg-zinc-950 scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}
