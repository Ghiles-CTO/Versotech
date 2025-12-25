# VERSO Phase 2: Master Implementation Plan

**Version:** 1.2
**Date:** December 18, 2025
**Status:** READY FOR IMPLEMENTATION
**Prerequisite:** Phase 1 Database Foundation - COMPLETE

### Version History
| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 18, 2025 | Initial plan covering Phases 2-7 |
| 1.1 | Dec 18, 2025 | Fixed 3 gaps: (1) Added entity_logo_url to get_user_personas() via migration, (2) Corrected CEO detection logic (persona_type='staff' + role_in_entity='ceo'), (3) Added Arranger (Phase 6.4) and Lawyer (Phase 6.5) implementation phases |
| 1.2 | Dec 18, 2025 | Fixed 3 blockers: (1) Added referral tracking columns to deal_memberships for Arranger/Partner queries, (2) Fixed inbox to use real table names (investor_notifications, tasks, messages), (3) Fixed direct subscribe to explicitly set investor_id |

---

## Executive Summary

Phase 1 (Database Foundation) has been **fully completed and verified**. This document provides the comprehensive implementation plan for Phase 2 and beyond, transforming VERSO into a unified multi-persona platform.

### Phase 1 Completion Status

| Metric | Completed |
|--------|-----------|
| Tables Created | 18 |
| RLS Policies Added | 47 |
| Functions Created | 2 |
| Bugs Fixed | 7 |
| TypeScript Types | Regenerated (291,089 chars) |

**Key Infrastructure Now Available:**
- Multi-user entity support for ALL 5 entity types
- `get_user_personas(uuid)` function for persona detection
- `get_investor_journey_stage(uuid, uuid)` function for 10-stage tracking
- Commercial partner proxy mode infrastructure
- Agreement tracking tables

---

## Phase Overview

| Phase | Focus | Est. Hours | Dependencies |
|-------|-------|------------|--------------|
| **Phase 2** | Auth & Portal Structure | 25 | Phase 1 (DB) |
| **Phase 3** | Investor Journey Restructure | 40 | Phase 2 (Auth) |
| **Phase 4** | UI/UX Consolidation | 26 | Phase 3 (Journey) |
| **Phase 5** | CEO Features | 24 | Phase 2 (Auth) |
| **Phase 6** | All Business Personas (P/I/CP/A/L) | 39 | Phase 5 (CEO) |
| **Phase 7** | Testing & Documentation | 26 | All Phases |

**Total Remaining:** ~180 hours

**7 Personas Covered:**
1. **CEO** (Phase 5) - Platform administration, user management
2. **Investor** (Phase 3) - Investment journey, portfolio
3. **Partner** (Phase 6.1) - Transactions, shared deals
4. **Introducer** (Phase 6.2) - Introductions, agreements
5. **Commercial Partner** (Phase 6.3) - Client transactions, proxy mode
6. **Arranger** (Phase 6.4) - Network management, mandates
7. **Lawyer** (Phase 6.5) - Assigned deals, escrow, subscription packs

---

## Phase 2: Auth & Portal Structure (25 hours)

### Objective
Create unified authentication and portal structure supporting all 7 personas with role-based navigation.

### 2.1 Persona Detection Middleware (8 hours)

**File:** `versotech-portal/src/middleware.ts`

**Tasks:**
1. **Integrate `get_user_personas()` function** (2 hours)
   - Call function on each authenticated request
   - Cache persona result in session/cookie
   - Return array of persona objects with entity_id

2. **Create persona context provider** (3 hours)
   - File: `src/contexts/persona-context.tsx`
   - Store active personas for current user
   - Track currently selected persona (for multi-persona users)
   - Provide `switchPersona()` function

3. **Update middleware route protection** (3 hours)
   - CEO-only routes: `/versotech_main/deals`, `/kyc-review`, `/fees`, `/audit`
   - Investor routes: `/opportunities`, `/portfolio`
   - Partner routes: `/partner-transactions`
   - Lawyer routes: `/assigned-deals`, `/escrow`

**Database Query (already available):**
```sql
SELECT * FROM get_user_personas('user-uuid-here');
-- Returns: persona_type, entity_id, entity_name, entity_logo_url, role_in_entity, is_primary, can_sign, can_execute_for_clients
```

**IMPORTANT: CEO Detection Logic:**
The `get_user_personas()` function returns `persona_type = 'staff'` for ALL staff roles (ceo, staff_admin, staff_ops, staff_rm). The actual role is in `role_in_entity`:
```typescript
// CORRECT CEO detection:
const isCEO = personas.some(p => p.persona_type === 'staff' && p.role_in_entity === 'ceo');

// WRONG (won't work):
const isCEO = personas.some(p => p.persona_type === 'ceo'); // Never matches!
```

### 2.2 Unified Portal Routes (8 hours)

**Current State:**
- `/versoholdings/*` - Investor portal
- `/versotech/staff/*` - Staff portal

**Target State:**
- `/versotech_main/*` - All personas
- `/versotech_admin/*` - Platform admin

**Tasks:**
1. **Create route group structure** (3 hours)
   ```
   src/app/
   ├── (main)/versotech_main/    # All business personas
   │   ├── layout.tsx            # Persona-aware layout
   │   ├── dashboard/
   │   ├── opportunities/
   │   ├── portfolio/
   │   └── ...
   └── (admin)/versotech_admin/  # Platform admin only
       ├── layout.tsx
       ├── settings/
       └── ...
   ```

2. **Create unified layout component** (3 hours)
   - File: `src/app/(main)/versotech_main/layout.tsx`
   - Dynamic sidebar based on active personas
   - Persona switcher in header (for multi-persona users)
   - Theme toggle (light/dark)

3. **Create redirect mappings** (2 hours)
   - `/versoholdings/*` → `/versotech_main/*` (backward compatibility)
   - `/versotech/staff/*` → `/versotech_main/*` (backward compatibility)
   - Preserve deep links during transition

### 2.3 Navigation Components (9 hours)

**Tasks:**
1. **Dynamic sidebar generator** (4 hours)
   - File: `src/components/layout/persona-sidebar.tsx`
   - Input: user's personas array
   - Output: Combined navigation items for all their personas

   ```typescript
   // IMPORTANT: persona_type from get_user_personas() is used as primary key
   // For 'staff', check role_in_entity for CEO-specific nav items
   const PERSONA_NAV_ITEMS: Record<string, NavItem[]> = {
     // Staff persona - varies by role_in_entity
     staff: [
       { href: '/deals', label: 'Deals', icon: Briefcase },
       { href: '/subscriptions', label: 'Subscriptions', icon: FileText },
       // ... common staff items
     ],
     // CEO gets additional items (check role_in_entity === 'ceo')
     // Applied as: if (persona.persona_type === 'staff' && persona.role_in_entity === 'ceo')
     staff_ceo_extras: [
       { href: '/users', label: 'Users', icon: Users },
       { href: '/kyc-review', label: 'KYC Review', icon: Shield },
       { href: '/fees', label: 'Fees', icon: DollarSign },
       { href: '/audit', label: 'Audit', icon: ClipboardCheck },
     ],
     investor: [
       { href: '/opportunities', label: 'Opportunities', icon: TrendingUp },
       { href: '/portfolio', label: 'Portfolio', icon: PieChart },
       // ...
     ],
     arranger: [
       { href: '/my-partners', label: 'My Partners', icon: Users },
       { href: '/my-introducers', label: 'My Introducers', icon: UserPlus },
       { href: '/my-commercial-partners', label: 'My Commercial Partners', icon: Building },
       { href: '/my-lawyers', label: 'My Lawyers', icon: Scale },
       { href: '/my-mandates', label: 'My Mandates', icon: FileSignature },
     ],
     introducer: [
       { href: '/introductions', label: 'Introductions', icon: UserPlus },
       { href: '/introducer-agreements', label: 'Agreements', icon: FileText },
     ],
     partner: [
       { href: '/partner-transactions', label: 'Transactions', icon: ArrowRightLeft },
       { href: '/shared-transactions', label: 'Shared Deals', icon: Share2 },
     ],
     commercial_partner: [
       { href: '/client-transactions', label: 'Client Transactions', icon: Users },
       { href: '/placement-agreements', label: 'Agreements', icon: FileText },
     ],
     lawyer: [
       { href: '/assigned-deals', label: 'Assigned Deals', icon: Briefcase },
       { href: '/escrow', label: 'Escrow', icon: Lock },
       { href: '/subscription-packs', label: 'Subscription Packs', icon: FileText },
     ],
   };

   // Helper to build nav for a persona
   function getNavForPersona(persona: Persona): NavItem[] {
     const items = PERSONA_NAV_ITEMS[persona.persona_type] || [];
     // Add CEO extras if staff with ceo role
     if (persona.persona_type === 'staff' && persona.role_in_entity === 'ceo') {
       return [...items, ...PERSONA_NAV_ITEMS.staff_ceo_extras];
     }
     return items;
   }
   ```

2. **Persona switcher component** (2 hours)
   - File: `src/components/layout/persona-switcher.tsx`
   - Dropdown in header showing all user's personas
   - Shows entity name + logo for each
   - Click to switch active context

3. **Header notification center** (3 hours)
   - File: `src/components/layout/notification-center.tsx`
   - Merge tasks + notifications
   - Group by Investment Opportunity
   - Badge count in header

### 2.4 Deliverables

| Deliverable | File/Location |
|-------------|---------------|
| Persona context | `src/contexts/persona-context.tsx` |
| Updated middleware | `src/middleware.ts` |
| Unified layout | `src/app/(main)/versotech_main/layout.tsx` |
| Persona sidebar | `src/components/layout/persona-sidebar.tsx` |
| Persona switcher | `src/components/layout/persona-switcher.tsx` |
| Notification center | `src/components/layout/notification-center.tsx` |

---

## Phase 3: Investor Journey Restructure (40 hours)

### Objective
Implement the 10-stage investor journey with branching paths, integrate data room into opportunity detail, and enable direct subscription.

### 3.1 Journey Progress Bar Component (8 hours)

**File:** `src/components/deals/investor-journey-bar.tsx`

**10 Stages (from `get_investor_journey_stage()`):**
1. Received - `deal_memberships.dispatched_at`
2. Viewed - `deal_memberships.viewed_at`
3. Interest Confirmed - `deal_memberships.interest_confirmed_at`
4. NDA Signed - `deal_memberships.nda_signed_at`
5. Data Room Access - `deal_memberships.data_room_granted_at`
6. Pack Generated - `subscriptions.pack_generated_at`
7. Pack Sent - `subscriptions.pack_sent_at`
8. Signed - `subscriptions.signed_at`
9. Funded - `subscriptions.funded_at`
10. Active - `subscriptions.activated_at`

**Visual States:**
- Green = Completed
- Blue = In Progress
- Gray = Pending (required)
- Dotted = Skipped (optional stage)

**Database Query (already available):**
```sql
SELECT * FROM get_investor_journey_stage('deal-uuid', 'investor-uuid');
```

### 3.2 Opportunity Detail Page Restructure (12 hours)

**Current:** `/versoholdings/deal/[id]`
**Target:** `/versotech_main/opportunities/[id]`

**Tasks:**
1. **Integrate Data Room** (4 hours)
   - Remove separate `/data-rooms` route
   - Embed data room documents as tab in opportunity detail
   - Auto-expand if investor has access

2. **Add Journey Progress Bar** (3 hours)
   - Show at top of opportunity detail
   - Update in real-time as stages complete
   - Click stage for details/actions

3. **Enable Direct Subscribe** (3 hours)
   - "Subscribe Now" button on deal cards AND deal detail
   - Skip Interest/NDA/Data Room if user clicks Subscribe directly
   - Auto-create `deal_memberships` record with appropriate timestamps

4. **Subscription Form Integration** (2 hours)
   - Modal or inline form for subscription details
   - Amount, counterparty entity selection
   - Validate against `investor_members` for signatories

### 3.3 Subscription Pack Generation (10 hours)

**Current Flow:** Manual pack upload
**Target Flow:** Auto-generate on "Invest" click

**Tasks:**
1. **Pack Generation API** (4 hours)
   - File: `src/app/api/subscriptions/[id]/generate-pack/route.ts`
   - Fetch deal template document
   - Populate with investor/entity data
   - Identify ALL signatories from `investor_members`
   - Store generated PDF

2. **Multi-Signatory Support** (4 hours)
   - Query `investor_members WHERE role = 'authorized_signatory'`
   - Create `signature_requests` for each signatory
   - Pack status = "Signed" only when ALL complete

3. **Pack Status Tracking** (2 hours)
   - Update `subscriptions.pack_generated_at`
   - Update `subscriptions.pack_sent_at` when emails sent
   - Use existing signature completion handlers

### 3.4 NDA Multi-Signatory Flow (6 hours)

**Current:** One NDA per investor
**Target:** One NDA per signatory (up to 10)

**Tasks:**
1. **Update NDA Generation** (3 hours)
   - Create separate signature request per signatory
   - Track completion per signatory
   - Grant data room only when ALL signatories complete

2. **NDA Status Component** (3 hours)
   - Show signatory-level status in journey bar
   - "2 of 3 signatories signed" indicator
   - Link to pending signatories

### 3.5 Direct Subscribe Path (4 hours)

**For investors who subscribe without going through Interest/NDA:**

**Tasks:**
1. **Auto-create deal_membership** (2 hours)
   - When investor subscribes directly, create membership with ALL required fields:

   ```typescript
   // CRITICAL: Must set investor_id for get_investor_journey_stage() to work
   await supabase.from('deal_memberships').insert({
     deal_id: dealId,
     user_id: userId,
     investor_id: investorId,  // REQUIRED - journey bar queries by this
     role: 'investor',
     viewed_at: new Date().toISOString(),  // They viewed to subscribe
     // Skipped stages (NULL):
     dispatched_at: null,
     interest_confirmed_at: null,
     nda_signed_at: null,
     data_room_granted_at: null,
     // Optional: Track if referred by partner/introducer
     referred_by_entity_id: referringEntityId || null,
     referred_by_entity_type: referringEntityType || null,
   });
   ```

   **Field requirements:**
   - `deal_id` - Required (which deal)
   - `user_id` - Required (the user subscribing)
   - `investor_id` - **CRITICAL** (the investor entity - needed for journey tracking)
   - `role` - Required (set to 'investor')
   - `viewed_at` - Set to NOW() (they viewed to subscribe)
   - Other timestamps NULL (skipped stages)

2. **Journey bar for direct subscribers** (2 hours)
   - Show skipped stages as dotted/dimmed
   - Start journey at "Pack Generated"

### 3.6 Deliverables

| Deliverable | File/Location |
|-------------|---------------|
| Journey bar component | `src/components/deals/investor-journey-bar.tsx` |
| Restructured opportunity page | `src/app/(main)/versotech_main/opportunities/[id]/page.tsx` |
| Pack generation API | `src/app/api/subscriptions/[id]/generate-pack/route.ts` |
| Multi-signatory NDA | `src/app/api/deals/[id]/nda/generate/route.ts` |

---

## Phase 4: UI/UX Consolidation (26 hours)

### Objective
Implement UI/UX changes from client vision: rename pages, merge sections, split tabs, add theme toggle.

### 4.1 Page Renames (4 hours)

| Current | New |
|---------|-----|
| Active Deals | Investment Opportunities |
| Reports | Documents |
| Holdings | Portfolio |

### 4.2 Inbox Consolidation (8 hours)

**Merge:** Tasks + Notifications + Messages
**Location:** Header notification center (from Phase 2)

**Tasks:**
1. **Unified inbox API** (3 hours)
   - File: `src/app/api/inbox/route.ts`
   - Aggregate from real tables:
     - `tasks` (actionable items for all users)
     - `investor_notifications` (investor-specific alerts)
     - `messages` + `conversations` (messaging)
   - Sort by date, group by deal
   - Mark as read/unread

   ```typescript
   // Query strategy
   const [tasks, notifications, messages] = await Promise.all([
     supabase.from('tasks')
       .select('*')
       .eq('owner_user_id', userId)
       .order('created_at', { ascending: false }),
     supabase.from('investor_notifications')
       .select('*')
       .eq('user_id', userId)
       .order('created_at', { ascending: false }),
     supabase.from('messages')
       .select('*, conversations!inner(*)')
       .eq('conversations.participant_ids', userId) // Adjust based on actual schema
       .order('created_at', { ascending: false }),
   ]);
   ```

2. **Inbox UI component** (3 hours)
   - Tabs: All | Signatures | KYC | Investments | Messages
   - Filter by deal/opportunity
   - Quick actions (sign, approve, reply)

3. **Remove sidebar items** (2 hours)
   - Tasks → Inbox
   - Notifications → Inbox
   - Messages → Inbox (for non-CEO)

### 4.3 Profile KYC/Compliance Split (6 hours)

**Current:** Single "KYC & Onboarding" tab
**Target:** Separate KYC and Compliance tabs

**Tasks:**
1. **Split tab structure** (2 hours)
   - KYC tab: Identity docs, proof of address, entity docs
   - Compliance tab: Questionnaire, accreditation, risk

2. **Update profile page** (2 hours)
   - New tab component structure
   - Migrate existing content

3. **Update API queries** (2 hours)
   - Separate KYC documents from compliance docs
   - Update document type filters

### 4.4 Theme Toggle (4 hours)

**Tasks:**
1. **Theme provider** (2 hours)
   - Store preference in localStorage + profile
   - Default to light mode
   - System preference detection

2. **Toggle UI** (2 hours)
   - Sun/moon icon in header
   - Smooth transition animation

### 4.5 Users Consolidation (4 hours)

**Current:** Separate pages for Investors, Arrangers, Introducers, etc.
**Target:** Single "/users" page with type filter

**Tasks:**
1. **Unified users page** (3 hours)
   - Tabs: All | Investors | Introducers | Partners | Commercial Partners | Arrangers | Lawyers
   - Shared table component with type column

2. **Update navigation** (1 hour)
   - Replace multiple sidebar items with single "Users"

---

## Phase 5: CEO Features (24 hours)

### Objective
Complete CEO-specific functionality for managing all entity types and platform operations.

### 5.1 User Management CRUD (12 hours)

**For each entity type, CEO needs:**
- Create user (invite flow)
- View user details
- Edit user
- Deactivate user
- Manage entity users (multiple logins per entity)

**Tasks:**
1. **Investor management** (2 hours) - Mostly exists, update for multi-user
2. **Introducer management** (2 hours) - Update to use `introducer_users`
3. **Partner management** (2 hours) - New entity type
4. **Commercial Partner management** (2 hours) - New entity type with proxy config
5. **Arranger management** (2 hours) - Update to use `arranger_users`
6. **Lawyer management** (2 hours) - New entity type or deal assignment

### 5.2 Deal Dispatch System (8 hours)

**CEO dispatches deals to entities with specific roles:**

**Tasks:**
1. **Dispatch modal** (3 hours)
   - Select recipient (from all entity types)
   - Choose dispatch type:
     - Investor access (for Partner/Introducer/Commercial Partner)
     - Proxy mode (for Commercial Partner only)
     - Tracking only
   - For proxy: specify client name

2. **Dispatch API** (3 hours)
   - Create `deal_memberships` record with appropriate role
   - For proxy: create `commercial_partner_clients` record
   - Send notification to recipient

3. **Dispatch tracking** (2 hours)
   - Show dispatched entities on deal detail
   - Filter by dispatch type
   - Revoke dispatch option

### 5.3 KYC Review Enhancements (4 hours)

**Tasks:**
1. **Queue improvements** (2 hours)
   - Filter by entity type
   - Priority sorting
   - Bulk actions

2. **Review workflow** (2 hours)
   - Approval/rejection with notes
   - Request additional documents
   - Expiry tracking

---

## Phase 6: All Business Personas (39 hours)

### Objective
Complete persona-specific features for ALL business personas: Partners, Introducers, Commercial Partners, Arrangers, and Lawyers.

### 6.1 Partner Features (6 hours)

**Database:** Uses `deal_memberships.referred_by_entity_id` + `referred_by_entity_type` (added in v1.2)

**Tasks:**
1. **Partner transactions page** (3 hours)
   - File: `src/app/(main)/versotech_main/partner-transactions/page.tsx`
   - View investors this partner has referred
   - Track transaction status per referred investor
   - Commission reporting

   ```typescript
   // API: src/app/api/partners/me/transactions/route.ts
   // Query: Get investors referred by this partner
   const { data: transactions } = await supabase
     .from('deal_memberships')
     .select(`
       *,
       investor:investors(*),
       deal:deals(*),
       subscription:subscriptions(*)
     `)
     .eq('referred_by_entity_id', partnerId)
     .eq('referred_by_entity_type', 'partner');
   ```

2. **Shared transactions** (3 hours)
   - File: `src/app/(main)/versotech_main/shared-transactions/page.tsx`
   - Deals where other partners also referred investors
   - Referral network view

   ```typescript
   // API: src/app/api/partners/me/shared-deals/route.ts
   // Query: Deals where this partner AND other partners have referrals
   const { data: sharedDeals } = await supabase.rpc('get_partner_shared_deals', {
     p_partner_id: partnerId
   });
   ```

### 6.2 Introducer Features (6 hours)

**Tasks:**
1. **Introductions tracking** (3 hours)
   - List of referred investors
   - Status per introduction
   - Commission calculations

2. **Introducer agreements** (3 hours)
   - View active agreements (from `introducer_agreements`)
   - Sign new agreements
   - Agreement history

### 6.3 Commercial Partner Features (9 hours)

**Tasks:**
1. **Client transactions** (3 hours)
   - Track clients (from `commercial_partner_clients`)
   - View transactions per client
   - Client reporting

2. **Proxy mode implementation** (4 hours)
   - "On Behalf Of" selector in subscription flow
   - Create client record if new
   - Sign documents as proxy
   - Client name on generated documents

3. **Placement agreements** (2 hours)
   - View/sign agreements (from `placement_agreements`)
   - Agreement status tracking

### 6.4 Arranger Features (10 hours)

**Role:** Arrangers are institutional partners who manage relationships with multiple entity types and oversee deal mandates.

**Database Tables:**
- `arranger_entities` - Core arranger entity
- `arranger_users` - User-to-arranger linking
- `arranger_members` - Member management
- `deals.arranger_entity_id` - Links deals to arrangers (mandates)
- `deal_memberships.referred_by_entity_id/type` - Tracks which entities referred investors to arranger's deals

**Query Strategy:**
Arranger's "network" is derived from entities that have referred investors to the arranger's deals. This is deal-based, not a permanent relationship table.

**Tasks:**
1. **My Partners page** (2 hours)
   - File: `src/app/(main)/versotech_main/my-partners/page.tsx`
   - List partners who have referred investors to arranger's deals

   ```typescript
   // API: src/app/api/arrangers/me/partners/route.ts
   const { data: partners } = await supabase
     .from('partners')
     .select('*')
     .in('id',
       supabase
         .from('deal_memberships')
         .select('referred_by_entity_id')
         .eq('referred_by_entity_type', 'partner')
         .in('deal_id',
           supabase.from('deals').select('id').eq('arranger_entity_id', arrangerId)
         )
     );

   // Or use RPC for complex query:
   const { data } = await supabase.rpc('get_arranger_partners', { p_arranger_id: arrangerId });
   ```

2. **My Introducers page** (2 hours)
   - File: `src/app/(main)/versotech_main/my-introducers/page.tsx`
   - List introducers who have referred to arranger's deals

   ```typescript
   // API: src/app/api/arrangers/me/introducers/route.ts
   const { data } = await supabase.rpc('get_arranger_introducers', { p_arranger_id: arrangerId });
   ```

3. **My Commercial Partners page** (2 hours)
   - File: `src/app/(main)/versotech_main/my-commercial-partners/page.tsx`
   - List commercial partners who have referred to arranger's deals

   ```typescript
   // API: src/app/api/arrangers/me/commercial-partners/route.ts
   const { data } = await supabase.rpc('get_arranger_commercial_partners', { p_arranger_id: arrangerId });
   ```

4. **My Lawyers page** (2 hours)
   - File: `src/app/(main)/versotech_main/my-lawyers/page.tsx`
   - List lawyers assigned to arranger's deals (via deal_memberships.role = 'lawyer')

   ```typescript
   // API: src/app/api/arrangers/me/lawyers/route.ts
   const { data: lawyers } = await supabase
     .from('lawyers')
     .select('*')
     .in('id',
       supabase
         .from('deal_memberships')
         .select('lawyer_id')
         .eq('role', 'lawyer')
         .in('deal_id',
           supabase.from('deals').select('id').eq('arranger_entity_id', arrangerId)
         )
     );
   ```

5. **My Mandates page** (2 hours)
   - File: `src/app/(main)/versotech_main/my-mandates/page.tsx`
   - Active mandates = deals where arranger_entity_id = this arranger

   ```typescript
   // API: src/app/api/arrangers/me/mandates/route.ts
   const { data: mandates } = await supabase
     .from('deals')
     .select(`
       *,
       memberships:deal_memberships(count),
       subscriptions(count, sum:commitment_amount)
     `)
     .eq('arranger_entity_id', arrangerId)
     .order('created_at', { ascending: false });
   ```

**API Routes:**
```
src/app/api/arrangers/me/partners/route.ts
src/app/api/arrangers/me/introducers/route.ts
src/app/api/arrangers/me/commercial-partners/route.ts
src/app/api/arrangers/me/lawyers/route.ts
src/app/api/arrangers/me/mandates/route.ts
```

**RPC Functions to Add (Phase 6.4):**
```sql
-- get_arranger_partners(p_arranger_id uuid)
-- get_arranger_introducers(p_arranger_id uuid)
-- get_arranger_commercial_partners(p_arranger_id uuid)
```

### 6.5 Lawyer Features (8 hours)

**Role:** Lawyers provide legal services for deals - reviewing documents, managing escrow, and ensuring compliance. They have READ-ONLY access to assigned deals and signed subscription packs.

**Database Tables:**
- `lawyers` - Core lawyer entity
- `lawyer_users` - User-to-lawyer linking
- `lawyer_members` - Member management (is_signatory for firm documents)

**Tasks:**
1. **Assigned Deals page** (3 hours)
   - File: `src/app/(main)/versotech_main/assigned-deals/page.tsx`
   - List deals where lawyer is assigned (via `deal_memberships.role = 'lawyer'`)
   - Deal status and key dates
   - Document access (read-only)
   - Filter by status: Active, Closing, Closed

2. **Escrow Management page** (3 hours)
   - File: `src/app/(main)/versotech_main/escrow/page.tsx`
   - Track escrow transactions per deal
   - Wire instruction management
   - Escrow release tracking
   - Document generation (escrow letters)

3. **Subscription Packs View** (2 hours)
   - File: `src/app/(main)/versotech_main/subscription-packs/page.tsx`
   - READ-ONLY access to signed subscription packs for assigned deals
   - View all signatories and signature status
   - Download signed documents
   - No edit capability

**API Routes:**
```
src/app/api/lawyers/me/assigned-deals/route.ts
src/app/api/lawyers/me/escrow/route.ts
src/app/api/lawyers/me/subscription-packs/route.ts
```

**RLS Policy Note:**
Lawyers should only see subscriptions for deals where they are assigned. Add RLS check:
```sql
-- In subscriptions RLS policy
OR EXISTS (
  SELECT 1 FROM deal_memberships dm
  JOIN lawyer_users lu ON lu.user_id = auth.uid()
  WHERE dm.deal_id = subscriptions.deal_id
  AND dm.lawyer_id = lu.lawyer_id
  AND dm.role = 'lawyer'
)
```

---

## Phase 7: Testing & Documentation (26 hours)

### 7.1 Testing (18 hours)

**Test Categories:**
1. **Auth & Persona** (4 hours)
   - Multi-persona user login
   - Persona switching
   - Route protection

2. **Investor Journey** (6 hours)
   - Full journey (all stages)
   - Direct subscribe path
   - Multi-signatory NDA/Pack

3. **CEO Operations** (4 hours)
   - User CRUD for all types
   - Deal dispatch
   - KYC review

4. **Partner/Introducer/CP** (4 hours)
   - Conditional investor access
   - Proxy mode
   - Agreement management

5. **Arranger** (3 hours)
   - Network management (partners, introducers, commercial partners, lawyers)
   - Mandate tracking
   - Multi-entity relationship views

6. **Lawyer** (3 hours)
   - Assigned deals access (read-only)
   - Escrow management
   - Subscription pack viewing
   - RLS policy verification

### 7.2 Documentation (8 hours)

**Tasks:**
1. **User guides** (4 hours)
   - Per-persona quick start
   - Feature documentation

2. **Technical documentation** (4 hours)
   - API reference updates
   - Database schema docs
   - Architecture diagrams

---

## Implementation Priority

### Critical Path
```
Phase 1 (DONE) → Phase 2 (Auth) → Phase 3 (Journey) → Phase 5 (CEO)
                                                    ↘
                                                      Phase 6 (P/I/CP)
                      Phase 2 (Auth) → Phase 4 (UI/UX)

Phase 7 (Testing) runs in parallel throughout
```

### Recommended Sequence

**Week 1-2: Phase 2 (Auth & Portal)**
- Foundation for all other work
- Enables persona-aware routing
- Creates unified portal structure

**Week 3-4: Phase 3 (Investor Journey)**
- Core user flow
- Highest business impact
- Uses Phase 1 DB + Phase 2 Auth

**Week 5: Phase 4 (UI/UX) + Phase 5 Start**
- UI polish can overlap with CEO features
- Both depend on Phase 2

**Week 6: Phase 5 (CEO) + Phase 6 Start**
- CEO features unlock Phase 6
- Partner/Introducer/CP need dispatch system

**Week 7: Phase 6 (Complete) + Phase 7**
- Final persona features
- Testing throughout
- Documentation

---

## Risk Mitigation

### Technical Risks

| Risk | Mitigation |
|------|------------|
| Multi-persona state management | Use React Context with clear persona boundaries |
| Backward compatibility | Maintain old routes with redirects for 30 days |
| Signature system complexity | Leverage existing dual-signature pattern, extend for 10+ |
| Data migration issues | All Phase 1 migrations complete and verified |

### Business Risks

| Risk | Mitigation |
|------|------------|
| User confusion during transition | Phased rollout, user notification |
| Lost functionality | Feature parity checklist before launch |
| Performance impact | Query optimization, caching personas |

---

## Appendix A: Database Tables Available (Phase 1)

### Entity-User Tables
- `arranger_users` + `arranger_members`
- `introducer_users` + `introducer_members`
- `partners` + `partner_users` + `partner_members`
- `commercial_partners` + `commercial_partner_users` + `commercial_partner_members`
- `lawyers` + `lawyer_users` + `lawyer_members`

### Supporting Tables
- `commercial_partner_clients` (proxy mode)
- `placement_agreements`
- `introducer_agreements`
- `companies` + `company_valuations`

### Functions
- `get_user_personas(p_user_id uuid)` - Returns all personas for user
- `get_investor_journey_stage(p_deal_id uuid, p_investor_id uuid)` - Returns 10 stages

### Enum Extensions
- `user_role`: Added `arranger`, `introducer`, `partner`, `commercial_partner`, `lawyer`, `ceo`
- `deal_member_role`: Added `partner_investor`, `introducer_investor`, `commercial_partner_investor`, `commercial_partner_proxy`

### Journey Tracking Columns
**deal_memberships:**
- `dispatched_at`, `viewed_at`, `interest_confirmed_at`, `nda_signed_at`, `data_room_granted_at`

**subscriptions:**
- `pack_generated_at`, `pack_sent_at`, `signed_at`, `funded_at`, `activated_at`

---

## Appendix B: Key Files Reference

### Phase 2 Key Files
```
src/middleware.ts                           # Persona detection
src/contexts/persona-context.tsx            # Persona state
src/app/(main)/versotech_main/layout.tsx    # Unified layout
src/components/layout/persona-sidebar.tsx   # Dynamic nav
src/components/layout/persona-switcher.tsx  # Persona selector
```

### Phase 3 Key Files
```
src/components/deals/investor-journey-bar.tsx       # Journey visualization
src/app/(main)/versotech_main/opportunities/[id]/   # Opportunity detail
src/app/api/subscriptions/[id]/generate-pack/       # Pack generation
src/app/api/deals/[id]/nda/generate/               # Multi-signatory NDA
```

### Phase 5 Key Files
```
src/app/(main)/versotech_main/users/               # User management
src/app/(main)/versotech_main/deals/dispatch/      # Deal dispatch
src/components/deals/dispatch-modal.tsx            # Dispatch UI
```

### Phase 6 Key Files (All Business Personas)
```
# Partner
src/app/(main)/versotech_main/partner-transactions/
src/app/(main)/versotech_main/shared-transactions/
src/app/api/partners/me/

# Introducer
src/app/(main)/versotech_main/introductions/
src/app/(main)/versotech_main/introducer-agreements/
src/app/api/introducers/me/

# Commercial Partner
src/app/(main)/versotech_main/client-transactions/
src/app/(main)/versotech_main/placement-agreements/
src/app/api/commercial-partners/me/

# Arranger
src/app/(main)/versotech_main/my-partners/
src/app/(main)/versotech_main/my-introducers/
src/app/(main)/versotech_main/my-commercial-partners/
src/app/(main)/versotech_main/my-lawyers/
src/app/(main)/versotech_main/my-mandates/
src/app/api/arrangers/me/

# Lawyer
src/app/(main)/versotech_main/assigned-deals/
src/app/(main)/versotech_main/escrow/
src/app/(main)/versotech_main/subscription-packs/
src/app/api/lawyers/me/
```

---

## Appendix C: Database Prerequisites

### Migration 1: `get_user_personas()` Update (APPLIED)
**File:** `supabase/migrations/20251218100000_fix_get_user_personas_add_logos.sql`
**Status:** ✅ APPLIED

1. **Adds `logo_url` column** to tables missing it:
   - `investors`
   - `arranger_entities`
   - `partners`
   - `commercial_partners`
   - `introducers`

2. **Updates `get_user_personas()` function** to return `entity_logo_url` column

### Migration 2: Referral Tracking (APPLIED)
**File:** `supabase/migrations/20251218110000_add_referral_tracking_to_deal_memberships.sql`
**Status:** ✅ APPLIED

1. **Adds referral tracking columns** to `deal_memberships`:
   - `referred_by_entity_id` (uuid) - The entity that referred this investor
   - `referred_by_entity_type` (text) - Type: 'partner', 'introducer', 'commercial_partner'

2. **Adds check constraint** for valid entity types

3. **Adds indexes** for efficient queries:
   - `idx_deal_memberships_referred_by` - For network queries
   - `idx_deals_arranger_entity_id` - For mandate queries

**Query Examples:**
```sql
-- Partner's referred investors
SELECT * FROM deal_memberships
WHERE referred_by_entity_id = :partner_id
  AND referred_by_entity_type = 'partner';

-- Arranger's partners (derived from deal history)
SELECT DISTINCT p.* FROM partners p
JOIN deal_memberships dm ON dm.referred_by_entity_id = p.id
  AND dm.referred_by_entity_type = 'partner'
JOIN deals d ON d.id = dm.deal_id
WHERE d.arranger_entity_id = :arranger_id;

-- Arranger's mandates
SELECT * FROM deals WHERE arranger_entity_id = :arranger_id;
```

---

**Document Status:** Ready for Phase 2 implementation
**Prerequisites:** Phase 1 COMPLETE, Both migrations APPLIED
**Next Action:** Begin Phase 2.1 (Persona Detection Middleware)
