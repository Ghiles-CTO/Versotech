# INVESTOR Persona - Implementation Status Report

**Generated**: January 2, 2026
**Persona**: Investor
**Status**: ✅ FULLY IMPLEMENTED

---

## Executive Summary

The **Investor persona** provides a comprehensive self-service portal for Limited Partners (LPs) and institutional investors. It delivers a complete investment lifecycle experience from deal discovery through portfolio management. The persona includes **5 navigation pages** with **89 user stories** fully implemented.

### Key Metrics
| Metric | Count |
|--------|-------|
| Total Pages | 5 |
| User Stories | 89 |
| Implementation Status | 100% Complete |

---

## Navigation Structure

The Investor persona navigation is defined in `persona-sidebar.tsx`:

```typescript
investor: [
  { name: 'Dashboard', href: '/versotech_main/dashboard', icon: LayoutDashboard, description: 'Portfolio overview' },
  { name: 'Investment Opportunities', href: '/versotech_main/opportunities', icon: TrendingUp, description: 'Active deals & pipeline' },
  { name: 'Portfolio', href: '/versotech_main/portfolio', icon: Briefcase, description: 'My investments' },
  { name: 'Documents', href: '/versotech_main/documents', icon: FileText, description: 'My documents' },
  { name: 'Inbox', href: '/versotech_main/inbox', icon: MessageSquare, description: 'Tasks, messages & notifications' },
]
```

**Note**: Calendar is intentionally omitted for Investors (staff-only feature).

---

## Page-by-Page Implementation Details

---

### 1. Dashboard
**Route**: `/versotech_main/dashboard`
**Files**:
- `versotech-portal/src/app/(main)/versotech_main/dashboard/page.tsx`
- `versotech-portal/src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx`
- `versotech-portal/src/app/(main)/versotech_main/dashboard/investor-dashboard.tsx`
**Lines**: 763+
**Status**: ✅ Fully Implemented

The Investor Dashboard provides a personalized welcome experience with portfolio metrics, featured deals, action center, and VERSO concierge services.

#### Implementation Highlights

```typescript
// Dashboard Data Fetched in Parallel
const [
  profileRes,      // User profile (display_name, avatar_url)
  vehiclesRes,     // Vehicles with active subscriptions
  dealsRes,        // Featured deals user has access to
  tasksRes,        // Outstanding tasks
  activityRes,     // Recent deal activity events
  positionsRes     // Check if user has portfolio data
] = await Promise.all([...])

// Summary Tiles
const summaryTiles = [
  { label: 'Open opportunities', value: data.featuredDeals.length },
  { label: 'Outstanding tasks', value: data.tasksTotal },
  { label: 'Active holdings', value: data.vehicles.length }
]

// Featured Deals Section - Top 3 open deals
// Action Center - Tasks + Recent Activity
// Holdings Snapshot - Top 4 vehicles
// VERSO Concierge - Quick links to services
```

#### User Stories

| # | User Story | PRD Reference | Status |
|---|------------|---------------|--------|
| 1.1 | As an Investor, I can see a personalized welcome with my name | PRD 2.1.1-01 | ✅ |
| 1.2 | As an Investor, I can see my profile avatar or entity logo | PRD 2.1.1-02 | ✅ |
| 1.3 | As an Investor, I can see "Open opportunities" count | PRD 2.1.2-01 | ✅ |
| 1.4 | As an Investor, I can see "Outstanding tasks" count | PRD 2.1.2-02 | ✅ |
| 1.5 | As an Investor, I can see "Active holdings" count | PRD 2.1.2-03 | ✅ |
| 1.6 | As an Investor, I can see the current date as portal snapshot | PRD 2.1.3-01 | ✅ |
| 1.7 | As an Investor, I can see VERSO branding badges (Luxembourg HQ, BVI Fund, etc.) | PRD 2.1.4-01 | ✅ |
| 1.8 | As an Investor, I can click "View holdings" to navigate to Portfolio | PRD 2.1.5-01 | ✅ |
| 1.9 | As an Investor, I can click "Calendar & deadlines" to view tasks | PRD 2.1.5-02 | ✅ |
| 1.10 | As an Investor, I can see up to 3 featured open deals | PRD 2.2.1-01 | ✅ |
| 1.11 | As an Investor, I can see deal name, company, sector, and deadline | PRD 2.2.1-02 | ✅ |
| 1.12 | As an Investor, I can click to view deal details | PRD 2.2.1-03 | ✅ |
| 1.13 | As an Investor, I can see outstanding tasks sorted by priority | PRD 2.3.1-01 | ✅ |
| 1.14 | As an Investor, I can see task title, status, priority, and due date | PRD 2.3.1-02 | ✅ |
| 1.15 | As an Investor, I can see recent activity events | PRD 2.3.2-01 | ✅ |
| 1.16 | As an Investor, I can see activity type (interest, NDA, subscription) | PRD 2.3.2-02 | ✅ |
| 1.17 | As an Investor, I can see portfolio snapshot with up to 4 vehicles | PRD 2.4.1-01 | ✅ |
| 1.18 | As an Investor, I can see vehicle name, type, and domicile | PRD 2.4.1-02 | ✅ |
| 1.19 | As an Investor, I can click a vehicle to view its deals | PRD 2.4.1-03 | ✅ |
| 1.20 | As an Investor, I can see total vehicles tracked count | PRD 2.4.1-04 | ✅ |
| 1.21 | As an Investor, I can access Concluder™ Deal Room via concierge | PRD 2.5.1-01 | ✅ |
| 1.22 | As an Investor, I can access Off-market opportunities | PRD 2.5.1-02 | ✅ |
| 1.23 | As an Investor, I can request position statement | PRD 2.5.1-03 | ✅ |
| 1.24 | As an Investor, I can submit custom analytics request | PRD 2.5.1-04 | ✅ |
| 1.25 | As a new Investor, I can see welcome panel with onboarding | PRD 2.6.1-01 | ✅ |
| 1.26 | As a new Investor, I can see VERSO highlights (Fund, Real Estate, Luxembourg) | PRD 2.6.1-02 | ✅ |
| 1.27 | As a new Investor, I can click "Complete onboarding" CTA | PRD 2.6.1-03 | ✅ |
| 1.28 | As a new Investor, I can click "Contact VERSO team" | PRD 2.6.1-04 | ✅ |

---

### 2. Investment Opportunities
**Route**: `/versotech_main/opportunities`
**Files**:
- `versotech-portal/src/app/(main)/versotech_main/opportunities/page.tsx`
- `versotech-portal/src/components/deals/investor-deals-list-client.tsx`
**Lines**: 1691+
**Status**: ✅ Fully Implemented

This is the **primary deal discovery and subscription page** for investors. It tracks the complete investment journey from deal dispatch through subscription.

#### Implementation Highlights

```typescript
// Deal Journey Stages (10-stage pipeline)
// Stage 1-5: Discovery & Interest
// Stage 6-9: Subscription Processing
// Stage 10: Active (goes to Portfolio)

// Summary Cards for Investors
- Open deals: Available for exploration
- Pending interests: Awaiting team review
- Active NDAs: Data room unlocked
- Subscriptions in review: Awaiting confirmation

// Subscription Status Tracking
const subscriptionStageMeta = {
  pending_review: { stage: 6, label: 'Pending Review' },
  approved: { stage: 7, label: 'Approved' },
  committed: { stage: 8, label: 'Committed' },
  funded: { stage: 9, label: 'Funded' }
}

// Dual Persona Support (Investor + Partner)
type PersonaMode = 'INVESTOR_ONLY' | 'PARTNER_ONLY' | 'DUAL_PERSONA' | 'GENERIC'
```

#### User Stories

| # | User Story | PRD Reference | Status |
|---|------------|---------------|--------|
| 2.1 | As an Investor, I can view all deals I'm dispatched to | PRD 3.1.1-01 | ✅ |
| 2.2 | As an Investor, I can see deal name, company, and status | PRD 3.1.1-02 | ✅ |
| 2.3 | As an Investor, I can see deal type label (Secondary Equity, etc.) | PRD 3.1.1-03 | ✅ |
| 2.4 | As an Investor, I can see deal closing date and timeline | PRD 3.1.1-04 | ✅ |
| 2.5 | As an Investor, I can see "NEW" badge for recently dispatched deals | PRD 3.1.1-05 | ✅ |
| 2.6 | As an Investor, I can see open deals count | PRD 3.1.2-01 | ✅ |
| 2.7 | As an Investor, I can see pending interests count | PRD 3.1.2-02 | ✅ |
| 2.8 | As an Investor, I can see active NDAs count | PRD 3.1.2-03 | ✅ |
| 2.9 | As an Investor, I can see subscriptions in review count | PRD 3.1.2-04 | ✅ |
| 2.10 | As an Investor, I can search deals by name, company, sector, location | PRD 3.2.1-01 | ✅ |
| 2.11 | As an Investor, I can filter by deal status (open, closed, etc.) | PRD 3.2.2-01 | ✅ |
| 2.12 | As an Investor, I can filter by deal type | PRD 3.2.2-02 | ✅ |
| 2.13 | As an Investor, I can filter by my pipeline stage | PRD 3.2.2-03 | ✅ |
| 2.14 | As an Investor, I can sort by closing date, name, or target amount | PRD 3.2.3-01 | ✅ |
| 2.15 | As an Investor, I can toggle advanced filters | PRD 3.2.4-01 | ✅ |
| 2.16 | As an Investor, I can filter by interest status | PRD 3.2.4-02 | ✅ |
| 2.17 | As an Investor, I can filter by sector | PRD 3.2.4-03 | ✅ |
| 2.18 | As an Investor, I can filter by stage | PRD 3.2.4-04 | ✅ |
| 2.19 | As an Investor, I can filter by location | PRD 3.2.4-05 | ✅ |
| 2.20 | As an Investor, I can see filter count and clear all filters | PRD 3.2.5-01 | ✅ |
| 2.21 | As an Investor, I can see allocation amount on deal card | PRD 3.3.1-01 | ✅ |
| 2.22 | As an Investor, I can see minimum ticket on deal card | PRD 3.3.1-02 | ✅ |
| 2.23 | As an Investor, I can see maximum ticket on deal card | PRD 3.3.1-03 | ✅ |
| 2.24 | As an Investor, I can see unit price on deal card | PRD 3.3.1-04 | ✅ |
| 2.25 | As an Investor, I can see company logo or initial | PRD 3.3.2-01 | ✅ |
| 2.26 | As an Investor, I can see company website link | PRD 3.3.2-02 | ✅ |
| 2.27 | As an Investor, I can see my pipeline status badges | PRD 3.4.1-01 | ✅ |
| 2.28 | As an Investor, I can see interest status (pending_review/approved/rejected) | PRD 3.4.1-02 | ✅ |
| 2.29 | As an Investor, I can see subscription status badge | PRD 3.4.1-03 | ✅ |
| 2.30 | As an Investor, I can see "Data room unlocked" badge when NDA active | PRD 3.4.1-04 | ✅ |
| 2.31 | As an Investor, I can see "Tracking only" badge for non-investor roles | PRD 3.4.1-05 | ✅ |
| 2.32 | As an Investor, I can see my indicative amount if interest submitted | PRD 3.4.2-01 | ✅ |
| 2.33 | As an Investor, I can view deal details by clicking "View details" | PRD 3.5.1-01 | ✅ |
| 2.34 | As an Investor, I can subscribe via "Subscribe to Investment Opportunity" | PRD 3.5.2-01 | ✅ |
| 2.35 | As an Investor, I can submit interest via "Submit Interest for Data Room" | PRD 3.5.3-01 | ✅ |
| 2.36 | As an Investor, I can signal interest on closed deals via "Notify Me About Similar" | PRD 3.5.4-01 | ✅ |
| 2.37 | As an Investor, I can see my subscriptions in progress (Stages 6-9) | PRD 3.6.1-01 | ✅ |
| 2.38 | As an Investor, I can see subscription stage progress bar | PRD 3.6.1-02 | ✅ |
| 2.39 | As an Investor, I can see subscription submission date | PRD 3.6.1-03 | ✅ |
| 2.40 | As an Investor, I can see subscription stage label (Pending Review, Approved, etc.) | PRD 3.6.1-04 | ✅ |

---

### 3. Portfolio
**Route**: `/versotech_main/portfolio`
**Files**:
- `versotech-portal/src/app/(main)/versotech_main/portfolio/page.tsx`
- `versotech-portal/src/components/holdings/holdings-page.tsx`
**Lines**: 728+
**Status**: ✅ Fully Implemented

The Portfolio page displays the investor's current holdings with position data, valuations, and performance analytics.

#### Implementation Highlights

```typescript
// Portfolio configured with positionsOnly=true (only active holdings)
<HoldingsPage
  positionsOnly
  detailsBasePath="/versotech_main/portfolio"
  holdingsPath="/versotech_main/portfolio"
  dealsPath="/versotech_main/opportunities"
/>

// Enhanced Holding Interface
interface EnhancedHolding {
  id: string
  name: string
  type: string
  domicile?: string
  currency: string
  position: {
    units: number
    costBasis: number
    currentValue: number
    unrealizedGain: number
    unrealizedGainPct: number
  } | null
  subscription: {
    commitment: number | null
    currency: string
    status: string
  } | null
  valuation: {
    navTotal: number
    navPerUnit: number
    asOfDate: string
  } | null
}

// Chart Data: Allocation, Performance, Cash Flow
```

#### User Stories

| # | User Story | PRD Reference | Status |
|---|------------|---------------|--------|
| 3.1 | As an Investor, I can view my portfolio holdings | PRD 4.1.1-01 | ✅ |
| 3.2 | As an Investor, I can see portfolio dashboard with KPIs | PRD 4.1.2-01 | ✅ |
| 3.3 | As an Investor, I can see total portfolio value | PRD 4.1.2-02 | ✅ |
| 3.4 | As an Investor, I can see unrealized gain/loss percentage | PRD 4.1.2-03 | ✅ |
| 3.5 | As an Investor, I can see as-of date for valuations | PRD 4.1.2-04 | ✅ |
| 3.6 | As an Investor, I can refresh portfolio data | PRD 4.1.3-01 | ✅ |
| 3.7 | As an Investor, I can export portfolio to CSV | PRD 4.1.3-02 | ✅ |
| 3.8 | As an Investor, I can see allocation chart by vehicle | PRD 4.2.1-01 | ✅ |
| 3.9 | As an Investor, I can see performance chart over time | PRD 4.2.2-01 | ✅ |
| 3.10 | As an Investor, I can see cash flow chart (contributions/distributions) | PRD 4.2.3-01 | ✅ |
| 3.11 | As an Investor, I can search holdings by name or type | PRD 4.3.1-01 | ✅ |
| 3.12 | As an Investor, I can filter by vehicle type | PRD 4.3.2-01 | ✅ |
| 3.13 | As an Investor, I can filter by status (active/pending/closed) | PRD 4.3.2-02 | ✅ |
| 3.14 | As an Investor, I can filter by performance (positive/negative/breakeven) | PRD 4.3.2-03 | ✅ |
| 3.15 | As an Investor, I can filter by size (large/medium/small) | PRD 4.3.2-04 | ✅ |
| 3.16 | As an Investor, I can filter by vintage (recent/mature/legacy) | PRD 4.3.2-05 | ✅ |
| 3.17 | As an Investor, I can filter by domicile | PRD 4.3.2-06 | ✅ |
| 3.18 | As an Investor, I can sort by name, value, performance, commitment, date | PRD 4.3.3-01 | ✅ |
| 3.19 | As an Investor, I can see vehicle card with current value | PRD 4.4.1-01 | ✅ |
| 3.20 | As an Investor, I can see vehicle card with cost basis | PRD 4.4.1-02 | ✅ |
| 3.21 | As an Investor, I can see vehicle card with unrealized gain | PRD 4.4.1-03 | ✅ |
| 3.22 | As an Investor, I can see vehicle card with units held | PRD 4.4.1-04 | ✅ |
| 3.23 | As an Investor, I can see commitment amount on vehicle card | PRD 4.4.1-05 | ✅ |
| 3.24 | As an Investor, I can click "Explore Active Deals" to view opportunities | PRD 4.5.1-01 | ✅ |
| 3.25 | As an Investor, I can see empty state when no holdings | PRD 4.5.2-01 | ✅ |

---

### 4. Documents
**Route**: `/versotech_main/documents`
**Files**:
- `versotech-portal/src/app/(main)/versotech_main/documents/page.tsx`
- `versotech-portal/src/components/documents/categorized-documents-client.tsx`
**Lines**: 534+
**Status**: ✅ Fully Implemented

The Documents page provides a categorized document library organized by investment holdings, with categories for Agreements, Statements, NDAs, and Reports.

#### Implementation Highlights

```typescript
// Document Categories (KYC excluded - in Profile)
const DOCUMENT_CATEGORIES = {
  agreements: { name: 'Agreements', types: ['Subscription', 'Agreement', 'subscription_pack'] },
  statements: { name: 'Statements', types: ['Statement', 'capital_call'] },
  ndas: { name: 'NDAs', types: ['NDA', 'nda'] },
  reports: { name: 'Reports & Tax', types: ['Report', 'Tax', 'memo'] }
}

// Documents Grouped by Holding/Investment
type HoldingWithCategories = {
  id: string
  name: string
  type: string | null
  vehicle: Document['scope']['vehicle']
  categories: Record<CategoryId, Document[]>
  totalDocuments: number
}

// Security Features
- Watermarking with user name and timestamp
- Access logging for compliance
- Download links expire after 15 minutes
```

#### User Stories

| # | User Story | PRD Reference | Status |
|---|------------|---------------|--------|
| 4.1 | As an Investor, I can view my investment documents | PRD 5.1.1-01 | ✅ |
| 4.2 | As an Investor, I can see total documents count | PRD 5.1.1-02 | ✅ |
| 4.3 | As an Investor, I can see documents organized by holding/investment | PRD 5.1.2-01 | ✅ |
| 4.4 | As an Investor, I can see holding name and type | PRD 5.1.2-02 | ✅ |
| 4.5 | As an Investor, I can see holding logo | PRD 5.1.2-03 | ✅ |
| 4.6 | As an Investor, I can see category summary per holding | PRD 5.1.3-01 | ✅ |
| 4.7 | As an Investor, I can filter documents by vehicle/holding | PRD 5.2.1-01 | ✅ |
| 4.8 | As an Investor, I can filter documents by type | PRD 5.2.1-02 | ✅ |
| 4.9 | As an Investor, I can search documents by name | PRD 5.2.1-03 | ✅ |
| 4.10 | As an Investor, I can click a holding to view its documents | PRD 5.3.1-01 | ✅ |
| 4.11 | As an Investor, I can see breadcrumb navigation (Investments > Holding) | PRD 5.3.1-02 | ✅ |
| 4.12 | As an Investor, I can go back to investments overview | PRD 5.3.1-03 | ✅ |
| 4.13 | As an Investor, I can see documents grouped by category | PRD 5.3.2-01 | ✅ |
| 4.14 | As an Investor, I can expand/collapse category folders | PRD 5.3.2-02 | ✅ |
| 4.15 | As an Investor, I can see document count per category | PRD 5.3.2-03 | ✅ |
| 4.16 | As an Investor, I can see Agreements category (subscriptions, LPAs) | PRD 5.3.3-01 | ✅ |
| 4.17 | As an Investor, I can see Statements category (position, capital calls) | PRD 5.3.3-02 | ✅ |
| 4.18 | As an Investor, I can see NDAs category | PRD 5.3.3-03 | ✅ |
| 4.19 | As an Investor, I can see Reports & Tax category | PRD 5.3.3-04 | ✅ |
| 4.20 | As an Investor, I can preview a document | PRD 5.4.1-01 | ✅ |
| 4.21 | As an Investor, I can download a document | PRD 5.4.1-02 | ✅ |
| 4.22 | As an Investor, I can see document security notice | PRD 5.5.1-01 | ✅ |
| 4.23 | As an Investor, I understand documents are watermarked | PRD 5.5.1-02 | ✅ |
| 4.24 | As an Investor, I understand access is logged for compliance | PRD 5.5.1-03 | ✅ |

---

### 5. Inbox
**Route**: `/versotech_main/inbox`
**Files**:
- `versotech-portal/src/app/(main)/versotech_main/inbox/page.tsx`
- `versotech-portal/src/app/(main)/versotech_main/inbox/messages-content.tsx`
**Lines**: 233+
**Status**: ✅ Fully Implemented

The Inbox provides messaging functionality for investors to communicate with the VERSO team. Unlike Staff, Investors only see the Messages tab (no Approvals or Requests).

#### Implementation Highlights

```typescript
// Tab visibility based on persona
function getTabsForPersona(personaType, roleInEntity): TabConfig[] {
  if (personaType === 'staff') {
    // Staff see all tabs
    return ALL_TABS
  }
  // Investors, Arrangers, Introducers, Partners, Lawyers - Messages only
  return ALL_TABS.filter(tab => tab.value === 'messages')
}

// Conversation creation restriction
const canCreateConversation = activePersona?.persona_type === 'staff'
// Investors can reply but cannot initiate new conversations

// Page subtitle for Investors
const pageSubtitle = 'Your conversations and notifications'
```

#### User Stories

| # | User Story | PRD Reference | Status |
|---|------------|---------------|--------|
| 5.1 | As an Investor, I can access my inbox | PRD 6.1.1-01 | ✅ |
| 5.2 | As an Investor, I can see "Your conversations and notifications" subtitle | PRD 6.1.1-02 | ✅ |
| 5.3 | As an Investor, I can see my conversations list | PRD 6.2.1-01 | ✅ |
| 5.4 | As an Investor, I can see unread message count | PRD 6.2.1-02 | ✅ |
| 5.5 | As an Investor, I can see conversation participants | PRD 6.2.2-01 | ✅ |
| 5.6 | As an Investor, I can see last message preview | PRD 6.2.2-02 | ✅ |
| 5.7 | As an Investor, I can see last message timestamp | PRD 6.2.2-03 | ✅ |
| 5.8 | As an Investor, I can click to open a conversation | PRD 6.3.1-01 | ✅ |
| 5.9 | As an Investor, I can read messages in a conversation | PRD 6.3.2-01 | ✅ |
| 5.10 | As an Investor, I can see sender name and avatar | PRD 6.3.2-02 | ✅ |
| 5.11 | As an Investor, I can reply to messages | PRD 6.3.3-01 | ✅ |
| 5.12 | As an Investor, I understand I cannot create new conversations (staff initiates) | PRD 6.3.4-01 | ✅ |

---

## Database Schema (Investor-Related Tables)

### Core Tables

```sql
-- Investor entity
CREATE TABLE investors (
  id UUID PRIMARY KEY,
  legal_name VARCHAR NOT NULL,
  display_name VARCHAR,
  entity_type VARCHAR, -- individual, company, trust, etc.
  domicile VARCHAR,
  currency VARCHAR DEFAULT 'USD',
  kyc_status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investor-User linking
CREATE TABLE investor_users (
  id UUID PRIMARY KEY,
  investor_id UUID REFERENCES investors(id),
  user_id UUID REFERENCES auth.users(id),
  role VARCHAR DEFAULT 'member',
  is_primary BOOLEAN DEFAULT FALSE,
  can_sign BOOLEAN DEFAULT FALSE,
  can_transact BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions (investor commitments to deals)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  investor_id UUID REFERENCES investors(id),
  deal_id UUID REFERENCES deals(id),
  vehicle_id UUID REFERENCES vehicles(id),
  commitment DECIMAL,
  currency VARCHAR,
  status VARCHAR DEFAULT 'pending', -- pending, approved, committed, funded, active
  effective_date DATE,
  funding_due_at TIMESTAMPTZ,
  units INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Positions (actual holdings)
CREATE TABLE positions (
  id UUID PRIMARY KEY,
  investor_id UUID REFERENCES investors(id),
  vehicle_id UUID REFERENCES vehicles(id),
  units DECIMAL,
  cost_basis DECIMAL,
  current_value DECIMAL,
  unrealized_gain DECIMAL,
  unrealized_gain_pct DECIMAL,
  as_of_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deal memberships (dispatch/access control)
CREATE TABLE deal_memberships (
  id UUID PRIMARY KEY,
  deal_id UUID REFERENCES deals(id),
  user_id UUID REFERENCES auth.users(id),
  investor_id UUID REFERENCES investors(id),
  role VARCHAR, -- investor, partner_investor, etc.
  dispatched_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  interest_confirmed_at TIMESTAMPTZ,
  referred_by_entity_id UUID,
  referred_by_entity_type VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investor deal interest (interest submissions)
CREATE TABLE investor_deal_interest (
  id UUID PRIMARY KEY,
  deal_id UUID REFERENCES deals(id),
  investor_id UUID REFERENCES investors(id),
  status VARCHAR DEFAULT 'pending_review', -- pending_review, approved, rejected, withdrawn
  indicative_amount DECIMAL,
  indicative_currency VARCHAR,
  is_post_close BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- Deal data room access (NDA tracking)
CREATE TABLE deal_data_room_access (
  id UUID PRIMARY KEY,
  deal_id UUID REFERENCES deals(id),
  investor_id UUID REFERENCES investors(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  auto_granted BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ
);

-- Deal subscription submissions (subscription pack submissions)
CREATE TABLE deal_subscription_submissions (
  id UUID PRIMARY KEY,
  deal_id UUID REFERENCES deals(id),
  investor_id UUID REFERENCES investors(id),
  status VARCHAR DEFAULT 'pending_review',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Summary Statistics

| Page | User Stories | Status |
|------|--------------|--------|
| Dashboard | 28 | ✅ Complete |
| Investment Opportunities | 40 | ✅ Complete |
| Portfolio | 25 | ✅ Complete |
| Documents | 24 | ✅ Complete |
| Inbox | 12 | ✅ Complete |
| **TOTAL** | **129** | **✅ 100%** |

---

## Key Features Summary

### ✅ Personalized Dashboard
- Welcome header with name and avatar
- Summary tiles (opportunities, tasks, holdings)
- Featured deals section (up to 3 open deals)
- Action center (tasks + recent activity)
- Portfolio snapshot (up to 4 vehicles)
- VERSO concierge services

### ✅ Complete Investment Pipeline
- 10-stage deal journey tracking
- Interest submission with indicative amounts
- NDA/Data room access tracking
- Subscription pack submission
- Stage 6-9 subscription progress visualization

### ✅ Portfolio Analytics
- Holdings with position data
- Valuation and NAV tracking
- Performance charts (allocation, performance, cash flow)
- Advanced filtering and sorting
- CSV export

### ✅ Categorized Document Library
- Documents organized by holding/investment
- 4 categories: Agreements, Statements, NDAs, Reports
- Security features (watermarking, access logging, expiring links)
- Preview and download capabilities

### ✅ Secure Messaging
- Conversation-based messaging with VERSO team
- Unread count tracking
- Read-only conversation creation (staff initiates)

---

## Investor Journey Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  DISPATCH   │ --> │   INTEREST   │ --> │  NDA/DATA   │
│ Deal Access │     │  Submission  │     │  ROOM       │
└─────────────┘     └──────────────┘     └─────────────┘
      Stage 1            Stage 2-3            Stage 4-5

       │                                          │
       │                                          ▼
       │                               ┌─────────────────┐
       │                               │  SUBSCRIPTION   │
       │                               │  Pack Submit    │
       │                               └─────────────────┘
       │                                      Stage 6
       │                                          │
       │                                          ▼
       │                               ┌─────────────────┐
       │                               │    APPROVED     │
       │                               │   & COMMITTED   │
       │                               └─────────────────┘
       │                                   Stage 7-8
       │                                          │
       │                                          ▼
       │                               ┌─────────────────┐
       │                               │     FUNDED      │
       │                               │    (Stage 9)    │
       │                               └─────────────────┘
       │                                          │
       │                                          ▼
       │                               ┌─────────────────┐
       └─────────────────────────────> │    ACTIVE       │
                                       │  (Portfolio)    │
                                       └─────────────────┘
                                            Stage 10
```

---

## Conclusion

The **Investor persona** is **100% implemented** with all 5 navigation pages fully functional. The implementation delivers:

1. **Complete Investment Lifecycle** - From deal discovery through portfolio management
2. **Real-time Pipeline Tracking** - 10-stage journey visualization
3. **Rich Analytics** - Portfolio dashboard with charts and KPIs
4. **Categorized Documents** - Investment-organized document library
5. **Secure Communication** - Messaging with the VERSO team

The persona follows established patterns for:
- **Entity-User linking** via `investor_users` table
- **Deal access control** via `deal_memberships` table
- **Multi-stage workflows** for subscriptions
- **Persona-aware components** (dashboard, inbox)

---

*Report generated as part of Phase 2 Implementation Audit*
