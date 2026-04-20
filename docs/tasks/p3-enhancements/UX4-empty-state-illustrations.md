# UX4 — Improve Empty State Illustrations

**Category:** P3 — Enhancement  
**Area:** UX / Visual Polish  
**Files:** All list pages with empty states

---

## Why

Empty states currently show a plain icon and a text message. Adding a simple illustration or a well-designed empty state card with a clear action makes the UI feel more polished and guides users to the next step.

---

## Implementation Steps

### Step 1 — Create a reusable EmptyState component

Create `src/components/ui/EmptyState.tsx`:

```tsx
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-orange-400" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-5">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-400 transition-colors"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-400 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
```

### Step 2 — Replace inline empty states across all list pages

| Page | Current Empty State | Replace With |
|---|---|---|
| `(customer)/sessions` | Text + icon | `<EmptyState icon={Calendar} title="No Sessions Yet" description="Your trainer will schedule your first session after reviewing your assessment." />` |
| `(customer)/programs` | Text + icon | `<EmptyState icon={Dumbbell} title="No Programs Yet" description="Your trainer will build your weekly program once your plan is active." />` |
| `(customer)/payments` | None | `<EmptyState icon={CreditCard} title="No Payments Yet" description="Your payment history will appear here once you have an active plan." />` |
| `trainer/clients` | None visible | `<EmptyState icon={Users} title="No Clients Yet" description="Clients will appear here after they complete their assessment." />` |
| `trainer/sessions` | Implicit | `<EmptyState icon={Calendar} title="No Sessions" description="Create your first session using the New Session button above." onAction={openCreateModal} actionLabel="Create Session" />` |
| `trainer/programs` | "No programs" text | `<EmptyState icon={Dumbbell} title="No Programs" description="Build your first weekly program for a client." onAction={openCreateModal} actionLabel="New Program" />` |
| `(admin)/admin/assessments` | None visible | `<EmptyState icon={ClipboardList} title="No Assessments" description="No assessments match the selected filter." />` |

### Step 3 — Admin empty states use violet accent

For admin pages, override the icon background:

```tsx
<EmptyState
  icon={ClipboardList}
  title="No Pending Assessments"
  description="All assessments have been reviewed."
  // Pass a variant prop or override via className
/>
```

Consider adding an optional `variant="admin"` prop to EmptyState that changes `bg-orange-50 text-orange-400` to `bg-violet-50 text-violet-400`.

---

## Acceptance Criteria

- [ ] `EmptyState` component exists at `src/components/ui/EmptyState.tsx`.
- [ ] All list pages use `EmptyState` instead of inline icon + text combinations.
- [ ] Empty states with actions (create session, new program) include a CTA button.
- [ ] Empty states without user actions (waiting for trainer) do not show a misleading action button.
- [ ] No TypeScript errors.
