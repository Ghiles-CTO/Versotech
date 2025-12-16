# C4 Model: Level 3 - Component Diagrams

## Overview

This document describes the internal structure of key containers, showing how they are composed of components and their responsibilities.

## 1. Next.js Web Application Components

```mermaid
C4Component
    title Component Diagram - Next.js Web Application

    Container_Boundary(web, "Next.js Web Application") {
        Component(pages_investor, "Investor Pages", "React/Next.js", "Dashboard, Holdings, Deals, Documents, Messages, Tasks, Profile")
        Component(pages_staff, "Staff Pages", "React/Next.js", "Dashboard, Deals, Investors, Entities, Approvals, Fees, Audit")
        Component(pages_public, "Public Pages", "React/Next.js", "Login, Password Reset, Document Signing")

        Component(components_ui, "UI Components", "shadcn/ui", "Button, Dialog, Table, Form, etc.")
        Component(components_domain, "Domain Components", "React", "DealCard, InvestorTable, ApprovalWorkflow, etc.")
        Component(components_layout, "Layout Components", "React", "Navigation, Sidebar, Headers")

        Component(lib_auth, "Auth Library", "TypeScript", "getCurrentUser, requireAuth, session management")
        Component(lib_supabase, "Supabase Clients", "TypeScript", "Browser, Server, Service Role clients")
        Component(lib_workflows, "Workflow Library", "TypeScript", "triggerWorkflow, workflow definitions")
        Component(lib_fees, "Fee Library", "TypeScript", "Fee calculations, validation")
        Component(lib_signature, "Signature Library", "TypeScript", "E-sign integration, token management")

        Component(hooks, "Custom Hooks", "React", "useAuth, useRealtime, useInvestor")
        Component(context, "React Context", "React", "AuthContext, ThemeContext")
    }

    Rel(pages_investor, components_domain, "Uses")
    Rel(pages_staff, components_domain, "Uses")
    Rel(components_domain, components_ui, "Uses")
    Rel(pages_investor, lib_auth, "Uses")
    Rel(pages_staff, lib_auth, "Uses")
    Rel(lib_auth, lib_supabase, "Uses")
    Rel(pages_staff, lib_workflows, "Uses")
    Rel(pages_staff, lib_fees, "Uses")
```

### Investor Portal Pages (`src/app/(investor)/versoholdings/`)

| Page | Component | Lines | Responsibility |
|------|-----------|-------|----------------|
| `/dashboard` | InvestorDashboard | 825 | Portfolio overview, NAV, recent activity |
| `/holdings` | HoldingsPage | 162 | Vehicle positions with fees |
| `/deals` | DealsPage | 384 | Browse investment opportunities |
| `/deal/[id]` | DealDetail | 769 | Deal info, term sheet, commitment |
| `/data-rooms` | DataRoomsPage | 204 | Data room access list |
| `/data-rooms/[dealId]` | DataRoomExplorer | 428 | File browser with expiration |
| `/documents` | DocumentsPage | 7 | Document library |
| `/messages` | MessagesPage | 89 | Secure messaging |
| `/tasks` | TasksPage | 156 | KYC, signatures, capital calls |
| `/profile` | ProfilePage | 81 | Investor profile and entities |

### Staff Portal Pages (`src/app/(staff)/versotech/staff/`)

| Page | Component | Lines | Responsibility |
|------|-----------|-------|----------------|
| `/dashboard` | StaffDashboard | 567 | Operations overview, KPIs |
| `/deals` | DealsPage | 350 | Deal pipeline management |
| `/deals/[id]` | DealDetailClient | 800+ | Complete deal management |
| `/investors` | InvestorsPage | 521 | Investor database |
| `/investors/[id]` | InvestorDetail | 338 | Investor profile and KYC |
| `/entities` | EntitiesPage | 200 | Entity management |
| `/entities/[id]` | EntityDetailEnhanced | 2,779 | Full entity management (largest) |
| `/approvals` | ApprovalsPageClient | 949 | Approval workflows |
| `/subscriptions` | SubscriptionsPage | 300 | Subscription management |
| `/fees` | FeesPage | 400 | Fee plans and invoicing |
| `/reconciliation` | ReconciliationPage | 350 | Transaction matching |
| `/audit` | AuditPage | 300 | Compliance and audit logs |
| `/kyc-review` | KycReviewClient | 842 | KYC questionnaire review |

### Core Libraries (`src/lib/`)

| Library | File(s) | Responsibility |
|---------|---------|----------------|
| `auth` | `auth.ts` | User authentication utilities |
| `supabase` | `client.ts`, `server.ts` | Database client management |
| `workflows` | `workflows.ts`, `trigger-workflow.ts` | n8n workflow integration |
| `fees` | `calculations.ts`, `validation.ts` | Fee computation and validation |
| `signature` | `client.ts`, `handlers.ts`, `token.ts` | E-signature integration |
| `audit` | `audit.ts` | Audit logging infrastructure |
| `messaging` | `index.ts`, `supabase.ts` | Messaging utilities |
| `documents` | `investor-documents.ts` | Document access control |

---

## 2. API Routes Component Diagram

```mermaid
C4Component
    title Component Diagram - API Routes

    Container_Boundary(api, "API Routes") {
        Component(auth_routes, "Auth Routes", "Next.js API", "/api/auth/* - Login, logout, password")
        Component(deal_routes, "Deal Routes", "Next.js API", "/api/deals/* - CRUD, commitments, access")
        Component(investor_routes, "Investor Routes", "Next.js API", "/api/investors/* - Subscriptions, entities")
        Component(staff_routes, "Staff Routes", "Next.js API", "/api/staff/* - Fees, invoices, reconciliation")
        Component(approval_routes, "Approval Routes", "Next.js API", "/api/approvals/* - Workflow actions")
        Component(document_routes, "Document Routes", "Next.js API", "/api/documents/* - Upload, download")
        Component(conversation_routes, "Conversation Routes", "Next.js API", "/api/conversations/* - Messages")
        Component(workflow_routes, "Workflow Routes", "Next.js API", "/api/admin/workflows/* - Automation")
        Component(cron_routes, "Cron Routes", "Next.js API", "/api/cron/* - Scheduled jobs")
        Component(webhook_routes, "Webhook Routes", "Next.js API", "/api/automation/* - External callbacks")

        Component(validators, "Validators", "Zod", "Input validation schemas")
        Component(audit_logger, "Audit Logger", "TypeScript", "Activity logging")
    }

    ComponentDb(db, "PostgreSQL", "Supabase")

    Rel(auth_routes, db, "Queries")
    Rel(deal_routes, db, "Queries")
    Rel(deal_routes, audit_logger, "Logs")
    Rel(investor_routes, db, "Queries")
    Rel(staff_routes, db, "Queries")
    Rel(staff_routes, audit_logger, "Logs")
    Rel(approval_routes, db, "Queries")
    Rel(approval_routes, audit_logger, "Logs")
    Rel(document_routes, db, "Queries")
    Rel(workflow_routes, db, "Queries")
```

### API Route Categories

#### Authentication (`/api/auth/*`)
```
POST /api/auth/signin       - Email/password login
POST /api/auth/signup       - New investor registration
POST /api/auth/logout       - Session termination
PUT  /api/auth/password     - Password change
POST /api/auth/create-profile - Profile creation
GET  /api/auth/me           - Current user info
```

#### Deal Management (`/api/deals/*`)
```
GET    /api/deals                          - List deals (filtered)
POST   /api/deals                          - Create deal
GET    /api/deals/[id]                     - Deal details
PATCH  /api/deals/[id]                     - Update deal
POST   /api/deals/[id]/commitments         - Submit commitment
POST   /api/deals/[id]/commitments/[cid]/approve - Approve commitment
GET    /api/deals/[id]/documents           - List data room docs
GET    /api/deals/[id]/documents/[did]/download - Download document
POST   /api/deals/[id]/folders             - Manage folders
POST   /api/deals/[id]/interests           - Track interest
```

#### Staff Operations (`/api/staff/*`)
```
GET  /api/staff/fees/plans          - List fee plans
POST /api/staff/fees/plans          - Create fee plan
GET  /api/staff/fees/invoices       - List invoices
POST /api/staff/fees/invoices/generate - Generate invoice
POST /api/staff/fees/commissions    - Track commissions
GET  /api/staff/fees/dashboard      - Fee overview
GET  /api/staff/available           - Available staff
```

#### Cron Jobs (`/api/cron/*`)
```
GET /api/cron/data-room-expiry        - Expire old access
GET /api/cron/publish-documents       - Auto-publish docs
GET /api/cron/fees/generate-scheduled - Recurring fees
GET /api/cron/auto-match-reconciliation - AI matching
```

---

## 3. Database Component Diagram

```mermaid
C4Component
    title Component Diagram - Database Schema

    Container_Boundary(db, "PostgreSQL Database") {
        ComponentDb(identity, "Identity Tables", "profiles, investors, investor_users", "User and investor data")
        ComponentDb(investments, "Investment Tables", "vehicles, deals, subscriptions, positions", "Investment tracking")
        ComponentDb(fees, "Fee Tables", "fee_plans, fee_components, invoices, payments", "Fee management")
        ComponentDb(documents, "Document Tables", "documents, document_versions, folders", "File metadata")
        ComponentDb(approvals, "Approval Tables", "approvals, approval_history", "Workflow state")
        ComponentDb(messaging, "Messaging Tables", "conversations, messages, participants", "Communication")
        ComponentDb(audit, "Audit Tables", "audit_logs, compliance_alerts", "Compliance")
        ComponentDb(reconciliation, "Reconciliation Tables", "bank_transactions, matches", "Payment matching")

        Component(rls, "RLS Policies", "PostgreSQL", "Row-level security rules")
        Component(triggers, "Triggers", "PostgreSQL", "Auto-numbering, timestamps, cascades")
        Component(functions, "Functions", "PL/pgSQL", "Business logic, validations")
    }

    Rel(identity, investments, "investor_id FK")
    Rel(investments, fees, "deal_id, vehicle_id FK")
    Rel(investments, documents, "deal_id FK")
    Rel(investments, approvals, "related_deal_id FK")
    Rel(identity, messaging, "user_id FK")
    Rel(identity, audit, "actor_id FK")
```

### Core Entity Groups

#### Identity & Access
| Table | Records | Purpose |
|-------|---------|---------|
| `profiles` | 7 | User accounts (linked to auth.users) |
| `investors` | 386 | Investor entities with KYC |
| `investor_users` | 2 | User-to-investor mapping |

#### Investment Management
| Table | Records | Purpose |
|-------|---------|---------|
| `vehicles` | 91 | Investment vehicles (funds, SPVs) |
| `deals` | 14 | Investment opportunities |
| `subscriptions` | 629 | Investor commitments |
| `positions` | 10 | NAV and cost basis |

#### Fee Accounting
| Table | Records | Purpose |
|-------|---------|---------|
| `fee_plans` | 14 | Fee structure definitions |
| `fee_components` | 28 | Individual fee line items |
| `invoices` | - | Fee billing |
| `payments` | - | Payment receipts |

#### Workflow & Approval
| Table | Records | Purpose |
|-------|---------|---------|
| `approvals` | 66 | Pending/completed approvals |
| `workflows` | 16 | Workflow definitions |
| `workflow_runs` | 45 | Execution history |

---

## 4. Workflow Integration Component Diagram

```mermaid
C4Component
    title Component Diagram - Workflow Integration

    Container_Boundary(workflow, "Workflow System") {
        Component(definitions, "Workflow Definitions", "TypeScript", "9 production workflows with input schemas")
        Component(trigger, "Trigger Service", "TypeScript", "HMAC signing, idempotency, error handling")
        Component(runs, "Run Manager", "TypeScript", "Status tracking, result handling")

        Component(position_stmt, "Position Statement", "n8n", "Monthly investor statements")
        Component(nda_agent, "NDA Agent", "n8n", "NDA generation and signing")
        Component(kyc_processor, "KYC Processor", "n8n", "Enhanced due diligence")
        Component(capital_call, "Capital Call", "n8n", "Capital call notices")
        Component(reporting, "Reporting Agent", "n8n", "Custom report generation")
    }

    System_Ext(n8n, "n8n Engine")

    Rel(definitions, trigger, "Configures")
    Rel(trigger, n8n, "POST with HMAC")
    Rel(n8n, runs, "Webhook callback")

    Rel(position_stmt, n8n, "Runs in")
    Rel(nda_agent, n8n, "Runs in")
    Rel(kyc_processor, n8n, "Runs in")
    Rel(capital_call, n8n, "Runs in")
    Rel(reporting, n8n, "Runs in")
```

### Production Workflows

| Key | Category | Purpose | Trigger |
|-----|----------|---------|---------|
| `generate-position-statement` | documents | Monthly investor statements | Manual/Scheduled |
| `process-nda` | compliance | NDA generation and DocuSign | Manual |
| `inbox-manager` | communications | Email categorization and routing | Scheduled |
| `kyc-aml-processing` | compliance | Enhanced due diligence | Scheduled |
| `capital-call-processing` | multi_step | Capital call notices | Scheduled |
| `reporting-agent` | data_processing | Custom report generation | Manual |
| `investor-onboarding` | multi_step | Multi-step onboarding | Scheduled |
| `linkedin-leads-scraper` | data_processing | Prospect identification | Scheduled |
| `shared-drive-notification` | communications | Document update alerts | Scheduled |

### Workflow Input Schema Types

```typescript
type WorkflowFieldType =
  | 'text'           // Free text input
  | 'email'          // Email validation
  | 'number'         // Numeric input
  | 'date'           // Date picker
  | 'datetime'       // Date and time
  | 'select'         // Dropdown options
  | 'checkbox'       // Boolean toggle
  | 'investor_select' // Dynamic investor lookup
  | 'vehicle_select'  // Dynamic vehicle lookup
  | 'conversation_select'; // Dynamic conversation lookup
```

---

## 5. Authentication Component Diagram

```mermaid
C4Component
    title Component Diagram - Authentication System

    Container_Boundary(auth, "Authentication System") {
        Component(middleware, "Middleware", "Next.js", "Request interception, token validation, refresh")
        Component(auth_lib, "Auth Library", "TypeScript", "getCurrentUser, requireAuth, guards")
        Component(supabase_client, "Supabase Client", "TypeScript", "Browser client (singleton)")
        Component(supabase_server, "Server Client", "TypeScript", "Server client with cookie handling")
        Component(service_client, "Service Client", "TypeScript", "Admin operations (bypasses RLS)")

        Component(login_page, "Login Pages", "React", "Investor and staff login forms")
        Component(set_password, "Set Password", "React", "Initial password setup for invites")
    }

    System_Ext(supabase_auth, "Supabase Auth")
    ComponentDb(profiles, "Profiles Table")

    Rel(middleware, supabase_auth, "Validates JWT")
    Rel(middleware, profiles, "Fetches profile")
    Rel(auth_lib, supabase_server, "Uses")
    Rel(supabase_client, supabase_auth, "Browser auth")
    Rel(supabase_server, supabase_auth, "Server auth")
    Rel(service_client, supabase_auth, "Service role")
    Rel(login_page, supabase_client, "Signs in")
```

### Authentication Flow

```
1. User submits credentials
   ↓
2. Supabase Auth validates
   ↓
3. Returns access_token (1hr) + refresh_token
   ↓
4. Stored in HTTP-only cookies
   ↓
5. Middleware validates on each request
   ↓
6. Auto-refresh if expiring (with retry)
   ↓
7. Profile fetched for role-based access
   ↓
8. Route allowed/denied based on role
```

### User Roles

| Role | Portal Access | Permissions |
|------|--------------|-------------|
| `investor` | `/versoholdings/*` | Own portfolio, documents, messages |
| `staff_admin` | `/versotech/staff/*` | Full access, user management |
| `staff_ops` | `/versotech/staff/*` | Operations, deals, documents |
| `staff_rm` | `/versotech/staff/*` | Investor relations, KYC |

---

## 6. Document Management Component Diagram

```mermaid
C4Component
    title Component Diagram - Document Management

    Container_Boundary(docs, "Document Management") {
        Component(upload, "Upload Handler", "API Route", "File upload with metadata")
        Component(versioning, "Versioning", "TypeScript", "Document version control")
        Component(approval, "Approval Workflow", "TypeScript", "Draft → Review → Publish")
        Component(access_control, "Access Control", "TypeScript", "RLS + business rules")
        Component(signing, "Signature Integration", "TypeScript", "E-sign envelope management")

        Component(investor_docs, "Investor Docs", "React", "K-1s, statements, agreements")
        Component(data_room, "Data Room", "React", "Deal documents with expiry")
        Component(entity_docs, "Entity Docs", "React", "Corporate documents")
    }

    Container_Ext(storage, "Supabase Storage")
    Container_Ext(esign, "E-Signature Provider")

    Rel(upload, storage, "Stores files")
    Rel(versioning, storage, "Manages versions")
    Rel(signing, esign, "Sends for signature")
    Rel(approval, storage, "Publishes")
    Rel(investor_docs, access_control, "Checks access")
    Rel(data_room, access_control, "Checks access")
```

### Document Lifecycle

```
1. Upload (draft)
   ↓
2. Metadata entry
   ↓
3. Request approval (pending_approval)
   ↓
4. Review by staff
   ↓
5. Approve/Reject
   ↓
6. Publish (visible to investors)
   ↓
7. Archive (if needed)
```

### Document Types

| Type | Purpose | Storage Bucket |
|------|---------|----------------|
| K-1 | Tax documents | `documents` |
| Statement | Quarterly/annual reports | `documents` |
| Agreement | Subscription agreements | `documents` |
| NDA | Non-disclosure agreements | `documents` |
| Data Room | Deal due diligence | `deal-documents` |
| Entity | Corporate documents | `documents` |

---

## Related Documentation

- [Level 1: System Context](./01-system-context.md)
- [Level 2: Container Diagram](./02-container-diagram.md)
- [Database Schema](../DATABASE_SCHEMA.md)
- [Security Architecture](../security-architecture.md)
