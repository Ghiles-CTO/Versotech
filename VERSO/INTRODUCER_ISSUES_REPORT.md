# Introducer Issues Report

**Date:** January 2, 2026
**Test User:** py.moussaouighiles@gmail.com (PYM Consulting)
**Total Issues Found:** 12

---

## Database Issues (4)

### 1. CRITICAL: Deals table missing introducer access via introductions
- **Table:** `deals`
- **Issue:** The `deal_read` RLS policy only grants access via `deal_memberships` with role `'introducer'`, but NO `deal_memberships` exist with that role. There is NO policy allowing introducers to read deals via the `introductions` table.
- **Impact:** Introducers CANNOT access deal details for opportunities they've introduced investors to
- **Query proof:**
```sql
-- Returns 0 rows
SELECT * FROM deal_memberships WHERE role = 'introducer';

-- Returns 0 policies
SELECT * FROM pg_policies WHERE tablename = 'deals' AND qual::text LIKE '%introduction%';
```

### 2. HIGH: investor_notifications missing UPDATE policy
- **Table:** `investor_notifications`
- **Issue:** Only SELECT policies exist. No UPDATE policy for users to mark notifications as read.
- **Impact:** Users cannot mark their notifications as read via client-side calls

### 3. MEDIUM: documents table has no introducer access
- **Table:** `documents`
- **Issue:** No RLS policy references `introducer` or `introductions`
- **Impact:** Introducers cannot access dataroom documents for deals they've introduced investors to

### 4. LOW: introducer_agreements missing INSERT/UPDATE for introducers
- **Table:** `introducer_agreements`
- **Issue:** Introducers can only SELECT their agreements. No policy for introducers to sign/update agreements.
- **Note:** May be intentional if signing is done server-side via service client

---

## Backend Issues (5)

### 5. HIGH: GDPR export missing introducer data
- **File:** `src/app/api/gdpr/export/route.ts`
- **Issue:** Only exports investor-related data (investor_users, subscriptions, deal_interests). Does NOT include: introductions, introducer_commissions, introducer_agreements
- **Impact:** GDPR export is incomplete for users with introducer persona (compliance issue)

### 6. MEDIUM: Profile API column mismatch in commission stats
- **File:** `src/app/api/introducers/me/profile/route.ts` (lines 93-103)
- **Issue:** Queries `amount` column from `introducer_commissions` table, but correct column is `accrual_amount`
- **Impact:** Commission stats (`totalEarned`, `pendingCommission`) likely return 0

### 7. MEDIUM: Profile API missing PATCH method
- **File:** `src/app/api/introducers/me/profile/route.ts`
- **Issue:** Client component calls `PATCH` method, but route only implements `GET` and `PUT`
- **Impact:** Profile edit may fail with 405 Method Not Allowed

### 8. LOW: Introductions export column mismatches
- **File:** `src/app/api/introducers/me/introductions/export/route.ts` (lines 67-77)
- **Issue:** Queries `commission_amount`, `commission_currency`, `commission_paid_at` on `introductions` table - these columns may not exist (commissions are in separate table)
- **Impact:** Export may fail or return null values

### 9. LOW: Logo upload not handled
- **File:** `src/app/api/introducers/me/profile/route.ts`
- **Issue:** Client sends FormData for logo upload, but route only parses JSON body (`request.json()`)
- **Impact:** Logo uploads fail silently

---

## UI Code Issues (3)

### 10. MEDIUM: Introductions page missing date range filter
- **File:** `src/app/(main)/versotech_main/introductions/page.tsx` (lines 546-575)
- **Issue:** Has status filter and search but NO date range filter. Other pages (my-commissions, dashboard) have DateRangePicker.
- **Impact:** Inconsistent UX; user story 6.6.4-01 requires viewing revenues "between 2 DATES"

### 11. LOW: Missing null check for rate_bps
- **File:** `src/app/(main)/versotech_main/my-commissions/page.tsx` (line 636)
- **Issue:** `{(commission.rate_bps / 100).toFixed(2)}%` - If `rate_bps` is null, displays `NaN%`
- **Fix:** Add null check: `{commission.rate_bps != null ? \`${(commission.rate_bps / 100).toFixed(2)}%\` : '-'}`

### 12. LOW: Theme check won't work for introducer personas
- **File:** `src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx` (line 86)
- **Issue:** `const isDark = theme === 'staff-dark'` - Introducers are not staff, so dark mode never activates
- **Impact:** Dark mode doesn't work for introducer dashboard

---

## Summary by Severity

| Severity | Count | Issues |
|----------|-------|--------|
| CRITICAL | 1 | #1 deals RLS |
| HIGH | 2 | #2 notifications, #5 GDPR |
| MEDIUM | 4 | #3 documents, #6 column mismatch, #7 PATCH method, #10 date filter |
| LOW | 5 | #4 agreements, #8 export, #9 logo, #11 null check, #12 theme |
| **TOTAL** | **12** | |

---

## User Stories Coverage Verification

**Test data verified for PYM Consulting:**
- Introducer status: `active`
- Agreements: 4 (active, draft, expired, pending_approval)
- Commissions: 4 ($24,250 total across accrued, invoice_requested, invoiced, paid)
- Introductions: 5 (allocated, joined, invited, lost, inactive)

**User stories with known issues:**

| Story ID | Story | Status |
|----------|-------|--------|
| 6.2.2-01 | Access dataroom for investment opportunity | BLOCKED by issue #1, #3 |
| 6.6.4-01 | View revenues between 2 DATES | BLOCKED by issue #10 |
| 6.7.2-01 | Download all personal information (GDPR) | BLOCKED by issue #5 |

---

## Recommended Fixes (Priority Order)

1. **#1 deals RLS** - Add policy: `CREATE POLICY introducer_deals_via_introductions ON deals FOR SELECT USING (EXISTS (SELECT 1 FROM introductions i JOIN introducer_users iu ON i.introducer_id = iu.introducer_id WHERE i.deal_id = deals.id AND iu.user_id = auth.uid()))`

2. **#5 GDPR export** - Add introducer tables to export: `introductions`, `introducer_commissions`, `introducer_agreements`

3. **#6 Column mismatch** - Change `amount` to `accrual_amount` in profile API

4. **#2 Notifications UPDATE** - Add policy: `CREATE POLICY notification_update ON investor_notifications FOR UPDATE USING (user_id = auth.uid())`

5. **#10 Date filter** - Add DateRangePicker to introductions page matching other pages

---

*Report generated by Claude Code Audit*
