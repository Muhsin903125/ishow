---
id: BUG-003
type: bug
priority: high
severity: high
status: completed
module: email
---

# BUG-003 - Email API Lacks Auth and Throttling Protections

## Summary

`src/pages/api/email/send.ts` validates shape, but it does not yet enforce stronger auth, abuse prevention, or shared delivery rules.

## Problem / Background

The route exists and works, but compared with the WorkforceOS standard it is missing:

- stronger caller authorization rules
- route-level throttling
- shared audit logging
- more structured template/recipient controls

This matters because email endpoints are frequent abuse targets.

## Acceptance Criteria

- [x] authenticated access policy is defined for who may call this endpoint
- [x] rate limiting is applied to prevent abuse
- [x] email payload validation is explicit per template type
- [x] send attempts are logged for audit and troubleshooting
- [x] non-authorized callers receive a consistent error response

## Affected Files

- `src/pages/api/email/send.ts`
- `src/lib/email/sender.ts`
- `src/lib/email/notify.ts`
- `src/lib/server/**`

## Notes

- Keep same-origin usage by default.
- If some emails must be system-only, expose them through server-side workflow routes instead of a generic public email sender.
