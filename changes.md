Below is a **developer‑ready change spec** you can paste into your repo/wiki and hand to the team. It is written to remove ambiguity and ties every change back to what the client asked for, while staying consistent with your current PRD and Overview. The spec introduces **deal‑scoped access**, **inventory (lots + reservations + allocation)** with **no oversell**, **per‑investor term sheets & dynamic subscription packs**, a **fee engine** (upfront / management / carry / spread) with **invoices, payments, reconciliation**, **approvals/compliance**, and **introducer attribution**—all of which the client explicitly requested.  These changes extend, not replace, your PRD schema, RLS posture, and Supabase/Next.js architecture. &#x20;

---

# Versotech Portal – Change & Additions Spec (v1)

**Audience:** Backend, DB, API, and Workflow engineers
**DB:** Supabase Postgres (w/ RLS), Storage, Realtime
**Auth:** Supabase Auth (service‑role on server API)
**Ref:** PRD v1 (abridged ERD, RLS, API), Feature Overview, Client meeting 2025‑09‑21.  &#x20;

---

## 0) Scope in one line

Implement **deal‑scoped collaboration, inventory & allocation, document automation, fee accounting, and approvals** so that a client can (a) invite lawyers/bankers/introducers into **one deal**, (b) book shares **first‑come‑first‑served** without overselling, (c) receive a **custom term sheet** that auto‑drives their **subscription pack**, and (d) get **accurate fees/invoices** (upfront/annual/carry/spread) with **bank reconciliation** and **introducer commissions**.&#x20;

---

## 1) Data Model – New Tables

> **Conventions:**
> PK: `id uuid primary key default gen_random_uuid()`
> Timestamps: `created_at timestamptz default now(), updated_at timestamptz` (when needed)
> Money/units: `numeric(18,2)` for money; `numeric(28,8)` for units; prices `numeric(18,6)`
> FKs use `on delete cascade` where rows are scoped to a parent object.

### 1.1 Deals & Membership (deal‑scoped access & invites)

**Rationale:** Client needs to invite spouse, lawyers, bankers, introducers **to a specific deal**, not globally; access rights must be per‑deal.  Current PRD has investor↔user and vehicle entitlements but no **deal** entity.&#x20;

```sql
create table deals (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id),         -- nullable for direct positions
  name text not null,
  deal_type text check (deal_type in ('equity_secondary','equity_primary','credit_trade_finance','other')) default 'equity_secondary',
  status text check (status in ('draft','open','allocation_pending','closed','cancelled')) default 'open',
  currency text default 'USD',
  open_at timestamptz,
  close_at timestamptz,
  terms_schema jsonb,                              -- typed parameters by deal_type
  offer_unit_price numeric(18,6),                  -- optional default price shown in UI
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table deal_memberships (
  deal_id uuid references deals(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  investor_id uuid references investors(id),       -- null = external participant (lawyer/banker)
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
  token_hash text unique not null,                 -- store only hash; raw token is emailed
  expires_at timestamptz,
  max_uses int default 1,
  used_count int default 0,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);
```

### 1.2 Introducers & Attribution (commissions later invoiced)

**Rationale:** Introducers must invite clients and be compensated on invested amounts/fees/spread.&#x20;

```sql
create table introducers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),  -- optional if introducer has a portal login
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

### 1.3 Inventory & Allocation (no oversell; first‑come‑first‑served)

**Rationale:** Must track **share source** and **remaining quantity**; allocate FIFO with **reservations (TTL)** and prevent oversubscription under concurrency.&#x20;

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
  units_remaining numeric(28,8) not null,         -- decreases on reservation; restored on expiry
  status text check (status in ('available','held','exhausted')) default 'available',
  created_at timestamptz default now()
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

-- map reserved quantities to specific lots (for later exact allocation)
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

**Notes/guarantees**

* **No oversell**: see §4 for transactional function `fn_reserve_inventory` using `FOR UPDATE SKIP LOCKED`, immediate decrement of `share_lots.units_remaining`, and automatic restore on reservation expiry. &#x20;
* `positions` keeps being the **investor aggregate**; it will be populated from approved/settled **allocations** (optionally introduce `position_lots` later).&#x20;

### 1.4 Commit → Review → Allocate (approvals & compliance)

**Rationale:** After a client commits, **management/compliance** must approve before final allocation.&#x20;

```sql
create table deal_commitments (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  investor_id uuid references investors(id),
  requested_units numeric(28,8),
  requested_amount numeric(18,2),
  selected_fee_plan_id uuid,          -- see fee_plans
  term_sheet_id uuid,                  -- see term_sheets/doc packages
  status text check (status in ('submitted','under_review','approved','rejected','cancelled')) default 'submitted',
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table approvals (
  id uuid primary key default gen_random_uuid(),
  entity_type text,                    -- 'deal_commitment','allocation','document'
  entity_id uuid,
  action text,                         -- 'approve','reject','revise'
  status text check (status in ('pending','approved','rejected')) default 'pending',
  requested_by uuid references profiles(id),
  assigned_to uuid references profiles(id),
  decided_by uuid references profiles(id),
  decided_at timestamptz,
  notes text,
  priority text default 'normal',
  created_at timestamptz default now()
);
```

### 1.5 Pricing Plans, Term Sheets & Document Automation

**Rationale:** Same deal, different investors may get **All‑in 5%** vs **3% up‑front + 10% carry**; selected terms must feed **subscription packs**.  Your PRD has `documents` but not templates/packs/merge data.&#x20;

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
  terms_data jsonb,    -- frozen inputs used to render the doc
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table doc_templates (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,   -- e.g., 'term_sheet_v1','subscription_pack_equity_v1'
  name text not null,
  provider text check (provider in ('dropbox_sign','docusign','server_pdf')) not null,
  file_key text,
  schema jsonb               -- required merge fields
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

### 1.6 Fees, Invoices, Payments & Bank Reconciliation (+ Spread)

**Rationale:** Accurate accounting for **subscription**, **annual management**, **performance (carry)**, and **spread**; generate invoices, record payments, and match to bank transactions. Client flagged this as the biggest pain.&#x20;

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
  source_ref text,                 -- e.g. allocation id or valuation id
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
  generated_from text,             -- 'fee_events','introducer_commissions','manual'
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

**Spread:** On `allocations.status → approved`, compute `(allocation.unit_price - weighted_avg(lot.unit_cost)) * units` and create an `invoice_lines(kind='spread')` or journal entry later.&#x20;

---

## 2) Data Model – Alterations to Existing Tables

1. **documents** – add deal scoping & keep PRD semantics.
   **Why:** Docs should be visible to deal participants (e.g., lawyers) even if they’re not part of the investor entity/vehicle.&#x20;

```sql
alter table documents add column deal_id uuid references deals(id);
create index on documents (deal_id, type);
```

2. **conversations/messages** – allow chat scoping to a deal.

```sql
alter table conversations add column deal_id uuid references deals(id);
create index on conversations (deal_id, type);
```

3. **request\_tickets** – allow “Ask/Request” to be deal‑specific (e.g., “please review John’s Revolut commitment”). &#x20;

```sql
alter table request_tickets add column deal_id uuid references deals(id);
create index on request_tickets (deal_id, status);
```

4. **positions** – **no schema change required**; will be updated from `allocations` on settle; optional future table `position_lots` if per‑lot cost basis is required.&#x20;

---

## 3) Row‑Level Security (RLS) – Additions

> Keep all existing PRD policies. Extend them to include **deal membership** as an entitlement path.&#x20;

**Deals & memberships**

```sql
alter table deals enable row level security;
alter table deal_memberships enable row level security;

-- Users can read a deal if they are members; staff read all
create policy deal_read on deals for select
using (
  exists (select 1 from deal_memberships dm where dm.deal_id = deals.id and dm.user_id = auth.uid())
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%')
);

-- Members can read their membership; staff read all
create policy dm_read on deal_memberships for select
using (
  user_id = auth.uid()
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%')
);
```

**Documents / Conversations** (add an entitlement path via `deal_id`)
Extend your existing policies with:

```sql
-- documents: entitled if deal participant
or (documents.deal_id is not null and exists (
  select 1 from deal_memberships dm
  where dm.deal_id = documents.deal_id and dm.user_id = auth.uid()
))
```

```sql
-- conversations: entitled if deal participant
or (conversations.deal_id is not null and exists (
  select 1 from deal_memberships dm
  where dm.deal_id = conversations.deal_id and dm.user_id = auth.uid()
))
```

**New tables** like `reservations`, `allocations`, `fee_events`, `invoices`, etc., should follow the pattern: the **investor** can read rows where `investor_id` links via `investor_users`, **deal participants** can read where their `deal_id` matches, and **staff** can read all. Reuse the PRD snippets for investor isolation.&#x20;

---

## 4) Server‑side DB Functions & Concurrency (must implement)

All functions must run on the server with Supabase **service‑role** and **serializable** (or `repeatable read` + explicit row locks) transactions. PRD already mandates server‑side writes with authorization in API handlers.&#x20;

### 4.1 `fn_reserve_inventory(deal_id, investor_id, requested_units, proposed_unit_price, hold_minutes) → reservation_id`

* **Algorithm (atomic)**

  1. Validate `deals.status in ('open','allocation_pending')`.
  2. Select `share_lots` for the `deal_id` **`FOR UPDATE SKIP LOCKED`**, ordered by `acquired_at` (FIFO).
  3. Greedily take from lots until `requested_units` covered. For each lot, insert `reservation_lot_items`.
  4. Decrement `share_lots.units_remaining` by reserved units inside the same transaction.
  5. Insert `reservations` with `expires_at = now() + hold_minutes`.
  6. Return `reservation_id`.
* **Guarantee:** No oversell even under concurrency; other sessions skip locked rows.&#x20;

### 4.2 Expiry job `fn_expire_reservations()` (cron via n8n)

* Find `reservations.status='pending' AND expires_at < now()`.
* For each, **restore** `share_lots.units_remaining` by summing `reservation_lot_items.units`.
* Mark reservation `status='expired'`.
* Idempotent: use a **work lock** per reservation (update with `WHERE status='pending'`).&#x20;

### 4.3 `fn_finalize_allocation(reservation_id, approver_id) → allocation_id`

* Preconditions: `reservation.status='pending'`, approval present (`approvals` row for entity `deal_commitment` or reservation).
* Create `allocations(status='approved', unit_price = reservations.proposed_unit_price, units = sum(reservation_lot_items.units))`.
* Copy `reservation_lot_items` → `allocation_lot_items`.
* Set `reservation.status='approved'`; write `approved_by/at` on allocation.
* **Positions update:** Upsert to `positions` (investor\_id, vehicle\_id from `deals.vehicle_id`).
* **Spread recognition:** compute spread per allocation (weighted lot cost) and create `invoice_lines(kind='spread')` (see §1.6).&#x20;

### 4.4 Fees

* `fn_compute_fee_events(deal_id, as_of_date)`

  * For each active `investor_terms` and `fee_components`, emit `fee_events` based on `calc_method` and `frequency`.
  * Bases: invested amount from **approved allocations**; performance base from latest valuation / PnL. (Vehicle valuations already exist in PRD.)&#x20;
* `fn_invoice_fees(deal_id, investor_id, up_to_date)`

  * Group un‑invoiced `fee_events` → create `invoices` + `invoice_lines(kind='fee')`, mark events `status='invoiced'`.

---

## 5) API – New/Extended Endpoints (Next.js route handlers)

> All endpoints **server‑only** with service‑role DB access; every handler enforces auth & entitlements described above. The PRD already defines baseline routes; below are **adds**.&#x20;

### 5.1 Deals & Memberships

* `POST /api/deals` (staff) → create deal (payload: name, vehicle\_id?, deal\_type, offer\_unit\_price?).
* `GET /api/deals/:id` → deal with inventory summary, fee plans, memberships (RLS).
* `POST /api/deals/:id/invite-links` (staff) → create invite link for a role (body: role, expires\_at, max\_uses).
* `POST /api/deals/:id/members` (on invite accept) → upsert `deal_memberships`.

### 5.2 Inventory & Allocation

* `POST /api/deals/:id/reservations` → calls `fn_reserve_inventory`. Body: `investor_id, requested_units, proposed_unit_price`.
* `POST /api/reservations/:id/finalize` (staff/compliance) → calls `fn_finalize_allocation`.
* `POST /api/reservations/expire` (cron) → calls `fn_expire_reservations`.

### 5.3 Commitments, Approvals, Docs

* `POST /api/deals/:id/commitments` → create `deal_commitments` linked to `investor_terms` and generate **term\_sheet** doc via n8n; returns `term_sheets.id`.
* `POST /api/approvals` → create approval for an entity (body: entity\_type, entity\_id, assigned\_to, priority).
* `POST /api/doc-packages` → create a `doc_packages` row and items from a `doc_templates` key + merge data; returns embedded signing URL (Dropbox Sign/DocuSign webhook already in PRD).&#x20;

### 5.4 Fees, Invoices, Payments

* `POST /api/deals/:id/fees/compute` → `fn_compute_fee_events`.
* `POST /api/deals/:id/invoices/generate` (staff) → `fn_invoice_fees`.
* `POST /api/payments/ingest-bank` (staff/cron) → import batch of `bank_transactions`.
* `POST /api/reconciliations/match` (staff) → link `bank_transactions` to `invoices`.

---

## 6) Workflows (n8n) – New/Updated

* **Document Generation (term sheet / subscription pack)**

  * Input: `{ deal_id, investor_id, fee_plan_id, overrides, price_per_unit }`
  * Steps: build `terms_data` → render via `doc_templates` → create `doc_packages` → send for e‑sign → webhook updates `doc_packages.status` + stores signed PDF in `documents`.&#x20;
* **Reservation expiry cron** every 2–5 minutes → `POST /api/reservations/expire`.
* **Fee accrual schedule** (monthly/quarterly/annual per `fee_components.frequency`) → `POST /api/deals/:id/fees/compute`.
* **Invoice generation** (on demand or schedule) → `POST /api/deals/:id/invoices/generate`.
* **Bank import** (CSV/API) → populate `bank_transactions` then trigger an **auto‑match** heuristic (exact amount/date ±2d) to propose `reconciliations`.

---

## 7) UI/Navigation – Additions (minimal set)

* **Investor:** `/deal/[id]` – show offer terms, remaining units, selected fee plan, CTA **Commit** → **Generate Term Sheet** → **Sign Subscription Pack** → **Status**.
* **Staff:** `/versotech/staff/reviews` – **approvals queue** (entity, amount/units, SLA); `/versotech/staff/deals/[id]/inventory` – lots/reservations/allocations.
* **Docs/Chat/Requests**: filter by `deal_id`. (Extend existing pages.)&#x20;

---

## 8) Indexing, Constraints & Defaults (must add)

* **Deals:** `create index on deals (status, deal_type);`
* **deal\_memberships:** `create index on deal_memberships (user_id);`
* **share\_lots:** `create index on share_lots (deal_id, status);`
* **reservations:** `create index on reservations (deal_id, status, expires_at);`
* **allocations:** `create index on allocations (deal_id, investor_id, status);`
* **fee\_events:** `create index on fee_events (deal_id, investor_id, status, event_date);`
* **invoices:** `create index on invoices (investor_id, deal_id, status);`
* **introductions/commissions:** indexes on `(introducer_id)`, `(deal_id, investor_id)`.

**Integrity checks**

* `share_lots.units_remaining >= 0` (CHECK).
* `reservation_lot_items.units > 0`; same for allocations.
* Partial unique: one **active** `investor_terms` per investor per deal (already added).

---

## 9) Migration Plan (Supabase)

1. Run **DDL** in this spec (new tables + alters + indexes).
2. Backfill: for any in‑flight opportunities, create `deals` rows pointing to existing `vehicles` where applicable.
3. For docs/chats/requests that belong to a specific opportunity, update `deal_id`.
4. Deploy RLS policies and verify with PRD acceptance tests (investor isolation, staff read‑all).&#x20;
5. Release **server functions** and API routes; toggle behind a feature flag if needed.
6. Start n8n cron for reservation expiry and fee accrual.

---

## 10) Acceptance Criteria (must pass)

**Deal‑scoped access**

* A non‑Verso user invited as `lawyer` can see **only** the deal’s conversations and documents; cannot see other investor vehicles. (Membership path works.)&#x20;

**No oversell under concurrency**

* 50 parallel `POST /api/deals/:id/reservations` calls requesting more units than available: the sum of **approved + pending reservations** never exceeds `Σ share_lots.units_total`. Expired holds restore availability within 60s.

**Approvals gate**

* Commitment → Approval required → Allocation cannot finalize without `approvals.status='approved'`.

**Per‑investor term sheets**

* Investor A selects **All‑in 5%**; subscription pack shows 5% upfront and **0%** mgmt/performance; Investor B selects **3% + 10% carry**; the pack reflects that.&#x20;

**Fees & invoices**

* Generating invoices up to `2025‑12‑31` creates correct lines for subscription (one‑time), management (annual, prorated on `period_start/end`), and performance (on exit or valuation when applicable), and **spread** appears when allocations are approved above cost.&#x20;

**Introducer attribution**

* When an investor joined via an introducer, the system creates **introducer\_commissions** according to plan (bps of invested amount or fees/spread), and those can be invoiced and marked paid.

---

## 11) Test Fixtures (seed ideas)

* `deals`: `Revolut Secondary – 2025` (USD, open). (Client example.)&#x20;
* `share_sources`: `company: Revolut plc`, contract uploaded.
* `share_lots`: two lots (1,000 and 500 units at different costs).
* `fee_plans`: “All‑in 5%”, “3% + 10% carry”.
* `investor_terms`: A = All‑in; B = 3%+10%.
* `introducers`: “Amin Canada” active; introduction to Investor B; deal linked.&#x20;

---

## 12) Security & Compliance Notes (unchanged posture)

* Keep **all writes/server‑side** using service‑role; the browser never bypasses server checks.
* Extend RLS as in §3; **staff** read‑all via `role like 'staff_%'`, as per PRD.&#x20;
* E‑sign webhooks and n8n webhooks remain HMAC‑signed with timestamp/skew checks (already in PRD).&#x20;

---

## 13) Developer To‑Do Checklist (ordered)

1. **Schema**: create new tables + alters + indexes + RLS in this spec.
2. **Functions**: implement `fn_reserve_inventory`, `fn_expire_reservations`, `fn_finalize_allocation`, `fn_compute_fee_events`, `fn_invoice_fees`.
3. **API**: ship routes in §5 with server‑only guards.
4. **Workflows (n8n)**: doc generation, expiry cron, fee accrual, invoicing, bank ingest.
5. **UI**: add `/deal/[id]`, staff reviews, staff inventory; add `deal_id` filter to Docs/Chat/Requests.
6. **Seeds & Tests**: load fixtures, run acceptance tests in §10.
7. **Docs**: update runbooks for ops (inventory, approvals, invoicing).

---

## 14) Why these changes

* They directly implement **deal‑specific access**, **introducers**, **inventory & first‑come allocation**, **custom term sheets**, **dynamic subscription packs**, **fees & reconciliation**, and a **management review** gate—the exact asks from the client meeting.&#x20;
* They **extend** (not replace) your PRD’s identity, docs, tasks, workflows, and RLS model, keeping Supabase/Next.js/n8n as designed. &#x20;

---

### Appendix A — Sample SQL Snippets (extracts)

**Reservation (pseudo‑PL/pgSQL outline)**

```sql
-- within a transaction at least repeatable read
-- lock candidate lots, allocate reservations, decrement units_remaining atomically
```

**Spread computation (example)**

```sql
-- weighted lot cost
-- sum(li.units * sl.unit_cost) / sum(li.units)
-- spread_amount = (alloc.unit_price - weighted_cost) * alloc.units
```

**RLS entitlement helper (pattern)**

```sql
-- exists (select 1 from investor_users iu where iu.investor_id = X and iu.user_id = auth.uid())
-- or exists (select 1 from deal_memberships dm where dm.deal_id = X and dm.user_id = auth.uid())
-- or staff
```

---


