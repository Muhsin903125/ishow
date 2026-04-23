# Communication Workflows

## Purpose

This document defines the server-driven communication model for iShow operational events.

## Event Sources

- `assessment.reviewed`
  - Triggered from `PUT /api/assessments/[assessmentId]`
  - Sends in-app notification
  - Sends `assessment-reviewed` email when the client has an email on file

- `assessment.convert_to_client`
  - Triggered from `POST /api/admin/assessments/[assessmentId]/convert`
  - Converts `profiles.customer_status` to `client`
  - Sends in-app confirmation
  - Sends `assessment-reviewed` email
  - Optionally schedules first session and sends `session-scheduled`

- `session.created`
  - Triggered from `POST /api/sessions`
  - Sends in-app `session_booked`
  - Sends `session-scheduled` email

- `session.updated`
  - Triggered from `PUT /api/sessions/[sessionId]`
  - If schedule/time changes: sends `session-rescheduled`
  - If cancelled: sends `session-cancelled`
  - If completed: sends in-app completion notice only

- `payment.created`
  - Triggered from `POST /api/payments`
  - Sends in-app payment due notice
  - Sends `payment-due-reminder` email when due date and recipient email exist

- `payment.updated`
  - Triggered from `PUT /api/payments/[paymentId]`
  - If marked paid: sends in-app payment received notice
  - If moved to overdue: sends in-app overdue notice

## Delivery Rules

- Primary business actions must not fail if email delivery fails.
- In-app notifications should be created first when possible.
- Email payloads must map to explicit template fields in `src/lib/email/sender.ts`.
- Audit logs should capture the business action even if communication delivery fails.

## Operational Notes

- The shared server helper lives in `src/lib/server/engagement.ts`.
- This keeps communication ownership on the server and removes email dispatch from browser event handlers.
