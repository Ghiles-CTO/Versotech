# Partner Persona Issues

Comprehensive audit against 97 user stories in `docs/work/user-stories/partner-user-stories.md`

---

## UI Issues

### Critical: Shared Deals Page 404
- **Page**: `/versotech_main/shared-deals`
- **Issue**: Returns 404 error, page does not exist
- **Affects**: US-5.6.4-01, US-5.6.4-02 (Share Investment Opportunity to Investors)
- **Sidebar shows "Shared Deals" but page is missing**

### Critical: Transactions Page Shows Wrong Data
- **Page**: `/versotech_main/partner-transactions`
- **Issue**: Shows "Converted: 0" and "Total Value: $0" but Dashboard shows 5 subscribed and $9.4M
- **Affects**: US-5.6.1 (View My Transactions as Partner)
- **Root cause**: Transactions page doesn't properly join subscriptions with deal_memberships

```
Dashboard shows:
- 8 Referred Investors
- 5 Subscribed (63% conversion)
- $9,429,154 Total Referred Amount

Transactions page shows:
- 8 Referrals
- 0 Converted
- $0 Total Value
- All entries show "Not subscribed"
```

---

## Database Issues

### RLS Policy: Partners Cannot View Subscriptions
- **Table**: `subscriptions`
- **Issue**: No RLS policy allows Partners to read subscriptions for investors they referred
- **Affects**: US-5.2 (subscription pack tracking), US-5.6.1-05/06 (view signed/funded referrals)
- **Query to verify**:
```sql
SELECT policyname FROM pg_policies WHERE tablename = 'subscriptions' AND policyname LIKE '%partner%';
-- Returns 0 rows
```

### Missing Trigger: Auto-create Partner Commissions
- **Table**: `subscriptions`
- **Issue**: No trigger to auto-create partner commissions when subscription is created
- **Affects**: US-5.6.2-05 (view partner transaction payment notifications)
- **Introducers have `trigger_auto_create_introducer_commission` but Partners don't have equivalent**

### Missing Trigger: Partner Share Opportunity Notifications
- **Issue**: No database triggers/functions for sharing opportunities:
  - No `notify_partner_opportunity_shared()` function
  - No `notify_deal_shared_to_partner()` function
- **Affects**: US-5.6.4 (Share investment opportunity with investors)

### Missing Trigger: Partner Invitation Confirmations
- **Issue**: No trigger to notify partners when investor invitation is sent successfully
- **Affects**: US-5.0.1-02, US-5.0.1-03 (share invitation link, batch invitations)

### Notification Table Inconsistency
- **Issue**: Partner notifications split between `notifications` (20 records) and `investor_notifications` (6 records)
- **Affects**: US-5.4 (My Investments Notifications), US-5.6.2 (Transaction tracking)

---

## Backend API Issues

### Missing: Partner Batch Invitation Endpoint
- **Required by**: US-5.0.1-03 (batch invitation to set of investors)
- **Status**: `/api/admin/batch-invite` exists but requires CEO/super_admin permissions
- **Fix needed**: Partner-accessible batch invite endpoint

### Missing: Partner Profile Update Endpoint
- **Required by**: US-5.1.3-01 to US-5.1.3-04 (profile completion/approval)
- **Status**: No `/api/partners/me` for profile updates
- **Only endpoints**: dashboard, fee-models, share, transactions/export

### Missing: Partner Commissions GET Endpoint
- **Required by**: US-5.6.3-01 to US-5.6.3-03 (revenue reporting)
- **Status**: Only export endpoint exists (`/api/partners/me/transactions/export`)
- **Partners cannot query commission details, amounts, or status via API**

### Missing: Auto-Reminder API
- **Required by**: US-5.0.1-04 (auto-reminder for investor profile creation)
- **Status**: No endpoint for auto-reminder emails

### GDPR Export Incomplete for Partners
- **Required by**: US-5.7.2-01 (data portability)
- **Status**: `/api/gdpr/export` doesn't include Partner-specific data:
  - No referrals/deal_memberships
  - No partner_commissions
  - No partner fee models
  - No shared deals history

### Partner Notifications Not Queryable
- **Issue**: `/api/notifications` only queries `investor_notifications` table
- **When Partners share deals, notifications go to `notifications` table but have no API to retrieve them**

### Profile Management Blocked
- **Issue**: `/api/profiles` requires staff role
- **Partners cannot manage profile via API**

### Subscriptions Blocked for Partners
- **Issue**: `/api/subscriptions` requires `requireStaffAuth()`
- **Partners cannot view subscription details for referred investors**

---

## User Story Failures

### 5.0 User Invitation (4 stories)
| ID | Story | Status | Issue |
|----|-------|--------|-------|
| US-5.0.1-02 | Share link to invite investor | BROKEN | No Partner-facing invite API |
| US-5.0.1-03 | Batch invitations | BROKEN | Batch invite requires admin permissions |
| US-5.0.1-04 | Auto-reminder for profile creation | BROKEN | No auto-reminder API or trigger |

### 5.1 My Profile (13 stories)
| ID | Story | Status | Issue |
|----|-------|--------|-------|
| US-5.1.3-03 | Submit profile for approval | BROKEN | No Partner profile update API |

### 5.2 My Opportunities as Investor (23 stories)
| ID | Story | Status | Issue |
|----|-------|--------|-------|
| US-5.2.5-02 | Review subscription pack | PARTIAL | Partner can't view subscription details (RLS) |

### 5.6 My Transactions as Partner (23 stories)
| ID | Story | Status | Issue |
|----|-------|--------|-------|
| US-5.6.1-01 to 06 | View referrals by stage | BROKEN | Transactions page shows wrong data |
| US-5.6.4-01 | Share opportunity to investor only | BROKEN | Shared Deals page 404 |
| US-5.6.4-02 | Share opportunity to investor + introducer | BROKEN | Shared Deals page 404 |
| US-5.6.3-01 | See revenues between dates | BROKEN | No commissions GET API |

### 5.7 GDPR (10 stories)
| ID | Story | Status | Issue |
|----|-------|--------|-------|
| US-5.7.2-01 | Download personal data in CSV/XLS | PARTIAL | Missing Partner-specific data in export |

---

## Summary

**Total Issues: 15**

| Category | Count |
|----------|-------|
| UI Issues | 2 |
| Database Issues | 5 |
| Backend API Issues | 8 |

### Critical Issues (blocking functionality)
1. Shared Deals page 404
2. Transactions page wrong data
3. Partners can't view subscriptions (RLS)
4. No Partner batch invitation endpoint
5. No Partner commissions API

### High Priority Issues
6. No auto-create partner commission trigger
7. No share opportunity notification triggers
8. GDPR export missing Partner data
9. Partner notifications not queryable

### Medium Priority Issues
10. No Partner profile update API
11. No auto-reminder API
12. Profile management blocked for Partners
13. Subscriptions blocked for Partners
14. Missing Partner invitation confirmation triggers
15. Notification table inconsistency

---

*Generated: 2026-01-02*
