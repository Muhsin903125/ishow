---
id: P0-002
type: feature
priority: p0-critical
status: in_progress
module: trainer-sessions
---

# P0-002 - Trainer Session Operations

## Summary

Build a complete trainer session workflow: create, edit, cancel, and mark sessions complete from the trainer workspace.

## Problem / Background

Trainer operations are central to the product. The current pages show the right direction, but session management should become a first-class operational module with API-backed mutations and audit coverage.

## Acceptance Criteria

- [x] trainer can create a session for an assigned client
- [x] trainer can edit upcoming sessions
- [ ] trainer can cancel sessions with a reason
- [x] trainer can mark sessions as completed
- [x] customer receives relevant notifications for schedule changes
- [x] actions are authorized, validated, and audit-logged

## Affected Files

- `src/pages/trainer/sessions.tsx`
- `src/pages/trainer/clients/[id].tsx`
- `src/lib/db/sessions.ts`
- `src/pages/api/sessions/**`

## Notes

- Keep customer-facing status labels consistent with the customer dashboard and payments/reporting flows.
