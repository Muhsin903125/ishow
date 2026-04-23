---
id: IMM-003
type: immediate
priority: critical
status: completed
module: security
---

# IMM-003 - Security Hardening and Audit Baseline

## Summary

Define the minimum launch-safe security baseline for iShow: request validation, throttling, server-side audit logging, and a clean server-only secret boundary.

## Problem / Background

Compared with WorkforceOS, iShow is missing a formal security delivery layer:

- no shared throttling
- minimal runtime validation
- audit writes are not server-only
- sensitive business actions are not consistently routed through controlled API boundaries

## Acceptance Criteria

- [x] rate limiting exists for auth, email, and admin mutation endpoints
- [x] request payloads are runtime-validated for new API routes
- [x] audit log writes happen through a server-only path
- [x] Supabase service-role usage is limited to server code only
- [x] storage bucket access patterns are reviewed and documented
- [x] an internal launch checklist exists for auth, email, storage, and RLS review

## Affected Files

- `src/pages/api/**`
- `src/lib/db/audit.ts`
- `src/lib/email/**`
- `src/lib/supabase/**`
- `supabase/migrations/**`
- `docs/WORKFORCEOS-ALIGNMENT-PLAN.md`

## Notes

- This task should finish before public go-live work.
- Keep it practical: auth, email abuse, audit integrity, and data exposure are the main risks.
