# VERSO Holdings Platform - Complete Business Process Map

**Document Type:** Business Process & Persona Analysis
**Generated:** January 2026
**Purpose:** Comprehensive understanding of all personas, workflows, and cross-functional interactions

---

## 🔍 VERIFICATION AUDIT (January 2, 2026)

**Audit Method:** Exhaustive codebase search with file path evidence
**Auditor:** Claude Opus 4.5 automated verification

### Verification Summary

| Section | Claim | Status | Evidence |
|---------|-------|--------|----------|
| §16 Workflows | n8n integration | ✅ VERIFIED | `src/lib/trigger-workflow.ts:triggerWorkflow()` |
| §16 Workflows | 6 workflow keys | ⚠️ CORRECTED | Actually 11 workflows in `src/lib/workflows.ts` |
| §16 VERSOSign | pdf-lib signatures | ✅ VERIFIED | `src/lib/signature/pdf-processor.ts:embedSignatureInPDF()` |
| §17 KYC Types | 16 document types | ⚠️ CORRECTED | 17 types in `src/constants/kyc-document-types.ts` (added 'other') |
| §18 Capital Calls | IMPLEMENTED | ✅ VERIFIED | `src/app/api/capital-calls/route.ts:POST` |
| §18 Distributions | PARTIAL | ✅ VERIFIED | `src/app/api/distributions/route.ts` (vehicle-level only) |
| §19 Secondary Market | PARTIAL | ✅ VERIFIED | `src/app/api/investor/sell-request/route.ts` |
| §20 Conversion Events | NOT IMPLEMENTED | ✅ VERIFIED | No POST handler, only GET in `src/app/api/entities/[id]/events/route.ts` |
| §20 Redemption Events | NOT IMPLEMENTED | ✅ VERIFIED | No redemption workflow in codebase |
| §20 RPC function exists | Incorrect claim | ❌ CORRECTED | `calculate_investor_performance_fee` does NOT exist in codebase |
| §21 Cron Jobs | 6 cron jobs | ⚠️ CORRECTED | Actually 10 cron jobs in `src/app/api/cron/` |
| §22 Tasks | Task management | ✅ VERIFIED | `src/app/api/tasks/route.ts` |
| §26 Partner SHARE | IMPLEMENTED | ✅ VERIFIED | `src/app/api/partners/me/share/route.ts` |

### Corrections Made

1. **Workflow count**: Changed from 6 to 11 defined workflows
2. **KYC document types**: Changed from 16 to 17 (added 'other')
3. **Cron jobs count**: Changed from 6 to 10 jobs
4. **RPC function claim**: Removed incorrect claim about `calculate_investor_performance_fee` RPC
5. **DocuSign claim**: Clarified as external n8n workflow, not direct integration

---

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Persona Map Overview](#2-persona-map-overview)
3. [The 7 Personas Explained](#3-the-7-personas-explained)
4. [Core Business Process: Deal-to-Investment Lifecycle](#4-core-business-process-deal-to-investment-lifecycle)
5. [Cross-Persona Interaction Matrix](#5-cross-persona-interaction-matrix)
6. [Key Workflows by Phase](#6-key-workflows-by-phase)
7. [Fee & Commission Structure](#7-fee--commission-structure)
8. [Process Flow Diagrams](#8-process-flow-diagrams)
9. [Technical Implementation Notes](#9-technical-implementation-notes)

---

## 1. Executive Summary

VERSO Holdings is an **alternative investment platform** managing $800M+ in private market investments. The platform serves as a dual-portal system connecting:

- **Investors** seeking access to private market deals (SpaceX, Revolut, etc.)
- **Staff/Operations** managing the investment lifecycle
- **External parties** (Partners, Introducers, Commercial Partners, Lawyers) who facilitate deal flow

### The Core Business Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VERSO HOLDINGS BUSINESS MODEL                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   SOURCING              STRUCTURING           DISTRIBUTION        LIFECYCLE  │
│   ────────              ──────────            ────────────        ─────────  │
│                                                                               │
│   ┌─────────┐          ┌─────────┐           ┌─────────┐        ┌─────────┐ │
│   │ VERSO   │   →      │ Create  │    →      │ Dispatch│   →    │ Manage  │ │
│   │ Sources │          │ Vehicle │           │ to      │        │ Until   │ │
│   │ Deals   │          │ + Terms │           │Investors│        │ Exit    │ │
│   └─────────┘          └─────────┘           └─────────┘        └─────────┘ │
│       │                     │                     │                  │       │
│       ▼                     ▼                     ▼                  ▼       │
│   Partners             Fee Plans             Subscription       Conversion   │
│   source deals         Termsheets            Packs sent         Redemption   │
│   earn comm.           NDA required          Signatures         Certificates │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Revenue Streams

| Fee Type | Rate | When Charged |
|----------|------|--------------|
| **Subscription Fee** | 2-3% | One-time at investment |
| **Management Fee** | 1-2%/year | Quarterly on committed capital |
| **Performance Fee (Carry)** | 20% | On profits above hurdle |
| **Spread Markup** | Variable | Secondary transactions |
| **BD/Introducer Fees** | Variable | Paid from subscription fees |

---

## 2. Persona Map Overview

The platform operates on a **multi-persona system** where a single user can have multiple roles. Each persona sees different navigation, data, and capabilities.

```
                                    ┌───────────────────┐
                                    │      USER         │
                                    │   (Authenticated) │
                                    └─────────┬─────────┘
                                              │
                         ┌────────────────────┼────────────────────┐
                         │                    │                    │
              ┌──────────▼──────────┐  ┌──────▼──────┐  ┌──────────▼──────────┐
              │   INTERNAL PERSONAS │  │   HYBRID    │  │  EXTERNAL PERSONAS  │
              │                     │  │   PERSONAS  │  │                     │
              │  • CEO (Staff)      │  │  • Partner  │  │  • Lawyer           │
              │  • Arranger         │  │  • Introducer│ │  • Commercial       │
              │                     │  │             │  │    Partner          │
              │  Full portal access │  │  Can ALSO   │  │                     │
              │  Deal management    │  │  be investor│  │  Specialized access │
              │  User management    │  │             │  │  Fee/escrow views   │
              └─────────────────────┘  └─────────────┘  └─────────────────────┘
                                              │
                                    ┌─────────▼─────────┐
                                    │     INVESTOR      │
                                    │    (Core User)    │
                                    │                   │
                                    │  Portfolio view   │
                                    │  Deal access      │
                                    │  Subscriptions    │
                                    └───────────────────┘
```

### Persona Hierarchy

| Level | Persona | Primary Function | Can Also Be |
|-------|---------|------------------|-------------|
| 1 | **CEO/Staff** | Full platform administration | Investor |
| 2 | **Arranger** | Deal management for assigned vehicles | Investor |
| 3 | **Partner** | Refers investors, SHARES deals | Investor |
| 4 | **Introducer** | Formal introduction agreements | Investor |
| 5 | **Commercial Partner** | Wealth manager (executes for clients) | Investor |
| 6 | **Lawyer** | Escrow & payment processing | - |
| 7 | **Investor** | Invests in opportunities | - |

---

## 3. The 7 Personas Explained

### 3.1 CEO/Staff Persona

**Role:** Platform administrator with full system access

**Key Capabilities:**
- Create ALL user profiles (investors, arrangers, partners, introducers, lawyers, commercial partners)
- Create and manage investment opportunities (deals + termsheets)
- Dispatch opportunities to investors and external parties
- Create and assign fee models
- Approve user profiles, KYC submissions, subscriptions
- Manage reconciliation and financial oversight
- Issue equity certificates and statements of holding
- Handle conversion and redemption events

**Navigation Access:**
```
CEO Dashboard
├── Users (create/manage all user types)
├── Deals (create, edit, dispatch)
├── Vehicles (investment structures)
├── Subscriptions (full management)
├── Subscription Packs (generation, review)
├── Approvals (pending items queue)
├── Fees (fee plans, fee events)
├── Reconciliation (bank matching)
├── KYC Review
├── Introducers
├── Partners
├── Commercial Partners
├── Lawyers
└── Audit Logs
```

**Key Workflows Owned:**
1. User onboarding and approval
2. Deal creation and termsheet management
3. Opportunity dispatch
4. Subscription pack generation
5. Funding confirmation
6. Certificate issuance
7. Conversion/redemption events

---

### 3.2 Arranger Persona

**Role:** Licensed financial entity managing specific vehicles/deals

**Key Capabilities:**
- View and manage deals assigned to their vehicles
- Create fee models for partners and introducers
- Sign subscription packs (counter-signature)
- Track subscriptions on their mandates
- Request payments to lawyers for partner/introducer fees
- View reconciliation for their compartments

**Navigation Access:**
```
Arranger Dashboard
├── My Profile (arranger entity profile)
├── My Mandates (assigned deals/vehicles)
├── My Partners (manage partner relationships)
├── My Introducers (manage introducer relationships)
├── My Commercial Partners
├── My Lawyers
├── Fee Plans (create/manage for their deals)
├── Escrow (funding status)
├── Payment Requests (request fee payments)
└── Arranger Reconciliation
```

**Key Workflows:**
1. Fee model creation and dispatch
2. Introducer agreement management
3. Subscription pack counter-signature
4. Payment request to lawyers
5. Compartment reconciliation

---

### 3.3 Partner Persona

**Role:** Business development partner who CAN ALSO invest personally

**Key Capabilities:**
- **As Partner:**
  - View dispatched opportunities
  - SHARE deals with investors (unique capability!)
  - Track investor progress through funnel
  - View commission/fee tracking
  - Submit invoices for fees
- **As Investor:**
  - Full investor capabilities (subscribe, fund, etc.)

**SHARE Feature (Critical):**
```
┌─────────────────────────────────────────────────────────────────┐
│                    PARTNER SHARE FEATURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Partner receives deal dispatch from CEO                        │
│                     │                                            │
│                     ▼                                            │
│   Partner clicks "SHARE" and selects:                            │
│   • Target investor(s)                                           │
│   • Optionally: Introducer to copy                               │
│                     │                                            │
│                     ▼                                            │
│   System automatically:                                          │
│   • Applies Partner's fee model                                  │
│   • CCs CEO and Arranger                                         │
│   • Notifies investor of opportunity                             │
│                     │                                            │
│                     ▼                                            │
│   Partner TRACKS investor through:                               │
│   INTERESTED → APPROVED → SIGNED → FUNDED                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Navigation Access:**
```
Partner Dashboard
├── My Profile
├── My Transactions (as Partner)
│   ├── Dispatched deals
│   ├── SHARE feature
│   └── Commission tracking
├── My Investments (as Investor)
│   ├── Portfolio
│   ├── Subscription packs
│   └── Funding status
└── Reconciliation
```

---

### 3.4 Introducer Persona

**Role:** Formal referral partner with legal agreement requirements

**Key Capabilities:**
- **As Introducer:**
  - View dispatched opportunities
  - Track introduced investors
  - Manage introduction agreements (approve, sign)
  - View fee models and commissions
  - Submit invoices
- **As Investor:**
  - Full investor capabilities

**Key Difference from Partner:**
- Introducers have **formal Introduction Agreements** that must be approved and signed
- Partners can directly SHARE; Introducers work through formal agreements
- Different fee structures and commission tracking

**Introduction Agreement Workflow:**
```
CEO creates Introducer Agreement
          │
          ▼
Dispatch agreement to Introducer
          │
          ▼
Introducer reviews (can add comments)
          │
          ├─── APPROVE ───┐
          │               ▼
          │        Sign digitally
          │               │
          │               ▼
          │        CEO counter-signs
          │               │
          │               ▼
          │        Agreement active
          │
          └─── REJECT ────┐
                          ▼
                   Negotiation
                   (out of app)
```

---

### 3.5 Commercial Partner Persona

**Role:** Wealth manager executing on behalf of multiple clients

**Key Capabilities:**
- **UNIQUE:** Can subscribe ON BEHALF OF clients (proxy execution)
- Manage client portfolio across opportunities
- Placement agreements (similar to introducer agreements)
- Track client transactions and fees
- View client statements

**Key Difference from Partner/Introducer:**
- Commercial Partners are typically **institutional** (wealth managers, family offices)
- They execute subscriptions on behalf of their underlying clients
- Dedicated client management functionality
- Placement agreements vs introduction agreements

**Client Management:**
```
Commercial Partner
      │
      ├── Client A (HNW Individual)
      │   ├── Deal 1 subscription
      │   ├── Deal 2 subscription
      │   └── Portfolio view
      │
      ├── Client B (Family Trust)
      │   ├── Deal 3 subscription
      │   └── Portfolio view
      │
      └── Client C (Corporate)
          └── Deal 1 subscription
```

---

### 3.6 Lawyer Persona

**Role:** Legal counsel handling escrow and payment processing

**Key Capabilities:**
- Receive notifications on signed subscription packs
- Manage escrow account funding status
- Process fee payments to Partners, Introducers, Commercial Partners
- Insert signature specimens on certificates
- Handle conversion/redemption payment confirmations
- View reconciliation data

**Navigation Access:**
```
Lawyer Dashboard
├── My Profile
├── My Notifications
│   ├── Subscription pack signed
│   ├── Escrow funding status
│   └── Invoice received
├── Escrow Account Handling
│   ├── Funding confirmations
│   ├── Partner fee payments
│   ├── Introducer fee payments
│   └── Commercial Partner fee payments
├── Signature Specimen
├── Assigned Deals
└── Reconciliation
```

**Critical Role in Payment Flow:**
```
┌─────────────────────────────────────────────────────────────────┐
│                    LAWYER PAYMENT FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. CEO/Arranger requests payment                               │
│              │                                                   │
│              ▼                                                   │
│   2. Lawyer receives notification                                │
│              │                                                   │
│              ▼                                                   │
│   3. Lawyer views invoice details                                │
│              │                                                   │
│              ▼                                                   │
│   4. Lawyer processes payment from escrow                        │
│              │                                                   │
│              ▼                                                   │
│   5. Lawyer confirms payment completed                           │
│              │                                                   │
│              ▼                                                   │
│   6. CEO/Arranger/Partner notified                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3.7 Investor Persona

**Role:** The end customer investing in opportunities

**Key Capabilities:**
- View dispatched investment opportunities
- Access data rooms (after NDA)
- Express interest with indicative amounts
- Review and approve subscription packs
- Digitally sign documents
- Fund escrow accounts
- View portfolio and holdings
- Download equity certificates and statements of holding
- Participate in conversion/redemption events
- Request to sell positions (secondary)

**Investor Journey:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE INVESTOR JOURNEY                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. ONBOARDING          2. OPPORTUNITY         3. SUBSCRIPTION              │
│  ────────────           ────────────           ────────────                  │
│                                                                              │
│  • Profile created      • Receive dispatch     • Review pack                 │
│  • KYC submission       • Express interest     • Add comments                │
│  • KYC approval         • Sign NDA             • Approve pack                │
│  • Profile approved     • Access data room     • Digital signature           │
│                         • Confirm amount       • Counter-signature           │
│                                                                              │
│  4. FUNDING             5. HOLDINGS            6. LIFECYCLE                  │
│  ────────               ──────────             ─────────                     │
│                                                                              │
│  • Transfer to escrow   • Receive certificate  • Conversion events           │
│  • Funding confirmed    • Statement of holding • Redemption events           │
│  • Amount verified      • Portfolio view       • Resell requests             │
│  • Position created     • Performance tracking • Exit/liquidity              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Core Business Process: Deal-to-Investment Lifecycle

### Phase 1: Deal Setup (CEO)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 1: DEAL SETUP                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CEO creates new Deal                                            │
│      │                                                           │
│      ├── Select/create Vehicle (SPV, Fund)                       │
│      │                                                           │
│      ├── Create Termsheet with terms:                            │
│      │   • Minimum investment                                    │
│      │   • Target amount                                         │
│      │   • Funding deadline                                      │
│      │   • Fee structure                                         │
│      │                                                           │
│      ├── Create Fee Plans for the deal                           │
│      │   • Subscription fee %                                    │
│      │   • Management fee %                                      │
│      │   • Performance fee %                                     │
│      │                                                           │
│      ├── Assign Partners/Introducers to deal                     │
│      │   • Create partner-specific fee models                    │
│      │   • Create introducer-specific fee models                 │
│      │                                                           │
│      └── Upload data room documents                              │
│          • Due diligence materials                               │
│          • Legal documents                                       │
│          • Financials                                            │
│                                                                  │
│  Tables: deals, vehicles, term_sheets, fee_plans, fee_components,│
│          deal_data_room_documents, deal_fee_structures           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 2: Opportunity Dispatch

```
┌─────────────────────────────────────────────────────────────────┐
│                 PHASE 2: OPPORTUNITY DISPATCH                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CEO dispatches deal to:                                         │
│      │                                                           │
│      ├── Direct to Investors ────────────────────────┐           │
│      │   • Select specific investors                 │           │
│      │   • Bulk dispatch to investor groups          │           │
│      │                                               ▼           │
│      │                                    Investor receives      │
│      │                                    notification           │
│      │                                                           │
│      ├── To Partners (with fee model) ───────────────┐           │
│      │   • Partner can then SHARE to investors       │           │
│      │   • Partner's fee model auto-applied          │           │
│      │                                               ▼           │
│      │                                    Partner can SHARE      │
│      │                                    to their network       │
│      │                                                           │
│      ├── To Introducers (with agreement) ────────────┐           │
│      │   • Introduction agreement dispatched         │           │
│      │   • Introducer must approve & sign            │           │
│      │                                               ▼           │
│      │                                    Introducer sees        │
│      │                                    opportunity + terms    │
│      │                                                           │
│      └── To Commercial Partners ─────────────────────┐           │
│          • Placement agreement dispatched            │           │
│          • Can subscribe on behalf of clients        ▼           │
│                                           Commercial Partner     │
│                                           notifies clients       │
│                                                                  │
│  Tables: deal_memberships, notifications, deal_activity_events   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 3: Interest & NDA

```
┌─────────────────────────────────────────────────────────────────┐
│                  PHASE 3: INTEREST & NDA                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Investor receives opportunity notification                      │
│      │                                                           │
│      ├── Option 1: PASS                                          │
│      │   └── Status updated, no further action                   │
│      │                                                           │
│      └── Option 2: INTERESTED ─────────────────────┐             │
│          │                                         ▼             │
│          │                              investor_deal_interest   │
│          │                              record created           │
│          │                                                       │
│          ▼                                                       │
│      NDA Required for Data Room Access                           │
│          │                                                       │
│          ├── NDA auto-generated (pre-signed by VERSO)            │
│          │                                                       │
│          ├── Investor digitally signs NDA                        │
│          │                                                       │
│          └── Data Room Access Granted (7 days default)           │
│              │                                                   │
│              ├── Access to due diligence documents               │
│              ├── Access to legal documents                       │
│              ├── Access to financials                            │
│              │                                                   │
│              └── Can request extension if needed                 │
│                                                                  │
│  Tables: investor_deal_interest, signature_requests,             │
│          deal_data_room_access, tasks                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 4: Subscription

```
┌─────────────────────────────────────────────────────────────────┐
│                   PHASE 4: SUBSCRIPTION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Investor confirms interest with amount                          │
│      │                                                           │
│      ▼                                                           │
│  CEO/Staff generates Subscription Pack                           │
│      │                                                           │
│      ├── Pack includes:                                          │
│      │   • Subscription agreement                                │
│      │   • Side letter (if applicable)                           │
│      │   • Power of attorney                                     │
│      │   • Terms and conditions                                  │
│      │                                                           │
│      ▼                                                           │
│  Pack dispatched to Investor                                     │
│      │                                                           │
│      ▼                                                           │
│  Investor reviews pack                                           │
│      │                                                           │
│      ├── Can download documents                                  │
│      ├── Can add comments/questions                              │
│      ├── Can request changes                                     │
│      │                                                           │
│      ├─── If changes needed: Updated pack sent ───┐              │
│      │                                            │              │
│      │                           ┌────────────────┘              │
│      │                           ▼                               │
│      └── Investor APPROVES pack                                  │
│          │                                                       │
│          ▼                                                       │
│      Digital Signature Workflow                                  │
│          │                                                       │
│          ├── Investor signs all documents                        │
│          │                                                       │
│          ├── CEO/Arranger counter-signs                          │
│          │                                                       │
│          └── Lawyer notified of completion                       │
│                                                                  │
│  Tables: subscription_packs, documents, signature_requests,      │
│          subscriptions, approval_history                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 5: Funding

```
┌─────────────────────────────────────────────────────────────────┐
│                     PHASE 5: FUNDING                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Post-signature: Funding request sent                            │
│      │                                                           │
│      ▼                                                           │
│  Investor transfers funds to escrow account                      │
│      │                                                           │
│      ▼                                                           │
│  Bank transaction received (imported or via API)                 │
│      │                                                           │
│      ▼                                                           │
│  Reconciliation process                                          │
│      │                                                           │
│      ├── Auto-match or manual match to subscription              │
│      │                                                           │
│      ├── Amount verification:                                    │
│      │   ├── Exact match → Confirmed                             │
│      │   ├── Over → Arrange refund                               │
│      │   └── Under → Request additional                          │
│      │                                                           │
│      └── Funding confirmed                                       │
│          │                                                       │
│          ▼                                                       │
│      Subscription status updated to FUNDED                       │
│          │                                                       │
│          ├── Position created in portfolio                       │
│          │                                                       │
│          └── Fee payment workflow triggered                      │
│              │                                                   │
│              ├── Partner fees calculated                         │
│              ├── Introducer fees calculated                      │
│              └── Commercial Partner fees calculated              │
│                                                                  │
│  Tables: bank_transactions, reconciliation_matches, subscriptions│
│          positions, fee_events                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 6: Certificate Issuance

```
┌─────────────────────────────────────────────────────────────────┐
│                PHASE 6: CERTIFICATE ISSUANCE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Post-funding: Certificate generation                            │
│      │                                                           │
│      ▼                                                           │
│  CEO generates Equity Certificate                                │
│      │                                                           │
│      ├── Certificate data:                                       │
│      │   • Investor name                                         │
│      │   • Number of shares/units                                │
│      │   • Investment amount                                     │
│      │   • Vehicle details                                       │
│      │   • Certificate number                                    │
│      │                                                           │
│      ├── Lawyer signature specimen inserted                      │
│      │                                                           │
│      └── CEO approves for dispatch                               │
│          │                                                       │
│          ▼                                                       │
│      Certificate sent to Investor                                │
│          │                                                       │
│          ▼                                                       │
│      Statement of Holding generated                              │
│          │                                                       │
│          ├── Comprehensive position summary                      │
│          │                                                       │
│          └── Sent to Investor                                    │
│                                                                  │
│  Tables: documents, workflow_runs, investor_notifications        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 7: Fee Payment

```
┌─────────────────────────────────────────────────────────────────┐
│                   PHASE 7: FEE PAYMENT                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Fee calculations triggered post-funding                         │
│      │                                                           │
│      ├── Partner Fees:                                           │
│      │   ├── CEO notifies Partner to submit invoice              │
│      │   ├── Partner submits invoice in platform                 │
│      │   ├── CEO/Arranger requests payment to Lawyer             │
│      │   ├── Lawyer processes payment from escrow                │
│      │   └── Partner notified of payment                         │
│      │                                                           │
│      ├── Introducer Fees:                                        │
│      │   ├── Same workflow as Partner                            │
│      │   └── Based on Introduction Agreement terms               │
│      │                                                           │
│      └── Commercial Partner Fees:                                │
│          ├── Based on Placement Agreement                        │
│          └── May be per-client or aggregate                      │
│                                                                  │
│  Tables: fee_events, invoices, invoice_lines, payments,          │
│          partner_commissions, introducer_commissions             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Cross-Persona Interaction Matrix

### Who Interacts With Whom

| From → To | CEO | Arranger | Partner | Introducer | Commercial Partner | Lawyer | Investor |
|-----------|-----|----------|---------|------------|-------------------|--------|----------|
| **CEO** | - | Assigns deals, approves | Creates fee models, dispatches | Creates agreements, dispatches | Dispatches, agreements | Assigns, requests payments | Creates, dispatches, manages |
| **Arranger** | Reports, requests | - | Creates fee models | Creates agreements | Fee models | Requests payments | Countersigns |
| **Partner** | Submits invoices | Invoice requests | - | Can introduce | - | - | SHARES deals |
| **Introducer** | Submits invoices | Invoice requests | - | - | - | - | Introduces |
| **Commercial Partner** | Submits invoices | Invoice requests | - | - | - | - | Subscribes for clients |
| **Lawyer** | Payment confirmations | Payment confirmations | Pays fees | Pays fees | Pays fees | - | - |
| **Investor** | Comments, approves | - | - | - | - | - | - |

### Notification Flow Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NOTIFICATION FLOW MAP                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   EVENT                           WHO GETS NOTIFIED                          │
│   ─────                           ─────────────────                          │
│                                                                              │
│   Deal Created                    Arranger (if assigned)                     │
│   Deal Dispatched                 Investor, Partner, Introducer, CP          │
│   Interest Expressed              CEO, Arranger, Partner (if assigned)       │
│   NDA Signed                      CEO, Arranger                              │
│   Subscription Pack Sent          Investor                                   │
│   Pack Approved                   CEO, Arranger                              │
│   Pack Signed (Investor)          CEO, Arranger, Lawyer                      │
│   Pack Counter-signed             Investor, Lawyer                           │
│   Escrow Funded                   CEO, Arranger, Lawyer                      │
│   Certificate Issued              Investor                                   │
│   Invoice Received                CEO, Arranger                              │
│   Payment Requested               Lawyer                                     │
│   Payment Completed               Partner/Introducer/CP, CEO, Arranger       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Key Workflows by Phase

### Workflow 1: User Onboarding

```
                                ┌─────────────────┐
                                │  CEO creates    │
                                │  user profile   │
                                └────────┬────────┘
                                         │
                           ┌─────────────┼─────────────┐
                           ▼             ▼             ▼
                    ┌──────────┐  ┌──────────┐  ┌──────────┐
                    │ Investor │  │ External │  │  Staff   │
                    │          │  │  Party   │  │          │
                    └────┬─────┘  └────┬─────┘  └────┬─────┘
                         │             │             │
                         ▼             ▼             ▼
                    Invitation    Invitation    Direct
                    email sent    email sent    access
                         │             │
                         ▼             ▼
                    Complete      Complete
                    profile       profile
                         │             │
                         ▼             ▼
                    Submit KYC    Submit profile
                    documents     for approval
                         │             │
                         ▼             ▼
                    CEO reviews   CEO reviews
                    & approves    & approves
                         │             │
                         ▼             ▼
                    Full portal   Full portal
                    access        access
```

### Workflow 2: Subscription Pack Lifecycle

```
                    ┌─────────────────────────────────┐
                    │   Investor confirms interest    │
                    │   with indicative amount        │
                    └───────────────┬─────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────┐
                    │   CEO generates subscription    │
                    │   pack (documents + terms)      │
                    └───────────────┬─────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────┐
                    │   Pack dispatched to investor   │
                    └───────────────┬─────────────────┘
                                    │
               ┌────────────────────┼────────────────────┐
               ▼                    ▼                    ▼
        ┌──────────┐         ┌──────────┐         ┌──────────┐
        │ APPROVE  │         │ COMMENT  │         │  REJECT  │
        │          │         │          │         │          │
        └────┬─────┘         └────┬─────┘         └──────────┘
             │                    │
             │                    ▼
             │             CEO reviews
             │             comments
             │                    │
             │                    ▼
             │             Updated pack
             │             dispatched
             │                    │
             └────────────────────┘
                         │
                         ▼
              Investor signs digitally
                         │
                         ▼
              CEO/Arranger counter-signs
                         │
                         ▼
              Pack fully executed
                         │
                         ▼
              Lawyer notified
              Funding requested
```

### Workflow 3: Reconciliation

```
        ┌─────────────────────────────────────────────────────┐
        │              BANK STATEMENT IMPORT                   │
        │         (CSV upload or API integration)              │
        └────────────────────────┬────────────────────────────┘
                                 │
                                 ▼
        ┌─────────────────────────────────────────────────────┐
        │              TRANSACTION PARSING                     │
        │    Amount | Date | Memo | Counterparty               │
        └────────────────────────┬────────────────────────────┘
                                 │
                                 ▼
        ┌─────────────────────────────────────────────────────┐
        │              MATCHING ENGINE                         │
        │                                                      │
        │   ┌──────────────────┐    ┌──────────────────┐      │
        │   │   AUTO-MATCH     │    │   SUGGESTED      │      │
        │   │   (exact match)  │    │   MATCH          │      │
        │   └────────┬─────────┘    └────────┬─────────┘      │
        │            │                       │                 │
        │            ▼                       ▼                 │
        │      Subscription ID         Staff reviews          │
        │      auto-linked             and approves           │
        │                                                      │
        └────────────────────────┬────────────────────────────┘
                                 │
                                 ▼
        ┌─────────────────────────────────────────────────────┐
        │              AMOUNT VERIFICATION                     │
        │                                                      │
        │   Expected: $100,000    Received: ???                │
        │                                                      │
        │   $100,000 → EXACT ────────────→ CONFIRMED          │
        │   $105,000 → OVER ─────────────→ REFUND PROCESS     │
        │   $ 95,000 → UNDER ────────────→ REQUEST MORE       │
        │                                                      │
        └────────────────────────┬────────────────────────────┘
                                 │
                                 ▼
        ┌─────────────────────────────────────────────────────┐
        │              SUBSCRIPTION UPDATE                     │
        │   funded_amount updated, status → FUNDED             │
        └─────────────────────────────────────────────────────┘
```

---

## 7. Fee & Commission Structure

### Fee Types Overview

| Fee Type | Charged To | Paid By | Rate | Timing | Basis |
|----------|-----------|---------|------|--------|-------|
| Subscription | Investor | Investor | 2-3% | At investment | Investment amount |
| Management | Investor | Investor | 1-2%/year | Quarterly | Committed capital |
| Performance | Investor | Investor | 20% | On exit | Profits above hurdle |
| Spread | Deal | Investor | Variable | At investment | Buy/sell spread |
| Partner BD | VERSO | VERSO | Variable | Post-funding | Subscription fees |
| Introducer | VERSO | VERSO | Variable | Post-funding | Per agreement |
| Commercial Partner | VERSO | VERSO | Variable | Post-funding | Per placement agreement |

### Fee Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FEE FLOW DIAGRAM                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   INVESTOR invests $1,000,000                                                │
│        │                                                                     │
│        ▼                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │              SUBSCRIPTION FEE (2% = $20,000)                         │   │
│   │                            │                                         │   │
│   │         ┌──────────────────┼──────────────────┐                      │   │
│   │         ▼                  ▼                  ▼                      │   │
│   │   VERSO Revenue     Partner Fee       Introducer Fee                 │   │
│   │    (remainder)      (e.g., 50bp)      (e.g., 30bp)                   │   │
│   │     $15,000           $5,000            $3,000                       │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ANNUALLY (Management Fee 1% = $10,000/year)                                │
│        │                                                                     │
│        └──→ VERSO Revenue (paid quarterly)                                   │
│                                                                              │
│   AT EXIT (Performance Fee 20% of profits above hurdle)                      │
│        │                                                                     │
│        └──→ VERSO Revenue                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Commission Calculation Logic

```
Partner Commission Example:
─────────────────────────────
Investment Amount: $1,000,000
Subscription Fee Rate: 2%
Partner Commission Rate: 50 basis points (0.50%)

Subscription Fee: $1,000,000 × 2% = $20,000
Partner Commission: $1,000,000 × 0.50% = $5,000

OR (alternative calculation on subscription fee)
Partner Commission: $20,000 × 25% = $5,000
```

---

## 8. Process Flow Diagrams

### Complete Deal-to-Certificate Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              COMPLETE DEAL-TO-CERTIFICATE FLOW                           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐ │
│  │  DEAL   │    │ DISPATCH│    │ INTEREST│    │ SUB PACK│    │ FUNDING │    │  CERT   │ │
│  │ SETUP   │───→│         │───→│  + NDA  │───→│ + SIGN  │───→│         │───→│ ISSUED  │ │
│  └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘ │
│       │              │              │              │              │              │       │
│       │              │              │              │              │              │       │
│  ┌────▼────┐    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐ │
│  │deals    │    │deal_    │    │investor_│    │subscrip-│    │bank_    │    │documents│ │
│  │vehicles │    │member-  │    │deal_    │    │tions    │    │transact-│    │workflow_│ │
│  │term_    │    │ships    │    │interest │    │signature│    │ions     │    │runs     │ │
│  │sheets   │    │notifs   │    │signature│    │_requests│    │reconcil-│    │positions│ │
│  │fee_plans│    │         │    │_requests│    │approvals│    │iation   │    │         │ │
│  └─────────┘    └─────────┘    │data_room│    └─────────┘    │fee_     │    └─────────┘ │
│                               │_access  │                    │events   │               │
│                               └─────────┘                    └─────────┘               │
│                                                                                          │
│  PERSONAS INVOLVED:                                                                      │
│  ────────────────────                                                                    │
│  CEO ───────────────────────────────────────────────────────────────────────────────────│
│  Arranger ────────────────────────────────────────────────────────────────────────────  │
│  Partner ─────────────● SHARE ●────────────────────────────────────────────────────────│
│  Introducer ──────────●──────────────────────────────────────────────────────────────  │
│  Investor ────────────────────────●───────────●─────────────●───────────────●───────   │
│  Lawyer ────────────────────────────────────────────────────●───────────────●───────   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Multi-Persona State Machine

```
                                  ┌─────────────┐
                                  │    START    │
                                  │ (Deal Idea) │
                                  └──────┬──────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │    DEAL DRAFT        │
                              │    (CEO only)        │
                              └──────────┬───────────┘
                                         │ Publish
                                         ▼
                              ┌──────────────────────┐
                              │    DEAL OPEN         │
                              │ (Accepting interest) │
                              └──────────┬───────────┘
                                         │
           ┌─────────────────────────────┼─────────────────────────────┐
           │                             │                             │
           ▼                             ▼                             ▼
    ┌─────────────┐              ┌─────────────┐              ┌─────────────┐
    │  INVESTOR   │              │   PARTNER   │              │ INTRODUCER  │
    │ INTERESTED  │              │   SHARED    │              │  REFERRED   │
    └──────┬──────┘              └──────┬──────┘              └──────┬──────┘
           │                             │                             │
           └─────────────────────────────┼─────────────────────────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │    NDA SIGNED        │
                              │ (Data Room Access)   │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │  SUBSCRIPTION PACK   │
                              │     GENERATED        │
                              └──────────┬───────────┘
                                         │
           ┌─────────────────────────────┼─────────────────────────────┐
           │                             │                             │
           ▼                             ▼                             ▼
    ┌─────────────┐              ┌─────────────┐              ┌─────────────┐
    │  APPROVED   │              │  COMMENTS   │              │  REJECTED   │
    │             │←─────────────│  (iterate)  │              │  (END)      │
    └──────┬──────┘              └─────────────┘              └─────────────┘
           │
           ▼
    ┌─────────────┐
    │   SIGNED    │
    │ (All party) │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │   FUNDED    │
    │ (Escrow)    │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │   ACTIVE    │
    │ (Position)  │
    └──────┬──────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌─────────┐
│CONVERT  │ │ REDEEM  │
│(Note→Eq)│ │ (Exit)  │
└─────────┘ └─────────┘
```

---

## 9. Technical Implementation Notes

### Database Tables by Process Phase

| Phase | Key Tables |
|-------|------------|
| Deal Setup | `deals`, `vehicles`, `term_sheets`, `fee_plans`, `fee_components` |
| Dispatch | `deal_memberships`, `notifications`, `deal_activity_events` |
| Interest/NDA | `investor_deal_interest`, `signature_requests`, `deal_data_room_access` |
| Subscription | `subscriptions`, `subscription_packs`, `documents`, `approvals` |
| Signature | `signature_requests`, `documents`, `workflow_runs` |
| Funding | `bank_transactions`, `reconciliation_matches`, `fee_events` |
| Certificate | `documents`, `positions`, `performance_snapshots` |
| Fees | `fee_events`, `invoices`, `payments`, `partner_commissions`, `introducer_commissions` |

### Key RPC Functions

```sql
-- Get user's available personas
get_user_personas(user_id)

-- Returns:
-- { persona_type, entity_id, entity_name, entity_logo }
-- Examples:
-- { 'investor', 'inv-123', 'John Smith', null }
-- { 'partner', 'ptn-456', 'ABC Partners Ltd', 'logo.png' }
-- { 'ceo_staff', null, 'VERSO Staff', null }
```

### Component Architecture

```
/versotech_main (unified portal)
├── /dashboard
│   ├── ceo-dashboard.tsx
│   ├── arranger-dashboard.tsx
│   ├── investor-dashboard.tsx
│   ├── partner-dashboard.tsx
│   ├── introducer-dashboard.tsx
│   ├── commercial-partner-dashboard.tsx
│   └── lawyer-dashboard.tsx
├── /deals
├── /subscriptions
├── /subscription-packs
├── /portfolio
├── /opportunities
├── /fees
├── /reconciliation
├── /my-partners (arranger view)
├── /my-introducers (arranger view)
├── /my-commercial-partners (arranger view)
├── /my-lawyers (arranger view)
├── /partner-profile
├── /introducer-profile
├── /lawyer-profile
└── /escrow
```

### Sidebar Navigation by Persona

The `persona-sidebar.tsx` component dynamically renders navigation based on active persona:

```typescript
// Persona-specific navigation items
const ceoNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/users', icon: Users, label: 'Users' },
  { href: '/deals', icon: FileText, label: 'Deals' },
  { href: '/vehicles', icon: Building2, label: 'Vehicles' },
  { href: '/subscriptions', icon: ClipboardList, label: 'Subscriptions' },
  // ... more items
];

const investorNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/opportunities', icon: TrendingUp, label: 'Opportunities' },
  { href: '/portfolio', icon: PieChart, label: 'Portfolio' },
  { href: '/subscription-packs', icon: Package, label: 'Subscription Packs' },
  // ... more items
];
```

---

## Summary

The VERSO Holdings platform is a sophisticated multi-persona investment management system where:

1. **CEO/Staff** creates and manages all aspects of deals and users
2. **Arrangers** manage specific vehicles/deals under their mandate
3. **Partners** can SHARE deals with their network (unique capability)
4. **Introducers** have formal agreements for referrals
5. **Commercial Partners** execute on behalf of wealth management clients
6. **Lawyers** handle escrow and fee payments
7. **Investors** go through a structured journey from interest to investment

The core business flow moves through:
**Deal Setup → Dispatch → Interest → NDA → Subscription → Signature → Funding → Certificate**

All personas interact through a unified platform with persona-specific navigation and capabilities, managed through PostgreSQL RLS policies at the database level.

---

## 10. Partner SHARE Feature (Critical Differentiator)

The Partner SHARE feature is one of the most important business processes - it allows Partners to directly distribute deals to their investor network.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         PARTNER SHARE WORKFLOW                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. CEO DISPATCHES DEAL TO PARTNER                                               │
│     ├── Partner receives notification                                            │
│     ├── Partner fee model auto-attached                                          │
│     └── Partner can view deal in "My Transactions"                               │
│                                                                                  │
│  2. PARTNER CLICKS "SHARE" (share-deal-dialog.tsx)                               │
│     ┌─────────────────────────────────────────────────────────────────────┐     │
│     │  Select Investor(s):  [✓] John Smith    [$500K typical]             │     │
│     │                       [✓] ABC Family Office [$2M typical]           │     │
│     │  Include Introducer:  [ ] Optional - Select Introducer              │     │
│     │  Message to Investors: [                                    ]       │     │
│     │  [Cancel]                               [Share to X Investors]      │     │
│     └─────────────────────────────────────────────────────────────────────┘     │
│                                                                                  │
│  3. SYSTEM AUTO-ACTIONS                                                          │
│     ├── Creates deal_memberships with referred_by_entity_type = 'partner'        │
│     ├── Applies partner's fee model to future subscriptions                      │
│     ├── CCs CEO and Arranger automatically                                       │
│     └── If introducer selected: sets introducer reference too                    │
│                                                                                  │
│  4. PARTNER TRACKS PROGRESS (shared-transactions page)                           │
│     DISPATCHED → VIEWED → INTERESTED → NDA → PACK → SIGNED → FUNDED             │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Partner vs Introducer Key Difference

| Aspect | Partner | Introducer |
|--------|---------|------------|
| **Direct SHARE** | ✅ Can SHARE deals directly | ❌ Cannot SHARE directly |
| **Agreement Required** | No formal agreement | Must have signed Introduction Agreement |
| **Workflow** | Self-service distribution | Formal approval process |

---

## 11. Commercial Partner Proxy Mode

Commercial Partners (wealth managers) can **subscribe on behalf of clients**.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    COMMERCIAL PARTNER PROXY MODE                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  SUBSCRIBE AS:  ○ Myself (as investor)                                           │
│                 ● On behalf of client                                            │
│                                                                                  │
│  Select Client: [▼ Client A - John Smith Family Trust    ]                      │
│                                                                                  │
│  Subscription created with:                                                      │
│    subscription.submitted_by_proxy = true                                        │
│    subscription.proxy_user_id = CP user's ID                                     │
│    subscription.proxy_commercial_partner_id = CP entity ID                       │
│    subscription.investor_id = Client's investor entity ID                        │
│                                                                                  │
│  CP tracks all client subscriptions in "Client Transactions" page                │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 12. Lawyer Escrow Confirmation Workflow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    LAWYER ESCROW CONFIRMATION                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Bank receives wire → Staff imports CSV → Reconciliation matches                 │
│                                                                                  │
│  LAWYER CONFIRMATION (escrow-confirm-modal.tsx):                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │  Subscription: Deal ABC - Investor John Smith                       │        │
│  │  Expected: $500,000.00 USD   Received: $500,000.00 USD             │        │
│  │  Status: ✓ Exact Match                                              │        │
│  │  [ ] I confirm funds have been received and verified                │        │
│  │  [Confirm Funding]                                                  │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
│  On confirmation:                                                                │
│    → Subscription status → 'active'                                              │
│    → Position created in portfolio                                               │
│    → Fee events generated for partners/introducers                               │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 13. Quick Reference: Persona Capabilities Matrix

| Action | CEO | Arranger | Partner | Introducer | Commercial Partner | Lawyer | Investor |
|--------|-----|----------|---------|------------|-------------------|--------|----------|
| **Create Users** | ✅ All | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Create/Dispatch Deals** | ✅ | ✅ Own | ❌ | ❌ | ❌ | ❌ | ❌ |
| **SHARE Deals** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Create Fee Plans** | ✅ | ✅ Own | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Subscribe to Deals** | ❌ | ❌ | ✅ Self | ✅ Self | ✅ Self+Clients | ❌ | ✅ |
| **Proxy Subscribe** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Confirm Escrow** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Process Payments** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Submit Invoice** | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **View Portfolio** | All | Own | Own | Own | Clients | ❌ | Own |

---

## 14. Database Entity Quick Map

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ENTITY RELATIONSHIPS                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  auth.users (1:1) → profiles                                                     │
│       │                                                                          │
│       ├── investor_users ─────→ investors ─────→ investor_members (KYC)         │
│       ├── arranger_users ─────→ arranger_entities                               │
│       ├── introducer_users ───→ introducers ───→ introducer_agreements          │
│       ├── partner_users ──────→ partners                                        │
│       ├── commercial_partner_users → commercial_partners → cp_clients           │
│       └── lawyer_users ───────→ lawyers                                         │
│                                                                                  │
│  vehicles (1:M) → deals (1:M) → subscriptions                                   │
│       │               │               │                                          │
│       │               │               └── fee_events, positions                  │
│       │               │                                                          │
│       │               └── deal_memberships (investor journey tracking)          │
│       │               └── deal_lawyer_assignments                                │
│       │                                                                          │
│       └── arranger_entity_id (who manages)                                      │
│                                                                                  │
│  Commission Tables:                                                              │
│    partner_commissions, introducer_commissions, commercial_partner_commissions  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 15. Notification Trigger Reference

| Event | Notified Personas |
|-------|-------------------|
| Deal dispatched | Investors, Partners, Introducers, Commercial Partners |
| Interest expressed | CEO, Arranger, Referring Partner |
| NDA signed | CEO, Arranger |
| Subscription pack sent | Investor |
| Pack signed (investor) | CEO, Arranger, Assigned Lawyers |
| Escrow funded | CEO, Arranger, Lawyers |
| Certificate issued | Investor |
| Payment requested | Lawyers, CEO |
| Payment completed | Partner/Introducer/CP, CEO, Arranger |
| Agreement dispatched | Introducer/Commercial Partner |
| KYC approved/rejected | Investor |

---

# ADDENDUM: Deep Audit Findings (January 2, 2026)

The following sections document processes discovered during comprehensive code audit that were missing or incomplete in the original document.

---

## 16. Document Generation System (n8n Workflows)

The platform uses **n8n workflows** for document generation, NOT direct PDF libraries. This is a critical architectural detail.

### 16.1 Workflow-Based Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DOCUMENT GENERATION ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│   VERSO Portal                              n8n Workflow Server                   │
│   ───────────                               ──────────────────                    │
│                                                                                   │
│   Staff clicks "Generate"                                                         │
│         │                                                                         │
│         ▼                                                                         │
│   triggerWorkflow()  ──── webhook ────►  Workflow receives payload               │
│   (HMAC-SHA256 signed)                          │                                │
│         │                                       ▼                                │
│         │                              Generate PDF (external)                   │
│         │                                       │                                │
│         │                                       ▼                                │
│         │                              Upload to Supabase Storage                │
│         │                                       │                                │
│         ◄──── callback webhook ───────  Send completion callback                 │
│         │                                                                         │
│         ▼                                                                         │
│   Create document record                                                          │
│   Notify investor                                                                 │
│                                                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 16.2 Available Workflows ⚠️ CORRECTED

**Evidence:** `src/lib/workflows.ts:processWorkflows[]`

| Workflow Key | Purpose | Trigger | Output | Status |
|--------------|---------|---------|--------|--------|
| `generate-position-statement` | Investor statements | Manual | PDF with NAV, holdings | ✅ VERIFIED |
| `generate-subscription-pack` | Subscription documents | Manual | Multi-document pack | ✅ VERIFIED |
| `generate-investment-certificate` | Equity certificates | Manual/Both | Certificate PDF | ✅ VERIFIED |
| `process-nda` | NDA generation via n8n | Manual | Signed NDA | ✅ VERIFIED |
| `capital-call-processing` | Capital call notices | Manual | Call notice PDF | ✅ VERIFIED |
| `reporting-agent` | Quarterly/annual reports | Both | Report PDFs | ✅ VERIFIED |
| `shared-drive-notification` | Document update notifications | Scheduled | Notifications | ✅ NEW - ADDED |
| `inbox-manager` | Route investor communications | Both | Task routing | ✅ NEW - ADDED |
| `linkedin-leads-scraper` | Lead generation | Manual | Contact list | ✅ NEW - ADDED |
| `kyc-aml-processing` | KYC/AML compliance | Manual | Compliance report | ✅ NEW - ADDED |
| `investor-onboarding` | Full onboarding flow | Manual | Multi-step process | ✅ NEW - ADDED |

**Note:** DocuSign is referenced in `process-nda` description but actual integration is via external n8n workflow, not direct API.

### 16.3 VERSOSign (Custom E-Signature System) ✅ VERIFIED

**Evidence:** `src/lib/signature/pdf-processor.ts`

VERSOSign is a **built-in e-signature system** (NOT DocuSign) using:
- `pdf-lib` for signature embedding → `embedSignatureInPDF()` function at line 19
- Token-based signature requests (7-day expiry)
- React Signature Canvas for drawing

**Key Functions:**
- `PDFDocument.load(pdfBytes)` - Load PDF
- `pdfDoc.embedPng(signatureImageBytes)` - Embed signature image
- `lastPage.drawImage()` - Place signature on page
- `lastPage.drawText()` - Add timestamp and signer metadata

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         VERSOSIGN SIGNATURE FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│   1. Create signature_request with token                                          │
│   2. Send email with /sign/{token} link                                           │
│   3. User opens sign page, views document                                         │
│   4. User draws signature on canvas                                               │
│   5. Submit → /api/signature/submit                                               │
│   6. System embeds signature in PDF via pdf-lib                                   │
│   7. Upload signed PDF to Supabase Storage                                        │
│   8. Webhook triggers completion handlers                                         │
│                                                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 17. KYC Document Types (Complete List) ⚠️ CORRECTED

**Evidence:** `src/constants/kyc-document-types.ts:SUGGESTED_KYC_DOCUMENT_TYPES`

### 17.1 KYC Document Categories (17 Types - was 16)

| Document Type | Category | Required For | Status |
|--------------|----------|--------------|--------|
| `questionnaire` | Both | All investors | ✅ VERIFIED |
| `nda_ndnc` | Entity | Entity investors | ✅ VERIFIED |
| `incorporation_certificate` | Entity | Companies | ✅ VERIFIED |
| `memo_articles` | Entity | Companies | ✅ VERIFIED |
| `register_members` | Entity | Shareholder companies | ✅ VERIFIED |
| `register_directors` | Entity | Companies | ✅ VERIFIED |
| `bank_confirmation` | Entity | All entities | ✅ VERIFIED |
| `trust_deed` | Entity | Trusts | ✅ VERIFIED |
| `financial_statements` | Entity | Companies | ✅ VERIFIED |
| `beneficial_ownership` | Entity | All entities | ✅ VERIFIED |
| `passport_id` | Both | All investors | ✅ VERIFIED |
| `utility_bill` | Both | Address verification | ✅ VERIFIED |
| `accreditation_letter` | Individual | US accredited investors | ✅ VERIFIED |
| `tax_w8_ben` | Both | Non-US investors | ✅ VERIFIED |
| `tax_w9` | Individual | US investors | ✅ VERIFIED |
| `source_of_funds` | Both | AML compliance | ✅ VERIFIED |
| `other` | Both | Any other supporting document | ✅ NEW - ADDED |

### 17.2 KYC Workflow States

```
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED / REJECTED / REQUIRES_MORE_INFO
```

### 17.3 KYC Expiry Reminders

**Cron Job:** `/api/cron/kyc-expiry-reminders`
- Runs daily
- Notifies investors 30/14/7 days before KYC expiry
- Creates tasks for staff to follow up

---

## 18. Capital Calls & Distributions ✅ VERIFIED

### 18.1 Capital Call Workflow (IMPLEMENTED) ✅ VERIFIED

**Evidence:** `src/app/api/capital-calls/route.ts:POST`

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         CAPITAL CALL WORKFLOW                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│   1. CEO creates capital call for vehicle                                         │
│      POST /api/capital-calls                                                      │
│      - vehicle_id, call_percentage, due_date, wire_deadline                       │
│                                                                                   │
│   2. System calculates per-investor amounts based on commitments                  │
│                                                                                   │
│   3. Notifications sent to investors                                              │
│      - createInvestorNotification('capital_call', ...)                            │
│                                                                                   │
│   4. Investors view call in dashboard                                             │
│      - Amount due, wire instructions, deadline                                    │
│                                                                                   │
│   5. Investors fund via bank transfer                                             │
│                                                                                   │
│   6. Staff reconciles payments                                                    │
│      - Mark call as complete when all funded                                      │
│                                                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 18.2 Distributions (PARTIAL - Vehicle Level Only) ✅ VERIFIED

**Evidence:** `src/app/api/distributions/route.ts:POST`

```
POST /api/distributions
{
  vehicle_id: uuid,
  name: "Q4 2025 Distribution",
  amount: 1000000,
  date: "2025-12-31",
  classification: "return_of_capital"
}
```

**⚠️ NOT IMPLEMENTED (Confirmed via code search):**
- Per-investor amount calculation - NO code found
- Payment tracking per investor - NO code found
- Distribution statements - NO code found
- Waterfall logic - NO code found
- Investor notifications for distributions - NOT in route handler

---

## 19. Secondary Market / Sell Position (PARTIAL) ✅ VERIFIED

**Evidence:**
- API: `src/app/api/investor/sell-request/route.ts`
- Form: `src/components/investor/sell-position-form.tsx`
- Table: `investor_sale_requests`

### 19.1 Implemented Features

| Feature | Status | Evidence |
|---------|--------|----------|
| Sell request form | ✅ Built | `sell-position-form.tsx` |
| Request submission API | ✅ Built | `sell-request/route.ts:POST` |
| CEO approval queue | ✅ Built | Creates approval with `entity_type: 'sale_request'` |
| Status tracking UI | ✅ Built | `sale-status-tracker.tsx` |
| Investor notifications | ✅ Built | Via approvals system |

### 19.2 Sell Position Workflow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SELL POSITION WORKFLOW                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│   INVESTOR                  CEO                     STAFF                         │
│   ────────                  ───                     ─────                         │
│                                                                                   │
│   Portfolio page                                                                  │
│   "Request Sale" button                                                           │
│         │                                                                         │
│         ▼                                                                         │
│   SellPositionForm                                                                │
│   - Amount (validated)                                                            │
│   - Asking price (optional)                                                       │
│   - Notes                                                                         │
│         │                                                                         │
│         ▼                                                                         │
│   Submit ────────────────► Approval Queue                                         │
│                                  │                                                │
│                            APPROVE/REJECT                                         │
│                                  │                                                │
│   Notification ◄──────────────────                                                │
│                                  │                                                │
│                                  ▼                                                │
│                            Staff finds buyer ───► PATCH matched_buyer_id          │
│                                  │                                                │
│   "Buyer Found" ◄────────────────                                                 │
│                                  │                                                │
│                            Process transfer (manual)                              │
│                                  │                                                │
│   "Sale Complete" ◄──────────────                                                 │
│                                                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 19.3 NOT IMPLEMENTED for Secondary

| Feature | Status |
|---------|--------|
| Buyer matching algorithm | ❌ Manual only |
| Certificate cancellation | ❌ Not built |
| Certificate reissuance | ❌ Not built |
| Tax tracking (cost basis) | ❌ Not built |
| Secondary fees/spread | ❌ Not built |
| Tender offers | ❌ Not built |
| Marketplace | ❌ Not built |

---

## 20. Conversion & Redemption Events (NOT IMPLEMENTED) ✅ VERIFIED

### 20.1 Critical Finding ✅ VERIFIED

**Conversion and redemption workflows are NOT IMPLEMENTED** in the current codebase.

**Verification Method:** Exhaustive grep search for `conversion`, `redemption`, `redeem`, `entity_events`

### 20.2 What EXISTS (Infrastructure Only) ⚠️ CORRECTED

| Component | Status | Evidence | Notes |
|-----------|--------|----------|-------|
| `entity_events` table | EXISTS | `src/app/api/entities/[id]/events/route.ts` | **READ-ONLY** - no POST/CREATE handler |
| `folder_type: 'redemption_closure'` | EXISTS | TypeScript types | Document folder type defined only |
| `fee_frequency: 'on_exit'` | EXISTS | `src/lib/fees/types.ts:FeeFrequency` | Type defined, NO trigger mechanism |
| ~~`calculate_investor_performance_fee()`~~ | ❌ DOES NOT EXIST | Searched entire codebase | **CORRECTED: No such RPC function** |
| Performance fee calculation | EXISTS | `src/lib/fees/calculations.ts` | `calculateSimplePerformanceFee()`, `calculateTieredPerformanceFee()` - but NO trigger |

### 20.3 What's MISSING

**Conversion Events (Note → Equity):**
- No conversion event creation UI
- No investor notification for conversions
- No election workflow
- No position update on conversion
- No certificate re-issuance

**Redemption Events (Exit/Liquidation):**
- No redemption event creation
- No pricing calculator
- No payment processing queue
- No position closure workflow
- No final statement generation

**Corporate Actions:**
- Stock splits: NOT BUILT
- IPO events: NOT BUILT
- M&A handling: NOT BUILT
- Warrant exercises: NOT BUILT

---

## 21. Cron Jobs & Scheduled Tasks ⚠️ CORRECTED

**Evidence:** `src/app/api/cron/` directory

### 21.1 Implemented Cron Jobs (10 Total - was 6)

| Endpoint | Purpose | Schedule | Status |
|----------|---------|----------|--------|
| `/api/cron/kyc-expiry-reminders` | KYC expiration warnings | Daily | ✅ VERIFIED |
| `/api/cron/term-sheet-reminders` | Term sheet deadline reminders | Daily | ✅ VERIFIED |
| `/api/cron/agreement-reminders` | Introduction agreement reminders | Daily | ✅ VERIFIED |
| `/api/cron/data-room-expiry` | Expire data room access | Daily | ✅ VERIFIED |
| `/api/cron/data-room-expiry-warnings` | Warn before expiry | Daily | ✅ VERIFIED |
| `/api/cron/publish-documents` | Publish scheduled documents | Hourly | ✅ VERIFIED |
| `/api/cron/unpublish-documents` | Unpublish expired documents | Hourly | ✅ NEW - ADDED |
| `/api/cron/auto-match-reconciliation` | Auto-match bank transactions | TBD | ✅ NEW - ADDED |
| `/api/cron/cleanup-stale-locks` | Clean up stale database locks | Daily | ✅ NEW - ADDED |
| `/api/cron/fees/generate-scheduled` | Generate scheduled fee events | TBD | ✅ NEW - ADDED |

---

## 22. Task Management System ✅ VERIFIED

**Evidence:** `src/app/api/tasks/route.ts`

### 22.1 Task Table Schema

| Column | Purpose |
|--------|---------|
| `id` | Primary key |
| `title` | Task title |
| `description` | Task details |
| `status` | pending, in_progress, completed, cancelled |
| `priority` | low, medium, high, urgent |
| `due_date` | Deadline |
| `assigned_to` | Staff user ID |
| `entity_type` | Related entity type |
| `entity_id` | Related entity ID |
| `created_by` | Creator user ID |

### 22.2 Task Creation Triggers

Tasks are auto-created by:
- KYC expiry warnings
- Agreement reminders
- Document generation failures (fallback)
- Approval timeouts
- Manual staff creation

---

## 23. Request Tickets System

### 23.1 Table: `request_tickets`

Handles investor support requests:
- Statement requests
- Document requests
- General inquiries

### 23.2 Ticket Workflow

```
OPEN → IN_PROGRESS → RESOLVED / CLOSED
```

---

## 24. Audit Logging

### 24.1 Audit Log Schema

```typescript
await auditLogger.log({
  actor_user_id: user.id,
  action: AuditActions.CREATE | UPDATE | DELETE | VIEW | APPROVE | REJECT,
  entity: AuditEntities.DEALS | SUBSCRIPTIONS | INVESTORS | etc.,
  entity_id: uuid,
  metadata: { /* context */ }
})
```

### 24.2 Logged Actions

- User authentication events
- Profile changes
- Document access/downloads
- Approval decisions
- Subscription status changes
- Admin operations
- Data exports

---

## 25. External Integrations Summary

| Integration | Purpose | Status |
|-------------|---------|--------|
| **Supabase** | Auth, Database, Storage | ✅ Core |
| **n8n** | Workflow automation | ✅ Documents |
| **Resend** | Email delivery | ✅ Notifications |
| **pdf-lib** | PDF manipulation | ✅ Signatures |
| **DocuSign** | (NDA only via n8n) | ✅ Limited |

---

## 26. Implementation Status Summary ✅ ALL VERIFIED

### 26.1 Fully Implemented

| Feature | Evidence | Status |
|---------|----------|--------|
| 7 Persona System with dynamic navigation | `src/components/layout/persona-sidebar.tsx` | ✅ VERIFIED |
| Deal lifecycle (Setup → Dispatch → Interest → NDA → Subscription → Signature → Funding → Certificate) | Multiple API routes in `src/app/api/` | ✅ VERIFIED |
| Partner SHARE feature | `src/app/api/partners/me/share/route.ts` | ✅ VERIFIED |
| Commercial Partner Proxy Mode | `src/components/` (commercial-partners) | ✅ VERIFIED |
| Lawyer Escrow Confirmation | `src/app/api/escrow/` | ✅ VERIFIED |
| KYC workflow with document types | `src/constants/kyc-document-types.ts` (17 types) | ✅ VERIFIED |
| Fee plans and commission tracking | `src/lib/fees/` directory | ✅ VERIFIED |
| VERSOSign e-signature system | `src/lib/signature/pdf-processor.ts` | ✅ VERIFIED |
| n8n document generation workflows | `src/lib/workflows.ts` (11 workflows) | ✅ VERIFIED |
| Notification system (in-app + email) | `src/lib/notifications.ts` | ✅ VERIFIED |
| Audit logging | `src/lib/audit.ts` | ✅ VERIFIED |
| Reconciliation matching | `src/app/api/staff/reconciliation/` | ✅ VERIFIED |
| Capital calls | `src/app/api/capital-calls/route.ts` | ✅ VERIFIED |

### 26.2 Partially Implemented

| Feature | Evidence | What's Missing |
|---------|----------|----------------|
| Secondary market | `src/app/api/investor/sell-request/route.ts` | No buyer matching, no marketplace |
| Distributions | `src/app/api/distributions/route.ts` | Vehicle-level only, no per-investor, no waterfall |
| Exit fees | `src/lib/fees/calculations.ts` | Calculation exists, NO trigger mechanism |

### 26.3 Not Implemented (Confirmed via Code Search)

| Feature | Search Result | Status |
|---------|---------------|--------|
| Conversion events (note → equity) | No creation endpoint found | ❌ VERIFIED MISSING |
| Redemption events (exits/liquidations) | No redemption workflow | ❌ VERIFIED MISSING |
| Corporate actions (splits, IPO, M&A) | Not found in codebase | ❌ VERIFIED MISSING |
| Certificate cancellation/reissuance | Not found in codebase | ❌ VERIFIED MISSING |
| Secondary marketplace | Not found in codebase | ❌ VERIFIED MISSING |
| Tender offers / buybacks | Not found in codebase | ❌ VERIFIED MISSING |
| Tax document generation (K-1s) | Not found in codebase | ❌ VERIFIED MISSING |
| Distribution waterfall logic | Not found in codebase | ❌ VERIFIED MISSING |

---

## Document Version

- **Version**: 3.0 (with Verification Audit)
- **Generated**: January 2026
- **Updated**: January 2, 2026 (Verification Audit)
- **Source Analysis**: User stories, codebase exploration, database schema analysis, 14-agent parallel audit
- **Verification**: Exhaustive codebase search with file path evidence for each claim
- **Coverage**: 7 personas, 113+ database tables, complete deal-to-certificate lifecycle, implementation gap analysis

### Verification Statistics

| Metric | Count |
|--------|-------|
| Total claims verified | 25+ |
| Claims confirmed correct | 20 |
| Claims corrected | 5 |
| File paths provided as evidence | 30+ |
| Codebase search methods used | Glob, Grep, Read |

### Key Corrections Made

1. **Workflow count**: 6 → 11 workflows in `src/lib/workflows.ts`
2. **KYC document types**: 16 → 17 types (added `other`)
3. **Cron jobs**: 6 → 10 jobs in `src/app/api/cron/`
4. **RPC function claim**: `calculate_investor_performance_fee` DOES NOT EXIST (removed false claim)
5. **DocuSign**: Clarified as external n8n workflow, not direct integration
