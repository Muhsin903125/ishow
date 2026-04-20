# RP1 — Admin: Reports & Analytics Page

**Category:** P3 — Enhancement  
**Area:** Admin · Reporting  
**File:** Create `src/app/(admin)/admin/reports/page.tsx`

---

## Why

The admin has no analytics view. Business decisions (trainer performance, client growth, revenue trends) require data. A reports page aggregates platform-wide metrics in one place.

---

## Implementation Steps

### Step 1 — Create the page file

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { listPayments } from "@/lib/db/payments";
import { listCustomers, listTrainers } from "@/lib/db/profiles";
import { listSessions } from "@/lib/db/sessions";

export default function AdminReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user && user.role !== "admin") { router.push("/trainer/dashboard"); return; }
    if (!loading && user) { loadReportData(); }
  }, [loading, user]); // eslint-disable-line

  // ... load and aggregate
}
```

### Step 2 — Define report data aggregations

```typescript
interface ReportData {
  // Revenue
  totalRevenue: number;
  revenueByMonth: { month: string; amount: number }[];
  revenueByTrainer: { trainerName: string; amount: number }[];

  // Sessions
  totalSessions: number;
  completedSessions: number;
  completionRate: number;           // completedSessions / totalSessions * 100
  sessionsByMonth: { month: string; count: number }[];

  // Clients
  totalClients: number;
  activeClients: number;            // customers with active plan
  newClientsThisMonth: number;
  clientsByTrainer: { trainerName: string; count: number }[];
}
```

Compute these client-side from the raw data fetched by `listPayments`, `listSessions`, `listCustomers`.

### Step 3 — Build the page layout

**Section 1 — KPI Cards (top row)**
- Total Revenue (all-time)
- This Month's Revenue
- Session Completion Rate
- Total Active Clients

**Section 2 — Revenue Chart (RP2)**
- Monthly revenue bar chart using recharts

**Section 3 — Session Completion (RP3)**
- Pie chart: Completed vs Cancelled vs Upcoming

**Section 4 — Clients by Trainer (RP4)**
- Horizontal bar chart: each trainer with their client count

**Section 5 — Table: Revenue by Trainer**
- Trainer name, client count, total billed, total paid, pending

### Step 4 — Add to AdminSidebar

In `src/components/AdminSidebar.tsx`, add after Payments:

```tsx
{ href: "/admin/reports", icon: BarChart2, label: "Reports" }
```

Import `BarChart2` from `lucide-react`.

---

## Acceptance Criteria

- [ ] Page exists at `/admin/reports` and is admin-only.
- [ ] KPI cards show correct aggregated values.
- [ ] Revenue, session, and client charts render without errors.
- [ ] Reports link appears in AdminSidebar.
- [ ] No TypeScript errors.
