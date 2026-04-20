# AU1 — Payment Overdue Auto-Update

**Category:** P2 — Important  
**Area:** Automation · Payments  
**Files:** `src/lib/db/payments.ts`, Supabase Dashboard (scheduled function)

---

## Why

Payment statuses are currently static. A payment stays `pending` forever even after the `due_date` has passed. Trainers and admins need accurate overdue counts without manually updating each record.

---

## Implementation Steps (Two Phases)

### Phase 1 — Client-side read-time detection (Quick win, no backend needed)

Update `listPayments` in `src/lib/db/payments.ts` to flag overdue payments on read:

```typescript
export async function listPayments(filters?: { userId?: string }): Promise<Payment[]> {
  const supabase = createClient();
  let query = supabase.from("payments").select("*").order("due_date", { ascending: false });
  if (filters?.userId) query = query.eq("user_id", filters.userId);
  const { data, error } = await query;
  if (error) throw error;

  const today = new Date().toISOString().split("T")[0];
  return (data ?? []).map(row => {
    const payment = mapPayment(row);
    // Flag overdue at read time (does not write to DB)
    if (payment.status === "pending" && payment.dueDate && payment.dueDate < today) {
      payment.status = "overdue";
    }
    return payment;
  });
}
```

This ensures that all pages (customer, trainer, admin) show correct overdue status without any backend job. The DB still stores `"pending"` but the UI treats past-due payments as `"overdue"`.

### Phase 2 — Supabase Scheduled Function (Persistent, server-side)

For accurate reporting and email reminders, the DB should also be updated. Set up a Supabase database function scheduled to run daily.

#### Step 1 — Create the SQL function in Supabase

In the Supabase SQL Editor, create:

```sql
CREATE OR REPLACE FUNCTION update_overdue_payments()
RETURNS void AS $$
BEGIN
  UPDATE payments
  SET status = 'overdue'
  WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
```

#### Step 2 — Schedule it via pg_cron (Supabase supports this)

In the Supabase Dashboard → Database → Extensions, enable `pg_cron`. Then:

```sql
SELECT cron.schedule(
  'update-overdue-payments',
  '0 1 * * *',  -- runs daily at 1:00 AM UTC
  'SELECT update_overdue_payments()'
);
```

#### Step 3 — Verify the schedule

```sql
SELECT * FROM cron.job;
```

Confirm `update-overdue-payments` is listed and `active = true`.

---

## Acceptance Criteria

**Phase 1 (client-side):**
- [ ] `listPayments` flags payments as `"overdue"` at read time when `dueDate < today` and `status === "pending"`.
- [ ] Customer payments page, trainer payments page, and admin payments page all show correct overdue counts.
- [ ] No writes to Supabase from the client-side detection.

**Phase 2 (server-side):**
- [ ] Supabase `update_overdue_payments` SQL function exists.
- [ ] pg_cron job runs daily and updates overdue records in the DB.
- [ ] After the job runs, `listPayments` returns `"overdue"` from DB (not just client-side).
