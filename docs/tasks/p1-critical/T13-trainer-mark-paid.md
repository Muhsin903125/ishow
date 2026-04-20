# T13 — Trainer: Mark Payment as Paid

**Category:** P1 — Critical  
**Area:** Trainer · Payment Management  
**File:** `src/app/trainer/payments/page.tsx`  
**Depends on:** T11

---

## Why

After a client pays their monthly fee (via bank transfer, cash, or other means), the trainer needs to record it as paid in the system so the client's payment history is accurate and the pending/overdue counts update correctly.

---

## Implementation Steps

### Step 1 — Add "Mark Paid" button to pending/overdue rows

In the payments table, for rows where `status !== "paid"`, show:

```tsx
{payment.status !== "paid" && (
  <button
    onClick={() => handleMarkPaid(payment.id)}
    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100"
  >
    <CheckCircle className="w-3.5 h-3.5" /> Mark Paid
  </button>
)}
```

### Step 2 — Implement the handler

```tsx
const handleMarkPaid = async (paymentId: string) => {
  const confirmed = window.confirm("Mark this payment as paid?");
  if (!confirmed) return;

  const today = new Date().toISOString().split("T")[0];
  await updatePaymentStatus(paymentId, "paid", today);
  await loadData();
};
```

### Step 3 — Verify `updatePaymentStatus` in `src/lib/db/payments.ts`

The function should update `status` and `paid_date`:

```typescript
export async function updatePaymentStatus(
  id: string,
  status: "paid" | "pending" | "overdue",
  paidDate?: string
): Promise<Payment> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("payments")
    .update({ status, paid_date: paidDate ?? null })
    .eq("id", id)
    .select().single();
  if (error) throw error;
  return mapPayment(data);
}
```

### Step 4 — Reflect payment date in the row

After marking paid, the row should show the `paid_date` in the "Paid Date" column. This happens automatically after `loadData()` refreshes the payments list.

---

## Acceptance Criteria

- [ ] "Mark Paid" button appears on all `pending` and `overdue` payment rows.
- [ ] Clicking prompts for confirmation before marking.
- [ ] Confirming updates the payment to `status: "paid"` and sets `paid_date` to today's date.
- [ ] The row updates to show a green "Paid" badge and the payment date.
- [ ] No TypeScript errors.
