---
id: BUG-004
type: bug
priority: high
status: completed
module: landing
---

# BUG-004 - Landing Page Structural Regressions and Incomplete Light Theme Support

## Summary

Clean up structural regressions on the landing page before the next marketing redesign pass.

## Problem / Background

The landing page currently has a few implementation issues that will make a redesign harder to trust:

- duplicate `#coach` section IDs
- visible mojibake in hero copy
- incomplete activation of the repo's light-surface styling for the landing route
- heavy dependence on raw remote `<img>` usage for critical sections

These are not only polish issues. They affect navigation stability, perceived quality, and the ability to introduce a white-led landing direction cleanly.

## Acceptance Criteria

- [x] duplicate anchor IDs are removed and section navigation is deterministic
- [x] visible copy encoding issues are fixed
- [x] landing pages support a warm light surface treatment without contrast regressions
- [x] light/dark section styling is intentional rather than inherited by accident
- [x] critical landing imagery is migrated toward approved assets or an explicit image strategy

## Affected Files

- `src/components/LandingClient.tsx`
- `src/components/Navbar.tsx`
- `src/pages/_app.tsx`
- `src/styles/globals.css`

## Notes

- Do not implement white mode as a blunt invert of the current dark design.
- Keep orange as the action color, but let white/ivory carry more of the page weight.
