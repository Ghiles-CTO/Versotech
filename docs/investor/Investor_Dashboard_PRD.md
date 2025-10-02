# Investor Dashboard PRD - Investor Portal

**Version:** 2.0
**Product:** VERSO Holdings Investor Portal
**Audience:** Business stakeholders, Product managers, Engineers
**Last Updated:** October 2, 2025

---

## Executive Summary

The investor dashboard is the personalized home screen for every Verso Holdings investor. It gives a plain-language snapshot of their overall portfolio: how much they have invested, current value, what has been distributed, and what still needs attention. The page combines at-a-glance KPIs, trend charts, vehicle highlights, and the latest activity so an investor can understand their position in under a minute.

The dashboard is connected to the rest of the portal experience. From here investors can dive into holdings, open documents, launch report requests, and jump to onboarding tasks. Real-time updates keep the feed current whenever valuations, documents, or deal allocations change, so the page always reflects the latest operational state.

The goal is to reduce reliance on emails and spreadsheets. Investors get a single trustworthy source, while the Verso team gains fewer support requests and clearer prioritization of follow-ups.

---

## Part 1: Business Context (Non-Technical)

### What is the Investor Dashboard?

The investor dashboard is the starting point of the investor app. It gathers everything an investor cares about—portfolio value, cash movements, upcoming tasks, recent uploads—into a single curated view. The layout is intentionally simple: a friendly hero header, a band of key performance indicators, a performance trend chart, vehicle cards, quick actions, and an activity feed.

### Why Does It Matter?

**For Investors**
- Immediate clarity on invested, distributed, and outstanding capital without digging into reports.
- Signals when something needs attention (new documents, tasks, calls, allocations).
- Single launchpad to holdings, tasks, documents, messaging, and deal participation.

**For Verso Operations**
- Fewer "can you send me X?" requests because investors see their own status.
- Encourages self-service for report downloads and onboarding tasks.
- Reinforces Verso's professional brand with real-time, accurate information.

### How It Connects to the Rest of the Portal

- KPI tap targets open expanded views via the KPI modal and link to detailed holdings pages.
- Vehicle cards lead to the dedicated vehicle detail pages for deeper analysis.
- Quick actions surface the same workflows available in the Documents, Reports, and Deals modules.
- The recent activity feed mirrors alerts sent through email or messaging, keeping context in one place.
- The empty state guides new investors toward the onboarding Tasks page to get activated quickly.

### Who Uses It?

- Primary investors with active subscriptions.
- Advisors and family office users who act on behalf of an investor entity.
- Verso relationship managers (viewing in "masquerade" mode) during support calls.

### Core Use Cases

1. **Morning Portfolio Check**  
   An investor logs in on Monday, sees updated NAV and IRR, scans the activity feed, and spots a new valuation update tagged "High priority". They click through to view the details before a client meeting.

2. **Monitoring Capital Calls**  
   A finance manager watches the KPIs for rising unfunded commitments, then opens the capital call notice highlighted in Recent Activity to ensure payment is scheduled.

3. **Preparing for a Review Call**  
   A relationship manager screenshares the dashboard with an investor, filtering activity by a specific deal to discuss pipeline, allocations, and next actions.

4. **New Investor Onboarding**  
   A newly invited investor sees the welcome empty state, clicks through to the Tasks page, and completes onboarding steps before any capital is shown.

5. **Document Retrieval**  
   An investor sees "New document uploaded" in the activity feed, clicks the link, and lands on the Documents page filtered to that file.

---

## Part 2: Experience Walkthrough

### Hero Header & Investor Context
- Personalized greeting with active investor entity and current valuation date.
- Badges summarize the types of vehicles included (funds, real estate, securitizations).
- Shows "Portfolio as of {date}" pulled from the latest valuation snapshot.

### KPI Strip
- Cards for Current NAV, Total Contributed, Total Distributions, Unfunded Commitment, Unrealized Gain, DPI, TVPI, and IRR.
- Cards are interactive: clicking opens the KPI detail modal with definitions, trends, and next-step suggestions.
- Connection indicator shows whether the realtime channel is active.

### Deal Context Selector
- Allows investors to narrow KPIs and activity to a specific deal or view the full portfolio.
- Selector drives filtering of the activity feed and other contextual components.

### Performance Trends
- Line charts comparing portfolio value, net contributions, and distributions over time.
- Uses the latest `performance_snapshots` data and updates as new rows arrive.
- Allows switching between cumulative and period views (v2.1 enhancement placeholder).

### Vehicle Snapshot Cards
- Grid of the investor's vehicles with NAV, units held, domicile, and quick link to each vehicle page.
- Cards highlight new valuations or documents tied to that vehicle.

### VERSO Services Quick Actions
- Buttons for Concluder Deal Room, Off-Market Opportunities, Request Position Statement, and Custom Report Request.
- Buttons link into existing workflows (Deals module, n8n report requests, etc.).

### Recent Activity Feed
- Chronological feed of document uploads, valuations, distributions, deals, messages, tasks, and capital calls.
- Visual tags and badges (Urgent, New) show priority and unread status.
- "View All Communications" link to the messaging module.

### Empty State for New Investors
- Animated hero encouraging onboarding when no data is available.
- Cards describe the flagship vehicles to set expectations.
- Primary CTA leads to `/versoholdings/tasks`; secondary CTA opens messaging.

---

## Part 3: Data Model & Integrations

- **`profiles` / `investor_users` / `investors`**: establish which user belongs to which investor entity. The dashboard uses these links to fetch all investor IDs available to the session.
- **`positions`**: provides units held and last NAV per unit for each vehicle; used to compute Current NAV and populate vehicle cards.
- **`cashflows`**: supplies historical calls and distributions for the contributed vs. distributed KPIs.
- **`subscriptions`**: active commitments, driving the unfunded commitment calculation.
- **`performance_snapshots`**: aggregated NAV, DPI, TVPI, IRR metrics per investor and snapshot date; realtime channel listens for inserts/updates to refresh KPIs and charts.
- **`activity_feed`**: canonical stream of investor-facing events. Each row includes type, title, description, timestamps, deal/vehicle references, and read status flags.
- **`deals` / `deal_memberships`**: used by the deal context selector to list only the deals the investor can access.
- **`vehicles`**: metadata (name, type, domicile, currency) for snapshot cards.
- **`documents`** and **`messages`**: activity feed entries reference these tables through `entity_type`/`entity_id`.
- **Realtime Channels**: Supabase channels `performance_updates` and `activity_updates` keep KPIs and feed current. Connection state is surfaced in the UI to set expectations.
- **Derived Metrics**:
  - `unrealizedGain = currentNAV - totalContributed + totalDistributions`
  - `unrealizedGainPct = (unrealizedGain / totalContributed)` (guard against divide-by-zero)
  - DPI/TVPI/IRR pulled directly from latest snapshot to maintain audited consistency.

---

## Part 4: Functional Requirements

- **Authentication & Access**: User must be authenticated and linked via `investor_users`. RLS ensures they only see their investor IDs.
- **Initial Data Fetch**: Server-side load (Next.js App Router) hydrates KPIs, vehicles, and recent activity before rendering.
- **Realtime Updates**:
  - Subscribe to `activity_feed` with filters limited to investor IDs and optional deal context.
  - Subscribe to `performance_snapshots` for KPI updates; recalculate derived metrics on change.
- **KPI Detail Modal**: Each card opens modal with description, formula, historical values (last 4 quarters), and recommended actions.
- **Deal Filtering**: Changing the deal context reloads feed and KPIs in-memory without full page refresh; the selector resets to "All portfolio" on first visit.
- **Activity Badges**: Unread items highlight until user views them; optional future enhancement to mark read when clicked.
- **Quick Actions**: Buttons must respect the same RLS (e.g., `Request Position Statement` posts to n8n workflow with investor_id).
- **Empty State Logic**: If no positions, no subscriptions, and no recent activity, show onboarding state; hide KPI strip and charts to avoid zero noise.

---

## Part 5: States & Edge Cases

- **No Investor Link**: Redirect to tasks or support message with instructions to contact Verso staff.
- **Single vs. Multiple Investors**: If user represents multiple investor entities, aggregate metrics across all; future enhancement to switch between them.
- **Missing Snapshot Data**: If `performance_snapshots` absent, fall back to manual calculations from positions and cashflows with disclaimers.
- **Realtime Disconnect**: Display a subtle banner or icon if websocket disconnects; allow manual refresh.
- **Currency Handling**: All KPIs display in the investor's base currency (currently USD). Multi-currency support flagged as a roadmap item.
- **Data Latency**: Accept partial data (e.g., positions present but cashflows missing) and surface "Data refreshing" tooltip rather than blank states.

---

## Part 6: Success Metrics

- Daily active investor logins (Dashboard viewed / total active investors).
- Average time on dashboard before navigating to another module.
- Reduction in support tickets requesting NAV or capital call status.
- Percentage of investors clicking through to Tasks from the empty state and completing onboarding within 48 hours.
- Activity feed engagement: number of feed items opened within 24 hours.

---

## Part 7: Open Questions & Follow-Ups

1. Should investors be able to export the KPI panel as PDF/CSV directly from the dashboard?
2. Do we introduce alert preferences (mute document notifications) within the dashboard?
3. How do we surface multiple currency exposures (e.g., EUR vehicles) without clutter?
4. Should unread activity sync with email notifications or remain independent?
5. Clarify whether advisors need a way to switch between investor entities from this page.

---

## Glossary

- **KPI**: Key performance indicator summarizing portfolio performance at a glance.
- **NAV**: Net Asset Value; current valuation of invested capital.
- **DPI**: Distributions to Paid-In capital ratio.
- **TVPI**: Total Value to Paid-In capital ratio.
- **IRR**: Internal Rate of Return, net of fees.
- **Deal Context**: Filter that narrows dashboard data to a specific deal opportunity.
- **Realtime Channel**: Supabase websocket subscription delivering live updates.
- **Activity Feed**: Timeline of notable events relevant to the investor.

---

---

## Part 8: Technical Implementation (Current State)

### Architecture Overview

**Page Structure:**
- **Route**: `/versoholdings/dashboard/page.tsx`
- **Type**: Server Component (Next.js App Router) + Client Component for realtime features
- **Authentication**: Required via `SessionGuard` wrapper
- **Data Flow**: Server-side fetch → Hydrate `RealtimeDashboard` → Realtime subscriptions

**Component Hierarchy:**
```
page.tsx (Server Component)
  └─ SessionGuard
       └─ AppLayout (brand="versoholdings")
            ├─ VERSO Holdings Header (gradient, badges, as-of date)
            ├─ RealtimeDashboard (Client Component)
            │    ├─ DealContextSelector (filter by deal)
            │    ├─ Connection Status Indicator
            │    ├─ KPI Cards Grid (7 cards: NAV, Contributed, Distributions, Unfunded, DPI, TVPI, IRR)
            │    │    └─ KPICard (interactive with drill-down)
            │    ├─ PerformanceTrends (line charts)
            │    ├─ Investment Vehicles Card
            │    ├─ VERSO Services Card
            │    └─ Recent Activity Card
            └─ Empty State (for new users with no data)
```

### Server-Side Data Fetching

**getPortfolioData() Function (page.tsx:17-209):**
```typescript
async function getPortfolioData() {
  return measureTimeAsync('portfolio-data-fetch', async () => {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (!user || userError) return defaultEmptyState

    // 2. Get investor entities linked to this user
    const { data: investorLinks } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) return defaultEmptyState

    const investorIds = investorLinks.map(link => link.investor_id)

    // 3. Get positions for NAV calculation
    const { data: positions } = await supabase
      .from('positions')
      .select('*')
      .in('investor_id', investorIds)

    // 4. Get subscriptions for commitment tracking
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('commitment')
      .in('investor_id', investorIds)
      .eq('status', 'active')

    // 5. Get cashflows for contributions & distributions
    const { data: cashflows } = await supabase
      .from('cashflows')
      .select('type, amount')
      .in('investor_id', investorIds)

    // 6. Calculate basic KPIs from raw data
    const totalContributed = cashflows?.filter(cf => cf.type === 'call')
      .reduce((sum, cf) => sum + (cf.amount || 0), 0) || 0

    const totalDistributions = cashflows?.filter(cf => cf.type === 'distribution')
      .reduce((sum, cf) => sum + (cf.amount || 0), 0) || 0

    const totalCommitment = subscriptions?.reduce((sum, sub) =>
      sum + (sub.commitment || 0), 0) || 0

    const unfundedCommitment = totalCommitment - totalContributed

    const currentNAV = positions?.reduce((sum, pos) =>
      sum + ((pos.units || 0) * (pos.last_nav || 0)), 0) || 0

    // 7. Get aggregated performance from performance_snapshots (preferred)
    const { data: latestPerformance } = await supabase
      .from('performance_snapshots')
      .select('nav_value, contributed, distributed, dpi, tvpi, irr_net')
      .in('investor_id', investorIds)
      .order('snapshot_date', { ascending: false })
      .limit(investorIds.length)

    // Use snapshot data when available, fallback to calculated
    let finalNAV = currentNAV
    let finalContributed = totalContributed
    let finalDistributions = totalDistributions
    let dpi = 0, tvpi = 1, irr = 0

    if (latestPerformance && latestPerformance.length > 0) {
      finalNAV = latestPerformance.reduce((sum, perf) =>
        sum + (perf.nav_value || 0), 0) || currentNAV
      finalContributed = latestPerformance.reduce((sum, perf) =>
        sum + (perf.contributed || 0), 0) || totalContributed
      finalDistributions = latestPerformance.reduce((sum, perf) =>
        sum + (perf.distributed || 0), 0) || totalDistributions

      dpi = finalContributed > 0 ? finalDistributions / finalContributed : 0
      tvpi = finalContributed > 0 ? (finalNAV + finalDistributions) / finalContributed : 1
      irr = latestPerformance.reduce((sum, perf) =>
        sum + (perf.irr_net || 0), 0) / latestPerformance.length
    } else {
      // Fallback calculations
      dpi = finalContributed > 0 ? finalDistributions / finalContributed : 0
      tvpi = finalContributed > 0 ? (finalNAV + finalDistributions) / finalContributed : 1
    }

    const costBasis = positions?.reduce((sum, pos) =>
      sum + (pos.cost_basis || 0), 0) || 0
    const unrealizedGain = finalNAV - costBasis
    const unrealizedGainPct = costBasis > 0 ? (unrealizedGain / costBasis) * 100 : 0

    // 8. Get vehicle breakdown
    const { data: vehicleData } = await supabase
      .from('vehicles')
      .select(`
        id, name, type, domicile, currency,
        subscriptions!inner(investor_id, commitment, status),
        positions(investor_id, units, cost_basis, last_nav, as_of_date)
      `)
      .in('subscriptions.investor_id', investorIds)
      .eq('subscriptions.status', 'active')

    // 9. Get recent activity feed
    const { data: recentActivity } = await supabase
      .from('activity_feed')
      .select('*')
      .in('investor_id', investorIds)
      .order('created_at', { ascending: false })
      .limit(10)

    return {
      kpis: {
        currentNAV: finalNAV,
        totalContributed: finalContributed,
        totalDistributions: finalDistributions,
        unfundedCommitment,
        unrealizedGain,
        unrealizedGainPct,
        dpi,
        tvpi,
        irr
      },
      hasData: finalContributed > 0 || finalNAV > 0,
      vehicles: vehicleData || [],
      recentActivity: recentActivity || []
    }
  })
}
```

### Realtime Features

**RealtimeDashboard Component (realtime-dashboard.tsx:52-701):**

**Realtime Subscriptions:**
```typescript
useEffect(() => {
  if (investorIds.length === 0) return

  const supabase = createClient()

  // 1. Activity Feed Channel
  const activityFilter = selectedDealId
    ? `investor_id=in.(${investorIds.join(',')}) AND deal_id=eq.${selectedDealId}`
    : `investor_id=in.(${investorIds.join(',')})`

  const activityChannel = supabase
    .channel('activity_updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'activity_feed',
      filter: activityFilter
    }, (payload) => {
      if (payload.eventType === 'INSERT') {
        const newActivity = payload.new
        const matchesContext = selectedDealId
          ? newActivity.deal_id === selectedDealId
          : true

        if (matchesContext) {
          setData(prev => ({
            ...prev,
            recentActivity: [newActivity, ...prev.recentActivity.slice(0, 9)]
          }))
        }
      }
    })
    .subscribe((status) => {
      setIsConnected(status === 'SUBSCRIBED')
    })

  // 2. Performance Snapshots Channel
  const performanceChannel = supabase
    .channel('performance_updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'performance_snapshots',
      filter: `investor_id=in.(${investorIds.join(',')})`
    }, async (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        // Re-fetch latest performance data
        const { data: latestPerformance } = await supabase
          .from('performance_snapshots')
          .select('dpi, tvpi, irr_net')
          .in('investor_id', investorIds)
          .order('snapshot_date', { ascending: false })
          .limit(1)

        if (latestPerformance?.[0]) {
          const { dpi, tvpi, irr_net } = latestPerformance[0]
          setData(prev => ({
            ...prev,
            kpis: {
              ...prev.kpis,
              dpi: dpi || prev.kpis.dpi,
              tvpi: tvpi || prev.kpis.tvpi,
              irr: irr_net || prev.kpis.irr
            }
          }))
        }
      }
    })
    .subscribe()

  return () => {
    supabase.removeChannel(activityChannel)
    supabase.removeChannel(performanceChannel)
  }
}, [investorIds, selectedDealId])
```

**Deal Context Filtering:**
```typescript
const fetchDealScopedData = async (dealId: string | null) => {
  if (!dealId) {
    setData(originalData) // Reset to full portfolio
    return
  }

  const supabase = createClient()

  // Get deal and associated vehicle
  const { data: dealData } = await supabase
    .from('deals')
    .select('id, name, vehicle_id, vehicles!inner(id, name)')
    .eq('id', dealId)
    .single()

  if (!dealData) {
    setData(originalData)
    return
  }

  // Get positions for this vehicle
  const { data: positions } = await supabase
    .from('positions')
    .select('*')
    .in('investor_id', investorIds)
    .eq('vehicle_id', dealData.vehicle_id)

  // Get performance snapshots for this vehicle
  const { data: latestPerformance } = await supabase
    .from('performance_snapshots')
    .select('dpi, tvpi, irr_net, nav_value, contributed, distributed')
    .in('investor_id', investorIds)
    .eq('vehicle_id', dealData.vehicle_id)
    .order('snapshot_date', { ascending: false })
    .limit(1)

  // Get cashflows for this vehicle
  const { data: cashflows } = await supabase
    .from('cashflows')
    .select('type, amount')
    .in('investor_id', investorIds)
    .eq('vehicle_id', dealData.vehicle_id)

  // Get deal-specific activity
  const { data: dealActivity } = await supabase
    .from('activity_feed')
    .select('*')
    .in('investor_id', investorIds)
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Calculate deal-scoped KPIs
  // ... (similar calculations as portfolio level)

  setData({
    kpis: { /* calculated values */ },
    vehicles: [dealData.vehicles],
    recentActivity: dealActivity || []
  })
}
```

### Interactive KPI Cards

**KPI Card with Drill-Down (realtime-dashboard.tsx:142-275):**
```typescript
const generateKPIDetail = (kpiType: string): KPIDetail => {
  switch (kpiType) {
    case 'nav':
      return {
        title: 'Net Asset Value',
        value: data.kpis.currentNAV,
        description: 'Current market value of your investment portfolio',
        icon: DollarSign,
        trend: {
          direction: data.kpis.unrealizedGainPct > 0 ? 'up' : 'down',
          value: `${data.kpis.unrealizedGainPct.toFixed(1)}%`,
          period: 'vs cost basis'
        },
        breakdown: [
          { label: 'VERSO FUND', value: data.kpis.currentNAV * 0.6, percentage: 60 },
          { label: 'REAL Empire', value: data.kpis.currentNAV * 0.3, percentage: 30 },
          { label: 'Luxembourg Entities', value: data.kpis.currentNAV * 0.1, percentage: 10 }
        ],
        benchmark: {
          label: 'S&P 500 YTD',
          value: '+18.2%',
          comparison: data.kpis.unrealizedGainPct > 18.2 ? 'above' : 'below'
        },
        insights: [
          'Strong performance across all vehicle types',
          'Real Estate positions showing exceptional growth'
        ]
      }

    case 'dpi':
      return {
        title: 'DPI (Distributions to Paid-In Capital)',
        value: `${data.kpis.dpi.toFixed(2)}x`,
        description: 'Cash returned relative to capital contributed',
        // ... detailed breakdown
      }

    // Similar for TVPI, IRR
  }
}

// Modal opens on KPI card click
const handleKPIClick = (kpiType: string) => {
  const kpiDetail = generateKPIDetail(kpiType)
  setSelectedKPI(kpiDetail)
  setShowKPIModal(true)
}
```

### Data Tables & RLS

**Core Tables:**
```sql
-- Investor linkage
investor_users (user_id, investor_id)

-- Portfolio data
positions (investor_id, vehicle_id, units, cost_basis, last_nav)
subscriptions (investor_id, vehicle_id, commitment, status)
cashflows (investor_id, vehicle_id, type, amount, date)

-- Aggregated performance (preferred source)
performance_snapshots (
  investor_id,
  vehicle_id,
  snapshot_date,
  nav_value,
  contributed,
  distributed,
  dpi,
  tvpi,
  irr_net
)

-- Activity stream
activity_feed (
  investor_id,
  deal_id,
  activity_type,
  title,
  description,
  importance,
  read_status,
  created_at
)

-- Vehicles
vehicles (id, name, type, domicile, currency)
```

**RLS Policies:**
```sql
-- investor_users: see only your own links
create policy investor_users_read on investor_users for select
using (user_id = auth.uid());

-- positions: see only your investor's positions
create policy positions_investor_read on positions for select
using (
  exists (
    select 1 from investor_users iu
    where iu.investor_id = positions.investor_id
      and iu.user_id = auth.uid()
  )
  or exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role like 'staff_%'
  )
);

-- Similar policies for subscriptions, cashflows, performance_snapshots, activity_feed
```

### Performance Optimizations

**Server-Side Rendering:**
- All initial data fetched server-side for fast first paint
- No client-side waterfall requests on initial load
- Performance measurement with `measureTimeAsync`

**Realtime Efficiency:**
- Filtered Supabase channels (only subscribe to relevant investor_id records)
- Connection status indicator shows realtime health
- Optimistic UI updates (immediate feedback on actions)

**Data Fetching Strategy:**
```typescript
// Prefer performance_snapshots (pre-aggregated, audited)
// Fallback to raw calculation from positions/cashflows
// This ensures accuracy while optimizing for speed
```

**Empty State Performance:**
- Separate render path for new users (no expensive calculations)
- Animated welcome screen with static vehicle cards
- CTAs to onboarding tasks and messaging

### Security Implementation

**Authentication:**
- `SessionGuard` wrapper blocks unauthenticated access
- Server-side auth check before any data fetch
- Supabase RLS enforces row-level isolation

**Data Isolation:**
```typescript
// User can only see their linked investors
.from('investor_users')
  .select('investor_id')
  .eq('user_id', user.id)

// All subsequent queries filtered by investorIds
.in('investor_id', investorIds)
```

**Realtime Security:**
- Channels filtered by investor_id at database level
- RLS policies apply to realtime subscriptions
- Cannot subscribe to other investors' channels

### Responsive Design

**Desktop (≥1024px):**
- 7-column KPI grid (all metrics visible)
- Side-by-side VERSO Services + Recent Activity
- Full vehicle cards with all metadata

**Tablet (768-1023px):**
- 4-column KPI grid (wraps to 2 rows)
- Stacked services and activity cards
- Condensed vehicle cards

**Mobile (<768px):**
- 2-column KPI grid (wraps to 4 rows)
- All cards stack vertically
- Simplified vehicle cards (essential info only)

---

**Document Version History**
- v2.0 (October 2, 2025): Added comprehensive technical implementation section
- v1.0 (September 2025): Initial standalone PRD aligned to v2 portal data model
