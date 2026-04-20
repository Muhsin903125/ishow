# RT1 — In-App Notification Bell with Supabase Realtime

**Category:** P3 — Enhancement  
**Area:** Realtime Notifications  
**Files:** Create `src/components/NotificationBell.tsx`, create `notifications` Supabase table

---

## Why

Currently, users only find out about important events (new session booked, plan assigned, payment overdue) by receiving an email or manually refreshing the page. In-app notifications with a realtime badge give users immediate awareness without leaving the app.

---

## Implementation Steps

### Step 1 — Create the `notifications` Supabase table

```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,       -- 'session_booked' | 'plan_assigned' | 'payment_due' | ...
  title       TEXT NOT NULL,
  body        TEXT,
  href        TEXT,               -- link to navigate to on click
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users see only their own notifications
CREATE POLICY "own_notifications"
  ON notifications FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Index for unread count query
CREATE INDEX idx_notifications_user_unread
  ON notifications (user_id, is_read, created_at DESC);
```

### Step 2 — Create notification helper in `src/lib/db/notifications.ts`

```typescript
import { createClient } from "@/lib/supabase/client";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  href?: string;
  isRead: boolean;
  createdAt: string;
}

export async function listNotifications(userId: string, limit = 20): Promise<Notification[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapNotification);
}

export async function markAllRead(userId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
}

export async function markRead(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
}

function mapNotification(row: Record<string, unknown>): Notification { ... }
```

### Step 3 — Create `NotificationBell` component

Create `src/components/NotificationBell.tsx`:

```tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { listNotifications, markAllRead, type Notification } from "@/lib/db/notifications";

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!user) return;

    // Initial load
    listNotifications(user.id).then(setNotifications);

    // Realtime subscription
    const supabase = createClient();
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications(prev => [mapPayload(payload.new), ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleOpen = () => {
    setOpen(o => !o);
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-orange-500 font-semibold">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
            )}
            {notifications.map(n => (
              <Link
                key={n.id}
                href={n.href ?? "#"}
                onClick={() => setOpen(false)}
                className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${!n.isRead ? "bg-orange-50" : ""}`}
              >
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  {n.body && <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
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
```

### Step 4 — Add NotificationBell to DashboardLayout header

In `src/components/DashboardLayout.tsx`, add the bell to the top header bar:

```tsx
import { NotificationBell } from "./NotificationBell";

// Inside the header:
<div className="flex items-center gap-2">
  <NotificationBell />
  {/* existing header items */}
</div>
```

---

## Acceptance Criteria

- [ ] `notifications` Supabase table exists with RLS policies.
- [ ] `NotificationBell` renders in the DashboardLayout header.
- [ ] Unread count badge appears on the bell when there are unread notifications.
- [ ] Clicking the bell opens a dropdown list of notifications.
- [ ] New notifications pushed via Supabase Realtime appear instantly without page refresh.
- [ ] "Mark all read" clears the badge.
- [ ] Notification link navigates to the relevant page.
- [ ] No TypeScript errors.
