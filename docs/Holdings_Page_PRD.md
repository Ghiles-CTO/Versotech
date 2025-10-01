# Holdings Page - Product Requirements Document

**Project:** VERSO Portal - Investor Holdings Page
**Version:** 1.0
**Date:** September 2025
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