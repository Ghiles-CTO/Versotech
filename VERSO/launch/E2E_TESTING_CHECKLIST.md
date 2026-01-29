# Versotech E2E Testing Checklist

Use this checklist alongside `E2E_PROCESS_DOCUMENTATION.md` to systematically test all processes.

---

## Pre-Testing Setup

- [ ] Dev server running: `cd versotech-portal && npm run dev`
- [ ] Browser ready for testing (use `/agent-browser` skill)
- [ ] Test credentials accessible (see reference below)
- [ ] Database accessible via Supabase MCP

---

## Test Execution Order

The processes must be tested in order due to dependencies:

```
Process 1 (Deal Creation)
    ↓
Process 2A/2B/2C (Fee Plans) ← can run in parallel
    ↓
Process 3 (Deal Dispatch) ← requires Process 1 + 2A
    ↓
Process 4 (Interest & NDA)
    ↓
Process 5 (Data Room Access)
    ↓
Process 6 (Subscription)
    ↓
Process 7 (Subscription Pack Signing)
    ↓
Process 8 (Escrow Funding)
    ↓
Process 9 (Deal Close)
    ↓
Process 10 (Certificate) ← parallel with Process 11
Process 11 (Commission)
    ↓
Process 12 (Portfolio View)
```

---

## Process 1: Deal & Term Sheet Creation
**Login:** `cto@versoholdings.com` / `123123`

### Deal Creation
- [ ] Navigate to `/versotech_main/deals/new`
- [ ] Fill required fields:
  - [ ] name
  - [ ] company_name
  - [ ] deal_type (Secondary/Primary/Credit/Other)
  - [ ] stock_type (Common/Preferred/Convertible/etc.)
  - [ ] vehicle_id
  - [ ] currency (USD/EUR/GBP)
- [ ] Submit deal
- [ ] Verify status: `draft`
- [ ] Record deal_id: _______________

### Term Sheet Creation
- [ ] Navigate to deal detail page
- [ ] Create term sheet
- [ ] Configure:
  - [ ] `structure` (product description)
  - [ ] `completion_date`
  - [ ] `subscription_fee_percent`
  - [ ] `fee_components` (subscription, performance, management)
- [ ] Publish term sheet
- [ ] Verify status: `published`

---

## Process 2A: Introducer Fee Plan & Agreement
**Arranger Login:** `sales@aisynthesis.de` / `TempPass123!`
**Introducer Login:** `py.moussaouighiles@gmail.com` / `TestIntro2024!`

### Create Fee Plan (as Arranger)
- [ ] Navigate to `/versotech_main/fee-plans`
- [ ] Create fee plan with:
  - [ ] `deal_id` (from Process 1)
  - [ ] `introducer_id`
  - [ ] `fee_components`
- [ ] Verify status: `draft`
- [ ] Send to introducer
- [ ] Verify status: `sent`

### Accept Fee Plan (as Introducer)
- [ ] Login as Introducer
- [ ] Verify notification received
- [ ] Accept fee plan
- [ ] Verify status: `accepted`
- [ ] Verify `accepted_at`, `accepted_by` set

### Generate & Sign Agreement
- [ ] Login as Arranger
- [ ] Generate introducer agreement from fee plan
- [ ] Verify `introducer_agreements` record created
- [ ] Sign agreement (party_a)
- [ ] Login as Introducer
- [ ] Verify signing task in VERSOSign
- [ ] Sign agreement (party_b)
- [ ] Verify ALL `introducer_users` with `can_sign=true` signed
- [ ] Verify agreement status: `active`

---

## Process 2B: Partner Fee Plan
**Arranger Login:** `sales@aisynthesis.de` / `TempPass123!`
**Partner Login:** `cto@verso-operation.com` / `VersoPartner2024!`

### Create Fee Plan (as Arranger)
- [ ] Navigate to `/versotech_main/fee-plans`
- [ ] Create fee plan with `partner_id`
- [ ] Send to partner

### Accept Fee Plan (as Partner)
- [ ] Login as Partner
- [ ] Verify notification received
- [ ] Accept fee plan
- [ ] Verify status: `accepted`

**Note:** Partner does NOT require agreement signing

---

## Process 2C: Commercial Partner Fee Plan & Placement Agreement
**Arranger Login:** `sales@aisynthesis.de` / `TempPass123!`
**CP Login:** `cm.moussaouighiles@gmail.com` / `CommercialPartner2024!`

### Create Fee Plan (as Arranger)
- [ ] Create fee plan with `commercial_partner_id`
- [ ] Send to commercial partner

### Accept & Sign (as CP)
- [ ] Login as CP
- [ ] Accept fee plan
- [ ] Generate placement agreement
- [ ] Sign agreement
- [ ] CEO countersigns
- [ ] Verify agreement status: `active`

### Verify CP Capabilities
- [ ] View client management section
- [ ] Verify `can_execute_for_clients` capability
- [ ] Check proxy subscription mode dropdown

---

## Process 3: Deal Dispatch to Investors
**Login:** `cto@versoholdings.com` / `123123`

### Direct Dispatch
- [ ] Navigate to deal detail page
- [ ] Click dispatch/share button
- [ ] Select investor: `biz@ghiless.com`
- [ ] Role: `investor`
- [ ] Dispatch
- [ ] Verify `deal_memberships` created with `dispatched_at`

### Dispatch via Introducer
- [ ] Select investor
- [ ] Role: `introducer_investor`
- [ ] Assign `referred_by_entity_id`
- [ ] Assign `assigned_fee_plan_id`
- [ ] Verify: Introducer has active signed agreement
- [ ] Dispatch
- [ ] Verify referral tracking saved

### Verify Investor View
- [ ] Login as `biz@ghiless.com` / `22122003`
- [ ] Verify deal appears in investor pipeline

---

## Process 4: Investor Interest & NDA Signing
**Investor Login:** `biz@ghiless.com` / `22122003`
**Approver Login:** `cto@versoholdings.com` / `123123`

### Submit Interest
- [ ] Navigate to investor dashboard
- [ ] Find dispatched deal
- [ ] Click "Submit Interest for Data Room"
- [ ] Enter indicative amount (optional)
- [ ] Submit interest
- [ ] Verify status: `pending_review`

### Approve Interest
- [ ] Login as Approver
- [ ] Navigate to deal → Interests tab
- [ ] Approve interest
- [ ] Verify NDA generated automatically

### NDA Signing (Multi-Signatory)
- [ ] **Investor signs:**
  - [ ] Login as Investor
  - [ ] Navigate to VERSOSign
  - [ ] Sign NDA
- [ ] **Admin countersigns:**
  - [ ] Login as Approver
  - [ ] Navigate to VERSOSign
  - [ ] Countersign NDA
- [ ] Verify BOTH signatures required before data room access
- [ ] Verify signed PDF in `ndas/{deal_id}/` bucket
- [ ] Verify notification sent to investor

---

## Process 5: Data Room Access
**Login:** `biz@ghiless.com` / `22122003`

- [ ] Navigate to deal data room
- [ ] Verify `deal_data_room_access` record exists
- [ ] Verify folder structure visible
- [ ] Browse documents
- [ ] View document metadata (size, date, uploader)
- [ ] Preview a PDF inline
- [ ] Download a file
- [ ] Verify access expiry date (7 days from NDA)

### Admin Verification
- [ ] Login: `cto@versoholdings.com` / `123123`
- [ ] Verify can see document access activity

---

## Process 6: Subscription Submission & Approval
**Investor Login:** `biz@ghiless.com` / `22122003`
**Approver Login:** `cto@versoholdings.com` / `123123`

### Submit Subscription
- [ ] Navigate to deal
- [ ] Click "Subscribe to Investment Opportunity"
- [ ] Verify capacity display:
  - [ ] target amount
  - [ ] remaining capacity
  - [ ] min/max ticket
- [ ] Enter subscription details:
  - [ ] commitment
  - [ ] currency
  - [ ] effective_date
  - [ ] funding_due_at
- [ ] Submit
- [ ] Verify status: `pending`
- [ ] Verify `subscription_number` auto-generated

### Approve Subscription
- [ ] Login as Approver
- [ ] Navigate to subscription review
- [ ] Review details
- [ ] Approve
- [ ] Verify status: `approved`

### Subscription Pack Generated
- [ ] Verify n8n workflow triggered
- [ ] Verify subscription pack PDF created
- [ ] Verify document `ready_for_signature = true`

---

## Process 7: Subscription Pack Multi-Signatory Signing
**CEO Login:** `cto@versoholdings.com` / `123123`
**Investor Login:** `biz@ghiless.com` / `22122003`

### CEO Signs First (party_b)
- [ ] Login as CEO
- [ ] Navigate to VERSOSign
- [ ] Find subscription pack task
- [ ] Sign on pages 2, 3, 12, 39
- [ ] Verify PDF uploaded with CEO signature

### Investor Signs (party_a)
- [ ] Login as Investor
- [ ] Navigate to VERSOSign
- [ ] Verify CEO has signed first (validation)
- [ ] Sign on pages 2, 12
- [ ] For entity investors: verify ALL signatories must sign
- [ ] Verify auto-commit on completion
- [ ] Verify status: `approved` → `committed`

### Post-Signature Verification
- [ ] Verify fee events created
- [ ] Verify notifications sent
- [ ] Verify document status: `published`

---

## Process 8: Escrow Funding & Lawyer Confirmation
**Investor Login:** `biz@ghiless.com` / `22122003`
**Lawyer Login:** `sales@aisynthesis.de` / `TempPass123!`

### Verify Wire Instructions
- [ ] Login as Investor
- [ ] Verify escrow account details received:
  - [ ] beneficiary
  - [ ] account number
  - [ ] wire instructions
  - [ ] deadline

### Lawyer Confirms Funding
- [ ] Login as Lawyer
- [ ] Navigate to `/versotech_main/reconciliation`
- [ ] View Subscription Reconciliation tab
- [ ] Find subscription
- [ ] Confirm funds received
- [ ] Verify status: `committed` → `funded`

### Verify Reconciliation Tabs
- [ ] Deal Summary - compartment totals
- [ ] Subscription Reconciliation - each investor
- [ ] Partner Fee Payments
- [ ] Introducer Fee Payments

---

## Process 9: Deal Close & Subscription Activation
**Login:** `cto@versoholdings.com` / `123123`

### Trigger Deal Close
- [ ] Option 1: Set deal `close_at` to today (cron triggers)
- [ ] Option 2: Manual trigger via API

### Verify handleDealClose() Actions
- [ ] **Subscription Activation:**
  - [ ] Status: `funded` → `active`
  - [ ] `activated_at` set
  - [ ] `spread_per_share` calculated
- [ ] **Position Creation:**
  - [ ] `positions` record created
  - [ ] `units`, `cost_basis`, `last_nav` populated
- [ ] **Invoice Requests Enabled:**
  - [ ] `fee_plans.invoice_requests_enabled = true`
  - [ ] Notifications sent to introducers/partners
- [ ] **Idempotency:**
  - [ ] `closed_processed_at` set
  - [ ] Re-trigger doesn't duplicate

---

## Process 10: Certificate Generation & Dual-Signature
**CEO Login:** `cto@versoholdings.com` / `123123`
**Lawyer Login:** `sales@aisynthesis.de` / `TempPass123!`

### Certificate Generated
- [ ] Verify certificate triggered on activation
- [ ] Verify certificate number: `VC{series}SH{subscription_number}`
- [ ] Verify document status: `pending_signature`
- [ ] Verify NOT visible to investor yet

### CEO Signs (party_a - LEFT)
- [ ] Login as CEO
- [ ] Navigate to VERSOSign
- [ ] Find certificate task
- [ ] Sign (left position)
- [ ] Verify `unsigned_pdf_path` updated for lawyer

### Lawyer Signs (party_b - RIGHT)
- [ ] Login as Lawyer
- [ ] Navigate to VERSOSign
- [ ] Download CEO-signed PDF
- [ ] Sign (right position)
- [ ] Verify document published

### Final Verification
- [ ] Document status: `published`
- [ ] Investor notification: "Certificate Issued"
- [ ] Lawyer notification: "Certificate Issued"
- [ ] Certificate visible in investor portfolio

---

## Process 11: Commission Accrual & Payment Lifecycle
**Introducer Login:** `py.moussaouighiles@gmail.com` / `TestIntro2024!`
**Lawyer Login:** `sales@aisynthesis.de` / `TempPass123!`

### Commission Accrual
- [ ] Verify commissions auto-created on deal close
- [ ] Verify calculation: `funded_amount × rate_bps / 10000`
- [ ] Verify introducer agreement was active
- [ ] Verify status: `accrued`
- [ ] Verify notifications sent

### Invoice Submission (as Introducer)
- [ ] Login as Introducer
- [ ] Navigate to `/versotech_main/my-commissions`
- [ ] Verify commission visible
- [ ] Submit invoice:
  - [ ] invoice_number
  - [ ] invoice_amount
  - [ ] invoice_attachment (PDF)
- [ ] Verify status: `accrued` → `invoice_submitted`

### Lawyer Approval
- [ ] Login as Lawyer
- [ ] Review invoice
- [ ] Approve
- [ ] Verify status: `invoice_submitted` → `invoiced`

### Payment Confirmation
- [ ] Confirm payment
- [ ] Verify status: `invoiced` → `paid`
- [ ] Verify `paid_at` set
- [ ] Verify notification sent

### Test with Other Entity Types
- [ ] Partner: `cto@verso-operation.com` / `VersoPartner2024!`
- [ ] Commercial Partner: `cm.moussaouighiles@gmail.com` / `CommercialPartner2024!`

---

## Process 12: Portfolio & Holdings View
**Login:** `biz@ghiless.com` / `22122003`

### Position Data
- [ ] Navigate to `/versotech_main/portfolio`
- [ ] Verify position:
  - [ ] units
  - [ ] cost_basis
  - [ ] last_nav
  - [ ] as_of_date

### KPIs
- [ ] Current NAV
- [ ] Total Contributed
- [ ] Total Distributions
- [ ] Unfunded Commitment
- [ ] Cost Basis
- [ ] Unrealized Gain
- [ ] DPI, TVPI, IRR

### Calculations
- [ ] total_value = units × last_nav
- [ ] unrealized_pnl = total_value - cost_basis
- [ ] return_pct

### Visualizations
- [ ] Allocation chart by vehicle/sector
- [ ] NAV performance over time
- [ ] Cash flow chart

### Certificate
- [ ] Certificate visible in portfolio
- [ ] Both signatures present

---

## VERSOSign System Tests

### Signature Request Creation
- [ ] 32-byte token generation
- [ ] Token expiry: 7 days (default)
- [ ] Token expiry: 30 days (certificates)
- [ ] Duplicate prevention

### Signing URL
- [ ] `/versotech_main/versosign?token={token}` loads
- [ ] Document preview works
- [ ] Signature canvas works

### Progressive Signing
- [ ] party_b before party_a (subscription)
- [ ] CEO before lawyer (certificate)
- [ ] Lock mechanism works

### Multi-page Anchors
- [ ] SIG_ANCHOR_* detected
- [ ] Signatures on correct pages

### Staff Dashboard
- [ ] `/versotech/staff/versosign` loads
- [ ] Shows pending tasks
- [ ] Filter by document type

---

## Test Credentials Quick Reference

| Email | Password | Personas |
|-------|----------|----------|
| `cto@versoholdings.com` | `123123` | CEO, Arranger, Introducer, Investor |
| `sales@aisynthesis.de` | `TempPass123!` | Arranger, CP, Introducer, Lawyer, Partner |
| `biz@ghiless.com` | `22122003` | Investor |
| `py.moussaouighiles@gmail.com` | `TestIntro2024!` | Introducer, Investor |
| `cto@verso-operation.com` | `VersoPartner2024!` | Investor, Partner |
| `cm.moussaouighiles@gmail.com` | `CommercialPartner2024!` | Commercial Partner |

---

## Issue Log

| Date | Process | Step | Issue Description | Status |
|------|---------|------|-------------------|--------|
| | | | | |
| | | | | |
| | | | | |

---

## IDs Captured During Testing

| Entity | ID | Notes |
|--------|-----|-------|
| Deal | | Created in Process 1 |
| Term Sheet | | |
| Introducer Fee Plan | | |
| Partner Fee Plan | | |
| CP Fee Plan | | |
| Introducer Agreement | | |
| Subscription | | |
| Certificate | | |
| Commission | | |

---

## Notes

_Use this space for observations during testing:_
