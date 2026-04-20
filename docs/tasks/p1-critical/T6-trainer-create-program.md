# T6 — Trainer: Create Weekly Program for a Client

**Category:** P1 — Critical  
**Area:** Trainer · Program Authoring  
**File:** `src/app/trainer/programs/page.tsx`

---

## Why

Trainers can currently only view programs — they cannot create them. This means programs must be created externally or by an admin, making the trainer role incomplete. A trainer must be able to build weekly workout programs using exercises from the library.

---

## Implementation Steps

### Step 1 — Fetch prerequisite data on page load

The create form needs:
1. **Clients** — to select which client the program is for
2. **Exercises** — from the exercise library for the activity builder

Add to the load function:

```tsx
import { listCustomers } from "@/lib/db/profiles";
import { getExercises } from "@/lib/db/master";

const [progs, clients, exercises] = await Promise.all([
  listPrograms({ trainerId: user.id }),
  listCustomers(),
  getExercises(),
]);
setPrograms(progs);
setClients(clients);
setExercises(exercises);
```

### Step 2 — Define the form state shape

```tsx
type ActivityRow = {
  day: string;           // "monday" | "tuesday" | ... | "sunday"
  exerciseName: string;  // free text or from exercise library
  exerciseId?: string;
  sets?: number;
  reps?: string;
  duration?: string;
  notes?: string;
};

const [programForm, setProgramForm] = useState({
  userId: "",
  weekNumber: 1,
  title: "",
  description: "",
  activities: [] as ActivityRow[],
});
```

### Step 3 — Build the "New Program" button and modal

Add a "New Program" button to the page header:

```tsx
<button onClick={() => { setProgramForm(emptyForm()); setShowProgramModal(true); }}
  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
  <Plus className="w-4 h-4" /> New Program
</button>
```

### Step 4 — Build the Program modal

The modal has two sections:

**Section A — Program Info**
- Client selector (`<select>` from clients list)
- Week number (`<input type="number" min="1">`)
- Title (`<input type="text">`)
- Description (`<textarea>`)

**Section B — Activities Builder**

A dynamic table where the trainer adds exercises day by day:

```tsx
<div className="mt-4">
  <div className="flex justify-between items-center mb-2">
    <h3 className="font-semibold text-sm">Activities</h3>
    <button onClick={addActivityRow} className="text-orange-500 text-sm font-semibold">
      + Add Exercise
    </button>
  </div>
  {programForm.activities.map((act, i) => (
    <div key={i} className="grid grid-cols-6 gap-2 mb-2 items-center">
      <select value={act.day} onChange={e => updateActivity(i, "day", e.target.value)}
        className="col-span-1 rounded-lg border px-2 py-1.5 text-sm">
        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      {/* Exercise name with autocomplete from exercises list */}
      <input
        list={`exercises-${i}`}
        value={act.exerciseName}
        onChange={e => updateActivity(i, "exerciseName", e.target.value)}
        placeholder="Exercise name"
        className="col-span-2 rounded-lg border px-2 py-1.5 text-sm"
      />
      <datalist id={`exercises-${i}`}>
        {exercises.map(ex => <option key={ex.id} value={ex.name} />)}
      </datalist>
      <input value={act.sets ?? ""} onChange={e => updateActivity(i, "sets", e.target.value)}
        placeholder="Sets" type="number" className="rounded-lg border px-2 py-1.5 text-sm" />
      <input value={act.reps ?? ""} onChange={e => updateActivity(i, "reps", e.target.value)}
        placeholder="Reps" className="rounded-lg border px-2 py-1.5 text-sm" />
      <button onClick={() => removeActivity(i)} className="text-red-400 hover:text-red-600">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  ))}
</div>
```

### Step 5 — Implement the save handler

```tsx
const handleSaveProgram = async () => {
  if (!programForm.userId || !programForm.title) {
    setFormError("Client and title are required.");
    return;
  }
  setSaving(true);
  try {
    await createProgram({
      userId: programForm.userId,
      trainerId: user!.id,
      weekNumber: programForm.weekNumber,
      title: programForm.title,
      description: programForm.description,
      activities: programForm.activities,
    });
    setShowProgramModal(false);
    await loadData();
  } finally {
    setSaving(false);
  }
};
```

Import `createProgram` from `src/lib/db/programs.ts`.

---

## Acceptance Criteria

- [ ] "New Program" button is visible in the trainer programs page header.
- [ ] The modal lets the trainer select a client, set week number and title.
- [ ] Activities can be added row by row with day, exercise name (autocompleted from library), sets, reps.
- [ ] Saving creates the program and its activities in Supabase.
- [ ] The programs list refreshes after creation.
- [ ] Form validation prevents empty client or title.
- [ ] No TypeScript errors.
