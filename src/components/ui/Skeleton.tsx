import React from "react";

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-white/5",
        className
      )}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-white/5 border border-white/10 p-5 animate-pulse", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-white/10 rounded-md w-2/3" />
          <div className="h-2.5 bg-white/10 rounded-md w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2.5 bg-white/10 rounded-md w-full" />
        <div className="h-2.5 bg-white/10 rounded-md w-4/5" />
      </div>
    </div>
  );
}

export function SkeletonSessionRow() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-white/10 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 bg-white/10 rounded w-1/2" />
        <div className="h-2 bg-white/10 rounded w-1/3" />
      </div>
    </div>
  );
}

export function SkeletonText({ className }: { className?: string }) {
  return <div className={cn("h-3 bg-white/10 rounded-md animate-pulse", className)} />;
}
