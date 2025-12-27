# VERSO Platform Phase 2: Portal Restructuring
## Complete Implementation Plan

**Document Version:** 2.1 (ARCHITECTURE CORRECTED)
**Date:** December 16, 2025
**Status:** CORRECTED - Route structure updated
**Prepared For:** VERSO Holdings Leadership
**Prepared By:** Development Team

---

# ⚠️ CRITICAL ARCHITECTURE CORRECTION

**This document previously contained INCORRECT route structures.**

## WRONG (Previous Version):
```
src/app/(introducer)/introducer/*   ← SEPARATE portal - WRONG!
src/app/(participant)/participant/* ← SEPARATE portal - WRONG!
```

## CORRECT (Per plan_next_phase.md):
```
src/app/(admin)/versotech_admin/*   - Admin Portal (CMS, SaaS, Growth)
src/app/(main)/versotech_main/*     - ONE Main Portal for ALL 7 personas
```

## Key Points:
1. **TWO PORTALS ONLY**: Admin + Main
2. **ALL 7 personas in ONE Main Portal**: CEO, Arranger, Investor, Introducer, Lawyer, Partner, Commercial Partner
3. **NO separate portals per persona** - persona switching happens within the Main Portal
4. **Route examples** (all under `/versotech_main/*`):
   - `/versotech_main/introductions` - Introducer's referrals
   - `/versotech_main/commissions` - Introducer's commissions
   - `/versotech_main/assigned-deals` - Lawyer's assigned deals
   - `/versotech_main/opportunities` - Investor's deals

## Where to find CORRECTED routes:
See `docs/planning/PHASE2_ALL_PORTAL_VIEWS.md` for the correct route structure.

The rest of this document (RLS policies, business logic, etc.) is still useful - just replace the route paths accordingly.

---

# TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Business Context & Vision](#2-business-context--vision)
3. [User Personas & Capabilities](#3-user-personas--capabilities)
4. [Current State Assessment](#4-current-state-assessment)
5. [User Journey Mapping](#5-user-journey-mapping)
6. [Technical Architecture](#6-technical-architecture)
7. [Implementation Phases](#7-implementation-phases)
8. [Risk Assessment & Mitigation](#8-risk-assessment--mitigation)
9. [Acceptance Criteria](#9-acceptance-criteria)
10. [Appendices](#10-appendices)

---

# 1. EXECUTIVE SUMMARY

## 1.1 What We're Building

Transform VERSO's current dual-portal system into a unified platform where:

- **One login** grants access to all user capabilities
- **Hybrid users** (e.g., someone who is both an Investor AND an Introducer) can switch between roles seamlessly
- **External partners** (Lawyers, Advisors, Introducers) can access deals they're invited to
- **Self-service portals** reduce staff workload for introducer tracking and partner management
- **Modern UX** with consolidated notifications, streamlined navigation, and theme preferences

## 1.2 Key Outcomes

| For Investors | For Staff | For Partners |
|---------------|-----------|--------------|
| See investment journey progress | Consolidated user management | Introducers see their own commissions |
| Unified notifications in header | Merged inbox (approvals + messages) | Lawyers access assigned deals |
| Embedded data room in deal flow | One-click multi-role management | Partners track referrals AND investments |
| Theme preferences (light/dark) | Admin portal for platform settings | Self-service reduces back-and-forth |

## 1.3 Scope Summary

| In Scope | Out of Scope (Future Phases) |
|----------|------------------------------|
| 7 user personas with hybrid support | GDPR compliance module |
| Introducer self-service portal | Escrow account management |
| Lawyer/Advisor deal access | Secondary sales marketplace |
| CEO tools consolidation | SaaS billing system |
| Admin portal (same codebase) | Mobile native apps |
| Theme system | Growth marketing automation |

## 1.4 Timeline & Investment

| Phase | Duration | Effort | Risk Level |
|-------|----------|--------|------------|
| Phase 0: Stabilization | 1 week | 15-20h | HIGH if skipped |
| Phase 1: Foundation | 2 weeks | 25-30h | HIGH (core auth) |
| Phase 2: Investor UX | 1 week | 15-20h | MEDIUM |
| Phase 3: Introducer Self-Service | 1.5 weeks | 20-25h | MEDIUM |
| Phase 4: Participant Access | 1 week | 15-20h | HIGH |
| Phase 5: CEO Tools | 1 week | 15h | LOW |
| Phase 6: Admin Portal | 0.5 weeks | 10h | LOW |
| **TOTAL** | **8-9 weeks** | **115-140h** | - |

---

# 2. BUSINESS CONTEXT & VISION

## 2.1 Current Challenges

### For Investors
- **Fragmented experience**: Tasks in one place, notifications in another, documents in a third
- **Unclear progress**: No visual indicator of where they are in the investment journey
- **Data room confusion**: Pre-investment data rooms separate from post-investment documents
- **No theme choice**: Forced to use one visual style regardless of preference

### For Staff (CEO/Operations)
- **Scattered user management**: Investors on one page, introducers on another, arrangers on a third
- **Dual inbox problem**: Approvals separate from messages, hard to prioritize
- **Manual introducer updates**: Introducers call/email to ask about their commissions
- **No self-service for partners**: Every query requires staff lookup

### For External Partners
- **No portal access at all**: Lawyers added to deals can't see anything
- **Introducers blind**: Can't see their own introductions, commissions, or agreements
- **Partners fragmented**: Have to use investor portal for investments, then call for introducer matters

## 2.2 The Vision

**Before (Today):**
```
┌─────────────────┐     ┌─────────────────┐
│  Investor       │     │  Staff          │
│  Portal         │     │  Portal         │
│                 │     │                 │
│  - Only for     │     │  - Only for     │
│    investors    │     │    staff        │
│  - No external  │     │  - Manage all   │
│    partners     │     │    manually     │
└─────────────────┘     └─────────────────┘
        │                       │
        └───────────────────────┘
              No connection
              Manual processes
              Email/phone for everything
```

**After (Phase 2):**
```
┌─────────────────────────────────────────────────────────────┐
│                    VERSO Main Portal                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│   │ Investor │  │Introducer│  │  Lawyer  │  │ Partner  │   │
│   │  View    │  │  View    │  │  View    │  │  View    │   │
│   │          │  │          │  │          │  │ (hybrid) │   │
│   │ Portfolio│  │ My Intros│  │ My Deals │  │ Both!    │   │
│   │ Deals    │  │Commissions│ │ Documents│  │          │   │
│   │ Documents│  │ Fees     │  │ Sign     │  │          │   │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│   [🔔 Unified Notifications]  [👤 Switch Role ▼]  [☀️🌙]    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    Staff Portal                              │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│   │   CEO    │  │ Arranger │  │  Admin   │                  │
│   │  Tools   │  │  Tools   │  │  Portal  │                  │
│   └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## 2.3 Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Introducer support tickets | ~20/month | <5/month | Self-service adoption |
| Time to grant lawyer access | Manual process | <1 minute | Automated via invite |
| User confusion reports | Common | Rare | Support feedback |
| Partner commission visibility | 0% | 100% | Self-service portal usage |
| Staff time on user queries | ~10h/week | <2h/week | Time tracking |

---

# 3. USER PERSONAS & CAPABILITIES

## 3.1 Complete Persona Map

Based on user stories analysis, VERSO serves **7 distinct user personas**:

### External Personas (5)

| Persona | Primary Purpose | Can Also Be | Agreement Required |
|---------|-----------------|-------------|-------------------|
| **Investor** | Invests capital, receives returns | - | Subscription docs |
| **Introducer** | Refers investors, earns commissions | + Investor | Introducer Agreement |
| **Partner** | Refers + invests + shares opportunities | Investor + Introducer | None (CEO handles) |
| **Commercial Partner** | Regulated placement agent | + Investor | Placement Agreement |
| **Lawyer/Advisor** | Reviews deals, signs documents | - | Per-deal invite |

### Internal Personas (2)

| Persona | Primary Purpose | Portal Access |
|---------|-----------------|---------------|
| **CEO** | Full platform control, approvals, user management | Staff + Admin |
| **Arranger** | Deal structuring, vehicle management | Staff (deal-focused) |

## 3.2 Hybrid Role Explanation

**What is a "hybrid user"?**

A single person can have multiple relationships with VERSO. For example:

**Sarah's Scenario:**
- Sarah is a wealth manager who **introduces** her clients to VERSO deals (Introducer role)
- Sarah also **personally invests** in some deals (Investor role)
- Sarah is a **Partner** - meaning she gets commission on referrals AND has her own portfolio

**Today's Problem:**
- Sarah has to call VERSO to check her commission status
- Sarah uses investor portal for her investments
- No unified view of both roles

**After Phase 2:**
- Sarah logs in once
- Sees a dropdown: "Viewing as: [Investor ▼]"
- Can switch to "Introducer" view to see commissions
- All data accessible, no phone calls needed

## 3.3 Capabilities by Persona

### 3.3.1 Investor Capabilities

| Capability | Status | Phase |
|------------|--------|-------|
| View portfolio dashboard | ✅ Built | - |
| See investment opportunities | ✅ Built | - |
| Express interest in deals | ✅ Built | - |
| Sign NDAs digitally | ✅ Built | - |
| Access data rooms (pre-investment) | ✅ Built | Phase 2 (embed in deal) |
| Subscribe to deals | ✅ Built | - |
| View documents (post-investment) | ✅ Built | - |
| Request statements | 🔴 Broken | Phase 0 (fix) |
| See journey progress bar | 🆕 New | Phase 2 |
| Unified notifications | 🆕 New | Phase 2 |
| Theme preference | 🆕 New | Phase 1 |

### 3.3.2 Introducer Capabilities

| Capability | Status | Phase |
|------------|--------|-------|
| Staff creates introducer profile | ✅ Built | - |
| Staff records introductions | ✅ Built | - |
| Staff tracks commissions | ✅ Built | - |
| Introducer logs in | 🔴 Not Built | Phase 1 + 3 |
| Introducer sees own introductions | 🔴 Not Built | Phase 3 |
| Introducer sees commissions earned | 🔴 Not Built | Phase 3 |
| Introducer views fee models | 🔴 Not Built | Phase 3 |
| Introducer approves/signs agreements | 🔴 Not Built | Phase 3 |
| Introducer receives notifications | 🔴 Not Built | Phase 3 |

### 3.3.3 Partner Capabilities

| Capability | Status | Phase |
|------------|--------|-------|
| All Investor capabilities | ✅ Built | - |
| All Introducer capabilities | 🔴 Not Built | Phase 3 |
| Share opportunities to others | 🔴 Not Built | Future |
| Unified view of both roles | 🔴 Not Built | Phase 1 |

### 3.3.4 Lawyer/Advisor Capabilities

| Capability | Status | Phase |
|------------|--------|-------|
| Get invited to specific deals | ⚠️ Partial | Phase 0 (fix URL) |
| Accept deal invitation | 🔴 Not Built | Phase 0 |
| View deal details | 🔴 Blocked | Phase 4 |
| Access deal documents | 🔴 Blocked | Phase 4 |
| Sign documents | ⚠️ Partial | Phase 4 |
| Receive notifications | 🔴 Not Built | Phase 4 |

### 3.3.5 CEO Capabilities

| Capability | Status | Phase |
|------------|--------|-------|
| Full dashboard access | ✅ Built | - |
| Manage investors | ✅ Built | Phase 5 (consolidate) |
| Manage introducers | ✅ Built | Phase 5 (consolidate) |
| Manage arrangers | ✅ Built | Phase 5 (consolidate) |
| Approve requests | ✅ Built | Phase 5 (merge with inbox) |
| Send messages | ✅ Built | Phase 5 (merge with approvals) |
| Platform settings | ⚠️ Partial | Phase 6 |
| View all users in one place | 🆕 New | Phase 5 |

### 3.3.6 Arranger Capabilities

| Capability | Status | Phase |
|------------|--------|-------|
| Entity profile management | ✅ Built | - |
| KYC document upload | ✅ Built | - |
| Assigned to deals | ✅ Built | - |
| Arranger user login | 🔴 Not Built | Phase 4+ |
| Arranger notifications | 🔴 Not Built | Future |

---

# 4. CURRENT STATE ASSESSMENT

## 4.1 What's Built Today

### 4.1.1 Completion Summary

Based on comprehensive codebase audit:

| Category | % Complete | Notes |
|----------|------------|-------|
| Investor Portal Core | 85% | Missing journey bar, unified notifications |
| Staff Portal Core | 90% | Working well, needs consolidation |
| Introducer Management (Staff) | 100% | Full CRUD, commissions, tracking |
| Introducer Self-Service | 0% | Not started |
| Lawyer/Advisor Access | 0% | Blocked by authentication |
| Partner Hybrid Support | 0% | Database ready, no UI |
| Admin Portal | 10% | Settings scattered, no dedicated section |
| Theme System | 0% | Not started |

### 4.1.2 Database Tables (Relevant to Phase 2)

**Already Exist and Working:**

| Table | Purpose | Records |
|-------|---------|---------|
| `profiles` | User accounts with role | All users |
| `investors` | Investor entity details | Active investors |
| `investor_users` | Links users to investor entities | Junction table |
| `introducers` | Introducer profiles | Has `user_id` field (unused) |
| `introductions` | Prospect referrals | Staff-managed |
| `introducer_commissions` | Commission tracking | Staff-managed |
| `arranger_entities` | Arranger companies | Entity records |
| `deals` | Investment opportunities | Active deals |
| `deal_memberships` | Who's on each deal | Has `role` field |
| `deal_data_room_access` | Data room permissions | Investor-linked only |

**Need to Create:**

| Table | Purpose | Phase |
|-------|---------|-------|
| `arranger_users` | Links users to arranger entities | Phase 1 |

### 4.1.3 Known Broken Features

These must be fixed in Phase 0:

| Feature | Problem | User Impact |
|---------|---------|-------------|
| Deal invite notifications | URL points to wrong path (`/deals/` vs `/deal/`) | Invitees get broken links |
| Report requests | API endpoint doesn't exist | Button fails silently |
| Invite acceptance | No page to accept invitations | Can't onboard via invite |
| Account deactivation | Deleted users can still log in | Security risk |

## 4.2 Technical Blockers Identified

### 4.2.1 PRIMARY BLOCKER: Authentication Gate

**Location:** `versotech-portal/src/middleware.ts` line 305

**The Problem:**
```
The middleware checks: profile.role === 'investor'
Anyone without this exact role is BLOCKED from the entire investor portal.
This means lawyers, introducers, partners (if not also investors) cannot access.
```

**Impact:** Even if we add someone to a deal via `deal_memberships`, they cannot see it because they're blocked before reaching the page.

**Solution:** Implement persona-based authentication that checks WHAT the user CAN access, not just their primary role.

### 4.2.2 SECONDARY BLOCKER: Row-Level Security

**The Problem:**
```
Data room access RLS requires: investor_users link exists
A lawyer without investor_users → cannot see data room documents
```

**Impact:** Non-investor participants cannot access deal documents even if the middleware were fixed.

**Solution:** Add RLS policies that check `deal_memberships.role` for participant access.

### 4.2.3 TERTIARY BLOCKER: Introducer Security

**The Problem:**
```
Tables: introductions, introducer_commissions
Current RLS: Staff-only SELECT
Introducers cannot see their own records.
```

**Impact:** Even with a portal, introducers would see empty pages.

**Solution:** Add self-read RLS policies that filter by `introducer_id → user_id`.

---

# 5. USER JOURNEY MAPPING

## 5.1 Investor Journey (Enhanced)

### Current Journey
```
1. Express Interest → 2. Sign NDA → 3. Access Data Room → 4. Subscribe → 5. Fund → 6. Active Investment
      ↓                    ↓              ↓                   ↓            ↓            ↓
   [Button]           [DocuSign]    [Separate Page]      [Forms]      [Wire]      [Portfolio]
```

**Pain Points:**
- No visual progress indicator
- Data room is separate page (context switch)
- Notifications scattered (sidebar items)
- "Where am I?" confusion

### Enhanced Journey (Phase 2)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Deal: TechVentures Series B                                                 │
│                                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────┐ │
│  │Interest │──│   NDA   │──│Data Room│──│Subscribe│──│ Funding │──│ Active│ │
│  │   ✓     │  │    ✓    │  │  ● YOU  │  │         │  │         │  │       │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └───────┘ │
│                                                                              │
│  [Overview]  [Data Room ←embedded]  [Documents]  [Q&A]                       │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Data Room Documents (Access expires in 5 days)                         │ │
│  │ ├─ Financials/                                                         │ │
│  │ │   ├─ Q3_2025_Report.pdf                                              │ │
│  │ │   └─ Projections.xlsx                                                │ │
│  │ └─ Legal/                                                              │ │
│  │     └─ Term_Sheet_v2.pdf                                               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Improvements:**
- Progress bar shows exactly where they are
- Data room embedded (no context switch)
- Unified notification bell in header (not sidebar)
- Clear visual hierarchy

### Technical Implementation

**Files to modify:**
- `src/components/deals/deal-detail-client.tsx` - Add journey bar, embed data room
- `src/components/layout/sidebar.tsx` - Remove Tasks, Notifications items
- `src/components/layout/app-layout.tsx` - Add notification center to header

**New components:**
- `src/components/deals/journey-bar.tsx` - Progress indicator
- `src/components/notification-center/notification-center.tsx` - Unified notifications

**Data sources for journey bar:**
```typescript
// Determine journey stage
const journeyStage = determineStage({
  hasInterest: !!investor_deal_interest,        // Stage 1
  hasSignedNDA: !!nda_signed_at,                // Stage 2
  hasDataRoomAccess: !!deal_data_room_access,   // Stage 3
  hasSubscribed: !!deal_subscription,           // Stage 4
  hasFunded: allocation?.funded_amount > 0,     // Stage 5
  isActive: allocation?.status === 'active'     // Stage 6
})
```

## 5.2 Introducer Journey (New)

### Current Journey
```
1. Staff creates introducer profile
2. Introducer refers prospects (via email/phone to staff)
3. Staff manually records introduction
4. Deal happens, commission calculated
5. Introducer asks "what's my commission?" via email
6. Staff looks it up, sends screenshot
7. Invoice created, payment made
8. Introducer asks "did I get paid?" via email
```

**Pain Points:**
- Zero visibility for introducers
- Every question = staff workload
- No self-service anything
- Introducer frustrated, staff overwhelmed

### New Journey (Phase 3)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  VERSO Introducer Portal                        [🔔 2] [Viewing as: Introducer ▼] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Dashboard                                                                   │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                    │
│  │ My Referrals  │  │ Commissions   │  │ Pending       │                    │
│  │     12        │  │  $45,230      │  │ Agreements    │                    │
│  │               │  │  earned       │  │     1         │                    │
│  └───────────────┘  └───────────────┘  └───────────────┘                    │
│                                                                              │
│  Recent Activity                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ ✓ John Smith subscribed to TechVentures - Commission: $5,200 (accrued) │ │
│  │ ✓ Jane Doe joined DataRoom for RealEstate Fund III                     │ │
│  │ ⏳ Awaiting: Your signature on Introducer Agreement                     │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  [My Introductions]  [My Commissions]  [Fee Models]  [Agreements]           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**New Capabilities:**
- See all introductions with status (invited → joined → allocated)
- See all commissions (accrued → invoiced → paid)
- View fee models per opportunity
- Sign agreements digitally
- Receive notifications (subscription events, payments)

### Technical Implementation

**New route group:**
```
src/app/(introducer)/
  ├── introducer/
  │   ├── layout.tsx              # Introducer-specific layout
  │   ├── page.tsx                # Dashboard
  │   ├── introductions/
  │   │   ├── page.tsx            # List all introductions
  │   │   └── [id]/page.tsx       # Introduction detail
  │   ├── commissions/
  │   │   ├── page.tsx            # List all commissions
  │   │   └── [id]/page.tsx       # Commission detail
  │   ├── fees/
  │   │   └── page.tsx            # Fee models
  │   └── agreements/
  │       └── page.tsx            # Agreements to sign
```

**RLS policies to add:**
```sql
-- Allow introducer to see own introductions
CREATE POLICY "introductions_self" ON introductions
FOR SELECT USING (
  introducer_id IN (
    SELECT id FROM introducers WHERE user_id = auth.uid()
  )
);

-- Allow introducer to see own commissions
CREATE POLICY "commissions_self" ON introducer_commissions
FOR SELECT USING (
  introducer_id IN (
    SELECT id FROM introducers WHERE user_id = auth.uid()
  )
);
```

**Staff API update:**
```typescript
// src/app/api/staff/introducers/route.ts
// Add user_id to creation payload
const insertData = {
  ...existingFields,
  user_id: body.user_id ?? null  // NEW: Link to user if provided
}
```

## 5.3 Partner Journey (Hybrid)

### Current Journey
```
Partner = Introducer + Investor, but:
- Uses investor portal for investments
- Calls staff for introducer matters
- No unified view
- Confusing experience
```

### New Journey (Phase 1 + 3)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  VERSO Partner Portal                           [🔔 3] [Viewing as: ▼]      │
│                                                        ┌─────────────┐       │
│                                                        │ Investor    │       │
│                                                        │ Introducer ←│       │
│                                                        └─────────────┘       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Viewing as: INTRODUCER                         [Switch to Investor View]   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Quick Stats                                                          │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │   │
│  │ │Introductions│ │ Commissions │ │ My Portfolio│ │ Open Deals  │     │   │
│  │ │     8       │ │   $32,100   │ │   $1.2M     │ │     3       │     │   │
│  │ │(introducer) │ │(introducer) │ │ (investor)  │ │ (investor)  │     │   │
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Recent from BOTH roles:                                                     │
│  • Commission paid: $5,200 for Smith referral (Introducer)                  │
│  • Distribution received: $12,500 from Fund II (Investor)                   │
│  • New deal available: Healthcare Ventures (both roles can participate)     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**How it works technically:**

```typescript
// Persona detection on login
async function detectUserPersonas(userId: string): Promise<UserPersona[]> {
  const personas: UserPersona[] = []

  // Check investor_users for Investor persona
  const investorLink = await supabase
    .from('investor_users')
    .select('investor_id, investors(name)')
    .eq('user_id', userId)
    .single()

  if (investorLink) {
    personas.push({
      type: 'investor',
      label: 'Investor',
      entityId: investorLink.investor_id
    })
  }

  // Check introducers for Introducer persona
  const introducerLink = await supabase
    .from('introducers')
    .select('id, legal_name')
    .eq('user_id', userId)
    .single()

  if (introducerLink) {
    personas.push({
      type: 'introducer',
      label: 'Introducer',
      entityId: introducerLink.id
    })
  }

  // If BOTH exist, user is a Partner
  return personas
}
```

## 5.4 Lawyer/Advisor Journey (New)

### Current Journey
```
1. Staff adds lawyer email to deal membership
2. System sends notification with BROKEN link
3. Lawyer clicks link → 404 error
4. Lawyer emails staff asking for access
5. Staff manually sends documents
6. Lawyer reviews, sends feedback via email
7. No audit trail, no efficiency
```

### New Journey (Phase 0 + 4)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  VERSO - Deal Access                            [🔔 1] [James Wilson, Esq.] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  You have access to 2 deals as Legal Counsel                                │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ TechVentures Series B                                    [View Deal →] │ │
│  │ Role: Legal Counsel | Added: Dec 10, 2025                              │ │
│  │ Status: Subscription phase | Documents: 12 available                   │ │
│  │ Pending: 1 document requires your signature                            │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ RealEstate Fund III                                      [View Deal →] │ │
│  │ Role: Legal Counsel | Added: Nov 28, 2025                              │ │
│  │ Status: Closed | Documents: 8 available                                │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technical Implementation

**Route option chosen:** Separate participant route group (lowest risk)

```
src/app/(participant)/
  ├── participant/
  │   ├── layout.tsx              # Participant layout
  │   ├── page.tsx                # My deals list
  │   └── deals/
  │       └── [id]/
  │           ├── page.tsx        # Deal detail (participant view)
  │           └── documents/
  │               └── page.tsx    # Documents I can access
```

**Middleware update:**
```typescript
// After checking profile.role...
// Check deal_memberships for participant access
if (pathname.startsWith('/participant')) {
  const memberships = await supabase
    .from('deal_memberships')
    .select('deal_id, role')
    .eq('user_id', user.id)
    .in('role', ['lawyer', 'advisor', 'banker', 'spouse'])

  if (memberships.data?.length > 0) {
    // Allow access to participant routes
    return NextResponse.next()
  }
  // No memberships, redirect to login
  return NextResponse.redirect('/login')
}
```

**RLS for participant data room access:**
```sql
CREATE POLICY "deal_data_room_access_participant" ON deal_data_room_access
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM deal_memberships dm
    WHERE dm.deal_id = deal_data_room_access.deal_id
      AND dm.user_id = auth.uid()
      AND dm.role IN ('lawyer', 'advisor', 'banker', 'spouse')
  )
);

CREATE POLICY "deal_data_room_documents_participant" ON deal_data_room_documents
FOR SELECT USING (
  visible_to_investors  -- Or create new visibility flag
  AND EXISTS (
    SELECT 1 FROM deal_memberships dm
    WHERE dm.deal_id = deal_data_room_documents.deal_id
      AND dm.user_id = auth.uid()
      AND dm.role IN ('lawyer', 'advisor', 'banker', 'spouse')
  )
);
```

## 5.5 CEO Journey (Enhanced)

### Current Journey
```
- Investors page → click to manage
- Introducers page → click to manage
- Arrangers page → click to manage
- Approvals page → handle requests
- Messages page → handle communications
- Settings scattered
```

### New Journey (Phase 5)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  VERSO Staff Portal                                [🔔 5] [CEO Dashboard]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─ Sidebar ─────────────────────────────────────────────────────────────┐  │
│  │ Dashboard                                                              │  │
│  │ Deals                                                                  │  │
│  │ Users ← CONSOLIDATED                                                   │  │
│  │ Inbox ← MERGED (Approvals + Messages)                                  │  │
│  │ Process Center                                                         │  │
│  │ Documents                                                              │  │
│  │ Fees                                                                   │  │
│  │ ─────────────                                                          │  │
│  │ Admin Portal →                                                         │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌─ Users Page ──────────────────────────────────────────────────────────┐  │
│  │                                                                        │  │
│  │  [Investors]  [Introducers]  [Arrangers]  [All Users]                  │  │
│  │       ↓            ↓             ↓             ↓                       │  │
│  │    Tab view     Tab view      Tab view     Combined view               │  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌─ Inbox ───────────────────────────────────────────────────────────────┐  │
│  │                                                                        │  │
│  │  [All]  [Approvals (3)]  [Messages (2)]                                │  │
│  │                                                                        │  │
│  │  Priority items:                                                       │  │
│  │  🔴 KYC Approval - John Smith - waiting 2 days                         │  │
│  │  🟡 Message - Jane Doe - subscription question                         │  │
│  │  🟢 Subscription Approval - TechVentures - $500K                       │  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technical Implementation

**New consolidated users page:**
```
src/app/(staff)/versotech/staff/users/
  ├── page.tsx                    # Consolidated view
  └── components/
      ├── investors-tab.tsx       # Investor management
      ├── introducers-tab.tsx     # Introducer management
      ├── arrangers-tab.tsx       # Arranger management
      └── all-users-tab.tsx       # Combined search
```

**New unified inbox:**
```
src/components/inbox/
  ├── ceo-inbox.tsx               # Main inbox component
  ├── approval-item.tsx           # Approval card
  ├── message-item.tsx            # Message card
  └── inbox-filters.tsx           # Tab filters
```

---

# 6. TECHNICAL ARCHITECTURE

## 6.1 Current Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Next.js 15 Application                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Route Groups:                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│   │  (investor)  │    │   (staff)    │    │   (public)   │                  │
│   │              │    │              │    │              │                  │
│   │/versoholdings│    │  /versotech  │    │  / (landing) │                  │
│   │   /deals     │    │    /staff    │    │    /login    │                  │
│   │   /portfolio │    │    /deals    │    │              │                  │
│   │   /documents │    │   /investors │    │              │                  │
│   └──────────────┘    └──────────────┘    └──────────────┘                  │
│                                                                              │
│   Middleware: src/middleware.ts                                              │
│   ├── Auth check (Supabase)                                                  │
│   ├── Role check (profile.role)  ← BLOCKER                                   │
│   └── Route protection                                                       │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                            Supabase Backend                                  │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│   │  PostgreSQL  │    │     Auth     │    │   Storage    │                  │
│   │              │    │              │    │              │                  │
│   │  - profiles  │    │ - JWT tokens │    │ - documents  │                  │
│   │  - investors │    │ - Sessions   │    │ - data-rooms │                  │
│   │  - deals     │    │              │    │              │                  │
│   │  - RLS ✓     │    │              │    │              │                  │
│   └──────────────┘    └──────────────┘    └──────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 6.2 Target Architecture (After Phase 2)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Next.js 15 Application                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Route Groups:                                                              │
│   ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐    │
│   │(investor) │ │(introducer│ │(particip- │ │  (staff)  │ │  (admin)  │    │
│   │           │ │    )      │ │   ant)    │ │           │ │           │    │
│   │/verso-    │ │/introducer│ │/particip- │ │/versotech │ │/versotech │    │
│   │ holdings  │ │           │ │   ant     │ │  /staff   │ │  _admin   │    │
│   │           │ │           │ │           │ │           │ │           │    │
│   │ Investor  │ │Introducer │ │ Lawyer    │ │CEO/Arrngr │ │ Platform  │    │
│   │ features  │ │ self-svc  │ │ Advisor   │ │ features  │ │ settings  │    │
│   └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘    │
│                                                                              │
│   Middleware: src/middleware.ts (UPDATED)                                    │
│   ├── Auth check (Supabase)                                                  │
│   ├── Persona detection ← NEW                                                │
│   │   ├── Check investor_users                                               │
│   │   ├── Check introducers.user_id                                          │
│   │   ├── Check arranger_users                                               │
│   │   ├── Check deal_memberships                                             │
│   │   └── Check profile.role                                                 │
│   ├── Active persona cookie                                                  │
│   └── Route-to-persona mapping                                               │
│                                                                              │
│   Theme System: src/components/theme-provider.tsx (NEW)                      │
│   ├── Light / Dark / System                                                  │
│   └── Persisted to localStorage + profiles.preferences                       │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                            Supabase Backend                                  │
│   ┌──────────────┐                                                           │
│   │  PostgreSQL  │  NEW/UPDATED:                                             │
│   │              │  + arranger_users table                                   │
│   │  + RLS for   │  + introductions_self policy                              │
│   │    personas  │  + commissions_self policy                                │
│   │              │  + participant data room policies                         │
│   └──────────────┘                                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 6.3 Persona System Design

### 6.3.1 Type Definitions

**File:** `src/types/persona.ts`

```typescript
/**
 * Represents the different "hats" a user can wear in the VERSO platform.
 * A single user can have multiple personas (e.g., Investor + Introducer = Partner).
 */
export type PortalPersona =
  | 'investor'      // External: Can invest in deals
  | 'introducer'    // External: Can refer investors for commission
  | 'participant'   // External: Lawyer/Advisor/Banker with deal access
  | 'ceo'           // Internal: Full platform control
  | 'arranger'      // Internal: Deal structuring
  | 'admin'         // Internal: Platform administration

/**
 * A persona instance linked to a specific entity.
 * For example, an Investor persona is linked to an investor entity.
 */
export interface UserPersona {
  type: PortalPersona
  label: string               // Display name: "Investor", "Introducer", etc.
  entityId?: string           // UUID of linked entity (investor_id, introducer_id, etc.)
  entityName?: string         // Name of entity for display
  permissions: string[]       // Specific permissions for this persona
}

/**
 * Extended user object with persona information.
 */
export interface AuthUser {
  id: string
  email: string
  displayName: string
  role: string                // Legacy profile.role for backwards compatibility
  personas: UserPersona[]     // All available personas
  primaryPersona: PortalPersona  // Default persona on login
  activePersona?: PortalPersona  // Currently selected persona (from cookie)
}
```

### 6.3.2 Persona Detection Flow

**File:** `src/lib/auth/detect-personas.ts`

```typescript
/**
 * Detects all personas available to a user based on their relationships
 * in the database. Called on login and when switching personas.
 */
export async function detectUserPersonas(userId: string): Promise<UserPersona[]> {
  const personas: UserPersona[] = []
  const supabase = createServiceClient()

  // 1. Check profile.role for internal personas (CEO, staff)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profile?.role === 'staff_admin') {
    personas.push({
      type: 'ceo',
      label: 'CEO',
      permissions: ['all']
    })
  }

  // 2. Check investor_users for Investor persona
  const { data: investorLinks } = await supabase
    .from('investor_users')
    .select('investor_id, investors(name)')
    .eq('user_id', userId)

  if (investorLinks?.length) {
    // User can be linked to multiple investor entities
    for (const link of investorLinks) {
      personas.push({
        type: 'investor',
        label: 'Investor',
        entityId: link.investor_id,
        entityName: link.investors?.name,
        permissions: ['view_portfolio', 'view_deals', 'subscribe', 'sign_docs']
      })
    }
  }

  // 3. Check introducers for Introducer persona
  const { data: introducerLink } = await supabase
    .from('introducers')
    .select('id, legal_name')
    .eq('user_id', userId)
    .maybeSingle()

  if (introducerLink) {
    personas.push({
      type: 'introducer',
      label: 'Introducer',
      entityId: introducerLink.id,
      entityName: introducerLink.legal_name,
      permissions: ['view_introductions', 'view_commissions', 'sign_agreements']
    })
  }

  // 4. Check arranger_users for Arranger persona
  const { data: arrangerLinks } = await supabase
    .from('arranger_users')
    .select('arranger_entity_id, arranger_entities(legal_name)')
    .eq('user_id', userId)

  if (arrangerLinks?.length) {
    for (const link of arrangerLinks) {
      personas.push({
        type: 'arranger',
        label: 'Arranger',
        entityId: link.arranger_entity_id,
        entityName: link.arranger_entities?.legal_name,
        permissions: ['view_deals', 'structure_deals']
      })
    }
  }

  // 5. Check deal_memberships for Participant persona (lawyers, advisors)
  const { data: memberships } = await supabase
    .from('deal_memberships')
    .select('deal_id, role')
    .eq('user_id', userId)
    .in('role', ['lawyer', 'advisor', 'banker', 'spouse'])

  if (memberships?.length) {
    personas.push({
      type: 'participant',
      label: 'Deal Participant',
      permissions: ['view_assigned_deals', 'view_deal_documents', 'sign_docs']
    })
  }

  return personas
}

/**
 * Determines the primary (default) persona for a user.
 * Priority: CEO > Arranger > Investor > Introducer > Participant
 */
export function determinePrimaryPersona(personas: UserPersona[]): PortalPersona {
  const priority: PortalPersona[] = ['ceo', 'arranger', 'investor', 'introducer', 'participant']

  for (const p of priority) {
    if (personas.some(persona => persona.type === p)) {
      return p
    }
  }

  return 'investor' // Fallback
}
```

### 6.3.3 Middleware Update

**File:** `src/middleware.ts` (key changes)

```typescript
// NEW: Persona-based routing
async function getRouteAccessForPersona(
  pathname: string,
  personas: UserPersona[]
): Promise<boolean> {

  const personaTypes = personas.map(p => p.type)

  // Route-to-persona mapping
  const routePersonaMap: Record<string, PortalPersona[]> = {
    '/versoholdings': ['investor'],
    '/introducer': ['introducer'],
    '/participant': ['participant'],
    '/versotech/staff': ['ceo', 'arranger'],
    '/versotech_admin': ['ceo', 'admin']
  }

  for (const [route, allowedPersonas] of Object.entries(routePersonaMap)) {
    if (pathname.startsWith(route)) {
      return allowedPersonas.some(p => personaTypes.includes(p))
    }
  }

  return false
}

// In the main middleware function:
export async function middleware(request: NextRequest) {
  // ... existing auth checks ...

  // NEW: Detect personas
  const personas = await detectUserPersonas(user.id)

  // NEW: Check route access by persona
  const hasAccess = await getRouteAccessForPersona(pathname, personas)

  if (!hasAccess) {
    // Redirect to appropriate portal based on primary persona
    const primary = determinePrimaryPersona(personas)
    const redirectMap: Record<PortalPersona, string> = {
      investor: '/versoholdings',
      introducer: '/introducer',
      participant: '/participant',
      ceo: '/versotech/staff',
      arranger: '/versotech/staff',
      admin: '/versotech_admin'
    }
    return NextResponse.redirect(new URL(redirectMap[primary], request.url))
  }

  // ... continue to page ...
}
```

## 6.4 Database Changes

### 6.4.1 New Table: arranger_users

**Migration:** `supabase/migrations/YYYYMMDD_add_arranger_users.sql`

```sql
-- =============================================================================
-- ARRANGER USERS JUNCTION TABLE
-- Links user profiles to arranger entities (many-to-many relationship)
-- An arranger entity (company) can have multiple user accounts
-- A user could theoretically work for multiple arranger entities
-- =============================================================================

CREATE TABLE public.arranger_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  arranger_entity_id UUID NOT NULL REFERENCES public.arranger_entities(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin', 'member', 'viewer'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),

  -- Prevent duplicate links
  CONSTRAINT arranger_users_unique UNIQUE (user_id, arranger_entity_id)
);

-- Indexes for common queries
CREATE INDEX arranger_users_user_id_idx ON public.arranger_users(user_id);
CREATE INDEX arranger_users_entity_id_idx ON public.arranger_users(arranger_entity_id);

-- RLS Policies
ALTER TABLE public.arranger_users ENABLE ROW LEVEL SECURITY;

-- Users can see their own arranger links
CREATE POLICY "arranger_users_self_select" ON public.arranger_users
  FOR SELECT USING (user_id = auth.uid());

-- Staff admin can manage all arranger users
CREATE POLICY "arranger_users_admin_all" ON public.arranger_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'staff_admin'
    )
  );

-- Comments
COMMENT ON TABLE public.arranger_users IS
  'Junction table linking user profiles to arranger entities for persona detection';
COMMENT ON COLUMN public.arranger_users.role IS
  'Role within the arranger entity: admin, member, or viewer';
```

### 6.4.2 New RLS Policies

**Migration:** `supabase/migrations/YYYYMMDD_add_persona_rls_policies.sql`

```sql
-- =============================================================================
-- RLS POLICIES FOR PERSONA-BASED ACCESS
-- These policies enable self-service for introducers and deal participants
-- =============================================================================

-- -----------------------------------------------------------------------------
-- INTRODUCER SELF-SERVICE POLICIES
-- Allow introducers to see their own data
-- -----------------------------------------------------------------------------

-- Introducers can see their own introductions
CREATE POLICY "introductions_self_select" ON public.introductions
  FOR SELECT USING (
    introducer_id IN (
      SELECT id FROM public.introducers
      WHERE user_id = auth.uid()
    )
  );

-- Introducers can see their own commissions
CREATE POLICY "introducer_commissions_self_select" ON public.introducer_commissions
  FOR SELECT USING (
    introducer_id IN (
      SELECT id FROM public.introducers
      WHERE user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- PARTICIPANT (LAWYER/ADVISOR) ACCESS POLICIES
-- Allow deal participants to see deals they're assigned to
-- -----------------------------------------------------------------------------

-- Participants can see data room access records for their deals
CREATE POLICY "deal_data_room_access_participant_select" ON public.deal_data_room_access
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.deal_memberships dm
      WHERE dm.deal_id = deal_data_room_access.deal_id
        AND dm.user_id = auth.uid()
        AND dm.role IN ('lawyer', 'advisor', 'banker', 'spouse', 'viewer')
    )
  );

-- Participants can see data room documents for their deals
CREATE POLICY "deal_data_room_documents_participant_select" ON public.deal_data_room_documents
  FOR SELECT USING (
    visible_to_investors = true  -- Same visibility as investors for now
    AND EXISTS (
      SELECT 1 FROM public.deal_memberships dm
      WHERE dm.deal_id = deal_data_room_documents.deal_id
        AND dm.user_id = auth.uid()
        AND dm.role IN ('lawyer', 'advisor', 'banker', 'spouse', 'viewer')
    )
  );

-- Comments
COMMENT ON POLICY "introductions_self_select" ON public.introductions IS
  'Allows introducers to view their own referral records';
COMMENT ON POLICY "introducer_commissions_self_select" ON public.introducer_commissions IS
  'Allows introducers to view their own commission records';
COMMENT ON POLICY "deal_data_room_access_participant_select" ON public.deal_data_room_access IS
  'Allows deal participants (lawyers, advisors) to see data room access for assigned deals';
COMMENT ON POLICY "deal_data_room_documents_participant_select" ON public.deal_data_room_documents IS
  'Allows deal participants to view data room documents for assigned deals';
```

## 6.5 Component Architecture

### 6.5.1 New Components Summary

| Component | Purpose | Phase |
|-----------|---------|-------|
| `JourneyBar` | Investment progress indicator | Phase 2 |
| `NotificationCenter` | Unified notifications dropdown | Phase 2 |
| `PersonaSwitcher` | Role switching dropdown | Phase 1 |
| `ThemeToggle` | Light/dark/system selector | Phase 1 |
| `CEOInbox` | Merged approvals + messages | Phase 5 |
| `ConsolidatedUsers` | Tabbed user management | Phase 5 |
| `IntroducerDashboard` | Introducer self-service home | Phase 3 |
| `ParticipantDeals` | Lawyer/advisor deal list | Phase 4 |

### 6.5.2 Component Hierarchy

```
src/components/
├── layout/
│   ├── app-layout.tsx           # Main layout wrapper
│   ├── sidebar.tsx              # Navigation sidebar (UPDATE)
│   ├── header.tsx               # Top header bar (UPDATE)
│   ├── user-menu.tsx            # User dropdown (UPDATE)
│   └── persona-switcher.tsx     # NEW: Role switcher
│
├── theme/
│   ├── theme-provider.tsx       # NEW: Theme context
│   └── theme-toggle.tsx         # NEW: UI toggle
│
├── notification-center/
│   ├── notification-center.tsx  # NEW: Unified notifications
│   ├── notification-item.tsx    # NEW: Individual notification
│   └── notification-badge.tsx   # NEW: Unread count badge
│
├── deals/
│   ├── journey-bar.tsx          # NEW: Progress indicator
│   ├── deal-detail-client.tsx   # UPDATE: Embed data room
│   └── deal-data-room-tab.tsx   # NEW: Data room as tab
│
├── inbox/
│   ├── ceo-inbox.tsx            # NEW: Merged inbox
│   ├── approval-item.tsx        # UPDATE: Reuse existing
│   └── message-item.tsx         # UPDATE: Reuse existing
│
├── introducer/
│   ├── introducer-dashboard.tsx # NEW: Introducer home
│   ├── introductions-list.tsx   # NEW: Referral list
│   ├── commissions-list.tsx     # NEW: Commission list
│   └── fee-model-viewer.tsx     # NEW: Fee visibility
│
└── participant/
    ├── participant-deals.tsx    # NEW: Assigned deals
    └── participant-documents.tsx # NEW: Available docs
```

---

# 7. IMPLEMENTATION PHASES

## 7.0 PHASE 0: STABILIZATION (Required)

**Duration:** 1 week
**Effort:** 15-20 hours
**Risk if Skipped:** HIGH - bugs will multiply in later phases

### 7.0.1 Objectives

Fix existing broken features before restructuring:
- Broken notification links
- Missing API endpoints
- Security gaps
- RLS policy gaps

### 7.0.2 Deliverables

| Deliverable | Description | File(s) | Effort |
|-------------|-------------|---------|--------|
| Fix deal invite URL | Change `/deals/` to `/deal/` in notification | `api/deals/[id]/members/route.ts:236` | 30min |
| Implement report-requests API | Create missing endpoint OR remove button | `api/report-requests/route.ts` (new) OR `components/holdings/quick-actions-menu.tsx` | 2-3h |
| Add invite acceptance page | Handle `/invite/[token]` URLs | `app/(public)/invite/[token]/page.tsx` | 4-6h |
| Enforce profile.deleted_at | Block deactivated users in middleware | `middleware.ts` | 1h |
| Add introducer RLS policies | Self-read for introductions/commissions | `migrations/XXXX_introducer_self_policies.sql` | 2h |
| Add participant RLS policies | Data room access for lawyers/advisors | `migrations/XXXX_participant_policies.sql` | 2h |
| Testing & validation | Verify all fixes work correctly | - | 2h |

### 7.0.3 Technical Details

**Fix 1: Deal Invite URL**

```typescript
// BEFORE (wrong)
link: `/versoholdings/deals/${dealId}`,

// AFTER (correct)
link: `/versoholdings/deal/${dealId}`,
```

**Fix 2: Profile Deletion Enforcement**

```typescript
// In middleware.ts, after getting profile:
if (profile.deleted_at) {
  // Clear session
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/login?error=account_deactivated', request.url))
}
```

**Fix 3: Invite Acceptance Page**

```typescript
// app/(public)/invite/[token]/page.tsx
export default async function InviteAcceptPage({ params }: { params: { token: string } }) {
  const supabase = await createClient()

  // Validate token
  const { data: invite } = await supabase
    .from('invite_links')
    .select('*, deals(*)')
    .eq('token', params.token)
    .gt('expires_at', new Date().toISOString())
    .is('accepted_at', null)
    .single()

  if (!invite) {
    return <InvalidInvitePage />
  }

  // If logged in, accept invite
  // If not logged in, redirect to login then back here

  return <AcceptInviteForm invite={invite} />
}
```

### 7.0.4 Acceptance Criteria

- [ ] Deal invite emails contain working links
- [ ] Report request button either works or is removed
- [ ] Invite links can be accepted via dedicated page
- [ ] Deactivated users cannot access the system
- [ ] Introducers can query their own introductions via RLS
- [ ] Participants can query deal documents via RLS

---

## 7.1 PHASE 1: FOUNDATION

**Duration:** 2 weeks
**Effort:** 25-30 hours
**Risk:** HIGH (core authentication)
**Dependencies:** Phase 0 complete

### 7.1.1 Objectives

Build the persona detection and routing infrastructure that all other phases depend on:
- Persona detection system
- Middleware routing updates
- Theme system
- Database table for arranger users

### 7.1.2 Deliverables

| Deliverable | Description | Effort |
|-------------|-------------|--------|
| Persona types definition | TypeScript types for personas | 2h |
| Persona detection function | Query all persona sources | 4h |
| Middleware update | Persona-based routing | 6h |
| Arranger users migration | New junction table | 2h |
| Theme provider | Light/dark/system toggle | 4h |
| Theme toggle UI | User menu integration | 2h |
| Persona switcher UI | Role dropdown in header | 4h |
| Testing & validation | All persona combinations | 4h |

### 7.1.3 Key Files

**New files:**
```
src/types/persona.ts
src/lib/auth/detect-personas.ts
src/components/theme/theme-provider.tsx
src/components/theme/theme-toggle.tsx
src/components/layout/persona-switcher.tsx
supabase/migrations/YYYYMMDD_add_arranger_users.sql
```

**Modified files:**
```
src/middleware.ts
src/components/layout/user-menu.tsx
src/components/layout/app-layout.tsx
src/app/layout.tsx (wrap with ThemeProvider)
```

### 7.1.4 Testing Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| User with Investor only | Access /versoholdings, blocked from /introducer |
| User with Introducer only | Access /introducer, blocked from /versoholdings |
| User with both (Partner) | Access both, can switch between views |
| User with CEO role | Access /versotech/staff and /versotech_admin |
| User with deal membership | Access /participant for assigned deals |
| Theme toggle | Changes persist across sessions |
| Persona switch | Changes active persona cookie |

### 7.1.5 Acceptance Criteria

- [ ] All 7 personas are correctly detected
- [ ] Hybrid users can switch between roles
- [ ] Middleware routes to correct portal based on persona
- [ ] Theme preference persists across sessions
- [ ] arranger_users table exists with RLS
- [ ] No regression in existing functionality

---

## 7.2 PHASE 2: INVESTOR UX IMPROVEMENTS

**Duration:** 1 week
**Effort:** 15-20 hours
**Risk:** MEDIUM
**Dependencies:** Phase 1 complete

### 7.2.1 Objectives

Enhance investor experience without breaking existing functionality:
- Visual progress through investment journey
- Unified notifications in header
- Embedded data room in deal flow
- Navigation simplification

### 7.2.2 Deliverables

| Deliverable | Description | Effort |
|-------------|-------------|--------|
| Journey progress bar | Visual indicator on deal detail | 4h |
| Notification center | Header dropdown, grouped by deal | 6h |
| Data room tab | Embed in deal detail page | 4h |
| Sidebar cleanup | Remove Tasks, Notifications items | 1h |
| Rename navigation | "Active Deals" → "Investment Opportunities" | 30min |
| Rename navigation | "Reports" → "Documents" | 30min |
| Testing & validation | All investor flows work | 3h |

### 7.2.3 Journey Bar Implementation

**Component:** `src/components/deals/journey-bar.tsx`

```typescript
interface JourneyBarProps {
  dealId: string
  investorId: string
}

type JourneyStage =
  | 'interest'      // Expressed interest
  | 'nda'           // Signed NDA
  | 'dataroom'      // Accessing data room
  | 'subscription'  // Submitted subscription
  | 'funding'       // Wired funds
  | 'active'        // Investment active

export function JourneyBar({ dealId, investorId }: JourneyBarProps) {
  const stages: { key: JourneyStage; label: string }[] = [
    { key: 'interest', label: 'Interest' },
    { key: 'nda', label: 'NDA' },
    { key: 'dataroom', label: 'Data Room' },
    { key: 'subscription', label: 'Subscribe' },
    { key: 'funding', label: 'Funding' },
    { key: 'active', label: 'Active' },
  ]

  const currentStage = useJourneyStage(dealId, investorId)

  return (
    <div className="flex items-center justify-between w-full">
      {stages.map((stage, index) => (
        <JourneyStageIndicator
          key={stage.key}
          stage={stage}
          status={getStageStatus(stage.key, currentStage)}
          isLast={index === stages.length - 1}
        />
      ))}
    </div>
  )
}
```

### 7.2.4 Notification Center Implementation

**Component:** `src/components/notification-center/notification-center.tsx`

```typescript
export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead } = useNotifications()

  // Group notifications by deal
  const grouped = groupBy(notifications, n => n.deal_id ?? 'general')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1">{unreadCount}</Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-96" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {Object.entries(grouped).map(([dealId, items]) => (
          <NotificationGroup key={dealId} dealId={dealId} items={items} />
        ))}

        {notifications.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            No notifications
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 7.2.5 Acceptance Criteria

- [ ] Journey bar shows correct stage for each deal
- [ ] Notifications grouped by deal in header dropdown
- [ ] Data room tab appears when investor has access
- [ ] Tasks/Notifications removed from sidebar
- [ ] Navigation labels updated
- [ ] No regression in existing investor functionality

---

## 7.3 PHASE 3: INTRODUCER SELF-SERVICE

**Duration:** 1.5 weeks
**Effort:** 20-25 hours
**Risk:** MEDIUM
**Dependencies:** Phase 0 (RLS), Phase 1 (auth)

### 7.3.1 Objectives

Enable introducers to view their own data without staff assistance:
- Introducer portal with dashboard
- View introductions and their status
- View commissions and payment status
- View fee models per opportunity

### 7.3.2 Deliverables

| Deliverable | Description | Effort |
|-------------|-------------|--------|
| Introducer route group | New route group for introducer portal | 2h |
| Introducer layout | Sidebar, header for introducer view | 2h |
| Dashboard page | KPIs, recent activity | 4h |
| Introductions list | All referrals with status | 4h |
| Introduction detail | Individual referral view | 2h |
| Commissions list | All commissions with status | 4h |
| Commission detail | Individual commission view | 2h |
| Fee models page | View fee structures (read-only) | 2h |
| Staff API update | Accept user_id on introducer creation | 1h |
| Testing & validation | All introducer flows work | 3h |

### 7.3.3 Route Structure

```
src/app/(introducer)/
├── introducer/
│   ├── layout.tsx                    # Introducer-specific layout
│   ├── page.tsx                      # Dashboard
│   ├── introductions/
│   │   ├── page.tsx                  # List all introductions
│   │   └── [id]/
│   │       └── page.tsx              # Introduction detail
│   ├── commissions/
│   │   ├── page.tsx                  # List all commissions
│   │   └── [id]/
│   │       └── page.tsx              # Commission detail
│   ├── fees/
│   │   └── page.tsx                  # Fee models
│   └── agreements/
│       └── page.tsx                  # Agreements to sign
```

### 7.3.4 Dashboard Implementation

```typescript
// src/app/(introducer)/introducer/page.tsx
export default async function IntroducerDashboard() {
  const user = await getCurrentUser()

  // Get introducer record linked to this user
  const { data: introducer } = await supabase
    .from('introducers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!introducer) {
    return <NoIntroducerProfile />
  }

  // Get summary stats
  const [introductions, commissions] = await Promise.all([
    supabase.from('introductions').select('*').eq('introducer_id', introducer.id),
    supabase.from('introducer_commissions').select('*').eq('introducer_id', introducer.id)
  ])

  const stats = {
    totalIntroductions: introductions.data?.length ?? 0,
    allocatedCount: introductions.data?.filter(i => i.status === 'allocated').length ?? 0,
    totalCommissions: commissions.data?.reduce((sum, c) => sum + (c.accrual_amount ?? 0), 0) ?? 0,
    pendingCommissions: commissions.data?.filter(c => c.status === 'accrued').length ?? 0,
    paidCommissions: commissions.data?.filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + (c.accrual_amount ?? 0), 0) ?? 0
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {introducer.contact_name}</h1>

      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Referrals" value={stats.totalIntroductions} />
        <StatCard title="Allocated" value={stats.allocatedCount} />
        <StatCard title="Total Earned" value={formatCurrency(stats.totalCommissions)} />
        <StatCard title="Paid" value={formatCurrency(stats.paidCommissions)} />
      </div>

      <RecentActivity introducerId={introducer.id} />
    </div>
  )
}
```

### 7.3.5 Staff API Update

```typescript
// src/app/api/staff/introducers/route.ts
// Add user_id to the schema and insert

const createIntroducerSchema = z.object({
  legal_name: z.string().min(1),
  contact_name: z.string().min(1),
  email: z.string().email(),
  default_commission_bps: z.number().min(0).max(300).optional(),
  // NEW: Optional link to user profile
  user_id: z.string().uuid().optional().nullable(),
})

// In POST handler:
const insertData = {
  legal_name: body.legal_name,
  contact_name: body.contact_name,
  email: body.email,
  default_commission_bps: body.default_commission_bps ?? 100,
  user_id: body.user_id ?? null,  // NEW
  created_by: user.id,
}
```

### 7.3.6 Acceptance Criteria

- [ ] Introducers can log in and see introducer dashboard
- [ ] Introductions list shows all referrals with correct status
- [ ] Commissions list shows earnings with payment status
- [ ] Fee models are visible (read-only)
- [ ] Staff can link introducer to user account
- [ ] Hybrid users (Partner) can switch to introducer view
- [ ] No access to other introducers' data (RLS enforced)

---

## 7.4 PHASE 4: PARTICIPANT ACCESS (LAWYERS/ADVISORS)

**Duration:** 1 week
**Effort:** 15-20 hours
**Risk:** HIGH (new access pattern)
**Dependencies:** Phase 0 (RLS), Phase 1 (auth)

### 7.4.1 Objectives

Enable lawyers, advisors, and other deal participants to access their assigned deals:
- Participant portal for deal access
- View deals they're invited to
- Access deal documents
- Sign documents when required

### 7.4.2 Deliverables

| Deliverable | Description | Effort |
|-------------|-------------|--------|
| Participant route group | New route group for participants | 2h |
| Participant layout | Simple layout for external partners | 2h |
| My deals page | List of assigned deals | 4h |
| Deal detail page | Deal info for participants | 4h |
| Documents page | Accessible documents | 3h |
| Middleware integration | Allow participant routes | 2h |
| Testing & validation | All participant flows work | 3h |

### 7.4.3 Route Structure

```
src/app/(participant)/
├── participant/
│   ├── layout.tsx                    # Participant layout
│   ├── page.tsx                      # My deals list
│   └── deals/
│       └── [id]/
│           ├── page.tsx              # Deal detail
│           └── documents/
│               └── page.tsx          # Available documents
```

### 7.4.4 My Deals Page Implementation

```typescript
// src/app/(participant)/participant/page.tsx
export default async function ParticipantDeals() {
  const user = await getCurrentUser()

  // Get deals where user is a participant
  const { data: memberships } = await supabase
    .from('deal_memberships')
    .select(`
      deal_id,
      role,
      invited_at,
      accepted_at,
      deals (
        id,
        name,
        status,
        target_close_date,
        description
      )
    `)
    .eq('user_id', user.id)
    .in('role', ['lawyer', 'advisor', 'banker', 'spouse', 'viewer'])

  if (!memberships?.length) {
    return <NoAssignedDeals />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Deals</h1>
      <p className="text-muted-foreground">
        Deals you have been invited to participate in
      </p>

      <div className="grid gap-4">
        {memberships.map(membership => (
          <DealCard
            key={membership.deal_id}
            deal={membership.deals}
            role={membership.role}
            invitedAt={membership.invited_at}
          />
        ))}
      </div>
    </div>
  )
}
```

### 7.4.5 Document Access Implementation

```typescript
// src/app/(participant)/participant/deals/[id]/documents/page.tsx
export default async function ParticipantDocuments({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  const dealId = params.id

  // Verify user has access to this deal
  const { data: membership } = await supabase
    .from('deal_memberships')
    .select('role')
    .eq('deal_id', dealId)
    .eq('user_id', user.id)
    .in('role', ['lawyer', 'advisor', 'banker', 'spouse', 'viewer'])
    .single()

  if (!membership) {
    notFound()
  }

  // Get documents visible to participants
  // Uses the RLS policy we added in Phase 0
  const { data: documents } = await supabase
    .from('deal_data_room_documents')
    .select('*')
    .eq('deal_id', dealId)
    .eq('visible_to_investors', true)  // Or add participant visibility flag
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Deal Documents</h1>
      <p className="text-muted-foreground">
        Documents available for your review as {membership.role}
      </p>

      <DocumentList documents={documents ?? []} />
    </div>
  )
}
```

### 7.4.6 Acceptance Criteria

- [ ] Lawyers/advisors can log in and see assigned deals
- [ ] Deal detail page shows relevant information
- [ ] Documents are accessible based on RLS policies
- [ ] Users without deal memberships cannot access
- [ ] Middleware correctly routes to participant portal
- [ ] Document download works correctly

---

## 7.5 PHASE 5: CEO TOOLS CONSOLIDATION

**Duration:** 1 week
**Effort:** 15 hours
**Risk:** LOW
**Dependencies:** Phase 1

### 7.5.1 Objectives

Improve staff efficiency by consolidating user management and inbox:
- Single "Users" page with tabs for all user types
- Merged inbox with approvals and messages
- Improved navigation flow

### 7.5.2 Deliverables

| Deliverable | Description | Effort |
|-------------|-------------|--------|
| Consolidated users page | Tabbed view of all user types | 6h |
| CEO inbox component | Merged approvals + messages | 6h |
| Sidebar update | Replace multiple items with consolidated | 1h |
| Testing & validation | Staff workflows unbroken | 2h |

### 7.5.3 Consolidated Users Page

```typescript
// src/app/(staff)/versotech/staff/users/page.tsx
export default async function ConsolidatedUsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>

      <Tabs defaultValue="investors">
        <TabsList>
          <TabsTrigger value="investors">Investors</TabsTrigger>
          <TabsTrigger value="introducers">Introducers</TabsTrigger>
          <TabsTrigger value="arrangers">Arrangers</TabsTrigger>
          <TabsTrigger value="all">All Users</TabsTrigger>
        </TabsList>

        <TabsContent value="investors">
          <InvestorsTab />
        </TabsContent>

        <TabsContent value="introducers">
          <IntroducersTab />
        </TabsContent>

        <TabsContent value="arrangers">
          <ArrangersTab />
        </TabsContent>

        <TabsContent value="all">
          <AllUsersTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### 7.5.4 CEO Inbox Implementation

```typescript
// src/components/inbox/ceo-inbox.tsx
export function CEOInbox() {
  const [activeTab, setActiveTab] = useState<'all' | 'approvals' | 'messages'>('all')

  const { approvals, messages, loading } = useInboxData()

  // Merge and sort by priority/date
  const allItems = useMemo(() => {
    const items = [
      ...approvals.map(a => ({ ...a, type: 'approval' as const })),
      ...messages.map(m => ({ ...m, type: 'message' as const }))
    ]
    return sortByPriorityAndDate(items)
  }, [approvals, messages])

  const filteredItems = activeTab === 'all'
    ? allItems
    : allItems.filter(item => item.type === activeTab.slice(0, -1)) // 'approvals' -> 'approval'

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveTab('all')}
        >
          All ({allItems.length})
        </Button>
        <Button
          variant={activeTab === 'approvals' ? 'default' : 'outline'}
          onClick={() => setActiveTab('approvals')}
        >
          Approvals ({approvals.length})
        </Button>
        <Button
          variant={activeTab === 'messages' ? 'default' : 'outline'}
          onClick={() => setActiveTab('messages')}
        >
          Messages ({messages.length})
        </Button>
      </div>

      <div className="space-y-2">
        {filteredItems.map(item => (
          item.type === 'approval'
            ? <ApprovalItem key={item.id} approval={item} />
            : <MessageItem key={item.id} message={item} />
        ))}
      </div>
    </div>
  )
}
```

### 7.5.5 Acceptance Criteria

- [ ] Users page shows all user types in tabs
- [ ] Inbox shows approvals and messages together
- [ ] Priority sorting works correctly
- [ ] Existing staff workflows still function
- [ ] Navigation is cleaner with fewer sidebar items

---

## 7.6 PHASE 6: ADMIN PORTAL CARVE-OUT

**Duration:** 0.5 weeks
**Effort:** 10 hours
**Risk:** LOW
**Dependencies:** Phase 1, Phase 5

### 7.6.1 Objectives

Create dedicated admin section for platform management:
- Dedicated admin route group
- Platform settings page
- Placeholder for future growth/CMS features

### 7.6.2 Deliverables

| Deliverable | Description | Effort |
|-------------|-------------|--------|
| Admin route group | New route group with layout | 2h |
| Admin dashboard | Platform metrics overview | 3h |
| Settings page | Platform configuration | 3h |
| Placeholder pages | CMS, Growth (future) | 1h |
| Middleware protection | CEO-only access | 1h |

### 7.6.3 Route Structure

```
src/app/(admin)/
├── versotech_admin/
│   ├── layout.tsx                    # Admin layout with access check
│   ├── page.tsx                      # Redirect to dashboard
│   ├── dashboard/
│   │   └── page.tsx                  # Platform metrics
│   ├── settings/
│   │   └── page.tsx                  # Platform settings
│   ├── users/
│   │   └── page.tsx                  # User management (all)
│   ├── cms/
│   │   └── page.tsx                  # Marketing CMS (placeholder)
│   └── growth/
│       └── page.tsx                  # Growth analytics (placeholder)
```

### 7.6.4 Acceptance Criteria

- [ ] Admin routes accessible at /versotech_admin
- [ ] Only CEO role can access admin portal
- [ ] Dashboard shows platform metrics
- [ ] Settings page allows configuration
- [ ] Placeholder pages ready for future development

---

# 8. RISK ASSESSMENT & MITIGATION

## 8.1 Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Persona detection bugs | Medium | High | Extensive testing, fallback to legacy role |
| Breaking existing investor flows | Medium | High | Feature flags, parallel routes during transition |
| RLS policy mistakes | Low | Critical | Thorough testing, rollback plan |
| Theme persistence issues | Low | Low | localStorage + DB backup |
| User confusion during transition | Medium | Medium | In-app guidance, phased rollout |
| Performance degradation | Low | Medium | Monitor query times, index optimization |

## 8.2 Mitigation Strategies

### 8.2.1 Feature Flags

```typescript
// src/lib/feature-flags.ts
export const FEATURE_FLAGS = {
  PERSONA_SYSTEM: process.env.FEATURE_PERSONA_SYSTEM === 'true',
  UNIFIED_NOTIFICATIONS: process.env.FEATURE_UNIFIED_NOTIFICATIONS === 'true',
  INTRODUCER_PORTAL: process.env.FEATURE_INTRODUCER_PORTAL === 'true',
  PARTICIPANT_ACCESS: process.env.FEATURE_PARTICIPANT_ACCESS === 'true',
}

// Usage in components:
if (FEATURE_FLAGS.PERSONA_SYSTEM) {
  // New behavior
} else {
  // Legacy behavior
}
```

### 8.2.2 Parallel Routes Strategy

During Phase 1-2:
- Keep existing routes working unchanged
- Build new routes alongside
- Test thoroughly with internal users
- Switch over with feature flag
- Remove old routes after validation

### 8.2.3 Rollback Plan

Each phase has a defined rollback procedure:

| Phase | Rollback Procedure | Time Required |
|-------|-------------------|---------------|
| Phase 0 | Revert migration + code changes | 30 minutes |
| Phase 1 | Disable persona system via feature flag | 5 minutes |
| Phase 2 | Restore sidebar items, revert header | 1 hour |
| Phase 3 | Remove introducer routes, disable feature | 30 minutes |
| Phase 4 | Remove participant routes, disable feature | 30 minutes |
| Phase 5 | Restore separate pages | 1 hour |
| Phase 6 | Remove admin routes | 30 minutes |

## 8.3 Performance Considerations

### 8.3.1 Persona Detection Optimization

```typescript
// Cache persona detection results in session
async function getOrDetectPersonas(userId: string): Promise<UserPersona[]> {
  const cacheKey = `personas:${userId}`

  // Check cache first
  const cached = await sessionStorage.get(cacheKey)
  if (cached) return cached

  // Detect and cache
  const personas = await detectUserPersonas(userId)
  await sessionStorage.set(cacheKey, personas, { ttl: 300 }) // 5 min cache

  return personas
}
```

### 8.3.2 Database Indexes

Ensure these indexes exist for persona detection queries:

```sql
-- For introducer lookup
CREATE INDEX IF NOT EXISTS introducers_user_id_idx ON introducers(user_id);

-- For arranger lookup
CREATE INDEX IF NOT EXISTS arranger_users_user_id_idx ON arranger_users(user_id);

-- For deal membership lookup
CREATE INDEX IF NOT EXISTS deal_memberships_user_id_idx ON deal_memberships(user_id);
CREATE INDEX IF NOT EXISTS deal_memberships_user_role_idx ON deal_memberships(user_id, role);
```

---

# 9. ACCEPTANCE CRITERIA

## 9.1 Overall Success Criteria

The Phase 2 project is considered complete when:

1. **All 7 user personas can access their appropriate portal**
2. **Hybrid users can switch between roles seamlessly**
3. **Introducers can self-serve their commission inquiries**
4. **Lawyers/advisors can access deals they're invited to**
5. **Staff have consolidated user management and inbox**
6. **No regression in existing investor or staff functionality**
7. **All broken features from Phase 0 are fixed**

## 9.2 Phase-by-Phase Acceptance

### Phase 0 Acceptance
- [ ] All 5 broken features fixed and tested
- [ ] RLS policies added and verified
- [ ] No new security vulnerabilities introduced

### Phase 1 Acceptance
- [ ] Persona detection works for all 7 personas
- [ ] Middleware correctly routes based on persona
- [ ] Theme toggle persists across sessions
- [ ] Persona switcher functional for hybrid users
- [ ] arranger_users table created with RLS

### Phase 2 Acceptance
- [ ] Journey bar displays correct stage
- [ ] Notifications unified in header
- [ ] Data room embedded in deal detail
- [ ] Navigation labels updated
- [ ] Investor flows unchanged or improved

### Phase 3 Acceptance
- [ ] Introducers can log in and see dashboard
- [ ] Introduction tracking visible
- [ ] Commission tracking visible
- [ ] Fee models visible
- [ ] Staff can link users to introducers

### Phase 4 Acceptance
- [ ] Participants can log in and see assigned deals
- [ ] Documents accessible per RLS
- [ ] Signing workflow functional
- [ ] Access correctly scoped to assigned deals only

### Phase 5 Acceptance
- [ ] Users page consolidates all types
- [ ] Inbox merges approvals and messages
- [ ] Priority sorting works
- [ ] Staff efficiency improved

### Phase 6 Acceptance
- [ ] Admin portal accessible at /versotech_admin
- [ ] CEO-only access enforced
- [ ] Settings functional
- [ ] Placeholders ready for future features

## 9.3 User Acceptance Testing Scenarios

### Scenario 1: Investor Only

```
Given: User "Alice" has investor_users link only
When: Alice logs in
Then: Alice sees /versoholdings portal
And: Alice cannot access /introducer routes
And: Alice sees journey bar on deal detail
And: Alice sees unified notifications in header
```

### Scenario 2: Introducer Only

```
Given: User "Bob" has introducers.user_id link only
When: Bob logs in
Then: Bob is redirected to /introducer portal
And: Bob cannot access /versoholdings routes
And: Bob sees his introductions list
And: Bob sees his commissions with status
```

### Scenario 3: Partner (Hybrid)

```
Given: User "Carol" has BOTH investor_users AND introducers links
When: Carol logs in
Then: Carol sees persona switcher in header
And: Carol can switch between "Investor" and "Introducer" views
And: Each view shows appropriate data
```

### Scenario 4: Lawyer

```
Given: User "David" has deal_memberships.role = 'lawyer'
When: David logs in
Then: David sees /participant portal
And: David sees only deals he's assigned to
And: David can access documents for those deals
And: David cannot see investor portfolios or introducer data
```

### Scenario 5: CEO

```
Given: User "Eve" has profile.role = 'staff_admin'
When: Eve logs in
Then: Eve sees /versotech/staff portal
And: Eve can access /versotech_admin
And: Eve sees consolidated Users page
And: Eve sees merged Inbox with approvals and messages
```

---

# 10. APPENDICES

## 10.1 Glossary

| Term | Definition |
|------|------------|
| **Persona** | A "hat" a user can wear; one user may have multiple personas |
| **Hybrid User** | A user with more than one persona (e.g., Partner = Investor + Introducer) |
| **Deal Membership** | Association between a user and a specific deal with a defined role |
| **RLS** | Row-Level Security - database policies that restrict data access |
| **Junction Table** | A table that links two entities (e.g., `investor_users` links `profiles` to `investors`) |
| **Route Group** | Next.js organizational pattern using parentheses: `(investor)/` |

## 10.2 Database Schema Reference

### Core Tables

```
profiles
├── id (UUID, PK)
├── email (TEXT)
├── full_name (TEXT)
├── role (ENUM: investor, staff_admin, staff_ops, staff_rm)
├── deleted_at (TIMESTAMPTZ, nullable)
└── preferences (JSONB)

investor_users
├── user_id (UUID, FK → profiles)
├── investor_id (UUID, FK → investors)
└── created_at (TIMESTAMPTZ)

introducers
├── id (UUID, PK)
├── user_id (UUID, FK → profiles, nullable) ← Key for self-service
├── legal_name (TEXT)
├── contact_name (TEXT)
├── email (TEXT)
├── default_commission_bps (INT)
└── status (ENUM: active, inactive, suspended)

arranger_users (NEW)
├── id (UUID, PK)
├── user_id (UUID, FK → profiles)
├── arranger_entity_id (UUID, FK → arranger_entities)
└── created_at (TIMESTAMPTZ)

deal_memberships
├── deal_id (UUID, FK → deals)
├── user_id (UUID, FK → profiles)
├── investor_id (UUID, FK → investors, nullable)
├── role (ENUM: investor, co_investor, spouse, advisor, lawyer, banker, introducer, viewer, verso_staff)
├── invited_at (TIMESTAMPTZ)
└── accepted_at (TIMESTAMPTZ)
```

## 10.3 API Endpoints Reference

### New/Modified Endpoints

| Method | Endpoint | Purpose | Phase |
|--------|----------|---------|-------|
| GET | `/api/personas` | Get current user's personas | Phase 1 |
| POST | `/api/personas/switch` | Switch active persona | Phase 1 |
| GET | `/api/introducer/introductions` | List introducer's referrals | Phase 3 |
| GET | `/api/introducer/commissions` | List introducer's commissions | Phase 3 |
| GET | `/api/participant/deals` | List participant's assigned deals | Phase 4 |
| PATCH | `/api/staff/introducers/:id` | Update introducer (now accepts user_id) | Phase 3 |
| POST | `/api/report-requests` | Create report request | Phase 0 |

## 10.4 File Change Summary

### New Files (28 files)

```
src/types/persona.ts
src/lib/auth/detect-personas.ts
src/lib/feature-flags.ts
src/components/theme/theme-provider.tsx
src/components/theme/theme-toggle.tsx
src/components/layout/persona-switcher.tsx
src/components/notification-center/notification-center.tsx
src/components/notification-center/notification-item.tsx
src/components/notification-center/notification-badge.tsx
src/components/deals/journey-bar.tsx
src/components/deals/deal-data-room-tab.tsx
src/components/inbox/ceo-inbox.tsx
src/app/(introducer)/introducer/layout.tsx
src/app/(introducer)/introducer/page.tsx
src/app/(introducer)/introducer/introductions/page.tsx
src/app/(introducer)/introducer/introductions/[id]/page.tsx
src/app/(introducer)/introducer/commissions/page.tsx
src/app/(introducer)/introducer/commissions/[id]/page.tsx
src/app/(introducer)/introducer/fees/page.tsx
src/app/(participant)/participant/layout.tsx
src/app/(participant)/participant/page.tsx
src/app/(participant)/participant/deals/[id]/page.tsx
src/app/(participant)/participant/deals/[id]/documents/page.tsx
src/app/(admin)/versotech_admin/layout.tsx
src/app/(admin)/versotech_admin/page.tsx
src/app/(admin)/versotech_admin/dashboard/page.tsx
src/app/(admin)/versotech_admin/settings/page.tsx
src/app/(public)/invite/[token]/page.tsx
```

### Modified Files (15 files)

```
src/middleware.ts
src/app/layout.tsx
src/components/layout/app-layout.tsx
src/components/layout/sidebar.tsx
src/components/layout/header.tsx
src/components/layout/user-menu.tsx
src/components/deals/deal-detail-client.tsx
src/app/api/deals/[id]/members/route.ts
src/app/api/staff/introducers/route.ts
src/app/(staff)/versotech/staff/users/page.tsx (consolidated)
```

### New Migrations (3 files)

```
supabase/migrations/YYYYMMDD_add_arranger_users.sql
supabase/migrations/YYYYMMDD_add_introducer_self_policies.sql
supabase/migrations/YYYYMMDD_add_participant_policies.sql
```

---

## 10.5 Sign-Off

### Client Approval

By signing below, the client confirms:
- [ ] Understanding of the scope as defined in this document
- [ ] Agreement with the phased approach and priorities
- [ ] Acceptance of the timeline and effort estimates
- [ ] Commitment to providing timely feedback during UAT

**Client Representative:** _________________________
**Date:** _________________________
**Signature:** _________________________

### Development Team Commitment

The development team commits to:
- [ ] Delivering phases as specified
- [ ] Maintaining existing functionality during transition
- [ ] Providing regular progress updates
- [ ] Completing thorough testing before each phase release

**Technical Lead:** _________________________
**Date:** _________________________
**Signature:** _________________________

---

*Document Version: 2.0*
*Last Updated: December 16, 2025*
*Status: Ready for Review*
