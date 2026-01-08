# VERSO Holdings: End-to-End Money Flow Walkthrough

**Version:** 1.0
**Date:** January 7, 2026
**Purpose:** Concise technical guide to the complete deal lifecycle with money flow, fees, and stakeholder interactions

---

## Executive Summary

This document traces the complete money flow from deal creation through investor exit, covering all fee structures, term sheets, fee plans, and payment triggers involving: **CEO, Arranger, Partner, Introducer, Commercial Partner, Lawyer, and Investor**.

---

## 1. The Deal Lifecycle Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           VERSO DEAL LIFECYCLE                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  PHASE 1          PHASE 2           PHASE 3          PHASE 4          PHASE 5       │
│  SETUP            DISTRIBUTION      SUBSCRIPTION     FUNDING          CLOSING       │
│  ─────────        ────────────      ────────────     ─────────        ─────────     │
│                                                                                      │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐   │
│  │ Create  │  →   │ Fee     │  →   │ Pack    │  →   │ Wire    │  →   │ Deal    │   │
│  │ Deal    │      │ Models  │      │ Signed  │      │ to      │      │ Closes  │   │
│  │ + Term  │      │ Accept  │      │ by All  │      │ Escrow  │      │ + Cert  │   │
│  │ Sheet   │      │ Dispatch│      │ Parties │      │         │      │ + Comm  │   │
│  └─────────┘      └─────────┘      └─────────┘      └─────────┘      └─────────┘   │
│       │                │                │                │                │         │
│       ▼                ▼                ▼                ▼                ▼         │
│  CEO creates       Partners/        Investor,        Investor         Certificates │
│  vehicle +         Introducers      CEO, Lawyer      wires to         issued +     │
│  terms             accept terms     sign pack        lawyer escrow    commissions  │
│                                                                       enabled      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase 1: Deal Setup (CEO)

### 2.1 Create Deal & Vehicle

**Who:** CEO / Staff Admin
**Code:** `src/app/api/deals/route.ts`

```
CEO creates:
├── Deal (Investment Opportunity)
│   ├── company_name: "SpaceX Series B"
│   ├── target_amount: $10,000,000
│   ├── close_at: "2026-03-31"
│   └── status: "draft" → "active"
│
└── Vehicle (SPV/Fund)
    ├── name: "VC106"
    ├── series_number: "106"
    └── registration_number: "12345678"
```

### 2.2 Create & Publish Term Sheet

**Code:** `src/app/api/deals/[id]/fee-structures/route.ts`

The **Term Sheet** is the backbone of every deal. It defines:

```
┌─────────────────────────────────────────────────────────┐
│                    TERM SHEET                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Investment Terms (what investor sees):                  │
│  ├── Minimum Ticket: £50,000                            │
│  ├── Maximum Ticket: £500,000                           │
│  ├── Price Per Share: £1.00                             │
│  └── Closing Date: March 31, 2026                       │
│                                                          │
│  Fee LIMITS (maximum allowed for fee models):            │
│  ├── Subscription Fee: 3% MAX                           │
│  ├── Management Fee: 2% MAX                             │
│  └── Performance Fee: 20% MAX                           │
│                                                          │
│  Status: draft → PUBLISHED                               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key Rule:** Fee Models can ONLY be created after Term Sheet is **PUBLISHED**.

---

## 3. Phase 2: Fee Model Creation & Distribution

### 3.1 Fee Model Hierarchy

```
Term Sheet (defines MAX limits)
     │
     ├── Fee Model A (for Introducer X) ← must be ≤ term sheet limits
     │
     ├── Fee Model B (for Partner Y) ← must be ≤ term sheet limits
     │
     └── Fee Model C (for Commercial Partner Z) ← must be ≤ term sheet limits
```

### 3.2 Fee Model Creation

**Who:** CEO / Arranger
**Code:** `src/app/api/deals/[id]/fee-plans/route.ts`

```
Fee Model for ABC Introducers Ltd:
├── Linked To:
│   ├── Deal: Transform Capital Series A
│   ├── Term Sheet: Version 2 (Published)
│   └── Entity: ABC Introducers Ltd (introducer_id)
│
├── Negotiated Fee Rates (must be ≤ term sheet):
│   ├── Subscription Fee: 2.5% (≤ 3% ✓)
│   ├── Management Fee: 1.5% (≤ 2% ✓)
│   └── Performance Fee: 15% (≤ 20% ✓)
│
└── Status: draft → pending_signature → ACCEPTED
```

### 3.3 Acceptance Workflows

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    PARTNER vs INTRODUCER ACCEPTANCE                       │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  PARTNER FLOW:                      INTRODUCER FLOW:                      │
│  ─────────────                      ────────────────                      │
│                                                                           │
│  1. CEO sends fee model             1. CEO sends fee model                │
│     Status: SENT                       Status: PENDING_SIGNATURE          │
│                                                                           │
│  2. Partner CAN see Term Sheet      2. Introducer CANNOT see Term Sheet   │
│     (full visibility)                  (only sees their fee model)        │
│                                                                           │
│  3. Partner clicks Accept/Reject    3. Introducer signs via VERSOSign    │
│     (no formal agreement)              (formal agreement required)        │
│                                                                           │
│  4. Status: ACCEPTED                4. Status: ACCEPTED + signature       │
│                                        accepted_at, accepted_by stored    │
│                                                                           │
│  ★ ONLY AFTER ACCEPTANCE can investors be dispatched through entity      │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Visibility Rules Matrix

| Information | Investor | Partner | Introducer | CEO/Staff | Lawyer |
|-------------|----------|---------|------------|-----------|--------|
| Term Sheet | ✓ Full | ✓ Full | ✗ Hidden | ✓ Full | ✓ Full |
| Fee Model | ✗ N/A | ✓ Own | ✓ Own | ✓ All | ✗ N/A |
| Data Room | ✓ After NDA | ✓ After NDA | ✗ No | ✓ Always | ✓ Always |
| Accrued Fees | ✗ N/A | ✓ Own | ✓ Own | ✓ All | ✓ All |

---

## 4. Phase 3: Investor Dispatch & Subscription

### 4.1 Dispatch Flow

**Code:** `src/app/api/deals/[id]/dispatch/route.ts`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       INVESTOR DISPATCH                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PREREQUISITE CHECK:                                                     │
│  ├── Fee Model for referring entity = ACCEPTED? ✓                        │
│  └── If not → ERROR: "Fee model must be accepted first"                  │
│                                                                          │
│  DISPATCH CREATES LINKS:                                                 │
│  ┌─────────────────────────────────────────────────────────────┐        │
│  │  INVESTOR: John Smith                                        │        │
│  │      │                                                       │        │
│  │      ├── Term Sheet: Version 2                               │        │
│  │      ├── Referred By: ABC Introducers Ltd                    │        │
│  │      └── Fee Model: ABC's accepted model                     │        │
│  │                     (2.5% sub / 1.5% mgmt / 15% perf)        │        │
│  │                                                               │        │
│  │  This link is PERMANENT and determines:                      │        │
│  │  • What fees apply to this investor's subscription           │        │
│  │  • Who gets commission when investor funds                   │        │
│  └─────────────────────────────────────────────────────────────┘        │
│                                                                          │
│  PARTNER SHARE FEATURE:                                                  │
│  Partners can directly SHARE deals with investors (unique capability)    │
│  Partner's fee model automatically applied                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Subscription Pack Flow

```
Investor Journey:
    │
    ├── 1. INTEREST: Investor expresses interest with amount
    │
    ├── 2. NDA: Investor signs NDA → Data Room access (7 days)
    │
    ├── 3. PACK GENERATED: System generates Subscription Pack
    │       ├── Auto-populated from deal data
    │       └── CEO approval required before sending
    │
    ├── 4. CEO REVIEW: Kill switch / minor edits
    │       └── Sends to investor when ready
    │
    ├── 5. INVESTOR SIGNS: VERSOSign digital signature
    │
    ├── 6. COUNTER-SIGNATURE: CEO/Arranger signs
    │
    └── 7. LAWYER NOTIFIED: Pack ready for escrow setup
```

---

## 5. Phase 4: Funding & Escrow

### 5.1 Wire Transfer Flow

**Code:** `src/app/api/subscriptions/[id]/route.ts`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FUNDING FLOW                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INVESTOR                                                                │
│      │                                                                   │
│      │ Wires: Investment + Subscription Fee                              │
│      │ Example: £100,000 + £2,500 (2.5%) = £102,500                     │
│      │                                                                   │
│      ▼                                                                   │
│  LAWYER ESCROW ACCOUNT                                                   │
│      │                                                                   │
│      ├── Lawyer confirms receipt                                         │
│      │   └── Updates subscription: status = 'funded'                     │
│      │                                                                   │
│      │ Fees ACCRUE but are NOT yet payable                               │
│      │                                                                   │
│      └── At this point:                                                  │
│          • Partners/Introducers can VIEW accrued fees                    │
│          • But CANNOT submit invoices yet                                │
│          • Invoice button is DISABLED                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Subscription Status Flow

```
interest_expressed → nda_signed → pack_sent → signed → counter_signed → FUNDED
                                                                         │
                                                                         │
                                                            Awaits Deal Close
                                                                         │
                                                                         ▼
                                                                      ACTIVE
                                                                (at deal close)
```

---

## 6. Phase 5: Deal Close (Critical Trigger Point)

### 6.1 What Happens at Deal Close

**Code:** `src/lib/deals/deal-close-handler.ts`
**Cron:** `src/app/api/cron/deal-close-check/route.ts`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DEAL CLOSE TRIGGERS                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  When close_at date is reached:                                          │
│                                                                          │
│  1. ACTIVATE SUBSCRIPTIONS                                               │
│     └── Status: funded → ACTIVE                                          │
│                                                                          │
│  2. CREATE POSITIONS                                                     │
│     └── INSERT into positions table:                                     │
│         • investor_id                                                    │
│         • vehicle_id                                                     │
│         • units (shares)                                                 │
│         • cost_basis                                                     │
│                                                                          │
│  3. CREATE INTRODUCER COMMISSIONS                                        │
│     └── For each investor referred by introducer:                        │
│         commission = funded_amount × rate_bps / 10000                    │
│         status: 'accrued' (ready for invoice)                            │
│                                                                          │
│  4. GENERATE CERTIFICATES                                                │
│     └── Triggers n8n workflow: 'generate-investment-certificate'         │
│         → Certificate PDF created                                        │
│         → Stored in Supabase Storage                                     │
│         → Investor notified                                              │
│         → Lawyer notified                                                │
│                                                                          │
│  5. ENABLE INVOICE REQUESTS                                              │
│     └── UPDATE fee_plans SET                                             │
│           invoice_requests_enabled = true,                               │
│           invoice_requests_enabled_at = NOW()                            │
│         WHERE deal_id = ? AND status = 'accepted'                        │
│                                                                          │
│  6. SEND NOTIFICATIONS                                                   │
│     └── Partners/Introducers: "Invoice requests now available"           │
│                                                                          │
│  7. MARK DEAL PROCESSED                                                  │
│     └── deals.closed_processed_at = NOW() (idempotency)                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Why Close Date (Not Funding Date)?

Fred's reasoning:
> "It could happen that we get the money and we have to return the funds to the investors because we haven't been able to do the closing."

Until deal closes:
- Positions are not finalized
- Refunds may still occur
- Commissions should NOT be paid out

---

## 7. Fee Calculations

### 7.1 Fee Types

**Code:** `src/lib/fees/calculations.ts`

| Fee Type | Formula | When Charged |
|----------|---------|--------------|
| **Subscription** | `investment × rate_bps / 10000` | One-time at funding |
| **Management** | `commitment × rate_bps / 10000 × periods` | Annual/Quarterly |
| **Performance** | `(exit_price - entry_price) × shares × rate%` | On profitable exit |
| **Spread** | `(investor_price - cost_price) × shares` | One-time markup |
| **BD Fee** | `commitment × rate_bps / 10000` | One-time |
| **FINRA Fee** | Flat amount | Regulatory |

### 7.2 Commission Calculation

**Code:** `src/lib/deals/deal-close-handler.ts:192-275`

```
For each funded subscription:
  │
  ├── Find deal_membership with referred_by_entity_type = 'introducer'
  │
  ├── Get introducer's fee_plan for this deal
  │
  ├── Extract rate_bps from fee_components (kind = 'commission')
  │
  └── CREATE introducer_commission:
      commission_amount = funded_amount × rate_bps / 10000
      status = 'accrued'
```

### 7.3 Wire Amount Calculation

```
Total Wire = Investment Amount + Subscription Fee

Example:
├── Investment: £100,000
├── Subscription Fee: 2.5% = £2,500
└── Total Wire: £102,500
```

---

## 8. Invoice & Payment Flow

### 8.1 Invoice Submission (Post Deal Close)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    INVOICE SUBMISSION FLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  BEFORE DEAL CLOSE:                                                      │
│  ├── Partner/Introducer sees accrued fees: £5,000                       │
│  └── "Submit Invoice" button: DISABLED                                   │
│                                                                          │
│  AFTER DEAL CLOSE + CEO APPROVAL:                                        │
│  ├── Partner/Introducer sees accrued fees: £5,000                       │
│  ├── "Submit Invoice" button: ENABLED ✓                                  │
│  │                                                                       │
│  │  Partner/Introducer                                                   │
│  │      │                                                                │
│  │      │ Submits Invoice                                                │
│  │      ▼                                                                │
│  │  CEO/Arranger                                                         │
│  │      │                                                                │
│  │      │ Creates Payment Request                                        │
│  │      ▼                                                                │
│  │  LAWYER                                                               │
│  │      │                                                                │
│  │      │ Processes Payment from Escrow                                  │
│  │      ▼                                                                │
│  │  Partner/Introducer Bank Account                                      │
│  │      │                                                                │
│  │      └── Payment Received                                             │
│  │                                                                       │
│  └── Invoice status: submitted → approved → paid                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Lawyer Payment Processing

```
Lawyer Dashboard:
├── Escrow Account Handling
│   ├── View pending payment requests
│   ├── Process partner fee payments
│   ├── Process introducer fee payments
│   └── Confirm payments completed
│
└── Payment Flow:
    1. Receive payment request from CEO/Arranger
    2. Verify invoice details
    3. Process payment from escrow
    4. Mark payment as completed
    5. System notifies all parties
```

---

## 9. Complete Money Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE MONEY FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│    INVESTOR                                                                      │
│        │                                                                         │
│        │ Wire: £102,500                                                          │
│        │ (£100k investment + £2.5k sub fee)                                      │
│        ▼                                                                         │
│    ┌───────────────────────────────────────────────────────────────┐            │
│    │              LAWYER ESCROW ACCOUNT                             │            │
│    │                                                                │            │
│    │   Holds all funds until deal close                             │            │
│    │                                                                │            │
│    │   At Deal Close:                                               │            │
│    │   ├── £100,000 → Investment Vehicle (SPV)                      │            │
│    │   │                                                            │            │
│    │   └── £2,500 Fee Distribution:                                 │            │
│    │       │                                                        │            │
│    │       ├── To Introducer: £1,250 (50% of sub fee)               │            │
│    │       │   └── Based on fee model: 1.25% of investment          │            │
│    │       │                                                        │            │
│    │       └── To VERSO: £1,250 (retained)                          │            │
│    │           └── Net: Sub fee - Introducer commission             │            │
│    │                                                                │            │
│    └───────────────────────────────────────────────────────────────┘            │
│                        │                                                         │
│                        ▼                                                         │
│    ┌───────────────────────────────────────────────────────────────┐            │
│    │                   ONGOING FEES                                 │            │
│    │                                                                │            │
│    │   Management Fee (Annual):                                     │            │
│    │   ├── 1.5% × £100,000 = £1,500/year                           │            │
│    │   └── Billed quarterly: £375/quarter                          │            │
│    │                                                                │            │
│    │   Performance Fee (On Exit):                                   │            │
│    │   ├── If shares bought at £1.00, sold at £10.00               │            │
│    │   ├── Gain: £9.00 × 100,000 shares = £900,000                 │            │
│    │   └── 15% perf fee: £135,000                                  │            │
│    │                                                                │            │
│    └───────────────────────────────────────────────────────────────┘            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Key Database Tables

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CORE DATABASE SCHEMA                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  deals                           deal_fee_structures (Term Sheets)       │
│  ├── id                          ├── id                                  │
│  ├── name                        ├── deal_id                             │
│  ├── company_name                ├── version                             │
│  ├── close_at                    ├── status (draft/published/archived)   │
│  ├── closed_processed_at ←──┐   ├── subscription_fee_percent            │
│  └── vehicle_id                  ├── management_fee_percent              │
│                              │   └── carried_interest_percent            │
│                              │                                           │
│  fee_plans                   │   fee_components                          │
│  ├── id                      │   ├── fee_plan_id                         │
│  ├── deal_id                 │   ├── kind (subscription/mgmt/perf...)    │
│  ├── term_sheet_id ──────────┼──►├── rate_bps                            │
│  ├── introducer_id           │   ├── frequency                           │
│  ├── partner_id              │   └── payment_schedule                    │
│  ├── status (accepted)       │                                           │
│  ├── accepted_at             │   subscriptions                           │
│  ├── invoice_requests_enabled│   ├── id                                  │
│  └── invoice_requests_enabled_at ├── investor_id                         │
│                              │   ├── deal_id                             │
│  introducer_commissions      │   ├── fee_plan_id                         │
│  ├── introducer_id           │   ├── status (funded/active)              │
│  ├── deal_id                 │   ├── commitment                          │
│  ├── investor_id             │   ├── funded_amount                       │
│  ├── fee_plan_id             │   └── activated_at                        │
│  ├── rate_bps                │                                           │
│  ├── accrual_amount          │   positions                               │
│  └── status (accrued/paid)   └──►├── investor_id                         │
│                                  ├── vehicle_id                          │
│  deal_memberships                ├── units                               │
│  ├── deal_id                     └── cost_basis                          │
│  ├── investor_id                                                         │
│  ├── referred_by_entity_id                                               │
│  └── referred_by_entity_type                                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Stakeholder Responsibilities Summary

| Stakeholder | Key Actions | Money Involvement |
|-------------|-------------|-------------------|
| **CEO** | Create deals, term sheets, approve packs, trigger close | Approves payments |
| **Arranger** | Create fee models, counter-sign packs, request payments | Receives BD fees |
| **Partner** | Accept fee model, SHARE deals, submit invoices | Receives commissions |
| **Introducer** | Sign fee agreement, track referrals, submit invoices | Receives commissions |
| **Commercial Partner** | Execute for clients, placement agreements | Receives placement fees |
| **Lawyer** | Process escrow, confirm funding, pay out fees | Handles all payments |
| **Investor** | Sign pack, wire funds, receive certificate | Pays investment + fees |

---

## 12. Critical Business Rules

1. **No Global Fee Plans** - Every fee model MUST link to Deal + Term Sheet + Entity
2. **Fee Values ≤ Term Sheet** - Validation prevents exceeding limits
3. **Dispatch Blocked Until Acceptance** - Cannot dispatch investors without accepted fee model
4. **Certificates at Close** - NOT on funding, only on deal close date
5. **Invoices at Close** - Invoice capability enabled only after deal closes
6. **Introducers Cannot See Term Sheets** - Only see their own fee model
7. **Partners CAN See Term Sheets** - Full deal visibility + data room access

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 7, 2026 | Claude | Initial comprehensive guide |
