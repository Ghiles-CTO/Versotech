# Portfolio Schema Quick Reference

Quick lookup guide for developers working on the portfolio page.

---

## Key Tables at a Glance

| Table | Purpose | Key Columns | RLS |
|-------|---------|-------------|-----|
| **positions** | Current holdings | investor_id, vehicle_id, units, cost_basis, last_nav | NO* |
| **subscriptions** | Commitments | investor_id, vehicle_id, commitment, status | NO* |
| **cashflows** | Transactions | investor_id, vehicle_id, type, amount, date | NO* |
| **valuations** | NAV history | vehicle_id, as_of_date, nav_per_unit, nav_total | YES |
| **vehicles** | Funds/SPVs | name, type, currency | YES |
| **performance_snapshots** | Historical metrics | investor_id, vehicle_id, snapshot_date, dpi, tvpi, irr | YES |
| **activity_feed** | Recent activities | investor_id, activity_type, title, created_at | YES |
| **allocations** | Deal allocations | deal_id, investor_id, units, status | YES |
| **deals** | Investment opps | name, status, vehicle_id, target_amount | YES |
| **fee_events** | Fees | investor_id, deal_id, fee_type, computed_amount | YES |

*Access controlled via investors table RLS

---

## RPC Functions

### calculate_investor_kpis(investor_ids, as_of_date)
Returns aggregated portfolio metrics.

**Use when**: Loading portfolio summary/dashboard

**Returns**:
- current_nav, total_contributed, total_distributions
- unfunded_commitment, total_commitment
- unrealized_gain, unrealized_gain_pct
- dpi, tvpi, irr_estimate
- total_positions, total_vehicles

---

### calculate_investor_kpis_with_deals(investor_ids, as_of_date)
Same as above + deal metrics.

**Use when**: Loading portfolio with deal information

**Additional returns**:
- total_deals, total_deal_value, pending_allocations

---

### get_investor_vehicle_breakdown(investor_ids)
Per-vehicle position breakdown.

**Use when**: Displaying holdings table or vehicle list

**Returns** (one row per vehicle):
- vehicle_id, vehicle_name, vehicle_type
- current_value, cost_basis, units
- unrealized_gain, unrealized_gain_pct
- commitment, contributed, distributed
- nav_per_unit, last_valuation_date

---

### get_portfolio_trends(investor_ids, days_back)
Portfolio change over time.

**Use when**: Showing trend indicators or charts

**Returns**:
- nav_change, nav_change_pct
- performance_change, period_days

---

## Common Queries

### Get investor IDs for current user
```sql
SELECT investor_id FROM investor_users WHERE user_id = auth.uid()
```

### Get latest NAV for vehicles
```sql
SELECT * FROM get_latest_valuations()
-- Returns: vehicle_id, nav_per_unit, as_of_date
```

### Get unread activity count
```sql
SELECT COUNT(*) FROM activity_feed
WHERE investor_id = <investor_id>
  AND read_status = false
```

### Get vehicle cashflow history
```sql
SELECT * FROM cashflows
WHERE investor_id = <investor_id>
  AND vehicle_id = <vehicle_id>
ORDER BY date DESC
```

### Get pending allocations
```sql
SELECT a.*, d.name as deal_name
FROM allocations a
JOIN deals d ON a.deal_id = d.id
WHERE a.investor_id = <investor_id>
  AND a.status = 'pending_review'
```

---

## Data Types Reference

### Custom Enums

**user_role**:
- investor
- staff_admin
- staff_ops
- staff_rm

**allocation_status_enum**:
- pending_review
- approved
- rejected
- withdrawn

**deal_status_enum**:
- draft
- open
- allocation_pending
- closed
- cancelled

**deal_type_enum**:
- equity_secondary
- equity_primary
- debt
- structured

**vehicle_type**:
- fund
- spv
- feeder
- other

**fee_event_status_enum**:
- accrued
- invoiced
- paid
- waived
- cancelled

**fee_component_kind_enum**:
- management_fee
- performance_fee
- admin_fee
- transaction_fee
- other

### Numeric Precisions

| Column Type | Precision | Use Case |
|-------------|-----------|----------|
| numeric(18,2) | 2 decimals | Currency amounts (USD, etc.) |
| numeric(18,6) | 6 decimals | Price per unit, NAV per unit |
| numeric(28,8) | 8 decimals | Unit quantities (shares, tokens) |
| numeric(10,4) | 4 decimals | Multiples (DPI, TVPI) |
| numeric(7,4) | 4 decimals | IRR, percentages (as decimals: 0.1234 = 12.34%) |
| numeric(5,2) | 2 decimals | Percentages (as values: 12.34 = 12.34%) |

---

## Foreign Key Relationships

### From positions
- investor_id → investors(id) ON DELETE CASCADE
- vehicle_id → vehicles(id) ON DELETE CASCADE

### From subscriptions
- investor_id → investors(id) ON DELETE CASCADE
- vehicle_id → vehicles(id) ON DELETE CASCADE

### From cashflows
- investor_id → investors(id) ON DELETE CASCADE
- vehicle_id → vehicles(id) ON DELETE CASCADE

### From allocations
- deal_id → deals(id) ON DELETE CASCADE
- investor_id → investors(id)
- approved_by → profiles(id)

### From valuations
- vehicle_id → vehicles(id) ON DELETE CASCADE

### From performance_snapshots
- investor_id → investors(id) ON DELETE CASCADE
- vehicle_id → vehicles(id) ON DELETE CASCADE

### From activity_feed
- investor_id → investors(id) ON DELETE CASCADE
- deal_id → deals(id)
- vehicle_id → vehicles(id)

### From fee_events
- deal_id → deals(id) ON DELETE CASCADE
- investor_id → investors(id)
- allocation_id → allocations(id)
- invoice_id → invoices(id)
- payment_id → payments(id)

---

## Index Cheat Sheet

### For fast investor portfolio queries:
- `idx_positions_investor_vehicle` on (investor_id, vehicle_id)
- `idx_cashflows_investor_vehicle_date` on (investor_id, vehicle_id, date)
- `idx_subscriptions_investor_status` on (investor_id, status)
- `idx_performance_snapshots_investor_date` on (investor_id, snapshot_date DESC)

### For vehicle lookups:
- `idx_valuations_vehicle_date` on (vehicle_id, as_of_date DESC)
- Unique index on (vehicle_id, as_of_date) from valuations constraint

### For activity feed:
- `idx_activity_feed_investor_created` on (investor_id, created_at DESC)
- `idx_activity_feed_importance_unread` on (importance, read_status, created_at DESC) WHERE read_status = false

### For deal allocations:
- `idx_allocations_deal_investor_status` on (deal_id, investor_id, status)

---

## Typical Data Access Pattern (Frontend)

```typescript
// 1. Get current user's investor IDs
const { data: investorUsers } = await supabase
  .from('investor_users')
  .select('investor_id')
  .eq('user_id', user.id);

const investorIds = investorUsers.map(iu => iu.investor_id);

// 2. Get portfolio KPIs
const { data: kpis } = await supabase
  .rpc('calculate_investor_kpis_with_deals', {
    investor_ids: investorIds,
    as_of_date: new Date().toISOString().split('T')[0]
  })
  .single();

// 3. Get vehicle breakdown
const { data: holdings } = await supabase
  .rpc('get_investor_vehicle_breakdown', {
    investor_ids: investorIds
  });

// 4. Get trends
const { data: trends } = await supabase
  .rpc('get_portfolio_trends', {
    investor_ids: investorIds,
    days_back: 30
  })
  .single();

// 5. Get recent activity
const { data: activities } = await supabase
  .from('activity_feed')
  .select('*')
  .in('investor_id', investorIds)
  .order('created_at', { ascending: false })
  .limit(10);

// 6. Get performance snapshots for chart
const { data: snapshots } = await supabase
  .from('performance_snapshots')
  .select('*')
  .in('investor_id', investorIds)
  .order('snapshot_date', { ascending: false })
  .limit(90); // Last 90 days
```

---

## Permissions Quick Check

### Tables with RLS ENABLED:
✅ activity_feed, allocations, capital_calls, deals, distributions, fee_events, performance_snapshots, valuations, vehicles

**Access Pattern**:
- Investors: Can only see their own data
- Staff (staff_admin, staff_ops, staff_rm): Can see all data

### Tables WITHOUT RLS:
❌ cashflows, investor_users, positions, profiles, subscriptions

**Access Pattern**:
- Access controlled via foreign key to investors table (which has RLS)
- Or via auth.uid() checks in application code

---

## Common Pitfalls

### ❌ Don't query positions directly without investor check
```typescript
// WRONG - bypasses RLS on investors
const { data } = await supabase
  .from('positions')
  .select('*')
  .eq('vehicle_id', vehicleId);
```

```typescript
// CORRECT - includes investor filter
const { data } = await supabase
  .from('positions')
  .select('*')
  .eq('vehicle_id', vehicleId)
  .in('investor_id', investorIds);
```

### ❌ Don't forget to handle null NAV values
```typescript
// WRONG - assumes last_nav exists
const value = position.units * position.last_nav;
```

```typescript
// CORRECT - handles null NAV
const navPerUnit = latestValuation?.nav_per_unit ?? position.last_nav ?? 0;
const value = position.units * navPerUnit;
```

### ❌ Don't use incorrect date formats
```typescript
// WRONG - full timestamp
const asOfDate = new Date().toISOString(); // "2025-12-06T10:30:00.000Z"
```

```typescript
// CORRECT - date only
const asOfDate = new Date().toISOString().split('T')[0]; // "2025-12-06"
```

### ❌ Don't mix currency units
```typescript
// WRONG - mixing precision
const commitment = 1000000.12345678; // Too many decimals for currency
```

```typescript
// CORRECT - proper precision
const commitment = 1000000.12; // numeric(18,2)
const units = 1234.56789012; // numeric(28,8)
```

---

## Testing Queries

### Check if investor has access to vehicle
```sql
SELECT EXISTS (
  SELECT 1 FROM positions
  WHERE investor_id = '<investor_id>'
    AND vehicle_id = '<vehicle_id>'
    AND units > 0
);
```

### Verify KPI calculations
```sql
-- Manual calculation vs RPC
WITH manual AS (
  SELECT
    COALESCE(SUM(p.units * COALESCE(v.nav_per_unit, p.last_nav, 0)), 0) as nav,
    COALESCE(SUM(p.cost_basis), 0) as cost_basis
  FROM positions p
  LEFT JOIN LATERAL (
    SELECT nav_per_unit
    FROM valuations
    WHERE vehicle_id = p.vehicle_id
    ORDER BY as_of_date DESC
    LIMIT 1
  ) v ON true
  WHERE p.investor_id = '<investor_id>'
)
SELECT
  m.*,
  k.*
FROM manual m
CROSS JOIN calculate_investor_kpis(ARRAY['<investor_id>'::uuid]) k;
```

---

*End of Quick Reference*
