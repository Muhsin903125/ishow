---
id: P0-001
type: feature
priority: p0-critical
status: completed
module: admin
---

# P0-001 - Admin Assessment-to-Client Workflow

## Summary

Turn the current assessment review flow into one controlled admin workflow: review assessment, assign trainer, schedule session, convert request to client, and notify the user.

## Problem / Background

The UI surfaces already exist, but the workflow should become a server-backed business process with clearer transitions, notifications, and audit entries.

## Scope

- review customer assessment
- assign trainer
- create first session
- convert `request` to `client`
- send confirmation notifications
- log admin actions

## Acceptance Criteria

- [x] admin can review an assessment and persist notes through an API route
- [x] trainer assignment is server-backed and auditable
- [x] first-session scheduling is part of the same operational flow
- [x] customer status conversion is consistent and visible across dashboard pages
- [x] email/in-app notifications are triggered from the server path
- [x] all state transitions are logged to audit

## Affected Files

- `src/pages/admin/assessments.tsx`
- `src/pages/admin/clients.tsx`
- `src/lib/db/assessments.ts`
- `src/lib/db/profiles.ts`
- `src/lib/db/sessions.ts`
- `src/pages/api/assessments/**`

## Notes

- Treat this as the first major feature to land on top of the new API/server boundary.
