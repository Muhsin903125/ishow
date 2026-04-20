# T1 — Trainer: Create Session for a Client

**Category:** P1 — Critical  
**Area:** Trainer · Session Management  
**File:** `src/app/trainer/sessions/page.tsx`  
**Depends on:** `src/lib/db/sessions.ts` (functions already exist)

---

## Why

Currently only the admin can book training sessions via the assessment management page. Trainers must rely on admins for something they should own entirely. A trainer must be able to independently schedule sessions for any of their clients.

---

## Implementation Steps

### Step 1 — Add "Create Session" button to the sessions page header

In `src/app/trainer/sessions/page.tsx`, add a button in the page header area:

```tsx
<button
  onClick={() => { setEditingSession(null); setShowModal(true); }}
  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-400 transition-colors"
>
  <Plus className="w-4 h-4" /> New Session
</button>
```

Import `Plus` from `lucide-react`.

### Step 2 — Add modal state variables

At the top of the component, add:

```tsx
const [showModal, setShowModal] = useState(false);
const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
const [sessionForm, setSessionForm] = useState({
  userId: "",
  title: "",
  scheduledDate: "",
  scheduledTime: "",
  duration: 60,
  notes: "",
});
const [saving, setSaving] = useState(false);
const [formError, setFormError] = useState("");
```

### Step 3 — Fetch the trainer's clients

The sessions page needs to know which clients belong to this trainer so the form can offer a client selector. Fetch clients at load time:

```tsx
const [clients, setClients] = useState<Profile[]>([]);

// inside loadData():
const allCustomers = await listCustomers();
// filter to customers that have a plan with this trainer
const myPlans = sessions.map(s => s.userId); // or fetch plans separately
setClients(allCustomers); // for now show all; filter by trainer later
```

Import `listCustomers` from `src/lib/db/profiles.ts`.

### Step 4 — Build the session form modal

Create a modal overlay when `showModal` is true. Fields:

| Field | Type | Required |
|---|---|---|
| Client | `<select>` populated from `clients` | Yes |
| Session Title | `<input type="text">` | Yes |
| Date | `<input type="date">` | Yes |
| Time | `<select>` with 30-min slots 6AM–9PM | Yes |
| Duration (min) | `<select>`: 30, 45, 60, 90, 120 | Yes |
| Notes | `<textarea>` | No |

```tsx
{showModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
      <h2 className="text-lg font-bold mb-4">
        {editingSession ? "Edit Session" : "New Session"}
      </h2>
      {/* form fields */}
      <div className="flex gap-3 mt-6">
        <button onClick={handleSaveSession} disabled={saving}
          className="flex-1 bg-orange-500 text-white py-2 rounded-xl font-semibold">
          {saving ? "Saving…" : "Save"}
        </button>
        <button onClick={() => setShowModal(false)}
          className="flex-1 border border-gray-200 py-2 rounded-xl font-semibold">
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
```

### Step 5 — Implement the save handler

```tsx
const handleSaveSession = async () => {
  setFormError("");
  if (!sessionForm.userId || !sessionForm.title || !sessionForm.scheduledDate || !sessionForm.scheduledTime) {
    setFormError("Please fill in all required fields.");
    return;
  }
  setSaving(true);
  try {
    if (editingSession) {
      await updateSession(editingSession.id, {
        title: sessionForm.title,
        scheduledDate: sessionForm.scheduledDate,
        scheduledTime: sessionForm.scheduledTime,
        duration: sessionForm.duration,
        notes: sessionForm.notes,
      });
    } else {
      await createSession({
        userId: sessionForm.userId,
        trainerId: user!.id,
        title: sessionForm.title,
        scheduledDate: sessionForm.scheduledDate,
        scheduledTime: sessionForm.scheduledTime,
        duration: sessionForm.duration,
        status: "scheduled",
        notes: sessionForm.notes,
      });
    }
    setShowModal(false);
    await loadData();
  } catch (err) {
    setFormError("Failed to save session. Please try again.");
  } finally {
    setSaving(false);
  }
};
```

Import `createSession`, `updateSession` from `src/lib/db/sessions.ts`.

### Step 6 — Send notification email

After a successful `createSession`, call:

```tsx
import { notify } from "@/lib/email/notify";

await notify("session-scheduled", clientEmail, {
  clientName: clientName,
  sessionTitle: sessionForm.title,
  sessionDate: sessionForm.scheduledDate,
  sessionTime: sessionForm.scheduledTime,
  duration: String(sessionForm.duration),
  notes: sessionForm.notes,
});
```

---

## Acceptance Criteria

- [ ] "New Session" button is visible in the trainer sessions page header.
- [ ] Clicking the button opens a modal with all required fields.
- [ ] Submitting a valid form creates the session in Supabase via `createSession`.
- [ ] The sessions list refreshes after creation.
- [ ] Validation prevents submission with empty required fields and shows an error message.
- [ ] A notification email is sent to the client.
- [ ] No TypeScript errors.
