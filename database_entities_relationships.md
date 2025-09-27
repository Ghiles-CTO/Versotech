# Versotech Database: Entity Relationships & Business Logic

## Overview
Versotech is a private equity/venture capital investment management platform. This document explains the core entities and their relationships within the system.

## Core Entities & Relationships

### 1. Users (`profiles` table)
**Nature**: Authentication and authorization layer
- **Purpose**: System access accounts for all platform users
- **Key Fields**:
  - `id` (UUID) - Primary key, links to Supabase Auth
  - `role` - User role (investor, staff_admin, staff_ops, staff_rm)
  - `display_name` - Human-readable name
  - `email` - Contact information
  - `title` - Professional title
  - `created_at` - Account creation timestamp

**Business Logic**: Every person using the platform has a user account. The role determines permissions and access levels.

---

### 2. Investors (`investors` table)
**Nature**: Legal investment entities
- **Purpose**: Represent institutional or individual investors
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `legal_name` - Official legal name
  - `type` - Investor classification
  - `kyc_status` - Know Your Customer compliance status
  - `country` - Jurisdiction
  - `created_at` - Entity creation timestamp

**Business Logic**: Investors are the entities that provide capital. They may have multiple user accounts associated with them.

---

### 3. Investor Users (`investor_users` table)
**Nature**: Junction table linking users to investors
- **Purpose**: Associates user accounts with investor entities
- **Key Fields**:
  - `investor_id` (UUID) - References investors.id
  - `user_id` (UUID) - References profiles.id

**Business Logic**: Many-to-many relationship allowing multiple users to represent one investor, and users to represent multiple investors.

---

### 4. Vehicles (`vehicles` table)
**Nature**: Investment funds or special purpose vehicles (SPVs)
- **Purpose**: Pool and manage investor capital for investments
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `name` - Vehicle name
  - `domicile` - Legal jurisdiction
  - `currency` - Base currency (default USD)
  - `type` - Vehicle type (fund, spv, securitization, note, other)
  - `created_at` - Vehicle creation timestamp

**Business Logic**: Vehicles are the investment structures. Funds invest in multiple deals, SPVs are often single-purpose vehicles for specific investments.

---

### 5. Deals (`deals` table)
**Nature**: Individual investment opportunities
- **Purpose**: Represent specific investment targets (companies, assets, etc.)
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `vehicle_id` - Parent vehicle managing this deal
  - `name` - Deal name
  - `deal_type` - Type (equity_secondary, equity_primary, credit_trade_finance, other)
  - `status` - Workflow status (draft, open, allocation_pending, closed, cancelled)
  - `currency` - Deal currency (default USD)
  - `open_at`/`close_at` - Deal timeline
  - `offer_unit_price` - Indicative pricing
  - `terms_schema` - Structured deal terms (JSON)
  - `created_by` - User who created the deal

**Business Logic**: Deals are the actual investment opportunities. Multiple deals can exist under one vehicle, representing a portfolio strategy.

---

### 6. Deal Memberships (`deal_memberships` table)
**Nature**: Access control and participation tracking
- **Purpose**: Controls who can access deal information and their roles
- **Key Fields**:
  - `deal_id` - References deals.id
  - `user_id` - References profiles.id
  - `investor_id` - References investors.id (nullable)
  - `role` - Membership type (investor, co_investor, spouse, advisor, lawyer, banker, introducer, viewer, verso_staff)
  - `invited_by` - User who granted access vvvvvvvvvvvvvvvvv 
  - `accepted_at` - When membership was accepted

**Business Logic**: Multi-role access control. Investors participate through their user accounts, staff have specialized roles, and external parties (lawyers, bankers) can be granted access.

---

### 7. Holdings/Positions (`positions` table)
**Nature**: Current investment holdings
- **Purpose**: Tracks actual ownership positions post-investment
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `investor_id` - Which investor holds this position
  - `vehicle_id` - Which vehicle/fund holds this position
  - `units` - Number of units held
  - `cost_basis` - Total investment amount
  - `last_nav` - Last known valuation
  - `as_of_date` - Valuation date

**Business Logic**: Positions represent realized investments. They connect investors → vehicles → specific holdings with valuation tracking.

---

### 8. Subscriptions (`subscriptions` table)
**Nature**: Capital commitments to vehicles
- **Purpose**: Tracks investor commitments to investment vehicles
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `investor_id` - Committing investor
  - `vehicle_id` - Target vehicle
  - `commitment` - Committed capital amount
  - `currency` - Commitment currency
  - `status` - Commitment status (pending, active, etc.)
  - `signed_doc_id` - Reference to signed subscription document

**Business Logic**: Subscriptions represent the capital investors have committed to vehicles, separate from actual deployed capital.

---

## Key Relationship Flows

### User → Investor Relationship
```
User Account (profiles)
    ↓ (investor_users)
Investor Entity (investors)
    ↓ (multiple relationships)
Various Investment Activities
```

**Logic**: Users represent people, Investors represent legal entities. One investor can have multiple user accounts (portfolio managers, analysts), and users can represent multiple investors.

---

### Investment Hierarchy
```
Vehicles (vehicles)
    ↓ owns/manages
Deals (deals)
    ↓ involve
Deal Memberships (deal_memberships)
    ↓ connect
Users & Investors (profiles + investors)
```

**Logic**: Vehicles create deals, deals involve various stakeholders through memberships.

---

### Capital Flow Chain
```
Investor Commitment → Vehicle → Deal Allocation → Position

1. subscriptions (commitment to vehicle)
2. deal_commitments (interest in specific deal)
3. allocations (approved deal participation)
4. positions (actual holdings post-closing)
```

**Logic**: Capital flows from commitment → allocation → realized position.

---

### Staff vs. Investor Access
```
Staff Users (role: staff_admin, staff_ops, staff_rm)
    ↓ direct access to all entities
    ↓ oversight and management

Investor Users (role: investor)
    ↓ limited by deal memberships
    ↓ investor-specific data only
```

**Logic**: Staff have global access for operations, investors have restricted access based on their deal participation.

---

## Business Rules & Constraints

### 1. **Access Control**
- Staff roles have broad access across all entities
- Investor users can only see data related to deals they're members of
- Deal memberships control granular permissions

### 2. **Entity Ownership**
- Deals belong to vehicles (one vehicle can have many deals)
- Positions link investors to vehicles (many-to-many through holdings)
- Documents can belong to investors, users, vehicles, or deals

### 3. **Workflow States**
- Deals progress: draft → open → allocation_pending → closed
- Allocations: pending_review → approved/rejected → settled
- Subscriptions: pending → active (implied by signed documents)

### 4. **Financial Tracking**
- Subscriptions track commitments (what investors promised)
- Positions track actual holdings (what investors own)
- Cashflows track movements (capital calls vs distributions)
- Performance snapshots calculate returns (IRR, TVPI, DPI)

### 5. **Multi-tenancy**
- Each deal acts as a separate "tenant" with its own membership
- Users can participate in multiple deals with different roles
- Investors can participate through multiple user accounts

---

## Common Business Scenarios

### **New Investor Onboarding**
1. Create investor entity (`investors`)
2. Create user account(s) (`profiles`)
3. Link via `investor_users`
4. Set up subscriptions to vehicles
5. Grant deal memberships as opportunities arise

### **Deal Creation & Management**
1. Staff creates deal under vehicle (`deals`)
2. Define deal terms and pricing
3. Invite participants via `deal_memberships`
4. Manage reservations → allocations workflow
5. Track resulting positions post-closing

### **Staff Operations**
- Staff users have oversight across all entities
- Can create/manage deals, vehicles, investor relationships
- Handle approvals, document workflows, fee management
- Generate reports and manage system operations

This structure supports a sophisticated investment management workflow where staff operate the platform while investors access deal-specific information through controlled membership relationships.

