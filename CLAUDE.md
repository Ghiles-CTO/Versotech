# CLAUDE.md

Investment banking OS for VERSO Holdings. Manages deal flow, investor subscriptions, fee structures, and multi-party commissions.

## MCP Configuration

| MCP | Environment | Rule |
|-----|-------------|------|
| `mcp__supabase_old__*` | Testing/Dev | **DEFAULT** - Use unless told otherwise |
| `mcp__supabase__*` | Production | **ONLY** when user explicitly says "production" or "prod" |

## Tech Stack

Next.js 15 · TypeScript · Tailwind · shadcn/ui · Supabase (Postgres + RLS) · React Hook Form + Zod

## Domain Terms

| Term | Definition |
|------|------------|
| **Deal** | Investment opportunity (draft → active → closed) |
| **Vehicle** | Fund that holds deals and subscriptions |
| **Subscription** | Investor's capital commitment - the CORE model (pending → committed → funded) |
| **Position** | Investor's holdings in a vehicle (units, cost_basis, last_nav) - the core portfolio model |
| **Entity** | Organization with members (investor company, arranger firm, etc.) |
| **Persona** | User's active role: `investor`, `staff`, `arranger`, `introducer`, `partner`, `commercial_partner`, `lawyer` |
| **Fee Plan** | Commercial agreement with introducer/partner for a SPECIFIC deal (not a template) |
| **Commission** | Payment to introducer/partner: `accrued` → `invoice_submitted` → `invoiced` → `paid` |

## Folder Structure

```
src/app/
├── (main)/versotech_main/    # All active routes (59 routes)
├── (admin)/versotech_admin/  # Admin portal
├── (investor)/, (staff)/     # Legacy (301 redirects)

src/lib/
├── supabase/     # client.ts (browser singleton), server.ts, service.ts (admin-only)
├── fees/         # Fee calculations, validation, types
├── deals/        # deal-close-handler.ts (commission creation)
├── signature/    # Multi-signatory workflows
└── audit.ts      # All mutations must be logged
```

## Conventions

| What | Convention |
|------|------------|
| Routes | kebab-case (`/kyc-review`) |
| Components | PascalCase (`DealDetailClient.tsx`) |
| DB fields | snake_case |
| Queries | Always explicit columns, never `SELECT *` |

## Patterns

**API Route:**
```typescript
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = schema.safeParse(await request.json())
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 400 })

  const { data } = await supabase.from('deals').select('id, name').eq('id', result.data.deal_id).single()
  return NextResponse.json({ data })
}
```

**Supabase Queries:**
```typescript
.select('id, name')           // Always explicit columns
.single()                     // Exactly one expected
.maybeSingle()               // Might not exist
.insert([...]).select()      // Chain select after mutation
```

## UI Testing Workflow

**After ANY frontend changes, you MUST validate:**

1. `cd versotech-portal && npm run dev`
2. **Use `/agent-browser` skill** (DEFAULT)
3. Login with appropriate test credentials (see below)
4. Navigate → screenshot → test flows
5. Only use Playwright MCP (`mcp__executeautomation-playwright-server__*`) if agent-browser fails

### Test Credentials

| Email | Password | Personas |
|-------|----------|----------|
| cto@versoholdings.com | 123123 | ceo, arranger, introducer, investor |
| sales@aisynthesis.de | TempPass123! | arranger, commercial_partner, introducer, lawyer, partner |
| biz@ghiless.com | 22122003 | investor |
| py.moussaouighiles@gmail.com | TestIntro2024! | introducer, investor |
| cto@verso-operation.com | VersoPartner2024! | investor, partner |
| cm.moussaouighiles@gmail.com | CommercialPartner2024! | commercial_partner |

**Choose credentials based on the persona you need to test.**

## Useful Skills

| Skill | When to Use |
|-------|-------------|
| `/agent-browser` | **UI testing** - always after frontend changes |
| `/ultra-think [problem]` | Complex architectural decisions |
| `/frontend-design` | Building new UI components |
| `/webapp-testing` | Write Playwright E2E scripts (existing tests in `.claude/skills/webapp-testing/`) |

## Critical Don'ts

| Don't | Why |
|-------|-----|
| Use `SELECT *` | Breaks on schema changes, exposes hidden columns |
| Create multiple browser Supabase clients | Causes "Invalid Refresh Token: Already Used" (singleton exists) |
| Enable `autoRefreshToken` on client | Middleware handles refresh - dual refresh = race condition |
| Use `serviceSupabase` for user queries | Bypasses RLS = security hole |
| Create fee plans without deal_id | Fee plans are deal-specific agreements, not templates |
| Expect partial signatures to progress | Multi-signatory requires ALL signatures before proceeding |
| Modify database records (UPDATE/DELETE) without explicit user approval | You do NOT know what data is intentional. Always ask before touching live data — never assume a record is a "duplicate" or "bug-created". Same email or same linked_user_id does NOT mean same person. |
| Assume data is wrong or duplicated | Two records that look similar may be intentional. Never guess — ask the user. |
| Jump to conclusions or make assumptions about user intent | When investigating a problem, present findings and proposed actions. Wait for approval before making ANY changes — code or data. |

## Workflow Rules

1. **Plan Before Coding**: Before writing any code, describe your approach and wait for approval. Always ask clarifying questions if requirements are ambiguous—don't assume.

2. **Keep Changes Small**: If a task requires changes to more than 3 files, stop and break it into smaller tasks first. Propose the breakdown and get approval before proceeding.

3. **Anticipate Breakage**: After writing code, list what could break and suggest tests to cover edge cases. Think about error states, null values, and boundary conditions.

4. **Test-Driven Bug Fixes**: When there's a bug, start by writing a test that reproduces it, then fix it until the test passes. Never mark a bug as fixed without a failing-then-passing test.

5. **Learn From Corrections**: Every time I correct you, add a new rule to this CLAUDE.md file so the mistake never happens again. Put it in the appropriate section (Gotchas, Critical Don'ts, or create a new one if needed).

## Gotchas

1. **Supabase project ID is hardcoded** in middleware cookie names (`sb-kagzryotbbnusdcyvqei-*`). If using different project, auth breaks silently.

2. **Hash capture in auth/callback** must happen at MODULE LOAD, not in useEffect. Moving it breaks magic links.

3. **Commission basis is always `funded_amount`** regardless of fee plan complexity. Fee tiers only affect investor fees, not partner commissions.

4. **Messaging UI height is offset-sensitive**: avoid fixed `100vh` heights that ignore page headers/banners. The chat container must size to the remaining viewport so the sidebar/messages scroll independently and the composer stays visible without scrolling the main content.

5. **Do not add sidebar navigation items unless explicitly requested.** If the user wants a feature surfaced, confirm where they want it (header, sidebar, or page link) before adding nav entries.
6. **After plan approval, proceed immediately without extra confirmation.** Do not ask for a second go-ahead once the user has approved the plan.
7. **When removing UI duplication, keep a single primary action in the location the user requested.** Do not leave redundant links behind.
8. **Run `npm run build` before pushing to `dev` for frontend changes.** Fix build errors first, then push.
9. **When a user specifies a regression window, verify commits within that date range before concluding root cause.** Do not assume earlier changes are the culprit without checking the requested window.
10. **Never call `apply_patch` via `exec_command`.** Always use the `apply_patch` tool for patches to avoid tool misuse warnings.

## Commands

```bash
cd versotech-portal && npm run dev    # Dev server
npm run build                          # Production build
npm run lint                           # ESLint
```

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Versotech** (10490 symbols, 26495 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/Versotech/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/Versotech/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Versotech/clusters` | All functional areas |
| `gitnexus://repo/Versotech/processes` | All execution flows |
| `gitnexus://repo/Versotech/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## CLI

- Re-index: `npx gitnexus analyze`
- Check freshness: `npx gitnexus status`
- Generate docs: `npx gitnexus wiki`

<!-- gitnexus:end -->
