# Partner Implementation Plan

**User Type:** Partner
**Current Completion:** 25% (Audit-Verified: December 24, 2025)
**Target Completion:** 90%
**Estimated Hours:** 16 hours
**Last Audit:** December 24, 2025 - Deep Surgical Audit Complete

---

## ⚠️ CRITICAL AUDIT FINDING

**The core hybrid feature (conditional investor access) is NOT IMPLEMENTED.**

The plan requires checking `deal_memberships.role` to differentiate `partner` (tracking only) from `partner_investor` (can invest). However:

**Current Behavior (BROKEN):**
- `/api/investors/me/opportunities/[id]/route.ts` line 530:
  ```typescript
  can_subscribe: !subscription && isDealOpen  // ← NO ROLE CHECK!
  ```
- A partner dispatched with `role = 'partner'` (tracking only) CAN STILL SUBSCRIBE.
- There is NO enforcement preventing partners from investing in deals they shouldn't.

**Commercial Partner Comparison (CORRECT):**
- `/api/commercial-partners/proxy-subscribe/route.ts` line 103:
  ```typescript
  .in('role', ['commercial_partner_investor', 'commercial_partner_proxy'])  // ← CHECKS ROLE
  ```

**Fix Required:** Add role check to opportunities API: `can_subscribe: !subscription && isDealOpen && (membership?.role === 'partner_investor' || membership?.role === 'investor' || ...)`

---

## 1. WHO IS THE PARTNER?

The Partner is a hybrid user who can BOTH invest their own money AND bring other investors to deals. From user stories (Section 5.Partner, 105 rows):

**Business Role:**
- **CAN invest in deals** (when CEO dispatches them as investor for that deal)
- Tracks transactions from investors they referred
- Views fee models that apply to them
- Shares investment opportunities with their network
- Views reports on partner activity and commissions

**Key Distinction:**
- Partner does NOT automatically have investor access to all deals
- For EACH deal, CEO must dispatch the IO to the Partner AND mark them for investor access
- This creates `deal_memberships.role = 'partner_investor'`
- Without this, Partner can track referred investors but cannot invest themselves

**Hybrid Model:**
- Section 5.2: "My opportunities as investor (even if I am partner)" - Same as investor
- Section 5.6: "My Transactions (specifically as a PARTNER)" - Partner-specific features

---

## 2. WHAT ALREADY EXISTS

### 2.1 Database (100% COMPLETE ✓)

**Tables (All Exist - Verified via Supabase MCP):**
- `partners` - Partner accounts
- `partner_members` - Entity members
- `partner_users` - Links profiles to partners
- `deal_memberships` - Has ALL required roles
- `subscriptions` - For partner's own investments
- `fee_events` - Partner fee tracking

**deal_memberships.role ENUM Values (Verified):**
```
investor, co_investor, spouse, advisor, lawyer, banker,
introducer, viewer, verso_staff, partner_investor,
introducer_investor, commercial_partner_investor,
commercial_partner_proxy, arranger
```

**Referral Tracking (Verified):**
- Migration `20251218110000_add_referral_tracking_to_deal_memberships.sql` adds:
  - `referred_by_entity_id` (UUID)
  - `referred_by_entity_type` (partner, introducer, commercial_partner)
  - Indexes for efficient lookups

### 2.2 Pages (Verified - December 24, 2025)

| Route | Status | LOC | Description |
|-------|--------|-----|-------------|
| `/versotech_main/dashboard` | GENERIC | - | Uses PersonaDashboard, NO partner-specific metrics |
| `/versotech_main/opportunities` | BUILT | - | Works but NO role check for investment access |
| `/versotech_main/portfolio` | BUILT | - | For own investments |
| `/versotech_main/partner-transactions` | ✓ BUILT | 556 | Track referred investor transactions |
| `/versotech_main/shared-transactions` | ✓ BUILT | ~370 | Deals shared with network |
| `/versotech_main/profile` | BUILT | - | Profile |
| `/versotech_main/documents` | BUILT | - | Documents |
| `/versotech_main/inbox` | BUILT | - | Notifications |
| `/versotech_main/versosign` | BUILT | - | Signature queue |

### 2.3 API Routes (Verified)

| Route | Status | Notes |
|-------|--------|-------|
| `/api/admin/partners/*` | ✓ BUILT | Admin management |
| `/api/deals/[id]/dispatch` | ✓ BUILT | Accepts `partner_investor` role |
| `/api/investors/me/opportunities/[id]` | ⚠️ BUG | Sets `can_subscribe` WITHOUT checking role |
| `/api/partners/me/*` | ✗ MISSING | No partner self-service |
| `/api/partners/me/fee-models` | ✗ MISSING | Required for fee model view |
| `src/lib/partner/can-invest.ts` | ✗ MISSING | No centralized access check utility |

### 2.4 Navigation

**Configured in `persona-sidebar.tsx`:**
```typescript
partner: [
  { name: 'Dashboard', href: '/versotech_main/dashboard', icon: LayoutDashboard },
  { name: 'Opportunities', href: '/versotech_main/opportunities', icon: TrendingUp },
  { name: 'Partner Transactions', href: '/versotech_main/partner-transactions', icon: ArrowLeftRight },
  { name: 'Shared Deals', href: '/versotech_main/shared-transactions', icon: Share2 },
]
```

---

## 3. WHAT'S MISSING

### 3.1 Conditional Investor Access

**User Stories (Section 5.2):**
- Rows 15-46: Same as investor BUT only for deals where dispatched as investor

**Current Problem:**
- Partner may see opportunities page but shouldn't be able to invest in deals where they're not dispatched as `partner_investor`

**What's Needed:**
- Check `deal_memberships.role` for each deal
- If `partner_investor`: Show full investor journey (NDA, subscribe, sign)
- If `partner` only: Show deal info but disable investment actions

### 3.2 Partner Fee Model View

**User Stories (Section 5.6.1, Row 77):**
- "I want to display the Partner fees model per Opportunity that applies to ME"

**What's Needed:**
- View fee model assigned by CEO/Arranger
- Read-only (Partner cannot edit)
- Shows per-opportunity

### 3.3 Partner Dashboard

**Required Metrics:**
- Deals available for investment (where `partner_investor`)
- Referred investor count
- Total referred investment amount
- Pending commissions

### 3.4 Partner Transaction Tracking

**User Stories (Section 5.6.2, Rows 80-87):**

| Row | Story | Status |
|-----|-------|--------|
| 80 | View notifications: subscription pack sent to referred investors | PARTIAL |
| 81 | View notifications: pack approved by referred investors | PARTIAL |
| 82 | View notifications: pack signed by referred investors | PARTIAL |
| 83 | View notifications: escrow funded by referred investors | PARTIAL |
| 84 | View notifications: VERSO proceeded to partner payment | MISSING |
| 85 | View notifications: Partner invoice sent to VERSO | MISSING |
| 86 | View notifications: VERSO proceeded to partner payment | MISSING |
| 87 | View transaction summary prior to generating invoice | MISSING |

---

## 4. IMPLEMENTATION TASKS

### Task 1: Conditional Investor Access Check (4 hours)

**Files to Create:**

```
src/lib/partner/can-invest.ts
```

**Files to Modify:**

```
src/app/(main)/versotech_main/opportunities/[id]/page.tsx
src/components/deals/deal-actions.tsx
```

**Check Function:**
```typescript
// lib/partner/can-invest.ts
export async function canPartnerInvestInDeal(
  userId: string,
  dealId: string
): Promise<{ canInvest: boolean; role: string | null }> {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('deal_memberships')
    .select('role')
    .eq('user_id', userId)
    .eq('deal_id', dealId)
    .single();
  
  if (!data) {
    return { canInvest: false, role: null };
  }
  
  // Can invest if role is partner_investor
  return {
    canInvest: data.role === 'partner_investor',
    role: data.role
  };
}
```

**UI Changes:**
- Opportunity detail page checks `canPartnerInvestInDeal`
- If true: Show all investor actions (NDA, Subscribe, Sign)
- If false (just `partner`): Show deal info, hide investment actions, show "Contact CEO for investor access"

### Task 2: Wire Investor Journey for Partner (4 hours)

**Files to Modify:**

```
src/app/(main)/versotech_main/opportunities/[id]/page.tsx
```

**Current State:**
- Page shows investor journey for investors
- Need to handle partner case

**Changes:**
1. Detect if user is Partner persona
2. Check `deal_memberships.role` for this deal
3. If `partner_investor`: Use full investor journey component
4. If `partner` only: Show read-only deal view + tracking

**Journey Bar Integration:**
- Reuse investor journey bar component
- Same 10 stages
- Only show if user can invest in this deal

### Task 3: Partner Fee Model View (2 hours)

**Files to Create:**

```
src/components/partner/fee-model-view.tsx
src/app/api/partners/me/fee-models/route.ts
```

**API Route:**
```typescript
// GET /api/partners/me/fee-models
// Returns fee models assigned to current partner

// Query:
// 1. Get partner_id from partner_users where user_id = current
// 2. Get fee_plans where partner_id matches OR deal-specific plans
```

**Component:**
- Shows fee model cards per opportunity
- Subscription fee %, Management fee %, Performance fee %
- Read-only display

### Task 4: Partner Dashboard (4 hours)

**Files to Create:**

```
src/components/dashboard/partner-dashboard.tsx
```

**Metrics to Show:**

| Metric | Query |
|--------|-------|
| Deals for Investment | `deal_memberships` WHERE role='partner_investor' |
| Referred Investors | `subscriptions` WHERE referred_by_partner = current_partner |
| Total Referred Amount | SUM of referred subscriptions.amount |
| Pending Commissions | `fee_events` WHERE partner_id = current AND status='pending' |

**Data Cards:**
- "5 Deals Available" - Click → Opportunities (filtered to investable)
- "12 Referred Investors" - Click → Partner Transactions
- "$2.5M Referred" - Total amount
- "$50K Pending Commissions" - Click → Transaction summary

**Recent Activity:**
- Last 10 transactions from referred investors
- Status updates on own investments

---

## 5. USER STORIES COVERAGE CHECK

### Will Be Implemented

| Section | Stories | Task |
|---------|---------|------|
| 5.2 My opportunities as investor | Rows 15-46 | Task 1, 2 (conditional) |
| 5.3 My Investments | Rows 47-62 | Uses investor journey |
| 5.5 My Investment Sales | Rows 66-70 | Uses investor resale |
| 5.6.1 View My Transactions | Rows 71-79 | Existing + Task 3 |
| 5.6.2 My Transactions tracking | Rows 80-87 | Notifications + tracking |
| 5.6.3 My Transactions Reporting | Rows 88-94 | Existing reports |
| 5.6.4 My Shared Transactions | Rows 95-96 | Existing page |

### Deferred

| Section | Stories | Reason |
|---------|---------|--------|
| 5.7 GDPR | Rows 97-106 | See CEO plan |

---

## 6. TESTING CHECKLIST

### Partner Flow Tests

- [ ] Login as partner → Partner dashboard shows
- [ ] Dashboard shows correct metrics
- [ ] Navigate to Opportunities → See dispatched deals
- [ ] Deal where dispatched as `partner_investor` → Full investor journey available
- [ ] Deal where dispatched as `partner` only → View only, no invest button
- [ ] Submit subscription on investable deal → Works like investor
- [ ] Sign subscription pack → Works like investor
- [ ] Navigate to Partner Transactions → See referred investors
- [ ] View fee model → Shows assigned fee structure
- [ ] Navigate to Shared Deals → See deals shared to network

### Hybrid Tests

- [ ] Partner with investor access to Deal A → Can invest in Deal A
- [ ] Same partner, Deal B (partner only) → Cannot invest in Deal B
- [ ] Partner refers investor to Deal B → Sees in Partner Transactions

---

## 7. DEPENDENCIES

**Requires Before Implementation:**
- Investor journey components (BUILT)
- Journey bar (see Investor plan)

**Blocks Other Features:**
- None (Partner is standalone hybrid)

---

## 8. FILES SUMMARY

### To Create (5 files)

```
src/lib/partner/can-invest.ts
src/components/partner/fee-model-view.tsx
src/app/api/partners/me/fee-models/route.ts
src/components/dashboard/partner-dashboard.tsx
```

### To Modify (3 files)

```
src/app/(main)/versotech_main/opportunities/[id]/page.tsx
  - Check partner investor access
  - Conditionally render investor actions

src/components/deals/deal-actions.tsx
  - Add partner access check
  - Disable actions if not partner_investor

src/app/(main)/versotech_main/dashboard/page.tsx
  - Add partner dashboard variant
```

---

## 9. ACCEPTANCE CRITERIA

1. **Conditional Investor Access:**
   - [ ] Partner with `partner_investor` role for deal → Can see full investor journey
   - [ ] Partner with only `partner` role for deal → Cannot invest, sees "tracking only"
   - [ ] Actions (NDA, Subscribe, Sign) disabled for tracking-only deals
   - [ ] Clear messaging about access level

2. **Fee Model View:**
   - [ ] Partner can see fee models assigned to them
   - [ ] Shows per-opportunity fee structure
   - [ ] Read-only (no edit capability)

3. **Partner Dashboard:**
   - [ ] Shows deals available for investment count
   - [ ] Shows referred investor count
   - [ ] Shows total referred amount
   - [ ] Shows pending commissions
   - [ ] Links navigate correctly

4. **Transaction Tracking:**
   - [ ] Partner sees referred investor activity
   - [ ] Notifications for subscription pack events
   - [ ] Can view transaction summaries

---

## 10. FEATURE TRUTH TABLE (Audit-Verified)

| Feature | Planned | Exists | Working | Priority |
|---------|---------|--------|---------|----------|
| Partner Persona | ✓ | ✓ | ✓ | - |
| Partner Database Schema | ✓ | ✓ | ✓ | - |
| Deal Dispatch with role | ✓ | ✓ | ✓ | - |
| Partner Transactions Page | ✓ | ✓ | ✓ | - |
| Shared Transactions Page | ✓ | ✓ | ✓ | - |
| Referral Tracking Foundation | ✓ | ✓ | PARTIAL | - |
| **Conditional Investor Access** | **✓** | **✗** | **✗** | **P0** |
| Role-based subscription guard | ✓ | ✗ | ✗ | P0 |
| Partner Dashboard | ✓ | ✗ | ✗ | P1 |
| Fee Model View | ✓ | ✗ | ✗ | P1 |
| `can-invest.ts` utility | ✓ | ✗ | ✗ | P1 |

---

## 11. COMPLETION BREAKDOWN

| Component | Completion | Notes |
|-----------|------------|-------|
| Database Schema | 100% | All tables and enums exist |
| Referral Tracking | 95% | Foundation exists, not fully wired |
| Partner Routes | 75% | partner-transactions, shared exist |
| Dispatch Logic | 90% | Accepts role but doesn't enforce |
| **Conditional Access** | **0%** | CRITICAL GAP |
| Fee Model View | 0% | API and component missing |
| Partner Dashboard | 0% | Uses generic PersonaDashboard |
| API Layer | 70% | Dispatch works, self-service missing |

**TRUE FUNCTIONAL COMPLETION: 25%**

---

## 12. DEVELOPER-READY IMPLEMENTATION CODE

### 12.1 Conditional Investor Access Check Utility

**File: `src/lib/partner/can-invest.ts`**

```typescript
/**
 * Partner Conditional Investor Access
 *
 * Checks if a partner can invest in a specific deal.
 * Partner can invest ONLY if dispatched with role = 'partner_investor'
 */

import { createClient } from '@/lib/supabase/server';

export interface CanInvestResult {
  canInvest: boolean;
  role: string | null;
  reason: string;
}

export async function canPartnerInvestInDeal(
  userId: string,
  dealId: string
): Promise<CanInvestResult> {
  const supabase = await createClient();

  // Get deal membership for this user+deal
  const { data: membership, error } = await supabase
    .from('deal_memberships')
    .select('role, dispatched_at')
    .eq('user_id', userId)
    .eq('deal_id', dealId)
    .single();

  if (error || !membership) {
    return {
      canInvest: false,
      role: null,
      reason: 'No deal membership found'
    };
  }

  // Check if role allows investing
  const investorRoles = ['partner_investor', 'investor', 'co_investor'];

  if (investorRoles.includes(membership.role)) {
    return {
      canInvest: true,
      role: membership.role,
      reason: 'Has investor access for this deal'
    };
  }

  // Partner-only role (tracking)
  if (membership.role === 'partner') {
    return {
      canInvest: false,
      role: membership.role,
      reason: 'Partner tracking only - contact CEO for investor access'
    };
  }

  return {
    canInvest: false,
    role: membership.role,
    reason: 'Role does not permit investment'
  };
}

// Client-side version
export async function canPartnerInvestInDealClient(
  supabase: any,
  userId: string,
  dealId: string
): Promise<CanInvestResult> {
  const { data: membership, error } = await supabase
    .from('deal_memberships')
    .select('role')
    .eq('user_id', userId)
    .eq('deal_id', dealId)
    .single();

  if (error || !membership) {
    return { canInvest: false, role: null, reason: 'No membership' };
  }

  const investorRoles = ['partner_investor', 'investor', 'co_investor'];
  return {
    canInvest: investorRoles.includes(membership.role),
    role: membership.role,
    reason: investorRoles.includes(membership.role)
      ? 'Has investor access'
      : 'Tracking only'
  };
}
```

### 12.2 Fix Opportunities API - Add Role Check

**Modify: `src/app/api/investors/me/opportunities/[id]/route.ts`**

Around line 530, change:

```typescript
// BEFORE (BROKEN):
can_subscribe: !subscription && isDealOpen

// AFTER (FIXED):
can_subscribe: !subscription && isDealOpen && (
  membership?.role === 'investor' ||
  membership?.role === 'partner_investor' ||
  membership?.role === 'introducer_investor' ||
  membership?.role === 'commercial_partner_investor' ||
  membership?.role === 'co_investor'
)
```

**Full context - Replace the return statement section:**

```typescript
// Check if user's role allows subscription
const canSubscribeRoles = [
  'investor',
  'partner_investor',
  'introducer_investor',
  'commercial_partner_investor',
  'co_investor'
];

const roleAllowsSubscription = membership?.role
  ? canSubscribeRoles.includes(membership.role)
  : false;

return NextResponse.json({
  data: {
    ...deal,
    membership,
    interest,
    subscription,
    nda_status: ndaStatus,
    data_room_access: dataRoomAccess,
    // CRITICAL FIX: Check role before allowing subscription
    can_subscribe: !subscription && isDealOpen && roleAllowsSubscription,
    // Indicate tracking-only status
    is_tracking_only: membership?.role && !roleAllowsSubscription,
    tracking_message: !roleAllowsSubscription
      ? 'You can track this deal but cannot invest. Contact CEO for investor access.'
      : null
  }
});
```

### 12.3 Partner Dashboard Component

**File: `src/components/dashboard/partner-dashboard.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, DollarSign, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface DashboardMetrics {
  dealsForInvestment: number
  referredInvestors: number
  totalReferredAmount: number
  pendingCommissions: number
}

export function PartnerDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    dealsForInvestment: 0,
    referredInvestors: 0,
    totalReferredAmount: 0,
    pendingCommissions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetrics() {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get partner_id
      const { data: partnerUser } = await supabase
        .from('partner_users')
        .select('partner_id')
        .eq('user_id', user.id)
        .single()

      if (!partnerUser) {
        setLoading(false)
        return
      }

      // Fetch metrics in parallel
      const [investableDeals, referredSubs, pendingFees] = await Promise.all([
        // Deals where partner can invest
        supabase
          .from('deal_memberships')
          .select('deal_id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('role', 'partner_investor'),
        // Subscriptions referred by this partner
        supabase
          .from('subscriptions')
          .select('id, commitment')
          .eq('referred_by_entity_type', 'partner')
          .eq('referred_by_entity_id', partnerUser.partner_id),
        // Pending fee events
        supabase
          .from('fee_events')
          .select('computed_amount')
          .eq('partner_id', partnerUser.partner_id)
          .eq('status', 'accrued')
      ])

      const totalReferred = (referredSubs.data || []).reduce(
        (sum, s) => sum + (s.commitment || 0), 0
      )
      const totalPending = (pendingFees.data || []).reduce(
        (sum, f) => sum + (f.computed_amount || 0), 0
      )

      setMetrics({
        dealsForInvestment: investableDeals.count || 0,
        referredInvestors: referredSubs.data?.length || 0,
        totalReferredAmount: totalReferred,
        pendingCommissions: totalPending
      })
      setLoading(false)
    }

    fetchMetrics()
  }, [])

  const cards = [
    {
      title: 'Deals for Investment',
      value: metrics.dealsForInvestment,
      icon: TrendingUp,
      href: '/versotech_main/opportunities',
      color: 'text-blue-500',
      badge: metrics.dealsForInvestment > 0
    },
    {
      title: 'Referred Investors',
      value: metrics.referredInvestors,
      icon: Users,
      href: '/versotech_main/partner-transactions',
      color: 'text-emerald-500'
    },
    {
      title: 'Total Referred',
      value: `$${(metrics.totalReferredAmount / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      href: '/versotech_main/partner-transactions',
      color: 'text-purple-500',
      isFormatted: true
    },
    {
      title: 'Pending Commissions',
      value: `$${metrics.pendingCommissions.toLocaleString()}`,
      icon: Clock,
      href: '/versotech_main/partner-transactions',
      color: 'text-amber-500',
      isFormatted: true
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Partner Dashboard</h1>
        <p className="text-muted-foreground">Track your investments and referrals</p>
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
                    {loading ? '...' : card.isFormatted ? card.value : card.value}
                  </div>
                  <div className="flex items-center gap-2">
                    {card.badge && (
                      <Badge variant="secondary">View</Badge>
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
- Conditional Investor Access (P0): 4 hours
- Wire Investor Journey (P0): 4 hours
- Fee Model View (P1): 4 hours
- Dashboard (P1): 4 hours

**Priority: HIGH (Hybrid role must work correctly)**
**Risk: HIGH (Access control is BROKEN - partners can invest in any deal)**
**Last Updated:** December 24, 2025 (Developer-Ready)
