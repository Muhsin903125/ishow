# C1 — Customer Profile / Settings Page

**Category:** P2 — Important  
**Area:** Customer · Self-Service  
**File:** Create `src/app/(customer)/profile/page.tsx`

---

## Why

Customers have no way to update their own name, phone number, or password after registration. This is a basic self-service need — without it, customers must contact the admin for simple profile changes.

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
import { User, Phone, Lock, Save } from "lucide-react";

export default function CustomerProfilePage() {
  const { user, loading, updatePassword } = useAuth();
  const router = useRouter();

  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user?.role !== "customer") { router.push("/trainer/dashboard"); return; }
    if (!loading && user) {
      getProfile(user.id).then(p => {
        setProfileForm({ name: p?.name ?? "", phone: p?.phone ?? "" });
      });
    }
  }, [loading, user]); // eslint-disable-line

  if (loading || !user) return null;

  return (
    <DashboardLayout role="customer">
      {/* page content below */}
    </DashboardLayout>
  );
}
```

### Step 2 — Build the Profile section

```tsx
<section className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
  <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
    <User className="w-4 h-4 text-orange-500" /> Personal Information
  </h2>

  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
      <input
        value={profileForm.name}
        onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
      <input
        value={profileForm.phone}
        onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
        type="tel"
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
      <input
        value={user.email}
        disabled
        className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
      />
      <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
    </div>
    {profileMsg && <p className="text-sm text-green-600">{profileMsg}</p>}
    <button
      onClick={handleSaveProfile}
      disabled={profileSaving}
      className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-400"
    >
      <Save className="w-4 h-4" /> {profileSaving ? "Saving…" : "Save Changes"}
    </button>
  </div>
</section>
```

### Step 3 — Implement `handleSaveProfile`

```tsx
const handleSaveProfile = async () => {
  if (!profileForm.name.trim()) return;
  setProfileSaving(true);
  try {
    await updateProfile(user!.id, { name: profileForm.name, phone: profileForm.phone });
    setProfileMsg("Profile updated successfully.");
    setTimeout(() => setProfileMsg(""), 3000);
  } finally {
    setProfileSaving(false);
  }
};
```

### Step 4 — Build the Change Password section

```tsx
<section className="bg-white rounded-2xl border border-gray-100 p-6">
  <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
    <Lock className="w-4 h-4 text-orange-500" /> Change Password
  </h2>
  <div className="space-y-4">
    <input type="password" placeholder="New password (min 8 chars)"
      value={passwordForm.newPass}
      onChange={e => setPasswordForm(f => ({ ...f, newPass: e.target.value }))}
      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm" />
    <input type="password" placeholder="Confirm new password"
      value={passwordForm.confirm}
      onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm" />
    {passwordMsg && <p className="text-sm text-green-600">{passwordMsg}</p>}
    <button onClick={handleChangePassword} disabled={passwordSaving}
      className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
      <Lock className="w-4 h-4" /> {passwordSaving ? "Updating…" : "Update Password"}
    </button>
  </div>
</section>
```

### Step 5 — Implement `handleChangePassword`

```tsx
const handleChangePassword = async () => {
  if (passwordForm.newPass.length < 8) {
    setPasswordMsg("Password must be at least 8 characters.");
    return;
  }
  if (passwordForm.newPass !== passwordForm.confirm) {
    setPasswordMsg("Passwords do not match.");
    return;
  }
  setPasswordSaving(true);
  try {
    await updatePassword(passwordForm.newPass);
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    setPasswordMsg("Password updated successfully.");
    setTimeout(() => setPasswordMsg(""), 3000);
  } catch {
    setPasswordMsg("Failed to update password. Please try again.");
  } finally {
    setPasswordSaving(false);
  }
};
```

`updatePassword` already exists in `AuthContext`.

### Step 6 — Add Profile link to CustomerSidebar

In `src/components/CustomerSidebar.tsx`, add:

```tsx
{ href: "/profile", icon: User, label: "Profile" }
```

---

## Acceptance Criteria

- [ ] Page exists at `/profile` and is protected (customer only).
- [ ] Name and phone can be updated and saved to Supabase via `updateProfile`.
- [ ] Email is shown as read-only.
- [ ] Password can be changed with validation (min 8 chars, must match).
- [ ] Success messages appear after saving.
- [ ] Profile link appears in CustomerSidebar.
- [ ] No TypeScript errors.
