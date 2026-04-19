"use client";

import { useState } from "react";
import { Menu, Dumbbell } from "lucide-react";
import CustomerSidebar from "./CustomerSidebar";
import TrainerSidebar from "./TrainerSidebar";
import AdminSidebar from "./AdminSidebar";

interface Props {
  children: React.ReactNode;
  role: "customer" | "trainer";
}

export default function DashboardLayout({ children, role }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function Sidebar({ onClose }: { onClose?: () => void }) {
    if (role === "TRAINER") return <TrainerSidebar onClose={onClose} />;
    if (role === "ADMIN") return <AdminSidebar onClose={onClose} />;
    return <CustomerSidebar onClose={onClose} />;
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-shrink-0">
        {role === "trainer" ? (
          <TrainerSidebar />
        ) : (
          <CustomerSidebar />
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 z-50">
            {role === "trainer" ? (
              <TrainerSidebar onClose={() => setSidebarOpen(false)} />
            ) : (
              <CustomerSidebar onClose={() => setSidebarOpen(false)} />
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-4 px-4 py-3 bg-zinc-950 border-b border-zinc-800/60 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-700 to-orange-500 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">
              iShow<span className="text-orange-500">Fitness</span>
            </span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
