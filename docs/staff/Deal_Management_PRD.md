# Deal Management PRD - VersoTech Staff Portal

**Version:** 1.0
**Product:** VERSO VersoTech Staff Portal
**Audience:** Business stakeholders, Product managers, Engineers
**Last Updated:** October 2, 2025

---

## Executive Summary

The Deal Management page is VERSO's operational hub for managing investment opportunities with deal-scoped collaboration, inventory tracking, and investor access control. Staff can create deals, configure fee structures, manage share lot inventory, track commitments and reservations, and control which investors have access to specific opportunities.

This page transforms VERSO's deal sourcing and allocation process from spreadsheet chaos into a systematic, auditable workflow. Each deal has its own "room" with participants, documents, inventory, and approval queues—enabling multiple concurrent deals without information leakage between opportunities.

---

## Part 1: Business Context (Non-Technical)

### What is Deal Management?

Deal Management is where VERSO staff configure and operate individual investment opportunities. A "deal" represents a discrete transaction—acquiring shares in a secondary market, participating in a primary funding round, or structured credit facilities—that VERSO offers to select investors.

**Key Concepts:**
- **Deal**: A specific investment opportunity (e.g., "Real Empire Series B Secondary")
- **Inventory**: Share lots sourced from sellers, tracked to prevent overselling
- **Memberships**: Investors, advisors, and introducers invited to participate
- **Commitments**: Non-binding investor expressions of interest
- **Reservations**: Temporary holds on inventory units
- **Allocations**: Final unit assignments after approval

### Why Does It Matter?

**For VERSO Operations:**
- **Deal Isolation**: Each opportunity has separate participants, documents, and inventory
- **No Oversell**: Automated inventory tracking prevents allocating more units than available
- **Compliance**: Full audit trail of who was invited, when they committed, what they received
- **Scalability**: Run multiple concurrent deals without manual coordination chaos

**For VERSO Leadership:**
- **Pipeline Visibility**: See all deals (draft, open, closing, closed) at a glance
- **Allocation Control**: Approve/reject commitments based on investor suitability and capacity
- **Fee Flexibility**: Configure deal-specific fee structures (2+20, all-in 5%, custom)

**For Investors:**
- **Transparency**: Clear deal status, available inventory, and participation terms
- **Self-Service**: Submit commitments and track allocation status in investor portal

### How It Connects to Other Modules

- **Investor Portal**: Deals appear in investor's "Active Deals" page based on `deal_memberships`
- **Documents**: Deal-scoped documents accessible only to members
- **Messages**: Deal chat rooms for Q&A with staff
- **Approvals**: Commitments and allocations route to approval queue
- **Fees**: Deal-specific fee plans drive invoice generation
- **Introducers**: Track which introducers brought which investors

### Who Uses It?

**Primary Users:**
- **Deal Managers** (`staff_rm`): Configure deals, invite investors, manage inventory
- **Operations** (`staff_ops`): Process commitments, manage allocations, close deals
- **Administrators** (`staff_admin`): Full access, compliance oversight

**Actions by Role:**
- **All Staff**: View deals, see pipeline status
- **Deal Managers**: Create deals, add participants, configure fee plans
- **Admins**: Approve allocations, close deals, manage sensitive settings

### Core Use Cases

**1. Create New Deal**
A relationship manager sources 50,000 shares of "Concluder" at $125/unit from a former employee. They create a new deal "Concluder Secondary Q1 2025", set deal type "equity_secondary", attach to VERSO SPV vehicle, configure target amount $6.25M, and set close date 30 days out.

**2. Add Share Inventory**
The RM adds a share lot: source "Former Employee", 50,000 units @ $120 cost basis (will sell at $125 for $5 spread), lockup until June 2025. System tracks `units_remaining` to prevent oversell.

**3. Invite Investors to Deal**
The RM adds 15 qualified investors as deal members with role "investor". System creates `deal_memberships` records, sends email notifications, and investors see deal appear in their portal.

**4. Configure Fee Plans**
The RM creates two fee plans:
- **All-In 5%**: Single 500 bps fee on invested amount (default)
- **2+20**: 200 bps annual management + 20% carry above 8% hurdle

Investors can choose which plan during commitment.

**5. Process Commitments**
Investor commits $250K (2,000 units @ $125). System creates `deal_commitments` record with status "submitted". RM reviews, approves, and creates `reservations` that lock 2,000 units from inventory.

**6. Finalize Allocations**
When deal closes, ops finalizes all reservations → allocations. System creates `positions` for each investor, generates invoices for upfront fees + spread, updates `share_lots.units_remaining`.

**7. Monitor Deal Pipeline**
Leadership views Deal Management dashboard to see: 3 draft deals (in setup), 5 open (accepting investors), 2 allocation_pending (closing soon), 8 closed (completed).

### Key Features (Business Language)

**Deal List View:**
- **Summary Cards**: Total Deals, Draft, Active Pipeline, Completed
- **Deal Cards**: Name, status badge, deal type, vehicle association, participant count, unit price, creation date
- **Quick Actions**: View Details, Create Deal

**Deal Detail Page** (individual deal):
- **Overview Tab**: Deal info, target/raised amounts, timeline, status
- **Inventory Tab**: Share lots, available units, reservations, allocations
- **Members Tab**: Invited investors, advisors, introducers with roles
- **Fee Plans Tab**: Configure and assign fee structures
- **Commitments Tab**: Review and approve investor commitments
- **Documents Tab**: Deal-scoped document library
- **Activity Tab**: Audit log of all deal actions

**Inventory Management:**
- Add share lots from different sources (company, fund, colleague, other)
- Track cost basis, lockup periods, units remaining
- Automated reservation system with TTL expiry
- FIFO allocation across lots (sell oldest first)

**Investor Access Control:**
- Add members by email or investor ID
- Assign roles: investor, co-investor, spouse, advisor, lawyer, banker, introducer, viewer
- Track invitation sent, accepted dates
- Remove access (revokes portal visibility)

**Fee Plan Configuration:**
- Create multiple fee plans per deal
- Fee components: subscription (upfront), management (annual %), performance (carry), spread (per-unit markup)
- Investor overrides via `investor_terms` table
- Fee preview calculator

### Business Rules

**Deal Lifecycle:**
1. **Draft**: Setup phase, not visible to investors
2. **Open**: Accepting commitments, inventory available
3. **Allocation Pending**: Close date passed, processing allocations
4. **Closed**: All allocations finalized, positions created
5. **Cancelled**: Deal withdrawn (inventory released)

**Inventory Rules:**
- Cannot allocate more units than `SUM(share_lots.units_remaining)`
- Reservations expire after configured TTL (default 48 hours)
- Expired reservations auto-restore `units_remaining`
- Finalized allocations decrement `units_remaining` permanently

**Access Control:**
- Only staff can create/edit deals
- Investors see deals only if `deal_memberships` record exists
- Deal detail access requires staff role OR membership
- Sensitive fields (cost basis, sources) hidden from investor view

**Commitment Approval:**
- Commitments default to "submitted" status
- Staff must approve before creating reservations
- Rejection reasons logged and communicated to investor
- Multiple commitments allowed; latest supersedes earlier

---

## Part 2: Technical Implementation (Current State)

### Architecture Overview

**Page Route**: `/versotech/staff/deals/page.tsx`
**Type**: Server Component with auth and data fetching
**Authentication**: Staff role required
**Component**: List view of all deals with summary cards

**Component Hierarchy:**
```
page.tsx (Server Component)
  └─ AppLayout (brand="versotech")
       ├─ Header (title, description, Create Deal button)
       ├─ Summary Cards (4 KPIs)
       ├─ Deals List Card
       │    └─ Deal Card(s)
       │         ├─ Deal name (link to detail)
       │         ├─ Status & type badges
       │         ├─ Vehicle info
       │         ├─ Metadata (participants, price, date)
       │         └─ View Details button
       └─ Quick Actions Grid (3 cards)
```

### Current Implementation Analysis

**Server-Side Data Fetching (page.tsx:59-93):**
```typescript
export default async function DealsPage() {
  const supabase = await createClient()

  // 1. Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/versotech/login')

  // 2. Verify staff role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.role.startsWith('staff_')) {
    redirect('/versotech/login')
  }

  // 3. Fetch deals with related data
  const { data: deals } = await supabase
    .from('deals')
    .select(`
      *,
      vehicles (name, type),
      deal_memberships (user_id, role)
    `)
    .order('created_at', { ascending: false })

  const dealsData: Deal[] = deals || []

  // 4. Calculate summary stats (client-side)
  const summary = {
    total: dealsData.length,
    open: dealsData.filter(d => d.status === 'open').length,
    draft: dealsData.filter(d => d.status === 'draft').length,
    closed: dealsData.filter(d => d.status === 'closed').length,
    totalValue: dealsData.reduce((sum, deal) =>
      sum + (deal.offer_unit_price || 0) * 1000, 0)
  }

  return <DashboardView deals={dealsData} summary={summary} />
}
```

**Deal Type & Status Configuration:**
```typescript
const dealTypeLabels = {
  equity_secondary: 'Secondary',
  equity_primary: 'Primary',
  credit_trade_finance: 'Credit/Trade',
  other: 'Other'
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  open: 'bg-green-100 text-green-800',
  allocation_pending: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800'
}
```

### Data Model (from main PRD)

**Core Tables:**
```sql
deals (
  id uuid primary key,
  vehicle_id uuid references vehicles(id),
  name text not null,
  deal_type text check (deal_type in ('equity_secondary','equity_primary','credit_trade_finance','other')),
  status text check (status in ('draft','open','allocation_pending','closed','cancelled')),
  currency text default 'USD',
  offer_unit_price numeric(18,6),
  open_at timestamptz,
  close_at timestamptz,
  minimum_investment numeric(18,2),
  maximum_investment numeric(18,2),
  target_amount numeric(18,2),
  raised_amount numeric(18,2),
  description text,
  investment_thesis text,
  company_name text,
  company_logo_url text,
  sector text,
  stage text,
  location text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
)

deal_memberships (
  deal_id uuid references deals(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  investor_id uuid references investors(id),
  role text check (role in ('investor','co_investor','spouse','advisor','lawyer','banker','introducer','viewer','verso_staff')),
  invited_by uuid references profiles(id),
  invited_at timestamptz default now(),
  accepted_at timestamptz,
  primary key (deal_id, user_id)
)

share_sources (
  id uuid primary key,
  kind text check (kind in ('company','fund','colleague','other')),
  counterparty_name text,
  contract_doc_id uuid references documents(id),
  notes text
)

share_lots (
  id uuid primary key,
  deal_id uuid references deals(id) on delete cascade,
  source_id uuid references share_sources(id),
  units_total numeric(28,8) not null,
  unit_cost numeric(18,6) not null,
  currency text default 'USD',
  acquired_at date,
  lockup_until date,
  units_remaining numeric(28,8) not null,
  status text check (status in ('available','held','exhausted')) default 'available',
  check (units_remaining >= 0)
)

deal_commitments (
  id uuid primary key,
  deal_id uuid references deals(id) on delete cascade,
  investor_id uuid references investors(id),
  requested_units numeric(28,8),
  requested_amount numeric(18,2),
  status text check (status in ('draft','submitted','approved','rejected','withdrawn')),
  created_at timestamptz,
  updated_at timestamptz
)

reservations (
  id uuid primary key,
  deal_id uuid references deals(id) on delete cascade,
  investor_id uuid references investors(id),
  requested_units numeric(28,8) not null,
  proposed_unit_price numeric(18,6) not null,
  expires_at timestamptz not null,
  status text check (status in ('pending','approved','expired','cancelled')),
  created_at timestamptz
)

allocations (
  id uuid primary key,
  deal_id uuid references deals(id) on delete cascade,
  investor_id uuid references investors(id),
  unit_price numeric(18,6) not null,
  units numeric(28,8) not null,
  status text check (status in ('pending_review','approved','rejected','settled')),
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_at timestamptz
)
```

### RLS Policies

```sql
-- Deals: Staff can see all
alter table deals enable row level security;

create policy deals_staff_all on deals for all
using (exists (
  select 1 from profiles p
  where p.id = auth.uid() and p.role like 'staff_%'
));

-- Deal memberships: Staff can manage
create policy deal_memberships_staff_all on deal_memberships for all
using (exists (
  select 1 from profiles p
  where p.id = auth.uid() and p.role like 'staff_%'
));

-- Share lots: Staff only
create policy share_lots_staff_all on share_lots for all
using (exists (
  select 1 from profiles p
  where p.id = auth.uid() and p.role like 'staff_%'
));
```

### API Routes (Required)

**Create Deal:**
```
POST /api/staff/deals
Body: {
  name, deal_type, vehicle_id, offer_unit_price,
  target_amount, close_at, description, ...
}
Response: { deal_id }
```

**Add Inventory:**
```
POST /api/staff/deals/[id]/inventory
Body: {
  source_id, units_total, unit_cost, acquired_at, lockup_until
}
Response: { lot_id }
```

**Add Member:**
```
POST /api/staff/deals/[id]/members
Body: { user_id?, investor_id?, role, send_notification }
Response: { membership_id }
```

**Approve Commitment:**
```
PATCH /api/staff/deals/[id]/commitments/[commitment_id]
Body: { status: 'approved' | 'rejected', notes }
Side effects: Creates reservation if approved
Response: { commitment, reservation_id? }
```

**Finalize Allocation:**
```
POST /api/staff/deals/[id]/allocations/finalize
Body: { allocation_id, approved_by }
Server calls: fn_finalize_allocation()
Response: { position_id, invoice_id }
```

### Database Functions (Critical)

**Reserve Inventory (No Oversell):**
```sql
create or replace function fn_reserve_inventory(
  p_deal_id uuid,
  p_investor_id uuid,
  p_requested_units numeric,
  p_proposed_unit_price numeric,
  p_hold_minutes int default 2880 -- 48 hours
)
returns uuid
language plpgsql
as $$
declare
  v_reservation_id uuid;
  v_lot record;
  v_units_allocated numeric := 0;
  v_units_needed numeric := p_requested_units;
begin
  -- Create reservation record
  insert into reservations (deal_id, investor_id, requested_units, proposed_unit_price, expires_at, status)
  values (p_deal_id, p_investor_id, p_requested_units, p_proposed_unit_price,
          now() + (p_hold_minutes || ' minutes')::interval, 'pending')
  returning id into v_reservation_id;

  -- Lock lots FOR UPDATE SKIP LOCKED (FIFO by acquired_at)
  for v_lot in
    select id, units_remaining
    from share_lots
    where deal_id = p_deal_id
      and status = 'available'
      and units_remaining > 0
    order by acquired_at asc, created_at asc
    for update skip locked
  loop
    if v_units_needed <= 0 then
      exit;
    end if;

    declare
      v_units_from_lot numeric := least(v_lot.units_remaining, v_units_needed);
    begin
      -- Insert reservation_lot_item
      insert into reservation_lot_items (reservation_id, lot_id, units)
      values (v_reservation_id, v_lot.id, v_units_from_lot);

      -- Decrement lot units_remaining
      update share_lots
      set units_remaining = units_remaining - v_units_from_lot
      where id = v_lot.id;

      v_units_allocated := v_units_allocated + v_units_from_lot;
      v_units_needed := v_units_needed - v_units_from_lot;
    end;
  end loop;

  -- Check if fully allocated
  if v_units_allocated < p_requested_units then
    raise exception 'Insufficient inventory: only % units available', v_units_allocated;
  end if;

  return v_reservation_id;
end;
$$;
```

**Expire Reservations (Cron Job):**
```sql
create or replace function fn_expire_reservations()
returns void
language plpgsql
as $$
begin
  -- Restore units to lots for expired reservations
  update share_lots sl
  set units_remaining = units_remaining + rli.units
  from reservation_lot_items rli
  join reservations r on r.id = rli.reservation_id
  where sl.id = rli.lot_id
    and r.status = 'pending'
    and r.expires_at < now();

  -- Mark reservations as expired
  update reservations
  set status = 'expired'
  where status = 'pending'
    and expires_at < now();
end;
$$;

-- Schedule via pg_cron or n8n
-- SELECT cron.schedule('expire-reservations', '*/5 * * * *', 'SELECT fn_expire_reservations()');
```

### UI Enhancements Needed

**Current**: Basic list view with static summary
**Needed**:
1. **Filters**: Status, deal type, date range
2. **Search**: Free-text across deal names, companies
3. **Sorting**: By name, date, status, target amount
4. **Bulk Actions**: Close multiple deals, export to CSV
5. **Inventory Indicators**: Show "90% allocated" badges on cards

---

## Part 3: Success Metrics

**Deal Management Efficiency:**
- Time to create new deal (from sourcing to portal-ready)
- % of deals with zero oversell incidents
- Average time from open to fully allocated

**Operational Quality:**
- Deal setup errors requiring rework (target: <5%)
- Investor complaints about allocation transparency
- Audit findings related to deal access control

---

## Document Version History
- v1.0 (October 2, 2025): Initial Deal Management PRD with implementation analysis
