# Commercial Partner Implementation Plan

**User Type:** Commercial Partner
**Current Completion:** 30% (Corrected after 2nd review: December 27, 2025)
**Target Completion:** 95%
**Estimated Hours:** 54 hours
**Last Audit:** December 27, 2025 - 2nd Review Corrections Applied (10 total fixes)

---

## EXECUTIVE SUMMARY

The Commercial Partner (CP) is an **institutional intermediary** (bank, wealth manager, family office) that operates in **TWO DISTINCT MODES**:

- **MODE 1 (Direct Investment):** CP invests their OWN money - uses standard investor journey
- **MODE 2 (Proxy Mode):** CP acts ON BEHALF OF clients - signs documents, handles entire flow for client investors

**Key Distinction from Partner:** Commercial Partners CAN execute on behalf of clients. Partners CANNOT.

---

## USER STORIES REFERENCE

**Source:** `docs/planning/user_stories_mobile_v6_extracted.md` - Section 7.Commercial Partner
**Total Rows:** 111 user stories

| Section | Rows | Description |
|---------|------|-------------|
| 7.1 My Profile | 2-14 | Account creation, login, profile approval |
| 7.2 My Opportunities | 15-46 | View/invest in deals (MODE 1 & MODE 2) |
| 7.3 My Investments | 47-51 | Track own investments (MODE 1) |
| 7.4 Notifications | 63-65 | Transaction notifications |
| 7.5 Investment Sales | 66-70 | Resell/redemption (MODE 1) |
| 7.6 My Transactions (as CP) | 71-102 | Client tracking, placement agreements, fees |
| 7.7 GDPR | 103-112 | Data privacy (deferred to CEO plan) |

---

## REVIEW CORRECTIONS (December 27, 2025)

The following errors in the original plan have been corrected:

### Correction 1: 7.6.1 Rows 71-79 - INCORRECTLY MARKED AS COMPLETE

**Original Claim:** Marked as ✓ "client-transactions page"

**Reality:** The `client-transactions/page.tsx` (540 lines) only shows:
- Client list with subscription status
- Summary cards (total clients, active, subscriptions, value)

**What's MISSING per user stories:**
- Row 71-76: Opportunity status buckets (notified/interest/passed/approved/signed/funded)
- Row 77: Investment Opportunity description + termsheet display
- Row 78: Dataroom access
- Row 79: Fee model per opportunity

**Action:** Add new Task 7 for comprehensive transaction view.

### Correction 2: 7.3 (rows 47-51) and 7.5 (rows 66-70) - UNPLANNED

**Original Claim:** Not mentioned / marked as "SKIP"

**Reality:**
- Portfolio page (`portfolio/page.tsx`) is gated to `isInvestor` check (line 305, 396)
- CP nav does NOT include "Portfolio" link
- Resell functionality (`SellPositionForm`) only available to investors

**What's MISSING:**
- Row 47: View transactions per opportunity between 2 dates
- Row 48: View signed subscription pack per opportunity
- Row 49-51: View investment evolution, shareholding, performance
- Row 66-70: Sell shares / resell flow

**Action:** Add new Task 8 for portfolio/resell access for CP.

### Correction 3: 7.2 (rows 15-46) - MISDIAGNOSED

**Original Claim:** "MISSING - No opportunities page for CP"

**Reality:** The unified opportunities page (`opportunities/page.tsx`) ALREADY works for Commercial Partners:
- Line 156-157 comment: "Access: Any user with deal_memberships (investors, partners, introducers, CPs, lawyers)"
- Queries via `deal_memberships!inner` with `user_id = user.id`

**What's ACTUALLY Missing:**
- CP nav lacks "Opportunities" link (see `persona-sidebar.tsx` lines 121-126)
- No investor_id prerequisite handling for CPs

**Action:** Task 4 updated to focus on nav link + investor ID handling, not creating new list.

### Correction 4: 7.6.2 Rows 81-87 - INCOMPLETE COVERAGE

**Original Claim:** Task 2 covers placement agreement signing

**Reality:** Task 2 only covers:
- Row 84: Sign agreement (VersaSign integration)
- Rows 88-89: List + detail view

**What's MISSING:**
- Row 81: V2 - View reminders to approve
- Row 82: View reminders to sign
- Row 83: V2 - Approve placement agreement
- Row 85: Notification that agreement was signed
- Row 86: V2 - Reject placement agreement
- Row 87: V2 - Notification that agreement was rejected

**Action:** Expand Task 2 to include notifications. Mark V2 items as future.

### Correction 5: 7.6.4 Rows 95-102 - NO IMPLEMENTATION TASKS

**Original Claim:** Marked as "PARTIAL" but no tasks defined

**Reality:** These user stories have no implementation plan:
- Row 95: Transaction summary prior to invoice
- Row 96: Revenue between 2 dates
- Row 97: Recalculate fees based on progress
- Row 98: Revenue per opportunity per investor
- Row 99: Send REDEMPTION Fees Invoice
- Row 100-102: Invoice approval/change/confirmation notifications

**Action:** Add new Task 9 for reporting/invoicing.

### Correction 6: Wrong Role Name + Duplicate Utility

**Original Claim:** References `commercial_partner` role in deal_memberships; proposes new `can-invest.ts`

**Reality:**
- deal_memberships roles are: `commercial_partner_investor` and `commercial_partner_proxy`
- There is NO `commercial_partner` role (that's a profile role, not deal_membership role)
- `src/lib/partner/can-invest.ts` ALREADY handles CP roles:
  - Line 12: `commercial_partner_investor` in INVESTOR_ELIGIBLE_ROLES
  - Line 29: `commercial_partner_proxy` in DealMemberRole type

**Action:** Remove Task 5 (redundant utility). Use existing `canPartnerInvestInDeal()`.

### Correction 7: Placement Agreement Signature Webhook MISSING (2nd Review)

**Original Claim:** Task 2 says "update status to active on completion"

**Reality:** The signature webhook route (`src/app/api/signature/complete/route.ts`) and handlers (`src/lib/signature/handlers.ts`) do NOT handle `placement_agreement` document type:
- Line 60: handles `document_type === 'nda'`
- Line 103: handles `document_type === 'subscription'`
- `routeSignatureHandler()` (line 1084-1101): Only routes: nda, subscription, introducer_agreement, amendment, other
- **NO `placement_agreement` case exists!**

**What's MISSING:**
- `handlePlacementAgreementSignature()` function in handlers.ts
- Route case for `placement_agreement` in `routeSignatureHandler()`
- Update `placement_agreements.status` to 'active' on completion
- Notify CP when agreement is fully executed

**Action:** Add new Task 10 for placement agreement webhook handler.

### Correction 8: MODE 1 investor_users Dependency - APIs 404 (2nd Review)

**Original Claim:** Task 8 says "allow CP MODE 1 access to portfolio page"

**Reality:** The APIs behind portfolio/subscribe depend on `investor_users` table:
- `/api/investors/me/portfolio/route.ts` (lines 20-27):
  ```typescript
  const { data: investorLinks } = await serviceSupabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)
  if (!investorLinks || investorLinks.length === 0) {
    return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
  }
  ```
- `/api/investors/me/opportunities/[id]/subscribe/route.ts` (lines 43-49): Same pattern

**Problem:**
- CP with `commercial_partner_investor` role exists in `commercial_partner_users` → `commercial_partners`
- CP does NOT exist in `investor_users` → `investors`
- These APIs will return 404 "No investor profile found"!

**What's MISSING:**
- Either: Create investor record + investor_users link when CP dispatched to deal as MODE 1
- Or: Create CP-specific portfolio/subscribe APIs that don't require investor_users

**Action:** Add new Task 11 to resolve investor_users dependency for MODE 1 CP.

### Correction 9: 7.4 Notifications Rows 63-65 NOT IN PLAN (2nd Review)

**Original Claim:** Truth table shows 7.4 as covered by "generic notifications"

**Reality:** User stories 7.4 require specific notification features:
- Row 63: "view all notifications assigned to me **per type of notifications** (subscription pack pending, funding pending, etc.)"
- Row 64: "view all **NEW** notifications assigned to me per Opportunity"
- Row 65: "view all notifications **assigned BY me** per type of notifications"

Current `investor-notifications-client.tsx`:
- Simple flat list of notifications (lines 94-122)
- Has "New" badge for unread ✓
- Has "Mark all read" button ✓
- **NO type filter** (subscription, funding, agreement, etc.)
- **NO "assigned by me" view**

Additionally, CP navigation does NOT include "Notifications" link.

**Action:** Add new Task 12 for CP notification enhancements.

### Correction 10: 7.2 Status Bucket Filters Incomplete (2nd Review)

**Original Claim:** Task 4 says "add Opportunities to CP nav" as complete solution

**Reality:** User stories 7.2.1 rows 15-20 require specific status buckets:
- Row 15: "notified" → Dispatched but not acted on
- Row 16: "interested" → Submitted interest
- Row 17: "passed" → Declined opportunity
- Row 18: "approved" → NDA access granted
- Row 19: "signed" → Subscription pack signed
- Row 20: "funded" → Investment funded

Current `investor-deals-list-client.tsx` filters (lines 713-753):
- Status filter: open, allocation_pending, closed, draft, cancelled (these are DEAL statuses!)
- Pipeline stage filter: interested, nda_access, subscription_submitted

**Mapping Gaps:**
- "notified" → NOT AVAILABLE (need dispatched_at check)
- "passed" → NOT AVAILABLE (need passed/declined tracking)
- "funded" → NOT AVAILABLE (need funded_at on subscription)

**Action:** Expand Task 4 to include journey stage bucket filters OR add new Task 13.

---

## 1. DATABASE SCHEMA (100% COMPLETE)

### 1.1 Tables Verified via Supabase MCP

| Table | Columns | Purpose |
|-------|---------|---------|
| `commercial_partners` | 32 | Core entity: name, legal_name, type, cp_type, kyc_status, logo_url |
| `commercial_partner_users` | 8 | User links: user_id, role, is_primary, **can_execute_for_clients**, can_sign |
| `commercial_partner_members` | 25 | KYC: beneficial owners, signatories, addresses |
| `commercial_partner_clients` | 12 | Proxy clients: client_name, client_investor_id, client_email, is_active |
| `placement_agreements` | 16 | Agreements: commission_bps, territory, deal_types, status |

### 1.2 deal_memberships Roles (CORRECTED)

**Roles that exist:**
```
commercial_partner_investor - MODE 1: Direct investment (can subscribe)
commercial_partner_proxy    - MODE 2: On behalf of client (use proxy-subscribe API)
```

**Role that does NOT exist in deal_memberships:**
```
commercial_partner - This is a PROFILE role, not a deal_membership role
```

### 1.3 Existing Utility: `src/lib/partner/can-invest.ts`

This file ALREADY handles CP roles:
```typescript
export const INVESTOR_ELIGIBLE_ROLES = [
  'investor',
  'partner_investor',
  'introducer_investor',
  'commercial_partner_investor',  // <-- CP MODE 1
  'co_investor'
] as const

// commercial_partner_proxy is handled separately (has own endpoint)
```

**DO NOT create duplicate utility. Use `canPartnerInvestInDeal()` from this file.**

---

## 2. WHAT EXISTS (CORRECTED)

### 2.1 Pages That WORK for CP

| Route | Works for CP? | Notes |
|-------|---------------|-------|
| `/versotech_main/opportunities` | **YES** | Works via deal_memberships, but NOT in CP nav |
| `/versotech_main/opportunities/[id]` | **YES** | Works, needs proxy mode integration |
| `/versotech_main/client-transactions` | YES | Shows clients, but incomplete per rows 71-79 |
| `/versotech_main/placement-agreements` | YES | View only, no signing |
| `/versotech_main/portfolio` | **NO** | Gated to `isInvestor` (line 396) |
| `/versotech_main/dashboard` | YES | Generic, no CP-specific metrics |

### 2.2 Navigation (persona-sidebar.tsx lines 121-126)

**Current CP Nav:**
```typescript
commercial_partner: [
  { name: 'Dashboard', href: '/versotech_main/dashboard' },
  { name: 'Client Transactions', href: '/versotech_main/client-transactions' },
  { name: 'Agreements', href: '/versotech_main/placement-agreements' },
  { name: 'Messages', href: '/versotech_main/messages' },
]
```

**Missing Links:**
- Opportunities (exists but not in nav)
- Portfolio (gated to investor, needs MODE 1 access)

---

## 3. USER STORIES TRUTH TABLE (CORRECTED)

### 3.1 Section 7.1 - My Profile (Rows 2-14)

| Row | Story | Status | Notes |
|-----|-------|--------|-------|
| 2 | Create account from VERSO link | ✓ | Entity invite works |
| 3 | Request access via contact form | ✓ | Public form exists |
| 4-14 | Profile completion, approval | ✓ | Standard onboarding |

### 3.2 Section 7.2 - My Opportunities (Rows 15-46)

| Row | Story | Status | Notes |
|-----|-------|--------|-------|
| 15-20 | View opportunities by status | **PARTIAL** | Page works, nav link missing |
| 21-29 | NDA, interest, subscription flow | **PARTIAL** | Works if in nav, needs MODE detection |
| 30-46 | Funding, certificates | ✓ | Works via investor journey |

### 3.3 Section 7.3 - My Investments (Rows 47-51)

| Row | Story | Status | Notes |
|-----|-------|--------|-------|
| 47-51 | View transactions, performance | **MISSING** | Portfolio gated to investor persona |

### 3.4 Section 7.5 - Investment Sales (Rows 66-70)

| Row | Story | Status | Notes |
|-----|-------|--------|-------|
| 66-70 | Resell shares | **MISSING** | Portfolio page required for resell |

### 3.5 Section 7.6.1 - View My Transactions (Rows 71-79)

| Row | Story | Status | Notes |
|-----|-------|--------|-------|
| 71-76 | Display opportunities by investor status | **MISSING** | Need status bucket filters |
| 77 | Display IO description + termsheet | **MISSING** | Need termsheet view |
| 78 | Dataroom access | **MISSING** | Need dataroom link |
| 79 | Display fee model per opportunity | **MISSING** | Need fee model view |

### 3.6 Section 7.6.2 - Placement Agreements (Rows 80-89)

| Row | Story | Status | Notes |
|-----|-------|--------|-------|
| 80 | Display Placement Fee Summary | ✓ | View exists |
| 81 | V2: View reminders to approve | FUTURE | V2 scope |
| 82 | View reminders to sign | **MISSING** | Need reminder system |
| 83 | V2: Approve agreement | FUTURE | V2 scope |
| 84 | Sign agreement | **MISSING** | Need VersaSign integration |
| 85 | Notification agreement signed | **MISSING** | Need notification |
| 86-87 | V2: Reject + notification | FUTURE | V2 scope |
| 88-89 | List + detail view | ✓ | Exists |

### 3.7 Section 7.6.3 - Transaction Tracking (Rows 90-95)

| Row | Story | Status | Notes |
|-----|-------|--------|-------|
| 90-94 | Subscription notifications | ✓ | Notifications work |
| 95 | Transaction summary for invoice | **MISSING** | Need summary view |

### 3.8 Section 7.6.4 - Reporting (Rows 96-102)

| Row | Story | Status | Notes |
|-----|-------|--------|-------|
| 96 | Revenue between 2 dates | **MISSING** | Need reporting UI |
| 97 | Recalculate fees | **MISSING** | Need fee recalc |
| 98 | Revenue per opportunity/investor | **MISSING** | Need detailed report |
| 99 | Send REDEMPTION Invoice | **MISSING** | Need invoice creation |
| 100-102 | Invoice approval/confirmation | **MISSING** | Need notification workflow |

---

## 4. IMPLEMENTATION TASKS (UPDATED)

### Task 1: Client Management CRUD (6 hours) - P0

**Files to Create:**
```
src/app/api/commercial-partners/me/clients/route.ts
src/app/api/commercial-partners/me/clients/[id]/route.ts
src/components/commercial-partner/client-form.tsx
src/components/commercial-partner/client-list.tsx
src/app/(main)/versotech_main/client-transactions/manage/page.tsx
```

**API Schema:**
```typescript
// GET /api/commercial-partners/me/clients
// POST /api/commercial-partners/me/clients
// PATCH /api/commercial-partners/me/clients/[id]
// DELETE /api/commercial-partners/me/clients/[id] (soft delete)
```

### Task 2: Placement Agreement Signing + Notifications (8 hours) - P0

**Files to Create:**
```
src/app/api/placement-agreements/route.ts
src/app/api/placement-agreements/[id]/route.ts
src/app/api/placement-agreements/[id]/sign/route.ts
src/app/(main)/versotech_main/placement-agreements/[id]/page.tsx
src/components/commercial-partner/placement-agreement-detail.tsx
```

**MVP Scope (Rows 80, 82, 84, 85, 88-89):**
- View agreement list and details
- View reminders to sign
- Sign via VersaSign
- Receive notification when signed

**Deferred to V2 (Rows 81, 83, 86-87):**
- Approve/reject workflow

### Task 3: CP Dashboard (4 hours) - P1

**Files to Create:**
```
src/components/dashboard/cp-dashboard.tsx
```

**Metrics to Display:**
| Metric | Query |
|--------|-------|
| Agreement Status | `placement_agreements.status` |
| Clients | COUNT from `commercial_partner_clients` |
| MODE 1 Investments | `deal_memberships` WHERE role = 'commercial_partner_investor' |
| MODE 2 Transactions | `subscriptions` WHERE proxy_commercial_partner_id = cp_id |
| Client AUM | SUM of proxy subscriptions |
| Pending Commissions | `fee_events` WHERE status = 'accrued' |

### Task 4: Add Opportunities to CP Nav + MODE Detection (3 hours) - P1

**Files to Modify:**
```
src/components/layout/persona-sidebar.tsx
  - Add Opportunities link to CP nav

src/app/(main)/versotech_main/opportunities/[id]/page.tsx
  - Detect CP role (commercial_partner_investor vs commercial_partner_proxy)
  - Show proxy banner for MODE 2
  - Use existing canPartnerInvestInDeal() from src/lib/partner/can-invest.ts
```

**NOTE:** DO NOT create new `can-invest.ts` - use existing utility.

### ~~Task 5: Access Check Utility~~ - REMOVED (Duplicate)

**REMOVED:** `src/lib/partner/can-invest.ts` already handles CP roles. Use `canPartnerInvestInDeal()` and `isInvestorEligibleRole()` from existing file.

### Task 6: Fix Proxy Subscribe GET (2 hours) - P1

**File to Modify:**
```
src/app/api/commercial-partners/proxy-subscribe/route.ts
```

**Current Issue:**
- Queries `investors.commercial_partner_id`
- Should also check `commercial_partner_clients` table

### Task 7: Enhanced Transaction View for 7.6.1 (6 hours) - P1

**NEW TASK - Addresses rows 71-79**

**Files to Create/Modify:**
```
src/app/(main)/versotech_main/client-transactions/page.tsx
  - Add status bucket filters (notified/interest/passed/approved/signed/funded)
  - Add opportunity detail expand with termsheet
  - Add dataroom access link
  - Add fee model display per opportunity
```

**Required Features:**
- Filter by investor status in opportunity
- Link to opportunity termsheet
- Link to dataroom
- Show applicable fee model

### Task 8: Portfolio Access for CP MODE 1 (4 hours) - P1

**NEW TASK - Addresses rows 47-51, 66-70**

**Files to Modify:**
```
src/components/layout/persona-sidebar.tsx
  - Add Portfolio link to CP nav

src/app/(main)/versotech_main/portfolio/page.tsx
  - Remove/adjust isInvestor gate for CP with investor-eligible deal memberships
  - OR create CP-specific portfolio view
```

**Required Features:**
- CP can view their MODE 1 investments
- CP can access resell functionality for activated investments

### Task 9: Reporting and Invoicing for 7.6.4 (6 hours) - P2

**NEW TASK - Addresses rows 95-102**

**Files to Create:**
```
src/app/(main)/versotech_main/client-transactions/report/page.tsx
src/app/api/commercial-partners/me/revenue/route.ts
src/app/api/commercial-partners/me/invoice/route.ts
```

**Required Features:**
- Revenue report with date range filter
- Revenue per opportunity per investor
- Invoice creation UI
- Invoice notification workflow

### Task 10: Placement Agreement Signature Webhook Handler (4 hours) - P0 BLOCKER

**NEW TASK (2nd Review) - Correction 7**

**Files to Modify:**
```
src/lib/signature/handlers.ts
  - Add handlePlacementAgreementSignature() function
  - Add 'placement_agreement' case to routeSignatureHandler()
```

**Handler Requirements:**
```typescript
export async function handlePlacementAgreementSignature(params: PostSignatureHandlerParams): Promise<void> {
  // 1. Get placement_agreement_id from signature request
  // 2. Check if all required signatories have signed (CEO + CP)
  // 3. Update placement_agreements.status = 'active'
  // 4. Set placement_agreements.signed_date = now
  // 5. Store signed PDF path
  // 6. Notify CP user that agreement is active
  // 7. Notify staff_admin that agreement was executed
  // 8. Create audit log entry
}
```

**CRITICAL:** Without this, placement agreements will NEVER become 'active' after signing.

### Task 11: MODE 1 investor_users Resolution (4 hours) - P0 BLOCKER

**NEW TASK (2nd Review) - Correction 8**

**Problem:** CP with `commercial_partner_investor` role cannot use:
- `/api/investors/me/portfolio` → 404 "No investor profile found"
- `/api/investors/me/opportunities/[id]/subscribe` → 404 "No investor profile found"

**Solution Options:**

**Option A: Auto-create investor profile for MODE 1 CP (Recommended)**
```
src/app/api/deals/[id]/dispatch/route.ts
  - When dispatching CP as 'commercial_partner_investor':
    1. Create investor record (type: 'corporate_cp')
    2. Create investor_users link
    3. Copy relevant data from commercial_partners table
```

**Option B: Create CP-specific APIs**
```
src/app/api/commercial-partners/me/portfolio/route.ts
src/app/api/commercial-partners/me/subscribe/route.ts
```

**Recommendation:** Option A is cleaner - reuses existing investor journey infrastructure.

### Task 12: CP Notification Enhancements for 7.4 (4 hours) - P1

**NEW TASK (2nd Review) - Correction 9 - Rows 63-65**

**Files to Modify:**
```
src/components/layout/persona-sidebar.tsx
  - Add Notifications link to CP nav

src/components/notifications/investor-notifications-client.tsx
  - Add notification_type filter (metadata.type field)
  - Add "assigned by me" filter (check who created the notification)
  - Group notifications by opportunity when filtered
```

**Required Features:**
- Filter by type: subscription_pending, funding_pending, agreement_pending, etc.
- Filter for NEW (unread) only
- Filter for "assigned by me" (notifications I triggered)
- Expose in CP navigation

### Task 13: Journey Stage Bucket Filters for 7.2.1 (3 hours) - P1

**NEW TASK (2nd Review) - Correction 10 - Rows 15-20**

**Files to Modify:**
```
src/components/deals/investor-deals-list-client.tsx
  - Add journey stage filter (in addition to existing deal status filter)
  - Journey stages: notified, interested, passed, approved, signed, funded
```

**Filter Logic:**
```typescript
const journeyStageFilter = {
  notified: (deal) => deal.deal_memberships?.[0]?.dispatched_at && !interest,
  interested: (deal) => Boolean(interestByDeal.get(deal.id)),
  passed: (deal) => interestByDeal.get(deal.id)?.status === 'withdrawn',
  approved: (deal) => Boolean(accessByDeal.get(deal.id)),
  signed: (deal) => subscriptionByDeal.get(deal.id)?.status === 'committed',
  funded: (deal) => {
    const sub = subscriptionByDeal.get(deal.id)
    return sub && (sub.funded_amount > 0 || sub.status === 'funded')
  }
}
```

**Note:** This benefits ALL personas (investors, partners, introducers), not just CP.

---

## 5. PRIORITY MATRIX (UPDATED - 2nd Review)

| Priority | Task | Hours | Blocker? | Status |
|----------|------|-------|----------|--------|
| **P0** | Task 1: Client CRUD | 6 | YES | Pending |
| **P0** | Task 2: Placement Agreement Signing | 8 | YES | Pending |
| **P0** | Task 10: Placement Agreement Webhook | 4 | **YES - CRITICAL** | Pending |
| **P0** | Task 11: MODE 1 investor_users Fix | 4 | **YES - CRITICAL** | Pending |
| **P1** | Task 3: CP Dashboard | 4 | No | Pending |
| **P1** | Task 4: Opportunities Nav + MODE Detection | 3 | No | Pending |
| **P1** | Task 6: Fix Proxy Subscribe GET | 2 | No | Pending |
| **P1** | Task 7: Enhanced Transaction View (7.6.1) | 6 | No | Pending |
| **P1** | Task 8: Portfolio Access for MODE 1 | 4 | No | Pending |
| **P1** | Task 12: CP Notification Enhancements | 4 | No | Pending |
| **P1** | Task 13: Journey Stage Bucket Filters | 3 | No | Pending |
| **P2** | Task 9: Reporting/Invoicing (7.6.4) | 6 | No | Pending |

**Total: 54 hours** (was 39, increased by 15 hours for 4 new tasks from 2nd review)

**Removed Tasks:**
- ~~Task 5: Access Check Utility~~ - DUPLICATE (use existing `can-invest.ts`)

---

## 6. COMPLETION BREAKDOWN (CORRECTED - 2nd Review)

| Component | Current | Target | Notes |
|-----------|---------|--------|-------|
| Database | 100% | 100% | All tables, RLS, FKs complete |
| API Routes | 25% | 90% | Need client CRUD, agreement CRUD, reporting, webhook handler |
| UI Pages | 30% | 90% | Need dashboard, client mgmt, enhanced transactions, notification filters |
| Signature Webhook | 0% | 100% | **CRITICAL** - placement_agreement handler missing |
| MODE 1 Access | 10% | 90% | **BLOCKED** - APIs 404 without investor_users link |
| Proxy Mode | 85% | 95% | Banner works, GET needs fix |
| MODE 2 | 55% | 95% | Clients + full flow needed |
| Notifications | 20% | 80% | Missing type filters, "assigned by me" view |
| Journey Filters | 40% | 90% | Missing notified/passed/funded buckets |
| Reporting | 0% | 80% | All new |

**Overall: 30% → 95%** (was 35%, reduced due to 2nd review blockers)

---

## 7. FILES SUMMARY (UPDATED - 2nd Review)

### To Create (15 files)

**API Routes:**
```
src/app/api/commercial-partners/me/clients/route.ts
src/app/api/commercial-partners/me/clients/[id]/route.ts
src/app/api/placement-agreements/route.ts
src/app/api/placement-agreements/[id]/route.ts
src/app/api/placement-agreements/[id]/sign/route.ts
src/app/api/commercial-partners/me/revenue/route.ts
src/app/api/commercial-partners/me/invoice/route.ts
```

**Pages:**
```
src/app/(main)/versotech_main/client-transactions/manage/page.tsx
src/app/(main)/versotech_main/placement-agreements/[id]/page.tsx
src/app/(main)/versotech_main/client-transactions/report/page.tsx
```

**Components:**
```
src/components/commercial-partner/client-form.tsx
src/components/commercial-partner/client-list.tsx
src/components/commercial-partner/placement-agreement-detail.tsx
src/components/dashboard/cp-dashboard.tsx
```

### To Modify (9 files - increased from 5)

```
src/lib/signature/handlers.ts
  - Add handlePlacementAgreementSignature() function
  - Add 'placement_agreement' case to routeSignatureHandler()
  - CRITICAL for Task 10

src/app/api/deals/[id]/dispatch/route.ts
  - Auto-create investor profile when dispatching CP as MODE 1
  - CRITICAL for Task 11

src/components/layout/persona-sidebar.tsx
  - Add Opportunities + Portfolio + Notifications links to CP nav

src/app/(main)/versotech_main/opportunities/[id]/page.tsx
  - Handle CP modes using existing canPartnerInvestInDeal()

src/app/api/commercial-partners/proxy-subscribe/route.ts
  - Fix GET to use commercial_partner_clients

src/app/(main)/versotech_main/client-transactions/page.tsx
  - Add status buckets, termsheet, dataroom, fee model

src/app/(main)/versotech_main/portfolio/page.tsx
  - Allow CP MODE 1 access (commercial_partner_investor role)

src/components/notifications/investor-notifications-client.tsx
  - Add notification type filter
  - Add "assigned by me" filter
  - Task 12

src/components/deals/investor-deals-list-client.tsx
  - Add journey stage bucket filters (notified/interested/passed/approved/signed/funded)
  - Task 13
```

### NO NEW FILE NEEDED

```
src/lib/commercial-partner/can-invest.ts  <-- DO NOT CREATE
  Use existing: src/lib/partner/can-invest.ts
```

---

## 8. TESTING CHECKLIST (UPDATED - 2nd Review)

### CRITICAL BLOCKERS (Must Pass First)

#### Task 10: Placement Agreement Webhook
- [ ] Signing placement_agreement triggers webhook
- [ ] `handlePlacementAgreementSignature()` is called
- [ ] `placement_agreements.status` updates to 'active'
- [ ] `placement_agreements.signed_date` is set
- [ ] CP receives "Agreement Active" notification
- [ ] staff_admin receives "Agreement Executed" notification

#### Task 11: MODE 1 investor_users
- [ ] Dispatching CP as `commercial_partner_investor` creates investor record
- [ ] `investor_users` link is created for CP user
- [ ] CP can access `/api/investors/me/portfolio` (no 404)
- [ ] CP can access `/api/investors/me/opportunities/[id]/subscribe` (no 404)

### MODE 1 (Direct Investment)
- [ ] CP nav includes "Opportunities" link
- [ ] CP nav includes "Portfolio" link
- [ ] CP nav includes "Notifications" link
- [ ] CP with `commercial_partner_investor` role can access opportunities
- [ ] CP can complete full investor journey
- [ ] Subscription for CP's own account
- [ ] Investment appears in CP portfolio (not blocked by isInvestor gate)
- [ ] Can use resell feature for activated investments

### MODE 2 (Proxy Mode)
- [ ] CP with `commercial_partner_proxy` role sees proxy banner
- [ ] Can select client from dropdown
- [ ] Subscription created for client investor
- [ ] Transaction in Client Transactions with correct status

### Client Management
- [ ] Can add new client
- [ ] Can link to existing investor
- [ ] Can edit client info
- [ ] Can deactivate client

### Placement Agreements
- [ ] Can view agreement list
- [ ] Can view agreement details
- [ ] Can sign via VersaSign
- [ ] Status updates to 'active' (via webhook)
- [ ] Receives notification when signed

### Enhanced Transaction View (7.6.1)
- [ ] Can filter by investor status (notified/interest/passed/approved/signed/funded)
- [ ] Can view opportunity termsheet
- [ ] Can access dataroom
- [ ] Can see applicable fee model per opportunity

### Notifications (7.4 - Task 12)
- [ ] CP nav includes "Notifications" link
- [ ] Can filter by notification type (subscription_pending, funding_pending, etc.)
- [ ] Can filter for NEW (unread) only
- [ ] Can view "assigned by me" notifications
- [ ] Notifications grouped by opportunity when filtered

### Journey Stage Filters (7.2.1 - Task 13)
- [ ] "notified" filter shows dispatched deals without interest
- [ ] "interested" filter shows deals with submitted interest
- [ ] "passed" filter shows deals with withdrawn/declined interest
- [ ] "approved" filter shows deals with NDA access
- [ ] "signed" filter shows deals with committed subscription
- [ ] "funded" filter shows deals with funded subscription

### Dashboard
- [ ] Shows agreement status
- [ ] Shows client count
- [ ] Shows MODE 1 vs MODE 2 counts
- [ ] Shows AUM and commissions

### Reporting (7.6.4)
- [ ] Can view revenue between 2 dates
- [ ] Can view revenue per opportunity per investor
- [ ] Can create invoice
- [ ] Receives invoice notifications

---

**Last Updated:** December 27, 2025
**Review Corrections Applied:** All 10 findings verified and incorporated (6 from 1st review + 4 from 2nd review)
**Author:** Audit by Claude Code
**Status:** NOT READY - 2 CRITICAL BLOCKERS (Tasks 10 + 11)
