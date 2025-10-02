# Bank Reconciliation PRD - VersoTech Staff Portal

**Version:** 1.0
**Product:** VERSO VersoTech Staff Portal
**Audience:** Business stakeholders, Product managers, Engineers
**Last Updated:** October 2, 2025

---

## Executive Summary

The Bank Reconciliation module is VERSO's financial control center for matching incoming bank transactions against outstanding invoices, ensuring accurate payment tracking, and maintaining audit-ready financial records. When investors pay management fees, subscription fees, or performance fees via wire transfer, those payments appear in VERSO's bank statements and must be reconciled against issued invoices to update accounting records and investor account balances.

This system automates the labor-intensive process of matching bank transactions (wire transfers, ACH payments) with fee invoices using intelligent pattern matching, counterparty name fuzzy search, and amount verification. Staff members review suggested matches, approve or reject them, and manually link transactions for edge cases where automation fails. The module maintains a complete audit trail of all reconciliation actions, flags overdue invoices, and provides real-time dashboards of outstanding receivables.

Behind the scenes, Reconciliation integrates with Fees Management (invoice generation), Investor Management (payment history), and Audit Log (immutable reconciliation record). The system supports multi-currency transactions with exchange rate handling, partial payment matching, and exception workflows for disputed payments.

---

## Part 1: Business Context (Non-Technical)

### What is Bank Reconciliation?

The Bank Reconciliation module is the central system for connecting VERSO's bank account activity with internal accounting records. It handles:

- **Bank Data Import**: CSV/MT940 file import from VERSO's banking partners (Swiss bank accounts, European accounts)
- **Transaction Parsing**: Extract transaction date, amount, currency, counterparty, reference/memo from bank statements
- **Invoice Tracking**: Monitor all outstanding fee invoices awaiting payment
- **Auto-Matching**: Intelligent algorithm suggests transaction-invoice matches based on amount, counterparty, timing
- **Manual Matching**: Staff tool for linking transactions to invoices when auto-match fails
- **Payment Application**: Update invoice status to "paid", record payment date, update investor ledger
- **Exception Handling**: Manage unmatched transactions, partial payments, overpayments, disputed payments
- **Reporting**: Outstanding receivables aging, match rate KPIs, reconciliation completeness

**Key Concepts:**

1. **Bank Transaction**:
   - A line item from bank statement showing money received
   - Attributes: Date, amount, currency, sender (counterparty), reference/memo
   - Statuses: unmatched, partially_matched, matched

2. **Invoice**:
   - A bill sent to investor for fees owed
   - Attributes: Invoice ID, investor, amount, due date, fee type
   - Statuses: draft, sent, paid, overdue, cancelled

3. **Match**:
   - A link between bank transaction and invoice
   - Match confidence score (0-100%) based on algorithm
   - Match types: exact (100% match), partial (amount differs), manual (staff-created)

4. **Reconciliation Status**:
   - **Reconciled**: All bank transactions matched to invoices
   - **Unreconciled**: Outstanding transactions or invoices without matches
   - **Partially Reconciled**: Some matches pending review or partial payments

### Why Does It Matter?

**For VERSO Finance Team:**
- **Cash Accuracy**: Know exactly which investors have paid and which haven't
- **Time Savings**: Automated matching reduces manual reconciliation from hours to minutes
- **Error Prevention**: Eliminate double-counting, missed payments, and allocation errors
- **Audit Readiness**: Complete audit trail of all payments for external auditors (BVI FSC inspections)
- **Collection Management**: Identify overdue invoices for follow-up communications

**For VERSO Leadership:**
- **Cash Flow Visibility**: Real-time dashboard of outstanding receivables vs. collected fees
- **Revenue Recognition**: Accurate fee revenue reporting (accrued vs. realized)
- **Investor Payment Behavior**: Identify slow-paying investors for credit risk assessment
- **Operational Efficiency**: Track reconciliation staff productivity (match rate, processing time)

**For Investors:**
- **Payment Confirmation**: Portal shows payment received and applied to account
- **Dispute Resolution**: Clear record of payments for resolving billing disputes
- **Tax Documentation**: Payment history for year-end tax reporting

### How It Connects to Other Modules

- **Fees Management**: Fee events generate invoices → invoices flow to Reconciliation for payment tracking
- **Investor Management**: Payment history visible in investor profile, affects credit standing
- **Documents**: Invoices and payment receipts stored as documents accessible to investors
- **Task Management**: Overdue invoices create tasks "Contact investor re: overdue fee invoice"
- **Messages**: Payment status updates sent via investor Messages module
- **Audit Log**: Every reconciliation action logged with timestamp, staff member, justification

### Who Uses It?

**Primary Users:**
- **Finance Analysts** (`staff_admin`): Import bank statements, review suggested matches, process reconciliations
- **Business Operations** (`staff_admin`): Generate fee invoices, monitor outstanding receivables
- **Accounting Team** (`staff_admin`): Export reconciliation reports for external auditors
- **Relationship Managers** (`staff_rm`): View payment status for their assigned investors

**Access Levels:**
- `staff_admin` can import transactions, create matches, edit reconciliations, export data
- `staff_ops` can view reconciliation status, suggested matches (read-only)
- `staff_rm` can view payment status for assigned investors only

### Core Use Cases

**1. Automated Bank Statement Import & Matching**

**Scenario:** Finance analyst receives Monday morning bank statement from Swiss bank showing 15 incoming wire transfers from prior week.

**Workflow:**
1. Finance analyst (Sarah) downloads CSV from online banking portal: `VERSO_CHF_20250310_Statement.csv`
2. Opens Reconciliation module, clicks "Import Bank Data"
3. Selects bank account: "VERSO CHF Account (CH89 XXXX XXXX XXXX XXXX X)"
4. Uploads CSV file
5. System parses CSV, extracts transactions:
   - Date, Amount, Currency, Counterparty, Reference/Memo
   - Creates 15 `bank_transactions` records
6. Auto-matching algorithm runs immediately:
   - **Transaction 1**: $50,000 from "Goldman Sachs Private Wealth", memo "Management Fee Q1 2025"
     - Finds outstanding invoice INV-2025-001 (Goldman Sachs, Management Fee, $50,000)
     - Match confidence: 95% (amount exact, counterparty name match, timing reasonable)
     - Creates suggested match
   - **Transaction 2**: €25,000 from "Meridian Capital AG", memo "Subscription Fee Tech Growth"
     - Finds INV-2025-015 (Meridian Capital, Subscription Fee, €25,000)
     - Match confidence: 90%
     - Creates suggested match
   - **Transaction 3**: $75,000 from "Family Office Network LLC", no memo
     - Finds INV-2025-008 (Family Office Network, Management Fee, $50,000 + INV-2025-009, Subscription Fee, $25,000)
     - Match confidence: 70% (amount matches combined invoices, counterparty match)
     - Creates suggested match for both invoices (partial match scenario)
7. System displays: "15 transactions imported, 12 suggested matches found"
8. Sarah reviews Suggested Matches section

**Result:** 80% of transactions auto-matched within seconds, Sarah only needs to review edge cases

**2. Reviewing & Approving Suggested Matches**

**Scenario:** Sarah reviews 12 suggested matches from bank import, needs to approve high-confidence matches and manually review low-confidence ones.

**Workflow:**
1. Suggested Matches card shows 12 matches sorted by confidence (highest first)
2. **Match 1 - 95% confidence**:
   - Bank: $50,000 from Goldman Sachs, 2025-03-10
   - Invoice: INV-2025-001, $50,000, Goldman Sachs Private Wealth, Management Fee Q1
   - Match reason: "Exact amount and counterparty match"
   - Sarah clicks "Accept" → system:
     - Creates `reconciliation_matches` record linking transaction to invoice
     - Updates `bank_transactions.status` to `matched`
     - Updates `invoices.status` to `paid`, sets `paid_at` to transaction date
     - Updates `fee_events.status` to `paid` (the underlying fee event)
     - Creates payment record in investor ledger
     - Sends notification to Goldman Sachs: "Your management fee payment of $50,000 has been received"
3. **Match 5 - 70% confidence**:
   - Bank: $75,000 from Family Office Network, 2025-03-09
   - Invoices: INV-2025-008 ($50K) + INV-2025-009 ($25K)
   - Match reason: "Amount matches combined invoices"
   - Sarah reviews: Confirms Family Office commonly pays multiple invoices in single wire
   - Clicks "Accept" → system creates split match (one transaction matched to two invoices)
4. **Match 8 - 55% confidence**:
   - Bank: $35,000 from "Tech Ventures LLC", 2025-03-08
   - Invoice: INV-2025-020, $40,000, Tech Ventures LLC
   - Match reason: "Partial amount match (87.5%)"
   - Sarah clicks "Reject" → system:
     - Removes suggested match
     - Flags transaction as "requires manual review"
     - Sarah notes: "Possible partial payment, contact investor"

**Result:** High-confidence matches approved in seconds, edge cases flagged for manual handling

**3. Manual Matching for Complex Cases**

**Scenario:** Transaction from "Tech Ventures LLC" for $35,000 doesn't auto-match to $40,000 invoice. Sarah needs to manually investigate and match.

**Workflow:**
1. Sarah navigates to Manual Matching section
2. Selects transaction: "$35,000 - Tech Ventures LLC, 2025-03-08"
3. System shows: "This transaction is $5,000 less than outstanding invoice INV-2025-020 ($40,000)"
4. Sarah reviews invoice details:
   - Invoice: INV-2025-020, Real Estate Secondary, Subscription Fee
   - Amount due: $40,000
5. Sarah checks investor communication in Messages module
6. Finds message from investor: "Paying $35K now, will send remaining $5K next week due to cash flow timing"
7. Sarah returns to Manual Matching, selects both transaction and invoice
8. Clicks "Create Partial Match" → modal appears:
   - Transaction amount: $35,000
   - Invoice amount: $40,000
   - Match type: Partial payment
   - Remaining balance: $5,000
   - Note: "Per investor request, partial payment 1 of 2. Expecting $5K follow-up wire"
9. Sarah confirms → system:
   - Creates `reconciliation_matches` record with `match_type: 'partial'`
   - Updates `bank_transactions.status` to `matched`
   - Updates `invoices.status` to `partially_paid`, sets `paid_amount: 35000`, `balance_due: 5000`
   - Creates task: "Monitor for $5K follow-up payment from Tech Ventures LLC (due within 7 days)"
   - Does NOT send "payment received" notification (invoice still partially outstanding)

**Result:** Complex partial payment scenario handled with clear audit trail and follow-up task

**4. Handling Unmatched Transactions (Unknown Payments)**

**Scenario:** Bank statement shows $10,000 wire from "ABC Consulting Ltd" - no invoice found, unknown sender.

**Workflow:**
1. Auto-match algorithm finds no matching invoices
2. Transaction appears in "Unmatched Transactions" section with red alert icon
3. Sarah investigates:
   - Searches investor database for "ABC Consulting" → no match
   - Checks recent deal closings for potential capital call payment → no ABC entity
   - Reviews transaction memo: "VERSO Fund Investment"
4. Sarah contacts bank for additional wire details (sending bank, IBAN)
5. Discovers ABC Consulting is subsidiary of existing investor "Elite Holdings Group"
6. Creates manual match:
   - Transaction: $10,000 from ABC Consulting
   - Invoice: INV-2025-035, $10,000, Elite Holdings Group
   - Note: "Payment from subsidiary ABC Consulting Ltd on behalf of Elite Holdings"
7. Updates investor profile to add ABC Consulting as "authorized payment entity"
8. Creates `counterparty_aliases` record: "ABC Consulting Ltd" → Elite Holdings Group

**Result:** Unknown payment identified, matched, and investor alias added for future auto-matching

**5. Outstanding Receivables Monitoring & Collections**

**Scenario:** Finance team needs to identify overdue invoices for collection follow-up.

**Workflow:**
1. Sarah reviews "Outstanding Invoices" card showing 23 unpaid invoices
2. Filters by "Overdue" status → 5 invoices past due date
3. **Invoice INV-2025-012**:
   - Investor: Global Ventures Fund
   - Amount: $50,000
   - Due date: 2025-02-28 (10 days overdue)
   - Fee type: Management Fee Q4 2024
4. Sarah clicks invoice → opens detail modal
5. Sees payment history: No payments recorded
6. Clicks "Create Follow-Up Task"
7. System creates task assigned to investor's RM (Michael):
   - Title: "Collection: Global Ventures Fund overdue $50K management fee"
   - Description: "Invoice INV-2025-012 is 10 days past due. Contact investor for payment status."
   - Due date: Tomorrow
8. Task appears in Michael's queue
9. Michael sends message to Global Ventures via Messages module:
   - "Hi Global Ventures team, friendly reminder that your Q4 management fee invoice (INV-2025-012, $50K) was due Feb 28. Please confirm payment status or let us know if there are any questions."
10. Investor responds: "Payment sent yesterday, wire reference 12345XYZ"
11. Sarah checks next day's bank import → finds matching transaction → approves match

**Result:** Proactive collections process prevents receivables from aging beyond 30 days

### Key Features (Business Language)

**Bank Transaction Import:**
- CSV file upload from banking portal downloads
- MT940 format support (European SWIFT standard)
- Multi-currency transaction parsing (USD, EUR, GBP, CHF)
- Automatic duplicate detection (prevent re-importing same statement)
- Import batch tracking (group transactions by import date/file)
- Transaction field mapping (custom CSV column mapping for different banks)

**Auto-Matching Algorithm:**
- **Exact match**: Amount matches within 1%, counterparty name >80% similarity, due date within 30 days
- **Partial match**: Amount is subset of invoice total, counterparty matches
- **Combined match**: Single transaction covers multiple invoices (batch payment)
- **Split match**: Single invoice paid via multiple transactions
- **Fuzzy counterparty matching**: "Goldman Sachs Private Wealth Management" matches "Goldman Sachs Pvt Wlth"
- **Reference parsing**: Extract invoice numbers from transaction memos (e.g., "Re: INV-2025-001")

**Suggested Matches:**
- Confidence score (0-100%) based on algorithm factors
- Color-coded confidence (green 80-100%, yellow 60-80%, red <60%)
- Match reasoning explanation ("Amount and counterparty match")
- Side-by-side comparison (transaction vs. invoice details)
- Batch accept (approve all high-confidence matches at once)
- Batch reject (clear all low-confidence suggestions)

**Manual Matching:**
- Transaction selector dropdown (unmatched transactions only)
- Invoice selector dropdown (outstanding invoices)
- Amount variance display (highlight differences)
- Match type selection (full payment, partial payment, overpayment)
- Note field for manual match justification
- Audit trail of all manual matches with staff attribution

**Invoice Management:**
- Outstanding invoice list with aging analysis (0-30 days, 30-60 days, 60+ days)
- Invoice status tracking (sent, paid, partially_paid, overdue, disputed, cancelled)
- Due date monitoring with overdue flagging
- Payment history timeline per invoice
- Bulk invoice actions (send reminders, mark as disputed, cancel)

**Reconciliation Dashboard:**
- **Match Rate**: % of bank transactions successfully matched to invoices
- **Reconciled Amount**: Total $ value of matched transactions
- **Pending Amount**: Total $ value of unmatched transactions
- **Unmatched Items**: Count of transactions awaiting reconciliation
- **Average Reconciliation Time**: Days between transaction date and match date
- **Overdue Receivables**: $ value and count of invoices past due date

**Exception Handling:**
- **Overpayments**: Transaction exceeds invoice amount → apply credit to investor account
- **Partial Payments**: Transaction less than invoice → mark invoice as partially paid, track balance due
- **Disputed Payments**: Investor disputes invoice → flag for compliance review, pause collections
- **Unidentified Transactions**: No matching invoice found → hold in suspense account, create investigation task
- **Multi-Currency Variance**: Exchange rate fluctuations cause amount mismatches → manual override with justification

**Reporting & Export:**
- Reconciliation summary report (PDF/Excel export)
- Outstanding receivables aging report (investor, amount, days overdue)
- Payment history report per investor (YTD payments, fees paid)
- Bank statement reconciliation report (for external auditors)
- Cash receipts journal (accounting export)

### Business Rules

**Bank Transaction Import:**
- Duplicate prevention: Same transaction date + amount + account cannot be imported twice
- Required fields: Date, amount, currency, account reference
- Optional fields: Counterparty, memo/reference (used for matching but not required)
- Import batch: All transactions in single CSV file assigned same `import_batch_id`

**Auto-Matching Criteria:**
- **Exact match (confidence 90-100%)**:
  - Amount within 1% (accounts for rounding, bank fees)
  - Counterparty name similarity >80% (Levenshtein distance)
  - Transaction date within 30 days of invoice date
- **Good match (confidence 70-89%)**:
  - Amount within 5%
  - Counterparty name similarity >60%
  - Transaction date within 60 days
- **Possible match (confidence 50-69%)**:
  - Amount within 10%
  - Counterparty name similarity >40%
  - Transaction date within 90 days

**Match Approval Workflow:**
- Auto-approve matches with 95%+ confidence (configurable, currently disabled pending validation)
- Matches 80-94%: Present for staff review (one-click approve)
- Matches 50-79%: Flag for manual investigation
- Matches <50%: Do not suggest, require manual matching

**Invoice Status Transitions:**
- `sent` → `paid`: When full payment matched
- `sent` → `partially_paid`: When partial payment matched (balance > 0)
- `partially_paid` → `paid`: When final payment matched (balance = 0)
- `sent` → `overdue`: When current_date > due_date and status != paid
- `sent` → `disputed`: Manual staff action when investor disputes invoice
- `sent` → `cancelled`: Manual admin action (invoice voided, no payment expected)

**Match Immutability:**
- Once approved, matches cannot be deleted (only reversed via adjustment entry)
- Match reversals require admin approval and written justification
- Reversal creates new `match_reversal` record, does not delete original match
- Original transaction and invoice return to unmatched status after reversal

**Multi-Currency Handling:**
- All transactions stored in original currency
- Invoice currency must match transaction currency for auto-match
- Cross-currency matches allowed manually with exchange rate entry
- Exchange rate source: ECB daily reference rates, stored at match time

**Partial Payment Rules:**
- Minimum partial payment: $1,000 or 20% of invoice amount (whichever greater)
- Maximum partial payments per invoice: 5 (prevent micro-payments)
- Partial payment follow-up: Task created if balance not paid within 30 days
- Partial payment notification: Investor notified of partial payment received + balance due

### Visual Design Standards

**Layout:**
- Header: "Bank Reconciliation" title, "Import Bank Data" button, "Run Auto-Match" button
- Stats row: 4 KPI cards (Match Rate, Reconciled Amount, Pending Amount, Unmatched Items)
- Suggested Matches section (prominent, top of page)
- 2-column grid: Bank Transactions (left) | Outstanding Invoices (right)
- Manual Matching section (bottom)

**Suggested Match Card:**
- Confidence indicator (colored dot: green/yellow/red)
- Left side: Bank transaction details (amount, counterparty, date, memo)
- Arrow icon (→) connecting transaction to invoice
- Right side: Invoice details (invoice ID, amount, investor, deal)
- Confidence badge (e.g., "85% match")
- Match reasoning text (e.g., "Amount and counterparty match")
- Action buttons: "Accept" (green), "Reject" (gray)

**Color Coding:**
- **Match Confidence**:
  - 80-100%: Green indicator, green badge
  - 60-79%: Yellow indicator, yellow badge
  - <60%: Red indicator, red badge
- **Transaction Status**:
  - Matched: Green dot (`bg-green-500`)
  - Partially matched: Yellow dot (`bg-yellow-500`)
  - Unmatched: Gray dot (`bg-gray-400`)
- **Invoice Status**:
  - Paid: Green badge (`bg-green-100 text-green-800`)
  - Overdue: Red badge (`bg-red-100 text-red-800`)
  - Due today: Yellow badge (`bg-yellow-100 text-yellow-800`)

**Icons:**
- Match Rate: `Activity`
- Reconciled Amount: `CheckCircle` (green)
- Pending Amount: `Clock` (orange)
- Unmatched Items: `AlertCircle` (red)
- Import: `Upload`
- Export: `Download`
- Accept match: `Link`
- Reject match: `Unlink`
- Auto-match: `RefreshCw`

---

## Part 2: Technical Implementation

### Architecture Overview

**Page Route**: `/versotech/staff/reconciliation/page.tsx`
**Type**: Server Component (Next.js App Router)
**Authentication**: Required via `createClient` + staff auth check
**Data Flow**: Server-side fetch from Supabase, client-side for match actions

**Component Hierarchy:**
```
page.tsx (Server Component)
  └─ AppLayout (brand="versotech")
       ├─ Header (title, Import button with Dialog, Run Auto-Match button)
       ├─ Stats Cards (Match Rate, Reconciled, Pending, Unmatched)
       ├─ Suggested Matches Card
       │    └─ SuggestedMatchRow × N (transaction ↔ invoice with Accept/Reject)
       ├─ 2-Column Grid
       │    ├─ Bank Transactions Card (list of transactions with status)
       │    └─ Outstanding Invoices Card (list of unpaid invoices)
       └─ Manual Matching Card (dropdowns + Create Match button)
```

### Current Implementation

**Server Component (page.tsx):**
```typescript
const reconciliationSummary = {
  totalTransactions: 247,
  matchedTransactions: 189,
  unmatchedTransactions: 58,
  matchRate: 76.5,
  pendingAmount: 145670.50,
  reconciledAmount: 2847392.25
}

const bankTransactions = [
  {
    id: '1',
    account_ref: 'VERSO-CHF-001',
    amount: 50000.00,
    currency: 'USD',
    value_date: '2024-03-10',
    memo: 'WIRE TRANSFER FROM GOLDMAN SACHS PRIVATE WEALTH',
    counterparty: 'Goldman Sachs',
    status: 'matched',
    matched_invoice: 'INV-2024-001',
    import_batch_id: 'BATCH-001'
  },
  // ... more mock transactions
]

export default async function ReconciliationPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/versotech/login')

  return (
    <AppLayout brand="versotech">
      {/* Stats Cards */}
      {/* Suggested Matches */}
      {/* Bank Transactions & Outstanding Invoices */}
      {/* Manual Matching */}
    </AppLayout>
  )
}
```

### Data Model Requirements

**Core Tables:**

```sql
-- Bank transactions (imported from statements)
create table bank_transactions (
  id uuid primary key default gen_random_uuid(),
  bank_account_id uuid references bank_accounts(id) not null,
  account_ref text not null, -- e.g. 'VERSO-CHF-001'

  -- Transaction details
  value_date date not null,
  amount numeric(15,2) not null,
  currency text not null,
  counterparty text,
  counterparty_account text, -- IBAN or account number
  memo text, -- Transaction reference/memo
  bank_reference text, -- Bank's unique transaction ID

  -- Matching
  status text check (status in ('unmatched', 'partially_matched', 'matched')) default 'unmatched',
  matched_invoice_ids uuid[], -- Array of matched invoice IDs
  match_confidence int, -- 0-100 for suggested matches

  -- Import tracking
  import_batch_id uuid references import_batches(id),
  imported_at timestamptz default now(),
  imported_by uuid references profiles(id),

  created_at timestamptz default now(),

  unique(bank_account_id, value_date, amount, bank_reference)
);

create index idx_bank_transactions_status on bank_transactions(status, value_date desc);
create index idx_bank_transactions_account on bank_transactions(bank_account_id, value_date desc);
create index idx_bank_transactions_counterparty on bank_transactions using gin(to_tsvector('english', counterparty));

-- Import batches
create table import_batches (
  id uuid primary key default gen_random_uuid(),
  bank_account_id uuid references bank_accounts(id) not null,
  file_name text not null,
  transaction_count int not null,
  imported_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Invoices (generated from fee_events)
create table invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique not null, -- 'INV-2025-001'
  investor_id uuid references investors(id) not null,
  deal_id uuid references deals(id),

  -- Invoice details
  issue_date date default current_date,
  due_date date not null,
  total_amount numeric(15,2) not null,
  currency text not null,
  paid_amount numeric(15,2) default 0,
  balance_due numeric(15,2) generated always as (total_amount - paid_amount) stored,

  -- Status
  status text check (status in ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'disputed', 'cancelled')) default 'draft',
  sent_at timestamptz,
  paid_at timestamptz,

  -- Line items (fee events)
  fee_event_ids uuid[], -- Array of fee_event IDs included in this invoice

  -- Notes
  notes text,

  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_invoices_investor on invoices(investor_id, status);
create index idx_invoices_status_due on invoices(status, due_date) where status in ('sent', 'partially_paid', 'overdue');
create index idx_invoices_number on invoices(invoice_number);

-- Reconciliation matches
create table reconciliation_matches (
  id uuid primary key default gen_random_uuid(),
  bank_transaction_id uuid references bank_transactions(id) not null,
  invoice_id uuid references invoices(id) not null,

  -- Match details
  match_type text check (match_type in ('exact', 'partial', 'combined', 'split', 'manual')) not null,
  matched_amount numeric(15,2) not null,
  match_confidence int, -- For suggested matches
  match_reason text,

  -- Approval
  status text check (status in ('suggested', 'approved', 'reversed')) default 'suggested',
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  notes text,

  created_at timestamptz default now()
);

create index idx_reconciliation_matches_transaction on reconciliation_matches(bank_transaction_id);
create index idx_reconciliation_matches_invoice on reconciliation_matches(invoice_id);
create index idx_reconciliation_matches_status on reconciliation_matches(status);

-- Suggested matches (ephemeral, can be deleted after approval/rejection)
create table suggested_matches (
  id uuid primary key default gen_random_uuid(),
  bank_transaction_id uuid references bank_transactions(id) not null,
  invoice_id uuid references invoices(id) not null,
  confidence int check (confidence >= 0 and confidence <= 100) not null,
  match_reason text not null,
  amount_difference numeric(15,2),
  created_at timestamptz default now()
);

create index idx_suggested_matches_transaction on suggested_matches(bank_transaction_id);
create index idx_suggested_matches_confidence on suggested_matches(confidence desc);

-- Counterparty aliases (for better matching)
create table counterparty_aliases (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id) not null,
  alias_name text not null,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  unique(investor_id, alias_name)
);

create index idx_counterparty_aliases_investor on counterparty_aliases(investor_id);
create index idx_counterparty_aliases_name on counterparty_aliases using gin(to_tsvector('english', alias_name));
```

**Database Functions:**

```sql
-- Calculate string similarity (for counterparty matching)
create extension if not exists pg_trgm; -- Trigram similarity extension

-- Auto-match algorithm
create or replace function run_auto_match()
returns table (
  transaction_id uuid,
  invoice_id uuid,
  confidence int,
  reason text
)
language plpgsql
as $$
declare
  v_transaction record;
  v_invoice record;
  v_confidence int;
  v_reason text;
begin
  -- Loop through unmatched transactions
  for v_transaction in
    select * from bank_transactions where status = 'unmatched'
  loop
    -- Find best matching invoice
    for v_invoice in
      select i.*,
        similarity(v_transaction.counterparty, coalesce(inv.legal_name, '')) as name_similarity
      from invoices i
      join investors inv on inv.id = i.investor_id
      where i.status in ('sent', 'partially_paid')
        and i.currency = v_transaction.currency
        and i.due_date >= v_transaction.value_date - interval '30 days'
        and i.balance_due > 0
      order by abs(i.balance_due - v_transaction.amount) asc, name_similarity desc
      limit 1
    loop
      -- Calculate confidence
      v_confidence := 0;

      -- Amount match (up to 50 points)
      if abs(v_invoice.balance_due - v_transaction.amount) < 1 then
        v_confidence := v_confidence + 50;
        v_reason := 'Exact amount match';
      elsif abs(v_invoice.balance_due - v_transaction.amount) / v_invoice.balance_due < 0.05 then
        v_confidence := v_confidence + 40;
        v_reason := 'Amount match within 5%';
      elsif abs(v_invoice.balance_due - v_transaction.amount) / v_invoice.balance_due < 0.10 then
        v_confidence := v_confidence + 20;
        v_reason := 'Amount match within 10%';
      end if;

      -- Counterparty name similarity (up to 40 points)
      if v_invoice.name_similarity > 0.8 then
        v_confidence := v_confidence + 40;
        v_reason := v_reason || ', strong counterparty match';
      elsif v_invoice.name_similarity > 0.6 then
        v_confidence := v_confidence + 25;
        v_reason := v_reason || ', good counterparty match';
      elsif v_invoice.name_similarity > 0.4 then
        v_confidence := v_confidence + 10;
        v_reason := v_reason || ', possible counterparty match';
      end if;

      -- Date proximity (up to 10 points)
      if v_transaction.value_date between v_invoice.due_date - interval '7 days' and v_invoice.due_date + interval '7 days' then
        v_confidence := v_confidence + 10;
      end if;

      -- Only suggest if confidence >= 50%
      if v_confidence >= 50 then
        insert into suggested_matches (
          bank_transaction_id, invoice_id, confidence, match_reason,
          amount_difference
        ) values (
          v_transaction.id, v_invoice.id, v_confidence, v_reason,
          v_transaction.amount - v_invoice.balance_due
        )
        on conflict do nothing;

        return query select v_transaction.id, v_invoice.id, v_confidence, v_reason;
      end if;
    end loop;
  end loop;
end;
$$;

-- Apply match (update statuses)
create or replace function apply_match(
  p_match_id uuid,
  p_approved_by uuid
)
returns void
language plpgsql
as $$
declare
  v_match record;
begin
  select * into v_match from reconciliation_matches where id = p_match_id;

  -- Update match status
  update reconciliation_matches
  set status = 'approved', approved_by = p_approved_by, approved_at = now()
  where id = p_match_id;

  -- Update bank transaction
  update bank_transactions
  set status = case
    when v_match.match_type = 'partial' then 'partially_matched'
    else 'matched'
  end,
  matched_invoice_ids = array_append(matched_invoice_ids, v_match.invoice_id)
  where id = v_match.bank_transaction_id;

  -- Update invoice
  update invoices
  set
    paid_amount = paid_amount + v_match.matched_amount,
    status = case
      when paid_amount + v_match.matched_amount >= total_amount then 'paid'
      else 'partially_paid'
    end,
    paid_at = case when paid_amount + v_match.matched_amount >= total_amount then now() else null end,
    updated_at = now()
  where id = v_match.invoice_id;

  -- Update fee events
  update fee_events
  set status = 'paid', processed_at = now()
  where id = any(
    select unnest(fee_event_ids) from invoices where id = v_match.invoice_id
  )
  and status = 'invoiced';
end;
$$;
```

### API Routes

**Import Bank Transactions:**
```typescript
// app/api/staff/reconciliation/import/route.ts
export async function POST(req: Request) {
  const supabase = await createClient()
  const profile = await requireStaffAuth()

  const formData = await req.formData()
  const file = formData.get('file') as File
  const bank_account_id = formData.get('bank_account_id') as string

  // Parse CSV
  const csvText = await file.text()
  const transactions = parseCSV(csvText) // Custom parser

  // Create import batch
  const { data: batch } = await supabase
    .from('import_batches')
    .insert({
      bank_account_id,
      file_name: file.name,
      transaction_count: transactions.length,
      imported_by: profile.id
    })
    .select()
    .single()

  // Insert transactions
  const transactionRecords = transactions.map(t => ({
    bank_account_id,
    value_date: t.date,
    amount: t.amount,
    currency: t.currency,
    counterparty: t.counterparty,
    memo: t.memo,
    import_batch_id: batch.id,
    imported_by: profile.id
  }))

  const { data: inserted, error } = await supabase
    .from('bank_transactions')
    .insert(transactionRecords)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Run auto-match
  const { data: matches } = await supabase.rpc('run_auto_match')

  return NextResponse.json({
    imported: inserted.length,
    suggested_matches: matches?.length || 0
  })
}
```

**Accept Suggested Match:**
```typescript
// app/api/staff/reconciliation/match/accept/route.ts
export async function POST(req: Request) {
  const supabase = await createClient()
  const profile = await requireStaffAuth()

  const { suggested_match_id } = await req.json()

  // Get suggested match
  const { data: suggested } = await supabase
    .from('suggested_matches')
    .select('*')
    .eq('id', suggested_match_id)
    .single()

  // Create reconciliation match
  const { data: match } = await supabase
    .from('reconciliation_matches')
    .insert({
      bank_transaction_id: suggested.bank_transaction_id,
      invoice_id: suggested.invoice_id,
      match_type: 'exact',
      matched_amount: suggested.amount,
      match_confidence: suggested.confidence,
      match_reason: suggested.match_reason,
      status: 'approved',
      approved_by: profile.id,
      approved_at: new Date().toISOString()
    })
    .select()
    .single()

  // Apply match (update statuses)
  await supabase.rpc('apply_match', {
    p_match_id: match.id,
    p_approved_by: profile.id
  })

  // Delete suggested match
  await supabase
    .from('suggested_matches')
    .delete()
    .eq('id', suggested_match_id)

  return NextResponse.json({ success: true })
}
```

### RLS Policies

```sql
alter table bank_transactions enable row level security;
alter table invoices enable row level security;
alter table reconciliation_matches enable row level security;

-- Only admins can view/edit reconciliation data
create policy bank_transactions_admin on bank_transactions for all
using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'staff_admin'));

create policy invoices_staff_read on invoices for select
using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role like 'staff_%'));

create policy invoices_admin_write on invoices for all
using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'staff_admin'));

-- Investors can view their own invoices
create policy invoices_investor_read on invoices for select
using (
  exists (
    select 1 from investor_users iu
    where iu.investor_id = invoices.investor_id and iu.user_id = auth.uid()
  )
);
```

---

## Part 3: Success Metrics

**Reconciliation Efficiency:**
- Match rate: Target >85% of transactions auto-matched
- Average time to reconcile: Target <24 hours from transaction date
- Manual intervention rate: Target <15% of transactions

**Financial Accuracy:**
- Matching error rate: Target <0.5% (incorrect matches)
- Reconciliation completeness: Target >98% of transactions matched within 7 days
- Unidentified transaction rate: Target <2%

**Collections Performance:**
- Days Sales Outstanding (DSO): Target <30 days
- Overdue invoice count: Target <5% of total invoices
- Collection rate: Target >95% of invoices paid within 60 days

---

## Document Version History

- v1.0 (October 2, 2025): Initial Bank Reconciliation PRD with comprehensive business context and technical implementation roadmap
