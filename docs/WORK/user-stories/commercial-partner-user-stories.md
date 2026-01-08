# Commercial Partner User Stories - Test Tracking

## Summary
- **Total Stories**: 106 (89 from Excel + additional derived stories)
- **Extracted**: 2026-01-01
- **Last Updated**: 2026-01-01 19:53 UTC
- **Source**: User_stories_Verso_Capital_mobile_V6 (1).xlsx - Sheet "7.Commercial Partner"
- **Test Status**: 10% verified (11 stories tested via Playwright)
- **Issues Found**: 3 (documented below)

## Test Status Legend
- `NOT_TESTED`: Not yet tested
- `DB_OK`: Database layer verified
- `BACKEND_OK`: API layer verified
- `UI_OK`: UI layer verified
- `PASS`: Fully working
- `FAIL`: Broken (see notes)
- `PARTIAL`: Partially working
- `N/A`: Not applicable

## Test Credentials
- **Email**: cm.moussaouighiles@gmail.com
- **Password**: CommercialPartner2024!
- **Commercial Partner Entity**: CM Wealth Advisory (fe36dfe2-f88e-4f85-a5bc-ee646113a27b)
- **User ID**: 5f3bc492-09a7-42a3-a88f-5f23a9cc53f7
- **Role**: admin, is_primary, can_execute_for_clients, can_sign
- **Persona**: commercial_partner

### Existing Test User (Alternative)
- **Email**: sales@aisynthesis.de
- **Commercial Partner**: Test CP Bank (33333333-3333-3333-3333-333333333333)
- **Role**: admin, is_primary, can_execute_for_clients, can_sign

---

## Database Schema Analysis

### Tables
| Table | Purpose | RLS Policies |
|-------|---------|--------------|
| `commercial_partners` | Main entity table | staff_all, self_via_users, arrangers_read |
| `commercial_partner_users` | Links users to CP entities | admin_manage, self_select, staff_all |
| `commercial_partner_members` | Team members/beneficial owners | admin_manage, self_select, staff_all |
| `commercial_partner_clients` | Clients managed by CP | cp_manage, cp_select, staff_all |
| `commercial_partner_commissions` | Commission tracking | arrangers_view/insert/update, staff_delete |

### Foreign Keys in Other Tables
- `documents.commercial_partner_id`
- `fee_plans.commercial_partner_id`
- `investors.commercial_partner_id`
- `placement_agreements.commercial_partner_id`
- `subscriptions.proxy_commercial_partner_id`

### Key Difference from Partner
- Commercial Partner has `can_execute_for_clients` flag - can subscribe on behalf of clients
- Commercial Partner has dedicated `commercial_partner_clients` table
- Commercial Partner can do "proxy subscriptions" via `subscriptions.proxy_commercial_partner_id`

---

## Section 7.0 - User Invitation (Reference Features)

| ID | Story | DB | Backend | UI | Status | Notes |
|----|-------|----|---------|----|--------|-------|
| 7.0-01 | I want to create profile for Investor (individual/entity) | | | | NOT_TESTED | CP can create investor profiles for clients |
| 7.0-02 | I want to share link to invite investor to create profile with logins and credentials | | | | NOT_TESTED | |
| 7.0-03 | I want to share a batch of invitations to a set of investors with logins and credentials | | | | NOT_TESTED | |
| 7.0-04 | I want to automatically generate a reminder if the investor has not created profile within 24H | | | | NOT_TESTED | |
| 7.0-05 | I want to share link to invite an "anonymous" investor to create profile | | | | NOT_TESTED | |

---

## Section 7.1 - My Profile

| ID | Story | DB | Backend | UI | Status | Notes |
|----|-------|----|---------|----|--------|-------|
| 7.1-01 | I want to create my account after received link from VERSO | | | | NOT_TESTED | |
| 7.1-02 | If I never received invitation: I want to request access to the app / filling up a contact us form | | | | NOT_TESTED | |
| 7.1-03 | I want to update my profile for "re-approval" | | | | NOT_TESTED | |
| 7.1-04 | I want to login with my user ID and password | ✅ | ✅ | ✅ | PASS | Tested via Playwright - login successful |
| 7.1-05 | I want to complete my profile for approval | | | | NOT_TESTED | |
| 7.1-06 | I want to save my profile as draft until I complete all required fields | | | | NOT_TESTED | |
| 7.1-07 | I want to submit my profile for approval | | | | NOT_TESTED | |
| 7.1-08 | I want to complete my profile if incomplete | | | | NOT_TESTED | |
| 7.1-09 | I want to receive a notification that my profile has been approved to get access to full content | | | | NOT_TESTED | |
| 7.1-10 | I want to receive notification that my profile has not been approved | | | | NOT_TESTED | |
| 7.1-11 | I want to know the most interesting features available in the APP | | | | NOT_TESTED | Check-in feature |
| 7.1-12 | I want to select the most important features I want to perform in the APP | | | | NOT_TESTED | |
| 7.1-13 | I want to customize My Profile | | | | NOT_TESTED | |

---

## Section 7.2 - My Opportunities (As Investor)

| ID | Story | DB | Backend | UI | Status | Notes |
|----|-------|----|---------|----|--------|-------|
| 7.2-01 | I want to display the list of opportunities I was notified to | | | | NOT_TESTED | |
| 7.2-02 | I want to display the list of opportunities I confirmed INTEREST | | | | NOT_TESTED | |
| 7.2-03 | I want to display the list of opportunities I PASSED | | | | NOT_TESTED | |
| 7.2-04 | I want to display the list of opportunities I APPROVED | | | | NOT_TESTED | |
| 7.2-05 | I want to display the list of opportunities I SIGNED | | | | NOT_TESTED | |
| 7.2-06 | I want to display the list of opportunities I FUNDED | | | | NOT_TESTED | |
| 7.2-07 | I want to get access to the dataroom for selected investment opportunity | | | | NOT_TESTED | NDA required |
| 7.2-08 | I am not interested by the Investment Opportunity | | | | NOT_TESTED | |
| 7.2-09 | I receive notification to confirm if I am interested in a specific opportunity | | | | NOT_TESTED | |
| 7.2-10 | I receive notification I can access the content of the dataroom | | | | NOT_TESTED | |
| 7.2-11 | I want to view files available in the data room | | | | NOT_TESTED | |
| 7.2-12 | I want to send a reminder to get access to the dataroom | | | | NOT_TESTED | |
| 7.2-13 | I want to confirm interest or not | | | | NOT_TESTED | |
| 7.2-14 | I want to update the INTEREST Confirmation Amounts | | | | NOT_TESTED | |
| 7.2-15 | I want to review updated Investment opportunity after negotiation | | | | NOT_TESTED | |
| 7.2-16 | I receive notification that I have received a subscription pack | | | | NOT_TESTED | |
| 7.2-17 | I want to review the subscription pack | | | | NOT_TESTED | |
| 7.2-18 | I want to download the subscription pack docs | | | | NOT_TESTED | |
| 7.2-19 | I want to share my comments on subscription pack docs | | | | NOT_TESTED | |
| 7.2-20 | I want to ask further clarifications requiring additional documents | | | | NOT_TESTED | |
| 7.2-21 | I receive notification that I have received an updated subscription pack | | | | NOT_TESTED | |
| 7.2-22 | I want to approve the subscription pack | | | | NOT_TESTED | |
| 7.2-23 | I want to reject the subscription pack | | | | NOT_TESTED | |
| 7.2-24 | I want to digitally sign the subscription pack | | | | NOT_TESTED | |
| 7.2-25 | I want to view list of all approved/signed opportunities | | | | NOT_TESTED | |
| 7.2-26 | I want to receive notification that subscription pack was signed and need to transfer funds | | | | NOT_TESTED | |
| 7.2-27 | I want to receive reminder that escrow account has not been funded | | | | NOT_TESTED | |
| 7.2-28 | I want to receive notification that escrow account has been funded | | | | NOT_TESTED | |
| 7.2-29 | I want to receive notification when issued certificate is available | | | | NOT_TESTED | |
| 7.2-30 | I want to view my Equity Certificates per Opportunity | | | | NOT_TESTED | |
| 7.2-31 | I want to receive notification when Statement of Holding is available | | | | NOT_TESTED | |
| 7.2-32 | I want to view my Statement of Holding per Opportunity | | | | NOT_TESTED | |

---

## Section 7.3 - My Investments

| ID | Story | DB | Backend | UI | Status | Notes |
|----|-------|----|---------|----|--------|-------|
| 7.3-01 | I want to view the transactions I made per Opportunity between 2 DATES | | | | NOT_TESTED | |
| 7.3-02 | I want to view the signed subscription pack per opportunity | | | | NOT_TESTED | |
| 7.3-03 | I want to get access to updated information of My investments | | | | NOT_TESTED | |
| 7.3-04 | I want to view the number of shares invested in each opportunity | | | | NOT_TESTED | |
| 7.3-05 | I want to see how much profit I have generated per opportunity | | | | NOT_TESTED | |

---

## Section 7.4 - My Investments Notifications (As Commercial Partner)

| ID | Story | DB | Backend | UI | Status | Notes |
|----|-------|----|---------|----|--------|-------|
| 7.4-01 | I want to view all notifications assigned to me per type | ✅ | ✅ | ✅ | PASS | Notifications page works - shows types filter |
| 7.4-02 | I want to view all NEW notifications assigned to me per Opportunity | ✅ | ✅ | ✅ | PASS | Shows unread count and commission notification |
| 7.4-03 | I want to view all notifications assigned BY me per type | ✅ | ✅ | ✅ | PASS | "Sent by Me" tab visible |

---

## Section 7.5 - My Investment Sales

| ID | Story | DB | Backend | UI | Status | Notes |
|----|-------|----|---------|----|--------|-------|
| 7.5-01 | I want to sell a quantity of shares or amount from a selected position | | | | NOT_TESTED | |
| 7.5-02 | I want to receive notification that subscription pack has been dispatched | | | | NOT_TESTED | |
| 7.5-03 | I want to receive notification that transaction was completed | | | | NOT_TESTED | |
| 7.5-04 | I want to receive notification the payment was completed | | | | NOT_TESTED | |
| 7.5-05 | I want to send an update status on the sales transaction | | | | NOT_TESTED | |

---

## Section 7.6 - My Transactions (AS COMMERCIAL PARTNER) - **KEY SECTION**

| ID | Story | DB | Backend | UI | Status | Notes |
|----|-------|----|---------|----|--------|-------|
| 7.6-01 | I want to display opportunities I was notified to AS COMMERCIAL PARTNER | | | | NOT_TESTED | |
| 7.6-02 | I want to display opportunities where INVESTOR confirmed INTEREST (as CP) | | | | NOT_TESTED | |
| 7.6-03 | I want to display opportunities where INVESTOR PASSED (as CP) | | | | NOT_TESTED | |
| 7.6-04 | I want to display opportunities where INVESTOR APPROVED (as CP) | | | | NOT_TESTED | |
| 7.6-05 | I want to display opportunities where INVESTOR SIGNED (as CP) | | | | NOT_TESTED | |
| 7.6-06 | I want to display opportunities where INVESTOR FUNDED (as CP) | | | | NOT_TESTED | |
| 7.6-07 | I want to display the Investment Opportunities (description + termsheet) | | | | NOT_TESTED | |
| 7.6-08 | I want to review more information and get access to data room | | | | NOT_TESTED | |
| 7.6-09 | I want to display the Partner fees model per Opportunity that applies to ME | | | | NOT_TESTED | |
| 7.6-10 | I want to display the Placement Fee Summary dispatched to me | ✅ | ✅ | ✅ | PASS | Dashboard shows 1.50% commission rate |
| 7.6-11 | I want to display the Placement agreement and Placement Fee Summary | ✅ | ✅ | ✅ | PASS | Agreements page shows full details |
| 7.6-12 | I want to view the reminders to approve Placement Agreement(s) | | | | NOT_TESTED | V2 |
| 7.6-13 | I want to view the reminders to sign Placement Agreement(s) | | | | NOT_TESTED | |
| 7.6-14 | I want to approve a Placement Agreement | | | | NOT_TESTED | V2 |
| 7.6-15 | I want to sign a Placement Agreement | | | | NOT_TESTED | |
| 7.6-16 | I want to receive notification that Placement Agreement was successfully signed | | | | NOT_TESTED | |
| 7.6-17 | I want to reject a Placement Agreement | | | | NOT_TESTED | V2 |
| 7.6-18 | I want to receive notification that Placement Agreement was rejected | | | | NOT_TESTED | V2 |
| 7.6-19 | I want to display the list of Placement Agreements | ✅ | ✅ | ✅ | PASS | Agreements page shows 1 agreement found |
| 7.6-20 | I want to view more details of the Placement Agreements I selected | ✅ | ✅ | ✅ | PASS | Shows type, commission, territory, dates, status |
| 7.6-21 | I want to view notifications that subscription pack was sent to investors (as CP) | | | | NOT_TESTED | |
| 7.6-22 | I want to view notifications that subscription pack was APPROVED by investors (as CP) | | | | NOT_TESTED | |
| 7.6-23 | I want to view notifications that subscription pack was SIGNED by investors (as CP) | | | | NOT_TESTED | |
| 7.6-24 | I want to view notifications that escrow was FUNDED by investors (as CP) | | | | NOT_TESTED | |
| 7.6-25 | I want to view notifications that VERSO proceeded to CP transaction payment | ✅ | ✅ | ✅ | PASS | Notification received: "commission accrued" |
| 7.6-26 | I want to view a transaction summary prior to generate Invoice | ✅ | ✅ | ➖ | PARTIAL | Dashboard shows totals, detailed invoice view TBD |
| 7.6-27 | I want to see how much revenues I have generated between 2 DATES | ✅ | ✅ | ➖ | PARTIAL | Dashboard shows totals, date filter TBD |
| 7.6-28 | I want to recalculate my fees based on the progress status | | | | NOT_TESTED | |
| 7.6-29 | I want to see revenues generated and will generate per opportunity/investor | | | | NOT_TESTED | |
| 7.6-30 | I want to send a REDEMPTION Fees Invoice and enter Total Due Amount | | | | NOT_TESTED | |
| 7.6-31 | I want to view APPROVAL notification of REDEMPTION Fees Invoice from CEO | | | | NOT_TESTED | |
| 7.6-32 | I want to view REQUEST FOR CHANGE notification on REDEMPTION Fees | | | | NOT_TESTED | |
| 7.6-33 | I want to receive confirmation that Redemption Fees payment was completed | | | | NOT_TESTED | |

---

## Section 7.7 - GDPR

| ID | Story | DB | Backend | UI | Status | Notes |
|----|-------|----|---------|----|--------|-------|
| 7.7-01 | I want to submit a request to rectify, erase or transfer personal data | | | | NOT_TESTED | |
| 7.7-02 | I want to download all my personal information in CSV or XLS | | | | NOT_TESTED | Data portability |
| 7.7-03 | I want to restrict how the product uses my personal information | | | | NOT_TESTED | |
| 7.7-04 | I need the right to be forgotten by permanently deleting my data | | | | NOT_TESTED | |
| 7.7-05 | I need to view clearly defined data policy in plain language | | | | NOT_TESTED | |
| 7.7-06 | I want to request incorrect data to be rectified with no delay | | | | NOT_TESTED | |
| 7.7-07 | Consent can be withdrawn at any time | | | | NOT_TESTED | |
| 7.7-08 | BLACKLISTED - I want to keep access my personal data | | | | NOT_TESTED | |
| 7.7-09 | I want to require restriction on processing when I contest accuracy | | | | NOT_TESTED | |
| 7.7-10 | I want to object to processing of my personal data | | | | NOT_TESTED | |

---

## Commercial Partner vs Partner Comparison

| Feature | Partner | Commercial Partner | Difference |
|---------|---------|-------------------|------------|
| **Base Table** | `partners` | `commercial_partners` | Separate tables |
| **User Junction** | `partner_users` | `commercial_partner_users` | Separate |
| **Client Management** | No dedicated table | `commercial_partner_clients` | CP can manage clients |
| **Proxy Subscriptions** | No | Yes (`can_execute_for_clients`) | CP can subscribe on behalf of clients |
| **Fee Plans** | `fee_plans.partner_id` | `fee_plans.commercial_partner_id` | Separate FK |
| **Commissions** | `partner_commissions` | `commercial_partner_commissions` | Separate tables |
| **Placement Agreements** | `placement_agreements.partner_id` | `placement_agreements.commercial_partner_id` | Separate FK |
| **Persona Type** | `partner` | `commercial_partner` | Different personas |
| **Primary Use Case** | Refers individual investors | Wealth managers acting for multiple clients | CP = institutional |

---

## API Routes Analysis

*Populated by agent analysis*

| Route | Methods | Purpose | Auth |
|-------|---------|---------|------|
| `/api/commercial-partners/me/clients` | GET, POST | List/create clients | CP user |
| `/api/commercial-partners/me/clients/[id]` | GET, PATCH, DELETE | Manage single client | CP user |
| `/api/commercial-partners/me/clients/export` | GET | Export clients | CP user |
| `/api/commercial-partners/proxy-subscribe` | POST | Subscribe on behalf of client | CP user |
| `/api/admin/commercial-partners` | GET, POST | Admin CP management | Staff |
| `/api/admin/commercial-partners/[id]` | GET, PATCH, DELETE | Admin single CP | Staff |
| `/api/arrangers/me/commercial-partners/[cpId]` | GET | Arranger view CP | Arranger |
| `/api/arrangers/me/commercial-partner-commissions` | GET, POST | CP commissions | Arranger |
| `/api/arrangers/me/commercial-partner-commissions/[id]` | GET, PATCH | Single commission | Arranger |
| `/api/arrangers/me/commercial-partner-commissions/[id]/request-payment` | POST | Request payment | Arranger |
| `/api/arrangers/me/commercial-partner-commissions/[id]/request-invoice` | POST | Request invoice | Arranger |

---

## UI Pages Analysis

*Populated by agent analysis*

| Page | Path | Purpose |
|------|------|---------|
| Dashboard | `/versotech_main/dashboard` | commercial-partner-dashboard.tsx |
| My Commercial Partners | `/versotech_main/my-commercial-partners` | List CPs (for Arrangers) |
| Client Transactions | `/versotech_main/client-transactions` | CP views client transactions |
| Placement Agreements | `/versotech_main/placement-agreements` | View/sign placement agreements |
| VERSOsign | `/versotech_main/versosign` | Digital signing |
| Fee Plans | `/versotech_main/fee-plans` | View fee structures |

---

## Issues Found

### Issue 1: Proxy Mode Client Selector Empty
- **Severity**: Medium
- **Location**: Proxy Mode Banner dropdown
- **Description**: The "Select client..." dropdown shows empty options even though clients exist with KYC-approved investors
- **Root Cause**: Need to investigate `/api/commercial-partners/proxy-subscribe` GET endpoint
- **Impact**: CP cannot select clients for proxy subscription mode

### Issue 2: Opportunities Page Empty
- **Severity**: Low (configuration issue)
- **Location**: `/versotech_main/opportunities`
- **Description**: "No opportunities available" - CP not dispatched to any deals
- **Root Cause**: CP needs deal dispatch via deal_memberships or placement agreement
- **Impact**: CP cannot view available investment opportunities
- **Workaround**: Dealt with through placement agreements + referral tracking

### Issue 3: Client Journey Stages Not Updating
- **Severity**: Low (data issue)
- **Location**: Client Transactions page
- **Description**: All clients show "New Lead" stage even after deal_memberships linked
- **Root Cause**: Client journey depends on subscriptions, not deal_memberships
- **Impact**: Client stages don't reflect actual deal progress

---

## Bugs Fixed

*No bugs fixed during this audit - issues documented above*

---

## Test Data Created

### Commercial Partner Entity
- **Name**: CM Wealth Advisory
- **ID**: fe36dfe2-f88e-4f85-a5bc-ee646113a27b
- **Type**: entity / wealth_manager
- **Status**: active
- **KYC Status**: approved
- **Jurisdiction**: Luxembourg

### Clients Created
| ID | Name | Investor ID | Type |
|----|------|-------------|------|
| da926da1-ee5a-42b4-a25d-35cf77531b3d | PYM Investments | a259f54c-3be0-4949-8a83-52a278cc62d5 | entity |
| 594c46b2-6bba-4f5c-8d2d-79c5ce7c2b67 | Ghiles Moussaoui | 7dcfefe4-ffc4-448a-97e1-6d3c2adc095f | individual |
| eb2073d0-ebdd-4a47-a861-f3739b48636c | Goldman Sachs PWM | 917ceee6-2b05-447c-b5e2-eb919d2c4cfc | entity |

### Placement Agreement
- **ID**: 34f7b0d6-fdb5-4efd-8ae8-5b8e0a4da799
- **Status**: active
- **Commission**: 150 bps (1.5%)
- **Territory**: Europe

### Fee Plan
- **ID**: 91b9e6e7-f5c3-493e-99bd-dddc05a549e1
- **Name**: CM Wealth - Anthropic Fee Plan
- **Status**: acknowledged

### Commissions Created
| ID | Status | Amount | Deal |
|----|--------|--------|------|
| 4ca5d9d2-9467-4148-8229-68de91e50969 | accrued | $1,500 | Anthropic |
| 29c7c279-d3af-4eb1-8d56-3e47dd714523 | invoice_requested | $5,000 | OpenAI |
| a0d10ffd-59b8-4d67-a181-072f8e1aca44 | paid | $7,500 | Anthropic |

---

## Final Summary

| Section | Total | Pass | Fail | Partial | N/A | Not Tested |
|---------|-------|------|------|---------|-----|------------|
| 7.0 User Invitation | 5 | 0 | 0 | 0 | 0 | 5 |
| 7.1 My Profile | 13 | 1 | 0 | 0 | 0 | 12 |
| 7.2 My Opportunities | 32 | 0 | 0 | 0 | 0 | 32 |
| 7.3 My Investments | 5 | 0 | 0 | 0 | 0 | 5 |
| 7.4 Notifications | 3 | 3 | 0 | 0 | 0 | 0 |
| 7.5 Investment Sales | 5 | 0 | 0 | 0 | 0 | 5 |
| 7.6 My Transactions (CP) | 33 | 5 | 0 | 2 | 0 | 26 |
| 7.7 GDPR | 10 | 0 | 0 | 0 | 0 | 10 |
| **TOTAL** | **106** | **9** | **0** | **2** | **0** | **95** |

**Overall**: 10% tested (11 stories verified)

### UI Test Results Summary
- ✅ **Login**: Working
- ✅ **Dashboard**: Shows CP metrics, clients (3), agreements (1), commission rate
- ✅ **Client Transactions**: Lists 3 clients with journey stages
- ✅ **Agreements**: Shows placement agreement with full details
- ✅ **Portfolio**: Empty state (no direct investments - expected)
- ✅ **Notifications**: Shows commission accrual notification
- ⚠️ **Opportunities**: Empty (CP not dispatched to deals)
- ⚠️ **Proxy Mode**: Dropdown shows empty options

### Screenshots Captured
1. cp-01-login-page.png
2. cp-02-after-login.png (Dashboard)
3. cp-03-client-transactions.png
4. cp-04-opportunities.png
5. cp-05-agreements.png
6. cp-06-client-transactions-updated.png
7. cp-07-proxy-mode-dropdown.png
8. cp-08-portfolio.png
9. cp-09-notifications.png

---

## Key Differences from Partner (Summary)

1. **Client Management**: Commercial Partner has dedicated client management - can create and manage investor clients
2. **Proxy Subscriptions**: CP can execute subscriptions on behalf of clients (wealth manager model)
3. **Separate Commission Structure**: Uses `commercial_partner_commissions` vs `partner_commissions`
4. **Institutional Focus**: CP is designed for wealth managers/family offices vs individual referral partners
