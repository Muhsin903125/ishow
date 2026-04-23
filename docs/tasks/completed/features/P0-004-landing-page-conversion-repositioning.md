---
id: P0-004
type: feature
priority: p0-critical
status: completed
module: landing-growth
---

# P0-004 - Landing Page Conversion Repositioning

## Summary

Restructure the public landing page around buyer intent for Dubai/UAE personal training instead of app-first messaging.

## Problem / Background

The current landing page looks premium, but it does not answer enough first-visit questions fast enough. A local competitor like `realfit.ae` wins on clarity with service-first sections for results, programs, pricing, trainer trust, and reviews.

iShow should not copy that design language directly, but it should adopt the same conversion discipline while keeping a stronger brand voice.

## Acceptance Criteria

- [x] hero copy clearly states who iShow serves, where coaching happens, and what outcome categories are offered
- [x] section order supports conversion, not just visual spectacle
- [x] service/program blocks explain the main coaching paths in plain language
- [x] a pricing or package logic section exists, even if exact pricing remains configurable
- [x] trust elements cover coach credentials, method clarity, and client proof
- [x] the app/platform story appears as support for the coaching offer, not the lead headline

## Affected Files

- `src/pages/index.tsx`
- `src/components/LandingClient.tsx`
- `src/components/Navbar.tsx`
- `src/pages/admin/cms.tsx`

## Notes

- Use local-market search intent such as Dubai, UAE, online coaching, fat loss, strength, accountability, and habit change where appropriate.
- The landing page should feel premium, but it still needs to behave like a service sales page.
