# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VERSO Holdings is an alternative investment platform managing $800M+ in assets across private equity, venture capital, and structured investments. The platform consists of:

- **Investor Portal** (`/versoholdings/*`): Self-service portal for 50+ institutional and high-net-worth investors
- **Staff Portal** (`/versotech/*`): Operations dashboard and workflow automation for VERSO's investment team

Built with Next.js 15 (App Router), Supabase (PostgreSQL + Auth + Storage), and n8n workflow automation.

## Development Commands

### Frontend Development
```bash
cd versotech-portal
npm install                 # Install dependencies
npm run dev                # Start dev server (http://localhost:3000)
npm run build              # Build for production
npm start                  # Run production build
npm run lint               # Run ESLint
```

### Supabase Database Operations
```bash
# Local development (from project root)
npx supabase start         # Start local Supabase (Docker required)
npx supabase stop          # Stop local instance
npx supabase status        # Check status and get credentials

# Migrations (use Supabase MCP tools in Claude Code instead)
npx supabase migration new <name>    # Create new migration
npx supabase db reset                # Reset local DB to latest migrations
npx supabase db push                 # Push migrations to remote

# Type generation (regenerate after schema changes)
npx supabase gen types typescript --project-id ipguxdssecfexudnvtia > versotech-portal/src/types/supabase.ts
```

### Testing
```bash
cd versotech-portal
npm test                   # Run tests (if configured)
```

## Architecture

### Dual-Brand Portal System

The platform serves two distinct user bases with separate authentication and routing:

**VERSO Holdings (Investor Portal)** - `/versoholdings/*`
- Dashboard: Portfolio NAV, performance metrics, capital call/distribution history
- Holdings: Detailed vehicle positions and fee breakdowns
- Documents: Secure access to K-1s, subscription agreements, quarterly statements
- Deals: Browse open investment opportunities, submit expressions of interest
- Messages: Secure communication with relationship managers
- Tasks: KYC renewals, document signatures, capital call notices

**VERSO Tech (Staff Portal)** - `/versotech/*`
- Dashboard: KYC pipeline, request queue, deal flow, system health
- Deal Management: Investment pipeline from sourcing to closing
- Investor Management: Complete investor database with KYC status
- Process Center: One-click automation triggers for 9 critical workflows
- Approvals: Multi-level approval routing for onboarding and allocations
- Fees & Reconciliation: Management fee calculations and billing
- Introducers: Deal source tracking and commission management
- Audit & Compliance: Immutable audit trails and compliance monitoring

### Authentication & Authorization

**User Roles**:
- `investor`: Access to investor portal only
- `staff_admin`: Full access to staff portal
- `staff_ops`: Operations-focused staff access
- `staff_rm`: Relationship manager staff access

**Auth Flow**:
1. Middleware (`versotech-portal/src/middleware.ts`) protects all routes
2. Uses `supabase.auth.getUser()` to validate session against Supabase Auth server
3. Fetches profile from `profiles` table for role-based access control
4. Redirects to appropriate login page based on route context

**Key Files**:
- `versotech-portal/src/lib/supabase/client.ts` - Browser Supabase client
- `versotech-portal/src/lib/supabase/server.ts` - Server Supabase client (standard + service role)
- `versotech-portal/src/lib/auth.ts` - Auth utilities (`getCurrentUser`, `requireAuth`, etc.)
- `versotech-portal/src/middleware.ts` - Route protection and role enforcement

### Database Architecture

**Core Entities** (all in `public` schema):
- `profiles` - User accounts (investors and staff)
- `investors` - Investor-specific data (KYC, accreditation, entity details)
- `vehicles` - Investment funds/SPVs
- `subscriptions` - Investor commitments to vehicles
- `deals` - Investment opportunities (pipeline management)
- `documents` - File metadata with storage references
- `conversations` & `conversation_messages` - Messaging system
- `approvals` - Multi-level approval workflows
- `audit_logs` - Immutable activity tracking

**Security Model**:
- Row-Level Security (RLS) policies on all tables
- Investors can only see their own data
- Staff have broader access based on role
- Service role client bypasses RLS for admin operations

**Migrations**:
- Baseline schema: `supabase/migrations/00000000000000_baseline.sql` (5384 lines)
- Incremental migrations in `supabase/migrations/` (60+ files)
- Use Supabase MCP tools in Claude Code for migration operations:
  - `mcp__supabase__list_tables` - View current schema
  - `mcp__supabase__apply_migration` - Create and run migrations
  - `mcp__supabase__execute_sql` - Run queries (use for DML, not DDL)

### Workflow Automation (n8n Integration)

The platform integrates with n8n for workflow automation. Workflow definitions are in `versotech-portal/src/lib/workflows.ts`:

**Production Workflows**:
1. **Position Statement Generator** - Auto-generate investor statements
2. **NDA Processing** - DocuSign integration for NDAs
3. **Shared-Drive Notification** - Document update alerts
4. **Inbox Manager** - Auto-route investor communications
5. **LinkedIn Leads Scraper** - Prospect identification
6. **Reporting Agent** - Custom report generation
7. **KYC/AML Processing** - Enhanced due diligence
8. **Capital Call Processing** - Capital call notices and wire instructions
9. **Investor Onboarding** - Multi-step onboarding flow

**Webhook Security**:
- All webhooks use HMAC-SHA256 signature verification
- Outbound: Platform → n8n (trigger workflows)
- Inbound: n8n → Platform (update data, upload documents)
- Configure secrets in `.env.local` (`N8N_OUTBOUND_SECRET`, `N8N_INBOUND_SECRET`)

### API Routes Structure

API routes in `versotech-portal/src/app/api/`:
- `auth/*` - Authentication endpoints (signin, signout, signup)
- `deals/*` - Deal management, allocations, documents
- `investors/*` - Investor CRUD operations
- `conversations/*` - Messaging endpoints
- `approvals/*` - Approval workflow actions
- `documents/*` - Document upload/download/versioning
- `subscriptions/*` - Subscription management
- `vehicles/*` - Vehicle CRUD operations
- `workflows/*` - Workflow trigger endpoints
- `cron/*` - Scheduled job endpoints (data room expiry, document publishing)

### Component Architecture

Components in `versotech-portal/src/components/`:
- `ui/` - shadcn/ui base components (Button, Dialog, Table, etc.)
- `dashboard/` - Dashboard widgets (KPI cards, charts, filters)
- `deals/` - Deal flow components (pipeline, allocation forms)
- `documents/` - Document library UI (upload, viewer, versioning)
- `investors/` - Investor management UI (forms, tables, profiles)
- `messaging/` - Chat interface components
- `approvals/` - Approval workflow UI
- `layout/` - Navigation, headers, sidebars
- `staff/` - Staff portal-specific components

**UI Framework**: shadcn/ui (Radix UI primitives) with custom VERSO branding
**State Management**: React Context + Zustand for complex state
**Forms**: React Hook Form + Zod validation

### Environment Configuration

Required environment variables (create `versotech-portal/.env.local`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=          # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Anon/public key
SUPABASE_SERVICE_ROLE_KEY=         # Service role key (admin)

# n8n Webhooks
N8N_OUTBOUND_SECRET=               # Secret for outbound webhooks
N8N_INBOUND_SECRET=                # Secret for inbound webhooks

# E-Signature (DocuSign/Dropbox Sign)
ESIGN_API_KEY=                     # E-signature provider API key
ESIGN_WEBHOOK_SECRET=              # Webhook verification secret

# Storage Buckets
STORAGE_BUCKET_NAME=documents      # Main documents bucket
DEAL_DOCUMENTS_BUCKET=deal-documents  # Deal data room bucket
DOCS_BUCKET=docs                   # Legacy bucket

# Environment
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Key Development Patterns

### Working with Supabase

**Browser (Client Component)**:
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.from('investors').select('*')
```

**Server (Server Component/API Route)**:
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data, error } = await supabase.from('investors').select('*')
```

**Admin Operations (bypasses RLS)**:
```typescript
import { createServiceClient } from '@/lib/supabase/server'

const supabase = createServiceClient()
const { data, error } = await supabase.from('investors').select('*')
```

### Database Migrations

When modifying the database schema:

1. **Using Supabase MCP tools** (recommended in Claude Code):
   ```typescript
   // List current tables/schema
   await mcp__supabase__list_tables({ schemas: ['public'] })

   // Apply migration
   await mcp__supabase__apply_migration({
     name: 'add_new_column',
     query: 'ALTER TABLE investors ADD COLUMN new_field TEXT;'
   })
   ```

2. **Using CLI** (alternative):
   ```bash
   npx supabase migration new add_new_column
   # Edit the generated file in supabase/migrations/
   npx supabase db reset  # Test locally
   npx supabase db push   # Push to remote
   ```

3. **Always include**:
   - DDL changes (CREATE/ALTER/DROP)
   - RLS policies for new tables
   - Indexes for foreign keys and frequently queried columns
   - Comments documenting table/column purposes

### Auth Patterns

**Server Components**:
```typescript
import { getCurrentUser } from '@/lib/auth'

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect('/versoholdings/login')
  // user.role, user.email, user.displayName available
}
```

**API Routes**:
```typescript
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Proceed with authenticated request
}
```

### File Upload Pattern

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Upload file
const { data, error } = await supabase.storage
  .from('documents')
  .upload(`investor/${investorId}/${file.name}`, file)

// Create document record
await supabase.from('documents').insert({
  investor_id: investorId,
  file_name: file.name,
  storage_path: data.path,
  mime_type: file.type,
  file_size: file.size
})
```

### Workflow Trigger Pattern

```typescript
// Trigger n8n workflow from API route
const response = await fetch(process.env.N8N_WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-VERSO-Signature': generateHMAC(payload, process.env.N8N_OUTBOUND_SECRET)
  },
  body: JSON.stringify({
    workflow: 'generate-position-statement',
    data: { investor_id, as_of_date }
  })
})
```

## Database Query Patterns

### Using Supabase MCP Tools

The Supabase MCP server is connected and provides these key tools:

**List Tables/Schema**:
```typescript
await mcp__supabase__list_tables({ schemas: ['public'] })
```

**Execute SQL** (for SELECT/INSERT/UPDATE/DELETE):
```typescript
await mcp__supabase__execute_sql({
  query: "SELECT * FROM investors WHERE kyc_status = 'approved'"
})
```

**Apply Migrations** (for DDL - CREATE/ALTER/DROP):
```typescript
await mcp__supabase__apply_migration({
  name: 'add_investor_notes',
  query: `
    ALTER TABLE investors
    ADD COLUMN notes TEXT;

    COMMENT ON COLUMN investors.notes IS 'Internal notes about investor';
  `
})
```

**Get Logs** (debugging):
```typescript
await mcp__supabase__get_logs({ service: 'postgres' })
```

**Security Advisors** (check for issues):
```typescript
await mcp__supabase__get_advisors({ type: 'security' })
```

### Common Query Patterns

**Investor Portfolio**:
```sql
SELECT
  v.name as vehicle_name,
  s.commitment_amount,
  s.funded_amount,
  s.current_nav,
  s.subscription_date
FROM subscriptions s
JOIN vehicles v ON s.vehicle_id = v.id
WHERE s.investor_id = $1
ORDER BY s.subscription_date DESC
```

**Deal Pipeline**:
```sql
SELECT
  d.*,
  COUNT(dm.id) as member_count,
  SUM(CASE WHEN dm.role = 'investor' THEN 1 ELSE 0 END) as investor_count
FROM deals d
LEFT JOIN deal_members dm ON d.id = dm.deal_id
WHERE d.status IN ('draft', 'open', 'allocation_pending')
GROUP BY d.id
ORDER BY d.target_close_date ASC
```

**Investor Summary** (uses materialized view):
```sql
SELECT * FROM investor_summary_mv
WHERE investor_id = $1
```

## Debugging Tips

### Authentication Issues
- Check middleware logs: Look for `[middleware]`, `[auth]` prefixes in console
- Verify session cookies: Use browser DevTools → Application → Cookies
- Test RLS policies: Use `mcp__supabase__execute_sql` with different roles
- Check profile existence: `SELECT * FROM profiles WHERE id = '<user-id>'`

### Database Query Issues
- Use `mcp__supabase__get_logs({ service: 'postgres' })` to see query errors
- Test queries in Supabase Dashboard SQL Editor first
- Check RLS policies with `EXPLAIN` or temporarily disable for testing
- Verify foreign key constraints haven't been violated

### File Upload Issues
- Check bucket policies in Supabase Dashboard → Storage
- Verify environment variables for bucket names
- Check file size limits (default 50MB in Supabase)
- Ensure proper MIME type handling

### Workflow Issues
- Verify webhook signatures match expected HMAC
- Check n8n workflow logs for execution errors
- Test webhooks with curl/Postman before integrating
- Ensure environment variables are set for secrets

## Production Deployment

### Vercel Deployment
1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Database Migrations
1. Test migrations locally: `npx supabase db reset`
2. Push to production: `npx supabase db push` OR use Supabase Dashboard SQL Editor
3. Verify with: `await mcp__supabase__list_migrations()`

### Post-Deployment Checklist
- Run security advisor: `await mcp__supabase__get_advisors({ type: 'security' })`
- Verify RLS policies are active on all tables
- Test auth flows for both portals
- Check storage bucket permissions
- Verify webhook endpoints are accessible

## Important Constraints

### Security Requirements
- **Never expose service role key** in client-side code
- **Always use RLS policies** for data access control
- **Validate all user input** with Zod schemas before database operations
- **Use HMAC signatures** for webhook verification
- **Audit log all sensitive operations** (investor data changes, document access)

### Performance Considerations
- **Use materialized views** for complex aggregations (refresh daily via cron)
- **Index foreign keys** and frequently queried columns
- **Paginate large result sets** (use `limit` and `offset`)
- **Cache static data** (vehicle lists, deal documents) on client
- **Avoid N+1 queries** - use Supabase joins or batch operations

### Data Integrity Rules
- **Never hard-delete records** - use soft deletes (`deleted_at` timestamp)
- **Maintain audit trails** - log who/when/what for all data changes
- **Validate business logic** before database operations (e.g., commitment ≤ vehicle capacity)
- **Use transactions** for multi-table operations (subscriptions + capital calls)
- **Handle cascade deletes carefully** - prefer RESTRICT over CASCADE for critical foreign keys

## Documentation

Comprehensive PRDs are available in `/docs/`:
- **Investor Portal**: `/docs/investor/*.md` (dashboard, holdings, documents, deals, messages)
- **Staff Portal**: `/docs/staff/*.md` (dashboard, deals, investors, processes, approvals, fees, audit)
- **Database Schema**: `/docs/DATABASE_SCHEMA.md`
- **Entity Relationships**: `/docs/database_entities_relationships.md`
- **Deployment**: `/docs/PRODUCTION_DEPLOYMENT_GUIDE.md`

Each PRD includes business context, technical implementation details, API specifications, and success metrics.
