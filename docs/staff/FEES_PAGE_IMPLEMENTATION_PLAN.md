# FEES PAGE - IMPLEMENTATION PLAN
*Based on Database Schema Analysis and Client Meeting (Oct 23, 2025)*

---

## EXECUTIVE SUMMARY

This plan outlines the implementation of the Fees Management page for VERSO's staff portal. The **good news**: ~80% of the required database infrastructure already exists. We need to:

1. **Add 4 new database columns** to support management fee duration and payment schedules
2. **Build the UI/UX** for fee management, invoice generation, and tracking
3. **Implement automation** for scheduled fee generation and invoice reminders
4. **Create reporting views** for fee analytics and introducer deductions

**Estimated effort**: Medium complexity (existing schema significantly reduces work)

---

## PART 1: EXISTING DATABASE INFRASTRUCTURE ✅

### What Already Exists (No Migration Needed!)

#### 1. **fee_plans** table
Defines fee structures per deal or vehicle.

**Columns:**
- `id`, `deal_id`, `vehicle_id`
- `name`, `description`
- `is_default`, `is_active`
- `effective_from`, `effective_until`
- `created_by`, `created_at`, `updated_at`

**Status**: ✅ Ready to use

---

#### 2. **fee_components** table
Defines individual fee types within a plan.

**Columns:**
- `id`, `fee_plan_id`
- `kind` (enum): `subscription`, `management`, `performance`, `spread_markup`, `flat`, `other`
- `calc_method` (enum): `percent_of_investment`, `percent_per_annum`, `percent_of_profit`, `per_unit_spread`, `fixed`, `percent_of_commitment`, `percent_of_nav`, `fixed_amount`
- `frequency` (enum): `one_time`, `annual`, `quarterly`, `monthly`, `on_exit`, `on_event`
- `rate_bps` (basis points, e.g., 200 = 2%)
- `flat_amount`
- `hurdle_rate_bps`, `has_catchup`, `catchup_rate_bps`, `has_high_water_mark`
- `base_calculation`, `notes`

**Status**: ✅ Ready to use (see gaps below for minor additions needed)

**Example:**
```sql
-- 2% subscription fee
INSERT INTO fee_components (fee_plan_id, kind, calc_method, frequency, rate_bps)
VALUES ('plan-id', 'subscription', 'percent_of_investment', 'one_time', 200);

-- 2% annual management fee
INSERT INTO fee_components (fee_plan_id, kind, calc_method, frequency, rate_bps)
VALUES ('plan-id', 'management', 'percent_per_annum', 'annual', 200);

-- 20% performance fee
INSERT INTO fee_components (fee_plan_id, kind, calc_method, frequency, rate_bps)
VALUES ('plan-id', 'performance', 'percent_of_profit', 'on_exit', 2000);
```

---

#### 3. **fee_events** table
Tracks individual fee accruals and charges to investors.

**Columns:**
- `id`, `deal_id`, `investor_id`, `allocation_id`
- `fee_component_id` (links to fee structure)
- `fee_type` (enum - same as fee_component kind)
- `event_date`, `period_start_date`, `period_end_date`
- `base_amount`, `computed_amount`, `rate_bps`
- `currency`
- `status` (enum): `accrued`, `invoiced`, `paid`, `voided`, `waived`, `disputed`, `cancelled`
- `invoice_id`, `payment_id`
- `source_ref`, `notes`
- `processed_at`, `created_at`

**Status**: ✅ Ready to use

**Example workflow:**
```
1. Fee component defines: "2% management fee, annual"
2. System generates fee_events: one per investor per year
3. Status progression: accrued → invoiced → paid
```

---

#### 4. **invoices** table
Manages invoices sent to investors.

**Columns:**
- `id`, `investor_id`, `deal_id`
- `invoice_number`
- `due_date`, `sent_at`, `paid_at`
- `subtotal`, `tax`, `total`
- `paid_amount`, `balance_due`
- `status` (enum): `draft`, `sent`, `paid`, `partially_paid`, `overdue`, `cancelled`, `disputed`
- `generated_from`, `doc_id`, `match_status`
- `created_by`, `created_at`

**Status**: ✅ Ready to use

---

#### 5. **invoice_lines** table
Line items within an invoice.

**Columns:**
- `id`, `invoice_id`, `fee_event_id`
- `kind`, `description`
- `quantity`, `unit_price`, `amount`

**Status**: ✅ Ready to use

**Relationship:**
```
invoice_lines.fee_event_id → fee_events.id → fee_components.id
```

---

#### 6. **introducer_commissions** table
Tracks deductions owed to introducers from fees.

**Columns:**
- `id`, `introducer_id`, `introduction_id`
- `deal_id`, `investor_id`
- `basis_type` (e.g., "subscription_fee", "performance_fee", "spread")
- `rate_bps`, `base_amount`, `accrual_amount`
- `currency`
- `status`: `accrued`, `approved`, `paid`
- `invoice_id`, `payment_due_date`, `paid_at`
- `approved_by`, `approved_at`
- `payment_reference`, `notes`

**Status**: ✅ Ready to use

---

#### 7. **subscriptions** table
Investor subscriptions to vehicles, with fee overrides.

**Relevant columns:**
- `subscription_fee_percent`, `subscription_fee_amount`
- `bd_fee_percent`, `bd_fee_amount`
- `finra_fee_amount`
- `performance_fee_tier1_percent`, `performance_fee_tier1_threshold`
- `performance_fee_tier2_percent`, `performance_fee_tier2_threshold`
- `spread_per_share`, `spread_fee_amount`
- `introducer_id`, `introduction_id`

**Status**: ✅ Ready to use

**Note**: These columns allow per-subscription fee overrides. The fee_plans/fee_components tables provide the defaults.

---

#### 8. **deal_fee_structures** table
Simplified term sheet fee structure (legacy/term sheet view).

**Relevant columns:**
- `deal_id`
- `subscription_fee_percent`
- `management_fee_percent`
- `carried_interest_percent` (= performance fee)
- `status`, `version`

**Status**: ✅ Ready to use

**Note**: This appears to be for term sheet generation. May be superseded by fee_plans for actual fee tracking.

---

#### 9. **tasks** table
For creating invoice reminder tasks.

**Relevant columns:**
- `owner_user_id`, `owner_investor_id`
- `kind`, `category`, `status`
- `title`, `description`, `instructions`
- `due_at`, `priority`
- `related_entity_type`, `related_entity_id`

**Status**: ✅ Can be used for fee invoice reminders

---

## PART 2: DATABASE GAPS & REQUIRED MIGRATIONS

### Gap Analysis: What's Missing

Based on the client meeting transcript, we need to track:

1. **Management fee duration**: "2% per year for 3 years" vs "2% per year for 10 years"
2. **Payment schedule**: "Paid upfront" vs "Annual invoicing"
3. **Multi-tier performance fees**: Performance tier 1 (20% up to 10x), tier 2 (30% above 10x)
4. **Scheduled fee generation**: Auto-generate annual management fee events
5. **Invoice reminders**: Auto-create tasks when invoices are due

### Required Migrations

#### Migration 1: Add Management Fee Duration & Payment Schedule

**Table**: `fee_components`

**New columns:**
```sql
ALTER TABLE fee_components
ADD COLUMN duration_periods INTEGER,
ADD COLUMN duration_unit TEXT CHECK (duration_unit IN ('years', 'months', 'quarters', 'life_of_vehicle')),
ADD COLUMN payment_schedule TEXT CHECK (payment_schedule IN ('upfront', 'recurring', 'on_demand')) DEFAULT 'recurring';

COMMENT ON COLUMN fee_components.duration_periods IS 'Number of periods the fee applies (e.g., 3 for "3 years"). NULL = indefinite/life of vehicle';
COMMENT ON COLUMN fee_components.duration_unit IS 'Unit for duration_periods: years, months, quarters, or life_of_vehicle';
COMMENT ON COLUMN fee_components.payment_schedule IS 'upfront = all periods paid at once, recurring = invoiced per period, on_demand = manual';
```

**Examples:**
```sql
-- Management fee: 2% per year for 3 years, paid upfront
INSERT INTO fee_components
(fee_plan_id, kind, calc_method, frequency, rate_bps, duration_periods, duration_unit, payment_schedule)
VALUES
('plan-id', 'management', 'percent_per_annum', 'annual', 200, 3, 'years', 'upfront');

-- Management fee: 2% per year for 10 years, annual invoicing
INSERT INTO fee_components
(fee_plan_id, kind, calc_method, frequency, rate_bps, duration_periods, duration_unit, payment_schedule)
VALUES
('plan-id', 'management', 'percent_per_annum', 'annual', 200, 10, 'years', 'recurring');

-- Management fee: 1.5% per year for life of vehicle
INSERT INTO fee_components
(fee_plan_id, kind, calc_method, frequency, rate_bps, duration_periods, duration_unit, payment_schedule)
VALUES
('plan-id', 'management', 'percent_per_annum', 'annual', 150, NULL, 'life_of_vehicle', 'recurring');
```

---

#### Migration 2: Add Performance Fee Tiers

**Table**: `fee_components`

**New columns:**
```sql
ALTER TABLE fee_components
ADD COLUMN tier_threshold_multiplier NUMERIC(10, 2),
ADD COLUMN next_tier_component_id UUID REFERENCES fee_components(id);

COMMENT ON COLUMN fee_components.tier_threshold_multiplier IS 'Threshold for this tier (e.g., 10.00 for "10x return"). NULL = no threshold';
COMMENT ON COLUMN fee_components.next_tier_component_id IS 'Link to next tier fee component for tiered performance fees';
```

**Examples:**
```sql
-- Performance fee tier 1: 20% on gains up to 10x
INSERT INTO fee_components
(id, fee_plan_id, kind, calc_method, frequency, rate_bps, tier_threshold_multiplier, next_tier_component_id)
VALUES
('tier1-id', 'plan-id', 'performance', 'percent_of_profit', 'on_exit', 2000, 10.00, 'tier2-id');

-- Performance fee tier 2: 30% on gains above 10x
INSERT INTO fee_components
(id, fee_plan_id, kind, calc_method, frequency, rate_bps, tier_threshold_multiplier, next_tier_component_id)
VALUES
('tier2-id', 'plan-id', 'performance', 'percent_of_profit', 'on_exit', 3000, NULL, NULL);
```

---

#### Migration 3: Add Invoice Reminders Tracking

**Table**: `invoices`

**New columns:**
```sql
ALTER TABLE invoices
ADD COLUMN reminder_task_id UUID REFERENCES tasks(id),
ADD COLUMN auto_send_enabled BOOLEAN DEFAULT false,
ADD COLUMN reminder_days_before INTEGER DEFAULT 7;

COMMENT ON COLUMN invoices.reminder_task_id IS 'Task created for invoice reminder';
COMMENT ON COLUMN invoices.auto_send_enabled IS 'Whether this invoice should be auto-sent on due date';
COMMENT ON COLUMN invoices.reminder_days_before IS 'Days before due_date to send reminder';
```

---

#### Migration 4: Add Fee Schedule Tracking

**New table**: `fee_schedules`

This tracks the schedule for recurring fees (especially management fees).

```sql
CREATE TABLE fee_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fee_component_id UUID NOT NULL REFERENCES fee_components(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    allocation_id UUID REFERENCES allocations(id) ON DELETE SET NULL,

    -- Schedule details
    start_date DATE NOT NULL,
    end_date DATE,

    -- Tracking
    total_periods INTEGER NOT NULL,
    completed_periods INTEGER DEFAULT 0,
    next_due_date DATE,

    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'paused')),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES profiles(id),

    CONSTRAINT valid_periods CHECK (completed_periods <= total_periods)
);

CREATE INDEX idx_fee_schedules_next_due ON fee_schedules(next_due_date) WHERE status = 'active';
CREATE INDEX idx_fee_schedules_investor ON fee_schedules(investor_id);
CREATE INDEX idx_fee_schedules_component ON fee_schedules(fee_component_id);

COMMENT ON TABLE fee_schedules IS 'Tracks recurring fee schedules for automatic generation';
COMMENT ON COLUMN fee_schedules.total_periods IS 'Total number of fee periods (e.g., 3 for "3 years")';
COMMENT ON COLUMN fee_schedules.completed_periods IS 'Number of periods already invoiced';
COMMENT ON COLUMN fee_schedules.next_due_date IS 'Date when next fee event should be generated';
```

**Example:**
```sql
-- Management fee: 2% annual for 3 years
-- Start: Jan 1, 2025
-- Auto-generate fee_events on Jan 1, 2025, Jan 1, 2026, Jan 1, 2027
INSERT INTO fee_schedules
(fee_component_id, investor_id, deal_id, start_date, end_date, total_periods, next_due_date, status)
VALUES
('mgmt-fee-id', 'investor-id', 'deal-id', '2025-01-01', '2027-12-31', 3, '2025-01-01', 'active');
```

---

## PART 3: DATA MODEL SUMMARY

### Complete Fee Data Flow

```
1. DEFINE FEE STRUCTURE
   fee_plans
   └── fee_components (subscription, management, performance, spread)

2. APPLY TO INVESTORS
   subscriptions (investor commitment)
   └── fee_schedules (for recurring fees like management)

3. GENERATE FEE EVENTS
   fee_events (accrued fees)
   └── status: accrued

4. CREATE INVOICES
   invoices
   └── invoice_lines
       └── fee_event_id

5. TRACK INTRODUCER DEDUCTIONS
   introducer_commissions
   └── deduct from fee_events

6. PAYMENT & RECONCILIATION
   payments (actual $ received)
   └── fee_events.status: invoiced → paid
```

---

## PART 4: BUSINESS LOGIC REQUIREMENTS

### 1. Fee Calculation Rules

#### Subscription Fee
```
Formula: investment_amount × subscription_fee_percent
Timing: One-time, at subscription
Payment: Included in wire amount (investor wires investment + subscription fee)

Example:
- Investment: $100,000
- Subscription fee: 2%
- Calculated fee: $2,000
- Investor wires: $102,000
```

#### Management Fee
```
Formula: investment_amount × management_fee_percent × number_of_periods
Timing: Recurring (annual, quarterly, monthly) OR upfront
Payment: Invoiced separately

Example 1 (Recurring):
- Investment: $100,000
- Management fee: 2% per year for 3 years, annual invoicing
- Year 1 invoice: $2,000 (due Jan 1, 2025)
- Year 2 invoice: $2,000 (due Jan 1, 2026)
- Year 3 invoice: $2,000 (due Jan 1, 2027)

Example 2 (Upfront):
- Investment: $100,000
- Management fee: 2% per year for 3 years, paid upfront
- Single invoice: $6,000 (due at subscription)
```

#### Performance Fee
```
Formula: (exit_price - entry_price) × num_shares × performance_fee_percent
Timing: On exit/sale event
Payment: Deducted from proceeds

Example (Simple):
- Entry price per share: $0.04
- Exit price per share: $1.00
- Gain per share: $0.96
- Performance fee: 20%
- Fee per share: $0.192

Example (Tiered):
- Entry: $0.04, Exit: $1.00
- Gain: $0.96 per share = 25x return
- Tier 1: 20% on first 10x = 20% × ($0.40 - $0.04) = $0.072
- Tier 2: 30% on above 10x = 30% × ($1.00 - $0.40) = $0.18
- Total fee: $0.252 per share
```

#### Spread (Price Per Share Markup)
```
Formula: (price_per_share - cost_per_share) × num_shares
Timing: Built into subscription
Payment: Implicit in share price

Example:
- Verso's cost: $0.04 per share
- Investor price: $0.06 per share
- Spread: $0.02 per share
- For 100,000 shares: $2,000 spread revenue
```

---

### 2. Introducer Commission Deductions

When an introducer brings a deal, they receive a percentage of fees:

```
Fee earned by Verso
- Commission owed to introducer
= Net fee retained by Verso
```

**Example:**
```
Subscription fee collected: $10,000
Introducer commission: 30% of subscription fee
Commission owed: $3,000
Verso keeps: $7,000
```

**Database tracking:**
```sql
-- Fee event: subscription fee charged
INSERT INTO fee_events (investor_id, deal_id, fee_type, computed_amount, status)
VALUES ('inv-id', 'deal-id', 'subscription', 10000, 'accrued');

-- Introducer commission: 30% of subscription fee
INSERT INTO introducer_commissions
(introducer_id, investor_id, deal_id, basis_type, rate_bps, base_amount, accrual_amount, status)
VALUES
('intro-id', 'inv-id', 'deal-id', 'subscription_fee', 3000, 10000, 3000, 'accrued');
```

---

### 3. Invoice Generation Logic

#### One-time Fees (Subscription, Upfront Management)
```
Trigger: Subscription signed / allocation confirmed
Action: Create invoice immediately
Due date: Typically 7-14 days from invoice date
```

#### Recurring Management Fees
```
Trigger: Scheduled date (from fee_schedules)
Action:
  1. Generate fee_event (status: accrued)
  2. Create invoice with due date
  3. Update fee_schedule (completed_periods++, next_due_date)
  4. Create task for reminder (if enabled)

Frequency: Annual, quarterly, or monthly (per fee_component.frequency)
```

#### Performance Fees
```
Trigger: Exit event / liquidity event
Action:
  1. Calculate gain per share
  2. Apply performance fee tiers
  3. Generate fee_event
  4. Deduct from distribution proceeds (not separate invoice)
```

---

### 4. Reminder & Notification Logic

#### Invoice Reminders

**Trigger conditions:**
- Invoice status = 'sent' or 'overdue'
- due_date - reminder_days_before = today

**Actions:**
1. Create task for staff:
   ```sql
   INSERT INTO tasks
   (owner_user_id, kind, category, title, due_at, priority, related_entity_type, related_entity_id)
   VALUES
   (staff_id, 'invoice_reminder', 'fees', 'Invoice due: Investor XYZ - $2,000', due_date, 'high', 'invoice', invoice_id);
   ```

2. Send email to investor (via n8n workflow)

3. Update invoice status to 'overdue' if past due_date

---

#### Scheduled Fee Generation

**Cron job (daily):**
```sql
-- Find fee schedules due today
SELECT * FROM fee_schedules
WHERE status = 'active'
  AND next_due_date <= CURRENT_DATE;

-- For each schedule:
-- 1. Generate fee_event
-- 2. Create invoice
-- 3. Update schedule
-- 4. Create reminder task
```

---

## PART 5: UI/UX REQUIREMENTS

### Page Structure: `/versotech/staff/fees`

#### Top-Level Navigation Tabs

1. **Overview** - Dashboard with KPIs
2. **Fee Plans** - Define fee structures per deal/vehicle
3. **Invoices** - Manage and track invoices
4. **Schedule** - Calendar view of upcoming fees
5. **Commissions** - Introducer deductions
6. **Reports** - Analytics and reporting

---

### Tab 1: Overview (Dashboard)

**KPI Cards:**
- Total fees earned (YTD, MTM, QTD)
- Outstanding invoices (count + total $)
- Overdue invoices (count + total $)
- Upcoming fees (next 30 days)
- Introducer commissions owed

**Charts:**
- Fees by type (subscription, management, performance, spread)
- Fees by deal
- Invoice status breakdown (draft, sent, paid, overdue)
- Monthly fee revenue trend

**Recent Activity:**
- Latest invoices sent
- Latest payments received
- Upcoming fee generation dates

---

### Tab 2: Fee Plans

**Purpose:** Define and manage fee structures

**List View:**
- Table of all fee plans
- Columns: Plan name, Associated deal/vehicle, Status (active/inactive), Fee types, Created date
- Actions: Edit, Duplicate, Archive

**Create/Edit Fee Plan:**

**Section 1: Basic Info**
- Plan name
- Description
- Associated deal or vehicle (optional)
- Effective from / Effective until dates
- Set as default (checkbox)

**Section 2: Fee Components**

For each fee type (subscription, management, performance, spread):

**Subscription Fee:**
- Enable (toggle)
- Calculation method: % of investment OR flat amount
- Rate: [____]% or $[____]
- Notes

**Management Fee:**
- Enable (toggle)
- Rate: [____]% per annum
- Duration: [____] years/months/quarters OR life of vehicle
- Payment schedule:
  - ( ) Recurring - invoice each period
  - ( ) Upfront - all periods paid at once
  - ( ) On demand - manual invoicing
- Frequency (if recurring): Annual / Quarterly / Monthly
- Notes

**Performance Fee:**
- Enable (toggle)
- Calculation method: % of profit / % of NAV gain
- Hurdle rate: [____]% (optional)
- Tier 1:
  - Rate: [____]%
  - Up to [____]x return (optional)
- Tier 2: (optional)
  - Rate: [____]%
  - Above [____]x return
- High water mark: (checkbox)
- Notes

**Spread Markup:**
- Enable (toggle)
- Method: Per share spread OR % markup
- Rate: $[____] per share OR [____]%
- Notes

**Preview:**
Show example calculation for typical investment amount

---

### Tab 3: Invoices

**Purpose:** Manage invoice generation and tracking

**Filters:**
- Status: All / Draft / Sent / Paid / Overdue / Cancelled
- Date range
- Investor
- Deal
- Fee type

**List View:**
- Table of invoices
- Columns:
  - Invoice # | Investor | Deal | Fee type | Amount | Due date | Status | Actions
- Status badges with color coding
- Sort by: Due date (default), Amount, Status, Investor

**Actions:**
- Generate invoice (manual)
- View/Edit invoice
- Send invoice
- Mark as paid
- Cancel/void invoice
- Download PDF

**Generate Invoice (Modal):**

1. Select investor
2. Select deal (optional)
3. Select fee events to include (multi-select table)
   - Show: Fee type, Description, Amount, Date
   - Allow custom line items
4. Set due date
5. Add notes
6. Preview invoice
7. Generate (draft) or Generate & Send

**Invoice Detail View:**
- Header: Invoice #, Status, Dates (created, sent, due, paid)
- Investor info
- Line items (from fee_events)
- Subtotal, tax, total
- Payment tracking (amount paid, balance due)
- Related fee events (expandable)
- Audit log (who created, sent, paid)
- Actions: Edit, Send, Mark paid, Void

---

### Tab 4: Schedule (Calendar View)

**Purpose:** Visualize upcoming fees and prevent missed invoices

**View Options:**
- Month view (default)
- Week view
- List view

**Calendar Display:**
- Color-coded by fee type:
  - Blue: Management fees
  - Green: Subscription fees
  - Purple: Performance fees
- Hover: Show investor, deal, amount
- Click: View details / Generate invoice

**Filters:**
- Fee type
- Deal
- Investor
- Status (upcoming, generated, invoiced, paid)

**Upcoming Fees Section (Right sidebar):**
- List of fees due in next 30/60/90 days
- Grouped by month
- Show: Date, Investor, Fee type, Amount, Status
- Actions: Generate invoice, Skip, Waive

**Alert Banner:**
- "3 overdue fees requiring attention"
- Click to filter to overdue

---

### Tab 5: Commissions (Introducer Deductions)

**Purpose:** Track and manage introducer commission payments

**Filters:**
- Status: Accrued / Approved / Paid
- Introducer
- Deal
- Date range

**List View:**
- Table of introducer commissions
- Columns:
  - Introducer | Deal | Investor | Basis | Rate | Amount | Status | Actions
- Group by introducer (expandable)
- Totals per introducer

**Actions:**
- Approve commission
- Generate payment invoice (to introducer)
- Mark as paid
- View related fee events

**Commission Detail:**
- Introducer info
- Fee basis (which fee type: subscription, management, performance, spread)
- Calculation: Base amount × Rate = Commission
- Status timeline
- Related invoice (if paid)
- Notes

---

### Tab 6: Reports

**Purpose:** Analytics and reporting

**Pre-built Reports:**

1. **Fee Revenue Summary**
   - Total fees by type
   - By deal, by investor
   - Time period comparison

2. **Management Fee Forecast**
   - Projected management fees for next 12 months
   - Based on active fee schedules

3. **Outstanding Invoices**
   - All unpaid invoices
   - Aging analysis (0-30 days, 31-60, 61-90, 90+)

4. **Introducer Commission Report**
   - Total commissions owed per introducer
   - Paid vs. unpaid
   - By deal

5. **Fee vs. Investment Analysis**
   - Total fees as % of AUM
   - By vehicle

**Export:**
- CSV, Excel, PDF
- Date range selector
- Filter options

---

## PART 6: API ENDPOINTS

### Fee Plans

```
GET    /api/staff/fees/plans              - List all fee plans
GET    /api/staff/fees/plans/:id          - Get fee plan details
POST   /api/staff/fees/plans              - Create fee plan
PUT    /api/staff/fees/plans/:id          - Update fee plan
DELETE /api/staff/fees/plans/:id          - Archive fee plan
POST   /api/staff/fees/plans/:id/duplicate - Duplicate fee plan
```

### Fee Components

```
GET    /api/staff/fees/plans/:planId/components        - List components in plan
POST   /api/staff/fees/plans/:planId/components        - Add component to plan
PUT    /api/staff/fees/components/:id                  - Update component
DELETE /api/staff/fees/components/:id                  - Remove component
```

### Fee Events

```
GET    /api/staff/fees/events                   - List fee events (with filters)
GET    /api/staff/fees/events/:id               - Get fee event details
POST   /api/staff/fees/events/generate          - Generate fee events (manual)
PUT    /api/staff/fees/events/:id               - Update fee event
POST   /api/staff/fees/events/:id/waive         - Waive fee
POST   /api/staff/fees/events/:id/invoice       - Create invoice from fee event
```

### Invoices

```
GET    /api/staff/fees/invoices                 - List invoices (with filters)
GET    /api/staff/fees/invoices/:id             - Get invoice details
POST   /api/staff/fees/invoices                 - Create invoice
PUT    /api/staff/fees/invoices/:id             - Update invoice
POST   /api/staff/fees/invoices/:id/send        - Send invoice to investor
POST   /api/staff/fees/invoices/:id/mark-paid   - Mark invoice as paid
POST   /api/staff/fees/invoices/:id/void        - Void/cancel invoice
GET    /api/staff/fees/invoices/:id/pdf         - Generate invoice PDF
```

### Fee Schedules

```
GET    /api/staff/fees/schedules                - List fee schedules
GET    /api/staff/fees/schedules/:id            - Get schedule details
POST   /api/staff/fees/schedules                - Create schedule (usually auto)
PUT    /api/staff/fees/schedules/:id            - Update schedule
POST   /api/staff/fees/schedules/:id/pause      - Pause schedule
POST   /api/staff/fees/schedules/:id/cancel     - Cancel schedule
GET    /api/staff/fees/schedules/upcoming       - Get upcoming scheduled fees
```

### Introducer Commissions

```
GET    /api/staff/fees/commissions              - List commissions (with filters)
GET    /api/staff/fees/commissions/:id          - Get commission details
POST   /api/staff/fees/commissions              - Create commission (usually auto)
POST   /api/staff/fees/commissions/:id/approve  - Approve commission
POST   /api/staff/fees/commissions/:id/pay      - Mark commission as paid
GET    /api/staff/fees/commissions/by-introducer/:introducerId - Group by introducer
```

### Reports

```
GET    /api/staff/fees/reports/revenue          - Fee revenue report
GET    /api/staff/fees/reports/forecast         - Management fee forecast
GET    /api/staff/fees/reports/outstanding      - Outstanding invoices
GET    /api/staff/fees/reports/commissions      - Introducer commission report
GET    /api/staff/fees/reports/analysis         - Fee vs investment analysis
```

### Dashboard

```
GET    /api/staff/fees/dashboard/kpis           - Overview KPIs
GET    /api/staff/fees/dashboard/charts         - Chart data
GET    /api/staff/fees/dashboard/activity       - Recent activity
```

---

## PART 7: AUTOMATION & SCHEDULED JOBS

### Cron Job 1: Generate Recurring Fee Events

**Frequency:** Daily at 1:00 AM UTC

**Logic:**
```typescript
// /api/cron/generate-scheduled-fees

1. Find all active fee schedules where next_due_date <= today
2. For each schedule:
   a. Get fee component details
   b. Get investor subscription/allocation amount
   c. Calculate fee amount
   d. Create fee_event (status: 'accrued')
   e. Update fee_schedule:
      - completed_periods++
      - next_due_date = next period date
      - If completed_periods >= total_periods: status = 'completed'
   f. If auto-invoice enabled:
      - Create invoice
      - Create reminder task
```

**Example:**
```sql
-- Find schedules due today
SELECT fs.*, fc.*, i.email, s.commitment
FROM fee_schedules fs
JOIN fee_components fc ON fs.fee_component_id = fc.id
JOIN investors i ON fs.investor_id = i.id
LEFT JOIN subscriptions s ON fs.allocation_id = s.id
WHERE fs.status = 'active'
  AND fs.next_due_date <= CURRENT_DATE;

-- Generate fee event
INSERT INTO fee_events
(deal_id, investor_id, fee_component_id, fee_type, event_date, base_amount, computed_amount, status)
VALUES
(schedule.deal_id, schedule.investor_id, fc.id, fc.kind, CURRENT_DATE, subscription.commitment, calculated_fee, 'accrued');
```

---

### Cron Job 2: Invoice Reminders

**Frequency:** Daily at 9:00 AM (investor timezone)

**Logic:**
```typescript
// /api/cron/invoice-reminders

1. Find invoices where:
   - status IN ('sent', 'partially_paid')
   - due_date - reminder_days_before <= today
   - No reminder task exists yet OR last reminder > 7 days ago

2. For each invoice:
   a. Create task for staff:
      - title: "Invoice due: [Investor Name] - $[Amount]"
      - due_at: invoice.due_date
      - priority: 'high' if overdue, else 'medium'
      - related_entity: invoice

   b. Send email reminder to investor (via n8n webhook)

   c. Update invoice.reminder_task_id

3. Find overdue invoices (due_date < today AND status = 'sent')
   a. Update status to 'overdue'
   b. Create high-priority task for staff
```

---

### Cron Job 3: Auto-Send Invoices

**Frequency:** Daily at 10:00 AM

**Logic:**
```typescript
// /api/cron/auto-send-invoices

1. Find invoices where:
   - status = 'draft'
   - auto_send_enabled = true
   - created_at + 1 day <= today (allow 1 day for review)

2. For each invoice:
   a. Generate PDF
   b. Send via email (n8n webhook)
   c. Update status to 'sent'
   d. Set sent_at timestamp
   e. Create reminder task for due date
```

---

### Trigger: Subscription Signed

**Event:** New subscription created/signed

**Logic:**
```typescript
// /api/deals/:id/allocations (or /api/subscriptions)

1. Get fee_plan for the deal/vehicle
2. For each fee_component in fee_plan:

   // One-time fees (subscription fee)
   if (component.frequency === 'one_time') {
     - Create fee_event (status: 'accrued')
     - Create invoice (if auto-invoice enabled)
   }

   // Upfront management fees
   if (component.kind === 'management' && component.payment_schedule === 'upfront') {
     - Calculate total: rate × duration_periods
     - Create single fee_event
     - Create invoice
   }

   // Recurring management fees
   if (component.kind === 'management' && component.payment_schedule === 'recurring') {
     - Create fee_schedule:
       - start_date: subscription.effective_date
       - total_periods: component.duration_periods
       - next_due_date: start_date + 1 period
   }

3. Calculate introducer commissions (if introducer_id exists)
   - For each fee_event created
   - Get introducer commission rate from introductions table
   - Create introducer_commission record
```

---

### Trigger: Exit/Liquidity Event

**Event:** Vehicle exit, distribution event, secondary sale

**Logic:**
```typescript
// /api/distributions (or exit event endpoint)

1. Get all subscriptions for the vehicle
2. For each subscription:
   a. Get performance fee component from fee_plan
   b. Calculate gain:
      - exit_price_per_share - entry_price_per_share
      - gain_multiplier = exit_price / entry_price

   c. Apply tiered performance fee:
      - If gain_multiplier <= tier1_threshold:
        - fee = gain × tier1_rate
      - Else:
        - tier1_portion = (entry_price × tier1_threshold - entry_price) × tier1_rate
        - tier2_portion = (exit_price - entry_price × tier1_threshold) × tier2_rate
        - fee = tier1_portion + tier2_portion

   d. Create fee_event (status: 'accrued')
   e. Deduct from distribution proceeds (no separate invoice)
   f. Create introducer_commission (if applicable)
```

---

## PART 8: IMPLEMENTATION PHASES

### Phase 1: Database Foundation (Week 1)

**Tasks:**
1. Run Migration 1: Add management fee duration & payment schedule columns
2. Run Migration 2: Add performance fee tier columns
3. Run Migration 3: Add invoice reminder columns
4. Run Migration 4: Create fee_schedules table
5. Create database indexes for performance
6. Write database seed data for testing

**Deliverables:**
- Migration files in `supabase/migrations/`
- Updated TypeScript types: `npm run gen:types`
- Test data seeded

---

### Phase 2: API Layer (Week 2)

**Tasks:**
1. Create API routes for fee plans CRUD
2. Create API routes for fee events
3. Create API routes for invoices
4. Create API routes for fee schedules
5. Create API routes for introducer commissions
6. Create API routes for reports
7. Implement fee calculation logic (util functions)
8. Write API tests

**Deliverables:**
- API routes in `versotech-portal/src/app/api/staff/fees/`
- Utility functions in `versotech-portal/src/lib/fees/`
- API documentation

---

### Phase 3: Core UI - Fee Plans (Week 3)

**Tasks:**
1. Create page: `/versotech/staff/fees` (layout with tabs)
2. Build Fee Plans tab:
   - List view with table
   - Create/Edit fee plan form
   - Fee component configuration UI
   - Preview calculation
3. Build reusable components:
   - FeeComponentForm
   - FeePlanSelector
   - FeeCalculationPreview

**Deliverables:**
- Fee Plans management UI fully functional
- Components in `versotech-portal/src/components/fees/`

---

### Phase 4: Invoice Management UI (Week 4)

**Tasks:**
1. Build Invoices tab:
   - List view with filters
   - Generate invoice modal
   - Invoice detail view
   - Invoice PDF generation
2. Invoice actions:
   - Send invoice (email integration)
   - Mark as paid
   - Void invoice
3. Create components:
   - InvoiceList
   - InvoiceDetail
   - GenerateInvoiceModal
   - InvoiceStatusBadge

**Deliverables:**
- Invoice management UI fully functional
- PDF generation working

---

### Phase 5: Schedule & Calendar (Week 5)

**Tasks:**
1. Build Schedule tab:
   - Calendar component (use react-big-calendar or similar)
   - Color coding by fee type
   - Month/week/list views
   - Filters
2. Upcoming fees sidebar
3. Actions from calendar:
   - Generate invoice
   - Skip/waive fee
4. Alert banner for overdue fees

**Deliverables:**
- Calendar view functional
- Fee schedule tracking working

---

### Phase 6: Automation & Cron Jobs (Week 6)

**Tasks:**
1. Implement cron endpoint: Generate recurring fee events
2. Implement cron endpoint: Invoice reminders
3. Implement cron endpoint: Auto-send invoices
4. Set up Vercel cron jobs (vercel.json)
5. Implement subscription signed trigger
6. Implement exit/liquidity event trigger
7. Test automation end-to-end

**Deliverables:**
- Cron jobs in `versotech-portal/src/app/api/cron/fees/`
- Vercel cron configuration
- Automated fee generation working

---

### Phase 7: Commissions & Reports (Week 7)

**Tasks:**
1. Build Commissions tab:
   - List view
   - Approval workflow
   - Payment tracking
2. Build Reports tab:
   - Revenue summary
   - Forecast
   - Outstanding invoices
   - Commission report
   - Fee analysis
3. Export functionality (CSV, Excel)
4. Create dashboard Overview tab

**Deliverables:**
- Commissions management working
- Reports and analytics functional

---

### Phase 8: Testing & Polish (Week 8)

**Tasks:**
1. End-to-end testing of all workflows
2. Performance optimization
3. Error handling and edge cases
4. UI/UX polish and responsive design
5. Documentation
6. User acceptance testing with client

**Deliverables:**
- Production-ready Fees page
- Documentation
- Client sign-off

---

## PART 9: TECHNICAL CONSIDERATIONS

### Performance Optimization

1. **Database Indexes:**
   ```sql
   CREATE INDEX idx_fee_events_investor_status ON fee_events(investor_id, status);
   CREATE INDEX idx_fee_events_deal_status ON fee_events(deal_id, status);
   CREATE INDEX idx_invoices_status_due ON invoices(status, due_date);
   CREATE INDEX idx_fee_schedules_next_due ON fee_schedules(next_due_date) WHERE status = 'active';
   ```

2. **Caching:**
   - Cache fee plans (rarely change)
   - Cache KPI calculations (refresh every 5 minutes)
   - Cache report data (refresh on demand)

3. **Pagination:**
   - Invoice list: 50 per page
   - Fee events list: 100 per page
   - Use cursor-based pagination for large lists

---

### Security & Permissions

**RLS Policies:**

```sql
-- Fee plans: Only staff can view/edit
CREATE POLICY "Staff can manage fee plans"
ON fee_plans FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role ILIKE 'staff%'
  )
);

-- Invoices: Investors can view their own, staff can view all
CREATE POLICY "Investors view own invoices"
ON invoices FOR SELECT
TO authenticated
USING (
  investor_id IN (
    SELECT id FROM investors WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Staff view all invoices"
ON invoices FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role ILIKE 'staff%'
  )
);
```

---

### Error Handling

**Common edge cases:**

1. **Fee schedule drift:** What if a management fee invoice is missed?
   - Create "catch-up" fee events for missed periods
   - Flag for manual review

2. **Partial payments:** Invoice paid in multiple installments
   - Track paid_amount and balance_due
   - Update status: sent → partially_paid → paid

3. **Fee waivers:** Client negotiates fee reduction
   - Create fee_event but mark status: 'waived'
   - Track waived_reason in notes

4. **Subscription changes:** Investor increases commitment mid-term
   - Create new fee_schedule for increased amount
   - Or: adjust base_amount for future fee_events

5. **Performance fee calculation edge cases:**
   - No gain (loss scenario): performance fee = $0
   - Gain below hurdle: performance fee = $0
   - Partial exit: pro-rate performance fee by % sold

---

### Audit & Compliance

**Audit logging:**
- Log all fee plan changes (who, when, what changed)
- Log all invoice actions (created, sent, paid, voided)
- Log all fee waivers
- Log all introducer commission approvals

**Immutable records:**
- Once invoice is sent, cannot be edited (must void and recreate)
- Once fee event is invoiced, cannot be deleted
- Audit log table for all changes

---

## PART 10: TESTING CHECKLIST

### Unit Tests

- [ ] Fee calculation functions (subscription, management, performance, spread)
- [ ] Performance fee tiering logic
- [ ] Introducer commission calculations
- [ ] Date calculations for fee schedules
- [ ] Invoice total calculations

### Integration Tests

- [ ] Create fee plan → Apply to subscription → Generate fee events
- [ ] Generate recurring management fees via cron job
- [ ] Create invoice from fee events
- [ ] Mark invoice as paid → Update fee_event status
- [ ] Generate introducer commission from fee event
- [ ] Exit event → Calculate performance fee

### End-to-End Tests

- [ ] Full subscription flow: Sign subscription → Fees calculated → Invoice sent → Payment received
- [ ] Recurring management fee: Schedule created → Annual fee generated → Invoice sent → Payment tracked
- [ ] Performance fee on exit: Exit event → Tiered fee calculated → Deducted from proceeds
- [ ] Invoice reminder: Due date approaching → Task created → Email sent
- [ ] Forgot invoice scenario: Cron job catches missed fee → Generates late invoice → Staff notified

### User Acceptance Tests

- [ ] Staff can create fee plan for new deal
- [ ] Staff can see all upcoming fees in calendar
- [ ] Staff receives reminder for overdue invoice
- [ ] Staff can approve introducer commission
- [ ] Staff can generate fee revenue report
- [ ] Investor receives invoice email
- [ ] Investor can view invoice in portal

---

## PART 11: QUESTIONS FOR CLIENT

Based on analysis, we need clarification on:

### 1. UI Location
**Question:** Where should the main Fees page be located?
- Option A: Deal-level (inside each deal, under "Fees" tab) ✓ Already exists
- Option B: Global section (`/versotech/staff/fees`) for cross-deal fee management
- Option C: Both (deal-level for deal-specific, global for all fees)

**Recommendation:** Option C - Keep existing deal-level fees tab, add global fees section

---

### 2. Investor Portal Visibility
**Question:** Should investors see their fee breakdown in the investor portal?
- Show all fees (subscription, management, performance) ✓
- Show only invoices (hide internal fee structure)
- Show nothing (staff-only)

**Recommendation:** Show invoices and high-level fee breakdown, hide complex internal calculations

---

### 3. Historical Data Import
**Question:** Do you want to import historical fee data from Excel/existing systems?
- Yes, full history
- Yes, but only active/future fees
- No, start fresh from go-live date

**Recommendation:** Depends on reporting needs and audit requirements

---

### 4. Multi-Currency
**Question:** Do fees ever need to be charged in currencies other than USD?
- Yes (specify which currencies)
- No, USD only

**Current schema:** Supports multi-currency (fee_events.currency, invoices.currency)

---

### 5. Payment Integration
**Question:** Does the system just track fees, or facilitate payment collection?
- Track only (manual payment entry)
- Facilitate (integrate with payment gateway)
- Both (track ACH/wire, facilitate credit card)

**Current schema:** Has payments table, likely tracking only

---

### 6. Fee Templates
**Question:** Do you have standard fee structures that should be saved as templates?
- Yes (e.g., "Standard 2/20", "Secondary 2.5/20/30", "No Management")
- No, each deal is custom

**Recommendation:** Create template system for common structures

---

### 7. Approval Workflow
**Question:** Do fee structures need approval before being applied?
- Yes (e.g., CFO approval for fee waivers)
- No, staff can set freely

**Current system:** Has approvals table, could integrate

---

### 8. Retroactive Fee Adjustments
**Question:** How do you handle fee adjustments after invoicing?
- Void and reissue invoice
- Issue credit note
- Manual adjustment in next invoice

**Recommendation:** Support void and reissue + credit notes

---

## PART 12: SUCCESS METRICS

### Pre-Implementation (Current State)
- Manual fee tracking in Excel
- Forgotten invoices (how many per year?)
- Time spent on fee administration (hours per month?)
- Invoice payment delays

### Post-Implementation (Goals)
- Zero forgotten invoices (automated scheduling)
- 80% reduction in fee admin time
- Faster invoice payments (auto-reminders)
- 100% audit trail for compliance
- Real-time fee revenue visibility

---

## PART 13: RISKS & MITIGATIONS

### Risk 1: Complex Performance Fee Calculations
**Risk:** Tiered performance fees with hurdles are mathematically complex
**Impact:** Incorrect fees → investor disputes
**Mitigation:**
- Extensive unit tests
- Manual verification for first 10 calculations
- Clear audit trail showing calculation steps

### Risk 2: Missed Recurring Fees
**Risk:** Cron job fails, fees not generated
**Impact:** Lost revenue, embarrassment
**Mitigation:**
- Monitoring/alerting on cron job failures
- Manual override to generate missed fees
- Weekly staff review of upcoming fees

### Risk 3: Introducer Commission Disputes
**Risk:** Disagreement on commission amounts or basis
**Impact:** Legal issues, relationship damage
**Mitigation:**
- Clear documentation in introductions table
- Approval workflow for commissions
- Audit log of all commission calculations

### Risk 4: Invoice Reconciliation
**Risk:** Payments received but not matched to invoices
**Impact:** Incorrect overdue status, duplicate invoices
**Mitigation:**
- Integration with reconciliations page (already exists!)
- Manual matching workflow
- Alerts for unmatched payments

---

## PART 14: NEXT STEPS

### Immediate Actions

1. **Client Review** (This document)
   - Review entire implementation plan
   - Answer questions in Part 11
   - Approve scope and timeline

2. **Technical Setup** (Day 1)
   - Create feature branch: `feature/fees-page`
   - Set up local development environment
   - Review existing fee tables in Supabase

3. **Database Migrations** (Week 1)
   - Run migrations in local environment
   - Test with seed data
   - Review with client on staging

4. **Kickoff Phase 2** (Week 2)
   - Begin API development
   - Daily standups for questions
   - Weekly demos of progress

---

## APPENDIX A: DATABASE SCHEMA DIAGRAM

```
┌─────────────────┐
│   fee_plans     │
│─────────────────│
│ id              │
│ deal_id         │────┐
│ vehicle_id      │    │
│ name            │    │
│ is_default      │    │
└─────────────────┘    │
         │             │
         │ 1:N         │
         ▼             │
┌──────────────────┐   │
│ fee_components   │   │
│──────────────────│   │
│ id               │   │
│ fee_plan_id      │   │
│ kind (enum)      │   │     ┌──────────────┐
│ calc_method      │   │     │    deals     │
│ frequency        │   │     │──────────────│
│ rate_bps         │   ├─────│ id           │
│ duration_periods │◄──┘     │ name         │
│ payment_schedule │         └──────────────┘
└──────────────────┘                │
         │                          │
         │ 1:N                      │ 1:N
         ▼                          ▼
┌──────────────────┐      ┌──────────────────┐
│   fee_events     │      │  subscriptions   │
│──────────────────│      │──────────────────│
│ id               │      │ id               │
│ fee_component_id │      │ investor_id      │
│ investor_id      │◄─────│ vehicle_id       │
│ deal_id          │      │ commitment       │
│ event_date       │      │ subscription_fee_% │
│ computed_amount  │      │ performance_fee_%│
│ status (enum)    │      └──────────────────┘
│ invoice_id       │                │
└──────────────────┘                │
         │                          │
         │ N:1                      │ 1:N
         ▼                          ▼
┌──────────────────┐      ┌──────────────────────┐
│    invoices      │      │ introducer_commissions│
│──────────────────│      │──────────────────────│
│ id               │      │ id                   │
│ investor_id      │      │ introducer_id        │
│ deal_id          │      │ investor_id          │
│ invoice_number   │      │ deal_id              │
│ total            │      │ basis_type           │
│ status (enum)    │      │ accrual_amount       │
│ due_date         │      │ status               │
└──────────────────┘      └──────────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐
│  invoice_lines   │
│──────────────────│
│ id               │
│ invoice_id       │
│ fee_event_id     │────┐
│ description      │    │
│ amount           │    │
└──────────────────┘    │
                        │
    ┌───────────────────┘
    │
    ▼
┌──────────────────┐
│  fee_schedules   │  (NEW TABLE)
│──────────────────│
│ id               │
│ fee_component_id │
│ investor_id      │
│ start_date       │
│ total_periods    │
│ completed_periods│
│ next_due_date    │
│ status           │
└──────────────────┘
```

---

## APPENDIX B: FEE CALCULATION EXAMPLES

### Example 1: Simple Deal (Verso's Preferred Structure)

**Deal:** SpaceX Secondary - VC14
**Fee Structure:**
- Spread: $0.50 per share (built into price)
- Subscription fee: 2.5%
- Management fee: 0%
- Performance fee: 0%

**Investor:** Jane Doe invests $100,000

**Calculation:**
1. Base investment: $100,000
2. Subscription fee: $100,000 × 2.5% = $2,500
3. Total wire: $102,500
4. Shares purchased: $102,500 ÷ $60/share = 1,708 shares
5. Verso's spread revenue: 1,708 × $0.50 = $854

**Fees to Verso:**
- Subscription fee: $2,500
- Spread: $854
- Management fee: $0
- Performance fee: $0 (until exit)
- **Total upfront: $3,354**

**Introducer Deduction:** (if applicable)
- Introducer gets 30% of subscription fee: $2,500 × 30% = $750
- Verso keeps: $2,500 - $750 = $1,750

---

### Example 2: Traditional PE Structure

**Deal:** Private Growth Fund II
**Fee Structure:**
- Subscription fee: 0%
- Management fee: 2% per annum for 10 years, paid annually
- Performance fee: 20%
- Spread: $0

**Investor:** John Smith invests $500,000

**Upfront:**
- Wire: $500,000 (no subscription fee)
- Shares: $500,000 ÷ $25/share = 20,000 shares

**Annual Management Fees (10 years):**
- Year 1: $500,000 × 2% = $10,000 (invoice Jan 1, 2025)
- Year 2: $500,000 × 2% = $10,000 (invoice Jan 1, 2026)
- ...
- Year 10: $500,000 × 2% = $10,000 (invoice Jan 1, 2034)
- **Total over 10 years: $100,000**

**On Exit (assume 3x return after 5 years):**
- Entry: $25/share
- Exit: $75/share
- Gain: $50/share
- Performance fee: $50 × 20% = $10/share
- Total performance fee: 20,000 shares × $10 = $200,000

**Total Fees to Verso:**
- Subscription: $0
- Management (10 years): $100,000
- Performance: $200,000
- **Total: $300,000**

---

### Example 3: Upfront Management Fee

**Deal:** Real Estate SPV - Manhattan Office
**Fee Structure:**
- Subscription fee: 1%
- Management fee: 1.5% per annum for 3 years, paid upfront
- Performance fee: 15%

**Investor:** ABC Capital invests $1,000,000

**Upfront:**
- Subscription fee: $1,000,000 × 1% = $10,000
- Management fee (3 years upfront): $1,000,000 × 1.5% × 3 = $45,000
- **Total wire: $1,055,000**

**On Exit (assume 2x return after 3 years):**
- Performance fee: gain × 15% = $1,000,000 × 15% = $150,000

**Total Fees:**
- Subscription: $10,000
- Management: $45,000
- Performance: $150,000
- **Total: $205,000**

**Benefit:** Verso gets management fees upfront, investor doesn't receive annual invoices

---

## APPENDIX C: WORKFLOW DIAGRAMS

### Subscription Fee Workflow

```
Investor signs subscription
    │
    ▼
System calculates subscription fee
    │
    ▼
Create fee_event (status: accrued)
    │
    ▼
Create invoice (status: draft)
    │
    ▼
Staff reviews and approves
    │
    ▼
Send invoice (status: sent)
    │
    ▼
Investor wires payment
    │
    ▼
Reconciliation matches payment to invoice
    │
    ▼
Mark invoice as paid
    │
    ▼
Update fee_event (status: paid)
```

---

### Recurring Management Fee Workflow

```
Subscription signed
    │
    ▼
Create fee_schedule
    │
    ▼
Cron job runs daily
    │
    ▼
Check: next_due_date <= today?
    │
    ├─ No → Skip
    │
    └─ Yes
        │
        ▼
    Generate fee_event (status: accrued)
        │
        ▼
    Create invoice (status: draft)
        │
        ▼
    Auto-send invoice (status: sent)
        │
        ▼
    Update fee_schedule:
    - completed_periods++
    - next_due_date = +1 year
        │
        ▼
    Create reminder task (due = invoice.due_date - 7 days)
        │
        ▼
    Cron job: Send reminder email
        │
        ▼
    Payment received
        │
        ▼
    Mark invoice as paid
        │
        ▼
    Complete task
```

---

## DOCUMENT VERSION HISTORY

- **v1.0** (2025-10-30): Initial implementation plan based on schema analysis and client meeting transcript

---

**END OF IMPLEMENTATION PLAN**

*This document provides a comprehensive blueprint for building the Fees page. Review and provide feedback on any sections that need adjustment.*