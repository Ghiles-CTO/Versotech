# VERSO Phase 2: Complete Portal Views Specification

**Document Version:** 2.0 (CORRECTED)
**Date:** December 16, 2025
**Status:** CORRECTED - All 7 Personas in ONE Main Portal
**Purpose:** Exhaustive specification of persona views WITHIN the unified Main Portal

---

# CRITICAL CORRECTION

**WRONG (Previous Version):**
```
/versoholdings/*        - Investor Portal
/versotech/staff/*      - Staff Portal
/versotech_admin/*      - Admin Portal
/introducer/*           - SEPARATE Introducer Portal ← WRONG!
/participant/*          - SEPARATE Participant Portal ← WRONG!
```

**CORRECT (Per plan_next_phase.md):**
```
/versotech_admin/*      - Admin Portal (CMS, SaaS, Growth Marketing ONLY)
/versotech_main/*       - ONE Main Portal for ALL 7 personas
```

**ALL 7 personas share ONE Main Portal at `/versotech_main/*`:**
1. CEO
2. Arranger
3. Investor
4. Introducer
5. Lawyer
6. Partner (Hybrid: Investor + Introducer)
7. Commercial Partner

---

# TABLE OF CONTENTS

1. [Portal Architecture Overview](#1-portal-architecture-overview)
2. [Main Portal: Shared Surfaces](#2-main-portal-shared-surfaces)
3. [Persona-Specific Views](#3-persona-specific-views)
   - 3.1 [Investor View](#31-investor-view)
   - 3.2 [CEO View](#32-ceo-view)
   - 3.3 [Arranger View](#33-arranger-view)
   - 3.4 [Introducer View](#34-introducer-view)
   - 3.5 [Lawyer View](#35-lawyer-view)
   - 3.6 [Partner View (Hybrid)](#36-partner-view-hybrid)
   - 3.7 [Commercial Partner View](#37-commercial-partner-view)
4. [Hybrid User Persona Switching](#4-hybrid-user-persona-switching)
5. [Technical Implementation](#5-technical-implementation)

---

# 1. PORTAL ARCHITECTURE OVERVIEW

## 1.1 Two Portals Only

| Portal | URL | Access | Purpose |
|--------|-----|--------|---------|
| **Admin Portal** | `/versotech_admin/*` | Admin only | CMS, SaaS management, Growth marketing |
| **Main Portal** | `/versotech_main/*` | All 7 personas | Deal management, investments, all user journeys |

## 1.2 All 7 Personas in ONE Main Portal

| Persona | Type | Primary Use Case |
|---------|------|------------------|
| **Investor** | External | Invest in deals, manage portfolio, view documents |
| **CEO** | Internal | Full platform control, approvals, user management |
| **Arranger** | Internal/External | Structure deals, manage vehicles, fees |
| **Introducer** | External | Track referrals, view commissions |
| **Lawyer** | External | Access assigned deals, view signed documents |
| **Partner** | External (Hybrid) | Investor + Introducer capabilities |
| **Commercial Partner** | External | Entity-level partner with placement agreements |

## 1.3 Key Architecture Principles (from plan_next_phase.md)

1. **System detects user roles** and routes them to the right experience within the same portal
2. **Hybrid users** (users having several roles) are supported
3. **Same login** for all external users
4. **Same login** for all CEOs
5. **Authentication, documents, signatures, messaging** shared but adjusted per persona
6. **Verso Sign** works for everyone for each role including hybrid users

## 1.4 URL Structure

```
/versotech_admin/                    - Admin Portal (separate)
  └── dashboard/                     - Platform metrics
  └── cms/                           - Content management
  └── growth/                        - Growth marketing
  └── settings/                      - Platform settings

/versotech_main/                     - Main Portal (ALL personas)
  ├── login                          - Single login for all
  ├── dashboard                      - Persona-aware dashboard
  ├── opportunities                  - Investment opportunities (Investor view)
  ├── portfolio                      - Investments/holdings
  ├── deals                          - Deal management (Staff view)
  ├── mandates                       - Arranger mandates
  ├── introductions                  - Introducer referrals
  ├── clients                        - Partner/Commercial Partner clients
  ├── users                          - User management (CEO/Staff)
  ├── inbox                          - Messages + Approvals
  ├── documents                      - All documents
  ├── versosign                      - Signing queue
  └── profile                        - User profile

Legacy redirects:
/versoholdings/* → /versotech_main/* (investors)
/versotech/staff/* → /versotech_main/* (staff)
```

---

# 2. MAIN PORTAL: SHARED SURFACES

These surfaces are available to ALL personas with persona-appropriate content.

## 2.1 Dashboard (`/versotech_main/dashboard`)

**Persona-Aware Content:**

| Persona | Dashboard Shows |
|---------|-----------------|
| Investor | Portfolio NAV, performance, pending tasks, recent activity |
| CEO | KYC pipeline, request queue, deal flow, system health, approvals |
| Arranger | Active mandates, fees due, vehicle performance |
| Introducer | Active referrals, pending commissions, conversion rate |
| Lawyer | Assigned deals, pending signatures, recent documents |
| Partner | Combined: Portfolio + Referrals |
| Commercial Partner | Client portfolio, placement agreements, fees |

## 2.2 Inbox (`/versotech_main/inbox`)

**Combined Messages + Approvals + Notifications**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Inbox                                              [🔔 5] [John ▼]     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [All] [Messages (3)] [Approvals (2)] [Tasks (5)]                       │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ 📩 New message from Relationship Manager            2 hours ago    │ │
│  │    Re: TechVentures III subscription docs                          │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ ✅ APPROVAL: New investor onboarding                 Today         │ │
│  │    John Smith - $500K commitment to Healthcare SPV                 │ │
│  │    [Approve] [Reject] [View Details]                               │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2.3 Documents (`/versotech_main/documents`)

**All documents accessible based on persona permissions**

| Persona | Sees Documents |
|---------|----------------|
| Investor | K-1s, statements, subscription docs, signed agreements |
| CEO | All platform documents |
| Arranger | Deal documents, fee agreements, vehicle docs |
| Introducer | Introduction agreements, commission statements |
| Lawyer | Signed documents for assigned deals |
| Partner | Investor docs + Introducer docs |
| Commercial Partner | Placement agreements, client docs |

## 2.4 Profile (`/versotech_main/profile`)

**Persona-Aware Tabs:**

| Tab | Available To | Content |
|-----|--------------|---------|
| Personal Info | All | Name, email, contact |
| KYC | Investors, Partners | Document uploads, verification status |
| Compliance | Investors, Partners | Questionnaire, accreditation |
| Entities | Investors, Partners | Investment entities |
| Bank Details | All | Bank accounts for distributions/payments |
| Settings | All | Theme, notifications, preferences |

## 2.5 Verso Sign (`/versotech_main/versosign`)

**Universal signing experience for all personas**

- Queue of documents requiring signature
- Works for: subscription docs, NDAs, fee agreements, legal docs
- Hybrid users see all their signing tasks regardless of persona

---

# 3. PERSONA-SPECIFIC VIEWS

## 3.1 Investor View

### Navigation (When persona = Investor)
```
┌─────────────────────────────────────┐
│  🏠 Dashboard                        │
│  📈 Investment Opportunities         │
│  💼 Portfolio                        │
│  📄 Documents                        │
│  📬 Inbox                            │
│  ─────────────────────────────       │
│  👤 Profile                          │
│  ⚙️ Settings                         │
└─────────────────────────────────────┘
```

### Investment Opportunities (`/versotech_main/opportunities`)

Shows deals the investor has access to with journey bar:

```
○───────●───────○───────○───────○───────○
Interest  NDA   DataRoom  Sub   Funding  Active
         [You]
```

**Data Room Integration:** Pre-investment data room is embedded in the deal detail page (not separate).

### Portfolio (`/versotech_main/portfolio`)

Shows active investments:
- Position breakdown
- NAV and performance
- Distribution history
- Documents (K-1s, statements)

---

## 3.2 CEO View

### Navigation (When persona = CEO)
```
┌─────────────────────────────────────┐
│  🏠 Dashboard                        │
│  📊 Deal Management                  │
│  👥 Users                            │
│  📬 Inbox                            │
│  ─────────────────────────────       │
│  💰 Fees & Reconciliation            │
│  📋 KYC Review                       │
│  🔍 Audit                            │
│  ─────────────────────────────       │
│  ✍️ Verso Sign                       │
│  📄 Documents                        │
│  ⚙️ Settings                         │
└─────────────────────────────────────┘
```

### Deal Management (`/versotech_main/deals`)

Full deal lifecycle:
- Create/edit deals
- Term sheet dispatch
- NDA and data room management
- Subscription pack
- Funding and allocation
- Equity certificates
- Statement of holding

### Users (`/versotech_main/users`)

**Consolidated Users Page with Tabs:**
```
[Investors] [Arrangers] [Introducers] [Partners] [All]
```

- Create/approve/manage all user types
- View KYC status
- Manage relationships

### Inbox (`/versotech_main/inbox`)

**CEO sees: Messages + Approvals**
- Approval queue for onboarding, allocations, etc.
- Messages from investors and staff

---

## 3.3 Arranger View

### Navigation (When persona = Arranger)
```
┌─────────────────────────────────────┐
│  🏠 Dashboard                        │
│  📋 My Mandates                      │
│  👥 My Partners                      │
│  👥 My Introducers                   │
│  👥 My Commercial Partners           │
│  ⚖️ My Lawyers                       │
│  ─────────────────────────────       │
│  💰 Fees                             │
│  📄 Documents                        │
│  📬 Inbox                            │
│  👤 Profile                          │
└─────────────────────────────────────┘
```

### My Mandates (`/versotech_main/mandates`)

Per user stories (2.Arranger):
- Subscription pack management
- Funding tracking
- Compartment reporting

### Fee Management

For arranger's partners, introducers, commercial partners:
- Fee models
- Payment tracking
- Performance views

---

## 3.4 Introducer View

### Navigation (When persona = Introducer)
```
┌─────────────────────────────────────┐
│  🏠 Dashboard                        │
│  🤝 My Introductions                 │
│  💰 My Commissions                   │
│  📜 My Agreements                    │
│  ─────────────────────────────       │
│  📄 Documents                        │
│  📬 Inbox                            │
│  👤 Profile                          │
└─────────────────────────────────────┘
```

### My Introductions (`/versotech_main/introductions`)

Per user stories (6.Introducer):
- View all referrals
- Track conversion status
- See investor performance post-investment

### My Commissions (`/versotech_main/commissions`)

- Commission calculations
- Payment history
- Fee models

### My Agreements (`/versotech_main/agreements`)

- Introduction fee agreements
- Signed documents

---

## 3.5 Lawyer View

### Navigation (When persona = Lawyer)
```
┌─────────────────────────────────────┐
│  🏠 Dashboard                        │
│  📂 My Assigned Deals                │
│  📄 Documents                        │
│  ✍️ Signatures                       │
│  ─────────────────────────────       │
│  📬 Inbox                            │
│  👤 Profile                          │
└─────────────────────────────────────┘
```

### My Assigned Deals (`/versotech_main/assigned-deals`)

Per user stories (3.Lawyer):
- Investment opportunities they're assigned to
- Subscription pack review
- Escrow account handling
- Equity certificates
- Statement of holding

### Documents (Lawyer-specific)

- Documents signed by other users when lawyer is assigned
- Legal agreements
- Transaction documents

### Notifications (Lawyer-specific)

Per user stories:
- Subscription pack notifications
- Escrow account funding
- Equity certificates
- Statement of holding
- Fee payment notifications
- Payment to sellers

---

## 3.6 Partner View (Hybrid)

**Partner = Investor + Introducer**

### Navigation (When persona = Partner)
```
┌─────────────────────────────────────┐
│  🏠 Dashboard                        │
│                                      │
│  AS INVESTOR:                        │
│  📈 Investment Opportunities         │
│  💼 My Investments                   │
│                                      │
│  AS PARTNER:                         │
│  🤝 My Transactions (Partner)        │
│  📊 Partner Reporting                │
│  ─────────────────────────────       │
│  📄 Documents                        │
│  📬 Inbox                            │
│  👤 Profile                          │
└─────────────────────────────────────┘
```

### My Transactions as Partner (`/versotech_main/partner-transactions`)

Per user stories (5.Partner):
- View transactions
- Tracking
- Reporting
- Shared transactions

Partners see ALL investor features PLUS partner-specific tracking.

---

## 3.7 Commercial Partner View

### Navigation (When persona = Commercial Partner)
```
┌─────────────────────────────────────┐
│  🏠 Dashboard                        │
│                                      │
│  AS INVESTOR:                        │
│  📈 Investment Opportunities         │
│  💼 My Investments                   │
│                                      │
│  AS COMMERCIAL PARTNER:              │
│  🏢 My Clients                       │
│  🤝 My Transactions                  │
│  📜 Placement Agreements             │
│  📊 Reporting                        │
│  ─────────────────────────────       │
│  📄 Documents                        │
│  📬 Inbox                            │
│  👤 Profile                          │
└─────────────────────────────────────┘
```

### My Clients (`/versotech_main/clients`)

Per user stories (7.Commercial Partner):
- Their clients and respective investments
- Fees
- Invoices

### Placement Agreements

- View and sign placement agreements
- Track agreement status

---

# 4. HYBRID USER PERSONA SWITCHING

## 4.1 How It Works

When a user has multiple personas, they see a **persona switcher** in the header:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  VERSO Platform                      [🔔 5]  [Viewing as: Investor ▼]   │
│                                               ┌─────────────────────┐   │
│                                               │ ✓ Investor          │   │
│                                               │   Introducer        │   │
│                                               │   ───────────────   │   │
│                                               │   All Notifications │   │
│                                               └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 4.2 Persona Detection

```typescript
async function getUserPersonas(userId: string): Promise<UserPersona[]> {
  const personas: UserPersona[] = [];

  // 1. Check investor_users → Investor persona
  const investorLink = await checkInvestorUsers(userId);
  if (investorLink) {
    personas.push({ type: 'investor', label: 'Investor' });
  }

  // 2. Check introducers.user_id → Introducer persona
  const introducerLink = await checkIntroducers(userId);
  if (introducerLink) {
    personas.push({ type: 'introducer', label: 'Introducer' });
  }

  // 3. Check profiles.role for staff personas
  const profile = await getProfile(userId);
  if (profile.role === 'staff_admin') {
    personas.push({ type: 'ceo', label: 'CEO' });
  }

  // 4. Check arranger_users → Arranger persona
  const arrangerLink = await checkArrangerUsers(userId);
  if (arrangerLink) {
    personas.push({ type: 'arranger', label: 'Arranger' });
  }

  // 5. Check deal_memberships for Lawyer persona
  const lawyerDeals = await checkDealMemberships(userId, 'lawyer');
  if (lawyerDeals.length > 0) {
    personas.push({ type: 'lawyer', label: 'Lawyer' });
  }

  // 6. Partner = Investor + Introducer (detected automatically)
  if (personas.includes('investor') && personas.includes('introducer')) {
    personas.push({ type: 'partner', label: 'Partner' });
  }

  return personas;
}
```

## 4.3 Navigation Changes Based on Persona

When user switches persona, the sidebar navigation updates to show relevant items.

**Example: User is both Investor and Introducer (Partner)**
- When "Investor" selected: Shows Investment Opportunities, Portfolio
- When "Introducer" selected: Shows Introductions, Commissions
- When "Partner" selected: Shows combined view with both + partner-specific features

---

# 5. TECHNICAL IMPLEMENTATION

## 5.1 Route Structure (Next.js App Router)

```
src/app/
  (public)/
    page.tsx                          # Landing page

  (admin)/
    versotech_admin/
      layout.tsx                      # Admin layout (admin-only)
      page.tsx                        # Dashboard redirect
      dashboard/page.tsx              # Platform metrics
      cms/page.tsx                    # Content management
      growth/page.tsx                 # Growth marketing
      settings/page.tsx               # Platform settings

  (main)/
    versotech_main/
      layout.tsx                      # Main portal layout (persona-aware)
      login/page.tsx                  # Single login for all
      page.tsx                        # Dashboard redirect

      # SHARED SURFACES
      dashboard/page.tsx              # Persona-aware dashboard
      inbox/page.tsx                  # Messages + Approvals + Tasks
      documents/page.tsx              # All documents
      versosign/page.tsx              # Signing queue
      profile/page.tsx                # User profile

      # INVESTOR SURFACES
      opportunities/
        page.tsx                      # Investment opportunities list
        [id]/page.tsx                 # Deal detail with journey bar + data room
      portfolio/
        page.tsx                      # Holdings/investments
        [id]/page.tsx                 # Position detail

      # CEO/STAFF SURFACES
      deals/
        page.tsx                      # Deal management
        new/page.tsx                  # Create deal
        [id]/page.tsx                 # Deal detail
      users/
        page.tsx                      # Consolidated users (tabs)
        [id]/page.tsx                 # User detail
      kyc-review/page.tsx             # KYC review queue
      fees/page.tsx                   # Fees & reconciliation
      audit/page.tsx                  # Audit logs

      # ARRANGER SURFACES
      mandates/
        page.tsx                      # Arranger mandates
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
      partner-transactions/page.tsx   # Partner view
      clients/page.tsx                # Commercial Partner clients
```

## 5.2 Middleware (Persona-Based Routing)

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin portal - admin only
  if (pathname.startsWith('/versotech_admin')) {
    const isAdmin = await checkIsAdmin(request);
    if (!isAdmin) {
      return NextResponse.redirect('/versotech_main/dashboard');
    }
  }

  // Main portal - detect personas
  if (pathname.startsWith('/versotech_main')) {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.redirect('/versotech_main/login');
    }

    const personas = await getUserPersonas(user.id);
    const activePersona = getActivePersona(request, personas);

    // Store persona in response headers for layout
    const response = NextResponse.next();
    response.headers.set('x-user-personas', JSON.stringify(personas));
    response.headers.set('x-active-persona', activePersona);
    return response;
  }

  // Legacy redirects
  if (pathname.startsWith('/versoholdings')) {
    return NextResponse.redirect(pathname.replace('/versoholdings', '/versotech_main'));
  }
  if (pathname.startsWith('/versotech/staff')) {
    return NextResponse.redirect(pathname.replace('/versotech/staff', '/versotech_main'));
  }
}
```

## 5.3 Layout (Persona-Aware Navigation)

```typescript
// src/app/(main)/versotech_main/layout.tsx
export default async function MainPortalLayout({ children }) {
  const user = await getCurrentUser();
  const personas = await getUserPersonas(user.id);
  const activePersona = cookies().get('verso_active_persona')?.value || personas[0].type;

  return (
    <AppLayout
      personas={personas}
      activePersona={activePersona}
      navigation={getNavigationForPersona(activePersona)}
    >
      {children}
    </AppLayout>
  );
}

function getNavigationForPersona(persona: PortalPersona): NavItem[] {
  switch (persona) {
    case 'investor':
      return [
        { label: 'Dashboard', href: '/versotech_main/dashboard' },
        { label: 'Investment Opportunities', href: '/versotech_main/opportunities' },
        { label: 'Portfolio', href: '/versotech_main/portfolio' },
        { label: 'Documents', href: '/versotech_main/documents' },
        { label: 'Inbox', href: '/versotech_main/inbox' },
        { label: 'Profile', href: '/versotech_main/profile' },
      ];
    case 'ceo':
      return [
        { label: 'Dashboard', href: '/versotech_main/dashboard' },
        { label: 'Deal Management', href: '/versotech_main/deals' },
        { label: 'Users', href: '/versotech_main/users' },
        { label: 'Inbox', href: '/versotech_main/inbox' },
        { label: 'Fees & Reconciliation', href: '/versotech_main/fees' },
        { label: 'KYC Review', href: '/versotech_main/kyc-review' },
        { label: 'Audit', href: '/versotech_main/audit' },
        { label: 'Verso Sign', href: '/versotech_main/versosign' },
        { label: 'Documents', href: '/versotech_main/documents' },
      ];
    case 'arranger':
      return [
        { label: 'Dashboard', href: '/versotech_main/dashboard' },
        { label: 'My Mandates', href: '/versotech_main/mandates' },
        { label: 'Fees', href: '/versotech_main/fees' },
        { label: 'Documents', href: '/versotech_main/documents' },
        { label: 'Inbox', href: '/versotech_main/inbox' },
        { label: 'Profile', href: '/versotech_main/profile' },
      ];
    case 'introducer':
      return [
        { label: 'Dashboard', href: '/versotech_main/dashboard' },
        { label: 'My Introductions', href: '/versotech_main/introductions' },
        { label: 'My Commissions', href: '/versotech_main/commissions' },
        { label: 'My Agreements', href: '/versotech_main/agreements' },
        { label: 'Documents', href: '/versotech_main/documents' },
        { label: 'Inbox', href: '/versotech_main/inbox' },
        { label: 'Profile', href: '/versotech_main/profile' },
      ];
    case 'lawyer':
      return [
        { label: 'Dashboard', href: '/versotech_main/dashboard' },
        { label: 'My Assigned Deals', href: '/versotech_main/assigned-deals' },
        { label: 'Documents', href: '/versotech_main/documents' },
        { label: 'Signatures', href: '/versotech_main/versosign' },
        { label: 'Inbox', href: '/versotech_main/inbox' },
        { label: 'Profile', href: '/versotech_main/profile' },
      ];
    case 'partner':
      return [
        { label: 'Dashboard', href: '/versotech_main/dashboard' },
        // Investor features
        { label: 'Investment Opportunities', href: '/versotech_main/opportunities' },
        { label: 'My Investments', href: '/versotech_main/portfolio' },
        // Partner features
        { label: 'My Transactions (Partner)', href: '/versotech_main/partner-transactions' },
        { label: 'Documents', href: '/versotech_main/documents' },
        { label: 'Inbox', href: '/versotech_main/inbox' },
        { label: 'Profile', href: '/versotech_main/profile' },
      ];
    case 'commercial_partner':
      return [
        { label: 'Dashboard', href: '/versotech_main/dashboard' },
        // Investor features
        { label: 'Investment Opportunities', href: '/versotech_main/opportunities' },
        { label: 'My Investments', href: '/versotech_main/portfolio' },
        // Commercial Partner features
        { label: 'My Clients', href: '/versotech_main/clients' },
        { label: 'My Transactions', href: '/versotech_main/partner-transactions' },
        { label: 'Placement Agreements', href: '/versotech_main/agreements' },
        { label: 'Documents', href: '/versotech_main/documents' },
        { label: 'Inbox', href: '/versotech_main/inbox' },
        { label: 'Profile', href: '/versotech_main/profile' },
      ];
    default:
      return [];
  }
}
```

## 5.4 Database Requirements

### Existing Tables (Already Work)
- `investor_users` - Links users to investor entities
- `introducers.user_id` - Links users to introducer entities (exists, needs activation)
- `deal_memberships` - Links users to deals with roles (lawyer, advisor, etc.)

### New Table Required
```sql
CREATE TABLE arranger_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  arranger_entity_id UUID NOT NULL REFERENCES arranger_entities(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, arranger_entity_id)
);
```

### Partner/Commercial Partner
- Partner: Detected automatically when user has BOTH investor_users + introducers records
- Commercial Partner: May need new table or extend introducers with type field

---

# 6. ROUTE SUMMARY

## 6.1 Admin Portal (`/versotech_admin/*`)

| Route | Page | Access |
|-------|------|--------|
| `/versotech_admin/dashboard` | Platform metrics | Admin only |
| `/versotech_admin/cms` | Content management | Admin only |
| `/versotech_admin/growth` | Growth marketing | Admin only |
| `/versotech_admin/settings` | Platform settings | Admin only |

## 6.2 Main Portal (`/versotech_main/*`)

### Shared Surfaces (All Personas)
| Route | Page |
|-------|------|
| `/versotech_main/dashboard` | Persona-aware dashboard |
| `/versotech_main/inbox` | Messages + Approvals + Tasks |
| `/versotech_main/documents` | All documents |
| `/versotech_main/versosign` | Signing queue |
| `/versotech_main/profile` | User profile |

### Investor/Partner/Commercial Partner Surfaces
| Route | Page |
|-------|------|
| `/versotech_main/opportunities` | Investment opportunities |
| `/versotech_main/opportunities/[id]` | Deal detail + data room |
| `/versotech_main/portfolio` | Holdings/investments |
| `/versotech_main/portfolio/[id]` | Position detail |

### CEO/Staff Surfaces
| Route | Page |
|-------|------|
| `/versotech_main/deals` | Deal management |
| `/versotech_main/deals/[id]` | Deal detail |
| `/versotech_main/users` | User management (tabs) |
| `/versotech_main/users/[id]` | User detail |
| `/versotech_main/kyc-review` | KYC review queue |
| `/versotech_main/fees` | Fees & reconciliation |
| `/versotech_main/audit` | Audit logs |

### Arranger Surfaces
| Route | Page |
|-------|------|
| `/versotech_main/mandates` | Arranger mandates |
| `/versotech_main/mandates/[id]` | Mandate detail |

### Introducer Surfaces
| Route | Page |
|-------|------|
| `/versotech_main/introductions` | Referrals |
| `/versotech_main/introductions/[id]` | Introduction detail |
| `/versotech_main/commissions` | Commission tracking |
| `/versotech_main/agreements` | Fee agreements |

### Lawyer Surfaces
| Route | Page |
|-------|------|
| `/versotech_main/assigned-deals` | Assigned deals |
| `/versotech_main/assigned-deals/[id]` | Deal detail (lawyer view) |

### Partner-Specific Surfaces
| Route | Page |
|-------|------|
| `/versotech_main/partner-transactions` | Partner transactions view |
| `/versotech_main/clients` | Commercial Partner clients |

---

# 7. LEGACY REDIRECTS

All old URLs redirect to new structure:

| Old URL | New URL |
|---------|---------|
| `/versoholdings/dashboard` | `/versotech_main/dashboard` |
| `/versoholdings/deals` | `/versotech_main/opportunities` |
| `/versoholdings/deal/[id]` | `/versotech_main/opportunities/[id]` |
| `/versoholdings/holdings` | `/versotech_main/portfolio` |
| `/versoholdings/tasks` | `/versotech_main/inbox` |
| `/versoholdings/notifications` | `/versotech_main/inbox` |
| `/versoholdings/messages` | `/versotech_main/inbox` |
| `/versoholdings/reports` | `/versotech_main/documents` |
| `/versoholdings/profile` | `/versotech_main/profile` |
| `/versotech/staff` | `/versotech_main/dashboard` |
| `/versotech/staff/deals` | `/versotech_main/deals` |
| `/versotech/staff/investors` | `/versotech_main/users` |
| `/versotech/staff/arrangers` | `/versotech_main/users` |
| `/versotech/staff/introducers` | `/versotech_main/users` |
| `/versotech/staff/approvals` | `/versotech_main/inbox` |
| `/versotech/staff/messages` | `/versotech_main/inbox` |

---

# 8. IMPLEMENTATION FILES

## 8.1 New Files Required

```
# Admin Portal
src/app/(admin)/versotech_admin/layout.tsx
src/app/(admin)/versotech_admin/page.tsx
src/app/(admin)/versotech_admin/dashboard/page.tsx
src/app/(admin)/versotech_admin/cms/page.tsx
src/app/(admin)/versotech_admin/growth/page.tsx
src/app/(admin)/versotech_admin/settings/page.tsx

# Main Portal Layout
src/app/(main)/versotech_main/layout.tsx
src/app/(main)/versotech_main/login/page.tsx

# Shared Surfaces
src/app/(main)/versotech_main/dashboard/page.tsx
src/app/(main)/versotech_main/inbox/page.tsx
src/app/(main)/versotech_main/documents/page.tsx
src/app/(main)/versotech_main/versosign/page.tsx
src/app/(main)/versotech_main/profile/page.tsx

# Investor Surfaces
src/app/(main)/versotech_main/opportunities/page.tsx
src/app/(main)/versotech_main/opportunities/[id]/page.tsx
src/app/(main)/versotech_main/portfolio/page.tsx
src/app/(main)/versotech_main/portfolio/[id]/page.tsx

# CEO/Staff Surfaces
src/app/(main)/versotech_main/deals/page.tsx
src/app/(main)/versotech_main/deals/[id]/page.tsx
src/app/(main)/versotech_main/users/page.tsx
src/app/(main)/versotech_main/users/[id]/page.tsx
src/app/(main)/versotech_main/kyc-review/page.tsx
src/app/(main)/versotech_main/fees/page.tsx
src/app/(main)/versotech_main/audit/page.tsx

# Arranger Surfaces
src/app/(main)/versotech_main/mandates/page.tsx
src/app/(main)/versotech_main/mandates/[id]/page.tsx

# Introducer Surfaces
src/app/(main)/versotech_main/introductions/page.tsx
src/app/(main)/versotech_main/introductions/[id]/page.tsx
src/app/(main)/versotech_main/commissions/page.tsx
src/app/(main)/versotech_main/agreements/page.tsx

# Lawyer Surfaces
src/app/(main)/versotech_main/assigned-deals/page.tsx
src/app/(main)/versotech_main/assigned-deals/[id]/page.tsx

# Partner Surfaces
src/app/(main)/versotech_main/partner-transactions/page.tsx
src/app/(main)/versotech_main/clients/page.tsx

# Components
src/components/persona/persona-switcher.tsx
src/components/persona/persona-aware-nav.tsx
src/components/inbox/unified-inbox.tsx

# Types
src/types/persona.ts

# Auth
src/lib/persona.ts (getUserPersonas function)
```

## 8.2 Files to Modify

```
src/middleware.ts                    # Add new routes, persona detection
src/lib/auth.ts                      # Extend with persona functions
src/components/layout/app-layout.tsx # Persona-aware layout
src/components/layout/sidebar.tsx    # Persona-aware navigation
src/components/theme-provider.tsx    # User-toggleable theme
```

## 8.3 Database Migration

```sql
-- supabase/migrations/YYYYMMDD_add_arranger_users.sql
CREATE TABLE arranger_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  arranger_entity_id UUID NOT NULL REFERENCES arranger_entities(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, arranger_entity_id)
);

ALTER TABLE arranger_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arranger_users_self" ON arranger_users
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "arranger_users_admin" ON arranger_users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'staff_admin')
  );
```

---

# 9. SUMMARY

**CORRECT ARCHITECTURE:**

1. **TWO PORTALS ONLY:**
   - `/versotech_admin/*` - Admin Portal (CMS, SaaS, Growth)
   - `/versotech_main/*` - Main Portal (ALL 7 personas)

2. **ALL 7 PERSONAS IN ONE MAIN PORTAL:**
   - CEO, Arranger, Investor, Introducer, Lawyer, Partner, Commercial Partner
   - Persona detection determines navigation and features
   - Hybrid users can switch personas

3. **NO SEPARATE PORTALS PER PERSONA:**
   - ~~`/introducer/*`~~ WRONG - Use `/versotech_main/introductions` instead
   - ~~`/participant/*`~~ WRONG - Use `/versotech_main/assigned-deals` instead
   - Everything is in ONE Main Portal with persona-based views

4. **SHARED SURFACES:**
   - Dashboard, Inbox, Documents, Verso Sign, Profile
   - Content filtered/customized based on active persona

5. **PERSONA-SPECIFIC NAVIGATION:**
   - Sidebar changes based on active persona
   - Persona switcher in header for hybrid users
