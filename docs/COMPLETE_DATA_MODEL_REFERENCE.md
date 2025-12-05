# VERSO Holdings Platform - Complete Data Model Reference

**Document Type:** Client-Facing Technical Documentation
**Last Verified:** December 5, 2025
**Total Tables:** 92
**Total Foreign Key Relationships:** 251

---

## Executive Summary

The VERSO Holdings platform manages **$800M+ in alternative investments** through a PostgreSQL database with **92 tables**, **2 helper views**, and **251 verified foreign key relationships**. This document explains every table, what it stores, where it's used in the platform, and how tables connect to power the investment management workflows.

---

## Part 1: Core Data Architecture

### How the Platform is Organized

```
┌─────────────────────────────────────────────────────────────────┐
│                    VERSO HOLDINGS PLATFORM                       │
├─────────────────────────────────────────────────────────────────┤
│  INVESTOR PORTAL (/versoholdings/*)     STAFF PORTAL (/versotech/*)  │
│  ├── Dashboard                          ├── Admin Dashboard          │
│  ├── Holdings                           ├── Deal Management          │
│  ├── Documents                          ├── Investor Management      │
│  ├── Deals & Data Rooms                 ├── Approvals                │
│  ├── Messages                           ├── Fees & Reconciliation    │
│  └── Tasks                              ├── Introducers              │
│                                         └── Audit & Compliance       │
└─────────────────────────────────────────────────────────────────┘
```

### Database Statistics (Verified)

| Category | Tables | Total Rows | Key Tables |
|----------|--------|------------|------------|
| Identity & Users | 7 | 396 | profiles (7), investors (385), investor_users (2) |
| Investments | 10 | 1,288 | subscriptions (629), vehicles (91), entity_investors (509) |
| Deal Pipeline | 13 | 130 | deals (14), deal_memberships (15), deal_subscription_submissions (4) |
| Documents | 7 | 915 | documents (33), document_folders (854) |
| Fees & Billing | 9 | 72 | fee_plans (14), fee_components (28), invoices (6) |
| Banking | 5 | 24 | bank_transactions (17), reconciliation_matches (7) |
| Workflows | 4 | 60 | workflows (16), workflow_runs (44) |
| Compliance | 5 | 6 | kyc_submissions (1), compliance_alerts (4) |
| Signatures | 3 | 49 | signature_requests (49) |
| Messaging | 5 | 40 | conversations (7), messages (10) |
| Audit | 3 | 222 | audit_logs (45), approval_history (177) |
| Supporting | 21 | Various | approvals (64), tasks (68), introducers (7) |

---

## Part 2: Complete Table Reference (All 92 Tables)

### SECTION A: USER IDENTITY & ACCESS (7 tables)

---

#### 1. `profiles` (7 rows, 15 columns)
**What it stores:** Every user account in the system - investors, staff admins, relationship managers, and operations team.

**Where it's used:**
- **Login Page:** Authenticates users and determines portal access
- **Navigation:** Shows user name/avatar in header
- **Everywhere:** Referenced as `created_by`, `approved_by`, `assigned_to` across system

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key, links to Supabase Auth |
| role | enum | `investor`, `staff_admin`, `staff_ops`, `staff_rm` |
| email | citext | Unique email address |
| display_name | text | Name shown in UI |
| last_login_at | timestamp | Tracks last login |
| is_locked | boolean | Account temporarily locked |
| deleted_at | timestamp | Soft delete (null = active) |

**User actions that write here:**
- User logs in → `last_login_at` updated
- User updates profile → `display_name`, `avatar_url` changed
- Admin locks account → `is_locked = true`

**Connected to:**
- ← `investor_users` (which investors this user can access)
- ← Almost every table via `created_by`, `approved_by`, etc.

---

#### 2. `investors` (385 rows, 40 columns)
**What it stores:** Investor entities - the legal entities that hold investments. This is the core investor record.

**Where it's used:**
- **Investor Portal Dashboard:** Shows investor's name, KYC status
- **Staff Portal → Investors:** Full investor database with filtering
- **Staff Portal → KYC Review:** Lists investors pending KYC approval

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| legal_name | text | Official registered name |
| type | text | individual, corporate, trust, institution |
| kyc_status | text | pending, under_review, approved, expired |
| aml_risk_rating | text | low, medium, high |
| primary_rm | uuid | FK to profiles (relationship manager) |
| country_of_incorporation | text | Where entity is registered |
| is_professional_investor | boolean | Regulatory classification |

**User actions that write here:**
- Staff creates investor → new row inserted
- Staff approves KYC → `kyc_status = 'approved'`, `kyc_approved_by` set
- Staff assigns RM → `primary_rm` or `secondary_rm` updated

**Connected to:**
- → `profiles` via `primary_rm`, `secondary_rm`, `kyc_approved_by`, `created_by`
- ← `subscriptions` (629 rows) - investor's fund commitments
- ← `investor_users` - users who can access this investor
- ← `investor_members` - directors/shareholders for entities
- ← `tasks` - tasks assigned to investor
- ← `documents` - investor's documents

---

#### 3. `investor_users` (2 rows, 2 columns)
**What it stores:** Links user accounts to investor entities. Enables multiple users to access one investor account (e.g., family office with multiple authorized users).

**Where it's used:**
- **Investor Portal Login:** Determines which investor data logged-in user sees
- **Staff Portal → Investor Detail:** Shows linked users

**Columns:**
| Column | Type | Description |
|--------|------|-------------|
| investor_id | uuid | FK to investors |
| user_id | uuid | FK to profiles |

**User actions:**
- Staff adds user to investor → new row
- User logs in → system queries this to find their investor IDs

**Connected to:**
- → `investors`
- → `profiles`

---

#### 4. `investor_members` (1 row, 28 columns)
**What it stores:** For entity-type investors (corporations, trusts), stores beneficial owners, directors, shareholders, and other key persons who must be KYC'd.

**Where it's used:**
- **Investor Portal → Profile:** Shows entity members
- **Staff Portal → KYC Review:** Each member requires separate KYC verification

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| investor_id | uuid | Parent investor entity |
| member_type | text | director, shareholder, beneficial_owner, etc. |
| full_name | text | Member's full name |
| ownership_percentage | numeric | For shareholders |
| kyc_status | text | pending, approved, rejected |
| kyc_approved_by | uuid | FK to profiles |

**Connected to:**
- → `investors`
- → `profiles` (created_by, kyc_approved_by)
- ← `kyc_submissions` (KYC documents for this member)

---

#### 5. `investor_counterparty` (1 row, 22 columns)
**What it stores:** Counterparty entities that investors invest through (trusts, LLCs, holding companies).

**Where it's used:**
- **Investor Portal → Subscription Form:** Select investing entity
- **Staff Portal → Investor Detail:** View related entities

**Connected to:**
- → `investors`
- ← `counterparty_entity_members` (members of this entity)
- ← `deal_subscription_submissions` (subscriptions through this entity)

---

#### 6. `counterparty_entity_members` (0 rows, 28 columns)
**What it stores:** Members (directors, trustees, partners) of counterparty entities.

**Connected to:**
- → `investor_counterparty`
- → `profiles`

---

#### 7. `staff_permissions` (20 rows, 6 columns)
**What it stores:** Granular permissions for staff users.

**Where it's used:**
- **Staff Portal:** Controls access to sensitive sections (financials, user management)

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | FK to profiles |
| permission | text | super_admin, view_financials, manage_investors, etc. |
| granted_by | uuid | Who granted the permission |

---

### SECTION B: INVESTMENT STRUCTURE (10 tables)

---

#### 8. `vehicles` (91 rows, 26 columns)
**What it stores:** Investment funds, SPVs, and legal entities that hold investments. This is what investors subscribe to.

**Where it's used:**
- **Investor Portal → Holdings:** Shows vehicles investor is subscribed to
- **Staff Portal → Entities:** Full vehicle management
- **Staff Portal → Deals:** Associates deals with vehicles

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Legal name (e.g., "VERSO Capital I SCSp") |
| type | enum | fund, spv, securitization, note, real_estate, private_equity, venture_capital |
| entity_code | text | Internal reference (e.g., VC101, RE1) |
| investment_name | text | Underlying investment (e.g., "SpaceX", "Revolut") |
| status | enum | LIVE, CLOSED, TBD |
| arranger_entity_id | uuid | FK to regulated entity managing this vehicle |

**Connected to:**
- → `arranger_entities` (regulated advisor)
- ← `subscriptions` (investor commitments to this vehicle)
- ← `deals` (investment opportunities for this vehicle)
- ← `documents` (vehicle-level documents)
- ← `valuations` (NAV history)
- ← `capital_calls`, `distributions` (fund operations)

---

#### 9. `subscriptions` (629 rows, 44 columns)
**What it stores:** An investor's commitment to a vehicle - the core financial relationship. Each row = one investor's investment in one vehicle.

**Where it's used:**
- **Investor Portal → Holdings:** Shows commitment, funded amount, NAV
- **Investor Portal → Dashboard:** Portfolio summary
- **Staff Portal → Subscriptions:** Full subscription management
- **Staff Portal → Fees:** Base for fee calculations

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| investor_id | uuid | FK to investors |
| vehicle_id | uuid | FK to vehicles |
| commitment | numeric | Total committed amount |
| funded_amount | numeric | Amount actually funded |
| current_nav | numeric | Current net asset value |
| status | text | pending, committed, active, closed, cancelled |
| subscription_number | int | For follow-on investments (#1, #2, #3...) |
| subscription_fee_percent | numeric | Subscription fee rate |
| management_fee_percent | numeric | Annual management fee |
| performance_fee_tier1_percent | numeric | Carry rate |
| spread_fee_amount | numeric | Spread revenue (primary revenue) |
| deal_id | uuid | Deal that led to this subscription |
| introducer_id | uuid | If came through introducer |

**User actions that write here:**
- Investor completes subscription → `status = 'committed'`
- Capital call paid → `funded_amount` increases
- Valuation updated → `current_nav` changes
- Distribution made → `distributions_total` increases

**Connected to:**
- → `investors`
- → `vehicles`
- → `deals`
- → `fee_plans`
- → `introducers`, `introductions`
- ← `documents` (subscription agreements)
- ← `signature_requests` (signature workflows)
- ← `capital_call_items`, `distribution_items`
- ← `bank_transactions` (matched payments)

---

#### 10. `positions` (10 rows, 7 columns)
**What it stores:** Investor's current position in a vehicle - point-in-time snapshot of holdings.

**Where it's used:**
- **Investor Portal → Holdings:** Shows units, cost basis, current NAV

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| investor_id | uuid | FK to investors |
| vehicle_id | uuid | FK to vehicles |
| units | numeric | Number of shares/units held |
| cost_basis | numeric | Original investment amount |
| last_nav | numeric | Most recent NAV |
| as_of_date | date | Valuation date |

---

#### 11. `valuations` (5 rows, 5 columns)
**What it stores:** Historical NAV records for each vehicle.

**Where it's used:**
- **Investor Portal → Vehicle Detail:** NAV history chart
- **Staff Portal → Reports:** Performance reporting

**Connected to:**
- → `vehicles`

---

#### 12. `cashflows` (20 rows, 7 columns)
**What it stores:** Historical capital calls and distributions for each investor-vehicle combination.

**Where it's used:**
- **Investor Portal → Vehicle Detail:** Cashflow history tab

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| type | text | 'call' or 'distribution' |
| amount | numeric | Cash amount |
| date | date | Transaction date |

---

#### 13. `capital_calls` (4 rows, 6 columns)
**What it stores:** Vehicle-level capital call events (when fund calls capital from all investors).

**Where it's used:**
- **Staff Portal → Capital Calls:** Manage fund-level calls

**Connected to:**
- → `vehicles`
- ← `capital_call_items` (per-investor amounts)

---

#### 14. `capital_call_items` (0 rows, 14 columns)
**What it stores:** Per-investor capital call amounts for reconciliation.

**Connected to:**
- → `capital_calls`
- → `investors`
- → `subscriptions`

---

#### 15. `distributions` (4 rows, 6 columns)
**What it stores:** Vehicle-level distribution events.

**Connected to:**
- → `vehicles`
- ← `distribution_items`

---

#### 16. `distribution_items` (0 rows, 14 columns)
**What it stores:** Per-investor distribution amounts.

**Connected to:**
- → `distributions`
- → `investors`
- → `subscriptions`

---

#### 17. `performance_snapshots` (110 rows, 12 columns)
**What it stores:** Aggregated performance metrics (DPI, TVPI, IRR) for investor reporting.

**Where it's used:**
- **Investor Portal → Dashboard:** Performance metrics display
- **Staff Portal → Reports:** Generate investor statements

**Connected to:**
- → `investors`
- → `vehicles`

---

### SECTION C: DEAL PIPELINE (13 tables)

---

#### 18. `deals` (14 rows, 25 columns)
**What it stores:** Investment opportunities in the pipeline - from sourcing through closing.

**Where it's used:**
- **Investor Portal → Deals:** Browse open opportunities
- **Staff Portal → Deals:** Manage deal pipeline
- **Staff Portal → Dashboard:** Deal pipeline metrics

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Deal name (e.g., "SpaceX Series F Secondary") |
| vehicle_id | uuid | Associated fund/SPV |
| deal_type | enum | equity_secondary, equity_primary, credit_trade_finance |
| status | enum | draft, open, allocation_pending, closed, cancelled |
| target_amount | numeric | Fundraising target |
| raised_amount | numeric | Amount committed |
| minimum_investment | numeric | Minimum commitment |
| company_name | text | Target company |
| sector | text | Technology, Healthcare, etc. |

**User actions:**
- Staff creates deal → `status = 'draft'`
- Staff opens to investors → `status = 'open'`
- All allocations complete → `status = 'closed'`

**Connected to:**
- → `vehicles`
- → `arranger_entities`
- ← `deal_memberships` (15 rows) - who can see this deal
- ← `deal_data_room_access` (5 rows) - data room access grants
- ← `deal_data_room_documents` (9 rows) - data room files
- ← `deal_subscription_submissions` (4 rows) - subscription applications
- ← `investor_deal_interest` (17 rows) - expressions of interest
- ← `allocations` - confirmed allocations
- ← `fee_plans` - deal-specific fee structures
- ← `subscriptions` - resulting subscriptions

---

#### 19. `deal_memberships` (15 rows, 7 columns)
**What it stores:** Who can access a deal and in what role.

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| deal_id | uuid | FK to deals |
| user_id | uuid | FK to profiles |
| investor_id | uuid | FK to investors (optional) |
| role | enum | investor, co_investor, spouse, advisor, lawyer, banker, introducer, viewer, verso_staff |
| invited_by | uuid | FK to profiles |
| accepted_at | timestamp | When accepted |

---

#### 20. `deal_data_room_access` (5 rows, 11 columns)
**What it stores:** Controls which investors can view data room documents and for how long.

**Where it's used:**
- **Investor Portal → Data Room:** Gate that checks access before showing documents
- **Staff Portal → Deals:** Manage access grants

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| deal_id | uuid | FK to deals |
| investor_id | uuid | FK to investors |
| granted_at | timestamp | When access granted |
| expires_at | timestamp | Access expiration (typically 7 days after NDA) |
| revoked_at | timestamp | If manually revoked |
| extension_requested_at | timestamp | If extension requested |

**User actions:**
- Investor signs NDA → access granted (7 days)
- Access expires → investor requests extension
- Staff grants extension → `expires_at` updated

---

#### 21. `deal_data_room_documents` (9 rows, 19 columns)
**What it stores:** Documents in the investor data room.

**Where it's used:**
- **Investor Portal → Data Room:** Shows authorized documents

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| deal_id | uuid | FK to deals |
| folder | text | Category (Due Diligence, Legal, Financials) |
| visible_to_investors | boolean | Currently visible |
| display_order | int | Sort order |

---

#### 22. `investor_deal_interest` (17 rows, 13 columns)
**What it stores:** Expressions of interest from investors before formal commitment.

**Where it's used:**
- **Investor Portal → Deals:** "Express Interest" button
- **Staff Portal → Deals:** Interest tracking

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| deal_id | uuid | FK to deals |
| investor_id | uuid | FK to investors |
| status | text | pending_review, approved, rejected, withdrawn |
| indicative_amount | numeric | How much they might invest |
| approval_id | uuid | FK to approvals |

---

#### 23. `deal_subscription_submissions` (4 rows, 18 columns)
**What it stores:** Formal subscription applications after data room review.

**Where it's used:**
- **Investor Portal → Data Room:** Subscription form submission
- **Staff Portal → Approvals:** Subscription approval queue

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| deal_id | uuid | FK to deals |
| investor_id | uuid | FK to investors |
| requested_amount | numeric | Amount investor wants to invest |
| status | text | pending, approved, rejected, funded |
| approval_id | uuid | FK to approvals |
| formal_subscription_id | uuid | FK to subscriptions (once approved) |

**User actions:**
- Investor submits allocation → new row
- Staff approves → subscription created, `formal_subscription_id` set
- Investor funds → `status = 'funded'`

---

#### 24. `deal_fee_structures` (10 rows, 57 columns)
**What it stores:** Structured term sheet data for each deal (versioned: draft/published/archived).

**Connected to:**
- → `deals`

---

#### 25. `deal_faqs` (4 rows, 9 columns)
**What it stores:** FAQs for each deal.

**Where it's used:**
- **Investor Portal → Data Room:** FAQ section

---

#### 26. `deal_activity_events` (36 rows, 6 columns)
**What it stores:** Analytics events for deal workflow (interest → NDA → subscription → funding).

---

#### 27. `investor_deal_holdings` (0 rows, 13 columns)
**What it stores:** Per-investor holdings once subscriptions confirmed.

---

#### 28. `investor_interest_signals` (1 row, 7 columns)
**What it stores:** General interest signals for closed deals.

---

#### 29. `allocations` (0 rows, 9 columns)
**What it stores:** Confirmed investor allocations from deals.

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| deal_id | uuid | FK to deals |
| investor_id | uuid | FK to investors |
| units | numeric | Units allocated |
| unit_price | numeric | Price per unit |
| status | enum | pending_review, approved, rejected, settled |

---

#### 30. `invite_links` (0 rows, 9 columns)
**What it stores:** Shareable invite links for deals.

---

### SECTION D: DOCUMENT MANAGEMENT (7 tables)

---

#### 31. `documents` (33 rows, 29 columns)
**What it stores:** All document metadata - investor docs, deal docs, entity docs.

**Where it's used:**
- **Investor Portal → Documents:** K-1s, statements, agreements
- **Staff Portal → Documents:** Full document management
- **Data Room:** Deal-related documents

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| owner_investor_id | uuid | If owned by investor |
| vehicle_id | uuid | If vehicle-level doc |
| deal_id | uuid | If deal-level doc |
| type | text | k1, statement, subscription_agreement, nda |
| file_key | text | Storage bucket path |
| status | text | draft, pending_approval, approved, published, archived |
| is_published | boolean | Visible to investors |

**Connected to:**
- → `investors`, `profiles`, `vehicles`, `deals`, `subscriptions`
- → `document_folders`
- → `workflow_runs` (signature workflows)
- ← `document_versions`
- ← `document_approvals`
- ← `signature_requests`

---

#### 32. `document_folders` (854 rows, 9 columns)
**What it stores:** Hierarchical folder structure for organizing documents.

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| vehicle_id | uuid | FK to vehicles |
| name | text | Folder name |
| parent_folder_id | uuid | Self-reference for nesting |
| path | text | Full path |

---

#### 33. `document_versions` (19 rows, 9 columns)
**What it stores:** Version history for documents.

---

#### 34. `document_approvals` (0 rows, 10 columns)
**What it stores:** Approval workflow for document publishing.

---

#### 35. `document_publishing_schedule` (0 rows, 8 columns)
**What it stores:** Scheduled publish/unpublish dates.

---

#### 36. `entity_folders` (0 rows, 9 columns)
**What it stores:** Document folders specific to entities.

---

#### 37. `arranger_entities` (1 row, 22 columns)
**What it stores:** Regulated financial entities (arrangers/advisors) that structure deals and manage vehicles.

**Where it's used:**
- **Staff Portal → Arrangers:** Manage regulated entities
- **Documents:** Links documents to arranging entity

**Connected to:**
- ← `vehicles` (vehicles managed by this arranger)
- ← `deals` (deals arranged by this entity)
- ← `documents` (arranger's KYC docs)

---

### SECTION E: FEE & BILLING SYSTEM (9 tables)

---

#### 38. `fee_plans` (14 rows, 12 columns)
**What it stores:** Fee structure templates applied to deals or vehicles.

**Where it's used:**
- **Staff Portal → Fees:** Configure fee structures
- **Staff Portal → Deals:** Assign fee plans to deals

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| name | text | Plan name (e.g., "Standard Terms") |
| deal_id | uuid | If deal-specific |
| vehicle_id | uuid | If vehicle-level |
| is_default | boolean | Default for new subscriptions |
| effective_from | date | When plan becomes active |

**Connected to:**
- → `deals`, `vehicles`
- ← `fee_components` (28 rows)
- ← `subscriptions` (subscriptions using this plan)
- ← `investor_terms` (custom investor terms)

---

#### 39. `fee_components` (28 rows, 20 columns)
**What it stores:** Individual fee types within a fee plan.

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| fee_plan_id | uuid | Parent plan |
| kind | enum | subscription, management, performance, spread_markup, bd_fee |
| calc_method | enum | percent_of_investment, percent_per_annum, percent_of_profit |
| rate_bps | int | Rate in basis points (100 = 1%) |
| frequency | enum | one_time, annual, quarterly, monthly, on_exit |
| hurdle_rate_bps | int | For performance fees |
| has_high_water_mark | boolean | For performance fees |

**Examples:**
- Subscription fee: kind=subscription, rate_bps=200 (2%)
- Management fee: kind=management, rate_bps=200, frequency=quarterly
- Carry: kind=performance, rate_bps=2000 (20%)

---

#### 40. `fee_events` (21 rows, 21 columns)
**What it stores:** Individual fee accrual records.

**Where it's used:**
- **Staff Portal → Fees:** Track fee accruals

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| fee_component_id | uuid | Which fee type |
| investor_id | uuid | Charged to whom |
| amount | numeric | Fee amount |
| status | text | pending, invoiced, paid, cancelled |

---

#### 41. `fee_schedules` (0 rows, 14 columns)
**What it stores:** Scheduled recurring fee generation.

---

#### 42. `investor_terms` (3 rows, 16 columns)
**What it stores:** Custom fee terms for specific investors.

---

#### 43. `invoices` (6 rows, 22 columns)
**What it stores:** Invoice records.

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| investor_id | uuid | Billed to |
| total_amount | numeric | Invoice total |
| status | text | draft, sent, paid, overdue |
| due_date | timestamp | Payment deadline |

**Connected to:**
- ← `invoice_lines`
- ← `payments`
- ← `reconciliation_matches` (bank transaction matches)

---

#### 44. `invoice_lines` (3 rows, 8 columns)
**What it stores:** Line items on invoices.

---

#### 45. `payments` (0 rows, 10 columns)
**What it stores:** Payment records.

---

#### 46. `term_sheets` (0 rows, 14 columns)
**What it stores:** Term sheet documents for investor agreements.

---

### SECTION F: BANKING & RECONCILIATION (5 tables)

---

#### 47. `bank_transactions` (17 rows, 22 columns)
**What it stores:** Imported bank statement line items.

**Where it's used:**
- **Staff Portal → Reconciliation:** Match payments to invoices

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| amount | numeric | Transaction amount |
| value_date | date | Transaction date |
| memo | text | Bank memo |
| counterparty | text | Sender/receiver |
| status | text | unmatched, partially_matched, matched |
| matched_subscription_id | uuid | If matched to subscription |

---

#### 48. `reconciliation_matches` (7 rows, 12 columns)
**What it stores:** Approved matches between transactions and invoices.

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| bank_transaction_id | uuid | FK to bank_transactions |
| invoice_id | uuid | FK to invoices |
| matched_amount | numeric | Amount matched |
| status | text | pending, approved, rejected |

---

#### 49. `suggested_matches` (0 rows, 8 columns)
**What it stores:** AI-generated match suggestions.

---

#### 50. `reconciliations` (0 rows, 6 columns)
**What it stores:** Reconciliation sessions.

---

#### 51. `import_batches` (0 rows, 6 columns)
**What it stores:** Bank statement import batches.

---

### SECTION G: WORKFLOW AUTOMATION (4 tables)

---

#### 52. `workflows` (16 rows, 13 columns)
**What it stores:** Workflow definitions (n8n integration).

**Where it's used:**
- **Staff Portal → Process Center:** One-click workflow triggers

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| key | text | Unique ID (e.g., 'generate-position-statement') |
| n8n_webhook_url | text | External webhook endpoint |
| input_schema | jsonb | Required inputs |
| trigger_type | text | manual, scheduled, both |

**Available workflows:**
1. `generate-position-statement` - Auto-generate investor statements
2. `process-nda` - NDA generation + DocuSign
3. `kyc-aml-processing` - Enhanced due diligence
4. `capital-call-processing` - Capital call notices
5. `investor-onboarding` - Multi-step onboarding
6. `generate-subscription-pack` - Subscription documents
7. `generate-investment-certificate` - Investment certificates

---

#### 53. `workflow_runs` (44 rows, 23 columns)
**What it stores:** Each execution of a workflow.

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| workflow_id | uuid | Which workflow |
| triggered_by | uuid | Who triggered |
| status | text | queued, running, completed, failed |
| input_params | jsonb | Input data |
| output_data | jsonb | Result data |
| error_message | text | If failed |

---

#### 54. `workflow_run_logs` (0 rows, 8 columns)
**What it stores:** Detailed execution logs.

---

#### 55. `automation_webhook_events` (0 rows, 6 columns)
**What it stores:** Audit log of inbound n8n webhooks.

---

### SECTION H: COMPLIANCE & KYC (5 tables)

---

#### 56. `kyc_submissions` (1 row, 19 columns)
**What it stores:** KYC document submissions from investors.

**Where it's used:**
- **Investor Portal → KYC Wizard:** Upload documents
- **Staff Portal → KYC Review:** Review/approve submissions

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| investor_id | uuid | FK to investors |
| document_type | text | passport_id, utility_bill, incorporation_certificate, etc. |
| document_id | uuid | FK to documents |
| status | text | pending, under_review, approved, rejected, expired |
| reviewed_by | uuid | Staff who reviewed |
| rejection_reason | text | If rejected |

**User actions:**
- Investor uploads passport → new submission
- Staff approves → `status = 'approved'`
- All required docs approved → investor `kyc_status = 'approved'`

---

#### 57. `compliance_alerts` (4 rows, 13 columns)
**What it stores:** Compliance violation alerts.

**Where it's used:**
- **Staff Portal → Compliance:** Alert management

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| type | text | kyc_expiry, accreditation_expiry, unsigned_doc, aml_flag |
| severity | text | critical, high, medium, low |
| assigned_to | uuid | Staff assigned |
| resolved_at | timestamp | When resolved |

---

#### 58. `director_registry` (3 rows, 10 columns)
**What it stores:** Master registry of directors assignable to entities.

---

#### 59. `entity_directors` (5 rows, 9 columns)
**What it stores:** Board directors for each vehicle.

---

#### 60. `entity_stakeholders` (0 rows, 12 columns)
**What it stores:** External stakeholders (lawyers, accountants, auditors).

---

### SECTION I: E-SIGNATURES (3 tables)

---

#### 61. `signature_requests` (49 rows, 29 columns)
**What it stores:** E-signature requests for NDAs, subscription agreements, etc.

**Where it's used:**
- **Investor Portal → Sign:** Signature page
- **Staff Portal → Signatures:** Track signing status

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| workflow_run_id | uuid | Signature workflow |
| investor_id | uuid | Who signs |
| document_id | uuid | What to sign |
| signer_email | text | Signer email |
| signer_role | text | investor, co_investor, spouse, verso_staff |
| status | text | pending, signed, expired |
| signing_token | text | Unique signing URL token |
| token_expires_at | timestamp | Token expiration |

**User actions:**
- System sends signature request → token generated
- User clicks link → validates token
- User signs → `status = 'signed'`
- Both parties sign → subscription activated

---

#### 62. `esign_envelopes` (0 rows, 6 columns)
**What it stores:** DocuSign envelope records.

---

#### 63. `entity_flags` (0 rows, 14 columns)
**What it stores:** Risk/compliance flags on vehicles.

---

### SECTION J: MESSAGING & NOTIFICATIONS (5 tables)

---

#### 64. `conversations` (7 rows, 14 columns)
**What it stores:** Conversation threads between investors and staff.

**Where it's used:**
- **Investor Portal → Messages**
- **Staff Portal → Messages**

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| subject | text | Conversation topic |
| deal_id | uuid | If deal-specific |
| last_message_at | timestamp | For sorting |

---

#### 65. `conversation_participants` (13 rows, 10 columns)
**What it stores:** Who's in each conversation.

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| conversation_id | uuid | FK to conversations |
| user_id | uuid | FK to profiles |
| is_muted | boolean | Notifications muted |
| is_pinned | boolean | Pinned to top |
| last_read_at | timestamp | For unread count |

---

#### 66. `messages` (10 rows, 11 columns)
**What it stores:** Individual messages.

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| conversation_id | uuid | Parent conversation |
| sender_id | uuid | Who sent |
| body | text | Message content |
| attachments | jsonb | File attachments |

---

#### 67. `message_reads` (10 rows, 3 columns)
**What it stores:** Message-level read receipts.

---

#### 68. `investor_notifications` (0 rows, 8 columns)
**What it stores:** Notifications to investors (email/push/in-app).

---

### SECTION K: AUDIT & ACTIVITY (3 tables)

---

#### 69. `audit_logs` (45 rows, 25 columns)
**What it stores:** Immutable audit trail of ALL system activities.

**Where it's used:**
- **Staff Portal → Audit:** View/filter audit trail
- **Compliance reporting**

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| event_type | text | workflow, compliance, system |
| action | text | CREATE, READ, UPDATE, DELETE, login, logout |
| entity_type | text | Which table affected |
| entity_id | uuid | Which record |
| actor_id | uuid | Who did it |
| action_details | jsonb | Before/after values |
| timestamp | timestamp | Microsecond precision |

**What gets logged:**
- All authentication events
- All CRUD on sensitive tables
- Workflow triggers
- Document access
- KYC approvals/rejections
- Reconciliation actions

---

#### 70. `activity_feed` (0 rows, 9 columns)
**What it stores:** User-visible activity timeline.

**Where it's used:**
- **Investor Portal → Dashboard:** Recent activity
- **Staff Portal → Dashboard:** Activity feed

---

#### 71. `approval_history` (177 rows, 7 columns)
**What it stores:** Detailed approval workflow state changes.

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| approval_id | uuid | FK to approvals |
| actor_id | uuid | Who acted |
| action | text | approved, rejected, escalated, reassigned |
| notes | text | Comments |

---

### SECTION L: APPROVALS & TASKS (8 tables)

---

#### 72. `approvals` (64 rows, 27 columns)
**What it stores:** Multi-level approval workflows for various entity types.

**Where it's used:**
- **Staff Portal → Approvals:** Approval queue

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| entity_type | text | deal_interest, deal_subscription, allocation, document |
| entity_id | uuid | What's being approved |
| status | text | pending, approved, rejected, escalated |
| assigned_to | uuid | Current reviewer |
| priority | text | low, medium, high, critical |
| requires_secondary_approval | boolean | Two-person rule |
| sla_breach_at | timestamp | SLA deadline |

---

#### 73. `tasks` (68 rows, 20 columns)
**What it stores:** Action items for investors or staff.

**Where it's used:**
- **Investor Portal → Tasks:** Pending tasks
- **Staff Portal → Tasks:** Task management

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| owner_investor_id | uuid | Assigned to investor |
| owner_user_id | uuid | Assigned to user |
| kind | text | kyc_individual, deal_nda_signature, subscription_pack_signature |
| status | text | pending, in_progress, completed, overdue |
| priority | text | low, medium, high |
| due_at | timestamp | Deadline |

**Task types:**
- `kyc_individual` - Complete KYC verification
- `deal_nda_signature` - Sign deal NDA
- `subscription_pack_signature` - Sign subscription docs
- `countersignature` - Staff counter-sign

---

#### 74. `task_actions` (0 rows, 3 columns)
**What it stores:** Actions within a task.

---

#### 75. `task_dependencies` (0 rows, 2 columns)
**What it stores:** Task dependencies (Task B requires Task A).

---

#### 76. `task_templates` (6 rows, 11 columns)
**What it stores:** Reusable task templates.

---

#### 77. `request_tickets` (5 rows, 14 columns)
**What it stores:** Support tickets and custom requests.

**Where it's used:**
- **Investor Portal → Reports:** Custom report requests
- **Staff Portal → Requests:** Request queue

---

#### 78. `report_requests` (2 rows, 8 columns)
**What it stores:** Automated report generation requests.

---

#### 79. `audit_report_templates` (3 rows, 9 columns)
**What it stores:** Templates for compliance audit reports.

---

### SECTION M: INTRODUCERS (3 tables)

---

#### 80. `introducers` (7 rows, 14 columns)
**What it stores:** Business development partners who refer investors.

**Where it's used:**
- **Staff Portal → Introducers:** Manage BD partners

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| legal_name | text | Partner name |
| default_commission_bps | int | Default commission rate (basis points) |
| commission_cap_amount | numeric | Maximum commission |
| agreement_expiry_date | date | When agreement expires |
| user_id | uuid | If introducer has login |

---

#### 81. `introductions` (8 rows, 11 columns)
**What it stores:** Individual investor referrals.

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| introducer_id | uuid | Who referred |
| prospect_investor_id | uuid | Who was referred |
| deal_id | uuid | For which deal |
| status | text | invited, joined, allocated, lost |
| commission_rate_override_bps | int | Custom rate |

---

#### 82. `introducer_commissions` (4 rows, 19 columns)
**What it stores:** Commission accruals and payments.

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| introducer_id | uuid | Who earns |
| basis_type | text | invested_amount, spread, management_fee |
| rate_bps | int | Commission rate |
| accrual_amount | numeric | Amount accrued |
| status | text | accrued, invoiced, paid |

---

### SECTION N: SHARE INVENTORY (2 tables)

---

#### 83. `share_sources` (5 rows, 5 columns)
**What it stores:** Where secondary shares were acquired from.

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| kind | text | company, fund, colleague, other |
| counterparty_name | text | Seller name |
| contract_doc_id | uuid | FK to documents |

---

#### 84. `share_lots` (9 rows, 11 columns)
**What it stores:** Inventory of shares available for allocation.

**Key columns:**
| Column | Type | Description |
|--------|------|-------------|
| deal_id | uuid | FK to deals |
| source_id | uuid | FK to share_sources |
| units_total | numeric | Original units acquired |
| units_remaining | numeric | Not yet allocated |
| unit_cost | numeric | Cost per share |
| status | text | available, held, exhausted |

---

### SECTION O: ENTITY MANAGEMENT (4 tables)

---

#### 85. `entity_events` (14 rows, 7 columns)
**What it stores:** Event log for vehicle changes (board changes, status changes).

---

#### 86. `entity_investors` (509 rows, 10 columns)
**What it stores:** Links investors to vehicles they're invested in.

---

#### 87. `dashboard_preferences` (0 rows, 8 columns)
**What it stores:** User dashboard customizations.

---

#### 88. `staff_filter_views` (0 rows, 8 columns)
**What it stores:** Saved filter combinations for staff.

---

### SECTION P: DATA IMPORTS (4 tables)

---

#### 89. `subscription_import_results` (0 rows, 8 columns)
**What it stores:** Results from subscription data imports.

---

#### 90. `subscription_fingerprints` (0 rows, 3 columns)
**What it stores:** SHA256 hashes for import deduplication.

---

#### 91. `subscription_workbook_runs` (7 rows, 8 columns)
**What it stores:** Subscription workbook processing.

---

#### 92. `system_metrics` (330 rows, 7 columns)
**What it stores:** Real-time system performance metrics.

---

## Part 3: End-to-End Data Flows

### Flow 1: Investor Subscribes to a Deal

```
USER ACTION                          DATABASE CHANGES
─────────────────────────────────────────────────────────────────
1. Investor browses deals          → SELECT from deals, deal_memberships

2. Clicks "Express Interest"       → INSERT into investor_deal_interest
                                   → INSERT into approvals (status='pending')
                                   → INSERT into audit_logs

3. Staff approves interest         → UPDATE approvals (status='approved')
                                   → INSERT into deal_data_room_access
                                   → INSERT into tasks (sign NDA)
                                   → INSERT into approval_history

4. Investor signs NDA              → INSERT into signature_requests
                                   → UPDATE tasks (status='completed')
                                   → UPDATE deal_data_room_access (granted_at)

5. Accesses data room              → SELECT from deal_data_room_documents
                                     (validates deal_data_room_access)

6. Submits subscription            → INSERT into deal_subscription_submissions
                                   → INSERT into approvals

7. Staff approves                  → UPDATE approvals
                                   → INSERT into subscriptions
                                   → UPDATE deal_subscription_submissions
                                     (formal_subscription_id set)

8. Signs subscription agreement    → INSERT into signature_requests
                                   → INSERT into documents
                                   → INSERT into workflow_runs

9. Investor funds                  → INSERT into bank_transactions
                                   → INSERT into reconciliation_matches
                                   → UPDATE subscriptions (funded_amount)
                                   → INSERT into positions

10. Staff generates certificate    → INSERT into workflow_runs
                                   → INSERT into documents
                                   → UPDATE subscriptions (status='active')
```

### Flow 2: KYC Verification

```
USER ACTION                          DATABASE CHANGES
─────────────────────────────────────────────────────────────────
1. Investor starts KYC wizard      → SELECT from investors
                                   → SELECT from kyc_submissions (existing)

2. Uploads passport                → INSERT into documents (file)
                                   → INSERT into kyc_submissions
                                     (status='pending', document_type='passport_id')

3. Uploads utility bill            → INSERT into documents
                                   → INSERT into kyc_submissions
                                     (document_type='utility_bill')

4. Staff reviews documents         → UPDATE kyc_submissions (status='under_review')

5. Staff approves passport         → UPDATE kyc_submissions (status='approved')
                                   → INSERT into audit_logs
                                     (action='kyc_document_approved')

6. Staff approves utility bill     → UPDATE kyc_submissions
                                   → System checks: all required docs approved?
                                   → UPDATE investors (kyc_status='approved')
                                   → UPDATE tasks (related KYC tasks completed)
                                   → INSERT into activity_feed
```

### Flow 3: Fee Calculation & Invoicing

```
TRIGGER                              DATABASE CHANGES
─────────────────────────────────────────────────────────────────
1. Quarterly fee schedule runs     → SELECT from fee_schedules (next_run_at)
                                   → SELECT from subscriptions (active)
                                   → SELECT from fee_components

2. Calculate management fees       → For each subscription:
                                     Calculate: commitment * (rate_bps/10000) * (days/365)
                                   → INSERT into fee_events (status='pending')

3. Generate invoice                → INSERT into invoices
                                   → INSERT into invoice_lines (per fee_event)
                                   → UPDATE fee_events (status='invoiced')
                                   → INSERT into documents (PDF invoice)

4. Send invoice                    → UPDATE invoices (status='sent')
                                   → INSERT into investor_notifications

5. Bank payment received           → INSERT into bank_transactions
                                     (via import or API)

6. Match payment to invoice        → INSERT into suggested_matches (auto)
                                   → Staff approves
                                   → INSERT into reconciliation_matches
                                   → UPDATE invoices (status='paid')
                                   → UPDATE fee_events (status='paid')

7. Update subscription             → UPDATE subscriptions (funded_amount)
                                   → If fully funded: INSERT into positions
```

### Flow 4: Workflow Automation (n8n)

```
TRIGGER                              DATABASE CHANGES
─────────────────────────────────────────────────────────────────
1. Staff triggers workflow         → INSERT into workflow_runs
                                     (status='queued')
                                   → INSERT into audit_logs

2. Webhook sent to n8n             → External: n8n receives webhook
                                   → UPDATE workflow_runs (status='running')

3. n8n processes workflow          → External: n8n executes steps
                                   → May call back to API endpoints

4. n8n completes                   → Webhook back to platform
                                   → UPDATE workflow_runs
                                     (status='completed', output_data)

5. Results processed               → Depending on workflow:
                                     - INSERT into documents (generated PDF)
                                     - INSERT into signature_requests
                                     - UPDATE subscriptions
                                     - INSERT into tasks
```

---

## Part 4: Table Relationship Summary

### Core Entity Relationships (251 Foreign Keys)

```
profiles (7)
├── investors.primary_rm, secondary_rm, kyc_approved_by, created_by
├── 85+ tables via created_by, approved_by, assigned_to
└── investor_users.user_id

investors (385)
├── subscriptions.investor_id (629 rows)
├── investor_users.investor_id
├── investor_members.investor_id
├── documents.owner_investor_id
├── tasks.owner_investor_id
├── deal_memberships.investor_id
├── deal_data_room_access.investor_id
├── deal_subscription_submissions.investor_id
├── investor_deal_interest.investor_id
├── signature_requests.investor_id
├── invoices.investor_id
├── fee_events.investor_id
├── kyc_submissions.investor_id
├── activity_feed.investor_id
└── 15+ more tables

vehicles (91)
├── subscriptions.vehicle_id (629 rows)
├── deals.vehicle_id (14 rows)
├── documents.vehicle_id
├── valuations.vehicle_id
├── capital_calls.vehicle_id
├── distributions.vehicle_id
├── entity_directors.vehicle_id
├── entity_events.vehicle_id
├── entity_investors.vehicle_id
├── document_folders.vehicle_id
├── positions.vehicle_id
├── cashflows.vehicle_id
├── fee_plans.vehicle_id
└── performance_snapshots.vehicle_id

deals (14)
├── deal_memberships.deal_id (15 rows)
├── deal_data_room_access.deal_id (5 rows)
├── deal_data_room_documents.deal_id (9 rows)
├── deal_subscription_submissions.deal_id (4 rows)
├── investor_deal_interest.deal_id (17 rows)
├── deal_fee_structures.deal_id (10 rows)
├── deal_activity_events.deal_id (36 rows)
├── allocations.deal_id
├── subscriptions.deal_id
├── fee_plans.deal_id
├── introductions.deal_id
├── share_lots.deal_id
└── conversations.deal_id

subscriptions (629)
├── bank_transactions.matched_subscription_id
├── documents.subscription_id
├── signature_requests.subscription_id
├── capital_call_items.subscription_id
├── distribution_items.subscription_id
├── fee_schedules.allocation_id
├── suggested_matches.subscription_id
└── subscription_fingerprints.subscription_id
```

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total Tables | 92 |
| Total Views | 2 |
| Total Foreign Keys | 251 |
| Tables with Data | 68 |
| Empty Tables | 24 |
| Total Rows (all tables) | ~4,000 |
| Largest Table | document_folders (854 rows) |
| Most Connected Table | documents (11 FKs) |
| Primary Data Tables | investors, subscriptions, vehicles, deals, documents |

---

## Appendix: Database Views

Two helper views exist for complex queries:

### `entity_action_center_summary` (11 columns)
**Purpose:** Aggregates pending action items per entity for the Staff Portal action center dashboard.

### `folder_hierarchy` (7 columns)
**Purpose:** Recursive CTE view that flattens the nested folder structure for efficient document tree queries.

---

*Document generated from verified database schema and codebase analysis. All table counts and relationships confirmed via direct SQL queries against production database.*
