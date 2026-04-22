"use client";

import { ReactNode } from "react";
import { Menu, Zap, Search, Bell } from "lucide-react";
import CustomerSidebar from "./CustomerSidebar";
import TrainerSidebar from "./TrainerSidebar";
import AdminSidebar from "./AdminSidebar";
import { NotificationBell } from "./NotificationBell";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const { dot } = roleConfig[role];

  const SidebarComponent = role === "trainer"
    ? TrainerSidebar
    : role === "admin"
    ? AdminSidebar
    : CustomerSidebar;

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-zinc-950 overflow-hidden w-full">
        <SidebarComponent />
        
        <SidebarInset className="bg-zinc-950 flex flex-col overflow-hidden border-l border-zinc-900">
          <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-4 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 text-zinc-400 hover:text-white" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-zinc-800" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#" className="text-zinc-500 hover:text-zinc-300 text-[10px] font-black uppercase tracking-widest italic">
                      {role}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block text-zinc-800" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-white text-[10px] font-black uppercase tracking-widest italic">
                      {pageTitle}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{role} active</span>
              </div>
              <NotificationBell />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto scrollbar-hide">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
