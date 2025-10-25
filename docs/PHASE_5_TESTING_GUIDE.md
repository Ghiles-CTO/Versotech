# Phase 5 Testing Guide

**Date**: 2025-01-24
**Status**: Ready for Testing

## Overview

This guide provides step-by-step instructions for testing the new subscription management system implemented in Phase 5. All components have been successfully compiled and the development server is running without errors.

## Development Server Status

✅ **Server Running**: http://localhost:3000
✅ **Compilation**: No errors
✅ **TypeScript**: Type-safe (fixed acknowledgement_notes field)

## Test Data Available

### Test Investor: VEGINVEST
- **ID**: `93e66a5c-1ec1-4b9d-aac8-6ce0a17cb3d8`
- **Subscriptions**: 5 subscriptions to VERSO Capital 1 SCSP Series 106
  - Subscription #1: €150,000
  - Subscription #2: €50,000
  - Subscription #3: €100,000
  - Subscription #4: €50,000
  - Subscription #5: €100,800
- **Total Commitment**: €450,800

### Other Test Investors
- **TTL**: `128460c8-0167-4b53-aac9-56a5fe73f8db`
- **SNOWPLUS**: `84f94cf3-2aad-4665-b158-9d60034bf94e`

## Testing Checklist

### 1. API Endpoints Testing

#### GET /api/investors/[investorId]/subscriptions
**Purpose**: Fetch all subscriptions grouped by vehicle

**Manual Test Steps**:
1. Log into the portal as staff user
2. Open browser DevTools Network tab
3. Navigate to investor detail page: `/versotech/staff/investors/93e66a5c-1ec1-4b9d-aac8-6ce0a17cb3d8`
4. Check Network tab for API call
5. Verify response structure:
   ```json
   {
     "investor": { "id": "...", "legal_name": "VEGINVEST" },
     "subscriptions": [...],
     "grouped_by_vehicle": [{
       "vehicle": { "id": "...", "name": "..." },
       "subscriptions": [...],
       "total_commitment": 450800,
       "currency": "EUR"
     }],
     "summary": {
       "total_vehicles": 1,
       "total_subscriptions": 5,
       "total_commitment_by_currency": { "EUR": 450800 }
     }
   }
   ```

**Expected Results**:
- ✅ 200 OK status
- ✅ All 5 subscriptions returned
- ✅ Grouped by vehicle correctly
- ✅ Totals calculated correctly
- ✅ subscription_number field present (1, 2, 3, 4, 5)

#### POST /api/investors/[investorId]/subscriptions
**Purpose**: Create new subscription with fingerprint checking

**Manual Test Steps**:
1. Navigate to investor detail page
2. Click "Add Subscription" button
3. Fill form:
   - Vehicle: Select any vehicle
   - Commitment: 100000
   - Currency: EUR (auto-selected from vehicle)
   - Status: committed
   - Effective Date: 2025-01-24
4. Click "Create Subscription"

**Expected Results**:
- ✅ Subscription created successfully
- ✅ subscription_number auto-incremented (should be #6 for VEGINVEST)
- ✅ Toast notification: "Subscription created successfully"
- ✅ Page refreshes showing new subscription
- ✅ entity_investor link created automatically (via trigger)

**Duplicate Test**:
1. Try creating exact same subscription again (same vehicle, commitment, date)
2. **Expected**: 409 Conflict error
3. **Expected**: Toast: "Duplicate subscription detected"

#### GET /api/investors/[investorId]/subscriptions/[subscriptionId]
**Purpose**: Fetch single subscription details

**Manual Test Steps**:
1. Click "Edit" button on any subscription
2. Check Network tab for API call
3. Verify response includes vehicle and investor details

**Expected Results**:
- ✅ 200 OK status
- ✅ Subscription details returned
- ✅ Vehicle information included
- ✅ Investor information included

#### PATCH /api/investors/[investorId]/subscriptions/[subscriptionId]
**Purpose**: Update mutable fields only

**Manual Test Steps**:
1. Click "Edit" on subscription #1 (€150,000)
2. Modify:
   - Commitment: 175000
   - Status: active
   - Notes: "Updated commitment amount"
3. Click "Save Changes"

**Expected Results**:
- ✅ Subscription updated successfully
- ✅ New values reflected in UI
- ✅ Vehicle field remains read-only (immutable)
- ✅ subscription_number unchanged
- ✅ Toast: "Subscription updated successfully"
- ✅ entity_investor allocation_status updated to "active"

#### DELETE /api/investors/[investorId]/subscriptions/[subscriptionId]
**Purpose**: Soft delete (cancel) subscription

**Manual Test Steps**:
1. Click "Cancel" button on subscription #5
2. Confirm cancellation

**Expected Results**:
- ✅ Status changed to "cancelled"
- ✅ Record NOT deleted from database
- ✅ Still visible in UI (filtered by status if implemented)
- ✅ Toast: "Subscription cancelled successfully"
- ✅ entity_investor allocation_status updated
- ✅ Related holdings cancelled

**Database Verification**:
```sql
SELECT id, subscription_number, status, commitment
FROM subscriptions
WHERE investor_id = '93e66a5c-1ec1-4b9d-aac8-6ce0a17cb3d8'
ORDER BY subscription_number;
```
Should still show 5 subscriptions, with #5 status = 'cancelled'

### 2. UI Components Testing

#### Subscriptions Tab Component

**Location**: Investor Detail Page → Subscriptions Section

**Test Steps**:
1. Navigate to: `/versotech/staff/investors/93e66a5c-1ec1-4b9d-aac8-6ce0a17cb3d8`
2. Scroll to Subscriptions section (between capital metrics and portal users)

**Visual Checks**:
- ✅ Header shows "Subscriptions (5)" with count
- ✅ "Add Subscription" button visible in top-right
- ✅ Subscriptions grouped by vehicle
- ✅ Vehicle card shows:
  - Vehicle name: "VERSO Capital 1 SCSP Series 106"
  - Subscription count: "5 subscriptions"
  - Total commitment: "€450,800.00"
- ✅ Each subscription displays:
  - Hash icon + "#1", "#2", "#3", "#4", "#5"
  - Commitment amount with currency
  - Status badge (color-coded)
  - Effective date (if set)
  - Edit and Cancel buttons
- ✅ Grand Total section shows:
  - "Total Commitment by Currency"
  - "EUR: €450,800.00"

#### Add Subscription Dialog

**Test Steps**:
1. Click "Add Subscription" button
2. Dialog opens

**Visual Checks**:
- ✅ Title: "Add Subscription"
- ✅ Description: "Create a new subscription for this investor"
- ✅ Vehicle dropdown populates with vehicles
- ✅ Currency auto-updates when vehicle selected
- ✅ All fields present:
  - Vehicle (required, red asterisk)
  - Commitment (required, number input)
  - Currency (dropdown, defaults to vehicle currency)
  - Status (dropdown, defaults to "committed")
  - Effective Date (date picker)
  - Funding Due (date picker)
  - Notes (textarea)
- ✅ Cancel and "Create Subscription" buttons visible

**Interaction Tests**:
- ✅ Select vehicle → currency updates automatically
- ✅ Enter commitment: 100000
- ✅ Click Create → Shows loading spinner
- ✅ Success → Dialog closes, toast appears, page refreshes
- ✅ Try duplicate → 409 error toast with clear message

#### Edit Subscription Dialog

**Test Steps**:
1. Click "Edit" button on subscription #1
2. Dialog opens

**Visual Checks**:
- ✅ Title: "Edit Subscription #1" (number in title)
- ✅ Description: "Update subscription details for VERSO Capital 1 SCSP Series 106"
- ✅ Vehicle field is **read-only** (grayed out, immutable notice)
- ✅ All other fields editable:
  - Commitment (pre-filled with current value)
  - Currency (dropdown)
  - Status (dropdown, includes "cancelled" option)
  - Effective Date (date picker, formatted)
  - Funding Due (date picker, formatted)
  - Notes (textarea, pre-filled)
- ✅ Cancel and "Save Changes" buttons visible

**Interaction Tests**:
- ✅ Try to change vehicle → Field is disabled
- ✅ Modify commitment → Updates on save
- ✅ Change status → Updates on save and propagates to entity_investor
- ✅ Click Save → Shows loading spinner
- ✅ Success → Dialog closes, toast appears, UI updates

### 3. Entity Page Display Testing

**Location**: Vehicle Detail Page → Investors Section

**Test Steps**:
1. Navigate to vehicle page for "VERSO Capital 1 SCSP Series 106"
2. Find VEGINVEST in investors list

**Visual Checks**:
- ✅ Subscription header shows "Subscriptions (5)" (plural + count)
- ✅ If only 1 subscription, shows "Subscription" (singular, no count)
- ✅ Total commitment displays correctly (€450,800)
- ✅ All subscriptions listed in expanded view
- ✅ Each subscription shows details

### 4. Deprecation Warning Testing

**Purpose**: Verify old route logs deprecation warning

**Test Steps**:
1. Open browser DevTools Console
2. Navigate to entity (vehicle) page
3. Try to link investor using old "Add Investor" button on entity page
4. Check **server console** (not browser) for warning

**Expected Server Console Output**:
```
[DEPRECATED] POST /api/entities/[id]/investors bypasses subscription_number system.
Use POST /api/investors/[investorId]/subscriptions for proper multi-subscription support.
```

**Note**: Old route still works (backward compatibility), but logs warning.

### 5. Database Integrity Testing

#### Verify Auto-Increment Trigger

**SQL Query**:
```sql
-- Check subscription_number sequence for VEGINVEST + vehicle
SELECT
  subscription_number,
  commitment,
  status,
  created_at
FROM subscriptions
WHERE investor_id = '93e66a5c-1ec1-4b9d-aac8-6ce0a17cb3d8'
  AND vehicle_id = 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'
ORDER BY subscription_number;
```

**Expected Results**:
- ✅ subscription_number: 1, 2, 3, 4, 5 (sequential, no gaps)
- ✅ If new subscription created, next number is 6

#### Verify Fingerprints

**SQL Query**:
```sql
SELECT
  fingerprint,
  investor_id,
  vehicle_id,
  commitment,
  effective_date,
  created_at
FROM subscription_fingerprints
WHERE investor_id = '93e66a5c-1ec1-4b9d-aac8-6ce0a17cb3d8'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Results**:
- ✅ Each subscription has corresponding fingerprint
- ✅ Fingerprint is SHA256 hash (64 hex characters)
- ✅ Creating duplicate shows existing fingerprint prevents creation

#### Verify Entity Investor Link

**SQL Query**:
```sql
SELECT
  id,
  vehicle_id,
  investor_id,
  subscription_id,
  allocation_status,
  created_at
FROM entity_investors
WHERE investor_id = '93e66a5c-1ec1-4b9d-aac8-6ce0a17cb3d8';
```

**Expected Results**:
- ✅ entity_investor record exists (created by trigger)
- ✅ subscription_id points to latest/primary subscription
- ✅ allocation_status matches subscription status
- ✅ Only ONE entity_investor per investor-vehicle pair (ON CONFLICT DO NOTHING)

#### Verify Soft Delete

**SQL Query**:
```sql
-- After cancelling subscription #5
SELECT id, subscription_number, status, updated_at
FROM subscriptions
WHERE investor_id = '93e66a5c-1ec1-4b9d-aac8-6ce0a17cb3d8'
  AND subscription_number = 5;
```

**Expected Results**:
- ✅ Record still exists (NOT deleted)
- ✅ status = 'cancelled'
- ✅ updated_at timestamp updated

### 6. Audit Log Testing

**SQL Query**:
```sql
SELECT
  action,
  entity_type,
  entity_id,
  details->>'subscription_number' as sub_num,
  details->>'commitment' as commitment,
  created_at
FROM audit_logs
WHERE entity_type = 'subscription'
  AND details->>'investor_id' = '93e66a5c-1ec1-4b9d-aac8-6ce0a17cb3d8'
ORDER BY created_at DESC
LIMIT 10;
```

**Expected Results**:
- ✅ 'create_subscription' log when subscription created
- ✅ 'update_subscription' log when subscription edited
- ✅ 'cancel_subscription' log when subscription cancelled
- ✅ All logs include subscription_number in details
- ✅ User ID captured in performed_by field

## Known Issues / Limitations

### Current Session
- ✅ No compilation errors
- ✅ All TypeScript types correct
- ✅ Server running successfully
- ⚠️ API endpoints require authentication (cannot test with curl without auth token)

### To Address in Future Phases
- No pagination (will need for investors with 100+ subscriptions)
- No search/filter functionality
- Edit dialog only updates single subscription (not bulk)
- No subscription history/timeline view

## Success Criteria

Phase 5 is considered successful if:

1. ✅ **Compilation**: No errors, dev server runs
2. ✅ **Types**: All TypeScript types valid
3. ✅ **Database**: subscription_number auto-increments correctly
4. ✅ **Fingerprints**: Duplicates prevented (409 response)
5. ✅ **UI**: Subscriptions tab displays correctly with counts
6. ✅ **Dialogs**: Add/Edit work without errors
7. ✅ **Soft Delete**: Cancelled subscriptions remain in database
8. ✅ **Audit Logs**: All operations logged
9. ✅ **Backward Compatibility**: Old route still works with warning

## Next Steps After Testing

1. **Test in development** (use this guide)
2. **Fix any bugs** discovered during testing
3. **User acceptance testing** with internal team
4. **Gradual migration** from old entity page route
5. **Phase 6**: Complete frontend migration
6. **Phase 7**: Add UI warning to old route
7. **Phase 8**: Remove deprecated route entirely

## Testing Summary

**Test Environment**: Development
**Server**: http://localhost:3000
**Test Data**: VEGINVEST (5 subscriptions)
**Ready for Testing**: ✅ YES

All components successfully created and compiled. System ready for manual testing by navigating to investor detail page and using the new subscription management interface.
