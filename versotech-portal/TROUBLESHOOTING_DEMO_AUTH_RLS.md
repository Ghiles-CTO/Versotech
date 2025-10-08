# Troubleshooting Guide: Demo Authentication & RLS Issues

**Created:** October 8, 2025  
**Context:** Request Management Enhancement Implementation

---

## Problem Summary

When implementing features that require database updates (priority changes, status changes, staff assignment), the application failed with errors even though authentication was working for read operations.

---

## Errors Encountered

### Error 1: "Failed to update priority/status"
**Symptom:**
```
Failed to update priority
at updatePriority (src\components\staff\requests\request-priority-selector.tsx:69:15)
```

**Root Cause:**
- Demo cookie authentication doesn't create a real Supabase auth session
- RLS policies check for `auth.uid()` which is NULL for demo sessions
- UPDATE policy on `request_tickets` requires `auth.uid()` to match staff profile

**RLS Policy That Was Blocking:**
```sql
CREATE POLICY request_tickets_update_staff ON request_tickets FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND p.role LIKE 'staff_%'
  )
);
```

### Error 2: "Invalid input syntax for type uuid: 'demo-staff-1'"
**Symptom:**
```
[StaffRequests] API returned error: 
"Failed to fetch requests — invalid input syntax for type uuid: \"demo-staff-1\" — Code: 22P02" 500
```

**Root Cause:**
- Demo cookie user IDs were not valid UUIDs (e.g., "demo-staff-1")
- Database UUID columns reject non-UUID values
- Filter `assigned_to = 'me'` tried to query with non-UUID value

### Error 3: "Database enum doesn't have new values"
**Symptom:**
```
Database error when updating priority to 'urgent' or status to 'awaiting_info'
```

**Root Cause:**
- Database uses PostgreSQL ENUMs for priority and status
- New values ('urgent', 'awaiting_info', 'cancelled') weren't in the enum definition
- TypeScript types were updated but database schema wasn't

### Error 4: "You're importing a component that needs 'next/headers'"
**Symptom:**
```
Error: × You're importing a component that needs "next/headers". 
That only works in a Server Component which is not supported in the pages/ directory.
Import trace: ./src/lib/auth.ts -> ./src/components/layout/app-layout.tsx -> ./src/app/(...)/analytics/page.tsx
```

**Root Cause:**
- Analytics page was a client component (`"use client"`)
- It imported `AppLayout` which is a server component
- Server components can't be imported into client components
- `AppLayout` uses `getProfile()` which calls `next/headers`

---

## Solutions Applied

### Solution 1: Service Client for Demo Sessions

**What Was Done:**
Modified `/api/requests/[id]/route.ts` to detect demo sessions and use service client to bypass RLS.

**Before:**
```typescript
export async function PATCH(request: NextRequest, { params }) {
  const supabase = await createClient()  // Uses RLS
  const { data: { user } } = await supabase.auth.getUser()
  // ... update with RLS enabled (fails for demo users)
}
```

**After:**
```typescript
export async function PATCH(request: NextRequest, { params }) {
  const cookieStore = await cookies()
  const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)
  let supabase: any
  let userId: string

  if (demoCookie) {
    const demoSession = parseDemoSession(demoCookie.value)
    if (demoSession && demoSession.role.startsWith('staff_')) {
      userId = demoSession.id
      supabase = createServiceClient() // Bypasses RLS!
    }
  } else {
    supabase = await createClient() // Uses RLS for real users
    const { data: { user } } = await supabase.auth.getUser()
    userId = user.id
  }
  
  // ... rest of update logic
}
```

**Key Insight:** `createServiceClient()` uses the service role key which bypasses RLS policies. This is safe because we already validated staff access.

### Solution 2: UUID Validation for Filters

**What Was Done:**
Added UUID validation before using demo user IDs in database queries.

**Before:**
```typescript
if (filters.assigned_to === 'me') {
  query = query.eq('assigned_to', user.id)  // Crashes if user.id isn't UUID
}
```

**After:**
```typescript
if (filters.assigned_to === 'me') {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(user.id)) {
    query = query.eq('assigned_to', user.id)
  } else {
    // For demo users with non-UUID IDs, return empty results
    query = query.eq('id', '00000000-0000-0000-0000-000000000000')
  }
}
```

**Recommended:** Always use valid UUIDs in demo cookies:
```json
{"id":"2a833fc7-b307-4485-a4c1-4e5c5a010e74","email":"admin@versotech.com","role":"staff_admin","displayName":"Admin"}
```

### Solution 3: Database Enum Migration

**What Was Done:**
Used Supabase MCP to add new enum values to existing types.

```sql
-- Add 'urgent' to request_priority_enum
ALTER TYPE request_priority_enum ADD VALUE IF NOT EXISTS 'urgent';

-- Add 'awaiting_info' to request_status_enum  
ALTER TYPE request_status_enum ADD VALUE IF NOT EXISTS 'awaiting_info';

-- Add 'cancelled' to request_status_enum
ALTER TYPE request_status_enum ADD VALUE IF NOT EXISTS 'cancelled';
```

**Key Insight:** PostgreSQL ENUMs can't remove values once added, but you can safely add new values with `ADD VALUE IF NOT EXISTS`.

### Solution 4: Server/Client Component Architecture

**What Was Done:**
Split analytics page into server wrapper and client component.

**Before (Broken):**
```typescript
// page.tsx
"use client"
import { AppLayout } from '@/components/layout/app-layout' // Server component!

export default function Analytics() {
  return <AppLayout>...</AppLayout>  // Can't use server component in client!
}
```

**After (Working):**
```typescript
// page.tsx (Server Component)
import { AppLayout } from '@/components/layout/app-layout'
import { RequestAnalyticsClient } from './analytics-client'

export default async function RequestAnalyticsPage() {
  return (
    <AppLayout brand="versotech">
      <RequestAnalyticsClient />
    </AppLayout>
  )
}

// analytics-client.tsx (Client Component)
"use client"
export function RequestAnalyticsClient() {
  // All client-side logic here
  return <div>...</div>
}
```

**Key Insight:** Server components can import client components, but NOT vice versa.

### Solution 5: Multi-Role API Filter

**What Was Done:**
Updated `/api/profiles` to handle comma-separated role filters.

**Before:**
```typescript
if (roleFilter) {
  query = query.eq('role', roleFilter)  // Only works for single role
}
```

**After:**
```typescript
if (roleFilter) {
  const roles = roleFilter.split(',').map(r => r.trim())
  if (roles.length === 1) {
    query = query.eq('role', roles[0])
  } else {
    query = query.in('role', roles)  // Works for multiple roles
  }
}
```

**Usage:**
```typescript
fetch('/api/profiles?role=staff_admin,staff_ops,staff_rm')
```

---

## Pattern Recognition: Common Issues

### Issue Type 1: RLS Blocking Demo Users
**Symptoms:**
- ✅ READ operations work fine
- ❌ UPDATE/DELETE operations fail
- ❌ INSERT operations fail

**Diagnosis:**
```sql
-- Check RLS policies
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'your_table';
```

**Solution Pattern:**
```typescript
// In API route
const cookieStore = await cookies()
const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)

if (demoCookie) {
  // Demo session - use service client to bypass RLS
  const supabase = createServiceClient()
} else {
  // Real auth - use regular client with RLS
  const supabase = await createClient()
}
```

### Issue Type 2: Non-UUID Foreign Keys
**Symptoms:**
- Error: `invalid input syntax for type uuid: "demo-user-xyz"`
- Code: `22P02`

**Diagnosis:**
- Check if your demo user IDs are valid UUIDs
- Look for queries using `user.id` in WHERE/JOIN clauses

**Solution Pattern:**
```typescript
// Validate before using in query
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
if (!uuidRegex.test(userId)) {
  // Handle non-UUID case (skip filter, use fallback, etc.)
}
```

**Best Practice:** Always use valid UUIDs in demo cookies.

### Issue Type 3: TypeScript vs Database Type Mismatch
**Symptoms:**
- TypeScript allows value
- Database rejects with constraint violation
- "invalid input value for enum"

**Diagnosis:**
```sql
-- Check enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'your_enum_type'::regtype;
```

**Solution Pattern:**
```sql
-- Add missing values
ALTER TYPE your_enum_type ADD VALUE IF NOT EXISTS 'new_value';
```

**Validation Update:**
```typescript
// Update TypeScript validators to match
export function isValidPriority(value: any): value is RequestPriority {
  return ['low', 'normal', 'high', 'urgent'].includes(value)
}
```

### Issue Type 4: Server/Client Component Mixing
**Symptoms:**
- `You're importing a component that needs "next/headers"`
- Build error (not runtime error)

**Diagnosis:**
- Check if client component (`"use client"`) imports server component
- Server components use: `cookies()`, `headers()`, `await` in render, DB calls

**Solution Pattern:**
```
page.tsx (Server)
  └─> AppLayout (Server - uses cookies/headers)
       └─> YourClientComponent (Client - "use client")
           └─> All interactive logic here
```

**Rule:** Server → Client = ✅ | Client → Server = ❌

---

## Debugging Checklist

When you encounter similar issues:

### ✅ Step 1: Check Authentication Type
```typescript
console.log('[DEBUG] Auth type:', { 
  hasDemoCookie: !!demoCookie,
  hasRealAuth: !!user,
  userId: user?.id 
})
```

### ✅ Step 2: Check RLS Policies
```sql
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

### ✅ Step 3: Verify Database Enums
```sql
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = 'your_enum'::regtype;
```

### ✅ Step 4: Test with Service Client
```typescript
// Temporarily bypass RLS to isolate issue
const supabase = createServiceClient()
const result = await supabase.from('table').update({...})
console.log('Service client result:', result)
```

### ✅ Step 5: Check UUID Validity
```typescript
const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
console.log('Is valid UUID:', isUUID, id)
```

---

## Best Practices

### 1. Demo Authentication
```json
// ✅ GOOD - Valid UUID
{"id":"2a833fc7-b307-4485-a4c1-4e5c5a010e74","role":"staff_admin"}

// ❌ BAD - Not a UUID
{"id":"demo-staff-1","role":"staff_admin"}
```

### 2. API Route Pattern
```typescript
export async function POST(request: NextRequest) {
  // 1. Detect auth type
  const cookieStore = await cookies()
  const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)
  
  // 2. Choose appropriate client
  const supabase = demoCookie 
    ? createServiceClient()  // Bypass RLS for demo
    : await createClient()   // Use RLS for real users
  
  // 3. Validate access (still important!)
  if (demoCookie) {
    const session = parseDemoSession(demoCookie.value)
    if (!session?.role.startsWith('staff_')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  
  // 4. Perform operation
  const { data, error } = await supabase.from('table').update({...})
}
```

### 3. Enum Updates
```sql
-- ✅ Safe - Won't fail if exists
ALTER TYPE my_enum ADD VALUE IF NOT EXISTS 'new_value';

-- ❌ Unsafe - Fails if exists
ALTER TYPE my_enum ADD VALUE 'new_value';
```

### 4. Component Architecture
```
✅ Correct:
- page.tsx (Server) → imports AppLayout (Server) → wraps ClientComponent (Client)

❌ Wrong:
- page.tsx ("use client") → imports AppLayout (Server) → Build Error!
```

---

## What Fixed the Request Management Issues

### 1. API Route Authentication Fix
**File:** `src/app/api/requests/[id]/route.ts`

**Changes:**
- Added demo cookie detection
- Used `createServiceClient()` for demo sessions
- Kept `createClient()` for real auth sessions

**Result:** Updates now work because service client bypasses RLS policies.

### 2. UUID Filter Validation
**File:** `src/app/api/staff/requests/route.ts`

**Changes:**
- Added regex validation before using user.id in filters
- Returns empty result for non-UUID demo IDs instead of crashing

**Result:** "My Tasks" filter doesn't crash with demo accounts.

### 3. Database Enum Migration
**Migration Applied:**
```sql
ALTER TYPE request_priority_enum ADD VALUE IF NOT EXISTS 'urgent';
ALTER TYPE request_status_enum ADD VALUE IF NOT EXISTS 'awaiting_info';
ALTER TYPE request_status_enum ADD VALUE IF NOT EXISTS 'cancelled';
```

**Result:** Database accepts new priority and status values.

### 4. Validation Updates
**Files:**
- `src/lib/reports/validation.ts` (3 locations)
- `src/types/reports.ts` (2 locations)

**Changes:**
- Added 'urgent' to all priority validators
- Added priority field to `UpdateRequestTicket` interface

**Result:** TypeScript and runtime validation accept new values.

### 5. Server/Client Component Split
**Files:**
- `src/app/(staff)/versotech/staff/requests/analytics/page.tsx` - Server wrapper
- `src/app/(staff)/versotech/staff/requests/analytics/analytics-client.tsx` - Client logic

**Changes:**
- Moved `"use client"` to separate component
- Server component handles AppLayout wrapper
- Client component handles state and interactions

**Result:** No more build errors, proper Next.js architecture.

### 6. Multi-Role Profile Filtering
**File:** `src/app/api/profiles/route.ts`

**Changes:**
```typescript
// Parse comma-separated roles
if (roleFilter) {
  const roles = roleFilter.split(',').map(r => r.trim())
  if (roles.length === 1) {
    query = query.eq('role', roles[0])
  } else {
    query = query.in('role', roles)
  }
}
```

**Result:** Staff assignment dialog can fetch multiple role types in one request.

---

## Key Learnings

### 1. RLS vs Service Client
- **RLS policies** protect data based on `auth.uid()`
- **Service client** bypasses RLS (uses service_role key)
- **When to use service client:**
  - ✅ Demo/testing environments after manual auth validation
  - ✅ Server-side operations where you've verified access
  - ✅ Admin operations that need to bypass user-level restrictions
  - ❌ Never in client-side code
  - ❌ Never without manual access validation

### 2. Demo Auth Limitations
- Demo cookies don't create Supabase auth sessions
- `auth.uid()` returns NULL for demo sessions
- Any RLS policy using `auth.uid()` will fail
- **Solution:** Detect demo sessions and use service client

### 3. Database Schema Sync
- TypeScript types ≠ Database schema
- Always sync both when adding enum values
- Use migrations for schema changes
- Update TypeScript types AND validators

### 4. Next.js Component Rules
- Server components: async, use cookies/headers, no useState/useEffect
- Client components: interactive, hooks, event handlers
- **Rule:** Server can wrap Client, but Client can't import Server

---

## Quick Reference Commands

### Check RLS Policies
```sql
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'your_table';
```

### Check Enum Values
```sql
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'your_enum_type'::regtype;
```

### Test UUID Validity
```javascript
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
console.log(uuidRegex.test('your-id'))
```

### Test Service Client
```typescript
// In API route
const serviceClient = createServiceClient()
const { data, error } = await serviceClient
  .from('table')
  .update({...})
  .eq('id', id)
console.log('Result:', { data, error })
```

---

## Files Modified for Fix

1. ✅ `src/app/api/requests/[id]/route.ts` - Service client for demo auth
2. ✅ `src/app/api/staff/requests/route.ts` - UUID validation in filters
3. ✅ `src/app/api/profiles/route.ts` - Multi-role filtering
4. ✅ `src/lib/reports/validation.ts` - Added urgent priority validation
5. ✅ `src/types/reports.ts` - Updated priority type
6. ✅ `src/lib/reports/constants.ts` - Added urgent priority config
7. ✅ `src/app/(staff)/versotech/staff/requests/analytics/page.tsx` - Server wrapper
8. ✅ `src/app/(staff)/versotech/staff/requests/analytics/analytics-client.tsx` - Client component

**Database Migration:**
- ✅ Applied via Supabase MCP: `add_urgent_priority_and_statuses`

---

## Prevention Tips

### Before Adding New Enum Values:
1. Update database ENUM first (via migration)
2. Update TypeScript types
3. Update validators (3 places usually):
   - Type guards (`isValid...`)
   - Form validation (`validate...`)
   - API validation
4. Update UI constants/configs
5. Test with both demo and real auth

### Before Creating Client Components:
1. Check if it needs server-only features (cookies, headers, DB)
2. If yes, split: Server wrapper + Client component
3. Pass data as props from server to client
4. Keep `"use client"` at the top of interactive components only

### Before Using User IDs in Queries:
1. Check if it's a UUID column in DB
2. Validate user ID is valid UUID
3. Handle non-UUID case gracefully
4. OR ensure demo cookies always use valid UUIDs

---

## Conclusion

The issues were caused by a combination of:
1. **RLS policies blocking demo users** (auth.uid() = NULL)
2. **Non-UUID demo IDs** causing database errors
3. **Missing enum values** in database schema
4. **Server/client component mixing** causing build errors

**All fixed by:**
1. Using service client for validated demo sessions
2. Validating UUIDs before database queries
3. Adding enum values via migration
4. Proper Next.js component architecture

**Current Status:** ✅ All features working with demo accounts


