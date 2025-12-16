# ADR-003: Use Row-Level Security for Data Isolation

## Status

Accepted

## Date

2024-02-15

## Context

As a multi-tenant investment platform, VERSO Holdings must ensure strict data isolation between investors. Each investor should only be able to access:

- Their own profile and KYC information
- Their own subscriptions and positions
- Documents assigned to them
- Conversations they participate in
- Deals they have access to

The traditional approach would be to implement access control in application code, checking permissions on every query. However, this approach has known issues:

1. **Error-prone**: Easy to forget permission checks, especially in new code
2. **Scattered logic**: Authorization checks spread across many files
3. **SQL injection risk**: Complex queries might bypass application checks
4. **Direct database access**: Admin tools or scripts bypass application layer

## Decision

We implemented **Row-Level Security (RLS)** in PostgreSQL via Supabase to enforce data isolation at the database level.

### Core Pattern

```sql
-- Enable RLS on table
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;

-- Policy: Investors can only see their own data
CREATE POLICY "investors_own_data" ON investors
    FOR SELECT
    USING (
        id IN (
            SELECT investor_id
            FROM investor_users
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Staff can see all investors
CREATE POLICY "staff_view_all" ON investors
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role LIKE 'staff_%'
        )
    );
```

### Implementation Details

1. **All tables have RLS enabled**: Every table in the public schema
2. **Policies per role**: Separate policies for investors vs. staff
3. **Service role bypass**: Admin operations use service role to bypass RLS
4. **Supabase Auth integration**: `auth.uid()` function returns current user ID

## Consequences

### Positive

- **Defense in Depth**: Data protection even if application code has bugs
- **Centralized Logic**: All access rules defined in one place (database policies)
- **Query Safety**: RLS applies to all queries, including complex joins
- **Admin Protection**: Direct database access still respects policies
- **Performance**: PostgreSQL optimizes queries with RLS predicates
- **Audit Trail**: Combined with triggers, tracks who accessed what

### Negative

- **Complexity**: RLS policies can be complex to write and debug
- **Performance Overhead**: Additional predicates on every query (usually minimal)
- **Testing Difficulty**: Need to test with different user contexts
- **Migration Challenges**: Schema changes must consider RLS policies
- **Learning Curve**: Team needs to understand RLS patterns

### Neutral

- **Service Role Requirement**: Admin operations need service role client
- **Policy Updates**: Changing access patterns requires migration

## Alternatives Considered

### Alternative 1: Application-Level Access Control

Implement permission checks in every API route and query.

```typescript
async function getInvestorData(userId: string, investorId: string) {
  // Check if user has access to investor
  const hasAccess = await checkUserInvestorAccess(userId, investorId);
  if (!hasAccess) throw new ForbiddenError();

  // Fetch data
  return await db.investors.findUnique({ where: { id: investorId } });
}
```

**Rejected because**:
- Easy to forget checks in new code
- Duplicated logic across many routes
- Direct database queries bypass checks
- Higher risk of data leakage

### Alternative 2: View-Based Access Control

Create database views that filter data based on current user.

```sql
CREATE VIEW my_investors AS
SELECT * FROM investors
WHERE id IN (
    SELECT investor_id FROM investor_users
    WHERE user_id = current_setting('app.user_id')::uuid
);
```

**Rejected because**:
- Views less flexible than RLS policies
- Requires setting session variables
- Harder to handle write operations
- Less Supabase integration

### Alternative 3: Separate Databases per Tenant

Provision separate PostgreSQL schemas or databases per investor.

**Rejected because**:
- Massive operational overhead
- Connection pooling becomes complex
- Cross-tenant queries impossible
- Doesn't scale for 500+ investors

## RLS Policy Examples

### Documents Table

```sql
-- Investors: Own documents + published deal documents with access
CREATE POLICY "investor_documents" ON documents
    FOR SELECT
    USING (
        -- Own documents
        owner_investor_id IN (
            SELECT investor_id FROM investor_users WHERE user_id = auth.uid()
        )
        OR
        -- Published deal documents with active data room access
        (is_published = true AND deal_id IN (
            SELECT deal_id FROM deal_data_room_access
            WHERE investor_id IN (
                SELECT investor_id FROM investor_users WHERE user_id = auth.uid()
            )
            AND (expires_at IS NULL OR expires_at > now())
            AND revoked_at IS NULL
        ))
    );

-- Staff: All documents
CREATE POLICY "staff_documents" ON documents
    FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role LIKE 'staff_%')
    );
```

### Subscriptions Table

```sql
-- Investors: Own subscriptions only
CREATE POLICY "investor_subscriptions" ON subscriptions
    FOR SELECT
    USING (
        investor_id IN (
            SELECT investor_id FROM investor_users WHERE user_id = auth.uid()
        )
    );

-- Staff: All subscriptions
CREATE POLICY "staff_subscriptions" ON subscriptions
    FOR ALL
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role LIKE 'staff_%')
    );
```

## Monitoring and Debugging

### Check Policy Coverage

```sql
-- Find tables without RLS
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN (
    SELECT tablename
    FROM pg_policies
    WHERE schemaname = 'public'
);
```

### Debug Policy Issues

```sql
-- Test query as specific user
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM investors; -- Will apply RLS
RESET request.jwt.claim.sub;
```

## References

- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Security Model Documentation](../security/data-isolation.md)

## Notes

- Run security advisor regularly: `mcp__supabase__get_advisors({ type: 'security' })`
- New tables MUST have RLS policies before deployment
- Consider RLS performance for complex aggregation queries
