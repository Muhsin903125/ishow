# iShow Project Audit

> Audited: 2026-04-23
> Scope: Pages Router app, Supabase-backed APIs, landing/public pages, customer, trainer, admin, CMS, notifications, payments, and release posture.

## Executive Summary

iShow now has a solid API-first base with real role-gated server routes, admin CMS control, lead management, reporting, and public marketing pages. The project is materially stronger than the earlier browser-direct version, but it still has a few meaningful gaps before it feels fully production-ready:

- several feature tracks are still correctly marked `in_progress`
- the design system is directionally good but still inconsistent across role pages
- payment lifecycle persistence and export/report tooling need another pass
- automated end-to-end coverage is still missing
- media delivery strategy is not yet optimized for production performance

## What Is Working Well

### Product Coverage

- public landing and support pages exist and are CMS-driven
- customer flows cover onboarding, assessment, plan, programs, sessions, payments, and profile
- trainer flows cover dashboard, sessions, programs, clients, and settings
- admin flows cover assessments, clients, trainers, payments, CMS, leads, and reports

### Architecture

- same-origin API routes now back the main business flows
- private APIs are auth-protected with role checks
- public website content is isolated into a dedicated public API
- server-side rate limiting and audit logging are in place for sensitive routes

### Operations

- admin CMS can control core landing/support content
- leads CRUD and lead-to-client conversion are implemented
- notifications and email workflows exist
- QA scripts and release-gate docs exist

## Remaining Gaps By Area

### Product / UX

- trainer session cancellation still lacks structured cancel reasons
- overdue payment state is computed at read time, but not persisted consistently in the database lifecycle
- proof/storytelling modules on the landing page are improved, but the proof system is not yet fully CMS-extendable as structured content
- loading, empty, and error states still vary too much across the app
- reports lack export/filter workflows for real operational review

### Quality

- no true end-to-end workflow coverage yet for login, admin, and trainer critical paths
- several UI files still have warning-level cleanup debt
- there is still legacy reference code under `src/app_old`

### Security / Reliability

- storage/media strategy needs a production review
- transactional notifications are present, but delivery observability is still light
- some older pages still deserve a follow-up sweep for UX consistency and stricter API-only reads

## Recommended Improvements

### 1. Finish The Six Active Tasks Before Starting New Surface Area

These are still the right remaining priorities:

- `P0-002` trainer session operations
- `P1-001` payment operations module
- `P1-003` unified shell and design system
- `P1-004` proof-driven landing storytelling
- `P2-001` test harness and release gates
- `P2-002` admin reporting and audit visibility

### 2. Expand Resend Into A Full Notification Delivery Layer

Resend is already integrated in [src/lib/email/sender.ts](/D:/MuhsinStuff/projects/ishow/src/lib/email/sender.ts:1), so the next step is not initial setup, but operational maturity.

Recommended next improvements:

- add delivery status logging table for sent, failed, and retried emails
- add Resend webhook ingestion for delivery, bounce, and complaint events
- add template analytics and admin visibility for message health
- queue outbound emails instead of sending inline on every request path
- add reminder scheduling for payments and upcoming sessions

Why this helps:

- better reliability under load
- clearer debugging when users say they did not receive email
- lower request latency on mutation APIs
- safer growth path for higher notification volume

### 3. Use Cloudinary For Marketing Images And Video Assets

If by "cloudify" you meant Cloudinary, that is a strong fit here.

Current state:

- marketing pages still depend on mixed image sources
- exercise videos are tied to a storage-bucket pattern in [src/lib/db/master.ts](/D:/MuhsinStuff/projects/ishow/src/lib/db/master.ts:1)

Recommended Cloudinary scope:

- landing page images
- testimonial/proof assets
- public blog/content thumbnails
- exercise demo videos
- trainer-uploaded short media where transformations or coaching proof are shown

Why Cloudinary would help:

- automatic `webp`/`avif` delivery
- responsive image resizing without pre-generating variants
- CDN-backed asset delivery globally
- video transcoding and streaming optimization
- signed/private media support where needed

Suggested architecture:

- keep CMS/admin data in Supabase
- store Cloudinary public IDs and metadata in Postgres
- render through transformed URLs in landing/public pages
- use signed uploads from admin/trainer tools where appropriate

### 4. Add Background Jobs For Operational Consistency

High-value background automations:

- mark overdue payments persistently on a schedule
- send payment reminders ahead of due date
- send session reminders 12 to 24 hours before session start
- create digest notifications for admins and trainers

This can be done with Supabase scheduled jobs or an edge-function workflow.

### 5. Tighten The Design System

The shell direction is good, but the product still needs:

- shared empty state component
- shared error state component
- shared page header/action bar conventions
- stricter typography and spacing tokens
- reduced visual drift between customer, trainer, and admin pages

### 6. Prepare For Production Observability

Add:

- API request logging with correlation IDs
- error monitoring
- audit views for failed background/email jobs
- admin-facing delivery/ops health cards

## Recommended Next Sprint

1. finish `P0-002` and `P1-001`
2. add one end-to-end test path for login -> trainer session workflow -> admin verification
3. implement delivery logging around Resend
4. decide on Cloudinary for public assets and exercise videos
5. add payment overdue persistence automation

## Task Archive Status

Completed task specs have been moved to:

- `docs/tasks/completed/immediate`
- `docs/tasks/completed/bugs`
- `docs/tasks/completed/features`

Active tasks remain under `tasks/features` so the working backlog stays small and honest.
