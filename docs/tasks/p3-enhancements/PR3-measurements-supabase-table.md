# PR3 — Create Measurements Supabase Table

**Category:** P3 — Enhancement  
**Area:** Database Schema  
**File:** Supabase SQL Editor  
**Depends on:** None (prerequisite for PR1 and PR2)

---

## Why

The progress tracking features (PR1, PR2) require a `measurements` table in Supabase. This task covers creating the table, enabling RLS, and documenting the schema.

---

## Implementation Steps

### Step 1 — Create the table

Run in Supabase SQL Editor → New query:

```sql
CREATE TABLE IF NOT EXISTS measurements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recorded_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg     NUMERIC(5, 2),
  body_fat_pct  NUMERIC(4, 1),
  chest_cm      NUMERIC(5, 1),
  waist_cm      NUMERIC(5, 1),
  hips_cm       NUMERIC(5, 1),
  arms_cm       NUMERIC(5, 1),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Step 2 — Enable Row-Level Security

```sql
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
```

### Step 3 — Create RLS policies

**Customers see and insert only their own measurements:**
```sql
CREATE POLICY "customers_own_measurements_select"
  ON measurements FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "customers_own_measurements_insert"
  ON measurements FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "customers_own_measurements_update"
  ON measurements FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "customers_own_measurements_delete"
  ON measurements FOR DELETE
  USING (user_id = auth.uid());
```

**Trainers and admins can read all measurements:**
```sql
CREATE POLICY "trainers_read_all_measurements"
  ON measurements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('trainer', 'admin')
    )
  );
```

### Step 4 — Create an index for performance

```sql
CREATE INDEX idx_measurements_user_date
  ON measurements (user_id, recorded_at DESC);
```

### Step 5 — Verify in Supabase Table Editor

Open Supabase Dashboard → Table Editor → measurements. Confirm:
- All columns exist with correct types
- RLS is enabled (lock icon shows)
- Policies are listed

---

## Acceptance Criteria

- [ ] `measurements` table exists in Supabase with the schema above.
- [ ] RLS is enabled.
- [ ] Customers can only see/modify their own rows.
- [ ] Trainers and admins can read all measurements.
- [ ] Performance index exists on `(user_id, recorded_at DESC)`.
- [ ] No SQL errors during creation.
