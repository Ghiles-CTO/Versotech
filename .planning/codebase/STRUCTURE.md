# Codebase Structure

**Analysis Date:** 2026-01-23

## Directory Layout

```
versotech-portal/
├── src/
│   ├── app/                          # Next.js routes and pages
│   │   ├── (admin)/versotech_admin/  # Admin portal routes
│   │   ├── (main)/versotech_main/    # Main portal (55 routes)
│   │   ├── (public)/                 # Public/auth pages
│   │   ├── (staff)/versotech/        # Legacy staff routes (301 redirect)
│   │   ├── (investor)/versoholdings/ # Legacy investor routes (301 redirect)
│   │   ├── api/                      # API routes (50+ endpoints)
│   │   ├── auth/                     # Authentication routes
│   │   ├── sign/                     # Document signing
│   │   ├── logout/                   # Logout endpoint
│   │   ├── invitation/               # Invitation acceptance
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Root page (redirects)
│   │   └── globals.css               # Global styles
│   ├── components/                   # React components (reusable)
│   │   ├── dashboard/                # Dashboard components
│   │   ├── deals/                    # Deal management components
│   │   ├── investors/                # Investor components
│   │   ├── approvals/                # Approval workflow components
│   │   ├── commissions/              # Commission components
│   │   ├── fees/                     # Fee management components
│   │   ├── signature/                # Digital signature UI
│   │   ├── layout/                   # Navigation, sidebar, header
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── messaging/                # Chat/messaging UI
│   │   ├── kyc/                      # KYC form components
│   │   └── ...                       # Feature-specific components
│   ├── lib/                          # Business logic modules
│   │   ├── supabase/                 # Supabase client setup
│   │   ├── deals/                    # Deal business logic
│   │   ├── fees/                     # Fee calculations
│   │   ├── signature/                # Signature workflows
│   │   ├── subscription/             # Subscription logic
│   │   ├── audit/                    # Audit logging
│   │   ├── api-auth.ts               # Auth helpers
│   │   ├── notifications.ts          # Notification creation
│   │   ├── workflows.ts              # Workflow triggers
│   │   ├── format.ts                 # Formatting utilities
│   │   ├── validation/               # Validation schemas
│   │   └── utils/                    # General utilities
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-notifications.ts
│   │   ├── use-confirmation-dialog.tsx
│   │   └── ...
│   ├── contexts/                     # React contexts
│   │   ├── persona-context.tsx       # Multi-role persona system
│   │   └── tour-context.tsx          # Guided tour state
│   ├── types/                        # TypeScript type definitions
│   │   ├── supabase.ts               # Generated DB types
│   │   ├── subscription.ts           # Subscription types
│   │   ├── introducers.ts            # Introducer types
│   │   └── ...
│   ├── constants/                    # Application constants
│   ├── config/                       # Configuration
│   └── middleware.ts                 # Next.js middleware
├── public/                           # Static assets
├── .env.local                        # Environment variables
├── .claude/                          # Claude AI context
├── next.config.ts                    # Next.js config
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind CSS config
├── eslint.config.mjs                 # ESLint config
└── package.json                      # Dependencies
```

## Directory Purposes

**src/app/(main)/versotech_main/**
- Purpose: Main portal for all authenticated users (investor, staff, partner, etc.)
- Contains: 55 route folders with page.tsx files
- Key files:
  - `dashboard/page.tsx` - Main dashboard (persona-aware)
  - `deals/` - Deal listing and management
  - `opportunities/` - Investment opportunities for investors
  - `portfolio/` - Investor holdings and positions
  - `fees/` - Fee management and reporting
  - `approvals/` - Multi-step approvals (termsheet, placement)
  - `messages/` - Messaging inbox
  - `subscription-packs/` - Subscription submission workflow

**src/app/api/**
- Purpose: RESTful API endpoints for frontend and webhooks
- Contains: 50+ route handlers organized by feature
- Key endpoints:
  - `deals/` - Deal CRUD and operations
  - `subscriptions/` - Subscription management
  - `fees/` - Fee plan and calculation APIs
  - `commissions/` - Commission tracking
  - `approvals/` - Approval workflow state
  - `signatures/` - Signature request creation and tracking
  - `admin/` - System administration
  - `cron/` - Scheduled task endpoints
  - `webhooks/` - External service callbacks

**src/components/**
- Purpose: Reusable React components organized by feature domain
- Structure: Feature folders contain related components
- Key folders:
  - `dashboard/` - Dashboard widgets and analytics
  - `deals/` - Deal card, list, detail views
  - `subscriptions/` - Subscription form and list
  - `fees/` - Fee structure visualization
  - `kyc/` - KYC form wizard
  - `signature/` - Signature pad, request UI
  - `approvals/` - Approval card, workflow UI
  - `layout/` - Navigation, sidebar, header
  - `ui/` - Base UI components (Button, Card, Dialog, etc.)

**src/lib/supabase/**
- Purpose: Supabase client initialization and management
- Files:
  - `client.ts` - Browser client (singleton pattern)
  - `server.ts` - Server client (per-request)
  - `smart-client.ts` - Exports based on environment
- Pattern: All code imports from `smart-client.ts` which auto-selects correct client

**src/lib/fees/**
- Purpose: Fee calculation engine and validation
- Files:
  - `types.ts` - Fee structure types
  - `calculations.ts` - Tier-based fee calculation algorithm
  - `subscription-fee-calculator.ts` - Investor fee calculations
  - `validation.ts` - Fee structure validation rules
  - `term-sheet-sync.ts` - Sync fees with term sheet
- Pattern: Exports main calculation functions used by API routes and components

**src/lib/deals/**
- Purpose: Deal-specific business logic
- Files:
  - `deal-close-handler.ts` - Orchestrates deal closing (subscriptions, positions, commissions, certs)
- Pattern: Called by scheduled cron job on deal close_at date

**src/lib/signature/**
- Purpose: Digital signature workflows
- Files: 12 files handling request creation, tracking, multi-signature orchestration
- Pattern: RPC calls to complex stored procedures for signature state management

**src/lib/subscription/**
- Purpose: Subscription lifecycle and certificate generation
- Files: Subscription status management, commitment tracking, certificate triggers
- Pattern: Called by deal-close-handler and manual subscription operations

**src/types/supabase.ts**
- Purpose: TypeScript types generated from Supabase schema
- Size: 385KB - Complete database schema as TypeScript
- Generated by: `supabase gen types` command
- Used by: All database operations for type safety

**src/contexts/persona-context.tsx**
- Purpose: Global state for user's active persona and available personas
- Exposes: `usePersona()` hook for components
- Pattern: Server state (from API) + client state (active persona selection)
- Used by: Dashboard, API routes, permission checks

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx` - Root layout (metadata, fonts, theme script)
- `src/app/page.tsx` - Root page (redirect logic)
- `src/middleware.ts` - Request middleware (auth, redirects)

**Configuration:**
- `.env.local` - Environment variables (Supabase URL, keys)
- `tsconfig.json` - TypeScript config (path aliases: `@/` = `src/`)
- `tailwind.config.ts` - Tailwind CSS theme
- `next.config.ts` - Next.js configuration

**Core Logic:**
- `src/lib/api-auth.ts` - Permission and role checking helpers
- `src/lib/notifications.ts` - In-app notification creation
- `src/lib/audit/log-event.ts` - Audit logging
- `src/lib/workflows.ts` - Workflow state machine triggers

**Testing:**
- `src/__tests__/` - Test files mirroring src/ structure
- `src/__tests__/api/` - API route tests
- `src/__tests__/lib/` - Business logic tests
- `src/__tests__/mocks/` - Test fixtures and mocks

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Next.js convention)
- Components: `PascalCase.tsx` (React convention)
  - Example: `DealDetailClient.tsx`, `InvestorDashboard.tsx`
- Utils/helpers: `camelCase.ts`
  - Example: `format.ts`, `validation-helpers.ts`
- API routes: `route.ts` (Next.js convention)
  - Located in directory matching endpoint path: `src/app/api/deals/route.ts` = `POST /api/deals`

**Directories:**
- Routes/pages: kebab-case in URL
  - Example: `/versotech_main/kyc-review`, `/api/fee-plans`
- Feature folders: lowercase with hyphens
  - Example: `commercial-partners/`, `fee-plans/`, `placement-agreements/`
- Component feature folders: lowercase with hyphens
  - Example: `src/components/deal-details/`, `src/components/kyc-wizard/`

**Database Tables:**
- Table names: snake_case
- Column names: snake_case
- Enums: snake_case_enum (example: `allocation_status_enum`)

## Where to Add New Code

**New Feature/Module:**
1. Create folder in `src/app/(main)/versotech_main/[feature-name]/`
2. Add `page.tsx` (Server Component with data fetch)
3. Create sub-components in `src/components/[feature-name]/`
4. Create API endpoint in `src/app/api/[feature-name]/route.ts`
5. Add business logic to `src/lib/[feature-name]/` if complex
6. Create tests in `src/__tests__/[matching-path]/`

**Example (New Deal Analytics Feature):**
```
src/
├── app/
│   ├── (main)/versotech_main/deal-analytics/page.tsx     # Page entry point
│   └── api/deal-analytics/route.ts                        # API endpoint
├── components/deal-analytics/                             # Components
│   ├── analytics-dashboard.tsx
│   ├── performance-chart.tsx
│   └── metrics-card.tsx
└── lib/deal-analytics/                                    # Business logic
    └── calculations.ts
```

**New API Endpoint:**
- Location: `src/app/api/[resource]/route.ts`
- Pattern:
  ```typescript
  import { createClient } from '@/lib/supabase/server'
  import { getAuthenticatedUser } from '@/lib/api-auth'
  import { auditLogger } from '@/lib/audit'
  import { z } from 'zod'

  const schema = z.object({ /* fields */ })

  export async function POST(request: Request) {
    const supabase = await createClient()
    const { user, error } = await getAuthenticatedUser(supabase)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const result = schema.safeParse(await request.json())
    if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 400 })

    // Business logic here

    await auditLogger.log({ action: 'created', entity: 'resource', /* ... */ })
    return NextResponse.json({ data })
  }
  ```

**New Component:**
- Location: `src/components/[feature]/[ComponentName].tsx`
- Pattern: Default export, PascalCase name
  ```typescript
  export function DealCard({ deal }: { deal: Deal }) {
    return <div>...</div>
  }
  ```
- Client Components: Add `'use client'` at top if interactive (forms, hooks)
- Server Components: Default, can fetch data with `await`

**Utilities/Helpers:**
- Shared across routes: `src/lib/utils/` or `src/lib/[domain]/`
- Reusable validation: `src/lib/validation/`
- Constants: `src/constants/` or feature-specific in lib

## Special Directories

**src/components/ui/**
- Purpose: Base UI components from shadcn/ui
- Generated: Yes (via `npx shadcn-ui@latest add [component]`)
- Committed: Yes
- Pattern: Direct imports from shadcn/ui originals, customized for branding

**src/__tests__/**
- Purpose: Test files (unit, integration)
- Generated: No
- Committed: Yes
- Pattern: Mirrors src/ structure for easy discovery

**.next/**
- Purpose: Build output directory
- Generated: Yes (by `npm run build`)
- Committed: No (.gitignore)

**node_modules/**
- Purpose: Installed dependencies
- Generated: Yes (by `npm install`)
- Committed: No (.gitignore)

**.env.local**
- Purpose: Local environment variables
- Generated: No
- Committed: No (.gitignore)
- Contains: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, etc.

## Path Aliases

Configured in `tsconfig.json`:
- `@/*` → `src/*` (all imports use `@/` prefix)
- Example: `import { DealCard } from '@/components/deals/deal-card'`

## Conventions for Imports

**Order in files:**
1. External packages (`next`, `react`, third-party)
2. Supabase/database
3. Local types and schemas
4. Local utilities and helpers
5. Local components

**Example:**
```typescript
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { DealCard } from '@/components/deals'
```

---

*Structure analysis: 2026-01-23*
