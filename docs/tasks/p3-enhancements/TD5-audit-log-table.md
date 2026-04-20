# TD5 — Add Audit Log Table to Supabase

**Category:** P3 — Tech Debt / Compliance  
**Area:** Database · Observability  
**File:** Supabase SQL Editor, `src/lib/db/audit.ts`

---

## Why

There is no record of who performed what action in the platform. For compliance, debugging, and accountability, key admin and trainer actions should be logged: assessment reviewed, plan assigned, session scheduled, trainer invited, client converted.

---

## Implementation Steps

### Step 1 — Create the `audit_logs` table

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID NOT NULL REFERENCES profiles(id),
  actor_role    TEXT NOT NULL,
  action        TEXT NOT NULL,      -- e.g. 'assessment.reviewed', 'plan.assigned'
  target_type   TEXT,               -- e.g. 'assessment', 'plan', 'session'
  target_id     UUID,               -- ID of the affected record
  target_user_id UUID,              -- the customer affected
  metadata      JSONB,              -- any extra context (old values, new values)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only admins can read audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_audit_logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role only for inserts (audit logs should only be written server-side)
-- No INSERT policy for regular users (use service role key in API routes)
```

### Step 2 — Create `src/lib/db/audit.ts`

```typescript
import { createClient } from "@/lib/supabase/server"; // server-side client

export async function logAction(input: {
  actorId: string;
  actorRole: string;
  action: string;
  targetType?: string;
  targetId?: string;
  targetUserId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({
    actor_id: input.actorId,
    actor_role: input.actorRole,
    action: input.action,
    target_type: input.targetType ?? null,
    target_id: input.targetId ?? null,
    target_user_id: input.targetUserId ?? null,
    metadata: input.metadata ?? null,
  });
  // Don't throw on audit failure — audit should not block the main action
}
```

### Step 3 — Add audit calls to key actions

In admin/trainer server-side code (API routes or server actions), call `logAction` after:

| Action | `action` string |
|---|---|
| Assessment reviewed | `"assessment.reviewed"` |
| Client converted | `"client.converted"` |
| Plan assigned | `"plan.assigned"` |
| Session scheduled (admin) | `"session.scheduled"` |
| Trainer invited | `"trainer.invited"` |
| Trainer deleted | `"trainer.deleted"` |

Example in the invite-trainer API route:

```typescript
await logAction({
  actorId: adminUser.id,
  actorRole: "admin",
  action: "trainer.invited",
  targetType: "profile",
  metadata: { email: body.email, name: body.name },
});
```

### Step 4 — Create a simple audit log viewer in admin (optional)

Add a read-only table on `/admin/reports` or a new `/admin/audit` page showing recent audit logs:

| Time | Actor | Action | Target |
|---|---|---|---|
| Apr 20, 2:30pm | Admin | assessment.reviewed | Customer: John |

---

## Acceptance Criteria

- [ ] `audit_logs` table exists in Supabase.
- [ ] RLS allows only admins to read logs.
- [ ] `logAction` helper exists in `src/lib/db/audit.ts` and uses the server-side client.
- [ ] At least 3 key admin actions call `logAction`.
- [ ] Audit failures are caught silently (do not break the main flow).
- [ ] No TypeScript errors.
