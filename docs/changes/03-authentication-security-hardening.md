# Authentication Security Hardening

**Date:** November 25, 2025
**Commit:** `8f0ed8c` - Fix critical authentication security vulnerabilities and add role escalation prevention
**Author:** Claude (AI Assistant)

---

## Overview

This document details critical security vulnerabilities discovered in the authentication system and the comprehensive fixes applied. These changes affect how users are assigned roles, how staff can access the platform, and include a database-level protection against privilege escalation.

---

## Security Vulnerabilities Discovered

### 1. Signup Role Escalation (CRITICAL)
**Location:** `/api/auth/signup/route.ts`

**Problem:** Anyone could sign up with `portal=staff` parameter and automatically receive the `staff_ops` role, regardless of their email domain.

**Risk:** Unauthorized users could gain staff access to sensitive investor data, deal management, and financial information.

### 2. Create-Profile Role Injection (CRITICAL)
**Location:** `/api/auth/create-profile/route.ts`

**Problem:** The API accepted a `role` parameter from the client, allowing attackers to specify any role they wanted.

**Risk:** During OAuth callback or profile creation, a malicious client could inject `staff_admin` role.

### 3. Signin Metadata Trust (HIGH)
**Location:** `/api/auth/signin/route.ts`

**Problem:** The `resolveDefaultRole()` function could trust user metadata for role assignment, which could be manipulated.

**Risk:** Users could potentially influence their role assignment through manipulated metadata.

### 4. Profile Self-Escalation via RLS (CRITICAL)
**Location:** Database RLS policy `can_update_own_profile`

**Problem:** The RLS policy allowed users to UPDATE any column on their own profile, including the `role` column. Any authenticated user could execute:
```sql
UPDATE profiles SET role = 'staff_admin' WHERE id = auth.uid()
```

**Risk:** Any investor could immediately promote themselves to staff_admin and gain full administrative access.

---

## Fixes Applied

### Fix 1: Block Non-Company Staff Signups
**File:** `versotech-portal/src/app/api/auth/signup/route.ts`

```typescript
const emailDomain = email.toLowerCase().split('@')[1]
const COMPANY_DOMAINS = ['versotech.com', 'verso.com']

// Block non-company email signups for staff portal
if (portalContext === 'staff' && !COMPANY_DOMAINS.includes(emailDomain)) {
  return NextResponse.json({
    error: 'Staff registration requires an invitation or a company email (@versotech.com, @verso.com). Please contact your administrator.'
  }, { status: 403 })
}
```

Also removed `role` from `user_metadata` in signUp options - role is never stored in auth metadata.

### Fix 2: Server-Side Role Derivation
**File:** `versotech-portal/src/app/api/auth/create-profile/route.ts`

- Removed `role` parameter from accepted request body
- Role is now derived server-side using this priority:
  1. If admin pre-created a profile (invitation flow), use that role
  2. If email domain is `@versotech.com` or `@verso.com`, assign `staff_ops`
  3. Otherwise, assign `investor`

```typescript
const { userId, email, displayName } = body  // NO role param

// Check for admin-created profile first
const { data: existingProfile } = await serviceSupabase
  .from('profiles')
  .select('role, display_name')
  .eq('email', email.toLowerCase())
  .maybeSingle()

let role = 'investor'
if (existingProfile?.role) {
  role = existingProfile.role  // Use admin-assigned role
} else {
  const emailDomain = email.toLowerCase().split('@')[1]
  if (COMPANY_DOMAINS.includes(emailDomain)) {
    role = 'staff_ops'
  }
}
```

### Fix 3: Fix resolveDefaultRole()
**File:** `versotech-portal/src/app/api/auth/signin/route.ts`

Changed to never trust metadata for staff roles:

```typescript
const resolveDefaultRole = (portal, metadataRole, email) => {
  // SECURITY: Never trust metadataRole for staff roles
  if (portal === 'staff') {
    if (isStaffEmail(email)) {
      return 'staff_ops'
    }
    return null  // DENY - must have pre-existing profile from invite
  }
  return 'investor'
}
```

### Fix 4: Remove Role from OAuth Callback
**File:** `versotech-portal/src/app/auth/callback/page.tsx`

Removed role from the create-profile API call:

```typescript
const createResponse = await fetch('/api/auth/create-profile', {
  body: JSON.stringify({
    userId: data.user.id,
    email: data.user.email,
    displayName: metadataDisplayName
    // SECURITY: Role removed - derived server-side only
  })
})
```

### Fix 5: Remove Register Button from Staff Login
**File:** `versotech-portal/src/app/(public)/versotech/login/page.tsx`

- Removed the "Register New Operator" toggle and signup form
- Staff with non-company emails must be invited by admin
- Company emails can still sign in/up normally

### Fix 6: Add Google OAuth to Staff Login
**File:** `versotech-portal/src/app/(public)/versotech/login/page.tsx`

Added Google OAuth button for staff authentication:

```typescript
const handleGoogleSignIn = async () => {
  setIsLoading(true)
  await signInWithGoogle('staff')
}
```

### Fix 7: Database Trigger to Prevent Role Self-Escalation
**Migrations:**
- `prevent_role_self_escalation`
- `fix_prevent_role_self_update_search_path`

Created a database trigger that blocks users from changing their own role:

```sql
CREATE OR REPLACE FUNCTION prevent_role_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF auth.uid() = OLD.id THEN
      IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
        RAISE EXCEPTION 'Cannot modify your own role. Contact an administrator.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_prevent_role_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_self_update();
```

**How it works:**
- Fires before any UPDATE on the profiles table
- If the role column is being changed AND the user is updating their own profile
- It checks if the request is from the service role (admin operations)
- If not service role, it raises an exception blocking the update

---

## Security Model Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROLE ASSIGNMENT FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│  WHO CAN GET STAFF ROLE?                                        │
│  ├─ Company email (@versotech.com, @verso.com) → staff_ops     │
│  └─ Admin invitation → pre-assigned role in profiles table     │
├─────────────────────────────────────────────────────────────────┤
│  WHO GETS INVESTOR ROLE?                                        │
│  └─ Everyone else (default)                                    │
├─────────────────────────────────────────────────────────────────┤
│  PROTECTION LAYERS                                              │
│  1. API Layer: Role never accepted from client                 │
│  2. Server Layer: Role derived from email domain or invite     │
│  3. Database Layer: Trigger blocks self-role-updates           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files Modified

| File | Changes |
|------|---------|
| `src/app/api/auth/signup/route.ts` | Block non-company staff signups, remove role from metadata |
| `src/app/api/auth/signin/route.ts` | Fix `resolveDefaultRole()` to never trust metadata |
| `src/app/api/auth/create-profile/route.ts` | Remove role param, derive server-side only |
| `src/app/auth/callback/page.tsx` | Remove role from create-profile API call |
| `src/app/(public)/versotech/login/page.tsx` | Remove register form, add Google OAuth |
| `src/lib/auth-client.ts` | Auth client improvements |
| `src/lib/supabase/client.ts` | Disable autoRefreshToken (middleware handles it) |
| `src/lib/session-manager.ts` | Session management improvements |
| `src/middleware.ts` | Token refresh and session handling improvements |

---

## Database Migrations Applied

1. **`prevent_role_self_escalation`** (Nov 25, 2025)
   - Creates `prevent_role_self_update()` function
   - Creates `profiles_prevent_role_escalation` trigger

2. **`fix_prevent_role_self_update_search_path`** (Nov 25, 2025)
   - Fixes security best practice warning by setting explicit search_path

---

## Testing Checklist

- [ ] Staff signup with @gmail.com → Should be blocked with "requires invitation" error
- [ ] Staff signup with @versotech.com → Should be allowed, gets `staff_ops` role
- [ ] Admin invites staff@external.com → Staff should be able to complete registration
- [ ] OAuth callback with fake role in metadata → Role should be ignored, correct role assigned
- [ ] Google OAuth on staff portal → Should work, correct role assigned based on email
- [ ] Investor signup → Should work normally, gets `investor` role
- [ ] User tries to update own role via Supabase client → Should be blocked by trigger

---

## Rollback Instructions

If issues occur with these changes, here's how to rollback:

### 1. Revert Code Changes
```bash
git revert 8f0ed8c
```

### 2. Remove Database Trigger (if needed)
Run this SQL in Supabase Dashboard → SQL Editor:
```sql
DROP TRIGGER IF EXISTS profiles_prevent_role_escalation ON profiles;
DROP FUNCTION IF EXISTS prevent_role_self_update();
```

**WARNING:** Removing the trigger re-exposes the role escalation vulnerability. Only do this if the trigger is causing issues, and fix it immediately.

---

## Known Limitations

1. **Company email whitelist is hardcoded**: The domains `versotech.com` and `verso.com` are hardcoded in multiple files. Consider moving to environment variables or database configuration.

2. **Service role check in trigger**: The trigger checks `request.jwt.claim.role` which may not be set in all contexts. The service client should always have this set, but edge cases may exist.

3. **Admin invitation flow**: For the invitation flow to work, admins must pre-create profiles with the correct role BEFORE the user completes registration.

---

## Related Files (For Context)

- `src/app/api/admin/staff/invite/route.ts` - Staff invitation API
- `src/lib/supabase/server.ts` - Server-side Supabase clients (including service client)
- `supabase/migrations/` - Database migrations folder

---

## Environment Requirements

For Google OAuth to work on staff portal:
1. `NEXT_PUBLIC_APP_URL` must be set correctly in Vercel
2. Supabase Dashboard → Authentication → URL Configuration must include production redirect URLs
3. Google OAuth must be enabled in Supabase with correct client ID/secret

---

## Contact

If you encounter issues with these changes, the key areas to check are:
1. Database trigger not firing → Check if trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'profiles_prevent_role_escalation'`
2. OAuth not redirecting correctly → Check `NEXT_PUBLIC_APP_URL` and Supabase redirect URLs
3. Staff can't sign in → Check if their profile exists and has correct role
4. Role not being assigned correctly → Check server logs for `[create-profile]` and `[signin]` messages
