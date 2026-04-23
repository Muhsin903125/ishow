# Release Gates

## Required Checks

Run these before promoting a release candidate:

1. `npm run typecheck`
2. `npm run test`
3. `npm run lint`
4. `npm run build`
5. Review Supabase security/performance advisors
6. Review latest admin report metrics and recent audit activity

## Current Automation

- `npm run verify:release`
  - Runs `typecheck` and `test`
- `npm run test`
  - Runs the Vitest suite

## Manual QA Checklist

- Admin can review an assessment, assign a trainer, and convert to client.
- Admin can convert an assessment while scheduling the first session.
- Trainer can create, edit, cancel, and complete sessions.
- Trainer can create, edit, duplicate, and delete programs.
- Admin and trainer can create/update payment records.
- Customer can see session/payment state updates.
- Public pages load correctly:
  - `/`
  - `/services`
  - `/about`
  - `/contact`
  - `/faq`
  - `/content`
- Notification bell still loads and recent events appear.
- Admin reports page shows metrics, overdue counts, pending assessments, and recent audit activity.

## Security Review

- Confirm server routes still require the correct role.
- Confirm no new browser-side direct writes were added for core workflows.
- Confirm email failures do not block business actions.
- Review Supabase advisor warnings before release.
