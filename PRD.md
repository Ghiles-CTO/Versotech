Below is a consolidated, execution‑ready **PRD v2.0** for the VERSO investor + staff portal. It fuses your original PRD and feature overview with the new change requests from the client chat (deal‑scoped access, inventory/allocation with no oversell, per‑investor term sheets, fee engine with invoicing & bank reconciliation, and introducer attribution), and it keeps the recommended stack and RLS posture. I’ve focused on **core features** and a **complete database design (DDL + RLS + functions)** so the team can build immediately.

---

# VERSO Portal — Product Requirements Document (v2.0)

**Audience:** Product, Backend, DB, API, and Workflow engineers  
**Stack:** Next.js (TS) + Supabase (Postgres/Auth/Storage/RLS/Realtime) + n8n + NocoDB + Dropbox Sign/DocuSign  
**Brands / Entry points:** Investor (**VersoHoldings**) and Staff (**VersoTech**) apps/routes.

---

## 0) Summary & Objectives

Build a secure, two‑sided portal where **investors** view holdings, docs, and request reports; and **staff** run compliant operations, e‑sign flows, and automations. _New in v2.0:_ **Deal‑scoped collaboration & access**, **inventory → reservation → allocation** without oversell, **per‑investor term sheets** that drive **subscription packs**, **fee accounting** (upfront/management/performance/spread) with **invoices & bank reconciliation**, and **introducer attribution**.

**Primary goals**

- Single source of truth for investor data across vehicles (fund/SPV/RE).
    
- Self‑service docs & reports; operational automation via n8n with signed webhooks.
    
- Compliance‑ready: RBAC + RLS, GDPR, BVI professional investor gating, full audit.
    

**Non‑goals (MVP):** Public deal marketing, embedded payments, Signal bridge (optional phase).

---

## 1) Users & Access Model

**Personas & roles**

- **Investor user** (external).
    
- **Staff**: **Admin**, **Ops**, **RM/PM**; staff carry a `title` attribute (e.g., `bizops`, `pm`, `compliance`) used to gate pages and workflow triggers.
    

**Access**

- Supabase Auth (MFA for staff), RLS for strict row isolation.
    
- Entitlements via investor↔user linkage, vehicle subscriptions, and (new) **deal membership**.
    

---

## 2) Core Features (What we’re shipping)

### 2.1 Investor Portal

- **Dashboard:** KPIs (NAV, contributed, distributed, unfunded; DPI/TVPI/IRR), recent docs, tasks, messages, upcoming calls.
    
- **Vehicle Directory & Pages:** See only entitled vehicles; each vehicle page shows position/NAV trend, cashflows, scoped docs. “Request report for this vehicle.”
    
- **Documents:** Watermarked, short‑TTL downloads via pre‑signed URLs; full audit.
    
- **Quick Requests & Ask:** One‑click **Positions Statement** / **Investments Report** (n8n). If not covered, file an **Ask** ticket; staff can convert to workflow run and return a document.
    
- **Messaging:** In‑portal real‑time chat (typing, read receipts, files). Matrix/Signal bridge optional later.
    

### 2.2 Staff Portal

- **Ops dashboard:** Onboarding funnel, pending KYC, report requests, unread chats, capital‑call pipeline.
    
- **Process Center (workflows):** Cards (Inbox Manager, Shared‑Drive Notification, LinkedIn Leads Scraper, Positions Statement, NDA Agent, Reporting Agent). Schema‑driven forms; run status history.
    
- **Docs & E‑Sign:** Send subscription packs/NDAs via Dropbox Sign/DocuSign; webhook updates tasks and attaches signed PDFs.
    
- **Request Inbox (Ask):** triage/assign/convert to workflow; track SLA; attach outputs.
    

### 2.3 New v2.0 Capabilities (Client asks)

- **Deal‑scoped access & invites:** Add `deals` and `deal_memberships` so clients can invite spouse/lawyer/banker/introducer **to one deal** with specific rights.
    
- **Inventory & allocation w/ no oversell:** Share sources & lots, **reservations** (TTL holds) → **allocations** (FIFO), enforced with DB locks & functions.
    
- **Per‑investor term sheets & dynamic subscription packs:** Fee plans/components, investor overrides; template‑driven doc packages sent for e‑sign.
    
- **Fee engine + invoices + bank reconciliation:** Subscription, management, performance (carry), spread; invoice lines; payments; bank transaction ingest & matching.
    
- **Introducer attribution & commissions:** Track introductions, compute commissions on invested amount/fees/spread; invoice & mark paid.
    

---

## 3) System Architecture

- **Recommended:** Supabase (Auth, Postgres, Storage, RLS, Realtime) as system of record; NocoDB connects to the same Postgres for ops grids; Next.js (App Router, TS) for portal; n8n for workflows; e‑sign provider; S3‑compatible object storage.
    
- **Security posture:** All sensitive writes happen server‑side with service‑role; browser never bypasses server checks. Short‑TTL pre‑signed URLs; watermarking; virus scan on upload; hash‑chained audit log.
    
- **n8n handshake:** Portal → n8n webhook (HMAC, timestamp, idempotency); n8n → portal webhook to update workflow run and attach docs.
    

---

## 4) Non‑Functional Requirements (MVP)

- **Compliance:** GDPR + BVI “professional investor” eligibility; immutable audit; data residency in EU.
    
- **Performance:** P50 API <100ms; report gen via n8n typically <30s; realtime notifications <5s.
    
- **Availability:** 99.9% target; daily backups; PITR.
    

---

## 5) Data Model (ERD overview)

**Identity & org:** `profiles`, `investors`, `investor_users` (many‑to‑many), `organizations` (reserved).  
**Vehicles & investments:** `vehicles`, `subscriptions`, `valuations`, `positions`, `capital_calls`, `distributions`, `cashflows`.  
**Deal scope:** `deals`, `deal_memberships`, `invite_links`.  
**Inventory & allocation:** `share_sources`, `share_lots`, `reservations`, `reservation_lot_items`, `allocations`, `allocation_lot_items`.  
**Pricing, docs & packs:** `fee_plans`, `fee_components`, `investor_terms`, `term_sheets`, `doc_templates`, `doc_packages`, `doc_package_items`, `esign_envelopes`.  
**Fees & billing:** `fee_events`, `invoices`, `invoice_lines`, `payments`, `bank_transactions`, `reconciliations`.  
**Introducers:** `introducers`, `introductions`, `introducer_commissions`.  
**Documents & tasks:** `documents` (+`deal_id`), `tasks`, `report_requests`, `request_tickets`.  
**Chat & audit:** `conversations` (+`deal_id`), `conversation_participants`, `messages`, `audit_log`.

> **Conventions:** `uuid` PKs via `gen_random_uuid()`. Money `numeric(18,2)`, units `numeric(28,8)`, price `numeric(18,6)`. Timestamps `timestamptz`. FKs `on delete cascade` when scoped to parent.

---

## 6) Core Schema (DDL)

> The DDL below merges your base schema with the new v2.0 tables and alterations. You can paste it into Supabase (order matters).

### 6.1 Identity & Investors (base)

```sql
-- Roles
create type user_role as enum ('investor','staff_admin','staff_ops','staff_rm');

-- Profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'investor',
  display_name text,
  email text unique,
  title text,
  created_at timestamptz default now()
);

-- Investors & membership
create table investors (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  type text,               -- individual/entity
  kyc_status text default 'pending',
  country text,
  created_at timestamptz default now()
);

create table investor_users (
  investor_id uuid references investors(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  primary key (investor_id, user_id)
);
```

### 6.2 Vehicles & Investments (base)

```sql
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,            -- fund/spv/securitization/note
  domicile text,
  currency text default 'USD',
  created_at timestamptz default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete cascade,
  commitment numeric(18,2),
  currency text default 'USD',
  status text default 'pending',
  signed_doc_id uuid,
  created_at timestamptz default now()
);

create table valuations (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade,
  as_of_date date not null,
  nav_total numeric(18,2),
  nav_per_unit numeric(18,6)
);

create table positions (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete cascade,
  units numeric(28,8),
  cost_basis numeric(18,2),
  last_nav numeric(18,6),
  as_of_date date
);

create table capital_calls (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade,
  name text,
  call_pct numeric(7,4),
  due_date date,
  status text default 'draft'
);

create table distributions (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade,
  name text,
  amount numeric(18,2),
  date date,
  classification text
);

create table cashflows (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete cascade,
  type text check (type in ('call','distribution')),
  amount numeric(18,2),
  date date,
  ref_id uuid
);
```

### 6.3 Deals, Memberships & Invites (new)

```sql
create table deals (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id),                 -- nullable for direct deals
  name text not null,
  deal_type text check (deal_type in ('equity_secondary','equity_primary','credit_trade_finance','other')) default 'equity_secondary',
  status text check (status in ('draft','open','allocation_pending','closed','cancelled')) default 'open',
  currency text default 'USD',
  open_at timestamptz,
  close_at timestamptz,
  terms_schema jsonb,
  offer_unit_price numeric(18,6),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table deal_memberships (
  deal_id uuid references deals(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  investor_id uuid references investors(id),               -- null = external participant
  role text check (role in ('investor','co_investor','spouse','advisor','lawyer','banker','introducer','viewer','verso_staff')) not null,
  invited_by uuid references profiles(id),
  invited_at timestamptz default now(),
  accepted_at timestamptz,
  primary key (deal_id, user_id)
);

create table invite_links (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  role text not null,
  token_hash text unique not null,                         -- store hash only
  expires_at timestamptz,
  max_uses int default 1,
  used_count int default 0,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);
```

### 6.4 Inventory, Reservations & Allocations (new)

```sql
create table share_sources (
  id uuid primary key default gen_random_uuid(),
  kind text check (kind in ('company','fund','colleague','other')) not null,
  counterparty_name text,
  contract_doc_id uuid references documents(id),
  notes text
);

create table share_lots (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  source_id uuid references share_sources(id),
  units_total numeric(28,8) not null,
  unit_cost numeric(18,6) not null,
  currency text default 'USD',
  acquired_at date,
  lockup_until date,
  units_remaining numeric(28,8) not null,
  status text check (status in ('available','held','exhausted')) default 'available',
  created_at timestamptz default now(),
  check (units_remaining >= 0)
);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  investor_id uuid references investors(id),
  requested_units numeric(28,8) not null,
  proposed_unit_price numeric(18,6) not null,
  expires_at timestamptz not null,
  status text check (status in ('pending','approved','expired','cancelled')) default 'pending',
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table reservation_lot_items (
  reservation_id uuid references reservations(id) on delete cascade,
  lot_id uuid references share_lots(id),
  units numeric(28,8) not null,
  primary key (reservation_id, lot_id)
);

create table allocations (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  investor_id uuid references investors(id),
  unit_price numeric(18,6) not null,
  units numeric(28,8) not null,
  status text check (status in ('pending_review','approved','rejected','settled')) default 'pending_review',
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_at timestamptz default now()
);

create table allocation_lot_items (
  allocation_id uuid references allocations(id) on delete cascade,
  lot_id uuid references share_lots(id),
  units numeric(28,8) not null,
  primary key (allocation_id, lot_id)
);
```

### 6.5 Pricing, Term Sheets & Document Automation (new)

```sql
create table fee_plans (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  name text not null,
  description text,
  is_default boolean default false,
  created_at timestamptz default now()
);

create table fee_components (
  id uuid primary key default gen_random_uuid(),
  fee_plan_id uuid references fee_plans(id) on delete cascade,
  kind text check (kind in ('subscription','management','performance','spread_markup','flat','other')) not null,
  calc_method text check (calc_method in ('percent_of_investment','percent_per_annum','percent_of_profit','per_unit_spread','fixed')),
  rate_bps int,
  flat_amount numeric(18,2),
  frequency text check (frequency in ('one_time','annual','quarterly','monthly','on_exit')) default 'one_time',
  hurdle_rate_bps int,
  high_watermark boolean,
  notes text
);

create table investor_terms (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  investor_id uuid references investors(id),
  selected_fee_plan_id uuid references fee_plans(id),
  overrides jsonb,
  status text check (status in ('active','superseded')) default 'active',
  created_at timestamptz default now()
);
create unique index uniq_investor_terms_active on investor_terms (deal_id, investor_id) where status='active';

create table term_sheets (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  investor_id uuid references investors(id),
  fee_plan_id uuid references fee_plans(id),
  price_per_unit numeric(18,6),
  currency text default 'USD',
  valid_until timestamptz,
  status text check (status in ('draft','sent','accepted','rejected','expired')) default 'draft',
  version int default 1,
  supersedes_id uuid references term_sheets(id),
  doc_id uuid references documents(id),
  terms_data jsonb,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table doc_templates (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  provider text check (provider in ('dropbox_sign','docusign','server_pdf')) not null,
  file_key text,
  schema jsonb
);

create table doc_packages (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id),
  investor_id uuid references investors(id),
  kind text check (kind in ('term_sheet','subscription_pack','nda')) not null,
  status text check (status in ('draft','sent','signed','cancelled')) default 'draft',
  esign_envelope_id text,
  final_doc_id uuid references documents(id),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table doc_package_items (
  id uuid primary key default gen_random_uuid(),
  package_id uuid references doc_packages(id) on delete cascade,
  template_id uuid references doc_templates(id),
  merge_data jsonb,
  sort_order int
);

create table esign_envelopes (
  id uuid primary key default gen_random_uuid(),
  provider text,
  envelope_id text unique,
  status text,
  recipient_email text,
  created_at timestamptz default now(),
  completed_at timestamptz
);
```

### 6.6 Fees, Invoices, Payments & Bank Reconciliation (new)

```sql
create table fee_events (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  investor_id uuid references investors(id),
  fee_component_id uuid references fee_components(id),
  event_date date not null,
  period_start date,
  period_end date,
  base_amount numeric(18,2),
  computed_amount numeric(18,2) not null,
  currency text default 'USD',
  source_ref text,
  status text check (status in ('accrued','invoiced','voided')) default 'accrued',
  created_at timestamptz default now()
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id),
  deal_id uuid references deals(id),
  due_date date,
  currency text default 'USD',
  subtotal numeric(18,2),
  tax numeric(18,2),
  total numeric(18,2),
  status text check (status in ('draft','sent','paid','partial','cancelled')) default 'draft',
  generated_from text,
  doc_id uuid references documents(id),
  created_at timestamptz default now()
);

create table invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  kind text check (kind in ('fee','spread','other')),
  description text,
  quantity numeric(28,8),
  unit_price numeric(18,6),
  amount numeric(18,2) not null,
  fee_event_id uuid references fee_events(id)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id),
  invoice_id uuid references invoices(id),
  amount numeric(18,2),
  currency text default 'USD',
  paid_at timestamptz,
  method text,
  bank_txn_id uuid,
  status text check (status in ('received','applied','refunded')) default 'received',
  created_at timestamptz default now()
);

create table bank_transactions (
  id uuid primary key default gen_random_uuid(),
  account_ref text,
  amount numeric(18,2),
  currency text default 'USD',
  value_date date,
  memo text,
  counterparty text,
  import_batch_id uuid,
  created_at timestamptz default now()
);

create table reconciliations (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id),
  bank_transaction_id uuid references bank_transactions(id),
  matched_amount numeric(18,2),
  matched_at timestamptz default now(),
  matched_by uuid references profiles(id)
);
```

### 6.7 Introducers & Commissions (new)

```sql
create table introducers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  legal_name text,
  agreement_doc_id uuid references documents(id),
  default_commission_bps int,
  status text check (status in ('active','inactive')) default 'active',
  created_at timestamptz default now()
);

create table introductions (
  id uuid primary key default gen_random_uuid(),
  introducer_id uuid references introducers(id) on delete cascade,
  prospect_email text,
  prospect_investor_id uuid references investors(id),
  deal_id uuid references deals(id),
  status text check (status in ('invited','joined','allocated','lost')) default 'invited',
  created_at timestamptz default now()
);

create table introducer_commissions (
  id uuid primary key default gen_random_uuid(),
  introducer_id uuid references introducers(id) on delete cascade,
  deal_id uuid references deals(id),
  investor_id uuid references investors(id),
  basis_type text check (basis_type in ('invested_amount','spread','management_fee','performance_fee')),
  rate_bps int not null,
  accrual_amount numeric(18,2) not null,
  currency text default 'USD',
  status text check (status in ('accrued','invoiced','paid','cancelled')) default 'accrued',
  invoice_id uuid,
  paid_at timestamptz,
  created_at timestamptz default now()
);
```

### 6.8 Documents, Tasks, Reports, Ask (base + tweak)

```sql
create table documents (
  id uuid primary key default gen_random_uuid(),
  owner_investor_id uuid references investors(id),
  owner_user_id uuid references profiles(id),
  vehicle_id uuid references vehicles(id),
  deal_id uuid references deals(id),                       -- new column for deal-scoped docs
  type text,                                              -- NDA/Subscription/Report/Statement/KYC
  file_key text not null,
  watermark jsonb,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references profiles(id) on delete cascade,
  kind text,
  due_at timestamptz,
  status text default 'open',
  related_entity_type text,
  related_entity_id uuid,
  created_at timestamptz default now()
);

create table report_requests (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id),
  vehicle_id uuid references vehicles(id),
  filters jsonb,
  status text default 'queued',
  result_doc_id uuid references documents(id),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table request_tickets (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id),
  created_by uuid references profiles(id),
  category text,
  subject text,
  details text,
  status text default 'open',      -- open/assigned/in_progress/ready/closed
  priority text default 'normal',
  assigned_to uuid references profiles(id),
  linked_workflow_run uuid,
  result_doc_id uuid references documents(id),
  deal_id uuid references deals(id),                        -- new: deal-scoped asks
  created_at timestamptz default now()
);
```

### 6.9 Chat & Audit (base + tweak)

```sql
create table conversations (
  id uuid primary key default gen_random_uuid(),
  subject text,
  created_by uuid references profiles(id),
  type text check (type in ('dm','group')) default 'dm',
  name text,
  deal_id uuid references deals(id),                        -- new: deal-scoped conversations
  created_at timestamptz default now()
);

create table conversation_participants (
  conversation_id uuid references conversations(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  primary key (conversation_id, user_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references profiles(id),
  body text,
  file_key text,
  created_at timestamptz default now()
);

create table audit_log (
  id bigserial primary key,
  actor_user_id uuid references profiles(id),
  action text,
  entity text,
  entity_id uuid,
  ts timestamptz default now(),
  hash text,
  prev_hash text
);

-- Helpful indexes (excerpt)
create index on positions (investor_id, vehicle_id);
create index on cashflows (investor_id, vehicle_id, date);
create index on documents (owner_investor_id, vehicle_id, deal_id, type);
create index idx_request_tickets_status_assignee on request_tickets (status, assigned_to);
create index idx_conversations_deal on conversations (deal_id, type);
```

---

## 7) Row‑Level Security (RLS) — policy starters

> Enable RLS on all tables; below are the critical ones to copy‑paste and adapt. Staff read‑all via `role like 'staff_%'`.

**Profiles** (self read; staff read‑all)

```sql
alter table profiles enable row level security;

create policy profiles_self_read on profiles for select
using (id = auth.uid());

create policy profiles_staff_read_all on profiles for select
to authenticated
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%'));
```

**Investors & Positions** (investor isolation via join)

```sql
alter table investors enable row level security;
alter table positions enable row level security;

create policy investor_users_read on investors for select
using (
  exists (select 1 from investor_users iu where iu.investor_id = investors.id and iu.user_id = auth.uid())
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%')
);

create policy positions_investor_read on positions for select
using (
  exists (select 1 from investor_users iu where iu.investor_id = positions.investor_id and iu.user_id = auth.uid())
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%')
);
```

**Deals & Memberships** (new entitlement path)

```sql
alter table deals enable row level security;
alter table deal_memberships enable row level security;

create policy deal_read on deals for select
using (
  exists (select 1 from deal_memberships dm where dm.deal_id = deals.id and dm.user_id = auth.uid())
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%')
);

create policy dm_read on deal_memberships for select
using (
  user_id = auth.uid()
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%')
);
```

**Documents** (owner, vehicle entitlement, or **deal** entitlement)

```sql
alter table documents enable row level security;

create policy documents_read_entitled on documents for select
using (
  (owner_investor_id is not null and exists (
     select 1 from investor_users iu
     where iu.investor_id = documents.owner_investor_id and iu.user_id = auth.uid()
  ))
  or (vehicle_id is not null and exists (
     select 1 from subscriptions s
     join investor_users iu on iu.investor_id = s.investor_id
     where s.vehicle_id = documents.vehicle_id and iu.user_id = auth.uid()
  ))
  or (deal_id is not null and exists (
     select 1 from deal_memberships dm
     where dm.deal_id = documents.deal_id and dm.user_id = auth.uid()
  ))
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%')
);
```

**Conversations/Messages** (participant or deal member)

```sql
alter table conversations enable row level security;
alter table conversation_participants enable row level security;
alter table messages enable row level security;

create policy conv_read on conversations for select
using (exists (select 1 from conversation_participants cp
               where cp.conversation_id = conversations.id
                 and cp.user_id = auth.uid())
        or exists (select 1 from deal_memberships dm
                   where dm.deal_id = conversations.deal_id
                     and dm.user_id = auth.uid())
        or exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%'));

create policy conv_part_read on conversation_participants for select
using (exists (select 1 from conversation_participants cp
               where cp.conversation_id = conversation_participants.conversation_id
                 and cp.user_id = auth.uid()));

create policy messages_read on messages for select
using (exists (select 1 from conversation_participants cp
               where cp.conversation_id = messages.conversation_id
                 and cp.user_id = auth.uid()));
```

**Ask / Requests** (creator sees own; staff all)

```sql
alter table request_tickets enable row level security;

create policy request_tickets_read on request_tickets for select
using (
  created_by = auth.uid()
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%')
);

create policy request_tickets_insert_creator on request_tickets for insert
with check (created_by = auth.uid());

create policy request_tickets_update_staff on request_tickets for update
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%'));
```

**Workflows** (gated by staff `title`)

```sql
alter table workflows enable row level security;
alter table workflow_runs enable row level security;

create policy workflows_read_staff on workflows for select
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%'));

create policy workflow_runs_insert_allowed on workflow_runs for insert
with check (
  exists (
    select 1 from workflows w
    join profiles p on p.id = auth.uid()
    where w.id = workflow_runs.workflow_id
      and p.role like 'staff_%'
      and (w.allowed_titles is null or w.allowed_titles @> array[p.title])
  )
);
```

---

## 8) Server‑Side DB Functions (must implement)

> All functions are invoked by server routes using Supabase **service‑role** and run in a transaction (`serializable` preferred). They enforce **no oversell**, approvals, and idempotency.

1. **`fn_reserve_inventory(deal_id, investor_id, requested_units, proposed_unit_price, hold_minutes)` → reservation_id**
    
    - Lock `share_lots` **FOR UPDATE SKIP LOCKED** (FIFO by `acquired_at`).
        
    - Allocate across lots until covered; insert `reservation_lot_items`; decrement `share_lots.units_remaining`.
        
    - Insert `reservations` with `expires_at = now() + hold_minutes`.
        
    - **Guarantee:** no oversell under concurrency.
        
2. **`fn_expire_reservations()`** (cron)
    
    - For expired, pending holds: restore lot balances, set `reservations.status='expired'`. Idempotent per row.
        
3. **`fn_finalize_allocation(reservation_id, approver_id)` → allocation_id**
    
    - Require approval; create `allocations(status='approved')`; copy lot items; update `positions` for investor/vehicle; compute **spread** line item (`(unit_price - weighted_cost) * units`) and create an invoice line.
        
4. **`fn_compute_fee_events(deal_id, as_of_date)`**
    
    - For each active `investor_terms` and `fee_components`, emit `fee_events` (subscription/management/performance/spread) based on bases from allocations/valuations.
        
5. **`fn_invoice_fees(deal_id, investor_id, up_to_date)`**
    
    - Group un‑invoiced events → create `invoices` + `invoice_lines(kind='fee')`; mark events `invoiced`.
        

---

## 9) API (Next.js route handlers)

> All routes are server‑only with auth checks; webhooks are HMAC‑signed with timestamp & drift checks.

**Investor data**

- `GET /api/me` — profile, roles, investor links.
    
- `GET /api/portfolio` — KPIs + positions per vehicle.
    
- `GET /api/vehicles?related=true` — vehicle discovery.
    
- `GET /api/cashflows?vehicle_id&from&to`
    
- `GET /api/capital-calls?upcoming=true`
    

**Documents & tasks**

- `GET /api/documents` (filters: type, vehicle, deal)
    
- `POST /api/documents/:id/download` → short‑TTL URL + audit write
    
- `GET|PATCH /api/tasks`
    

**Reports & Ask**

- `POST /api/report-requests` → n8n trigger
    
- `GET /api/report-requests/:id`
    
- `POST /api/requests` (Ask)
    
- `PATCH /api/requests/:id` (staff: assign/status/link workflow/result)
    

**Chat**

- `POST /api/conversations`
    
- `GET|POST /api/conversations/:id/messages`
    

**Deals & inventory**

- `POST /api/deals` (staff)
    
- `GET /api/deals/:id` (inventory summary, fee plans, memberships)
    
- `POST /api/deals/:id/invite-links`
    
- `POST /api/deals/:id/members` (accept invite)
    
- `POST /api/deals/:id/reservations` → `fn_reserve_inventory`
    
- `POST /api/reservations/:id/finalize` → `fn_finalize_allocation`
    
- `POST /api/reservations/expire` (cron) → `fn_expire_reservations`
    

**Approvals & docs**

- `POST /api/deals/:id/commitments` → create `deal_commitments`, generate term sheet via n8n
    
- `POST /api/approvals`
    
- `POST /api/doc-packages` → assemble pack from template keys; return signing URL
    

**Fees & billing**

- `POST /api/deals/:id/fees/compute` → `fn_compute_fee_events`
    
- `POST /api/deals/:id/invoices/generate` → `fn_invoice_fees`
    
- `POST /api/payments/ingest-bank` (CSV/API) → `bank_transactions`
    
- `POST /api/reconciliations/match` (heuristic match & link)
    

**Webhooks**

- `POST /api/webhooks/n8n` — update run status, attach docs.
    
- `POST /api/webhooks/esign` — envelope completion → attach signed PDF, close tasks.
    

---

## 10) Workflows (n8n) — contracts

- **Report generation:** `{ workflow_run_id, report_request_id, investor_id, vehicle_id?, filters, idempotency_key }` → result posts back `{document: {...}}`.
    
- **Doc generation:** Term sheet / subscription pack built from `doc_templates` with merge schema; e‑sign send; webhook updates `doc_packages` and `documents`.
    
- **Reservation expiry:** cron (2–5 min) → expire & restore lots.
    
- **Fee accrual & invoice gen:** scheduled or on demand.
    
- **Bank ingest & auto‑match:** import transactions; propose reconciliations.
    

---

## 11) Acceptance Criteria

- **Investor isolation:** Investor A cannot access Investor B’s `positions` or `documents` (verified by API attempts under RLS tests).
    
- **Deal‑scoped access:** An invited `lawyer` can see only conversations/docs for that **deal**; nothing else.
    
- **No oversell:** With 50 concurrent reservations exceeding availability, the sum of approved + pending reservations never exceeds `Σ share_lots.units_total`; expired holds restore within 60s.
    
- **Approvals gate:** Allocations cannot finalize without an `approvals` row marked `approved`.
    
- **Per‑investor term sheets:** A gets **All‑in 5%**; B gets **3% + 10% carry**; each subscription pack reflects selected plan/overrides.
    
- **Fees & invoices:** Generating invoices up to a date yields correct lines for subscription, management (prorated), performance (when applicable), and **spread** on approved allocations; totals reconcile with `fee_events`.
    
- **Introducer commissions:** Accruals created per plan; can be invoiced and marked paid.
    
- **Docs:** Watermarked PDFs delivered via short‑TTL links; access logged in `audit_log`.
    

---

## 12) Security & Compliance Checklist (MVP)

- EU hosting; MFA for staff; PII field‑level encryption for KYC; HMAC‑signed webhooks; virus scan on upload; strong CSP; no PII in logs; periodic key rotation; immutable audit with hash chaining.
    

---

## 13) Migration & Rollout Plan

1. Apply DDL (new tables + alters + indexes).
    
2. Backfill: create `deals` rows for in‑flight opportunities; attach `deal_id` to relevant docs/chats/requests.
    
3. Deploy RLS; run acceptance tests from §11.
    
4. Release DB functions + API; hide behind feature flags if needed.
    
5. Stand up n8n crons (reservation expiry, fee accrual); onboard ops to new Process Center.
    

---

## 14) Open Decisions (defaults)

- **Auth:** Supabase Auth (to keep client‑side RLS).
    
- **E‑Sign:** Dropbox Sign (fast) vs DocuSign (enterprise).
    
- **Chat:** In‑portal only for MVP; Matrix/Signal bridge in Phase 3 (optional).
    
- **Hosting region:** EU.
    

---

## 15) Developer To‑Do (first sprint)

- Implement schema (DDL) + RLS + core functions in §6–§8.
    
- Ship `/api/me`, `/api/portfolio`, `/api/documents/:id/download`, essential investor pages (Dashboard, Vehicles, Vehicle page), and Chat.
    
- Wire Quick Requests to n8n; webhook handler attaches result docs.
    
- Add **Deals** UI (staff & investor) + Reservations API; finalize allocation path with approvals.
    
- Integrate e‑sign for term sheets & subscription packs.
    
- Add fee accrual and invoice generation endpoints + simple bank CSV ingest.
    

---

### Notes on chat/E2EE

MVP chat uses Supabase Realtime (fast, reliable). If E2EE becomes a hard requirement, layer client‑side encryption or pivot to Matrix later; Signal bridge remains an optional Phase 3.

---

