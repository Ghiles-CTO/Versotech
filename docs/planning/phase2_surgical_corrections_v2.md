# VERSOTECH Phase 2: Surgical Corrections Based on Deep Analysis

**Date:** 2025-12-16
**Status:** COMPREHENSIVE AUDIT COMPLETE - Ready for Implementation
**Source of Truth:** `docs/planning/user_stories_mobile_v6_extracted.md`

---

## EXECUTIVE SUMMARY

This document contains **surgical corrections** to the Phase 2 plan based on deep analysis by 6 specialized audit agents. The previous plans contained errors and assumptions that don't align with the user stories or actual codebase implementation.

**Key Corrections:**
1. **Partner is NOT "0% built"** - it's a hybrid role (Introducer + Investor) already supported by DB
2. **Phase 0 stabilization REQUIRED** - 6 broken endpoints/features must be fixed first
3. **Middleware is the PRIMARY blocker** - Not just RLS, the middleware hard-blocks non-investors
4. **Arranger implementation is 30-40% aligned** - Entity management exists but no user portal
5. **Introducer self-service is 0%** - Staff CRUD exists but introducers can't log in
6. **29%/11%/60% completion assessment is ACCURATE** - Don't plan for 85% complete

---

## PART 1: CRITICAL SCOPE CORRECTIONS

### 1.1 User Types (Corrected from 5 to 7 Personas)

**User stories define 7 external user personas, not 5:**

| Persona | Description | DB Entity | Can Also Be |
|---------|-------------|-----------|-------------|
| **Investor** | Invests in vehicles, receives distributions | `investor_users` junction | - |
| **CEO** | Full control, approvals, user management | `profiles.role='staff_admin'` | - |
| **Arranger** | Deal structuring, vehicle management | `arranger_entities` (+ needs `arranger_users`) | - |
| **Lawyer** | Assigned deals, document review | `deal_memberships.role='lawyer'` | - |
| **Introducer** | Refers investors, earns commissions | `introducers` table | + Investor (hybrid) |
| **Partner** | Refers + invests + can SHARE opps | `introducers` + `investor_users` (hybrid) | Investor + Introducer |
| **Commercial Partner** | Regulated placement agent | Needs type flag on `introducers` | + Investor (hybrid) |

**Critical Insight:** Partner/Commercial Partner are NOT separate entity types - they're **hybrid roles** combining Introducer + Investor capabilities.

### 1.2 Partner vs Introducer (From Agent Analysis)

**The previous plan wrongly stated Partner is "0% built". Correction:**

| Attribute | Introducer | Partner | Commercial Partner |
|-----------|------------|---------|-------------------|
| Core Role | Refers investors for commission | Refers + invests themselves | Regulated placement agent |
| DB Entity | `introducers` table | `introducers` + `investor_users` | `introducers` + type flag |
| Can Invest | No | **Yes** | No (regulatory restriction) |
| Can Share Opps | No | **Yes** (unique power) | No |
| Agreement Required | **Yes** (Introducer Agreement) | No (CEO handles) | **Yes** (Placement Agreement) |
| Implementation Status | Staff CRUD 100%, Self-service 0% | **HYBRID - can be built today** | Needs type differentiation |

**Key Finding:** A Partner is just an Introducer record + an Investor user link. The database already supports this - we just need the UI/auth to recognize hybrid users.

### 1.3 What's ACTUALLY Built vs Not Built

**Validated by agent analysis against actual codebase:**

| Feature | Previous Claim | Actual Status | Evidence |
|---------|----------------|---------------|----------|
| **Partner entity** | "0% built" | **HYBRID - DB ready** | Can link `introducers.user_id` + `investor_users.user_id` |
| **Commercial Partner** | "0% built" | **Needs type flag only** | Add `introducer_type` enum to `introducers` |
| **Arranger entity management** | "Built" | **30-40% aligned** | Entity CRUD exists, NO user portal |
| **Arranger user portal** | Assumed built | **0% built** | No routes, no auth, no notifications |
| **Introducer staff management** | "Built" | **100% built** | Full CRUD, commissions, tracking |
| **Introducer self-service** | Assumed partial | **0% built** | No portal, no RLS, no auth |
| **Lawyer deal access** | Assumed via deal_memberships | **BLOCKED by middleware** | `profile.role='investor'` required |
| **Data room for lawyers** | Assumed partial | **BLOCKED by RLS** | Requires `investor_users` link |

---

## PART 2: PHASE 0 - MANDATORY STABILIZATION

**These issues MUST be fixed before Phase 1. They are broken features that will multiply bugs during restructuring.**

### 2.1 Critical Broken Endpoints

| Issue | Location | Impact | Fix Effort |
|-------|----------|--------|------------|
| **Deal invite URL mismatch** | `/api/deals/[id]/members/route.ts:236` | Notification links to non-existent `/versoholdings/deals/{id}` instead of `/versoholdings/deal/{id}` | 30min |
| **`/api/report-requests` missing** | `components/holdings/quick-actions-menu.tsx:58` | UI calls non-existent API, fails silently | 2-3h |
| **Invite link acceptance page missing** | DB has `invite_links` but no `/invite/[token]` page | Can't accept deal invitations | 4-6h |
| **Profile deletion not enforced** | `middleware.ts` | Deactivated users can still access if session valid | 1h |
| **Cron TODOs in fee generation** | `/api/cron/fees/generate-scheduled/route.ts:125-126` | Invoices/reminders don't auto-create | 3-4h |

### 2.2 RLS Policy Gaps (Blockers for Self-Service)

| Table | Current State | Required Change |
|-------|---------------|-----------------|
| `introductions` | Staff-only SELECT | Add self-read policy via `introducer_id` |
| `introducer_commissions` | Staff-only SELECT | Add self-read policy via `introducer_id` |
| `deal_data_room_access` | Investor-only via `investor_users` | Add participant-access policy via `deal_memberships` |
| `deal_data_room_documents` | Investor-only | Add participant access OR use `documents` table |

### 2.3 Phase 0 Deliverables

```
Phase 0: Stabilization (REQUIRED - 15-20h)
├── Fix deal invite URL mismatch (30min)
├── Implement /api/report-requests endpoint OR remove UI button (2-3h)
├── Add invite link acceptance page /invite/[token] (4-6h)
├── Enforce profiles.deleted_at in middleware (1h)
├── Add RLS self-read policies for introducer tables (2h)
├── Decide participant data room access strategy (2h decision + 4h impl)
└── Test all fixes (2h)
```

---

## PART 3: THE MIDDLEWARE BLOCKER (PRIMARY)

**Previous plans focused on RLS. The actual PRIMARY blocker is middleware.**

### 3.1 The Hard Gate

**File:** `versotech-portal/src/middleware.ts:305`

```typescript
// Role-based access control
if (pathname.startsWith('/versoholdings') && effectiveProfile.role !== 'investor') {
  // Staff user trying to access investor portal
  if (['staff_admin', 'staff_ops', 'staff_rm'].includes(effectiveProfile.role)) {
    return NextResponse.redirect(new URL('/versotech/staff', request.url))
  }
  // Unknown role, redirect to investor login
  return NextResponse.redirect(new URL('/versoholdings/login', request.url))
}
```

**Impact:** ANY user without `profile.role='investor'` is blocked from the ENTIRE `/versoholdings` portal.

This means:
- Lawyers added via `deal_memberships` → BLOCKED
- Advisors added via `deal_memberships` → BLOCKED
- Introducers (even with `introducers.user_id` set) → BLOCKED
- Partners (hybrid) → ONLY works if they also have `profile.role='investor'`

### 3.2 Access Control Matrix (Current State)

| User Type | profile.role | Can Access /versoholdings? | Can See Deals? | Can Access Data Room? |
|-----------|--------------|---------------------------|----------------|----------------------|
| Investor | `investor` | YES | YES (via investor_users) | YES |
| Staff | `staff_*` | Redirected to /versotech | N/A | N/A |
| Lawyer | `lawyer` (if exists) | **BLOCKED** | N/A | N/A |
| Introducer | `introducer` (if exists) | **BLOCKED** | N/A | N/A |
| Partner (hybrid) | `investor` + introducer record | YES | YES | YES |

### 3.3 Solution Options

**Option A: Persona-Based Auth (Recommended)**
- Add `personas` JSONB array to profiles OR
- Query linked entities on login to determine available personas
- Store active persona in cookie/session
- Middleware checks persona list, not single role

**Option B: Multiple Profile Roles**
- Change `profile.role` from single enum to array
- Middleware checks if ANY role grants access

**Option C: Separate Route Groups (Lowest Risk)**
- Keep `/versoholdings` for investors only
- Create `/participant` for lawyers/advisors/introducers
- Each route group has own middleware rules

---

## PART 4: CORRECTED PHASE SEQUENCE

### 4.0 Phase 0: Stabilization (REQUIRED)
**Effort:** 15-20h | **Risk:** HIGH if skipped

- Fix 5 broken endpoints/features
- Add 2 RLS self-read policies
- Decide data room participant access strategy
- No new features, just fixes

### 4.1 Phase 1: Foundation (Persona System)
**Effort:** 25-30h | **Risk:** HIGH (core auth)
**Dependencies:** Phase 0

**Deliverables:**
1. Persona detection function (`detectUserPersonas()`)
2. Middleware update for persona-based routing
3. `arranger_users` junction table (migration)
4. Theme system (light/dark/system)
5. Active persona cookie management

**Database Changes:**
```sql
-- Only 1 new table
CREATE TABLE arranger_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  arranger_entity_id UUID NOT NULL REFERENCES arranger_entities(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, arranger_entity_id)
);
```

### 4.2 Phase 2: Investor UX Improvements
**Effort:** 15-20h | **Risk:** MEDIUM
**Dependencies:** Phase 1

**Deliverables:**
1. Journey progress bar on deal detail
2. Rename "Active Deals" → "Investment Opportunities"
3. Data room embedded in deal detail (pre-investment)
4. Tasks + Notifications combined in header
5. Documents nav simplification ("Reports" → "Documents")
6. Profile tab split (KYC vs Compliance)

**Database Changes:** None

### 4.3 Phase 3: Introducer Self-Service
**Effort:** 20-25h | **Risk:** MEDIUM
**Dependencies:** Phase 0 (RLS), Phase 1 (auth)

**Deliverables:**
1. Introducer portal route group `(introducer)/`
2. Introductions list + detail pages
3. Commissions list + payment tracking
4. Fee model visibility (read-only)
5. Update `/api/staff/introducers` to set `user_id`

**Database Changes:**
```sql
-- Already have policies to add from Phase 0
-- Plus ensure introducers.user_id is populated
```

### 4.4 Phase 4: Deal Participant Access (Lawyer/Advisor)
**Effort:** 15-20h | **Risk:** HIGH
**Dependencies:** Phase 1, Phase 0 (data room RLS decision)

**Deliverables:**
1. Participant route group OR refactor investor routes
2. Deal list filtered by `deal_memberships`
3. Deal detail without investor_id requirement
4. Data room access for participants (if decided)
5. Document visibility by role

**Database Changes:**
```sql
-- Add participant-aware data room policy
CREATE POLICY "deal_data_room_access_participant" ON deal_data_room_access
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM deal_memberships dm
    WHERE dm.deal_id = deal_data_room_access.deal_id
      AND dm.user_id = auth.uid()
      AND dm.role IN ('lawyer', 'advisor', 'banker')
  )
);
```

### 4.5 Phase 5: CEO Tools Consolidation
**Effort:** 15h | **Risk:** LOW
**Dependencies:** Phase 1

**Deliverables:**
1. Consolidated Users page with tabs
2. Merge Approvals + Messages into Inbox
3. Arranger management improvements

### 4.6 Phase 6: Admin Portal Carve-Out
**Effort:** 10h | **Risk:** LOW
**Dependencies:** Phase 1, Phase 5

**Deliverables:**
1. `/versotech_admin` route group
2. Platform settings page
3. Growth analytics placeholder
4. CMS placeholder

---

## PART 5: EFFORT SUMMARY (REVISED)

| Phase | Effort | Risk | Critical Dependencies |
|-------|--------|------|----------------------|
| **Phase 0** Stabilization | 15-20h | HIGH if skipped | None |
| **Phase 1** Foundation | 25-30h | HIGH | Phase 0 |
| **Phase 2** Investor UX | 15-20h | MEDIUM | Phase 1 |
| **Phase 3** Introducer Self-Service | 20-25h | MEDIUM | Phase 0, 1 |
| **Phase 4** Participant Access | 15-20h | HIGH | Phase 1, 0 |
| **Phase 5** CEO Tools | 15h | LOW | Phase 1 |
| **Phase 6** Admin Portal | 10h | LOW | Phase 1, 5 |
| **TOTAL** | **115-140h** | - | - |

**Note:** This is ~60% MORE than the previous estimate of 85h because:
1. Phase 0 was missing (15-20h)
2. Introducer self-service was underestimated (20-25h vs implied "done")
3. Participant access complexity was underestimated

---

## PART 6: CRITICAL DECISIONS REQUIRED

### 6.1 Immediate Decisions (Before Phase 0)

| Decision | Options | Recommendation | Impact |
|----------|---------|----------------|--------|
| **Data room for participants** | A) Add RLS, B) Separate table, C) Exclude | **A) Add RLS** | Lawyers can see deal docs |
| **Introducer type differentiation** | A) Enum on introducers, B) Separate table | **A) Enum** | Partners vs Commercial Partners |
| **Report requests** | A) Implement API, B) Remove button | **A) Implement** | User story requires it |

### 6.2 Phase 1 Decisions

| Decision | Options | Recommendation |
|----------|---------|----------------|
| **Persona routing** | A) Cookie-based, B) Session-based, C) Query-per-request | **A) Cookie** |
| **Profile.role handling** | A) Keep single, add personas, B) Make array | **A) Keep single** |
| **Arranger portal scope** | A) Full portal, B) Deal-focused view only | **B) Deal-focused** initially |

### 6.3 Open Questions for Product

1. Do lawyers need to EDIT documents or only VIEW?
2. Should introducers see commission calculations before approval?
3. Is Commercial Partner urgent or can wait for Phase 7?
4. Partner sharing opportunities - what UI is expected?

---

## PART 7: VALIDATION AGAINST USER STORIES

### 7.1 Introducer User Stories (Section 6.6)

| Row | Story | Phase | Status |
|-----|-------|-------|--------|
| 75-78 | View opportunities as introducer referrer | Phase 3 | Planned |
| 79 | View introducer fee model per opportunity | Phase 3 | Planned |
| 81-90 | View/approve/sign introducer agreements | Phase 3 | Planned |
| 91-97 | Track introductions, subscriptions, funding | Phase 3 | Planned |
| 100-105 | Revenue reporting, submit invoices | Phase 3 | Planned |

### 7.2 Partner User Stories (Section 5)

| Row | Story | Phase | Status |
|-----|-------|-------|--------|
| 5.2 | My opportunities as investor (even if Partner) | Phase 1 | Via hybrid role |
| 5.3 | Share opportunities to investors/introducers | Phase 7+ | Future scope |
| - | Commission tracking | Phase 3 | Same as Introducer |

### 7.3 Arranger User Stories (Section 2)

| Row | Story | Phase | Status |
|-----|-------|-------|--------|
| 1.1.2 | Create arranger profile | Built | Staff can create |
| 2.x | Arranger receives notifications | Phase 4+ | Future scope |
| 851 | Notification when subscription pack signed | Phase 4+ | Future scope |

---

## PART 8: FILES TO MODIFY (Critical Path)

### Phase 0

```
Fix:
- versotech-portal/src/app/api/deals/[id]/members/route.ts:236
- versotech-portal/src/components/holdings/quick-actions-menu.tsx:58
- versotech-portal/src/middleware.ts (deleted_at check)

Create:
- versotech-portal/src/app/(public)/invite/[token]/page.tsx
- supabase/migrations/YYYYMMDD_add_introducer_self_read_policies.sql
```

### Phase 1

```
Create:
- versotech-portal/src/types/persona.ts
- versotech-portal/src/lib/auth/detect-personas.ts
- supabase/migrations/YYYYMMDD_add_arranger_users.sql

Modify:
- versotech-portal/src/middleware.ts (persona-based routing)
- versotech-portal/src/components/theme-provider.tsx
- versotech-portal/src/components/layout/user-menu.tsx
```

### Phase 3

```
Create:
- versotech-portal/src/app/(introducer)/introducer/* (new route group)
- versotech-portal/src/components/introducer/* (new components)

Modify:
- versotech-portal/src/app/api/staff/introducers/route.ts (accept user_id)
```

---

## APPENDIX A: Agent Analysis Sources

This document synthesizes findings from 6 specialized audit agents:

1. **User Stories Personas Agent** - Analyzed all 7 personas from user stories
2. **Codex Addendum Validation Agent** - Verified 11 claims (10 accurate, 1 refuted)
3. **Arranger Implementation Audit Agent** - Found 30-40% alignment with stories
4. **Introducer Implementation Audit Agent** - Confirmed 0% self-service built
5. **Deal Membership RLS Agent** - Identified middleware as primary blocker
6. **Partner vs Introducer Agent** - Confirmed Partner = hybrid role

---

## APPENDIX B: Previous Plan Errors Corrected

| Previous Claim | Correction |
|----------------|------------|
| "Partner 0% built" | Partner is hybrid role - DB supports it |
| "Commercial Partner 0% built" | Needs type flag only, not separate table |
| "Only 1 DB table needed" | Correct for arranger_users, but RLS policies also needed |
| "5 user types" | 7 user types (+ CEO makes 8 if counted) |
| "~85h total" | 115-140h with Phase 0 and accurate scoping |
| "RLS is the blocker" | Middleware role check is PRIMARY blocker |
| "Introducer self-service partial" | 0% built for self-service |
| "Term sheet download broken" | Actually working (Codex claim refuted) |
