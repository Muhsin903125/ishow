# RP3 — Admin Reports: Session Completion Rate

**Category:** P3 — Enhancement  
**Area:** Admin · Reporting  
**File:** `src/app/(admin)/admin/reports/page.tsx`  
**Depends on:** RP1, recharts

---

## Why

Session completion rate tells the admin whether trainers are following through on scheduled sessions and whether clients are showing up. Low completion rates indicate operational problems.

---

## Implementation Steps

### Step 1 — Compute session stats

```typescript
function computeSessionStats(sessions: TrainingSession[]) {
  const total = sessions.length;
  const completed = sessions.filter(s => s.status === "completed").length;
  const cancelled = sessions.filter(s => s.status === "cancelled").length;
  const scheduled = sessions.filter(s => s.status === "scheduled").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, cancelled, scheduled, completionRate };
}
```

### Step 2 — Build a pie chart

```tsx
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = {
  completed: "#22c55e",
  cancelled: "#ef4444",
  scheduled: "#3b82f6",
};

function SessionStatusChart({ stats }: { stats: ReturnType<typeof computeSessionStats> }) {
  const data = [
    { name: "Completed", value: stats.completed },
    { name: "Cancelled", value: stats.cancelled },
    { name: "Upcoming", value: stats.scheduled },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="font-bold text-gray-900 mb-1">Session Status</h3>
      <p className="text-3xl font-black text-gray-900 mb-4">
        {stats.completionRate}%
        <span className="text-sm font-normal text-gray-500 ml-2">completion rate</span>
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] ?? "#e5e7eb"} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## Acceptance Criteria

- [ ] Session completion rate percentage is displayed prominently.
- [ ] Pie chart shows breakdown of Completed / Cancelled / Upcoming sessions.
- [ ] Chart only renders segments with value > 0.
- [ ] No TypeScript errors.
