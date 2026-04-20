# TD4 — Remove Demo Login Shortcut Buttons from Login Page

**Category:** P3 — Tech Debt  
**Area:** Security / Production Readiness  
**File:** `src/app/(auth)/login/page.tsx`

---

## Why

The login page has hardcoded "Demo" shortcut buttons that auto-fill `trainer@ishow.com / trainer123` and `john@example.com / demo123`. These are appropriate for development and demos but should be removed before the platform goes live, as they expose credentials in the UI source code.

---

## When to Do This

Do this **only when going to production**. Keep the demo buttons active during development and beta testing. Flag this task with a `// TODO: remove before production` comment in the code now, and complete it at launch time.

---

## Implementation Steps

### Step 1 — Add a TODO comment now

In `src/app/(auth)/login/page.tsx`, find the demo button section and add:

```tsx
{/* TODO: Remove demo buttons before production launch (TD4) */}
{process.env.NODE_ENV !== "production" && (
  <div className="...demo buttons...">
    {/* existing demo button JSX */}
  </div>
)}
```

Wrapping with `process.env.NODE_ENV !== "production"` means the buttons only show in development. This is a safe intermediate step.

### Step 2 — At launch: remove the entire demo section

When going live:
1. Delete the demo buttons JSX block entirely.
2. Remove any demo-related state (`demoEmail`, `demoPassword`, etc.).
3. Remove demo-related handlers (`handleDemoLogin`, etc.).

### Step 3 — Verify demo accounts are disabled in Supabase

In Supabase Dashboard → Authentication → Users:
- Find `trainer@ishow.com` — either delete it or reset its password to something non-public.
- Find `john@example.com` — same.

---

## Acceptance Criteria

**Intermediate (now):**
- [ ] Demo buttons are wrapped with `process.env.NODE_ENV !== "production"` guard.
- [ ] Demo buttons do not appear in production builds.

**At launch:**
- [ ] Demo button JSX is completely removed from `login/page.tsx`.
- [ ] Demo Supabase accounts have been disabled or their passwords changed.
- [ ] Login page shows only the standard form (and Google OAuth button from A1).
