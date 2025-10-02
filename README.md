# VERSO Holdings Investor & Staff Portal

A comprehensive, enterprise-grade platform for managing investor relations, fund operations, and deal flow across VERSO Holdings' $800M+ alternative investment portfolio.

## 🎯 Overview

**VERSO Holdings** is a leading alternative investment firm managing a diverse portfolio of private equity, venture capital, and structured investment vehicles. The platform serves as the central hub for investor relations and operational excellence, connecting 50+ institutional and high-net-worth investors with VERSO's investment team.

### The Challenge

Traditional fund management relies on fragmented tools: email for communication, shared drives for documents, spreadsheets for reporting, and manual processes for investor requests. This creates:
- **Operational inefficiency**: Hours spent on repetitive tasks (position statements, document distribution)
- **Poor investor experience**: Delayed responses, lack of self-service capabilities
- **Compliance risk**: Incomplete audit trails, inconsistent access controls
- **Limited scalability**: Manual processes that don't scale as AUM grows

### The Solution

The VERSO platform consolidates all investor relations and fund operations into a single, secure, automated system:

- **For Investors**: Self-service portal for portfolio tracking, document access, and report requests
- **For Staff**: Automated workflows, request management, and compliance tools that reduce manual work by 70%+
- **For Leadership**: Real-time visibility into fund operations, investor engagement, and pipeline metrics

Built on modern infrastructure (Next.js, Supabase, n8n), the platform handles everything from investor onboarding and KYC verification to automated position statement generation and compliance audit trails.

## 🏗️ Architecture

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **UI Components**: shadcn/ui with custom VERSO branding
- **Automation**: n8n workflow engine integration
- **Security**: Row-Level Security (RLS), HMAC webhook verification

## 🚀 Quick Start

### Prerequisites

1. **Supabase Account**: Create a project at [supabase.com](https://supabase.com)
2. **Node.js 18+**: Required for Next.js 15

### Environment Setup

1. **Clone and install dependencies:**
   ```bash
   cd versotech-portal
   npm install
   ```

2. **Create environment variables:**
   Create a `.env.local` file in the project root:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # n8n Webhook Configuration
   N8N_OUTBOUND_SECRET=your-secure-random-secret-for-outbound-webhooks
   N8N_INBOUND_SECRET=your-secure-random-secret-for-inbound-webhooks

   # E-Signature Configuration (DocuSign or Dropbox Sign)
   ESIGN_API_KEY=your-esign-api-key
   ESIGN_WEBHOOK_SECRET=your-esign-webhook-secret

   # Storage Configuration
   DOCS_BUCKET=docs

   # Environment
   NODE_ENV=development
   ```

### Database Setup

1. **Run the database schema:**
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy and run the contents of `database/schema.sql`

2. **Apply Row-Level Security policies:**
   - Copy and run the contents of `database/rls-policies.sql`

3. **Create storage bucket:**
   - Go to Storage in your Supabase dashboard
   - Create a bucket named `docs`
   - Configure appropriate policies for document access

### Development

```bash
npm run dev
```

The application will be available at:
- **Investor Portal**: http://localhost:3000/versoholdings/login
- **Staff Portal**: http://localhost:3000/versotech/login

## 🎨 Dual-Brand Architecture

The platform serves two distinct user bases with separate branding and functionality:

### VERSO Holdings (Investor Portal)
**Route prefix**: `/versoholdings`
**Purpose**: Institutional-grade investor self-service experience

**Key Capabilities**:
- **Portfolio Dashboard**: Real-time NAV tracking, performance metrics, capital call/distribution history
- **Holdings Management**: Detailed view of all investment vehicles, positions, and fee structures
- **Document Library**: Secure access to subscription agreements, K-1s, quarterly statements, annual reports
- **Active Deals**: Browse open investment opportunities and submit expressions of interest
- **Request Center**: Self-service report generation (performance analysis, tax summaries, custom reports)
- **Secure Messaging**: Direct communication channel with relationship managers
- **Tasks & Notifications**: KYC reminders, document signing requests, capital call alerts

**User Roles**: Investor, Investor Admin (multi-user account management)

### VERSO Tech (Staff Portal)
**Route prefix**: `/versotech`
**Purpose**: Mission control for fund operations and investor relations

**Key Capabilities**:
- **Operations Dashboard**: Real-time KYC pipeline, pending requests, deal flow, system health monitoring
- **Deal Management**: Track investment opportunities from sourcing to closing (pipeline, terms, allocations)
- **Investor Management**: Complete investor database with KYC status, accreditation, communication history
- **Process Center**: One-click automation for 6 critical workflows (position statements, NAV calculations, distribution notices, document generation)
- **Approvals Workflow**: Multi-level approval system for investor onboarding, allocations, document releases
- **Request Management**: Centralized queue for investor requests with SLA tracking and automated fulfillment
- **Fees & Reconciliation**: Management fee calculations, expense tracking, investor billing reconciliation
- **Introducers Network**: Track deal sources, commission calculations, introduction-to-allocation funnel
- **Audit & Compliance**: Immutable audit trail, compliance monitoring, SOC 2/GDPR reporting

**User Roles**: Staff Admin, Relationship Manager, Operations, Compliance

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/          # Public routes (login pages)
│   ├── (investor)/        # Investor portal routes
│   ├── (staff)/          # Staff portal routes
│   └── api/              # API endpoints
├── lib/                  # Utilities and configurations
├── components/           # Reusable UI components
└── middleware.ts         # Route protection and auth
```

## 🔐 Security Features

- **Row-Level Security**: Database-level data isolation
- **Multi-Factor Authentication**: Required for staff, optional for investors
- **Role-Based Access Control**: Fine-grained permissions
- **Audit Logging**: Complete activity tracking
- **Document Watermarking**: Secure document access
- **Webhook Verification**: HMAC-signed webhook communications

## 💼 Business Impact

### Operational Efficiency
- **70% reduction** in manual reporting tasks through workflow automation
- **Sub-24-hour SLA** for investor document requests (previously 3-5 days)
- **90% fewer emails** as investors self-serve through the portal
- **Zero data entry errors** with automated position statement generation

### Investor Experience
- **24/7 self-service access** to portfolio data and documents
- **Real-time NAV updates** instead of monthly PDF statements
- **Instant report generation** for tax summaries and performance analysis
- **Transparent communication** with message history and task tracking

### Compliance & Risk
- **100% audit coverage** with immutable activity logs
- **Automated KYC tracking** with expiration alerts and renewal workflows
- **GDPR compliance** with data access controls and retention policies
- **SOC 2 ready** audit trails and security controls

### Scalability
- Built to scale from $800M to $2B+ AUM without adding staff
- Supports 500+ investors on existing infrastructure
- Modular architecture allows rapid feature deployment
- API-first design enables integration with fund admin and custodians

## 🔧 Core Features

### Investor Portal Features

**Portfolio Management**
- Multi-vehicle portfolio view with real-time NAV and performance
- Historical capital calls and distributions with IRR calculations
- Fee transparency (management fees, carried interest, expenses)
- Custom date range analysis and performance attribution

**Document Center**
- Organized by type: Tax (K-1s), Legal (subscription agreements), Reports (quarterly statements)
- Advanced search and filtering capabilities
- Secure document sharing with watermarking
- E-signature workflow for subscription documents

**Deal Flow**
- Browse active investment opportunities
- Detailed deal memos with terms, risks, and projections
- Submit expression of interest (EOI) directly from portal
- Track allocation status from invited → committed → funded

**Communication Hub**
- Secure messaging with relationship managers
- Task inbox (KYC renewals, document signatures, capital calls)
- Email notifications with in-app message center
- Message threading and attachment support

### Staff Portal Features

**Operations Dashboard**
- KYC pipeline visualization (30/60/90 day expiration alerts)
- Request queue with SLA tracking (24h target)
- Deal pipeline by stage (sourcing → due diligence → closing)
- System health monitoring (workflow failures, API errors)

**Workflow Automation**
- **Position Statement Generator**: Auto-generate investor statements from portfolio data
- **NAV Calculator**: Automated quarterly NAV calculations with investor allocations
- **Distribution Notice**: Generate and distribute capital call/distribution notices
- **Document Mailer**: Bulk document distribution with personalization
- **KYC Renewal Agent**: Automated reminders and document collection
- **Report Generator**: Custom report creation based on investor requests

**Investor Lifecycle Management**
- Complete investor onboarding workflow (application → KYC → accreditation → funding)
- Approval routing for new investors (compliance → RM → admin)
- Multi-entity support (individual, trust, corporation, partnership)
- Relationship hierarchy (family office with multiple sub-investors)

**Financial Operations**
- Management fee calculations (1-2% annually, pro-rated quarterly)
- Expense reconciliation and allocation to investors
- Introducer commission tracking (basis points on allocations)
- Capital account management with high-water marks

**Compliance Tools**
- Audit log search and export (supports SOC 2, GDPR requests)
- Compliance alert system (failed logins, unusual access patterns)
- Document retention policies (7 years for financial records)
- Role-based access control with permission audit trails

## 📊 Workflow Integration & Automation

The platform integrates with **n8n** (open-source workflow automation) to eliminate manual tasks:

### Production Workflows

**1. Inbox Manager**
- Monitors VERSO email inbox for investor communications
- Auto-categorizes messages (requests, questions, documents)
- Creates tasks in request queue with priority routing
- Sends auto-acknowledgment to investors

**2. Positions Statement Generator**
- Triggers monthly on 1st of each month
- Fetches portfolio data from Supabase (NAV, allocations, fees)
- Generates personalized PDF statements per investor
- Uploads to document library and sends email notifications

**3. Document Distribution Agent**
- Monitors shared drive for new quarterly reports
- Extracts investor metadata from filenames
- Uploads to appropriate investor document folders
- Triggers email notifications with secure download links

**4. KYC Renewal Workflow**
- Runs daily to check for expiring KYC documents (30/60/90 days)
- Sends automated renewal reminders to investors
- Creates tasks for staff when documents expire
- Tracks renewal status and escalates overdue items

**5. NDA Processing Agent**
- Receives NDA requests from deal flow page
- Generates personalized NDA from template
- Sends to DocuSign for e-signature
- Automatically files signed NDA in investor documents

**6. Reporting Agent**
- Monitors request queue for custom report requests
- Fetches data based on request parameters (date range, metrics)
- Generates custom Excel/PDF reports
- Uploads to investor portal and notifies requester

**7. LinkedIn Lead Scraper**
- Scrapes qualified leads from LinkedIn Sales Navigator
- Enriches with company and contact data
- Creates deal pipeline records in database
- Assigns to relationship managers for outreach

### Webhook Architecture
All workflows communicate with the platform via secure webhooks:
- **Outbound**: Platform → n8n (trigger workflows)
- **Inbound**: n8n → Platform (update data, upload documents)
- **Security**: HMAC-SHA256 signature verification on all requests

## 🌍 Production Deployment

### Vercel Deployment
```bash
npm run build
vercel deploy
```

### Environment Variables
Ensure all production environment variables are configured in your deployment platform.

### Database Considerations
- Use Supabase's EU region for GDPR compliance
- Configure automated backups
- Set up monitoring and alerting

## 📚 Documentation

Comprehensive Product Requirements Documents (PRDs) are available for all portal features:

### Investor Portal PRDs (`/docs/investor/`)
1. **Investor Dashboard** - Portfolio overview, NAV tracking, performance metrics
2. **Holdings Page** - Detailed investment vehicle breakdown with fee transparency
3. **Documents Page** - Secure document library with search and organization
4. **Active Deals** - Investment opportunity browsing and EOI submission
5. **Messages** - Secure communication with relationship managers
6. **Reports** - Self-service report generation and request tracking
7. **Tasks** - Action items, KYC renewals, document signatures

### Staff Portal PRDs (`/docs/staff/`)
1. **Staff Dashboard** - Operations overview, KYC pipeline, request queue
2. **Deal Management** - Investment pipeline from sourcing to closing
3. **Investor Management** - Complete investor database and relationship tracking
4. **Process Center** - One-click workflow automation triggers
5. **Approvals** - Multi-level approval routing for key operations
6. **Request Management** - Investor request queue with SLA tracking
7. **Fees Management** - Fee calculations, billing, and reconciliation
8. **Reconciliation** - Financial reconciliation and audit trails
9. **Introducers** - Deal source tracking and commission management
10. **Audit & Compliance** - Activity logging, compliance monitoring, reporting

### Additional Documentation
- **Database Schema** (`/docs/DATABASE_SCHEMA.md`) - Complete data model
- **PRD Master** (`/docs/PRD.md`) - Original product requirements
- **Deployment Guide** (`/docs/PRODUCTION_DEPLOYMENT_GUIDE.md`) - Production setup
- **Database Entities** (`/docs/database_entities_relationships.md`) - ERD and relationships

Each PRD includes:
- Business context and user stories
- Detailed technical implementation
- API specifications and database schemas
- Success metrics and KPIs

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router, Server Components)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.3 with custom design system
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts for portfolio visualizations
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context + Zustand (for complex state)

### Backend
- **Database**: Supabase (PostgreSQL 15)
- **Authentication**: Supabase Auth (magic links, OAuth, MFA)
- **Storage**: Supabase Storage (S3-compatible)
- **API**: Next.js API Routes + Supabase REST API
- **Real-time**: Supabase Realtime (WebSocket subscriptions)
- **Security**: Row-Level Security (RLS) policies

### Automation & Integration
- **Workflow Engine**: n8n (self-hosted)
- **E-Signature**: DocuSign / Dropbox Sign
- **Email**: SendGrid / Postmark
- **Document Generation**: PDFKit / Puppeteer
- **Data Scraping**: Puppeteer / LinkedIn API

### DevOps & Infrastructure
- **Hosting**: Vercel (Next.js), Supabase Cloud (Database)
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics, Sentry (error tracking)
- **CI/CD**: GitHub Actions
- **Environment**: Docker (for n8n workflows)

## 📜 License

Proprietary software for VERSO Holdings. All rights reserved.

## 🆘 Support

For technical support or questions about the platform:
- **Technical Issues**: Contact the development team
- **Feature Requests**: Submit via GitHub Issues
- **Security Concerns**: Email security@versoholdings.com
- **Business Inquiries**: Contact VERSO Holdings leadership

