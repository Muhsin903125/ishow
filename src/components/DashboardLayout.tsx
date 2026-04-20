"use client";

import { useState } from "react";
import { Menu, Dumbbell } from "lucide-react";
import CustomerSidebar from "./CustomerSidebar";
import TrainerSidebar from "./TrainerSidebar";
import AdminSidebar from "./AdminSidebar";
import { NotificationBell } from "./NotificationBell";

interface Props {
  children: React.ReactNode;
  role: "customer" | "trainer" | "admin";
}

export default function DashboardLayout({ children, role }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div data-role={role} className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-shrink-0">
        {role === "trainer" && <TrainerSidebar />}
        {role === "admin" && <AdminSidebar />}
        {role === "customer" && <CustomerSidebar />}
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64">
          {role === "trainer" && <TrainerSidebar onClose={() => setSidebarOpen(false)} />}
          {role === "admin" && <AdminSidebar onClose={() => setSidebarOpen(false)} />}
          {role === "customer" && <CustomerSidebar onClose={() => setSidebarOpen(false)} />}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
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
          <NotificationBell />
        </div>

        {/* Desktop Header (minimal, just notification bell) */}
        <div className="hidden lg:flex items-center justify-end px-6 py-3 bg-white border-b border-gray-100">
          <NotificationBell />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
