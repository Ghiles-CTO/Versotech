# Coding Conventions

**Analysis Date:** 2026-01-23

## Naming Patterns

**Files:**
- Components: PascalCase with `.tsx` extension (e.g., `InterestStatusCard.tsx`, `DealDetailClient.tsx`)
- Client components: Append `Client` suffix to filename (e.g., `reconciliation-page-client.tsx`, `staff-dashboard.tsx`)
- Type files: lowercase with hyphens, `.types.ts` or domain suffix (e.g., `document-viewer.types.ts`, `subscription-status.ts`)
- API routes: lowercase with hyphens in paths, `route.ts` filename (e.g., `/api/dashboard-preferences/route.ts`)
- Utility/library files: lowercase with hyphens (e.g., `deal-close-handler.ts`, `calculations.ts`)
- Test files: match source file name with `.test.ts` or `.spec.tsx` suffix (e.g., `calculations.test.ts`, `interest-status-card.test.tsx`)

**Functions:**
- camelCase for all function names: `calculateSubscriptionFee()`, `createClient()`, `validateInput()`
- Exported utility functions: descriptive camelCase (e.g., `bpsToPercent()`, `calculateManagementFeePeriod()`)
- Async functions: camelCase with `async` keyword (e.g., `async function fetchDashboardData()`)
- Handler/callback functions: suffix with handler intent (e.g., `onExpressInterest()`, `handleSubmit()`)

**Variables:**
- camelCase for all variables and constants: `investmentAmount`, `rateBps`, `canSubscribe`
- Database fields in Supabase queries: snake_case only (e.g., `interest_confirmed_at`, `cost_basis`, `funded_amount`)
- React props interfaces: PascalCase + `Props` suffix (e.g., `InterestStatusCardProps`, `FeeModelViewProps`)
- Constants: UPPER_SNAKE_CASE for true constants (rare in this codebase)
- Metadata objects: camelCase (e.g., `stageMetadata`, `mockDashboardData`)

**Types:**
- Interfaces: PascalCase, describe objects (e.g., `FeeCalculationInput`, `PerformanceFeeTier`, `InterestStatusCardProps`)
- Type unions: PascalCase, domain-specific (e.g., `PersonaType = 'investor' | 'arranger' | 'partner'`)
- Record types: full camelCase (e.g., `Record<number, StageInfo>`)

## Code Style

**Formatting:**
- ESLint: Yes, enforced via `eslint.config.mjs`
- Prettier: Not configured (ESLint handles style)
- Indentation: 2 spaces (standard Next.js/TypeScript)
- Line length: No hard limit enforced, keep reasonable (~100-120 characters)
- Semicolons: Required (TypeScript default)
- Trailing commas: Yes, for multi-line objects/arrays

**Linting:**
- Tool: ESLint v9 with Next.js, TypeScript, React, and React Hooks plugins
- Config: `eslint.config.mjs` (flat config format)
- Key disabled rules (permissive):
  - `@typescript-eslint/no-explicit-any`: OFF (any allowed)
  - `@typescript-eslint/no-unused-vars`: OFF
  - `react/no-unescaped-entities`: OFF
  - `no-unused-vars`: OFF
- Key active rules:
  - `react-hooks/rules-of-hooks`: ERROR (enforced)
  - `react-hooks/exhaustive-deps`: WARN
  - `@next/next/no-html-link-for-pages`: ERROR
  - `@next/next/no-sync-scripts`: ERROR

**TypeScript:**
- Version: 5
- Target: ES2017
- Strict mode: Enabled
- JSX: react-jsx (React 19 compatible)
- Module resolution: bundler
- Path alias: `@/*` → `./src/*`

## Import Organization

**Order:**
1. React/Next.js imports: `import { useEffect } from 'react'`, `import { NextResponse } from 'next/server'`
2. External library imports: `import { describe, it, expect } from 'vitest'`, `import { cn } from 'class-variance-authority'`
3. Absolute imports (alias): `import { createClient } from '@/lib/supabase/server'`
4. Types from same alias: `import { FeeCalculationInput } from '@/lib/fees/calculations'`
5. Components from same alias: `import { Card } from '@/components/ui/card'`
6. Relative imports (if needed): `import { render, screen } from '@testing-library/react'`

**Path Aliases:**
- `@/*` maps to `src/*` (configured in tsconfig.json)
- Always use alias paths for imports within src, never relative paths (except within test/fixture files)

**Example from codebase:**
```typescript
import { describe, it, expect } from 'vitest'
import {
  bpsToPercent,
  percentToBps,
  calculateSubscriptionFee,
} from '@/lib/fees/calculations'
```

## Error Handling

**Patterns:**
- API routes: Return `NextResponse.json()` with explicit error status codes
  - 401 for unauthorized: `{ error: 'Unauthorized' }` with status 401
  - 400 for bad request: `{ error: result.error.flatten() }` with status 400
  - 500 for server error: `{ error: 'Internal server error', details: error.message }` with status 500
- Database operations: Check Supabase error codes explicitly
  - `prefError.code === 'PGRST116'` means "not found" - return defaults don't throw
  - Other errors: return error object with `success: false, error: errorMessage`
- Try-catch blocks: Wrap async database/API calls, log errors with context
- No unhandled promise rejections: Always catch or handle

**Example from codebase:**
```typescript
try {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... more logic
} catch (error: any) {
  console.error('Error fetching preferences:', error)
  return NextResponse.json(
    { error: 'Internal server error', details: error.message },
    { status: 500 }
  )
}
```

## Logging

**Framework:** `console` (no external logging service)

**Patterns:**
- `console.log()`: Informational messages, prefixed with context bracket (e.g., `'[middleware] Auth code/error detected'`)
- `console.warn()`: Non-fatal issues or retries (e.g., `'[middleware] Token refresh failed after retries'`)
- `console.error()`: Exceptions and critical failures (e.g., `'Error fetching preferences:'`)
- Always include context/label in brackets at start of message
- Include relevant data in log call: `console.log('[context] message', { data })`
- Avoid logging sensitive data (passwords, tokens, full objects with secrets)

**Example:**
```typescript
console.log('[FEE EVENTS] Processing subscription:', { subscriptionId: sub.id })
console.warn('[FEE EVENTS] Error checking existing fee events:', checkError.message)
console.error('Error creating fee events:', error)
```

## Comments

**When to Comment:**
- Complex algorithms with formulas: Always document calculation logic with formula
- Non-obvious business rules: Explain why, not what the code does
- Database-specific behaviors: Document column meanings or RLS implications
- Workarounds for quirks: Explain the gotcha and solution
- Public function/interface documentation: Use JSDoc

**JSDoc/TSDoc:**
- Required for all exported functions and public APIs
- Format: `/** description */` with `@param` and `@returns` tags
- Include parameter descriptions and type hints

**Example from codebase:**
```typescript
/**
 * Calculate subscription fee
 * Formula: investment_amount × subscription_fee_percent
 * @param input - Fee calculation input
 * @returns Calculated subscription fee
 */
export function calculateSubscriptionFee(input: FeeCalculationInput): number {
```

**Algorithm Comments:**
```typescript
// Formula: profit_above_hurdle × carry_rate
// contributed_capital = 100,000
// exit_proceeds = 150,000
// profit = 50,000
// hurdle_return = 100,000 × 0.08 × 2 = 16,000
// profit_above_hurdle = 50,000 - 16,000 = 34,000
// performance_fee = 34,000 × 0.20 = 6,800
```

## Function Design

**Size:** Keep under 50 lines where possible. Break complex operations into helpers.

**Parameters:**
- Prefer interface/object parameters over 3+ individual parameters
- Use optional chaining for optional fields: `input.flatAmount?`
- Define interfaces for function inputs: `FeeCalculationInput`, `ManagementFeePeriodInput`

**Return Values:**
- Explicit return types on all functions (TypeScript enforces)
- For operations that fail: Return object with `success`, `data`, and `error` fields
  - Success case: `{ success: true, data: [...] }`
  - Failure case: `{ success: false, error: 'message' }`
- For calculations: Return number directly, handle null/0 as falsy
- For queries: Use Supabase `.single()` for exactly one, `.maybeSingle()` for optional one

**Example:**
```typescript
export async function calculateFeeEvents(subscriptionId: string): Promise<{
  success: boolean
  data?: FeeEvent[]
  error?: string
}> {
  try {
    // implementation
    return { success: true, data: events }
  } catch (error) {
    return { success: false, error: 'message' }
  }
}
```

## Module Design

**Exports:**
- Named exports (avoid default exports): `export function`, `export interface`, `export const`
- Barrel files: Use `src/lib/supabase/index.ts` pattern to export grouped APIs
- Keep exports focused per file - don't export everything

**Example:**
```typescript
// src/lib/fees/calculations.ts
export interface FeeCalculationInput { ... }
export function calculateSubscriptionFee(input: FeeCalculationInput): number { ... }
export function bpsToPercent(bps: number): number { ... }
```

**Barrel Files:**
- Location: `src/lib/[domain]/index.ts`
- Purpose: Export public APIs only
- Used sparingly - most files imported directly

## Zod Validation

**Usage:** React Hook Form + Zod for all form inputs

**Pattern:**
```typescript
const schema = z.object({
  investmentAmount: z.number().positive(),
  rateBps: z.number().optional(),
})

const result = schema.safeParse(await request.json())
if (!result.success) {
  return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
}
```

---

*Convention analysis: 2026-01-23*
