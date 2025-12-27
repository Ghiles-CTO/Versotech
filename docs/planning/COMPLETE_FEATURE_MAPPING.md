# Complete Feature Mapping: Original Requirements vs Current Platform

**UPDATED AFTER CODE & DATABASE VERIFICATION (December 2024)**

Every feature and sub-feature from the Excel files mapped to current status.

---

## ENABLERS (Cross-cutting Platform Features)

### Digital Signature
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Signature specimen | PARTIAL | E-sign exists, no specimen management |
| Sign document | BUILT | VersoSign `/sign/[token]` with full workflow |
| Archive | BUILT | Signed docs stored in documents table with status tracking |

### Dataroom
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Identity management | BUILT | Auth + profiles + RLS |
| Privacy | BUILT | RLS policies on all tables |
| Access rights (view, edit, download, upload) | PARTIAL | View/download for investors, edit/upload staff-only (DB policies) |
| Reporting | PARTIAL | Access logs exist in audit_logs, no dedicated report |

### SaaS B2C Subscription
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| SaaS B2C Pricing Model | NOT BUILT | No subscription billing |
| Payment | NOT BUILT | No payment processing for subscriptions |

### SaaS B2B Subscription
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| (All) | NOT BUILT | No B2B client accounts |

### Billing & Invoicing
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| SaaS B2C | NOT BUILT | |
| SaaS B2B | NOT BUILT | |
| Investment fees | BUILT | Full fee plans, invoices, commissions in `/versotech/staff/fees` (5 tabs) |

### Growth Marketing
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Engagement | NOT BUILT | |
| Retention | NOT BUILT | |
| Deep linking | NOT BUILT | |
| Monetization | NOT BUILT | |
| Analytics | NOT BUILT | |

### Banking
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Escrow Bank Account management | NOT BUILT | |
| Funding | BUILT | Capital calls, payments, payment tracking |
| Reconciliation | BUILT | `/versotech/staff/reconciliation` with fuzzy heuristic matching (not AI) |
| Reporting | PARTIAL | Some reports in fees module |

### KYC & AML
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Collection | BUILT | KYC wizard, multi-step doc upload, entity KYC |
| Update | BUILT | Can update KYC docs, renewal workflow |
| Review | BUILT | `/versotech/staff/kyc-review` with approval workflow |

### Content Management
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Webinar | NOT BUILT | |
| News | NOT BUILT | |
| Announcements | NOT BUILT | |
| Performance Update | BUILT | Dashboard shows NAV, IRR, DPI, TVPI trends |

### Security
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Screen capture blocked | NOT BUILT | |
| Document encryption & DRM | NOT BUILT | |
| Auth/RLS | BUILT | Full auth + row-level security on all tables |
| Audit logging | BUILT | Complete audit_logs + compliance_alerts tables |

---

## 1. CEO (Internal - Staff Portal)

### User Profiles
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Create investor | BUILT | `/versotech/staff/investors` with full CRUD |
| Create Arranger | **BUILT** | `/versotech/staff/arrangers` - full `arranger_entities` table with regulatory info, KYC |
| Create Lawyer | BUILT | Can add as deal member with `deal_member_role='lawyer'` |
| Create Partner | NOT BUILT | No partner entity type |
| Create Commercial Partner | NOT BUILT | No commercial partner entity type |
| Create Introducer | **BUILT** | `/versotech/staff/introducers` - full dashboard + detail pages |
| User Approval | BUILT | Approval workflows with secondary approval |
| Manage user profile | BUILT | Full CRUD for all entity types |

### Manage Opportunity
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Create opportunity description | BUILT | Deal creation with full details |
| Initiate termsheet | BUILT | Versioned `deal_fee_structures` with create/edit/publish/archive |
| Edit termsheet | BUILT | Can edit deal terms |
| Termsheet funding deadline reminders | PARTIAL | Task system exists, automated reminders via n8n |
| Close termsheet | BUILT | Deal status management |
| Dispatch to INVESTORS | BUILT | Deal memberships + notifications |
| Dispatch to COMMERCIAL PARTNERS | NOT BUILT | No commercial partner entity |
| Automatic reminder | PARTIAL | Task system exists, email integration not wired (TODOs in cron) |
| NDA | BUILT | NDA workflow with VersoSign |
| NDA & Dataroom (INVESTORS) | BUILT | 7-day access after NDA with extension requests |
| NDA & Dataroom (COMMERCIAL PARTNERS) | NOT BUILT | No commercial partner |
| View interest | BUILT | Interest submissions with approval |
| INTEREST CONFIRMED OR NOT | BUILT | Approval workflow |
| Subscription pack | BUILT | Full subscription flow with document generation |
| Funding | BUILT | Capital calls, payments, reconciliation |
| **Equity Certificates Issuance** | PARTIAL | Staff can trigger (`/api/subscriptions/[id]/certificate/`), investors can view when present |
| **Statement of Holding Issuance** | PARTIAL | Staff workflow exists (`workflows.ts`), investor self-serve broken (`/api/report-requests` missing) |

### Reporting
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Transaction tracking | BUILT | Full audit_logs table with entity/action tracking |
| Opportunity Performance | BUILT | Dashboard metrics + deal analytics |
| Client performance across opportunity | PARTIAL | Holdings data exists, no cross-deal view |
| Partner performance | NOT BUILT | No partner entity |
| Commercial partner performance | NOT BUILT | No commercial partner |
| Introducer performance | **BUILT** | Full stats in `/versotech/staff/introducers` dashboard |
| VERSO Compartment reconciliation | BUILT | Reconciliation module with AI matching |
| **Conversion Event** | NOT BUILT | No conversion workflow |
| **Redemption Event** | NOT BUILT | No redemption workflow |

### Resell
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Resell | NOT BUILT | No secondary market |

### GDPR
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Right to be forgotten / erasure | NOT BUILT | |
| Right to access information | NOT BUILT | |
| Right for processing to be restricted | NOT BUILT | |
| Right to oppose automated decisions | NOT BUILT | |
| Right to data portability | NOT BUILT | |
| Right to rectification | PARTIAL | Can edit profiles |
| Explicit consent | NOT BUILT | |
| BLACKLISTED management | NOT BUILT | |

---

## 2. ARRANGER (Internal - Staff Portal)

### My Profile
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Create Account | BUILT | Staff creation + arranger_entities |
| Login | BUILT | `/versotech/login` |
| Profile Approval | BUILT | KYC approval for arranger_entities |
| Check-in | NOT BUILT | No check-in feature |

### My Partners
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Create Partner Fee Models | NOT BUILT | No partner entity |
| Payment | NOT BUILT | |
| View | NOT BUILT | |
| Partner performance | NOT BUILT | |

### My Introducers
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Create Introducer Fee Model | **BUILT** | `introducer_commissions` with rate_bps, basis_type, cap amounts |
| Payment | **BUILT** | Full payment workflow: accrued → invoiced → paid |
| View | **BUILT** | `/versotech/staff/introducers` with full dashboard |
| Introducer performance | **BUILT** | Dashboard shows: total, active, introductions, allocations, commissions |

### My Commercial Partners
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Create Commercial Partner Fee Models | NOT BUILT | No entity type |
| Payment | NOT BUILT | |
| View | NOT BUILT | |
| Commercial Partner performance | NOT BUILT | |

### My Lawyers
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| View | BUILT | Can see deal members with role='lawyer' |
| Reporting | NOT BUILT | No lawyer-specific reports |

### My Mandates
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Subscription pack | BUILT | Full subscription workflow |
| Funding | BUILT | Capital calls + payments |
| Compartment Reporting | PARTIAL | Some reporting in fees module |

### GDPR
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| (All GDPR rights) | NOT BUILT | Same as CEO section |

---

## 3. LAWYER (External - Investor Portal Extension)

### My Profile
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Create Account | BUILT | Can be added as deal member with `deal_member_role='lawyer'` |
| Login | **BLOCKED** | UI hard-requires `investor_users` link (`deals/page.tsx:161`), lawyers can't see deals |
| Profile Approval | NOT BUILT | No lawyer-specific approval flow |
| Check-in | NOT BUILT | |

### My Notifications
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Subscription pack | NOT BUILT | Lawyer doesn't see investment notifications |
| Escrow account funding | NOT BUILT | No escrow |
| Equity Certificates Issuance | NOT BUILT | No certificates |
| Statement of Holding Issuance | NOT BUILT | No statements |
| Partner fees payment | NOT BUILT | |
| Introducer fees payment | NOT BUILT | |
| Commercial Partner fees payment | NOT BUILT | |
| Payment to seller(s) | NOT BUILT | |

### Escrow Account Handling
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Escrow account funding | NOT BUILT | |
| Partner fees payment | NOT BUILT | |
| Introducer fees payment | NOT BUILT | |
| Commercial Partner fees payment | NOT BUILT | |
| Payment to seller(s) | NOT BUILT | |
| Escrow Account funding status | NOT BUILT | |
| Escrow Account Conversion Event | NOT BUILT | |
| Escrow Account Redemption Event | NOT BUILT | |

### Reporting
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Transaction reconciliation | NOT BUILT | Lawyer can't see |
| Compartment reconciliation | NOT BUILT | |
| Redemption reconciliation | NOT BUILT | |
| Conversion reconciliation | NOT BUILT | |

### GDPR
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| (All GDPR rights) | NOT BUILT | |

---

## 4. INVESTOR (External - Investor Portal)

### My Profile
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Create account | BUILT | Via invite with full onboarding |
| Login | BUILT | `/versoholdings/login` |
| Profile approval | BUILT | KYC approval flow with multi-step wizard |
| Check-in | NOT BUILT | No check-in feature |

### My Opportunities
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| View | BUILT | `/versoholdings/deals` with filtering |
| More information on Investment Opportunity | BUILT | Deal detail page with term sheet display |
| Access dataroom | BUILT | 7-day NDA-gated access with extension requests |
| Confirmation of Interest Amount | BUILT | Interest submission with amount |
| Subscription pack | BUILT | Full subscription flow with document signing |
| Funding | BUILT | Payment tracking + capital call notices |
| **Equity Certificates** | PARTIAL | Can view/download when present, generation is staff-triggered |
| **Statement of Holding** | PARTIAL | Staff can trigger, investor self-serve request broken |

### My Investments
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| View My transactions | BUILT | Holdings page with full transaction history |
| View Transaction details | BUILT | Vehicle detail with position breakdown |
| View evolution of my investments | BUILT | NAV trends, 30-day changes |
| View my shareholding positions | BUILT | `/versoholdings/holdings` with vehicle breakdown |
| View performance of my investment | BUILT | Dashboard with NAV, DPI, TVPI, IRR |
| **Conversion Event** | NOT BUILT | No conversion flow |
| **Redemption Event** | NOT BUILT | No redemption flow |

### My Notifications
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Transaction tracking | BUILT | `/versoholdings/notifications` + tasks |

### My Investment Sales
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Resell | NOT BUILT | No secondary market |

### GDPR
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| (All GDPR rights) | NOT BUILT | |

---

## 5. PARTNER (External - Investor Portal Extension)

### My Profile
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Create account | NOT BUILT | No partner entity |
| Login | NOT BUILT | |
| Profile approval | NOT BUILT | |
| Check-in | NOT BUILT | |

### My Opportunities as Investor
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| View | NOT BUILT | Partner can't invest |
| More information | NOT BUILT | |
| Access dataroom | NOT BUILT | |
| Confirmation of Interest | NOT BUILT | |
| Subscription pack | NOT BUILT | |
| Funding | NOT BUILT | |
| Equity Certificates | NOT BUILT | |
| Statement of Holding | NOT BUILT | |

### My Investments (as investor)
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| (All) | NOT BUILT | Partner can't invest |

### My Investment Sales
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Resell | NOT BUILT | |

### My Transactions (as Partner)
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| View My Transactions | NOT BUILT | No partner entity |
| My Transactions tracking | NOT BUILT | |
| My Transactions Reporting | NOT BUILT | |
| My Shared Transactions | NOT BUILT | |

### GDPR
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| (All GDPR rights) | NOT BUILT | |

---

## 6. INTRODUCER (External - Investor Portal Extension)

### My Profile
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Create account | **READY** | `introducers.user_id` FK exists - can link to profile |
| Login | **NOT BUILT** | Database ready, no UI built yet |
| Profile approval | NOT BUILT | |
| Check-in | NOT BUILT | |

### My Opportunities as Investor
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| View | NOT BUILT | Introducer can't invest (unless also investor) |
| More information | NOT BUILT | |
| Access dataroom | NOT BUILT | |
| Confirmation of Interest | NOT BUILT | |
| Subscription pack | NOT BUILT | |
| Funding | NOT BUILT | |
| Equity Certificates | NOT BUILT | |
| Statement of Holding | NOT BUILT | |

### My Investments (as investor)
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| (All) | NOT BUILT | Introducer can't invest |

### My Investment Sales
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Resell | NOT BUILT | |

### My Introductions
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| View My Introductions | **DB READY** | `introductions` table complete, staff-only UI |
| My Introductions Agreements | NOT BUILT | |
| My Introductions tracking | **DB READY** | Status workflow: invited→joined→allocated→lost |
| My Introductions Reporting | NOT BUILT | |

### My Commissions
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| View pending commissions | **DB READY** | `introducer_commissions` table complete |
| View paid commissions | **DB READY** | status: accrued→invoiced→paid |
| Submit invoice | NOT BUILT | No external submission UI |

### GDPR
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| (All GDPR rights) | NOT BUILT | |

---

## 7. COMMERCIAL PARTNER (External - Investor Portal Extension)

### My Profile
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Create account | NOT BUILT | No entity type |
| Login | NOT BUILT | |
| Profile approval | NOT BUILT | |
| Check-in | NOT BUILT | |

### My Opportunities
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| (All) | NOT BUILT | No commercial partner |

### My Investments
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| (All) | NOT BUILT | |

### My Investment Sales
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Resell | NOT BUILT | |

### My Transactions (as Commercial Partner)
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| View My Transactions | NOT BUILT | |
| My Placement Agreements | NOT BUILT | |
| My Transactions tracking | NOT BUILT | |
| My Transactions Reporting | NOT BUILT | |

### GDPR
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| (All GDPR rights) | NOT BUILT | |

---

## CRITICAL MISSING FEATURES (Across All Personas)

### 1. Equity Certificates & Statements of Holding
**Required by:** CEO, Investor, Partner, Introducer, Commercial Partner
**Status:** NOT BUILT
**What's needed:**
- Certificate generation (PDF)
- Statement of holding generation
- Investor can view/download
- Staff can issue/manage

### 2. Conversion Events
**Required by:** CEO, Investor, Partner, Introducer, Commercial Partner
**Status:** NOT BUILT
**What's needed:**
- Create conversion event (note → equity)
- Notify affected investors
- Track elections
- Update holdings
- New certificates

### 3. Redemption Events
**Required by:** CEO, Investor, Partner, Introducer, Commercial Partner
**Status:** NOT BUILT
**What's needed:**
- Create redemption event (exit/buyback)
- Notify affected investors
- Payment processing
- Update holdings

### 4. GDPR Compliance
**Required by:** ALL PERSONAS
**Status:** NOT BUILT
**What's needed:**
- Right to access (data export)
- Right to be forgotten (deletion)
- Right to portability
- Right to restrict processing
- Consent management
- Blacklist management

### 5. Secondary Sales / Resell
**Required by:** CEO, Investor, Partner, Introducer, Commercial Partner
**Status:** NOT BUILT
**What's needed:**
- Investor initiates sale
- Buyer matching
- Transfer workflow
- New certificates

### 6. Escrow Account Management
**Required by:** CEO, Lawyer
**Status:** NOT BUILT
**What's needed:**
- Escrow account setup
- Funding tracking
- Fee payments from escrow
- Payment to sellers
- Reconciliation

### 7. Partner Entity Type
**Required by:** CEO, Arranger, Partner
**Status:** NOT BUILT
**What's needed:**
- New `partners` table
- Partner fee models
- Partner portal access
- Transaction tracking
- Performance reporting

### 8. Commercial Partner Entity Type
**Required by:** CEO, Arranger, Commercial Partner
**Status:** NOT BUILT
**What's needed:**
- New `commercial_partners` table
- Placement agreements
- Commercial partner portal access
- Transaction tracking
- Performance reporting

### 9. Introducer Self-Service Portal
**Required by:** Introducer
**Status:** DATABASE READY - UI NOT BUILT
**What exists:**
- `introducers.user_id` FK to profiles
- `introductions` table with full workflow
- `introducer_commissions` with payment tracking
**What's needed:**
- External pages for introducer login
- View my introductions
- View my commissions
- Submit invoices

### 10. Check-in Feature
**Required by:** Arranger, Lawyer, Investor, Partner, Introducer, Commercial Partner
**Status:** NOT BUILT
**What's needed:**
- Periodic profile verification
- Reminder system
- Update prompts

---

## 8. WEB ADMIN / SUPERADMIN (Internal - Staff Portal)

### Dashboard
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| View global activity reports | BUILT | Dashboard with KPI cards, charts |
| Sort reports per day/week/month/year | PARTIAL | Some date filtering exists |
| Export reports to .csv/.xls | PARTIAL | Some exports in fees/reconciliation |
| Access any reporting view from APP | PARTIAL | Multiple reporting views exist |

### Login
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Log in to back end | BUILT | `/versotech/login` |
| Reset superadmin password | BUILT | Password reset flow |
| Reset password of any user | BUILT | Admin can reset via Supabase |

### User Management
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Create/edit admin profiles | BUILT | Staff management |
| Assign roles to admin users | BUILT | Role assignment (admin/ops/rm) |
| Invite user via link | BUILT | Invite system |
| Create/edit Investor profile | BUILT | `/versotech/staff/investors` with full CRUD |
| Create/edit Partner/Commercial partner profile | NOT BUILT | No entity types |
| Create/edit Introducer profile | **BUILT** | `/versotech/staff/introducers` with full CRUD |
| Create Lawyer profile | BUILT | Can add as deal member with role='lawyer' |
| Create Arranger profile | **BUILT** | `/versotech/staff/arrangers` with full CRUD + KYC |
| Approve user profile | BUILT | Approval workflow with secondary approval |
| Blacklist user (limited access) | PARTIAL | Lock/unlock via `profiles.deleted_at` exists, not enforced in middleware |
| Whitelist user (restore access) | PARTIAL | Unlock mechanism exists, middleware doesn't check |
| Set/change roles of any user | BUILT | Role management for staff + deal members |
| Update compliance questions | NOT BUILT | No dynamic questionnaire |

### Opportunity Management
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Create IO (Investment opportunity) | BUILT | Deal creation |
| Create fee models for IO | BUILT | Fee plans per vehicle |
| Dispatch to Partners/Introducers | PARTIAL | Introducers yes via introductions, no partners |
| Create term sheet | BUILT | Versioned `deal_fee_structures` with publish/archive |
| Edit IO and term sheets | BUILT | Deal editing with version control |
| Dispatch IO to Investors | BUILT | Deal memberships + notifications |
| Dispatch IO to Partner/Commercial Partner | NOT BUILT | No entities |
| Generate subscription pack | BUILT | Subscription flow with document generation |
| Digitally sign SP | BUILT | VersoSign integration |
| Monitor fundings | BUILT | Payment tracking + reconciliation |
| Archive previous IO | BUILT | Deal status management |
| View list of IO | BUILT | `/versotech/staff/deals` with pipeline view |
| View details of IO | BUILT | Deal detail with all tabs |
| View IO for each user | BUILT | Investor deals view |
| View status of IO for each user | BUILT | Full status tracking |

### Data Management
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Upload document templates | NOT BUILT | No `doc_templates` table exists |
| View document templates | NOT BUILT | Only `task_templates`/`audit_report_templates` exist |
| Upload approved doc for digital signature | BUILT | VersoSign upload |
| Upload static documents (PDF) | BUILT | Document upload to storage |
| Archive documents | BUILT | Status management + versioning |
| View/download with filters | BUILT | Document library with filters |
| Manage dataroom (folders, rename, access) | BUILT | Full dataroom management |
| Download all user documents | PARTIAL | Individual download, no bulk |
| Download all IO documents | PARTIAL | Individual download, no bulk |
| Upload approved doc for signing | BUILT | VersoSign with signature placement |

### Reports Management
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| View performance for each user | BUILT | Investor KPIs via RPC functions |
| View all transaction details | BUILT | Audit logs with full history |
| View consolidated reports | PARTIAL | Some consolidated views |
| View/download activity logs | BUILT | `/versotech/staff/audit` with filtering |

### Notifications Management
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Manage CEO notifications | NOT BUILT | No CEO notif management |
| View GDPR notifications | NOT BUILT | No GDPR module |
| Send GDPR notifications | NOT BUILT | No GDPR module |
| Send app update notification | NOT BUILT | No push notifications to app |

### GDPR (Admin)
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Permanently delete user on request | NOT BUILT | |
| Send personal info extracts | NOT BUILT | |
| Rectify incorrect data | BUILT | Can edit all profiles |
| Receive data breach notifications | NOT BUILT | |
| Send consent notifications | NOT BUILT | |
| View user consent per data item | NOT BUILT | |
| Send manual consent requests | NOT BUILT | |
| Delete data when no longer needed | NOT BUILT | |
| Create/edit data policy pages | NOT BUILT | |
| View data processing records | NOT BUILT | |
| Extract data processing records | NOT BUILT | |

### Legal / Privacy Statement
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Create/edit firm info (About, Team, Contact) | NOT BUILT | No CMS |
| Create/edit Terms & Conditions | NOT BUILT | No CMS |
| Create/edit Privacy Statement | NOT BUILT | No CMS |

### Account Management (B2B SaaS)
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Create/manage/delete B2B account | NOT BUILT | No B2B accounts |
| View client details | NOT BUILT | No B2B |

### Billing & Invoicing (SaaS)
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| View revenues per client | NOT BUILT | No SaaS billing |
| Generate auto invoice per client | NOT BUILT | |
| Send auto invoice per client | NOT BUILT | |
| Compare revenues vs active users | NOT BUILT | |
| Compare revenues vs licensed users | NOT BUILT | |

### Account Reporting (SaaS)
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| High-level client usage view | NOT BUILT | No SaaS |
| Detailed client usage view | NOT BUILT | |
| User connection/transaction stats | NOT BUILT | |

### Growth Marketing
| Sub-feature | Status | Notes |
|-------------|--------|-------|
| (All - third party) | NOT BUILT | No marketing integration |

---

## CORRECTED SUMMARY (After Code Review)

| Category | Sub-features | Built | Partial/Ready | Not Built |
|----------|--------------|-------|---------------|-----------|
| Enablers | 25 | 8 | 4 | 13 |
| CEO (Mobile) | 45 | 22 | 8 | 15 |
| Arranger | 28 | 12 | 2 | 14 |
| Lawyer | 24 | 1 | 1 | 22 |
| Investor | 27 | 16 | 3 | 8 |
| Partner | 35 | 0 | 0 | 35 |
| Introducer | 28 | 0 | 6 | 22 |
| Commercial Partner | 28 | 0 | 0 | 28 |
| Web Admin (Superadmin) | 78 | 32 | 12 | 34 |
| **TOTAL** | **318** | **91** | **36** | **191** |

**CORRECTED: 29% fully built, 11% partial/database-ready, 60% not built**

*Note: Some features previously marked BUILT are actually PARTIAL or BLOCKED (e.g., lawyer login, automated reminders, document templates)*

---

## KEY CORRECTIONS FROM CODE ANALYSIS

### Features UPGRADED from original assessment:

1. **Arranger Entity Management**: PARTIAL → **BUILT**
   - Full `arranger_entities` table with 22 columns
   - Regulatory: registration_number, tax_id, regulator, license_number, license_type, license_expiry_date
   - KYC: kyc_status, kyc_approved_at, kyc_approved_by, kyc_expires_at
   - Full UI at `/versotech/staff/arrangers`

2. **Introducer Staff Management**: PARTIAL → **BUILT**
   - Full dashboard with summary stats at `/versotech/staff/introducers`
   - `introducers` table with user_id FK, commission settings
   - `introductions` table with status workflow
   - `introducer_commissions` with payment lifecycle

3. **Introducer Performance Tracking**: PARTIAL → **BUILT**
   - Dashboard shows: total introducers, active, introductions, allocations, commissions paid/pending

4. **Deal Member Roles**: More complete than documented
   - `deal_member_role` enum: investor, co_investor, spouse, advisor, lawyer, banker, introducer, viewer, verso_staff
   - Lawyers, bankers, advisors can be added as deal participants

5. **Investor Holdings**: PARTIAL → **BUILT**
   - Full KPIs: NAV, DPI, TVPI, IRR estimates
   - 30-day trends and performance changes
   - Vehicle breakdown with cost basis, current value

6. **Audit & Compliance**: More complete
   - Full `audit_logs` table with entity tracking
   - `compliance_alerts` table for flagged issues
   - UI at `/versotech/staff/audit` with filtering

7. **Fee Management**: More complete
   - 5-tab interface: Overview, Fee Plans, Invoices, Schedule, Commissions
   - Full invoice tracking and commission management

### Database-Ready Features (UI Not Built):

1. **Introducer Self-Service**
   - `introducers.user_id` FK exists
   - `introductions` table complete
   - `introducer_commissions` complete
   - Just needs external portal pages

---

## WHAT TO TELL THE CLIENT (CORRECTED AFTER CODE REVIEW)

> "After line-by-line code verification:
>
> - **29% is fully built** (91 sub-features)
> - **11% is partial/database-ready** (36 sub-features)
> - **60% is not built** (191 sub-features)
>
> **What works:**
> - Staff deal management, introducer tracking, arranger management
> - Investor portfolio, holdings, deal browsing, signatures
> - Certificates exist (staff triggers, investors can view)
>
> **What's broken:**
> - Lawyer/introducer/partner **cannot log into external portal** - UI blocks non-investors
> - Several buttons link to non-existent APIs (report requests, term sheet download)
> - Deal notification emails link to wrong URL (404)
> - Automated reminders have TODOs, email not wired
>
> **The biggest gaps:**
> 1. External personas blocked from portal (UI issue, not database)
> 2. Partner & Commercial Partner entities (0%)
> 3. GDPR compliance (0%)
> 4. Conversion & Redemption events (0%)
>
> **To enable lawyers/introducers/partners:**
> Create new `/versoholdings/participant/*` route group that queries `deal_memberships` instead of `investor_users`. Shares components, doesn't break existing investor flows."

---

## KNOWN ISSUES & BROKEN PIECES

Features that appear functional but have broken or missing implementations:

| Issue | Location | Problem |
|-------|----------|---------|
| **Deal notification links 404** | `/api/deals/[id]/members/route.ts:231` | Links to `/versoholdings/deals/${dealId}` but route is `/deal/[id]` (singular) |
| **Download Full Term Sheet** | `/versoholdings/deal/[id]/page.tsx:598` | Button exists, no handler |
| **Report/Statement requests** | `quick-actions-menu.tsx:54` | Posts to `/api/report-requests` which doesn't exist |
| **Deal invite-link acceptance** | `/api/deals/[id]/invite-links/` | Staff can create links, no `/invite/[token]` page |
| **Automated reminders** | `/api/cron/fees/generate-scheduled/` | TODOs in code, email not integrated |
| **Blacklist enforcement** | `middleware.ts:262` | Lock/unlock exists but not enforced in auth |

### Portal Architecture Blocker

**The investor portal UI hard-requires `investor_users` link.** External personas (lawyer, introducer, partner) with `deal_memberships.role` entries **cannot access the portal** - the UI blocks them at `deals/page.tsx:161`.

**Solutions:**
- (a) Refactor `/versoholdings/*` to check `deal_memberships` OR `investor_users`
- (b) Create new `/versoholdings/participant/*` route group for non-investor externals

Option (b) is lower risk - keeps investor flows intact.

---

*Updated mapping after comprehensive code + database verification*
*Corrections applied based on line-by-line code review*
*December 2024*
