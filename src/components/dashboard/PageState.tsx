"use client";

import type { ReactNode } from "react";
import { AlertTriangle, Loader2, Sparkles } from "lucide-react";

type DashboardStateRole = "customer" | "trainer" | "admin";

const roleAccent = {
  customer: {
    badge: "border-orange-200 bg-orange-50 text-orange-700",
    icon: "text-orange-500",
  },
  trainer: {
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    icon: "text-blue-500",
  },
  admin: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: "text-emerald-500",
  },
};

function PageStateFrame({
  role,
  badge,
  title,
  description,
  icon,
  action,
}: {
  role: DashboardStateRole;
  badge: string;
  title: string;
  description: string;
  icon: ReactNode;
  action?: ReactNode;
}) {
  const accent = roleAccent[role];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="mx-auto flex max-w-fit items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-slate-700">
          <span className={`rounded-full border px-3 py-1 ${accent.badge}`}>{badge}</span>
        </div>
        <div className={`mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 ${accent.icon}`}>
          {icon}
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          {description}
        </p>
        {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}

export function DashboardPageLoading({
  role,
  label,
}: {
  role: DashboardStateRole;
  label: string;
}) {
  return (
    <PageStateFrame
      role={role}
      badge="Loading"
      title="Preparing your workspace."
      description={label}
      icon={<Loader2 className="h-5 w-5 animate-spin" />}
    />
  );
}

export function DashboardPageError({
  role,
  title,
  description,
  action,
}: {
  role: DashboardStateRole;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <PageStateFrame
      role={role}
      badge="Attention"
      title={title}
      description={description}
      icon={<AlertTriangle className="h-5 w-5" />}
      action={action}
    />
  );
}

export function DashboardPageEmpty({
  role,
  title,
  description,
  action,
}: {
  role: DashboardStateRole;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <PageStateFrame
      role={role}
      badge="Empty"
      title={title}
      description={description}
      icon={<Sparkles className="h-5 w-5" />}
      action={action}
    />
  );
}
