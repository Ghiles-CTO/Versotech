# Lawyer User Stories - Test Tracking

## Summary
- Total Stories: 54
- Extracted: 2026-01-01
- Last Updated: 2026-01-01

## Test Status Legend
- NOT_TESTED: Not yet tested
- DB_OK: Database layer verified
- BACKEND_OK: API layer verified
- UI_OK: UI layer verified
- PASS: Fully working
- FAIL: Broken (see notes)
- PARTIAL: Partially working
- N/A: Not applicable

---

## Test Credentials
- Email: gm.moussaouighiles@gmail.com
- Password: LawyerTest2024!
- Lawyer Entity: Test Law Firm LLP (ID: 44444444-4444-4444-4444-444444444444)
- User ID: 1901c394-af01-40ff-93d7-d4a291b67c9e
- Role in Firm: admin, is_primary: true, can_sign: true
- Assigned Deal: TechFin Secondary 2024 (ID: 6f1d8a75-f60e-4e74-b4c5-740238114160)
- Assignment Role: lead_counsel, Status: active

---

## Section 3.1 - My Profile

| ID | Story | DB | Backend | UI | Status | Notes |
|----|-------|----|---------|----|--------|-------|
| 3.1.1-01 | I want to complete my profile for approval | ✅ | ✅ | ❌ | FAIL | Profile page shows "Not set" for firm data despite DB having values |
| 3.1.1-02 | I want to update my profile for "re-approval" | ✅ | ➖ | ➖ | PARTIAL | No re-approval workflow implemented |
| 3.1.2-01 | I want to login with my user ID and password | ✅ | ✅ | ✅ | PASS | Login works after auth.identities fix |
| 3.1.3-01 | I want to submit my profile for approval | ✅ | ➖ | ➖ | N/A | KYC approval handled by admin, not self-service |
| 3.1.3-02 | I receive a notification that my profile has been approved | ✅ | ➖ | ❌ | FAIL | Notifications not displaying in UI |
| 3.1.3-03 | I receive notification that my profile has not been approved | ✅ | ➖ | ❌ | FAIL | Notifications not displaying in UI |
| 3.1.4-01 | I want to know the most interesting features available in the APP | ➖ | ➖ | ➖ | N/A | Feature discovery not implemented |
| 3.1.4-02 | I want to select the most important features I want to be able to perform | ➖ | ➖ | ➖ | N/A | Feature selection not implemented |
| 3.1.4-03 | I want to customize My Profile | ✅ | ✅ | ❌ | FAIL | Profile page data not loading correctly |

## Section 3.2 - My Notifications

| ID | Story | DB | Backend | UI | Status | Notes |
|----|-------|----|---------|----|--------|-------|
| 3.2.1-01 | I want to receive a notification when the subscription pack is signed by VERSO CEO | ✅ | ✅ | ❌ | FAIL | Notifications exist in DB but not showing in UI |
| 3.2.1-02 | I want to receive a notification when the subscription pack is signed by VERSO Arranger | ✅ | ✅ | ❌ | FAIL | Notifications exist in DB but not showing in UI |
| 3.2.1-03 | I want to receive notification that electronic signature was completed by investors | ✅ | ✅ | ❌ | FAIL | Notification system not displaying properly |
| 3.2.2-01 | I want to receive notifications to provide Escrow account funding status | ✅ | ✅ | ❌ | FAIL | Created escrow notification, not showing in UI |
| 3.2.3-01 | I want to receive a notification when issued certificate was sent to investors | ✅ | ➖ | ➖ | PARTIAL | Backend notification exists, certificate workflow incomplete |
| 3.2.3-02 | I want to automatically insert the specimen of my signature | ✅ | ✅ | ✅ | PASS | Signature upload UI exists and API works |
| 3.2.4-01 | I want to receive a notification when issued Statement of Holding was sent | ✅ | ➖ | ➖ | PARTIAL | Statement workflow incomplete |
| 3.2.4-02 | I want to automatically insert the specimen of my signature | ✅ | ✅ | ✅ | PASS | Duplicate of 3.2.3-02 |
| 3.2.5-01 | I want to receive a notification when the Partner invoice has been received | ✅ | ✅ | ❌ | FAIL | Created invoice notification, not showing in UI |
| 3.2.5-02 | I want to receive a notification to proceed to Partner fees payment | ✅ | ✅ | ❌ | FAIL | Notification system issue |
| 3.2.6-01 | I want to receive a notification when the BI invoice has been received | ✅ | ✅ | ❌ | FAIL | Notification system issue |
| 3.2.6-02 | I want to receive a notification to proceed to BI fees payment | ✅ | ✅ | ❌ | FAIL | Notification system issue |
| 3.2.8-01 | I want to receive a notification when the Commercial Partner invoice has been received | ✅ | ✅ | ❌ | FAIL | Notification system issue |
| 3.2.8-02 | I want to receive a notification to proceed to Commercial Partner fees payment | ✅ | ✅ | ❌ | FAIL | Notification system issue |
| 3.2.7-01 | I want to receive a notification to proceed to payment to seller | ✅ | ✅ | ❌ | FAIL | Notification system issue |

## Section 3.3 - Escrow Account Handling

| ID | Story | DB | Backend | UI | Status | Notes |
|----|-------|----|---------|----|--------|-------|
| 3.3.1-01 | I want to send a notification once escrow account funding is completed | ✅ | ✅ | ❌ | FAIL | Escrow page shows 0 deals despite assignment |
| 3.3.1-02 | I want to send/receive a notification once escrow account funding is not completed yet | ✅ | ✅ | ❌ | FAIL | Escrow page data not loading |
| 3.3.2-01 | I want to display Partner invoice details per Partner per Opportunity | ✅ | ✅ | ✅ | PASS | Reconciliation Fee Payments tab works |
| 3.3.2-02 | I want to send a notification that Partner fees payment is completed | ✅ | ✅ | ❌ | FAIL | Notification display issue |
| 3.3.2-03 | I want to send/receive a notification that Partner fees payment is not completed yet | ✅ | ✅ | ❌ | FAIL | Notification display issue |
| 3.3.3-01 | I want to display BI invoice details per Introducer per Opportunity | ✅ | ✅ | ✅ | PASS | Reconciliation Introducer Fees tab shows data |
| 3.3.3-02 | I want to send a notification when the Introducer fees payment is completed | ✅ | ✅ | ❌ | FAIL | Notification display issue |
| 3.3.3-03 | I want to send/receive a notification when the Introducer fees payment is not completed yet | ✅ | ✅ | ❌ | FAIL | Notification display issue |
| 3.3.8-01 | I want to display Commercial Partner invoice details | ✅ | ✅ | ✅ | PARTIAL | Fee Payments tab exists, needs CP-specific view |
| 3.3.8-02 | I want to send a notification when the Commercial Partner fees payment is completed | ✅ | ✅ | ❌ | FAIL | Notification display issue |
| 3.3.8-03 | I want to send/receive notification when CP fees payment is not completed yet | ✅ | ✅ | ❌ | FAIL | Notification display issue |
| 3.3.4-01 | I want to send a notification when payment transfer request to Seller(s) is completed | ✅ | ➖ | ➖ | PARTIAL | Seller payment workflow not implemented |
| 3.3.5-01 | I want to send a notification with escrow funds amount | ✅ | ✅ | ❌ | FAIL | Escrow page not loading deals |
| 3.3.6-01 | V2: Confirm processed payment to selected Investors | ✅ | ✅ | ➖ | PARTIAL | Reconciliation exists, confirm action limited |
| 3.3.7-01 | Receive notification of STA sent for digital signature | ✅ | ➖ | ➖ | N/A | V2 feature - STA workflow not implemented |
| 3.3.7-02 | Receive notification when STA is digitally signed by Investor | ✅ | ➖ | ➖ | N/A | V2 feature - STA workflow not implemented |
| 3.3.7-03 | Confirm processed payment of Performance Fees by Investors | ✅ | ➖ | ➖ | N/A | V2 feature - Performance fee workflow incomplete |
| 3.3.7-04 | Receive approval of Performance Fees Amount payment | ✅ | ➖ | ➖ | N/A | V2 feature |
| 3.3.7-05 | Confirm processed payment to selected Investors | ✅ | ✅ | ➖ | PARTIAL | Payment confirmation exists in reconciliation |
| 3.3.7-06 | Confirm processed Additional Payment to selected Investors | ✅ | ➖ | ➖ | N/A | Additional payment workflow not implemented |
| 3.3.7-07 | Receive notification that Equity Certificates updated | ✅ | ➖ | ➖ | N/A | Certificate update workflow not implemented |

## Section 3.4 - Reporting

| ID | Story | DB | Backend | UI | Status | Notes |
|----|-------|----|---------|----|--------|-------|
| 3.4.1-01 | View reconciliation per transaction (Amount, Fees, Escrow) | ✅ | ✅ | ✅ | PASS | Reconciliation page shows subscription data with commitment/funded amounts |
| 3.4.2-01 | View reconciliation per compartment (Amount, Shares, Fees, Escrow) | ✅ | ✅ | ✅ | PASS | Deal Summary tab shows compartment-level data |
| 3.4.3-01 | View reconciliation per transaction (Redemption, Performance fees) | ✅ | ➖ | ➖ | N/A | Redemption workflow not implemented (V2 feature) |
| 3.4.4-01 | View reconciliation per transaction (Conversion, Shares, Escrow) | ✅ | ➖ | ➖ | N/A | Conversion workflow not implemented (V2 feature) |

## Section 3.5 - GDPR

| ID | Story | DB | Backend | UI | Status | Notes |
|----|-------|----|---------|----|--------|-------|
| 3.5.1-01 | Submit request to rectify, erase or transfer personal data | ➖ | ➖ | ➖ | N/A | No GDPR request UI implemented for lawyers |
| 3.5.2-01 | Download all personal information (CSV/XLS) | ➖ | ➖ | ➖ | N/A | Data export feature not implemented |
| 3.5.3-01 | Restrict how personal information is used | ➖ | ➖ | ➖ | N/A | Processing restriction not implemented |
| 3.5.4-01 | Right to be forgotten - permanently delete data | ➖ | ➖ | ➖ | N/A | Account deletion not implemented for lawyers |
| 3.5.5-01 | View clearly defined data policy | ➖ | ➖ | ✅ | PARTIAL | Privacy Policy link exists on login page |
| 3.5.6-01 | Request incorrect data to be rectified | ➖ | ➖ | ➖ | N/A | Data rectification request not implemented |
| 3.5.7-01 | Consent can be withdrawn at any time | ➖ | ➖ | ➖ | N/A | Consent withdrawal not implemented |
| 3.5.8-01 | Blacklisted user can still access personal data | ➖ | ➖ | ➖ | N/A | Blacklist data access not implemented |
| 3.5.9-01 | Require restriction on processing | ➖ | ➖ | ➖ | N/A | Processing restriction not implemented |
| 3.5.10-01 | Object to processing for legitimate interests | ➖ | ➖ | ➖ | N/A | Processing objection not implemented |

---

## Cross-Referenced Stories (From Other Sheets)

These stories reference the Lawyer persona from other actor sheets:

| Source | ID | Story | Notes |
|--------|-----|-------|-------|
| CEO 1.x | CEO-LAW-01 | I want to create profile for Lawyer (individual/entity) | CEO creates lawyer profile |
| CEO 1.x | CEO-LAW-02 | I want to view list of approved users (investor/arranger/partner/commercial partner/introducer/lawyer) | CEO views approved lawyers |
| CEO 1.x | CEO-LAW-03 | I want to "blacklist" one User (lawyer) | CEO can blacklist lawyer |
| CEO 1.x | CEO-LAW-04 | I want to shift User (lawyer) from the blacklist into the white list | CEO can un-blacklist lawyer |
| CEO 1.x | CEO-LAW-05 | I want to notify VERSO lawyer that I signed subscription pack | CEO notifies lawyer |
| CEO 1.x | CEO-LAW-06 | I want to request to proceed to Partner(s) transaction payment to selected Lawyer(s) | Payment requests to lawyer |
| CEO 1.x | CEO-LAW-07 | I want to assign to Lawyer to proceed to payment to seller | CEO assigns payment task to lawyer |
| CEO 1.x | CEO-LAW-08 | I want to send a reminder to lawyer to proceed to payment transfer | CEO reminds lawyer |
| Arranger 2.x | ARR-LAW-01 | I want to request to proceed to Partner transaction fee payment to selected Lawyer(s) | Arranger requests lawyer payment |
| Arranger 2.x | ARR-LAW-02 | I want to request to proceed to BI Introducer transaction payment to selected Lawyer(s) and CEO | Arranger requests lawyer payment |
| Arranger 2.x | ARR-LAW-03 | I want to request to proceed to Commercial Partner placement fee payment to selected Lawyer(s) | Arranger requests lawyer payment |
| Arranger 2.x | ARR-LAW-04 | My Lawyers (section title) | Arranger has lawyer management section |
| Arranger 2.x | ARR-LAW-05 | I want to notify VERSO lawyer that I signed subscription pack | Arranger notifies lawyer |
| Investor 4.x | INV-LAW-01 | Signed Subscription pack Archived - Automatic notification to CEO, Arranger and LAWYER | Investor action notifies lawyer |
| Introducer 6.x | INT-LAW-01 | Signed Subscription pack Archived - Automatic notification to CEO, Arranger and LAWYER | Introducer action notifies lawyer |
| Comm Partner 7.x | CP-LAW-01 | Signed Subscription pack Archived - Automatic notification to CEO, Arranger and LAWYER | Comm Partner action notifies lawyer |

---

## Database Analysis

### Lawyer-Related Tables

| Table | Purpose | Columns |
|-------|---------|---------|
| `lawyers` | Master table for law firms | id, firm_name, display_name, legal_entity_type, registration_number, tax_id, primary_contact_*, address fields, specializations[], is_active, kyc_status, kyc_approved_at/by/expires_at, assigned_deals[] |
| `lawyer_users` | Junction: links users to law firms | lawyer_id, user_id, role, is_primary, can_sign, signature_specimen_url, signature_specimen_uploaded_at |
| `lawyer_members` | Personnel tracking for law firms | lawyer_id, full_name, role, role_title, email, phone, bar_number, bar_jurisdiction, residential address fields, id_type/number/expiry, is_active, is_signatory |
| `deal_lawyer_assignments` | Links lawyers to specific deals | deal_id, lawyer_id, assigned_by, assigned_at, role, status, notes, completed_at |

### RLS Policies (12 total)

| Table | Policy | Access |
|-------|--------|--------|
| `lawyers` | lawyers_self_via_users | Lawyers can SELECT own firm via lawyer_users |
| `lawyers` | lawyers_staff_all | Staff (admin/ops/rm/ceo) has ALL access |
| `lawyers` | arrangers_read_lawyers | Arrangers can SELECT lawyers on their deals |
| `lawyer_users` | lawyer_users_self_select | Users can SELECT own records |
| `lawyer_users` | lawyer_users_admin_manage | Lawyer admins can manage via is_lawyer_admin() |
| `lawyer_users` | lawyer_users_staff_all | Staff has ALL access |
| `lawyer_members` | lawyer_members_self_select | Lawyers can SELECT own firm's members |
| `lawyer_members` | lawyer_members_admin_manage | Lawyer admins can manage |
| `lawyer_members` | lawyer_members_staff_all | Staff has ALL access |
| `deal_lawyer_assignments` | Lawyers can view own assignments | Via lawyer_users join |
| `deal_lawyer_assignments` | Staff can manage lawyer assignments | Staff has ALL access |
| `deal_lawyer_assignments` | arrangers_read_lawyer_assignments | Arrangers on deal can SELECT |

### Existing Test Data
- **Lawyer Entity**: "Test Law Firm LLP" (ID: 44444444-4444-4444-4444-444444444444)
- **KYC Status**: not_started
- **Users**: 1 linked user
- **Deals Assigned**: 1

---

## Backend Analysis

### API Routes for Lawyer

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/lawyers/me/upload-signature` | POST | Upload signature specimen (PNG/JPEG/WebP, max 5MB) |
| `/api/lawyers/me/upload-signature` | DELETE | Remove signature specimen |
| `/api/lawyers/me/introducer-commissions/[id]/confirm-payment` | POST | Confirm introducer commission payment |
| `/api/admin/lawyers` | POST | Admin: Create new law firm |
| `/api/admin/lawyers` | GET | Admin: List all lawyers with filters |
| `/api/admin/lawyers/[id]` | GET | Admin: Get lawyer details |
| `/api/admin/lawyers/[id]` | PATCH | Admin: Update lawyer info |
| `/api/admin/lawyers/[id]` | DELETE | Admin: Soft delete lawyer |

### Server Components (Pages)

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/versotech_main/dashboard` | Lawyer metrics, alerts, quick actions |
| Profile | `/versotech_main/lawyer-profile` | Personal info, firm info, signature upload |
| Assigned Deals | `/versotech_main/assigned-deals` | Deals assigned via deal_lawyer_assignments |
| Escrow | `/versotech_main/escrow` | Escrow funding status (shared with arranger) |
| Reconciliation | `/versotech_main/lawyer-reconciliation` | Financial reconciliation tabs |
| Subscription Packs | `/versotech_main/subscription-packs` | Review signed subscription docs |
| Notifications | `/versotech_main/notifications` | Alerts and updates |
| Messages | `/versotech_main/messages` | Communications |

---

## UI Analysis

### Lawyer Pages

| File | Purpose |
|------|---------|
| `app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx` | Main dashboard with metrics |
| `app/(main)/versotech_main/lawyer-profile/page.tsx` | Profile management |
| `app/(main)/versotech_main/lawyer-reconciliation/page.tsx` | Financial reconciliation |
| `app/(main)/versotech_main/assigned-deals/page.tsx` | Deal assignments list |
| `app/(main)/versotech_main/my-lawyers/page.tsx` | Arranger's lawyer network view |
| `app/(main)/versotech_main/lawyers/[id]/page.tsx` | Staff lawyer detail view |

### Lawyer Sidebar Navigation

```
- Dashboard (LayoutDashboard)
- Assigned Deals (Briefcase) → /versotech_main/assigned-deals
- Escrow (Lock) → /versotech_main/escrow
- Subscription Packs (FileText) → /versotech_main/subscription-packs
- Reconciliation (Calculator) → /versotech_main/lawyer-reconciliation
- Profile (FileSignature) → /versotech_main/lawyer-profile
- Notifications (Bell) → /versotech_main/notifications
- Messages (MessageSquare) → /versotech_main/messages
```

### Components

| Component | File | Purpose |
|-----------|------|---------|
| LawyerProfileClient | `components/lawyer/lawyer-profile-client.tsx` | Profile display + signature upload |
| LawyerReconciliationClient | `components/lawyer/lawyer-reconciliation-client.tsx` | 4-tab reconciliation interface |
| ConfirmIntroducerPaymentModal | `components/lawyer/confirm-introducer-payment-modal.tsx` | Payment confirmation dialog |
| LawyersDashboard | `components/staff/lawyers/lawyers-dashboard.tsx` | Staff: all lawyers management |
| LawyerDetailClient | `components/staff/lawyers/lawyer-detail-client.tsx` | Staff: lawyer detail view |
| AddLawyerDialog | `components/staff/lawyers/add-lawyer-dialog.tsx` | Create new law firm |
| EditLawyerDialog | `components/staff/lawyers/edit-lawyer-dialog.tsx` | Edit lawyer info |

---

## Test Data Created

### Notifications (4 created)
| ID | Title | Type |
|----|-------|------|
| bdfec1ca-db66-43ea-85f0-3748ecbaf327 | Subscription Pack Signed by CEO | subscription |
| 866024c6-ebe6-4fbd-b5ec-e1f62ba294c1 | Escrow Funding Update | escrow |
| aa2d7c41-2abe-4da6-8649-8906f2945f5f | Partner Invoice Received | invoice |
| ae3ebfef-db95-4bd5-8bd4-de4865a3b439 | Introducer Fee Payment Pending | payment |

### Subscriptions on Assigned Deal (1 existing)
| ID | Investor | Commitment | Funded | Status |
|----|----------|------------|--------|--------|
| abacb813-30ac-496a-9f65-c13ab0aefcb3 | 8753bf9d-... | $500,000 | $0 | committed |

### Introducer Commissions (2 existing)
| ID | Introducer | Amount | Status |
|----|------------|--------|--------|
| 66666666-6666-6666-6666-666666666666 | 22222222-... | $500 | accrued |
| 34a43f98-fdb6-498b-864d-0ecb93e5ad82 | 8ad2164a-... | $7,500 | invoice_requested |

---

## Issues Found

### Critical Issues (Blocking)

| # | Issue | Location | Description | Impact |
|---|-------|----------|-------------|--------|
| 1 | **Profile Page Data Not Loading** | `lawyer-profile/page.tsx` | Firm Name and Display Name show "Not set" despite having values in database. Status shows "Inactive" but is_active=true in DB. | Blocks 3.1.1-01, 3.1.4-03 |
| 2 | **Notifications Not Displaying** | `notifications/page.tsx` | 4 notifications created in DB but UI shows "You're all caught up!". Notifications query is not returning results. | Blocks all 3.2.x stories |
| 3 | **Escrow Page Shows 0 Deals** | `escrow/page.tsx` | Escrow page shows 0 deals despite lawyer being assigned to 1 active deal. Query or RLS issue. | Blocks 3.3.1-01, 3.3.1-02, 3.3.5-01 |
| 4 | **Assigned Deals List Empty** | `assigned-deals/page.tsx` | Metrics show "Pending Review: 1" but list shows "0 deals found". Data/query mismatch. | Affects deal visibility |

### Medium Issues

| # | Issue | Location | Description | Impact |
|---|-------|----------|-------------|--------|
| 5 | Dashboard shows inconsistent data | `lawyer-dashboard.tsx` | Shows "1 Assigned Deal" in sidebar but "No deals assigned yet" in recent deals section | UX confusion |
| 6 | Subscription Pack signed date shows "Unknown" | `subscription-packs/page.tsx` | signed_at field is null in test data, but UI doesn't handle gracefully | Minor display issue |

### V2 Features Not Implemented

The following are marked V2 in user stories and not yet implemented:
- STA (Shares Transfer Agreement) workflow (3.3.7-01, 3.3.7-02)
- Performance fees confirmation (3.3.7-03, 3.3.7-04)
- Redemption reconciliation (3.4.3-01)
- Conversion reconciliation (3.4.4-01)
- GDPR features (3.5.x - all except policy display)

---

## Bugs Fixed

| # | Bug | Fix Applied | Date |
|---|-----|-------------|------|
| 1 | Test user auth failed - missing auth.identities record | Created identity record with email provider | 2026-01-01 |
| 2 | Password hash wrong cost factor (6 vs 10) | Updated hash with bcrypt cost factor 10 | 2026-01-01 |

---

## UI Test Screenshots

| Screenshot | Page | Notes |
|------------|------|-------|
| 01-lawyer-landing.png | Landing Page | ✅ Working |
| 02-lawyer-login-page.png | Login Page | ✅ Working |
| 06-lawyer-login-result.png | Dashboard | ✅ Login successful |
| 07-lawyer-assigned-deals.png | Assigned Deals | ⚠️ List empty despite metrics |
| 08-lawyer-profile.png | Profile | ❌ Firm data not loading |
| 09-lawyer-reconciliation.png | Reconciliation | ✅ Working correctly |
| 10-lawyer-notifications.png | Notifications | ❌ No notifications showing |
| 11-lawyer-escrow.png | Escrow | ❌ 0 deals shown |
| 12-lawyer-subscription-packs.png | Subscription Packs | ✅ Working correctly |

---

## Final Summary

| Section | Total | Pass | Fail | Partial | N/A |
|---------|-------|------|------|---------|-----|
| 3.1 My Profile | 9 | 1 | 4 | 1 | 3 |
| 3.2 My Notifications | 15 | 2 | 11 | 2 | 0 |
| 3.3 Escrow Account Handling | 21 | 2 | 10 | 3 | 6 |
| 3.4 Reporting | 4 | 2 | 0 | 0 | 2 |
| 3.5 GDPR | 10 | 0 | 0 | 1 | 9 |
| **TOTAL** | **59** | **7** | **25** | **7** | **20** |

### Status Breakdown:
- **PASS (7)**: 12% - Fully working features
- **FAIL (25)**: 42% - Broken features requiring fixes
- **PARTIAL (7)**: 12% - Partially implemented
- **N/A (20)**: 34% - V2 features or not applicable

### Priority Fixes Required:
1. **Profile Page**: Fix data fetching for lawyer entity (firm_name, display_name, is_active)
2. **Notifications**: Debug notification query - check RLS policy or type filtering
3. **Escrow Page**: Fix deal query to show assigned deals
4. **Assigned Deals**: Fix list query to match metrics count

### Working Features:
- ✅ Login/Authentication
- ✅ Dashboard (metrics partial)
- ✅ Reconciliation page (all tabs)
- ✅ Subscription Packs page
- ✅ Signature upload UI

Overall: **12% PASS, 42% FAIL, 46% PARTIAL/N/A**
