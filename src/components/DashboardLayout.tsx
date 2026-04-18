"use client";

import { useState } from "react";
import { Menu, Dumbbell } from "lucide-react";
import CustomerSidebar from "./CustomerSidebar";
import TrainerSidebar from "./TrainerSidebar";

interface Props {
  children: React.ReactNode;
  role: "customer" | "trainer";
}

export default function DashboardLayout({ children, role }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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
            className="fixed inset-0 bg-black/50"
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
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
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
