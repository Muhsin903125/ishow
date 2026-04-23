---
id: P1-002
type: feature
priority: p1-high
status: completed
module: notifications
---

# P1-002 - Notification Center and Email Delivery

## Summary

Consolidate in-app notifications and transactional email delivery into one clear server-driven communication layer.

## Problem / Background

The repo already has notification and email pieces, but the workflow is still fragmented between client-side helpers and isolated components.

## Acceptance Criteria

- [x] key business events trigger notifications from server-side workflows
- [x] email templates are mapped to explicit workflow events
- [x] notification inbox state is consistent across customer, trainer, and admin flows
- [x] failures are logged without breaking the main business action
- [x] delivery behavior is documented for sessions, assessments, and payments

## Affected Files

- `src/lib/db/notifications.ts`
- `src/components/NotificationBell.tsx`
- `src/lib/email/sender.ts`
- `src/lib/email/notify.ts`
- `src/pages/api/notifications/**`
- `src/pages/api/email/send.ts`

## Notes

- Start with assessment, session, and payment events.
- Realtime can be a second pass after the server event model is stable.
