# Portfolio Page Data Flow & Relationships

This document visualizes how data flows through the portfolio page and the relationships between tables.

---

## Core Data Model

```
┌─────────────┐
│  profiles   │ (User accounts: investors & staff)
│  (auth)     │
└──────┬──────┘
       │
       │ N:M via investor_users
       │
       ▼
┌─────────────┐
│  investors  │ (Investor entities: individuals, funds, institutions)
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│ positions   │   │subscriptions│ (Commitments)
│ (Current)   │   │             │
└──────┬──────┘   └──────┬──────┘
       │                 │
       │                 │
       │    ┌────────────┘
       │    │
       ▼    ▼
    ┌─────────────┐
    │  vehicles   │ (Funds/SPVs)
    │             │
    └──────┬──────┘
           │
           ├──────────────┬──────────────┬──────────────┐
           │              │              │              │
           ▼              ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
    │valuations│   │capital   │   │distribut-│   │  deals   │
    │          │   │  calls   │   │  ions    │   │          │
    └──────────┘   └──────────┘   └──────────┘   └────┬─────┘
                                                       │
                                                       ▼
                                                  ┌──────────┐
                                                  │allocation│
                                                  │    s     │
                                                  └──────────┘
```

---

## Portfolio Page Data Dependencies

### 1. Portfolio Summary / KPIs
**Source**: `calculate_investor_kpis()` or `calculate_investor_kpis_with_deals()` RPC

**Dependencies**:
```
positions (current holdings)
  ├─> vehicles (vehicle info)
  ├─> valuations (latest NAV per unit via get_latest_valuations())
  └─> cost_basis (from positions)

cashflows (historical transactions)
  ├─> type = 'call' (contributions)
  └─> type = 'distribution' (distributions)

subscriptions (commitments)
  └─> status IN ('active', 'pending')

allocations (deal allocations)
  └─> status, units, unit_price
```

**Calculated Metrics**:
- Current NAV = SUM(positions.units × valuations.nav_per_unit)
- Total Contributed = SUM(cashflows WHERE type='call')
- Total Distributions = SUM(cashflows WHERE type='distribution')
- Total Commitment = SUM(subscriptions.commitment)
- Unfunded Commitment = Total Commitment - Total Contributed
- Unrealized Gain = Current NAV - Cost Basis
- DPI = Total Distributions / Total Contributed
- TVPI = (Current NAV + Total Distributions) / Total Contributed

---

### 2. Vehicle Breakdown
**Source**: `get_investor_vehicle_breakdown()` RPC

**Dependencies**:
```
vehicles (base vehicle info)
  └─> positions (investor holdings)
       ├─> valuations (latest NAV)
       ├─> subscriptions (commitment info)
       └─> cashflows (contributed/distributed by vehicle)
            ├─> WHERE type = 'call' (contributions)
            └─> WHERE type = 'distribution' (distributions)
```

**Per-Vehicle Metrics**:
- Current Value = positions.units × valuations.nav_per_unit
- Cost Basis = positions.cost_basis
- Unrealized Gain = Current Value - Cost Basis
- Commitment = subscriptions.commitment
- Contributed = SUM(cashflows WHERE type='call' AND vehicle_id=X)
- Distributed = SUM(cashflows WHERE type='distribution' AND vehicle_id=X)

---

### 3. Portfolio Trends
**Source**: `get_portfolio_trends()` RPC

**Dependencies**:
```
Calculate KPIs at two time points:
  ├─> Current Date (calculate_investor_kpis with as_of_date = today)
  └─> Historical Date (calculate_investor_kpis with as_of_date = today - days_back)

Compare:
  ├─> NAV Change = Current NAV - Historical NAV
  ├─> NAV Change % = (NAV Change / Historical NAV) × 100
  └─> Performance Change = Current Unrealized Gain % - Historical Unrealized Gain %
```

---

### 4. Activity Feed
**Source**: `activity_feed` table

**Query Pattern**:
```sql
SELECT * FROM activity_feed
WHERE investor_id = <investor_id>
  AND read_status = false  -- for unread count
ORDER BY created_at DESC
LIMIT 10
```

**Related Entities**:
- deal_id → deals (for deal-related activities)
- vehicle_id → vehicles (for vehicle-related activities)
- entity_id + entity_type → polymorphic relationship

---

### 5. Performance Snapshots
**Source**: `performance_snapshots` table

**Query Pattern**:
```sql
SELECT * FROM performance_snapshots
WHERE investor_id = <investor_id>
  AND vehicle_id = <vehicle_id>  -- optional filter
ORDER BY snapshot_date DESC
```

**Metrics Stored**:
- nav_value, contributed, distributed
- dpi, tvpi, irr_gross, irr_net

---

### 6. Fee Events
**Source**: `fee_events` table

**Query Pattern**:
```sql
SELECT * FROM fee_events
WHERE investor_id = <investor_id>
  AND status = 'accrued'  -- or other status
ORDER BY event_date DESC
```

**Related Entities**:
- deal_id → deals
- allocation_id → allocations
- invoice_id → invoices
- fee_component_id → fee_components

---

## Data Flow for Common Operations

### Loading Portfolio Dashboard

```
1. Authenticate user (profiles)
   ↓
2. Get investor IDs for user (investor_users)
   ↓
3. PARALLEL:
   ├─> calculate_investor_kpis_with_deals(investor_ids)
   │    └─> Returns: NAV, contributions, distributions, DPI, TVPI, IRR, etc.
   │
   ├─> get_investor_vehicle_breakdown(investor_ids)
   │    └─> Returns: Per-vehicle breakdown with metrics
   │
   ├─> get_portfolio_trends(investor_ids, 30)
   │    └─> Returns: 30-day NAV/performance changes
   │
   ├─> SELECT FROM activity_feed WHERE investor_id = ANY(investor_ids)
   │    └─> Returns: Recent activity items
   │
   └─> SELECT FROM performance_snapshots WHERE investor_id = ANY(investor_ids)
        └─> Returns: Historical performance data for charts
```

---

### Drill-Down: Vehicle Detail View

```
1. User clicks on specific vehicle
   ↓
2. PARALLEL:
   ├─> SELECT FROM vehicles WHERE id = <vehicle_id>
   │    └─> Returns: Vehicle basic info
   │
   ├─> SELECT FROM positions WHERE vehicle_id = <vehicle_id> AND investor_id = <investor_id>
   │    └─> Returns: Units, cost basis, last NAV
   │
   ├─> SELECT FROM valuations WHERE vehicle_id = <vehicle_id> ORDER BY as_of_date DESC
   │    └─> Returns: Historical valuations (for chart)
   │
   ├─> SELECT FROM subscriptions WHERE vehicle_id = <vehicle_id> AND investor_id = <investor_id>
   │    └─> Returns: Commitment, status
   │
   ├─> SELECT FROM cashflows WHERE vehicle_id = <vehicle_id> AND investor_id = <investor_id>
   │    └─> Returns: All capital calls and distributions
   │
   └─> SELECT FROM capital_calls WHERE vehicle_id = <vehicle_id>
        └─> Returns: Upcoming capital calls
```

---

### Deal Allocation Flow

```
1. Investor views deal (deals)
   ↓
2. Investor submits allocation request
   ↓
3. INSERT INTO allocations
   ├─> deal_id, investor_id, units, unit_price
   └─> status = 'pending_review'
   ↓
4. Staff approves allocation
   ↓
5. UPDATE allocations SET status = 'approved', approved_by = <staff_id>
   ↓
6. (Workflow) Create subscription from allocation
   ↓
7. INSERT INTO subscriptions
   ├─> vehicle_id (from deal)
   ├─> investor_id
   └─> commitment = units × unit_price
   ↓
8. INSERT INTO positions (if not exists)
   ├─> investor_id, vehicle_id
   ├─> units = 0 (initial)
   └─> cost_basis = 0
```

---

### Capital Call Processing

```
1. Staff creates capital call (capital_calls)
   ├─> vehicle_id, call_pct, due_date
   └─> status = 'draft'
   ↓
2. Staff publishes capital call
   ↓
3. UPDATE capital_calls SET status = 'published'
   ↓
4. (Workflow) Generate investor-specific capital call amounts
   ↓
5. FOR EACH subscription on vehicle:
   ├─> Calculate call_amount = subscription.commitment × capital_call.call_pct
   ├─> INSERT INTO cashflows
   │    ├─> investor_id, vehicle_id
   │    ├─> type = 'call'
   │    ├─> amount = call_amount
   │    ├─> date = capital_call.due_date
   │    └─> ref_id = capital_call.id
   └─> UPDATE positions
        └─> cost_basis += call_amount
```

---

### Distribution Processing

```
1. Staff creates distribution (distributions)
   ├─> vehicle_id, amount, date
   └─> classification
   ↓
2. (Workflow) Allocate distribution to investors
   ↓
3. FOR EACH position on vehicle:
   ├─> Calculate share = (position.units / total_units) × distribution.amount
   ├─> INSERT INTO cashflows
   │    ├─> investor_id, vehicle_id
   │    ├─> type = 'distribution'
   │    ├─> amount = share
   │    ├─> date = distribution.date
   │    └─> ref_id = distribution.id
   └─> (Optionally) INSERT INTO activity_feed
        └─> activity_type = 'distribution', title, description
```

---

## Performance Optimization Notes

### Materialized Views (if needed)
Consider creating materialized views for:
- Latest valuations per vehicle (currently using `get_latest_valuations()`)
- Investor summary data (if KPI calculation becomes slow)

### Index Strategy
Critical indexes already in place:
- `idx_positions_investor_vehicle` - Fast position lookups
- `idx_cashflows_investor_vehicle_date` - Fast cashflow aggregation
- `idx_valuations_vehicle_date` - Fast latest valuation lookup
- `idx_subscriptions_investor_status` - Fast commitment lookups
- `idx_performance_snapshots_investor_date` - Fast historical data retrieval

### Query Optimization
- Use `get_latest_valuations()` function to avoid DISTINCT ON in each query
- Batch fetch all data in parallel using Promise.all() on frontend
- Cache vehicle list and valuation data (changes infrequently)
- Use pagination for activity feed and performance snapshots

---

## RLS Policy Patterns

### Investor Access Pattern
```sql
-- Example from positions (implicitly via investors RLS)
WHERE investor_id IN (
  SELECT investor_id FROM investor_users WHERE user_id = auth.uid()
)
```

### Staff Access Pattern
```sql
-- Example from activity_feed
WHERE EXISTS (
  SELECT 1 FROM profiles p
  WHERE p.id = auth.uid()
    AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
)
```

### Hybrid Pattern (Investor or Staff)
```sql
-- Example from allocations
WHERE (
  -- Investor can see their own
  investor_id IN (SELECT investor_id FROM investor_users WHERE user_id = auth.uid())
  OR
  -- Staff can see all
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role LIKE 'staff_%')
)
```

---

*End of Document*
