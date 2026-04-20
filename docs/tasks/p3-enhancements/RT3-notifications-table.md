# RT3 — Create Notifications Supabase Table

**Category:** P3 — Enhancement  
**Area:** Database Schema  
**File:** Supabase SQL Editor  
**Depends on:** None (prerequisite for RT1 and RT2)

---

## Why

The notification bell (RT1) and notification triggers (RT2) require a `notifications` table in Supabase with realtime enabled. This task covers the full schema setup.

---

## Implementation Steps

### Step 1 — Create the table

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  href        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Step 2 — Enable Row-Level Security

```sql
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

### Step 3 — Create RLS policies

```sql
-- Users can see only their own notifications
CREATE POLICY "own_notifications_select"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Only server/service role can insert notifications (notifications created server-side)
-- If inserting from client: allow authenticated users to insert for themselves
CREATE POLICY "own_notifications_insert"
  ON notifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update (mark as read) their own notifications
CREATE POLICY "own_notifications_update"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "own_notifications_delete"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());
```

### Step 4 — Enable Realtime on the table

In Supabase Dashboard → Database → Replication, add `notifications` to the realtime publication:

```sql
-- Or via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

### Step 5 — Create performance index

```sql
CREATE INDEX idx_notifications_user_unread
  ON notifications (user_id, is_read, created_at DESC);
```

### Step 6 — Verify realtime is working

In the Supabase Dashboard → Table Editor → notifications, insert a test row for a known user ID. Open the NotificationBell in the browser and confirm the row appears without a page refresh.

---

## Acceptance Criteria

- [ ] `notifications` table exists with the schema above.
- [ ] RLS is enabled with correct policies.
- [ ] Realtime is enabled for the table (added to supabase_realtime publication).
- [ ] Performance index exists on `(user_id, is_read, created_at DESC)`.
- [ ] Test realtime: inserting a row in SQL Editor causes the bell to update in the browser within 1-2 seconds.
- [ ] No SQL errors during setup.
