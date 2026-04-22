"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { SignOutModal } from "./SignOutModal";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  MapPin,
  Target,
  FileText,
  LogOut,
  UserPlus,
  CreditCard,
  Settings,
  Zap,
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

const navItems = [
  { href: "/trainer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/trainer/clients",   icon: Users,           label: "Clients" },
  { href: "/trainer/sessions",  icon: Target,          label: "Operations" },
  { href: "/trainer/payments",  icon: CreditCard,      label: "Payments" },
  { href: "/trainer/team",      icon: UserPlus,        label: "Team" },
  { href: "/trainer/settings",  icon: Settings,        label: "Settings" },
];

const masterItems = [
  { href: "/admin/master/exercises",       icon: Dumbbell,  label: "Exercises" },
  { href: "/admin/master/locations",       icon: MapPin,    label: "Locations" },
  { href: "/admin/master/goals",           icon: Target,    label: "Goals" },
  { href: "/admin/master/plan-templates",  icon: FileText,  label: "Plan Templates" },
];

export default function TrainerSidebar() {
  const router = useRouter();
  const pathname = router.pathname;
  const { user, logout } = useAuth();
  const [showSignOut, setShowSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await logout();
    window.location.href = "/";
  };

  return (
    <>
      <SignOutModal
        open={showSignOut}
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOut(false)}
        loading={signingOut}
      />

      <Sidebar variant="inset" className="bg-background border-r border-border">
        <SidebarHeader className="h-12 flex items-center px-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-orange-500 flex items-center justify-center shadow-sm">
              <Zap className="w-3.5 h-3.5 text-white fill-current" />
            </div>
            <span className="font-bold text-sm text-foreground tracking-tight">
              iShow<span className="text-orange-500">Fitness</span>
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1 px-2">
              Operations
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map(({ href, icon: Icon, label }) => {
                  const isActive = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        render={<Link href={href} />}
                        isActive={isActive}
                        tooltip={label}
                        className={`h-9 px-3 rounded-md transition-colors ${
                          isActive 
                            ? "bg-secondary text-secondary-foreground font-semibold" 
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Icon className={`w-4 h-4 ${isActive ? "text-orange-500" : "text-muted-foreground"}`} />
                          <span className="text-[12px] font-medium">{label}</span>
                          {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-orange-500" />}
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-2">
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1 px-2">
              Global Assets
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {masterItems.map(({ href, icon: Icon, label }) => {
                  const isActive = pathname === href;
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        render={<Link href={href} />}
                        isActive={isActive}
                        tooltip={label}
                        className={`h-8 px-3 rounded-md transition-colors ${
                          isActive 
                            ? "bg-secondary/80 text-secondary-foreground font-semibold" 
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Icon className={`w-3.5 h-3.5 ${isActive ? "text-orange-500" : "text-muted-foreground"}`} />
                          <span className="text-[11px] font-medium">{label}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t border-border bg-muted/30">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-background border border-border mb-2">
            <Avatar className="h-7 w-7 rounded-md border border-border">
              <AvatarFallback className="bg-orange-500 text-white text-[10px] font-bold">
                {user?.name?.charAt(0).toUpperCase() ?? "T"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-foreground truncate">{user?.name}</p>
              <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Trainer</p>
            </div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setShowSignOut(true)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 rounded-md transition-colors"
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
