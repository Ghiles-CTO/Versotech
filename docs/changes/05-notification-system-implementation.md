# 05 - Notification System Implementation

**Date**: 2025-11-29
**Author**: Claude Code
**Status**: Completed

---

## Overview

Implemented notification system for both investor portal (versoholdings) and staff portal (versotech), including:
1. Investor notifications with proper triggers from various API endpoints
2. Staff sidebar badge counts for VersoSign, Reconciliation, and Fees

---

## Problems Solved

### Problem 1: No Investor Notifications Being Created

**Issue**: The `investor_notifications` table existed with proper schema, but most API endpoints weren't creating notifications when important events occurred.

**Impact**: Investors weren't being notified about:
- KYC document approvals/rejections
- Deal invitations
- Capital calls
- Data room access grants
- New documents being published

### Problem 2: Staff Sidebar Missing Badge Counts

**Issue**: Staff sidebar had working badges for Messages, Approvals, and Requests, but was missing counts for VersoSign, Reconciliation, and Fees pages.

**Impact**: Staff couldn't see at a glance how many pending signatures, unmatched transactions, or overdue invoices needed attention.

### Problem 3: CRITICAL BUG - VersoSign Badge Count Query

**Issue**: The notification counts API was querying a `signature_requests` table that **does not exist** in the database.

**Location**: `versotech-portal/src/app/api/notifications/counts/route.ts` (lines 207-210)

**Broken Code**:
```typescript
serviceSupabase
  .from('signature_requests')  // THIS TABLE DOESN'T EXIST!
  .select('id', { count: 'exact', head: true })
  .in('status', ['pending', 'in_progress'])
```

**Root Cause**: The implementation incorrectly assumed a `signature_requests` table existed. In reality, VersoSign uses the `tasks` table with specific `kind` values.

**Evidence**:
- VersoSign page (`versosign/page.tsx` lines 63-69) queries the `tasks` table
- Baseline migration (line 915) creates `tasks` table
- No `signature_requests` table found in any migrations

---

## Changes Made

### 1. Created Notification Helper Library

**File**: `versotech-portal/src/lib/notifications.ts` (NEW)

Created a centralized helper for creating investor notifications:

```typescript
export type NotificationType =
  | 'kyc_status'
  | 'deal_invite'
  | 'deal_access'
  | 'document'
  | 'task'
  | 'capital_call'
  | 'approval'
  | 'subscription'
  | 'nda_complete'
  | 'system'

export async function createInvestorNotification(params: CreateNotificationParams): Promise<void>
export async function getInvestorPrimaryUserId(investorId: string): Promise<string | null>
```

**Why**: Centralizes notification creation logic, ensures consistent metadata structure, and reduces code duplication across endpoints.

### 2. Added Notifications to API Endpoints

#### 2.1 KYC Review Endpoint
**File**: `versotech-portal/src/app/api/staff/kyc-submissions/[id]/review/route.ts`

- Approval: "Your KYC documents have been approved"
- Rejection: "Your KYC submission needs attention" with rejection reason

#### 2.2 Deal Members Endpoint
**File**: `versotech-portal/src/app/api/deals/[id]/members/route.ts`

- Deal invitation: "You've been invited to view [Deal Name]"

#### 2.3 Capital Calls Endpoint
**File**: `versotech-portal/src/app/api/capital-calls/route.ts`

- Capital call issued: "A capital call for [Vehicle Name] has been issued"

#### 2.4 Data Room Access Endpoint
**File**: `versotech-portal/src/app/api/deals/[id]/data-room-access/route.ts`

- Access granted: "You have been granted access to the data room for [Deal Name]"

#### 2.5 Document Publishing Cron
**File**: `versotech-portal/src/app/api/cron/publish-documents/route.ts`

- New documents: "New document available in your document library" (grouped by investor)

### 3. Updated Staff Sidebar Badge System

#### 3.1 Updated NotificationCounts Interface
**Files**:
- `versotech-portal/src/hooks/use-notifications.ts`
- `versotech-portal/src/components/layout/sidebar.tsx`

Added new count properties:
```typescript
interface NotificationCounts {
  // ...existing
  signatures: number      // NEW
  reconciliation: number  // NEW
  fees: number           // NEW
}
```

#### 3.2 Added notificationKey to Sidebar Items
**File**: `versotech-portal/src/components/layout/sidebar.tsx`

```typescript
{ name: 'VersoSign', notificationKey: 'signatures' }
{ name: 'Fees', notificationKey: 'fees' }
{ name: 'Reconciliation', notificationKey: 'reconciliation' }
```

#### 3.3 Fixed and Updated Counts API
**File**: `versotech-portal/src/app/api/notifications/counts/route.ts`

**Fixed VersoSign query** (CRITICAL):
```typescript
// BEFORE (BROKEN):
.from('signature_requests')
.in('status', ['pending', 'in_progress'])

// AFTER (FIXED):
.from('tasks')
.in('kind', ['countersignature', 'subscription_pack_signature'])
.in('status', ['pending', 'in_progress'])
```

**Added Reconciliation query**:
```typescript
.from('bank_transactions')
.eq('status', 'unmatched')
```

**Added Fees query**:
```typescript
.from('invoices')
.eq('status', 'overdue')
```

---

## Database Verification

### Tables Verified to Exist

| Table | Migration Location | Status Column Values |
|-------|-------------------|---------------------|
| `tasks` | baseline.sql:915 | pending, in_progress, completed, overdue, waived, blocked |
| `bank_transactions` | baseline.sql:2747 | unmatched, partially_matched, matched |
| `invoices` | baseline.sql:3294 | draft, sent, paid, partially_paid, cancelled, overdue, disputed |
| `investor_notifications` | Exists | N/A (uses read_at for unread status) |

### Tables That Do NOT Exist

| Table | Notes |
|-------|-------|
| `signature_requests` | Was incorrectly referenced - VersoSign uses `tasks` table |

---

## Files Modified

### New Files
- `versotech-portal/src/lib/notifications.ts`

### Modified Files
- `versotech-portal/src/app/api/notifications/counts/route.ts` (bug fix + new counts)
- `versotech-portal/src/app/api/staff/kyc-submissions/[id]/review/route.ts`
- `versotech-portal/src/app/api/deals/[id]/members/route.ts`
- `versotech-portal/src/app/api/capital-calls/route.ts`
- `versotech-portal/src/app/api/deals/[id]/data-room-access/route.ts`
- `versotech-portal/src/app/api/cron/publish-documents/route.ts`
- `versotech-portal/src/hooks/use-notifications.ts`
- `versotech-portal/src/components/layout/sidebar.tsx`

---

## Testing Notes

### Build Verification
- Build completed successfully with no new errors
- Pre-existing warnings (useEffect dependencies, RESEND_API_KEY) are unrelated

### Runtime Testing Required
1. Create a KYC submission and approve/reject it - verify investor notification
2. Add a member to a deal - verify investor notification
3. Create a capital call - verify investor notifications to subscribed investors
4. Grant data room access - verify investor notification
5. Verify VersoSign badge shows count of pending signature tasks
6. Verify Reconciliation badge shows count of unmatched bank transactions
7. Verify Fees badge shows count of overdue invoices

---

## Risk Assessment

| Change | Risk Level | Mitigation |
|--------|------------|------------|
| Notification helper | Low | Uses service client, follows existing patterns |
| Endpoint notifications | Low | Non-blocking try/catch, doesn't affect main flow |
| Badge counts | Medium | Fixed critical bug, verified table existence |
| Interface changes | Low | Added new fields, didn't modify existing |

---

## Related PRDs

- Investor Portal: `/docs/investor/*.md`
- Staff Portal: `/docs/staff/*.md`
