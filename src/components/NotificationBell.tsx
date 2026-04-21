"use client";

import { useEffect, useState, useRef } from "react";
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!user) return;

    // Initial load
    listNotifications(user.id).then(setNotifications);

    // Realtime subscription
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [mapPayload(payload.new as Record<string, unknown>), ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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
        className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-orange-500 font-semibold hover:text-orange-600 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">
                No notifications yet
              </p>
            )}
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.href ?? "#"}
                onClick={() => setOpen(false)}
                className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  !n.isRead ? "bg-orange-50/50" : ""
                }`}
              >
                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                )}
                <div className={n.isRead ? "pl-5" : ""}>
                  <p className="text-sm font-semibold text-gray-900">
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {n.body}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
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
