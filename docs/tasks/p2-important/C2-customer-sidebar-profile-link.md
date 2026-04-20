# C2 — Add Profile Link to CustomerSidebar

**Category:** P2 — Important  
**Area:** Customer · Navigation  
**File:** `src/components/CustomerSidebar.tsx`  
**Depends on:** C1 (profile page must exist)

---

## Why

The customer profile page (C1) is unreachable unless the URL is typed manually. A sidebar link makes it discoverable.

---

## Implementation Steps

### Step 1 — Open `src/components/CustomerSidebar.tsx`

Find the nav items array. It currently contains:
- Dashboard → `/dashboard`
- Assessment → `/assessment`
- My Plan → `/my-plan`
- Sessions → `/sessions`
- Programs → `/programs`
- Payments → `/payments`

### Step 2 — Add the Profile item

Add at the bottom of the nav items list (before the sign-out section):

```tsx
{ href: "/profile", icon: User, label: "Profile" }
```

Ensure `User` is imported from `lucide-react`.

### Step 3 — Verify active state works

The sidebar should highlight the profile link when `pathname === "/profile"`. This works automatically if the sidebar uses `usePathname()` for active detection — confirm this pattern is already in place.

---

## Acceptance Criteria

- [ ] "Profile" link appears in CustomerSidebar.
- [ ] Clicking navigates to `/profile`.
- [ ] The link is highlighted when the current route is `/profile`.
- [ ] User icon is displayed.
- [ ] No TypeScript errors.
