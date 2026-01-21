# PRD: Fee System Redesign

## Document Info
- **Version**: 1.0
- **Date**: 2026-01-20
- **Status**: Draft
- **Author**: System Analysis

---

## 1. Executive Summary

The Versotech fee system manages two parallel financial streams:

1. **Revenue Stream** (Money IN): Fees collected FROM investors
2. **Expense Stream** (Money OUT): Commissions paid TO introducers/partners/commercial partners

The current implementation has structural inconsistencies between the Deal page and Fees page, incomplete fee event calculations, and a reconciliation system that doesn't reflect the new multi-entity commission structure.

This PRD defines the complete redesign to make the system consistent, accurate, and understandable.

---

## 2. System Architecture Overview

### 2.1 Core Hierarchy

```
VEHICLE (arranger_entity_id)
  └── DEAL (arranger_entity_id, vehicle_id)
        └── TERM SHEET (fee limits: subscription %, management %, performance %)
              └── FEE PLAN (entity-specific: introducer OR partner OR commercial partner)
                    └── FEE COMPONENTS (subscription, management, performance, spread, etc.)
                          └── Used at DISPATCH to assign to investor
                                └── Creates COMMISSIONS at deal close
```

### 2.2 Arranger Assignment

**Critical Rule**: Arranger is assigned at the VEHICLE level, flows down to deals.

```sql
vehicles.arranger_entity_id → deals.arranger_entity_id → fee_events.payee_arranger_id
```

- All fees ultimately flow to/through the arranger
- Arranger manages introducers, partners, commercial partners
- Arranger approves commission payments

### 2.3 Two Financial Streams

| Stream | Direction | Source | Destination | Tables |
|--------|-----------|--------|-------------|--------|
| **Revenue** | IN | Investors | Arranger/Fund | `fee_events` → `invoices` |
| **Expenses** | OUT | Arranger/Fund | Entities | `*_commissions` tables |

---

## 3. Fee Types - Complete Reference

### 3.1 Fee Type Enumeration

| Fee Type | Code | Description | Who Pays | When Charged |
|----------|------|-------------|----------|--------------|
| **Subscription Fee** | `subscription` | Upfront fee on commitment | Investor | At subscription |
| **Management Fee** | `management` | Annual fee on AUM | Investor | Recurring (quarterly/annual) |
| **Performance Fee** | `performance` | Carried interest on profits | Investor | At exit/redemption |
| **Spread/Markup** | `spread_markup` | Markup on secondary trades | Investor | Per trade |
| **BD Fee** | `bd_fee` | Broker-dealer fee | Investor | At subscription |
| **FINRA Fee** | `finra_fee` | Regulatory fee | Investor | At subscription |
| **Flat Fee** | `flat` | Fixed dollar amount | Investor | Varies |

### 3.2 Who Pays What - Critical Rules

#### INVESTORS PAY:
- ✅ Subscription fees
- ✅ Management fees (recurring)
- ✅ Performance fees (at exit)
- ✅ Spread/markup fees
- ✅ BD fees, FINRA fees

#### INTRODUCERS/PARTNERS/COMMERCIAL PARTNERS:
- ❌ DO NOT PAY any fees
- ✅ RECEIVE commissions based on:
  - `invested_amount` - % of investor's commitment
  - `spread` - % of spread collected
  - `performance_fee` - % of carry earned
  - ❌ **NEVER `management_fee`** - introducers/partners don't get management fee commissions

### 3.3 Commission Basis Types

| Basis Type | Description | Example |
|------------|-------------|---------|
| `invested_amount` | % of investor's funded commitment | 2% of $100K = $2,000 |
| `spread` | % of spread collected on trade | 50% of $500 spread = $250 |
| `performance_fee` | % of performance fees earned | 10% of $50K carry = $5,000 |

---

## 4. Fee Plans - Structure & Rules

### 4.1 Fee Plan Hierarchy

```
FEE PLAN
├── Basic Info
│   ├── name (required)
│   ├── description
│   ├── deal_id (required) ← Links to specific deal
│   └── term_sheet_id (required) ← Derives fee limits
├── Entity Assignment (exactly ONE required)
│   ├── introducer_id
│   ├── partner_id
│   └── commercial_partner_id
├── Fee Components (1 or more)
│   ├── Subscription fee (rate_bps or flat_amount)
│   ├── Performance fee (rate_bps + hurdle + watermark)
│   └── Other fees...
└── Agreement Terms (for introducers/partners)
    ├── agreement_duration_months
    ├── non_circumvention_months
    ├── governing_law
    └── vat_registration_number
```

### 4.2 Fee Plan Status Workflow

```
DRAFT → SENT → PENDING_SIGNATURE → ACCEPTED
                                 ↘ REJECTED

ACCEPTED → can be used for dispatch
REJECTED → cannot be used, create new plan
```

### 4.3 Validation Rules

| Rule | Validation |
|------|------------|
| **Term Sheet Limits** | Fee component rates cannot exceed term sheet limits |
| **Entity Required** | Exactly one of introducer_id, partner_id, commercial_partner_id |
| **Accepted Required** | Only `status = 'accepted'` plans can be assigned at dispatch |
| **No Management for Entities** | Introducers/partners cannot have management fee components |

### 4.4 Fee Plan in Deal Page vs Fees Page

**Deal Page** (current - correct):
- Shows fee plans for ONE deal
- Grouped by entity type
- Has agreement generation
- Has PDF preview/download
- Shows acceptance status

**Fees Page** (current - BROKEN):
- Shows ALL fee plans in flat table
- No agreement generation
- No proper grouping
- Outdated UI

**Fees Page** (target):
- Add deal selector layer
- Match Deal page structure exactly
- Include agreement generation
- Include PDF handling
- Group by: Deal → Entity Type → Fee Plans

---

## 5. Fee Events - Complete Calculation

### 5.1 When Fee Events Are Created

| Trigger | Fee Types Created | Function |
|---------|-------------------|----------|
| **Subscription Committed** | All one-time fees | `calculateSubscriptionFeeEvents()` |
| **Quarterly Accrual** | Management fees | `accrue_quarterly_management_fees()` |
| **Deal/Termsheet Close** | Performance fees | `handleDealClose()` / `handleTermsheetClose()` |

### 5.2 Fee Event Calculation - Subscription Commit

When `subscription.status` changes to `'committed'`:

```typescript
// From subscription-fee-calculator.ts
createFeeEvents():
  1. Commitment (flat) - The investment amount itself
  2. Subscription Fee - commitment × subscription_fee_percent
  3. Management Fee - commitment × management_fee_percent × (days/365)
  4. BD Fee - commitment × bd_fee_percent OR flat amount
  5. FINRA Fee - flat amount
  6. Spread Fee - flat amount
  7. Performance Fee (Tier 1) - estimated based on tier1 %
  8. Performance Fee (Tier 2) - estimated based on tier2 %
```

### 5.3 Fee Event Fields

```sql
fee_events:
  - id, deal_id, investor_id
  - fee_component_id (links to fee_components)
  - fee_type (enum: subscription, management, performance, etc.)
  - allocation_id (→ subscriptions.id, polymorphic)
  - base_amount (what fee is calculated from)
  - rate_bps (rate used, for audit)
  - computed_amount (final fee amount)
  - period_start_date, period_end_date (for recurring)
  - payee_arranger_id (→ arranger_entities.id)
  - status (accrued → invoiced → paid)
  - invoice_id (when invoiced)
```

### 5.4 Management Fee Calculation

```sql
-- Quarterly management fee
management_fee = base_amount × (rate_bps / 10000) × (period_days / 365)

-- Example: $100,000 commitment × 2% × 91 days / 365 = $498.63
```

### 5.5 Performance Fee Calculation

```sql
-- With hurdle rate
profit = exit_proceeds - contributed_capital
hurdle_return = contributed_capital × (hurdle_bps / 10000) × years_held
profit_above_hurdle = profit - hurdle_return

IF profit_above_hurdle > 0:
  performance_fee = profit_above_hurdle × (carry_bps / 10000)
ELSE:
  performance_fee = 0
```

**Tiered Performance Fees:**
- Tier 1: First threshold (e.g., 8% hurdle, 20% carry)
- Tier 2: Above first threshold (e.g., 25% carry above 15% return)
- High Water Mark: Don't charge carry on previously-achieved peaks
- Catchup: Accelerated carry until manager catches up to LP returns

---

## 6. Commissions - Entity Payment Structure

### 6.1 Commission Creation

**Trigger**: Deal close OR termsheet close

```typescript
// From deal-close-handler.ts
handleTermsheetClose() / handleDealClose():
  For each funded subscription with referrer:
    1. Get deal_membership.referred_by_entity_id
    2. Get deal_membership.assigned_fee_plan_id
    3. Get subscription fee component from fee plan
    4. Calculate: accrual_amount = funded_amount × rate_bps / 10000
    5. Create commission record (status = 'accrued')
    6. Send notification to entity
```

### 6.2 Commission Tables

Three parallel tables with identical structure:

| Table | Entity FK | Purpose |
|-------|-----------|---------|
| `introducer_commissions` | `introducer_id` | Commissions to introducers |
| `partner_commissions` | `partner_id` | Commissions to partners |
| `commercial_partner_commissions` | `commercial_partner_id` | Commissions to commercial partners |

**Common Fields:**
```sql
- id, {entity}_id, deal_id, investor_id
- arranger_id (who manages this commission)
- fee_plan_id (which fee plan was used)
- basis_type ('invested_amount' | 'spread' | 'performance_fee')
- rate_bps, base_amount, accrual_amount
- currency (default 'USD')
- status ('accrued' → 'invoice_requested' → 'invoiced' → 'paid')
- invoice_id, paid_at, payment_reference
- approved_by, approved_at
```

### 6.3 Commission Workflow

```
ACCRUED (auto-created at close)
    ↓ Arranger requests invoice
INVOICE_REQUESTED
    ↓ Entity uploads invoice
INVOICED
    ↓ Payment confirmed
PAID
```

### 6.4 Commission vs Fee Event - Key Difference

| Aspect | Fee Events | Commissions |
|--------|------------|-------------|
| **Direction** | Money FROM investors | Money TO entities |
| **Created** | On subscription commit | On deal close |
| **Invoiced** | To investors | By entities (they send invoice) |
| **Tables** | `fee_events` | `*_commissions` |
| **Reconciliation** | Match bank deposits | Track outgoing payments |

---

## 7. Schedule - Unified Fee Forecast

### 7.1 Current State (BROKEN)

- Only shows investor recurring fees
- Doesn't show entity commission schedules
- Missing management fee projections

### 7.2 Target State

**Three Sections:**

1. **Investor Fee Schedule**
   - Upcoming management fees (quarterly/annual)
   - Upcoming performance fee events (at exit)
   - Grouped by deal → investor

2. **Introducer Commission Schedule**
   - Upcoming commission payments
   - Based on fee plan frequency
   - Grouped by introducer → deal

3. **Partner/Commercial Partner Commission Schedule**
   - Same structure as introducer
   - Separate section for each entity type

### 7.3 Data Sources

```sql
-- Investor fees: Query fee_events with future period dates
SELECT * FROM fee_events
WHERE status = 'accrued'
  AND period_start_date > NOW()
ORDER BY period_start_date;

-- Commissions: Query commission tables
SELECT * FROM introducer_commissions
WHERE status IN ('accrued', 'invoice_requested')
ORDER BY created_at;
```

---

## 8. Reconciliation - Expected vs Actual

### 8.1 Purpose

Reconciliation verifies that:
1. **Investor payments** match expected fee_events
2. **Commission payments** match accrued commissions
3. **Bank transactions** are properly attributed

### 8.2 Reconciliation Flow

```
EXPECTED (from fee_events/invoices)
    ↓ Compare
ACTUAL (from bank_transactions)
    ↓ Match
RECONCILED (confirmed, discrepancies noted)
```

### 8.3 Match Types

| Type | Description |
|------|-------------|
| `exact` | Amount matches exactly |
| `partial` | Payment less than expected |
| `combined` | Multiple transactions → one invoice |
| `split` | One transaction → multiple invoices |
| `manual` | Staff manually matched |

### 8.4 Discrepancy Types

- Bank fees
- Wire transfer fees
- Currency conversion
- Partial payment
- Amount error
- Duplicate entry

### 8.5 Reconciliation Views

**Lawyer Reconciliation** (`/lawyer-reconciliation`):
- Fee payments tab: Partner/introducer invoices pending
- Introducer fees tab: Introducer commission status
- Subscriptions tab: Investor subscription status

**Arranger Reconciliation** (`/arranger-reconciliation`):
- Introducers tab: All introducer commissions
- Partners tab: All partner commissions
- Commercial Partners tab: All commercial partner commissions

**Staff Reconciliation** (`/reconciliation`):
- Bank transaction import
- Auto-matching engine
- Manual match interface
- Discrepancy resolution

---

## 9. Dashboard - Required KPIs

### 9.1 Current State (BROKEN)

- Only shows investor fee metrics
- Missing commission metrics
- Some data not loading correctly

### 9.2 Target State - Dual View

```
┌─────────────────────────────────────────────────────────────┐
│ FINANCIAL DASHBOARD                                          │
├─────────────────────────┬───────────────────────────────────┤
│ REVENUE (from investors)│ EXPENSES (to entities)            │
├─────────────────────────┼───────────────────────────────────┤
│ Total Fees YTD: $X.XX   │ Total Commissions: $X.XX          │
│ Outstanding: $X.XX      │ ├── Introducers: $X.XX            │
│ Overdue: $X.XX          │ ├── Partners: $X.XX               │
│ Upcoming (30d): $X.XX   │ └── Commercial Partners: $X.XX    │
│                         │                                    │
│ [By Fee Type]           │ Paid YTD: $X.XX                   │
│ • Subscription: $X.XX   │ Pending Invoice: $X.XX            │
│ • Management: $X.XX     │                                    │
│ • Performance: $X.XX    │ [View Reconciliation →]           │
│ • Spread: $X.XX         │                                    │
└─────────────────────────┴───────────────────────────────────┘
```

### 9.3 API Requirements

**Existing**: `/api/staff/fees/dashboard` - returns investor fee metrics

**Needed**: Add commission summary:
```typescript
{
  commission_summary: {
    total_owed: number,
    total_accrued: number,
    total_invoiced: number,
    total_paid_ytd: number,
    by_entity_type: {
      introducer: { owed, paid },
      partner: { owed, paid },
      commercial_partner: { owed, paid }
    }
  }
}
```

---

## 10. Invoices - Investor Billing

### 10.1 Invoice Generation Flow

```
fee_events (status = 'accrued')
    ↓ Select events to invoice
Generate Invoice
    ↓ Create invoice + invoice_lines
    ↓ Update fee_events (status = 'invoiced')
    ↓ Send to n8n for PDF
    ↓ Email to investor
Invoice (status = 'sent')
    ↓ Payment received
    ↓ Bank reconciliation
Invoice (status = 'paid')
```

### 10.2 Invoice Structure

```sql
invoices:
  - invoice_number (unique: INV-YYYY-NNNN)
  - investor_id, deal_id
  - subtotal, tax, total
  - balance_due (computed: total - paid_amount)
  - status (draft → sent → paid | partially_paid | overdue)
  - match_status (unmatched → partially_matched → matched)

invoice_lines:
  - invoice_id, fee_event_id (direct link!)
  - kind (fee | spread | custom)
  - description, quantity, unit_price, amount
```

### 10.3 Clarification

**Invoices are TO investors only.**

Commissions work differently:
- Entities (introducers/partners) send THEIR invoice to arranger
- Stored as `invoice_url` on commission record
- Uploaded via `/api/commissions/{type}/{id}/invoice`

---

## 11. Implementation Phases

### Phase 1: Fee Plans Tab Rewrite
**Goal**: Match Deal page structure

1. Add deal selector to Fees page
2. Group fee plans by: Deal → Entity Type
3. Port agreement generation from DealFeePlansTab
4. Port PDF preview/download
5. Match status badges and UI

### Phase 2: Fee Event Calculation Fix
**Goal**: Calculate all fee types correctly

1. Audit `subscription-fee-calculator.ts`
2. Fix management fee recurring calculation
3. Fix performance fee tiered calculation
4. Ensure spread fees are calculated
5. Link fee_events to payee_arranger_id

### Phase 3: Schedule Tab Enhancement
**Goal**: Unified fee forecast for all entity types

1. Add investor fee schedule (existing, verify)
2. Add introducer commission schedule
3. Add partner commission schedule
4. Add commercial partner commission schedule
5. Add filtering by deal, entity, date range

### Phase 4: Dashboard Fix
**Goal**: Show both revenue and expenses

1. Add commission KPIs section
2. Show by-entity-type breakdown
3. Fix any broken data queries
4. Add navigation links to reconciliation

### Phase 5: Reconciliation Update
**Goal**: Reflect new commission structure

1. Update lawyer-reconciliation for commission tracking
2. Verify arranger-reconciliation matches new structure
3. Add summary reconciliation view
4. Ensure all entity types covered

### Phase 6: Invoices Audit
**Goal**: Verify calculations are correct

1. Audit invoice generation accuracy
2. Verify fee_event totals match invoice totals
3. Add discrepancy warnings
4. Clarify UI (rename to "Investor Invoices")

---

## 12. Data Model Reference

### 12.1 Key Tables

| Table | Purpose |
|-------|---------|
| `vehicles` | Funds, has `arranger_entity_id` |
| `deals` | Investment opportunities, linked to vehicle |
| `deal_fee_structures` | Term sheets with fee limits |
| `fee_plans` | Commercial agreements with entities |
| `fee_components` | Individual fee definitions |
| `subscriptions` | Investor commitments |
| `deal_memberships` | Investor ↔ Deal assignments with fee plan |
| `fee_events` | Calculated fees owed by investors |
| `invoices` | Bills to investors |
| `invoice_lines` | Line items linking to fee_events |
| `introducer_commissions` | Commissions owed to introducers |
| `partner_commissions` | Commissions owed to partners |
| `commercial_partner_commissions` | Commissions owed to commercial partners |
| `bank_transactions` | Imported bank data |
| `reconciliation_matches` | Confirmed matches |

### 12.2 Key Relationships

```
Vehicle (arranger_entity_id)
  └── Deal (vehicle_id, arranger_entity_id)
        ├── Term Sheet (deal_id)
        │     └── Fee Plan (term_sheet_id, deal_id, entity_id)
        │           └── Fee Components (fee_plan_id)
        └── Subscriptions (deal_id, investor_id)
              ├── Fee Events (allocation_id → subscription.id)
              └── Deal Memberships (assigned_fee_plan_id, referred_by_entity_id)
                    └── Commissions (created at close)
```

---

## 13. Validation Checklist

### 13.1 Fee Plan Validations
- [ ] Plan has name
- [ ] Plan linked to deal
- [ ] Plan linked to term sheet
- [ ] Plan has exactly one entity (introducer/partner/commercial partner)
- [ ] Component rates don't exceed term sheet limits
- [ ] No management fee components for entity fee plans
- [ ] Status is 'accepted' before dispatch

### 13.2 Fee Event Validations
- [ ] All fee types calculated on commit
- [ ] Management fees have correct period dates
- [ ] Performance fees respect hurdle rates
- [ ] payee_arranger_id is set
- [ ] No duplicate fee events for same subscription

### 13.3 Commission Validations
- [ ] Created only for funded subscriptions
- [ ] Created only for subscriptions with referrers
- [ ] Rate matches assigned fee plan
- [ ] arranger_id is set
- [ ] fee_plan_id is set

### 13.4 Reconciliation Validations
- [ ] All invoices have match_status
- [ ] Bank transactions categorized
- [ ] Discrepancies noted and typed
- [ ] Commission payments tracked separately

---

## 14. Success Metrics

| Metric | Target |
|--------|--------|
| Fee calculation accuracy | 100% |
| Commission creation on close | 100% automated |
| Invoice match rate | >95% auto-matched |
| Dashboard data accuracy | Real-time, no stale data |
| User confusion on fees page | Eliminated |

---

## 15. Open Questions

1. **Performance fee frequency**: Should performance fees be accrued quarterly or only at exit?
2. **Commission frequency**: Are there recurring commissions (e.g., annual placement fee)?
3. **Multi-currency**: How should currency conversion be handled in reconciliation?
4. **Partial funding**: How are fees calculated for partially funded subscriptions?

---

## Appendix A: Fee Calculation Examples

### A.1 Subscription Fee
```
Commitment: $100,000
Rate: 200 bps (2%)
Fee: $100,000 × 0.02 = $2,000
```

### A.2 Management Fee (Quarterly)
```
AUM: $100,000
Rate: 200 bps (2% per annum)
Period: 91 days (Q1)
Fee: $100,000 × 0.02 × (91/365) = $498.63
```

### A.3 Performance Fee (with hurdle)
```
Contributed Capital: $100,000
Exit Proceeds: $150,000
Profit: $50,000
Hurdle: 800 bps (8%) over 2 years = $16,000
Profit Above Hurdle: $50,000 - $16,000 = $34,000
Carry Rate: 2000 bps (20%)
Performance Fee: $34,000 × 0.20 = $6,800
```

### A.4 Introducer Commission
```
Funded Amount: $100,000
Fee Plan Rate: 200 bps (2%)
Commission: $100,000 × 0.02 = $2,000
Status: accrued (pending invoice from introducer)
```

---

## Appendix B: Status Enums

### Fee Plan Status
- `draft` - Created, not sent
- `sent` - Sent to entity for review
- `pending_signature` - Awaiting digital signature
- `accepted` - Entity confirmed
- `rejected` - Entity declined
- `archived` - No longer active

### Fee Event Status
- `accrued` - Calculated, ready to invoice
- `invoiced` - Invoice generated
- `paid` - Payment confirmed
- `waived` - Fee forgiven
- `disputed` - Under dispute
- `cancelled` - Fee cancelled

### Commission Status
- `accrued` - Created at close
- `invoice_requested` - Arranger requested invoice
- `invoiced` - Entity submitted invoice
- `paid` - Payment sent
- `cancelled` - Commission cancelled

### Invoice Status
- `draft` - Not sent
- `sent` - Sent to investor
- `paid` - Fully paid
- `partially_paid` - Partial payment received
- `overdue` - Past due date
- `disputed` - Under dispute
- `cancelled` - Cancelled

---

*End of PRD*
