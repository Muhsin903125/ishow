# TD7 — Wire Assessment `assigned_trainer_id` to Assessment Review Flow

**Category:** P3 — Tech Debt  
**Area:** Admin · Assessments  
**File:** `src/app/(admin)/admin/assessments/page.tsx`

---

## Why

The `assessments` table has an `assigned_trainer_id` column, but the admin assessment review flow does not use it. There is no UI to assign a specific trainer to an assessment. This means all assessments are "unassigned" even after review, making it impossible for trainers to see which assessments belong to them.

---

## Implementation Steps

### Step 1 — Add trainer selector to the assessment review area

In `src/app/(admin)/admin/assessments/page.tsx`, when the admin expands an assessment for review, show a trainer assignment dropdown:

```tsx
{/* Inside the expanded assessment detail */}
<div className="mt-4 pt-4 border-t border-gray-100">
  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Trainer</label>
  <select
    value={assignedTrainerId[assessment.id] ?? assessment.assignedTrainerId ?? ""}
    onChange={e => setAssignedTrainerId(prev => ({ ...prev, [assessment.id]: e.target.value }))}
    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
  >
    <option value="">Unassigned</option>
    {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
  </select>
</div>
```

Add state:
```tsx
const [assignedTrainerId, setAssignedTrainerId] = useState<Record<string, string>>({});
```

### Step 2 — Save trainer assignment when "Mark Reviewed" is clicked

When the admin marks an assessment as reviewed, include the trainer assignment:

```tsx
const handleMarkReviewed = async (assessmentId: string) => {
  const trainerId = assignedTrainerId[assessmentId];
  await reviewAssessment(assessmentId, {
    status: "reviewed",
    assignedTrainerId: trainerId || undefined,
    reviewedAt: new Date().toISOString(),
  });
  await loadData();
};
```

### Step 3 — Verify `reviewAssessment` in `src/lib/db/assessments.ts` accepts `assignedTrainerId`

```typescript
export async function reviewAssessment(
  id: string,
  updates: {
    status: "reviewed" | "rejected";
    trainerNotes?: string;
    assignedTrainerId?: string;
    reviewedAt?: string;
  }
): Promise<Assessment> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assessments")
    .update({
      status: updates.status,
      trainer_notes: updates.trainerNotes,
      assigned_trainer_id: updates.assignedTrainerId ?? null,
      reviewed_at: updates.reviewedAt ?? new Date().toISOString(),
    })
    .eq("id", id)
    .select().single();
  if (error) throw error;
  return mapAssessment(data);
}
```

### Step 4 — Filter assessments by trainer in the trainer clients page

Once assessments have `assigned_trainer_id` set, the trainer's client page can filter:

```tsx
// In src/app/trainer/clients/page.tsx:
const myAssessments = assessments.filter(a => a.assignedTrainerId === user.id);
```

This means trainers only see clients assigned to them, not all platform clients.

### Step 5 — Show assigned trainer in assessment list

In the assessment list, show a trainer badge for assessed items:

```tsx
{assessment.assignedTrainerId && (
  <span className="text-xs text-gray-500">
    Trainer: {trainers.find(t => t.id === assessment.assignedTrainerId)?.name ?? "Unknown"}
  </span>
)}
```

---

## Acceptance Criteria

- [ ] Admin assessment review UI shows a trainer selector dropdown.
- [ ] Selecting a trainer and clicking "Mark Reviewed" saves `assigned_trainer_id` to the assessment in Supabase.
- [ ] `reviewAssessment` in `src/lib/db/assessments.ts` accepts and saves `assignedTrainerId`.
- [ ] Trainer client list filters to only show customers whose assessment is assigned to that trainer.
- [ ] Assessment list shows the assigned trainer name badge.
- [ ] No TypeScript errors.
