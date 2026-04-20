# AU2 — Payment Due Reminder Email (3 Days Before Due Date)

**Category:** P2 — Important  
**Area:** Automation · Email  
**Files:** `src/lib/email/sender.ts`, Supabase Scheduled Function

---

## Why

Customers are not reminded when a payment is due. A 3-day advance reminder email reduces late payments and improves the customer experience.

---

## Implementation Steps

### Step 1 — Add a `payment-due-reminder` email template

In `src/lib/email/sender.ts`, add the new template to the `buildEmail` function (or wherever templates are defined):

```typescript
case "payment-due-reminder": {
  const { clientName, amount, dueDate, planName, siteUrl } = data as {
    clientName: string; amount: string; dueDate: string; planName: string; siteUrl: string;
  };
  return {
    subject: `Reminder: Payment of AED ${amount} due on ${dueDate}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
        <h2>Hi ${clientName},</h2>
        <p>This is a reminder that your payment for <strong>${planName}</strong> is due on <strong>${dueDate}</strong>.</p>
        <p style="font-size:24px;font-weight:bold;color:#f97316;">AED ${amount}</p>
        <p>Please ensure your payment is made on time to avoid any interruption to your training.</p>
        <p>If you have already paid, please ignore this email.</p>
        <a href="${siteUrl}/payments" style="display:inline-block;background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px;">
          View Payments
        </a>
      </div>
    `,
  };
}
```

### Step 2 — Create a Supabase Edge Function or Database Function to send reminders

**Option A: Supabase Edge Function (recommended)**

Create `supabase/functions/payment-reminders/index.ts`:

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  const targetDate = threeDaysFromNow.toISOString().split("T")[0];

  // Fetch payments due in 3 days
  const { data: payments } = await supabase
    .from("payments")
    .select("*, profiles!user_id(name, email), plans!plan_id(name)")
    .eq("status", "pending")
    .eq("due_date", targetDate);

  for (const payment of payments ?? []) {
    const clientEmail = payment.profiles?.email;
    const clientName = payment.profiles?.name ?? "Customer";
    const planName = payment.plans?.name ?? "Training Plan";

    if (!clientEmail) continue;

    await fetch(`${Deno.env.get("SITE_URL")}/api/email/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "payment-due-reminder",
        to: clientEmail,
        data: {
          clientName,
          amount: String(payment.amount),
          dueDate: payment.due_date,
          planName,
        },
      }),
    });
  }

  return new Response("Done", { status: 200 });
});
```

**Option B: pg_cron + DB trigger** — call the edge function via cron:

```sql
SELECT cron.schedule(
  'payment-due-reminders',
  '0 9 * * *',  -- daily at 9:00 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://<project>.supabase.co/functions/v1/payment-reminders',
    headers := '{"Authorization": "Bearer <anon-key>"}'::jsonb
  );
  $$
);
```

### Step 3 — Deploy the Edge Function

```bash
supabase functions deploy payment-reminders
```

Set environment variables:
```
SUPABASE_URL=<your-url>
SUPABASE_SERVICE_ROLE_KEY=<your-key>
SITE_URL=<your-site-url>
```

### Step 4 — Test manually

Trigger the function manually to verify emails are sent:

```bash
supabase functions invoke payment-reminders
```

Check that reminder emails arrive for payments due in exactly 3 days.

---

## Acceptance Criteria

- [ ] `payment-due-reminder` email template exists in `src/lib/email/sender.ts`.
- [ ] Edge function identifies all `pending` payments due in 3 days.
- [ ] For each matching payment, a reminder email is sent to the client.
- [ ] The function runs daily at a consistent time via cron/schedule.
- [ ] Emails include the amount, due date, and plan name.
- [ ] No duplicate emails for the same payment.
- [ ] No TypeScript/Deno errors in the edge function.
