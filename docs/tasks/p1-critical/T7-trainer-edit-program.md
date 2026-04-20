# T7 — Trainer: Edit Existing Program

**Category:** P1 — Critical  
**Area:** Trainer · Program Authoring  
**File:** `src/app/trainer/programs/page.tsx`  
**Depends on:** T6 (modal and form already built)

---

## Why

After a program is created, a trainer may need to update exercises, swap days, or adjust sets/reps as the client progresses. Without edit capability, the trainer must delete and recreate the entire program.

---

## Implementation Steps

### Step 1 — Add Edit button to each program card

In the program list, add an edit button inside each program header:

```tsx
<button
  onClick={() => {
    setProgramForm({
      userId: program.userId,
      weekNumber: program.weekNumber,
      title: program.title,
      description: program.description ?? "",
      activities: program.activities ?? [],
    });
    setEditingProgramId(program.id);
    setShowProgramModal(true);
  }}
  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
>
  <Pencil className="w-4 h-4" />
</button>
```

Add state:
```tsx
const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
```

Reset it when the modal closes:
```tsx
const closeModal = () => {
  setShowProgramModal(false);
  setEditingProgramId(null);
  setProgramForm(emptyForm());
};
```

### Step 2 — Ensure `program.activities` is loaded

The program list query must include activities. In `listPrograms`, join `program_activities`:

```typescript
// In src/lib/db/programs.ts
const { data } = await supabase
  .from("programs")
  .select("*, program_activities(*)")
  .eq("trainer_id", trainerId);
```

Map `program_activities` rows into the `activities` array on each program.

### Step 3 — Branch the save handler on `editingProgramId`

In the `handleSaveProgram` function from T6, add the edit branch:

```tsx
if (editingProgramId) {
  await updateProgram(editingProgramId, {
    title: programForm.title,
    description: programForm.description,
    weekNumber: programForm.weekNumber,
    activities: programForm.activities,
  });
} else {
  await createProgram({ ... });
}
```

Import `updateProgram` from `src/lib/db/programs.ts`. This function should:
1. Update the `programs` row
2. Delete existing `program_activities` for that program
3. Insert the new activities list

### Step 4 — Verify `updateProgram` handles activities correctly

In `src/lib/db/programs.ts`, `updateProgram` should do an atomic replace of activities:

```typescript
export async function updateProgram(id: string, updates: UpdateProgramInput) {
  const supabase = createClient();
  // 1. Update program row
  await supabase.from("programs").update({ title: updates.title, ... }).eq("id", id);
  // 2. Delete old activities
  await supabase.from("program_activities").delete().eq("program_id", id);
  // 3. Insert new activities
  if (updates.activities?.length) {
    await supabase.from("program_activities").insert(
      updates.activities.map((a, i) => ({ program_id: id, ...mapToRow(a), sort_order: i }))
    );
  }
}
```

---

## Acceptance Criteria

- [ ] Each program card has an edit (pencil) button.
- [ ] Clicking edit opens the modal pre-filled with the program's current data including all activities.
- [ ] Submitting the edit updates the program and replaces its activities in Supabase.
- [ ] Programs list refreshes after saving.
- [ ] Closing the modal without saving resets all state correctly.
- [ ] No TypeScript errors.
