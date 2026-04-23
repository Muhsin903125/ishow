"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { SignOutModal } from "./SignOutModal";
import { getAssessment } from "@/lib/db/assessments";
import { customerNavItems } from "@/lib/navigation";
import {
  Zap,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function CustomerSidebar() {
  const router = useRouter();
  const pathname = router.pathname;
  const { user, logout } = useAuth();
  const [showSignOut, setShowSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [hasAssessment, setHasAssessment] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    if (!user || user.role !== "customer") {
      return;
    }

    getAssessment(user.id)
      .then((assessment) => {
        if (active) {
          setHasAssessment(Boolean(assessment));
        }
      })
      .catch(() => {
        if (active) {
          setHasAssessment(null);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    for (const item of customerNavItems) {
      void router.prefetch(item.href);
    }
  }, [router]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await logout();
    window.location.href = "/";
  };

  const visibleNavItems = customerNavItems.filter((item) =>
    item.href === "/assessment" ? !hasAssessment : true
  );

  return (
    <>
      <SignOutModal
        open={showSignOut}
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOut(false)}
        loading={signingOut}
      />

      <Sidebar variant="inset" className="border-r border-border/70 bg-white/88 backdrop-blur-md">
        <SidebarHeader className="flex h-16 items-center border-b border-border/70 px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-500 shadow-sm shadow-orange-500/20">
              <Zap className="w-3.5 h-3.5 text-white fill-current" />
            </div>
            <div>
              <span className="block text-sm font-bold tracking-tight text-foreground">
                iShow<span className="text-orange-500">Fitness</span>
              </span>
              <span className="block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Member portal</span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-3 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
              Journey
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleNavItems.map(({ href, icon: Icon, label }) => {
                  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        render={<Link href={href} />}
                        isActive={isActive}
                        tooltip={label}
                        className={`h-11 rounded-2xl px-3 transition-colors ${
                          isActive 
                            ? "border border-orange-100 bg-orange-50 text-orange-700 font-semibold shadow-sm" 
                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${isActive ? "bg-white text-orange-600" : "bg-muted/60 text-muted-foreground"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[12px] font-medium">{label}</span>
                          {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-orange-500" />}
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-border/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.7),rgba(255,255,255,0.98))] p-3">
          <div className="mb-3 rounded-2xl border border-border bg-white px-3 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 rounded-xl border border-border">
              <AvatarFallback className="bg-orange-500 text-white text-[10px] font-bold">
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-foreground">{user?.name}</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Customer</p>
            </div>
            </div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setShowSignOut(true)}
                className="h-10 rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
