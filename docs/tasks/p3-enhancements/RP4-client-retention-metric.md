# RP4 — Admin Reports: Client Retention & Trainer Distribution

**Category:** P3 — Enhancement  
**Area:** Admin · Reporting  
**File:** `src/app/(admin)/admin/reports/page.tsx`  
**Depends on:** RP1

---

## Why

Knowing how clients are distributed across trainers helps the admin balance workloads. Tracking active vs. inactive clients shows retention.

---

## Implementation Steps

### Step 1 — Compute clients by trainer

```typescript
function groupClientsByTrainer(
  plans: Plan[],
  trainers: Profile[],
  customers: Profile[]
): { trainerName: string; clientCount: number; activePlanCount: number }[] {
  return trainers.map(trainer => {
    const trainerPlans = plans.filter(p => p.trainerId === trainer.id && p.status === "active");
    return {
      trainerName: trainer.name,
      clientCount: trainerPlans.length,
      activePlanCount: trainerPlans.length,
    };
  }).sort((a, b) => b.clientCount - a.clientCount);
}
```

### Step 2 — Build horizontal bar chart

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

function ClientsByTrainerChart({ data }: { data: { trainerName: string; clientCount: number }[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="font-bold text-gray-900 mb-4">Clients by Trainer</h3>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 48)}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
          <YAxis type="category" dataKey="trainerName" tick={{ fontSize: 11 }} width={100} />
          <Tooltip formatter={(v: number) => [v, "Clients"]} />
          <Bar dataKey="clientCount" fill="#7c3aed" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### Step 3 — Retention summary metric

```tsx
const activeClients = customers.filter(c => c.customerStatus === "client").length;
const requestClients = customers.filter(c => c.customerStatus === "request").length;
const retentionRate = customers.length > 0
  ? Math.round((activeClients / customers.length) * 100)
  : 0;
```

Display as a KPI card:
```tsx
<div className="bg-white rounded-2xl border border-gray-100 p-5">
  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Client Retention</p>
  <p className="text-3xl font-black text-gray-900">{retentionRate}%</p>
  <p className="text-sm text-gray-500 mt-1">
    {activeClients} active · {requestClients} pending conversion
  </p>
</div>
```

---

## Acceptance Criteria

- [ ] Horizontal bar chart shows client count per trainer, sorted descending.
- [ ] Client retention % is displayed as a KPI card.
- [ ] Active vs. pending client counts are shown.
- [ ] No TypeScript errors.
