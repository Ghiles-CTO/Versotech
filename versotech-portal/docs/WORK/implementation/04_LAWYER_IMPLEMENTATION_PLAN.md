# Lawyer Implementation Plan

**User Type:** Lawyer
**Current Completion:** 20% (Audit-Verified: December 24, 2025)
**Target Completion:** 90%
**Estimated Hours:** 16 hours
**Last Audit:** December 24, 2025 - Deep Surgical Audit Complete

---

## ⚠️ CRITICAL AUDIT FINDINGS

### 1. Subscription Packs Page: Fully Built ✅

**Good News (Verified):**
```
src/app/(main)/versotech_main/subscription-packs/page.tsx (30 LOC)
src/app/(main)/versotech_main/subscription-packs/subscription-packs-client.tsx (556 LOC)
```

**Features Working:**
- Lists subscription packs
- Shows status (pending, signed, etc.)
- Download PDF functionality
- Filtering and search

**Needs Verification:** Does it filter by lawyer assignment?

### 2. Escrow Confirmation: 0% Complete

**Actual State (Verified via Codebase Search):**

| Route | Status |
|-------|--------|
| `/api/escrow/[id]/confirm-funding/route.ts` | ❌ MISSING |
| `/api/escrow/[id]/confirm-payment/route.ts` | ❌ MISSING |
| `src/components/lawyer/escrow-confirm-modal.tsx` | ❌ MISSING |

**Escrow Page Exists But:**
- `/versotech_main/escrow` page file exists
- No confirmation actions available
- Display-only, no interactive workflow

### 3. Lawyer Dashboard: 0% Complete

| Component | Status |
|-----------|--------|
| `src/components/dashboard/lawyer-dashboard.tsx` | ❌ MISSING |
| Lawyer-specific metrics | ❌ MISSING |
| Uses generic PersonaDashboard | ✅ (fallback) |

### 4. Lawyer Notifications on Signature: Not Wired

**`src/lib/signature/handlers.ts` Analysis:**
- `handleSubscriptionSignature` exists
- Does NOT notify lawyers when investor signs
- Only updates subscription status

---

## FEATURE TRUTH TABLE (Audit-Verified)

| Feature | Planned | Exists | Working | Priority |
|---------|---------|--------|---------|----------|
| Lawyer Persona | ✓ | ✓ | ✓ | - |
| Database Schema | ✓ | ✓ | ✓ | - |
| Navigation | ✓ | ✓ | ✓ | - |
| **Subscription Packs Page** | **✓** | **✓** | **✓** | **Done** |
| Assigned Deals Page | ✓ | ✓ | Needs verify | - |
| Escrow Page (view) | ✓ | ✓ | ✓ | - |
| **Escrow Confirmation API** | **✓** | **✗** | **0%** | **P0** |
| **Fee Payment Confirmation** | **✓** | **✗** | **0%** | **P0** |
| **Lawyer Dashboard** | **✓** | **✗** | **0%** | **P1** |
| **Notification on Sign** | **✓** | **✗** | **0%** | **P1** |

**TRUE FUNCTIONAL COMPLETION: 20%**

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
- `deal_memberships` - Has `role = 'lawyer'` for assignment
- `signature_requests` - For document signing

### 2.2 Pages (Structure Exists)

| Route | Status | Description |
|-------|--------|-------------|
| `/versotech_main/dashboard` | PARTIAL | Uses generic PersonaDashboard |
| `/versotech_main/assigned-deals` | EXISTS | Deals assigned as lawyer |
| `/versotech_main/escrow` | EXISTS | Escrow management |
| `/versotech_main/subscription-packs` | EXISTS | View subscription packs |
| `/versotech_main/profile` | BUILT | Profile |
| `/versotech_main/documents` | BUILT | Documents |
| `/versotech_main/versosign` | BUILT | Signature queue |
| `/versotech_main/inbox` | BUILT | Notifications |

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
  { name: 'Assigned Deals', href: '/versotech_main/assigned-deals', icon: FileText },
  { name: 'Subscription Packs', href: '/versotech_main/subscription-packs', icon: FileCheck },
  { name: 'Escrow', href: '/versotech_main/escrow', icon: Wallet },
  { name: 'Documents', href: '/versotech_main/documents', icon: FileText },
]
```

---

## 3. WHAT'S MISSING

### 3.1 Subscription Pack Visibility (READ-ONLY)

**User Stories (Section 3.2.1):**

| Row | Story | Status |
|-----|-------|--------|
| 11 | Receive notification when subscription pack signed by CEO | MISSING |
| 12 | Receive notification when subscription pack signed by Arranger | MISSING |
| 13 | Receive notification when signed by investors | MISSING |

**What's Needed:**
- Lawyer sees signed subscription packs for their assigned deals
- Cannot modify, only view and download
- Notified when investor completes signing

### 3.2 Escrow Confirmation Flow

**User Stories (Section 3.3):**

| Row | Story | Status |
|-----|-------|--------|
| 26 | Send notification once escrow funding is completed | PARTIAL |
| 27 | Send/receive notification if not completed yet | MISSING |
| 28 | Display Partner invoice details | MISSING |
| 29 | Send notification when Partner fees payment completed | MISSING |
| 31 | Display Introducer invoice details | MISSING |
| 32 | Send notification when Introducer fees payment completed | MISSING |
| 34 | Display Commercial Partner invoice details | MISSING |
| 35 | Send notification when CP fees payment completed | MISSING |
| 37 | Send notification when payment to Seller completed | MISSING |
| 38 | Send notification with escrow account funding amount | PARTIAL |

**Flow:**
1. Lawyer views escrow status
2. When funds arrive, lawyer confirms completion
3. Notification sent to CEO
4. For fee payments: Lawyer confirms processed, notifies parties

### 3.3 Lawyer Dashboard

**Required Metrics:**
- Assigned deals count
- Pending escrow confirmations
- Recent subscriptions requiring attention
- Payment requests awaiting processing

---

## 4. IMPLEMENTATION TASKS

### Task 1: Subscription Pack View Enhancement (4 hours)

**Files to Modify:**

```
src/app/(main)/versotech_main/subscription-packs/page.tsx
src/app/(main)/versotech_main/subscription-packs/subscription-packs-client.tsx
```

**Current State:**
- Page exists but may not filter by lawyer assignment

**Required Changes:**
- Filter subscriptions WHERE deal is assigned to current lawyer
- Show only SIGNED packs (read-only access)
- Add download button for signed PDF
- Show investor name, deal name, signed date, status

**Query Logic:**
```typescript
// Get deals where current user is lawyer
const assignedDeals = await supabase
  .from('deal_memberships')
  .select('deal_id')
  .eq('user_id', currentUser.id)
  .eq('role', 'lawyer');

// Get subscriptions for those deals with signed status
const subscriptions = await supabase
  .from('subscriptions')
  .select('*, deals(*), investors(*)')
  .in('deal_id', assignedDeals.map(d => d.deal_id))
  .eq('status', 'committed'); // or later stages
```

### Task 2: Notification When Investor Signs (2 hours)

**Files to Create:**

```
src/lib/notifications/subscription-signed-notify-lawyer.ts
```

**Files to Modify:**

```
src/lib/signature/handlers.ts
```

**Current State:**
- `handleSubscriptionSignature` exists in handlers.ts
- Does not notify lawyer

**Add to handleSubscriptionSignature:**
```typescript
// After investor signs subscription pack:
// 1. Find lawyers assigned to this deal
const lawyers = await supabase
  .from('deal_memberships')
  .select('user_id, profiles(email, full_name)')
  .eq('deal_id', dealId)
  .eq('role', 'lawyer');

// 2. Create notification for each lawyer
for (const lawyer of lawyers) {
  await createNotification({
    user_id: lawyer.user_id,
    type: 'subscription_signed',
    title: 'Subscription Pack Signed',
    message: `${investorName} has signed the subscription pack for ${dealName}`,
    entity_type: 'subscription',
    entity_id: subscriptionId,
  });
}
```

### Task 3: Escrow Confirmation API (4 hours)

**Files to Create:**

```
src/app/api/escrow/[id]/confirm-funding/route.ts
src/app/api/escrow/[id]/confirm-payment/route.ts
src/components/lawyer/escrow-confirm-modal.tsx
```

**Escrow Funding Confirmation:**
```typescript
// POST /api/escrow/[id]/confirm-funding
// Body: { amount: number, confirmation_notes?: string }

// Actions:
// 1. Update subscription.funded_amount
// 2. If fully funded, update subscription.status
// 3. Create notification for CEO
// 4. Create audit log entry
```

**Fee Payment Confirmation:**
```typescript
// POST /api/escrow/[id]/confirm-payment
// Body: { 
//   payment_type: 'partner' | 'introducer' | 'commercial_partner' | 'seller',
//   recipient_id: string,
//   amount: number,
//   reference?: string
// }

// Actions:
// 1. Update fee_event status to 'paid'
// 2. Notify recipient (partner/introducer/CP)
// 3. Notify CEO
// 4. Create audit log
```

### Task 4: Escrow Notifications to CEO (2 hours)

**Files to Create:**

```
src/lib/notifications/escrow-funding-complete.ts
src/lib/notifications/fee-payment-complete.ts
```

**Notification Flow:**
1. Lawyer confirms escrow action
2. System creates notification for CEO
3. Optional: Email notification if urgent

### Task 5: Lawyer Dashboard (4 hours)

**Files to Create:**

```
src/components/dashboard/lawyer-dashboard.tsx
```

**Metrics to Show:**

| Metric | Query |
|--------|-------|
| Assigned Deals | `deal_memberships` WHERE role='lawyer' AND user_id=current |
| Pending Escrow | subscriptions WHERE status='signed' AND deal in assigned |
| Payment Requests | Tasks WHERE assigned_to=current AND type='payment_request' |
| Recent Subscriptions | Last 10 subscriptions in assigned deals |

**Data Cards:**
- "3 Deals Assigned" - Click → Assigned Deals page
- "2 Awaiting Funding" - Click → Escrow page filtered
- "1 Payment Request" - Click → Task detail
- Recent activity list

---

## 5. USER STORIES COVERAGE CHECK

### Will Be Implemented

| Section | Stories | Task |
|---------|---------|------|
| 3.2.1 Subscription pack | Rows 11-13 | Task 1, 2 |
| 3.2.2 Escrow account funding | Row 14 | Task 3 |
| 3.2.3-4 Certificate issuance | Rows 15-18 | Existing (notification only) |
| 3.2.5-8 Fee payments | Rows 19-24, 25 | Task 3, 4 |
| 3.3.1 Escrow account funding | Rows 26-27 | Task 3 |
| 3.3.2-3 Partner/Introducer payment | Rows 28-33 | Task 3, 4 |
| 3.3.4 Payment to seller | Row 37 | Task 3 |
| 3.3.5-8 Escrow status/events | Rows 38-46 | Task 3 |
| 3.4 Reporting | Rows 47-50 | Existing reconciliation |

### Deferred

| Section | Stories | Reason |
|---------|---------|--------|
| 3.5 GDPR | Rows 51-60 | See CEO plan |

---

## 6. TESTING CHECKLIST

### Lawyer Flow Tests

- [ ] Login as lawyer → Lawyer dashboard shows
- [ ] Dashboard shows assigned deals count
- [ ] Dashboard shows pending escrow count
- [ ] Navigate to Assigned Deals → Only assigned deals visible
- [ ] Navigate to Subscription Packs → Only signed packs for assigned deals
- [ ] Cannot see packs from other deals
- [ ] Investor signs pack → Lawyer receives notification
- [ ] Navigate to Escrow → See pending confirmations
- [ ] Confirm funding received → CEO notified
- [ ] Confirm fee payment → Recipient notified

### Security Tests

- [ ] Cannot access deals not assigned to
- [ ] Cannot modify subscription packs
- [ ] Cannot see other lawyers' assignments
- [ ] Cannot see investor details beyond assigned deals

---

## 7. DEPENDENCIES

**Requires Before Implementation:**
- VersaSign (for any lawyer signing) - ALREADY BUILT

**Blocks Other Features:**
- Escrow confirmation enables position creation
- Fee payment confirmation updates fee events

---

## 8. FILES SUMMARY

### To Create (6 files)

```
src/app/api/escrow/[id]/confirm-funding/route.ts
src/app/api/escrow/[id]/confirm-payment/route.ts
src/components/lawyer/escrow-confirm-modal.tsx
src/components/dashboard/lawyer-dashboard.tsx
src/lib/notifications/escrow-funding-complete.ts
src/lib/notifications/fee-payment-complete.ts
```

### To Modify (3 files)

```
src/app/(main)/versotech_main/subscription-packs/page.tsx
  - Filter by lawyer assignment
  - Read-only view only

src/lib/signature/handlers.ts
  - Add lawyer notification on signature

src/app/(main)/versotech_main/dashboard/page.tsx
  - Add lawyer dashboard variant
```

---

## 9. ACCEPTANCE CRITERIA

1. **Subscription Pack Visibility:**
   - [ ] Lawyer sees only packs from assigned deals
   - [ ] Only signed packs visible (not pending)
   - [ ] Can download PDF
   - [ ] Cannot modify any data

2. **Lawyer Notifications:**
   - [ ] Notified when investor signs pack
   - [ ] Notification shows investor name and deal
   - [ ] Links to subscription pack view

3. **Escrow Confirmation:**
   - [ ] Lawyer can confirm funding received
   - [ ] Confirmation updates subscription status
   - [ ] CEO receives notification
   - [ ] Audit log created

4. **Fee Payment Confirmation:**
   - [ ] Lawyer can confirm payment to partner/introducer/CP
   - [ ] Confirmation updates fee event status
   - [ ] Recipient and CEO notified

5. **Dashboard:**
   - [ ] Shows assigned deals count
   - [ ] Shows pending escrow actions
   - [ ] Shows payment requests
   - [ ] Links navigate correctly

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
      .from('deal_memberships')
      .select('id')
      .eq('deal_id', subscription.deal_id)
      .eq('user_id', user.id)
      .eq('role', 'lawyer')
      .single();

    if (!assignment) {
      return NextResponse.json({ error: 'Not assigned to this deal' }, { status: 403 });
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
      .select()
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
          type: 'escrow_funding_confirmed',
          title: 'Escrow Funding Confirmed',
          message: `${amount} received for subscription in ${subscription.deal?.name}. Status: ${newStatus}`,
          action_url: `/versotech_main/subscriptions/${params.id}`,
          metadata: {
            subscription_id: params.id,
            amount_confirmed: amount,
            total_funded: newFundedAmount,
            new_status: newStatus
          }
        });
      }
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      event_type: 'escrow',
      action: 'funding_confirmed',
      entity_type: 'subscription',
      entity_id: params.id,
      actor_id: user.id,
      action_details: {
        amount_confirmed: amount,
        bank_reference,
        confirmation_notes,
        previous_funded: currentFunded,
        new_funded: newFundedAmount,
        new_status: newStatus,
        lawyer_id: lawyerUser.lawyer_id
      },
      timestamp: new Date().toISOString()
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

// Find lawyers assigned to this deal
const { data: lawyerAssignments } = await supabase
  .from('deal_memberships')
  .select('user_id, profiles(full_name, email)')
  .eq('deal_id', subscription.deal_id)
  .eq('role', 'lawyer');

if (lawyerAssignments && lawyerAssignments.length > 0) {
  console.log('📝 [SUBSCRIPTION HANDLER] Found lawyer(s) to notify:', lawyerAssignments.length);

  for (const lawyer of lawyerAssignments) {
    await supabase.from('investor_notifications').insert({
      user_id: lawyer.user_id,
      type: 'subscription_signed_for_lawyer',
      title: 'Subscription Pack Signed',
      message: `${subscription.investor?.display_name || 'Investor'} has signed subscription pack for ${subscription.vehicle?.name}`,
      action_url: `/versotech_main/subscription-packs`,
      metadata: {
        subscription_id: subscriptionId,
        investor_id: subscription.investor_id,
        vehicle_id: subscription.vehicle_id,
        commitment: subscription.commitment
      }
    });
    console.log('✅ [SUBSCRIPTION HANDLER] Notified lawyer:', lawyer.user_id);
  }
} else {
  console.log('ℹ️ [SUBSCRIPTION HANDLER] No lawyers assigned to this deal');
}
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

      // Get assigned deal IDs
      const { data: assignments } = await supabase
        .from('deal_memberships')
        .select('deal_id')
        .eq('user_id', user.id)
        .eq('role', 'lawyer')

      const dealIds = assignments?.map(a => a.deal_id) || []

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
          .eq('status', 'committed'), // Signed but not funded
        supabase
          .from('subscriptions')
          .select('id', { count: 'exact', head: true })
          .in('deal_id', dealIds)
          .in('status', ['committed', 'active', 'partially_funded']),
        supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .eq('assigned_to', user.id)
          .eq('kind', 'payment_request')
          .eq('status', 'pending')
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
      href: '/versotech_main/tasks',
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

**Total Estimated Hours: 16**
- Subscription Pack View: 4 hours
- Notification on Sign: 2 hours
- Escrow Confirmation: 4 hours
- CEO Notifications: 2 hours
- Dashboard: 4 hours

**Priority: HIGH (Lawyer required for January 10 per client)**
**Risk: Low (mostly read-only and confirmations)**
**Last Updated:** December 24, 2025 (Developer-Ready)
