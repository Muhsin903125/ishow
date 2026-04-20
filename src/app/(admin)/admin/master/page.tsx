"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Dumbbell, MapPin, Target, FileText } from "lucide-react";

const sections = [
  { href: "/admin/master/exercises", label: "Exercise Library", desc: "Add and manage exercises trainers can use when building programs.", icon: Dumbbell, color: "bg-orange-50 border-orange-100", iconColor: "text-orange-500" },
  { href: "/admin/master/locations", label: "Locations", desc: "Manage gym and training venue options shown in the assessment form.", icon: MapPin, color: "bg-blue-50 border-blue-100", iconColor: "text-blue-500" },
  { href: "/admin/master/goals", label: "Goal Types", desc: "Configure the fitness goal options clients can select when submitting an assessment.", icon: Target, color: "bg-green-50 border-green-100", iconColor: "text-green-500" },
  { href: "/admin/master/plan-templates", label: "Plan Templates", desc: "Create reusable plan templates trainers can apply to clients.", icon: FileText, color: "bg-violet-50 border-violet-100", iconColor: "text-violet-500" },
];

export default function AdminMasterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user && user.role !== "admin") { router.push("/trainer/master"); }
  }, [loading, router, user]);

  if (loading || !user) return null;

  return (
    <DashboardLayout role="admin">
      <div className="w-full max-w-4xl p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Master Data</h1>
          <p className="text-gray-500 mt-1">Manage the reference data that powers the platform.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.href}
                href={s.href}
                className={`rounded-3xl border ${s.color} p-6 transition-all hover:-translate-y-1 hover:shadow-md`}
              >
                <Icon className={`w-6 h-6 ${s.iconColor} mb-4`} />
                <h3 className="font-black text-gray-900 mb-2">{s.label}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{s.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
