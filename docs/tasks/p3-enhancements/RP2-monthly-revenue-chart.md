# RP2 — Admin Reports: Monthly Revenue Chart

**Category:** P3 — Enhancement  
**Area:** Admin · Reporting  
**File:** `src/app/(admin)/admin/reports/page.tsx`  
**Depends on:** RP1, recharts installed (see PR2)

---

## Why

Revenue trend over time is the most important business metric. A monthly bar chart makes it immediately visible whether the business is growing.

---

## Implementation Steps

### Step 1 — Aggregate revenue by month from payments data

```typescript
function groupRevenueByMonth(payments: Payment[]): { month: string; amount: number }[] {
  const map: Record<string, number> = {};

  for (const p of payments) {
    if (p.status !== "paid" || !p.paidDate) continue;
    const key = p.paidDate.slice(0, 7); // "YYYY-MM"
    map[key] = (map[key] ?? 0) + p.amount;
  }

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12) // last 12 months
    .map(([key, amount]) => ({
      month: new Date(key + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      amount,
    }));
}
```

### Step 2 — Build the chart component

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function MonthlyRevenueChart({ data }: { data: { month: string; amount: number }[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="font-bold text-gray-900 mb-4">Monthly Revenue (AED)</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={v => `${v}`} />
          <Tooltip
            formatter={(v: number) => [`AED ${v.toLocaleString()}`, "Revenue"]}
            contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
          />
          <Bar dataKey="amount" fill="#7c3aed" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### Step 3 — Render in the reports page

```tsx
<MonthlyRevenueChart data={reportData.revenueByMonth} />
```

---

## Acceptance Criteria

- [ ] Monthly revenue bar chart renders correctly on the reports page.
- [ ] Shows last 12 months of paid payments.
- [ ] Tooltip shows AED amount on hover.
- [ ] Empty months show as 0 bars.
- [ ] No TypeScript errors.
