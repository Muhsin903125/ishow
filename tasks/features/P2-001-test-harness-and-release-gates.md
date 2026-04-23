---
id: P2-001
type: feature
priority: p2-medium
status: in_progress
module: qa
---

# P2-001 - Test Harness and Release Gates

## Summary

Add the minimum test and release infrastructure needed to ship the new API-first architecture safely.

## Problem / Background

The reference project has clear test posture. iShow currently has no API/UI test harness and only basic package scripts, which makes regression risk high once the server boundary expands.

## Acceptance Criteria

- [x] unit or integration test framework is added for API routes and server helpers
- [ ] at least one end-to-end workflow path is covered for login and trainer/admin operations
- [x] `package.json` includes test scripts
- [x] release gates are documented for lint, build, tests, and security checks
- [x] core flows have a short manual QA checklist

## Affected Files

- `package.json`
- `jest.config.*` or equivalent
- `playwright.config.*` or equivalent
- `src/pages/api/**`
- `tasks/WORKFLOW-AUDIT.md`

## Notes

- Prioritize API and workflow tests over snapshot-heavy component testing.
