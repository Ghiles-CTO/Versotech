# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VERSO Holdings Investor & Staff Portal - an enterprise platform for managing investor relations, fund operations, and deal flow for an alternative investment portfolio. Dual-portal architecture serving institutional investors and internal staff through a unified codebase.

## Development Commands

```bash
# From versotech-portal/ directory:
npm run dev         # Start development server (Next.js with Turbopack)
npm run build       # Production build
npm run lint        # ESLint checks
npm run start       # Start production server

# Database migrations (from root):
npx supabase migration new <name>   # Create new migration
npx supabase db push                # Apply migrations to remote
```

## Repository Structure

```
/
├── versotech-portal/           # Main Next.js 15 application
│   └── src/
│       ├── app/                # App Router routes
│       │   ├── (main)/versotech_main/  # Unified portal (primary routes)
│       │   ├── (investor)/     # Legacy investor routes (redirected)
│       │   ├── (staff)/        # Legacy staff routes (redirected)
│       │   └── api/            # API endpoints
│       ├── components/         # React components by feature
│       ├── lib/                # Utilities, clients, helpers
│       │   ├── supabase/       # Supabase clients (client.ts, server.ts)
│       │   └── [domain]/       # Domain-specific utilities
│       └── types/              # TypeScript types including generated Supabase types
├── supabase/
│   └── migrations/             # SQL migrations (200+ files, timestamp-ordered)
└── docs/                       # Product documentation and PRDs
```

## Tech Stack

- **Frontend**: Next.js 15 (App Router, Server Components), TypeScript, Tailwind CSS
- **UI**: shadcn/ui (Radix primitives), Lucide icons, Framer Motion
- **Database**: Supabase (PostgreSQL with RLS)
- **Auth**: Supabase Auth (magic links, OAuth, MFA)
- **Storage**: Supabase Storage (S3-compatible)
- **Forms**: React Hook Form + Zod validation
- **State**: React Context + Zustand

## Key Architectural Patterns

### Unified Portal Routes
All active routes are under `/versotech_main/*`. Legacy routes (`/versoholdings/*`, `/versotech/staff/*`) auto-redirect via middleware.

### Persona-Based Multi-Role System
Users can have multiple personas (investor, staff, arranger, introducer, etc.) linked to entities. The active persona determines visible navigation and data access. Fetched via `get_user_personas()` RPC.

### Supabase Client Usage
```typescript
// Browser client (use in client components)
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Server client (use in server components, API routes)
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Service client (bypasses RLS - admin operations only)
import { createServiceClient } from '@/lib/supabase/server'
const serviceSupabase = createServiceClient()
```

### Row-Level Security (RLS)
All access control is enforced at database level via RLS policies. Never trust application-level filtering for security.

### Server/Client Component Split
- Use Server Components for data fetching and layouts
- Add `'use client'` only when interactivity is needed
- Pattern: Server component fetches data, passes to client component

### Audit Logging
All sensitive operations must be logged:
```typescript
await auditLogger.log({
  actor_user_id: user.id,
  action: AuditActions.CREATE,
  entity: AuditEntities.DEALS,
  entity_id: dealId,
  metadata: { /* context */ }
})
```

## Authentication Flow

Middleware (`src/middleware.ts`) handles:
1. Legacy route redirects
2. Session validation with exponential backoff retry
3. Persona-based path enforcement
4. Token refresh before expiry

API routes use `api-auth.ts` helpers for authorization checks.

## Database Conventions

- Migrations: Timestamp-prefixed SQL files in `supabase/migrations/`
- Types: Generated in `src/types/supabase.ts`
- Table names: snake_case
- Always specify columns in SELECT (no `SELECT *`)
- Use RLS policies for access control

## Code Conventions

- **Routes**: kebab-case (`/kyc-review`)
- **Components**: PascalCase (`DealDetailClient.tsx`)
- **Database fields**: snake_case
- **Path alias**: `@/*` maps to `src/*`

## Important Domain Concepts

- **Deal**: Investment opportunity with lifecycle (draft → active → closed)
- **Vehicle**: Investment fund that holds deals
- **Subscription**: Investor's commitment to a deal
- **Entity**: Organization (investor company, partner firm) with members
- **Allocation**: Final investment amount assigned to investor

## MCP Integration

Supabase MCP is configured for direct database access. Use `mcp__supabase__*` tools for schema inspection, migrations, and queries.

## Environment Variables

Required for development:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
