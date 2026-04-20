# UX1 — Replace Spinners with Skeleton Loaders on All Dashboard Pages

**Category:** P3 — Enhancement  
**Area:** UX / Performance Perception  
**Files:** All customer, trainer, and admin dashboard pages

---

## Why

All pages currently show a centered `Loader2` spinner while fetching data. Skeleton loaders (content-shaped placeholder blocks) significantly improve perceived performance because the user sees the layout immediately and data fills in — rather than a blank spinner that gives no context.

---

## Implementation Steps

### Step 1 — Create a reusable Skeleton component

Create `src/components/ui/Skeleton.tsx`:

```tsx
import { cn } from "@/lib/utils"; // or use clsx

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gray-100",
        className
      )}
    />
  );
}
```

Tailwind's `animate-pulse` provides the shimmer effect.

### Step 2 — Create page-specific skeleton layouts

For each dashboard page, create a skeleton that mirrors the actual layout. Examples:

**Customer Dashboard skeleton:**
```tsx
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gray-900 rounded-2xl p-6">
        <Skeleton className="h-4 w-24 bg-gray-700 mb-2" />
        <Skeleton className="h-8 w-48 bg-gray-700 mb-2" />
        <Skeleton className="h-4 w-64 bg-gray-700" />
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      {/* Sessions */}
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  );
}
```

**Client list skeleton (trainer):**
```tsx
export function ClientListSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}
```

### Step 3 — Replace `if (loading || !user) return null` with skeleton

In each page, change:

```tsx
// BEFORE
if (loading || !user) return null;

// AFTER — add a pageLoading state separate from auth loading
const [pageLoading, setPageLoading] = useState(true);

// In loadData():
setPageLoading(false); // called after data fetch completes

// In render:
if (loading || !user) return null; // still needed for auth
if (pageLoading) return <DashboardLayout role="customer"><DashboardSkeleton /></DashboardLayout>;
```

### Step 4 — Pages to update

| Page | Skeleton Name |
|---|---|
| `(customer)/dashboard/page.tsx` | `DashboardSkeleton` |
| `(customer)/sessions/page.tsx` | `SessionsListSkeleton` |
| `(customer)/payments/page.tsx` | `PaymentsTableSkeleton` |
| `(customer)/programs/page.tsx` | `ProgramsListSkeleton` |
| `trainer/clients/page.tsx` | `ClientListSkeleton` |
| `trainer/sessions/page.tsx` | `SessionsListSkeleton` |
| `trainer/programs/page.tsx` | `ProgramsListSkeleton` |
| `(admin)/admin/assessments/page.tsx` | `AssessmentsListSkeleton` |
| `(admin)/admin/clients/page.tsx` | `ClientListSkeleton` |

---

## Acceptance Criteria

- [ ] `Skeleton` base component exists at `src/components/ui/Skeleton.tsx`.
- [ ] Each listed page has a corresponding skeleton that matches the page's approximate layout.
- [ ] Spinners are removed from all listed pages.
- [ ] Skeletons display while `pageLoading` is true, replaced by real content after fetch completes.
- [ ] Auth guard (`loading || !user`) still prevents rendering before auth resolves.
- [ ] No TypeScript errors.
