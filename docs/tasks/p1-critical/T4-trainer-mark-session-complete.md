# T4 — Trainer: Mark Session as Complete

**Category:** P1 — Critical  
**Area:** Trainer · Session Management  
**File:** `src/app/trainer/sessions/page.tsx`  
**Depends on:** `src/lib/db/sessions.ts`

---

## Why

After a training session takes place, the trainer has no way to record that it happened. All sessions stay as "scheduled" indefinitely. This makes the client's session history inaccurate and the trainer's completion metrics meaningless.

---

## Implementation Steps

### Step 1 — Identify sessions eligible for completion

A session can be marked complete when:
- `status === "scheduled"` AND
- `scheduledDate <= today` (the date has passed or is today)

### Step 2 — Add "Mark Complete" button to eligible sessions

In the session list, conditionally render a check button:

```tsx
{session.status === "scheduled" && session.scheduledDate <= today && (
  <button
    onClick={() => handleMarkComplete(session.id)}
    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors"
  >
    <CheckCircle className="w-3.5 h-3.5" /> Mark Complete
  </button>
)}
```

Import `CheckCircle` from `lucide-react`. Use the `today` variable already computed in the component (format: `"YYYY-MM-DD"`).

### Step 3 — Implement the handler

```tsx
const handleMarkComplete = async (sessionId: string) => {
  await updateSession(sessionId, { status: "completed" });
  await loadData();
};
```

Import `updateSession` from `src/lib/db/sessions.ts`.

### Step 4 — Update the customer sessions page to reflect completion

The customer's `/sessions` page already reads from Supabase. Because `updateSession` writes to Supabase, the customer will see the updated status on their next page load automatically — no extra work needed.

### Step 5 — Reflect in trainer dashboard metrics

The trainer dashboard shows "Today's Sessions" count. After this task, a follow-up improvement would be to add a "Completed Today" metric. This is out of scope for T4 but note it.

---

## Acceptance Criteria

- [ ] Sessions that are `scheduled` and whose date is today or in the past show a "Mark Complete" button.
- [ ] Clicking the button calls `updateSession(id, { status: "completed" })`.
- [ ] The session status changes to "completed" in the list after refresh.
- [ ] The button does NOT appear for future-dated scheduled sessions.
- [ ] The button does NOT appear for already-completed or cancelled sessions.
- [ ] No TypeScript errors.
