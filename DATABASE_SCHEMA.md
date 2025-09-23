# VERSO Holdings Portal - Database Schema Documentation

This document provides a comprehensive overview of the VERSO Holdings Portal database schema, including core tables, relationships, and business logic.

## Overview

The VERSO Holdings database is built on PostgreSQL/Supabase and consists of two main schema layers:

1. **Base Schema** (`schema.sql`) - Core investor portal functionality
2. **Deals Extension** (`deals-extension-schema.sql`) - Advanced deal management and transactions

## Schema Architecture

### Core Entities Hierarchy
```
Users/Profiles
├── Investors (legal entities)
├── Vehicles (investment funds/SPVs)
├── Deals (specific investment opportunities)
└── Documents (file management with watermarking)
```

---

## 1. BASE SCHEMA (Core Platform)

### 1.1 User Management & Authentication

#### `profiles`
- **Purpose**: Core user accounts linked to Supabase auth
- **Key Fields**:
  - `id` (uuid, PK) - References `auth.users(id)`
  - `role` (user_role enum) - 'investor', 'staff_admin', 'staff_ops', 'staff_rm'
  - `display_name`, `email`, `title`

#### `user_role` (ENUM)
- Values: `investor`, `staff_admin`, `staff_ops`, `staff_rm`

### 1.2 Investor Management

#### `investors`
- **Purpose**: Legal entities that make investments (separate from user accounts)
- **Key Fields**:
  - `legal_name` - Official company/individual name
  - `type` - 'individual' or 'entity'
  - `kyc_status` - KYC compliance tracking
  - `country` - Domicile/jurisdiction

#### `investor_users`
- **Purpose**: Many-to-many relationship between investors and user accounts
- **Use Case**: Multiple users can manage one investor entity (e.g., family office)

### 1.3 Investment Vehicles

#### `vehicles`
- **Purpose**: Investment funds, SPVs, securitizations
- **Key Fields**:
  - `name` - Fund name
  - `type` - 'fund', 'spv', 'securitization'
  - `domicile` - Legal jurisdiction
  - `currency` - Base currency

#### `subscriptions`
- **Purpose**: Investor commitments to vehicles
- **Key Fields**:
  - `commitment` - Total commitment amount
  - `status` - 'pending', 'active', etc.
  - `signed_doc_id` - Reference to subscription document

### 1.4 Portfolio Tracking

#### `valuations`
- **Purpose**: Time-series NAV data for vehicles
- **Key Fields**:
  - `as_of_date` - Valuation date
  - `nav_total` - Total fund NAV
  - `nav_per_unit` - Per-unit NAV

#### `positions`
- **Purpose**: Investor holdings in vehicles
- **Key Fields**:
  - `units` - Number of units held
  - `cost_basis` - Original investment amount
  - `last_nav` - Most recent NAV per unit

#### `capital_calls` & `distributions`
- **Purpose**: Cash flow events for vehicles
- **Key Fields**:
  - `call_pct` - Percentage of commitment called
  - `due_date` - Payment deadline
  - `amount` - Distribution amount

#### `cashflows`
- **Purpose**: Individual investor cash movements
- **Key Fields**:
  - `type` - 'call' or 'distribution'
  - `amount` - Cash flow amount
  - `ref_id` - Reference to source event

### 1.5 Document Management

#### `documents`
- **Purpose**: Secure file storage with access control
- **Key Fields**:
  - `owner_investor_id` - Document owner
  - `type` - 'NDA', 'Subscription', 'Report', 'Statement', 'KYC'
  - `file_key` - Storage location identifier
  - `watermark` (jsonb) - Dynamic watermarking data

### 1.6 Task Management

#### `tasks`
- **Purpose**: User action items and onboarding workflows
- **Key Fields**:
  - `kind` - Task type (e.g., 'onboarding_step')
  - `due_at` - Deadline
  - `related_entity_type/id` - Connected object

#### `report_requests`
- **Purpose**: Custom report generation requests
- **Key Fields**:
  - `filters` (jsonb) - Report parameters
  - `status` - 'queued', 'processing', 'completed'
  - `result_doc_id` - Generated report reference

### 1.7 Automation & Workflows

#### `workflows` & `workflow_runs`
- **Purpose**: Integration with n8n automation platform
- **Key Fields**:
  - `key` - Workflow identifier
  - `n8n_webhook_url` - Trigger endpoint
  - `schema` (jsonb) - Required parameters
  - `payload` (jsonb) - Execution data

### 1.8 Communication

#### `conversations`, `conversation_participants`, `messages`
- **Purpose**: In-app messaging system
- **Key Fields**:
  - `type` - 'dm' or 'group'
  - `file_key` - Attached documents
  - Supports both 1:1 and group conversations

#### `request_tickets`
- **Purpose**: Support ticket system ("Ask for Request" feature)
- **Key Fields**:
  - `category` - Request type
  - `status` - 'open', 'assigned', 'in_progress', 'ready', 'closed'
  - `priority` - 'low', 'normal', 'high'
  - `linked_workflow_run` - Automation integration

### 1.9 Audit & Compliance

#### `audit_log`
- **Purpose**: Immutable activity logging with hash chaining
- **Key Fields**:
  - `action` - What happened
  - `entity/entity_id` - What was affected
  - `hash/prev_hash` - Integrity verification

---

## 2. DEALS EXTENSION SCHEMA (Advanced Features)

### 2.1 Deal Management

#### `deals`
- **Purpose**: Specific investment opportunities/transactions
- **Key Fields**:
  - `deal_type` - 'equity_secondary', 'equity_primary', 'credit_trade_finance', 'other'
  - `status` - 'draft', 'open', 'allocation_pending', 'closed', 'cancelled'
  - `offer_unit_price` - Default pricing
  - `terms_schema` (jsonb) - Deal-specific parameters
  - `open_at/close_at` - Deal timeline

#### `deal_memberships`
- **Purpose**: Role-based access control for deals
- **Roles**: 'investor', 'co_investor', 'spouse', 'advisor', 'lawyer', 'banker', 'introducer', 'viewer', 'verso_staff'
- **Key Fields**:
  - `invited_at/accepted_at` - Invitation workflow
  - `investor_id` - Nullable for external participants

#### `invite_links`
- **Purpose**: Secure invitation system for external users
- **Key Fields**:
  - `token_hash` - Secure invitation tokens
  - `max_uses/used_count` - Usage limits
  - `expires_at` - Time-limited access

### 2.2 Introducer Network

#### `introducers`
- **Purpose**: Business development partners who refer investors
- **Key Fields**:
  - `agreement_doc_id` - Legal agreement reference
  - `default_commission_bps` - Basis points commission rate

#### `introductions` & `introducer_commissions`
- **Purpose**: Track referrals and calculate commissions
- **Key Fields**:
  - `status` - 'invited', 'joined', 'allocated', 'lost'
  - `basis_type` - Commission calculation method
  - `accrual_amount` - Earned commission

### 2.3 Inventory Management

#### `share_sources` & `share_lots`
- **Purpose**: Track available shares with anti-oversell protection
- **Key Features**:
  - `units_remaining` - Real-time availability tracking
  - `lockup_until` - Transfer restrictions
  - Concurrency control prevents overselling

#### `reservations` & `reservation_lot_items`
- **Purpose**: Time-limited holds on inventory before final allocation
- **Key Fields**:
  - `expires_at` - Automatic expiration
  - `proposed_unit_price` - Investor pricing
  - Detailed lot mapping for exact allocation

#### `allocations` & `allocation_lot_items`
- **Purpose**: Final confirmed allocations to investors
- **Key Fields**:
  - `status` - 'pending_review', 'approved', 'rejected', 'settled'
  - `approved_by/approved_at` - Compliance approval workflow

### 2.4 Commitment & Approval Workflow

#### `deal_commitments`
- **Purpose**: Investor commitment requests
- **Key Fields**:
  - `requested_units/requested_amount` - Investment size
  - `selected_fee_plan_id` - Chosen fee structure
  - `status` - 'submitted', 'under_review', 'approved', 'rejected', 'cancelled'

#### `approvals`
- **Purpose**: Generic approval workflow for any entity
- **Key Fields**:
  - `entity_type/entity_id` - What needs approval
  - `action` - 'approve', 'reject', 'revise'
  - `assigned_to/decided_by` - Approval delegation

### 2.5 Fee Management

#### `fee_plans` & `fee_components`
- **Purpose**: Flexible fee structure configuration
- **Component Types**: 'subscription', 'management', 'performance', 'spread_markup', 'flat', 'other'
- **Calculation Methods**: 'percent_of_investment', 'percent_per_annum', 'percent_of_profit', 'per_unit_spread', 'fixed'

#### `investor_terms`
- **Purpose**: Per-investor fee plan selection and customization
- **Key Fields**:
  - `selected_fee_plan_id` - Base fee plan
  - `overrides` (jsonb) - Custom terms
  - Unique constraint ensures one active terms per investor/deal

#### `fee_events`
- **Purpose**: Accrued fees ready for invoicing
- **Key Fields**:
  - `computed_amount` - Final fee amount
  - `period_start/period_end` - Calculation period
  - `source_ref` - Reference to triggering event

### 2.6 Document Automation

#### `term_sheets`
- **Purpose**: Investor-specific term sheet generation
- **Key Fields**:
  - `terms_data` (jsonb) - Frozen merge data
  - `version` - Document versioning
  - `supersedes_id` - Replacement tracking

#### `doc_templates` & `doc_packages`
- **Purpose**: Automated document generation and e-signature
- **Providers**: 'dropbox_sign', 'docusign', 'server_pdf'
- **Package Types**: 'term_sheet', 'subscription_pack', 'nda'

#### `esign_envelopes`
- **Purpose**: E-signature workflow tracking
- **Integration**: DocuSign/Dropbox Sign envelope management

### 2.7 Financial Operations

#### `invoices` & `invoice_lines`
- **Purpose**: Billing and fee collection
- **Key Fields**:
  - `generated_from` - 'fee_events', 'introducer_commissions', 'manual'
  - `status` - 'draft', 'sent', 'paid', 'partial', 'cancelled'
  - Line item detail with fee event references

#### `payments` & `bank_transactions`
- **Purpose**: Payment processing and bank reconciliation
- **Key Fields**:
  - `bank_txn_id` - Link to bank data
  - `import_batch_id` - Bulk import tracking

#### `reconciliations`
- **Purpose**: Match payments to invoices
- **Key Fields**:
  - `matched_amount` - Partial payment support
  - `matched_by` - Audit trail

---

## Key Relationships & Business Logic

### Multi-Tenancy
- Users can access multiple investors via `investor_users`
- Deal access controlled via `deal_memberships`
- Role-based permissions throughout

### Inventory Control
- `share_lots.units_remaining` prevents overselling
- Reservations temporarily reduce available inventory
- Automatic expiration restores availability

### Fee Calculation Flow
1. `fee_plans` → `fee_components` (configuration)
2. `investor_terms` (per-investor selection)
3. `fee_events` (accrual calculation)
4. `invoices` → `invoice_lines` (billing)
5. `payments` → `reconciliations` (collection)

### Document Lifecycle
1. `doc_templates` (configuration)
2. `doc_packages` + `doc_package_items` (assembly)
3. `esign_envelopes` (signature workflow)
4. `documents` (final storage)

### Approval Workflows
- Generic `approvals` table supports any entity type
- Delegation via `assigned_to` field
- Full audit trail with timestamps

---

## Performance Considerations

### Indexes
- All foreign keys are indexed
- Composite indexes on frequently queried combinations
- Status + date indexes for workflow queries

### Concurrency
- `units_remaining` with CHECK constraints prevents negative inventory
- Unique constraints on critical business rules
- Proper transaction isolation for inventory operations

### Scalability
- UUID primary keys for global uniqueness
- JSONB fields for flexible schema evolution
- Partitioning ready for time-series data (valuations, cashflows)

---

## Data Types & Constraints

### Precision
- `numeric(18,2)` for monetary amounts
- `numeric(28,8)` for share units (high precision)
- `numeric(18,6)` for unit prices

### Validation
- Extensive CHECK constraints on enums
- Foreign key relationships maintain referential integrity
- NOT NULL constraints on business-critical fields

### Audit
- `created_at` timestamps on all tables
- `updated_at` where applicable
- Hash chaining in audit_log for tamper detection

This schema supports the full lifecycle of alternative investment management, from deal sourcing through final settlement and reporting.