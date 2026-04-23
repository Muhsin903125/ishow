---
id: P2-002
type: feature
priority: p2-medium
status: in_progress
module: admin-reporting
---

# P2-002 - Admin Reporting and Audit Visibility

## Summary

Strengthen the admin reporting surface so it becomes an operational dashboard for platform health, not just a UI page with metrics.

## Problem / Background

The admin reports page already exists, but once server-backed workflows are added we also need operational visibility into who changed what, what is due, and which business flows are failing.

## Acceptance Criteria

- [x] admin reports reflect server-backed metrics for sessions, revenue, and customer pipeline
- [x] recent audit activity is visible to admins
- [x] overdue payments and pending assessments are clearly surfaced
- [ ] export or filter support is defined for operational review
- [x] page is aligned with the new audit/server event model

## Affected Files

- `src/pages/admin/reports.tsx`
- `src/lib/db/audit.ts`
- `src/lib/db/payments.ts`
- `src/lib/db/sessions.ts`
- `src/pages/api/reports/**`

## Notes

- This task becomes much more valuable after the API/server-boundary work is in place.
