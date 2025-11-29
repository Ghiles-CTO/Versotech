# Change Log #05: Messaging Avatar Bug Fix

**Date**: November 29, 2025
**Author**: Claude Code
**Status**: ✅ Completed
**Priority**: HIGH
**Affected Systems**: Messaging (Staff + Investor portals)

---

## Problem

Message sender avatars always showed initials instead of actual profile pictures in the messaging system, even when users had avatar URLs set in their profiles.

**Symptoms**:
- Staff messages showed initials (e.g., "JM") instead of profile photo
- Investor messages showed initials instead of profile photo
- Sidebar conversation list showed avatars correctly (inconsistent behavior)

---

## Root Cause

The `avatar_url` field was **missing from 6 Supabase queries** while being correctly included in the main `/api/conversations` route. This was an inconsistent implementation - whoever wrote the code included `avatar_url` in one place but forgot it in others.

### Database Verified
```
profiles.avatar_url column EXISTS (TEXT, nullable)
FK: messages.sender_id → profiles.id
FK: conversation_participants.user_id → profiles.id
```

### Data Verified
- Julien Machot (staff_admin): HAS avatar_url set
- Ghiles Moussaoui (investor): HAS avatar_url set

---

## Fix Applied

Added `avatar_url` to sender/profiles joins in 6 locations across 3 files:

### File 1: `api/conversations/[id]/messages/route.ts`

**Line 35** (GET messages):
```typescript
sender:sender_id (
  id,
  display_name,
  email,
  role,
  avatar_url  // ← ADDED
)
```

**Line 111** (POST message):
```typescript
sender:sender_id (
  id,
  display_name,
  email,
  role,
  avatar_url  // ← ADDED
)
```

### File 2: `(staff)/versotech/staff/messages/page.tsx`

**Line 31** (profiles join):
```typescript
profiles:user_id (
  id,
  display_name,
  email,
  role,
  avatar_url  // ← ADDED
)
```

**Line 50** (sender join):
```typescript
sender:sender_id (
  id,
  display_name,
  email,
  role,
  avatar_url  // ← ADDED
)
```

### File 3: `(investor)/versoholdings/messages/page.tsx`

**Line 50** (profiles join):
```typescript
profiles:user_id (
  id,
  display_name,
  email,
  role,
  avatar_url  // ← ADDED
)
```

**Line 69** (sender join):
```typescript
sender:sender_id (
  id,
  display_name,
  email,
  role,
  avatar_url  // ← ADDED
)
```

---

## Data Flow Verification

1. **Query**: `avatar_url` (snake_case) → fetched from DB ✅
2. **Normalize**: `avatarUrl: profile.avatar_url` → mapped in `supabase.ts` ✅
3. **Component**: `senderAvatarUrl={message.sender?.avatarUrl}` → used in UI ✅

---

## Does It Break Anything?

**NO** - This change only adds a field to existing joins. The joins on profiles for `id, display_name, email, role` were already happening. Same RLS rules apply.

### RLS Consideration
- `profiles` RLS: `(auth.uid() = id) OR user_is_staff()`
- SSR pages use `createServiceClient()` → bypasses RLS ✅
- API route uses same join pattern as before

---

## Pre-existing Limitation (NOT caused by this fix)

Realtime messages arrive via Supabase subscriptions without sender join data, so new incoming messages show initials until page refresh. This is architectural and existed before.

---

## Files Modified

| File | Lines Changed |
|------|---------------|
| `versotech-portal/src/app/api/conversations/[id]/messages/route.ts` | 35, 111 |
| `versotech-portal/src/app/(staff)/versotech/staff/messages/page.tsx` | 31, 50 |
| `versotech-portal/src/app/(investor)/versoholdings/messages/page.tsx` | 50, 69 |

---

## Testing

- Verified database schema has `avatar_url` column
- Verified FK relationships are correct
- Verified normalization functions handle the field
- Verified UI components use `avatarUrl` prop correctly

---

**Status**: ✅ Ready to deploy
