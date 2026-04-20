# TD2 — Delete Legacy `src/lib/storage.ts`

**Category:** P3 — Tech Debt  
**Area:** Codebase Cleanup  
**File:** `src/lib/storage.ts`

---

## Why

`src/lib/storage.ts` is a localStorage CRUD utility (getItems, addItem, updateItem, deleteItem) that was the original data layer before Supabase was integrated. All data is now stored in Supabase via the `src/lib/db/` modules. The storage module is dead code.

---

## Implementation Steps

### Step 1 — Verify no active imports

Search for all imports:

```
from "@/lib/storage"
from "../lib/storage"
```

Use Grep tool: pattern `from ["']@/lib/storage["']`.

Check especially:
- All `src/app/(customer)/` pages — they may still import `getItems`, `addItem`
- Any server-side code

### Step 2 — If imports exist — migrate them

If any page still uses `storage.ts` functions, the page needs to be migrated to use the corresponding `src/lib/db/` Supabase function instead:

| Storage function | Replacement |
|---|---|
| `getItems<Assessment>("ishow_assessments")` | `listAssessments({ userId })` from `src/lib/db/assessments.ts` |
| `addItem<Assessment>(...)` | `submitAssessment(...)` from `src/lib/db/assessments.ts` |
| `getItems<Plan>("ishow_plans")` | `getActivePlan(userId)` from `src/lib/db/plans.ts` |
| `getItems<Session>("ishow_sessions")` | `listSessions({ userId })` from `src/lib/db/sessions.ts` |
| `getItems<Payment>("ishow_payments")` | `listPayments({ userId })` from `src/lib/db/payments.ts` |

### Step 3 — Delete `src/lib/storage.ts`

After confirming zero imports:

```bash
rm src/lib/storage.ts
```

### Step 4 — Verify build

```bash
npm run build
```

---

## Acceptance Criteria

- [ ] Zero active imports of `src/lib/storage.ts` confirmed before deletion.
- [ ] If imports existed, those pages are migrated to use Supabase `src/lib/db/` functions.
- [ ] File is deleted.
- [ ] Build succeeds with no errors.
- [ ] Customer dashboard, sessions, programs, and payments pages load correctly from Supabase.
