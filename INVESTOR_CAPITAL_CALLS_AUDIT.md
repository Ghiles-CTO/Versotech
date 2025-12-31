# Investor Capital Calls & Payments Audit Report

**Date:** December 31, 2025
**Section:** 4.2.6 - Funding
**Test User:** biz@ghiless.com (Investor ID: 8753bf9d-babf-4174-9bc5-75d65c3b0a39)

---

## Executive Summary

This audit evaluated the investor-facing functionality for capital calls and funding as specified in User Stories Section 4.2.6. The analysis revealed that while the backend infrastructure for capital calls exists, **investor-facing visibility and notification features are incomplete or not implemented**.

### Overall Status: PARTIAL IMPLEMENTATION

| Feature | Status | Severity |
|---------|--------|----------|
| Capital Calls Visibility | NOT_IMPLEMENTED | HIGH |
| Funding Status Display | PASS | - |
| Payment Instructions | PARTIAL | MEDIUM |
| Capital Call Documents | PARTIAL | HIGH |
| Funding Notifications | NOT_IMPLEMENTED | CRITICAL |
| Outstanding Amount Calculation | FAIL | HIGH |

---

## Test Results

### [TEST 1]: View Capital Calls
- **Story:** Row 40 - Notification that subscription pack signed and need to transfer funds
- **Pre-DB:**
```sql
SELECT * FROM capital_calls LIMIT 10;
-- Result: 4 capital calls exist (Capital Call #4 for VERSO FUND, Initial Capital Call for SPV Delta)
-- However, these are for vehicles NOT subscribed by the test investor

SELECT cci.* FROM capital_call_items cci
WHERE cci.investor_id = '8753bf9d-babf-4174-9bc5-75d65c3b0a39';
-- Result: Empty - No capital call items linked to this investor
```
- **Action:** Reviewed UI sidebar navigation
- **Outcome:**
  - Sidebar contains: Dashboard, Investment Opportunities, Portfolio, Documents, Inbox, Calendar
  - **NO dedicated "Capital Calls" section exists for investors**
  - Capital calls table structure exists but no investor-facing page to view them
- **Status:** NOT_IMPLEMENTED
- **Severity:** HIGH
- **Evidence:** Screenshot shows sidebar without Capital Calls navigation

---

### [TEST 2]: Funding Status Display
- **Story:** Row 42 - Notification that escrow account has been funded
- **Pre-DB:**
```sql
SELECT id, commitment, funded_amount, outstanding_amount, status, funded_at
FROM subscriptions
WHERE investor_id = '8753bf9d-babf-4174-9bc5-75d65c3b0a39';

-- Results:
-- Perplexity: $700K commitment, $350K funded, status: committed
-- Anthropic: $444K commitment, $444K funded, status: active (fully funded)
-- OpenAI: $400K commitment, $200K funded, status: active
-- SpaceX: $7.48M commitment, $3.74M funded, status: committed
```
- **Action:** Navigated to deal detail page for Perplexity (f2dcb9a8-7914-4bd5-bbd4-02e132762cb8)
- **Outcome:**
  - Investment Journey bar shows stages 1-8 completed (green), stages 9 (Funded) and 10 (Active) grayed
  - "Awaiting Funding" badge displayed next to deal name
  - SubscriptionStatusCard component shows commitment amount
- **Status:** PASS
- **Evidence:** perplexity_deal_page-2025-12-31T13-10-47-261Z.png

---

### [TEST 3]: Payment Instructions / Escrow Account Info
- **Story:** Row 40 - Need to transfer funds to escrow account
- **Pre-DB:**
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'deal_fee_structures'
AND column_name LIKE '%wire%' OR column_name LIKE '%escrow%';

-- Result: wire_escrow_agent, wire_bank_name, wire_account_holder, wire_iban, wire_bic, escrow_fee_text columns exist
```
- **Action:** Reviewed code in deal-fee-structures and escrow pages
- **Outcome:**
  - Escrow page exists at `/versotech_main/escrow` but designed for lawyers/arrangers
  - Code shows `lawyerInfo` check before showing "Confirm Funding" button
  - Investors do NOT have access to escrow page navigation
  - Payment instructions (bank details) exist in deal_fee_structures but not shown to investors on deal detail page
- **Status:** PARTIAL
- **Severity:** MEDIUM
- **Issue:** Investors cannot see wire transfer instructions or escrow bank details

---

### [TEST 4]: Capital Call Documents
- **Story:** Related to Row 40/41 - Capital call notices
- **Pre-DB:**
```sql
SELECT id, name, type, status FROM documents
WHERE owner_investor_id = '8753bf9d-babf-4174-9bc5-75d65c3b0a39'
AND type = 'capital_call';

-- Result:
-- verso-fund-capital-call-q4-2024 (status: draft)
-- real-empire-capital-call-q4-2024 (status: draft)
```
- **Action:** Reviewed Documents page UI
- **Outcome:**
  - Documents page shows filter buttons: Statements, Reports, Tax, Legal, NDAs, Subscriptions, Agreements, Term Sheets, KYC, Other
  - **NO "Capital Calls" filter button exists**
  - Capital call documents exist in DB but with "draft" status (not visible to investors)
  - Document type "capital_call" exists in schema but not exposed in UI filters
- **Status:** PARTIAL
- **Severity:** HIGH
- **Issue:** No capital call document filter; existing documents in draft status not visible
- **Evidence:** documents_page_final-2025-12-31T13-14-51-188Z.png

---

### [TEST 5]: Funding Notifications
- **Story:** Row 40-42 - Notifications for subscription signed, funding reminders, funding confirmed
- **Pre-DB:**
```sql
SELECT * FROM investor_notifications
WHERE investor_id = '8753bf9d-babf-4174-9bc5-75d65c3b0a39';
-- Result: Empty array - NO notifications exist for this investor

SELECT column_name FROM information_schema.columns
WHERE table_name = 'investor_notifications';
-- Columns: id, user_id, investor_id, title, message, link, read_at, created_at, type, created_by, deal_id
```
- **Action:** Reviewed capital-calls API route code
- **Outcome:**
  - API code (`/api/capital-calls/route.ts`) includes notification logic:
    ```typescript
    await createInvestorNotification({
      title: 'Capital Call Issued',
      message: `A capital call for ${vehicle.name} has been issued...`,
      type: 'capital_call'
    })
    ```
  - However, notifications are only sent when capital call status is NOT 'draft'
  - **No notifications have been created for this test investor**
  - No funding reminder mechanism found in codebase
  - No escrow funded notification found
- **Status:** NOT_IMPLEMENTED
- **Severity:** CRITICAL
- **Issue:**
  1. No notifications sent for subscription signing completion
  2. No funding reminder system
  3. No notification when escrow is funded

---

### [TEST 6]: Outstanding Amount Calculation
- **Story:** Accurate funding progress display
- **Pre-DB:**
```sql
SELECT commitment, funded_amount, outstanding_amount
FROM subscriptions
WHERE investor_id = '8753bf9d-babf-4174-9bc5-75d65c3b0a39';

-- Perplexity: commitment=$700K, funded=$350K, outstanding=$700K (INCORRECT)
-- OpenAI: commitment=$400K, funded=$200K, outstanding=$0 (INCORRECT - should be $200K)
-- SpaceX: commitment=$7.48M, funded=$3.74M, outstanding=$7.48M (INCORRECT)
```
- **Action:** Calculated expected values
- **Outcome:**
  - Outstanding amount should equal: commitment - funded_amount
  - Perplexity: Expected $350K outstanding, DB shows $700K
  - OpenAI: Expected $200K outstanding, DB shows $0
  - SpaceX: Expected $3.74M outstanding, DB shows $7.48M
- **Status:** FAIL
- **Severity:** HIGH
- **Issue:** Outstanding amount calculation is incorrect in database; appears to not update when funded_amount changes

---

## Database Schema Summary

### Capital Calls Tables
```
capital_calls:
- id (uuid, PK)
- vehicle_id (uuid)
- name (text)
- call_pct (numeric)
- due_date (date)
- status (text: draft, pending, completed, cancelled)

capital_call_items:
- id (uuid, PK)
- capital_call_id (uuid, FK)
- subscription_id (uuid, FK)
- investor_id (uuid, FK)
- called_amount (numeric)
- paid_amount (numeric)
- balance_due (numeric)
- due_date (date)
- paid_date (date)
- status (text)
- bank_transaction_ids (array)
- notes (text)
```

### Subscription Funding Fields
```
subscriptions:
- commitment (numeric)
- funded_amount (numeric)
- outstanding_amount (numeric)
- funding_due_at (date)
- funded_at (timestamp)
```

---

## Code Analysis

### Key Files Reviewed
1. `versotech-portal/src/app/api/capital-calls/route.ts` - Staff-only capital call creation with notifications
2. `versotech-portal/src/components/subscriptions/capital-activity-table.tsx` - Staff-facing capital activity display
3. `versotech-portal/src/app/(main)/versotech_main/escrow/page.tsx` - Lawyer/Arranger escrow management
4. `versotech-portal/src/components/deals/subscription-status-card.tsx` - Investor subscription status display
5. `versotech-portal/src/lib/notifications.ts` - Notification system

### Findings
1. Capital calls are managed by staff only - no investor-facing API endpoints
2. Escrow page checks for lawyer/arranger persona - investors blocked
3. SubscriptionStatusCard shows funded_amount but not payment instructions
4. No investor notification triggers for funding events

---

## Recommendations

### Critical Priority
1. **Implement funding notifications system** - Create triggers when:
   - Subscription pack is signed -> "Please fund your subscription to escrow"
   - X days before funding_due_at -> "Reminder: Funding due in X days"
   - funded_amount updated -> "Your funding of $X has been received"

2. **Fix outstanding_amount calculation** - Add database trigger:
   ```sql
   CREATE OR REPLACE FUNCTION update_outstanding_amount()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.outstanding_amount = NEW.commitment - COALESCE(NEW.funded_amount, 0);
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   ```

### High Priority
3. **Add Capital Calls document filter** to Documents page
4. **Publish capital call documents** - Change status from 'draft' to 'published'
5. **Show payment instructions** on subscription detail page when status is "awaiting funding"

### Medium Priority
6. **Add capital calls section** to investor sidebar (optional - could be in Portfolio)
7. **Create investor-friendly escrow status page** showing funding progress

---

## Test Evidence Files

| Screenshot | Description |
|------------|-------------|
| perplexity_deal_page-2025-12-31T13-10-47-261Z.png | Deal detail showing "Awaiting Funding" badge |
| documents_page_final-2025-12-31T13-14-51-188Z.png | Documents page without Capital Calls filter |
| logged_in_dashboard-2025-12-31T13-14-21-138Z.png | Dashboard showing 34 outstanding tasks |

---

## Conclusion

The backend infrastructure for capital calls exists but investor-facing features are incomplete. The critical gaps are:
1. **No funding notifications** - User stories 40-42 cannot be fulfilled
2. **Capital call documents not visible** - No filter and documents in draft status
3. **Outstanding amount calculation broken** - Data integrity issue
4. **Payment instructions not shown** - Investors can't see where to wire funds

The system is partially functional for showing funding status on deal pages but lacks the notification and document access features required by the user stories.

---

*Report generated by Claude Code Audit*
