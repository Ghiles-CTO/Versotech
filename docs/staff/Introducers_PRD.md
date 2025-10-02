# Introducer Management PRD - VersoTech Staff Portal

**Version:** 1.0
**Product:** VERSO VersoTech Staff Portal
**Audience:** Business stakeholders, Product managers, Engineers
**Last Updated:** October 2, 2025

---

## Executive Summary

The Introducer Management module is VERSO's system for managing relationships with deal source partners—wealth managers, family offices, investment advisors, and professional networks who introduce qualified investors to VERSO deals in exchange for finder's fees or commission splits. When an introducer brings a new investor to VERSO, the system tracks the introduction, monitors the investor's participation journey (invited → joined → allocated), calculates commission owed based on agreed-upon rates, and manages commission payments.

This module ensures transparent introducer relationships, accurate commission tracking, and compliance with BVI regulatory requirements for introducer disclosures. Staff members use it to onboard new introducers with signed agreements, set default commission rates (typically 1-2% of invested capital), track introduction conversion rates, and manage commission payouts. The system prevents double-crediting (two introducers claiming same investor), provides audit trails for regulatory inspections, and incentivizes high-performing introducers with performance dashboards.

Behind the scenes, Introducer Management integrates with Deal Management (investor allocations trigger commission calculations), Investor Management (link introduced investors to introducers), and Reconciliation (commission payments tracked alongside fee collections). The module supports tiered commission structures, deal-specific rate overrides, and vesting schedules for long-term incentive alignment.

---

## Part 1: Business Context (Non-Technical)

### What is Introducer Management?

The Introducer Management module is the central system for managing VERSO's deal source partner network. It handles:

- **Introducer Onboarding**: Register new introducers with legal agreements, commission terms, contact details
- **Introduction Tracking**: Record when introducer brings prospect to specific deal, monitor progress
- **Commission Calculation**: Automatically calculate commission owed when introduced investor allocates capital
- **Payment Management**: Track commission payments, generate payment requests, update payment status
- **Performance Analytics**: Monitor introducer effectiveness (conversion rate, average allocation size, investor quality)
- **Agreement Management**: Store introducer agreements, track expiry dates, enforce commission caps
- **Compliance Reporting**: Generate introducer disclosure reports for BVI FSC regulatory filings

**Key Concepts:**

1. **Introducer**:
   - Legal entity or individual authorized to introduce investors to VERSO
   - Attributes: Legal name, contact person, email, commission rate (bps), status (active/inactive)
   - Types: Wealth managers, family offices, investment advisors, broker-dealers

2. **Introduction**:
   - A specific instance where introducer brings prospect to VERSO deal
   - Attributes: Introducer, prospect email, deal, introduction date, status
   - Statuses: invited → joined (accepted NDA) → allocated (committed capital) → inactive

3. **Commission**:
   - Fee paid to introducer based on investor's allocation
   - Calculation: `investor_allocation * (commission_bps / 10000)`
   - Types: One-time (on initial investment), trailing (annual % of NAV), performance-based (% of carry)
   - Statuses: pending (allocation confirmed) → approved (BizOps approved) → paid (payment sent)

4. **Commission Rate**:
   - Default rate: Set at introducer level (e.g., 150 bps = 1.5%)
   - Deal-specific override: Custom rate for specific deal (e.g., 200 bps for premium introductions)
   - Commission cap: Maximum commission per introduction (e.g., $50K cap)

### Why Does It Matter?

**For VERSO Business Development:**
- **Network Expansion**: Scale investor pipeline through incentivized introducer network
- **Quality Control**: Track introducer performance to identify high-quality sources
- **Cost Efficiency**: Pay for results (actual allocations) vs. marketing spend
- **Relationship Management**: Maintain introducer goodwill with transparent commission tracking

**For VERSO Finance Team:**
- **Commission Accuracy**: Eliminate disputes with clear calculation audit trail
- **Cash Flow Planning**: Forecast commission payments based on deal pipeline
- **Regulatory Compliance**: Demonstrate BVI-compliant introducer disclosure and compensation

**For VERSO Leadership:**
- **Channel ROI**: Measure cost of capital acquisition vs. direct marketing
- **Strategic Partnerships**: Identify top introducers for deeper partnerships
- **Market Intelligence**: Learn which geographies/investor types each introducer reaches

**For Introducers:**
- **Commission Transparency**: Real-time dashboard of introductions, allocations, earnings
- **Payment Predictability**: Know exactly when commissions will be paid
- **Performance Feedback**: See conversion rates to improve introduction quality

### How It Connects to Other Modules

- **Deal Management**: Investor allocations trigger commission calculation, link introduction to specific deal
- **Investor Management**: Introduced investors tagged with introducer ID, introduction tracking in investor profile
- **Fees Management**: Commission payments may be offset against management fees owed by introducers (if they're also investors)
- **Reconciliation**: Commission payments tracked in accounting, similar to fee invoice payments
- **Audit Log**: All commission calculations, overrides, and payments logged for regulatory compliance
- **Documents**: Introducer agreements stored in Documents module with expiry tracking

### Who Uses It?

**Primary Users:**
- **Business Development** (`staff_admin`): Onboard new introducers, negotiate commission terms
- **Operations Team** (`staff_ops`): Record introductions, monitor conversion funnel
- **Finance Team** (`staff_admin`): Approve commission payments, process payouts
- **Relationship Managers** (`staff_rm`): Coordinate with introducers on deal opportunities

**Access Levels:**
- `staff_admin` can create introducers, set commission rates, approve payments
- `staff_ops` can record introductions, view commission status
- `staff_rm` can view introducers and introductions for their deals

### Core Use Cases

**1. Onboarding New Introducer**

**Scenario:** Goldman Sachs Private Wealth approaches VERSO to introduce UHNW clients to VERSO deals in exchange for 1.5% finder's fee.

**Workflow:**
1. BizDev lead (Michael) negotiates introducer agreement with Goldman Sachs
2. Agreement terms:
   - Commission: 150 bps (1.5%) on initial investment
   - Commission cap: $50,000 per introduction
   - Payment timing: 30 days after investor's first capital call payment
   - Agreement term: 2 years (expires 2027-03-01)
3. Michael opens Introducer Management, clicks "Add Introducer"
4. Fills form:
   - Legal name: "Goldman Sachs Private Wealth Management LLC"
   - Contact person: "Marcus Goldman"
   - Email: "marcus.goldman@gs.com"
   - Default commission: 150 bps
   - Commission cap: $50,000
   - Agreement document: Uploads signed PDF
5. System creates `introducers` record, status = `active`
6. Goldman Sachs receives welcome email with introducer portal credentials (future feature)

**Result:** Goldman Sachs is onboarded and ready to introduce prospects

**2. Recording New Introduction**

**Scenario:** Goldman Sachs introduces "Jane Smith" (jane.smith@email.com) to VERSO's "AI Growth Fund" deal.

**Workflow:**
1. Goldman Sachs sends email to bizdev@versoholdings.com:
   - "Introducing Jane Smith, $2M+ investor interested in AI Growth Fund"
2. Michael records introduction:
   - Opens Introducer Management → "Recent Introductions" section
   - Clicks "Record Introduction"
   - Selects introducer: Goldman Sachs Private Wealth
   - Enters prospect email: jane.smith@email.com
   - Selects deal: AI Growth Fund
   - Commission rate: 150 bps (auto-populated from introducer default)
   - Clicks "Save Introduction"
3. System creates `introductions` record:
   - Status: `invited`
   - Introduction date: 2025-03-10
   - Sends Jane deal invitation email with custom NDA link
4. System creates task for ops team: "Follow up with Jane Smith introduction"

**Result:** Introduction tracked, prospect receives deal invitation

**3. Tracking Introduction Through Funnel**

**Scenario:** Jane Smith progresses from initial introduction to capital commitment.

**Workflow:**
1. **Stage 1 - Invited** (Day 0):
   - Jane receives deal invitation email
   - Introduction status: `invited`
   - Commission status: `pending` (no commission owed yet)
2. **Stage 2 - Joined** (Day 3):
   - Jane signs NDA via DocuSign
   - System automatically updates introduction status to `joined`
   - Jane gains access to deal room
3. **Stage 3 - Allocated** (Day 15):
   - Jane commits $2M to AI Growth Fund
   - Allocation approved by staff
   - System automatically:
     - Updates introduction status to `allocated`
     - Calculates commission: $2,000,000 × 1.5% = $30,000
     - Creates `commissions` record:
       - Introducer: Goldman Sachs
       - Amount: $30,000
       - Status: `pending_approval`
       - Due date: First capital call date + 30 days
     - Sends notification to Finance team: "New commission pending: Goldman Sachs, $30,000"
4. Finance team reviews and approves commission
5. After Jane pays first capital call, commission status → `approved`
6. Finance processes payment 30 days later, status → `paid`

**Result:** Full introduction lifecycle tracked with automated commission calculation

**4. Commission Approval & Payment**

**Scenario:** Finance team needs to approve and pay $30K commission to Goldman Sachs for Jane Smith introduction.

**Workflow:**
1. Finance analyst (Sarah) reviews pending commissions queue
2. Sees commission:
   - Introducer: Goldman Sachs Private Wealth
   - Investor: Jane Smith
   - Deal: AI Growth Fund
   - Allocation: $2,000,000
   - Commission: $30,000 (150 bps)
   - Status: `pending_approval`
3. Sarah verifies:
   - Jane's allocation is finalized (not pending approval)
   - Jane has paid first capital call ($500K paid on 2025-04-01)
   - Commission is within cap ($30K < $50K cap)
   - No duplicate commissions for same investor
4. Sarah clicks "Approve Commission"
5. System:
   - Updates commission status to `approved`
   - Calculates payment due date: First capital call date + 30 days = 2025-05-01
   - Sends notification to Goldman Sachs: "Commission approved: $30,000, payment due 2025-05-01"
6. On 2025-05-01, Finance processes wire payment
7. Sarah marks commission as `paid`, uploads payment confirmation
8. System sends Goldman Sachs payment receipt

**Result:** Commission approved, paid, and documented with full audit trail

**5. Handling Commission Disputes**

**Scenario:** Two introducers claim credit for same investor "Global Ventures Fund".

**Workflow:**
1. **Conflicting Claims**:
   - Goldman Sachs records introduction of "Global Ventures" on 2025-03-01
   - Meridian Capital records same introduction on 2025-03-05
2. Global Ventures allocates $5M to REAL Empire deal
3. System attempts to calculate commission → detects duplicate introduction
4. Alert sent to BizDev lead: "Duplicate introduction detected for Global Ventures Fund"
5. Michael investigates:
   - Checks timestamps: Goldman Sachs introduced first
   - Reviews investor communication: Global Ventures confirms Goldman Sachs was first contact
   - Contacts Meridian: "We're crediting GS as first introducer per timestamp"
6. Michael marks Meridian introduction as `duplicate`, adds note: "Investor confirmed GS first contact"
7. Commission flows to Goldman Sachs only
8. Meridian notified with explanation

**Result:** Fair attribution with documented investigation process

**6. Performance Analytics & Top Introducer Identification**

**Scenario:** BizDev wants to identify top-performing introducers for Q1 review.

**Workflow:**
1. Michael opens Introducer Management → Analytics view (future feature)
2. Reviews Q1 2025 metrics:
   - **Goldman Sachs**:
     - Introductions: 12
     - Allocations: 8
     - Conversion rate: 67%
     - Total capital introduced: $18M
     - Commissions earned: $270,000
     - Average allocation: $2.25M
   - **Meridian Capital**:
     - Introductions: 8
     - Allocations: 6
     - Conversion rate: 75%
     - Total capital introduced: $12M
     - Commissions earned: $180,000
     - Average allocation: $2M
   - **Elite Family Office**:
     - Introductions: 5
     - Allocations: 2
     - Conversion rate: 40%
     - Total capital introduced: $3M
     - Commissions earned: $52,500
     - Average allocation: $1.5M
3. Michael identifies Goldman Sachs as top performer (highest volume) and Meridian as quality leader (highest conversion)
4. Plans: Offer Goldman Sachs exclusive first look at next flagship fund, work with Elite to improve conversion

**Result:** Data-driven introducer relationship management

### Key Features (Business Language)

**Introducer Directory:**
- Comprehensive introducer records (legal name, contact, email, company)
- Commission rate configuration (default bps, deal-specific overrides)
- Status tracking (active, inactive, suspended)
- Agreement management (upload PDF, track expiry, renewal reminders)
- Commission caps (maximum per introduction, annual cap)
- Payment terms (net 30, net 60, payment method)

**Introduction Tracking:**
- Record prospect introductions (prospect email, deal, introduction date)
- Status funnel (invited → joined → allocated → inactive)
- Conversion timeline (days from introduction to allocation)
- Duplicate detection (prevent multiple introducers claiming same investor)
- Introduction notes (context about prospect, target allocation size)
- Attribution history (audit trail of introducer assignment changes)

**Commission Calculation:**
- Automatic calculation on investor allocation
- Formula: `allocation_amount * (commission_bps / 10000)`
- Commission cap enforcement (max $50K, max 2% of allocation, etc.)
- Deal-specific rate overrides (custom rates for specific deals)
- Multi-tier commissions (e.g., 2% on first $1M, 1% on remaining)
- Vesting schedules (50% upfront, 50% after 12 months if investor remains)

**Commission Management:**
- Commission approval workflow (ops records → finance approves → finance pays)
- Payment status tracking (pending → approved → paid → cancelled)
- Due date calculation (based on investor capital call payment + 30 days)
- Batch payment processing (group multiple commissions into single wire)
- Payment history (all commissions paid to introducer, year-to-date totals)
- Commission adjustments (corrections, disputes, chargebacks)

**Performance Metrics:**
- Introduction count (total introductions, by status)
- Conversion rate (% of introductions that allocate capital)
- Average allocation size ($ per successful introduction)
- Total capital introduced (sum of all allocations from introducer)
- Commissions earned (paid, pending, total lifetime)
- Average conversion time (days from introduction to allocation)

**Reporting:**
- Introducer performance report (PDF/Excel, quarterly)
- Commission payment report (for introducer tax filings, 1099-MISC equivalent)
- Introduction pipeline report (active introductions by status)
- Commission forecast report (pending commissions by expected payment date)
- Regulatory disclosure report (introducer relationships for BVI FSC)

### Business Rules

**Introducer Onboarding:**
- Must have signed introducer agreement on file before recording introductions
- Agreement must include: commission rate, payment terms, termination clause
- Default commission rate between 50-300 bps (0.5%-3%)
- Commission cap recommended (e.g., $50K-$100K per introduction)

**Introduction Recording:**
- Prospect email required (unique identifier for investor)
- Introduction date cannot be backdated >30 days
- Must link to specific deal (no generic introductions)
- Duplicate check: Alert if same prospect email introduced by different introducer within 90 days

**Commission Calculation Triggers:**
- Commission calculated when investor allocation status = `allocated` (not `pending_approval`)
- Uses allocation `commitment_amount` as base (not NAV or called capital)
- Commission rate: Deal-specific override > Introducer default
- Commission cap applied after rate calculation

**Commission Payment Rules:**
- Payment due date: Investor's first capital call payment date + 30 days (or per agreement)
- Payment approval required by `staff_admin` role
- Payment cannot be processed before investor pays first capital call
- Commission paid in same currency as investor allocation

**Commission Adjustments:**
- If investor allocation cancelled before first capital call → commission cancelled
- If investor reduces allocation before closing → commission recalculated
- If investor defaults on payment → commission subject to clawback
- Commission adjustments >10% require written justification

**Introducer Attribution Rules:**
- First introducer to record introduction gets credit (timestamp-based)
- If investor self-sources but introducer claims credit → require written investor confirmation
- If multiple introducers can prove involvement → manual arbitration by BizDev lead
- Attribution disputes resolved within 15 days of allocation

### Visual Design Standards

**Layout:**
- Header: "Introducer Management" title, "Add Introducer" button
- Stats row: 4 KPI cards (Active Introducers, Total Introductions, Commissions Paid, Pending Commissions)
- Search & Filters card (search, status filter, performance filter)
- Introducers table (list of introducers with metrics)
- Recent Introductions card (latest activity feed)

**Introducer Card Design:**
- Purple icon (HandHeart) in colored circle
- Introducer legal name (bold), contact person, email
- Default commission rate (e.g., "150 bps commission")
- Metrics row: Introductions, Allocations, Earned, Pending
- Status badge (active=green, inactive=gray)
- Edit button

**Color Coding:**
- **Introducer Status**:
  - Active: Green badge (`bg-green-100 text-green-800`)
  - Inactive: Gray badge (`bg-gray-100 text-gray-800`)
  - Suspended: Red badge (`bg-red-100 text-red-800`)
- **Introduction Status**:
  - Invited: Yellow dot (`bg-yellow-500`)
  - Joined: Blue dot (`bg-blue-500`)
  - Allocated: Green dot (`bg-green-500`)
  - Inactive: Gray dot (`bg-gray-400`)
- **Commission Status**:
  - Pending: Orange badge
  - Approved: Blue badge
  - Paid: Green badge

**Icons:**
- Active Introducers: `HandHeart`
- Total Introductions: `Users`
- Commissions Paid: `DollarSign`
- Pending Commissions: `Clock`

---

## Part 2: Technical Implementation

### Data Model Requirements

```sql
-- Introducers
create table introducers (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  user_id uuid references profiles(id), -- Contact person
  email text not null,
  default_commission_bps int check (default_commission_bps >= 0 and default_commission_bps <= 300) not null,
  commission_cap_amount numeric(15,2), -- Max commission per introduction
  status text check (status in ('active', 'inactive', 'suspended')) default 'active',
  agreement_doc_id uuid references documents(id),
  agreement_expiry_date date,
  payment_terms text, -- 'net_30', 'net_60'
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Introductions
create table introductions (
  id uuid primary key default gen_random_uuid(),
  introducer_id uuid references introducers(id) not null,
  prospect_email text not null,
  deal_id uuid references deals(id) not null,
  investor_id uuid references investors(id), -- Null until investor created
  introduced_at date default current_date,
  status text check (status in ('invited', 'joined', 'allocated', 'inactive')) default 'invited',
  commission_rate_override_bps int,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(prospect_email, deal_id)
);

-- Commissions
create table commissions (
  id uuid primary key default gen_random_uuid(),
  introducer_id uuid references introducers(id) not null,
  introduction_id uuid references introductions(id) not null,
  allocation_id uuid references allocations(id) not null,
  base_amount numeric(15,2) not null, -- Allocation amount
  commission_bps int not null,
  commission_amount numeric(15,2) not null,
  status text check (status in ('pending_approval', 'approved', 'paid', 'cancelled')) default 'pending_approval',
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  payment_due_date date,
  paid_at timestamptz,
  payment_reference text,
  notes text,
  created_at timestamptz default now()
);
```

### API Routes

**Record Introduction:**
```typescript
// app/api/staff/introducers/introductions/route.ts
export async function POST(req: Request) {
  const supabase = await createClient()
  const profile = await requireStaffAuth()

  const { introducer_id, prospect_email, deal_id, commission_rate_override_bps, notes } = await req.json()

  // Check for duplicate
  const { data: existing } = await supabase
    .from('introductions')
    .select('*')
    .eq('prospect_email', prospect_email)
    .eq('deal_id', deal_id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Introduction already exists for this prospect and deal' }, { status: 409 })
  }

  const { data: introduction, error } = await supabase
    .from('introductions')
    .insert({
      introducer_id,
      prospect_email,
      deal_id,
      commission_rate_override_bps,
      notes,
      created_by: profile.id
    })
    .select()
    .single()

  return NextResponse.json({ introduction })
}
```

---

## Part 3: Success Metrics

**Network Growth:**
- Active introducers: Target 20+ by end of year
- New introductions per month: Target 30+
- Introducer retention rate: Target >80% year-over-year

**Conversion Performance:**
- Overall conversion rate: Target >50% (introductions → allocations)
- Average time to allocation: Target <30 days
- Average allocation size: Target $1.5M+

**Financial Efficiency:**
- Commission cost as % of raised capital: Target <2%
- Introducer-sourced capital as % of total: Target 40%+
- ROI per introducer: Target 20x (capital raised / commissions paid)

---

## Document Version History

- v1.0 (October 2, 2025): Initial Introducer Management PRD with comprehensive business context and technical implementation roadmap
