---
id: P0-003
type: feature
priority: p0-critical
status: completed
module: trainer-programs
---

# P0-003 - Trainer Program Builder

## Summary

Replace the current thin program management flow with a structured builder for weekly programs using the exercise library.

## Problem / Background

Programs are a core fitness product surface. The trainer should be able to assemble and maintain programs using the master exercise data, not just view static records.

## Acceptance Criteria

- [x] trainer can create a weekly program with title, week number, and day-based activities
- [x] trainer can search/select exercises from the master library
- [x] trainer can edit and delete existing programs
- [x] save operations go through API routes with validation
- [x] program changes are visible to the customer program page
- [x] program mutations are audit-logged

## Affected Files

- `src/pages/trainer/programs.tsx`
- `src/lib/db/programs.ts`
- `src/lib/db/master.ts`
- `src/pages/api/programs/**`

## Notes

- Keep the builder fast and role-focused; do not overload it with admin-only master editing.
