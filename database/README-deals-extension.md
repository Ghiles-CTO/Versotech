# Deal Extension Database Migration

This directory contains the database migration files for implementing the deal-scoped features as specified in `changes.md`.

## Migration Order

Run these files in the following order on your Supabase database:

1. **schema.sql** (base schema - already exists)
2. **rls-policies.sql** (base RLS policies - already exists)
3. **deals-extension-schema.sql** (new tables for deals, inventory, fees)
4. **existing-table-alterations.sql** (add deal_id columns to existing tables)
5. **deals-extension-rls.sql** (RLS policies for new tables and deal-scoped access)
6. **deals-extension-functions.sql** (server-side functions for business logic)

## Quick Migration

For a complete migration, you can run:

```sql
\i apply-deals-extension.sql
```

This master script will run all the individual files in the correct order.

## New Features Enabled

After running this migration, the following new features will be available:

### 1. Deal-Scoped Collaboration
- **deals** table for organizing opportunities
- **deal_memberships** for role-based access (investor, lawyer, banker, etc.)
- **invite_links** for secure deal invitations

### 2. Inventory Management
- **share_lots** for tracking available units with cost basis
- **reservations** with TTL for first-come-first-served allocation
- **allocations** for final confirmed positions
- Concurrency-safe inventory functions prevent overselling

### 3. Fee Management
- **fee_plans** and **fee_components** for configurable fee structures
- **investor_terms** for per-investor fee plan selection
- **fee_events** and **invoices** for accurate fee accounting
- **payments** and **reconciliations** for payment tracking

### 4. Document Automation
- **term_sheets** for investor-specific pricing
- **doc_templates** and **doc_packages** for automated document generation
- **esign_envelopes** for e-signature workflow tracking

### 5. Introducer Attribution
- **introducers** and **introductions** for referral tracking
- **introducer_commissions** for commission calculations

## Key Functions

### Inventory Management
- `fn_reserve_inventory()` - Atomic inventory reservation with concurrency control
- `fn_expire_reservations()` - Cleanup expired reservations (run via cron)
- `fn_finalize_allocation()` - Convert approved reservation to final allocation

### Fee Calculations
- `fn_compute_fee_events()` - Calculate accrued fees based on investor terms
- `fn_invoice_fees()` - Generate invoices from fee events

### Utilities
- `fn_deal_inventory_summary()` - Get inventory status for a deal

## Security

All tables have Row-Level Security (RLS) enabled with policies that ensure:
- Investors only see data for deals they're members of
- Staff can see all data based on their role
- Deal participants (lawyers, bankers) can access deal-specific information
- Sensitive financial data is properly isolated

## Testing

After migration, verify the setup with:

```sql
-- Check tables were created
SELECT count(*) FROM deals;

-- Test inventory function
SELECT fn_deal_inventory_summary('00000000-0000-0000-0000-000000000000');

-- Verify RLS is working
SELECT * FROM deals; -- Should return based on your user's deal memberships
```
