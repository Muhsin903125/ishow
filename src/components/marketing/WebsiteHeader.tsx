"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, LogOut, LayoutDashboard, Flame, ChevronRight } from "lucide-react";

const websiteNavLinks = [
  { label: "Home", href: "/", id: null },
  { label: "Services", href: "/services", id: null },
  { label: "About", href: "/about", id: null },
  { label: "Contact", href: "/contact", id: null },
];

export default function WebsiteHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = router.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12 || pathname !== "/");
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleSignOut = async () => {
    await logout();
    setMobileOpen(false);
    window.location.href = "/";
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled
          ? "bg-[rgba(246,240,231,0.92)] backdrop-blur-2xl border-b border-slate-200/80 py-3 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex justify-between items-center bg-transparent gap-8">
          <Link href="/" className="group flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <div className="w-7 h-7 bg-orange-500 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4 text-white fill-white" />
            </div>
            <span
              className={`font-black text-lg tracking-widest uppercase italic transition-colors ${
                scrolled ? "text-slate-950" : "text-[#fffaf6]"
              }`}
            >
              iShow<span className="text-orange-500">Transformation</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            <div className="flex items-center gap-8">
              {websiteNavLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative group/link ${
                    pathname === link.href
                      ? "text-orange-500"
                      : scrolled
                        ? "text-slate-500 hover:text-slate-950"
                        : "text-[rgba(255,250,246,0.72)] hover:text-[#fffaf6]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className={`h-4 w-[1px] ${scrolled ? "bg-slate-300/80" : "bg-white/20"}`} />

            {!user ? (
              <div className="flex items-center gap-6">
                <Link
                  href="/login"
                  className={`text-[10px] font-black uppercase tracking-[0.2em] hover:text-orange-500 transition-colors ${
                    scrolled ? "text-slate-950" : "text-[#fffaf6]"
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 bg-orange-500 text-white rounded-md text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-lg active:scale-95"
                >
                  Start Assessment
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link
                  href={user.role === "trainer" ? "/trainer/dashboard" : "/dashboard"}
                  className="flex items-center gap-2 group"
                >
                  <LayoutDashboard
                    className={`w-4 h-4 transition-colors group-hover:text-orange-500 ${
                      scrolled ? "text-slate-500" : "text-[rgba(255,250,246,0.72)]"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors group-hover:text-orange-500 ${
                      scrolled ? "text-slate-700" : "text-[#fffaf6]"
                    }`}
                  >
                    Dashboard
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className={`p-2 hover:text-red-500 transition-colors ${
                    scrolled ? "text-slate-500" : "text-[rgba(255,250,246,0.72)]"
                  }`}
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
              scrolled
                ? "bg-white/90 border border-slate-200 text-slate-950"
                : "bg-[rgba(17,24,39,0.48)] border border-white/15 text-[#fffaf6]"
            }`}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[-1] bg-zinc-950 transition-all duration-500 lg:hidden ${
          mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="pt-32 px-8 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-2">
              Navigation
            </p>
            {websiteNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between text-3xl font-extrabold uppercase text-white group"
              >
                {link.label}
                <ChevronRight className="w-6 h-6 text-orange-500 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
              </Link>
            ))}
          </div>

          <div className="h-px w-full bg-zinc-900 my-4" />

          {!user ? (
            <div className="flex flex-col gap-4">
              <Link href="/login" className="text-white font-bold" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
              <Link
                href="/register"
                className="w-full py-5 bg-orange-500 text-white text-center rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl"
                onClick={() => setMobileOpen(false)}
              >
                Start Assessment
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link
                href={user.role === "trainer" ? "/trainer/dashboard" : "/dashboard"}
                className="flex items-center gap-4 py-4 px-6 bg-zinc-900 rounded-2xl border border-zinc-800"
                onClick={() => setMobileOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5 text-orange-500" />
                <span className="text-white font-bold uppercase tracking-widest">Active Dashboard</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-4 py-4 px-6 text-red-500 font-bold uppercase tracking-widest"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
