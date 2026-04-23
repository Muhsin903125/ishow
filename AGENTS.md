<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Active Runtime Baseline

- `src/pages` is the active application surface for all new product work.
- `src/pages/api` is the active same-origin server boundary for privileged mutations.
- `src/app_old` is legacy reference-only code and should not receive new feature work.
- `src/components/DashboardLayout.tsx` is the shared shell for customer, trainer, and admin workspaces in the active app.
