# Fees Management PRD - VersoTech Staff Portal

**Version:** 1.0
**Product:** VERSO VersoTech Staff Portal
**Audience:** Business stakeholders, Product managers, Engineers
**Last Updated:** October 2, 2025

---

## Executive Summary

The Fees Management module is VERSO's centralized system for configuring fee structures, calculating investor fees, and tracking fee accruals across all investment vehicles and deals. VERSO operates a multi-tiered fee model with subscription fees (one-time on investment), management fees (annual/quarterly on committed capital), performance fees (carry on exits with hurdle rates), and spread markups (for credit/trade finance deals).

Staff members use this module to create fee plan templates for different deal types (venture, real estate, credit), customize investor-specific terms (negotiated rate reductions for institutional investors), calculate projected fees for scenario modeling, and monitor fee events (accruals, invoicing, payments). The system ensures accurate fee computation, prevents billing errors, and provides full transparency to investors on their fee obligations.

Behind the scenes, Fees Management integrates with Deal Management (fee plans attached to deals), Investor Management (investor-specific overrides), and Reconciliation (fee invoicing and payment tracking). The module supports complex fee structures with hurdles, catch-up provisions, tiered rates, and investor class differentiation—all critical for BVI fund compliance and investor reporting.

---

## Part 1: Business Context (Non-Technical)

### What is Fees Management?

The Fees Management module is the central configuration and calculation engine for all investor fees across VERSO's investment platforms. It handles:

- **Fee Plan Templates**: Reusable fee structures per deal or vehicle (e.g., "Standard Venture 2/20", "Institutional Premium 1.5/15")
- **Fee Components**: Multi-component plans combining subscription, management, performance, and spread fees
- **Investor-Specific Terms**: Custom overrides for negotiated fee arrangements (e.g., Goldman Sachs gets 1% management instead of 2%)
- **Fee Calculation**: Automated computation based on investment amounts, NAV, profit, and time periods
- **Fee Events**: Tracking of accruals (fees owed but not yet invoiced) and invoicing (bills sent to investors)
- **Fee Modeling**: Calculator tool for projecting total fees across investment lifecycle

**Fee Types Supported:**

1. **Subscription Fee** (One-Time):
   - Charged on initial investment commitment
   - Typical range: 1.0% - 2.5% of investment amount
   - Calculation: `investment_amount * (rate_bps / 10000)`
   - Paid at subscription or first capital call

2. **Management Fee** (Recurring):
   - Annual or quarterly fee on committed capital or NAV
   - Typical range: 1.0% - 2.5% per annum
   - Calculation methods:
     - `commitment_amount * (rate_bps / 10000) * (period_days / 365)`
     - `current_nav * (rate_bps / 10000) * (period_days / 365)`
   - Paid quarterly or annually in advance

3. **Performance Fee / Carried Interest** (On Exit):
   - Percentage of profits above hurdle rate
   - Typical structure: 20% carry with 8% hurdle (preferred return)
   - Calculation:
     - Profit = `exit_proceeds - contributed_capital`
     - Hurdle return = `contributed_capital * (hurdle_bps / 10000) * years_held`
     - Carry = `(profit - hurdle_return) * (carry_rate_bps / 10000)` if profit > hurdle
   - Paid at deal exit or fund distribution

4. **Spread Markup** (Credit/Trade Finance):
   - Per-unit spread on credit instruments
   - Typical range: 2.0% - 5.0% markup on acquisition cost
   - Calculation: `units_acquired * (spread_bps / 10000) * unit_price`
   - Paid at trade execution

### Why Does It Matter?

**For VERSO Operations Team:**
- **Billing Accuracy**: Eliminate manual fee calculation errors that lead to investor disputes
- **Efficiency**: Automate fee computation for 100+ investors across 20+ deals
- **Transparency**: Provide investors with clear breakdown of all fees
- **Compliance**: Maintain audit trail of fee structures and changes for BVI FSC
- **Scenario Modeling**: Quickly calculate fees for new deal structures during fundraising

**For VERSO Leadership:**
- **Revenue Forecasting**: Project management and performance fee revenue based on portfolio NAV
- **Deal Economics**: Model fee impact on investor returns during deal structuring
- **Competitive Positioning**: Track fee levels vs. industry benchmarks
- **Investor Relations**: Defend fee levels with clear value proposition and structured discounts

**For Investors:**
- **Predictability**: Know exactly what fees they'll pay over investment lifecycle
- **Fairness**: Consistent fee application across investor class
- **Negotiation**: Large investors can negotiate custom fee arrangements with transparency

### How It Connects to Other Modules

- **Deal Management**: Each deal has associated fee plan; new investor commitments trigger fee event creation
- **Investor Management**: Investor-specific fee overrides stored per investor-deal pair
- **Reconciliation**: Fee events generate invoices; payment tracking updates fee event status
- **Documents**: Fee calculations and invoices stored as documents accessible to investors
- **Reports**: Investor position statements include fee breakdowns and projections
- **Audit Log**: All fee structure changes logged with timestamp and staff member attribution

### Who Uses It?

**Primary Users:**
- **Business Operations** (`staff_admin`): Create fee plans, configure investor-specific terms
- **Finance Team** (`staff_admin`): Process fee accruals, generate invoices, reconcile payments
- **Relationship Managers** (`staff_rm`): Model fees for investor negotiations, answer fee questions
- **Compliance Officers** (`staff_admin`): Ensure fee structures comply with offering memoranda and regulations

**Access Levels:**
- `staff_admin` can create/edit fee plans, approve investor overrides, process invoices
- `staff_ops` can view fee plans, calculate fees, generate reports
- `staff_rm` can view fees for assigned investors, use fee calculator

### Core Use Cases

**1. Create Standard Fee Plan for New Deal**

**Scenario:** VERSO is launching "AI Software Growth Fund" and needs standard fee structure for individual investors.

**Workflow:**
1. BizOps analyst (Emma) navigates to Fees Management → Fee Plans tab
2. Clicks "Create Fee Plan" button
3. Fills in modal form:
   - Plan name: "AI Growth Standard 2/20"
   - Associated deal: "AI Software Growth Fund"
   - Description: "Standard fee structure for individual investors in AI fund"
   - Set as default: ✓ (checked)
4. Adds fee components:
   - **Component 1 - Subscription Fee**:
     - Type: Subscription
     - Rate: 200 bps (2.0%)
     - Method: Percent of Investment
     - Frequency: One Time
   - **Component 2 - Management Fee**:
     - Type: Management
     - Rate: 200 bps (2.0%)
     - Method: Percent per Annum
     - Frequency: Quarterly
   - **Component 3 - Performance Fee**:
     - Type: Performance
     - Rate: 2000 bps (20%)
     - Method: Percent of Profit
     - Frequency: On Exit
     - Hurdle Rate: 800 bps (8% preferred return)
5. Clicks "Create Plan"
6. System creates fee plan record, marks as default for AI Growth Fund deal
7. All future investor commitments to AI Growth automatically assigned this plan

**Result:** Standard fee plan ready for deal launch, investor subscriptions will auto-calculate fees

**2. Negotiate Custom Fee Terms for Institutional Investor**

**Scenario:** Goldman Sachs Private Wealth commits $5M to AI Growth Fund but negotiates reduced fees (1.5% management, 15% carry instead of 2%/20%).

**Workflow:**
1. RM (Michael) receives signed term sheet with negotiated fees
2. Opens Fees Management → Investor Terms tab
3. Clicks "Add Investor Terms" (or system auto-creates when commitment created)
4. System shows:
   - Investor: Goldman Sachs Private Wealth
   - Deal: AI Software Growth Fund
   - Base Plan: AI Growth Standard 2/20 (default)
5. Michael adds overrides:
   - Management rate: 150 bps (down from 200)
   - Performance rate: 1500 bps (down from 2000)
   - Subscription fee: No override (stays 200 bps)
6. Enters justification: "$5M+ commitment, institutional tier negotiation per term sheet dated 2025-10-01"
7. Clicks "Save Terms" → requires admin approval
8. Compliance officer (Sarah) reviews, approves override
9. System creates `investor_fee_terms` record with overrides
10. When management fee accrues quarterly, system applies 1.5% instead of 2%

**Result:** Goldman Sachs pays $75K annual management fee instead of $100K (saving $25K/year on $5M commitment)

**3. Calculate Fees for Investor Scenario Modeling**

**Scenario:** Prospect "Tech Ventures Fund" asks "If I invest $3M for 4 years and you 2.5x my money, what are my total fees?"

**Workflow:**
1. RM (Sarah) opens Fees Management → Fee Calculator tab
2. Enters parameters:
   - Investment Amount: $3,000,000
   - Fee Plan: AI Growth Standard 2/20
   - Holding Period: 4 years
   - Expected Exit Multiple: 2.5x
3. Clicks "Calculate Fees"
4. System computes:
   - **Subscription Fee**: $3M × 2% = $60,000
   - **Management Fee**: $3M × 2% × 4 years = $240,000
   - **Performance Fee**:
     - Exit proceeds: $3M × 2.5 = $7.5M
     - Contributed capital: $3M
     - Profit: $7.5M - $3M = $4.5M
     - Hurdle return: $3M × 8% × 4 years = $960K
     - Profit above hurdle: $4.5M - $960K = $3.54M
     - Carry: $3.54M × 20% = $708,000
   - **Total Fees**: $60K + $240K + $708K = $1,008,000
   - **Effective Fee Rate**: $1,008K / $7,500K exit = 13.4%
5. Sarah shares breakdown with prospect

**Result:** Transparent fee projection helps investor evaluate deal economics

**4. Quarterly Management Fee Accrual**

**Scenario:** Q1 2025 ends, VERSO needs to accrue management fees for all AI Growth Fund investors.

**Workflow:**
1. Finance analyst (David) triggers quarterly management fee accrual workflow
2. System:
   - Queries all active allocations in AI Growth Fund
   - For each investor:
     - Fetches applicable fee plan (default or custom override)
     - Calculates management fee: `commitment * (management_rate_bps / 10000) * (90 days / 365)`
     - For Goldman Sachs (1.5% override): $5M × 1.5% × (90/365) = $18,493
     - For standard investor ($1M @ 2%): $1M × 2% × (90/365) = $4,932
   - Creates `fee_events` records:
     - `fee_type`: management
     - `event_date`: 2025-03-31
     - `base_amount`: commitment amount
     - `computed_amount`: calculated fee
     - `status`: accrued (not yet invoiced)
3. System generates summary report: "Q1 2025 Management Fees Accrued: $487,000 across 68 investors"
4. Finance team reviews for accuracy
5. David clicks "Approve Accruals" → marks accruals as ready for invoicing

**Next Step:** Reconciliation module generates invoices from accrued fee events

**5. Performance Fee Calculation at Deal Exit**

**Scenario:** AI Growth Fund exits "CompanyX" investment, realizing 3.2x return for investors.

**Workflow:**
1. BizOps logs exit in Deal Management: CompanyX sold for $12M (acquired for $4M)
2. System triggers performance fee calculation workflow
3. For each investor in CompanyX deal:
   - Investor A contributed $1M, receives $3.2M distribution
   - Fetches fee plan: 20% carry with 8% hurdle, held for 3 years
   - Calculates:
     - Profit: $3.2M - $1M = $2.2M
     - Hurdle return: $1M × 8% × 3 = $240K
     - Profit above hurdle: $2.2M - $240K = $1.96M
     - Performance fee: $1.96M × 20% = $392,000
   - Creates fee event:
     - `fee_type`: performance
     - `event_date`: 2025-10-15 (exit date)
     - `base_amount`: $2,200,000 (total profit)
     - `computed_amount`: $392,000
     - `status`: accrued
4. Distribution waterfall in Reconciliation module:
   - Gross proceeds to Investor A: $3.2M
   - Less performance fee: -$392K
   - Net distribution to Investor A: $2,808,000
5. VERSO receives $392K carried interest

**Result:** Performance fee correctly calculated with hurdle, investor receives net distribution

### Key Features (Business Language)

**Fee Plan Management:**
- Create reusable fee plan templates per deal or vehicle
- Multi-component plans (combine subscription, management, performance, spread in single plan)
- Default plan designation (auto-apply to new investors)
- Plan cloning (duplicate existing plan for new deal)
- Plan versioning (track changes to fee structures over time)
- Hurdle rate configuration (preferred return thresholds for performance fees)
- Tiered fee structures (different rates for different commitment tiers)

**Fee Components:**
- **Subscription Fee**: One-time on investment, percent of commitment
- **Management Fee**: Recurring (annual/quarterly), percent of commitment or NAV
- **Performance Fee**: On exit, percent of profits above hurdle
- **Spread Markup**: Per-unit markup on credit instruments
- **Custom Fees**: Placeholder for deal-specific fees (monitoring, transaction, etc.)

**Investor-Specific Terms:**
- Override base plan rates for individual investors
- Store negotiation justification and approval workflow
- Effective date tracking (fee changes apply from specific date)
- Audit trail of all override approvals
- Bulk override (apply same terms to multiple investors in investor class)

**Fee Calculation Engine:**
- Automated accrual scheduling (quarterly management fees, annual reporting, exit-triggered carry)
- Pro-rata calculations (partial period fees for mid-quarter investments)
- Waterfall computation (hurdle return, catch-up, carried interest tiers)
- Multi-currency support (fee plans in USD, EUR, GBP with exchange rate handling)
- Fee caps and floors (maximum/minimum fee per investor)

**Fee Events Tracking:**
- Event types: accrued (owed but not invoiced), invoiced (bill sent), paid (payment received), waived (forgiven)
- Status workflow: accrued → invoiced → paid (or waived/disputed)
- Event detail: investor, deal, fee type, base amount, computed amount, date, status
- Aging analysis (outstanding invoices by age: 0-30 days, 30-60 days, 60+ days)
- Fee adjustment events (corrections, waivers, disputes)

**Fee Calculator:**
- Interactive scenario modeling tool
- Input: investment amount, fee plan, holding period, exit multiple
- Output: subscription, management, performance fee breakdown; total fees; effective rate
- Sensitivity analysis (show fee impact of different exit scenarios)
- Comparison mode (compare fees across multiple plans side-by-side)

**Reporting & Analytics:**
- Total fees accrued by period (monthly, quarterly, annually)
- Fee revenue by type (subscription, management, performance breakdown)
- Fee realization rate (% of accrued fees actually collected)
- Average effective fee rate by investor type (individual vs. institutional)
- Fee forecast modeling (project fees based on portfolio NAV growth assumptions)

### Business Rules

**Fee Plan Creation:**
- Must have unique name within organization
- Must have at least one fee component
- Default plan per deal: Only one plan can be marked default for each deal
- Component validation: Rate (bps) between 0 and 10000 (0% - 100%)

**Fee Component Logic:**
- **Subscription Fee**:
  - Applied once on commitment or first capital call
  - Calculated on commitment amount (not called capital)
  - Cannot exceed 5% (500 bps) per regulatory guidelines
- **Management Fee**:
  - Base: commitment amount OR current NAV (configurable per plan)
  - Frequency: annual, quarterly, monthly
  - Accrued in advance (Q1 fee charged on Jan 1, not Apr 1)
  - Pro-rated for partial periods (investor joins mid-quarter)
- **Performance Fee**:
  - Applied only on realized profits (not unrealized gains)
  - Hurdle: preferred return rate (typically 6-10%)
  - Catch-up: VERSO receives additional carry until reaching agreed split (optional)
  - High water mark: performance fee only on gains above previous peak (optional)
- **Spread Markup**:
  - Applied at trade execution for credit/trade finance deals
  - Per-unit calculation based on quantity and unit price

**Investor-Specific Overrides:**
- Require admin approval before effective
- Cannot increase rates above plan default (only reductions allowed)
- Must have written justification (link to term sheet or board approval)
- Effective date cannot be retroactive (no backdating fee reductions)

**Fee Accrual Scheduling:**
- Management fees: accrue at period start (quarterly on Jan 1, Apr 1, Jul 1, Oct 1)
- Subscription fees: accrue on commitment date or first capital call date
- Performance fees: accrue on deal exit date (when proceeds distributed)
- Spread markups: accrue on trade execution date

**Fee Event Workflow:**
- Status progression: accrued → invoiced → paid (cannot skip states)
- Accrued fees can be edited before invoicing
- Invoiced fees cannot be edited (create adjustment event instead)
- Paid fees immutable (cannot be reversed except via new reversal event)
- Waived fees require admin approval with written justification

**Fee Caps & Minimums:**
- Minimum fee per investor: $1,000 annual management fee (avoid billing tiny amounts)
- Maximum performance fee: 30% of profits (regulatory limit)
- Total fee cap: Optional cap on combined fees as % of NAV (e.g., max 5% of NAV per year)

### Visual Design Standards

**Layout:**
- Header: "Fee Management" title, "Create Fee Plan" button
- Stats row: 4 KPI cards (Active Plans, Investor Terms, Fee Events, Total Accrued)
- Tabs: Fee Plans | Investor Terms | Fee Events | Fee Calculator
- Table/card view within each tab

**Fee Plan Card Design:**
- Plan name (bold), description, deal name, creation date
- "Default" badge if applicable
- Component cards grid (3 columns):
  - Icon (subscription=target, management=calendar, performance=trending up, spread=bar chart)
  - Component type name
  - Rate (bps), calculation method, frequency
  - Hurdle rate (if performance fee)
- Action buttons: Clone, Edit

**Color Coding:**
- **Fee Component Types**:
  - Subscription: Blue (`text-blue-600`)
  - Management: Green (`text-green-600`)
  - Performance: Purple (`text-purple-600`)
  - Spread: Orange (`text-orange-600`)
- **Fee Event Status**:
  - Accrued: Yellow (`bg-yellow-100 text-yellow-800`)
  - Invoiced: Blue (`bg-blue-100 text-blue-800`)
  - Paid: Green (`bg-green-100 text-green-800`)
  - Waived: Gray (`bg-gray-100 text-gray-800`)
  - Disputed: Red (`bg-red-100 text-red-800`)

**Icons:**
- Fee Plans: `Settings`
- Investor Terms: `Users`
- Fee Events: `Activity`
- Total Accrued: `DollarSign`
- Fee Calculator: `Calculator`
- Component types: `Target` (subscription), `Calendar` (management), `TrendingUp` (performance), `BarChart3` (spread)

---

## Part 2: Technical Implementation

### Architecture Overview

**Page Route**: `/versotech/staff/fees/page.tsx`
**Type**: Server Component (Next.js App Router)
**Authentication**: Required via `createClient` + staff auth check
**Data Flow**: Server-side fetch from Supabase with client-side interactivity

**Component Hierarchy:**
```
page.tsx (Server Component)
  └─ AppLayout (brand="versotech")
       ├─ Header (title, "Create Fee Plan" button with Dialog)
       ├─ Stats Cards (Active Plans, Investor Terms, Fee Events, Total Accrued)
       └─ Tabs
            ├─ Fee Plans Tab
            │    └─ FeePlanCard × N (plan details, components grid)
            ├─ Investor Terms Tab
            │    └─ InvestorTermsCard × N (investor, plan, overrides)
            ├─ Fee Events Tab
            │    └─ FeeEventCard × N (event details, status, amounts)
            └─ Fee Calculator Tab
                 ├─ Calculator Form (inputs)
                 └─ Fee Breakdown Results (outputs)
```

### Current Implementation

**Server Component (page.tsx):**
```typescript
const feePlans = [
  {
    id: '1',
    name: 'Standard Investor Plan',
    description: 'Default fee structure for individual investors',
    deal_name: 'Tech Growth Opportunity',
    is_default: true,
    created_at: '2024-01-15',
    components: [
      { kind: 'subscription', calc_method: 'percent_of_investment', rate_bps: 200, frequency: 'one_time' },
      { kind: 'management', calc_method: 'percent_per_annum', rate_bps: 200, frequency: 'annual' },
      { kind: 'performance', calc_method: 'percent_of_profit', rate_bps: 2000, frequency: 'on_exit', hurdle_rate_bps: 800 }
    ]
  },
  // ... more mock plans
]

export default async function FeesPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/versotech/login')

  return (
    <AppLayout brand="versotech">
      {/* Stats Cards */}
      {/* Tabs with Fee Plans, Investor Terms, Fee Events, Calculator */}
    </AppLayout>
  )
}
```

### Data Model Requirements

**Core Tables:**

```sql
-- Fee plans (templates)
create table fee_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  deal_id uuid references deals(id),
  vehicle_id uuid references vehicles(id),
  is_default boolean default false,
  is_active boolean default true,
  effective_from date default current_date,
  effective_until date,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Ensure only one default plan per deal
  constraint unique_default_per_deal unique (deal_id, is_default) where is_default = true
);

create index idx_fee_plans_deal on fee_plans(deal_id, is_active);
create index idx_fee_plans_vehicle on fee_plans(vehicle_id, is_active);

-- Fee components (parts of a plan)
create table fee_components (
  id uuid primary key default gen_random_uuid(),
  fee_plan_id uuid references fee_plans(id) on delete cascade not null,
  kind text check (kind in ('subscription', 'management', 'performance', 'spread_markup', 'custom')) not null,

  -- Calculation parameters
  calc_method text check (calc_method in (
    'percent_of_investment', 'percent_of_commitment', 'percent_of_nav',
    'percent_per_annum', 'percent_of_profit', 'per_unit_spread', 'fixed_amount'
  )) not null,
  rate_bps int check (rate_bps >= 0 and rate_bps <= 10000), -- 0% to 100%
  fixed_amount numeric(15,2), -- For fixed fees

  -- Frequency
  frequency text check (frequency in ('one_time', 'monthly', 'quarterly', 'annual', 'on_exit', 'on_event')) not null,

  -- Performance fee specific
  hurdle_rate_bps int check (hurdle_rate_bps >= 0 and hurdle_rate_bps <= 2000), -- 0% to 20% preferred return
  has_catchup boolean default false,
  catchup_rate_bps int,
  has_high_water_mark boolean default false,

  -- Calculation base
  base_calculation text check (base_calculation in ('commitment', 'nav', 'profit', 'units', 'fixed')),

  created_at timestamptz default now()
);

create index idx_fee_components_plan on fee_components(fee_plan_id);

-- Investor-specific fee terms
create table investor_fee_terms (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id) not null,
  deal_id uuid references deals(id),
  vehicle_id uuid references vehicles(id),

  -- Base plan
  base_fee_plan_id uuid references fee_plans(id),

  -- Overrides (JSONB for flexibility)
  overrides jsonb, -- { "management_rate_bps": 150, "performance_rate_bps": 1500 }

  -- Approval & justification
  status text check (status in ('pending', 'active', 'expired')) default 'pending',
  justification text not null,
  approved_by uuid references profiles(id),
  approved_at timestamptz,

  -- Effective dates
  effective_from date default current_date,
  effective_until date,

  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(investor_id, deal_id, effective_from)
);

create index idx_investor_fee_terms_investor on investor_fee_terms(investor_id, deal_id);
create index idx_investor_fee_terms_status on investor_fee_terms(status, effective_from);

-- Fee events (accruals, invoices)
create table fee_events (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id) not null,
  deal_id uuid references deals(id),
  allocation_id uuid references allocations(id),

  -- Fee details
  fee_type text check (fee_type in ('subscription', 'management', 'performance', 'spread_markup', 'custom')) not null,
  fee_component_id uuid references fee_components(id),

  -- Calculation inputs
  event_date date not null,
  period_start_date date,
  period_end_date date,
  base_amount numeric(15,2) not null, -- Amount fee is calculated on
  rate_bps int,

  -- Computed amount
  computed_amount numeric(15,2) not null,
  currency text default 'USD',

  -- Status
  status text check (status in ('accrued', 'invoiced', 'paid', 'waived', 'disputed', 'cancelled')) default 'accrued',
  invoice_id uuid references invoices(id),
  payment_id uuid references payments(id),

  -- Audit
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  processed_at timestamptz,

  -- Notes
  notes text
);

create index idx_fee_events_investor on fee_events(investor_id, event_date desc);
create index idx_fee_events_deal on fee_events(deal_id, event_date desc);
create index idx_fee_events_status on fee_events(status, event_date);
create index idx_fee_events_type on fee_events(fee_type, event_date desc);
```

**Database Functions:**

```sql
-- Calculate subscription fee
create or replace function calculate_subscription_fee(
  p_commitment_amount numeric,
  p_rate_bps int
)
returns numeric
language plpgsql
as $$
begin
  return round(p_commitment_amount * (p_rate_bps::numeric / 10000), 2);
end;
$$;

-- Calculate management fee (pro-rated)
create or replace function calculate_management_fee(
  p_base_amount numeric,
  p_rate_bps int,
  p_period_days int
)
returns numeric
language plpgsql
as $$
begin
  return round(p_base_amount * (p_rate_bps::numeric / 10000) * (p_period_days::numeric / 365), 2);
end;
$$;

-- Calculate performance fee with hurdle
create or replace function calculate_performance_fee(
  p_contributed_capital numeric,
  p_exit_proceeds numeric,
  p_carry_rate_bps int,
  p_hurdle_rate_bps int,
  p_years_held numeric
)
returns numeric
language plpgsql
as $$
declare
  v_profit numeric;
  v_hurdle_return numeric;
  v_profit_above_hurdle numeric;
  v_performance_fee numeric;
begin
  -- Calculate profit
  v_profit := p_exit_proceeds - p_contributed_capital;

  if v_profit <= 0 then
    return 0; -- No carry on losses
  end if;

  -- Calculate hurdle return
  v_hurdle_return := p_contributed_capital * (p_hurdle_rate_bps::numeric / 10000) * p_years_held;

  -- Calculate profit above hurdle
  v_profit_above_hurdle := v_profit - v_hurdle_return;

  if v_profit_above_hurdle <= 0 then
    return 0; -- Profit below hurdle, no carry
  end if;

  -- Calculate performance fee
  v_performance_fee := v_profit_above_hurdle * (p_carry_rate_bps::numeric / 10000);

  return round(v_performance_fee, 2);
end;
$$;

-- Get applicable fee plan for investor-deal
create or replace function get_applicable_fee_plan(
  p_investor_id uuid,
  p_deal_id uuid,
  p_as_of_date date default current_date
)
returns table (
  fee_plan_id uuid,
  fee_plan_name text,
  components jsonb,
  overrides jsonb
)
language plpgsql
as $$
begin
  return query
  -- First check for investor-specific terms
  with investor_terms as (
    select
      ift.base_fee_plan_id,
      ift.overrides
    from investor_fee_terms ift
    where ift.investor_id = p_investor_id
      and ift.deal_id = p_deal_id
      and ift.status = 'active'
      and ift.effective_from <= p_as_of_date
      and (ift.effective_until is null or ift.effective_until >= p_as_of_date)
    limit 1
  ),
  -- Fallback to default deal plan
  default_plan as (
    select
      fp.id as fee_plan_id,
      fp.name as fee_plan_name,
      jsonb_agg(
        jsonb_build_object(
          'kind', fc.kind,
          'rate_bps', fc.rate_bps,
          'calc_method', fc.calc_method,
          'frequency', fc.frequency,
          'hurdle_rate_bps', fc.hurdle_rate_bps
        ) order by fc.kind
      ) as components
    from fee_plans fp
    join fee_components fc on fc.fee_plan_id = fp.id
    where fp.deal_id = p_deal_id
      and fp.is_default = true
      and fp.is_active = true
    group by fp.id, fp.name
  )
  select
    coalesce(it.base_fee_plan_id, dp.fee_plan_id) as fee_plan_id,
    dp.fee_plan_name,
    dp.components,
    coalesce(it.overrides, '{}'::jsonb) as overrides
  from default_plan dp
  left join investor_terms it on true;
end;
$$;

-- Accrue quarterly management fees (batch job)
create or replace function accrue_quarterly_management_fees(
  p_deal_id uuid,
  p_quarter_end_date date
)
returns table (
  investor_id uuid,
  fee_amount numeric,
  fee_event_id uuid
)
language plpgsql
as $$
declare
  v_quarter_start date;
  v_days_in_quarter int;
  v_allocation record;
  v_fee_plan record;
  v_management_component record;
  v_rate_bps int;
  v_base_amount numeric;
  v_computed_fee numeric;
  v_fee_event_id uuid;
begin
  -- Calculate quarter dates
  v_quarter_start := date_trunc('quarter', p_quarter_end_date)::date;
  v_days_in_quarter := p_quarter_end_date - v_quarter_start;

  -- Loop through all active allocations for deal
  for v_allocation in
    select a.investor_id, a.commitment_amount
    from allocations a
    where a.deal_id = p_deal_id
      and a.status = 'allocated'
  loop
    -- Get applicable fee plan
    select * into v_fee_plan
    from get_applicable_fee_plan(v_allocation.investor_id, p_deal_id, p_quarter_end_date);

    -- Find management fee component
    select * into v_management_component
    from jsonb_to_recordset(v_fee_plan.components) as x(kind text, rate_bps int, calc_method text, frequency text)
    where kind = 'management'
    limit 1;

    if v_management_component is not null then
      -- Apply overrides if exist
      v_rate_bps := coalesce(
        (v_fee_plan.overrides->>'management_rate_bps')::int,
        v_management_component.rate_bps
      );

      -- Calculate fee
      v_base_amount := v_allocation.commitment_amount;
      v_computed_fee := calculate_management_fee(v_base_amount, v_rate_bps, v_days_in_quarter);

      -- Create fee event
      insert into fee_events (
        investor_id, deal_id, fee_type, event_date, period_start_date, period_end_date,
        base_amount, rate_bps, computed_amount, status
      ) values (
        v_allocation.investor_id, p_deal_id, 'management', p_quarter_end_date, v_quarter_start, p_quarter_end_date,
        v_base_amount, v_rate_bps, v_computed_fee, 'accrued'
      )
      returning id into v_fee_event_id;

      return query select v_allocation.investor_id, v_computed_fee, v_fee_event_id;
    end if;
  end loop;
end;
$$;
```

### API Routes

**Create Fee Plan:**
```typescript
// app/api/staff/fees/plans/route.ts
export async function POST(req: Request) {
  const supabase = await createClient()
  const profile = await requireStaffAuth()

  const { name, description, deal_id, is_default, components } = await req.json()

  // 1. Create fee plan
  const { data: feePlan, error: planError } = await supabase
    .from('fee_plans')
    .insert({
      name,
      description,
      deal_id,
      is_default,
      created_by: profile.id
    })
    .select()
    .single()

  if (planError) {
    return NextResponse.json({ error: planError.message }, { status: 500 })
  }

  // 2. Create fee components
  const componentRecords = components.map(c => ({
    fee_plan_id: feePlan.id,
    kind: c.kind,
    calc_method: c.calc_method,
    rate_bps: c.rate_bps,
    frequency: c.frequency,
    hurdle_rate_bps: c.hurdle_rate_bps,
    base_calculation: c.base_calculation
  }))

  const { error: componentsError } = await supabase
    .from('fee_components')
    .insert(componentRecords)

  if (componentsError) {
    return NextResponse.json({ error: componentsError.message }, { status: 500 })
  }

  return NextResponse.json({ fee_plan: feePlan })
}
```

**Calculate Fee (API endpoint for calculator):**
```typescript
// app/api/staff/fees/calculate/route.ts
export async function POST(req: Request) {
  const supabase = await createClient()

  const { fee_plan_id, investment_amount, holding_period_years, exit_multiple } = await req.json()

  // Fetch fee plan with components
  const { data: feePlan } = await supabase
    .from('fee_plans')
    .select('*, fee_components(*)')
    .eq('id', fee_plan_id)
    .single()

  let subscriptionFee = 0
  let managementFee = 0
  let performanceFee = 0

  feePlan.fee_components.forEach(component => {
    if (component.kind === 'subscription') {
      subscriptionFee = investment_amount * (component.rate_bps / 10000)
    } else if (component.kind === 'management') {
      managementFee = investment_amount * (component.rate_bps / 10000) * holding_period_years
    } else if (component.kind === 'performance') {
      const exitProceeds = investment_amount * exit_multiple
      const profit = exitProceeds - investment_amount
      const hurdleReturn = investment_amount * (component.hurdle_rate_bps / 10000) * holding_period_years
      const profitAboveHurdle = Math.max(0, profit - hurdleReturn)
      performanceFee = profitAboveHurdle * (component.rate_bps / 10000)
    }
  })

  const totalFees = subscriptionFee + managementFee + performanceFee
  const exitProceeds = investment_amount * exit_multiple
  const effectiveRate = (totalFees / exitProceeds) * 100

  return NextResponse.json({
    subscription_fee: subscriptionFee,
    management_fee: managementFee,
    performance_fee: performanceFee,
    total_fees: totalFees,
    effective_fee_rate: effectiveRate
  })
}
```

### RLS Policies

```sql
alter table fee_plans enable row level security;
alter table fee_components enable row level security;
alter table investor_fee_terms enable row level security;
alter table fee_events enable row level security;

-- Staff can view all fee plans
create policy fee_plans_staff_read on fee_plans for select
using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role like 'staff_%'));

-- Only admins can create/edit fee plans
create policy fee_plans_admin_write on fee_plans for all
using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'staff_admin'));

-- Staff can view fee events for their assigned investors
create policy fee_events_staff_read on fee_events for select
using (
  exists (
    select 1 from profiles p
    join investors i on i.primary_rm = p.id or p.role = 'staff_admin'
    where p.id = auth.uid() and i.id = fee_events.investor_id
  )
);

-- Investors can view their own fee events
create policy fee_events_investor_read on fee_events for select
using (
  exists (
    select 1 from investor_users iu
    where iu.investor_id = fee_events.investor_id and iu.user_id = auth.uid()
  )
);
```

---

## Part 3: Success Metrics

**Billing Accuracy:**
- Fee calculation error rate: Target <0.1% (less than 1 error per 1000 fees)
- Invoice dispute rate: Target <2%
- Fee realization rate: Target >95% (% of accrued fees collected)

**Operational Efficiency:**
- Time to create new fee plan: Target <10 minutes
- Quarterly fee accrual processing time: Target <1 hour for 200+ investors
- Fee calculator usage: Target 50+ calculations per month

**Revenue Visibility:**
- Fee revenue forecast accuracy: Target +/-5% vs. actual
- Management fee accrual lag: Target <5 business days post-quarter end
- Performance fee realization time: Target <30 days post-exit

---

## Document Version History

- v1.0 (October 2, 2025): Initial Fees Management PRD with comprehensive business context and technical implementation roadmap
