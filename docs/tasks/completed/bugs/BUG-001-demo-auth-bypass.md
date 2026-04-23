---
id: BUG-001
type: bug
priority: critical
severity: critical
status: completed
module: auth
---

# BUG-001 - Demo Auth Bypass Is Trusted as a Real Session Path

## Summary

The app currently accepts hardcoded demo credentials in `AuthContext` and `src/proxy.ts` treats the `ishow_demo_auth` cookie as sufficient for protected route access.

## Problem / Background

Relevant files:

- `src/contexts/AuthContext.tsx`
- `src/proxy.ts`
- `src/pages/login.tsx`

This is useful for demos, but unsafe as a production trust model. A cookie flag is not a substitute for a real authenticated Supabase session.

## Acceptance Criteria

- [x] demo login is removed or strictly gated to non-production environments
- [x] `src/proxy.ts` no longer trusts `ishow_demo_auth` as access to protected routes
- [x] login UI stops exposing hardcoded credentials in production paths
- [x] logout clears all demo-only state cleanly
- [x] manual verification covers login, logout, redirect, and protected-route blocking

## Affected Files

- `src/contexts/AuthContext.tsx`
- `src/proxy.ts`
- `src/pages/login.tsx`

## Notes

- If demos must remain, gate them behind an environment flag and make the UI conditional.
