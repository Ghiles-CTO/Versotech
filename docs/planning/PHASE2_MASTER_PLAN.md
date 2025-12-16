# VERSO Phase 2: Portal Restructuring Master Plan

**Version:** 1.0 (DEFINITIVE)
**Date:** December 16, 2025
**Status:** APPROVED - Ready for Implementation

---

# EXECUTIVE SUMMARY

Restructure the existing dual-portal system into TWO PORTALS:
- **Admin Portal** (`/versotech_admin/*`) - CMS, SaaS management, growth marketing
- **Main Portal** (`/versotech_main/*`) - ALL 7 personas in ONE portal

**Key Outcomes:**
- Single login with persona-based navigation for ALL 7 personas
- Hybrid user support (one user can have multiple roles)
- UI consolidations (Tasks+Notifications, Data Room integration, Profile restructuring)
- Light/dark theme toggle (user preference)

**Estimated Effort:** ~85 hours across 5 weeks

---

# 1. ARCHITECTURE

## 1.1 TWO PORTALS ONLY

```
/versotech_admin/*      Admin Portal (CMS, SaaS, Growth Marketing ONLY)
/versotech_main/*       ONE Main Portal for ALL 7 personas
```

**NO SEPARATE PORTALS PER PERSONA:**
- ~~`/introducer/*`~~ WRONG
- ~~`/participant/*`~~ WRONG
- ~~`/lawyer/*`~~ WRONG

Everything is in ONE Main Portal with persona-based views.

## 1.2 ALL 7 PERSONAS IN ONE MAIN PORTAL

| # | Persona | Type | Primary Use Case | Detection Source |
|---|---------|------|------------------|------------------|
| 1 | **Investor** | External | Invest in deals, manage portfolio | `investor_users` table |
| 2 | **CEO** | Internal | Full platform control, approvals | `profiles.role = 'staff_admin'` |
| 3 | **Arranger** | Internal/External | Structure deals, manage vehicles | `arranger_users` table (NEW) |
| 4 | **Introducer** | External | Track referrals, view commissions | `introducers.user_id` |
| 5 | **Lawyer** | External | Access assigned deals, documents | `deal_memberships.role = 'lawyer'` |
| 6 | **Partner** | External (Hybrid) | Investor + Introducer combined | Both `investor_users` + `introducers` |
| 7 | **Commercial Partner** | External | Entity-level partner with placements | `introducers.type = 'commercial'` (extend) |

## 1.3 KEY ARCHITECTURE PRINCIPLES

1. **System detects user roles** and routes them to the right experience within the same portal
2. **Hybrid users** (users having several roles) are supported
3. **Same login** for all external users
4. **Same login** for all CEOs
5. **Authentication, documents, signatures, messaging** shared but adjusted per persona
6. **Verso Sign** works for everyone for each role including hybrid users

---

# 2. ROUTE STRUCTURE

## 2.1 Admin Portal (`/versotech_admin/*`)

```
src/app/(admin)/versotech_admin/
  layout.tsx              # Admin layout (admin-only check)
  page.tsx                # Redirects to dashboard
  dashboard/page.tsx      # Platform metrics
  cms/page.tsx            # Content management
  growth/page.tsx         # Growth marketing analytics
  settings/page.tsx       # Platform settings
  users/page.tsx          # User management (admin level)
```

## 2.2 Main Portal (`/versotech_main/*`)

```
src/app/(main)/versotech_main/
  layout.tsx              # Main portal layout (persona-aware)
  login/page.tsx          # Single login for ALL personas
  page.tsx                # Redirects to dashboard

  # SHARED SURFACES (All personas)
  dashboard/page.tsx              # Persona-aware dashboard
  inbox/page.tsx                  # Messages + Approvals + Tasks (combined)
  documents/page.tsx              # All documents
  versosign/page.tsx              # Signing queue
  profile/page.tsx                # User profile with persona tabs

  # INVESTOR SURFACES
  opportunities/
    page.tsx                      # Investment opportunities list
    [id]/page.tsx                 # Deal detail + journey bar + data room
  portfolio/
    page.tsx                      # Holdings/investments
    [id]/page.tsx                 # Position detail

  # CEO/STAFF SURFACES
  deals/
    page.tsx                      # Deal management
    new/page.tsx                  # Create deal
    [id]/page.tsx                 # Deal detail (staff view)
  users/
    page.tsx                      # Consolidated users (tabs: Investors | Arrangers | Introducers | All)
    [id]/page.tsx                 # User detail
  kyc-review/page.tsx             # KYC review queue
  fees/page.tsx                   # Fees & reconciliation
  audit/page.tsx                  # Audit logs

  # ARRANGER SURFACES
  mandates/
    page.tsx                      # Arranger mandates list
    [id]/page.tsx                 # Mandate detail

  # INTRODUCER SURFACES
  introductions/
    page.tsx                      # Introducer referrals
    [id]/page.tsx                 # Introduction detail
  commissions/page.tsx            # Commission tracking
  agreements/page.tsx             # Fee agreements

  # LAWYER SURFACES
  assigned-deals/
    page.tsx                      # Lawyer's assigned deals
    [id]/page.tsx                 # Deal detail (lawyer view)

  # PARTNER/COMMERCIAL PARTNER SURFACES
  partner-transactions/page.tsx   # Partner transaction tracking
  clients/page.tsx                # Commercial Partner clients
```

---

# 3. DATABASE CHANGES

## 3.1 New Table: `arranger_users`

**Only ONE new table required.**

```sql
-- Migration: YYYYMMDD_add_arranger_users.sql

CREATE TABLE arranger_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  arranger_entity_id UUID NOT NULL REFERENCES arranger_entities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, arranger_entity_id)
);

-- Indexes
CREATE INDEX idx_arranger_users_user ON arranger_users(user_id);
CREATE INDEX idx_arranger_users_entity ON arranger_users(arranger_entity_id);

-- RLS
ALTER TABLE arranger_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arranger_users_self_select" ON arranger_users
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "arranger_users_admin_all" ON arranger_users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'staff_admin')
  );

-- Comments
COMMENT ON TABLE arranger_users IS 'Links user profiles to arranger entities for arranger persona';
```

## 3.2 Existing Tables (No Changes Needed)

| Table | Used For | Status |
|-------|----------|--------|
| `investor_users` | Investor persona detection | EXISTS - Works |
| `introducers` (with `user_id`) | Introducer persona detection | EXISTS - `user_id` column present |
| `deal_memberships` | Lawyer persona detection | EXISTS - Has `role` enum including 'lawyer' |

## 3.3 Optional: Commercial Partner Extension

If Commercial Partners need separate tracking from Introducers:

```sql
-- Option A: Add type to introducers
ALTER TABLE introducers ADD COLUMN introducer_type TEXT DEFAULT 'standard';
-- Values: 'standard', 'commercial_partner'

-- Option B: New table (future)
CREATE TABLE commercial_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  entity_name TEXT NOT NULL,
  -- ... additional fields
);
```

---

# 4. PERSONA DETECTION SYSTEM

## 4.1 Types (`src/types/persona.ts`)

```typescript
export type PortalPersona =
  | 'investor'           // External - Portfolio management
  | 'ceo'                // Internal - Full control
  | 'arranger'           // Internal/External - Deal structuring
  | 'introducer'         // External - Deal referrer, commissions
  | 'lawyer'             // External - Deal participant
  | 'partner'            // External - Investor + Introducer hybrid
  | 'commercial_partner' // External - Entity-level partner
  | 'admin';             // Internal - System administration (Admin Portal only)

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
  role: string;           // Legacy profiles.role
  personas: UserPersona[];
  primaryPersona: PortalPersona;
  activePersona?: PortalPersona;
}
```

## 4.2 Detection Function (`src/lib/persona.ts`)

```typescript
import { createServiceClient } from '@/lib/supabase/server';

export async function getUserPersonas(userId: string): Promise<UserPersona[]> {
  const supabase = createServiceClient();
  const personas: UserPersona[] = [];

  // 1. Check profiles.role for CEO
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profile?.role === 'staff_admin') {
    personas.push({ type: 'ceo', label: 'CEO' });
  }

  // 2. Check investor_users for Investor
  const { data: investorLinks } = await supabase
    .from('investor_users')
    .select('investor_id, investors(name)')
    .eq('user_id', userId);

  if (investorLinks && investorLinks.length > 0) {
    personas.push({
      type: 'investor',
      label: 'Investor',
      entityId: investorLinks[0].investor_id,
      entityName: investorLinks[0].investors?.name
    });
  }

  // 3. Check arranger_users for Arranger
  const { data: arrangerLinks } = await supabase
    .from('arranger_users')
    .select('arranger_entity_id, arranger_entities(name)')
    .eq('user_id', userId);

  if (arrangerLinks && arrangerLinks.length > 0) {
    personas.push({
      type: 'arranger',
      label: 'Arranger',
      entityId: arrangerLinks[0].arranger_entity_id,
      entityName: arrangerLinks[0].arranger_entities?.name
    });
  }

  // 4. Check introducers for Introducer
  const { data: introducerLinks } = await supabase
    .from('introducers')
    .select('id, name, introducer_type')
    .eq('user_id', userId);

  if (introducerLinks && introducerLinks.length > 0) {
    const intro = introducerLinks[0];
    if (intro.introducer_type === 'commercial') {
      personas.push({
        type: 'commercial_partner',
        label: 'Commercial Partner',
        entityId: intro.id,
        entityName: intro.name
      });
    } else {
      personas.push({
        type: 'introducer',
        label: 'Introducer',
        entityId: intro.id,
        entityName: intro.name
      });
    }
  }

  // 5. Check deal_memberships for Lawyer
  const { data: lawyerDeals } = await supabase
    .from('deal_memberships')
    .select('id')
    .eq('user_id', userId)
    .eq('role', 'lawyer')
    .limit(1);

  if (lawyerDeals && lawyerDeals.length > 0) {
    personas.push({ type: 'lawyer', label: 'Lawyer' });
  }

  // 6. Partner = Investor + Introducer (auto-detected)
  const hasInvestor = personas.some(p => p.type === 'investor');
  const hasIntroducer = personas.some(p => p.type === 'introducer');
  if (hasInvestor && hasIntroducer) {
    personas.push({ type: 'partner', label: 'Partner' });
  }

  return personas;
}

export function getPrimaryPersona(personas: UserPersona[]): PortalPersona {
  // Priority order for default persona
  const priority: PortalPersona[] = [
    'ceo', 'arranger', 'partner', 'investor', 'introducer', 'commercial_partner', 'lawyer'
  ];
  for (const p of priority) {
    if (personas.some(up => up.type === p)) return p;
  }
  return 'investor'; // fallback
}
```

---

# 5. MIDDLEWARE (`src/middleware.ts`)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserPersonas, getPrimaryPersona } from '@/lib/persona';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ============================================
  // ADMIN PORTAL - Admin only
  // ============================================
  if (pathname.startsWith('/versotech_admin')) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/versotech_main/login', request.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'staff_admin') {
      return NextResponse.redirect(new URL('/versotech_main/dashboard', request.url));
    }

    return NextResponse.next();
  }

  // ============================================
  // MAIN PORTAL - All personas
  // ============================================
  if (pathname.startsWith('/versotech_main')) {
    // Skip login page
    if (pathname === '/versotech_main/login') {
      return NextResponse.next();
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/versotech_main/login', request.url));
    }

    // Get personas and store in cookie for layout
    const personas = await getUserPersonas(user.id);
    const activePersona = request.cookies.get('verso_active_persona')?.value
      || getPrimaryPersona(personas);

    const response = NextResponse.next();
    response.cookies.set('verso_personas', JSON.stringify(personas), { path: '/' });
    response.cookies.set('verso_active_persona', activePersona, { path: '/' });
    return response;
  }

  // ============================================
  // LEGACY REDIRECTS
  // ============================================

  // Investor portal redirects
  if (pathname.startsWith('/versoholdings')) {
    const newPath = pathname
      .replace('/versoholdings/deals', '/versotech_main/opportunities')
      .replace('/versoholdings/deal/', '/versotech_main/opportunities/')
      .replace('/versoholdings/holdings', '/versotech_main/portfolio')
      .replace('/versoholdings/vehicle/', '/versotech_main/portfolio/')
      .replace('/versoholdings/tasks', '/versotech_main/inbox')
      .replace('/versoholdings/notifications', '/versotech_main/inbox')
      .replace('/versoholdings/messages', '/versotech_main/inbox')
      .replace('/versoholdings/reports', '/versotech_main/documents')
      .replace('/versoholdings/data-rooms', '/versotech_main/opportunities')
      .replace('/versoholdings', '/versotech_main');
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Staff portal redirects
  if (pathname.startsWith('/versotech/staff')) {
    const newPath = pathname
      .replace('/versotech/staff/deals', '/versotech_main/deals')
      .replace('/versotech/staff/investors', '/versotech_main/users')
      .replace('/versotech/staff/arrangers', '/versotech_main/users')
      .replace('/versotech/staff/introducers', '/versotech_main/users')
      .replace('/versotech/staff/approvals', '/versotech_main/inbox')
      .replace('/versotech/staff/messages', '/versotech_main/inbox')
      .replace('/versotech/staff/fees', '/versotech_main/fees')
      .replace('/versotech/staff/kyc-review', '/versotech_main/kyc-review')
      .replace('/versotech/staff/versosign', '/versotech_main/versosign')
      .replace('/versotech/staff', '/versotech_main');
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/versotech_admin/:path*',
    '/versotech_main/:path*',
    '/versoholdings/:path*',
    '/versotech/staff/:path*',
  ],
};
```

---

# 6. PERSONA-SPECIFIC NAVIGATION

## 6.1 Navigation Config (`src/lib/navigation.ts`)

```typescript
import { PortalPersona } from '@/types/persona';

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: number;
}

export function getNavigationForPersona(persona: PortalPersona): NavItem[] {
  const shared: NavItem[] = [
    { label: 'Dashboard', href: '/versotech_main/dashboard', icon: 'home' },
  ];

  const sharedEnd: NavItem[] = [
    { label: 'Documents', href: '/versotech_main/documents', icon: 'file' },
    { label: 'Inbox', href: '/versotech_main/inbox', icon: 'inbox' },
    { label: 'Profile', href: '/versotech_main/profile', icon: 'user' },
  ];

  switch (persona) {
    case 'investor':
      return [
        ...shared,
        { label: 'Investment Opportunities', href: '/versotech_main/opportunities', icon: 'trending-up' },
        { label: 'Portfolio', href: '/versotech_main/portfolio', icon: 'briefcase' },
        ...sharedEnd,
      ];

    case 'ceo':
      return [
        ...shared,
        { label: 'Deal Management', href: '/versotech_main/deals', icon: 'layers' },
        { label: 'Users', href: '/versotech_main/users', icon: 'users' },
        { label: 'Inbox', href: '/versotech_main/inbox', icon: 'inbox' },
        { label: 'Fees & Reconciliation', href: '/versotech_main/fees', icon: 'dollar-sign' },
        { label: 'KYC Review', href: '/versotech_main/kyc-review', icon: 'shield' },
        { label: 'Audit', href: '/versotech_main/audit', icon: 'search' },
        { label: 'Verso Sign', href: '/versotech_main/versosign', icon: 'pen-tool' },
        { label: 'Documents', href: '/versotech_main/documents', icon: 'file' },
      ];

    case 'arranger':
      return [
        ...shared,
        { label: 'My Mandates', href: '/versotech_main/mandates', icon: 'clipboard' },
        { label: 'Fees', href: '/versotech_main/fees', icon: 'dollar-sign' },
        ...sharedEnd,
      ];

    case 'introducer':
      return [
        ...shared,
        { label: 'My Introductions', href: '/versotech_main/introductions', icon: 'users' },
        { label: 'My Commissions', href: '/versotech_main/commissions', icon: 'dollar-sign' },
        { label: 'My Agreements', href: '/versotech_main/agreements', icon: 'file-text' },
        ...sharedEnd,
      ];

    case 'lawyer':
      return [
        ...shared,
        { label: 'My Assigned Deals', href: '/versotech_main/assigned-deals', icon: 'folder' },
        { label: 'Signatures', href: '/versotech_main/versosign', icon: 'pen-tool' },
        ...sharedEnd,
      ];

    case 'partner':
      return [
        ...shared,
        // Investor features
        { label: 'Investment Opportunities', href: '/versotech_main/opportunities', icon: 'trending-up' },
        { label: 'My Investments', href: '/versotech_main/portfolio', icon: 'briefcase' },
        // Partner features
        { label: 'My Transactions (Partner)', href: '/versotech_main/partner-transactions', icon: 'repeat' },
        ...sharedEnd,
      ];

    case 'commercial_partner':
      return [
        ...shared,
        // Investor features
        { label: 'Investment Opportunities', href: '/versotech_main/opportunities', icon: 'trending-up' },
        { label: 'My Investments', href: '/versotech_main/portfolio', icon: 'briefcase' },
        // Commercial Partner features
        { label: 'My Clients', href: '/versotech_main/clients', icon: 'building' },
        { label: 'Placement Agreements', href: '/versotech_main/agreements', icon: 'file-text' },
        ...sharedEnd,
      ];

    default:
      return [...shared, ...sharedEnd];
  }
}
```

## 6.2 Persona Switcher Component

```typescript
// src/components/persona/persona-switcher.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPersona, PortalPersona } from '@/types/persona';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check } from 'lucide-react';

interface PersonaSwitcherProps {
  personas: UserPersona[];
  activePersona: PortalPersona;
}

export function PersonaSwitcher({ personas, activePersona }: PersonaSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (personas.length <= 1) return null; // No switcher needed

  const current = personas.find(p => p.type === activePersona);

  const handleSwitch = async (persona: PortalPersona) => {
    document.cookie = `verso_active_persona=${persona}; path=/`;
    router.refresh();
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          Viewing as: {current?.label || activePersona}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {personas.map((p) => (
          <DropdownMenuItem
            key={p.type}
            onClick={() => handleSwitch(p.type)}
            className="gap-2"
          >
            {p.type === activePersona && <Check className="h-4 w-4" />}
            {p.type !== activePersona && <span className="w-4" />}
            {p.label}
            {p.entityName && <span className="text-muted-foreground">({p.entityName})</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

# 7. SHARED SURFACES

## 7.1 Dashboard (Persona-Aware)

| Persona | Dashboard Shows |
|---------|-----------------|
| Investor | Portfolio NAV, performance, pending tasks, recent activity |
| CEO | KYC pipeline, request queue, deal flow, system health, approvals count |
| Arranger | Active mandates, fees due, vehicle performance |
| Introducer | Active referrals, pending commissions, conversion rate |
| Lawyer | Assigned deals, pending signatures, recent documents |
| Partner | Combined: Portfolio metrics + Referral metrics |
| Commercial Partner | Client portfolio, placement agreements, fees |

## 7.2 Inbox (Combined Messages + Approvals + Tasks)

```
Tabs: [All] [Messages] [Approvals] [Tasks]

- CEO sees: Messages + Approvals
- Investor sees: Messages + Tasks
- Others see: Messages + Tasks relevant to them
```

## 7.3 Documents (Persona-Filtered)

| Persona | Sees Documents |
|---------|----------------|
| Investor | K-1s, statements, subscription docs, signed agreements |
| CEO | All platform documents |
| Arranger | Deal documents, fee agreements, vehicle docs |
| Introducer | Introduction agreements, commission statements |
| Lawyer | Signed documents for assigned deals |
| Partner | Investor docs + Introducer docs |
| Commercial Partner | Placement agreements, client docs |

## 7.4 Profile (Persona Tabs)

| Tab | Available To |
|-----|--------------|
| Personal Info | All |
| KYC | Investors, Partners, Commercial Partners |
| Compliance | Investors, Partners |
| Investment Entities | Investors, Partners, Commercial Partners |
| Bank Details | All |
| Settings | All |

---

# 8. IMPLEMENTATION PHASES

## Phase Dependency Graph

```
                    ┌─────────────────────────────────────────────────────────────┐
                    │                    PHASE 2.0 (Foundation)                    │
                    │    Portal Skeleton + Persona-Aware Auth + Theme Toggle       │
                    │                                                              │
                    │  DB: Add arranger_users table                                │
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

## Phase 2.0: Foundation (MUST COMPLETE FIRST)

**Effort:** ~25 hours | **Risk:** HIGH

**Deliverables:**
1. Database migration: `arranger_users` table
2. New types: `src/types/persona.ts`
3. Persona detection: `src/lib/persona.ts`
4. Updated middleware: `src/middleware.ts`
5. Main portal layout: `src/app/(main)/versotech_main/layout.tsx`
6. Theme toggle: Update `src/components/theme-provider.tsx`
7. Persona switcher: `src/components/persona/persona-switcher.tsx`
8. Single login page: `src/app/(main)/versotech_main/login/page.tsx`

**Files to Create:**
```
src/types/persona.ts
src/lib/persona.ts
src/lib/navigation.ts
src/components/persona/persona-switcher.tsx
src/app/(main)/versotech_main/layout.tsx
src/app/(main)/versotech_main/login/page.tsx
src/app/(main)/versotech_main/dashboard/page.tsx
```

**Files to Modify:**
```
src/middleware.ts
src/components/theme-provider.tsx
src/components/layout/app-layout.tsx
src/components/layout/sidebar.tsx
```

## Phase 2.1: Investor Journey Restructure

**Effort:** ~15 hours | **Risk:** MEDIUM | **Depends:** 2.0

**Deliverables:**
1. Rename "Active Deals" to "Investment Opportunities"
2. Journey bar component showing: Interest → NDA → Data Room → Subscription → Funding → Active
3. Integrate data room directly into deal detail page
4. Portfolio shown only when investment is active

**Files to Create:**
```
src/components/deals/journey-bar.tsx
src/app/(main)/versotech_main/opportunities/page.tsx
src/app/(main)/versotech_main/opportunities/[id]/page.tsx
src/app/(main)/versotech_main/portfolio/page.tsx
src/app/(main)/versotech_main/portfolio/[id]/page.tsx
```

## Phase 2.2: Tasks + Notifications Header Panel

**Effort:** ~10 hours | **Risk:** LOW | **Depends:** 2.0

**Deliverables:**
1. Create unified notification center component
2. Move tasks + notifications from sidebar to header
3. Group by investment opportunity and category

**Files to Create:**
```
src/components/notification-center/notification-center.tsx
```

**Files to Modify:**
```
src/components/layout/sidebar.tsx (remove Tasks, Notifications)
src/components/layout/app-layout.tsx (add header notification center)
```

## Phase 2.3: Documents Simplification

**Effort:** ~4 hours | **Risk:** LOW | **Depends:** 2.0

**Deliverables:**
1. Rename "Reports" to "Documents" in navigation
2. Merge report request functionality into Documents page

**Files to Create:**
```
src/app/(main)/versotech_main/documents/page.tsx
```

## Phase 2.4: Profile Tab Restructuring

**Effort:** ~6 hours | **Risk:** LOW | **Depends:** 2.0, 2.2

**Deliverables:**
1. Split "KYC & Onboarding" into KYC tab and Compliance tab
2. Rename "Entities" to "Investment Entities"

**Files to Modify:**
```
src/components/profile/profile-page-client.tsx
```

## Phase 2.5: CEO Tools Consolidation

**Effort:** ~15 hours | **Risk:** MEDIUM | **Depends:** 2.0

**Deliverables:**
1. Consolidated Users page with tabs: Investors | Arrangers | Introducers | All
2. Merged Inbox: All | Approvals | Messages

**Files to Create:**
```
src/app/(main)/versotech_main/users/page.tsx
src/app/(main)/versotech_main/inbox/page.tsx
src/components/inbox/unified-inbox.tsx
```

## Phase 2.6: Admin Portal Carve-Out

**Effort:** ~10 hours | **Risk:** LOW | **Depends:** 2.0, 2.5

**Deliverables:**
1. Admin portal route group
2. Platform metrics dashboard
3. CMS placeholder
4. Growth analytics placeholder
5. Platform settings

**Files to Create:**
```
src/app/(admin)/versotech_admin/layout.tsx
src/app/(admin)/versotech_admin/page.tsx
src/app/(admin)/versotech_admin/dashboard/page.tsx
src/app/(admin)/versotech_admin/cms/page.tsx
src/app/(admin)/versotech_admin/growth/page.tsx
src/app/(admin)/versotech_admin/settings/page.tsx
```

---

# 9. EFFORT & TIMELINE

| Phase | Effort | Risk | Week |
|-------|--------|------|------|
| 2.0 Foundation | ~25h | HIGH | 1-2 |
| 2.1 Investor Journey | ~15h | MEDIUM | 3-4 |
| 2.2 Tasks/Notifications | ~10h | LOW | 3 |
| 2.3 Documents | ~4h | LOW | 3 |
| 2.4 Profile Tabs | ~6h | LOW | 5 |
| 2.5 CEO Tools | ~15h | MEDIUM | 3-4 |
| 2.6 Admin Portal | ~10h | LOW | 5 |
| **Total** | **~85h** | - | **5 weeks** |

---

# 10. LEGACY REDIRECTS

| Old URL | New URL |
|---------|---------|
| `/versoholdings/dashboard` | `/versotech_main/dashboard` |
| `/versoholdings/deals` | `/versotech_main/opportunities` |
| `/versoholdings/deal/[id]` | `/versotech_main/opportunities/[id]` |
| `/versoholdings/holdings` | `/versotech_main/portfolio` |
| `/versoholdings/vehicle/[id]` | `/versotech_main/portfolio/[id]` |
| `/versoholdings/tasks` | `/versotech_main/inbox` |
| `/versoholdings/notifications` | `/versotech_main/inbox` |
| `/versoholdings/messages` | `/versotech_main/inbox` |
| `/versoholdings/reports` | `/versotech_main/documents` |
| `/versoholdings/data-rooms` | `/versotech_main/opportunities` |
| `/versoholdings/profile` | `/versotech_main/profile` |
| `/versotech/staff` | `/versotech_main/dashboard` |
| `/versotech/staff/deals` | `/versotech_main/deals` |
| `/versotech/staff/investors` | `/versotech_main/users` |
| `/versotech/staff/arrangers` | `/versotech_main/users` |
| `/versotech/staff/introducers` | `/versotech_main/users` |
| `/versotech/staff/approvals` | `/versotech_main/inbox` |
| `/versotech/staff/messages` | `/versotech_main/inbox` |
| `/versotech/staff/fees` | `/versotech_main/fees` |
| `/versotech/staff/kyc-review` | `/versotech_main/kyc-review` |

---

# 11. THEME SYSTEM

```typescript
// src/components/theme-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('verso_theme') as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('verso_theme', theme);

    // Resolve theme
    let resolved: 'light' | 'dark' = 'light';
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = theme;
    }
    setResolvedTheme(resolved);

    // Apply to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolved);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

**Theme Toggle in User Menu:**
- Light mode (default): Blue/white investor look
- Dark mode: Staff portal dark look
- System: Follow OS preference

---

# 12. RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|------------|
| Persona detection errors | HIGH | Thorough testing, fallback to legacy `profiles.role` |
| Breaking existing workflows | HIGH | Parallel routes + redirects, feature flags |
| Theme persistence issues | LOW | localStorage + optional DB fallback |
| User confusion with new UI | MEDIUM | In-app guidance, gradual rollout |
| Hybrid user edge cases | MEDIUM | Extensive testing with multi-persona accounts |

---

# 13. ACCEPTANCE CRITERIA

## Portal Structure
- [ ] `/versotech_main` exists and is the default for all deal-related personas
- [ ] `/versotech_admin` exists and is accessible only to admin roles
- [ ] Legacy URLs redirect cleanly (no loops)

## Hybrid Users
- [ ] User with multiple personas sees persona switcher
- [ ] Switching persona updates navigation immediately
- [ ] Each persona has correct access to features

## Investor/Main UX
- [ ] "Investment Opportunities" replaces "Active Deals"
- [ ] Journey bar shows progress through deal stages
- [ ] Data room integrated in deal detail (not separate page)
- [ ] Tasks + Notifications in header (not sidebar)
- [ ] "Documents" replaces "Reports"
- [ ] Profile splits KYC vs Compliance tabs

## Staff/CEO UX
- [ ] Users page consolidates Investors + Arrangers + Introducers
- [ ] Inbox merges Messages + Approvals

## Theme
- [ ] Default to light theme
- [ ] User can toggle light/dark/system
- [ ] Preference persists across sessions

---

# 14. FILES SUMMARY

## New Files to Create

```
# Types
src/types/persona.ts

# Auth/Persona
src/lib/persona.ts
src/lib/navigation.ts

# Components
src/components/persona/persona-switcher.tsx
src/components/notification-center/notification-center.tsx
src/components/inbox/unified-inbox.tsx
src/components/deals/journey-bar.tsx

# Admin Portal
src/app/(admin)/versotech_admin/layout.tsx
src/app/(admin)/versotech_admin/page.tsx
src/app/(admin)/versotech_admin/dashboard/page.tsx
src/app/(admin)/versotech_admin/cms/page.tsx
src/app/(admin)/versotech_admin/growth/page.tsx
src/app/(admin)/versotech_admin/settings/page.tsx

# Main Portal
src/app/(main)/versotech_main/layout.tsx
src/app/(main)/versotech_main/login/page.tsx
src/app/(main)/versotech_main/dashboard/page.tsx
src/app/(main)/versotech_main/inbox/page.tsx
src/app/(main)/versotech_main/documents/page.tsx
src/app/(main)/versotech_main/versosign/page.tsx
src/app/(main)/versotech_main/profile/page.tsx

# Investor
src/app/(main)/versotech_main/opportunities/page.tsx
src/app/(main)/versotech_main/opportunities/[id]/page.tsx
src/app/(main)/versotech_main/portfolio/page.tsx
src/app/(main)/versotech_main/portfolio/[id]/page.tsx

# CEO/Staff
src/app/(main)/versotech_main/deals/page.tsx
src/app/(main)/versotech_main/deals/[id]/page.tsx
src/app/(main)/versotech_main/users/page.tsx
src/app/(main)/versotech_main/users/[id]/page.tsx
src/app/(main)/versotech_main/kyc-review/page.tsx
src/app/(main)/versotech_main/fees/page.tsx
src/app/(main)/versotech_main/audit/page.tsx

# Arranger
src/app/(main)/versotech_main/mandates/page.tsx
src/app/(main)/versotech_main/mandates/[id]/page.tsx

# Introducer
src/app/(main)/versotech_main/introductions/page.tsx
src/app/(main)/versotech_main/introductions/[id]/page.tsx
src/app/(main)/versotech_main/commissions/page.tsx
src/app/(main)/versotech_main/agreements/page.tsx

# Lawyer
src/app/(main)/versotech_main/assigned-deals/page.tsx
src/app/(main)/versotech_main/assigned-deals/[id]/page.tsx

# Partner/Commercial Partner
src/app/(main)/versotech_main/partner-transactions/page.tsx
src/app/(main)/versotech_main/clients/page.tsx

# Database
supabase/migrations/YYYYMMDD_add_arranger_users.sql
```

## Files to Modify

```
src/middleware.ts
src/components/theme-provider.tsx
src/components/layout/app-layout.tsx
src/components/layout/sidebar.tsx
src/components/layout/user-menu.tsx
src/components/profile/profile-page-client.tsx
```

---

# 15. QUICK REFERENCE

## Architecture
- **TWO PORTALS:** Admin (`/versotech_admin/*`) + Main (`/versotech_main/*`)
- **ALL 7 PERSONAS** in ONE Main Portal
- **NO SEPARATE PORTALS** per persona

## Personas
1. Investor - `investor_users`
2. CEO - `profiles.role = 'staff_admin'`
3. Arranger - `arranger_users` (NEW)
4. Introducer - `introducers.user_id`
5. Lawyer - `deal_memberships.role = 'lawyer'`
6. Partner - Investor + Introducer (auto-detected)
7. Commercial Partner - `introducers.type = 'commercial'`

## Key UX Changes
- "Active Deals" → "Investment Opportunities"
- Data Room → Embedded in deal detail
- Tasks + Notifications → Header panel (not sidebar)
- "Reports" → "Documents"
- Profile KYC & Onboarding → Split into KYC + Compliance tabs
- Investors + Arrangers + Introducers → Consolidated "Users" page
- Messages + Approvals → Merged "Inbox"

## Database
- **ONE NEW TABLE:** `arranger_users`
- Everything else already exists

---

**END OF DOCUMENT**

*This is the ONLY planning document you need. All other planning files are superseded by this master plan.*
