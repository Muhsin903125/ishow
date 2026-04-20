# B2 — Complete Assign Trainer in Admin Clients Page

**Category:** Bug Fix  
**Priority:** 🐛 Defect (UI stub — selection does nothing)  
**File:** `src/app/(admin)/admin/clients/page.tsx`  
**Lines:** ~162–185  

---

## Problem

The "Assign Trainer" button in the admin clients list opens a dropdown showing all available trainers. However, when the admin selects a trainer from the dropdown, the `onChange` handler only closes the dropdown — it does not persist the selection to the database.

**Current broken handler (line ~166-170):**
```tsx
onChange={async (e) => {
  if (!e.target.value) return;
  // trainer assignment would go on plans/sessions — for now just update status
  setAssigningId(null);
}}
```

The comment "for now just update status" was left as a placeholder and was never implemented.

---

## Fix Instructions

### Step 1 — Decide where trainer assignment is stored

The best approach depends on the data model. Two options:

**Option A (Recommended):** Update the customer's **active plan** `trainer_id`. A plan is already linked to a customer; adding/updating the trainer there connects them for sessions and reporting.

**Option B:** Add a `trainer_id` column directly on the `profiles` table for a persistent trainer–customer link independent of plans.

Use **Option A** for now since `plans` already has `trainer_id`.

### Step 2 — Read the current data load

At the top of the component, `plans` are already fetched:
```tsx
const [c, t, a, p] = await Promise.all([
  listCustomers(), listTrainers(), listAssessments(), listAllPlans(),
]);
```

You have access to `plans` state — find the active plan for the selected customer.

### Step 3 — Add the save helper function

Inside the component, above the return statement, add:

```tsx
const handleAssignTrainer = async (customerId: string, trainerId: string) => {
  // Find customer's active plan
  const activePlan = plans.find(
    (p) => p.userId === customerId && p.status === "active"
  );

  if (activePlan) {
    // Update the plan's trainer_id
    await updatePlan(activePlan.id, { trainerId });
  } else {
    // No active plan yet — store on profile as fallback
    await updateProfile(customerId, { /* trainer_id if column exists */ });
  }

  setAssigningId(null);
  await loadData(); // refresh
};
```

Import `updatePlan` from `src/lib/db/plans.ts` — it already exists.

### Step 4 — Wire the onChange handler

Replace the broken `onChange` with:

```tsx
onChange={async (e) => {
  if (!e.target.value) return;
  await handleAssignTrainer(customer.id, e.target.value);
}}
```

### Step 5 — Add loading state (optional but recommended)

Add `const [saving, setSaving] = useState(false)` and wrap the handler:
```tsx
setSaving(true);
await handleAssignTrainer(customer.id, e.target.value);
setSaving(false);
```

Disable the select while saving to prevent double-submission.

### Step 6 — Show current assigned trainer

In the client card, display which trainer is currently assigned. Find the trainer from `trainers` state using the `trainer_id` on the active plan, and show their name next to the "Assign Trainer" button.

---

## Acceptance Criteria

- [ ] Selecting a trainer from the dropdown and confirming persists the `trainer_id` on the customer's active plan in Supabase.
- [ ] The clients list refreshes after assignment — the newly assigned trainer name appears.
- [ ] If the customer has no active plan, the assignment falls back gracefully (either stores on profile or shows a "no active plan" warning).
- [ ] The dropdown closes after a successful save.
- [ ] No TypeScript errors introduced.
- [ ] `updatePlan` is imported from `src/lib/db/plans.ts` (not inline fetch).
