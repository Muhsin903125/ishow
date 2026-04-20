# C3 — Customer: Cancel Upcoming Session

**Category:** P2 — Important  
**Area:** Customer · Session Self-Service  
**File:** `src/app/(customer)/sessions/page.tsx`

---

## Why

Customers can view their upcoming sessions but cannot cancel them. If a customer cannot attend, they must contact the trainer directly. Adding a cancel option lets customers self-manage without admin/trainer involvement.

---

## Implementation Steps

### Step 1 — Add a Cancel button to upcoming session cards

In the upcoming sessions section of `src/app/(customer)/sessions/page.tsx`, add a cancel button for `status === "scheduled"` sessions:

```tsx
{session.status === "scheduled" && (
  <button
    onClick={() => handleCancelSession(session.id)}
    className="mt-3 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium"
  >
    <X className="w-3.5 h-3.5" /> Cancel Session
  </button>
)}
```

Import `X` from `lucide-react`.

### Step 2 — Implement the handler

```tsx
const handleCancelSession = async (sessionId: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to cancel this session? Your trainer will be notified."
  );
  if (!confirmed) return;

  await updateSession(sessionId, { status: "cancelled" });
  await loadData();
};
```

Import `updateSession` from `src/lib/db/sessions.ts`.

### Step 3 — Reload sessions after cancel

The page likely already has a `loadData` function. After `updateSession`, call it to refresh the list so the cancelled session moves to the Past Sessions section.

### Step 4 — Consider a cancellation policy notice (optional)

Show a small note below the cancel button explaining any policy:
```tsx
<p className="text-xs text-gray-400 mt-1">Cancellations must be made 24 hours in advance.</p>
```

This is informational only — no enforcement in this task.

---

## Acceptance Criteria

- [ ] A "Cancel Session" button appears on each upcoming `scheduled` session.
- [ ] Clicking shows a confirmation prompt.
- [ ] Confirming calls `updateSession(id, { status: "cancelled" })`.
- [ ] The cancelled session moves from Upcoming to Past Sessions.
- [ ] Button is NOT shown on completed or already-cancelled sessions.
- [ ] No TypeScript errors.
