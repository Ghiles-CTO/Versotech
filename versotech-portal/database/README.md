# VERSO Database Schema Implementation

This directory contains the complete database schema implementation for transforming VERSO from a portfolio viewer to an active, deal-centric investment platform.

## 🗂️ Migration Files

| File | Description | Dependencies |
|------|-------------|--------------|
| `001_create_deals_schema.sql` | Core deals, memberships, introducers | Existing profiles, investors, vehicles |
| `002_create_inventory_schema.sql` | Inventory, reservations, allocations | Migration 001 |
| `003_create_fees_documents_schema.sql` | Fee plans, term sheets, invoices | Migrations 001-002 |
| `004_create_rls_policies.sql` | Row Level Security policies | Migrations 001-003 |
| `005_create_inventory_functions.sql` | Server-side functions | Migrations 001-004 |
| `006_sample_data.sql` | Test data (dev/staging only) | Migrations 001-005 |

## 🚀 Quick Setup

### Prerequisites
- Supabase project with existing tables: `profiles`, `investors`, `vehicles`, `documents`, `conversations`, `request_tickets`
- PostgreSQL admin access
- Backup of production data (if applying to production)

### Installation

1. **Backup existing database** (CRITICAL for production):
```bash
pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql
```

2. **Run all migrations**:
```bash
cd database
psql -f run_migrations.sql
```

3. **Verify installation**:
```sql
SELECT * FROM v_deal_summary;
SELECT fn_get_deal_inventory('deal_revolut_2025');
```

## 🏗️ Key Features Implemented

### ✅ Deal-Centric Architecture
- **Deals table** with status workflow (draft → open → allocation_pending → closed)
- **Deal memberships** for scoped access (investors, lawyers, bankers)
- **Invite links** for external participants

### ✅ No-Oversell Inventory System
- **Share lots** with atomic `units_remaining` tracking
- **Reservations** with TTL expiry (default 30 minutes)
- **`fn_reserve_inventory()`** with `FOR UPDATE SKIP LOCKED` concurrency protection
- **`fn_expire_reservations()`** for automated cleanup

### ✅ Fee Engine
- **Fee plans** (All-in 5% vs 3% + 10% carry)
- **Fee components** with flexible calculation methods
- **Fee events** accrual system
- **Invoice generation** from fee events

### ✅ Approval Workflows
- **Generic approvals table** for commitments, allocations, documents
- **SLA tracking** with breach detection
- **Priority-based processing**

### ✅ Document Automation
- **Document templates** for term sheets, subscription packs
- **Document packages** for multi-doc workflows
- **E-signature integration** ready

### ✅ Financial Operations
- **Invoice generation** with line items
- **Payment tracking**
- **Bank reconciliation** framework
- **Introducer commission** calculation

## 🔒 Security Implementation

### Row Level Security (RLS)
All tables have RLS enabled with policies for:
- **Deal-scoped access**: Users see only deals they're invited to
- **Investor isolation**: Users see only their own financial data
- **Staff privileges**: Staff can see all data for operations
- **External participants**: Lawyers/bankers see only their deal

### Key Security Functions
```sql
user_has_deal_access(deal_id) -- Check deal membership
user_linked_to_investor(investor_id) -- Check investor relationship
user_is_staff() -- Check staff privileges
```

## 🔧 Critical Server Functions

### Inventory Management
```sql
-- Reserve units with no-oversell guarantee
SELECT fn_reserve_inventory(
  'deal_id'::uuid,
  'investor_id'::uuid,
  1000, -- units
  28.50, -- price
  30 -- hold minutes
);

-- Expire reservations (cron job)
SELECT fn_expire_reservations();

-- Finalize allocation
SELECT fn_finalize_allocation('reservation_id'::uuid);
```

### Fee Calculations
```sql
-- Compute fee events
SELECT fn_compute_fee_events('deal_id'::uuid);

-- Generate invoice
SELECT fn_invoice_fees('deal_id'::uuid, 'investor_id'::uuid);
```

### Inventory Monitoring
```sql
-- Real-time inventory status
SELECT fn_get_deal_inventory('deal_id'::uuid);
```

## 📊 Sample Data Structure

The sample data includes:
- **3 deals**: Revolut Secondary, Luxembourg RE, Private Credit
- **Multiple share lots** with different costs and sources
- **Fee plans**: All-in 5%, 3% + 10% carry
- **Active reservations** and commitments
- **Pending approvals** for testing workflows

## 🔍 Testing & Verification

### Key Test Queries
```sql
-- Deal overview
SELECT * FROM v_deal_summary;

-- Active reservations
SELECT * FROM reservations WHERE status = 'pending';

-- Pending approvals
SELECT entity_type, COUNT(*) FROM approvals WHERE status = 'pending' GROUP BY entity_type;

-- Inventory utilization
SELECT
  d.name,
  (fn_get_deal_inventory(d.id))->>'utilization_percent' as utilization
FROM deals d;
```

### Concurrency Testing
```sql
-- Test no-oversell under load
SELECT fn_reserve_inventory('deal_revolut_2025', 'investor_id', 1000, 28.50);
-- Run simultaneously from multiple sessions
```

## 📈 Performance Considerations

### Indexes Added
- Deal lookups: `(status, deal_type)`, `(created_by)`
- Inventory: `(deal_id, status)`, `(expires_at)`
- Financial: `(investor_id, deal_id)`, `(status)`
- Approvals: `(sla_breach_at)`, `(priority, status)`

### Optimization Notes
- Use `fn_get_deal_inventory()` for dashboard queries
- Reservation expiry runs every 2-5 minutes via cron
- Fee calculations run monthly/quarterly based on frequency

## 🚨 Production Deployment

### Pre-Deployment Checklist
- [ ] Full database backup completed
- [ ] Migration tested on staging copy
- [ ] Feature flags configured
- [ ] Monitoring alerts set up
- [ ] Rollback plan confirmed

### Post-Deployment Verification
- [ ] All tables created successfully
- [ ] RLS policies working correctly
- [ ] Sample reservation/expiry cycle works
- [ ] API endpoints can access data
- [ ] Real-time updates functioning

## 🔄 Maintenance

### Regular Tasks
- **Daily**: Monitor SLA breaches in approvals
- **Weekly**: Review expired reservations cleanup
- **Monthly**: Run fee calculations and invoice generation
- **Quarterly**: Audit trail review and cleanup

### Monitoring Queries
```sql
-- SLA breaches
SELECT COUNT(*) FROM approvals WHERE status = 'pending' AND sla_breach_at < now();

-- Inventory health
SELECT deal_id, COUNT(*) FROM share_lots WHERE units_remaining < 0 GROUP BY deal_id;

-- Fee accrual status
SELECT status, COUNT(*) FROM fee_events GROUP BY status;
```

This schema provides the foundation for the deal-centric platform transformation with all critical features implemented and ready for application development.