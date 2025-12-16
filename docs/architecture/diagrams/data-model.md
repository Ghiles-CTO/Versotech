# VERSO Holdings - Data Model Diagrams

This document contains Entity-Relationship Diagrams and data model documentation for the VERSO Holdings Platform.

## 1. Core Domain Model

```mermaid
erDiagram
    %% Identity & Access
    PROFILES ||--o{ INVESTOR_USERS : "links"
    INVESTORS ||--o{ INVESTOR_USERS : "has"

    %% Investment Structure
    VEHICLES ||--o{ DEALS : "creates"
    INVESTORS ||--o{ SUBSCRIPTIONS : "makes"
    VEHICLES ||--o{ SUBSCRIPTIONS : "receives"
    DEALS ||--o{ SUBSCRIPTIONS : "originates"

    %% Deal Flow
    INVESTORS ||--o{ DEAL_MEMBERSHIPS : "participates"
    DEALS ||--o{ DEAL_MEMBERSHIPS : "invites"
    DEALS ||--o{ DEAL_DATA_ROOM_ACCESS : "grants"
    INVESTORS ||--o{ DEAL_DATA_ROOM_ACCESS : "receives"

    %% Documents
    INVESTORS ||--o{ DOCUMENTS : "owns"
    DEALS ||--o{ DOCUMENTS : "contains"
    DOCUMENTS ||--o{ DOCUMENT_VERSIONS : "tracks"

    %% Fees
    DEALS ||--o{ FEE_PLANS : "defines"
    FEE_PLANS ||--o{ FEE_COMPONENTS : "contains"
    SUBSCRIPTIONS }o--|| FEE_PLANS : "uses"
    FEE_COMPONENTS ||--o{ FEE_EVENTS : "generates"
    FEE_EVENTS ||--o{ INVOICES : "billed_in"

    %% Approvals
    PROFILES ||--o{ APPROVALS : "requests"
    DEALS ||--o{ APPROVALS : "relates_to"
    INVESTORS ||--o{ APPROVALS : "relates_to"

    PROFILES {
        uuid id PK
        citext email UK
        user_role role
        text display_name
        timestamptz created_at
    }

    INVESTORS {
        uuid id PK
        text legal_name
        text email
        text kyc_status
        text type
        uuid primary_rm FK
    }

    VEHICLES {
        uuid id PK
        text name
        vehicle_type type
        text currency
        text entity_code UK
    }

    DEALS {
        uuid id PK
        uuid vehicle_id FK
        text name
        deal_status_enum status
        numeric target_amount
    }

    SUBSCRIPTIONS {
        uuid id PK
        uuid investor_id FK
        uuid vehicle_id FK
        uuid deal_id FK
        numeric commitment
        text status
    }
```

## 2. Investment Entity Details

### Vehicles (Investment Structures)

```mermaid
erDiagram
    VEHICLES {
        uuid id PK
        text name "Investment vehicle name"
        vehicle_type type "fund, spv, securitization, note"
        text currency "USD, EUR, GBP"
        text domicile "Luxembourg, Cayman, Delaware"
        text entity_code UK "VC101, IN203, RE1"
        text platform "VC1SCSP, REC, VCL"
        text investment_name "CRANS, REVOLUT, XAI"
        entity_status status "LIVE, CLOSED, TBD"
        text registration_number
        text issuer_gp_name
        text issuer_rcc_number
        uuid arranger_entity_id FK
    }

    ARRANGER_ENTITIES {
        uuid id PK
        text legal_name "Regulated entity name"
        text registration_number
        text jurisdiction
        text regulatory_status
    }

    VEHICLES }o--|| ARRANGER_ENTITIES : "managed_by"
```

### Subscriptions (Investor Commitments)

```mermaid
erDiagram
    SUBSCRIPTIONS {
        uuid id PK
        uuid investor_id FK "Subscribing investor"
        uuid vehicle_id FK "Investment vehicle"
        uuid deal_id FK "Originating deal"
        integer subscription_number "Auto-increment per investor-vehicle"
        numeric commitment "Committed amount"
        numeric funded_amount "Amount funded"
        numeric outstanding_amount "Remaining unfunded"
        text currency "USD, EUR"
        text status "pending, committed, active, closed"
        date effective_date
        numeric num_shares
        numeric price_per_share
        numeric cost_per_share
        numeric spread_per_share
        numeric spread_fee_amount "Primary revenue"
        numeric subscription_fee_percent
        numeric subscription_fee_amount
        numeric management_fee_percent
        text management_fee_frequency
        numeric performance_fee_tier1_percent
        uuid fee_plan_id FK
        uuid introducer_id FK
        uuid introduction_id FK
    }

    INVESTORS ||--o{ SUBSCRIPTIONS : "commits"
    VEHICLES ||--o{ SUBSCRIPTIONS : "receives"
    DEALS ||--o{ SUBSCRIPTIONS : "originates"
    FEE_PLANS ||--o{ SUBSCRIPTIONS : "applies"
    INTRODUCERS ||--o{ SUBSCRIPTIONS : "sources"
```

## 3. Deal Management Model

```mermaid
erDiagram
    DEALS {
        uuid id PK
        uuid vehicle_id FK
        text name
        deal_type_enum deal_type "equity_secondary, equity_primary, credit"
        deal_status_enum status "draft, open, allocation_pending, closed"
        text company_name
        text sector
        text stage
        numeric target_amount
        numeric raised_amount
        numeric minimum_investment
        numeric maximum_investment
        numeric offer_unit_price
        timestamptz open_at
        timestamptz close_at
        text investment_thesis
        uuid arranger_entity_id FK
    }

    DEAL_MEMBERSHIPS {
        uuid deal_id PK,FK
        uuid user_id PK,FK
        uuid investor_id FK
        deal_member_role role "investor, advisor, lawyer, banker"
        timestamptz invited_at
        timestamptz accepted_at
    }

    DEAL_DATA_ROOM_ACCESS {
        uuid id PK
        uuid deal_id FK
        uuid investor_id FK
        timestamptz granted_at
        timestamptz expires_at "7 days default"
        timestamptz revoked_at
        uuid granted_by FK
    }

    DEAL_SUBSCRIPTION_SUBMISSIONS {
        uuid id PK
        uuid deal_id FK
        uuid investor_id FK
        numeric requested_amount
        text status "pending, approved, rejected"
        uuid approval_id FK
        uuid formal_subscription_id FK
    }

    DEALS ||--o{ DEAL_MEMBERSHIPS : "has"
    DEALS ||--o{ DEAL_DATA_ROOM_ACCESS : "grants"
    DEALS ||--o{ DEAL_SUBSCRIPTION_SUBMISSIONS : "receives"
    INVESTORS ||--o{ DEAL_MEMBERSHIPS : "joins"
    INVESTORS ||--o{ DEAL_DATA_ROOM_ACCESS : "has"
    INVESTORS ||--o{ DEAL_SUBSCRIPTION_SUBMISSIONS : "submits"
```

## 4. Fee Accounting Model

```mermaid
erDiagram
    FEE_PLANS {
        uuid id PK
        uuid deal_id FK
        uuid vehicle_id FK
        text name "Standard, Founder, Institutional"
        text description
        boolean is_default
        boolean is_active
        date effective_from
        date effective_until
    }

    FEE_COMPONENTS {
        uuid id PK
        uuid fee_plan_id FK
        fee_component_kind_enum kind "subscription, management, performance, spread"
        fee_calc_method_enum calc_method "percent_of_investment, per_annum, etc"
        integer rate_bps "Rate in basis points"
        numeric flat_amount
        fee_frequency_enum frequency "one_time, annual, quarterly, on_exit"
        integer hurdle_rate_bps
        boolean has_catchup
        boolean has_high_water_mark
        integer duration_periods
        text duration_unit "years, months, quarters"
        text payment_schedule "upfront, recurring, on_demand"
    }

    FEE_EVENTS {
        uuid id PK
        uuid fee_component_id FK
        uuid investor_id FK
        uuid deal_id FK
        numeric amount
        fee_event_status_enum status "accrued, invoiced, paid"
        date period_start
        date period_end
        uuid invoice_id FK
    }

    INVOICES {
        uuid id PK
        uuid investor_id FK
        uuid vehicle_id FK
        uuid deal_id FK
        text invoice_number
        numeric total_amount
        invoice_status_enum status "draft, sent, paid, overdue"
        date due_date
        uuid doc_id FK
    }

    INVOICE_LINES {
        uuid id PK
        uuid invoice_id FK
        uuid fee_event_id FK
        text description
        numeric amount
    }

    PAYMENTS {
        uuid id PK
        uuid invoice_id FK
        uuid investor_id FK
        numeric amount
        payment_status_enum status
        date paid_at
        text reference
    }

    FEE_PLANS ||--o{ FEE_COMPONENTS : "contains"
    FEE_COMPONENTS ||--o{ FEE_EVENTS : "generates"
    FEE_EVENTS ||--o{ INVOICE_LINES : "billed_in"
    INVOICES ||--o{ INVOICE_LINES : "contains"
    INVOICES ||--o{ PAYMENTS : "receives"
```

## 5. Document Management Model

```mermaid
erDiagram
    DOCUMENTS {
        uuid id PK
        uuid owner_investor_id FK
        uuid owner_user_id FK
        uuid deal_id FK
        uuid vehicle_id FK
        uuid entity_id FK
        uuid folder_id FK
        text name
        text description
        text file_key "Storage path"
        text type "k1, statement, nda, agreement"
        text status "draft, pending_approval, approved, published"
        integer current_version
        bigint file_size_bytes
        text mime_type
        boolean is_published
        timestamptz published_at
        ARRAY tags
    }

    DOCUMENT_FOLDERS {
        uuid id PK
        uuid parent_folder_id FK
        uuid vehicle_id FK
        text name
        text path "Full path for navigation"
    }

    DOCUMENT_VERSIONS {
        uuid id PK
        uuid document_id FK
        integer version_number
        text file_key
        text change_notes
        uuid created_by FK
    }

    DOCUMENT_APPROVALS {
        uuid id PK
        uuid document_id FK
        uuid requested_by FK
        uuid reviewed_by FK
        text status "pending, approved, rejected"
        text review_notes
    }

    SIGNATURE_REQUESTS {
        uuid id PK
        uuid document_id FK
        uuid investor_id FK
        uuid subscription_id FK
        text provider "docusign, dropbox_sign"
        text envelope_id
        text status "pending, sent, signed, declined"
        timestamptz signed_at
    }

    DOCUMENT_FOLDERS ||--o{ DOCUMENTS : "contains"
    DOCUMENT_FOLDERS ||--o{ DOCUMENT_FOLDERS : "parent"
    DOCUMENTS ||--o{ DOCUMENT_VERSIONS : "tracks"
    DOCUMENTS ||--o{ DOCUMENT_APPROVALS : "requires"
    DOCUMENTS ||--o{ SIGNATURE_REQUESTS : "needs"
```

## 6. Approval Workflow Model

```mermaid
erDiagram
    APPROVALS {
        uuid id PK
        text entity_type "investor, document, subscription, deal_interest"
        uuid entity_id
        text status "pending, approved, rejected, escalated"
        text priority "low, medium, high, critical"
        uuid requested_by FK
        uuid assigned_to FK
        uuid approved_by FK
        timestamptz approved_at
        text notes
        text rejection_reason
        boolean requires_secondary_approval
        uuid secondary_approved_by FK
        uuid related_deal_id FK
        uuid related_investor_id FK
        timestamptz sla_breach_at
        jsonb entity_metadata
    }

    APPROVAL_HISTORY {
        uuid id PK
        uuid approval_id FK
        text previous_status
        text new_status
        uuid actor_id FK
        text action "approved, rejected, escalated, reassigned"
        text notes
        timestamptz created_at
    }

    APPROVALS ||--o{ APPROVAL_HISTORY : "tracks"
    PROFILES ||--o{ APPROVALS : "requests"
    PROFILES ||--o{ APPROVALS : "assigned_to"
    PROFILES ||--o{ APPROVAL_HISTORY : "performs"
```

## 7. Messaging Model

```mermaid
erDiagram
    CONVERSATIONS {
        uuid id PK
        text subject
        conversation_type_enum type "direct, group, broadcast, deal"
        uuid deal_id FK
        uuid created_by FK
        timestamptz created_at
    }

    CONVERSATION_PARTICIPANTS {
        uuid id PK
        uuid conversation_id FK
        uuid user_id FK
        participant_role_enum role "owner, member, viewer"
        timestamptz joined_at
        timestamptz left_at
    }

    MESSAGES {
        uuid id PK
        uuid conversation_id FK
        uuid sender_id FK
        message_type_enum type "text, system, document"
        text content
        jsonb metadata
        timestamptz created_at
    }

    MESSAGE_READS {
        uuid id PK
        uuid message_id FK
        uuid user_id FK
        timestamptz read_at
    }

    CONVERSATIONS ||--o{ CONVERSATION_PARTICIPANTS : "has"
    CONVERSATIONS ||--o{ MESSAGES : "contains"
    MESSAGES ||--o{ MESSAGE_READS : "tracked_by"
    PROFILES ||--o{ CONVERSATION_PARTICIPANTS : "joins"
    PROFILES ||--o{ MESSAGES : "sends"
```

## 8. Audit & Compliance Model

```mermaid
erDiagram
    AUDIT_LOGS {
        uuid id PK
        uuid actor_id FK "Who performed action"
        text event_type "create, update, delete, access"
        text entity_type "investor, document, deal"
        uuid entity_id
        jsonb changes "Before/after for updates"
        jsonb metadata
        text ip_address
        timestamptz created_at
        uuid compliance_reviewer_id FK
        timestamptz compliance_reviewed_at
    }

    COMPLIANCE_ALERTS {
        uuid id PK
        uuid audit_log_id FK
        text alert_type "suspicious_access, failed_login, data_export"
        text severity "low, medium, high, critical"
        text status "open, investigating, resolved, false_positive"
        uuid assigned_to FK
        uuid resolved_by FK
        text resolution_notes
        timestamptz created_at
        timestamptz resolved_at
    }

    AUDIT_REPORT_TEMPLATES {
        uuid id PK
        text name
        text description
        jsonb filter_criteria
        jsonb columns
        uuid created_by FK
    }

    AUDIT_LOGS ||--o{ COMPLIANCE_ALERTS : "triggers"
    PROFILES ||--o{ AUDIT_LOGS : "performs"
    PROFILES ||--o{ COMPLIANCE_ALERTS : "handles"
```

## 9. Introducer & Commission Model

```mermaid
erDiagram
    INTRODUCERS {
        uuid id PK
        uuid user_id FK
        text legal_name
        text contact_name
        text email
        integer default_commission_bps
        numeric commission_cap_amount
        text status "active, inactive, suspended"
        uuid agreement_doc_id FK
        date agreement_expiry_date
    }

    INTRODUCTIONS {
        uuid id PK
        uuid introducer_id FK
        uuid deal_id FK
        citext prospect_email
        uuid prospect_investor_id FK
        text status "invited, joined, allocated, lost"
        date introduced_at
        integer commission_rate_override_bps
    }

    INTRODUCER_COMMISSIONS {
        uuid id PK
        uuid introducer_id FK
        uuid introduction_id FK
        uuid deal_id FK
        uuid investor_id FK
        text basis_type "invested_amount, spread, management_fee"
        integer rate_bps
        numeric base_amount
        numeric accrual_amount
        text status "accrued, invoiced, paid"
        uuid approved_by FK
        date payment_due_date
    }

    INTRODUCERS ||--o{ INTRODUCTIONS : "makes"
    INTRODUCTIONS ||--o{ INTRODUCER_COMMISSIONS : "earns"
    DEALS ||--o{ INTRODUCTIONS : "receives"
    INVESTORS ||--o{ INTRODUCTIONS : "becomes"
```

## 10. Workflow & Automation Model

```mermaid
erDiagram
    WORKFLOWS {
        uuid id PK
        text key UK "generate-position-statement"
        text name
        text description
        text category "documents, compliance, communications"
        text n8n_webhook_url
        jsonb input_schema
        text required_role
        text trigger_type "manual, scheduled, both"
        boolean is_active
    }

    WORKFLOW_RUNS {
        uuid id PK
        uuid workflow_id FK
        text workflow_key
        uuid triggered_by FK
        jsonb input_params
        text status "queued, running, completed, failed"
        jsonb output_data
        text error_message
        text webhook_signature
        text idempotency_token
        timestamptz queued_at
        timestamptz started_at
        timestamptz completed_at
        integer duration_ms
    }

    WORKFLOW_RUN_LOGS {
        uuid id PK
        uuid workflow_run_id FK
        text level "info, warn, error"
        text message
        jsonb data
        timestamptz created_at
    }

    WORKFLOWS ||--o{ WORKFLOW_RUNS : "executes"
    WORKFLOW_RUNS ||--o{ WORKFLOW_RUN_LOGS : "logs"
    PROFILES ||--o{ WORKFLOW_RUNS : "triggers"
```

## Database Statistics

| Category | Tables | Total Records |
|----------|--------|---------------|
| Identity | 3 | ~400 |
| Investments | 10 | ~750 |
| Fees | 8 | ~100 |
| Documents | 6 | ~50 |
| Approvals | 2 | ~70 |
| Messaging | 4 | ~200 |
| Audit | 3 | ~1000 |
| Workflow | 3 | ~60 |
| **Total** | **48** | **~2500** |

## Key Relationships

### One-to-Many Relationships

| Parent | Child | Relationship |
|--------|-------|--------------|
| `vehicles` | `deals` | Vehicle can have multiple deals |
| `investors` | `subscriptions` | Investor can have multiple subscriptions |
| `deals` | `documents` | Deal has many data room documents |
| `fee_plans` | `fee_components` | Fee plan has multiple fee types |
| `invoices` | `invoice_lines` | Invoice has multiple line items |

### Many-to-Many Relationships

| Table A | Junction | Table B |
|---------|----------|---------|
| `profiles` | `investor_users` | `investors` |
| `deals` | `deal_memberships` | `investors` |
| `conversations` | `conversation_participants` | `profiles` |

### Self-Referencing Relationships

| Table | Relationship |
|-------|--------------|
| `document_folders` | `parent_folder_id` → `id` |
| `vehicles` | Parent company → subsidiaries |
| `fee_components` | `next_tier_component_id` → `id` |
