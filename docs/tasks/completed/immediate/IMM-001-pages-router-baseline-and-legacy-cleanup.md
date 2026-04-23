---
id: IMM-001
type: immediate
priority: critical
status: completed
module: architecture
---

# IMM-001 - Pages Router Baseline and Legacy Cleanup

## Summary

Lock iShow to a clear **Next.js 16 Pages Router** delivery model and stop mixing active implementation work across `src/pages` and `src/app_old`.

## Problem / Background

The repository currently has two competing route trees:

- active: `src/pages`
- legacy: `src/app_old`

This makes planning, onboarding, and implementation error-prone. The installed Next.js docs in this repo also confirm Pages Router conventions are still valid and should be followed for the current app.

## Acceptance Criteria

- [x] `src/pages` is documented as the active application surface
- [x] `src/app_old` is marked as legacy/reference-only
- [x] planning docs and task files stop pointing new work at `src/app_old`
- [x] active route ownership is documented for customer, trainer, admin, and API surfaces
- [x] shared layout ownership is clarified around `src/components/DashboardLayout.tsx`

## Affected Files

- `AGENTS.md`
- `docs/WORKFORCEOS-ALIGNMENT-PLAN.md`
- `tasks/WORKFLOW-AUDIT.md`
- `src/pages/**`
- `src/app_old/**`

## Notes

- Do not start a full App Router migration as part of this task.
- Treat this as a clarity and execution-baseline task.
