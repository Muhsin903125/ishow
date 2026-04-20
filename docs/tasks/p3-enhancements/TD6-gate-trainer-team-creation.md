# TD6 — Gate Trainer Team Creation to Admin Only

**Category:** P3 — Tech Debt / Security  
**Area:** Trainer · Access Control  
**File:** `src/app/trainer/team/page.tsx`

---

## Why

The `/trainer/team` page allows any trainer to create new trainer accounts by entering name, email, password, and phone. This bypasses the admin invitation flow, skips email verification, and lets any trainer create peer accounts without admin oversight. Trainer creation should be admin-only.

---

## Implementation Steps

### Step 1 — Assess the current team page

Open `src/app/trainer/team/page.tsx` and read what the "Add Trainer" form does:
- Does it write to Supabase auth directly (using the anon key)?
- Does it call an API route?
- Does it write to localStorage?

If it creates a Supabase auth user using the anon key, it will fail with RLS anyway unless the user has the right permissions. Understand the current implementation first.

### Step 2 — Option A: Hide the "Add Trainer" form for trainers (show only to admins)

If the page is accessible to both trainers and admins, conditionally render the create form:

```tsx
const { user } = useAuth();

// Only show the Add Trainer form to admins
const canCreateTrainer = user?.role === "admin";

{canCreateTrainer && (
  <div className="add-trainer-form">
    {/* existing form */}
  </div>
)}
```

The page itself (listing team members) is still useful for trainers to see who is on their team.

### Step 3 — Option B: Redirect trainers to use the admin trainer invitation flow

Add a message for trainers:

```tsx
{!canCreateTrainer && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-6">
    <p className="text-yellow-800 text-sm font-medium">
      New trainers must be invited by an admin.
      Please contact your platform administrator to add a new team member.
    </p>
  </div>
)}
```

### Step 4 — Remove password field from any trainer-creation form

The current team page reportedly has a "password" field for creating trainers. This is insecure — trainers should set their own password via the invitation email flow (which already exists in `/api/admin/invite-trainer`). Remove the password field from any trainer-creation UI.

### Step 5 — If trainers can access `/admin/trainers` — prevent it

Verify that `src/app/(admin)/admin/trainers/page.tsx` has a role check:

```tsx
if (user.role !== "admin") { router.push("/trainer/dashboard"); return; }
```

Confirm this is already in place.

---

## Acceptance Criteria

- [ ] The "Add Trainer" form on the team page is hidden for `role === "trainer"`.
- [ ] Admin users can still use the form (or are redirected to the proper admin trainer invitation page).
- [ ] Trainers see a clear message explaining they must contact an admin to add new team members.
- [ ] No password field exists in any trainer-facing trainer-creation form.
- [ ] The admin trainer page properly guards against non-admin access.
- [ ] No TypeScript errors.
