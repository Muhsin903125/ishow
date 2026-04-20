# iShow Platform — Task List

> **Created:** 2026-04-20  
> Tasks are grouped by area and priority. Each task references the relevant file(s).

---

## Legend
- 🔴 **P1** — Critical: blocks core user workflow
- 🟠 **P2** — Important: significant quality-of-life improvement
- 🟡 **P3** — Enhancement: polish, scalability, or analytics
- 🐛 **Bug** — Existing defect in shipped code

---

## Bug Fixes

| # | Task | File(s) | Priority |
|---|---|---|---|
| B1 | Fix malformed JSX in customer dashboard — assessment-pending state block (lines ~157-183) mixes hero content with alert content, causing broken UI for users with pending assessment and no plan | `src/app/(customer)/dashboard/page.tsx` | 🐛 |
| B2 | Complete Assign Trainer in admin clients page — `onChange` handler selects a trainer but doesn't persist to database (just calls `setAssigningId(null)`) | `src/app/(admin)/admin/clients/page.tsx` line 166-170 | 🐛 |

---

## P1 — Critical Features

### Trainer: Session Management
| # | Task | File(s) |
|---|---|---|
| T1 | Add "Create Session" button and modal to trainer sessions page | `src/app/trainer/sessions/page.tsx` |
| T2 | Add "Edit Session" action to existing session items (trainer) | `src/app/trainer/sessions/page.tsx` |
| T3 | Add "Cancel Session" action to existing session items (trainer) | `src/app/trainer/sessions/page.tsx` |
| T4 | Add "Mark as Complete" action to past sessions (trainer) | `src/app/trainer/sessions/page.tsx` |
| T5 | Wire session create/edit/cancel/complete to `src/lib/db/sessions.ts` | `src/lib/db/sessions.ts` |

### Trainer: Program Authoring
| # | Task | File(s) |
|---|---|---|
| T6 | Build "Create Program" form on trainer programs page — week number, title, per-day exercises (pulled from exercise library) | `src/app/trainer/programs/page.tsx` |
| T7 | Build "Edit Program" form — same structure as create, pre-filled | `src/app/trainer/programs/page.tsx` |
| T8 | Build "Delete Program" action with confirmation | `src/app/trainer/programs/page.tsx` |
| T9 | Wire program CRUD to `src/lib/db/programs.ts` (functions already exist) | `src/lib/db/programs.ts` |
| T10 | Add exercise autocomplete/search in program form using exercise library | `src/app/trainer/programs/page.tsx` |

### Trainer: Payment Invoicing
| # | Task | File(s) |
|---|---|---|
| T11 | Create trainer payments page at `/trainer/payments` — list all payments for trainer's clients | Create `src/app/trainer/payments/page.tsx` |
| T12 | Add "Create Invoice" form (select client, amount, due date, description) | `src/app/trainer/payments/page.tsx` |
| T13 | Add "Mark as Paid" action on pending payments | `src/app/trainer/payments/page.tsx` |
| T14 | Add Payments link to TrainerSidebar | `src/components/TrainerSidebar.tsx` |
| T15 | Wire to `src/lib/db/payments.ts` (functions already exist) | `src/lib/db/payments.ts` |

---

## P2 — Important Improvements

### Auth
| # | Task | File(s) |
|---|---|---|
| A1 | Add "Continue with Google" button to login page — `loginWithGoogle()` already exists in AuthContext | `src/app/(auth)/login/page.tsx` |

### Customer: Self-Service
| # | Task | File(s) |
|---|---|---|
| C1 | Create customer profile/settings page at `/profile` — update name, phone, password | Create `src/app/(customer)/profile/page.tsx` |
| C2 | Add Profile link to CustomerSidebar | `src/components/CustomerSidebar.tsx` |
| C3 | Add "Cancel Session" action on upcoming sessions (customer) | `src/app/(customer)/sessions/page.tsx` |
| C4 | Add "Request Reschedule" action on upcoming sessions (sends notification to trainer) | `src/app/(customer)/sessions/page.tsx` |

### Trainer: Profile & UX
| # | Task | File(s) |
|---|---|---|
| TR1 | Create trainer profile/settings page at `/trainer/settings` — update name, phone, password | Create `src/app/trainer/settings/page.tsx` |
| TR2 | Add Settings link to TrainerSidebar | `src/components/TrainerSidebar.tsx` |
| TR3 | Add search/filter to trainer clients list — search by name/email, filter by plan status | `src/app/trainer/clients/page.tsx` |

### Admin: Completions
| # | Task | File(s) |
|---|---|---|
| AD1 | Complete Assign Trainer logic — on select, call `updateProfile()` or update plan `trainer_id` in Supabase | `src/app/(admin)/admin/clients/page.tsx` |
| AD2 | Create admin payments page at `/admin/payments` — list all payments, create, update status, delete | Create `src/app/(admin)/admin/payments/page.tsx` |
| AD3 | Add Payments link to AdminSidebar | `src/components/AdminSidebar.tsx` |

### Automation
| # | Task | File(s) |
|---|---|---|
| AU1 | Implement payment overdue auto-update — Supabase scheduled function or on-load check that flips `pending` → `overdue` when `due_date < today` | `src/lib/db/payments.ts` + Supabase function |
| AU2 | Send payment-due reminder email 3 days before due date | `src/lib/email/sender.ts` + Supabase scheduled function |

---

## P3 — Enhancements & Polish

### UX
| # | Task | File(s) |
|---|---|---|
| UX1 | Replace all page-load spinners with content-shaped skeleton loaders | All dashboard pages |
| UX2 | Add error boundaries to all dashboard pages | All dashboard pages |
| UX3 | Unify theme — admin is dark, trainer/customer is light; pick one or add user preference toggle | Global layout + theme config |
| UX4 | Add empty state illustrations (SVG) instead of plain text for empty lists | All list pages |

### Customer: Progress
| # | Task | File(s) |
|---|---|---|
| PR1 | Add body measurements input form to customer assessment or separate page | `src/app/(customer)/assessment/page.tsx` or new page |
| PR2 | Add progress chart (weight, body fat % over time) to customer dashboard | `src/app/(customer)/dashboard/page.tsx` |
| PR3 | Store measurement history in new `measurements` Supabase table | New Supabase table + `src/lib/db/measurements.ts` |

### Admin: Reporting
| # | Task | File(s) |
|---|---|---|
| RP1 | Create admin reports page at `/admin/reports` | Create `src/app/(admin)/admin/reports/page.tsx` |
| RP2 | Add monthly revenue chart (grouped by trainer) | `src/app/(admin)/admin/reports/page.tsx` |
| RP3 | Add session completion rate metric | `src/app/(admin)/admin/reports/page.tsx` |
| RP4 | Add client retention/churn metric | `src/app/(admin)/admin/reports/page.tsx` |
| RP5 | Add Reports link to AdminSidebar | `src/components/AdminSidebar.tsx` |

### Realtime & Notifications
| # | Task | File(s) |
|---|---|---|
| RT1 | Add in-app notification bell (header) using Supabase Realtime | New `src/components/NotificationBell.tsx` |
| RT2 | Trigger notification on: session booked, plan assigned, payment overdue | `src/lib/db/sessions.ts`, `src/lib/db/plans.ts`, `src/lib/db/payments.ts` |
| RT3 | Create `notifications` table in Supabase | New Supabase table |

### Tech Debt
| # | Task | File(s) |
|---|---|---|
| TD1 | Delete `src/lib/auth.ts` — legacy localStorage auth, entirely replaced by Supabase | `src/lib/auth.ts` |
| TD2 | Delete `src/lib/storage.ts` — legacy localStorage CRUD helpers | `src/lib/storage.ts` |
| TD3 | Delete `src/lib/mockData.ts` — seed data for localStorage mock; not needed with Supabase | `src/lib/mockData.ts` |
| TD4 | Remove demo account aliases from login page (trainer@ishow.com / john@example.com) after dev phase | `src/app/(auth)/login/page.tsx` |
| TD5 | Add audit_logs table to Supabase — track: who, what action, when, affected record | New Supabase table |
| TD6 | Gate trainer team creation — currently any trainer can create new trainers; should be admin-only | `src/app/trainer/team/page.tsx` |
| TD7 | Add `trainer_id` to `assessments` table usage — assigned_trainer_id column exists in schema but assignment flow is not wired | `src/app/(admin)/admin/assessments/page.tsx` |

---

## Summary Counts

| Category | Count |
|---|---|
| Bug fixes | 2 |
| P1 — Critical features | 15 |
| P2 — Important improvements | 13 |
| P3 — Enhancements | 20 |
| **Total** | **50** |
