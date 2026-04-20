# T8 — Trainer: Delete Program

**Category:** P1 — Critical  
**Area:** Trainer · Program Authoring  
**File:** `src/app/trainer/programs/page.tsx`  
**Depends on:** T6

---

## Why

Trainers need to remove outdated or incorrectly created programs. Without delete, stale programs accumulate in the client's view.

---

## Implementation Steps

### Step 1 — Add Delete button to each program card header

```tsx
<button
  onClick={() => handleDeleteProgram(program.id)}
  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
  title="Delete program"
>
  <Trash2 className="w-4 h-4" />
</button>
```

Import `Trash2` from `lucide-react`.

### Step 2 — Implement the handler with confirmation

```tsx
const handleDeleteProgram = async (programId: string) => {
  const confirmed = window.confirm(
    "Delete this program? This will also remove all its exercises. This cannot be undone."
  );
  if (!confirmed) return;

  await deleteProgram(programId);
  await loadData();
};
```

Import `deleteProgram` from `src/lib/db/programs.ts`.

### Step 3 — Verify `deleteProgram` cascades to activities

In `src/lib/db/programs.ts`, confirm `deleteProgram` also deletes the associated `program_activities` rows. If the Supabase table has `ON DELETE CASCADE` set on the `program_id` FK, this happens automatically. Otherwise, delete explicitly:

```typescript
export async function deleteProgram(id: string) {
  const supabase = createClient();
  // Activities delete via cascade; if not, delete manually first:
  await supabase.from("program_activities").delete().eq("program_id", id);
  const { error } = await supabase.from("programs").delete().eq("id", id);
  if (error) throw error;
}
```

---

## Acceptance Criteria

- [ ] Each program card has a delete (trash) button.
- [ ] Clicking delete shows a confirmation dialog.
- [ ] Confirming calls `deleteProgram` which removes the program and all its activities.
- [ ] The programs list refreshes after deletion.
- [ ] No TypeScript errors.
