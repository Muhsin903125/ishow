"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Dumbbell, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    setMobileOpen(false);
    window.location.href = "/";
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-700 to-orange-500 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">iShow</span>
              <span className="text-orange-500 font-bold text-xl">Fitness</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {/* Always-visible nav links */}
            <Link href="/#services" className="text-gray-600 hover:text-blue-700 font-medium transition-colors">
              Services
            </Link>
            <Link href="/#how-it-works" className="text-gray-600 hover:text-blue-700 font-medium transition-colors">
              How It Works
            </Link>

            {/* Auth-conditional links */}
            {!user ? (
              <>
                <Link href="/login" className="text-gray-600 hover:text-blue-700 font-medium transition-colors">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-semibold transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <span className="text-gray-600 font-medium">
                  Hi, {user.name.split(" ")[0]}
                </span>
                <Link
                  href={user.role === "trainer" ? "/trainer/dashboard" : "/dashboard"}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-2">
          {/* Always-visible mobile links */}
          <Link href="/#services" className="block py-2 text-gray-600 hover:text-blue-700 font-medium" onClick={() => setMobileOpen(false)}>
            Services
          </Link>
          <Link href="/#how-it-works" className="block py-2 text-gray-600 hover:text-blue-700 font-medium" onClick={() => setMobileOpen(false)}>
            How It Works
          </Link>
          <div className="border-t border-gray-100 pt-2">
            {!user ? (
              <>
                <Link href="/login" className="block py-2 text-gray-600 hover:text-blue-700 font-medium" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="block py-2 text-orange-500 font-semibold" onClick={() => setMobileOpen(false)}>
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 py-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                </div>
                <Link
                  href={user.role === "trainer" ? "/trainer/dashboard" : "/dashboard"}
                  className="block py-2 text-gray-600 hover:text-blue-700 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 py-2 text-red-600 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
