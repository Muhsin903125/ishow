# T11 — Trainer: Payments Page (View Client Payments)

**Category:** P1 — Critical  
**Area:** Trainer · Payment Management  
**File:** Create `src/app/trainer/payments/page.tsx`

---

## Why

Trainers have no visibility into payment status for their clients. They cannot see who has paid, who is overdue, or what invoices exist. This forces admin to handle all payment-related questions.

---

## Implementation Steps

### Step 1 — Create the page file

Create `src/app/trainer/payments/page.tsx` with:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { listPayments, type Payment } from "@/lib/db/payments";
import { listCustomers, type Profile } from "@/lib/db/profiles";
import { CreditCard, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function TrainerPaymentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending" | "overdue">("all");

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user && user.role === "customer") { router.push("/dashboard"); return; }
    if (!loading && user) { loadData(); }
  }, [loading, user]); // eslint-disable-line

  const loadData = async () => {
    const [p, c] = await Promise.all([listPayments(), listCustomers()]);
    setPayments(p);
    setClients(c);
  };

  if (loading || !user) return null;

  const filtered = filterStatus === "all" ? payments : payments.filter(p => p.status === filterStatus);

  const getClientName = (userId: string) =>
    clients.find(c => c.id === userId)?.name ?? "Unknown";

  return (
    <DashboardLayout role="trainer">
      {/* page content */}
    </DashboardLayout>
  );
}
```

### Step 2 — Build the page layout

**Header:** "Payments" heading + "Create Invoice" button (links to T12)

**Summary cards:**
- Total Paid this month
- Pending count
- Overdue count

**Filter tabs:** All | Paid | Pending | Overdue

**Payments table:**

| Client | Description | Amount | Due Date | Paid Date | Status | Actions |
|---|---|---|---|---|---|---|

For each row, display:
- Client name (looked up from `clients` by `payment.userId`)
- Description, amount (formatted as currency)
- Due date, paid date (if paid)
- Status badge (green/yellow/red)
- Mark Paid button (for pending/overdue rows)

### Step 3 — Currency formatting helper

```tsx
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(amount);
```

### Step 4 — Status badge component

```tsx
function PaymentBadge({ status }: { status: string }) {
  const map = {
    paid: { color: "green", icon: CheckCircle, label: "Paid" },
    pending: { color: "yellow", icon: Clock, label: "Pending" },
    overdue: { color: "red", icon: AlertCircle, label: "Overdue" },
  };
  const { color, icon: Icon, label } = map[status as keyof typeof map] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-${color}-50 text-${color}-700`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}
```

### Step 5 — Add to TrainerSidebar

In `src/components/TrainerSidebar.tsx`, add a Payments nav item:

```tsx
{ href: "/trainer/payments", icon: CreditCard, label: "Payments" }
```

---

## Acceptance Criteria

- [ ] Page exists at `/trainer/payments` and is protected (trainer/admin only).
- [ ] Loads all payments and displays them in a table with client names.
- [ ] Filter tabs work (All / Paid / Pending / Overdue).
- [ ] Summary cards show correct counts/totals.
- [ ] Payments link appears in TrainerSidebar.
- [ ] No TypeScript errors.
