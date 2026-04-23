---
id: IMM-002
type: immediate
priority: critical
status: completed
module: api
---

# IMM-002 - API Foundation and Server Boundary

## Summary

Introduce a WorkforceOS-style same-origin API layer so privileged business writes do not happen directly from the browser through raw DB helpers.

## Problem / Background

The current repo has:

- 1 API route in `src/pages/api`
- many client-facing DB helpers in `src/lib/db`

That makes authorization, auditing, validation, and error handling inconsistent. WorkforceOS solves this by routing business actions through `src/pages/api/*` and keeping server concerns in dedicated helpers.

## Scope

### Add Shared Server Utilities

- request auth helper
- consistent API response helper
- validation/error wrapper
- audit helper
- rate-limit helper

### Stand Up Initial API Surfaces

- `sessions`
- `programs`
- `payments`
- `assessments`
- `notifications`

### Client Integration

- pages should call API wrappers for mutations
- client DB helpers should become read-focused or be moved server-side

## Acceptance Criteria

- [x] `src/lib/server/` exists with shared auth/response/audit helpers
- [x] new API routes exist for the main business modules
- [x] trainer/admin/customer mutations stop calling direct browser-side writes for sensitive operations
- [x] service-role access is server-only
- [x] response shapes are consistent across new endpoints

## Affected Files

- `src/pages/api/**`
- `src/lib/server/**`
- `src/lib/db/sessions.ts`
- `src/lib/db/programs.ts`
- `src/lib/db/payments.ts`
- `src/lib/db/assessments.ts`
- `src/lib/db/notifications.ts`

## Notes

- Follow Next.js Pages Router API route conventions from `node_modules/next/dist/docs/02-pages/.../07-api-routes.md`.
- Prefer incremental module-by-module migration rather than a big-bang rewrite.
