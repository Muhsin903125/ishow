# T3 — Trainer: Cancel Session

**Category:** P1 — Critical  
**Area:** Trainer · Session Management  
**File:** `src/app/trainer/sessions/page.tsx`  
**Depends on:** `src/lib/db/sessions.ts`

---

## Why

Trainers need to cancel sessions when a client is unavailable or an emergency arises. Without cancel capability, sessions remain as "scheduled" indefinitely, polluting the client's session history.

---

## Implementation Steps

### Step 1 — Add Cancel button to each upcoming session item

Next to the edit button (from T2), add a cancel button:

```tsx
{session.status === "scheduled" && (
  <button
    onClick={() => handleCancelSession(session.id)}
    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
    title="Cancel session"
  >
    <X className="w-4 h-4" />
  </button>
)}
```

Import `X` from `lucide-react`.

### Step 2 — Add confirmation before cancel

Do not cancel immediately on click. Show an inline confirmation prompt or use a browser confirm:

```tsx
const handleCancelSession = async (sessionId: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to cancel this session? The client will be notified."
  );
  if (!confirmed) return;

  await updateSession(sessionId, { status: "cancelled" });
  await loadData();
};
```

For a better UX, replace `window.confirm` with an inline confirmation card (show a "Confirm cancel / Keep" pair of buttons in place of the session card). This is optional for the first version.

### Step 3 — Import `updateSession`

```tsx
import { updateSession } from "@/lib/db/sessions";
```

This function already exists in `src/lib/db/sessions.ts`.

### Step 4 — Send cancellation notification (optional but recommended)

After cancelling, notify the client:

```tsx
await notify("session-cancelled", clientEmail, {
  clientName,
  sessionTitle: session.title,
  sessionDate: session.scheduledDate,
  sessionTime: session.scheduledTime,
});
```

> **Note:** A `session-cancelled` email template may not exist yet in `src/lib/email/sender.ts`. If not, add a new template or re-use `session-rescheduled` with updated copy.

---

## Acceptance Criteria

- [ ] A cancel (X) button appears on each session with `status === "scheduled"`.
- [ ] Clicking cancel shows a confirmation prompt before proceeding.
- [ ] Confirming calls `updateSession(id, { status: "cancelled" })`.
- [ ] The session moves to past/cancelled in the list after refresh.
- [ ] Cancel button is NOT shown on already-completed or already-cancelled sessions.
- [ ] No TypeScript errors.
