"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  listNotifications,
  markAllRead,
  type AppNotification,
} from "@/lib/db/notifications";

function mapPayload(row: Record<string, unknown>): AppNotification {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    type: row.type as string,
    title: row.title as string,
    body: (row.body as string) ?? undefined,
    href: (row.href as string) ?? undefined,
    isRead: (row.is_read as boolean) ?? false,
    createdAt: row.created_at as string,
  };
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Track whether we've already subscribed for this user to prevent double-subscription
  const subscribedUserRef = useRef<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!user) return;
    // If we already have an active subscription for this exact user, skip
    if (subscribedUserRef.current === user.id) return;
    subscribedUserRef.current = user.id;

    // Initial load
    listNotifications(user.id).then(setNotifications);

    // Use a unique name so the global Supabase realtime multiplexer
    // doesn't confuse this with any stale channel from a prior render
    const supabase = createClient();
    const channelName = `notifications:${user.id}:${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [
            mapPayload(payload.new as Record<string, unknown>),
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      subscribedUserRef.current = null;
    };
  }, [user?.id]); // depend only on user.id, not the whole object

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <h3 className="font-bold text-sm text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-orange-400 font-semibold hover:text-orange-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/60">
            {notifications.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-8">
                No notifications yet
              </p>
            )}
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.href ?? "#"}
                onClick={() => setOpen(false)}
                className={`flex gap-3 px-4 py-3 hover:bg-zinc-800/60 transition-colors ${
                  !n.isRead ? "bg-orange-500/5" : ""
                }`}
              >
                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                )}
                <div className={n.isRead ? "pl-5" : ""}>
                  <p className="text-sm font-semibold text-white">{n.title}</p>
                  {n.body && (
                    <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{n.body}</p>
                  )}
                  <p className="text-xs text-zinc-600 mt-1">
                    {new Date(n.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
