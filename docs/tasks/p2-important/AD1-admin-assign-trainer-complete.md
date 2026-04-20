# AD1 — Admin: Complete Assign Trainer to Client

**Category:** P2 — Important  
**Area:** Admin · Client Management  
**Note:** This is the full feature version. Bug fix B2 covers the minimal fix. This task covers the complete UX including visual feedback and database persistence.

**File:** `src/app/(admin)/admin/clients/page.tsx`

---

## Why

The assign trainer dropdown UI exists but is a stub. The full implementation should persist the assignment, show the currently assigned trainer, and allow re-assignment.

---

## Implementation Steps

### Step 1 — Fetch plans alongside clients

Ensure `listAllPlans()` is called and stored in state (it already is, based on the current code). Plans contain `trainerId` which tells us who is assigned.

### Step 2 — Get the currently assigned trainer for each client

In the client card render, find the client's active plan:

```tsx
const activePlan = plans.find(p => p.userId === customer.id && p.status === "active");
const assignedTrainer = activePlan?.trainerId
  ? trainers.find(t => t.id === activePlan.trainerId)
  : null;
```

Display this above the assign button:

```tsx
{assignedTrainer ? (
  <p className="text-sm text-gray-600 mb-2">
    Trainer: <span className="font-semibold">{assignedTrainer.name}</span>
  </p>
) : (
  <p className="text-sm text-gray-400 mb-2">No trainer assigned</p>
)}
```

### Step 3 — Implement the `handleAssignTrainer` function

```tsx
const handleAssignTrainer = async (customerId: string, trainerId: string) => {
  const activePlan = plans.find(p => p.userId === customerId && p.status === "active");

  if (activePlan) {
    await updatePlan(activePlan.id, { trainerId });
  } else {
    // No active plan — show a warning toast
    setGlobalMessage("This client has no active plan. Assign a plan first.");
    setAssigningId(null);
    return;
  }

  setAssigningId(null);
  await loadData();
};
```

Import `updatePlan` from `src/lib/db/plans.ts`.

### Step 4 — Wire the onChange handler

```tsx
onChange={async (e) => {
  if (!e.target.value) return;
  await handleAssignTrainer(customer.id, e.target.value);
}}
```

### Step 5 — Pre-select current trainer in the dropdown

```tsx
<select
  defaultValue={activePlan?.trainerId ?? ""}
  onChange={async (e) => { ... }}
  className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
>
  <option value="">Select trainer…</option>
  {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
</select>
```

### Step 6 — Add global message display

Add a dismissible toast or banner at the top of the page for messages like "no active plan":

```tsx
const [globalMessage, setGlobalMessage] = useState("");

{globalMessage && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4 text-yellow-800 text-sm flex justify-between">
    {globalMessage}
    <button onClick={() => setGlobalMessage("")}>✕</button>
  </div>
)}
```

---

## Acceptance Criteria

- [ ] Currently assigned trainer is displayed on each client card.
- [ ] Selecting a trainer from the dropdown saves to the active plan's `trainer_id` in Supabase.
- [ ] Client cards refresh after assignment showing the new trainer name.
- [ ] If client has no active plan, a warning is shown and the dropdown is closed without crashing.
- [ ] Dropdown pre-selects the currently assigned trainer.
- [ ] No TypeScript errors.
