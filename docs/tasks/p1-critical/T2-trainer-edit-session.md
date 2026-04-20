# T2 — Trainer: Edit Existing Session

**Category:** P1 — Critical  
**Area:** Trainer · Session Management  
**File:** `src/app/trainer/sessions/page.tsx`  
**Depends on:** T1 (modal + form already built), `src/lib/db/sessions.ts`

---

## Why

After a session is created, the trainer needs to be able to update the date, time, title, or notes — for example when a client reschedules. Without edit capability, the trainer must delete and re-create the session.

---

## Implementation Steps

### Step 1 — Add Edit button to each session item

In the session list render, add an edit icon button next to each upcoming session:

```tsx
<button
  onClick={() => {
    setEditingSession(session);
    setSessionForm({
      userId: session.userId,
      title: session.title,
      scheduledDate: session.scheduledDate,
      scheduledTime: session.scheduledTime,
      duration: session.duration,
      notes: session.notes ?? "",
    });
    setShowModal(true);
  }}
  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
  title="Edit session"
>
  <Pencil className="w-4 h-4" />
</button>
```

Import `Pencil` from `lucide-react`. Only show the edit button for sessions with `status === "scheduled"` (cannot edit completed or cancelled sessions).

### Step 2 — Reuse the modal from T1

The modal from T1 already supports editing because `editingSession` state drives the title and the save handler branches on `editingSession !== null`. No new modal is needed.

### Step 3 — Pre-fill the form when opening for edit

When the edit button is clicked (Step 1 above), `setSessionForm` is called with the existing session values. Verify the form fields in the modal are controlled inputs reading from `sessionForm` state.

### Step 4 — Confirm the save handler uses `updateSession`

In the save handler from T1:
```tsx
if (editingSession) {
  await updateSession(editingSession.id, { ...fields });
}
```

`updateSession` is already in `src/lib/db/sessions.ts`. Verify it accepts partial updates.

### Step 5 — Send reschedule notification email

When updating a session (editingSession is not null), send a rescheduled notification:

```tsx
await notify("session-rescheduled", clientEmail, {
  clientName,
  sessionTitle: sessionForm.title,
  newDate: sessionForm.scheduledDate,
  newTime: sessionForm.scheduledTime,
});
```

---

## Acceptance Criteria

- [ ] Each upcoming session card shows an edit (pencil) icon button.
- [ ] Clicking edit opens the modal pre-filled with that session's current values.
- [ ] Submitting the edit form calls `updateSession` and updates the Supabase record.
- [ ] The sessions list refreshes after saving.
- [ ] A reschedule email is sent to the client.
- [ ] Edit button is hidden for completed and cancelled sessions.
- [ ] No TypeScript errors.
