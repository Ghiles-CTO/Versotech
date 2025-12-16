# VERSOTECH Phase 2: Portal Restructuring Technical Plan

**Last Updated:** 2024-12-16
**Status:** CORRECTED - Scope reduced 60%, terminology fixed

---

## Executive Summary

Restructure the existing dual-portal system to support multiple user personas with hybrid capabilities. The Admin Portal stays within the same codebase using route groups.

**Key Outcomes:**
- Single login with persona-based navigation for: Investor, CEO, Arranger, Introducer, Lawyer
- Hybrid user support (one user can have Investor + Introducer roles)
- UI consolidations (Tasks+Notifications, Data Room integration, Profile restructuring)
- Light/dark theme toggle (user preference)
- Admin Portal at `/versotech_admin` (same codebase)

---

## CRITICAL SCOPE CORRECTIONS

### Removed from Scope (Not Built, Not Priority)

Based on gap analysis showing 60% of originally planned features aren't built:

| Feature | Reason |
|---------|--------|
| **Partner entity type** | 0% built, no database tables, not priority |
| **Commercial Partner entity type** | 0% built, no database tables, not priority |
| **GDPR Compliance Module** | Not in core user stories |
| **Check-in feature** | Not built across any persona |
| **Escrow Account Management** | Infrastructure missing |
| **Secondary sales / Resell** | Infrastructure missing |

### Terminology Corrections (IMPORTANT)

**Stop using "staff_*" terminology. Use correct user type names:**

| Old Code Term | Correct Term | Entity Table |
|---------------|--------------|--------------|
| `staff_admin` | **CEO** | profiles.role |
| `staff_ops` | **Arranger** | arranger_entities |
| `staff_rm` | **Lawyer** | deal_memberships.role='lawyer' |
| `investor` | **Investor** | investor_users |
| N/A | **Introducer** | introducers (user_id unused) |

---

## Architecture Decision: Admin Portal

**DECISION: Same Codebase with Route Groups**

The Admin Portal will be implemented as a new route group `(admin)/versotech_admin/*` within the existing Next.js application.

**Rationale:**
- Current dual-portal architecture (ADR-002) already proven effective
- 60%+ component reuse between portals
- Security boundary is at middleware/database level, not application level
- Single source of truth for types (`supabase.ts`), auth, utilities
- Simpler CI/CD with atomic deployments
- No coordination overhead between separate codebases

**When to reconsider:** If team scales to 10+ devs needing independent releases, or bundle exceeds 5MB.

---

## Phase Dependency Graph

```
                    ┌─────────────────────────────────────────────────────────────┐
                    │                    PHASE 2.0 (Foundation)                    │
                    │    Portal Skeleton + Persona-Aware Auth + Theme Toggle       │
                    │                                                              │
                    │  DB: Add arranger_users table ONLY                           │
                    │  Code: New routes, middleware, theme toggle                  │
                    │  MUST COMPLETE FIRST - All other phases depend on this       │
                    └───────────────────────────┬─────────────────────────────────┘
                                                │
        ┌───────────────────────────────────────┼───────────────────────────────────────┐
        │                                       │                                       │
        ▼                                       ▼                                       ▼
┌───────────────────┐               ┌───────────────────┐               ┌───────────────────┐
│    PHASE 2.1      │               │    PHASE 2.2      │               │    PHASE 2.3      │
│ Investor Journey  │               │ Tasks+Notif       │               │ Documents         │
│   Restructure     │               │ Header Panel      │               │ Simplification    │
│                   │               │                   │               │                   │
│ DB: None          │               │ DB: None          │               │ DB: None          │
│ CAN RUN PARALLEL  │               │ CAN RUN PARALLEL  │               │ CAN RUN PARALLEL  │
└─────────┬─────────┘               └─────────┬─────────┘               └─────────┬─────────┘
          │                                   │                                   │
          └───────────────────────────────────┼───────────────────────────────────┘
                                              │
                              ┌───────────────┴───────────────┐
                              │                               │
                              ▼                               ▼
                    ┌───────────────────┐         ┌───────────────────┐
                    │    PHASE 2.4      │         │    PHASE 2.5      │
                    │ Profile Tabs      │         │ CEO Tools         │
                    │ (KYC/Compliance)  │         │ Consolidation     │
                    │                   │         │                   │
                    │ DB: None          │         │ DB: None          │
                    └─────────┬─────────┘         └─────────┬─────────┘
                              │                             │
                              └──────────────┬──────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────┐
                              │        PHASE 2.6             │
                              │   Admin Portal Carve-Out     │
                              │                              │
                              │   DB: None                   │
                              │   Depends: 2.0, 2.5          │
                              └──────────────────────────────┘
```

---

## Phase 2.0: Foundation (MUST COMPLETE FIRST)

### Database Changes (Minimal)

**Only one new table required:**

```sql
CREATE TABLE arranger_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  arranger_entity_id UUID NOT NULL REFERENCES arranger_entities(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, arranger_entity_id)
);

-- RLS policies
ALTER TABLE arranger_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arranger_users_self" ON arranger_users
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "arranger_users_admin" ON arranger_users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('staff_admin'))
  );
```

**Why no other DB changes:**
- `investor_users` already exists and works
- `introducers.user_id` exists (just needs enabling in portal)
- Lawyers use `deal_memberships.role='lawyer'` (existing)

### New Types

**File: `src/types/persona.ts` (new)**

```typescript
export type PortalPersona =
  | 'investor'    // External - Portfolio management
  | 'ceo'         // Internal - Full control (replaces staff_admin)
  | 'arranger'    // Internal - Deal structuring (replaces staff_ops)
  | 'lawyer'      // External - Deal participant (replaces staff_rm for lawyers)
  | 'introducer'  // External - Deal referrer, commissions
  | 'admin';      // Internal - System administration

export interface UserPersona {
  type: PortalPersona;
  label: string;
  entityId?: string;
  entityName?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: string;  // Legacy profiles.role
  personas: UserPersona[];
  primaryPersona: PortalPersona;
  activePersona?: PortalPersona;
}
```

### Persona Detection Function

**File: `src/lib/auth.ts` (extend)**

```typescript
async function detectUserPersonas(userId: string): Promise<UserPersona[]> {
  const personas: UserPersona[] = [];

  // 1. Check profile.role for internal personas
  const profile = await getProfile(userId);
  if (profile.role === 'staff_admin') {
    personas.push({ type: 'ceo', label: 'CEO' });
  }

  // 2. Check investor_users for investor persona
  const investorLink = await checkInvestorUsers(userId);
  if (investorLink) {
    personas.push({ type: 'investor', label: 'Investor', entityId: investorLink.investor_id });
  }

  // 3. Check arranger_users for arranger persona
  const arrangerLink = await checkArrangerUsers(userId);
  if (arrangerLink) {
    personas.push({ type: 'arranger', label: 'Arranger', entityId: arrangerLink.arranger_entity_id });
  }

  // 4. Check introducers for introducer persona
  const introducerLink = await checkIntroducers(userId);
  if (introducerLink) {
    personas.push({ type: 'introducer', label: 'Introducer', entityId: introducerLink.id });
  }

  // 5. Check deal_memberships for lawyer persona
  const lawyerDeals = await checkDealMemberships(userId, 'lawyer');
  if (lawyerDeals.length > 0) {
    personas.push({ type: 'lawyer', label: 'Lawyer' });
  }

  return personas;
}
```

### Middleware Updates

**File: `src/middleware.ts`**
- Add `/versotech_main/*` and `/versotech_admin/*` route handling
- Implement persona detection (not just role-based)
- Keep legacy routes working with redirects
- Store active persona in cookie: `verso_active_persona`

### Theme System

**File: `src/components/theme-provider.tsx`**
- Default to light theme
- Support: 'light' | 'dark' | 'system'
- Store preference in localStorage + optionally profiles.preferences JSONB
- Remove brand-based theme forcing

**File: `src/components/layout/user-menu.tsx`**
- Add theme toggle: Light / Dark / System

### Critical Files
- `versotech-portal/src/middleware.ts` - Core routing
- `versotech-portal/src/lib/auth.ts` - Persona detection
- `versotech-portal/src/types/persona.ts` - New types
- `versotech-portal/src/components/theme-provider.tsx` - Theme system
- `versotech-portal/src/components/layout/app-layout.tsx` - Layout wrapper

---

## Phase 2.1: Investor Journey Restructure

**Dependencies:** Phase 2.0 only
**Database:** None

### Changes

1. **Rename "Active Deals" to "Investment Opportunities"**
   - File: `src/components/layout/sidebar.tsx`
   - File: `src/app/(investor)/versoholdings/deals/page.tsx`

2. **Journey Bar Component**
   - New file: `src/components/deals/journey-bar.tsx`
   - Progress: Interest → NDA → Data Room → Subscription → Funding → Active
   - Data sources: `investor_deal_interest`, `deal_data_room_access`, `deal_subscription_submissions`, `allocations`, `tasks`

3. **Pre-Investment Data Room Integration**
   - File: `src/components/deals/deal-detail-client.tsx`
   - Add "Data Room" tab directly in deal detail
   - Show documents when user has data room access

---

## Phase 2.2: Tasks + Notifications Header Panel

**Dependencies:** Phase 2.0 only
**Database:** None

### Changes

1. **Create Notification Center**
   - New file: `src/components/notification-center/notification-center.tsx`
   - Header dropdown combining tasks and notifications
   - Group by investment opportunity, then by type

2. **Update Sidebar**
   - File: `src/components/layout/sidebar.tsx`
   - Remove Tasks and Notifications items

3. **Update Layout**
   - File: `src/components/layout/app-layout.tsx`
   - Add NotificationCenter to header

---

## Phase 2.3: Documents Simplification

**Dependencies:** Phase 2.0 only
**Database:** None

### Changes

1. **Rename "Reports" to "Documents"**
   - File: `src/components/layout/sidebar.tsx`

2. **Merge report request functionality into Documents page**

---

## Phase 2.4: Profile Tab Restructuring

**Dependencies:** Phase 2.0, ideally after 2.2
**Database:** None

### Changes

**File: `src/components/profile/profile-page-client.tsx`**

Split "KYC & Onboarding" into:
- **KYC Tab**: Document uploads, status tracking
- **Compliance Tab**: Questionnaire, accreditation, risk declarations

Rename "Entities" to "Investment Entities"

---

## Phase 2.5: CEO Tools Consolidation

**Dependencies:** Phase 2.0
**Database:** None

### Changes

1. **Consolidated Users Page**
   - New file: `src/app/(staff)/versotech/staff/users/page.tsx`
   - Tabs: Investors | Arrangers | Introducers | All
   - Replace separate pages

2. **Merge Approvals + Messages**
   - New file: `src/components/inbox/ceo-inbox.tsx`
   - Unified "Inbox" with tabs: All | Approvals | Messages

---

## Phase 2.6: Admin Portal Carve-Out

**Dependencies:** Phase 2.0, Phase 2.5
**Database:** None

### New Route Structure

```
src/app/
  (admin)/
    versotech_admin/
      layout.tsx          # Admin layout with super_admin check
      page.tsx            # Dashboard redirect
      dashboard/page.tsx  # Platform metrics
      users/page.tsx      # User management
      cms/page.tsx        # Marketing CMS (placeholder)
      growth/page.tsx     # Growth analytics (placeholder)
      settings/page.tsx   # Platform settings
```

### Critical Files
- `src/app/(admin)/versotech_admin/layout.tsx` - Permission gating
- `src/middleware.ts` - Admin route protection

---

## Implementation Order

### Wave 1: Foundation (Week 1-2)
- **Phase 2.0** - MUST complete before anything else

### Wave 2: Quick Wins (Week 3, Parallel)
- **Phase 2.2** Tasks/Notifications Header
- **Phase 2.3** Documents Simplification

### Wave 3: Core (Week 3-4, Parallel)
- **Phase 2.1** Investor Journey
- **Phase 2.5** CEO Tools Consolidation

### Wave 4: Polish (Week 5)
- **Phase 2.4** Profile Tabs
- **Phase 2.6** Admin Portal

---

## Effort Estimates

| Phase | Effort | Risk |
|-------|--------|------|
| 2.0 Foundation | ~25h | HIGH (core auth) |
| 2.1 Investor Journey | ~15h | MEDIUM |
| 2.2 Tasks/Notifications | ~10h | LOW |
| 2.3 Documents | ~4h | LOW |
| 2.4 Profile Tabs | ~6h | LOW |
| 2.5 CEO Tools | ~15h | MEDIUM |
| 2.6 Admin Portal | ~10h | LOW |
| **Total** | **~85h** | - |

*Reduced from original 200h by removing Partner/Commercial Partner scope*

---

## Critical Files Summary

**Core Infrastructure:**
- `versotech-portal/src/middleware.ts` - Route protection, persona routing
- `versotech-portal/src/lib/auth.ts` - Persona detection
- `versotech-portal/src/types/persona.ts` - New type definitions

**Layout:**
- `versotech-portal/src/components/layout/app-layout.tsx` - Main wrapper
- `versotech-portal/src/components/layout/sidebar.tsx` - Navigation
- `versotech-portal/src/components/theme-provider.tsx` - Theme system

**Investor Experience:**
- `versotech-portal/src/components/deals/journey-bar.tsx` - New
- `versotech-portal/src/components/notification-center/notification-center.tsx` - New
- `versotech-portal/src/components/profile/profile-page-client.tsx` - Update
- `versotech-portal/src/components/deals/deal-detail-client.tsx` - Update

**CEO Experience:**
- `versotech-portal/src/app/(staff)/versotech/staff/users/page.tsx` - New
- `versotech-portal/src/components/inbox/ceo-inbox.tsx` - New

**Database:**
- `supabase/migrations/YYYYMMDD_add_arranger_users.sql` - New migration

---

## Migration Strategy

1. **Parallel Development**: Build new routes alongside existing
2. **Feature Flags**: Test new experience before full rollout
3. **Redirect Layer**: Old URLs redirect to new structure
4. **Gradual Rollout**: Internal users first, then external

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Persona detection errors | High | Thorough testing, fallback to legacy role |
| Breaking existing workflows | High | Parallel routes, redirects |
| Theme persistence issues | Low | localStorage + DB fallback |
| User confusion with new UI | Medium | In-app guidance |

---

## Decisions Made

1. **Admin Portal**: Same codebase with route groups (not separate app)
2. **Terminology**: Use CEO/Arranger/Lawyer/Investor/Introducer (not staff_*)
3. **Scope**: Remove Partner/Commercial Partner (not built, not priority)
4. **Data Rooms**: Pre-investment in Deal Detail, Post-investment in Portfolio
5. **Phase Order**: Foundation first, then parallel quick wins + core restructuring
