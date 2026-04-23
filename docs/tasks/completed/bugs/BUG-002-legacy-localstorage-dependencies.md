---
id: BUG-002
type: bug
priority: high
severity: high
status: completed
module: data-layer
---

# BUG-002 - Legacy localStorage Dependencies Still Influence Active Flows

## Summary

The repo still contains active legacy data-layer files from the pre-Supabase era, and at least one live DB helper still imports `@/lib/storage`.

## Problem / Background

Relevant files include:

- `src/lib/db/assessments.ts`
- `src/lib/storage.ts`
- `src/lib/mockData.ts`
- `src/lib/auth.ts`
- `src/lib/prisma.ts`

This creates confusion about which data layer is real and risks accidental fallback to local browser storage in active flows.

## Acceptance Criteria

- [x] no active page or active DB helper depends on `@/lib/storage`
- [x] assessment flow is fully Supabase-backed in active runtime paths
- [x] dead legacy files are removed or clearly archived
- [x] docs stop referring to localStorage-era implementation as active
- [x] lint/build passes after cleanup

## Affected Files

- `src/lib/db/assessments.ts`
- `src/lib/storage.ts`
- `src/lib/mockData.ts`
- `src/lib/auth.ts`
- `src/lib/prisma.ts`

## Notes

- Do this after the API/server-boundary work is defined so we do not remove fallback code without a replacement path.
