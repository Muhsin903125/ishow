# T10 — Exercise Autocomplete in Program Activity Builder

**Category:** P1 — Critical  
**Area:** Trainer · Program Authoring  
**File:** `src/app/trainer/programs/page.tsx`  
**Depends on:** T6, `src/lib/db/master.ts`

---

## Why

When a trainer builds a weekly program (T6), they type in exercise names manually. Without autocomplete from the exercise library, trainers will create inconsistencies (e.g., "Push Up" vs "Push-Up" vs "Pushup") that make exercise analytics impossible.

---

## Implementation Steps

### Step 1 — Fetch exercises on page load

Already covered in T6 Step 1. The exercise list is fetched with `getExercises()` from `src/lib/db/master.ts`.

### Step 2 — Use native `<datalist>` for autocomplete

In each activity row, bind a `<datalist>` to the exercise name input:

```tsx
<input
  list={`ex-list-${rowIndex}`}
  value={activity.exerciseName}
  onChange={(e) => {
    const match = exercises.find(ex => ex.name === e.target.value);
    updateActivity(rowIndex, {
      exerciseName: e.target.value,
      exerciseId: match?.id,
      // Auto-fill defaults from library
      sets: match?.defaultSets ?? activity.sets,
      reps: match?.defaultReps ?? activity.reps,
      duration: match?.defaultDuration ?? activity.duration,
    });
  }}
  placeholder="Exercise name"
  className="col-span-2 rounded-lg border px-2 py-1.5 text-sm"
/>
<datalist id={`ex-list-${rowIndex}`}>
  {exercises.filter(ex => ex.isActive).map(ex => (
    <option key={ex.id} value={ex.name} />
  ))}
</datalist>
```

### Step 3 — Auto-fill default values from library

When a trainer selects an exercise that matches the library, auto-populate `sets`, `reps`, and `duration` from the library's defaults. The trainer can then override them.

The `updateActivity` helper should accept a partial update:

```tsx
const updateActivity = (index: number, updates: Partial<ActivityRow>) => {
  setProgramForm(prev => ({
    ...prev,
    activities: prev.activities.map((a, i) => i === index ? { ...a, ...updates } : a),
  }));
};
```

### Step 4 — Store `exerciseId` when a library match is selected

When the typed name exactly matches an exercise in the library, store the `exerciseId`. This enables:
- Linking to exercise detail/video
- Consistent exercise reporting across programs

If the trainer types a custom exercise name not in the library, `exerciseId` stays undefined — this is valid.

### Step 5 — Show exercise category chip (optional enhancement)

When an exercise is matched from the library, show a small category badge (e.g., "Strength", "Cardio") next to the name input to give the trainer visual confirmation.

---

## Acceptance Criteria

- [ ] Exercise name inputs in the activity builder show autocomplete suggestions from the library.
- [ ] Only active exercises (`isActive: true`) appear in the suggestions.
- [ ] Selecting a library exercise auto-fills default sets/reps/duration.
- [ ] The trainer can override any auto-filled value.
- [ ] `exerciseId` is stored when a library match is selected.
- [ ] Custom exercise names (not in library) are accepted without error.
- [ ] No TypeScript errors.
