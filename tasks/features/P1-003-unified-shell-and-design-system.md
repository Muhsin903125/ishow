---
id: P1-003
type: feature
priority: p1-high
status: in_progress
module: ui
---

# P1-003 - Unified Shell and Design System

## Summary

Evolve the current dashboards into a single shared shell model with centralized nav metadata, consistent page headers, and reusable state patterns.

## Problem / Background

The current role portals look related, which is good. But navigation definitions and shell behavior are duplicated across:

- `CustomerSidebar`
- `TrainerSidebar`
- `AdminSidebar`
- `DashboardLayout`

WorkforceOS uses a stronger shell model that is easier to scale.

## Acceptance Criteria

- [x] shared shell/navigation config is introduced
- [x] role sidebars derive from metadata rather than fully separate hardcoded lists
- [x] page header, breadcrumbs, status chips, and top actions use one pattern
- [ ] loading, empty, and error states follow shared visual rules
- [x] the role color system remains distinct but consistent

## Affected Files

- `src/components/DashboardLayout.tsx`
- `src/components/CustomerSidebar.tsx`
- `src/components/TrainerSidebar.tsx`
- `src/components/AdminSidebar.tsx`
- `src/components/ui/**`

## Notes

- Preserve the current orange/blue/emerald role identity.
- Do not make the three workspaces feel identical; consistency should not flatten the product.
