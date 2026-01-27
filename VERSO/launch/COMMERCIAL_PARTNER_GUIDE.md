# Commercial Partner Business Guide

> **VERSO Holdings** | Investment Banking Operating System
> Last Updated: January 2026

---

> [!info] Implementation Status Legend
> Throughout this document, features are marked with their implementation status:
> - ✅ **Implemented** - Feature is fully available in the platform
> - ⚠️ **Partial** - Feature has limitations or is API-only
> - 🚧 **Planned** - Feature is documented but not yet implemented

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Model](#2-business-model)
3. [CP Lifecycle](#3-cp-lifecycle)
4. [Client Management Process](#4-client-management-process)
5. [Deal Participation](#5-deal-participation)
6. [Commission Process](#6-commission-process)
7. [Interactions with Other Parties](#7-interactions-with-other-parties)
8. [Key Metrics & Reporting](#8-key-metrics--reporting)
9. [Platform Navigation](#9-platform-navigation)
10. [Appendix A: Glossary](#appendix-a-glossary)
11. [Appendix B: Contact Information](#appendix-b-contact-information)
12. [Appendix C: Feature Implementation Status](#appendix-c-feature-implementation-status)

---

## 1. Executive Summary

### What is a Commercial Partner?

A **Commercial Partner (CP)** is an institutional placement agent, wealth manager, or distribution partner who facilitates investment opportunities between VERSO Holdings and their client base. CPs are distinct from regular Partners in that they manage bulk client relationships with white-label capabilities, formal placement agreements, and structured commission tracking.

**Examples of Commercial Partners:**
- Private wealth management firms
- Family offices
- Independent financial advisors (IFAs)
- Placement agents
- Distribution networks

### Why VERSO Needs Commercial Partners

Commercial Partners form the **distribution backbone** of VERSO's investment model:

| Without CPs | With CPs |
|-------------|----------|
| Direct investor outreach only | Leveraged distribution via established networks |
| Limited geographic reach | Access to regional wealth managers and their clients |
| High client acquisition cost | Lower cost per investor via CP relationships |
| Individual investor management | Bulk client placement capabilities |

### Value Proposition for Wealth Managers

| Benefit | Description |
|---------|-------------|
| **Curated Deal Flow** | Access to vetted alternative investment opportunities |
| **White-Label Capability** | Maintain client relationships while offering exclusive deals |
| **Structured Commissions** | Clear placement agreements with defined commission rates |
| **Professional Platform** | Modern portal for managing clients and tracking investments |
| **Compliance Support** | KYC/AML handled by VERSO, reducing regulatory burden |

---

## 2. Business Model

### Two Operating Modes

Commercial Partners can operate in two distinct modes, controlled by the `can_execute_for_clients` permission:

#### MODE 1: Direct Investment

The CP invests their own capital directly into deals as an investor.

```
┌─────────────────┐        ┌──────────────┐        ┌───────────────┐
│  Commercial     │  ───►  │   VERSO      │  ───►  │  Deal         │
│  Partner        │        │   Platform   │        │  (Vehicle)    │
│  (as Investor)  │        │              │        │               │
└─────────────────┘        └──────────────┘        └───────────────┘
```

- CP has their own investor entity
- Subscriptions are in CP's name
- Portfolio shows CP's personal holdings
- No proxy features required

#### MODE 2: Proxy/Client Execution

The CP executes subscriptions **on behalf of their clients** - the primary model for wealth managers.

```
┌─────────────────┐        ┌──────────────┐        ┌───────────────┐
│  CP's Client    │◄─────  │  Commercial  │  ───►  │  VERSO        │
│  (Investor)     │ auth   │  Partner     │ proxy  │  Platform     │
│                 │        │  (Agent)     │        │               │
└─────────────────┘        └──────────────┘        └───────────────┘
                                  │
                                  ▼
                           ┌───────────────┐
                           │  Deal         │
                           │  (Vehicle)    │
                           └───────────────┘
```

**Key characteristics of MODE 2:**
- CP registers clients in the platform
- Client must complete KYC independently
- CP can submit subscriptions on client's behalf
- Subscriptions linked to client's investor entity
- `proxy_commercial_partner_id` tracks the relationship

### Revenue Model

CPs earn commissions based on successful client placements:

| Component | Description |
|-----------|-------------|
| **Commission Basis** | Always calculated on `funded_amount` (not commitment) |
| **Rate** | Defined in placement agreement (typically 50-300 bps) |
| **Cap** | Optional maximum commission per deal |
| **Trigger** | Deal closes with funded positions |

**Commission Formula:**
```
Commission = Funded Amount × (Commission Rate BPS / 10,000)

Example:
- Client invests: $500,000
- CP commission rate: 150 bps (1.5%)
- Commission earned: $500,000 × (150/10,000) = $7,500
```

### Placement Agreement Structure

Every Commercial Partner relationship is governed by a **Placement Agreement** that defines:

| Field | Description |
|-------|-------------|
| `agreement_type` | Referral, Revenue Share, Fixed Fee, or Hybrid |
| `default_commission_bps` | Base commission rate in basis points |
| `commission_cap_amount` | Optional maximum commission per deal |
| `territory` | Geographic scope of distribution rights |
| `exclusivity_level` | Exclusive, Non-exclusive, or Preferred |
| `deal_types` | Asset classes the CP can distribute |
| `payment_terms` | Net 15, 30, 45, or 60 days |
| `effective_date` / `expiry_date` | Agreement validity period |

---

## 3. CP Lifecycle

### End-to-End Onboarding Process

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   1. INTRO   │───►│  2. KYC &    │───►│ 3. AGREEMENT │───►│ 4. ACTIVE    │
│              │    │  DUE DILIGENCE│    │  NEGOTIATION │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

#### Stage 1: Introduction

| Step | Actor | Action |
|------|-------|--------|
| 1.1 | Sales/BD | Identify potential CP (wealth manager, IFA, etc.) |
| 1.2 | Sales/BD | Initial pitch and platform demo |
| 1.3 | CP | Express interest in partnership |
| 1.4 | Arranger | Create CP entity in platform |

#### Stage 2: KYC & Due Diligence

| Step | Actor | Action |
|------|-------|--------|
| 2.1 | CP | Submit entity documentation |
| 2.2 | CP | Provide regulatory license information |
| 2.3 | Staff | Verify documentation |
| 2.4 | Staff | Complete AML screening |
| 2.5 | Staff | Update KYC status: `pending` → `approved` |

**Required KYC Documentation:**
- Entity registration certificate
- Regulatory license (if applicable)
- Beneficial ownership declaration
- AML/CFT compliance documentation
- Bank account details for commission payments

#### Stage 3: Agreement Negotiation

| Step | Actor | Action |
|------|-------|--------|
| 3.1 | Arranger | Draft placement agreement with terms |
| 3.2 | Arranger | Send agreement to CP for review |
| 3.3 | CP | Review and request amendments |
| 3.4 | Arranger | Finalize terms |
| 3.5 | CP | Sign agreement (via VersoSign) |
| 3.6 | CEO | Counter-sign agreement |
| 3.7 | System | Agreement status → `active` |

**Agreement Status Flow:**
```
                          ┌─────────────────────────────────────────────────────────────┐
                          │           ARRANGER-CREATED AGREEMENTS                       │
                          │  pending_internal_approval → (CEO internal approval) → draft│
                          └──────────────────────────────────────┬──────────────────────┘
                                                                 ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              STANDARD AGREEMENT FLOW                                   │
│   draft → sent → pending_approval → approved → pending_ceo_signature →                 │
│                                                pending_cp_signature → active           │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                                                    │
                                         ┌──────────────────────────┼───────────┐
                                         ▼                          ▼           ▼
                                    [expired]                 [terminated]  [renewed]
```

> [!note] Arranger-Created Agreements
> When an Arranger (non-CEO) creates a placement agreement, it starts with `pending_internal_approval` status and requires CEO approval before being sent to the Commercial Partner.

#### Stage 4: Activation

| Step | Actor | Action |
|------|-------|--------|
| 4.1 | Arranger | Grant platform access credentials |
| 4.2 | System | Assign `commercial_partner` persona to user |
| 4.3 | Arranger | Configure proxy permissions (if MODE 2) |
| 4.4 | CP | Complete platform onboarding/training |
| 4.5 | Arranger | Dispatch CP to first deal(s) |

### Activation Criteria

Before a CP can participate in deals, they must meet:

- [ ] KYC status: `approved`
- [ ] Active placement agreement (not expired)
- [ ] Platform credentials issued
- [ ] At least one user linked to CP entity
- [ ] Dispatched to at least one deal

---

## 4. Client Management Process

### How CPs Register Clients

CPs manage their investor clients through the **Client Transactions** page, which serves as the central hub for client relationship management.

#### Registering a New Client ⚠️ API Only

> [!warning] Current Limitation
> Client registration is currently available via **API only**. There is no "Add Client" button in the UI. Contact your Arranger to register new clients, or use the API endpoint directly.

**API Endpoint:** `POST /api/commercial-partners/me/clients`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_name` | string | Yes | Client's full name |
| `client_email` | string | No | Email for communication |
| `client_phone` | string | No | Contact phone number |
| `client_type` | enum | No | `individual` or `entity` (default: `entity`) |
| `client_investor_id` | uuid | No | Link to existing investor entity |
| `created_for_deal_id` | uuid | No | Associate with specific deal |

**Client Data Model:**
```typescript
{
  client_name: string           // Required
  client_email: string | null   // For communication
  client_phone: string | null   // Optional contact
  client_type: 'individual' | 'entity'  // Default: 'entity'
  client_investor_id: string | null  // Link to investor entity
  is_active: boolean            // Active/inactive status
  created_for_deal_id: string | null  // Optional deal association
}
```

### Client Journey Stages ✅ Auto-Calculated

VERSO tracks each client's progression through a **10-stage pipeline**:

```
┌──────────┐   ┌────────┐   ┌───────────┐   ┌───────────┐   ┌────────────┐
│ RECEIVED │ → │ VIEWED │ → │ INTEREST  │ → │    NDA    │ → │ DATA ROOM  │
│    (1)   │   │  (2)   │   │ CONFIRMED │   │  SIGNED   │   │   ACCESS   │
│          │   │        │   │    (3)    │   │    (4)    │   │    (5)     │
└──────────┘   └────────┘   └───────────┘   └───────────┘   └────────────┘
      │
      ▼
┌──────────┐   ┌────────┐   ┌───────────┐   ┌───────────┐   ┌────────────┐
│   PACK   │ → │  PACK  │ → │  SIGNED   │ → │  FUNDED   │ → │   ACTIVE   │
│GENERATED │   │  SENT  │   │    (8)    │   │    (9)    │   │   (10)     │
│   (6)    │   │  (7)   │   │           │   │           │   │            │
└──────────┘   └────────┘   └───────────┘   └───────────┘   └────────────┘
```

> [!info] Automatic Stage Calculation
> Journey stages are **automatically calculated** based on client activity via the `get_investor_journey_stage()` database function. CPs cannot manually move clients between stages. The system determines the current stage based on the most advanced completed milestone.

| Stage | Name | Auto-Trigger Condition |
|-------|------|------------------------|
| **1** | Received | Deal dispatched to investor (`dispatched_at` set) |
| **2** | Viewed | Investor viewed termsheet (`viewed_at` set) |
| **3** | Interest Confirmed | Investor confirmed interest (`interest_confirmed_at` set) |
| **4** | NDA Signed | NDA signing completed (`nda_signed_at` set) |
| **5** | Data Room Access | Dataroom access granted (`data_room_granted_at` set) |
| **6** | Pack Generated | Subscription pack generated (`pack_generated_at` set) |
| **7** | Pack Sent | Subscription pack sent to investor (`pack_sent_at` set) |
| **8** | Signed | Subscription documents signed (`signed_at` set) |
| **9** | Funded | Investment funds received (`funded_at` set) |
| **10** | Active | Position activated in vehicle (`activated_at` set) |

### Proxy Subscription Workflow (MODE 2) ✅ Implemented

When a CP has `can_execute_for_clients = true`, they can submit subscriptions on behalf of clients:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROXY SUBSCRIPTION WORKFLOW                          │
└─────────────────────────────────────────────────────────────────────────┘

Step 1: Prerequisites
├── CP is dispatched to deal with role: `commercial_partner_proxy`
├── Client is registered in CP's client list
└── Client has KYC status: `approved` or `verified`

Step 2: Enter Proxy Mode
├── Select client from dropdown
├── Banner displays: "Acting on behalf of: [Client Name] ([type])"
└── All actions now execute in proxy context

Step 3: Submit Subscription
├── Navigate to deal detail page
├── Select share class and enter commitment amount
├── Add optional notes
└── Submit subscription request

Step 4: Record Linkage
├── Subscription.investor_id → Client's investor entity
├── Subscription.proxy_commercial_partner_id → CP entity
├── Subscription.proxy_user_id → CP user
└── Subscription.submitted_by_proxy → true

Step 5: Exit Proxy Mode
└── Click "Exit Proxy Mode" to return to normal operation
```

### Client Authorization Requirements

| Requirement | Description |
|-------------|-------------|
| **Client KYC** | Client must have `kyc_status = 'approved'` before proxy subscription |
| **Client Agreement** | CP must have documented client authorization (offline) |
| **CP Dispatch** | CP must be dispatched to the specific deal |
| **Proxy Permission** | CP user must have `can_execute_for_clients = true` |

---

## 5. Deal Participation

### How CPs Get Access to Deals

Commercial Partners don't automatically see all deals. Access is controlled through **deal dispatching**:

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Arranger   │ ───► │  Dispatch    │ ───► │   CP Sees    │
│   Creates    │      │  CP to Deal  │      │   Deal in    │
│   Deal       │      │              │      │  Opportunities│
└──────────────┘      └──────────────┘      └──────────────┘
```

**Dispatch creates a `deal_memberships` entry:**

| Field | Value |
|-------|-------|
| `deal_id` | The specific deal |
| `user_id` | CP user's ID |
| `role` | `commercial_partner_investor` or `commercial_partner_proxy` |
| `dispatched_at` | Timestamp of dispatch |

### Deal Access Roles

| Role | Capabilities |
|------|--------------|
| `commercial_partner_investor` | View deal, subscribe for self (MODE 1) |
| `commercial_partner_proxy` | View deal, subscribe for self AND clients (MODE 2) |

### Fee Plan Assignment Process ✅ Staff-Managed

Each CP can have a custom fee structure per deal through **Fee Plans**:

> [!note] Staff-Only Creation
> Fee plans are created by **Staff or Arrangers only**. CPs cannot create their own fee plans. If you need a custom rate for a specific deal, contact your Arranger.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      FEE PLAN ASSIGNMENT                                 │
└──────────────────────────────────────────────────────────────────────────┘

Option A: Use Placement Agreement Default
├── CP subscribes to deal
└── Commission calculated using agreement's `default_commission_bps`

Option B: Custom Fee Plan for Deal (Arranger Creates)
├── Arranger creates fee plan with `commercial_partner_id` set
├── Fee plan specifies deal-specific rates
├── Can include multiple fee components
└── Overrides default agreement rate for this deal
```

**Fee Component Types:**
- `subscription` - One-time placement fee
- `management` - Annual management fee share
- `performance` - Carried interest / performance fee share
- `spread_markup` - Per-unit spread
- `flat` - Fixed amount
- `other` - Custom fee type

### Dispatch Workflow

| Step | Actor | Action |
|------|-------|--------|
| 1 | Arranger | Opens deal management page |
| 2 | Arranger | Navigates to "Dispatch" tab |
| 3 | Arranger | Selects CP(s) from available list |
| 4 | Arranger | Assigns dispatch role (investor/proxy) |
| 5 | Arranger | Confirms dispatch |
| 6 | System | Creates `deal_memberships` entries |
| 7 | CP | Sees deal in "Opportunities" page |

---

## 6. Commission Process

### When Commissions Are Created

Commissions are **automatically created when a deal closes**:

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Deal       │ ───► │  System      │ ───► │  Commission  │
│   Closes     │      │  Processes   │      │  Records     │
│              │      │  Positions   │      │  Created     │
└──────────────┘      └──────────────┘      └──────────────┘
```

**Trigger:** `handleDealClose()` or `handleTermsheetClose()` in `/src/lib/deals/deal-close-handler.ts`

**For each funded position involving a CP client:**
1. System identifies the Commercial Partner via direct linking:
   - `commercial_partner_id` on the subscription or fee plan
   - `deal_id` for deal context
   - `investor_id` for the client
   - `fee_plan_id` for the rate agreement
2. Looks up commission rate from placement agreement or fee plan
3. Calculates commission: `funded_amount × (rate_bps / 10,000)`
4. Creates `commercial_partner_commissions` record with status `accrued`

### Commission Calculation Formula

```
Commission = Funded Amount × (Commission Rate BPS / 10,000)

Important Notes:
- Commission basis is ALWAYS 'funded_amount'
- Management fees are NOT included in the basis
- Rate comes from placement agreement or deal-specific fee plan
```

**Example Calculations:**

| Client Investment | Commission Rate | Commission |
|------------------|-----------------|------------|
| $100,000 | 100 bps (1.0%) | $1,000 |
| $500,000 | 150 bps (1.5%) | $7,500 |
| $1,000,000 | 200 bps (2.0%) | $20,000 |

### Commission Status Lifecycle

```
┌──────────┐   ┌───────────────────┐   ┌──────────────────┐   ┌──────────┐   ┌────────┐
│ ACCRUED  │ → │ INVOICE_REQUESTED │ → │ INVOICE_SUBMITTED│ → │ INVOICED │ → │  PAID  │
└──────────┘   └───────────────────┘   └──────────────────┘   └──────────┘   └────────┘
     │                                                              │
     └──────────────────────────────────────────────────────────────┤
                                                                    ▼
                                                           ┌────────────────┐
                                                           │   CANCELLED    │
                                                           │   REJECTED     │
                                                           └────────────────┘
```

| Status | Description | Actor |
|--------|-------------|-------|
| `accrued` | Commission calculated at deal close | System |
| `invoice_requested` | Arranger has requested CP to submit invoice | Arranger |
| `invoice_submitted` | CP has uploaded their invoice document | CP |
| `invoiced` | VERSO has confirmed receipt and validity | Staff |
| `paid` | Payment has been processed and confirmed | Lawyer/Finance |
| `cancelled` | Commission cancelled (e.g., position unwound) | Staff |
| `rejected` | Invoice rejected (e.g., documentation issues) | Staff |

### Invoice Submission Workflow ✅ Implemented

| Step | Actor | Action |
|------|-------|--------|
| 1 | System | Commission created with status `accrued` at deal close |
| 2 | Arranger | Reviews accrued commissions, clicks "Request Invoice" |
| 3 | System | Status → `invoice_requested`, CP notified |
| 4 | CP | Views commission on "My Commissions" page (`/versotech_main/my-commissions`) |
| 5 | CP | Clicks "Submit Invoice", uploads PDF/image (max 10MB) |
| 6 | System | Status → `invoice_submitted` |
| 7 | Staff | Reviews invoice for accuracy |
| 8 | Staff | Approves invoice → status: `invoiced` |
| 9 | Lawyer/Finance | Processes payment |
| 10 | Lawyer | Clicks "Confirm Payment" → status: `paid` |

> [!important] Invoice Flow
> CPs cannot self-request invoices. The **Arranger must first request** the invoice before the CP can submit it. This ensures proper deal close verification before commission processing.

### Payment Confirmation Process

The **Lawyer persona** handles payment confirmation:

1. Lawyer receives notification of pending commission payment
2. Lawyer verifies funds have been transferred
3. Lawyer clicks "Confirm Payment" on commission record
4. System updates status: `invoiced` → `paid`
5. CP receives notification of payment completion

---

## 7. Interactions with Other Parties

### Working with Arrangers

**Arrangers** are the primary point of contact for CPs:

| Interaction | Description |
|-------------|-------------|
| **Onboarding** | Arranger creates CP entity and drafts placement agreement |
| **Deal Access** | Arranger dispatches CP to relevant deals |
| **Fee Plans** | Arranger creates deal-specific fee structures |
| **Support** | Arranger assists with platform questions |
| **Commission Recording** | Arranger can manually record commissions if needed |

### CEO/Staff Oversight

| Role | Responsibilities |
|------|------------------|
| **CEO** | Counter-signs placement agreements, strategic decisions |
| **Staff** | KYC verification, commission processing, general oversight |

### Lawyer Involvement in Payments

| Task | Description |
|------|-------------|
| **Invoice Review** | Lawyers may review large commission invoices |
| **Payment Processing** | Lawyers coordinate fund transfers |
| **Payment Confirmation** | Lawyers confirm completed payments in system |

### Investor Client Relationships

The CP maintains the primary relationship with their clients:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    RELATIONSHIP MODEL                                    │
└──────────────────────────────────────────────────────────────────────────┘

     ┌─────────────────┐           ┌─────────────────┐
     │     Client      │◄─────────►│   Commercial    │
     │   (Investor)    │  Direct   │    Partner      │
     │                 │  Relationship              │
     └─────────────────┘           └─────────────────┘
            ▲                             ▲
            │                             │
            │ Investment                  │ Platform &
            │ Record                      │ Commissions
            ▼                             ▼
     ┌─────────────────────────────────────────────┐
     │              VERSO Platform                 │
     │   (Subscription, Position, Commission)      │
     └─────────────────────────────────────────────┘
```

**Key Principles:**
- CP owns the client relationship (advisory, communication)
- VERSO manages the investment administration
- Client KYC is verified by VERSO
- Commissions flow through VERSO to CP
- Client can also access VERSO portal directly (if investor persona)

---

## 8. Key Metrics & Reporting

### Dashboard Metrics

The CP Dashboard displays real-time metrics:

| Metric | Description |
|--------|-------------|
| **Total Clients** | Number of clients registered |
| **Active Clients** | Clients with active status |
| **Dispatched Deals** | Number of deals CP has access to |
| **Active Opportunities** | Deals currently open for subscription |
| **Total Subscriptions** | Count of all client subscriptions |
| **Pending Subscriptions** | Subscriptions awaiting funding |
| **Own Investment Value** | CP's personal investment total (MODE 1) |
| **Client Investment Value** | Total client investments (MODE 2) |
| **Pending Agreements** | Placement agreements awaiting signature |
| **Active Agreements** | Currently valid placement agreements |
| **Commission Paid** | Total commissions received |
| **Commission Accrued** | Commissions earned but not yet paid |
| **Commission Pending** | Commissions with invoices submitted |

### Commission Tracking

CPs can track commissions across multiple states:

| View | Content |
|------|---------|
| **By Status** | Grouped by accrued/invoiced/paid |
| **By Client** | Commission breakdown per client |
| **By Deal** | Commission breakdown per deal |
| **By Period** | Monthly/quarterly aggregations |

### Client Transaction Reports ✅ Implemented

The Client Transactions page (`/versotech_main/client-transactions`) offers:

| Feature | Status | Description |
|---------|--------|-------------|
| **Table View** | ✅ | Traditional list with sortable columns |
| **Bucket View** | ✅ | Kanban-style grouping by journey stage (toggle with button) |
| **Summary Cards** | ✅ | Totals for clients, subscriptions, value, estimated commission |
| **Search** | ✅ | Find clients by name, email, or deal |
| **Filters** | ✅ | Active/inactive status filter |
| **CSV Export** | ✅ | Download transaction data (rate-limited: 1 export/minute) |
| **Add Client** | ⚠️ | API only - no UI button (see Section 4) |

### Export Capabilities

| Export | Format | Content |
|--------|--------|---------|
| **Client Transactions** | CSV | All client data with subscription details |
| **Commission Report** | CSV | Commission history with status |
| **Agreement Summary** | PDF | Placement agreement terms |

---

## 9. Platform Navigation

### CP Persona Menu

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Commercial Partner Navigation                                          │
├─────────────────────────────────────────────────────────────────────────┤
│  📊 Dashboard        → Overview of key metrics and activity            │
│  📈 Opportunities    → Browse available investment deals               │
│  👥 Client Transactions → Manage clients and track their investments   │
│  💼 Portfolio        → View personal investments (MODE 1)              │
│  📄 Agreements       → Placement agreement management                  │
│  🔔 Notifications    → System alerts and updates                       │
│  💬 Messages         → Communication with VERSO team                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Page-by-Page Guide

| Page | Purpose | Key Actions | Status |
|------|---------|-------------|--------|
| **Dashboard** | At-a-glance overview | View metrics, quick navigation | ✅ |
| **Opportunities** | Browse deals | View termsheets, access dataroom, subscribe | ✅ |
| **Client Transactions** | Client management | Track journey, view subscriptions, export CSV | ✅ |
| **My Commissions** | Commission tracking | View accrued/paid, submit invoices | ✅ |
| **Portfolio** | Personal investments | View holdings, performance, positions | ✅ |
| **Agreements** | Agreement management | View terms, sign pending agreements | ✅ |
| **Notifications** | System updates | Mark as read, filter by type | ✅ |
| **Messages** | Communication | Read/send messages, conversation history | ✅ ⚠️ |

> [!info] Opportunities Page
> The Opportunities page uses the shared investor UI component. CPs see deals they've been dispatched to, with full access to termsheets, datarooms, and subscription capabilities (based on their dispatch role).

> [!note] Messages Page Restrictions
> The Messages page is **blocked for users with only arranger or introducer personas** (unless they also have staff access). These roles are passive notification recipients. Use the Notifications page instead.

### Proxy Mode Interface ✅ Implemented

When operating in MODE 2, additional UI elements appear:

| Element | Location | Description |
|---------|----------|-------------|
| **Client Selector** | Proxy banner | Dropdown to select/switch active client |
| **Proxy Banner** | Top of page | Amber warning: "Acting on behalf of: [Client Name] ([type])" |
| **Exit Button** | Proxy banner | "Exit Proxy Mode" to return to normal operation |
| **Session Persistence** | Browser session | Proxy state saved in sessionStorage |

> [!tip] Proxy Mode State
> Your proxy mode selection persists during your browser session. If you close the browser or clear session storage, you'll need to re-enter proxy mode.

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **AUM** | Assets Under Management |
| **BPS / Basis Points** | 1 bps = 0.01% (100 bps = 1%) |
| **Dispatch** | Granting access to a specific deal |
| **Fee Plan** | Commercial agreement with rates for a specific deal |
| **Funded Amount** | Actual capital received from investor |
| **KYC** | Know Your Customer (identity verification) |
| **MODE 1** | CP invests directly as investor |
| **MODE 2** | CP executes subscriptions for clients (proxy) |
| **Placement Agreement** | Master agreement governing CP relationship |
| **Position** | Investor's holdings in a vehicle (units, NAV) |
| **Proxy** | Acting on behalf of another party |
| **Subscription** | Investor's capital commitment to a deal |
| **Vehicle** | Fund structure that holds investments |

---

## Appendix B: Contact Information

| Role | Contact Method | When to Use |
|------|----------------|-------------|
| **Your Arranger** | Platform messages | Deal questions, access issues |
| **Support Team** | support@versoholdings.com | Technical issues |
| **Finance/Payments** | Via Arranger | Commission payment queries |

---

## Appendix C: Feature Implementation Status

Quick reference for platform feature availability:

### Fully Implemented ✅

| Feature | Location |
|---------|----------|
| Proxy Mode UI (banner, selector, exit) | Header/Global |
| Proxy Subscription API | Deal detail pages |
| Client Transaction Table View | `/versotech_main/client-transactions` |
| Client Transaction Bucket View | `/versotech_main/client-transactions` |
| CSV Export (rate-limited) | `/versotech_main/client-transactions` |
| Journey Stage Display | Client Transactions |
| Commission Invoice Submission | `/versotech_main/my-commissions` |
| Placement Agreement Signing | `/versotech_main/placement-agreements` |
| Fee Plan per Deal | Created by Arranger |
| Dashboard Metrics | `/versotech_main/dashboard` |
| Portfolio Display | `/versotech_main/portfolio` |
| Notifications | `/versotech_main/notifications` |
| Messages | `/versotech_main/messages` (blocked for arranger/introducer-only users) |

### Partial / API Only ⚠️

| Feature | Current State | Workaround |
|---------|---------------|------------|
| Add Client UI | API available, no UI button | Contact Arranger or use API directly |
| Fee Plan Creation | Staff-only | Request from Arranger |

### Not Implemented 🚧

| Feature | Notes |
|---------|-------|
| Manual Journey Stage Update | Stages are auto-calculated from activity |
| Drag-and-drop Client Pipeline | View-only bucket display |
| CP Self-Request Invoice | Arranger must request first |

---

*This guide is maintained by VERSO Holdings. For platform updates and new features, check the Notifications center in your dashboard.*
