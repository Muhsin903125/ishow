"use client";

import { ReactNode } from "react";
import { Menu, Zap, Search, Bell } from "lucide-react";
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
  customer: { accent: "from-orange-500 to-orange-600", dot: "bg-orange-500" },
  trainer:  { accent: "from-blue-500 to-blue-700",     dot: "bg-blue-500" },
  admin:    { accent: "from-violet-500 to-violet-700", dot: "bg-violet-500" },
};

export default function DashboardLayout({ children, role }: Props) {
  const router = useRouter();
  const pathname = router.pathname;
  const pageTitle = getPageTitle(pathname);
  const { dot } = roleConfig[role];

  const SidebarComponent = role === "trainer"
    ? TrainerSidebar
    : role === "admin"
    ? AdminSidebar
    : CustomerSidebar;

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background overflow-hidden w-full">
        <SidebarComponent />
        
        <SidebarInset className="bg-background flex flex-col overflow-hidden border-l border-border">
          <header className="flex h-12 shrink-0 items-center justify-between gap-2 px-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-border" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#" className="text-muted-foreground hover:text-foreground text-xs font-medium">
                      {role.charAt(0).toUpperCase() + role.slice(1)}
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
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-muted/50 rounded-md border border-border">
                <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">{role} active</span>
              </div>
              <NotificationBell />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto scrollbar-hide bg-muted/20">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
