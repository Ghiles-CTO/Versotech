# ADR-005: Use Next.js App Router Architecture

## Status

Accepted

## Date

2024-01-20

## Context

Building the VERSO Holdings platform required choosing a frontend framework that could:

1. **Support server-side rendering (SSR)** for initial page loads and SEO
2. **Enable rich client-side interactivity** for dashboards and forms
3. **Handle API routes** for backend functionality
4. **Scale with application complexity** as features grow
5. **Integrate well with Supabase** and TypeScript
6. **Support modern React patterns** (Server Components, Suspense)

At the time of decision (early 2024), Next.js 14+ with App Router was the latest stable version with production-ready Server Components support.

## Decision

We chose **Next.js 15 with App Router** as our frontend framework, specifically:

- **App Router** (not Pages Router) for modern React Server Components
- **Route Groups** for organizing investor and staff portals
- **Server Components** for data fetching and initial render
- **Client Components** for interactive elements
- **API Routes** for backend endpoints
- **Middleware** for authentication and routing

### Key Patterns

```
src/app/
├── layout.tsx              # Root layout (providers, metadata)
├── (public)/              # Public routes (no auth)
│   ├── versoholdings/login/
│   └── versotech/login/
├── (investor)/            # Investor routes (auth required)
│   └── versoholdings/
│       ├── layout.tsx     # Investor layout
│       ├── dashboard/page.tsx
│       └── ...
├── (staff)/               # Staff routes (auth required)
│   └── versotech/staff/
│       ├── layout.tsx     # Staff layout
│       └── ...
└── api/                   # API routes
    ├── auth/
    ├── deals/
    └── ...
```

## Consequences

### Positive

- **Server Components**: Reduced client-side JavaScript; faster initial loads
- **Streaming**: Progressive page rendering with Suspense
- **Route Groups**: Clean organization without URL impact
- **Colocation**: Page, layout, loading, error states in same directory
- **Middleware**: Request interception for auth and routing
- **Built-in API Routes**: No separate backend needed for most operations
- **TypeScript First**: Excellent TypeScript support throughout
- **Vercel Optimization**: Seamless deployment with Vercel platform

### Negative

- **Learning Curve**: Team needed to learn new Server Component patterns
- **Hydration Complexity**: Client/Server component boundary can be confusing
- **Limited Component Libraries**: Some libraries don't support Server Components
- **Build Time**: Larger builds with more routes
- **Debugging**: Server Component errors can be harder to trace

### Neutral

- **Ecosystem Maturity**: App Router relatively new, some edge cases
- **Migration**: Cannot easily switch to other frameworks

## Alternatives Considered

### Alternative 1: Next.js Pages Router

Use the traditional Next.js Pages Router pattern.

```
pages/
├── versoholdings/
│   ├── dashboard.tsx
│   └── ...
├── versotech/staff/
│   └── ...
└── api/
```

**Rejected because**:
- No Server Components support
- Larger client-side bundles
- Less modern React patterns
- App Router is the future direction

### Alternative 2: Remix

Use Remix for full-stack React with nested routing.

**Rejected because**:
- Smaller ecosystem and community
- Less mature than Next.js
- Fewer hosting options
- Team more familiar with Next.js

### Alternative 3: Separate SPA + API

Build a separate React SPA with a standalone API (Express/Fastify).

**Rejected because**:
- Two applications to maintain
- No SSR benefits
- More complex deployment
- Duplicated TypeScript types

### Alternative 4: Astro + React Islands

Use Astro for static pages with React components for interactivity.

**Rejected because**:
- Most pages require authentication (not static)
- Complex dashboard UIs need full React
- Less mature for application development
- Different mental model than React

## Implementation Patterns

### Server Component (Default)

```tsx
// app/versoholdings/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: portfolio } = await supabase
    .from('positions')
    .select('*');

  return <Dashboard portfolio={portfolio} />;
}
```

### Client Component

```tsx
// components/dashboard/portfolio-chart.tsx
'use client';

import { useState } from 'react';
import { ResponsiveContainer, LineChart } from 'recharts';

export function PortfolioChart({ data }: { data: Position[] }) {
  const [timeRange, setTimeRange] = useState('1Y');

  return (
    <div>
      <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
        <option value="1M">1 Month</option>
        <option value="1Y">1 Year</option>
      </select>
      <ResponsiveContainer>
        <LineChart data={data} />
      </ResponsiveContainer>
    </div>
  );
}
```

### Loading States

```tsx
// app/versoholdings/dashboard/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
```

### Error Handling

```tsx
// app/versoholdings/dashboard/error.tsx
'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="text-center">
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### API Routes

```tsx
// app/api/deals/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('status', 'open');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

## Performance Considerations

### Optimizations Applied

1. **Parallel Data Fetching**: Use `Promise.all` for independent queries
2. **Streaming**: Suspense boundaries for progressive loading
3. **Route Segments**: Dynamic segments only where needed
4. **Image Optimization**: Next.js Image component
5. **Font Optimization**: Next.js Font module

### Monitoring

- Vercel Analytics for Core Web Vitals
- Sentry for error tracking
- Custom performance marks for key interactions

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Vercel Best Practices](https://vercel.com/docs/best-practices)

## Notes

- Currently on Next.js 15.0.7
- Consider upgrading to 15.1+ for improved streaming
- Monitor React 19 features for future adoption
