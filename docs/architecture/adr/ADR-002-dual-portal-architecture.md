# ADR-002: Implement Dual-Portal Architecture

## Status

Accepted

## Date

2024-02-01

## Context

VERSO Holdings serves two distinct user populations with different needs:

1. **Investors**: 50+ institutional and high-net-worth investors who need:
   - Portfolio visibility and performance tracking
   - Secure document access (K-1s, statements, agreements)
   - Deal browsing and commitment submission
   - Communication with relationship managers

2. **Staff**: Operations, compliance, and relationship management team who need:
   - Investor management and KYC workflows
   - Deal pipeline and allocation management
   - Fee accounting and reconciliation
   - Compliance monitoring and audit trails

The challenge was designing an architecture that:
- Provides tailored experiences for each user type
- Maintains clear security boundaries
- Shares common components and business logic
- Supports different branding requirements

## Decision

We implemented a **dual-portal architecture** within a single Next.js application using route groups:

```
src/app/
├── (public)/              # Shared public routes
│   ├── versoholdings/login/   # Investor login
│   └── versotech/login/       # Staff login
├── (investor)/            # Investor portal
│   └── versoholdings/
│       ├── dashboard/
│       ├── holdings/
│       ├── deals/
│       └── ...
├── (staff)/               # Staff portal
│   └── versotech/staff/
│       ├── dashboard/
│       ├── investors/
│       ├── deals/
│       └── ...
└── api/                   # Shared API routes
```

### Key Design Elements

1. **Route Groups**: Use Next.js route groups `(investor)` and `(staff)` to organize code without affecting URLs
2. **URL Prefix Branding**: `/versoholdings/*` for investors, `/versotech/staff/*` for staff
3. **Middleware Enforcement**: Authentication middleware validates user role and enforces portal boundaries
4. **Shared API Layer**: Single `/api/*` layer with role-based access control
5. **Shared Components**: UI components library used by both portals

## Consequences

### Positive

- **Clear Separation of Concerns**: Investor and staff code organized in distinct directories
- **Unified Codebase**: Single repository, shared dependencies, consistent patterns
- **Security by Default**: Middleware prevents cross-portal access
- **Component Reuse**: 60%+ of UI components shared between portals
- **Simplified Deployment**: One application to deploy and monitor
- **Consistent API**: Both portals use same API routes with role-based responses

### Negative

- **Larger Bundle Size**: Both portals included in build (mitigated by code splitting)
- **Testing Complexity**: Need to test both portal experiences
- **Route Confusion**: Similar routes in different portals can be confusing during development
- **Mixed Concerns**: Some API routes serve both portals with conditional logic

### Neutral

- **Documentation**: Need separate documentation for each portal's features
- **Onboarding**: New developers must understand both portals

## Alternatives Considered

### Alternative 1: Separate Applications

Build two distinct Next.js applications:
- `investor-portal/` - Standalone investor app
- `staff-portal/` - Standalone staff app

**Rejected because**:
- Duplicated shared code (API clients, types, utilities)
- Two applications to maintain, deploy, and monitor
- Inconsistent patterns across applications
- Shared component changes require two PRs

### Alternative 2: Single Portal with Role Switching

Single application where users switch between "investor view" and "staff view".

**Rejected because**:
- Confusing UX for single-role users (most investors never need staff features)
- Security risk of accidentally exposing staff features to investors
- Complex permission checking throughout UI
- Harder to maintain distinct branding

### Alternative 3: Micro-Frontends

Build separate micro-frontends for each portal, composed at runtime.

**Rejected because**:
- Overkill for team size and application complexity
- Increased infrastructure complexity
- Harder to share state and components
- Deployment coordination challenges

## Implementation Details

### Middleware Enforcement

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const user = await getUser(req);
  const path = req.nextUrl.pathname;

  // Investors can only access /versoholdings/*
  if (path.startsWith('/versoholdings/') && user?.role !== 'investor') {
    return redirect('/versotech/login');
  }

  // Staff can only access /versotech/staff/*
  if (path.startsWith('/versotech/staff/') && !user?.role?.startsWith('staff')) {
    return redirect('/versoholdings/login');
  }
}
```

### Route Structure

| Portal | URL Pattern | Users |
|--------|-------------|-------|
| Investor | `/versoholdings/*` | `investor` role |
| Staff | `/versotech/staff/*` | `staff_admin`, `staff_ops`, `staff_rm` |
| Public | `/versoholdings/login`, `/versotech/login` | Unauthenticated |

## References

- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Role-Based Access Control](../security/rbac.md)
- [UI Component Library](../components/)

## Notes

- Branding requirements may diverge further; current architecture supports this
- Consider separate builds per portal if bundle size becomes an issue
- Mobile apps (if built) would likely be separate applications per portal
