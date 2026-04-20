# RT2 — Wire Notification Triggers to Key Platform Events

**Category:** P3 — Enhancement  
**Area:** Realtime Notifications  
**Files:** `src/lib/db/sessions.ts`, `src/lib/db/plans.ts`, `src/lib/db/payments.ts`  
**Depends on:** RT1 (`notifications` table and `NotificationBell` component)

---

## Why

The notification bell (RT1) only shows notifications if something creates them. This task wires the platform's key events to notification creation so users are informed in real-time.

---

## Implementation Steps

### Step 1 — Create a `createNotification` helper in `src/lib/db/notifications.ts`

Add to the existing file:

```typescript
// Use the server-side Supabase client for this (called from API routes or server actions)
// OR use the service role key if calling from an Edge Function
export async function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  href?: string;
}): Promise<void> {
  const supabase = createClient(); // use service-role client if needed
  await supabase.from("notifications").insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    href: input.href ?? null,
  });
}
```

### Step 2 — Trigger notification when session is created (trainer or admin)

In `src/lib/db/sessions.ts`, after a successful `createSession`:

```typescript
// After session is created:
await createNotification({
  userId: input.userId,               // the customer
  type: "session_booked",
  title: "Session Booked",
  body: `Your session "${input.title}" is scheduled for ${input.scheduledDate} at ${input.scheduledTime}.`,
  href: "/sessions",
});
```

### Step 3 — Trigger notification when plan is assigned

In `src/lib/db/plans.ts`, after a successful `createPlan`:

```typescript
await createNotification({
  userId: input.userId,
  type: "plan_assigned",
  title: "Training Plan Assigned",
  body: `Your trainer has assigned the "${input.name}" plan. Check it out!`,
  href: "/my-plan",
});
```

### Step 4 — Trigger notification when payment is created (invoice)

In `src/lib/db/payments.ts`, after a successful `createPayment`:

```typescript
await createNotification({
  userId: input.userId,
  type: "payment_due",
  title: "New Payment Due",
  body: `AED ${input.amount} is due on ${input.dueDate}.`,
  href: "/payments",
});
```

### Step 5 — Trigger notification when assessment is reviewed

In the admin assessments page (`src/app/(admin)/admin/assessments/page.tsx`), after `reviewAssessment`:

```typescript
await createNotification({
  userId: assessment.userId,
  type: "assessment_reviewed",
  title: "Assessment Reviewed",
  body: "Your fitness assessment has been reviewed. Your trainer will be in touch soon.",
  href: "/dashboard",
});
```

### Step 6 — Trigger notification for overdue payments (from AU1)

In the overdue detection logic (AU1), when a payment is flipped to overdue, create a notification:

```typescript
await createNotification({
  userId: payment.userId,
  type: "payment_overdue",
  title: "Payment Overdue",
  body: `Your payment of AED ${payment.amount} was due on ${payment.dueDate}.`,
  href: "/payments",
});
```

---

## Notification Types Summary

| Event | type | Recipient | href |
|---|---|---|---|
| Session booked | `session_booked` | Customer | `/sessions` |
| Session cancelled | `session_cancelled` | Customer | `/sessions` |
| Plan assigned | `plan_assigned` | Customer | `/my-plan` |
| Assessment reviewed | `assessment_reviewed` | Customer | `/dashboard` |
| Payment invoice created | `payment_due` | Customer | `/payments` |
| Payment overdue | `payment_overdue` | Customer | `/payments` |

---

## Acceptance Criteria

- [ ] `createNotification` helper exists in `src/lib/db/notifications.ts`.
- [ ] Booking a session (trainer or admin) creates a notification for the customer.
- [ ] Assigning a plan creates a notification for the customer.
- [ ] Creating a payment invoice creates a notification for the customer.
- [ ] Reviewing an assessment creates a notification for the customer.
- [ ] Notifications appear in real-time in the bell dropdown (via RT1 Supabase subscription).
- [ ] No TypeScript errors.
