# A1 — Add Google Sign-In Button to Login Page

**Category:** P2 — Important  
**Area:** Authentication  
**File:** `src/app/(auth)/login/page.tsx`

---

## Why

`loginWithGoogle()` is already implemented in `src/contexts/AuthContext.tsx` and routes the user to the correct dashboard via the `/auth/callback` handler. However, the login page has no button to trigger it. Adding "Continue with Google" removes password friction for new and returning users.

---

## Implementation Steps

### Step 1 — Locate the login form

Open `src/app/(auth)/login/page.tsx`. Find the form's submit area (below the password field and above the sign-in button).

### Step 2 — Add a divider between form and social login

After the "Sign In" button, add:

```tsx
<div className="flex items-center gap-3 my-4">
  <div className="flex-1 h-px bg-gray-200" />
  <span className="text-xs text-gray-400 font-medium">or</span>
  <div className="flex-1 h-px bg-gray-200" />
</div>
```

### Step 3 — Add the Google button

```tsx
<button
  type="button"
  onClick={handleGoogleLogin}
  className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
>
  {/* Google SVG icon */}
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
  Continue with Google
</button>
```

### Step 4 — Add the handler

Inside the component, import `useAuth` and add:

```tsx
const { loginWithGoogle } = useAuth();

const handleGoogleLogin = async () => {
  try {
    await loginWithGoogle();
  } catch {
    setError("Google sign-in failed. Please try again.");
  }
};
```

`loginWithGoogle()` triggers a Supabase OAuth redirect. The user lands on `/auth/callback` which already handles role-based routing.

### Step 5 — Handle the error state

The login page likely already has an `error` state variable. Reuse it for the Google error message.

---

## Acceptance Criteria

- [ ] "Continue with Google" button appears below the email/password form with a divider.
- [ ] Clicking the button calls `loginWithGoogle()` and redirects to Google's OAuth consent screen.
- [ ] After Google auth, the user is redirected to the correct dashboard based on their role.
- [ ] If Google auth fails, an error message is shown on the login page.
- [ ] Button styling is consistent with the rest of the login form.
- [ ] No TypeScript errors.
