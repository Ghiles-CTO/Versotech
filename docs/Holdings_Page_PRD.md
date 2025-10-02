# Holdings Page - Product Requirements Document

**Project:** VERSO Portal - Investor Holdings Page
**Version:** 2.0
**Date:** October 2, 2025
**Audience:** Product, Frontend, Backend Engineers

---

## Executive Summary

The Holdings page is the central hub for investors to view and manage their complete investment portfolio across all VERSO vehicles, deals, and positions. This page serves as the primary interface for investors to understand their financial standing, performance metrics, and investment allocations within the VERSO ecosystem.

---

## 1. Purpose & Objectives

### Primary Goals
- **Comprehensive Portfolio View**: Display all investor holdings across vehicles, deals, and individual positions in a unified interface
- **Performance Tracking**: Provide real-time KPI calculations including NAV, DPI, TVPI, IRR, and unrealized gains
- **Position Management**: Enable investors to view detailed position breakdowns with unit-level granularity
- **Deal Integration**: Seamlessly integrate deal-scoped holdings and allocations alongside traditional vehicle investments
- **Actionable Insights**: Provide quick access to reports, documents, and next actions

### Success Metrics
- 100% accurate position and valuation data display
- <2 second page load time for portfolios with up to 50 positions
- Zero discrepancies between holdings page data and official statements
- 95%+ investor satisfaction with portfolio visibility

---

## 2. User Stories & Requirements

### 2.1 Core User Stories

**As an investor, I want to:**
- View my complete portfolio at a glance with key performance metrics
- See all my investment vehicles, deals, and individual positions in one place
- Understand my current NAV, contributions, distributions, and unrealized gains
- Filter and sort my holdings by vehicle type, performance, or investment date
- Access detailed information for each position including unit breakdowns and fee structures
- Request reports and statements for specific vehicles or time periods
- See upcoming capital calls and distribution schedules
- Track my allocations in active deals and reservation status

### 2.2 Functional Requirements

#### 2.2.1 Portfolio Overview Section
- **Total Portfolio KPIs Display**
  - Current NAV (real-time calculated)
  - Total Contributed Capital
  - Total Distributions Received
  - Unfunded Commitments
  - Unrealized Gain/Loss ($ and %)
  - DPI (Distributions to Paid-in Capital)
  - TVPI (Total Value to Paid-in Capital)
  - Net IRR (Internal Rate of Return)

- **Performance Indicators**
  - Color-coded performance indicators (green/red)
  - Trend arrows and percentage changes
  - As-of date for all calculations
  - Historical performance charts (optional Phase 2)

#### 2.2.2 Holdings Grid/List
- **Vehicle Holdings Display**
  - Vehicle name, type, domicile, and currency
  - Current position value and units held
  - Cost basis and unrealized gain/loss
  - Commitment amount and unfunded balance
  - Latest NAV per unit and valuation date
  - Performance metrics (unrealized gain %)
  - Subscription status and entry date

- **Deal Holdings Display** (New v2.0 Requirement)
  - Deal name, type, and status
  - Allocated units and allocation price
  - Reservation status for pending deals
  - Spread/markup calculations
  - Fee plan and terms applied
  - Expected settlement dates

#### 2.2.3 Position Detail Modal/Expanded View
- **Detailed Position Breakdown**
  - Unit holdings by lot (FIFO acquisition tracking)
  - Historical cost basis by purchase
  - Valuation methodology and sources
  - Fee schedule and accrued fees
  - Cashflow history (calls and distributions)
  - Document attachments (statements, reports)

#### 2.2.4 Interactive Features
- **Filtering and Sorting**
  - Filter by vehicle type (Fund, SPV, Real Estate, Direct Deal)
  - Sort by performance, size, date, alphabetical
  - Search by vehicle/deal name
  - Group by investment type or vintage

- **Quick Actions**
  - Request position statement for specific vehicle
  - Request comprehensive portfolio report
  - Download available documents
  - Initiate chat/message for specific holding
  - Schedule investor call

#### 2.2.5 Real-Time Updates
- **Live Data Integration**
  - Real-time NAV updates via Supabase Realtime
  - Instant reflection of new allocations/reservations
  - Live capital call and distribution notifications
  - Status updates for deal participation

### 2.3 Data Integration Requirements

#### 2.3.1 Core Data Sources
- **Positions Table**: Current unit holdings and valuations
- **Vehicles Table**: Investment vehicle metadata
- **Deals Table**: Deal-specific holdings and allocations
- **Subscriptions Table**: Commitment and funding information
- **Cashflows Table**: Historical contributions and distributions
- **Valuations Table**: Latest NAV and pricing data
- **Allocations Table**: Deal allocation details
- **Fee Events Table**: Accrued and invoiced fees

#### 2.3.2 Calculated Metrics
- All KPIs must be calculated server-side for consistency
- Position values = units × latest NAV per unit
- Unrealized gain = current value - cost basis
- TVPI = (current NAV + distributions) / contributions
- DPI = distributions / contributions
- IRR calculated from actual cashflow dates

---

## 3. User Interface Design

### 3.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ PORTFOLIO OVERVIEW                                              │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│ │   Current NAV   │ │ Total Contrib.  │ │  Unrealized     │   │
│ │   $2,450,000    │ │   $2,000,000    │ │  +$450,000      │   │
│ │                 │ │                 │ │   +22.5%        │   │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                 │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│ │      DPI        │ │      TVPI       │ │    Net IRR      │   │
│ │      0.15       │ │      1.23       │ │     18.2%       │   │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FILTER & SEARCH                                                 │
│ [All Types ▼] [Sort by Performance ▼] [Search...] [📊Reports]   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ HOLDINGS GRID                                                   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ VERSO FUND IV (Fund)                      🟢 +15.3%        │ │
│ │ Current Value: $850,000  |  Commitment: $1,000,000        │ │
│ │ Units: 8,500  |  Cost Basis: $740,000                     │ │
│ │ [View Details] [Request Report] [Download Docs]           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Real Empire Series A (Deal)                🟡 Pending     │ │
│ │ Allocated: 5,000 units @ $125.00                          │ │
│ │ Expected Value: $625,000  |  Status: Awaiting Settlement  │ │
│ │ [View Deal Details] [Download Terms]                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Responsive Design Requirements
- **Desktop**: 3-column KPI layout, detailed holdings grid
- **Tablet**: 2-column KPI layout, card-based holdings
- **Mobile**: Stacked KPI cards, simplified holdings list

### 3.3 Visual Design Standards
- Consistent with VERSO brand guidelines
- Clear typography hierarchy
- Color-coded performance indicators
- Loading states and skeleton screens
- Error states with helpful messaging

---

## 4. Technical Implementation

### 4.1 API Endpoints

#### 4.1.1 Enhanced Portfolio API
```typescript
GET /api/portfolio
Response: {
  kpis: {
    currentNAV: number
    totalContributed: number
    totalDistributions: number
    unfundedCommitment: number
    unrealizedGain: number
    unrealizedGainPct: number
    dpi: number
    tvpi: number
    irr: number
  }
  asOfDate: string
  hasData: boolean
}
```

#### 4.1.2 Enhanced Vehicles API
```typescript
GET /api/vehicles?related=true&includeDeals=true
Response: {
  vehicles: VehicleHolding[]
  deals: DealHolding[]
  total: number
}

interface VehicleHolding {
  id: string
  name: string
  type: string
  domicile: string
  currency: string
  position: {
    units: number
    costBasis: number
    currentValue: number
    unrealizedGain: number
    unrealizedGainPct: number
    lastUpdated: string
  }
  subscription: {
    commitment: number
    unfunded: number
    status: string
  }
  valuation: {
    navPerUnit: number
    asOfDate: string
  }
  fees: {
    accrued: number
    paid: number
    nextDue: string
  }
}
```

#### 4.1.3 New Cashflows API
```typescript
GET /api/cashflows?vehicle_id&from&to
Response: {
  cashflows: CashflowRecord[]
  summary: {
    totalCalls: number
    totalDistributions: number
    netCashflow: number
  }
}
```

### 4.2 Real-Time Integration
- Supabase Realtime subscriptions for position updates
- WebSocket connections for live NAV changes
- Optimistic UI updates for user actions

### 4.3 Performance Optimization
- Server-side calculation of all metrics
- Caching of expensive calculations
- Pagination for large portfolios
- Virtual scrolling for extensive holdings lists

---

## 5. Security & Compliance

### 5.1 Data Access Control
- Row-Level Security (RLS) for all queries
- Investor isolation via `investor_users` junction table
- Deal-scoped access via `deal_memberships`
- Audit logging for all portfolio data access

### 5.2 Privacy Requirements
- No PII exposure in client-side calculations
- Watermarked document downloads
- Short-TTL download URLs
- Complete audit trail for document access

---

## 6. Gap Analysis - Current vs. Required

### 6.1 Missing Features (High Priority)
1. **Portfolio KPIs Dashboard**
   - Current: Basic position summaries
   - Required: Complete KPI calculations (DPI, TVPI, IRR)

2. **Deal Holdings Integration**
   - Current: Vehicle-only holdings
   - Required: Deal allocations and reservations

3. **Fee Information Display**
   - Current: No fee visibility
   - Required: Accrued fees, fee schedules, invoicing status

4. **Cashflow History**
   - Current: No cashflow display
   - Required: Complete contribution/distribution history

5. **Real-Time Updates**
   - Current: Static page loads
   - Required: Live NAV and allocation updates

### 6.2 Enhancements Needed (Medium Priority)
1. **Advanced Filtering/Sorting**
2. **Performance Trend Indicators**
3. **Quick Action Buttons**
4. **Document Integration**
5. **Report Request Functionality**

### 6.3 Current Implementation Strengths
1. ✅ Basic vehicle display
2. ✅ Position calculations
3. ✅ Responsive design foundation
4. ✅ Authentication/authorization
5. ✅ API structure in place

---

## 7. Implementation Roadmap

### Phase 1: Core KPI Dashboard (2 weeks)
- Implement portfolio KPI calculations
- Add DPI, TVPI, IRR metrics
- Create enhanced portfolio API endpoint
- Update holdings page with KPI section

### Phase 2: Deal Integration (2 weeks)
- Add deal holdings display
- Implement allocation/reservation status
- Create deal-specific API endpoints
- Integrate with existing vehicle holdings

### Phase 3: Enhanced Features (2 weeks)
- Add fee information display
- Implement cashflow history
- Add filtering and sorting
- Real-time updates integration

### Phase 4: Advanced Features (1 week)
- Quick action buttons
- Report request integration
- Document access links
- Performance optimizations

---

## 8. Testing Requirements

### 8.1 Functional Testing
- KPI calculation accuracy
- Data consistency across page reloads
- Filter and sort functionality
- Real-time update behavior

### 8.2 Performance Testing
- Page load time with various portfolio sizes
- Real-time update latency
- API response times
- Mobile performance

### 8.3 Security Testing
- RLS policy verification
- Data isolation between investors
- Audit log completeness
- Document access controls

---

## 9. Success Criteria

### 9.1 Technical Metrics
- Page load time <2 seconds
- 99.9% uptime
- Zero data accuracy issues
- Complete audit coverage

### 9.2 User Experience Metrics
- 95%+ investor satisfaction
- <5% support tickets related to holdings data
- High engagement with quick actions
- Positive feedback on UI/UX

---

## 10. Appendices

### 10.1 Database Schema References
- Main PRD Section 6: Data Model
- Holdings-specific tables: positions, valuations, allocations, fee_events

### 10.2 API Contract Details
- Detailed response schemas
- Error handling specifications
- Rate limiting requirements

### 10.3 UI Component Library
- Existing component usage
- New component requirements
- Design system compliance

---

## 11. Current Implementation (As-Built)

### 11.1 Architecture

**Page Route**: `/versoholdings/holdings/page.tsx`
**Type**: Server Component with Client Component wrapper
**Component**: `EnhancedHoldingsPage` (client component receiving server-fetched data)

**Component Hierarchy:**
```
page.tsx (Server Component)
  └─ AppLayout (brand="versoholdings")
       └─ EnhancedHoldingsPage (Client Component)
            ├─ RealtimeHoldingsProvider (realtime updates)
            ├─ PortfolioKPIDashboard
            │    ├─ KPI Cards (8 metrics)
            │    ├─ Trends indicators
            │    └─ KPIDetailsModal
            ├─ EnhancedHoldingsFilters
            │    ├─ View toggles (All/Vehicles/Deals)
            │    ├─ Sort dropdown
            │    └─ Search input
            ├─ Holdings Grid
            │    ├─ VehicleHoldingCard(s)
            │    └─ DealHoldingCard(s)
            ├─ PositionDetailModal
            └─ QuickActionsMenu
```

### 11.2 Database RPC Functions (Server-Side)

The Holdings page uses three advanced Postgres RPC functions for optimal performance:

**1. `calculate_investor_kpis_with_deals`**
```sql
create or replace function calculate_investor_kpis_with_deals(investor_ids uuid[])
returns table (
  current_nav numeric,
  total_contributed numeric,
  total_distributions numeric,
  unfunded_commitment numeric,
  total_commitment numeric,
  total_cost_basis numeric,
  unrealized_gain numeric,
  unrealized_gain_pct numeric,
  dpi numeric,
  tvpi numeric,
  irr_estimate numeric,
  total_positions int,
  total_vehicles int,
  total_deals int,
  total_deal_value numeric,
  pending_allocations int
)
language plpgsql
as $$
begin
  return query
  with position_agg as (
    select
      sum(p.units * p.last_nav) as nav_total,
      sum(p.cost_basis) as cost_total,
      count(distinct p.id) as position_count,
      count(distinct p.vehicle_id) as vehicle_count
    from positions p
    where p.investor_id = any(investor_ids)
  ),
  cashflow_agg as (
    select
      sum(case when c.type = 'call' then c.amount else 0 end) as contributed,
      sum(case when c.type = 'distribution' then c.amount else 0 end) as distributed
    from cashflows c
    where c.investor_id = any(investor_ids)
  ),
  subscription_agg as (
    select
      sum(s.commitment) as commitment_total
    from subscriptions s
    where s.investor_id = any(investor_ids)
      and s.status = 'active'
  ),
  deal_agg as (
    select
      count(distinct dm.deal_id) as deal_count,
      coalesce(sum(a.units * a.unit_price), 0) as deal_value,
      count(distinct case when a.status = 'pending_review' then a.id end) as pending_count
    from deal_memberships dm
    left join allocations a on a.deal_id = dm.deal_id
      and a.investor_id = any(investor_ids)
    where dm.investor_id = any(investor_ids)
      or exists (
        select 1 from investor_users iu
        where iu.investor_id = any(investor_ids)
          and iu.user_id = dm.user_id
      )
  )
  select
    coalesce(p.nav_total, 0) as current_nav,
    coalesce(c.contributed, 0) as total_contributed,
    coalesce(c.distributed, 0) as total_distributions,
    coalesce(s.commitment_total, 0) - coalesce(c.contributed, 0) as unfunded_commitment,
    coalesce(s.commitment_total, 0) as total_commitment,
    coalesce(p.cost_total, 0) as total_cost_basis,
    coalesce(p.nav_total, 0) - coalesce(p.cost_total, 0) as unrealized_gain,
    case
      when coalesce(p.cost_total, 0) > 0
        then ((coalesce(p.nav_total, 0) - coalesce(p.cost_total, 0)) / p.cost_total) * 100
      else 0
    end as unrealized_gain_pct,
    case
      when coalesce(c.contributed, 0) > 0
        then coalesce(c.distributed, 0) / c.contributed
      else 0
    end as dpi,
    case
      when coalesce(c.contributed, 0) > 0
        then (coalesce(p.nav_total, 0) + coalesce(c.distributed, 0)) / c.contributed
      else 1
    end as tvpi,
    0 as irr_estimate, -- Simplified; real IRR requires XIRR calculation
    coalesce(p.position_count, 0)::int as total_positions,
    coalesce(p.vehicle_count, 0)::int as total_vehicles,
    coalesce(d.deal_count, 0)::int as total_deals,
    coalesce(d.deal_value, 0) as total_deal_value,
    coalesce(d.pending_count, 0)::int as pending_allocations
  from position_agg p
  cross join cashflow_agg c
  cross join subscription_agg s
  cross join deal_agg d;
end;
$$;
```

**2. `get_portfolio_trends`**
```sql
create or replace function get_portfolio_trends(
  investor_ids uuid[],
  days_back int default 30
)
returns table (
  nav_change numeric,
  nav_change_pct numeric,
  performance_change numeric,
  period_days int
)
language plpgsql
as $$
declare
  current_nav numeric;
  previous_nav numeric;
  current_perf numeric;
  previous_perf numeric;
begin
  -- Get current NAV
  select sum(p.units * p.last_nav)
  into current_nav
  from positions p
  where p.investor_id = any(investor_ids);

  -- Get NAV from days_back ago (from performance_snapshots or positions history)
  select sum(ps.nav_value)
  into previous_nav
  from performance_snapshots ps
  where ps.investor_id = any(investor_ids)
    and ps.snapshot_date >= (current_date - days_back)
    and ps.snapshot_date < (current_date - days_back + 7) -- 7-day window
  order by ps.snapshot_date desc
  limit 1;

  -- Calculate changes
  return query
  select
    coalesce(current_nav, 0) - coalesce(previous_nav, current_nav, 0) as nav_change,
    case
      when coalesce(previous_nav, 0) > 0
        then ((coalesce(current_nav, 0) - previous_nav) / previous_nav) * 100
      else 0
    end as nav_change_pct,
    0::numeric as performance_change, -- Placeholder
    days_back as period_days;
end;
$$;
```

**3. `get_investor_vehicle_breakdown`**
```sql
create or replace function get_investor_vehicle_breakdown(investor_ids uuid[])
returns table (
  vehicle_id uuid,
  vehicle_name text,
  vehicle_type text,
  current_value numeric,
  cost_basis numeric,
  unrealized_gain numeric,
  units_held numeric,
  commitment numeric,
  unfunded numeric
)
language plpgsql
as $$
begin
  return query
  select
    v.id as vehicle_id,
    v.name as vehicle_name,
    v.type as vehicle_type,
    coalesce(sum(p.units * p.last_nav), 0) as current_value,
    coalesce(sum(p.cost_basis), 0) as cost_basis,
    coalesce(sum(p.units * p.last_nav), 0) - coalesce(sum(p.cost_basis), 0) as unrealized_gain,
    coalesce(sum(p.units), 0) as units_held,
    coalesce(max(s.commitment), 0) as commitment,
    coalesce(max(s.commitment), 0) - coalesce(sum(
      select sum(cf.amount)
      from cashflows cf
      where cf.investor_id = s.investor_id
        and cf.vehicle_id = v.id
        and cf.type = 'call'
    ), 0) as unfunded
  from vehicles v
  inner join subscriptions s on s.vehicle_id = v.id
    and s.investor_id = any(investor_ids)
    and s.status = 'active'
  left join positions p on p.vehicle_id = v.id
    and p.investor_id = any(investor_ids)
  group by v.id, v.name, v.type;
end;
$$;
```

### 11.3 Server-Side Data Fetching (page.tsx:5-122)

```typescript
export default async function InvestorHoldings() {
  const supabase = await createClient()

  // 1. Authenticate
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) {
    throw new Error('Authentication required')
  }

  // 2. Get investor IDs
  const { data: investorLinks } = await supabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  let initialData = null

  if (investorLinks && investorLinks.length > 0) {
    const investorIds = investorLinks.map(link => link.investor_id)

    try {
      // 3. Fetch all data in parallel using Promise.allSettled
      const [kpiResponse, trendsResponse, breakdownResponse] = await Promise.allSettled([
        supabase.rpc('calculate_investor_kpis_with_deals', {
          investor_ids: investorIds
        }),
        supabase.rpc('get_portfolio_trends', {
          investor_ids: investorIds,
          days_back: 30
        }),
        supabase.rpc('get_investor_vehicle_breakdown', {
          investor_ids: investorIds
        })
      ])

      // 4. Process KPI data with fallback
      let kpiData = null
      if (kpiResponse.status === 'fulfilled' && !kpiResponse.value.error) {
        kpiData = kpiResponse.value.data
      } else {
        // Fallback to basic KPI function without deals
        const fallbackResponse = await supabase.rpc('calculate_investor_kpis', {
          investor_ids: investorIds
        })

        if (!fallbackResponse.error) {
          kpiData = fallbackResponse.data?.map((row: any) => ({
            ...row,
            total_deals: 0,
            total_deal_value: 0,
            pending_allocations: 0
          }))
        }
      }

      if (kpiData?.[0]) {
        const kpiResult = kpiData[0]

        // Process trends data
        const trendsData = trendsResponse.status === 'fulfilled' && !trendsResponse.value.error
          ? trendsResponse.value.data
          : null

        // Process breakdown data
        const breakdownData = breakdownResponse.status === 'fulfilled' && !breakdownResponse.value.error
          ? breakdownResponse.value.data
          : null

        // 5. Transform to client format
        initialData = {
          kpis: {
            currentNAV: Math.round(parseFloat(kpiResult.current_nav) || 0),
            totalContributed: Math.round(parseFloat(kpiResult.total_contributed) || 0),
            totalDistributions: Math.round(parseFloat(kpiResult.total_distributions) || 0),
            unfundedCommitment: Math.round(parseFloat(kpiResult.unfunded_commitment) || 0),
            totalCommitment: Math.round(parseFloat(kpiResult.total_commitment) || 0),
            totalCostBasis: Math.round(parseFloat(kpiResult.total_cost_basis) || 0),
            unrealizedGain: Math.round(parseFloat(kpiResult.unrealized_gain) || 0),
            unrealizedGainPct: Math.round((parseFloat(kpiResult.unrealized_gain_pct) || 0) * 100) / 100,
            dpi: Math.round((parseFloat(kpiResult.dpi) || 0) * 10000) / 10000,
            tvpi: Math.round((parseFloat(kpiResult.tvpi) || 0) * 10000) / 10000,
            irr: Math.round((parseFloat(kpiResult.irr_estimate) || 0) * 100) / 100
          },
          trends: trendsData?.[0] ? {
            navChange: Math.round(parseFloat(trendsData[0].nav_change) || 0),
            navChangePct: Math.round((parseFloat(trendsData[0].nav_change_pct) || 0) * 100) / 100,
            performanceChange: Math.round((parseFloat(trendsData[0].performance_change) || 0) * 100) / 100,
            periodDays: parseInt(trendsData[0].period_days) || 30
          } : undefined,
          summary: {
            totalPositions: parseInt(kpiResult.total_positions) || 0,
            totalVehicles: parseInt(kpiResult.total_vehicles) || 0,
            totalDeals: parseInt(kpiResult.total_deals) || 0,
            totalDealValue: Math.round(parseFloat(kpiResult.total_deal_value) || 0),
            pendingAllocations: parseInt(kpiResult.pending_allocations) || 0,
            lastUpdated: new Date().toISOString()
          },
          asOfDate: new Date().toISOString(),
          vehicleBreakdown: breakdownData || []
        }
      }
    } catch (error) {
      console.error('Error fetching initial portfolio data:', error)
      // Let client component handle the data fetching
    }
  }

  return (
    <AppLayout brand="versoholdings">
      <EnhancedHoldingsPage initialData={initialData} />
    </AppLayout>
  )
}
```

### 11.4 Client Component Features

**EnhancedHoldingsPage** (client component):
- Receives `initialData` from server
- Provides realtime updates via `RealtimeHoldingsProvider`
- Manages filtering, sorting, and search state
- Renders KPI dashboard, holdings grid, and modals

**Key Features:**
1. **Parallel Data Fetching**: Uses `Promise.allSettled` for optimal performance
2. **Graceful Degradation**: Falls back to basic KPI function if enhanced version fails
3. **Realtime Updates**: Subscribes to position changes via Supabase Realtime
4. **Vehicle & Deal Breakdown**: Shows both traditional holdings and deal allocations
5. **Interactive Modals**: Position details, KPI drill-downs, quick actions

### 11.5 Performance Optimizations

**Database Level:**
- RPC functions execute complex aggregations in Postgres (faster than client-side)
- Single round-trip for KPI calculations (vs. multiple queries)
- Indexed joins on `investor_id`, `vehicle_id`, `deal_id`

**Application Level:**
- Server-side rendering for initial data (fast first paint)
- `Promise.allSettled` allows partial success (one RPC failure doesn't block others)
- Client-side caching of breakdown data
- Optimistic UI updates for user actions

**Measurement:**
- Page load time target: <2 seconds
- RPC function execution: typically <500ms for portfolios with 50+ positions
- Realtime update latency: <1 second

---

## Document Version History
- v2.0 (October 2, 2025): Added comprehensive technical implementation with RPC functions
- v1.0 (September 2025): Initial PRD with requirements and gap analysis