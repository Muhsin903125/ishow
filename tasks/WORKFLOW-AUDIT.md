# iShow Workflow Audit Report

> Updated: 2026-04-23
> Based on source inspection in this repository and structure comparison with `D:\MuhsinStuff\projects\workforceos`

## Current Repo Metrics

| Area | Count |
|---|---:|
| Active pages in `src/pages` | 45 |
| Active API routes in `src/pages/api` | 17 |
| Legacy files in `src/app_old` | 47 |
| DB helper modules in `src/lib/db` | 11 |
| Supabase migrations | 10 |

## Executive Findings

### 1. Router / Architecture

- The repo is running on the Pages Router.
- `src/pages` is now documented as the active app surface.
- `src/app_old` is now marked as legacy/reference-only and should not receive new work.

### 2. API Surface

- The repo now has a real same-origin API layer for assessments, sessions, programs, payments, notifications, CMS, leads, and email.
- Client DB helpers are now read-focused for active flows, with sensitive mutations routed through APIs.

### 3. Auth / Session

- Demo auth is now gated to explicit non-production flags.
- `src/proxy.ts` no longer treats demo state as a production trust boundary.
- Login UI only exposes demo shortcuts when demo auth is explicitly enabled.

### 4. Security / Audit

- Shared request throttling, validation, and server-side audit helpers now exist under `src/lib/server`.
- Email and admin mutation endpoints are rate-limited.
- Active audit writes for API mutations now flow through server-only helpers.
- Storage access still needs launch-time review, especially around public asset choices such as `exercise-videos`.

### 5. UI / Shell

- `DashboardLayout.tsx` remains the active shared shell for customer, trainer, and admin workspaces.
- The landing page now has deterministic section anchors and an intentional warm light treatment.
- Supporting public SEO/trust pages exist for `about`, `contact`, `faq`, and `content`.

## Workflow Review

### Workflow 1: Login and Role Redirect

| Step | Status | Notes |
|---|---|---|
| Email/password login | Done | Supabase login remains primary; demo path is gated |
| Google login | Done | UI button exists and calls OAuth |
| Role redirect | Done | Redirects to customer, trainer, or admin destination |
| Protected routes | Done | Production path depends on Supabase session trust |

### Workflow 2: Customer Assessment to Dashboard

| Step | Status | Notes |
|---|---|---|
| Register / onboarding | Done | Supabase signup flow exists |
| Assessment capture | Done | Submission now runs through API route |
| Dashboard load | Done | Dashboard aggregates assessment, plan, sessions, payments |
| Server-backed enforcement | Done | Sensitive assessment mutations use same-origin APIs |

### Workflow 3: Trainer Operations

| Step | Status | Notes |
|---|---|---|
| View clients | Done | Page exists |
| Manage sessions | Partial | API routes exist; UX refinement still remains |
| Manage programs | Partial | API routes exist; builder workflow still needs polish |
| Payments | Partial | API routes exist; reporting and lifecycle depth still remains |

### Workflow 4: Admin Operations

| Step | Status | Notes |
|---|---|---|
| Assessments review | Done | Review mutations now flow through API routes |
| Trainer/client management | Partial | Core surfaces exist; broader reporting remains |
| Leads management | Done | CRUD, status updates, and client conversion exist |
| CMS / public content | Done | Admin CMS now backs landing and public support pages |

### Workflow 5: Email / Notifications

| Step | Status | Notes |
|---|---|---|
| Send email API | Done | Authenticated, throttled, template-validated, audit-logged |
| In-app notifications | Partial | API mutation layer exists; broader consolidation still remains |
| Audit trail | Done | Active API flows use server-only audit helpers |

## Highest Priority Remaining Risks

1. There is still no automated test harness for core business workflows.
2. Some legacy archived files remain in the repo until `src/app_old` is formally removed.
3. Storage bucket exposure and RLS should be reviewed again before public launch.

## Recommended Next Sprint

1. Finish trainer sessions, programs, and payments UX on top of the new API layer.
2. Add automated tests around auth, assessments, and admin operations.
3. Run the launch checklist for auth, email, storage, and RLS before any public push.

This audit pairs with:

- `docs/WORKFORCEOS-ALIGNMENT-PLAN.md`
- `docs/LAUNCH-SECURITY-CHECKLIST.md`
- `tasks/TASKS.md`
