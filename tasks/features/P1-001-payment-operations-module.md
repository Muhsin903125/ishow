---
id: P1-001
type: feature
priority: p1-high
status: in_progress
module: payments
---

# P1-001 - Payment Operations Module

## Summary

Turn payments into a coherent module across customer, trainer, and admin surfaces with stronger server-backed lifecycle handling.

## Problem / Background

Payments already appear in several screens, but the lifecycle is not yet formalized as an operations module with clear ownership, status changes, reminders, and auditability.

## Scope

- trainer invoice creation
- admin payment oversight
- customer payment visibility
- overdue automation
- reminder delivery

## Acceptance Criteria

- [x] trainer can create invoice/payment records for assigned clients
- [x] admin can review and update payment records centrally
- [x] customer sees accurate pending/paid/overdue states
- [ ] overdue status is computed and persisted consistently
- [x] reminder delivery is triggered from a server-side workflow
- [x] payment updates are audit-logged

## Affected Files

- `src/pages/trainer/payments.tsx`
- `src/pages/admin/payments.tsx`
- `src/pages/payments.tsx`
- `src/lib/db/payments.ts`
- `src/pages/api/payments/**`
- `src/lib/email/sender.ts`

## Notes

- Online payment gateway integration can come later; this task is about getting the operations model correct first.
