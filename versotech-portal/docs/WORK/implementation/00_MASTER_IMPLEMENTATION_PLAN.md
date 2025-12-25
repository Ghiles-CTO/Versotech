# VERSO Phase 2 - Master Implementation Plan

**Version:** 4.0 (Developer-Ready)
**Date:** December 24, 2025
**Target Launch:** January 10, 2025
**Last Audit:** December 24, 2025
**Status:** ALL PLANS DEVELOPER-READY WITH COPY-PASTE CODE

---

## EXECUTIVE SUMMARY

This document consolidates the implementation plans for all 7 user types in the VERSO platform. Each user type has a dedicated plan file with detailed requirements.

**ALL 7 PLANS NOW INCLUDE COMPLETE, DEVELOPER-READY CODE:**
- Full API route implementations with Zod validation
- Database migrations with RLS policies
- React component templates with hooks
- Audit logging and notification patterns

### Plan Files (DEVELOPER-READY December 24, 2025)

| # | User Type | File | Hours | Priority | Completion | Critical Issue | Code Ready |
|---|-----------|------|-------|----------|------------|----------------|------------|
| 01 | CEO | `01_CEO_IMPLEMENTATION_PLAN.md` | 6 | Medium | 75-80% | GDPR deletion missing | ✅ GDPR APIs |
| 02 | Investor | `02_INVESTOR_IMPLEMENTATION_PLAN.md` | 32 | HIGH | 60% | Resale 0%, Certificate 30% | ✅ Resale APIs + Migration |
| 03 | Arranger | `03_ARRANGER_IMPLEMENTATION_PLAN.md` | 28 | HIGH | 15% | Zero fee model CRUD | ✅ Fee Model CRUD |
| 04 | Lawyer | `04_LAWYER_IMPLEMENTATION_PLAN.md` | 16 | HIGH | 20% | No escrow confirmation | ✅ Escrow APIs |
| 05 | Partner | `05_PARTNER_IMPLEMENTATION_PLAN.md` | 16 | HIGH | **25%** | **Conditional access BROKEN** | ✅ Access Control Fix |
| 06 | Introducer | `06_INTRODUCER_IMPLEMENTATION_PLAN.md` | 28 | HIGH | **28%** | **Agreement path BROKEN** | ✅ Agreement CRUD |
| 07 | Commercial Partner | `07_COMMERCIAL_PARTNER_IMPLEMENTATION_PLAN.md` | 28 | HIGH | **45%** | **No client management** | ✅ Client CRUD |

**TOTAL HOURS: ~154 hours (REVISED)**

### Summary of Critical Blockers

| User Type | Blocking Issue | Impact |
|-----------|---------------|--------|
| **Partner** | No role check on `can_subscribe` - partners can invest in ANY deal | Access control BROKEN |
| **Introducer** | Staff cannot create/send agreements, introducer cannot sign | Agreement workflow BROKEN |
| **Comm. Partner** | No client CRUD - MODE 2 proxy mode unusable | Core functionality BLOCKED |

---

## CRITICAL PREREQUISITE: DATABASE ENUM MIGRATION

### ⚠️ BLOCKING ISSUE IDENTIFIED

**Current State (Verified via Supabase MCP):**

| Enum | Current Values | Required Values |
|------|---------------|-----------------|
| `deal_memberships.role` | `investor`, `verso_staff` | + `partner`, `partner_investor`, `introducer`, `introducer_investor`, `commercial_partner`, `commercial_partner_investor`, `commercial_partner_proxy`, `lawyer` |
| `profiles.role` | `investor`, `staff_admin` | Already sufficient (persona system handles others) |

**Migration Required:**
```sql
-- Add missing role values to deal_memberships
ALTER TYPE deal_membership_role ADD VALUE IF NOT EXISTS 'partner';
ALTER TYPE deal_membership_role ADD VALUE IF NOT EXISTS 'partner_investor';
ALTER TYPE deal_membership_role ADD VALUE IF NOT EXISTS 'introducer';
ALTER TYPE deal_membership_role ADD VALUE IF NOT EXISTS 'introducer_investor';
ALTER TYPE deal_membership_role ADD VALUE IF NOT EXISTS 'commercial_partner';
ALTER TYPE deal_membership_role ADD VALUE IF NOT EXISTS 'commercial_partner_investor';
ALTER TYPE deal_membership_role ADD VALUE IF NOT EXISTS 'commercial_partner_proxy';
ALTER TYPE deal_membership_role ADD VALUE IF NOT EXISTS 'lawyer';
```

**This migration MUST be applied BEFORE:**
- Partner conditional investor access
- Introducer conditional investor access
- Commercial Partner MODE 1/MODE 2
- Lawyer deal assignment

---

## VERIFIED DATABASE STATE

### Tables Confirmed to Exist

**Entity Tables:**
- `investors`, `investor_users`, `investor_members` (with `is_signatory`, `can_sign`)
- `partners`, `partner_users`, `partner_members`
- `commercial_partners`, `commercial_partner_users`, `commercial_partner_members`, `commercial_partner_clients`
- `lawyers`, `lawyer_users`, `lawyer_members`, `deal_lawyer_assignments`
- `introducers`, `introducer_users`, `introducer_agreements`
- `arranger_entities`, `arranger_users`
- `placement_agreements`

**Journey Tracking (Verified):**
- `deal_memberships`: `dispatched_at`, `viewed_at`, `interest_confirmed_at`, `nda_signed_at`, `data_room_granted_at`, `referred_by_entity_id`, `referred_by_entity_type`
- `subscriptions`: `pack_generated_at`, `pack_sent_at`, `signed_at`, `funded_at`, `activated_at`, `submitted_by_proxy`, `proxy_user_id`, `proxy_commercial_partner_id`

**Signatory Support (Verified):**
- `investor_members.is_signatory` (boolean)
- `investor_members.can_sign` (boolean)
- `investor_members.signature_specimen_url` (text)

### What Already Works

| Feature | Status | Notes |
|---------|--------|-------|
| Multi-persona system | ✅ WORKING | `get_user_personas()` RPC exists |
| VersaSign | ✅ WORKING | Canvas signature, PDF embedding |
| Investor journey | ✅ PARTIAL | Journey bar exists but needs enhancement |
| Deal dispatch | ✅ WORKING | Creates deal_memberships |
| Subscription flow | ✅ WORKING | Pack generation, signing |
| Data room access | ✅ WORKING | NDA → access grant flow |
| Portal navigation | ✅ WORKING | 47+ routes under /versotech_main |
| Proxy subscribe API | ✅ WORKING | `/api/commercial-partners/proxy-subscribe` exists |

---

## WHAT NEEDS WORK (By Priority)

### P0 - Critical Path (Must Have)

| Task | Hours | Blocks |
|------|-------|--------|
| **Database enum migration** | 1 | All hybrid user features |
| Journey bar enhancement | 6 | Partner/Introducer/CP investor view |
| Conditional investor access (Partner) | 4 | Partner investing |
| Conditional investor access (Introducer) | 4 | Introducer investing |
| Conditional investor access (CP) | 4 | CP MODE 1/MODE 2 |
| Introducer agreement blocking | 4 | Business rule enforcement |

### P1 - High Priority

| Task | Hours | User Type |
|------|-------|-----------|
| Arranger fee model CRUD | 14 | Arranger |
| Agreement signing workflows | 8 | Introducer, CP |
| Proxy mode UI (banner, client select) | 6 | CP |
| Lawyer subscription visibility | 4 | Lawyer |
| Escrow confirmation flow | 4 | Lawyer |
| Per-persona dashboards | 16 | All |

### P2 - Important

| Task | Hours | User Type |
|------|-------|-----------|
| Resale flow | 20 | Investor |
| Certificate generation | 4 | Investor |
| Client management UI | 6 | CP |
| Fee model view (read-only) | 4 | Partner, Introducer |

### P3 - Deferred (Post-Launch)

| Feature | Hours | Reason |
|---------|-------|--------|
| Conversion Events | 24 | Complex calculation logic |
| Redemption Events | 32 | Multi-party payout logic |
| Full GDPR | 16 | Scope undefined by client |
| Email Reminders | 8 | No provider selected |

---

## IMPLEMENTATION SCHEDULE

### Phase 1: Foundation (Days 1-3) - 24 hours

| Day | Tasks | Hours |
|-----|-------|-------|
| **Day 1** | Database enum migration | 1 |
| **Day 1** | Journey bar enhancement | 6 |
| **Day 1** | Buffer/testing | 1 |
| **Day 2** | Conditional investor access (Partner) | 4 |
| **Day 2** | Conditional investor access (Introducer) | 4 |
| **Day 3** | Conditional investor access (CP) | 4 |
| **Day 3** | Introducer agreement blocking | 4 |

### Phase 2: Arranger + Agreements (Days 4-6) - 26 hours

| Day | Tasks | Hours |
|-----|-------|-------|
| **Day 4** | Arranger fee model CRUD (all 3 types) | 8 |
| **Day 5** | Arranger fee model CRUD (finish) | 6 |
| **Day 5** | Introducer agreement CRUD API | 4 |
| **Day 6** | Placement agreement CRUD API | 4 |
| **Day 6** | Agreement signing pages | 4 |

### Phase 3: Proxy + Lawyer (Days 7-9) - 22 hours

| Day | Tasks | Hours |
|-----|-------|-------|
| **Day 7** | CP Proxy mode banner + context | 4 |
| **Day 7** | Client management UI | 4 |
| **Day 8** | Proxy subscription flow enhancement | 4 |
| **Day 8** | Lawyer subscription visibility | 4 |
| **Day 9** | Escrow confirmation flow | 4 |
| **Day 9** | Buffer | 2 |

### Phase 4: Dashboards (Days 10-11) - 16 hours

| Day | Tasks | Hours |
|-----|-------|-------|
| **Day 10** | Arranger dashboard | 4 |
| **Day 10** | Lawyer dashboard | 4 |
| **Day 11** | Partner dashboard | 4 |
| **Day 11** | Introducer dashboard | 4 |

### Phase 5: Investor Enhancements (Days 12-14) - 24 hours

| Day | Tasks | Hours |
|-----|-------|-------|
| **Day 12** | CP dashboard | 4 |
| **Day 12** | Resale: Database + API | 8 |
| **Day 13** | Resale: UI + flow | 8 |
| **Day 14** | Certificate generation | 4 |

### Phase 6: Testing + Polish (Days 15-17) - 20 hours

| Day | Tasks | Hours |
|-----|-------|-------|
| **Day 15** | Integration testing (all flows) | 8 |
| **Day 16** | Bug fixes | 8 |
| **Day 17** | Final polish + documentation | 4 |

---

## FILES TO CREATE (ORGANIZED BY PHASE)

### Phase 1 Files

```
# Database
supabase/migrations/YYYYMMDD_extend_deal_membership_roles.sql

# Journey Bar Enhancement
src/components/investor/journey-bar.tsx (enhance existing)
src/lib/investor/journey-status.ts
src/app/api/investor/journey-status/[dealId]/route.ts

# Conditional Access
src/lib/partner/can-invest.ts
src/lib/introducer/can-invest.ts
src/lib/commercial-partner/can-invest.ts
```

### Phase 2 Files

```
# Arranger Fee CRUD
src/app/api/arrangers/partners/[partnerId]/fee-models/route.ts
src/app/api/arrangers/introducers/[introducerId]/fee-models/route.ts
src/app/api/arrangers/commercial-partners/[cpId]/fee-models/route.ts
src/components/arranger/fee-model-form.tsx
src/components/arranger/fee-model-list.tsx

# Agreement APIs
src/app/api/introducer-agreements/route.ts
src/app/api/introducer-agreements/[id]/route.ts
src/app/api/introducer-agreements/[id]/approve/route.ts
src/app/api/introducer-agreements/[id]/sign/route.ts
src/app/api/placement-agreements/route.ts
src/app/api/placement-agreements/[id]/route.ts
src/app/api/placement-agreements/[id]/sign/route.ts

# Agreement Pages
src/app/(main)/versotech_main/introducer-agreements/[id]/page.tsx
src/app/(main)/versotech_main/placement-agreements/[id]/page.tsx
```

### Phase 3 Files

```
# Proxy Mode
src/components/commercial-partner/proxy-mode-banner.tsx
src/app/api/commercial-partners/me/clients/route.ts
src/app/api/commercial-partners/me/clients/[id]/route.ts
src/components/commercial-partner/client-form.tsx
src/components/commercial-partner/client-list.tsx

# Lawyer
src/app/api/escrow/[id]/confirm-funding/route.ts
src/app/api/escrow/[id]/confirm-payment/route.ts
src/components/lawyer/escrow-confirm-modal.tsx
```

### Phase 4 Files

```
# Dashboards
src/components/dashboard/arranger-dashboard.tsx
src/components/dashboard/lawyer-dashboard.tsx
src/components/dashboard/partner-dashboard.tsx
src/components/dashboard/introducer-dashboard.tsx
src/components/dashboard/cp-dashboard.tsx
```

### Phase 5 Files

```
# Resale
src/app/(main)/versotech_main/portfolio/[id]/sell/page.tsx
src/app/api/investor/sell-request/route.ts
src/app/api/investor/sell-request/[id]/route.ts
src/components/investor/sell-position-form.tsx
supabase/migrations/YYYYMMDD_investor_sale_requests.sql

# Certificates
src/app/api/subscriptions/[id]/generate-certificate/route.ts
src/lib/documents/certificate-generator.ts
src/templates/equity-certificate.html
```

---

## TESTING STRATEGY

### Per-Persona Test Matrix

| Persona | Key Tests |
|---------|-----------|
| CEO | GDPR export, user management, deal dispatch |
| Investor | Journey bar accuracy, resale flow, certificates |
| Arranger | Fee model CRUD, agreement workflows |
| Lawyer | Read-only subscriptions, escrow confirmation |
| Partner | Conditional investor access, fee view |
| Introducer | Agreement blocking, signing flow |
| Commercial Partner | MODE 1 vs MODE 2, proxy banner |

### Integration Tests

- [ ] CEO dispatches deal → Partner receives with `partner_investor` role → Partner can invest
- [ ] Arranger creates fee model → Partner sees it (read-only)
- [ ] Arranger sends introducer agreement → Introducer signs → Can introduce
- [ ] CP in proxy mode → Documents show client name → Client is investor of record
- [ ] Investor sells → CEO creates IO → Buyer completes → Positions update

---

## RISK REGISTER

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Enum migration issues | High | Low | Test in branch first |
| Resale complexity | High | Medium | Start Day 12, buffer time |
| Proxy document generation | High | Medium | Test thoroughly |
| Agreement VersaSign integration | Medium | Low | Pattern already proven |

---

## DECISION LOG

| Decision | Date | Rationale |
|----------|------|-----------|
| Profiles.role stays as-is | Dec 24 | Persona system handles role detection |
| deal_memberships.role must be extended | Dec 24 | Required for conditional access |
| GDPR minimal for launch | Dec 24 | Client confirmed |
| Resales required for launch | Dec 24 | Client confirmed |
| VersaSign for all signatures | Dec 24 | No DocuSign integration |

---

## AUDIT METHODOLOGY

This master plan and all 7 user type plans were verified using:

1. **Database Verification via Supabase MCP**
   - All table structures confirmed
   - Enum values verified directly from PostgreSQL
   - Column existence and types checked

2. **Codebase Analysis via Background Agents**
   - 7 parallel agents analyzed each user type
   - Every file in `src/app/api/*`, `src/components/*`, `src/lib/*` searched
   - Line-by-line code inspection for critical features

3. **API Route Inventory**
   - All endpoints catalogued with method and status
   - Request/response patterns verified

4. **UI/UX Component Verification**
   - Page existence confirmed via file system
   - Component props and functionality reviewed

---

## DEVELOPER QUICK REFERENCE

### What's Ready to Copy-Paste

| Plan | Developer-Ready Code | Location in File |
|------|---------------------|------------------|
| 01 CEO | GDPR Export API, Deletion Request API, Export Button Component | `## DEVELOPER-READY IMPLEMENTATION CODE` |
| 02 Investor | Resale Migration SQL, Sell Request API, Sell Form Component | `## DEVELOPER-READY IMPLEMENTATION CODE` |
| 03 Arranger | Fee Model CRUD API, Fee Model Form, Arranger Dashboard | `## DEVELOPER-READY IMPLEMENTATION CODE` |
| 04 Lawyer | Escrow Confirmation API, Lawyer Notifications, Dashboard | `## DEVELOPER-READY IMPLEMENTATION CODE` |
| 05 Partner | can-invest.ts Utility, Role Check Fix, Partner Dashboard | `## DEVELOPER-READY IMPLEMENTATION CODE` |
| 06 Introducer | Agreement CRUD API, Approval/Sign APIs, Dashboard | `## DEVELOPER-READY IMPLEMENTATION CODE` |
| 07 Commercial Partner | Client CRUD API, Client Form, CP Dashboard | `## DEVELOPER-READY IMPLEMENTATION CODE` |

### Critical Bug Fix (IMPLEMENT FIRST)

**Partner Access Control is BROKEN** - Partners dispatched as `partner` (tracking only) can currently subscribe to ANY deal.

Fix in `/api/investors/me/opportunities/[id]/route.ts`:
```typescript
// ADD THIS WHITELIST:
const canSubscribeRoles = [
  'investor', 'partner_investor', 'introducer_investor',
  'commercial_partner_investor', 'co_investor'
];

// CHANGE THIS:
can_subscribe: !subscription && isDealOpen

// TO THIS:
const roleAllowsSubscription = membership?.role
  ? canSubscribeRoles.includes(membership.role)
  : false;
can_subscribe: !subscription && isDealOpen && roleAllowsSubscription
```

### Implementation Priority Order

1. **P0 - Blocking** (Fix First)
   - Partner/Introducer/CP access control (role checks)
   - Introducer agreement CRUD (workflow blocked)
   - CP client CRUD (MODE 2 unusable)

2. **P1 - Core Features**
   - Arranger fee model CRUD
   - Lawyer escrow confirmation
   - Per-persona dashboards

3. **P2 - Enhancement**
   - Investor resale flow
   - CEO GDPR export

---

**Document Version:** 4.0
**Last Updated:** December 24, 2025
**Status:** DEVELOPER-READY IMPLEMENTATION PLANS COMPLETE
**Audit Method:** 7 parallel background agents + Supabase MCP verification
**Code Status:** All 7 plans include copy-paste ready TypeScript, SQL, and React code
**Next Step:** Begin implementation following priority order above
