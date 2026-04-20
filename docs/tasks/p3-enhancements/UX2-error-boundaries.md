# UX2 — Add Error Boundaries to All Dashboard Pages

**Category:** P3 — Enhancement  
**Area:** UX / Reliability  
**Files:** All dashboard pages, create `src/components/ErrorBoundary.tsx`

---

## Why

If a data fetch fails or a component throws an error, the entire page becomes blank or crashes with a white screen. Error boundaries catch these failures and show a user-friendly fallback so users know what happened and can retry.

---

## Implementation Steps

### Step 1 — Create the ErrorBoundary component

Error boundaries must be class components (React limitation):

Create `src/components/ErrorBoundary.tsx`:

```tsx
"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            {this.props.fallbackTitle ?? "Something went wrong"}
          </h2>
          <p className="text-gray-500 text-sm mb-4 max-w-xs">
            We couldn&apos;t load this section. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-400"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Page
          </button>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 text-left max-w-sm">
              <summary className="text-xs text-gray-400 cursor-pointer">Error details</summary>
              <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap">
                {this.state.error?.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Step 2 — Wrap dashboard content in each page

In each dashboard page, wrap the main content (not the layout) with `ErrorBoundary`:

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

return (
  <DashboardLayout role="customer">
    <ErrorBoundary fallbackTitle="Dashboard unavailable">
      {/* all page content */}
    </ErrorBoundary>
  </DashboardLayout>
);
```

### Step 3 — Add per-section error boundaries for granular recovery

For pages with multiple independent sections (like the admin dashboard), wrap each section independently:

```tsx
<ErrorBoundary fallbackTitle="Could not load assessments">
  <AssessmentsSection />
</ErrorBoundary>
<ErrorBoundary fallbackTitle="Could not load sessions">
  <SessionsSection />
</ErrorBoundary>
```

### Step 4 — Pages to wrap

All pages in:
- `src/app/(customer)/`
- `src/app/trainer/`
- `src/app/(admin)/admin/`

---

## Acceptance Criteria

- [ ] `ErrorBoundary` class component exists at `src/components/ErrorBoundary.tsx`.
- [ ] All dashboard pages wrap their content with at least one `ErrorBoundary`.
- [ ] When a component throws, the error boundary shows a friendly message with a refresh button.
- [ ] In development mode, the error message is visible in the "Error details" section.
- [ ] No TypeScript errors.
