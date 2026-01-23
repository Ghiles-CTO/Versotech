# Architecture

**Analysis Date:** 2026-01-23

## Pattern Overview

**Overall:** Next.js 15 fullstack with server-side rendering, API-driven business logic, and progressive client-side interactivity.

**Key Characteristics:**
- Server Components as default for data fetching and layout
- API routes handle all business logic, validation, and mutation logging
- Client Components for interactive features (forms, real-time updates)
- Multi-role persona system for flexible user access control
- Row-level security (RLS) with service role for admin operations
- Centralized audit logging on all mutations

## Layers

**Presentation Layer:**
- Purpose: Render UI, handle user interactions, display data
- Location: `src/app/` (pages), `src/components/` (reusable components)
- Contains: Server Components, Client Components, layout files
- Depends on: API routes, lib utilities, contexts
- Used by: End users via browser

**API Layer:**
- Purpose: Handle HTTP requests, validate input, enforce authorization, mutate data, log changes
- Location: `src/app/api/`
- Contains: Route handlers (GET, POST, PUT, DELETE)
- Depends on: Supabase client, business logic modules, audit logger
- Used by: Frontend components, external services, webhooks

**Business Logic Layer:**
- Purpose: Encapsulate domain logic for complex operations
- Location: `src/lib/`
- Contains: Fee calculations, deal closing, signatures, subscriptions, commissions
- Depends on: Supabase, types, validation helpers
- Used by: API routes, server components

**Data Access Layer:**
- Purpose: Communicate with Supabase database
- Location: `src/lib/supabase/`
- Contains: Browser client (singleton), server client (per-request), service client (admin)
- Depends on: Supabase SDK
- Used by: API routes, server components, business logic

**Authentication & Authorization Layer:**
- Purpose: Manage user sessions, roles, personas, and permissions
- Location: `src/lib/api-auth.ts`, middleware, auth routes
- Contains: Auth checks, permission validation, persona system
- Depends on: Supabase auth, profiles table
- Used by: All routes and API endpoints

## Data Flow

**Request → Response Flow (Server Component or API Route):**

1. User accesses URL → Next.js routes request to middleware
2. Middleware checks authentication, handles legacy redirects (301)
3. Page Server Component or API Route executes:
   - `createClient()` retrieves Supabase session from cookies
   - `getAuthenticatedUser()` validates user exists
   - Business logic executes (queries, calculations, mutations)
   - For mutations: `auditLogger.log()` records change to audit table
   - Response returned to client
4. Client receives data and renders

**Authentication State Flow:**

1. User logs in → Magic link sent via email
2. User clicks link → `auth/callback` captures hash in URL (module load, not useEffect)
3. Session stored in browser localStorage by Supabase client
4. Middleware refreshes token on each request
5. Server Component reads session from cookies
6. Persona system applied if user is `multi_persona` role

**Mutation & Audit Flow:**

1. Form submitted → API route validates with Zod schema
2. API route gets Supabase client with user session (RLS applied)
3. Mutation executed: `INSERT`, `UPDATE`, or `DELETE`
4. `auditLogger.log()` called with metadata (before/after values, IP, user agent)
5. Audit event stored in `audit_events` table via RPC
6. Response includes updated data

**State Management Flow:**

1. Global state: Persona context (`src/contexts/persona-context.tsx`)
2. Server state: Page data fetched in Server Components, passed to Client Components
3. Client state: React hooks (`useState`) for form state, UI state, temporary filters
4. Real-time: Supabase real-time subscriptions (limited use, mostly polling)

## Key Abstractions

**Supabase Client Singleton:**
- Purpose: Prevent token refresh race conditions, maintain session consistency
- Examples: `src/lib/supabase/client.ts`
- Pattern:
  ```typescript
  let client: SupabaseClient | null = null
  export const createClient = () => {
    if (client) return client
    // Create and return
  }
  export const resetClient = () => { client = null }
  ```
- Used by: All browser-side code, API routes

**Audit Logger:**
- Purpose: Log all mutations for compliance, debugging, and security
- Examples: `src/lib/audit/log-event.ts`
- Pattern: Called after every mutation with before/after values, IP address, user agent
- Creates entries in `audit_events` table via RPC

**Fee Calculation Engine:**
- Purpose: Calculate investor fees and partner commissions based on deal terms
- Examples: `src/lib/fees/calculations.ts`, `src/lib/fees/subscription-fee-calculator.ts`
- Pattern: Complex tier-based calculations handling multiple fee structures
- Validates against deal terms schema

**Deal Close Handler:**
- Purpose: Execute business logic when deal reaches closing date
- Examples: `src/lib/deals/deal-close-handler.ts`
- Pattern: Idempotent operation creating subscriptions, positions, commissions, generating certificates
- Triggers notifications and audit logs

**Signature Workflow:**
- Purpose: Manage multi-signatory document workflows
- Examples: `src/lib/signature/` (12 files)
- Pattern: Track signature requests, multi-step signing, document versioning
- Enforces all signatures before progression

**Persona System:**
- Purpose: Support users with multiple roles in single account
- Examples: `src/contexts/persona-context.tsx`, API endpoints
- Pattern: User can switch between `investor`, `staff`, `arranger`, `introducer`, `partner`, `commercial_partner`, `lawyer`
- Rendered UI and API permissions based on active persona

## Entry Points

**Root Page:**
- Location: `src/app/page.tsx`
- Triggers: Direct navigation to domain root
- Responsibilities: Redirect authenticated users to `/versotech_main/dashboard`, unauthenticated to login

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every request
- Responsibilities: Set metadata, inject theme script (prevents white flash), load fonts, render `AuthInitWrapper`

**Main Portal Routes (55 active routes):**
- Location: `src/app/(main)/versotech_main/*`
- Examples: `/dashboard`, `/deals`, `/opportunities`, `/portfolio`, `/fees`, `/approvals`, `/messages`
- Triggers: Authenticated users with appropriate persona
- Responsibilities: Render main application UI, fetch dashboard data, manage user interactions

**Admin Portal:**
- Location: `src/app/(admin)/versotech_admin/*`
- Triggers: Users with `ceo` or `staff_*` roles
- Responsibilities: System administration, user management, compliance oversight

**API Routes:**
- Location: `src/app/api/*` (50+ endpoints)
- Examples: `/api/deals`, `/api/subscriptions`, `/api/fees`, `/api/commissions`
- Triggers: Frontend XHR/fetch requests, webhooks, scheduled tasks
- Responsibilities: Data mutations, complex calculations, external integrations

**Authentication Routes:**
- Location: `src/app/auth/callback`, `src/app/logout`
- Triggers: OAuth flow, user logout
- Responsibilities: Capture session, clear session, redirect

**Middleware:**
- Location: `src/middleware.ts`
- Triggers: Every request (except static files, API routes)
- Responsibilities:
  - Legacy URL redirects (301) from old portals
  - Token refresh
  - Session detection

**Document Signature Endpoint:**
- Location: `src/app/sign/[token]/page.tsx`
- Triggers: User clicks signature link from email
- Responsibilities: Display document, capture signature, validate signing authority

## Error Handling

**Strategy:** Return structured error responses with HTTP status codes and detailed messages. Client displays user-friendly errors.

**Patterns:**
- **API Errors:** Return `{ error: string | ErrorDetails }` with appropriate HTTP status (400, 401, 403, 404, 500)
- **Validation Errors:** Return 400 with Zod error flattened: `{ error: result.error.flatten() }`
- **Auth Errors:** Return 401 if user not authenticated, 403 if insufficient permissions
- **Database Errors:** Log to console, return 500 with generic message to client
- **Audit Logging:** Always log even if error occurs in mutation
- **Client Handling:** Components show toast notifications or inline error messages

## Cross-Cutting Concerns

**Logging:**
- Console logging for development/debugging
- `auditLogger.log()` for all mutations (what changed, who, when, why)
- Error logging captured client-side via error boundaries

**Validation:**
- Zod schemas in API routes for input validation
- Database constraints (unique, not null, check constraints)
- RLS policies enforce data access at database level

**Authentication:**
- Supabase Auth handles login/logout/session
- Middleware refreshes tokens
- API routes check `getUser()` before proceeding
- Persona system applied after auth check

**Authorization:**
- RLS in database for data access control
- API routes check user role/permissions before mutation
- Frontend UI shows/hides features based on persona
- `/versotech_main/*` routes require auth; `/api/*` routes enforce per-endpoint

**Transaction Management:**
- Supabase transactions used for multi-step operations (deal closing, subscription activation)
- Audit logs created inside transactions to ensure atomicity

---

*Architecture analysis: 2026-01-23*
