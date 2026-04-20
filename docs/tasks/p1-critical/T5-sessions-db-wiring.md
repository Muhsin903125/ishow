# T5 — Verify & Extend Sessions DB Functions for Trainer Use

**Category:** P1 — Critical  
**Area:** Trainer · Session Management  
**File:** `src/lib/db/sessions.ts`  
**Depends on:** None (prerequisite for T1–T4)

---

## Why

Tasks T1–T4 all call `createSession`, `updateSession`, and `deleteSession` from `src/lib/db/sessions.ts`. Before implementing the UI, verify these functions exist, accept the right shape, and handle errors correctly. Extend them if necessary.

---

## Implementation Steps

### Step 1 — Read the current file

Open `src/lib/db/sessions.ts` and document what functions exist and their signatures.

### Step 2 — Verify `createSession`

It should accept at minimum:

```typescript
interface CreateSessionInput {
  userId: string;
  trainerId?: string;
  title: string;
  scheduledDate: string;   // "YYYY-MM-DD"
  scheduledTime: string;   // "HH:MM"
  duration: number;        // minutes
  status: "scheduled";
  notes?: string;
}

export async function createSession(input: CreateSessionInput): Promise<TrainingSession>
```

If missing, implement it:

```typescript
export async function createSession(input: CreateSessionInput): Promise<TrainingSession> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      user_id: input.userId,
      trainer_id: input.trainerId ?? null,
      title: input.title,
      scheduled_date: input.scheduledDate,
      scheduled_time: input.scheduledTime,
      duration: input.duration,
      status: input.status,
      notes: input.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapSession(data);
}
```

### Step 3 — Verify `updateSession`

It should accept a session ID and a partial update object:

```typescript
export async function updateSession(
  id: string,
  updates: Partial<Omit<TrainingSession, "id" | "createdAt">>
): Promise<TrainingSession>
```

### Step 4 — Verify `listSessions` supports trainer filtering

The trainer sessions page should only show sessions belonging to the trainer's clients. `listSessions` should support a `trainerId` filter:

```typescript
export async function listSessions(filters?: {
  userId?: string;
  trainerId?: string;
  status?: string;
}): Promise<TrainingSession[]>
```

If it currently fetches all sessions, add the filter:

```typescript
let query = supabase.from("sessions").select("*");
if (filters?.trainerId) query = query.eq("trainer_id", filters.trainerId);
if (filters?.userId) query = query.eq("user_id", filters.userId);
```

### Step 5 — Verify the `mapSession` helper maps snake_case → camelCase

Supabase returns `scheduled_date`, `trainer_id` etc. Confirm there is a mapping function that converts to the TypeScript interface. If not, add one:

```typescript
function mapSession(row: Record<string, unknown>): TrainingSession {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    trainerId: row.trainer_id as string | undefined,
    title: row.title as string,
    scheduledDate: row.scheduled_date as string,
    scheduledTime: row.scheduled_time as string,
    duration: row.duration as number,
    status: row.status as TrainingSession["status"],
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
  };
}
```

---

## Acceptance Criteria

- [ ] `createSession`, `updateSession`, `listSessions` all exist in `src/lib/db/sessions.ts`.
- [ ] `listSessions` accepts an optional `trainerId` filter.
- [ ] All functions properly map snake_case Supabase columns to camelCase TypeScript fields.
- [ ] All functions throw on Supabase error (not silently return null).
- [ ] No TypeScript errors in the file.
