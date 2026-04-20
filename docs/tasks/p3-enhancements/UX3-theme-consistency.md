# UX3 — Unify Theme Across Roles (Admin Dark vs Trainer/Customer Light)

**Category:** P3 — Enhancement  
**Area:** UX / Design System  
**Files:** `src/components/DashboardLayout.tsx`, global CSS, all sidebar components

---

## Why

Admin uses a dark theme (zinc-950 background, violet accents). Trainer and customer use a light theme (white/gray, orange accents). This inconsistency creates a disjointed product feel and increases maintenance cost when styling shared components.

---

## Decision Point

Before implementing, choose one of three approaches:

**Option A — Unify to light theme (recommended for MVP)**  
Convert admin to light theme with violet/purple accent color to distinguish it from trainer/customer (which use orange). Pros: simpler maintenance. Cons: admin loses the "power user" dark feel.

**Option B — Unify to dark theme**  
Convert trainer and customer to dark. Pros: modern. Cons: major visual overhaul.

**Option C — Add theme toggle (user preference)**  
Let each user choose light or dark. Pros: flexible. Cons: significant complexity. Not recommended for MVP.

**Recommendation: Option A** — light theme for all, violet accents for admin, orange for trainer/customer.

---

## Implementation Steps (Option A)

### Step 1 — Define accent color tokens by role

In `tailwind.config.ts` (or CSS variables), define:

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      "brand-customer": "#f97316",  // orange-500
      "brand-trainer":  "#f97316",  // orange-500 (same)
      "brand-admin":    "#7c3aed",  // violet-600
    }
  }
}
```

Or use CSS variables in `src/app/globals.css`:

```css
:root {
  --brand-accent: #f97316; /* default: orange */
}

[data-role="admin"] {
  --brand-accent: #7c3aed; /* violet for admin */
}
```

### Step 2 — Update `DashboardLayout.tsx` to pass role as a data attribute

```tsx
<div data-role={role} className="min-h-screen bg-gray-50">
```

### Step 3 — Update AdminSidebar to use light theme with violet accents

Change AdminSidebar from:
```tsx
className="bg-zinc-950 text-white"  // dark
```
to:
```tsx
className="bg-white border-r border-gray-100"  // light
```

Update active state from violet-on-dark to violet-on-light:
```tsx
// Active item:
className="bg-violet-50 text-violet-700"
// Inactive:
className="text-gray-600 hover:bg-gray-50"
```

### Step 4 — Update admin page backgrounds

Change admin page backgrounds from `bg-zinc-900`/`bg-zinc-950` to `bg-gray-50`/`bg-white`.

Change admin card backgrounds from `bg-zinc-800` to `bg-white border border-gray-100`.

### Step 5 — Update admin accent buttons

Change admin buttons from violet to a violet that works on light backgrounds:
```tsx
// Admin primary button:
className="bg-violet-600 text-white hover:bg-violet-700"

// Customer/Trainer primary button:
className="bg-orange-500 text-white hover:bg-orange-400"
```

---

## Acceptance Criteria

- [ ] Admin pages use a light background (white/gray-50) with violet accents.
- [ ] Trainer and customer pages continue to use white/gray-50 with orange accents.
- [ ] All three sidebars (Admin, Trainer, Customer) share the same base layout structure.
- [ ] No white text on white background contrast issues.
- [ ] No hardcoded `zinc-950` or `zinc-900` background colors in admin pages.
- [ ] No TypeScript errors.
