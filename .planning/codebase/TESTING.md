# Testing Patterns

**Analysis Date:** 2026-01-23

## Test Framework

**Runner:**
- Vitest v4.0.16 - Fast unit testing framework for TypeScript/JavaScript
- Config: `vitest.config.ts`
- Environment: happy-dom (lightweight DOM implementation for faster tests)

**Assertion Library:**
- Vitest built-in assertions (`expect()`)
- `@testing-library/jest-dom` - Custom matchers for DOM elements

**Run Commands:**
```bash
npm run dev              # Development server (note: tests not in npm scripts)
vitest                   # Run all tests in watch mode
vitest run              # Run tests once
vitest run --coverage   # Generate coverage report
```

## Test File Organization

**Location:**
- Co-located in `src/__tests__/` directory (separate from source)
- Mirrors source directory structure within `__tests__/`
- Example: API route `/src/app/api/deals/[id]/dispatch/route.ts` → test at `src/__tests__/api/admin/users.test.ts`

**Naming:**
- Unit tests: `[source-name].test.ts`
- Component tests: `[component-name].test.tsx`
- Example: `calculations.test.ts`, `interest-status-card.test.tsx`

**Structure:**
```
src/__tests__/
├── setup.ts                        # Global test setup
├── mocks/
│   ├── server.ts                  # MSW server
│   └── handlers.ts                # MSW request handlers
├── lib/
│   └── fees/
│       └── calculations.test.ts
├── components/
│   ├── deals/
│   │   ├── interest-status-card.test.tsx
│   │   └── investor-deals-list-client.test.tsx
│   ├── dashboard/
│   │   └── kpi-card.test.tsx
│   └── ...
└── app/
    └── admin/
        └── users.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InterestStatusCard } from '../../../components/deals/interest-status-card'

describe('InterestStatusCard', () => {
  const baseProps = {
    currentStage: 0,
    membership: null,
    subscription: null,
    canExpressInterest: true,
    // ... other props
  }

  it('shows tracking-only notice when isTrackingOnly is true', () => {
    render(
      <InterestStatusCard
        {...baseProps}
        isTrackingOnly={true}
      />
    )
    expect(screen.getByText('Tracking Only Access')).toBeTruthy()
  })

  it('renders only subscribe action when express interest unavailable', () => {
    render(
      <InterestStatusCard
        {...baseProps}
        canExpressInterest={false}
      />
    )
    expect(screen.getByText('Subscribe to Investment')).toBeTruthy()
  })
})
```

**Patterns:**
- One `describe()` per module/component
- Nested `describe()` for logical grouping (e.g., one per function)
- `it()` for individual test cases - descriptive test names
- `baseProps` object for reusable props in component tests
- Props overrides: Use spread and destructuring to modify specific props

## Setup and Teardown

**Global Setup:** `src/__tests__/setup.ts`
- Runs before all tests
- Sets up MSW (Mock Service Worker) server with `beforeAll()`, `afterEach()`, `afterAll()`
- Polyfills browser APIs (ResizeObserver, IntersectionObserver, matchMedia, localStorage, sessionStorage, etc.)
- Mocks `window.performance` for browser compatibility

**Per-Test Cleanup:**
- `@testing-library/react` `cleanup()` called in `afterEach()` (automatic in Vitest v4)
- MSW handlers reset after each test: `server.resetHandlers()`
- Console error suppression for React 18 warnings

**Example from codebase:**
```typescript
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

afterAll(() => server.close())

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
```

## Mocking

**Framework:** MSW (Mock Service Worker) v2.12.7

**HTTP Mocking:**
```typescript
import { http, HttpResponse } from 'msw'

// src/__tests__/mocks/handlers.ts
export const handlers = [
  http.get('/api/dashboard-preferences', ({ request }) => {
    return HttpResponse.json({
      preferences: {
        layout_config: {},
        widget_order: [],
      }
    })
  }),
  http.post('/api/fees/calculate', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ fee: calculateFee(body) })
  }),
]

// src/__tests__/mocks/server.ts
export const server = setupServer(...handlers)
```

**Mock Data Objects:**
```typescript
export const mockDashboardData = {
  kpis: {
    currentNAV: 1500000,
    totalContributed: 1200000,
  },
  vehicles: [
    {
      id: 'vehicle-1',
      name: 'VERSO FUND',
      type: 'fund',
    },
  ],
}

export const mockDeals = [
  {
    id: 'deal-1',
    name: 'VERSO Secondary Opportunity I',
    status: 'open',
  },
]
```

**Vitest Mocking:**
```typescript
import { vi } from 'vitest'

// Mock function
const mockCallback = vi.fn()

// Override mock behavior
mockCallback.mockReturnValue('some-value')
mockCallback.mockResolvedValue({ data: [] })
mockCallback.mockRejectedValue(new Error('failed'))

// Verify calls
expect(mockCallback).toHaveBeenCalled()
expect(mockCallback).toHaveBeenCalledWith(arg1, arg2)
```

**What to Mock:**
- HTTP requests: Use MSW handlers
- Callbacks/event handlers: Use `vi.fn()`
- Complex side effects: Mock with `vi.mock()`
- Window/DOM APIs: Use polyfills in setup.ts

**What NOT to Mock:**
- Pure utility functions: Test them directly (e.g., `calculateSubscriptionFee()`)
- React components: Render them and test behavior
- TypeScript types/interfaces: They're compile-time only
- Constants/fixtures: Use real values

## Fixtures and Factories

**Test Data:**
```typescript
// src/__tests__/mocks/handlers.ts
export const mockPerformanceData = Array.from({ length: 12 }, (_, i) => ({
  period: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
  date: new Date(2024, i, 1).toISOString().split('T')[0],
  nav: 1000000 + (i * 50000) + (Math.random() * 100000),
  contributions: Math.min(1000000, 100000 * i),
  distributions: i > 6 ? 50000 * (i - 6) : 0,
}))
```

**Location:**
- `src/__tests__/mocks/handlers.ts` - HTTP handlers and mock data objects
- Component-specific fixtures: Inline with test using `baseProps` pattern
- Database fixtures: Use mock data objects that match Supabase schema

**Usage Pattern:**
```typescript
const baseProps = {
  currentStage: 0,
  membership: null,
  subscription: null,
  // ... default values
}

it('test case', () => {
  render(<Component {...baseProps} isTrackingOnly={true} />)
  // ...
})
```

## Coverage

**Requirements:** Not enforced (no coverage thresholds set)

**View Coverage:**
```bash
vitest run --coverage
```

**Coverage Tools:** Vitest can generate reports with additional config if needed

**Current Status:**
- Some unit tests for calculations: `src/__tests__/lib/fees/calculations.test.ts` (comprehensive)
- Component tests for key UI: `src/__tests__/components/deals/`, `src/__tests__/components/dashboard/`
- API route tests: Limited (e.g., `src/__tests__/api/admin/users.test.ts`)
- No enforced coverage gates, so coverage varies by area

## Test Types

**Unit Tests:**
- Scope: Pure functions (calculations, utilities, helpers)
- Approach: Test inputs and outputs in isolation
- Example: `calculateSubscriptionFee()` with various input combinations
- Location: `src/__tests__/lib/` for library functions

**Component Tests:**
- Scope: React component rendering and behavior (not E2E)
- Approach: `render()` component with props, interact with `screen` queries, verify UI
- Example: Click button, check if callback fires
- Location: `src/__tests__/components/` and `src/__tests__/app/`
- Use `vi.fn()` for mock callbacks

**Integration Tests:**
- Scope: Component interactions, form submission, API integration
- Approach: MSW mocks HTTP, render component, test full user flow
- Example: Fill form, submit, verify API called and response displayed
- Not fully separate - handled via component tests with MSW

**E2E Tests:**
- Framework: Not found in current codebase
- Status: Manual testing via `/agent-browser` skill
- Could use: Playwright (mcp__executeautomation-playwright-server), available but not configured

## Common Patterns

**Async Testing:**
```typescript
it('calculates management fee for quarterly period', async () => {
  const result = await calculateManagementFeePeriod({
    baseAmount: 100000,
    rateBps: 200,
    periodStartDate: new Date('2026-01-01'),
    periodEndDate: new Date('2026-03-31'),
  })
  expect(result).toBeCloseTo(493.15, 2)
})

// Or with promises:
it('processes subscription', () => {
  return calculateFeeEvents('sub-123').then((result) => {
    expect(result.success).toBe(true)
  })
})
```

**Error Testing:**
```typescript
it('returns error when subscription not found', () => {
  const result = calculateFeeEvents('invalid-id')
  expect(result).toEqual({
    success: false,
    error: 'Subscription not found'
  })
})

// With async errors:
it('handles API failure gracefully', async () => {
  server.use(
    http.get('/api/deals', () => {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 })
    })
  )

  // Test component handles error
})
```

**DOM Queries:**
```typescript
import { render, screen } from '@testing-library/react'

// Text-based queries (preferred)
expect(screen.getByText('Tracking Only Access')).toBeTruthy()

// Null checks for absence
expect(screen.queryByText('Subscribe')).toBeNull()

// Data test IDs (if needed)
const button = screen.getByRole('button', { name: /subscribe/i })
expect(button).toBeDisabled()
```

**Props Testing Pattern:**
```typescript
const baseProps = {
  currentStage: 0,
  membership: null,
  subscription: null,
  canExpressInterest: true,
  onExpressInterest: vi.fn(),
}

it('calls callback when express interest clicked', () => {
  render(<InterestStatusCard {...baseProps} />)
  const btn = screen.getByText('Express Interest')
  btn.click()
  expect(baseProps.onExpressInterest).toHaveBeenCalled()
})

it('disables button when not allowed', () => {
  render(<InterestStatusCard {...baseProps} canExpressInterest={false} />)
  const btn = screen.queryByText('Express Interest')
  expect(btn).toBeNull()
})
```

## Testing Best Practices

**DO:**
- Write descriptive test names that explain what is being tested
- Test behavior, not implementation details
- Use semantic queries: `getByRole()`, `getByText()`, `getByLabelText()`
- Keep tests focused - one assertion focus per test case
- Use `baseProps` pattern for reusable test setup
- Mock HTTP requests with MSW, not individual functions
- Test edge cases: empty inputs, null values, errors

**DON'T:**
- Test implementation details (internal state, function calls)
- Use `getByTestId()` unless semantic queries won't work
- Test third-party libraries (Radix UI, React itself)
- Create global state in tests - keep tests isolated
- Test CSS styles - leave that to visual regression testing
- Mock things that aren't dependencies (pure functions)

## Running Tests in CI/CD

**Not Configured:** No CI/CD pipeline found in codebase

**When Added, Use:**
```bash
vitest run --coverage --reporter=verbose
```

---

*Testing analysis: 2026-01-23*
