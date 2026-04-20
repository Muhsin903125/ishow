# B1 — Fix Malformed JSX in Customer Dashboard

**Category:** Bug Fix  
**Priority:** 🐛 Critical Bug  
**File:** `src/app/(customer)/dashboard/page.tsx`  
**Lines:** ~157–183  

---

## Problem

The conditional block that renders a message for customers who have submitted an assessment but haven't been assigned a plan yet (`assessment.status === "pending" && !plan`) is broken. It mixes JSX from two different UI contexts:

1. A hero header block (`text-orange-500`, `text-3xl`, name greeting, today's date) — which belongs to the main dashboard header rendered unconditionally above.
2. An alert card (blue gradient, clock icon) that is the actual intent of this block.

**Result:** Customers who are waiting for a plan see a visually broken page with duplicated heading content inside a blue alert box.

---

## Root Cause

During a refactor, the hero header's JSX was accidentally left inside the `assessment.status === "pending" && !plan` conditional, instead of being removed or closed properly. The block now renders:

```jsx
{assessment && assessment.status === "pending" && !plan && (
  <div className="bg-gradient-to-r from-blue-50 ...">
    {/* clock icon + correct intro text */}
    <p className="text-orange-500 ...">Member Portal</p>   {/* ← WRONG: hero content */}
    <h1 className="text-3xl ...">Hey, {firstName}</h1>     {/* ← WRONG: hero content */}
    <p className="text-zinc-500 ...">Keep pushing...</p>   {/* ← WRONG: hero content */}
    ...
  </div>
)}
```

---

## Fix Instructions

### Step 1 — Read the full block

Open `src/app/(customer)/dashboard/page.tsx` and read lines 156–200 in full to see exactly what is inside the condition.

### Step 2 — Replace the block

The fixed version should render only a blue info alert. Replace the entire `assessment && assessment.status === "pending" && !plan` block with:

```jsx
{assessment && assessment.status === "pending" && !plan && (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6 flex items-start gap-4">
    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
      <Clock className="w-5 h-5 text-blue-600" />
    </div>
    <div>
      <p className="font-bold text-blue-900 text-sm">Assessment Under Review</p>
      <p className="text-blue-700 text-sm mt-0.5">
        Your assessment has been submitted. We&apos;re reviewing it and will assign your personalised plan soon.
      </p>
    </div>
  </div>
)}
```

### Step 3 — Verify the hero header is intact above this block

The hero header (greeting + today's date) should already exist unconditionally higher in the JSX. Confirm it is not removed. It should look like:

```jsx
<div className="flex items-start justify-between mb-6">
  <div>
    <p className="text-orange-500 text-xs font-bold tracking-[0.3em] uppercase mb-1.5">Member Portal</p>
    <h1 className="text-3xl lg:text-4xl font-black ...">Hey, {firstName}</h1>
    <p className="text-zinc-500 mt-2 text-sm">Keep pushing — your transformation continues.</p>
  </div>
  <div className="hidden sm:block text-right ...">
    <p className="text-zinc-600 text-xs ...">Today</p>
    <p className="text-zinc-300 font-semibold text-sm">{today}</p>
  </div>
</div>
```

If this hero block was also accidentally inside a condition, move it outside so it always renders for authenticated customers.

---

## Acceptance Criteria

- [ ] A customer with `assessment.status === "pending"` and no plan sees a clean blue info banner below the hero header.
- [ ] The hero greeting (name + today's date) renders correctly above all alert cards.
- [ ] No duplicate heading or orange text appears inside the blue alert box.
- [ ] A customer with no assessment sees the "Start Assessment" CTA.
- [ ] A customer with an active plan sees their plan card (not the pending banner).
- [ ] No TypeScript errors or ESLint warnings introduced.
