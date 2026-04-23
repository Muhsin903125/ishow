# iShow Task Tracker

> Updated: 2026-04-23
> Reference model: `workforceos/tasks`
> Status values below reflect the current audit of this repository.
> Completed task specs are archived under `docs/tasks/completed/`.

---

## Summary

| Category | Count | Open |
|---|---:|---:|
| Immediate actions | 3 | 0 |
| Bugs / risk items | 4 | 0 |
| Features - P0 | 4 | 1 |
| Features - P1 | 5 | 3 |
| Features - P2 | 2 | 2 |
| **Total** | **18** | **6** |

---

## Immediate Actions

| ID | Title | Priority | Status |
|---|---|---|---|
| [IMM-001](../docs/tasks/completed/immediate/IMM-001-pages-router-baseline-and-legacy-cleanup.md) | Pages Router baseline and legacy cleanup | Critical | completed |
| [IMM-002](../docs/tasks/completed/immediate/IMM-002-api-foundation-and-server-boundary.md) | API foundation and server boundary | Critical | completed |
| [IMM-003](../docs/tasks/completed/immediate/IMM-003-security-hardening-and-audit-baseline.md) | Security hardening and audit baseline | Critical | completed |

---

## Bugs / Risk Items

| ID | Title | Severity | Status |
|---|---|---|---|
| [BUG-001](../docs/tasks/completed/bugs/BUG-001-demo-auth-bypass.md) | Demo auth bypass is trusted as a real session path | Critical | completed |
| [BUG-002](../docs/tasks/completed/bugs/BUG-002-legacy-localstorage-dependencies.md) | Legacy localStorage/data-layer files still influence active flows | High | completed |
| [BUG-003](../docs/tasks/completed/bugs/BUG-003-email-api-validation-throttling.md) | Email API lacks auth and throttling protections | High | completed |
| [BUG-004](../docs/tasks/completed/bugs/BUG-004-landing-page-structural-theme-regressions.md) | Landing page has structural regressions and incomplete light theme support | High | completed |

---

## Features - P0

| ID | Title | Module | Status |
|---|---|---|---|
| [P0-001](../docs/tasks/completed/features/P0-001-admin-assessment-to-client-workflow.md) | Admin assessment-to-client workflow | Admin / Assessment | completed |
| [P0-002](features/P0-002-trainer-session-operations.md) | Trainer session operations | Trainer / Sessions | in_progress |
| [P0-003](../docs/tasks/completed/features/P0-003-trainer-program-builder.md) | Trainer program builder | Trainer / Programs | completed |
| [P0-004](../docs/tasks/completed/features/P0-004-landing-page-conversion-repositioning.md) | Landing page conversion repositioning | Landing / Growth | completed |

---

## Features - P1

| ID | Title | Module | Status |
|---|---|---|---|
| [P1-001](features/P1-001-payment-operations-module.md) | Payment operations module | Payments | in_progress |
| [P1-002](../docs/tasks/completed/features/P1-002-notification-center-and-email-delivery.md) | Notification center and email delivery | Notifications | completed |
| [P1-003](features/P1-003-unified-shell-and-design-system.md) | Unified shell and design system | UI / Layout | in_progress |
| [P1-004](features/P1-004-proof-driven-landing-storytelling.md) | Proof-driven landing storytelling | Landing / Content | in_progress |
| [P1-005](../docs/tasks/completed/features/P1-005-public-seo-support-pages-and-content-foundation.md) | Public SEO support pages and content foundation | Public / SEO | completed |

---

## Features - P2

| ID | Title | Module | Status |
|---|---|---|---|
| [P2-001](features/P2-001-test-harness-and-release-gates.md) | Test harness and release gates | QA / DX | in_progress |
| [P2-002](features/P2-002-admin-reporting-and-audit-visibility.md) | Admin reporting and audit visibility | Admin / Reporting | in_progress |

---

## Suggested Execution Order

1. [P0-001](../docs/tasks/completed/features/P0-001-admin-assessment-to-client-workflow.md)
2. [P0-002](features/P0-002-trainer-session-operations.md)
3. [P0-003](../docs/tasks/completed/features/P0-003-trainer-program-builder.md)
4. [P1-001](features/P1-001-payment-operations-module.md)
5. [P0-004](../docs/tasks/completed/features/P0-004-landing-page-conversion-repositioning.md)
6. [P1-004](features/P1-004-proof-driven-landing-storytelling.md)
7. [P1-005](../docs/tasks/completed/features/P1-005-public-seo-support-pages-and-content-foundation.md)
8. [P1-003](features/P1-003-unified-shell-and-design-system.md)
9. [P2-001](features/P2-001-test-harness-and-release-gates.md)

---

Keep this tracker aligned with the detailed task files, the workflow audit, and `tasks/LANDING-PAGE-AUDIT.md`.
