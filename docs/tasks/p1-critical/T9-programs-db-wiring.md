# T9 — Verify & Extend Programs DB Functions for Trainer Authoring

**Category:** P1 — Critical  
**Area:** Trainer · Program Authoring  
**File:** `src/lib/db/programs.ts`  
**Depends on:** None (prerequisite for T6–T8)

---

## Why

Tasks T6–T8 call `createProgram`, `updateProgram`, `deleteProgram`, and `listPrograms` from `src/lib/db/programs.ts`. Before implementing the UI, verify these functions exist, accept the correct shapes, and handle activities correctly.

---

## Implementation Steps

### Step 1 — Read `src/lib/db/programs.ts` in full

Document what functions exist and their signatures.

### Step 2 — Verify `createProgram` accepts activities

The function must insert into both `programs` and `program_activities` in one call:

```typescript
interface CreateProgramInput {
  userId: string;
  trainerId: string;
  weekNumber: number;
  title: string;
  description?: string;
  activities: ActivityInput[];
}

interface ActivityInput {
  day: string;
  exerciseName: string;
  exerciseId?: string;
  sets?: number;
  reps?: string;
  duration?: string;
  notes?: string;
}

export async function createProgram(input: CreateProgramInput): Promise<Program> {
  const supabase = createClient();
  // Insert program
  const { data: program, error } = await supabase
    .from("programs")
    .insert({ user_id: input.userId, trainer_id: input.trainerId, week_number: input.weekNumber, title: input.title, description: input.description })
    .select().single();
  if (error) throw error;

  // Insert activities
  if (input.activities.length > 0) {
    const { error: actError } = await supabase.from("program_activities").insert(
      input.activities.map((a, i) => ({
        program_id: program.id,
        day: a.day,
        exercise_name: a.exerciseName,
        exercise_id: a.exerciseId ?? null,
        sets: a.sets ?? null,
        reps: a.reps ?? null,
        duration: a.duration ?? null,
        notes: a.notes ?? null,
        sort_order: i,
      }))
    );
    if (actError) throw actError;
  }

  return mapProgram(program);
}
```

### Step 3 — Verify `listPrograms` joins activities

```typescript
export async function listPrograms(filters?: { userId?: string; trainerId?: string }): Promise<Program[]> {
  const supabase = createClient();
  let query = supabase.from("programs").select("*, program_activities(*)").order("week_number", { ascending: false });
  if (filters?.userId) query = query.eq("user_id", filters.userId);
  if (filters?.trainerId) query = query.eq("trainer_id", filters.trainerId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapProgramWithActivities);
}
```

### Step 4 — Add `mapProgramWithActivities` helper

```typescript
function mapProgramWithActivities(row: Record<string, unknown>): Program {
  return {
    ...mapProgram(row),
    activities: ((row.program_activities as unknown[]) ?? []).map(mapActivity),
  };
}
```

### Step 5 — Verify `updateProgram` replaces activities atomically

See T7 for the expected implementation. Confirm it deletes old activities and inserts new ones in the same operation.

---

## Acceptance Criteria

- [ ] `createProgram` inserts into both `programs` and `program_activities`.
- [ ] `listPrograms` returns programs with their `activities` array populated.
- [ ] `updateProgram` atomically replaces activities (delete old, insert new).
- [ ] `deleteProgram` removes program and all activities (via cascade or explicit delete).
- [ ] All functions use snake_case → camelCase mapping.
- [ ] No TypeScript errors.
