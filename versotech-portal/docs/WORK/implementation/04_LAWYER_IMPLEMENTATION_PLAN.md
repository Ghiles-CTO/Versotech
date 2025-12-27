# Lawyer Implementation Plan

**User Type:** Lawyer
**Current Completion:** 30% (Audit-Verified: December 26, 2025)
**Target Completion:** 90%
**Estimated Hours:** 24 hours
**Last Audit:** December 26, 2025 - Verification Update

---

## ⚠️ CRITICAL AUDIT FINDINGS

### 1. Subscription Packs Page: Partially Built (Filtering OK, Signed Pack UX Missing)

**Verified:**
- Filters by lawyer assignment via `deal_lawyer_assignments` (fallback to `lawyers.assigned_deals`)
- Search and status filters work for submission records

**Missing:**
- Lawyer view should show only signed/committed packs
- No signed PDF download link
- Uses `deal_subscription_submissions` statuses (pending_review, approved, etc.) instead of signed/committed

### 2. Escrow View: Read-Only + Fragile Matching

- `/versotech_main/escrow` exists and shows accounts + settlements
- Filtering relies on `legal_counsel` string match (fragile)
- No confirmation actions, fee payment workflow, or invoice detail

### 3. Lawyer Dashboard: 0% Complete

| Component | Status |
|-----------|--------|
| `src/components/dashboard/lawyer-dashboard.tsx` | ❌ MISSING |
| Lawyer-specific metrics | ❌ MISSING |
| Uses generic PersonaDashboard | ✅ (fallback) |

### 4. Notifications: Missing Triggers + Lawyer Visibility

- No lawyer notifications on CEO/arranger/investor signature events
- Notification center only reads `investor_notifications` for investor persona
- Notifications page exists but is not in lawyer navigation

### 5. Reconciliation: Staff-Only

- `/versotech_main/reconciliation` returns "Access Restricted" to lawyers
- No lawyer-scoped reconciliation view

### 6. Signature Specimen + Statement Issuance: Not Implemented

- Signature specimen fields exist for investor members only
- No automatic lawyer specimen insertion on certificate/statement issuance

---

## FEATURE TRUTH TABLE (Audit-Verified)

| Feature | Planned | Exists | Working | Priority |
|---------|---------|--------|---------|----------|
| Lawyer Persona | ✓ | ✓ | ✓ | - |
| Database Schema (core) | ✓ | ✓ | ✓ | - |
| Navigation | ✓ | ✓ | Partial (missing notifications/reconciliation) | P2 |
| Subscription Packs Page | ✓ | ✓ | Partial | P1 |
| Assigned Deals Page | ✓ | ✓ | ✓ (assignment alignment needed) | P2 |
| Escrow Page (view) | ✓ | ✓ | Partial | P1 |
| **Escrow Confirmation API** | **✓** | **✗** | **0%** | **P0** |
| **Fee Payment Confirmation** | **✓** | **✗** | **0%** | **P0** |
| **Lawyer Dashboard** | **✓** | **✗** | **0%** | **P1** |
| Signature Notifications (CEO/Arranger/Investor) | ✓ | ✗ | 0% | P1 |
| Notification Visibility for Lawyers | ✓ | ✗ | 0% | P1 |
| Reconciliation Access (Lawyer scope) | ✓ | ✗ | 0% | P2 |
| Signature Specimen for Lawyers | ✓ | ✗ | 0% | P2 |
| Certificate/Statement Notifications to Lawyers | ✓ | ✗ | 0% | P2 |
| Escrow Assignment Matching | ✓ | ✗ | 0% | P2 |

**TRUE FUNCTIONAL COMPLETION: 30%**

---

## 1. WHO IS THE LAWYER?

The Lawyer is external legal counsel assigned to specific deals. From user stories (Section 3.Lawyer, 59 rows):

**Business Role:**
- Assigned to specific deals by CEO/Arranger
- Receives notifications about subscriptions (when signed)
- Views signed subscription packs (READ-ONLY)
- Manages escrow accounts (view status, confirm completion)
- Processes fee payments (confirm payment processed)
- Receives notifications for certificate issuance
- Generates reconciliation reports for their deals

**Key Distinction:**
- Lawyer ONLY sees deals they are assigned to
- Cannot see other deals, other investors, or platform-wide data
- Primary role is confirmation, not initiation
- Signs documents via VersaSign when needed

---

## 2. WHAT ALREADY EXISTS

### 2.1 Database

**Tables (All Exist):**
- `lawyers` - Lawyer/law firm accounts
- `lawyer_members` - Firm members
- `lawyer_users` - Links profiles to lawyers
- `deal_lawyer_assignments` - Primary assignment source for lawyer-deal mapping
- `lawyers.assigned_deals` - Legacy fallback for assignments
- `deal_memberships` - Legacy assignments (not used by lawyer UI)
- `signature_requests` - For document signing
- `investor_notifications` - Current notifications store for all personas

### 2.2 Pages (Structure Exists)

| Route | Status | Description |
|-------|--------|-------------|
| `/versotech_main/dashboard` | PARTIAL | Generic PersonaDashboard (no lawyer metrics) |
| `/versotech_main/assigned-deals` | BUILT | Uses deal_lawyer_assignments + fallback |
| `/versotech_main/escrow` | PARTIAL | Read-only; counsel name matching |
| `/versotech_main/subscription-packs` | PARTIAL | Submission list; no signed-only filter or PDF download |
| `/versotech_main/profile` | BUILT | Profile |
| `/versotech_main/documents` | BUILT | Investor-linked docs only (not lawyer pack view) |
| `/versotech_main/versosign` | BUILT | Signature queue |
| `/versotech_main/messages` | BUILT | Messaging for lawyers |
| `/versotech_main/notifications` | BUILT | Notifications list (not in lawyer nav) |
| `/versotech_main/reconciliation` | STAFF ONLY | Access restricted for lawyers |

### 2.3 API Routes

| Route | Status | Notes |
|-------|--------|-------|
| `/api/admin/lawyers/*` | BUILT | Admin management |
| `/api/lawyers/*` | MISSING | No lawyer self-service |
| `/api/escrow/*` | PARTIAL | Some escrow routes exist |

### 2.4 Navigation

**Configured in `persona-sidebar.tsx`:**
```typescript
lawyer: [
  { name: 'Dashboard', href: '/versotech_main/dashboard', icon: LayoutDashboard },
  { name: 'Assigned Deals', href: '/versotech_main/assigned-deals', icon: Briefcase },
  { name: 'Escrow', href: '/versotech_main/escrow', icon: Lock },
  { name: 'Subscription Packs', href: '/versotech_main/subscription-packs', icon: FileText },
  { name: 'Messages', href: '/versotech_main/messages', icon: MessageSquare },
]
```

**Missing From Lawyer Nav (to add):**
- Notifications
- Reconciliation

---

## 3. WHAT'S MISSING

### 3.1 Subscription Pack Visibility + Download (READ-ONLY)

**User Stories (Section 3.2.1):**

| Row | Story | Status |
|-----|-------|--------|
| 11 | Receive notification when subscription pack signed by CEO | MISSING |
| 12 | Receive notification when subscription pack signed by Arranger | MISSING |
| 13 | Receive notification when signed by investors | MISSING |

**What's Needed:**
- Show only signed/committed packs for assigned deals (not pending/approved submissions)
- Surface the signed PDF download (source: `documents` linked to `subscriptions`)
- Keep view read-only

### 3.2 Signature Notifications + Visibility

**Missing:**
- Notify lawyers when CEO/admin countersigns
- Notify lawyers when arranger countersigns (if applicable)
- Notify lawyers when investor completes signing
- Make notifications visible to lawyers (header + Notifications page + nav)

### 3.3 Escrow Confirmation Flow

**User Stories (Section 3.3):**

| Row | Story | Status |
|-----|-------|--------|
| 26 | Send notification once escrow funding is completed | PARTIAL |
| 27 | Send/receive notification if not completed yet | MISSING |
| 38 | Send notification with escrow account funding amount | PARTIAL |

**Flow:**
1. Lawyer views escrow status
2. Lawyer confirms funding received (amount + reference)
3. CEO receives confirmation notification
4. "Not completed yet" reminders go out for overdue funding

### 3.4 Fee Payment Invoice Detail + Confirmation

**User Stories (Section 3.3):**

| Row | Story | Status |
|-----|-------|--------|
| 28 | Display Partner invoice details | MISSING |
| 29 | Send notification when Partner fees payment completed | MISSING |
| 30 | Send/receive notification when Partner payment not completed | MISSING |
| 31 | Display Introducer invoice details | MISSING |
| 32 | Send notification when Introducer fees payment completed | MISSING |
| 33 | Send/receive notification when Introducer payment not completed | MISSING |
| 34 | Display Commercial Partner invoice details | MISSING |
| 35 | Send notification when CP fees payment completed | MISSING |
| 36 | Send/receive notification when CP payment not completed | MISSING |
| 37 | Send notification when payment to Seller completed | MISSING |

### 3.5 Lawyer Dashboard

**Required Metrics:**
- Assigned deals count
- Pending escrow confirmations (subscriptions in committed status)
- Recent signed subscriptions
- Payment confirmations pending (tasks owned by lawyer)

### 3.6 Reconciliation Access (Lawyer Scope)

- Staff-only reconciliation blocks lawyers
- Need a limited view scoped to assigned deals only

### 3.7 Certificate/Statement Issuance + Signature Specimen

- Lawyer signature specimen capture is missing (no fields/UI for lawyer members)
- No lawyer notifications when certificates or statements are issued

### 3.8 Escrow Assignment Matching

- Escrow page relies on `legal_counsel` string match
- Must use `deal_lawyer_assignments` with fallback to `lawyers.assigned_deals`

---

## 4. IMPLEMENTATION TASKS

### Task 1: Subscription Pack View Enhancement (3 hours)

**Files to Modify:**

```
src/app/(main)/versotech_main/subscription-packs/page.tsx
src/app/(main)/versotech_main/subscription-packs/subscription-packs-client.tsx
```

**Required Changes:**
- Keep assignment filtering (already implemented)
- Show only signed/committed subscriptions (not pending/approved submissions)
- Join to `documents` to surface signed PDF download
- Show investor, deal, signed date, and status (committed/active)

**Query Logic (explicit columns only):**
```typescript
// Get deals where current lawyer is assigned
const assignments = await supabase
  .from('deal_lawyer_assignments')
  .select('deal_id')
  .eq('lawyer_id', lawyerUser.lawyer_id)

const dealIds = (assignments.data || []).map(a => a.deal_id)

// Get submissions for those deals (to map to formal_subscription_id)
const submissions = await supabase
  .from('deal_subscription_submissions')
  .select('id, deal_id, investor_id, formal_subscription_id, submitted_at, decided_at')
  .in('deal_id', dealIds)

const subscriptionIds = (submissions.data || [])
  .map(s => s.formal_subscription_id)
  .filter(Boolean)

// Fetch signed/committed subscriptions
const subscriptions = await supabase
  .from('subscriptions')
  .select('id, deal_id, investor_id, status, committed_at, signed_at, currency')
  .in('id', subscriptionIds)
  .in('status', ['committed', 'partially_funded', 'active'])

// Fetch signed PDF documents
const documents = await supabase
  .from('documents')
  .select('id, subscription_id, file_key, created_at, status, type')
  .in('subscription_id', subscriptionIds)
  .eq('type', 'subscription')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
```

### Task 2: Signature Notifications + Lawyer Visibility (3 hours)

**Files to Modify:**

```
src/lib/signature/handlers.ts
src/app/api/signature/complete/route.ts
src/components/layout/notification-center.tsx
src/components/layout/persona-sidebar.tsx
```

**Required Changes:**
- Notify assigned lawyers when:
  - CEO/admin countersigns a subscription pack
  - Arranger countersigns (if applicable)
  - Investor completes signing
- Hook into countersignature completion (signature_requests signer_role in ['admin', 'arranger'] or countersignature tasks)
- Ensure notifications are visible to lawyers:
  - Show `investor_notifications` in header for all personas
  - Add Notifications link to lawyer nav

**Note:** `investor_notifications` already stores non-investor notifications. Keep this table for now; revisit a unified notifications table later if needed.

### Task 3: Escrow Confirmation APIs + UI (6 hours)

**Files to Create:**

```
src/app/api/escrow/[id]/confirm-funding/route.ts
src/app/api/escrow/[id]/confirm-payment/route.ts
src/components/lawyer/escrow-confirm-modal.tsx
```

**Escrow Funding Confirmation:**
- Verify lawyer assignment via `deal_lawyer_assignments` (fallback to `lawyers.assigned_deals`)
- Update `subscriptions.funded_amount` and status (`committed` → `partially_funded` → `active`)
- Guard against double confirmation (idempotency check)
- Notify CEO and log via `auditLogger`
- Add "not completed yet" reminders for overdue funding

**Fee Payment Confirmation:**
- Support payment types: partner, introducer, commercial_partner, seller
- Update `fee_events.status = 'paid'`
- Notify recipient and CEO, log via `auditLogger`
- Add "not completed yet" reminders for overdue fees

### Task 4: Escrow Matching + Invoice Detail (2 hours)

**Files to Modify:**

```
src/app/(main)/versotech_main/escrow/page.tsx
```

**Required Changes:**
- Replace `legal_counsel` string matching with `deal_lawyer_assignments` (fallback to `lawyers.assigned_deals`)
- Add invoice detail display for partner/introducer/CP (from `fee_events` + `invoices`)
- Show outstanding vs paid status per recipient

### Task 5: Lawyer Dashboard (4 hours)

**Files to Create:**

```
src/components/dashboard/lawyer-dashboard.tsx
```

**Files to Modify:**

```
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx
```

**Metrics to Show:**

| Metric | Query |
|--------|-------|
| Assigned Deals | `deal_lawyer_assignments` WHERE lawyer_id=current |
| Pending Escrow | subscriptions WHERE status IN ('committed', 'partially_funded') AND deal in assigned |
| Payment Confirmations | tasks WHERE owner_user_id=current AND kind in ('payment_confirmation', 'fee_confirmation') |
| Recent Subscriptions | Last 10 committed subscriptions in assigned deals |

### Task 6: Lawyer Reconciliation Access (3 hours)

**Files to Create:**

```
src/app/(main)/versotech_main/lawyer-reconciliation/page.tsx
src/components/lawyer/lawyer-reconciliation-client.tsx
```

**Required Changes:**
- Create a lawyer-scoped reconciliation view filtered to assigned deals
- Add navigation link for lawyers

### Task 7: Signature Specimen + Certificate/Statement Notifications (3 hours)

**Files to Create:**

```
supabase/migrations/YYYYMMDD_add_lawyer_signature_specimen.sql
```

**Files to Modify (expected):**

```
src/app/(main)/versotech_main/profile/page.tsx
src/components/profile/profile-page-client.tsx
src/lib/subscription/certificate-trigger.ts
```

**Required Changes:**
- Add signature specimen fields to `lawyer_members`
- Add upload UI for lawyer members (similar to investor members)
- Add API route for lawyer specimen upload (mirror investors/me/members/upload-signature)
- Notify assigned lawyers when certificates/statements are issued
- (If statement issuance workflows exist) attach lawyer specimen where required

---

## 5. USER STORIES COVERAGE CHECK

### Will Be Implemented

| Section | Stories | Task |
|---------|---------|------|
| 3.2.1 Subscription pack notifications | Rows 11-13 | Task 2 |
| 3.2.2 Escrow account funding | Row 14 | Task 3 |
| 3.2.3-4 Certificate/Statement issuance | Rows 15-18 | Task 7 |
| 3.2.5-8 Fee payments | Rows 19-25 | Task 3, 4 |
| 3.3.1 Escrow account funding | Rows 26-27 | Task 3 |
| 3.3.2-3 Partner/Introducer payment | Rows 28-33 | Task 3, 4 |
| 3.3.4 Payment to seller | Row 37 | Task 3 |
| 3.3.5 Escrow funding status | Row 38 | Task 3 |
| 3.4 Reporting | Rows 47-50 | Task 6 |

### Deferred / Needs Definition

| Section | Stories | Reason |
|---------|---------|--------|
| 3.3.6-3.3.8 Conversion/Redemption | Rows 39-46 | V2 options not defined; depends on redemption workflows |
| 3.5 GDPR | Rows 51-60 | See CEO plan |

---

## 6. TESTING CHECKLIST

### Lawyer Flow Tests

- [ ] Login as lawyer → Lawyer dashboard shows
- [ ] Dashboard shows assigned deals count
- [ ] Dashboard shows pending escrow count
- [ ] Navigate to Assigned Deals → Only assigned deals visible
- [ ] Navigate to Subscription Packs → Only signed packs for assigned deals
- [ ] Signed pack shows PDF download link
- [ ] CEO countersigns → Lawyer receives notification
- [ ] Arranger countersigns → Lawyer receives notification (if applicable)
- [ ] Investor signs pack → Lawyer receives notification
- [ ] Notifications visible in header + Notifications page for lawyer
- [ ] Navigate to Escrow → See assigned deals (no name matching)
- [ ] Confirm funding received → CEO notified + audit log created
- [ ] Overdue funding → "not completed yet" reminder sent
- [ ] Confirm fee payment → Recipient + CEO notified
- [ ] Reconciliation page shows assigned deals only
- [ ] Lawyer signature specimen upload works
- [ ] Certificate/statement issued → Lawyer receives notification

### Security Tests

- [ ] Cannot access deals not assigned to
- [ ] Cannot modify subscription packs
- [ ] Cannot see other lawyers' assignments
- [ ] Cannot see investor details beyond assigned deals
- [ ] Reconciliation view scoped to assigned deals only

---

## 7. DEPENDENCIES

**Requires Before Implementation:**
- VersaSign (for any lawyer signing) - ALREADY BUILT

**Blocks Other Features:**
- Escrow confirmation enables position creation
- Fee payment confirmation updates fee events

**Decisions / Assumptions:**
- Notifications: continue using `investor_notifications` for all personas for now
- Signed pack source: `documents` table must have a published subscription PDF linked by `subscription_id`
- Reconciliation: lawyer access must be scoped by assignment (RLS or query filtering)
- Escrow confirmation must align with reconciliation updates to avoid double-counting funded amounts

---

## 8. FILES SUMMARY

### To Create (8 files)

```
supabase/migrations/YYYYMMDD_add_lawyer_signature_specimen.sql
src/app/api/lawyers/me/members/upload-signature/route.ts
src/app/api/escrow/[id]/confirm-funding/route.ts
src/app/api/escrow/[id]/confirm-payment/route.ts
src/components/lawyer/escrow-confirm-modal.tsx
src/components/dashboard/lawyer-dashboard.tsx
src/app/(main)/versotech_main/lawyer-reconciliation/page.tsx
src/components/lawyer/lawyer-reconciliation-client.tsx
```

### To Modify (11 files)

```
src/app/(main)/versotech_main/subscription-packs/page.tsx
  - Filter to signed/committed subscriptions
  - Map to signed PDF documents

src/app/(main)/versotech_main/subscription-packs/subscription-packs-client.tsx
  - Show signed status only
  - Add PDF download action

src/lib/signature/handlers.ts
  - Add lawyer notifications on CEO/arranger/investor signatures

src/app/api/signature/complete/route.ts
  - Mirror lawyer notifications for legacy flow

src/components/layout/notification-center.tsx
  - Show notifications for non-investor personas

src/components/layout/persona-sidebar.tsx
  - Add Notifications + Reconciliation to lawyer nav

src/app/(main)/versotech_main/escrow/page.tsx
  - Use deal_lawyer_assignments
  - Show invoice detail

src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx
  - Route lawyer to LawyerDashboard

src/app/(main)/versotech_main/profile/page.tsx
  - Surface lawyer member signature specimen

src/components/profile/profile-page-client.tsx
  - Add lawyer signature specimen upload UI

src/lib/subscription/certificate-trigger.ts
  - Notify assigned lawyers on certificate issuance
```

---

## 9. ACCEPTANCE CRITERIA

1. **Subscription Pack Visibility:**
   - [ ] Lawyer sees only packs from assigned deals
   - [ ] Only signed packs visible (not pending)
   - [ ] Can download PDF
   - [ ] Cannot modify any data

2. **Lawyer Notifications:**
   - [ ] Notified when CEO/admin countersigns
   - [ ] Notified when arranger countersigns (if applicable)
   - [ ] Notified when investor signs pack
   - [ ] Notified when certificates/statements are issued
   - [ ] Notifications include deal + investor context

3. **Escrow Confirmation:**
   - [ ] Lawyer can confirm funding received
   - [ ] Confirmation updates subscription status
   - [ ] CEO receives notification
   - [ ] Audit log created

4. **Fee Payment Confirmation:**
   - [ ] Lawyer can confirm payment to partner/introducer/CP
   - [ ] Confirmation updates fee event status
   - [ ] Recipient and CEO notified

5. **Notifications Visibility:**
   - [ ] Lawyers see notifications in header
   - [ ] Notifications page accessible from lawyer nav

6. **Dashboard:**
   - [ ] Shows assigned deals count
   - [ ] Shows pending escrow actions
   - [ ] Shows payment requests
   - [ ] Links navigate correctly

7. **Reconciliation (Lawyer Scope):**
   - [ ] Lawyer can view reconciliation for assigned deals only
   - [ ] No access to non-assigned deals

8. **Escrow Assignment Matching:**
   - [ ] Escrow data filtered via deal_lawyer_assignments
   - [ ] Fallback to lawyers.assigned_deals for legacy data

9. **Signature Specimen:**
   - [ ] Lawyer can upload specimen for firm members
   - [ ] Specimen is used where certificate/statement workflows require it

---

## 10. DEVELOPER-READY IMPLEMENTATION CODE

### 10.1 Escrow Funding Confirmation API

**File: `src/app/api/escrow/[id]/confirm-funding/route.ts`**

```typescript
/**
 * Escrow Funding Confirmation API
 * POST /api/escrow/[subscriptionId]/confirm-funding
 *
 * Lawyer confirms funding has been received in escrow
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit';
import { z } from 'zod';

const confirmFundingSchema = z.object({
  amount: z.number().positive(),
  confirmation_notes: z.string().optional(),
  bank_reference: z.string().optional()
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a lawyer
    const { data: lawyerUser } = await supabase
      .from('lawyer_users')
      .select('lawyer_id')
      .eq('user_id', user.id)
      .single();

    if (!lawyerUser) {
      return NextResponse.json({ error: 'Not a lawyer' }, { status: 403 });
    }

    // Get subscription and verify lawyer is assigned to the deal
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select(`
        id, deal_id, investor_id, commitment, currency, status, funded_amount,
        deal:deals(id, name)
      `)
      .eq('id', params.id)
      .single();

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Verify lawyer is assigned to this deal
    const { data: assignment } = await supabase
      .from('deal_lawyer_assignments')
      .select('id')
      .eq('deal_id', subscription.deal_id)
      .eq('lawyer_id', lawyerUser.lawyer_id)
      .maybeSingle();

    if (!assignment) {
      const { data: fallbackLawyer } = await supabase
        .from('lawyers')
        .select('assigned_deals')
        .eq('id', lawyerUser.lawyer_id)
        .maybeSingle();

      const hasFallback = fallbackLawyer?.assigned_deals?.includes(subscription.deal_id);
      if (!hasFallback) {
        return NextResponse.json({ error: 'Not assigned to this deal' }, { status: 403 });
      }
    }

    const body = await request.json();
    const validation = confirmFundingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.issues
      }, { status: 400 });
    }

    const { amount, confirmation_notes, bank_reference } = validation.data;

    // Calculate new funded amount
    const currentFunded = subscription.funded_amount || 0;
    const newFundedAmount = currentFunded + amount;

    // Determine new status
    let newStatus = subscription.status;
    if (newFundedAmount >= subscription.commitment) {
      newStatus = 'active'; // Fully funded
    } else if (newFundedAmount > 0) {
      newStatus = 'partially_funded';
    }

    // Update subscription
    const { data: updated, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        funded_amount: newFundedAmount,
        funded_at: newFundedAmount >= subscription.commitment ? new Date().toISOString() : null,
        status: newStatus
      })
      .eq('id', params.id)
      .select('id, funded_amount, status')
      .single();

    if (updateError) {
      console.error('Failed to update subscription:', updateError);
      return NextResponse.json({ error: 'Failed to confirm funding' }, { status: 500 });
    }

    // Create notification for CEO
    const { data: ceos } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['staff_admin', 'ceo']);

    if (ceos) {
      for (const ceo of ceos) {
        await supabase.from('investor_notifications').insert({
          user_id: ceo.id,
          investor_id: null,
          title: 'Escrow Funding Confirmed',
          message: `${amount} received for subscription in ${subscription.deal?.name}. Status: ${newStatus}`,
          link: `/versotech_main/subscriptions/${params.id}`
        });
      }
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.SUBSCRIPTIONS,
      entity_id: params.id,
      metadata: {
        event: 'escrow_funding_confirmed',
        amount_confirmed: amount,
        bank_reference,
        confirmation_notes,
        previous_funded: currentFunded,
        new_funded: newFundedAmount,
        new_status: newStatus,
        lawyer_id: lawyerUser.lawyer_id
      }
    });

    return NextResponse.json({
      data: {
        subscription_id: params.id,
        amount_confirmed: amount,
        total_funded: newFundedAmount,
        status: newStatus,
        message: newStatus === 'active'
          ? 'Subscription is now fully funded and active'
          : `Funding confirmed. ${subscription.commitment - newFundedAmount} remaining`
      }
    });

  } catch (error) {
    console.error('Confirm funding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 10.2 Lawyer Notification on Signature

**Add to: `src/lib/signature/handlers.ts` (after line 770)**

```typescript
// In handleSubscriptionSignature, after creating investor notification:

// 8. NOTIFY ASSIGNED LAWYERS
console.log('\\n👨‍⚖️ [SUBSCRIPTION HANDLER] Step 8: Notifying assigned lawyers');

const { data: assignments } = await supabase
  .from('deal_lawyer_assignments')
  .select('lawyer_id')
  .eq('deal_id', subscription.deal_id);

const lawyerIds = (assignments || []).map(a => a.lawyer_id);

if (lawyerIds.length > 0) {
  const { data: lawyerUsers } = await supabase
    .from('lawyer_users')
    .select('user_id, lawyer_id')
    .in('lawyer_id', lawyerIds);

  for (const lawyerUser of lawyerUsers || []) {
    await supabase.from('investor_notifications').insert({
      user_id: lawyerUser.user_id,
      investor_id: null,
      title: 'Subscription Pack Signed',
      message: `${subscription.investor?.display_name || 'Investor'} has signed the subscription pack for ${subscription.vehicle?.name || 'the deal'}.`,
      link: '/versotech_main/subscription-packs'
    });
  }
} else {
  console.log('ℹ️ [SUBSCRIPTION HANDLER] No lawyers assigned to this deal');
}

// NOTE: Add similar lawyer notifications when CEO/admin or arranger countersigns
```

### 10.3 Lawyer Dashboard Component

**File: `src/components/dashboard/lawyer-dashboard.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileCheck, Wallet, Scale, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface DashboardMetrics {
  assignedDeals: number
  pendingEscrow: number
  paymentRequests: number
  signedPacks: number
}

export function LawyerDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    assignedDeals: 0,
    pendingEscrow: 0,
    paymentRequests: 0,
    signedPacks: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetrics() {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: lawyerUser } = await supabase
        .from('lawyer_users')
        .select('lawyer_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!lawyerUser?.lawyer_id) {
        setLoading(false)
        return
      }

      // Get assigned deal IDs
      const { data: assignments } = await supabase
        .from('deal_lawyer_assignments')
        .select('deal_id')
        .eq('lawyer_id', lawyerUser.lawyer_id)

      let dealIds = assignments?.map(a => a.deal_id) || []

      if (!dealIds.length) {
        const { data: lawyer } = await supabase
          .from('lawyers')
          .select('assigned_deals')
          .eq('id', lawyerUser.lawyer_id)
          .maybeSingle()
        dealIds = lawyer?.assigned_deals || []
      }

      if (dealIds.length === 0) {
        setLoading(false)
        return
      }

      // Fetch metrics in parallel
      const [pendingEscrow, signedPacks, paymentTasks] = await Promise.all([
        supabase
          .from('subscriptions')
          .select('id', { count: 'exact', head: true })
          .in('deal_id', dealIds)
          .in('status', ['committed', 'partially_funded']), // Signed but not fully funded
        supabase
          .from('subscriptions')
          .select('id', { count: 'exact', head: true })
          .in('deal_id', dealIds)
          .in('status', ['committed', 'active', 'partially_funded']),
        supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .eq('owner_user_id', user.id)
          .in('kind', ['payment_confirmation', 'fee_confirmation'])
          .in('status', ['pending', 'in_progress'])
      ])

      setMetrics({
        assignedDeals: dealIds.length,
        pendingEscrow: pendingEscrow.count || 0,
        paymentRequests: paymentTasks.count || 0,
        signedPacks: signedPacks.count || 0
      })
      setLoading(false)
    }

    fetchMetrics()
  }, [])

  const cards = [
    {
      title: 'Assigned Deals',
      value: metrics.assignedDeals,
      icon: Scale,
      href: '/versotech_main/assigned-deals',
      color: 'text-blue-500'
    },
    {
      title: 'Awaiting Funding',
      value: metrics.pendingEscrow,
      icon: Wallet,
      href: '/versotech_main/escrow',
      color: 'text-amber-500',
      badge: metrics.pendingEscrow > 0
    },
    {
      title: 'Signed Packs',
      value: metrics.signedPacks,
      icon: FileCheck,
      href: '/versotech_main/subscription-packs',
      color: 'text-emerald-500'
    },
    {
      title: 'Payment Requests',
      value: metrics.paymentRequests,
      icon: Clock,
      href: '/versotech_main/escrow',
      color: 'text-purple-500',
      badge: metrics.paymentRequests > 0
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lawyer Dashboard</h1>
        <p className="text-muted-foreground">Manage escrow and payment confirmations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {loading ? '...' : card.value}
                  </div>
                  <div className="flex items-center gap-2">
                    {card.badge && (
                      <Badge variant="secondary">Action needed</Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

---

## 11. ESTIMATED HOURS SUMMARY

| Task | Description | Hours |
|------|-------------|-------|
| Task 1 | Subscription Pack View Enhancement | 3 |
| Task 2 | Signature Notifications + Lawyer Visibility | 3 |
| Task 3 | Escrow Confirmation APIs + UI | 6 |
| Task 4 | Escrow Matching + Invoice Detail | 2 |
| Task 5 | Lawyer Dashboard | 4 |
| Task 6 | Lawyer Reconciliation Access | 3 |
| Task 7 | Signature Specimen + Certificate Notifications | 3 |
| **TOTAL** | | **24** |

**Priority: HIGH (Lawyer required for January 10 per client)**
**Risk: Low (mostly read-only and confirmations)**
**Last Updated:** December 26, 2025 (Verified & Developer-Ready)
