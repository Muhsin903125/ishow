# TR1 — Trainer: Profile / Settings Page

**Category:** P2 — Important  
**Area:** Trainer · Self-Service  
**File:** Create `src/app/trainer/settings/page.tsx`

---

## Why

Trainers cannot update their own name, phone, or password after being invited. They must ask the admin to edit their profile via the trainers management page. A self-service settings page removes this dependency.

---

## Implementation Steps

### Step 1 — Create the page file

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateProfile } from "@/lib/db/profiles";
import { User, Lock, Save } from "lucide-react";

export default function TrainerSettingsPage() {
  const { user, loading, updatePassword } = useAuth();
  const router = useRouter();
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ newPass: "", confirm: "" });
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user?.role === "customer") { router.push("/dashboard"); return; }
    if (!loading && user) {
      getProfile(user.id).then(p => setProfileForm({ name: p?.name ?? "", phone: p?.phone ?? "" }));
    }
  }, [loading, user]); // eslint-disable-line

  if (loading || !user) return null;

  // ... handlers and JSX
  return <DashboardLayout role="trainer">{/* content */}</DashboardLayout>;
}
```

### Step 2 — Build profile form and password form

Use the same structure as C1 (customer profile page). The UI is identical — copy the section JSX, adjusting the role guard.

### Step 3 — Implement `handleSaveProfile`

```tsx
const handleSaveProfile = async () => {
  setProfileSaving(true);
  try {
    await updateProfile(user!.id, { name: profileForm.name, phone: profileForm.phone });
    setProfileMsg("Profile updated.");
    setTimeout(() => setProfileMsg(""), 3000);
  } finally {
    setProfileSaving(false);
  }
};
```

### Step 4 — Implement `handleChangePassword`

Same as C1 — validates min 8 chars and match, then calls `updatePassword` from AuthContext.

### Step 5 — Add Settings link to TrainerSidebar

In `src/components/TrainerSidebar.tsx`:

```tsx
{ href: "/trainer/settings", icon: Settings, label: "Settings" }
```

Import `Settings` from `lucide-react`. Add at the bottom of the nav items (before sign out).

---

## Acceptance Criteria

- [ ] Page exists at `/trainer/settings` and is protected (trainer and admin only).
- [ ] Name and phone can be updated via `updateProfile`.
- [ ] Password can be changed with validation.
- [ ] Settings link appears in TrainerSidebar.
- [ ] No TypeScript errors.
