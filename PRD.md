# VERSO Holdings Investor & Staff Portal - Product Requirements Document

  

## Platform Overview

  

The VERSO Holdings Portal is a secure, two-sided platform that connects investors with VERSO staff across multiple investment vehicles. The platform manages investor relations, fund operations, and compliance for VERSO Holdings' merchant banking operations covering private equity, venture capital, and real estate investments.

  

### Business Context

- **Assets Under Management**: $800M+

- **Investment Vehicles**: VERSO FUND (BVI), REAL Empire, SPVs, Direct Notes  

- **Regulatory Requirements**: BVI Professional Mutual Fund regulations, GDPR compliance

- **Geographic Scope**: Luxembourg entities, international investor base

  

### Technology Stack

  

- **Database:** Supabase (Postgres, Storage, Realtime, RLS)

- **Auth:** **Supabase Auth (recommended)** or **Clerk** (notes below)

- **Frontend:** Next.js (App Router, TS), Tailwind CSS, shadcn/ui

- **Workflows:** n8n (webhooks both ways)

- **Back‑office:** NocoDB (connected to the same Postgres where possible, or bridged)

- **E‑Sign:** Dropbox Sign or DocuSign (pick one at build time)

- **Monitoring:** Sentry for error tracking and performance monitoring

- **Data Visualization:** Chart.js for performance charts and analytics

- **Form Management:** React Hook Form with Zod validation

  

---

  

## 1) Product Summary

  

Build a secure, two‑sided portal for **investors** and **VERSO staff**:

  

* **Investors:** discover **their related vehicles** (entitled only) with a **dedicated page per vehicle**; view holdings/performance; download docs; trigger **Quick Requests** (e.g., **Positions Statement**, **Investments Report**); if a needed item isn't available, submit an **Ask for request** to the staff portal; chat with VERSO.

* **Staff:** manage onboarding/docs/e‑sign; triage **Ask** requests; trigger **BizOps/Automation workflows** (Inbox Manager, Shared‑Drive Notification, LinkedIn Leads Scraper, Positions Statement, NDA Agent, Reporting Agent) via **pop‑up input forms**; chat 1:1 or in groups; review audit logs.

  

### Objectives

  

- **Single source of truth** for investor data across vehicles.

- **Self‑service** for investors; reduce email dependency.

- **Operational automation** via n8n with secure, signed webhooks.

- **Compliance‑ready**: access control, audit logs, data segregation (RLS).

- **Title‑based access control** in staff portal (see Admin & RBAC).

  

### Non‑Goals (for MVP)

  

- Public deal marketing pages (investor portal only).

- Automated capital call payments or embedded payments.

- Signal bridge (optional Phase 3; MVP chat is in‑portal).

  

---

  

## 2) Users & Roles

  

**User types**

  

- **Investor User** (investor): external user associated with one or more **investor entities** (e.g., an individual or LP entity).

- **Staff** (internal):

    - **Admin** (superuser; can manage roles, vehicles, policies)

    - **Ops** (onboarding, docs, KYC status, workflows)

    - **RM/PM** (client comms, reporting, performance views)

  

**Access model**

  

- **Row‑Level Security (RLS)** for investor isolation.

- **Entitlements** link users/entities to vehicles and documents.

  

**Titles (staff fine‑grained access):** Add a `title` attribute on staff profiles (examples: `bizops`, `automations`, `pm`, `rm`, `compliance`, `admin`). Titles gate **page visibility** and **which workflows** a staff user can trigger.

  

---

  

## 3) Use Cases & User Stories (MVP)

  

**Investor – new/changed**

  

1. As an investor, I sign up / sign in and see only my positions across vehicles.

2. I view **NAV, contributions, distributions, unfunded**, and a cash‑flow timeline.

3. I complete onboarding tasks (KYC → NDA → Subscription) and see status.

4. I download watermarked documents (statements, contracts) with secure links.

* I can browse a **Vehicle Directory** that shows only vehicles I'm entitled to; each **vehicle has a dedicated page** with my data.

* I can submit **Quick Requests** (Positions Statement, Investments Report).

* If my needed report isn't listed, I can file an **Ask for request** and track status.

6. I chat with VERSO staff in the portal (files + read receipts).

  

**Staff – new/changed**

  

1. As staff, I view an **ops dashboard**: onboarding funnel, pending KYC, requests, unread chats.

2. I trigger **workflows** (generate statements, run KYC, issue capital call) which call **n8n webhooks**.

3. I manage documents, send for e‑signature, and track status.

4. I answer investor chats and attach documents.

5. I review **audit logs** for compliance.

* I can open a **Process Center**, click a workflow card (e.g., Inbox Manager, etc.), a **pop‑up form** appears for required inputs, and my **workflow run** status is tracked.

* I can **triage Ask requests**, assign owners, convert to workflow runs, and attach results.

  

---

  

## 4) Success Metrics (MVP)

  

- ≥ X% of active investors onboarded to the portal (set your target).

- ≥ Y% reduction in email‑based report requests.

- Median report request turnaround ≤ Z (internally defined SLA).

- 0 P1 security incidents; 100% of restricted data covered by RLS.

- < A minutes to fulfill a standard position statement via n8n.

  

_(Choose numeric targets internally; the PRD avoids time estimates.)_

  

---

  

## 5) Functional Requirements

  

### 5.1 Authentication & Accounts

  

- **Option 1 (Recommended): Supabase Auth**

    - Email/password + magic link; MFA for staff (TOTP).

    - Works natively with RLS via `auth.uid()`.

- **Option 2: Clerk**

    - Keep **all DB writes/reads server‑side** using Supabase **service role**; enforce access checks in application code (you'll **not** be able to rely on RLS from the browser).

    - Realtime features require server‑mediated broadcasts.

    - **If speed & RLS matter:** pick **Supabase Auth**.

  

**Profiles**

  

- `profiles` row per `auth.users.id` with role enum (`investor|staff_admin|staff_ops|staff_rm`).

  

* **Dual‑brand entry points:**

  * **Investors:** VersoHoldings login and app routes.

  * **Staff:** VersoTech login and app routes.

  

### 5.2 Investor Dashboard

  

#### Key Performance Indicators Display

- **Current Net Asset Value**: Aggregated NAV across all entitled vehicles

- **Total Capital Contributed**: Cumulative capital calls paid to date

- **Total Distributions**: All distributions received across vehicles

- **Unfunded Commitment**: Remaining capital obligation

- **Performance Metrics**: IRR, DPI, TVPI calculations where applicable

  

#### Holdings Overview

- **Vehicle Summary Table**: List of all vehicles with position details

- **Investment Details**: Units held, cost basis, current valuation, acquisition dates

- **Performance Charts**: NAV trends, cash flow timelines, return analysis

- **Upcoming Events**: Capital call deadlines, expected distributions, important dates

  

#### Activity Feed

- **Recent Documents**: Newly available reports, statements, legal documents

- **Messages**: Unread communications from VERSO staff

- **Tasks**: Outstanding onboarding or compliance requirements

- **Notifications**: System alerts, process updates, deadline reminders

  

#### Quick Actions

* Prominent **Quick Requests** button (opens picker for Positions Statement / Investments Report).

* **Ask for request** link when Quick Requests don't cover the need.

  

### 5.3 Holdings & Performance

  

#### Multi-Vehicle Portfolio Management

- **Vehicle Types**:

  - **VERSO FUND**: BVI Professional Mutual Fund with FSC regulation compliance

  - **REAL Empire**: Real estate securitization products and compartments  

  - **Special Purpose Vehicles**: Deal-specific investment structures

  - **Direct Investment Notes**: Individual investment instruments

  

#### Position Details

- **Current Holdings**: Units/shares owned, percentage ownership, cost basis

- **Valuation Information**: Current NAV per unit, total position value, unrealized gains/losses

- **Investment History**: Acquisition dates, capital call history, distribution record

- **Performance Analytics**: Time-weighted and money-weighted returns, benchmark comparisons

  

#### Cash Flow Management

- **Capital Calls**: Historical payments, upcoming obligations, wire instructions

- **Distributions**: Received payments, classification (return of capital, income, capital gains)

- **Commitment Tracking**: Original commitment, funded amount, remaining obligation

- **Cash Flow Timeline**: Visual representation of payments and receipts over time

  

#### Performance Analytics

- **Return Calculations**: IRR (money-weighted), TWR (time-weighted), DPI, TVPI, MOIC

- **Risk Metrics**: Volatility analysis, drawdown measurements, correlation studies

- **Benchmarking**: Comparison against relevant indices, peer groups, and target returns

- **Attribution Analysis**: Performance decomposition by asset class, geography, time period

- **Scenario Analysis**: Stress testing, sensitivity analysis, what-if modeling

  

### 5.3a Vehicle Directory & Pages

  

* **Directory (Investor):** filterable list of **entitled vehicles**; click → **/vehicle/\[id]**.

* **Vehicle page:** investor's position summary, NAV trend, cash‑flows, scoped docs; **"Request report for this vehicle"** shortcut.

  

### 5.4 Tasks & Onboarding

  

#### Investor Onboarding Workflow

- **Account Creation**: User registration, email verification, initial access setup

- **Identity Verification**: Document upload, identity confirmation, beneficial ownership disclosure

- **KYC/AML Processing**: Sanctions screening, risk assessment, professional investor qualification

- **Legal Documentation**: NDA execution, subscription agreement completion, banking information collection

- **Investment Activation**: Initial capital call processing, position setup, portal access completion

  

#### Task Management System

- **Dynamic Task Generation**: Automatic task creation based on investor type, vehicle selection, and regulatory requirements

- **Progress Tracking**: Real-time status updates, completion percentages, milestone achievements

- **Deadline Management**: Automated reminders, escalation procedures, overdue task highlighting

- **Staff Assignment**: Automatic task routing to appropriate team members based on expertise and workload

- **Dependency Management**: Task sequencing, prerequisite validation, workflow coordination

  

#### Compliance Tracking

- **Regulatory Requirements**: BVI professional investor criteria, GDPR consent management, AML compliance

- **Documentation Status**: Required document collection, approval status, renewal tracking

- **Risk Assessment**: Ongoing monitoring, periodic reviews, risk rating updates

- **Audit Preparation**: Compliance documentation, audit trail maintenance, regulatory reporting

  

#### E-Signature Integration

- E‑signature flow for NDA/subscription (Dropbox Sign/DocuSign) with webhooks to update task status and attach signed PDFs.

- Embedded signing URLs inside portal for seamless user experience

- Automatic document storage and task completion upon signature

  

### 5.5 Document Management System

  

#### Secure Document Vault

- **Document Categories**:

  - **Legal Documents**: NDAs, subscription agreements, partnership documents, amendments

  - **Financial Reports**: Position statements, performance reports, tax documents, K-1s

  - **Compliance Materials**: KYC documentation, regulatory filings, audit reports

  - **Operational Communications**: Capital call notices, distribution memos, investor letters

  - **Marketing Materials**: Quarterly reports, investment presentations, market updates

  

#### Security Features

- **Document Watermarking**: Automatic watermarking with investor name, download timestamp, unique identifier

- **Access Control**: Document-level permissions based on vehicle entitlements and user roles

- **Secure Downloads**: Pre-signed URLs with short expiration times (15 minutes maximum)

- **Audit Trail**: Complete logging of document access, downloads, and sharing activities

- **Version Control**: Historical document versions with change tracking and approval workflows

  

#### Document Processing

- **Upload Security**: Virus scanning, malware detection, file type validation

- **Metadata Extraction**: Automatic tagging, categorization, searchable content indexing

- **Distribution Management**: Automated document sharing to entitled investors based on vehicle access

- **Retention Policies**: Automated archival and deletion based on document type and regulatory requirements

  

### 5.6 Reporting & Analytics Engine

  

#### Standard Report Library

- **Position Statements**: Current holdings across all vehicles with detailed breakdowns

- **Performance Reports**: Return analysis with benchmark comparisons and peer group data

- **Cash Flow Statements**: Historical and projected capital movements with timing analysis

- **Tax Documentation**: Annual K-1 packages, foreign tax credits, withholding summaries

- **Compliance Reports**: Regulatory filings, beneficial ownership updates, audit documentation

  

#### Custom Report Generation

- **Self-Service Portal**: Investor-initiated report requests with flexible parameter selection

- **Filter Options**:

  - **Date Ranges**: Inception to date, calendar year, fiscal year, custom periods

  - **Vehicle Selection**: Single vehicle, multiple vehicles, or entire portfolio

  - **Currency Options**: USD, EUR, GBP, or investor's base currency

  - **Output Formats**: PDF, Excel, CSV with customizable layouts

- **Automated Processing**: n8n workflow engine for report generation and delivery

- **SLA Management**: Service level agreement tracking, escalation procedures, quality assurance

  

#### Quick Requests Library (configurable)

* **Positions Statement** (as‑of date, vehicles\[], currency, format PDF/CSV).

* **Investments Report** (from/to, vehicles\[], metrics).

* Submitting a quick request creates `report_requests` and triggers n8n; status: `queued|processing|ready|failed`; result delivered as a document + notification.

  

#### Ask for Request (Fallback)

* **Ask for request (fallback):** creates a `request_tickets` item routed to staff; staff may convert it to a workflow run and/or attach output documents; requester can track status.

  

### 5.7 Communication & Messaging

  

#### In-Portal Messaging System

- **Secure Communications**: End-to-end encrypted messaging between investors and staff

- **Real-Time Features**: Live chat functionality, typing indicators, read receipts

- **File Sharing**: Document attachments, image sharing, spreadsheet exchange

- **Conversation Management**: Message threading, search functionality, archival system

- **Group Communications**: Multi-participant discussions for complex topics or announcements

* **1:1 and group** conversations between staff and investors (as invited) and staff‑only groups

  

#### Notification Management

- **Multi-Channel Delivery**: In-app notifications, email alerts, SMS notifications (optional)

- **Customizable Preferences**: User-controlled notification settings by category and delivery method

- **Content Categories**:

  - **Transactional**: Capital calls, distributions, document availability

  - **Informational**: Market updates, performance summaries, system announcements

  - **Operational**: Task reminders, deadline alerts, process completions

  - **Security**: Login alerts, password changes, suspicious activity warnings

  

#### Signal Integration (Optional - Phase 3)

- **Matrix Bridge**: Professional Signal connectivity through Element Matrix Services

- **Message Synchronization**: Bidirectional message flow between Signal and portal

- **Contact Management**: Automatic contact discovery and group management

- **Compliance Features**: Message archival, audit trail maintenance, regulatory compliance

  

### 5.8 Staff Operations Portal

  

#### Operations Dashboard

- **Pipeline Management**:

  - **Onboarding Funnel**: Investors at each stage of the onboarding process

  - **KYC Queue**: Pending identity verifications and compliance reviews

  - **Document Processing**: E-signature status, document generation queue

  - **Report Requests**: Open investor report requests with SLA tracking

  

- **Process Monitoring**:

  - **Workflow Status**: Active n8n processes and completion status

  - **System Health**: Integration monitoring, error tracking, performance metrics

  - **Compliance Tracking**: Regulatory deadlines, renewal requirements, audit preparations

  - **Communication Queue**: Unread investor messages, response time tracking

  

- **Operational Metrics**:

  - **Performance KPIs**: Task completion rates, response times, SLA adherence

  - **User Activity**: Login patterns, feature usage, engagement metrics

  - **System Utilization**: Document downloads, report generation frequency

  - **Error Monitoring**: Failed processes, system issues, user-reported problems

  

#### Process Center & Workflow Automation

* **Process Center:** workflow cards (**Inbox Manager**, **Shared‑Drive Notification**, **LinkedIn Leads Scraper**, **Positions Statement**, **NDA Agent**, **Reporting Agent**). Clicking a card opens a **pop‑up form** (schema‑driven) and triggers n8n; show run status/history.

  

- **Staff Process Triggers**:

  - **One-Click Operations**: Button-driven workflow initiation from staff dashboard

  - **"Generate Position Statement"**: Instant investor position report creation

  - **"Run KYC Check"**: Comprehensive compliance verification workflow

  - **"Issue Capital Call"**: Multi-step capital call generation and distribution

  - **"Process Distribution"**: Distribution calculation and payment workflow

  - **"Send Document Package"**: Bulk document distribution to entitled investors

  

#### Request Management

* **Request Inbox (Ask):** triage/assign/convert to workflow runs; attach outputs.

- **Task Assignment**: Automatic task routing to appropriate team members

- **SLA Tracking**: Service level agreement monitoring and escalation

- **Status Updates**: Real-time progress tracking and completion notifications

  

#### Administrative Functions

* **Document manager** and **Audit log viewer**

- **User Management**: Account lifecycle, role assignment, access modification

- **Vehicle Management**: New vehicle setup, entitlement rules, performance benchmarks

- **System Configuration**: Feature flags, integration settings, workflow customization

  

### 5.9 Admin & RBAC

  

- Role management and **vehicle entitlements** per investor entity or user.

- Feature flags (enable/disable Chat, Report types).

* **Title gates:** Map staff `title` values to **allowed workflows** and **visible pages**. A staff user can only see pages/trigger workflows if their title is in the allowed list for that resource.

  

---

  

## 6) Non‑Functional Requirements

  

### Security & Compliance Framework

  

#### Authentication & Authorization

- **Multi-Factor Authentication**: Required for all staff users, optional for investors

- **Role-Based Access Control**: Granular permissions based on user role and vehicle entitlements

- **Row-Level Security**: Database-level data isolation ensuring investors see only their data

- **Session Management**: Automatic timeouts, concurrent session limits, secure session handling

  

#### Data Protection

- **Encryption Standards**:

  - **In Transit**: TLS 1.3 for all communications

  - **At Rest**: AES-256 encryption for stored data

  - **Field-Level**: Additional encryption for sensitive PII and financial data

- **Key Management**: Automatic key rotation, secure key storage, access auditing

- **Data Residency**: EU-based data storage for GDPR compliance requirements

  

#### Regulatory Compliance

- **GDPR Framework**:

  - **Data Subject Rights**: Right to erasure, data portability, access requests

  - **Consent Management**: Granular consent tracking and withdrawal mechanisms

  - **Privacy Controls**: Data minimization, purpose limitation, storage limitation

- **BVI Compliance**:

  - **Professional Investor Verification**: Automated qualification checking

  - **Offering Document Management**: Regulatory document distribution and tracking

  - **Reporting Requirements**: Automated regulatory submission preparation

- **KYC/AML Standards**:

  - **Customer Due Diligence**: Comprehensive identity verification workflows

  - **Sanctions Screening**: Real-time checking against global sanctions lists

  - **Ongoing Monitoring**: Periodic review cycles and risk assessment updates

  

#### Audit & Monitoring

- **Immutable Audit Log**: Hash-chained entries preventing tampering or deletion

- **Activity Tracking**: Complete user action logging with detailed context information

- **Access Monitoring**: Failed login attempts, unusual access patterns, privilege escalation alerts

- **Data Flow Tracking**: Complete data lineage and processing audit trails

- **Incident Response**: Automated alert systems and investigation workflow triggers

  

### Performance & Quality Standards

  

#### Performance Requirements

- **Page Load Times**: Initial page load under 2 seconds, subsequent navigation under 500ms

- **API Response Times**: Database queries under 100ms, complex operations under 500ms

- **Availability**: 99.9% uptime with planned maintenance windows

- **Scalability**: Support for 1000+ concurrent users and 10,000+ total users

- **Data Processing**: Large report generation under 30 seconds, real-time notifications under 5 seconds

  

#### Security Standards

- **Zero Critical Vulnerabilities**: No unpatched critical security vulnerabilities

- **Penetration Testing**: Annual third-party security assessments with remediation

- **Compliance Audits**: Regular SOC 2 Type II compliance validation

- **Incident Response**: Complete incident response plan with 24-hour maximum resolution time

- **Data Breach Prevention**: Multi-layered security controls with continuous monitoring

  

#### User Experience Standards

- **Mobile Responsiveness**: Full functionality across desktop, tablet, and mobile devices

- **Accessibility**: WCAG 2.1 AA compliance for users with disabilities

- **Browser Support**: Latest versions of Chrome, Firefox, Safari, and Edge

- **Offline Capability**: Graceful degradation when network connectivity is limited

- **Internationalization**: Support for multiple languages and currency formats

  

### Webhook Security & Integration

- **HMAC Verification**: Cryptographic signature validation for all webhook communications

- **Timestamp Validation**: Protection against replay attacks and stale requests

- **Idempotency Controls**: Duplicate request prevention and transaction integrity

- **Rate Limiting**: Protection against abuse and system overload

- **Error Handling**: Automatic retry mechanisms and failure notification systems

  

---

  

## 7) Workflow Automation & Process Management

  

### n8n Integration Framework

  

#### Process Categories

- **Onboarding Automation**: KYC verification, document generation, account setup

- **Reporting Engine**: Automated report creation, data compilation, delivery workflows

- **Compliance Monitoring**: Deadline tracking, renewal alerts, regulatory submissions

- **Communication Workflows**: Notification distribution, escalation procedures, response tracking

- **Data Management**: External system integration, data validation, synchronization processes

  

#### Event-Driven Automation

- **Trigger Events**:

  - **Document Upload**: Automatic virus scanning and metadata processing

  - **E-Signature Completion**: Task status updates and next-step initiation

  - **Report Request**: Immediate workflow start and processing queue entry

  - **Performance Update**: Automatic investor notification and dashboard refresh

  - **Deadline Approach**: Proactive alert generation and escalation procedures

  

#### Workflow Security & Integration

- **HMAC Verification**: Cryptographic signature validation for all webhook communications

- **Timestamp Validation**: Protection against replay attacks and stale requests

- **Idempotency Controls**: Duplicate request prevention and transaction integrity

- **Rate Limiting**: Protection against abuse and system overload

- **Error Handling**: Automatic retry mechanisms and failure notification systems

  

---

  

## 8) System Architecture (MVP)

  

### Infrastructure & Deployment

- **Application Hosting**: Vercel for Next.js deployment with global CDN

- **Database Hosting**: Supabase managed PostgreSQL with automatic backups

- **Environment Management**: Development, staging, and production environments

- **Security Monitoring**: Automated vulnerability scanning and penetration testing

- **Backup & Recovery**: Automated daily backups with point-in-time recovery capabilities

  

### Core Architecture

- **Next.js App Router** (SSR + API routes)

- **Supabase**: Postgres + Storage + Realtime + Auth (or DB only if using Clerk)

- **NocoDB**: Connected to **the same Postgres** (preferred) for back‑office grids.

    - If you must keep a **separate** NocoDB DB (legacy), use n8n to sync to Supabase via periodic jobs or transactional webhooks.

- **n8n**: workflow engine; receives signed POSTs from portal; posts back results to portal webhook.

* Workflow **form schemas** are stored with each workflow and rendered into **pop‑up forms** in the Process Center.

  

### Integration Ecosystem

- **Workflow Engine**: n8n for process automation and external system integration

- **Back-Office Tools**: NocoDB for staff operational views and data management

- **E-Signature Platform**: DocuSign or Dropbox Sign for legal document execution

- **Document Processing**: Server-side PDF generation, watermarking, and manipulation

- **Monitoring Solutions**: Sentry for error tracking, performance monitoring, and alerting

  

---

  

## 9) Data Model (abridged ERD)

  

**Identity**

  

- `profiles (id uuid pk -> auth.users.id, role text, display_name text, email text unique, title text)`

- `investors (id uuid pk, legal_name text, type text, kyc_status text, country text)`

- `investor_users (investor_id uuid fk, user_id uuid fk)` — many‑to‑many

- `vehicles (id uuid pk, name text, type text, domicile text, currency text)`

  

**Investments**

  

- `subscriptions (id uuid, investor_id, vehicle_id, commitment numeric, currency, status text, signed_doc_id uuid)`

- `valuations (id uuid, vehicle_id, as_of_date date, nav_total numeric, nav_per_unit numeric)`

- `positions (id uuid, investor_id, vehicle_id, units numeric, cost_basis numeric, last_nav numeric, as_of_date date)`

- `capital_calls (id uuid, vehicle_id, name text, call_pct numeric, due_date date, status text)`

- `distributions (id uuid, vehicle_id, name text, amount numeric, date date, classification text)`

- `cashflows (id uuid, investor_id, vehicle_id, type text check in ('call','distribution'), amount numeric, date date, ref_id uuid)`

  

**Docs & tasks**

  

- `documents (id uuid, owner_investor_id uuid nullable, owner_user_id uuid nullable, vehicle_id uuid nullable, type text, file_key text, watermark jsonb, created_by uuid, created_at timestamptz)`

- `tasks (id uuid, owner_user_id uuid, kind text, due_at timestamptz, status text, related_entity_type text, related_entity_id uuid)`

- `report_requests (id uuid, investor_id, vehicle_id nullable, filters jsonb, status text, result_doc_id uuid nullable, created_by uuid, created_at timestamptz)`

  

**Workflows**

  

- `workflows (id uuid, key text unique, n8n_webhook_url text, schema jsonb, allowed_titles text[])`

- `workflow_runs (id uuid, workflow_id uuid, triggered_by uuid, payload jsonb, status text, result_ref uuid nullable, created_at timestamptz, updated_at timestamptz)`

  

**Chat & audit**

  

- `conversations (id uuid, subject text, created_by uuid, created_at timestamptz, type text check in ('dm','group') not null default 'dm', name text)`

- `conversation_participants (conversation_id uuid, user_id uuid)`

- `messages (id uuid, conversation_id uuid, sender_id uuid, body text, file_key text nullable, created_at timestamptz)`

- `audit_log (id bigserial pk, actor_user_id uuid, action text, entity text, entity_id uuid, ts timestamptz default now(), hash text, prev_hash text)`

  

**NEW:** `request_tickets (id uuid pk, investor_id uuid?, created_by uuid, category text, subject text, details text, status text default 'open', priority text default 'normal', assigned_to uuid?, linked_workflow_run uuid?, result_doc_id uuid?, created_at timestamptz default now())`.

  

> **Tip:** Keep KYC PII either in `investors` with sensitive columns **encrypted at field level** (PGP or application‑level using KMS) or split into `investor_kyc_details` with restricted access.

  

---

  

## 10) Administrative Functions

  

### User Management

- **Account Lifecycle**: User provisioning, role assignment, access modification, deactivation

- **Bulk Operations**: Mass user import, role updates, vehicle entitlement changes

- **Access Reviews**: Periodic certification, unused account cleanup, privilege validation

- **Self-Service Features**: Password reset, profile updates, notification preferences

  

### Vehicle & Investment Management

- **Vehicle Configuration**: New vehicle setup, entitlement rules, performance benchmarks

- **Investment Processing**: Position updates, valuation imports, cash flow recording

- **Performance Calculation**: Automated return computations, benchmark comparisons

- **Reporting Configuration**: Custom report templates, data source mapping

  

### System Configuration

- **Feature Management**: Environment-specific feature flags and capability controls

- **Integration Settings**: Third-party service configuration, API key management

- **Workflow Customization**: n8n process modification, approval workflows, escalation rules

- **Template Management**: Communication templates, document templates, report formats

  

### Monitoring & Analytics

- **System Health**: Performance monitoring, error tracking, capacity planning

- **Usage Analytics**: Feature utilization, user engagement, adoption metrics

- **Business Intelligence**: Executive dashboards, trend analysis, operational insights

- **Capacity Planning**: Resource utilization monitoring and scaling recommendations

  

---

  

## 11) Supabase RLS Policies (starter snippets)

  

Enable RLS on all tables:

  

```sql

alter table profiles enable row level security;

alter table investors enable row level security;

-- ...repeat...

```

  

**Profiles (everyone can read their own; staff can read all):**

  

```sql

create policy "profiles_self_read"

on profiles for select

using (id = auth.uid());

  

create policy "profiles_staff_read_all"

on profiles for select

to authenticated

using (exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%'));

```

  

**Investor isolation via join table:**

  

```sql

-- investors: investor user sees only linked investors

create policy "investor_users_read"

on investors for select

using (

  exists (

    select 1 from investor_users iu

    where iu.investor_id = investors.id and iu.user_id = auth.uid()

  )

  or exists (

    select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%'

  )

);

  

-- positions: investor sees only their positions; staff all

create policy "positions_investor_read"

on positions for select

using (

  exists (

    select 1 from investor_users iu

    where iu.investor_id = positions.investor_id and iu.user_id = auth.uid()

  )

  or exists (

    select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%'

  )

);

```

  

**Documents (owner‑based and entitlement via vehicle):**

  

```sql

create policy "documents_read_entitled"

on documents for select

using (

  -- document owned by investor and current user belongs to that investor

  (owner_investor_id is not null and exists (

    select 1 from investor_users iu

    where iu.investor_id = documents.owner_investor_id and iu.user_id = auth.uid()

  ))

  -- or entitled via vehicle (investor has subscription to that vehicle)

  or (vehicle_id is not null and exists (

    select 1 from subscriptions s

    join investor_users iu on iu.investor_id = s.investor_id

    where s.vehicle_id = documents.vehicle_id and iu.user_id = auth.uid()

  ))

  -- or staff

  or exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%')

);

```

  

**Chat (allow only participants; supports groups)**

  

```sql

create policy conv_read on conversations for select

using (exists (select 1 from conversation_participants cp

               where cp.conversation_id = conversations.id

                 and cp.user_id = auth.uid()));

create policy conv_part_read on conversation_participants for select

using (exists (select 1 from conversation_participants cp

               where cp.conversation_id = conversation_participants.conversation_id

                 and cp.user_id = auth.uid()));

create policy messages_read on messages for select

using (exists (select 1 from conversation_participants cp

               where cp.conversation_id = messages.conversation_id

                 and cp.user_id = auth.uid()));

create policy messages_insert on messages for insert

with check (exists (select 1 from conversation_participants cp

                    where cp.conversation_id = messages.conversation_id

                      and cp.user_id = auth.uid()));

```

  

**Ask requests (investor sees own; staff all)**

  

```sql

alter table request_tickets enable row level security;

  

create policy request_tickets_read on request_tickets for select

using (

  created_by = auth.uid()

  or exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%')

);

-- Writes: staff can update; creator can create

create policy request_tickets_insert_creator on request_tickets for insert

with check (created_by = auth.uid());

create policy request_tickets_update_staff on request_tickets for update

using (exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%'));

```

  

**Workflow runs gated by title**

  

```sql

alter table workflows enable row level security;

alter table workflow_runs enable row level security;

  

create policy workflows_read_staff on workflows for select

using (exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%'));

  

create policy workflow_runs_insert_allowed on workflow_runs for insert

with check (

  exists (

    select 1

    from workflows w

    join profiles p on p.id = auth.uid()

    where w.id = workflow_runs.workflow_id

      and p.role like 'staff_%'

      and (w.allowed_titles is null or w.allowed_titles @> array[p.title])

  )

);

```

  

_(Repeat analogous write policies with stricter role checks, usually staff‑only.)_

  

---

  

## 12) API Design (Next.js route handlers)

  

> All endpoints require server‑side auth check. For browser calls, use Supabase client with RLS (if using Supabase Auth). If using Clerk, restrict calls to **server actions** only.

  

**Auth/session**

  

- `/api/me` `GET` → current profile, roles, investor links.

  

**Investors**

  

- `/api/portfolio` `GET` → aggregated KPIs + positions per vehicle.

- `/api/cashflows?vehicle_id&from&to` `GET`

- `/api/capital-calls?upcoming=true` `GET`

  

**Vehicle discovery**

  

* `GET /api/vehicles?related=true` → vehicles tied to current user via entitlements.

  

**Documents**

  

- `/api/documents` `GET` (filters: type, vehicle)

- `/api/documents/:id/download` `POST` → returns short‑TTL pre‑signed URL; logs audit event.

  

**Tasks**

  

- `/api/tasks` `GET|PATCH` (status updates)

  

**Report requests**

  

- `/api/report-requests` `POST` → create; triggers n8n webhook

- `/api/report-requests/:id` `GET` → status/details

  

**Ask for request**

  

* `POST /api/requests` → create `request_tickets` (investor).

* `GET /api/requests/:id` → view status (investor/staff per RLS).

* `PATCH /api/requests/:id` (staff) → assign/status/link `workflow_run`/`result_doc_id`.

  

**Chat**

  

- `/api/conversations` `POST` (create with participants)

- `/api/conversations/:id/messages` `GET|POST`

  

**Workflows**

  

- `/api/workflows/:key/trigger` `POST` → server‑only; triggers n8n with signed payload.

* `POST /api/workflows/:key/trigger` → server‑only; creates `workflow_runs`; validates title vs `workflows.allowed_titles`.

- `/api/webhooks/n8n` `POST` (from n8n) → verify signature → update `workflow_runs`, attach docs.

- `/api/webhooks/esign` `POST` (from e‑sign provider) → verify → update tasks/docs.

  

**Webhook security**

  

- HMAC SHA‑256 with shared secret header `X-Signature` and `X-Timestamp`.

- Reject if clock drift > 5 minutes; verify body digest.

  

---

  

## 13) n8n Integration Contracts (examples)

  

**Outbound to n8n (Report Request):**

  

```json

POST {N8N_WEBHOOK_URL}/report/generate

Headers: X-Signature, X-Timestamp

Body: {

  "workflow_run_id": "uuid",

  "report_request_id": "uuid",

  "investor_id": "uuid",

  "vehicle_id": "uuid|null",

  "filters": { "from": "2023-01-01", "to": "2025-06-30", "currency": "USD" },

  "idempotency_key": "uuid"

}

```

  

**Inbound from n8n (Result Ready):**

  

```json

POST /api/webhooks/n8n

Headers: X-Signature, X-Timestamp

Body: {

  "workflow_run_id": "uuid",

  "status": "ready",

  "document": { "type": "Report", "file_key": "reports/abc.pdf", "owner_investor_id": "uuid", "vehicle_id": "uuid|null" }

}

```

  

**Ask → converted to workflow run**

  

```json

POST /api/requests/:id/convert

{

  "workflow_key": "positions_statement",

  "form_inputs": { /* validated against workflow schema */ }

}

```

  

(Implementation: server maps `workflow_key` → `workflows.id`, creates `workflow_runs`, links `request_tickets.linked_workflow_run`.)

  

_(Portal validates signature → writes `documents`, links to `report_requests.result_doc_id`, sets status `ready`, notifies user.)_

  

---

  

## 14) UI & Navigation (MVP Wireframe Outline)

  

**Investor**

  

- **/dashboard**: KPIs, holdings table, upcoming calls, recent docs, "Request report" CTA.

* **/holdings** → becomes the **Vehicle Directory** (entitled vehicles only).

* **/vehicle/\[id]** → confirm dedicated page exists (NAV, position, cash‑flows, docs).

- **/tasks**: onboarding checklist with progress.

- **/documents**: filterable library; download button.

- **/messages**: conversation list + message pane.

  

**Staff**

  

- **/staff** (home): pipeline widgets (KYC pending, requests, unread messages).

* **/staff/processes** → show the **six named workflows** as cards; clicking opens **pop‑up form** (schema‑rendered).

- **/staff/documents**: upload/assign, send for e‑sign.

* **/staff/requests** → new list for **Ask** items (assign/status/convert).

- **/staff/audit**: filterable log.

  

**Components**

  

- KPI cards, DataTable (TanStack), Chart.js charts, FileUploader, Markdown viewer for task instructions, Dialogs (shadcn/ui), Toasts.

  

**Branding & Theme**

  

* Palette locked to **blue/black/white** (corporate/clean). Suggested tokens:

  * Blue `#0B5FFF` (hover `#0A54E6`), Black `#0A0A0A`, White `#FFFFFF`, Neutral text `#111827`, Muted `#6B7280`, Surface `#F3F4F6`.

* Apply across both brands; logo/wordmark swap for **VersoHoldings** vs **VersoTech**.

  

**Login routes**

  

* Investors: `/versoholdings/login`

* Staff: `/versotech/login`

  

---

  

## 15) Document Handling

  

- Upload via server route → Supabase Storage (bucket `docs`) with **server‑side virus scan (n8n)**.

- Watermark on‑upload or on‑download (PDFKit or n8n).

- Downloads only through `/api/documents/:id/download` to create **short‑TTL pre‑signed URLs**; log to `audit_log`.

  

---

  

## 16) Analytics & Audit

  

- **Analytics:** PostHog or Plausible (page views, feature usage, funnel for onboarding).

- **Audit:** Append‑only `audit_log`. For extra integrity, compute `hash = sha256(concat(prev_hash, actor, action, entity, entity_id, ts))`.

  

---

  

## 17) Environments & DevOps

  

- Environments: `dev`, `staging`, `prod`.

- Deploy: Vercel (Next.js); Supabase managed; n8n + NocoDB on managed hosts (EU region).

- Secrets in environment vars; rotate webhook secrets quarterly.

- Backups: daily DB backups; Storage lifecycle rules.

  

**Env vars (sample)**

  

```

NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY= (server only)

N8N_OUTBOUND_SECRET=

N8N_INBOUND_SECRET=

ESIGN_API_KEY=

ESIGN_WEBHOOK_SECRET=

DOCS_BUCKET=docs

```

  

---

  

## 18) NocoDB Strategy

  

- **Preferred:** Point NocoDB to the **Supabase Postgres** so ops shares the same data (ensure NocoDB connects via a restricted DB user; RLS does not apply to NocoDB connection—use views where needed).

- **If legacy NocoDB DB must remain:**

    - Create **n8n sync flows** to mirror key tables to Supabase (upserts by primary key).

    - For operations initiated in portal, treat Supabase as source‑of‑truth; n8n pushes updates back to legacy DB as needed.

    - Maintain a `nocodb_bridge_status` table to track sync health.

  

---

  

## 19) E‑Signature Integration

  

- Provider: **Dropbox Sign** (fast, simple) or **DocuSign** (enterprise).

- Use embedded signing URLs inside portal for NDAs/subscriptions.

- Webhooks to `/api/webhooks/esign` with envelope status → update `tasks`, store signed PDF in `documents`.

  

---

  

## 20) Security Checklist (MVP)

  

- MFA enforced for staff; optional for investors.

- Strong password policy, rate limiting, bot detection on auth endpoints.

- HSTS, secure cookies, CSRF tokens for POST forms.

- Content Security Policy (CSP) locked to necessary domains.

- PII encryption: either app‑level (before insert) or Postgres PGCrypto for sensitive fields.

- Logging: no PII in logs; mask emails in log lines; include correlation IDs.

- Pen test scope defined before go‑live.

  

---

  

## 21) Testing & Acceptance Criteria

  

**Unit**

  

- Policy tests: each RLS policy denies access to other investors' rows.

- Utility functions: IRR calculations vs known test fixtures.

  

**Integration**

  

- End‑to‑end onboarding: create investor → tasks complete → signed NDA attaches to docs → status updates.

- Report request: create → n8n receives → posts back → doc delivered → notification shown.

- Document download: only entitled users get pre‑signed URL; link expires.

  

**Acceptance Criteria Examples**

  

- Investor A cannot query Investor B's `positions` or `documents` (verified via API attempts).

- A signed NDA appears in investor's Documents within seconds of webhook.

- Staff sees a workflow run result with status `ready` and a link to the generated report.

  

---

  

## 22) Initial DB Schema (DDL – paste into Supabase)

  

```sql

-- ROLES

create type user_role as enum ('investor','staff_admin','staff_ops','staff_rm');

  

-- PROFILES

create table profiles (

  id uuid primary key references auth.users(id) on delete cascade,

  role user_role not null default 'investor',

  display_name text,

  email text unique,

  title text,

  created_at timestamptz default now()

);

  

-- INVESTORS & MEMBERSHIP

create table investors (

  id uuid primary key default gen_random_uuid(),

  legal_name text not null,

  type text, -- individual/entity

  kyc_status text default 'pending',

  country text,

  created_at timestamptz default now()

);

  

create table investor_users (

  investor_id uuid references investors(id) on delete cascade,

  user_id uuid references profiles(id) on delete cascade,

  primary key (investor_id, user_id)

);

  

-- VEHICLES & INVESTMENTS

create table vehicles (

  id uuid primary key default gen_random_uuid(),

  name text not null,

  type text, -- fund/spv/securitization/...

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

  

-- DOCUMENTS & TASKS

create table documents (

  id uuid primary key default gen_random_uuid(),

  owner_investor_id uuid references investors(id),

  owner_user_id uuid references profiles(id),

  vehicle_id uuid references vehicles(id),

  type text, -- NDA/Subscription/Report/Statement/KYC

  file_key text not null,

  watermark jsonb,

  created_by uuid references profiles(id),

  created_at timestamptz default now()

);

  

create table tasks (

  id uuid primary key default gen_random_uuid(),

  owner_user_id uuid references profiles(id) on delete cascade,

  kind text, -- onboarding_step etc

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

  

-- WORKFLOWS

create table workflows (

  id uuid primary key default gen_random_uuid(),

  key text unique not null,

  n8n_webhook_url text not null,

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

  

-- CHAT

create table conversations (

  id uuid primary key default gen_random_uuid(),

  subject text,

  created_by uuid references profiles(id),

  type text check (type in ('dm','group')) default 'dm',

  name text,

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

  

-- ASK FOR REQUEST

create table request_tickets (

  id uuid primary key default gen_random_uuid(),

  investor_id uuid references investors(id),

  created_by uuid references profiles(id),

  category text,

  subject text,

  details text,

  status text default 'open',      -- open/assigned/in_progress/ready/closed

  priority text default 'normal',  -- low/normal/high

  assigned_to uuid references profiles(id),

  linked_workflow_run uuid,

  result_doc_id uuid references documents(id),

  created_at timestamptz default now()

);

  

-- AUDIT

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

  

-- INDEXES (samples)

create index on positions (investor_id, vehicle_id);

create index on cashflows (investor_id, vehicle_id, date);

create index on documents (owner_investor_id, vehicle_id, type);

create index idx_request_tickets_status_assignee on request_tickets (status, assigned_to);

create index idx_conversations_type on conversations (type);

```

  

**Enable RLS + policies** (add the policy snippets from Section 9).

  

---

  

## 23) Next.js Project Structure (starter)

  

```

/app

  /(public)

    /versoholdings/login/page.tsx

    /versotech/login/page.tsx

  /(investor)

    /versoholdings/dashboard/page.tsx

    /versoholdings/holdings/page.tsx          # Vehicle Directory

    /versoholdings/vehicle/[id]/page.tsx      # Dedicated vehicle page

    /versoholdings/tasks/page.tsx

    /versoholdings/documents/page.tsx

    /versoholdings/messages/page.tsx

  /(staff)

    /versotech/staff/page.tsx

    /versotech/staff/processes/page.tsx       # Workflow cards → pop-up forms

    /versotech/staff/requests/page.tsx        # Ask inbox

    /versotech/staff/documents/page.tsx

    /versotech/staff/audit/page.tsx

  /api

    /me/route.ts

    /portfolio/route.ts

    /vehicles/route.ts

    /cashflows/route.ts

    /capital-calls/route.ts

    /documents/[id]/download/route.ts

    /report-requests/route.ts

    /requests/route.ts

    /conversations/route.ts

    /conversations/[id]/messages/route.ts

    /workflows/[key]/trigger/route.ts

    /webhooks/n8n/route.ts

    /webhooks/esign/route.ts

/lib

  supabaseServer.ts

  auth.ts

  rls.ts

  hmac.ts

  validation.ts

  theme.ts

/components

  KpiCard.tsx

  DataTable.tsx

  Chart.tsx

  FileUploader.tsx

  ChatPane.tsx

  TaskList.tsx

  ProcessButton.tsx

```

  

---

  

## 24) Notifications

  

- In‑app toasts + inbox; optional email notifications via n8n for "report ready" and "message received" (throttle/batch).

- Store notification preferences per user.

* Notify investors on **Ask** status changes and when a converted request has a result document attached.

  

---

  

## 25) Migration Plan (if legacy NocoDB DB exists)

  

1. **Inventory** existing NocoDB tables and n8n workflows.

2. **Mapping** to new schema; create `staging_*` tables if needed.

3. **One‑time backfill** to Supabase; verify checksums.

4. **Cutover** n8n data sources to Supabase (preferred) or set up **bidirectional sync** for a transition period.

5. **Decommission** legacy tables once stable.

  

---

  

## 26) Open Decisions (defaults suggested)

  

- **Auth provider**: default **Supabase Auth** (keeps RLS end‑to‑end).

- **E‑sign**: default **Dropbox Sign** (faster to implement).

- **NocoDB**: connect to Supabase Postgres directly (single DB).

- **Hosting region**: EU.

- **Chat**: in‑portal only in MVP; Matrix/Signal later if required.

  

---

  

## 27) Immediate Next Steps (actionable checklist)

  

- Spin up Supabase project (EU).

- Create tables & RLS policies (Sections 8–9 + 20).

- Configure Storage bucket `docs` and service role on server.

- Create Next.js app (TS, App Router); integrate Supabase client.

- Implement `/api/me`, `/api/portfolio`, `/api/documents/:id/download`.

- Build Investor Dashboard UI (KPIs + holdings table).

- Implement Report Request flow → n8n webhook (signed).

- Implement `/api/webhooks/n8n` with signature verification.

- Add Documents library + download logging to `audit_log`.

- Add Chat (conversations/messages) with Supabase Realtime.

- Add Tasks page (onboarding checklist) and e‑sign webhook handler.

- Set up NocoDB to the same Postgres (or build sync flows in n8n).

- Add Sentry, CSP, MFA for staff, virus scanning via n8n.

- Seed data + run E2E tests against RLS.

* Seed **workflows** rows for the six named processes and set `allowed_titles`.

* Implement **Quick Requests** picker and **Ask** form on investor dashboard.

* Implement **title checks** server‑side for `/api/workflows/:key/trigger`.

  

---

  

## Branding Tokens (ready to drop in `/lib/theme.ts`)

  

```ts

export const theme = {

  colors: {

    blue: '#0B5FFF',

    blueHover: '#0A54E6',

    black: '#0A0A0A',

    white: '#FFFFFF',

    text: '#111827',

    muted: '#6B7280',

    surface: '#F3F4F6',

    focus: '#93C5FD'

  }

};

```

  

---

  

### Final Notes

  

- If you **must** use Clerk for auth, keep **all DB operations on the server** using Supabase **service role** and enforce authorization in your API (you'll lose the biggest benefit of Supabase RLS on the client). For speed and safety, **Supabase Auth** is the simplest path.

  

