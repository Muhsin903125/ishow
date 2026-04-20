# TD3 — Delete Legacy `src/lib/mockData.ts`

**Category:** P3 — Tech Debt  
**Area:** Codebase Cleanup  
**File:** `src/lib/mockData.ts`

---

## Why

`src/lib/mockData.ts` seeds localStorage with fake assessment, session, plan, and payment data. This was needed to demo the app before Supabase was connected. With Supabase as the data layer, this seed file is dead code and creates confusion about where data comes from.

---

## Implementation Steps

### Step 1 — Verify no active imports

Grep for: `from ["']@/lib/mockData["']` or `from ["']../lib/mockData["']`

Also check for calls to the seed function (e.g., `seedMockData()`, `initMockData()`).

### Step 2 — Check if seeding is called anywhere in app initialization

Look in:
- `src/app/layout.tsx` (root layout)
- `src/contexts/AuthContext.tsx`
- Any `useEffect` in layout or provider components

If a seed call exists, remove it entirely.

### Step 3 — Delete `src/lib/mockData.ts`

```bash
rm src/lib/mockData.ts
```

### Step 4 — Verify build

```bash
npm run build
```

---

## Acceptance Criteria

- [ ] Zero active imports of `src/lib/mockData.ts` confirmed.
- [ ] No seeding calls remain in layout, auth context, or any provider.
- [ ] File is deleted.
- [ ] Build succeeds.
- [ ] App loads real data from Supabase (not fake seeded data).
