"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import CustomerSidebar from "./CustomerSidebar";
import TrainerSidebar from "./TrainerSidebar";
import AdminSidebar from "./AdminSidebar";
import { NotificationBell } from "./NotificationBell";
import { useRouter } from "next/router";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Props {
  children: ReactNode;
  role: "customer" | "trainer" | "admin";
}

const DashboardShellContext = createContext(false);

// Derive a human-readable page title from the route
function getPageTitle(pathname: string): string {
  if (!pathname) return "Dashboard";
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
  customer: {
    label: "Customer",
    dot: "bg-orange-500",
    chip: "bg-orange-50 text-orange-700 border-orange-100",
    progress: "bg-orange-500",
  },
  trainer: {
    label: "Trainer",
    dot: "bg-blue-500",
    chip: "bg-blue-50 text-blue-700 border-blue-100",
    progress: "bg-blue-500",
  },
  admin: {
    label: "Admin",
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-100",
    progress: "bg-emerald-500",
  },
};

export default function DashboardLayout({ children, role }: Props) {
  const hasParentShell = useContext(DashboardShellContext);
  const router = useRouter();
  const pathname = router.pathname;
  const pageTitle = getPageTitle(pathname);
  const { dot, label, chip, progress } = roleConfig[role];
  const [routeLoading, setRouteLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof document === "undefined") {
      return true;
    }

    const cookieValue = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith("sidebar_state="))
      ?.split("=")[1];

    return cookieValue !== "false";
  });
  const SidebarComponent = role === "trainer"
    ? TrainerSidebar
    : role === "admin"
    ? AdminSidebar
    : CustomerSidebar;

  useEffect(() => {
    const handleStart = (url: string) => {
      if (url !== router.asPath) {
        setRouteLoading(true);
      }
    };
    const handleDone = () => setRouteLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleDone);
    router.events.on("routeChangeError", handleDone);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleDone);
      router.events.off("routeChangeError", handleDone);
    };
  }, [router]);

  if (hasParentShell) {
    return <>{children}</>;
  }

  return (
    <DashboardShellContext.Provider value={true}>
      <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <>
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-0 top-0 z-50 h-1 origin-left transition-transform duration-300 ${progress} ${
              routeLoading ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
            }`}
          />
          <div className="flex h-screen w-full overflow-hidden bg-[linear-gradient(180deg,#f8f5ef_0%,#f8fafc_45%,#f2f7ff_100%)] font-sans">
            <SidebarComponent />

            <SidebarInset className="flex flex-col overflow-hidden border-l border-border/70 bg-transparent">
              <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/70 bg-white/78 px-4 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
                  <Separator orientation="vertical" className="mr-2 h-4 bg-border" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="#" className="text-muted-foreground hover:text-foreground text-xs font-medium">
                          {label}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block text-muted-foreground/50" />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-foreground text-xs font-semibold">
                          {pageTitle}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`hidden sm:flex items-center gap-2 rounded-full border px-3 py-1.5 ${chip}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
                    <span className="text-[11px] font-semibold uppercase tracking-tight">{label} workspace</span>
                  </div>
                  <NotificationBell />
                </div>
              </header>

              <main className="flex-1 overflow-y-auto scrollbar-hide bg-transparent font-sans">
                {children}
              </main>
            </SidebarInset>
          </div>
        </>
      </SidebarProvider>
    </DashboardShellContext.Provider>
  );
}
