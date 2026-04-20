# TD1 — Delete Legacy `src/lib/auth.ts`

**Category:** P3 — Tech Debt  
**Area:** Codebase Cleanup  
**File:** `src/lib/auth.ts`

---

## Why

`src/lib/auth.ts` is a legacy authentication module using localStorage that was the original auth system before Supabase was integrated. All authentication is now handled by `src/contexts/AuthContext.tsx` via Supabase. The legacy file creates confusion about which auth system is authoritative, and its functions (localStorage-based `login`, `logout`, `getCurrentUser`) are no longer called by any active page.

---

## Implementation Steps

### Step 1 — Verify no active imports

Search the codebase for imports of `src/lib/auth.ts`:

```bash
grep -r "from.*lib/auth" src/ --include="*.ts" --include="*.tsx"
grep -r "from.*lib/auth" src/ --include="*.ts" --include="*.tsx"
```

Or use the Grep tool: pattern `from ["']@/lib/auth["']`.

Confirm zero results from active pages (only the file itself, if it self-imports, and possibly `src/app/(auth)/` pages that used it historically).

### Step 2 — Check for alias imports

Also check for:
```
from "../lib/auth"
from "../../lib/auth"
require("@/lib/auth")
```

### Step 3 — Delete the file

If zero imports are found in active files:

```bash
rm src/lib/auth.ts
```

### Step 4 — Verify the app still builds

```bash
npm run build
```

Or run the dev server and navigate through login, register, and dashboard to confirm everything works.

---

## Acceptance Criteria

- [ ] Confirm zero active imports of `src/lib/auth.ts` before deleting.
- [ ] File is deleted.
- [ ] `npm run build` succeeds with no TypeScript errors referencing the deleted file.
- [ ] Login, logout, and auth flows work correctly after deletion.
