# AD2 — Admin: Payment Management Page

**Category:** P2 — Important  
**Area:** Admin · Financial Management  
**File:** Create `src/app/(admin)/admin/payments/page.tsx`

---

## Why

There is no admin page for managing payments. The admin cannot view overdue payments across all clients, create invoices, or update payment statuses. This is a core operational need for the business.

---

## Implementation Steps

### Step 1 — Create the page

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { listPayments, createPayment, updatePaymentStatus, deletePayment, type Payment } from "@/lib/db/payments";
import { listCustomers, type Profile } from "@/lib/db/profiles";
import { listAllPlans, type Plan } from "@/lib/db/plans";

export default function AdminPaymentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user && user.role !== "admin") { router.push("/trainer/dashboard"); return; }
    if (!loading && user) { loadData(); }
  }, [loading, user]); // eslint-disable-line

  const loadData = async () => {
    const [p, c, pl] = await Promise.all([listPayments(), listCustomers(), listAllPlans()]);
    setPayments(p);
    setCustomers(c);
    setPlans(pl);
  };
  // ...
}
```

### Step 2 — Build the page layout

**Page header:** "Payments" heading + "Create Invoice" button

**Summary row — 4 metric cards:**
- Total Revenue (sum of paid amounts)
- Pending count + total amount
- Overdue count + total amount  
- This month's revenue

**Filter tabs:** All | Paid | Pending | Overdue

**Payments table columns:**

| Client | Plan | Amount | Description | Due Date | Paid Date | Status | Actions |
|---|---|---|---|---|---|---|---|

**Actions per row:**
- Mark Paid (for pending/overdue)
- Edit (amount, description, due date)
- Delete (with confirmation)

### Step 3 — Implement Create Invoice modal

Same design as T12 (trainer create invoice). Fields: client selector, amount (auto-filled from plan), description, due date.

```tsx
const handleCreateInvoice = async () => {
  await createPayment({
    userId: form.userId,
    planId: form.planId,
    amount: parseFloat(form.amount),
    description: form.description,
    dueDate: form.dueDate,
    status: "pending",
  });
  setShowCreateModal(false);
  await loadData();
};
```

### Step 4 — Implement Mark Paid

```tsx
const handleMarkPaid = async (id: string) => {
  const today = new Date().toISOString().split("T")[0];
  await updatePaymentStatus(id, "paid", today);
  await loadData();
};
```

### Step 5 — Implement Delete

```tsx
const handleDelete = async (id: string) => {
  if (!window.confirm("Delete this payment record?")) return;
  await deletePayment(id);
  await loadData();
};
```

Import `deletePayment` from `src/lib/db/payments.ts`. Verify the function exists.

### Step 6 — Add to AdminSidebar

In `src/components/AdminSidebar.tsx`, add after Clients:

```tsx
{ href: "/admin/payments", icon: CreditCard, label: "Payments" }
```

---

## Acceptance Criteria

- [ ] Page exists at `/admin/payments` and is admin-only.
- [ ] Shows all payments across all clients with client names resolved.
- [ ] Filter tabs work.
- [ ] Create Invoice modal creates payment records.
- [ ] Mark Paid sets status and paid_date.
- [ ] Delete removes the record with confirmation.
- [ ] Summary metrics are accurate.
- [ ] Link in AdminSidebar works.
- [ ] No TypeScript errors.
