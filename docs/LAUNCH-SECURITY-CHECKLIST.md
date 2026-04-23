# iShow Launch Security Checklist

> Updated: 2026-04-23

## Auth

- Confirm `NEXT_PUBLIC_ENABLE_DEMO_AUTH` and `ENABLE_DEMO_AUTH` are disabled in production.
- Confirm protected routes depend on real Supabase sessions only.
- Confirm Supabase Auth settings, redirect URLs, and password policies are production-safe.
- Confirm leaked-password protection is enabled in Supabase Auth before go-live.

## Email

- Confirm `RESEND_API_KEY` is present only in server environments.
- Confirm `/api/email/send` remains same-origin only and requires authenticated users.
- Confirm email template permissions still match current business workflows.

## Audit And API Boundaries

- Confirm privileged mutations run through `src/pages/api/*` rather than direct browser writes.
- Confirm service-role access is used only from server-only helpers.
- Confirm audit log inserts still succeed in production.

## Storage

- Review the `exercise-videos` bucket access model before launch.
- If files should not be public, switch to a private bucket plus signed URLs or authenticated downloads.
- If the bucket stays public, document that choice explicitly and restrict upload/delete/update policies on `storage.objects`.

Supabase reference used for this review:

- Storage bucket access models: https://supabase.com/docs/guides/storage/buckets/fundamentals
- Storage access control and RLS: https://supabase.com/docs/guides/storage/security/access-control

## RLS And Database

- Re-run Supabase security advisors before launch.
- Resolve or accept with written justification any remaining mutable `search_path` or permissive RLS findings.
- Confirm admin-only tables and content-management tables still enforce least privilege.
