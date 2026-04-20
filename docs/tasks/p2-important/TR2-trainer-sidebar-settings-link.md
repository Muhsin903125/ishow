# TR2 — Add Settings Link to TrainerSidebar

**Category:** P2 — Important  
**Area:** Trainer · Navigation  
**File:** `src/components/TrainerSidebar.tsx`  
**Depends on:** TR1 (settings page must exist)

---

## Why

Without a sidebar link, the trainer settings page is undiscoverable.

---

## Implementation Steps

### Step 1 — Open `src/components/TrainerSidebar.tsx`

Find the nav items array.

### Step 2 — Add the Settings item

```tsx
{ href: "/trainer/settings", icon: Settings, label: "Settings" }
```

Place it at the bottom of the main nav items, just above the sign-out button.

Import `Settings` from `lucide-react`.

### Step 3 — Verify active state

Confirm `usePathname()` is used for active state detection, so `/trainer/settings` gets highlighted correctly.

---

## Acceptance Criteria

- [ ] "Settings" link appears at the bottom of TrainerSidebar nav items.
- [ ] Clicking navigates to `/trainer/settings`.
- [ ] Active state is highlighted when on the settings page.
- [ ] Settings icon (gear) is displayed.
- [ ] No TypeScript errors.
