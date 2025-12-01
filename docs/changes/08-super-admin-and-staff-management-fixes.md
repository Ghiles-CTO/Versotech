# Super Admin Permission System & Staff Management Fixes

**Date:** 2025-11-30
**Priority:** HIGH
**Status:** Completed

---

## Executive Summary

This change addresses critical issues with the super admin permission system that was preventing the Admin page from appearing in the sidebar, and fixes the staff deactivation API which was returning unauthorized errors. Root cause was RLS policy infinite recursion and incorrect Supabase client usage patterns.

---

## Issues Fixed

### Issue #1: Super Admin Page Not Showing in Sidebar (Production)

**Severity:** HIGH
**Symptoms:** Admin link not appearing in sidebar for user with `super_admin` permission
**User:** cto@versoholdings.com (confirmed to have `super_admin` permission in database)

#### Root Cause Analysis

The `staff_permissions` table had an RLS policy that caused **infinite recursion**:

```sql
-- PROBLEMATIC POLICY (caused infinite recursion)
CREATE POLICY "staff_permissions_admin_manage" ON staff_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_permissions sp
      WHERE sp.user_id = auth.uid()
      AND sp.permission = 'super_admin'
    )
  );
```

**Why it failed:** When a user tried to SELECT from `staff_permissions`, PostgreSQL checked the RLS policy, which itself SELECTed from `staff_permissions`, triggering the same policy check again... infinitely.

**Error returned:**
```json
{
  "permError": "infinite recursion detected in policy for relation \"staff_permissions\""
}
```

#### Fix Applied

**Migration:** `fix_staff_permissions_rls_recursion` (applied via Supabase MCP)

```sql
-- Drop the recursive policy
DROP POLICY IF EXISTS "staff_permissions_admin_manage" ON staff_permissions;

-- Keep only the simple self-read policy
-- staff_permissions_select_own: user_id = auth.uid()
```

**Design Decision:** Users can only read their OWN permissions. Admin operations on other users' permissions are done via service client (bypasses RLS).

---

### Issue #2: Staff Deactivate API Returning "Unauthorized"

**Severity:** HIGH
**File:** `src/app/api/admin/staff/[id]/deactivate/route.ts`

**Symptoms:** Clicking "Deactivate" button in Admin → Staff Management returned 401 Unauthorized

#### Root Cause

The API route used `createServiceClient()` for authentication:

```typescript
// WRONG - Service client doesn't read cookies
const supabase = await createServiceClient()
const { data: { user } } = await supabase.auth.getUser()  // Always null!
```

The **service role client** is for admin operations (bypasses RLS) but does NOT have access to the user's session cookies. It always returns `null` for `getUser()`.

#### Fix Applied

```typescript
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function PATCH(...) {
  try {
    // Use regular client for authentication (reads cookies)
    const authSupabase = await createClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service client for admin operations (bypasses RLS)
    const supabase = createServiceClient()

    // Check permissions using service client
    const { data: permission } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .in('permission', ['super_admin', 'manage_staff'])
      .limit(1)
      .single()

    // ... rest of deactivation logic
  }
}
```

**Pattern:** This is the same pattern used in `/api/admin/staff/invite/route.ts` which was already working correctly.

---

### Issue #3: Debug Endpoint Cleanup

**File:** `src/app/api/debug/permissions/route.ts` (DELETED)

A temporary debug endpoint was created during troubleshooting to diagnose the RLS issue:

```typescript
// TEMPORARY DEBUG ENDPOINT - DELETE AFTER TESTING
export async function GET() {
  // Returns user's profile and permissions for debugging
}
```

This endpoint was removed after the root cause was identified and fixed.

---

### Issue #4: Test User Cleanup

**Database Operation:** Deleted test users to allow re-testing with fresh accounts

**Users Deleted:**
- `py.moussaouighiles@gmail.com` (ID: 3b6fd6b2-44c2-4f60-b446-a641f7d36bff)
- `gm.moussaouighiles@gmail.com` (ID: eecc78ab-bff3-4138-a428-f47d8084e7fc)

**SQL Applied:**
```sql
-- Delete from related tables first
DELETE FROM investor_users WHERE user_id IN ('3b6fd6b2-...', 'eecc78ab-...');
DELETE FROM staff_permissions WHERE user_id IN ('3b6fd6b2-...', 'eecc78ab-...');
DELETE FROM profiles WHERE id IN ('3b6fd6b2-...', 'eecc78ab-...');
DELETE FROM auth.users WHERE id IN ('3b6fd6b2-...', 'eecc78ab-...');
```

---

## Architecture: Permissions vs Roles

### Understanding the Dual System

| Concept | Storage | Purpose |
|---------|---------|---------|
| **Roles** | `profiles.role` | Basic access level (investor, staff_admin, staff_ops, staff_rm) |
| **Permissions** | `staff_permissions` table | Fine-grained feature access (super_admin, manage_investors, etc.) |

### Permission Flow

```
1. User logs in
2. auth.ts → getCurrentUser() fetches profile
3. For staff users, also fetches permissions from staff_permissions table
4. Sidebar filters nav items based on requiredPermission field
5. Admin nav item has requiredPermission: 'super_admin'
```

### Files Involved in Permission System

| File | Role |
|------|------|
| `src/lib/auth.ts` | Fetches permissions for staff users |
| `src/components/layout/sidebar.tsx` | Filters nav items by requiredPermission |
| `src/app/(staff)/versotech/staff/admin/layout.tsx` | Server-side protection for admin routes |
| `src/app/api/admin/staff/invite/route.ts` | Grants super_admin permission if checkbox checked |

---

## Supabase Client Usage Pattern

### The Pattern (for admin API routes)

```typescript
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  // STEP 1: Use regular client for authentication
  const authSupabase = await createClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // STEP 2: Use service client for admin operations
  const supabase = createServiceClient()

  // Now you can bypass RLS for admin operations
  const { data } = await supabase.from('some_table').select('*')
}
```

### Why Two Clients?

| Client | Reads Cookies? | Bypasses RLS? | Use Case |
|--------|---------------|---------------|----------|
| `createClient()` | Yes | No | Authentication, user-scoped queries |
| `createServiceClient()` | No | Yes | Admin operations, bypassing RLS |

---

## Files Modified

| File | Changes |
|------|---------|
| `src/app/api/admin/staff/[id]/deactivate/route.ts` | Use regular client for auth, service client for operations |

## Files Deleted

| File | Reason |
|------|--------|
| `src/app/api/debug/permissions/route.ts` | Temporary debug endpoint no longer needed |

## Database Migrations

| Migration Name | Changes |
|---------------|---------|
| `fix_staff_permissions_rls_circular_dependency` | Initial attempt (created two policies) |
| `fix_staff_permissions_rls_recursion` | Final fix (dropped recursive policy) |

---

## Verification

### Build Status
```
✓ Compiled successfully
✓ All routes generated without errors
```

### Checklist
- [x] Super admin can see Admin link in sidebar
- [x] Staff deactivation works without 401 error
- [x] Debug endpoint removed
- [x] Test users deleted
- [x] Build passes

---

## Commits

| Commit | Description |
|--------|-------------|
| `aa3ab15` | Fix staff deactivate API auth and remove debug endpoint |

---

## Lessons Learned

### 1. RLS Self-References Cause Infinite Recursion
Never create an RLS policy that queries the same table it's protecting. Use a different approach:
- Simple `user_id = auth.uid()` for self-access
- Service client for admin operations

### 2. Service Client Cannot Authenticate Users
The service role client is for bypassing RLS, not for reading user sessions. Always use the regular client for `auth.getUser()`.

### 3. Debug Endpoints Should Be Temporary
When creating debug endpoints:
- Add clear "TEMPORARY - DELETE AFTER TESTING" comments
- Remove them immediately after debugging is complete
- Never commit debug endpoints to production

---

## Author

Claude Code - Staff Management & Permission System Debug
2025-11-30
