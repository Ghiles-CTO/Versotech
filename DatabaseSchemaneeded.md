Below is a **single, production‑ready PostgreSQL schema** that implements everything you’ve specified so far: two‑sided access (investors + staff), **deal‑scoped collaboration**, **inventory → reservation → allocation** (no oversell), **per‑investor term sheets & doc packages**, **fees/invoicing/reconciliation**, **introducer attribution**, reporting/“Ask”, chat, and audit. I’ve kept types/constraints explicit so relationships are unambiguous and enforced at the DB layer. It’s designed for Supabase (RLS will sit on top). This is a faithful consolidation of your PRD + feature spec + change spec.   &#x20;

---

## ERD (high‑level map)

* **Identity:** `profiles (1)─(M) investor_users (M)─(1) investors` (user ↔ investor many‑to‑many).&#x20;
* **Vehicles:** `vehicles (1)─(M) subscriptions (M)─(1) investors`; `vehicles (1)─(M) valuations`; `investors (1)─(M) positions per vehicle`; capital calls, distributions, cashflows.&#x20;
* **Deals (scoped access):** `deals (1)─(M) deal_memberships (M)─(1) profiles`; invite links. Docs, chats, and requests can be **deal‑scoped** via `deal_id`.&#x20;
* **Inventory & allocation:** `deals (1)─(M) share_lots`; `reservations (M)─(M) share_lots` via `reservation_lot_items`; `allocations (M)─(M) share_lots` via `allocation_lot_items`; positions updated from **approved allocations**.&#x20;
* **Pricing & docs:** `deals (1)─(M) fee_plans (1)─(M) fee_components`; `investor_terms (unique active per investor×deal)`; `term_sheets → documents`; `doc_packages → esign_envelopes`.&#x20;
* **Fees & billing:** `fee_events → invoices (1)─(M) invoice_lines`; `payments`; `bank_transactions (M)─(M) invoices` via `reconciliations`.&#x20;
* **Introducers:** `introducers (1)─(M) introductions`; `introducer_commissions` link introducer↔deal↔investor and can point to invoices.&#x20;
* **Ops:** documents, tasks, report\_requests, request\_tickets (“Ask”), workflows/workflow\_runs; chat (conversations/participants/messages); audit\_log.&#x20;

> **Conventions:** UUID PKs (`gen_random_uuid()`), money `numeric(18,2)`, price `numeric(18,6)`, units `numeric(28,8)`, timestamps `timestamptz`. Foreign keys use `on delete cascade` where rows are scoped to a parent. Partial uniques ensure contract invariants (e.g., one **active** terms row per investor×deal).&#x20;

---

## PostgreSQL DDL (paste as one migration)

```sql
-- Foundations
create extension if not exists pgcrypto;
create extension if not exists citext;

-- =========================
-- Enumerated types
-- =========================
create type user_role as enum ('investor','staff_admin','staff_ops','staff_rm');

create type vehicle_type as enum ('fund','spv','securitization','note','other');

create type deal_type_enum as enum ('equity_secondary','equity_primary','credit_trade_finance','other');
create type deal_status_enum as enum ('draft','open','allocation_pending','closed','cancelled');

create type deal_member_role as enum ('investor','co_investor','spouse','advisor','lawyer','banker','introducer','viewer','verso_staff');

create type reservation_status_enum as enum ('pending','approved','expired','cancelled');
create type allocation_status_enum  as enum ('pending_review','approved','rejected','settled');

create type doc_provider_enum as enum ('dropbox_sign','docusign','server_pdf');
create type doc_package_kind_enum as enum ('term_sheet','subscription_pack','nda');
create type doc_package_status_enum as enum ('draft','sent','signed','cancelled');

create type fee_component_kind_enum as enum ('subscription','management','performance','spread_markup','flat','other');
create type fee_calc_method_enum as enum ('percent_of_investment','percent_per_annum','percent_of_profit','per_unit_spread','fixed');
create type fee_frequency_enum as enum ('one_time','annual','quarterly','monthly','on_exit');
create type fee_event_status_enum as enum ('accrued','invoiced','voided');

create type invoice_status_enum as enum ('draft','sent','paid','partial','cancelled');
create type payment_status_enum as enum ('received','applied','refunded');

create type convo_type_enum as enum ('dm','group');

create type request_status_enum as enum ('open','assigned','in_progress','ready','closed');
create type request_priority_enum as enum ('low','normal','high');

create type report_status_enum as enum ('queued','processing','ready','failed');

-- =========================
-- Identity & Investors
-- =========================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'investor',
  display_name text,
  email citext unique,
  title text,                                     -- staff fine-grained gating
  created_at timestamptz default now()
);

create table investors (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  type text,                                      -- individual/entity
  kyc_status text default 'pending',
  country text,
  created_at timestamptz default now()
);

create table investor_users (
  investor_id uuid references investors(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  primary key (investor_id, user_id)
);

-- =========================
-- Vehicles & Investments
-- =========================
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type vehicle_type,
  domicile text,
  currency text default 'USD',
  created_at timestamptz default now()
);

-- Define deals now (referenced by docs later)
create table deals (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id),
  name text not null,
  deal_type deal_type_enum default 'equity_secondary',
  status deal_status_enum default 'open',
  currency text default 'USD',
  open_at timestamptz,
  close_at timestamptz,
  terms_schema jsonb,                              -- typed params by deal_type
  offer_unit_price numeric(18,6),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table deal_memberships (
  deal_id uuid references deals(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  investor_id uuid references investors(id),       -- null = external participant
  role deal_member_role not null,
  invited_by uuid references profiles(id),
  invited_at timestamptz default now(),
  accepted_at timestamptz,
  primary key (deal_id, user_id)
);

create table invite_links (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  role deal_member_role not null,
  token_hash text unique not null,                 -- store hash only
  expires_at timestamptz,
  max_uses int default 1,
  used_count int default 0,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Documents (before subscriptions; may reference deal/vehicle/owners)
create table documents (
  id uuid primary key default gen_random_uuid(),
  owner_investor_id uuid references investors(id),
  owner_user_id uuid references profiles(id),
  vehicle_id uuid references vehicles(id),
  deal_id uuid references deals(id),               -- deal-scoped docs (invites, TS, subs)
  type text,                                       -- NDA/Subscription/Report/Statement/KYC/Invoice/etc.
  file_key text not null,                          -- storage key
  watermark jsonb,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create index on documents (owner_investor_id, vehicle_id, deal_id, type);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete cascade,
  commitment numeric(18,2) check (commitment >= 0),
  currency text default 'USD',
  status text default 'pending',
  signed_doc_id uuid references documents(id),
  created_at timestamptz default now()
);

create table valuations (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade,
  as_of_date date not null,
  nav_total numeric(18,2),
  nav_per_unit numeric(18,6),
  unique (vehicle_id, as_of_date)
);

create table positions (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete cascade,
  units numeric(28,8) default 0,
  cost_basis numeric(18,2) default 0,
  last_nav numeric(18,6),
  as_of_date date,
  unique (investor_id, vehicle_id)
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

create index on positions (investor_id, vehicle_id);
create index on cashflows (investor_id, vehicle_id, date);

-- =========================
-- Introducers & Attribution
-- =========================
create table introducers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),            -- optional portal login
  legal_name text,
  agreement_doc_id uuid references documents(id),
  default_commission_bps int,
  status text check (status in ('active','inactive')) default 'active',
  created_at timestamptz default now()
);

create table introductions (
  id uuid primary key default gen_random_uuid(),
  introducer_id uuid references introducers(id) on delete cascade,
  prospect_email citext,
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
  invoice_id uuid,                                  -- set when invoiced
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- =========================
-- Inventory, Reservations & Allocations (no oversell)
-- =========================
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
  units_total numeric(28,8) not null check (units_total >= 0),
  unit_cost numeric(18,6) not null,
  currency text default 'USD',
  acquired_at date,
  lockup_until date,
  units_remaining numeric(28,8) not null check (units_remaining >= 0),
  status text check (status in ('available','held','exhausted')) default 'available',
  created_at timestamptz default now()
);
create index on share_lots (deal_id, status);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  investor_id uuid references investors(id),
  requested_units numeric(28,8) not null check (requested_units > 0),
  proposed_unit_price numeric(18,6) not null,
  expires_at timestamptz not null,
  status reservation_status_enum default 'pending',
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);
create index on reservations (deal_id, status, expires_at);

create table reservation_lot_items (
  reservation_id uuid references reservations(id) on delete cascade,
  lot_id uuid references share_lots(id),
  units numeric(28,8) not null check (units > 0),
  primary key (reservation_id, lot_id)
);

create table allocations (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  investor_id uuid references investors(id),
  unit_price numeric(18,6) not null,
  units numeric(28,8) not null check (units > 0),
  status allocation_status_enum default 'pending_review',
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_at timestamptz default now()
);
create index on allocations (deal_id, investor_id, status);

create table allocation_lot_items (
  allocation_id uuid references allocations(id) on delete cascade,
  lot_id uuid references share_lots(id),
  units numeric(28,8) not null check (units > 0),
  primary key (allocation_id, lot_id)
);

-- =========================
-- Commitments & Approvals
-- =========================
create table deal_commitments (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  investor_id uuid references investors(id),
  requested_units numeric(28,8),
  requested_amount numeric(18,2),
  selected_fee_plan_id uuid,                        -- resolved via investor_terms
  term_sheet_id uuid,                                -- points to term_sheets.id when created
  status text check (status in ('submitted','under_review','approved','rejected','cancelled')) default 'submitted',
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table approvals (
  id uuid primary key default gen_random_uuid(),
  entity_type text,                                  -- 'deal_commitment','allocation','document',...
  entity_id uuid,
  action text check (action in ('approve','reject','revise')),
  status text check (status in ('pending','approved','rejected')) default 'pending',
  requested_by uuid references profiles(id),
  assigned_to uuid references profiles(id),
  decided_by uuid references profiles(id),
  decided_at timestamptz,
  notes text,
  priority text default 'normal',
  created_at timestamptz default now()
);

-- =========================
-- Pricing, Term Sheets & Document Automation
-- =========================
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
  kind fee_component_kind_enum not null,
  calc_method fee_calc_method_enum,
  rate_bps int,
  flat_amount numeric(18,2),
  frequency fee_frequency_enum default 'one_time',
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
  doc_id uuid references documents(id),             -- rendered term sheet PDF
  terms_data jsonb,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  unique (deal_id, investor_id, version)
);

create table doc_templates (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  provider doc_provider_enum not null,
  file_key text,                                    -- template file in storage
  schema jsonb                                      -- required merge fields
);

create table esign_envelopes (
  id uuid primary key default gen_random_uuid(),
  provider doc_provider_enum,
  envelope_id text unique,
  status text,
  recipient_email citext,
  created_at timestamptz default now(),
  completed_at timestamptz
);

create table doc_packages (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id),
  investor_id uuid references investors(id),
  kind doc_package_kind_enum not null,
  status doc_package_status_enum default 'draft',
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
  sort_order int,
  unique (package_id, sort_order)
);

-- =========================
-- Fees, Invoices, Payments & Bank Reconciliation
-- =========================
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
  status fee_event_status_enum default 'accrued',
  created_at timestamptz default now()
);
create index on fee_events (deal_id, investor_id, status, event_date);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id),
  deal_id uuid references deals(id),
  due_date date,
  currency text default 'USD',
  subtotal numeric(18,2),
  tax numeric(18,2),
  total numeric(18,2),
  status invoice_status_enum default 'draft',
  generated_from text,                               -- 'fee_events','introducer_commissions','manual'
  doc_id uuid references documents(id),              -- rendered invoice PDF
  created_at timestamptz default now()
);
create index on invoices (investor_id, deal_id, status);

create table invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  kind text check (kind in ('fee','spread','other')),
  description text,
  quantity numeric(28,8),
  unit_price numeric(18,6),
  amount numeric(18,2) not null,
  fee_event_id uuid references fee_events(id),
  unique (fee_event_id)                               -- a fee_event -> one line
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
  status payment_status_enum default 'received',
  created_at timestamptz default now()
);
create index on payments (invoice_id);

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
create index on bank_transactions (account_ref, value_date, amount);

create table reconciliations (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id),
  bank_transaction_id uuid references bank_transactions(id),
  matched_amount numeric(18,2),
  matched_at timestamptz default now(),
  matched_by uuid references profiles(id),
  unique (invoice_id, bank_transaction_id)
);

-- =========================
-- Workflows, Reports, Tasks & Ask
-- =========================
create table workflows (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  n8n_webhook_url text,
  schema jsonb,
  allowed_titles text[]
);

create table workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid references workflows(id),
  triggered_by uuid references profiles(id),
  payload jsonb,
  status text default 'queued',
  result_ref uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table report_requests (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id),
  vehicle_id uuid references vehicles(id),
  filters jsonb,
  status report_status_enum default 'queued',
  result_doc_id uuid references documents(id),
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

create table request_tickets (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id),
  created_by uuid references profiles(id),
  category text,
  subject text,
  details text,
  status request_status_enum default 'open',
  priority request_priority_enum default 'normal',
  assigned_to uuid references profiles(id),
  linked_workflow_run uuid,
  result_doc_id uuid references documents(id),
  deal_id uuid references deals(id),                  -- deal-scoped asks
  created_at timestamptz default now()
);
create index on request_tickets (deal_id, status);

-- =========================
-- Chat & Audit
-- =========================
create table conversations (
  id uuid primary key default gen_random_uuid(),
  subject text,
  created_by uuid references profiles(id),
  type convo_type_enum default 'dm',
  name text,
  deal_id uuid references deals(id),
  created_at timestamptz default now()
);
create index on conversations (deal_id, type);

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
create index on audit_log (entity, entity_id);
```

---

## Why this schema is “correct” for your scope

* **Deal‑scoped access** is a first‑class concept: membership drives visibility across docs, chat, and “Ask” via `deal_id`, not just vehicle entitlements. This mirrors the client’s requested collaboration model for spouses/lawyers/bankers/introducers and keeps the investor’s global scope clean.&#x20;
* **No oversell under concurrency**: inventory lives in `share_lots` (with `units_remaining`), and reservations/allocations are split across lots via junction tables. Your service functions will lock lots (`FOR UPDATE SKIP LOCKED`), decrement on reserve, restore on expiry, and convert to approved allocations. Schema guarantees lot‑level accounting; policies/functions enforce the timing.&#x20;
* **Per‑investor pricing**: `fee_plans + fee_components` describe economics; `investor_terms` (unique active per investor×deal) and `term_sheets` (versioned) capture negotiated terms and feed **doc packages** for e‑sign.&#x20;
* **Fee engine & billing**: `fee_events` accrue across subscription/management/performance/spread and flow into `invoices → invoice_lines`; payments + bank ingest + `reconciliations` complete the loop so finance can close.&#x20;
* **Introducer attribution** is explicit and can be invoiced or tied to spread/fees per your commercial model.&#x20;
* **Core portal**: investments (vehicles, subscriptions, positions, valuations, capital calls, distributions, cashflows), secure **documents**, n8n‑driven **reports/Ask**, **workflows**, **chat**, and **audit** match your MVP/PRD and platform overview.  &#x20;

---

## Notes & next steps

* **Indexes** included on all hot paths (joins, lookups, cron scans). Add more once you have query telemetry.&#x20;
* **Integrity**: partial uniques (e.g., `investor_terms` active), check constraints on money/units, and single‑use mappings (e.g., `invoice_lines.fee_event_id` unique) prevent common data errors.&#x20;
* **RLS**: enable and apply the policies from your PRD (investor isolation via `investor_users`, staff read‑all; extend docs/chat/requests with `deal_id` entitlement path). If helpful I can drop the exact `alter table ... enable row level security;` and policy snippets aligned to this schema.&#x20;

If you want, I can also generate **seed fixtures** (a sample deal with two lots, two fee plans, two investors with different terms, an introducer, and a short reservation→allocation walk‑through) so engineering can run acceptance checks immediately.
