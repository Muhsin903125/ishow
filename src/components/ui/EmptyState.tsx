import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  variant?: "default" | "admin";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  variant = "default",
}: EmptyStateProps) {
  const isAdmin = variant === "admin";
  const iconBg = isAdmin ? "bg-violet-50" : "bg-orange-50";
  const iconColor = isAdmin ? "text-violet-400" : "text-orange-400";
  const btnBg = isAdmin
    ? "bg-violet-600 hover:bg-violet-700"
    : "bg-orange-500 hover:bg-orange-400";

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center mb-4`}>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-5">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className={`px-5 py-2.5 ${btnBg} text-white rounded-xl text-sm font-semibold transition-colors`}
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className={`px-5 py-2.5 ${btnBg} text-white rounded-xl text-sm font-semibold transition-colors`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
