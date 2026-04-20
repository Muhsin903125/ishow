# TR3 — Trainer: Client List Search & Filter

**Category:** P2 — Important  
**Area:** Trainer · Client Management  
**File:** `src/app/trainer/clients/page.tsx`

---

## Why

The trainer clients list currently shows all clients with no way to search or filter. As the client roster grows, finding a specific client requires scrolling through the entire list. Search and filter make this practical at scale.

---

## Implementation Steps

### Step 1 — Add search and filter state

```tsx
const [search, setSearch] = useState("");
const [filterStatus, setFilterStatus] = useState<"all" | "active" | "request" | "no-plan">("all");
```

### Step 2 — Add the search bar and filter tabs to the page header

```tsx
<div className="flex flex-col sm:flex-row gap-3 mb-6">
  {/* Search */}
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <input
      value={search}
      onChange={e => setSearch(e.target.value)}
      placeholder="Search clients by name or email…"
      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
    />
  </div>

  {/* Filter tabs */}
  <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
    {(["all", "active", "request", "no-plan"] as const).map(f => (
      <button key={f} onClick={() => setFilterStatus(f)}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
          filterStatus === f ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
        }`}
      >
        {f === "no-plan" ? "No Plan" : f.charAt(0).toUpperCase() + f.slice(1)}
      </button>
    ))}
  </div>
</div>
```

Import `Search` from `lucide-react`.

### Step 3 — Apply search and filter to the clients list

Derive the displayed list from state:

```tsx
const displayedClients = clients.filter(client => {
  // Search filter
  const q = search.toLowerCase();
  const matchesSearch = !q ||
    client.name.toLowerCase().includes(q) ||
    (client.email ?? "").toLowerCase().includes(q);

  // Status filter
  const clientAssessment = assessments.find(a => a.userId === client.id);
  const clientPlan = plans.find(p => p.userId === client.id && p.status === "active");

  const matchesStatus = filterStatus === "all" ? true :
    filterStatus === "active" ? client.customerStatus === "client" && !!clientPlan :
    filterStatus === "request" ? client.customerStatus === "request" :
    filterStatus === "no-plan" ? !clientPlan : true;

  return matchesSearch && matchesStatus;
});
```

Render `displayedClients` instead of `clients` in the JSX.

### Step 4 — Show result count

Above the list:
```tsx
<p className="text-sm text-gray-500 mb-4">
  Showing {displayedClients.length} of {clients.length} clients
</p>
```

### Step 5 — Empty state for no results

```tsx
{displayedClients.length === 0 && (
  <div className="text-center py-12">
    <p className="text-gray-500 text-sm">No clients match your search.</p>
    <button onClick={() => { setSearch(""); setFilterStatus("all"); }}
      className="mt-2 text-orange-500 text-sm font-semibold">
      Clear filters
    </button>
  </div>
)}
```

---

## Acceptance Criteria

- [ ] Search input filters clients by name and email (case-insensitive, real-time).
- [ ] Filter tabs narrow results by: All, Active (has plan), Request (no plan yet), No Plan.
- [ ] Result count updates as filters change.
- [ ] Empty state shows when no clients match.
- [ ] Clear filters button resets search and status filter.
- [ ] No TypeScript errors.
