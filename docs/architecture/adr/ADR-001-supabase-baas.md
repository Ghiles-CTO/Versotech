# ADR-001: Use Supabase as Backend-as-a-Service

## Status

Accepted

## Date

2024-01-15

## Context

VERSO Holdings needed a backend infrastructure to support an investment management platform with the following requirements:

1. **PostgreSQL database** for financial data with ACID compliance
2. **User authentication** supporting email/password and potential OAuth providers
3. **File storage** for secure document management
4. **Real-time capabilities** for messaging and live updates
5. **Row-Level Security** for multi-tenant data isolation
6. **Rapid development** with a small team (2-3 developers)
7. **Cost-effective** scaling from MVP to production

The team needed to decide between:
- Building custom infrastructure
- Using a Backend-as-a-Service (BaaS) solution
- Combining multiple specialized services

## Decision

We chose **Supabase** as our Backend-as-a-Service provider, encompassing:

- **Supabase PostgreSQL**: Primary database with RLS
- **Supabase Auth**: User authentication and session management
- **Supabase Storage**: S3-compatible object storage for documents
- **Supabase Realtime**: WebSocket-based live updates

### Rationale

1. **Unified Platform**: Single vendor for DB, auth, storage, and realtime reduces integration complexity
2. **PostgreSQL Native**: Direct access to PostgreSQL features (triggers, functions, full-text search)
3. **Row-Level Security**: Built-in RLS policies enable database-level access control
4. **Open Source Core**: Reduces vendor lock-in; self-hosting option available
5. **Developer Experience**: Auto-generated TypeScript types, REST/GraphQL APIs
6. **Cost Model**: Free tier for development; predictable pricing for production

## Consequences

### Positive

- **Faster Development**: Auth, storage, and realtime out of the box
- **Reduced Ops Burden**: No infrastructure management for core services
- **Strong Security Model**: RLS policies prevent data leakage at database level
- **Real-time Ready**: WebSocket subscriptions for messaging and notifications
- **Type Safety**: Generated TypeScript types from database schema

### Negative

- **Vendor Dependency**: Core platform depends on Supabase availability
- **Limited Customization**: Some auth/storage behaviors less flexible than custom solutions
- **Learning Curve**: Team needed to learn RLS and Supabase-specific patterns
- **Connection Limits**: Requires connection pooling for serverless functions

### Neutral

- **Migration Path**: Schema can be migrated to standard PostgreSQL if needed
- **Local Development**: Supabase CLI provides local development environment

## Alternatives Considered

### Alternative 1: Custom Infrastructure (AWS/GCP)

Build custom backend using:
- AWS RDS or Cloud SQL for PostgreSQL
- Auth0 or custom auth service
- S3 for storage
- Custom WebSocket server

**Rejected because**:
- Significantly higher development time (6+ months)
- Required DevOps expertise not available on team
- Higher operational costs for small-scale deployment
- Integration complexity between services

### Alternative 2: Firebase + Cloud Functions

Use Google Firebase with Cloud Firestore and Firebase Auth.

**Rejected because**:
- Firestore's NoSQL model poor fit for relational financial data
- Limited query capabilities compared to PostgreSQL
- Weaker typing for complex data models
- Lock-in to Google ecosystem

### Alternative 3: Hasura + Separate Auth/Storage

Use Hasura for GraphQL API over PostgreSQL with Auth0 and Cloudflare R2.

**Rejected because**:
- Multiple vendors to manage
- GraphQL complexity not needed for initial MVP
- Higher cost for equivalent feature set
- Less integrated real-time solution

## References

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Initial Architecture Discussion](../discussions/2024-01-architecture-review.md)

## Notes

- Supabase project: `ipguxdssecfexudnvtia` (US region)
- Decision validated after 6 months of production use
- Consider self-hosting for EU data residency requirements if needed
