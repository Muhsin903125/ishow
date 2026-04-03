"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, LogOut, LayoutDashboard, Flame, ChevronDown } from "lucide-react";


export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
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
    { href: "/#gallery", label: "Gallery" },
    { href: "/#trainer", label: "Trainer" },
  ];

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
          <div className="hidden md:flex items-center gap-1">
            {!user ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors group"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-4 right-4 h-px bg-orange-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                  </Link>
                ))}
                <div className="w-px h-5 bg-white/20 mx-2" />
                <Link
                  href="/login"
                  className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
                >
                  Log In
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
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mr-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xs">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white text-sm font-medium">{user.name?.split(" ")[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/50" />
                </div>
                <Link
                  href={user.role === "trainer" ? "/trainer/dashboard" : "/dashboard"}
                  className="flex items-center gap-2 px-4 py-2.5 text-white/70 hover:text-white text-sm font-medium transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => { logout(); router.push("/"); }}
                  className="flex items-center gap-2 px-4 py-2.5 text-white/60 hover:text-red-400 text-sm font-medium transition-colors"
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
            className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-950/98 backdrop-blur-xl border-t border-white/10 px-4 pt-4 pb-6 space-y-1">
          {!user ? (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all"
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-white/10 my-3" />
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl font-bold mt-2"
              >
                <Flame className="w-4 h-4" />
                Start Free Assessment
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl mb-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-white font-medium">{user.name}</span>
              </div>
              <Link
                href={user.role === "trainer" ? "/trainer/dashboard" : "/dashboard"}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <button
                onClick={() => { logout(); router.push("/"); setMobileOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-red-400 hover:bg-white/5 rounded-xl font-medium w-full transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
