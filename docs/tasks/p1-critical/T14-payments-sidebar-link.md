# T14 — Add Payments Link to TrainerSidebar

**Category:** P1 — Critical  
**Area:** Trainer · Navigation  
**File:** `src/components/TrainerSidebar.tsx`  
**Depends on:** T11 (payments page must exist first)

---

## Why

The trainer payments page (T11) exists but is unreachable from the sidebar. Without a nav link, trainers cannot discover or access it.

---

## Implementation Steps

### Step 1 — Read TrainerSidebar

Open `src/components/TrainerSidebar.tsx` and find the nav items array. It will look like:

```tsx
const navItems = [
  { href: "/trainer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/trainer/clients", icon: Users, label: "Clients" },
  { href: "/trainer/sessions", icon: Calendar, label: "Sessions" },
  { href: "/trainer/programs", icon: Dumbbell, label: "Programs" },
  { href: "/trainer/team", icon: UserPlus, label: "Team" },
];
```

### Step 2 — Add the Payments item

Add after Sessions (logical billing position):

```tsx
{ href: "/trainer/payments", icon: CreditCard, label: "Payments" },
```

Import `CreditCard` from `lucide-react` if not already imported.

### Step 3 — Verify active state highlighting

The sidebar uses `usePathname()` to highlight the active route. Confirm the pattern used:

```tsx
const pathname = usePathname();
// ...
className={pathname === item.href ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"}
```

No changes needed if this pattern already works for other items.

---

## Acceptance Criteria

- [ ] "Payments" nav item appears in the TrainerSidebar between Sessions and Programs (or in a logical position).
- [ ] Clicking navigates to `/trainer/payments`.
- [ ] The Payments item highlights when the current route is `/trainer/payments`.
- [ ] CreditCard icon is displayed.
- [ ] No TypeScript errors.
