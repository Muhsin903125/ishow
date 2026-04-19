"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Dumbbell, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/#services", label: "Services" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#videos", label: "Videos" },
    { href: "/#trainer", label: "Coach" },
  ];

  const handleSignOut = () => {
    logout();
    setMobileOpen(false);
    window.location.href = "/";
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-950/95 backdrop-blur-xl shadow-2xl shadow-black/30 border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <Link href="/" className="group whitespace-nowrap">
            <div className="leading-none">
              <span className="font-black text-base text-white tracking-tight sm:text-lg">iShow</span>
              <span className="font-black text-base text-orange-400 tracking-tight sm:text-lg">Transformation</span>
            </div>
            <div className="mt-1 h-px w-0 bg-orange-400 transition-all duration-300 group-hover:w-full" />
          </Link>

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
                  className="ml-2 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 group"
                >
                  <Flame className="w-4 h-4" />
                  Start Free
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
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all lg:hidden"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
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
