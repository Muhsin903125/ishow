# RP5 — Add Reports Link to AdminSidebar

**Category:** P3 — Enhancement  
**Area:** Admin · Navigation  
**File:** `src/components/AdminSidebar.tsx`  
**Depends on:** RP1

---

## Why

The reports page needs a sidebar link to be accessible.

---

## Implementation Steps

### Step 1 — Open `src/components/AdminSidebar.tsx`

Find the nav items array.

### Step 2 — Add Reports item

After Payments, add:

```tsx
{ href: "/admin/reports", icon: BarChart2, label: "Reports" }
```

Import `BarChart2` from `lucide-react`.

### Step 3 — Verify active state

Confirm `usePathname()` is used so `/admin/reports` gets highlighted.

---

## Acceptance Criteria

- [ ] "Reports" link appears in AdminSidebar.
- [ ] Clicking navigates to `/admin/reports`.
- [ ] Active state highlights when on the reports page.
- [ ] BarChart2 icon is displayed.
- [ ] No TypeScript errors.
