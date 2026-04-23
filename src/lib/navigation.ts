import {
  Activity,
  BarChart2,
  Calendar,
  ClipboardList,
  CreditCard,
  Database,
  Dumbbell,
  FileText,
  Globe,
  LayoutDashboard,
  MapPin,
  Settings,
  Target,
  TrendingUp,
  UserCog,
  UserPlus,
  UserRoundPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

export type DashboardRole = "customer" | "trainer" | "admin";

export type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

export const customerRoutePrefixes = [
  "/dashboard",
  "/assessment",
  "/my-plan",
  "/programs",
  "/sessions",
  "/progress",
  "/payments",
  "/profile",
];

export const customerNavItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Command Centre" },
  { href: "/assessment", icon: Activity, label: "Assessment" },
  { href: "/my-plan", icon: Target, label: "My Plan" },
  { href: "/programs", icon: Dumbbell, label: "Programs" },
  { href: "/sessions", icon: Calendar, label: "Sessions" },
  { href: "/progress", icon: TrendingUp, label: "Progress" },
  { href: "/payments", icon: CreditCard, label: "Payments" },
  { href: "/profile", icon: Settings, label: "Profile" },
];

export const trainerNavItems: NavItem[] = [
  { href: "/trainer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/trainer/clients", icon: Users, label: "Clients" },
  { href: "/trainer/sessions", icon: Calendar, label: "Sessions" },
  { href: "/trainer/programs", icon: Dumbbell, label: "Programs" },
  { href: "/trainer/payments", icon: CreditCard, label: "Payments" },
  { href: "/trainer/team", icon: UserPlus, label: "Team" },
  { href: "/trainer/settings", icon: Settings, label: "Settings" },
];

export const trainerMasterNavItems: NavItem[] = [
  { href: "/admin/master/exercises", icon: Dumbbell, label: "Exercises" },
  { href: "/admin/master/locations", icon: MapPin, label: "Locations" },
  { href: "/admin/master/goals", icon: Target, label: "Goals" },
  { href: "/admin/master/plan-templates", icon: FileText, label: "Plan Templates" },
];

export const adminNavItems: NavItem[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/assessments", icon: ClipboardList, label: "Assessments" },
  { href: "/admin/trainers", icon: UserCog, label: "Trainers" },
  { href: "/admin/clients", icon: Users, label: "Clients" },
  { href: "/admin/leads", icon: UserRoundPlus, label: "Leads" },
  { href: "/admin/payments", icon: CreditCard, label: "Payments" },
  { href: "/admin/reports", icon: BarChart2, label: "Reports" },
  { href: "/admin/cms", icon: Globe, label: "Website CMS" },
  { href: "/admin/master", icon: Database, label: "Master Data" },
];

export function getDashboardRoleForPath(
  pathname: string,
  userRole?: DashboardRole | null
): DashboardRole | null {
  if (!pathname) return null;

  if (pathname.startsWith("/admin/master")) {
    if (!userRole) {
      return null;
    }
    return userRole === "trainer" ? "trainer" : "admin";
  }

  if (pathname.startsWith("/admin")) {
    return "admin";
  }

  if (pathname.startsWith("/trainer")) {
    return "trainer";
  }

  if (customerRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return "customer";
  }

  return null;
}

export function getNavItemsForRole(
  role: DashboardRole,
  pathname?: string
): NavItem[] {
  if (role === "admin") {
    return adminNavItems;
  }

  if (role === "trainer") {
    const items = [...trainerNavItems];
    if (pathname?.startsWith("/admin/master")) {
      items.push(...trainerMasterNavItems);
    }
    return items;
  }

  return customerNavItems;
}
