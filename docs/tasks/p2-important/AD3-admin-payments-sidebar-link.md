# AD3 — Add Payments Link to AdminSidebar

**Category:** P2 — Important  
**Area:** Admin · Navigation  
**File:** `src/components/AdminSidebar.tsx`  
**Depends on:** AD2 (payments page must exist)

---

## Why

The admin payments page (AD2) needs a sidebar link to be discoverable.

---

## Implementation Steps

### Step 1 — Open `src/components/AdminSidebar.tsx`

Find the nav items array. Current items:
- Dashboard → `/admin/dashboard`
- Assessments → `/admin/assessments`
- Trainers → `/admin/trainers`
- Clients → `/admin/clients`
- Master Data → `/admin/master`

### Step 2 — Add Payments item

Add after Clients:

```tsx
{ href: "/admin/payments", icon: CreditCard, label: "Payments" }
```

Import `CreditCard` from `lucide-react`.

### Step 3 — Verify active state

Confirm the sidebar uses `usePathname()` to highlight the active route.

---

## Acceptance Criteria

- [ ] "Payments" link appears in AdminSidebar between Clients and Master Data.
- [ ] Clicking navigates to `/admin/payments`.
- [ ] Active state is highlighted correctly.
- [ ] No TypeScript errors.
