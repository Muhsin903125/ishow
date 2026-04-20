# T15 — Verify & Extend Payments DB Functions

**Category:** P1 — Critical  
**Area:** Trainer · Payment Management  
**File:** `src/lib/db/payments.ts`  
**Depends on:** None (prerequisite for T11–T13)

---

## Why

Tasks T11–T13 rely on `listPayments`, `createPayment`, and `updatePaymentStatus` from `src/lib/db/payments.ts`. This task ensures those functions exist, are correctly typed, and properly map Supabase snake_case columns to camelCase TypeScript.

---

## Implementation Steps

### Step 1 — Read `src/lib/db/payments.ts` in full

Document what functions exist and what columns they read/write.

### Step 2 — Verify the `Payment` interface

```typescript
export interface Payment {
  id: string;
  userId: string;
  planId?: string;
  amount: number;
  paidDate?: string;    // "YYYY-MM-DD"
  dueDate?: string;     // "YYYY-MM-DD"
  status: "paid" | "pending" | "overdue";
  reference?: string;
  description?: string;
  createdAt: string;
}
```

### Step 3 — Verify `listPayments`

Should support optional `userId` filter for trainer context:

```typescript
export async function listPayments(filters?: { userId?: string }): Promise<Payment[]> {
  const supabase = createClient();
  let query = supabase.from("payments").select("*").order("due_date", { ascending: false });
  if (filters?.userId) query = query.eq("user_id", filters.userId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapPayment);
}
```

### Step 4 — Verify `createPayment` exists

See T12 for the expected implementation. If missing, add it.

### Step 5 — Verify `updatePaymentStatus` exists

See T13 for the expected implementation. If missing, add it.

### Step 6 — Add `mapPayment` helper if missing

```typescript
function mapPayment(row: Record<string, unknown>): Payment {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    planId: row.plan_id as string | undefined,
    amount: row.amount as number,
    paidDate: row.paid_date as string | undefined,
    dueDate: row.due_date as string | undefined,
    status: row.status as Payment["status"],
    reference: row.reference as string | undefined,
    description: row.description as string | undefined,
    createdAt: row.created_at as string,
  };
}
```

### Step 7 — Check for overdue auto-detection

On `listPayments`, consider auto-flagging overdue on read:

```typescript
const today = new Date().toISOString().split("T")[0];
return (data ?? []).map(row => {
  const payment = mapPayment(row);
  if (payment.status === "pending" && payment.dueDate && payment.dueDate < today) {
    payment.status = "overdue"; // read-time override (does not write to DB)
  }
  return payment;
});
```

This is a lightweight client-side fix. A proper server-side solution is covered in task AU1.

---

## Acceptance Criteria

- [ ] `listPayments`, `createPayment`, `updatePaymentStatus` all exist in `src/lib/db/payments.ts`.
- [ ] `listPayments` supports optional `userId` filter.
- [ ] All functions use snake_case → camelCase mapping.
- [ ] All functions throw on Supabase error.
- [ ] Overdue detection is applied at read time (optional but recommended).
- [ ] No TypeScript errors.
