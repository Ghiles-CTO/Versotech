# Phase 2 Implementation Explanation (Unified Multi-Persona Portal)

**Scope:** Phase 2 (Auth + Portal Structure) from `PHASE2_BASE_PLAN.md` and `PHASE2_MASTER_IMPLEMENTATION_PLAN.md`

**Status:** Implemented and build-verified (see Validation section)

---

## 1. Goal of Phase 2
Phase 2 restructures the platform into a single unified portal that supports all personas under one route group, plus a CEO-only admin portal. It also establishes persona-based navigation, a unified login, and legacy route redirects.

**Target structure:**
- Main portal: `/versotech_main/*` (all business personas)
- Admin portal: `/versotech_admin/*` (CEO only)
- Unified login: `/versotech_main/login`
- Unified set-password: `/versotech_main/set-password`

---

## 2. High-Level Architecture

### 2.1 Route Groups
- **Main portal:** `src/app/(main)/versotech_main/*`
- **Admin portal:** `src/app/(admin)/versotech_admin/*`
- **Public auth:** `src/app/(public)/versotech_main/login` and `set-password`

This keeps authentication pages outside the protected layout to avoid redirect loops.

### 2.2 Persona System
- Server-side persona detection is done via `get_user_personas()` RPC.
- Client-side persona context persists the active persona and drives navigation and theming.

Key file:
- `src/contexts/persona-context.tsx`

Persona fields used:
- `persona_type` (staff, investor, arranger, introducer, partner, commercial_partner, lawyer)
- `role_in_entity` (used for CEO detection)
- `entity_id`, `entity_name`, `entity_logo_url`
- `is_primary`, `can_sign`, `can_execute_for_clients`

CEO detection is done correctly as:
```
persona_type === 'staff' && role_in_entity === 'ceo'
```

---

## 3. Authentication & Routing

### 3.1 Unified Login & Set-Password
**Location (public routes):**
- `src/app/(public)/versotech_main/login/page.tsx`
- `src/app/(public)/versotech_main/set-password/page.tsx`

Behavior:
- All personas use the same login entry point.
- The auth callback redirects to `/versotech_main/dashboard`.
- Set-password flow supports invitation/magic link flows.

### 3.2 Middleware Enforcement
**File:** `src/middleware.ts`

What it enforces:
- Authentication for all non-public routes.
- Persona-based access control for `/versotech_main/*` and `/versotech_admin/*`.
- CEO-only routes (admin + CEO features) are blocked for non-CEO users.

How it works:
- Calls `get_user_personas()` for unified/admin routes.
- Stores a small cookie `verso_personas` with persona types + `isCEO`.
- Enforces route-level restrictions (staff, investor-access, arranger, introducer, partner, commercial partner, lawyer, CEO-only).

### 3.3 Auth Redirects
- All auth redirects (middleware, auth handler, signout) now target `/versotech_main/login`.
- Legacy logins still exist but redirect to unified login via `next.config.ts`.

---

## 4. Unified Layout & UI Components

### 4.1 Unified Layout
**File:** `src/app/(main)/versotech_main/layout.tsx`

Responsibilities:
- Requires authenticated user.
- Loads personas with `get_user_personas()`.
- Redirects to `/versotech_main/login?error=no_personas` if none.
- Wraps the app in `PersonaProvider` and `UnifiedAppLayout`.

### 4.2 Admin Layout
**File:** `src/app/(admin)/versotech_admin/layout.tsx`

Responsibilities:
- Requires authenticated user.
- Enforces CEO persona (staff + role_in_entity = ceo).
- Redirects non-CEO to `/versotech_main/dashboard`.

### 4.3 Persona Sidebar
**File:** `src/components/layout/persona-sidebar.tsx`

- Builds navigation based on the active persona.
- Adds CEO extras when staff persona has `role_in_entity === 'ceo'`.
- Processes now link to `/versotech_admin/processes` and only show for CEO.

### 4.4 Persona Switcher
**File:** `src/components/layout/persona-switcher.tsx`

- Header dropdown listing all personas.
- Shows entity logos where available.
- Switches active persona via context.

### 4.5 Theme System
**Files:**
- `src/components/theme-provider.tsx`
- `src/components/layout/unified-app-layout.tsx`
- `src/components/layout/persona-sidebar.tsx`
- `src/components/layout/persona-switcher.tsx`
- `src/components/layout/notification-center.tsx`
- `src/components/layout/user-menu.tsx`

Features:
- Light, Dark, Auto (persona-based).
- Persisted in `localStorage` under `verso-theme-preference`.
- Theme is applied consistently across sidebar, switcher, notification center, and user menu.

---

## 5. Notifications

**File:** `src/components/layout/notification-center.tsx`

Sources:
- `tasks` (pending/in_progress)
- `conversation_participants + conversations` (unread messages)
- `investor_notifications` (investor persona only)

Behavior:
- Header dropdown with unread badge count.
- Items sorted by newest.

---

## 6. Admin Portal

**Routes:**
- `/versotech_admin/processes` (Process center)
- `/versotech_admin/settings` (placeholder UI)

Admin root redirects to `/versotech_admin/settings`.

---

## 7. Legacy Redirects

**File:** `next.config.ts`

- 45+ redirects from old portals to unified routes.
- Includes dynamic deep links (deal, vehicle, subscriptions, etc.).

Examples:
- `/versoholdings/deal/:id` → `/versotech_main/opportunities?deal_id=:id`
- `/versotech/staff/deals/:id` → `/versotech_main/deals?deal_id=:id`

---

## 8. Pages Created (Main Portal)

All sidebar routes now exist under `/versotech_main/*`. Most are stubs with a "Coming Soon" page until Phase 3+.

Key examples:
- `/versotech_main/dashboard`
- `/versotech_main/opportunities`
- `/versotech_main/portfolio`
- `/versotech_main/deals`
- `/versotech_main/introductions`
- `/versotech_main/partner-transactions`
- `/versotech_main/client-transactions`
- `/versotech_main/assigned-deals`

---

## 9. CEO Handling

- CEO persona is defined as `persona_type = 'staff'` and `role_in_entity = 'ceo'`.
- CEO-only routes are enforced in middleware and in the admin layout.
- Staff role checks include `ceo` in API access checks.

---

## 10. Validation

**Build:** `npm run build` passed.

Notes:
- Build warns about `RESEND_API_KEY` example value (environment config, not code).

---

## 11. Known Follow-Ups (Phase 3+)
Phase 2 sets the foundation. Remaining work belongs to later phases:
- Investor journey bar + opportunity detail merge (Phase 3)
- Inbox consolidation and grouping (Phase 4)
- CEO user management UI (Phase 5)
- Business persona portals (Phase 6)

---

## 12. Key Files (Quick Reference)

- `src/app/(main)/versotech_main/layout.tsx`
- `src/app/(admin)/versotech_admin/layout.tsx`
- `src/app/(public)/versotech_main/login/page.tsx`
- `src/app/(public)/versotech_main/set-password/page.tsx`
- `src/contexts/persona-context.tsx`
- `src/components/layout/unified-app-layout.tsx`
- `src/components/layout/persona-sidebar.tsx`
- `src/components/layout/persona-switcher.tsx`
- `src/components/layout/notification-center.tsx`
- `src/components/theme-provider.tsx`
- `src/middleware.ts`
- `next.config.ts`

