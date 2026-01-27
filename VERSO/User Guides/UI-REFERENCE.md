# Versotech UI Reference

> **Verified from Screenshots** - All UI elements documented here are confirmed from actual application screenshots (91 screenshots analyzed).

---

## Sidebar Navigation by Persona

### Investor Sidebar
```
Dashboard
Investment Opportunities
Portfolio
Documents
Inbox
Profile
```

### Arranger Sidebar
```
Dashboard
My Mandates
Subscription Packs
Escrow
Reconciliation
Fee Plans
Payment Requests
My Partners
My Introducers
My Commercial Partners
My Lawyers
VERSOSign
```

### Introducer Sidebar
```
Dashboard
Introductions
Agreements
My Commissions
VersoSign
Profile
```

### Commercial Partner Sidebar
```
Dashboard
Opportunities
Client Transactions
My Commissions
Portfolio
Agreements
Profile
Notifications
Messages
```

### CEO/Staff Sidebar
```
Dashboard
Messages
Approvals
Deals
Vehicles
Subscriptions
Users
Accounts
Investors
Introducers
Arrangers
Documents
```

### Staff (KYC Review context) Sidebar
```
Arrangers
Documents
VersoSign
Introducer Agreements
Fees
Reconciliation
KYC Review
Audit
Requests
Calendar
Processes
Admin
```

---

## Page-Specific UI Elements

### Login Page
- **Title**: VERSO logo
- **Fields**: EMAIL ADDRESS, PASSWORD
- **Links**: "Forgot Password?"
- **Button**: "SIGN IN"
- **Footer text**: "Request Access: Please contact us at contact@versotech.com"

---

### Investor Dashboard
- **Title**: Welcome message with company info
- **Summary Cards**:
  | Card | Description |
  |------|-------------|
  | OPEN OPPORTUNITIES | Available deals count |
  | OUTSTANDING TASKS | Pending actions count |
  | ACTIVE HOLDINGS | Investment vehicles count |
- **Buttons**: "View holdings", "Calendar & deadlines"
- **Section**: "Featured Opportunities" with deal cards

### Investor - Investment Opportunities Page
- **Title**: "Investment Opportunities"
- **Subtitle**: "Track active allocations, NDAs, and subscriptions throughout the deal pipeline."
- **Summary Cards**:
  | Card | Description |
  |------|-------------|
  | Open deals | Ready for exploration |
  | Pending interests | Awaiting team review |
  | Active NDAs | Data room unlocked |
  | Subscriptions in review | Awaiting confirmation |
- **Search**: "Search deals by name, company, sector, location..."
- **Filters**: All Status, All Types, All Stages, Closing Date
- **Button**: "Filters"
- **Deal Cards show**: Logo, Name, Status badge (OPEN/CLOSED), Category (AI, Primary Equity), Stage, Sector, Location, ALLOCATION, MINIMUM TICKET, UNIT PRICE, TIMELINE

### Investor - Profile Page
- **Header**: Entity name + avatar
- **Status badges**: "Active" (green), "KYC Approved" (blue)
- **Tabs**: Overview, KYC, Compliance, Team, Directors/UBOs, Entities, Signature, Security, Preferences
- **Sections**:
  - Your Information (Full Name, Email, Role)
  - Entity Information (Display Name, Legal Name, Type) with Edit button
  - Contact Information with Edit button
  - Registered Address

### Investor - KYC Tab
- **Title**: "KYC Documents"
- **Subtitle**: "Upload required identity and verification documents."

---

### Arranger Dashboard
- **Title**: "Arranger Dashboard"
- **Entity name**: Below title (e.g., "VERSO MANAGEMENT LTD")
- **Badge**: "KYC: approved"
- **Summary Cards**:
  | Card | Description |
  |------|-------------|
  | Total Mandates | X (Y active, Z pending) |
  | Active Network | On your mandates |
  | Total Commitment | $ Across all mandates |
  | Assigned Lawyers | On your mandates |
- **Escrow Funding Status**: Shows % Funded, amount funded/total, investors pending, Outstanding amount
- **Fee Pipeline**: Total pending collection, Accrued, Invoiced, Total Paid
- **Section**: "Subscription Pack Pipeline" - Document signing status across your mandates

### Arranger - Fee Plans Page
- **Title**: "Fee Plans"
- **Subtitle**: "Create and manage fee structures for your network partners"
- **Info Box**: "How Fee Plans Work: Create fee structures for your partners, introducers, and commercial partners..."
- **View Toggle**: "List View" | "By Opportunity"
- **Button**: "+ Create Fee Plan"
- **Table Header**: "Your Fee Plans" with count
- **Columns**: Plan Name, Assigned To, Fee Components, Status, Actions
- **Status badges**: Active (green), Inactive (gray), Sent (blue)

---

### Introducer - My Commissions Page
- **Title**: "My Commissions"
- **Subtitle**: "View and manage your commission payments"
- **Role badge**: "Introducer" (top right)
- **Summary Cards**:
  | Card | Color | Description |
  |------|-------|-------------|
  | Total Owed | Green | Pending payment |
  | Total Paid | Green | Completed |
  | Invoice Requested | Yellow | Submit your invoice |
  | Invoiced | Blue | Awaiting payment |
- **Filters**: "All Status" dropdown, "Pick a date range" button
- **Table**: "Commissions" with count
- **Columns**: Status, Deal, Arranger, Basis, Amount, Due Date, Created, Actions
- **Basis value**: "Invested Amount" (confirms commission calculation basis)
- **Amount format**: "$X,XXX X.XX%"

---

### Commercial Partner Dashboard
- **Title**: "Commercial Partner Dashboard"
- **Entity name**: Below title
- **Badges**: "WEALTH MANAGER", "KYC: not_started"
- **Summary Cards**:
  | Card | Description |
  |------|-------------|
  | Clients Managed | X active clients |
  | Active Opportunities | X total dispatched |
  | Client Investments | $ Via proxy subscriptions |
  | Own Investments | $ Direct investments |
- **Commission Earnings Section**:
  | Status | Description |
  |--------|-------------|
  | Paid | $ |
  | Accrued | $ |
  | Pending | $ |
- **Bottom Cards**: Total Subscriptions (X pending), Active Placement Agreements

---

### CEO/Staff - Approval Queue Page
- **Title**: "Approval Queue"
- **Subtitle**: "Review and approve investor commitments and allocations"
- **Summary Cards**:
  | Card | Description |
  |------|-------------|
  | Pending Approvals | Requiring review |
  | SLA Breaches | Past deadline (red) |
  | Avg Processing Time | Last 30 days |
- **View Toggle**: Table, Kanban, List, Grid
- **Buttons**: Filter, Export, Refresh
- **Columns**: Request Type / User, Entity, Priority, SLA Status, Assigned To, Actions
- **Request Types**: DEAL INTEREST, SALE REQUEST, etc.
- **Priority badges**: LOW, MEDIUM, HIGH
- **SLA Status**: Shows overdue time in red (e.g., "1035h overdue")

### CEO/Staff - Approval Queue (Kanban View)
- **Group by**: Status | Priority toggle
- **Columns**:
  - Pending Review (yellow) with count
  - Approved (green) with count
  - Rejected (red) with count

### CEO/Staff - KYC Document Review Page
- **Title**: "KYC Document Review"
- **Subtitle**: "Review and approve investor KYC documents"
- **Summary Cards**: Total, Draft, Pending (orange), Under Review, Approved (green), Rejected (red), Expired
- **Filters**: Status (All Statuses), Document Type (All Types), Investor (All Investors), Search
- **Table**: "Submissions" with count
- **Columns**: Investor, Document Type, Content, Submitted, Status, Reviewer, Actions

### CEO/Staff - VERSOSign Page
- **Title**: "VersoSign"
- **Subtitle**: "Document signature management and countersigning"
- **Summary Cards**:
  | Card | Color | Description |
  |------|-------|-------------|
  | Pending Signatures | Default | Count |
  | In Progress | Default | Count |
  | Completed Today | Green | Signed today |
  | Overdue | Red | Count |
- **Tabs**: Countersignatures, Manual Follow-ups, Completed, Expired
- **Section**: "Pending Countersignatures" - "Subscription agreements awaiting your countersignature"

---

## Common UI Patterns

### Status Badges
| Status | Color | Context |
|--------|-------|---------|
| OPEN | Green | Deal status |
| CLOSED | Gray/Red | Deal status |
| Active | Green | Agreement/Profile |
| Inactive | Gray | Fee plan |
| Sent | Blue | Fee plan |
| KYC Approved | Blue | Profile badge |
| Invoiced | Green | Commission |
| Pending | Orange/Yellow | Various |
| Overdue | Red | SLA breaches |

### Action Buttons
- Primary: Blue background
- Secondary: Gray/outline
- Destructive: Red (delete icons)
- Icons: Checkmark (approve), X (reject), Trash (delete)

### Filters Pattern
- Dropdowns with "All X" default
- Date range pickers with "Pick a date range"
- Search inputs with placeholder text

### Tables
- Checkbox column for bulk selection
- Sortable columns (click header)
- Row hover highlighting
- Actions column with icon buttons

---

## Confirmed Field Names (from Screenshots)

### Commission Fields
- Status, Deal, Arranger, Basis, Amount, Due Date, Created, Actions
- Basis always shows "Invested Amount"

### Approval Queue Fields
- Request Type / User, Entity, Priority, SLA Status, Assigned To, Actions

### KYC Review Fields
- Investor, Document Type, Content, Submitted, Status, Reviewer, Actions

### Fee Plan Fields
- Plan Name, Assigned To, Fee Components, Status, Actions

---

## Screenshot Inventory (91 files)

### Login/General (5)
- 01-login-page.png, 02-login-form.png
- 04-identity-menu.png, 05-notifications-panel.png
- 13-versosign.png

### CEO/Staff (12)
- 03-ceo-dashboard.png (full version available)
- 06-approvals-page.png, 07-approvals-kanban.png
- 08-kyc-review.png, 09-audit-page.png
- 10-reconciliation.png, 11-users-page.png
- 12-accounts-entities.png, 14-deals-page.png

### Arranger (10)
- 15-arranger-dashboard.png, 16-arranger-mandates.png
- 17-deal-detail.png (full version available)
- 18-fee-plans.png, 19-my-introducers.png
- 20-my-partners.png, 21-my-commercial-partners.png
- 22-my-lawyers.png

### Investor (10)
- 23-investor-dashboard.png
- 24-investor-opportunities.png (full version available)
- 25-investor-deal-detail.png
- 26-investor-portfolio.png, 27-investor-profile.png
- 28-investor-kyc-tab.png

### Introducer (4)
- 29-introducer-dashboard.png, 30-introducer-introductions.png
- 31-introducer-commissions.png (full version available)

### Commercial Partner (3)
- 32-commercial-partner-dashboard.png
- 33-cp-agreements.png, 34-cp-commissions.png

### Additional Named Screenshots (47)
- Various persona-specific screenshots with descriptive names
- Full-page versions with "-full" suffix
- Timestamped versions for verification

---

*Last updated: Based on screenshot analysis from Jan 24-25, 2026*
