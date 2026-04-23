# iShow WorkforceOS-Style Alignment Plan

> Updated: 2026-04-23
> Reference: `D:\MuhsinStuff\projects\workforceos`

## Current State Snapshot

- Active framework shape: `Next.js 16.2.2` with the Pages Router in `src/pages`
- Active pages: 45
- Active API routes: 17 in `src/pages/api`
- Legacy archive still present: `src/app_old` with 47 files plus a legacy README marker
- Client DB modules: 11 files in `src/lib/db`
- Supabase migrations: 10

## Standards Now In Place

### Runtime model

- `src/pages` is the active application surface
- `src/pages/api` is the active same-origin server boundary
- `src/app_old` is legacy reference-only
- `DashboardLayout.tsx` is the shared workspace shell for customer, trainer, and admin surfaces

### Server boundary

- privileged mutations for assessments, sessions, programs, payments, notifications, CMS, leads, and email now route through `src/pages/api/*`
- shared auth, validation, rate limiting, and audit helpers now live under `src/lib/server`
- service-role usage is limited to server-only helpers

### Security baseline

- demo auth is gated behind non-production environment flags
- protected-route proxy no longer trusts demo state in production
- email sending is authenticated, rate-limited, template-validated, and audit-logged
- admin mutations use request throttling and server-only audit writes
- launch review guidance now lives in `docs/LAUNCH-SECURITY-CHECKLIST.md`

## Remaining Work

### Core product

- complete admin assessment-to-client workflow polish
- complete trainer session operations UX
- complete trainer program builder UX
- harden payment operations further around reporting and lifecycle visibility

### Delivery quality

- add automated test harnesses
- add release gates and CI checks
- continue removing archived helpers once `src/app_old` is formally removed

## Delivery Rules

- build against `src/pages`, not `src/app_old`
- prefer same-origin API routes for business mutations
- keep secrets and service-role access server-side only
- treat auditability and rate limiting as required launch work, not optional polish

This document pairs with:

- `tasks/TASKS.md`
- `tasks/WORKFLOW-AUDIT.md`
- `docs/LAUNCH-SECURITY-CHECKLIST.md`
