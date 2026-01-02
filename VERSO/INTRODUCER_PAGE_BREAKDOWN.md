# Introducer Persona - Page-by-Page Breakdown

> A comprehensive guide to every page available to Introducers and what they should be able to do on each.

---

## Navigation Structure

When logged in as an **Introducer**, the sidebar shows:

```
├── Dashboard
├── Introductions
├── Agreements
├── My Commissions
├── VersoSign
└── Profile
```

Additionally, if the user has **dual-persona** (Introducer + Investor), they can switch context to access Investor pages.

---

## 1. Dashboard (`/versotech_main/dashboard`)

### Purpose
The command center for Introducers - provides at-a-glance view of their business with VERSO.

### What They Should See

#### Header Section
- **Welcome message** with Introducer entity name (e.g., "PYM Consulting")
- **Alert banner** if there are agreements awaiting approval
- **Date range filter** for metrics

#### Key Metrics Cards
| Metric | Description |
|--------|-------------|
| **Total Introductions** | Count of all referrals made, with breakdown by status (pending, converted) |
| **Conversion Rate** | Percentage of introductions that resulted in funded investments |
| **Commission Earned** | Total commissions paid to date |
| **Pending Commission** | Commissions accrued or invoiced but not yet paid |

#### Performance Analytics
- **This Month** comparison vs last month
- **Trend indicators** (up/down arrows with percentages)
- **Average Commission** per successful introduction

#### Recent Introductions Widget
- List of latest 5 referrals
- Shows: Prospect email, Deal name, Status, Date
- Quick link to "View All"

#### Fee Agreement Widget
- Current active agreement summary
- Commission rate (e.g., 1.50%)
- Effective date and expiry
- Link to "View Agreement"

### User Stories Covered
- 6.1.4-01: Know the most interesting features available
- 6.6.4-01: See revenues generated (summary view)
- 6.6.4-02: See revenues per opportunity (summary)

---

## 2. Introductions (`/versotech_main/introductions`)

### Purpose
Track all investor referrals and their journey through the investment pipeline.

### What They Should See

#### Header Section
- **Page title**: "My Introductions"
- **Export CSV** button for data download
- **Subtitle** showing entity context

#### Summary Metrics
| Metric | Description |
|--------|-------------|
| **Total Introductions** | Count with status breakdown |
| **Allocated** | Successfully converted introductions |
| **Commission Earned** | Total paid out |
| **Pending Commission** | Awaiting payment |

#### Filters
- **Status filter**: All / Invited / Joined / Allocated / Lost / Inactive
- **Date range picker** (optional)

#### Introductions Table
| Column | Description |
|--------|-------------|
| **Prospect** | Email of the referred investor |
| **Deal** | Name of the investment opportunity + company |
| **Status** | Current stage (invited → joined → allocated → lost/inactive) |
| **Introduced** | Date of introduction |
| **Commission** | Earned/pending amount for this introduction |
| **Actions** | Data Room access link (if NDA signed) |

### Status Definitions
| Status | Meaning |
|--------|---------|
| `invited` | Investor has been invited to the opportunity |
| `joined` | Investor has expressed interest |
| `allocated` | Investor has funded - introduction successful |
| `lost` | Investor passed on the opportunity |
| `inactive` | Introduction is dormant/expired |

### What They Can Do
1. **View all introductions** with filtering
2. **Access Data Room** for deals where investor has signed NDA
3. **Export to CSV** for reporting
4. **Track conversion** from invitation to funding

### User Stories Covered
- 6.6.1-01 through 6.6.1-06: Display opportunities by status
- 6.6.1-07: Display Investment Opportunity details
- 6.6.1-08: Access data room
- 6.6.3-01 through 6.6.3-04: View notifications per status

---

## 3. Agreements (`/versotech_main/introducer-agreements`)

### Purpose
Manage fee agreements that define commission terms with VERSO/Arrangers.

### What They Should See

#### Header Section
- **Default commission rate** badge
- **Total Agreements** count

#### Summary Metrics
| Metric | Description |
|--------|-------------|
| **Total Agreements** | All fee arrangements |
| **Active** | Currently in effect |
| **In Progress** | Draft or pending approval |
| **Expiring Soon** | Within 30 days of expiry |

#### Agreements Table
| Column | Description |
|--------|-------------|
| **Type** | Agreement type (standard, enhanced, etc.) |
| **Commission** | Rate in percentage (e.g., 1.50%) |
| **Territory** | Geographic scope (Global, Europe, MENA, etc.) |
| **Effective** | Start date |
| **Expires** | End date or "No expiry" |
| **Status** | Draft / Pending Approval / Active / Expired |

### Agreement Statuses
| Status | Meaning | Introducer Action |
|--------|---------|-------------------|
| `draft` | Being prepared | Wait for arranger |
| `pending_approval` | Sent to introducer | Review & Approve/Reject |
| `active` | Signed and in effect | No action needed |
| `expired` | Past expiry date | Request renewal |

### What They Can Do
1. **View all agreements** and their terms
2. **Click on agreement** to see full details
3. **Filter by status** (if implemented)

### User Stories Covered
- 6.6.2-01: Display Introducer agreement
- 6.6.2-09: Display list of Introducer Agreements
- 6.6.1-09: Display fee model per opportunity

---

## 4. Agreement Detail (`/versotech_main/introducer-agreements/[id]`)

### Purpose
Full view of a specific agreement with approval/signing workflow.

### What They Should See

#### Header Section
- **Status badge** (Pending Approval, Active, etc.)
- **"Agreement with [Entity Name]"** title
- **Action buttons**: Reject / Approve Agreement (if pending)

#### Agreement Details Card
| Field | Description |
|-------|-------------|
| **Commission Rate** | Percentage and basis points |
| **Agreement Type** | Standard, Enhanced, etc. |
| **Effective Date** | When it takes effect |
| **Expiry Date** | When it ends |
| **Territory** | Geographic scope |
| **Payment Terms** | Net 30, Net 45, etc. |

#### Agreement Timeline
Visual progress indicator showing:
1. **Agreement Created** - Draft prepared
2. **Sent to Introducer** - For review
3. **Introducer Review** - Awaiting approval ← Current if pending
4. **CEO Signature** - CEO to sign first
5. **Introducer Signature** - Countersign
6. **Agreement Active** - In effect

#### Introducer Information Card
- Entity name and status
- Contact person
- Email address

### What They Can Do (if Pending Approval)
1. **Approve Agreement** - Accept the terms
2. **Reject Agreement** - Decline with reason
3. **Review PDF** - Download agreement document (if attached)

### What They Can Do (if Approved, Awaiting Signature)
1. **Sign Agreement** - Via VersoSign e-signature

### User Stories Covered
- 6.6.2-02: View reminders to approve
- 6.6.2-03: View reminders to sign
- 6.6.2-04: Approve an agreement
- 6.6.2-05: Sign an agreement
- 6.6.2-07: Reject an agreement
- 6.6.2-10: View more details

---

## 5. My Commissions (`/versotech_main/my-commissions`)

### Purpose
Track all commission earnings, submit invoices, and monitor payment status.

### What They Should See

#### Header Section
- **Page title**: "My Commissions"
- **Entity context** displayed

#### Summary Metrics
| Metric | Description |
|--------|-------------|
| **Total Owed** | All pending payments |
| **Total Paid** | Completed payments |
| **Invoice Requested** | Commissions awaiting invoice submission |
| **Invoiced** | Submitted, awaiting payment |

#### Action Required Alert
- Prominent banner if commissions need invoice submission
- Shows amount awaiting invoice

#### Filters
- **Status filter**: All / Accrued / Invoice Requested / Invoiced / Paid
- **Date range picker**

#### Commissions Table
| Column | Description |
|--------|-------------|
| **Status** | Current payment stage |
| **Deal** | Investment opportunity name |
| **Arranger** | Managing arranger (if applicable) |
| **Basis** | Calculation basis (invested amount, spread, etc.) |
| **Amount** | Commission value |
| **Rate** | Commission rate applied |
| **Due Date** | Payment due date |
| **Created** | When commission was created |
| **Actions** | Submit Invoice button (if applicable) |

### Commission Statuses
| Status | Meaning | Introducer Action |
|--------|---------|-------------------|
| `accrued` | Calculated but not yet payable | Wait |
| `invoice_requested` | VERSO requests invoice | Submit Invoice |
| `invoiced` | Invoice submitted | Wait for payment |
| `paid` | Payment completed | None |
| `cancelled` | Commission cancelled | None |
| `rejected` | Invoice rejected | Resubmit |

### What They Can Do
1. **View all commissions** with status tracking
2. **Submit Invoice** for commissions in "invoice_requested" status
3. **Filter by status** to find specific commissions
4. **Filter by date range** for reporting periods
5. **Track payment progress** from accrual to payment

### User Stories Covered
- 6.6.4-01: See revenues between 2 dates
- 6.6.4-02: See revenues per opportunity/investor
- 6.6.4-03: Send REDEMPTION Fees Invoice
- 6.6.4-04: View approval notification
- 6.6.4-05: View request for change
- 6.6.4-06: Confirmation payment completed
- 6.6.3-05: View notification invoice sent
- 6.6.3-06: View notification payment processed
- 6.6.3-07: View transaction summary prior to invoice

---

## 6. VersoSign (`/versotech_main/versosign`)

### Purpose
Electronic signature management for all documents requiring Introducer signature.

### What They Should See

#### Summary Metrics
| Metric | Description |
|--------|-------------|
| **Pending Signatures** | Documents awaiting signature |
| **In Progress** | Partially signed documents |
| **Completed Today** | Recently completed |
| **Overdue** | Past deadline |

#### Tabs
| Tab | Content |
|-----|---------|
| **Countersignatures** | Documents where Introducer countersigns after CEO |
| **Manual Follow-ups** | Documents requiring attention |
| **Completed** | Successfully signed documents |
| **Expired** | Signature requests that expired |

#### Pending Countersignatures List
For each document:
- Document name/type
- Related deal/entity
- Sent date
- Deadline
- **Sign Now** button

### What They Can Do
1. **View pending signature requests**
2. **Sign documents electronically** via embedded signing
3. **Track signature status** across all documents
4. **Access completed signed documents**

### User Stories Covered
- 6.6.2-05: Sign Introducer Agreement
- 6.6.2-06: Notification agreement signed
- 6.2.5-09: Digitally sign subscription pack (as investor)

---

## 7. Profile (`/versotech_main/introducer-profile`)

### Purpose
Manage Introducer entity information, account settings, and data privacy.

### What They Should See

#### Header Section
- **Entity name** with status badge (active)
- **Role badge** (admin, member)
- **Edit Profile** button

#### Quick Stats
- Total Introductions
- Commission Rate
- Agreement Status

### Profile Tabs

#### Tab 1: Profile
**Introducer Information**
| Field | Description |
|-------|-------------|
| Legal Name | Registered entity name |
| Contact Person | Primary contact |
| Email | Contact email |
| Default Commission | Standard rate |
| Payment Terms | Net 30, etc. |
| Member Since | Registration date |
| Notes | Additional information |

**Your Account**
| Field | Description |
|-------|-------------|
| Name | User's full name |
| Email | Login email |
| Role | Permission level (admin, member) |
| Can Sign Documents | Signing authority |

#### Tab 2: Agreement
- **Active Agreement** details
- Agreement type, commission rate, territory
- Effective and expiry dates
- Status

#### Tab 3: Security
**Change Password Form**
- Current Password
- New Password
- Confirm New Password
- Update Password button

#### Tab 4: Preferences (GDPR)
**Notification Preferences**
- Email Notifications toggle
- Deal Updates toggle
- Message Notifications toggle
- Save Preferences button

**Data & Privacy (GDPR)**
| Feature | Description |
|---------|-------------|
| **Export Your Data** | Download all personal data (CSV/JSON) |
| **Request Account Deletion** | Right to be forgotten |
| **View Privacy Policy** | Data processing information |
| **Your Data Rights** | Explanation of GDPR rights |

### What They Can Do
1. **View entity information**
2. **Edit profile** (if permitted)
3. **Change password**
4. **Configure notification preferences**
5. **Export personal data** (GDPR)
6. **Request account deletion** (GDPR)
7. **View privacy policy**

### User Stories Covered
- 6.1.1-03: Update profile for re-approval
- 6.1.3-01: Complete profile for approval
- 6.1.3-04: Complete profile if incomplete
- 6.1.4-03: Customize profile
- 6.7.1-01: Submit rectify/erase/transfer request
- 6.7.2-01: Download personal information
- 6.7.3-01: Restrict data usage
- 6.7.4-01: Right to be forgotten
- 6.7.5-01: View data policy
- 6.7.6-01: Request data rectification
- 6.7.7-01: Withdraw consent

---

## Dual-Persona: Investor Pages

If the Introducer also has an **Investor** persona, they can switch context to access:

### Investment Opportunities (`/versotech_main/opportunities`)
- View available deals
- Express interest
- Submit for data room access
- Subscribe to investments

### Portfolio (`/versotech_main/portfolio`)
- View holdings
- Track NAV performance
- Monitor TVPI, DPI, IRR
- See capital deployment

### Documents (`/versotech_main/documents`)
- Access statements
- Download subscription packs
- View equity certificates
- Get tax documents

### Inbox (`/versotech_main/inbox`)
- View messages
- Track notifications
- Respond to queries

---

## Permission Matrix

| Page | View | Edit | Action |
|------|------|------|--------|
| Dashboard | ✅ All | ❌ | Filter dates |
| Introductions | ✅ Own | ❌ | Export CSV, Access Data Room |
| Agreements | ✅ Own | ❌ | Approve, Reject, Sign |
| My Commissions | ✅ Own | ❌ | Submit Invoice |
| VersoSign | ✅ Own | ❌ | Sign Documents |
| Profile | ✅ Own | ✅ Own | Edit, Change Password, GDPR actions |

---

## API Endpoints Used

| Page | Primary Endpoints |
|------|-------------------|
| Dashboard | `GET /api/introducer/dashboard` |
| Introductions | `GET /api/introductions` |
| Agreements | `GET /api/introducer-agreements`, `PATCH /api/introducer-agreements/[id]` |
| My Commissions | `GET /api/introducer/commissions`, `POST /api/introducer/commissions/[id]/invoice` |
| VersoSign | `GET /api/signature-requests` |
| Profile | `GET /api/introducer/profile`, `PATCH /api/introducer/profile` |

---

## Database Tables Involved

| Table | Purpose |
|-------|---------|
| `introducers` | Entity information |
| `introducer_users` | User-to-entity mapping |
| `introducer_agreements` | Fee agreements |
| `introducer_commissions` | Commission records |
| `introductions` | Referral tracking |
| `deals` | Investment opportunities |
| `signature_requests` | E-signature tracking |

---

*Document created January 1, 2026*
