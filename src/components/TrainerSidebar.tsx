"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
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

      <Sidebar variant="inset" className="bg-zinc-950 border-r border-zinc-900">
        <SidebarHeader className="h-14 flex items-center px-4 border-b border-zinc-900">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Zap className="w-4 h-4 text-white fill-current" />
            </div>
            <span className="font-black text-sm text-white tracking-tight uppercase italic">
              iShow<span className="text-orange-500">Fitness</span>
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-2 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2 px-2 italic">
              Operation Command
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
                        className={`h-10 px-3 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? "bg-zinc-900 text-white font-bold" 
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? "text-orange-500" : ""}`} />
                          <span className="text-[11px] font-black uppercase italic tracking-wider">{label}</span>
                          {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-orange-500" />}
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2 px-2 italic">
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
                        className={`h-9 px-3 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? "bg-zinc-900/80 text-white" 
                            : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-3.5 h-3.5 ${isActive ? "text-orange-500" : ""}`} />
                          <span className="text-[10px] font-black uppercase italic tracking-widest">{label}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-zinc-900">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-zinc-900/30 border border-zinc-800/50 mb-4">
            <Avatar className="h-8 w-8 rounded-lg border border-zinc-800">
              <AvatarFallback className="bg-orange-500 text-white text-[10px] font-black">
                {user?.name?.charAt(0).toUpperCase() ?? "T"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-white truncate uppercase italic">{user?.name}</p>
              <p className="text-[9px] text-orange-500 font-black uppercase tracking-widest opacity-60">Trainer Core</p>
            </div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setShowSignOut(true)}
                className="text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 h-9 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest italic">Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
