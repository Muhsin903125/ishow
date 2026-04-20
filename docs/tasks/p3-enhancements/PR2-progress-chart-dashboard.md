# PR2 — Customer: Progress Chart on Dashboard

**Category:** P3 — Enhancement  
**Area:** Customer · Progress Tracking  
**Files:** `src/app/(customer)/dashboard/page.tsx`, `src/app/(customer)/progress/page.tsx`  
**Depends on:** PR1 (measurements table and db functions)

---

## Why

A weight/measurement chart on the customer dashboard gives immediate visual evidence of progress — the most motivating thing a fitness platform can show a customer.

---

## Implementation Steps

### Step 1 — Install a charting library

```bash
npm install recharts
```

Recharts is React-native and works with Next.js App Router when used in a `"use client"` component.

### Step 2 — Create a ProgressChart component

Create `src/components/ProgressChart.tsx`:

```tsx
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Measurement } from "@/lib/db/measurements";

interface ProgressChartProps {
  measurements: Measurement[];
  metric: "weightKg" | "waistCm" | "bodyFatPct";
  label: string;
  unit: string;
  color?: string;
}

export function ProgressChart({ measurements, metric, label, unit, color = "#f97316" }: ProgressChartProps) {
  const data = measurements.map(m => ({
    date: new Date(m.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: m[metric],
  })).filter(d => d.value != null);

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        Log at least 2 measurements to see your progress chart.
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} />
          <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} unit={unit} width={36} />
          <Tooltip formatter={(v) => [`${v} ${unit}`, label]} />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### Step 3 — Add chart to the customer dashboard

In `src/app/(customer)/dashboard/page.tsx`, load measurements alongside other data:

```tsx
import { listMeasurements } from "@/lib/db/measurements";

const measurements = await listMeasurements(user.id);
```

Render the chart card below the quick-links grid:

```tsx
{measurements.length > 0 && (
  <div className="bg-white rounded-2xl border border-gray-100 p-5">
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-bold text-gray-900 text-sm">Progress</h2>
      <Link href="/progress" className="text-xs text-orange-500 font-semibold">View All →</Link>
    </div>
    <ProgressChart
      measurements={measurements}
      metric="weightKg"
      label="Weight"
      unit="kg"
    />
  </div>
)}
```

### Step 4 — Add chart to the Progress page (PR1)

In the progress page, show tabs for different metrics:

```tsx
const METRICS = [
  { key: "weightKg", label: "Weight", unit: "kg" },
  { key: "waistCm", label: "Waist", unit: "cm" },
  { key: "bodyFatPct", label: "Body Fat", unit: "%" },
] as const;
```

Allow the customer to switch between charts using a tab bar.

---

## Acceptance Criteria

- [ ] `recharts` is installed and works without server-side import errors.
- [ ] `ProgressChart` component renders a line chart with correct axis labels and tooltip.
- [ ] Customer dashboard shows the progress chart section if at least 2 measurements exist.
- [ ] If fewer than 2 measurements exist, a "Log more measurements to see chart" placeholder is shown.
- [ ] The progress page shows metric tabs (Weight, Waist, Body Fat) switching the chart.
- [ ] No TypeScript errors.
