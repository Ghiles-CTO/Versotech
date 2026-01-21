# PRD: Fee System Redesign

## Document Info
- **Version**: 2.0
- **Date**: 2026-01-20
- **Status**: Ready for Implementation
- **Author**: System Analysis

---

## Introduction

The Versotech fee system manages two parallel financial streams:

1. **Revenue Stream** (Money IN): Fees collected FROM investors
2. **Expense Stream** (Money OUT): Commissions paid TO introducers/partners/commercial partners

The current implementation has structural inconsistencies between the Deal page and Fees page, incomplete fee event calculations, and a reconciliation system that doesn't reflect the multi-entity commission structure. This redesign will unify the system to be consistent, accurate, and understandable.

---

## Goals

- Unify the Fees page UI to match the Deal page fee plan structure
- Fix fee event calculations for all fee types (subscription, management, performance, spread)
- Create a unified fee forecast schedule showing both investor fees and entity commissions
- Add commission KPIs to the financial dashboard alongside revenue metrics
- Update reconciliation views to support the multi-entity commission structure
- Achieve 100% accuracy in fee and commission calculations

---

## User Stories

### Phase 1: Fee Plans Tab Rewrite

#### US-001: Add Deal Selector to Fees Page
**Description:** As a staff member, I want to select a deal on the Fees page so that I can view fee plans scoped to that specific deal.

**Acceptance Criteria:**
- [ ] Deal selector dropdown at top of Fees page
- [ ] Dropdown shows all deals user has access to
- [ ] Selecting a deal filters all fee plans to that deal
- [ ] Default to no selection with prompt "Select a deal to view fee plans"
- [ ] URL updates with deal query param (`/fees?deal_id=xxx`)
- [ ] Typecheck passes (`npm run build`)
- [ ] Verify in browser using dev-browser skill

---

#### US-002: Group Fee Plans by Entity Type
**Description:** As a staff member, I want fee plans grouped by entity type (Introducer, Partner, Commercial Partner) so I can easily find and manage them.

**Acceptance Criteria:**
- [ ] Fee plans grouped into 3 collapsible sections: Introducers, Partners, Commercial Partners
- [ ] Each section shows count of fee plans (e.g., "Introducers (3)")
- [ ] Empty sections show "No fee plans" message
- [ ] Groups match the structure on Deal page's Fee Plans tab
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

#### US-003: Port Agreement Generation to Fees Page
**Description:** As a staff member, I want to generate introducer/partner agreements from the Fees page so I don't have to navigate to the Deal page.

**Acceptance Criteria:**
- [ ] "Generate Agreement" button on each fee plan card
- [ ] Button disabled for plans without required entity data
- [ ] Clicking button calls existing `/api/staff/fees/plans/[id]/generate-agreement` endpoint
- [ ] Shows loading spinner during generation
- [ ] On success, shows toast "Agreement generated" and refreshes plan status
- [ ] On error, shows error toast with message
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

#### US-004: Port PDF Preview/Download to Fees Page
**Description:** As a staff member, I want to preview and download agreement PDFs from the Fees page so I can review terms without navigating away.

**Acceptance Criteria:**
- [ ] "Preview PDF" button on fee plans with generated agreements
- [ ] Clicking opens PDF in modal viewer (reuse existing `PdfViewer` component)
- [ ] "Download PDF" button downloads the file
- [ ] Buttons hidden for plans without generated PDFs
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

#### US-005: Match Fee Plan Status Badges
**Description:** As a staff member, I want consistent status badges on the Fees page so I can quickly see plan states.

**Acceptance Criteria:**
- [ ] Status badge on each fee plan card
- [ ] Badge colors match Deal page: Draft (gray), Sent (blue), Pending Signature (yellow), Accepted (green), Rejected (red)
- [ ] Badge shows status text (e.g., "Accepted")
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### Phase 2: Fee Event Calculation Fix

#### US-006: Audit and Fix Subscription Fee Calculation
**Description:** As a developer, I need to verify subscription fees are calculated correctly so investors are charged the right amount.

**Acceptance Criteria:**
- [ ] Review `subscription-fee-calculator.ts` for calculation logic
- [ ] Subscription fee = `commitment × (subscription_fee_bps / 10000)`
- [ ] Fee event created with `fee_type = 'subscription'`
- [ ] `base_amount` set to commitment value
- [ ] `rate_bps` set to the rate used
- [ ] `computed_amount` set to calculated fee
- [ ] Add unit test for subscription fee calculation
- [ ] Typecheck passes

---

#### US-007: Fix Management Fee Recurring Calculation
**Description:** As a developer, I need management fees calculated correctly with proper period dates so quarterly fees are accurate.

**Acceptance Criteria:**
- [ ] Management fee = `base_amount × (rate_bps / 10000) × (period_days / 365)`
- [ ] `period_start_date` and `period_end_date` set correctly for each period
- [ ] Fee events created for each quarter in `accrue_quarterly_management_fees()`
- [ ] Pro-rata calculation for partial periods
- [ ] Add unit test for management fee with 91-day period ($100K × 2% × 91/365 = $498.63)
- [ ] Typecheck passes

---

#### US-008: Fix Performance Fee Tiered Calculation
**Description:** As a developer, I need performance fees to respect hurdle rates and tiers so carried interest is calculated correctly.

**Acceptance Criteria:**
- [ ] Calculate profit = `exit_proceeds - contributed_capital`
- [ ] Calculate hurdle_return = `contributed_capital × (hurdle_bps / 10000) × years_held`
- [ ] Profit above hurdle = `profit - hurdle_return`
- [ ] Performance fee = `profit_above_hurdle × (carry_bps / 10000)` (only if positive)
- [ ] Support tiered rates (Tier 1 and Tier 2)
- [ ] Add unit test: $100K capital, $150K exit, 8% hurdle, 2 years, 20% carry = $6,800
- [ ] Typecheck passes

---

#### US-009: Calculate Spread/Markup Fees
**Description:** As a developer, I need spread fees calculated and recorded so secondary trade markups are tracked.

**Acceptance Criteria:**
- [ ] Spread fee event created when spread is applied to trade
- [ ] `fee_type = 'spread_markup'`
- [ ] `computed_amount` = spread amount from trade
- [ ] Fee event linked to subscription via `allocation_id`
- [ ] Typecheck passes

---

#### US-010: Link Fee Events to Arranger
**Description:** As a developer, I need fee events linked to the arranger so revenue flows are properly attributed.

**Acceptance Criteria:**
- [ ] `payee_arranger_id` field populated on all new fee events
- [ ] Value derived from `deals.arranger_entity_id`
- [ ] Migration to backfill existing fee events with NULL `payee_arranger_id`
- [ ] Typecheck passes

---

### Phase 3: Schedule Tab Enhancement

#### US-011: Verify Investor Fee Schedule
**Description:** As a staff member, I want to see upcoming investor fees (management, performance) so I can forecast revenue.

**Acceptance Criteria:**
- [ ] "Investor Fees" section in Schedule tab
- [ ] Shows fee events with `status = 'accrued'` and future `period_start_date`
- [ ] Columns: Deal, Investor, Fee Type, Amount, Period Start, Period End
- [ ] Sortable by date
- [ ] Grouped by deal then investor
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

#### US-012: Add Introducer Commission Schedule
**Description:** As a staff member, I want to see upcoming introducer commission payments so I can forecast expenses.

**Acceptance Criteria:**
- [ ] "Introducer Commissions" section in Schedule tab
- [ ] Query `introducer_commissions` where `status IN ('accrued', 'invoice_requested')`
- [ ] Columns: Introducer Name, Deal, Investor, Amount, Status, Created Date
- [ ] Grouped by introducer then deal
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

#### US-013: Add Partner Commission Schedule
**Description:** As a staff member, I want to see upcoming partner commission payments so I can forecast partner expenses.

**Acceptance Criteria:**
- [ ] "Partner Commissions" section in Schedule tab
- [ ] Query `partner_commissions` where `status IN ('accrued', 'invoice_requested')`
- [ ] Columns: Partner Name, Deal, Investor, Amount, Status, Created Date
- [ ] Grouped by partner then deal
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

#### US-014: Add Commercial Partner Commission Schedule
**Description:** As a staff member, I want to see upcoming commercial partner commission payments so I can forecast all commission expenses.

**Acceptance Criteria:**
- [ ] "Commercial Partner Commissions" section in Schedule tab
- [ ] Query `commercial_partner_commissions` where `status IN ('accrued', 'invoice_requested')`
- [ ] Columns: Commercial Partner Name, Deal, Investor, Amount, Status, Created Date
- [ ] Grouped by commercial partner then deal
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

#### US-015: Add Schedule Filtering
**Description:** As a staff member, I want to filter the schedule by deal, entity, and date range so I can focus on relevant data.

**Acceptance Criteria:**
- [ ] Deal filter dropdown (multi-select)
- [ ] Entity filter dropdown (multi-select, shows all introducers/partners/commercial partners)
- [ ] Date range picker (from/to)
- [ ] Filters apply to all sections
- [ ] Filters persist in URL query params
- [ ] "Clear filters" button
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### Phase 4: Dashboard Fix

#### US-016: Add Commission KPIs Section
**Description:** As a staff member, I want to see commission expense metrics alongside revenue so I have a complete financial picture.

**Acceptance Criteria:**
- [ ] New "Commissions" section on dashboard (right side of dual layout)
- [ ] Shows: Total Commissions Owed, Total Paid YTD, Pending Invoice
- [ ] Data from aggregating all 3 commission tables
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

#### US-017: Show Commission Breakdown by Entity Type
**Description:** As a staff member, I want to see commission totals broken down by entity type so I know where expenses are going.

**Acceptance Criteria:**
- [ ] Within Commissions section, show breakdown:
  - Introducers: $X.XX
  - Partners: $X.XX
  - Commercial Partners: $X.XX
- [ ] Each shows owed amount
- [ ] Clickable to navigate to respective reconciliation view
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

#### US-018: Fix Dashboard Data Queries
**Description:** As a developer, I need to audit and fix dashboard API queries so data loads correctly.

**Acceptance Criteria:**
- [ ] Audit `/api/staff/fees/dashboard` endpoint
- [ ] Verify all investor fee metrics return correct values
- [ ] Add commission_summary to response:
  ```typescript
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
  ```
- [ ] Add integration test for dashboard endpoint
- [ ] Typecheck passes

---

#### US-019: Add Reconciliation Navigation
**Description:** As a staff member, I want quick links to reconciliation views from the dashboard so I can investigate discrepancies.

**Acceptance Criteria:**
- [ ] "View Reconciliation →" link in Commissions section
- [ ] Link navigates to `/arranger-reconciliation`
- [ ] "View Invoices →" link in Revenue section
- [ ] Link navigates to `/reconciliation`
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### Phase 5: Reconciliation Update

#### US-020: Update Lawyer Reconciliation for Commission Tracking
**Description:** As a lawyer, I want to see all commission statuses in my reconciliation view so I can track pending payments.

**Acceptance Criteria:**
- [ ] "Commission Status" tab in lawyer reconciliation
- [ ] Shows all commissions from all 3 tables
- [ ] Columns: Entity Type, Entity Name, Deal, Investor, Amount, Status, Invoice URL
- [ ] Filter by status (Accrued, Invoice Requested, Invoiced, Paid)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

#### US-021: Verify Arranger Reconciliation Structure
**Description:** As an arranger, I want separate tabs for each entity type so I can manage commissions efficiently.

**Acceptance Criteria:**
- [ ] Three tabs: Introducers, Partners, Commercial Partners
- [ ] Each tab queries respective commission table
- [ ] Columns: Entity Name, Deal, Investor, Amount, Basis Type, Rate, Status
- [ ] Action buttons: Request Invoice, Mark Paid
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

#### US-022: Add Summary Reconciliation View
**Description:** As a staff member, I want a summary view showing overall reconciliation status so I can quickly assess financial health.

**Acceptance Criteria:**
- [ ] Summary section at top of reconciliation page
- [ ] Shows: Total Outstanding, Total Matched, Total Unmatched
- [ ] Pie chart or progress bar showing match percentage
- [ ] Updated in real-time as matches are made
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### Phase 6: Invoices Audit

#### US-023: Audit Invoice Generation Accuracy
**Description:** As a developer, I need to verify invoice amounts match fee event totals so investors are billed correctly.

**Acceptance Criteria:**
- [ ] Review invoice generation flow in `/api/staff/invoices`
- [ ] Verify: `invoice.total = SUM(fee_events.computed_amount)` for linked events
- [ ] Add validation that warns if totals don't match
- [ ] Add unit test for invoice generation
- [ ] Typecheck passes

---

#### US-024: Add Invoice Discrepancy Warnings
**Description:** As a staff member, I want to see warnings when invoice amounts don't match expected fees so I can investigate.

**Acceptance Criteria:**
- [ ] Warning badge on invoices where `total != SUM(linked fee_events)`
- [ ] Clicking badge shows discrepancy details
- [ ] Warning appears in invoice list view
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

#### US-025: Clarify Invoice UI Labeling
**Description:** As a staff member, I want clear labeling that invoices are for investors so there's no confusion with entity invoices.

**Acceptance Criteria:**
- [ ] Rename page title to "Investor Invoices"
- [ ] Add helper text: "Invoices sent to investors for fee collection"
- [ ] Entity invoice uploads handled in separate commission flow
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

## Functional Requirements

### Fee Plans
- **FR-1**: The Fees page must include a deal selector dropdown that filters all displayed fee plans
- **FR-2**: Fee plans must be grouped by entity type (Introducer, Partner, Commercial Partner)
- **FR-3**: Each fee plan card must display status badge matching Deal page styling
- **FR-4**: Staff must be able to generate agreements directly from the Fees page
- **FR-5**: Staff must be able to preview and download agreement PDFs from the Fees page

### Fee Events
- **FR-6**: Subscription fees must be calculated as `commitment × (rate_bps / 10000)`
- **FR-7**: Management fees must be calculated as `base × (rate_bps / 10000) × (days / 365)`
- **FR-8**: Performance fees must respect hurdle rates before applying carry
- **FR-9**: All fee events must have `payee_arranger_id` populated from deal's arranger
- **FR-10**: Fee events must not be duplicated for the same subscription and fee type

### Schedule
- **FR-11**: Schedule must show upcoming investor fees grouped by deal and investor
- **FR-12**: Schedule must show upcoming commissions for all three entity types
- **FR-13**: Schedule must support filtering by deal, entity, and date range

### Dashboard
- **FR-14**: Dashboard must display both revenue (investor fees) and expense (commissions) metrics
- **FR-15**: Commission metrics must be broken down by entity type
- **FR-16**: Dashboard must provide navigation links to reconciliation views

### Reconciliation
- **FR-17**: Lawyer reconciliation must show commission tracking across all entity types
- **FR-18**: Arranger reconciliation must have separate tabs for each entity type
- **FR-19**: Reconciliation must show summary statistics (matched/unmatched totals)

### Invoices
- **FR-20**: Invoice totals must equal the sum of linked fee event amounts
- **FR-21**: System must warn when invoice totals don't match expected fee totals
- **FR-22**: Invoice UI must clearly label these as "Investor Invoices"

---

## Non-Goals (Out of Scope)

- **Multi-currency support**: All calculations remain in USD; currency conversion is a future enhancement
- **Automated commission payout**: System tracks commissions but doesn't initiate payments
- **Performance fee accrual**: Performance fees calculated only at exit, not quarterly
- **Commission frequency variations**: Assumes one-time commissions, not recurring
- **Mobile-responsive redesign**: Focus on desktop staff portal experience
- **Audit log for fee changes**: Existing audit system handles this separately
- **Email notifications for fee events**: Out of scope for this phase

---

## Technical Considerations

### Existing Components to Reuse
- `PdfViewer` component for agreement preview
- `StatusBadge` component for plan status display
- `DealFeePlansTab` logic for agreement generation
- Existing commission table structures (no schema changes needed)

### API Endpoints to Modify
- `GET /api/staff/fees/dashboard` - Add commission_summary
- `GET /api/staff/fees/plans` - Add deal filtering
- `GET /api/staff/fees/schedule` - Add commission queries

### Database Considerations
- Backfill migration needed for `fee_events.payee_arranger_id`
- No new tables required
- Index recommendations for commission table queries

### Performance Requirements
- Dashboard must load in <2 seconds
- Schedule with 1000+ records must remain responsive
- Use pagination for large commission lists

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Fee calculation accuracy | 100% | Automated tests pass |
| Commission creation on close | 100% automated | No manual commission entries needed |
| Invoice match rate | >95% auto-matched | Reconciliation metrics |
| Dashboard data accuracy | Real-time | No stale data complaints |
| User confusion on fees page | Eliminated | Zero support tickets about fees page |
| Page load time | <2 seconds | Performance monitoring |

---

## Open Questions

1. **Performance fee frequency**: Should performance fees be accrued quarterly or only at exit?
   - *Current assumption: Only at exit*

2. **Commission frequency**: Are there recurring commissions (e.g., annual placement fee)?
   - *Current assumption: One-time at deal close*

3. **Partial funding**: How should fees be calculated for partially funded subscriptions?
   - *Current assumption: Based on funded amount, not committed amount*

4. **High water mark tracking**: How should high water marks be stored for performance fee calculations?
   - *Needs clarification before implementing US-008*

---

## Appendix: Key Domain Concepts

### Fee Types (Charged TO Investors)
| Fee Type | Code | When Charged |
|----------|------|--------------|
| Subscription Fee | `subscription` | At subscription commit |
| Management Fee | `management` | Quarterly/Annual |
| Performance Fee | `performance` | At exit/redemption |
| Spread/Markup | `spread_markup` | Per trade |
| BD Fee | `bd_fee` | At subscription |
| FINRA Fee | `finra_fee` | At subscription |

### Commission Basis Types (Paid TO Entities)
| Basis Type | Description |
|------------|-------------|
| `invested_amount` | % of investor's funded commitment |
| `spread` | % of spread collected on trade |
| `performance_fee` | % of performance fees earned |

### Status Workflows

**Fee Plan:**
```
DRAFT → SENT → PENDING_SIGNATURE → ACCEPTED
                                 ↘ REJECTED
```

**Fee Event:**
```
ACCRUED → INVOICED → PAID
                   ↘ DISPUTED
```

**Commission:**
```
ACCRUED → INVOICE_REQUESTED → INVOICED → PAID
```

---

*End of PRD*
