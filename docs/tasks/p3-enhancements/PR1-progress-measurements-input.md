# PR1 — Customer: Body Measurements Input Form

**Category:** P3 — Enhancement  
**Area:** Customer · Progress Tracking  
**Files:** Create `src/app/(customer)/progress/page.tsx`, `src/lib/db/measurements.ts`

---

## Why

Customers have no way to log their body metrics over time. Without this data, progress tracking (PR2) is impossible, and neither the customer nor the trainer has evidence of transformation.

---

## Implementation Steps

### Step 1 — Create the Supabase table

In Supabase SQL Editor:

```sql
CREATE TABLE measurements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg   NUMERIC(5,2),
  body_fat_pct NUMERIC(4,1),
  chest_cm    NUMERIC(5,1),
  waist_cm    NUMERIC(5,1),
  hips_cm     NUMERIC(5,1),
  arms_cm     NUMERIC(5,1),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- RLS: customers can only see/insert their own measurements
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_measurements" ON measurements
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### Step 2 — Create `src/lib/db/measurements.ts`

```typescript
import { createClient } from "@/lib/supabase/client";

export interface Measurement {
  id: string;
  userId: string;
  recordedAt: string;
  weightKg?: number;
  bodyFatPct?: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  armsCm?: number;
  notes?: string;
  createdAt: string;
}

export async function listMeasurements(userId: string): Promise<Measurement[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("measurements")
    .select("*")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapMeasurement);
}

export async function addMeasurement(
  userId: string,
  input: Omit<Measurement, "id" | "userId" | "createdAt">
): Promise<Measurement> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("measurements")
    .insert({ user_id: userId, recorded_at: input.recordedAt, weight_kg: input.weightKg, ... })
    .select().single();
  if (error) throw error;
  return mapMeasurement(data);
}

function mapMeasurement(row: Record<string, unknown>): Measurement { ... }
```

### Step 3 — Create the progress page

Create `src/app/(customer)/progress/page.tsx`:

- **Header:** "My Progress" heading + "Log Measurement" button
- **History table:** date, weight, body fat %, waist, notes — most recent first
- **Log Measurement modal:** date (defaults to today), weight (kg), body fat %, chest, waist, hips, arms, notes

### Step 4 — Add Progress link to CustomerSidebar

In `src/components/CustomerSidebar.tsx`:

```tsx
{ href: "/progress", icon: TrendingUp, label: "Progress" }
```

---

## Acceptance Criteria

- [ ] `measurements` table exists in Supabase with correct schema and RLS policies.
- [ ] `src/lib/db/measurements.ts` exports `listMeasurements` and `addMeasurement`.
- [ ] Progress page exists at `/progress` (customer-protected).
- [ ] Log Measurement modal saves a new record to Supabase.
- [ ] Measurement history table shows all records sorted most-recent-first.
- [ ] Progress link appears in CustomerSidebar.
- [ ] No TypeScript errors.
