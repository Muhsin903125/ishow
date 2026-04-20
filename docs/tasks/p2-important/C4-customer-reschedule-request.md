# C4 — Customer: Request Session Reschedule

**Category:** P2 — Important  
**Area:** Customer · Session Self-Service  
**File:** `src/app/(customer)/sessions/page.tsx`

---

## Why

Customers need to inform their trainer when they need to move a session. Instead of a phone call or message, a reschedule request button formalises the process and creates a record of the request.

---

## Implementation Steps

### Step 1 — Add "Request Reschedule" button to upcoming sessions

Next to the cancel button (C3), add:

```tsx
<button
  onClick={() => { setRescheduleSession(session); setShowRescheduleModal(true); }}
  className="mt-3 flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 font-medium"
>
  <RefreshCw className="w-3.5 h-3.5" /> Request Reschedule
</button>
```

Import `RefreshCw` from `lucide-react`.

Add state:
```tsx
const [showRescheduleModal, setShowRescheduleModal] = useState(false);
const [rescheduleSession, setRescheduleSession] = useState<TrainingSession | null>(null);
const [rescheduleNote, setRescheduleNote] = useState("");
const [rescheduleSending, setRescheduleSending] = useState(false);
```

### Step 2 — Build the reschedule request modal

The modal asks the customer for a preferred new date and an optional note:

```tsx
{showRescheduleModal && rescheduleSession && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
      <h2 className="text-base font-bold mb-1">Request Reschedule</h2>
      <p className="text-sm text-gray-500 mb-4">
        Current: {rescheduleSession.title} on {rescheduleSession.scheduledDate}
      </p>
      <label className="block text-sm font-medium mb-1">Preferred new date</label>
      <input
        type="date"
        value={rescheduleDate}
        onChange={e => setRescheduleDate(e.target.value)}
        min={new Date().toISOString().split("T")[0]}
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm mb-3"
      />
      <label className="block text-sm font-medium mb-1">Note (optional)</label>
      <textarea
        value={rescheduleNote}
        onChange={e => setRescheduleNote(e.target.value)}
        rows={3}
        placeholder="e.g., I'm travelling on that day"
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm mb-4"
      />
      <div className="flex gap-3">
        <button onClick={handleRescheduleRequest} disabled={rescheduleSending}
          className="flex-1 bg-orange-500 text-white py-2 rounded-xl text-sm font-semibold">
          {rescheduleSending ? "Sending…" : "Send Request"}
        </button>
        <button onClick={() => setShowRescheduleModal(false)}
          className="flex-1 border border-gray-200 py-2 rounded-xl text-sm font-semibold">
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
```

Add `rescheduleDate` state:
```tsx
const [rescheduleDate, setRescheduleDate] = useState("");
```

### Step 3 — Implement `handleRescheduleRequest`

For MVP, the reschedule request is sent as an email notification to the trainer — it does NOT automatically move the session (the trainer confirms via T2):

```tsx
const handleRescheduleRequest = async () => {
  if (!rescheduleDate) return;
  setRescheduleSending(true);
  try {
    // Send email notification to trainer
    await notify("session-reschedule-request", trainerEmail, {
      clientName: user!.name,
      sessionTitle: rescheduleSession!.title,
      currentDate: rescheduleSession!.scheduledDate,
      preferredDate: rescheduleDate,
      note: rescheduleNote,
    });
    setShowRescheduleModal(false);
    setRescheduleNote("");
    setRescheduleDate("");
    // Optionally show a success toast
  } finally {
    setRescheduleSending(false);
  }
};
```

> **Note:** A `session-reschedule-request` email template may need to be added to `src/lib/email/sender.ts`.

### Step 4 — Get trainer email

The customer's active plan has a `trainerId`. Use it to look up the trainer's profile (or store `trainerEmail` on the session/plan when fetched).

---

## Acceptance Criteria

- [ ] "Request Reschedule" button appears on each upcoming scheduled session.
- [ ] Clicking opens a modal asking for a preferred new date and optional note.
- [ ] Submitting sends an email to the trainer with the request details.
- [ ] Modal closes after sending.
- [ ] Preferred date cannot be in the past.
- [ ] No TypeScript errors.
