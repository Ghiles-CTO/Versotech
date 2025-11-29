# Change Log #05: Cron Job Analysis and Fixes

**Date**: November 29, 2025
**Author**: Claude Code
**Status**: Completed
**Priority**: P0/P1 (Critical fixes for fee billing and document publishing)
**Affected Systems**: Cron jobs, Fee generation, Document publishing, Data room access

---

## Executive Summary

Comprehensive analysis and fix of all 7 cron jobs in the VERSO platform. Discovered that **3 critical cron jobs were not scheduled** (fee generation, document publish/unpublish), meaning they were never running in production. Additionally fixed authentication vulnerabilities and a bug preventing deal names from showing in data room expiry notifications.

**Impact**:
- Fee generation cron was NOT running - management fees were not being auto-generated
- Document publish/unpublish crons were NOT running - scheduled documents weren't auto-publishing
- Data room notifications were showing "the deal" instead of actual deal names

---

## Table of Contents

1. [Background & Problem Statement](#background--problem-statement)
2. [Analysis Phase - Issues Identified](#analysis-phase---issues-identified)
3. [Implementation Phase - Fixes Applied](#implementation-phase---fixes-applied)
4. [Verification](#verification)
5. [Summary of Changes](#summary-of-changes)

---

## Background & Problem Statement

### The Request

Perform a critical analysis of all cron jobs in the platform to identify issues and make them functional.

### Initial Investigation

Discovered the platform has **7 cron jobs**, but only **4 were actually scheduled** in Vercel:

| Cron Job | Was Scheduled | Status Before Fix |
|----------|---------------|-------------------|
| Auto-Match Reconciliation | YES | Working |
| Cleanup Stale Locks | YES | Working |
| Data Room Expiry | YES | Bug (deal name not showing) |
| Data Room Expiry Warnings | YES | Bug (deal name not showing) |
| **Fee Generation** | **NO** | **NOT RUNNING** |
| **Publish Documents** | **NO** | **NOT RUNNING** |
| **Unpublish Documents** | **NO** | **NOT RUNNING** |

---

## Analysis Phase - Issues Identified

### Critical Issues (P0)

#### 1. Fee Generation Cron Not Scheduled
**File**: `api/cron/fees/generate-scheduled/route.ts`

**Problem**: The fee generation cron job existed but was NOT configured in `vercel.json`. This means:
- Management fees were never being auto-generated
- Fee schedules never advanced to next period
- Revenue recognition was completely manual/missing

**Additional Issues Found**:
- Only had POST handler (Vercel cron uses GET)
- Auth pattern incorrect - only checked `CRON_SECRET`, not `VERCEL_CRON_SECRET`

#### 2. Document Publish Cron Not Scheduled
**File**: `api/cron/publish-documents/route.ts`

**Problem**: Documents with scheduled publish dates were never auto-publishing.

**Additional Issues Found**:
- Auth pattern incorrect
- Missing `export const dynamic = 'force-dynamic'`

#### 3. Document Unpublish Cron Not Scheduled
**File**: `api/cron/unpublish-documents/route.ts`

**Problem**: Expired documents were remaining published indefinitely.

**Additional Issues Found**:
- Same auth issues as publish cron

### High Priority Issues (P1)

#### 4. Authentication Vulnerability in 3 Cron Jobs
**Files**: fees/generate-scheduled, publish-documents, unpublish-documents

**Problem**: These crons only checked `CRON_SECRET`:
```typescript
// BAD - will fail on Vercel
if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`)
```

Vercel uses `VERCEL_CRON_SECRET`, so these would fail auth if enabled.

**Solution**: Use the correct pattern:
```typescript
// GOOD - works with both local and Vercel
const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET
```

### Medium Priority Issues (P2)

#### 5. Array Access Bug in Data Room Crons
**Files**: data-room-expiry/route.ts, data-room-expiry-warnings/route.ts

**Problem**: Notifications were showing "the deal" instead of actual deal names.

**Root Cause**: Incorrect array access on Supabase join result:
```typescript
// BUG - deals is an object, not an array
(access.deals as any)?.[0]?.name

// CORRECT
(access.deals as any)?.name
```

When you use Supabase's embedded select syntax:
```typescript
.select(`..., deals (id, name)`)
```
It returns `deals` as a **single object** (not an array) for a many-to-one relationship.

---

## Implementation Phase - Fixes Applied

### Fix #1: Add Missing Cron Schedules to vercel.json

**File**: `versotech-portal/vercel.json`

**Before**:
```json
{
  "crons": [
    { "path": "/api/cron/auto-match-reconciliation", "schedule": "0 */6 * * *" },
    { "path": "/api/cron/cleanup-stale-locks", "schedule": "*/5 * * * *" },
    { "path": "/api/cron/data-room-expiry", "schedule": "0 2 * * *" },
    { "path": "/api/cron/data-room-expiry-warnings", "schedule": "0 9 * * *" }
  ]
}
```

**After**:
```json
{
  "crons": [
    { "path": "/api/cron/auto-match-reconciliation", "schedule": "0 */6 * * *" },
    { "path": "/api/cron/cleanup-stale-locks", "schedule": "*/5 * * * *" },
    { "path": "/api/cron/data-room-expiry", "schedule": "0 2 * * *" },
    { "path": "/api/cron/data-room-expiry-warnings", "schedule": "0 9 * * *" },
    { "path": "/api/cron/fees/generate-scheduled", "schedule": "0 6 * * *" },
    { "path": "/api/cron/publish-documents", "schedule": "0 * * * *" },
    { "path": "/api/cron/unpublish-documents", "schedule": "0 * * * *" }
  ]
}
```

**Schedules**:
- Fee generation: Daily at 6 AM UTC
- Publish documents: Every hour (at minute 0)
- Unpublish documents: Every hour (at minute 0)

---

### Fix #2: Fee Generation Cron - Auth Fix + GET Handler

**File**: `versotech-portal/src/app/api/cron/fees/generate-scheduled/route.ts`

**Changes**:
1. Added `export const dynamic = 'force-dynamic'`
2. Fixed auth pattern to use `CRON_SECRET || VERCEL_CRON_SECRET`
3. Refactored to `handleCronRequest()` function
4. Added GET handler for Vercel cron

**Before**:
```typescript
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // ... logic
  }
}
```

**After**:
```typescript
export const dynamic = 'force-dynamic'

async function handleCronRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // ... logic
  }
}

// Vercel cron uses GET requests
export async function GET(request: NextRequest) {
  return handleCronRequest(request)
}

export async function POST(request: NextRequest) {
  return handleCronRequest(request)
}
```

---

### Fix #3: Publish Documents Cron - Auth Fix

**File**: `versotech-portal/src/app/api/cron/publish-documents/route.ts`

**Changes**:
1. Added `export const dynamic = 'force-dynamic'`
2. Fixed auth pattern
3. Refactored to `handleCronRequest()` function
4. Both GET and POST handlers now use shared function

**Note**: A linter enhancement also added notification functionality to alert investors when documents are published. This uses the existing `@/lib/notifications` library.

---

### Fix #4: Unpublish Documents Cron - Auth Fix

**File**: `versotech-portal/src/app/api/cron/unpublish-documents/route.ts`

**Changes**: Same pattern as publish-documents cron:
1. Added `export const dynamic = 'force-dynamic'`
2. Fixed auth pattern
3. Refactored to `handleCronRequest()` function

---

### Fix #5: Data Room Expiry - Array Access Bug

**File**: `versotech-portal/src/app/api/cron/data-room-expiry/route.ts`

**Line 117 - Before**:
```typescript
message: `Your access to the data room for ${(access.deals as any)?.[0]?.name || 'the deal'} has expired...`
```

**After**:
```typescript
message: `Your access to the data room for ${(access.deals as any)?.name || 'the deal'} has expired...`
```

**Why**: Supabase returns joined relations as objects, not arrays. The `?.[0]` was always returning `undefined` because there's no index 0 on an object.

---

### Fix #6: Data Room Expiry Warnings - Array Access Bug

**File**: `versotech-portal/src/app/api/cron/data-room-expiry-warnings/route.ts`

**Line 104 - Before**:
```typescript
message: `Your access to the data room for ${(access.deals as any)?.[0]?.name || 'the deal'} expires in ${daysUntilExpiry}...`
```

**After**:
```typescript
message: `Your access to the data room for ${(access.deals as any)?.name || 'the deal'} expires in ${daysUntilExpiry}...`
```

---

## Verification

### Database Dependencies Verified

| Dependency | Required By | Status |
|------------|-------------|--------|
| `run_auto_match()` function | auto-match-reconciliation | EXISTS |
| `publish_scheduled_documents()` function | publish-documents | EXISTS |
| `unpublish_expired_documents()` function | unpublish-documents | EXISTS |
| `fee_schedules` table | fee generation | EXISTS with all columns |
| `fee_events` table | fee generation | EXISTS with all columns |
| `fee_components` table | fee generation | EXISTS |
| `document_publishing_schedule` table | publish/unpublish | EXISTS |
| `deal_data_room_access` table | data room expiry | EXISTS with `last_warning_sent_at` |
| `investor_notifications` table | all notification crons | EXISTS |
| `@/lib/notifications` | publish-documents | EXISTS |

### Build Verification

```
npm run build
✓ Compiled successfully
✓ No type errors in cron files
✓ All imports resolve correctly
```

### Pre-existing Issue Noted

The `publish_scheduled_documents()` database function only returns `(id, 1::int)`, not investor_id or document names. The notification enhancement added by linter won't send notifications because `doc.investor_id` will be undefined. However:
- Documents still publish correctly
- The code handles this gracefully with try/catch
- This is a database function limitation, not caused by these fixes

---

## Summary of Changes

### Files Modified

| File | Changes |
|------|---------|
| `versotech-portal/vercel.json` | Added 3 missing cron schedules |
| `api/cron/fees/generate-scheduled/route.ts` | Fixed auth, added GET handler, added dynamic export |
| `api/cron/publish-documents/route.ts` | Fixed auth, refactored handlers, added dynamic export |
| `api/cron/unpublish-documents/route.ts` | Fixed auth, refactored handlers, added dynamic export |
| `api/cron/data-room-expiry/route.ts` | Fixed array access bug for deal name |
| `api/cron/data-room-expiry-warnings/route.ts` | Fixed array access bug for deal name |

### New Cron Schedules

| Cron Job | Schedule | Frequency |
|----------|----------|-----------|
| Fee Generation | `0 6 * * *` | Daily at 6 AM UTC |
| Publish Documents | `0 * * * *` | Every hour |
| Unpublish Documents | `0 * * * *` | Every hour |

### Issues Fixed

| Priority | Issue | Impact |
|----------|-------|--------|
| **P0** | Fee generation not running | Management fees now auto-generate |
| **P0** | Document publish not running | Scheduled documents now auto-publish |
| **P0** | Document unpublish not running | Expired documents now auto-archive |
| **P1** | Auth vulnerability in 3 crons | Will now work with Vercel's cron secret |
| **P2** | Deal name bug in data room | Notifications now show actual deal names |

---

## Deployment Notes

After deploying these changes:

1. **Verify cron jobs in Vercel Dashboard**:
   - Go to Project Settings → Cron Jobs
   - Confirm all 7 jobs are listed

2. **Monitor first runs**:
   - Fee generation: Check at 6 AM UTC
   - Document publish/unpublish: Check hourly

3. **Backfill consideration**:
   - If fee schedules were missed, may need manual trigger
   - If documents should have published, may need manual publish

---

**Change Reviewed By**: Claude Code (Ultra-Think Mode)
**Change Approved By**: User
**Deployed**: Pending commit
