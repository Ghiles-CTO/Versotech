# Arranger Implementation Plan

**User Type:** Arranger
**Current Completion:** 45% (Audit-Verified: December 27, 2025 - Third Pass)
**Target Completion:** 95%
**Estimated Hours:** 29 hours
**Last Audit:** December 27, 2025 - Third pass with schema sync verification

---

## EXECUTIVE SUMMARY

This plan has been corrected after TWO rounds of deep verification (code, database schema, actual data, and user stories).

### Key Corrections

1. **My-* Pages are FULLY BUILT** - 5 pages totaling 2,500+ lines with real data
2. **Introducer Agreement Workflow is STAFF-ONLY** - Works for staff + introducers, but arrangers have NO involvement
3. **Fee model partner linkage does NOT work** - Column `partner_id` exists but is NEVER USED (0 of 14 fee plans have partner_id set; all use deal_id)
4. **My Mandates is VIEW-ONLY** - Shows deal list, NO signing/notifications per user stories
5. **Placement agreements are VIEW-ONLY** - No creation or signing APIs exist
6. **No reminders exist** - Neither introducer agreements nor placement agreements have reminder functionality

---

## 1. VERIFIED STATUS (What's ACTUALLY Built)

### 1.1 Pages - FULLY IMPLEMENTED ✅

| Page | Lines | Status | Features |
|------|-------|--------|----------|
| `/my-partners/page.tsx` | 577 | ✅ DONE | Real data, filters, tables, stats, partner referrals |
| `/my-introducers/page.tsx` | 465 | ✅ DONE | Real data, agreement status, commission tracking |
| `/my-commercial-partners/page.tsx` | 495 | ✅ DONE | Real data, client counts, placement values |
| `/my-lawyers/page.tsx` | 459 | ✅ DONE | Real data, deal values, specializations |
| `/my-mandates/page.tsx` | 592 | ✅ DONE | Real data, deal progress, investor counts |

**These pages work correctly for both arranger and staff views.**

### 1.2 Introducer Agreement Workflow - STAFF-ONLY (No Arranger Involvement)

| Component | Status | Note |
|-----------|--------|------|
| `/api/introducer-agreements/route.ts` (list/create) | ✅ EXISTS | Staff-only |
| `/api/introducer-agreements/[id]/send/route.ts` | ✅ EXISTS | Staff-only |
| `/api/introducer-agreements/[id]/approve/route.ts` | ✅ EXISTS | Introducer action |
| `/api/introducer-agreements/[id]/reject/route.ts` | ✅ EXISTS | Introducer action |
| `/api/introducer-agreements/[id]/sign/route.ts` | ✅ EXISTS | CEO + Introducer |
| VersaSign integration | ✅ EXISTS | |
| **Arranger involvement** | ❌ NONE | No arranger references in code |
| **Automatic reminders** | ❌ NONE | Stories 2.3.1 Row 26, 30, 31 |

**Current Signing Flow (Staff + Introducer ONLY):**
1. **Staff** creates agreement
2. **Staff** sends to introducer
3. **Introducer** approves
4. **CEO** signs first (status: `approved` → `pending_ceo_signature`)
5. **Introducer** signs second (`pending_introducer_signature`)
6. Agreement active

**What's Missing for Arrangers:**
- Story 2.3.1 Row 29: "Arranger digitally signs after approval" - NOT IMPLEMENTED
- Stories 2.3.1 Row 26, 30, 31: Automatic reminders - NOT IMPLEMENTED
- No `arranger_entity_id` or `arranger_id` references in introducer-agreements code

### 1.3 Partner Fee Model Viewing - BROKEN + SCHEMA SYNC ISSUE ⚠️⚠️

| Component | Status | Note |
|-----------|--------|------|
| `FeeModelView.tsx` component | ✅ EXISTS | Read-only UI |
| `/api/partners/me/fee-models/route.ts` | ✅ EXISTS | Queries `partner_id` |
| **Actual data with partner_id** | ❌ NONE | 0 of 14 fee_plans have partner_id set |
| Staff fee creation uses partner_id | ❌ NO | Creates with deal_id only |

**CRITICAL: Schema Sync Issue Detected**

| Source | Has `partner_id` on fee_plans? |
|--------|-------------------------------|
| Live Database | ✅ YES (verified via SQL query) |
| TypeScript types (`supabase.ts`) | ❌ NO - not in Row/Insert/Update |
| Migration files | ❌ NO - no migration adds this column |

**Root Cause:** The `partner_id` column was added directly to the database without a migration. The TypeScript types are out of sync with the actual schema.

**Database Reality (Verified):**
```sql
-- Column EXISTS in live DB:
SELECT column_name FROM information_schema.columns
WHERE table_name = 'fee_plans' AND column_name = 'partner_id';
-- Returns: partner_id

-- But NO data uses it:
SELECT COUNT(*) as total, COUNT(partner_id) as with_partner_id FROM fee_plans;
-- Result: total=14, with_partner_id=0
```

**Implications:**
1. TypeScript code can't safely use `partner_id` (type errors)
2. The `/api/partners/me/fee-models/route.ts` queries `partner_id` but types don't support it
3. Even if types were fixed, 0 records have partner_id populated

**Required Fix:**
1. Create migration to formalize `partner_id` column (or verify it exists)
2. Regenerate TypeScript types: `npx supabase gen types typescript`
3. Modify staff fee creation to populate `partner_id`
4. Create arranger routes to use `partner_id`

### 1.4 Placement Agreements - VIEW-ONLY (No Creation/Signing) ⚠️

| Component | Status | Note |
|-----------|--------|------|
| `/placement-agreements/page.tsx` | ✅ EXISTS | View-only for CPs |
| Placement agreement table | ✅ EXISTS | Database table |
| `/api/**/placement*/**/*.ts` | ❌ NONE | No API routes exist |
| Creation workflow | ❌ MISSING | Story 2.4.1 Row 44-45 |
| Signing workflow | ❌ MISSING | Story 2.4.1 Row 49-52 |
| Automatic reminders | ❌ MISSING | Story 2.4.1 Row 46, 50 |

**What Exists:** Commercial partners can VIEW agreements in a table.
**What's Missing:** Entire creation, approval, signing, and reminder workflow.

### 1.5 Infrastructure - WORKING ✅

| Feature | Status |
|---------|--------|
| Arranger persona detection | ✅ WORKS |
| Navigation in `persona-sidebar.tsx` | ✅ WORKS |
| Database tables (`arranger_entities`, `arranger_users`, etc.) | ✅ WORKS |
| Profile page | ✅ WORKS |
| Documents page | ✅ WORKS |
| VersaSign inbox | ✅ WORKS |

---

## 2. WHAT'S ACTUALLY MISSING

### 2.1 Arranger Dashboard (story 2.1.4)

**Status:** MISSING - `persona-dashboard.tsx` falls back to generic view for arrangers

**Required Metrics:**
- Active mandates count
- Pending agreements (awaiting signature)
- Pending payments
- Recent activity

### 2.2 Arranger Profile Approval Flow (stories 2.1.1-2.1.3)

**Status:** MISSING

| Story | Description | Status |
|-------|-------------|--------|
| 2.1.1 Row 2 | Complete profile for approval | ❌ MISSING |
| 2.1.1 Row 3 | Update profile for re-approval | ❌ MISSING |
| 2.1.3 Row 5 | Submit profile for approval | ❌ MISSING |
| 2.1.3 Row 6 | Notification of approval | ❌ MISSING |
| 2.1.3 Row 7 | Notification of rejection | ❌ MISSING |

### 2.3 Fee Model CRUD for Arranger Self-Service

**Status:** MISSING - Staff routes exist at `/api/staff/fees/*` but no arranger self-service

**Database Schema Reality:**
```sql
-- fee_plans table has:
partner_id UUID  -- ✅ EXISTS
-- Does NOT have:
-- introducer_id, commercial_partner_id, created_by_arranger_id
```

**Implication:** Arranger can create fee models for partners directly. For introducers/CPs, must use `deal_id` or extend schema.

| Story | Description | Status |
|-------|-------------|--------|
| 2.2.1 Row 11 | Create fee model for partners | ❌ MISSING |
| 2.2.1 Row 12 | Update fee model for partners | ❌ MISSING |
| 2.3.1 Row 22 | Create fee model for introducers | ❌ MISSING (schema issue) |
| 2.4.1 Row 42 | Create fee model for CPs | ❌ MISSING (schema issue) |

### 2.4 Subscription Pack Arranger Signing (stories 2.6.1)

**Status:** MISSING - Current signing assigns countersignature to hardcoded admin

| Story | Description | Status |
|-------|-------------|--------|
| 2.6.1 Row 64 | Notification subscription pack rejected | ❌ MISSING |
| 2.6.1 Row 65 | Sign subscription pack after CEO notification | ❌ MISSING |
| 2.6.1 Row 66 | Notify lawyer after signing | ❌ MISSING |
| 2.6.1 Row 69 | Access signed packs between dates | ❌ MISSING |

### 2.5 Escrow Funding Status View (story 2.5.2)

**Status:** MISSING - Arranger cannot see escrow funding status

| Story | Description | Status |
|-------|-------------|--------|
| 2.5.2 Row 63 | View escrow account funding status | ❌ MISSING |

### 2.6 Reconciliation Report Access (stories 2.6.3)

**Status:** MISSING - Currently restricted to CEO routes

| Story | Description | Status |
|-------|-------------|--------|
| 2.6.3 Row 74 | View reconciliation per opportunity | ❌ MISSING |
| 2.6.3 Row 75 | Generate reconciliation per opportunity | ❌ MISSING |
| 2.6.3 Row 76 | View reconciliation per compartment | ❌ MISSING |
| 2.6.3 Row 77 | Generate reconciliation per compartment | ❌ MISSING |

### 2.7 Invoice/Payment Request Flows (stories 2.2.2, 2.3.2, 2.4.2)

**Status:** MISSING

| Story | Description | Status |
|-------|-------------|--------|
| 2.2.2 Row 13 | Send notification to Partners to send invoice | ❌ MISSING |
| 2.2.2 Row 14 | Receive notification invoice received | ❌ MISSING |
| 2.2.2 Row 16 | Request Partner fee payment to Lawyer | ❌ MISSING |
| 2.2.2 Row 17 | Notification when payment completed | ❌ MISSING |
| 2.3.2 Row 33-37 | Same for introducers | ❌ MISSING |
| 2.4.2 Row 53-57 | Same for commercial partners | ❌ MISSING |

### 2.8 Arranger Agreement Countersigning

**Status:** MISSING - Story 2.3.1 Row 29 says "arranger signs after approval"

Current flow is CEO-driven. Need arranger countersigning option.

---

## 3. IMPLEMENTATION TASKS

### Task 1: Arranger Dashboard (3 hours)

**Create:** `src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx`

**Metrics:**
- Active mandates (deals where `arranger_entity_id` = current arranger)
- Pending introducer agreements
- Pending placement agreements
- Partners/introducers/CPs in network
- Recent fee events

**Modify:** `persona-dashboard.tsx` to route arranger personas to dedicated dashboard

### Task 2: Fee Model CRUD for Partners (5 hours)

**Problems Found:**
1. The `partner_id` column exists in LIVE DB but is NOT in TypeScript types or migrations
2. All 14 existing fee plans use `deal_id` linkage only (0 use `partner_id`)
3. Staff fee creation doesn't set `partner_id`

**Step 1: Fix Schema Sync (Required First)**
```bash
# Create migration to formalize the column (even if it exists, this documents it)
# supabase/migrations/20251227000002_formalize_fee_plans_partner_id.sql

ALTER TABLE fee_plans ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id);
CREATE INDEX IF NOT EXISTS idx_fee_plans_partner_id ON fee_plans(partner_id);

# Then regenerate types:
npx supabase gen types typescript --project-id <id> > src/types/supabase.ts
```

**Step 2: Solution Options**
1. **Option A (Recommended):** Modify staff fee creation to also set `partner_id` when creating deal-level plans for a partner's deal
2. **Option B:** Create arranger-specific fee plans that use `partner_id` directly (separate from deal plans)

**Step 3: Create API Route:** `src/app/api/arrangers/me/fee-models/route.ts`

```typescript
// Must ACTUALLY populate partner_id (currently no code does this)
// GET - List fee models where partner_id is set (AND arranger has access)
// POST - Create fee model WITH partner_id populated
// PATCH - Update existing
// DELETE - Soft delete (set is_active = false)
```

**Step 4: Also Modify:** `src/app/api/staff/fees/plans/route.ts` to populate `partner_id` when applicable

**Current Schema (DB has column, types don't):**
```typescript
// fee_plans in LIVE DB:
{
  id, deal_id, name, description, is_default, is_active,
  effective_from, effective_until, vehicle_id,
  partner_id,  // EXISTS in DB, NOT in supabase.ts types
  created_by, created_at, updated_at
}

// fee_components uses 'kind' not 'fee_type':
{
  id, fee_plan_id, kind,  // 'subscription', 'management', 'performance'
  rate_bps, flat_amount, calc_method, frequency, ...
}
```

**UI Component:** `src/components/arranger/fee-model-manager.tsx`

### Task 3: Introducer/CP Fee Model Schema Extension (2 hours)

**Decision Required:** Either:
1. Add `introducer_id` and `commercial_partner_id` columns to `fee_plans`
2. Use `deal_id` + lookup for all entity types
3. Create separate `introducer_fee_models` and `cp_fee_models` tables

**Recommended:** Option 1 - Add columns via migration

**Migration:**
```sql
-- 20251227000001_add_fee_plan_entity_columns.sql
ALTER TABLE fee_plans ADD COLUMN IF NOT EXISTS introducer_id UUID REFERENCES introducers(id);
ALTER TABLE fee_plans ADD COLUMN IF NOT EXISTS commercial_partner_id UUID REFERENCES commercial_partners(id);
ALTER TABLE fee_plans ADD COLUMN IF NOT EXISTS created_by_arranger_entity_id UUID REFERENCES arranger_entities(id);
```

### Task 4: Subscription Pack Arranger Signing Flow (3 hours)

**Modify:** Subscription pack signing to support arranger countersigning

**Files to modify:**
- `src/lib/signature/handlers.ts` - Add arranger signing support
- `src/app/api/subscriptions/[id]/documents/[documentId]/ready-for-signature/route.ts`

**Logic change:**
- When deal has `arranger_entity_id`, arranger can countersign after CEO
- Create notification for arranger when CEO signs
- Arranger signing triggers notification to lawyer

### Task 5: Escrow Funding Status View (2 hours)

**Create:** `src/app/api/arrangers/me/escrow-status/route.ts`

**Returns:**
- Deals managed by arranger
- Per-deal funding status from escrow/payment tables
- Aggregated funding totals

**UI:** Add escrow status section to arranger dashboard or My Mandates page

### Task 6: Reconciliation Report Access (2 hours)

**Create:** `src/app/api/arrangers/me/reconciliation/route.ts`

**Extend existing CEO reconciliation routes to allow arranger access for their deals only.**

**Logic:** Filter by `arranger_entity_id` = current arranger

### Task 7: Invoice/Payment Request Flow (2 hours)

**Create:**
- `src/app/api/arrangers/payment-request/route.ts`
- `src/components/arranger/payment-request-dialog.tsx`

**Flow:**
1. Arranger selects partner/introducer/CP
2. Enters invoice reference and amount
3. Assigns lawyer
4. Creates task for lawyer
5. Creates notification for CEO
6. Arranger notified when payment completed

### Task 8: Agreement Reminders (3 hours)

**Status:** NO reminders exist for introducer or placement agreements

**User Stories:**
- 2.3.1 Row 26: Automatic reminder to approve Introducer Agreement
- 2.3.1 Row 30: Automatic reminder to sign Introducer Agreement
- 2.3.1 Row 31: Manual reminder to sign Introducer Agreement
- 2.4.1 Row 46: Automatic reminder to approve Placement Agreement
- 2.4.1 Row 50: Automatic reminder to sign Placement Agreement

**Create:**
- `src/app/api/cron/agreement-reminders/route.ts` - Cron job for auto reminders
- `src/app/api/arrangers/agreements/[id]/remind/route.ts` - Manual reminder endpoint

**Logic:**
- Check agreements with status 'sent' or 'approved' older than X days
- Send reminder notification to relevant party
- Log reminder in audit trail

### Task 9: Placement Agreement Full Workflow (4 hours)

**Status:** Only VIEW exists, no creation/signing APIs

**Create:**
- `src/app/api/placement-agreements/route.ts` - List/Create
- `src/app/api/placement-agreements/[id]/route.ts` - Get/Update
- `src/app/api/placement-agreements/[id]/send/route.ts`
- `src/app/api/placement-agreements/[id]/approve/route.ts`
- `src/app/api/placement-agreements/[id]/sign/route.ts`

**Follow same pattern as introducer-agreements but for commercial partners.**

### Task 10: My Mandates Signing/Notification Features (3 hours)

**Status:** My Mandates page only shows deal list, no signing or notification features

**User Stories:**
- 2.6.1 Row 64: Notification when subscription pack rejected
- 2.6.1 Row 67: Notification when subscription pack sent for signature
- 2.6.1 Row 68: Notification when signature completed
- 2.6.1 Row 69: Access signed packs between dates

**Modify:** `src/app/(main)/versotech_main/my-mandates/page.tsx`
- Add subscription pack status column
- Add signing actions
- Add notification indicators
- Add date range filter for signed packs

---

## 4. DEPENDENCIES & CROSS-USER ALIGNMENT

### 4.1 Partner Dashboard Expects Fee Models

**Files:**
- `src/app/api/partners/me/dashboard/route.ts`
- `src/components/partner/FeeModelView.tsx`

**Requirement:** Arranger fee model CRUD must write to same `fee_plans` table with correct `partner_id`

### 4.2 Introducer Dashboard Uses Existing Tables

**Files:**
- `src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx`

**Tables:**
- `introducer_agreements`
- `introducer_commissions`

**Requirement:** Extend existing tables, don't create parallel system

### 4.3 Agreement Signing Workflow

**Existing pattern in:** `src/lib/signature/handlers.ts`

**Requirement:** Arranger signing should follow same pattern, not duplicate

---

## 5. REVISED FEATURE TRUTH TABLE

| Feature | User Stories | Code Exists | Working | Note |
|---------|-------------|-------------|---------|------|
| My Partners Page (view) | 2.2.3 | ✅ DONE | ✅ 100% | View/filter works |
| My Introducers Page (view) | 2.3.3 | ✅ DONE | ✅ 100% | View/filter works |
| My Commercial Partners Page (view) | 2.4.3 | ✅ DONE | ✅ 100% | View/filter works |
| My Lawyers Page (view) | 2.5.1 | ✅ DONE | ✅ 100% | View/filter works |
| **My Mandates Page** | 2.6.1-2.6.2 | ⚠️ PARTIAL | 40% | VIEW-ONLY, no signing/notifications |
| **Introducer Agreement (Arranger)** | 2.3.1 | ❌ MISSING | 0% | Staff-only, no arranger flow |
| **Placement Agreements** | 2.4.1 | ⚠️ VIEW | 20% | No creation/signing APIs |
| **Fee Model Linkage (Partners)** | 2.2.1-2.2.4 | ⚠️ BROKEN | 0% | Code exists but 0 data uses partner_id |
| **Arranger Dashboard** | 2.1.4 | ❌ MISSING | 0% | Task 1 |
| **Arranger Profile Approval** | 2.1.1-2.1.3 | ❌ MISSING | 0% | Needs scoping |
| **Fee Model CRUD (all entities)** | 2.2.1, 2.3.1, 2.4.1 | ❌ MISSING | 0% | Task 2-3 |
| **Subscription Pack Arranger Sign** | 2.6.1 Row 65 | ❌ MISSING | 0% | Task 4 |
| **Escrow Status View** | 2.5.2 | ❌ MISSING | 0% | Task 5 |
| **Reconciliation Access** | 2.6.3 | ❌ MISSING | 0% | Task 6 |
| **Invoice/Payment Request** | 2.2.2, 2.3.2, 2.4.2 | ❌ MISSING | 0% | Task 7 |
| **Agreement Reminders** | 2.3.1, 2.4.1 | ❌ MISSING | 0% | Task 8 |

**TRUE COMPLETION: 45%** (View pages work, but core arranger workflows missing)

---

## 6. FILES SUMMARY

### Files ALREADY BUILT (No Changes Needed)

```
src/app/(main)/versotech_main/my-partners/page.tsx         ✅ 577 lines
src/app/(main)/versotech_main/my-introducers/page.tsx      ✅ 465 lines
src/app/(main)/versotech_main/my-commercial-partners/page.tsx ✅ 495 lines
src/app/(main)/versotech_main/my-lawyers/page.tsx          ✅ 459 lines
src/app/(main)/versotech_main/my-mandates/page.tsx         ✅ 592 lines
src/app/api/introducer-agreements/*                        ✅ Full CRUD
src/components/partner/FeeModelView.tsx                    ✅ Read-only view
```

### Files to CREATE (15 files)

```
# Dashboard
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx

# Fee Model CRUD
src/app/api/arrangers/me/fee-models/route.ts
src/components/arranger/fee-model-manager.tsx

# Placement Agreements (Full Workflow)
src/app/api/placement-agreements/route.ts
src/app/api/placement-agreements/[id]/route.ts
src/app/api/placement-agreements/[id]/send/route.ts
src/app/api/placement-agreements/[id]/approve/route.ts
src/app/api/placement-agreements/[id]/sign/route.ts

# Other APIs
src/app/api/arrangers/me/escrow-status/route.ts
src/app/api/arrangers/me/reconciliation/route.ts
src/app/api/arrangers/payment-request/route.ts
src/app/api/cron/agreement-reminders/route.ts
src/app/api/arrangers/agreements/[id]/remind/route.ts

# UI Components
src/components/arranger/payment-request-dialog.tsx
```

### Files to MODIFY (5 files)

```
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx  (add arranger routing)
src/app/(main)/versotech_main/my-mandates/page.tsx             (add signing/notifications)
src/app/api/staff/fees/plans/route.ts                          (fix partner_id population)
src/lib/signature/handlers.ts                                   (add arranger countersign)
supabase/migrations/2025XXXX_add_fee_plan_entity_columns.sql   (schema extension)
```

---

## 7. TESTING CHECKLIST

### Phase 1: Dashboard & Fee Models
- [ ] Login as arranger → Arranger-specific dashboard shows
- [ ] Dashboard shows: mandates count, pending agreements, partners count
- [ ] Click "My Partners" → Full partner list with real data
- [ ] Create fee model for partner → Saved to `fee_plans` with `partner_id`
- [ ] Partner can view fee model in their portal

### Phase 2: Signing & Payments
- [ ] Subscription pack signing includes arranger countersign option (if deal has arranger)
- [ ] Arranger receives notification when CEO signs
- [ ] Arranger can request payment to lawyer
- [ ] Lawyer receives task
- [ ] Arranger notified when payment completed

### Phase 3: Reporting
- [ ] Arranger can view escrow funding status for their deals
- [ ] Arranger can access reconciliation reports for their deals
- [ ] Reconciliation filtered to arranger's `arranger_entity_id` only

---

## 8. ACCEPTANCE CRITERIA

1. **Dashboard:** Arranger sees dedicated dashboard with relevant metrics
2. **Fee Models:** Arranger can CRUD fee models for partners (and introducers/CPs after schema extension)
3. **Signing:** Arranger can countersign subscription packs for their deals
4. **Escrow:** Arranger can view funding status for their deals
5. **Reconciliation:** Arranger can generate reports for their deals
6. **Payments:** Arranger can request fee payments to lawyers

---

## 9. PRIORITY ORDER

| Priority | Task | Hours | Why |
|----------|------|-------|-----|
| P0 | Task 2: Partner Fee Model + Schema Sync | 5 | Fix types, create migration, then CRUD |
| P0 | Task 1: Arranger Dashboard | 3 | Entry point for arranger experience |
| P0 | Task 9: Placement Agreement Full Workflow | 4 | Required by 2.4.1 - only view exists |
| P1 | Task 4: Subscription Pack Arranger Signing | 3 | Required by story 2.6.1 Row 65 |
| P1 | Task 10: My Mandates Signing/Notifications | 3 | My Mandates is view-only, needs signing |
| P1 | Task 7: Invoice/Payment Request | 2 | Required by stories 2.2.2, 2.3.2, 2.4.2 |
| P2 | Task 3: Schema Extension (introducer/CP) | 2 | Enables introducer/CP fee models |
| P2 | Task 8: Agreement Reminders | 3 | Stories 2.3.1, 2.4.1 reminders |
| P2 | Task 5: Escrow Status View | 2 | Story 2.5.2 |
| P2 | Task 6: Reconciliation Access | 2 | Story 2.6.3 |

**Total: 29 hours** (includes 1 hour for schema sync/migration work)

---

## 10. CRITICAL NOTES FOR IMPLEMENTATION

1. **Schema Sync Issue:** The `partner_id` column EXISTS in live database but is NOT in TypeScript types (`supabase.ts`) and has NO migration. Must create migration and regenerate types before any fee model work.

2. **Fee Model Linkage is Broken:** Even after fixing types, the `partner_id` column has 0 data. Staff routes don't populate it. Must fix staff routes AND create arranger routes.

3. **Introducer Agreements are Staff-Only:** Arranger has ZERO involvement in current flow. Story 2.3.1 requires arranger signing.

4. **Placement Agreements Need Full Workflow:** Only viewing exists. Need complete CRUD + signing like introducer-agreements.

5. **My Mandates is View-Only:** Shows deals but no subscription pack signing, notifications, or date filtering per user stories.

6. **No Reminders Anywhere:** Neither introducer nor placement agreement flows have reminder functionality.

---

**Last Updated:** December 27, 2025 (Third Pass - Schema Sync Issue Added)
**Verified By:** Deep code audit + schema verification + actual data validation + TypeScript types check + user story cross-reference
**Issues Found:**
- fee_plans.partner_id: EXISTS in DB, NOT in types, 0 records use it
- placement_agreement API routes: none exist
- introducer-agreements: no arranger references in code
