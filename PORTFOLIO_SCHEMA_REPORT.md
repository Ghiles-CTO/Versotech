# Portfolio Page Database Schema Report

Generated: 2025-12-06

This report documents the complete schema for all tables used by the portfolio page, including columns, constraints, foreign keys, indexes, and RLS status.

---

## Table of Contents
1. [activity_feed](#1-activity_feed)
2. [allocations](#2-allocations)
3. [capital_calls](#3-capital_calls)
4. [cashflows](#4-cashflows)
5. [deals](#5-deals)
6. [distributions](#6-distributions)
7. [fee_events](#7-fee_events)
8. [investor_users](#8-investor_users)
9. [performance_snapshots](#9-performance_snapshots)
10. [positions](#10-positions)
11. [profiles](#11-profiles)
12. [subscriptions](#12-subscriptions)
13. [valuations](#13-valuations)
14. [vehicles](#14-vehicles)
15. [RPC Functions](#rpc-functions)

---

## 1. activity_feed

**Purpose**: Track investor activity feed items (documents, tasks, messages, valuations, distributions, capital calls, deals, allocations)

### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| investor_id | uuid | YES | NULL | Foreign key to investors |
| activity_type | text | NO | - | Type of activity (constrained) |
| title | text | NO | - | Activity title |
| description | text | YES | NULL | Activity description |
| entity_id | uuid | YES | NULL | Related entity ID |
| entity_type | text | YES | NULL | Related entity type |
| importance | text | YES | 'normal' | Importance level (high/normal/low) |
| read_status | boolean | YES | false | Whether activity has been read |
| deal_id | uuid | YES | NULL | Foreign key to deals |
| vehicle_id | uuid | YES | NULL | Foreign key to vehicles |
| created_at | timestamp with time zone | YES | now() | Creation timestamp |

### Constraints
- **Primary Key**: `activity_feed_pkey` on (id)
- **Check Constraints**:
  - `activity_feed_activity_type_check`: activity_type IN ('document', 'task', 'message', 'valuation', 'distribution', 'capital_call', 'deal', 'allocation')
  - `activity_feed_importance_check`: importance IN ('high', 'normal', 'low')

### Foreign Keys
- `activity_feed_deal_id_fkey`: deal_id → deals(id)
- `activity_feed_investor_id_fkey`: investor_id → investors(id) ON DELETE CASCADE
- `activity_feed_vehicle_id_fkey`: vehicle_id → vehicles(id)

### Indexes
- `idx_activity_feed_deal_id`: (deal_id, created_at DESC) WHERE deal_id IS NOT NULL
- `idx_activity_feed_importance_unread`: (importance, read_status, created_at DESC) WHERE read_status = false
- `idx_activity_feed_investor_created`: (investor_id, created_at DESC)

### RLS Status
**ENABLED** - Investors can read their own activity, staff can read all

---

## 2. allocations

**Purpose**: Track investor allocations to deals

### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| deal_id | uuid | YES | NULL | Foreign key to deals |
| investor_id | uuid | YES | NULL | Foreign key to investors |
| unit_price | numeric(18,6) | NO | - | Price per unit |
| units | numeric(28,8) | NO | - | Number of units allocated |
| status | allocation_status_enum | YES | 'pending_review' | Allocation status |
| approved_by | uuid | YES | NULL | Foreign key to profiles (approver) |
| approved_at | timestamp with time zone | YES | NULL | Approval timestamp |
| created_at | timestamp with time zone | YES | now() | Creation timestamp |

### Constraints
- **Primary Key**: `allocations_pkey` on (id)
- **Check Constraints**:
  - `allocations_units_check`: units > 0

### Foreign Keys
- `allocations_approved_by_fkey`: approved_by → profiles(id)
- `allocations_deal_id_fkey`: deal_id → deals(id) ON DELETE CASCADE
- `allocations_investor_id_fkey`: investor_id → investors(id)

### Indexes
- `idx_allocations_deal_investor_status`: (deal_id, investor_id, status)

### RLS Status
**ENABLED** - Investors can read their own allocations, deal members can read allocations for their deals, staff can read/write all

---

## 3. capital_calls

**Purpose**: Track capital calls issued to investors for vehicle commitments

### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| vehicle_id | uuid | YES | NULL | Foreign key to vehicles |
| name | text | YES | NULL | Capital call name/identifier |
| call_pct | numeric(7,4) | YES | NULL | Percentage of commitment being called |
| due_date | date | YES | NULL | Payment due date |
| status | text | YES | 'draft' | Call status |

### Constraints
- **Primary Key**: `capital_calls_pkey` on (id)

### Foreign Keys
- `capital_calls_vehicle_id_fkey`: vehicle_id → vehicles(id) ON DELETE CASCADE

### Indexes
None specific to capital_calls

### RLS Status
**ENABLED** - Access controlled based on investor relationship to vehicle

---

## 4. cashflows

**Purpose**: Track investor cash movements (capital calls and distributions)

### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| investor_id | uuid | YES | NULL | Foreign key to investors |
| vehicle_id | uuid | YES | NULL | Foreign key to vehicles |
| type | text | YES | NULL | Cashflow type (call or distribution) |
| amount | numeric(18,2) | YES | NULL | Cashflow amount |
| date | date | YES | NULL | Cashflow date |
| ref_id | uuid | YES | NULL | Reference to source record |

### Constraints
- **Primary Key**: `cashflows_pkey` on (id)
- **Check Constraints**:
  - `cashflows_type_check`: type IN ('call', 'distribution')

### Foreign Keys
- `cashflows_investor_id_fkey`: investor_id → investors(id) ON DELETE CASCADE
- `cashflows_vehicle_id_fkey`: vehicle_id → vehicles(id) ON DELETE CASCADE

### Indexes
- `cashflows_investor_id_vehicle_id_date_idx`: (investor_id, vehicle_id, date)
- `idx_cashflows_investor_type_date`: (investor_id, type, date)
- `idx_cashflows_investor_vehicle_date`: (investor_id, vehicle_id, date)

### RLS Status
**NOT ENABLED** - Access controlled via investor_id foreign key and RLS on investors table

---

## 5. deals

**Purpose**: Investment opportunities/deal pipeline

### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| vehicle_id | uuid | YES | NULL | Foreign key to vehicles (if linked) |
| name | text | NO | - | Deal name |
| deal_type | deal_type_enum | YES | 'equity_secondary' | Type of deal |
| status | deal_status_enum | YES | 'open' | Deal status |
| currency | text | YES | 'USD' | Currency |
| open_at | timestamp with time zone | YES | NULL | Deal opening date |
| close_at | timestamp with time zone | YES | NULL | Deal closing date |
| terms_schema | jsonb | YES | NULL | Deal terms schema |
| offer_unit_price | numeric(18,6) | YES | NULL | Offered price per unit |
| created_by | uuid | YES | NULL | Foreign key to profiles (creator) |
| created_at | timestamp with time zone | YES | now() | Creation timestamp |
| description | text | YES | NULL | Deal description |
| investment_thesis | text | YES | NULL | Investment thesis |
| minimum_investment | numeric(18,2) | YES | NULL | Minimum investment amount |
| maximum_investment | numeric(18,2) | YES | NULL | Maximum investment amount |
| target_amount | numeric(18,2) | YES | NULL | Target raise amount |
| raised_amount | numeric(18,2) | YES | 0 | Amount raised so far |
| company_name | text | YES | NULL | Company name |
| company_logo_url | text | YES | NULL | Company logo URL |
| sector | text | YES | NULL | Industry sector |
| stage | text | YES | NULL | Company stage |
| location | text | YES | NULL | Company location |

### Constraints
- **Primary Key**: `deals_pkey` on (id)

### Foreign Keys
- `deals_created_by_fkey`: created_by → profiles(id)
- `deals_vehicle_id_fkey`: vehicle_id → vehicles(id)

### Indexes
- `idx_deals_created_by`: (created_by)
- `idx_deals_status_type`: (status, deal_type)
- `idx_deals_vehicle`: (vehicle_id)

### RLS Status
**ENABLED** - Access controlled based on deal membership and staff role

---

## 6. distributions

**Purpose**: Track distributions paid out from vehicles

### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| vehicle_id | uuid | YES | NULL | Foreign key to vehicles |
| name | text | YES | NULL | Distribution name/identifier |
| amount | numeric(18,2) | YES | NULL | Total distribution amount |
| date | date | YES | NULL | Distribution date |
| classification | text | YES | NULL | Distribution classification |

### Constraints
- **Primary Key**: `distributions_pkey` on (id)

### Foreign Keys
- `distributions_vehicle_id_fkey`: vehicle_id → vehicles(id) ON DELETE CASCADE

### Indexes
None specific to distributions

### RLS Status
**ENABLED** - Access controlled based on investor relationship to vehicle

---

## 7. fee_events

**Purpose**: Track fee events for investors (management fees, performance fees, etc.)

### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| deal_id | uuid | YES | NULL | Foreign key to deals |
| investor_id | uuid | YES | NULL | Foreign key to investors |
| fee_component_id | uuid | YES | NULL | Foreign key to fee_components |
| event_date | date | NO | - | Date of fee event |
| base_amount | numeric(18,2) | YES | NULL | Base amount for calculation |
| computed_amount | numeric(18,2) | NO | - | Computed fee amount |
| currency | text | YES | 'USD' | Currency |
| source_ref | text | YES | NULL | Source reference |
| status | fee_event_status_enum | YES | 'accrued' | Fee status |
| created_at | timestamp with time zone | YES | now() | Creation timestamp |
| fee_type | fee_component_kind_enum | YES | NULL | Type of fee |
| allocation_id | uuid | YES | NULL | Foreign key to allocations |
| rate_bps | integer | YES | NULL | Rate in basis points |
| invoice_id | uuid | YES | NULL | Foreign key to invoices |
| payment_id | uuid | YES | NULL | Foreign key to payments |
| processed_at | timestamp with time zone | YES | NULL | Processing timestamp |
| notes | text | YES | NULL | Notes |
| period_start_date | date | YES | NULL | Fee period start |
| period_end_date | date | YES | NULL | Fee period end |

### Constraints
- **Primary Key**: `fee_events_pkey` on (id)

### Foreign Keys
- `fee_events_allocation_id_fkey`: allocation_id → allocations(id)
- `fee_events_deal_id_fkey`: deal_id → deals(id) ON DELETE CASCADE
- `fee_events_fee_component_id_fkey`: fee_component_id → fee_components(id)
- `fee_events_investor_id_fkey`: investor_id → investors(id)
- `fee_events_invoice_id_fkey`: invoice_id → invoices(id)
- `fee_events_payment_id_fkey`: payment_id → payments(id)

### Indexes
- `idx_fee_events_deal_investor_status_date`: (deal_id, investor_id, status, event_date)
- `idx_fee_events_fee_type_date`: (fee_type, event_date DESC)
- `idx_fee_events_investor_status_date`: (investor_id, status, event_date DESC)

### RLS Status
**ENABLED** - Investors can read their own fee events, staff can read/write all

---

## 8. investor_users

**Purpose**: Junction table linking investors to user accounts (profiles)

### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| investor_id | uuid | NO | - | Foreign key to investors |
| user_id | uuid | NO | - | Foreign key to profiles |

### Constraints
- **Primary Key**: `investor_users_pkey` on (investor_id, user_id)

### Foreign Keys
- `investor_users_investor_id_fkey`: investor_id → investors(id) ON DELETE CASCADE
- `investor_users_user_id_fkey`: user_id → profiles(id) ON DELETE CASCADE

### Indexes
None specific to investor_users (composite PK serves as index)

### RLS Status
**NOT ENABLED** - Access controlled via foreign key relationships

---

## 9. performance_snapshots

**Purpose**: Store point-in-time performance metrics for investor positions

### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| investor_id | uuid | YES | NULL | Foreign key to investors |
| vehicle_id | uuid | YES | NULL | Foreign key to vehicles |
| snapshot_date | date | NO | - | Date of snapshot |
| nav_value | numeric(18,2) | YES | NULL | NAV value at snapshot |
| contributed | numeric(18,2) | YES | NULL | Contributed capital |
| distributed | numeric(18,2) | YES | NULL | Distributed capital |
| dpi | numeric(10,4) | YES | NULL | Distributions to Paid-In |
| tvpi | numeric(10,4) | YES | NULL | Total Value to Paid-In |
| irr_gross | numeric(7,4) | YES | NULL | Gross IRR |
| irr_net | numeric(7,4) | YES | NULL | Net IRR |
| created_at | timestamp with time zone | YES | now() | Creation timestamp |

### Constraints
- **Primary Key**: `performance_snapshots_pkey` on (id)
- **Unique**: `performance_snapshots_investor_id_vehicle_id_snapshot_date_key` on (investor_id, vehicle_id, snapshot_date)

### Foreign Keys
- `performance_snapshots_investor_id_fkey`: investor_id → investors(id) ON DELETE CASCADE
- `performance_snapshots_vehicle_id_fkey`: vehicle_id → vehicles(id) ON DELETE CASCADE

### Indexes
- `idx_performance_snapshots_investor_date`: (investor_id, snapshot_date DESC)
- `idx_performance_snapshots_vehicle_date`: (vehicle_id, snapshot_date DESC)

### RLS Status
**ENABLED** - Investors can read their own snapshots, staff can read/write all

---

## 10. positions

**Purpose**: Track current investor positions in vehicles

### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| investor_id | uuid | YES | NULL | Foreign key to investors |
| vehicle_id | uuid | YES | NULL | Foreign key to vehicles |
| units | numeric(28,8) | YES | NULL | Number of units held |
| cost_basis | numeric(18,2) | YES | NULL | Total cost basis |
| last_nav | numeric(18,6) | YES | NULL | Last NAV per unit |
| as_of_date | date | YES | NULL | As-of date for last_nav |

### Constraints
- **Primary Key**: `positions_pkey` on (id)
- **Unique**: `positions_investor_id_vehicle_id_key` on (investor_id, vehicle_id)

### Foreign Keys
- `positions_investor_id_fkey`: investor_id → investors(id) ON DELETE CASCADE
- `positions_vehicle_id_fkey`: vehicle_id → vehicles(id) ON DELETE CASCADE

### Indexes
- `idx_positions_investor_vehicle`: (investor_id, vehicle_id)
- `positions_investor_id_vehicle_id_idx`: (investor_id, vehicle_id) [duplicate index]

### RLS Status
**NOT ENABLED** - Access controlled via investor_id foreign key and RLS on investors table

---

## 11. profiles

**Purpose**: User accounts (both investors and staff)

### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | - | Primary key (matches auth.users.id) |
| role | user_role | NO | 'investor' | User role (investor/staff_admin/staff_ops/staff_rm) |
| display_name | text | YES | NULL | Display name |
| email | citext | YES | NULL | Email address (case-insensitive) |
| title | text | YES | NULL | Job title |
| created_at | timestamp with time zone | YES | now() | Creation timestamp |

### Constraints
- **Primary Key**: `profiles_pkey` on (id)
- **Unique**: `profiles_email_key` on (email)

### Foreign Keys
- `profiles_id_fkey`: id → auth.users(id) ON DELETE CASCADE

### Indexes
None specific to profiles beyond unique constraints

### RLS Status
**NOT ENABLED** - Access controlled via auth.uid() and role checks in policies

---

## 12. subscriptions

**Purpose**: Track investor commitments to vehicles

### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| investor_id | uuid | YES | NULL | Foreign key to investors |
| vehicle_id | uuid | YES | NULL | Foreign key to vehicles |
| commitment | numeric(18,2) | YES | NULL | Commitment amount |
| currency | text | YES | 'USD' | Currency |
| status | text | YES | 'pending' | Subscription status |
| signed_doc_id | uuid | YES | NULL | Foreign key to signed document |
| created_at | timestamp with time zone | YES | now() | Creation timestamp |

### Constraints
- **Primary Key**: `subscriptions_pkey` on (id)

### Foreign Keys
- `subscriptions_investor_id_fkey`: investor_id → investors(id) ON DELETE CASCADE
- `subscriptions_vehicle_id_fkey`: vehicle_id → vehicles(id) ON DELETE CASCADE

### Indexes
- `idx_subscriptions_investor_status`: (investor_id, status)

### RLS Status
**NOT ENABLED** - Access controlled via investor_id foreign key and RLS on investors table

---

## 13. valuations

**Purpose**: Track vehicle valuations over time

### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| vehicle_id | uuid | YES | NULL | Foreign key to vehicles |
| as_of_date | date | NO | - | Valuation date |
| nav_total | numeric(18,2) | YES | NULL | Total NAV |
| nav_per_unit | numeric(18,6) | YES | NULL | NAV per unit |

### Constraints
- **Primary Key**: `valuations_pkey` on (id)
- **Unique**: `valuations_vehicle_id_as_of_date_key` on (vehicle_id, as_of_date)

### Foreign Keys
- `valuations_vehicle_id_fkey`: vehicle_id → vehicles(id) ON DELETE CASCADE

### Indexes
- `idx_valuations_vehicle_date`: (vehicle_id, as_of_date DESC)

### RLS Status
**ENABLED** - Access controlled based on investor relationship to vehicle

---

## 14. vehicles

**Purpose**: Investment vehicles (funds, SPVs, etc.)

### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| name | text | NO | - | Vehicle name |
| domicile | text | YES | NULL | Legal domicile |
| currency | text | YES | 'USD' | Base currency |
| created_at | timestamp with time zone | YES | now() | Creation timestamp |
| type | vehicle_type | YES | NULL | Vehicle type enum |
| formation_date | date | YES | NULL | Date of formation |
| legal_jurisdiction | text | YES | NULL | Legal jurisdiction |
| registration_number | text | YES | NULL | Registration number |
| notes | text | YES | NULL | Internal notes |

### Constraints
- **Primary Key**: `vehicles_pkey` on (id)

### Foreign Keys
None

### Indexes
None specific to vehicles

### RLS Status
**ENABLED** - Staff can read all, investors can read vehicles they have positions in

---

## RPC Functions

### 1. calculate_investor_kpis

**Purpose**: Calculate comprehensive KPIs for one or more investors

**Signature**:
```sql
calculate_investor_kpis(
  investor_ids uuid[],
  as_of_date date DEFAULT CURRENT_DATE
)
```

**Returns**:
| Column | Type | Description |
|--------|------|-------------|
| current_nav | numeric | Current NAV value |
| total_contributed | numeric | Total capital contributed |
| total_distributions | numeric | Total distributions received |
| unfunded_commitment | numeric | Unfunded commitment amount |
| total_commitment | numeric | Total commitment amount |
| total_cost_basis | numeric | Total cost basis |
| unrealized_gain | numeric | Unrealized gain/loss |
| unrealized_gain_pct | numeric | Unrealized gain percentage |
| dpi | numeric | Distributions to Paid-In Capital |
| tvpi | numeric | Total Value to Paid-In Capital |
| irr_estimate | numeric | Estimated IRR |
| total_positions | integer | Number of positions |
| total_vehicles | integer | Number of vehicles |

**Language**: PL/pgSQL
**Volatility**: STABLE

---

### 2. calculate_investor_kpis_with_deals

**Purpose**: Calculate KPIs including deal-related metrics

**Signature**:
```sql
calculate_investor_kpis_with_deals(
  investor_ids uuid[],
  as_of_date date DEFAULT CURRENT_DATE
)
```

**Returns**: All columns from `calculate_investor_kpis` plus:
| Column | Type | Description |
|--------|------|-------------|
| total_deals | integer | Number of deals |
| total_deal_value | numeric | Total deal value |
| pending_allocations | integer | Number of pending allocations |

**Language**: PL/pgSQL
**Volatility**: STABLE

---

### 3. get_investor_vehicle_breakdown

**Purpose**: Get per-vehicle breakdown for investors

**Signature**:
```sql
get_investor_vehicle_breakdown(investor_ids uuid[])
```

**Returns**:
| Column | Type | Description |
|--------|------|-------------|
| vehicle_id | uuid | Vehicle ID |
| vehicle_name | text | Vehicle name |
| vehicle_type | text | Vehicle type |
| current_value | numeric | Current position value |
| cost_basis | numeric | Cost basis |
| units | numeric | Units held |
| unrealized_gain | numeric | Unrealized gain/loss |
| unrealized_gain_pct | numeric | Unrealized gain percentage |
| commitment | numeric | Commitment amount |
| contributed | numeric | Contributed capital |
| distributed | numeric | Distributions received |
| nav_per_unit | numeric | Latest NAV per unit |
| last_valuation_date | date | Last valuation date |

**Language**: PL/pgSQL
**Volatility**: STABLE

---

### 4. get_portfolio_trends

**Purpose**: Calculate portfolio trend metrics over time

**Signature**:
```sql
get_portfolio_trends(
  investor_ids uuid[],
  days_back integer DEFAULT 30
)
```

**Returns**:
| Column | Type | Description |
|--------|------|-------------|
| nav_change | numeric | NAV change over period |
| nav_change_pct | numeric | NAV change percentage |
| performance_change | numeric | Performance metric change |
| period_days | integer | Number of days in period |

**Language**: PL/pgSQL
**Volatility**: STABLE

---

## Summary

### Tables with RLS Enabled
- activity_feed
- allocations
- capital_calls
- deals
- distributions
- fee_events
- performance_snapshots
- valuations
- vehicles

### Tables WITHOUT RLS
- cashflows (controlled via investors RLS)
- investor_users (junction table)
- positions (controlled via investors RLS)
- profiles (access via auth.uid())
- subscriptions (controlled via investors RLS)

### Key Relationships
- **Investors → Positions → Vehicles**: Core portfolio structure
- **Investors → Subscriptions → Vehicles**: Commitment tracking
- **Investors → Cashflows → Vehicles**: Cash movement tracking
- **Vehicles → Valuations**: Historical NAV tracking
- **Investors → Allocations → Deals**: Deal participation
- **Profiles ↔ Investors**: Via investor_users junction table

### Performance Considerations
All tables have appropriate indexes on frequently queried columns:
- Foreign key columns
- Date columns used in range queries
- Composite indexes for multi-column WHERE clauses
- DESC indexes for "latest" queries (created_at, as_of_date, etc.)

---

*End of Report*
