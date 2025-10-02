# Investor Management PRD - VersoTech Staff Portal

**Version:** 1.0
**Product:** VERSO VersoTech Staff Portal
**Audience:** Business stakeholders, Product managers, Engineers
**Last Updated:** October 2, 2025

---

## Executive Summary

The Investor Management module is the central hub for VERSO operations staff to oversee the complete investor lifecycle—from initial prospecting through KYC verification, onboarding, capital commitments, and ongoing relationship management. It provides a unified interface to manage both individual and institutional investors across all VERSO investment vehicles.

Staff members can view real-time KYC status, track compliance requirements, assign relationship managers, monitor capital call participation, and access complete investor histories. The module integrates with automated workflows for document processing, risk assessment, and regulatory reporting, ensuring that VERSO maintains BVI FSC compliance while delivering exceptional investor service.

At its core, this module transforms investor operations from scattered spreadsheets and email threads into a single source of truth with full audit trails, automated compliance checks, and proactive task management.

---

## Part 1: Business Context (Non-Technical)

### What is Investor Management?

The Investor Management module is the staff-facing system for managing all aspects of investor relationships within the VERSO ecosystem. It serves as the operational backbone for:

- **Investor Profiles**: Comprehensive records for individuals, family offices, funds, and institutional investors
- **KYC/AML Processing**: Document collection, verification, and compliance status tracking
- **Onboarding Workflows**: Automated task creation for profile completion, agreements, and portal access
- **Capital Tracking**: Total commitments, contributions, distributions, and unfunded balances across all vehicles
- **Relationship Management**: Assignment of relationship managers and communication history
- **Risk Assessment**: Automated risk scoring and compliance monitoring
- **Portal Access Control**: User account creation and permission management for investor portal

### Why Does It Matter?

**For VERSO Operations Team:**
- **Compliance Assurance**: Real-time visibility into KYC status ensures no investor slips through regulatory cracks
- **Workflow Automation**: Automated onboarding tasks reduce manual work and human error
- **Centralized Data**: Single source of truth eliminates spreadsheet versioning issues
- **Proactive Management**: Pending reviews and overdue tasks are surfaced automatically
- **Audit Readiness**: Complete history of all investor interactions and status changes

**For VERSO Leadership:**
- **Regulatory Confidence**: Demonstrate BVI FSC and GDPR compliance with audit trails
- **Investor Insights**: Portfolio composition, risk distribution, and capital commitment analytics
- **Operational Efficiency**: Reduce average time-to-onboard with automated workflows
- **Risk Management**: Early detection of high-risk investors or compliance issues

**For Relationship Managers:**
- **Investor 360 View**: Complete capital history, document status, and communication log in one place
- **Proactive Service**: Know exactly what each investor needs next (pending KYC, capital call response, etc.)
- **Performance Tracking**: Monitor investor engagement and satisfaction metrics

### How It Connects to Other Modules

- **Deal Management**: Investor allocations, commitments, and participation tracking flow from here
- **KYC Workflows**: Automated document requests, verification, and approval processes (n8n integration)
- **Task Management**: Creates onboarding tasks, KYC reviews, and compliance checks assigned to staff
- **Documents**: Stores and tracks investor agreements, KYC documentation, and correspondence
- **Audit Log**: Records all profile changes, status updates, and compliance actions
- **Messages**: Communication threads with investors surface in the investor profile
- **Portal Access**: Controls which investors can access which features in the investor portal

### Who Uses It?

**Primary Users:**
- **Operations Analysts** (`staff_ops`): Daily KYC processing, document review, onboarding task execution
- **Relationship Managers** (`staff_rm`): Investor communications, portfolio updates, request handling
- **Compliance Officers** (`staff_admin`): KYC approval, risk rating review, regulatory reporting
- **Business Operations** (`staff_admin`): Investor setup, capital call processing, fee configuration

**Access Levels:**
- All staff can view investor profiles
- `staff_ops` and `staff_rm` can update contact info and communication logs
- `staff_admin` can update KYC status, risk ratings, and portal access
- Only `staff_admin` can delete or merge investor records

### Core Use Cases

**1. New Investor Onboarding (Individual)**

An operations analyst receives a new investor lead from a deal introduction. They:
1. Click "Add Investor" and enter basic profile (name, email, country, investor type)
2. System auto-creates onboarding tasks: "Collect KYC Documents", "Send Portal Invitation", "Assign RM"
3. Analyst uploads passport, proof of address, and source of funds documents
4. KYC workflow automatically runs document verification checks
5. Compliance officer reviews and approves KYC status → changes to "completed"
6. System sends automated portal invitation email with login credentials
7. Investor can now access portal and participate in deals

**Timeline:** 3-5 business days for standard individual investor

**2. Institutional Investor Setup**

A relationship manager is onboarding a $5M family office. They:
1. Create institutional investor profile with legal entity details
2. Upload formation documents, beneficial ownership register, board resolution
3. Add multiple authorized signatories as investor users (CEO, CFO, Investment Director)
4. Set KYC status to "review" for compliance team
5. Compliance officer verifies entity structure, runs AML screening, approves
6. RM assigns custom fee schedule (management fee waiver negotiated)
7. System creates subscription agreement task for first vehicle commitment
8. Investor team receives portal access and can view deal pipeline

**Timeline:** 1-2 weeks for institutional with complex structure

**3. KYC Review Queue Processing**

A compliance officer logs in each morning to process pending KYC reviews:
1. Filters investor list to show `kycStatus = "review"` sorted by submission date
2. Opens first investor profile, reviews uploaded documents in Documents tab
3. Checks automated verification results (address validation, PEP screening, sanctions check)
4. If acceptable: Updates KYC status to "completed", adds approval note to audit log
5. If insufficient: Changes status to "pending", creates task "Request additional proof of address"
6. System sends automated email to investor requesting missing documents
7. Repeats for remaining queue (target: clear queue daily)

**Performance Target:** Average 15 minutes per individual KYC review

**4. Relationship Manager Handoff**

An investor portfolio is being reassigned due to team restructuring:
1. Admin filters to investors where `relationshipManager = "John Departing"`
2. Bulk selects 12 investors, clicks "Reassign RM"
3. Chooses "Sarah Arriving" from dropdown
4. System updates all 12 investor profiles and logs change in audit trail
5. Sarah receives notification with list of newly assigned investors
6. System sends courtesy email to investors introducing their new RM contact

**Audit Requirement:** All RM changes must be logged with timestamp and reason

**5. Capital Commitment Tracking**

An operations analyst needs to verify an investor's available commitment for a new deal:
1. Opens investor profile for "Acme Fund LP"
2. Views Commitments section showing:
   - Total committed across all vehicles: $5,000,000
   - Total contributed to date: $3,200,000
   - Unfunded commitment remaining: $1,800,000
   - Breakdown by vehicle (VERSO FUND I: $3M committed, $2M funded)
3. Verifies investor has sufficient unfunded balance for new $500K allocation
4. Proceeds to reserve inventory in Deal Management module

**Data Source:** Aggregated from `investor_vehicles`, `allocations`, `capital_calls` tables

### Key Features (Business Language)

**Investor Profile Management:**
- Comprehensive investor records (individual, institutional, family office)
- Legal entity information (registration country, tax residency, entity type)
- Contact details (primary contact, billing contact, authorized signatories)
- Accreditation status (professional investor, HNWI, qualified purchaser)
- Custom fields for regulatory classifications (AIFMD, MiFID II)

**KYC/AML Compliance:**
- Document collection (passport, proof of address, source of funds, entity docs)
- Automated verification workflows (address validation, sanctions screening, PEP checks)
- Status tracking (pending, review, completed, expired, rejected)
- Expiry date monitoring with automated renewal reminders
- AML risk scoring (low, medium, high) with periodic review requirements
- Compliance notes and approval audit trail

**Onboarding Automation:**
- Auto-create onboarding task checklist when new investor added
- Tasks: Profile completion, KYC upload, RM assignment, portal invitation, first commitment
- Task assignment to appropriate staff based on investor type and workflow stage
- Progress tracking with SLA monitoring (target: 3 days for individuals, 7 days for institutional)
- Automated email triggers at key milestones (welcome email, portal invitation, KYC approval)

**Capital & Position Tracking:**
- Total commitment across all vehicles (with breakdown by vehicle)
- Contributed capital to date (cash calls paid)
- Distributions received (dividends, capital returns, exits)
- Unfunded commitment balance (available for new allocations)
- Current NAV across all positions
- Performance metrics (DPI, TVPI, IRR) aggregated at investor level

**Relationship Management:**
- Relationship manager assignment (primary RM, secondary RM for coverage)
- Communication log integration (emails, calls, meetings logged in Messages module)
- Investor satisfaction scores (NPS tracking for premium investors)
- Activity timeline (last login, last capital call participation, last report request)
- Notes and interaction history (visible to RM team, not exposed to investor)

**Portal Access Control:**
- User account creation (email, role, permissions)
- Multi-user support for institutional investors (CEO, CFO, trustees)
- Permission levels (view-only, transact, admin)
- Portal invitation workflow with email verification
- Password reset and account lockout management
- Session history and security audit log

**Search & Filtering:**
- Full-text search across name, email, legal entity name
- Filter by: KYC status, investor type, risk rating, RM, country, onboarding status
- Sort by: Total commitment, last activity, registration date, pending tasks
- Saved filter sets for common queries ("Pending KYC", "High Net Worth Active")
- Export to CSV for external reporting

**Risk & Compliance Monitoring:**
- Automated risk rating calculation (based on country risk, PEP status, transaction patterns)
- Manual risk override by compliance officer with justification requirement
- Ongoing monitoring alerts (adverse media, sanctions list updates)
- Periodic KYC review schedule (every 12/24/36 months based on risk tier)
- Compliance exceptions tracking and resolution

**Bulk Operations:**
- Bulk RM reassignment
- Bulk email notifications (capital call reminders, regulatory updates)
- Bulk KYC renewal requests
- Bulk export for regulatory reporting (FSC annual filings)

### Business Rules

**Investor Creation:**
- Must have unique email address (validated against existing investors and user accounts)
- Legal name required for institutional, full name for individual
- Country and tax residency required for KYC compliance
- Investor type determines onboarding workflow (individual vs. institutional task sets)

**KYC Status Transitions:**
- New investors start in `pending` status
- Can move to `review` when all required documents uploaded
- Only compliance officers (`staff_admin`) can approve to `completed`
- KYC expires after 24 months for low-risk, 12 months for high-risk investors
- Expired KYC blocks new deal participation (existing positions unaffected)

**Risk Rating:**
- Auto-calculated on KYC completion based on: country risk score, PEP status, transaction size
- Manual override requires compliance officer approval and written justification
- High-risk investors trigger enhanced due diligence workflow
- Risk rating affects KYC renewal frequency and transaction monitoring thresholds

**Portal Access:**
- Portal invitation can only be sent after KYC status = `completed`
- Each investor user requires unique email address
- Default permission is `view-only`; `transact` requires explicit RM approval
- Account lockout after 5 failed login attempts; staff must manually unlock

**Capital Commitments:**
- Total commitment cannot be reduced below current contributed amount
- Unfunded commitment calculated as: `total_commitment - total_contributed`
- Negative unfunded commitment flags overfunding error requiring investigation

**Data Retention:**
- Investor profiles cannot be deleted while active positions exist
- Archived investors (no positions, inactive >3 years) can be soft-deleted by admin
- Soft-deleted records retained for 7 years per BVI financial records regulations
- Hard delete requires dual authorization (admin + compliance officer)

### Visual Design Standards

**Layout:**
- Header: Page title "Investor Management", stats summary, "Add Investor" button
- Stats row: 4 KPI cards (Total Investors, Active Accounts, Pending KYC, Institutional %)
- Search bar with filters (KYC status, type, RM, risk rating)
- Investor table: Expandable cards with quick actions

**Investor Card Design:**
- Left section: Avatar/icon, name, type badge, email, country, RM
- Center section: Commitment amount, funded percentage, vehicle count
- Right section: KYC status badge, risk rating badge, action buttons (View, Edit, Contact, KYC Review)
- Expandable detail: Capital breakdown, last activity, quick stats, communication shortcuts

**Color Coding:**
- **KYC Status**:
  - Completed: Green (`bg-green-100 text-green-800`)
  - Pending: Yellow (`bg-yellow-100 text-yellow-800`)
  - Review: Orange (`bg-orange-100 text-orange-800`)
  - Expired: Red (`bg-red-100 text-red-800`)
- **Risk Rating**:
  - Low: Green
  - Medium: Yellow
  - High: Red

**Icons:**
- Investor profiles: `Users` icon
- Individual investors: Single person icon
- Institutional: Building icon
- KYC completed: `CheckCircle` (green)
- KYC pending: `Clock` (yellow)
- KYC review: `AlertTriangle` (orange)

---

## Part 2: Technical Implementation

### Architecture Overview

**Page Route**: `/versotech/staff/investors/page.tsx`
**Type**: Server Component (Next.js App Router)
**Authentication**: Required via `AppLayout` + staff role check
**Data Flow**: Server-side fetch from Supabase, static render with revalidation

**Component Hierarchy:**
```
page.tsx (Server Component)
  └─ AppLayout (brand="versotech")
       ├─ Page Header (title, "Add Investor" button)
       ├─ Stats Cards (Total, Active, Pending KYC, Institutional)
       ├─ Search & Filters Card
       ├─ Investors Table Card
       │    └─ InvestorRow (expandable cards)
       │         ├─ Investor Info (name, type, email, country, RM)
       │         ├─ Capital Summary (commitment, funded %, vehicles)
       │         ├─ Status Badges (KYC, risk rating)
       │         └─ Action Buttons (View, Edit, Contact, KYC Review)
       └─ Pagination Controls
```

### Current Implementation (page.tsx)

**Static Dashboard (Mock Data):**
```typescript
// Current: Mock investors with hardcoded data
const mockInvestors = [
  {
    id: '1',
    name: 'Acme Fund LP',
    type: 'institutional',
    email: 'contact@acmefund.com',
    kycStatus: 'completed',
    onboardingStatus: 'active',
    totalCommitment: 2500000,
    totalContributed: 1800000,
    vehicleCount: 3,
    lastActivity: '2024-01-15',
    relationshipManager: 'Sarah Chen',
    riskRating: 'low',
    country: 'United States'
  },
  // ... more mock investors
]

// Stats calculated from mock data
const stats = {
  total: mockInvestors.length,
  active: mockInvestors.filter(i => i.onboardingStatus === 'active').length,
  pending: mockInvestors.filter(i => i.kycStatus === 'pending' || i.kycStatus === 'review').length,
  institutional: mockInvestors.filter(i => i.type === 'institutional').length
}
```

### Required Enhancements (Implementation Roadmap)

**1. Authentication & Authorization:**

```typescript
export default async function InvestorsPage({
  searchParams
}: {
  searchParams: { q?: string; status?: string; type?: string; rm?: string }
}) {
  const supabase = await createClient()

  // 1. Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/versotech/login')
  }

  // 2. Verify staff role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, title, display_name')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.role.startsWith('staff_')) {
    redirect('/versotech/login')
  }

  // Continue with investor data fetching...
}
```

**2. Real Investor Data Fetching:**

```typescript
// Build dynamic query based on search params
let query = supabase
  .from('investors')
  .select(`
    *,
    profiles!investors_primary_rm_fkey (
      id,
      display_name
    )
  `)
  .order('created_at', { ascending: false })

// Apply filters
if (searchParams.q) {
  query = query.or(`legal_name.ilike.%${searchParams.q}%,email.ilike.%${searchParams.q}%`)
}
if (searchParams.status) {
  query = query.eq('kyc_status', searchParams.status)
}
if (searchParams.type) {
  query = query.eq('investor_type', searchParams.type)
}
if (searchParams.rm) {
  query = query.eq('primary_rm', searchParams.rm)
}

const { data: investors, error } = await query

// Calculate stats
const stats = {
  total: investors?.length || 0,
  active: investors?.filter(i => i.status === 'active').length || 0,
  pendingKYC: investors?.filter(i => ['pending', 'review'].includes(i.kyc_status)).length || 0,
  institutional: investors?.filter(i => i.investor_type === 'institutional').length || 0
}
```

**3. Capital Aggregation (via RPC):**

```typescript
// Fetch investor capital metrics via database function
const { data: investorMetrics } = await supabase
  .rpc('get_investor_capital_summary', {
    p_investor_ids: investors.map(i => i.id)
  })

// Merge metrics into investor data
const enrichedInvestors = investors.map(investor => {
  const metrics = investorMetrics?.find(m => m.investor_id === investor.id)
  return {
    ...investor,
    totalCommitment: metrics?.total_commitment || 0,
    totalContributed: metrics?.total_contributed || 0,
    totalDistributed: metrics?.total_distributed || 0,
    unfundedCommitment: metrics?.unfunded_commitment || 0,
    vehicleCount: metrics?.vehicle_count || 0,
    currentNAV: metrics?.current_nav || 0
  }
})
```

**4. Last Activity Calculation:**

```typescript
// Get last activity timestamp for each investor
const { data: lastActivities } = await supabase
  .from('activity_feed')
  .select('investor_id, created_at')
  .in('investor_id', investors.map(i => i.id))
  .order('created_at', { ascending: false })

// Group by investor_id and take most recent
const lastActivityMap = lastActivities?.reduce((acc, activity) => {
  if (!acc[activity.investor_id]) {
    acc[activity.investor_id] = activity.created_at
  }
  return acc
}, {} as Record<string, string>)

// Enrich investors with last activity
const finalInvestors = enrichedInvestors.map(investor => ({
  ...investor,
  lastActivity: lastActivityMap[investor.id] || investor.created_at
}))
```

### Data Model Requirements

**Core Tables:**

```sql
-- Main investor profiles table
create table investors (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  display_name text,
  investor_type text check (investor_type in ('individual', 'institutional', 'family_office', 'fund')) not null,
  email text unique not null,
  phone text,

  -- Entity details
  country_of_incorporation text,
  tax_residency text,
  entity_identifier text, -- Company number, passport number, etc.

  -- KYC & Compliance
  kyc_status text check (kyc_status in ('pending', 'review', 'completed', 'expired', 'rejected')) default 'pending',
  kyc_completed_at timestamptz,
  kyc_expiry_date date,
  kyc_approved_by uuid references profiles(id),

  aml_risk_rating text check (aml_risk_rating in ('low', 'medium', 'high')),
  aml_last_reviewed_at timestamptz,

  is_pep boolean default false,
  is_sanctioned boolean default false,

  -- Accreditation
  is_professional_investor boolean default false,
  is_qualified_purchaser boolean default false,
  accreditation_expiry date,

  -- Relationship
  primary_rm uuid references profiles(id),
  secondary_rm uuid references profiles(id),

  -- Status
  status text check (status in ('active', 'inactive', 'suspended', 'archived')) default 'active',
  onboarding_status text check (onboarding_status in ('pending', 'in_progress', 'completed')) default 'pending',

  -- Metadata
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  archived_at timestamptz
);

create index idx_investors_kyc_status on investors(kyc_status) where kyc_status in ('pending', 'review');
create index idx_investors_status on investors(status) where status = 'active';
create index idx_investors_primary_rm on investors(primary_rm);
create index idx_investors_type on investors(investor_type);
create index idx_investors_email on investors(email);
create index idx_investors_search on investors using gin(to_tsvector('english', coalesce(legal_name, '') || ' ' || coalesce(email, '')));

-- Investor users (portal access)
create table investor_users (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id) not null,
  user_id uuid references profiles(id) not null,
  role text check (role in ('primary_contact', 'authorized_signatory', 'viewer', 'admin')) default 'viewer',
  is_primary boolean default false,
  invited_at timestamptz default now(),
  invitation_accepted_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  unique(investor_id, user_id)
);

create index idx_investor_users_investor on investor_users(investor_id);
create index idx_investor_users_user on investor_users(user_id);

-- KYC documents
create table kyc_documents (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id) not null,
  document_type text check (document_type in (
    'passport', 'national_id', 'drivers_license',
    'proof_of_address', 'bank_statement',
    'certificate_of_incorporation', 'beneficial_ownership_register',
    'board_resolution', 'memorandum_of_association',
    'source_of_funds', 'source_of_wealth'
  )) not null,
  document_id uuid references documents(id) not null,
  verification_status text check (verification_status in ('pending', 'verified', 'failed', 'expired')) default 'pending',
  verified_by uuid references profiles(id),
  verified_at timestamptz,
  expiry_date date,
  notes text,
  created_at timestamptz default now()
);

create index idx_kyc_documents_investor on kyc_documents(investor_id, document_type);
create index idx_kyc_documents_status on kyc_documents(verification_status);

-- Compliance checks (automated screening results)
create table compliance_checks (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id) not null,
  check_type text check (check_type in (
    'sanctions_screening', 'pep_screening', 'adverse_media',
    'address_verification', 'entity_verification'
  )) not null,
  check_result text check (check_result in ('pass', 'fail', 'review_required', 'error')) not null,
  risk_score numeric(5,2), -- 0-100 risk score
  check_provider text, -- 'ComplyAdvantage', 'Refinitiv', 'internal'
  check_reference text, -- External provider reference ID
  raw_response jsonb, -- Full API response for audit
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

create index idx_compliance_checks_investor on compliance_checks(investor_id, created_at desc);
create index idx_compliance_checks_result on compliance_checks(check_result);
```

**Database Functions:**

```sql
-- Get capital summary for investors
create or replace function get_investor_capital_summary(p_investor_ids uuid[])
returns table (
  investor_id uuid,
  total_commitment numeric,
  total_contributed numeric,
  total_distributed numeric,
  unfunded_commitment numeric,
  current_nav numeric,
  vehicle_count int,
  position_count int,
  last_capital_call_date date,
  last_distribution_date date
)
language plpgsql
as $$
begin
  return query
  select
    iv.investor_id,
    coalesce(sum(iv.commitment_amount), 0) as total_commitment,
    coalesce(sum(iv.contributed_amount), 0) as total_contributed,
    coalesce(sum(iv.distributed_amount), 0) as total_distributed,
    coalesce(sum(iv.commitment_amount - iv.contributed_amount), 0) as unfunded_commitment,
    coalesce(sum(ps.nav_value), 0) as current_nav,
    count(distinct iv.vehicle_id)::int as vehicle_count,
    count(distinct ps.id)::int as position_count,
    max(cc.call_date) as last_capital_call_date,
    max(d.distribution_date) as last_distribution_date
  from investor_vehicles iv
  left join performance_snapshots ps on ps.investor_id = iv.investor_id
    and ps.snapshot_date = (
      select max(snapshot_date)
      from performance_snapshots
      where investor_id = iv.investor_id
    )
  left join capital_calls cc on cc.investor_id = iv.investor_id
  left join distributions d on d.investor_id = iv.investor_id
  where iv.investor_id = any(p_investor_ids)
  group by iv.investor_id;
end;
$$;

-- Check if investor has completed KYC requirements
create or replace function is_kyc_complete(p_investor_id uuid)
returns boolean
language plpgsql
as $$
declare
  v_investor_type text;
  v_required_docs text[];
  v_uploaded_docs text[];
begin
  -- Get investor type
  select investor_type into v_investor_type
  from investors
  where id = p_investor_id;

  -- Define required documents by type
  if v_investor_type = 'individual' then
    v_required_docs := array['passport', 'proof_of_address', 'source_of_funds'];
  elsif v_investor_type in ('institutional', 'family_office', 'fund') then
    v_required_docs := array[
      'certificate_of_incorporation',
      'beneficial_ownership_register',
      'board_resolution',
      'proof_of_address'
    ];
  end if;

  -- Get uploaded and verified documents
  select array_agg(distinct document_type)
  into v_uploaded_docs
  from kyc_documents
  where investor_id = p_investor_id
    and verification_status = 'verified'
    and (expiry_date is null or expiry_date > current_date);

  -- Check if all required docs are present
  return v_required_docs <@ coalesce(v_uploaded_docs, array[]::text[]);
end;
$$;

-- Auto-calculate AML risk rating
create or replace function calculate_aml_risk_rating(p_investor_id uuid)
returns text
language plpgsql
as $$
declare
  v_risk_score numeric := 0;
  v_country_risk numeric;
  v_is_pep boolean;
  v_has_adverse_media boolean;
  v_transaction_risk numeric;
begin
  -- Get investor flags
  select is_pep into v_is_pep
  from investors
  where id = p_investor_id;

  -- Get country risk (0-100, higher = riskier)
  select country_risk_score into v_country_risk
  from country_risk_ratings
  join investors on investors.country_of_incorporation = country_risk_ratings.country_code
  where investors.id = p_investor_id;

  -- Check for adverse media hits
  select exists(
    select 1
    from compliance_checks
    where investor_id = p_investor_id
      and check_type = 'adverse_media'
      and check_result in ('fail', 'review_required')
  ) into v_has_adverse_media;

  -- Calculate transaction risk (large commitments = higher risk)
  select
    case
      when sum(commitment_amount) > 5000000 then 30
      when sum(commitment_amount) > 1000000 then 20
      else 10
    end
  into v_transaction_risk
  from investor_vehicles
  where investor_id = p_investor_id;

  -- Calculate total risk score
  v_risk_score := coalesce(v_country_risk, 0) * 0.4
    + (case when v_is_pep then 40 else 0 end)
    + (case when v_has_adverse_media then 30 else 0 end)
    + coalesce(v_transaction_risk, 0) * 0.3;

  -- Return rating
  return case
    when v_risk_score >= 70 then 'high'
    when v_risk_score >= 40 then 'medium'
    else 'low'
  end;
end;
$$;

-- Get investors with expiring KYC
create or replace function get_expiring_kyc_investors(p_days_threshold int default 30)
returns table (
  investor_id uuid,
  legal_name text,
  kyc_expiry_date date,
  days_until_expiry int,
  primary_rm_name text
)
language plpgsql
as $$
begin
  return query
  select
    i.id as investor_id,
    i.legal_name,
    i.kyc_expiry_date,
    (i.kyc_expiry_date - current_date)::int as days_until_expiry,
    p.display_name as primary_rm_name
  from investors i
  left join profiles p on p.id = i.primary_rm
  where i.kyc_expiry_date <= current_date + (p_days_threshold || ' days')::interval
    and i.kyc_expiry_date >= current_date
    and i.status = 'active'
  order by i.kyc_expiry_date asc;
end;
$$;
```

**Triggers & Automation:**

```sql
-- Auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger investors_updated_at
before update on investors
for each row execute function update_updated_at_column();

-- Auto-create onboarding tasks when new investor added
create or replace function create_investor_onboarding_tasks()
returns trigger
language plpgsql
as $$
declare
  v_task_templates record;
begin
  -- Create tasks based on investor type
  if new.investor_type = 'individual' then
    insert into tasks (owner_user_id, kind, category, title, description, related_entity_type, related_entity_id, due_at)
    values
      (new.created_by, 'kyc_individual', 'onboarding', 'Collect KYC Documents', 'Upload passport, proof of address, and source of funds', 'investor', new.id, now() + interval '3 days'),
      (new.created_by, 'onboarding_profile', 'onboarding', 'Complete Investor Profile', 'Fill in all required investor details', 'investor', new.id, now() + interval '1 day'),
      (new.created_by, 'portal_invitation', 'onboarding', 'Send Portal Invitation', 'Send portal access invitation after KYC approval', 'investor', new.id, now() + interval '5 days');
  elsif new.investor_type in ('institutional', 'family_office', 'fund') then
    insert into tasks (owner_user_id, kind, category, title, description, related_entity_type, related_entity_id, due_at)
    values
      (new.created_by, 'kyc_institutional', 'onboarding', 'Collect Entity Documents', 'Upload certificate of incorporation, beneficial ownership register, board resolution', 'investor', new.id, now() + interval '5 days'),
      (new.created_by, 'onboarding_profile', 'onboarding', 'Complete Entity Profile', 'Fill in entity details and authorized signatories', 'investor', new.id, now() + interval '2 days'),
      (new.created_by, 'compliance_aml_screening', 'compliance', 'Run AML Screening', 'Execute sanctions and PEP screening', 'investor', new.id, now() + interval '3 days'),
      (new.created_by, 'portal_invitation', 'onboarding', 'Send Portal Invitation', 'Send portal access invitation to authorized users', 'investor', new.id, now() + interval '7 days');
  end if;

  return new;
end;
$$;

create trigger investor_onboarding_tasks
after insert on investors
for each row execute function create_investor_onboarding_tasks();

-- Auto-update KYC status when all documents verified
create or replace function check_kyc_completion()
returns trigger
language plpgsql
as $$
declare
  v_is_complete boolean;
begin
  -- Check if all required docs are now verified
  select is_kyc_complete(new.investor_id) into v_is_complete;

  if v_is_complete then
    update investors
    set
      kyc_status = 'completed',
      kyc_completed_at = now(),
      kyc_expiry_date = case
        when aml_risk_rating = 'high' then current_date + interval '12 months'
        else current_date + interval '24 months'
      end
    where id = new.investor_id
      and kyc_status != 'completed';
  end if;

  return new;
end;
$$;

create trigger kyc_documents_verified
after update of verification_status on kyc_documents
for each row
when (new.verification_status = 'verified')
execute function check_kyc_completion();

-- Log KYC status changes to audit log
create or replace function log_kyc_status_change()
returns trigger
language plpgsql
as $$
begin
  if old.kyc_status is distinct from new.kyc_status then
    insert into audit_log (
      table_name,
      record_id,
      action_type,
      actor_id,
      old_values,
      new_values
    ) values (
      'investors',
      new.id,
      'kyc_status_change',
      current_setting('app.current_user_id', true)::uuid,
      jsonb_build_object('kyc_status', old.kyc_status),
      jsonb_build_object('kyc_status', new.kyc_status, 'kyc_completed_at', new.kyc_completed_at)
    );
  end if;

  return new;
end;
$$;

create trigger investors_kyc_audit
after update of kyc_status on investors
for each row execute function log_kyc_status_change();
```

### API Routes

**Get Investors List:**
```
GET /api/staff/investors?q=&status=&type=&rm=&page=1&limit=20
Response: {
  investors: [
    {
      id: uuid,
      legal_name: string,
      investor_type: string,
      email: string,
      kyc_status: string,
      aml_risk_rating: string,
      status: string,
      primary_rm: { id: uuid, display_name: string },
      capital: {
        total_commitment: number,
        total_contributed: number,
        unfunded_commitment: number,
        current_nav: number,
        vehicle_count: number
      },
      last_activity: timestamp
    }
  ],
  pagination: { total: number, page: number, limit: number, pages: number }
}
```

**Create Investor:**
```
POST /api/staff/investors
Body: {
  legal_name: string,
  investor_type: 'individual' | 'institutional' | 'family_office' | 'fund',
  email: string,
  country_of_incorporation: string,
  tax_residency: string,
  primary_rm?: uuid
}
Response: { investor: {...}, tasks_created: number }
```

**Update Investor:**
```
PATCH /api/staff/investors/[id]
Body: { ... partial investor fields ... }
Response: { investor: {...} }
```

**Update KYC Status (Admin Only):**
```
POST /api/staff/investors/[id]/kyc-status
Body: {
  kyc_status: 'completed' | 'rejected',
  notes?: string
}
Response: { investor: {...}, audit_log_id: uuid }
```

**Bulk Reassign RM:**
```
POST /api/staff/investors/bulk-reassign-rm
Body: {
  investor_ids: uuid[],
  new_rm_id: uuid,
  reason: string
}
Response: { updated_count: number }
```

**Get Investor Detail:**
```
GET /api/staff/investors/[id]
Response: {
  investor: {...},
  capital_summary: {...},
  kyc_documents: [...],
  compliance_checks: [...],
  investor_users: [...],
  tasks: [...],
  recent_activity: [...]
}
```

### RLS Policies

```sql
alter table investors enable row level security;
alter table investor_users enable row level security;
alter table kyc_documents enable row level security;
alter table compliance_checks enable row level security;

-- Staff can view all investors
create policy investors_staff_read on investors for select
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role like 'staff_%'
  )
);

-- Staff can create investors
create policy investors_staff_create on investors for insert
with check (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role like 'staff_%'
  )
);

-- Staff can update investors (but not all fields)
create policy investors_staff_update on investors for update
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role like 'staff_%'
  )
);

-- Only admins can delete investors
create policy investors_admin_delete on investors for delete
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'staff_admin'
  )
);

-- Staff can view all KYC documents
create policy kyc_documents_staff_read on kyc_documents for select
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role like 'staff_%'
  )
);

-- Staff can manage investor users
create policy investor_users_staff_all on investor_users for all
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role like 'staff_%'
  )
);
```

### Performance Optimizations

**Pagination:**
```typescript
// Server-side pagination for large investor lists
const limit = parseInt(searchParams.limit || '20')
const page = parseInt(searchParams.page || '1')
const offset = (page - 1) * limit

const { data: investors, count } = await supabase
  .from('investors')
  .select('*', { count: 'exact' })
  .range(offset, offset + limit - 1)

const totalPages = Math.ceil((count || 0) / limit)
```

**Indexes:**
```sql
-- Already defined above in table creation
-- Key indexes:
-- - idx_investors_kyc_status (for pending queue filtering)
-- - idx_investors_primary_rm (for RM filtering)
-- - idx_investors_search (for full-text search)
```

**Caching:**
- Stats cards cache for 5 minutes (revalidate on page load)
- Investor list uses Next.js ISR with 60s revalidation
- Capital metrics calculated via RPC (single query vs. N+1)

### Client Components (Future Enhancement)

**Search & Filter Client Component:**
```typescript
'use client'

export function InvestorFilters({ initialFilters }) {
  const [filters, setFilters] = useState(initialFilters)
  const router = useRouter()

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.status) params.set('status', filters.status)
    if (filters.type) params.set('type', filters.type)
    if (filters.rm) params.set('rm', filters.rm)

    router.push(`/versotech/staff/investors?${params.toString()}`)
  }

  return (
    <div className="flex gap-4">
      <Input
        placeholder="Search investors..."
        value={filters.q}
        onChange={(e) => setFilters({ ...filters, q: e.target.value })}
      />
      <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
        <SelectTrigger>
          <SelectValue placeholder="KYC Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="review">Review</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={applyFilters}>Apply</Button>
    </div>
  )
}
```

**Add Investor Modal:**
```typescript
'use client'

export function AddInvestorModal({ open, onClose }) {
  const [formData, setFormData] = useState({
    legal_name: '',
    investor_type: 'individual',
    email: '',
    country_of_incorporation: '',
    tax_residency: ''
  })

  const handleSubmit = async () => {
    const response = await fetch('/api/staff/investors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    if (response.ok) {
      toast.success('Investor created successfully')
      router.refresh() // Refresh server component data
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Investor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {/* Form fields... */}
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### Security Considerations

**Authentication:**
- Server-side auth check on every page load
- Staff role verification using `profiles.role like 'staff_%'`
- Action-level permissions (e.g., only `staff_admin` can approve KYC)

**Data Protection:**
- PII fields (passport numbers, tax IDs) encrypted at rest
- Sensitive fields require additional permission to view
- Audit log for all investor data changes

**Compliance:**
- GDPR data access request support (export all investor data)
- Right to erasure (soft delete with retention policy)
- Data retention: 7 years post-relationship for regulatory compliance

---

## Part 3: Success Metrics

**Operational Efficiency:**
- Average time to complete onboarding: Target <3 days for individuals, <7 days for institutional
- KYC approval backlog: Target <24 hours for pending reviews
- Automation rate: >80% of onboarding tasks auto-created

**Data Quality:**
- % of investor profiles with complete data: Target >95%
- % of active investors with current KYC: Target 100%
- Duplicate investor records: Target 0

**Compliance:**
- KYC expiry monitoring: 0 active investors with expired KYC
- AML screening coverage: 100% of institutional investors screened
- Audit trail completeness: 100% of status changes logged

**User Satisfaction (Staff):**
- Time to find investor record: Target <10 seconds
- Search result accuracy: Target >90% relevant results in top 5
- Staff NPS for investor management tools: Target >50

---

## Document Version History

- v1.0 (October 2, 2025): Initial Investor Management PRD with comprehensive business context and technical implementation roadmap
