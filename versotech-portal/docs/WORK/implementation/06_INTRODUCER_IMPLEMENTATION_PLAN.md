# Introducer Implementation Plan

**User Type:** Introducer
**Current Completion:** 28% (Audit-Verified: December 24, 2025)
**Target Completion:** 95%
**Estimated Hours:** 28 hours
**Last Audit:** December 24, 2025 - Deep Surgical Audit Complete

---

## ⚠️ CRITICAL AUDIT FINDING: Agreement Blocking is FUNCTIONALLY BROKEN

**THE KEY QUESTION:** Is the agreement blocking (the #1 critical business rule) actually working?

**ANSWER:** PARTIAL and INVERTED

### What's Blocked (WORKS):
- Staff CANNOT dispatch an `introducer_investor` to a deal without a signed agreement (403 error at dispatch-time)

### What's MISSING (BROKEN):
- **Introducer CANNOT see, sign, or approve their agreement** (no UI exists)
- **Staff CANNOT create/send agreements** (no API exists)
- Introductions page doesn't check agreement status before loading
- Introduction blocking is at DISPATCH-time only, not introduction-time
- `/api/staff/introductions` allows creating introductions WITHOUT checking agreement

### Critical Path is BROKEN:
```
Staff → Create Agreement → Introducer Approves → Both Sign → Introducer Can Introduce
         ↓                    ↓                    ↓
      NO API             NO UI               NO VERSASIGN
```

**Only the last step (blocking dispatch) is enforced. The middle steps are missing entirely.**

---

## 1. WHO IS THE INTRODUCER?

The Introducer brings new investors to deals for a commission. From user stories (Section 6.Introducer, 111 rows):

**Business Role:**
- **CAN invest in deals** (when CEO dispatches them as investor for that deal)
- **MUST sign Introducer Agreement BEFORE making introductions** (CRITICAL)
- Tracks their introductions (referrals)
- Views fee models/commissions that apply to them
- Views reports on introducer activity

**Key Distinction:**
- Introducer does NOT automatically have investor access
- For EACH deal, CEO must dispatch to Introducer AND mark for investor access
- This creates `deal_memberships.role = 'introducer_investor'`
- **BLOCKING RULE:** Cannot introduce until agreement signed

**Agreement Requirement:**
- CEO/Arranger sends fee proposal (e.g., "1% fee on total investment")
- Introducer AGREES to fee terms (signs agreement)
- ONLY THEN can introducer make introductions

---

## 2. WHAT ALREADY EXISTS

### 2.1 Database (100% COMPLETE ✓)

**Tables (All Verified via Supabase MCP):**
- `introducers` - Introducer accounts (with contact_name, email, commission_cap_amount, payment_terms, agreement_expiry_date)
- `introducer_members` - Entity members
- `introducer_users` - Links profiles to introducers
- `introducer_agreements` - **17 columns** including: id, introducer_id, status, signed_date, effective_date, expiry_date, agreement_type, commission_bps, territory, exclusivity_level
- `deal_memberships` - Has `role = 'introducer_investor'` and `role = 'introducer'`
- `introductions` - ✓ EXISTS (with introduced_at, commission_rate_override_bps)
- `introducer_commissions` - ✓ EXISTS (links to introductions, tracks accrual/payment)

**deal_memberships.role ENUM (Verified):**
- `introducer` - Can track introductions, cannot invest
- `introducer_investor` - Can invest in this deal + track introductions

**Current Data:** 0 test agreements loaded (empty table)

### 2.2 Pages (Verified - December 24, 2025)

| Route | Status | Notes |
|-------|--------|-------|
| `/versotech_main/dashboard` | GENERIC | Uses PersonaDashboard, NO introducer-specific metrics |
| `/versotech_main/opportunities` | ⚠️ NOT IN NAV | Exists but NOT in introducer navigation |
| `/versotech_main/portfolio` | INHERITED | For own investments (if introducer_investor) |
| `/versotech_main/introductions` | ✓ BUILT | Lists introductions, **NO agreement check on load** |
| `/versotech_main/introducer-agreements` | ⚠️ VIEW ONLY | List with summary cards, filters, search - **NO [id] detail page** |
| `/versotech_main/introducer-agreements/[id]` | ✗ MISSING | **No approve/reject/sign actions possible** |
| `/versotech_main/introducers` (staff) | ✓ BUILT | Staff list view |
| `/versotech_main/introducers/[id]` (staff) | ✓ BUILT | Staff detail view |
| `/versotech_main/my-introducers` (arranger) | ✓ BUILT | Arranger's introducers with agreement expiry |
| `/versotech_main/profile` | BUILT | Profile |
| `/versotech_main/documents` | BUILT | Documents |
| `/versotech_main/inbox` | BUILT | Messages (in nav) |
| `/versotech_main/versosign` | BUILT | Signature queue |

**Page Issues:**
- Opportunities NOT in introducer navigation (cannot access investment journey)
- Agreement detail page MISSING (cannot approve/reject/sign)
- Introductions page has NO "Sign Agreement First" banner

### 2.3 API Routes (Verified - 25% Complete)

| Route | Method | Status | Notes |
|-------|--------|--------|-------|
| `/api/introducers/[id]/agreement-status` | GET | ✓ BUILT | Returns: agreement_signed, can_introduce, signed_at, expiry_date |
| `/api/deals/[id]/dispatch` | POST | ✓ BUILT | **Blocks introducer_investor dispatch without signed agreement** |
| `/api/staff/fees/commissions/create` | POST | ✓ BUILT | Requires valid signed agreement (secondary check) |
| `/api/staff/introductions` | POST | ⚠️ BUG | **Does NOT check agreement before creating introduction** |
| `/api/staff/introducers/*` | * | ✓ BUILT | Staff management |
| `/api/introducer-agreements` | POST | ✗ MISSING | Cannot create agreement |
| `/api/introducer-agreements` | GET | ✗ MISSING | Cannot list agreements for introducer |
| `/api/introducer-agreements/[id]` | GET | ✗ MISSING | Cannot get agreement detail |
| `/api/introducer-agreements/[id]/approve` | POST | ✗ MISSING | Cannot approve agreement |
| `/api/introducer-agreements/[id]/reject` | POST | ✗ MISSING | Cannot reject agreement |
| `/api/introducer-agreements/[id]/sign` | POST | ✗ MISSING | Cannot sign via VersaSign |
| `/api/introducers/me/fee-models` | GET | ✗ MISSING | Cannot view fee models |

**API Score: 1.5 / 6 required routes = 25%**

### 2.4 Navigation

**Configured in `persona-sidebar.tsx`:**
```typescript
introducer: [
  { name: 'Dashboard', href: '/versotech_main/dashboard', icon: LayoutDashboard },
  { name: 'Opportunities', href: '/versotech_main/opportunities', icon: TrendingUp },
  { name: 'Introductions', href: '/versotech_main/introductions', icon: UserPlus },
  { name: 'Agreements', href: '/versotech_main/introducer-agreements', icon: FileText },
]
```

---

## 3. WHAT'S MISSING

### 3.1 Agreement Signing Flow (CRITICAL BLOCKER)

**User Stories (Section 6.6.2, Rows 81-90):**

| Row | Story | Status |
|-----|-------|--------|
| 81 | Display Introducer agreement dispatched to me | PARTIAL |
| 82 | View reminders to approve agreement | MISSING |
| 83 | View reminders to sign agreement | MISSING |
| 84 | Approve an Introducer Agreement | MISSING |
| 85 | Sign an Introducer Agreement | MISSING |
| 86 | Receive notification agreement signed successfully | MISSING |
| 87 | Reject an Introducer Agreement | MISSING |
| 88 | Receive notification agreement rejected | MISSING |
| 89 | Display list of Introducer Agreements | PARTIAL |
| 90 | View details of selected agreement | PARTIAL |

**CRITICAL RULE:**
- Introducer CANNOT make introductions until they have a signed agreement
- Agreement defines commission terms
- Both parties must sign (Arranger/CEO signs first, then Introducer)

### 3.2 Block Introductions Until Agreement Signed

**Current State:**
- `/api/introducers/[id]/agreement-status` exists
- But introduction API doesn't enforce this

**What's Needed:**
- API returns 403 if introducer tries to introduce without signed agreement
- UI shows "Sign Agreement First" message
- Clear path to sign agreement

### 3.3 Conditional Investor Access

**Same as Partner:**
- Check `deal_memberships.role` for each deal
- If `introducer_investor`: Show full investor journey
- If `introducer` only: Show deal info, disable investment

### 3.4 Introducer Dashboard

**Required Metrics:**
- Agreement status (signed/pending)
- Total introductions made
- Total commission earned
- Pending commissions
- Deals available for investment

### 3.5 Introducer Agreement CRUD API

**What's Needed:**
- Full CRUD for introducer agreements
- Approval workflow
- Signing via VersaSign

---

## 4. IMPLEMENTATION TASKS

### Task 1: Introducer Agreement CRUD API (6 hours)

**Files to Create:**

```
src/app/api/introducer-agreements/route.ts
src/app/api/introducer-agreements/[id]/route.ts
src/app/api/introducer-agreements/[id]/approve/route.ts
src/app/api/introducer-agreements/[id]/reject/route.ts
src/app/api/introducer-agreements/[id]/sign/route.ts
```

**List/Create Agreement:**
```typescript
// GET /api/introducer-agreements
// Returns agreements for current introducer

// POST /api/introducer-agreements (CEO/Arranger only)
// Body: {
//   introducer_id: string,
//   commission_rate_bps: number,
//   commission_cap_amount?: number,
//   territory?: string,
//   deal_types?: string[],
//   effective_date: string,
//   expiry_date?: string
// }
```

**Agreement Approval:**
```typescript
// POST /api/introducer-agreements/[id]/approve
// Introducer approves the terms

// POST /api/introducer-agreements/[id]/reject
// Body: { reason: string }
// Introducer rejects with reason
```

**Agreement Signing:**
```typescript
// POST /api/introducer-agreements/[id]/sign
// Creates signature request via VersaSign
// Updates agreement status to 'pending_signature'

// After both parties sign (via VersaSign handlers):
// Update agreement status to 'active'
```

### Task 2: Agreement Signing Page (4 hours)

**Files to Create:**

```
src/app/(main)/versotech_main/introducer-agreements/[id]/page.tsx
src/components/introducer/agreement-detail.tsx
src/components/introducer/agreement-actions.tsx
```

**Agreement Detail Page:**
- Shows agreement terms (commission rate, territory, etc.)
- Shows current status (pending_approval, pending_signature, active, rejected)
- Actions based on status:
  - `pending_approval`: Approve / Reject buttons
  - `pending_signature`: Sign button (launches VersaSign)
  - `active`: No actions (read-only)
  - `rejected`: Show rejection reason

### Task 3: Block Introductions Until Agreement Signed (4 hours)

**Files to Modify:**

```
src/app/api/staff/introductions/route.ts
src/app/(main)/versotech_main/introductions/page.tsx
```

**API Enforcement:**
```typescript
// POST /api/staff/introductions
// Before creating introduction:

const agreementStatus = await checkIntroducerAgreementStatus(introducerId);

if (!agreementStatus.hasSignedAgreement) {
  return NextResponse.json(
    { error: 'Introducer must sign agreement before making introductions' },
    { status: 403 }
  );
}
```

**UI Enforcement:**
- Introductions page checks agreement status on load
- If no signed agreement:
  - Show banner: "You need to sign an Introducer Agreement before making introductions"
  - Button: "View Agreements" → Navigate to `/introducer-agreements`
  - Disable any "Add Introduction" functionality

### Task 4: Conditional Investor Access Check (4 hours)

**Files to Create:**

```
src/lib/introducer/can-invest.ts
```

**Files to Modify:**

```
src/app/(main)/versotech_main/opportunities/[id]/page.tsx
```

**Check Function:**
```typescript
// lib/introducer/can-invest.ts
export async function canIntroducerInvestInDeal(
  userId: string,
  dealId: string
): Promise<{ canInvest: boolean; role: string | null }> {
  const { data } = await supabase
    .from('deal_memberships')
    .select('role')
    .eq('user_id', userId)
    .eq('deal_id', dealId)
    .single();
  
  return {
    canInvest: data?.role === 'introducer_investor',
    role: data?.role || null
  };
}
```

**UI Changes:**
- Same pattern as Partner
- If `introducer_investor`: Full investor journey
- If `introducer` only: View only, no invest actions

### Task 5: Introducer Dashboard (4 hours)

**Files to Create:**

```
src/components/dashboard/introducer-dashboard.tsx
```

**Metrics to Show:**

| Metric | Query |
|--------|-------|
| Agreement Status | `introducer_agreements` WHERE status |
| Total Introductions | COUNT of `introductions` WHERE introducer_id |
| Total Commission Earned | SUM of paid `fee_events` |
| Pending Commissions | SUM of pending `fee_events` |
| Deals for Investment | `deal_memberships` WHERE role='introducer_investor' |

**Conditional Display:**
- If no agreement: Show prominent "Sign Agreement" CTA
- If agreement pending: Show "Waiting for signature"
- If agreement active: Show normal metrics

**Data Cards:**
- "Agreement: Active" or "Agreement: Required" (with sign button)
- "15 Introductions Made" - Click → Introductions page
- "$75K Earned" - Total commission
- "$10K Pending" - Awaiting payment

### Task 6: Fee Model View (4 hours)

**Files to Create:**

```
src/components/introducer/fee-model-view.tsx
src/app/api/introducers/me/fee-models/route.ts
```

**Same pattern as Partner:**
- Shows fee models assigned
- Read-only view
- Per-opportunity display

---

## 5. USER STORIES COVERAGE CHECK

### Will Be Implemented

| Section | Stories | Task |
|---------|---------|------|
| 6.2 My opportunities as investor | Rows 15-46 | Task 4 (conditional) |
| 6.3 My Investments | Rows 47-51 | Uses investor journey |
| 6.5 My Investment Sales | Rows 66-70 | Uses investor resale |
| 6.6.1 View My Introductions | Rows 71-79 | Existing + Task 6 |
| 6.6.2 My Introduction Agreements | Rows 81-90 | Task 1, 2, 3 |
| 6.6.3 My Introductions tracking | Rows 91-97 | Existing notifications |
| 6.6.4 My Introductions Reporting | Rows 100-105 | Existing reports |

### Deferred

| Section | Stories | Reason |
|---------|---------|--------|
| 6.3.6-6.3.7 Conversion/Redemption | Rows 52-62 | Post-launch |
| 6.7 GDPR | Rows 106-115 | See CEO plan |

---

## 6. TESTING CHECKLIST

### Introducer Flow Tests

- [ ] Login as introducer → Introducer dashboard shows
- [ ] Dashboard shows agreement status prominently
- [ ] No agreement → "Sign Agreement First" CTA displayed
- [ ] Navigate to Agreements → See pending agreement
- [ ] Approve agreement → Status changes to pending_signature
- [ ] Sign agreement → VersaSign flow launches
- [ ] After signing → Agreement status is 'active'
- [ ] Navigate to Introductions → Page loads normally (agreement signed)
- [ ] Attempt introduction without agreement → Blocked with message

### Conditional Investor Access Tests

- [ ] Deal where dispatched as `introducer_investor` → Full investor journey
- [ ] Deal where dispatched as `introducer` only → View only
- [ ] Submit subscription on investable deal → Works

### Agreement Workflow Tests

- [ ] CEO/Arranger sends agreement → Introducer notified
- [ ] Introducer approves → Arranger can sign
- [ ] Both sign via VersaSign → Agreement becomes active
- [ ] Introducer rejects → Arranger notified with reason

---

## 7. DEPENDENCIES

**Requires Before Implementation:**
- VersaSign (BUILT)
- Investor journey components (BUILT)

**Blocks Other Features:**
- Introducer cannot introduce until agreement signed (by design)

---

## 8. FILES SUMMARY

### To Create (12 files)

```
src/app/api/introducer-agreements/route.ts
src/app/api/introducer-agreements/[id]/route.ts
src/app/api/introducer-agreements/[id]/approve/route.ts
src/app/api/introducer-agreements/[id]/reject/route.ts
src/app/api/introducer-agreements/[id]/sign/route.ts

src/app/(main)/versotech_main/introducer-agreements/[id]/page.tsx
src/components/introducer/agreement-detail.tsx
src/components/introducer/agreement-actions.tsx
src/lib/introducer/can-invest.ts
src/components/introducer/fee-model-view.tsx
src/app/api/introducers/me/fee-models/route.ts
src/components/dashboard/introducer-dashboard.tsx
```

### To Modify (3 files)

```
src/app/api/staff/introductions/route.ts
  - Add agreement check before creating introduction

src/app/(main)/versotech_main/introductions/page.tsx
  - Show "Sign Agreement First" banner if no agreement
  - Disable add functionality if no agreement

src/app/(main)/versotech_main/opportunities/[id]/page.tsx
  - Add introducer investor access check
```

---

## 9. ACCEPTANCE CRITERIA

1. **Agreement CRUD:**
   - [ ] CEO/Arranger can create agreement for introducer
   - [ ] Introducer sees agreement in their portal
   - [ ] Introducer can approve or reject agreement
   - [ ] Rejection includes reason, notifies sender
   - [ ] After approval, both parties sign via VersaSign
   - [ ] Signed agreement status = 'active'

2. **Introduction Blocking:**
   - [ ] API returns 403 if introducer has no signed agreement
   - [ ] UI shows "Sign Agreement First" banner
   - [ ] Clear path to sign agreement provided
   - [ ] After signing, introduction functionality enabled

3. **Conditional Investor Access:**
   - [ ] `introducer_investor` role → Full investor journey
   - [ ] `introducer` role only → View only, no invest actions
   - [ ] Clear messaging about access level

4. **Dashboard:**
   - [ ] Shows agreement status prominently
   - [ ] Shows introduction count
   - [ ] Shows commission earned/pending
   - [ ] Shows deals available for investment
   - [ ] Appropriate CTAs based on agreement status

5. **Fee Model View:**
   - [ ] Introducer can see assigned fee models
   - [ ] Read-only display
   - [ ] Shows commission rate and terms

---

## 10. FEATURE TRUTH TABLE (Audit-Verified)

| Feature | Planned | Exists | Working | Priority |
|---------|---------|--------|---------|----------|
| Database schema (all tables) | ✓ | ✓ | ✓ | - |
| Agreement status check API | ✓ | ✓ | ✓ | - |
| Dispatch blocking (agreement required) | ✓ | ✓ | ✓ | - |
| Commission blocking (agreement required) | ✓ | ✓ | ✓ | - |
| Introduction blocking (API) | ✓ | ✗ | ✗ | P0 |
| Introduction blocking UI (banner) | ✓ | ✗ | ✗ | P0 |
| **Agreement CRUD API** | **✓** | **✗** | **✗** | **P0** |
| **Agreement detail page** | **✓** | **✗** | **✗** | **P0** |
| Agreement approval workflow | ✓ | ✗ | ✗ | P0 |
| Agreement signing (VersaSign) | ✓ | ✗ | ✗ | P0 |
| Conditional investor access | ✓ | ✗ | ✗ | P1 |
| Introducer dashboard | ✓ | ✗ | ✗ | P1 |
| Fee model view | ✓ | ✗ | ✗ | P2 |
| Opportunities in navigation | ✓ | ✗ | ✗ | P1 |

---

## 11. COMPLETION BREAKDOWN

| Component | Completion | Notes |
|-----------|------------|-------|
| Database | 100% | Full columns, constraints, types |
| Read-only endpoints | 60% | Agreement status API exists |
| Blocking enforcement | 50% | Dispatch yes, introduction no |
| Agreement CRUD | 0% | No create/update/delete |
| Agreement UI + Actions | 5% | List exists, no detail/actions |
| Business workflows | 20% | Blocking inverted |
| Conditional investor access | 0% | No introducer_investor logic |
| Dashboard | 0% | Generic PersonaDashboard |

**TRUE FUNCTIONAL COMPLETION: 28%**

---

## 12. BLOCKER CLASSIFICATION

### CRITICAL (Blocks All Introducer Functionality):
1. **Missing:** Agreement creation/sending API (staff cannot initiate agreement)
2. **Missing:** Agreement signing/approval UI (introducer cannot view/sign their agreement)
3. **Impact:** Business rule "must sign before introducing" cannot actually work end-to-end

### MAJOR (Partially Working):
1. **Partial:** Introduction blocking exists at dispatch-time, not introduction-time
2. **Missing:** Introduction page UI doesn't warn "Sign Agreement First"
3. **Missing:** `/api/staff/introductions` allows creating introductions without checking agreement

### MODERATE:
1. **Missing:** Introducer cannot see opportunities (not in nav, no conditional investor logic)
2. **Missing:** Introducer dashboard shows generic view (no agreement metrics)
3. **Missing:** Fee models not viewable

---

## 13. DEVELOPER-READY IMPLEMENTATION CODE

### 13.1 Introducer Agreement CRUD API

**File: `src/app/api/introducer-agreements/route.ts`**

```typescript
/**
 * Introducer Agreement CRUD API
 * GET - List agreements (filtered by user role)
 * POST - Create new agreement (staff/arranger only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createAgreementSchema = z.object({
  introducer_id: z.string().uuid(),
  deal_id: z.string().uuid().optional(),
  fee_plan_id: z.string().uuid().optional(),
  terms: z.string().optional(),
  valid_from: z.string().datetime().optional(),
  valid_until: z.string().datetime().optional()
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('introducer_agreements')
      .select(`
        *,
        introducer:introducers(id, legal_name, entity_name),
        fee_plan:fee_plans(id, name)
      `)
      .order('created_at', { ascending: false });

    // If introducer, only show their agreements
    if (profile?.role === 'investor') {
      const { data: introducerUser } = await supabase
        .from('introducer_users')
        .select('introducer_id')
        .eq('user_id', user.id)
        .single();

      if (introducerUser) {
        query = query.eq('introducer_id', introducerUser.introducer_id);
      } else {
        return NextResponse.json({ data: [] });
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching agreements:', error);
      return NextResponse.json({ error: 'Failed to fetch agreements' }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });

  } catch (error) {
    console.error('Agreements GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is staff or arranger
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const { data: arrangerUser } = await supabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'staff_admin' && !arrangerUser) {
      return NextResponse.json({ error: 'Not authorized to create agreements' }, { status: 403 });
    }

    const body = await request.json();
    const validation = createAgreementSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.issues
      }, { status: 400 });
    }

    // Create agreement
    const { data: agreement, error } = await supabase
      .from('introducer_agreements')
      .insert({
        ...validation.data,
        status: 'pending',
        created_by: user.id,
        arranger_id: arrangerUser?.arranger_id
      })
      .select(`
        *,
        introducer:introducers(id, legal_name)
      `)
      .single();

    if (error) {
      console.error('Failed to create agreement:', error);
      return NextResponse.json({ error: 'Failed to create agreement' }, { status: 500 });
    }

    // Notify the introducer
    const { data: introducerUsers } = await supabase
      .from('introducer_users')
      .select('user_id')
      .eq('introducer_id', validation.data.introducer_id);

    if (introducerUsers) {
      for (const iu of introducerUsers) {
        await supabase.from('investor_notifications').insert({
          user_id: iu.user_id,
          type: 'introducer_agreement_created',
          title: 'New Introducer Agreement',
          message: 'You have a new introducer agreement to review and sign.',
          action_url: `/versotech_main/introducer-agreements/${agreement.id}`,
          metadata: { agreement_id: agreement.id }
        });
      }
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      event_type: 'agreement',
      action: 'created',
      entity_type: 'introducer_agreement',
      entity_id: agreement.id,
      actor_id: user.id,
      action_details: {
        introducer_id: validation.data.introducer_id,
        introducer_name: agreement.introducer?.legal_name
      },
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ data: agreement }, { status: 201 });

  } catch (error) {
    console.error('Agreement POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 13.2 Agreement Approval API

**File: `src/app/api/introducer-agreements/[id]/approve/route.ts`**

```typescript
/**
 * Introducer Agreement Approval
 * POST /api/introducer-agreements/[id]/approve
 *
 * Introducer approves agreement, making it ready for signing
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Get agreement
    const { data: agreement } = await supabase
      .from('introducer_agreements')
      .select('*, introducer:introducers(id, legal_name)')
      .eq('id', params.id)
      .single();

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    // Verify user is the introducer
    const { data: introducerUser } = await supabase
      .from('introducer_users')
      .select('introducer_id')
      .eq('user_id', user.id)
      .single();

    if (introducerUser?.introducer_id !== agreement.introducer_id) {
      return NextResponse.json({ error: 'Not your agreement' }, { status: 403 });
    }

    if (agreement.status !== 'pending') {
      return NextResponse.json({ error: 'Agreement not in pending state' }, { status: 400 });
    }

    // Update to approved
    const { data: updated, error } = await supabase
      .from('introducer_agreements')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to approve agreement:', error);
      return NextResponse.json({ error: 'Failed to approve' }, { status: 500 });
    }

    // Notify staff/arranger
    if (agreement.created_by) {
      await supabase.from('investor_notifications').insert({
        user_id: agreement.created_by,
        type: 'introducer_agreement_approved',
        title: 'Agreement Approved',
        message: `${agreement.introducer?.legal_name} has approved the introducer agreement. Ready for signing.`,
        action_url: `/versotech_main/introducer-agreements/${params.id}`,
        metadata: { agreement_id: params.id }
      });
    }

    // Create signature requests for both parties
    // Staff signs first, then introducer
    const signers = [
      { role: 'verso_staff', user_id: agreement.created_by, order: 1 },
      { role: 'introducer', user_id: user.id, order: 2 }
    ];

    for (const signer of signers) {
      await supabase.from('signature_requests').insert({
        document_type: 'introducer_agreement',
        document_id: params.id,
        user_id: signer.user_id,
        status: 'pending',
        metadata: {
          signer_role: signer.role,
          signing_order: signer.order,
          agreement_id: params.id
        }
      });
    }

    return NextResponse.json({
      data: {
        ...updated,
        message: 'Agreement approved. Ready for signing.'
      }
    });

  } catch (error) {
    console.error('Approve agreement error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 13.3 Introducer Dashboard Component

**File: `src/components/dashboard/introducer-dashboard.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FileText, Users, DollarSign, TrendingUp, ArrowRight, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface DashboardMetrics {
  agreementStatus: 'none' | 'pending' | 'approved' | 'active'
  agreementId?: string
  introductionCount: number
  totalCommissions: number
  pendingCommissions: number
  dealsForInvestment: number
}

export function IntroducerDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    agreementStatus: 'none',
    introductionCount: 0,
    totalCommissions: 0,
    pendingCommissions: 0,
    dealsForInvestment: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetrics() {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get introducer_id
      const { data: introducerUser } = await supabase
        .from('introducer_users')
        .select('introducer_id')
        .eq('user_id', user.id)
        .single()

      if (!introducerUser) {
        setLoading(false)
        return
      }

      // Check agreement status
      const { data: agreement } = await supabase
        .from('introducer_agreements')
        .select('id, status')
        .eq('introducer_id', introducerUser.introducer_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Fetch metrics in parallel
      const [introductions, feeEvents, investableDeals] = await Promise.all([
        supabase
          .from('introductions')
          .select('id', { count: 'exact', head: true })
          .eq('introducer_id', introducerUser.introducer_id),
        supabase
          .from('fee_events')
          .select('computed_amount, status')
          .eq('introducer_id', introducerUser.introducer_id),
        supabase
          .from('deal_memberships')
          .select('deal_id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('role', 'introducer_investor')
      ])

      const allFees = feeEvents.data || []
      const totalComm = allFees.reduce((sum, f) => sum + (f.computed_amount || 0), 0)
      const pendingComm = allFees
        .filter(f => f.status === 'accrued')
        .reduce((sum, f) => sum + (f.computed_amount || 0), 0)

      setMetrics({
        agreementStatus: agreement?.status || 'none',
        agreementId: agreement?.id,
        introductionCount: introductions.count || 0,
        totalCommissions: totalComm,
        pendingCommissions: pendingComm,
        dealsForInvestment: investableDeals.count || 0
      })
      setLoading(false)
    }

    fetchMetrics()
  }, [])

  // Show agreement warning if not active
  const showAgreementWarning = metrics.agreementStatus !== 'active'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Introducer Dashboard</h1>
        <p className="text-muted-foreground">Track your introductions and commissions</p>
      </div>

      {showAgreementWarning && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Agreement Required</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {metrics.agreementStatus === 'none' && 'You need an introducer agreement before you can make introductions.'}
              {metrics.agreementStatus === 'pending' && 'Your agreement is pending approval. Please review and sign.'}
              {metrics.agreementStatus === 'approved' && 'Your agreement is approved. Please sign to activate.'}
            </span>
            {metrics.agreementId && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/versotech_main/introducer-agreements/${metrics.agreementId}`}>
                  {metrics.agreementStatus === 'pending' ? 'Review Agreement' : 'Sign Agreement'}
                </Link>
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/versotech_main/introductions">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Introductions
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {loading ? '...' : metrics.introductionCount}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/versotech_main/opportunities">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Deals for Investment
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {loading ? '...' : metrics.dealsForInvestment}
                </div>
                {metrics.dealsForInvestment > 0 && (
                  <Badge variant="secondary">View</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Commissions
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${loading ? '...' : metrics.totalCommissions.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Commissions
            </CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                ${loading ? '...' : metrics.pendingCommissions.toLocaleString()}
              </div>
              {metrics.pendingCommissions > 0 && (
                <Badge variant="secondary">Pending</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

---

**Total Estimated Hours: 28**
- Agreement CRUD API (P0): 6 hours
- Agreement Detail Page + VersaSign (P0): 6 hours
- Block Introductions API + UI (P0): 4 hours
- Conditional Investor Access (P1): 4 hours
- Dashboard (P1): 4 hours
- Fee Model View (P2): 4 hours

**Priority: CRITICAL (Agreement blocking is BROKEN - cannot use in production)**
**Risk: HIGH (Core workflow path is broken)**
**Last Updated:** December 24, 2025 (Developer-Ready)
