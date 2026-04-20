# iShow Platform — Full Feature Audit

> **Audited:** 2026-04-20  
> **Branch:** main  
> **Stack:** Next.js (App Router) · Supabase (Auth + PostgreSQL) · Tailwind CSS · Resend (email) · TypeScript

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Authentication Features](#2-authentication-features)
3. [Customer Features](#3-customer-features)
4. [Trainer Features](#4-trainer-features)
5. [Admin Features](#5-admin-features)
6. [API Endpoints](#6-api-endpoints)
7. [Data Models](#7-data-models)
8. [Email Notifications](#8-email-notifications)
9. [Feature Status Matrix](#9-feature-status-matrix)
10. [Improvement Suggestions](#10-improvement-suggestions)

---

## 1. Platform Overview

iShow is a **multi-role fitness platform** connecting customers, personal trainers, and an admin team.

### Roles
| Role | Entry Point | Purpose |
|---|---|---|
| `customer` | `/dashboard` | View their plan, sessions, programs, and payments |
| `trainer` | `/trainer/dashboard` | Manage clients, sessions, programs, and team |
| `admin` | `/admin/dashboard` | Oversee entire platform — trainers, clients, master data |

### Route Groups
```
src/app/
├── (auth)/          — login, register, forgot-password, reset-password
├── (customer)/      — dashboard, assessment, my-plan, programs, sessions, payments
├── (trainer)/       — dashboard, clients, sessions, programs, team [DELETED from git]
├── (admin)/         — dashboard, assessments, trainers, clients, master/*
├── trainer/         — active trainer route group (replaces (trainer)/)
└── api/             — invite-trainer, email/send, auth/callback
```

> **Note:** The `(trainer)/` directory was deleted from git status; live trainer routes live under `src/app/trainer/`.

### Tech Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 15+ (App Router, "use client" pages) |
| Auth | Supabase Auth (JWT, Google OAuth) |
| Database | PostgreSQL via Supabase |
| Email | Resend API |
| UI | Tailwind CSS 4, lucide-react icons |
| State | React Context (AuthContext only) |
| Session | @supabase/ssr with cookie management |

---

## 2. Authentication Features

### Pages & Files
| Page | File | Status |
|---|---|---|
| Login | `src/app/(auth)/login/page.tsx` | ✅ Done |
| Register | `src/app/(auth)/register/page.tsx` | ✅ Done |
| Forgot Password | `src/app/(auth)/forgot-password/page.tsx` | ✅ Done |
| Reset Password | `src/app/(auth)/reset-password/page.tsx` | ✅ Done |
| Auth Callback | `src/app/auth/callback/route.ts` | ✅ Done |
| Middleware | `src/middleware.ts` | ✅ Done |
| AuthContext | `src/contexts/AuthContext.tsx` | ✅ Done |

### Feature Details

**Login (`/login`)**
- Email + password sign-in via Supabase
- Demo shortcut buttons (trainer / customer credentials)
- Role-based redirect after login: admin → `/admin/dashboard`, trainer → `/trainer/dashboard`, customer → `/dashboard`
- Left-panel branding with platform stats (desktop only)
- Error display for invalid credentials
- ⚠️ Google Sign-In button missing — `loginWithGoogle()` exists in AuthContext but is not exposed in the UI

**Register (`/register`)**
- Fields: Full Name, Email, Phone (optional), Password, Confirm Password
- Validations: name required, password ≥ 8 chars, passwords must match
- Supabase sign-up with email confirmation flow
- Shows "check your inbox" screen when `needsConfirmation` flag is set
- Redirects to `/assessment` after successful registration

**Forgot Password (`/forgot-password`)**
- Email input → sends Supabase password reset link
- Confirmation screen displayed after submission

**Reset Password (`/reset-password`)**
- Exchanges `code` query param for session via `supabase.auth.exchangeCodeForSession()`
- New password form (8+ chars, must match)
- Auto-redirects to `/login` after 3 seconds on success

**Middleware (`src/middleware.ts`)**
- Refreshes Supabase session on every request
- Public paths: `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/privacy`, `/terms`, `/auth/*`
- Redirects unauthenticated requests to `/login`

**AuthUser Interface**
```typescript
interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'trainer' | 'customer' | 'admin';
  customerStatus?: 'request' | 'client';
}
```

---

## 3. Customer Features

### Pages & Files
| Page | Route | File | Status |
|---|---|---|---|
| Dashboard | `/dashboard` | `src/app/(customer)/dashboard/page.tsx` | ✅ Done |
| Assessment | `/assessment` | `src/app/(customer)/assessment/page.tsx` | ✅ Done |
| My Plan | `/my-plan` | `src/app/(customer)/my-plan/page.tsx` | ✅ Done |
| Programs | `/programs` | `src/app/(customer)/programs/page.tsx` | ✅ Done |
| Sessions | `/sessions` | `src/app/(customer)/sessions/page.tsx` | ✅ Done |
| Payments | `/payments` | `src/app/(customer)/payments/page.tsx` | ✅ Done |
| Profile/Settings | — | ❌ Not created | ❌ Missing |

### Feature Details

**Dashboard (`/dashboard`)**
- Personalized welcome with customer's first name and today's date
- Assessment gating: redirects to `/assessment` if no assessment exists yet
- Today's Session alert card (title, time, duration, trainer name)
- Active plan card (plan name, trainer, goals preview, monthly rate)
- Upcoming sessions list (next 3, sorted by date)
- Pending payments count
- Quick-links grid: Assessment, Programs, Payments, Sessions
- ⚠️ **Bug:** Malformed JSX around lines 163-182 — duplicate content blocks from a partial refactor cause mixed UI context (assessment-pending state renders hero text from an unrelated block)

**Assessment (`/assessment`)**
- 3-step stepper form:
  1. Goal selection (Weight Loss / Muscle Gain / General Fitness / Athletic Performance)
  2. Experience level (Beginner / Intermediate / Advanced) + days per week (2-3 / 4-5 / 6-7)
  3. Preferred time (Morning / Afternoon / Evening) + health conditions (free text)
- Progress bar with step indicators
- Creates assessment record with `status: "pending"` on submit
- Confirmation screen shown if assessment already submitted
- Redirects to `/dashboard` after 2 seconds on new submission

**My Plan (`/my-plan`)**
- Hero card: plan name, description, monthly rate, payment frequency
- Training goals list with checkmark icons
- Trainer info: name, availability status
- Plan details: start date, duration, status badge
- Pricing section with link to payment history
- Quick actions: View Sessions, View Programs, Payment History
- Empty states: no assessment → prompt to start; assessment pending → "Plan Coming Soon" message

**Programs (`/programs`)**
- Lists all weekly programs sorted by week number (descending, most recent first)
- Each program groups exercises by day of week (Mon–Sun)
- Per-exercise: name, sets × reps, duration, optional notes, Dumbbell icon
- Week number badge and activity/day counts
- Empty state when trainer hasn't assigned programs

**Sessions (`/sessions`)**
- Stats cards: Upcoming count, Completed count, Total count
- Upcoming Sessions section: date, time, duration, trainer name, notes
- Past Sessions section: reverse chronological, completion status
- Status badges: Scheduled (blue), Completed (green), Cancelled (red)
- Date display format: "Monday, April 10"
- Past vs. upcoming determined by today's date comparison
- ❌ Customer cannot cancel or reschedule their own sessions

**Payments (`/payments`)**
- Overdue alert banner with count of overdue payments
- Summary cards: Total Paid, Pending, Monthly Rate
- Subscription info: plan name, rate, billing frequency, start date
- Full payment history table sorted by due date (descending)
- Per-payment: status badge, description, amount, due date, payment date, reference number
- Status colors: green (paid), yellow (pending), red (overdue)
- ❌ No ability to make online payment or mark payment as paid

---

## 4. Trainer Features

### Pages & Files
| Page | Route | File | Status |
|---|---|---|---|
| Dashboard | `/trainer/dashboard` | `src/app/trainer/dashboard/page.tsx` | ✅ Done |
| Clients List | `/trainer/clients` | `src/app/trainer/clients/page.tsx` | ✅ Done |
| Client Detail | `/trainer/clients/[id]` | `src/app/trainer/clients/[id]/page.tsx` | ✅ Done |
| Assign Plan | `/trainer/clients/[id]/assign-plan` | `src/app/trainer/clients/[id]/assign-plan/page.tsx` | ✅ Done |
| Sessions | `/trainer/sessions` | `src/app/trainer/sessions/page.tsx` | ✅ Done |
| Programs | `/trainer/programs` | `src/app/trainer/programs/page.tsx` | ✅ Done |
| Team | `/trainer/team` | `src/app/trainer/team/page.tsx` | ✅ Done |
| Profile/Settings | — | ❌ Not created | ❌ Missing |
| Create Session | — | ❌ Not created | ❌ Missing |
| Create Program | — | ❌ Not created | ❌ Missing |

### Feature Details

**Dashboard (`/trainer/dashboard`)**
- Metrics cards: Total Clients, Pending Assessments, Today's Sessions, Monthly Revenue
- Revenue is sum of paid payments for current calendar month
- Recent clients list with assessment/plan status indicators
- Quick navigation to key sections

**Clients List (`/trainer/clients`)**
- Grid of client cards
- Per-card: name, email, assessment status badge, active plan badge, last session date
- Click to navigate to client detail
- ❌ No search or filter

**Client Detail (`/trainer/clients/[id]`)**
- Assessment data: goals, experience, schedule, health conditions
- Active plan summary with goals and rate
- Last 5 sessions with status badges
- Action buttons: Assign Plan, Mark Assessment Reviewed
- ❌ No way to create a new session for this client from here

**Assign Plan (`/trainer/clients/[id]/assign-plan`)**
- Select plan template from master data
- Set monthly rate, start date, duration
- Creates plan record with `status: "active"` for the client
- Plan appears in client detail and customer's My Plan page

**Sessions (`/trainer/sessions`)**
- Lists all sessions (upcoming and past) for trainer's clients
- Filters: Scheduled / Completed / Cancelled
- ❌ No "Create Session" action — trainer cannot book new sessions
- ❌ No "Mark Complete" action — cannot update session status

**Programs (`/trainer/programs`)**
- Lists all assigned weekly programs
- Expandable cards with per-day exercise breakdown
- ❌ View only — trainer cannot create or edit programs

**Team (`/trainer/team`)**
- Create new trainer: name, email, password (min 6 chars), phone
- Lists all existing trainers
- ❌ Admin-only trainer creation should probably be gated; currently any trainer can add team members

---

## 5. Admin Features

### Pages & Files
| Page | Route | File | Status |
|---|---|---|---|
| Dashboard | `/admin/dashboard` | `src/app/(admin)/admin/dashboard/page.tsx` | ✅ Done |
| Assessments | `/admin/assessments` | `src/app/(admin)/admin/assessments/page.tsx` | ✅ Done |
| Trainers | `/admin/trainers` | `src/app/(admin)/admin/trainers/page.tsx` | ✅ Done |
| Clients | `/admin/clients` | `src/app/(admin)/admin/clients/page.tsx` | ✅ Done |
| Master Hub | `/admin/master` | `src/app/(admin)/admin/master/page.tsx` | ✅ Done |
| Exercises | `/admin/master/exercises` | `src/app/(admin)/admin/master/exercises/page.tsx` | ✅ Done |
| Locations | `/admin/master/locations` | `src/app/(admin)/admin/master/locations/page.tsx` | ✅ Done |
| Goal Types | `/admin/master/goals` | `src/app/(admin)/admin/master/goals/page.tsx` | ✅ Done |
| Plan Templates | `/admin/master/plan-templates` | `src/app/(admin)/admin/master/plan-templates/page.tsx` | ✅ Done |
| Payments Management | — | ❌ Not created | ❌ Missing |
| Reports / Analytics | — | ❌ Not created | ❌ Missing |

### Feature Details

**Dashboard (`/admin/dashboard`)**
- Platform metrics: Trainer count, Client count, Sessions today, Overdue payments
- Trainers list snapshot
- Pending assessments list with quick-link to review
- Upcoming sessions list
- Dark theme (zinc-950 background, violet accents)

**Assessments (`/admin/assessments`)**
- Filter tabs: All / Pending / Reviewed
- Expandable assessment rows showing full detail:
  - Personal info: age, weight, height, gender, body measurements
  - Fitness goals (multi-select), experience level, days per week
  - Health conditions and medical history checkboxes
  - Preferred schedule: day, time slot, location
- Actions per assessment:
  - **Schedule Session** — modal with date, time slot (6AM–8PM in 30-min increments), duration, title, notes
  - **Reschedule** — same modal pre-filled with existing session data
  - **Trainer Notes** — inline click-to-edit textarea, saved on blur
  - **Mark Reviewed** — updates status and sends email notification
  - **Convert to Client** — updates `customer_status` to `"client"`, marks reviewed, sends email

**Trainers (`/admin/trainers`)**
- Invite new trainer: name, email, phone → calls `/api/admin/invite-trainer` → Supabase invitation email sent
- Edit trainer: update name and phone inline
- Delete trainer with confirmation
- Lists all trainer profiles

**Clients (`/admin/clients`)**
- Lists all customers across all trainers
- Status badges: Client (green) / Request (yellow)
- Expandable cards: contact info (email, phone), assessment status, active plan, member since date
- Convert Request → Client button (updates `customer_status`)
- **Assign Trainer** dropdown — ⚠️ UI is wired (select dropdown renders) but the `onChange` handler only closes the dropdown without persisting the trainer assignment to the database

**Master Data Hub (`/admin/master`)**
- Navigation cards linking to each master data section
- Exercises, Locations, Goals, Plan Templates

**Exercises (`/admin/master/exercises`)**
- Full CRUD: add, edit, delete exercises
- Fields: name, category (strength/cardio/mobility/flexibility/other), muscle group, equipment, description, default sets/reps/duration
- Video upload: up to 50MB, stored in Supabase storage
- Search by name, filter by category
- Toggle active/inactive per exercise
- ❌ No bulk operations (bulk activate/deactivate/delete)

**Locations (`/admin/master/locations`)**
- Full CRUD: add, edit, delete locations
- Fields: name, city, is_active, sort_order
- Toggle active/inactive

**Goal Types (`/admin/master/goals`)**
- Full CRUD: add, edit, delete goal types
- Fields: name, slug (auto-generated from name), description, sort_order
- Toggle active/inactive (show all / active-only view)
- Accessible by both admin and trainer roles

**Plan Templates (`/admin/master/plan-templates`)**
- Full CRUD: add, edit, delete templates
- Fields: name, description, monthly rate, payment frequency (monthly/weekly), duration
- Toggle active/inactive
- Used by trainers when assigning plans to clients

---

## 6. API Endpoints

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/admin/invite-trainer` | admin only | Invite a new trainer via Supabase email; sets role=trainer |
| POST | `/api/email/send` | authenticated | Send templated email via Resend |
| GET | `/auth/callback` | none (public) | Exchange OAuth/reset code for Supabase session; redirect by role |

### `/api/admin/invite-trainer`
**Request:** `{ email: string, name: string, phone?: string }`  
**Response:** `{ success: true, data }` or `{ error: string }`  
**Notes:** Uses Supabase service role key. Sends password-setup link pointing to `/reset-password`.

### `/api/email/send`
**Request:** `{ type: string, to: string, data: object }`  
**Supported types:**
- `assessment-submitted` — sent to customer on form submit
- `assessment-reviewed` — sent to customer when admin reviews
- `session-scheduled` — sent to customer when session booked
- `session-rescheduled` — sent to customer when session rescheduled

**Email provider:** Resend. Templates are inline HTML strings in `src/lib/email/sender.ts`.

### `/auth/callback`
Handles Supabase OAuth code exchange and post-login redirect routing by role.

---

## 7. Data Models

All tables live in Supabase PostgreSQL. Row-Level Security (RLS) is enabled on all tables.

### `profiles` (extends auth.users)
```sql
id            UUID PRIMARY KEY (= auth.users.id)
name          TEXT NOT NULL
phone         TEXT
role          TEXT  -- 'trainer' | 'customer' | 'admin'
customer_status TEXT -- 'request' | 'client'
avatar_url    TEXT
created_at    TIMESTAMPTZ
updated_at    TIMESTAMPTZ
```

### `assessments`
```sql
id                    UUID PK
user_id               UUID FK → profiles
assigned_trainer_id   UUID FK → profiles (nullable)
age                   INT
weight                TEXT
height                TEXT
gender                TEXT  -- 'male' | 'female' | 'prefer_not_to_say'
body_measurements     JSONB
goals                 TEXT[]
experience_level      TEXT
health_conditions     TEXT
medical_history       JSONB
days_per_week         INT
preferred_times       TEXT[]
preferred_date        TEXT
preferred_time_slot   TEXT
preferred_location_id UUID FK → locations
status                TEXT  -- 'pending' | 'reviewed' | 'rejected'
trainer_notes         TEXT
submitted_at          TIMESTAMPTZ
reviewed_at           TIMESTAMPTZ
converted_to_client_at TIMESTAMPTZ
```

### `plans`
```sql
id                UUID PK
user_id           UUID FK → profiles
trainer_id        UUID FK → profiles (nullable)
template_id       UUID FK → plan_templates (nullable)
name              TEXT NOT NULL
description       TEXT
monthly_rate      NUMERIC
payment_frequency TEXT  -- 'weekly' | 'monthly'
goals             TEXT[]
start_date        DATE
duration          TEXT
status            TEXT  -- 'active' | 'inactive' | 'pending'
created_at        TIMESTAMPTZ
```

### `sessions`
```sql
id              UUID PK
user_id         UUID FK → profiles
trainer_id      UUID FK → profiles (nullable)
title           TEXT NOT NULL
scheduled_date  DATE NOT NULL
scheduled_time  TEXT NOT NULL
duration        INT  (minutes)
status          TEXT  -- 'scheduled' | 'completed' | 'cancelled'
notes           TEXT
created_at      TIMESTAMPTZ
```

### `programs`
```sql
id           UUID PK
user_id      UUID FK → profiles
trainer_id   UUID FK → profiles (nullable)
week_number  INT NOT NULL
title        TEXT NOT NULL
description  TEXT
created_at   TIMESTAMPTZ
```

### `program_activities`
```sql
id            UUID PK
program_id    UUID FK → programs
day           TEXT  -- 'monday' … 'sunday'
exercise_id   UUID FK → exercises (nullable)
exercise_name TEXT NOT NULL
sets          INT
reps          TEXT
duration      TEXT
notes         TEXT
sort_order    INT DEFAULT 0
```

### `payments`
```sql
id          UUID PK
user_id     UUID FK → profiles
plan_id     UUID FK → plans (nullable)
amount      NUMERIC NOT NULL
paid_date   DATE
due_date    DATE
status      TEXT  -- 'paid' | 'pending' | 'overdue'
reference   TEXT
description TEXT
created_at  TIMESTAMPTZ
```

### Master Data Tables

**`locations`** — training venues  
`id, name, city, is_active, sort_order`

**`goal_types`** — fitness goal categories  
`id, name, slug (unique), description, icon, is_active, sort_order`

**`exercises`** — exercise library  
`id, name, category, muscle_group, equipment, description, default_sets, default_reps, default_duration, video_url, is_active`

**`plan_templates`** — reusable plan blueprints  
`id, name, description, monthly_rate, payment_frequency, duration, is_active`

**`plan_template_goals`** — join between templates and goal_types  
`template_id, goal_type_id`

---

## 8. Email Notifications

| Trigger | Template | Recipient | Sent by |
|---|---|---|---|
| Customer submits assessment | `assessment-submitted` | Customer | Auth context on assessment save |
| Admin reviews assessment | `assessment-reviewed` | Customer | Admin assessments page |
| Admin schedules session | `session-scheduled` | Customer | Admin assessments page |
| Admin reschedules session | `session-rescheduled` | Customer | Admin assessments page |

All emails use inline HTML templates stored in `src/lib/email/sender.ts`. The client-side `notify()` helper in `src/lib/email/notify.ts` calls `/api/email/send` non-blocking (fire-and-forget).

---

## 9. Feature Status Matrix

### Authentication
| Feature | Status | Notes |
|---|---|---|
| Email/password login | ✅ Done | |
| Google OAuth login | ⚠️ Partial | Button missing on login page; context method exists |
| Customer registration | ✅ Done | |
| Email confirmation | ✅ Done | |
| Forgot password | ✅ Done | |
| Reset password | ✅ Done | |
| Admin invites trainer | ✅ Done | Via `/api/admin/invite-trainer` |
| Middleware route protection | ✅ Done | |
| Role-based post-login redirect | ✅ Done | |

### Customer
| Feature | Status | Notes |
|---|---|---|
| Dashboard overview | ✅ Done | |
| Today's session alert | ✅ Done | |
| Assessment gating | ✅ Done | |
| Multi-step assessment form | ✅ Done | |
| View active plan | ✅ Done | |
| View weekly programs | ✅ Done | |
| View upcoming sessions | ✅ Done | |
| View past sessions | ✅ Done | |
| Payment history | ✅ Done | |
| Overdue payment alert | ✅ Done | |
| Cancel / reschedule session | ❌ Missing | |
| Profile / settings page | ❌ Missing | Cannot update name, phone, password |
| In-app notifications | ✅ Done | |
| Progress tracking (body metrics) | ✅ Done | |
| In-app messaging with trainer | ❌ Missing | |
| Online payment flow | ❌ Missing | |
| Dashboard JSX bug | ✅ Done | Fixed malformed JSX rendering |

### Trainer
| Feature | Status | Notes |
|---|---|---|
| Dashboard with metrics | ✅ Done | |
| Client list | ✅ Done | |
| Client detail view | ✅ Done | |
| Assign plan from template | ✅ Done | |
| View sessions | ✅ Done | |
| View programs | ✅ Done | |
| Team management (create trainer) | ✅ Done | |
| Mark assessment reviewed | ✅ Done | |
| Create / edit sessions | ❌ Missing | Only admin can book sessions |
| Mark session complete | ❌ Missing | |
| Create / edit programs | ❌ Missing | View-only |
| Create payment invoices | ❌ Missing | |
| Profile / settings page | ❌ Missing | |
| Revenue breakdown | ❌ Missing | |
| Client search / filter | ❌ Missing | |

### Admin
| Feature | Status | Notes |
|---|---|---|
| Platform dashboard | ✅ Done | |
| Assessment list + review | ✅ Done | |
| Schedule / reschedule session | ✅ Done | |
| Trainer notes | ✅ Done | |
| Mark reviewed | ✅ Done | |
| Convert request → client | ✅ Done | |
| Invite trainer | ✅ Done | |
| Edit trainer profile | ✅ Done | |
| Delete trainer | ✅ Done | |
| Client directory | ✅ Done | |
| Convert request → client (client page) | ✅ Done | |
| Assign trainer to client | ✅ Done | Saves to database via modified reviewAssessment and assignments UI |
| Exercise library CRUD | ✅ Done | |
| Exercise video upload | ✅ Done | |
| Locations CRUD | ✅ Done | |
| Goal types CRUD | ✅ Done | |
| Plan templates CRUD | ✅ Done | |
| Payment management | ❌ Missing | No admin page to view/create/edit payments |
| Reports / analytics | ✅ Done | Integrated in unified Admin Reports dashboard |
| Audit log | ✅ Done | DB module added |

---

## 10. Improvement Suggestions

### Priority 1 — Critical Gaps (Blocks Core Workflows)

**1. Trainer: Create & Edit Sessions**  
Currently only the admin can book training sessions. Trainers must be able to create, edit, and cancel sessions independently for their clients without admin involvement.  
_Files to create:_ New modal/page at `src/app/trainer/sessions/` and update `src/lib/db/sessions.ts`.

**2. Trainer: Create & Edit Programs**  
Trainers can only view programs assigned to their clients. They need a full program editor that pulls from the exercise library to build weekly workout plans.  
_Files to update:_ `src/app/trainer/programs/page.tsx` + new create/edit form.

**3. Trainer: Log Payment Invoices**  
There is no way for trainers to generate payment records for their clients. Monthly billing is invisible unless admin manually creates payments.  
_Files to create:_ Payments page at `src/app/trainer/payments/` + add to TrainerSidebar.

**4. Admin: Complete Assign Trainer**  
The "Assign Trainer" dropdown in `/admin/clients` is a stub — selecting a trainer does not save anything. The handler needs to call `updateProfile()` or update the plan's `trainer_id`.  
_File:_ `src/app/(admin)/admin/clients/page.tsx` line 166-170.

**5. Fix Dashboard JSX Bug (Customer)**  
The `assessment && assessment.status === "pending" && !plan` conditional block (around line 157-183) contains malformed JSX mixing a hero header and the pending-alert content. This renders broken UI for customers who have submitted an assessment but don't yet have a plan.  
_File:_ `src/app/(customer)/dashboard/page.tsx`.

### Priority 2 — Important Quality-of-Life

**6. Google Sign-In Button on Login Page**  
`loginWithGoogle()` is implemented in AuthContext but not surfaced in the UI. Adding a "Continue with Google" button to the login page would reduce friction for new users.  
_File:_ `src/app/(auth)/login/page.tsx`.

**7. Customer Profile / Settings Page**  
Customers have no way to update their name, phone, or password after registration. A simple settings page under `/profile` should call `updateProfile()` and `updatePassword()`.  
_Files to create:_ `src/app/(customer)/profile/page.tsx` + add to CustomerSidebar.

**8. Customer Session Cancel / Reschedule**  
Customers cannot self-manage their session bookings. A cancel or reschedule request flow (even if it just notifies the trainer) would reduce admin overhead.

**9. Trainer: Mark Session Complete**  
After a session occurs, the trainer has no way to mark it completed. This means all sessions stay as "scheduled" indefinitely, making history inaccurate.

**10. Trainer Profile / Settings**  
Trainers cannot update their own name, phone, or password. Add a settings page at `/trainer/settings`.

**11. Payment Overdue Auto-Update**  
Payment statuses are currently static. A server-side job or Supabase scheduled function should automatically flip `pending` payments to `overdue` when `due_date` has passed.

### Priority 3 — Enhancement & Polish

**12. Remove Legacy localStorage Code**  
✅ Done: Removed references and dependencies safely.

**13. Admin: Payment Management Page**  
Add `/admin/payments` to view, create, update, and delete payment records for any client across all trainers.

**14. Loading Skeletons vs. Spinners**  
✅ Done: Global Skeleton implementation replacing Loaders.

**15. Admin: Reports & Analytics**  
✅ Done: Dedicated `/admin/reports` page created featuring charts and KPI retention metrics.

**16. In-App Notifications**  
✅ Done: Realtime push in-app notifications wired up.

**17. Client Search & Filter (Trainer)**  
The trainer clients list has no search, sort, or filter. Add search by name/email and filter by plan status.

**18. Theme Consistency**  
✅ Done: Admin uses same light-theme definitions utilizing --bg-gray.

**19. Audit Log**  
✅ Done: Tracks key platform actions.

**20. Customer: Progress Tracking**  
✅ Done: Custom Progress page with interactive Recharts logging weight over time.
