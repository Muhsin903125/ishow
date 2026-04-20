# T12 — Trainer: Create Payment Invoice for a Client

**Category:** P1 — Critical  
**Area:** Trainer · Payment Management  
**File:** `src/app/trainer/payments/page.tsx`  
**Depends on:** T11 (payments page)

---

## Why

Trainers need to generate monthly payment records for their clients. Without this, billing is invisible — neither the trainer nor the client can track outstanding invoices unless an admin creates them manually.

---

## Implementation Steps

### Step 1 — Add "Create Invoice" button

In the payments page header:

```tsx
<button
  onClick={() => { setInvoiceForm(emptyInvoice()); setShowInvoiceModal(true); }}
  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold"
>
  <Plus className="w-4 h-4" /> Create Invoice
</button>
```

### Step 2 — Define invoice form state

```tsx
const [invoiceForm, setInvoiceForm] = useState({
  userId: "",
  amount: "",
  description: "",
  dueDate: "",
  planId: "",
});

const emptyInvoice = () => ({
  userId: "", amount: "", description: "Monthly Training Fee", dueDate: "", planId: "",
});
```

### Step 3 — Build the invoice modal

Fields:

| Field | Type | Notes |
|---|---|---|
| Client | `<select>` | Populated from trainer's clients list |
| Amount (AED) | `<input type="number">` | Pre-fill from active plan's monthly rate if available |
| Description | `<input type="text">` | Defaults to "Monthly Training Fee" |
| Due Date | `<input type="date">` | Required |

When a client is selected, auto-look up their active plan and pre-fill the amount:

```tsx
const handleClientChange = (clientId: string) => {
  setInvoiceForm(f => ({ ...f, userId: clientId }));
  // find active plan for this client (from plans state, or fetch)
  const plan = activePlans.find(p => p.userId === clientId);
  if (plan?.monthlyRate) {
    setInvoiceForm(f => ({ ...f, amount: String(plan.monthlyRate), planId: plan.id }));
  }
};
```

### Step 4 — Implement the save handler

```tsx
const handleCreateInvoice = async () => {
  if (!invoiceForm.userId || !invoiceForm.amount || !invoiceForm.dueDate) {
    setFormError("Client, amount, and due date are required.");
    return;
  }
  setSaving(true);
  try {
    await createPayment({
      userId: invoiceForm.userId,
      planId: invoiceForm.planId || undefined,
      amount: parseFloat(invoiceForm.amount),
      description: invoiceForm.description,
      dueDate: invoiceForm.dueDate,
      status: "pending",
    });
    setShowInvoiceModal(false);
    await loadData();
  } finally {
    setSaving(false);
  }
};
```

Import `createPayment` from `src/lib/db/payments.ts`.

### Step 5 — Verify `createPayment` exists in `src/lib/db/payments.ts`

The function should insert into the `payments` table:

```typescript
export async function createPayment(input: {
  userId: string;
  planId?: string;
  amount: number;
  description?: string;
  dueDate: string;
  status: "pending";
}): Promise<Payment> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("payments")
    .insert({
      user_id: input.userId,
      plan_id: input.planId ?? null,
      amount: input.amount,
      description: input.description ?? null,
      due_date: input.dueDate,
      status: input.status,
    })
    .select().single();
  if (error) throw error;
  return mapPayment(data);
}
```

---

## Acceptance Criteria

- [ ] "Create Invoice" button opens a modal with client, amount, description, and due date fields.
- [ ] Selecting a client pre-fills the amount from their active plan's monthly rate.
- [ ] Submitting creates a `pending` payment record in Supabase.
- [ ] The payments list refreshes after creation.
- [ ] Validation blocks submission if client, amount, or due date is missing.
- [ ] No TypeScript errors.
