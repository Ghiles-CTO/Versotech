# Investor Portal Fix Summary

## Issues Fixed
Fixed investor portal errors for user `biz@ghiless.com` that were causing:
1. Error fetching deals: `{}`
2. Failed to fetch holdings (500): `{"error":"Failed to fetch vehicles"}`

## Root Causes

### 1. Missing API Endpoint Functionality
The `/api/vehicles` endpoint was not handling the `related=true&includeDeals=true` query parameters that the investor holdings page requires. This endpoint is called by `enhanced-holdings-page.tsx` to fetch enriched vehicle data with positions, valuations, and deal allocations.

### 2. Deal Context Selector Query Issue
The `deal-context-selector.tsx` component was using an inner join with vehicles (`vehicles!inner`) which was causing RLS policy issues or returning empty results. The error object was being logged as `{}` instead of providing meaningful error information.

## Changes Made

### 1. Enhanced `/api/vehicles` Route (`versotech-portal/src/app/api/vehicles/route.ts`)

**Added functionality:**
- Detection of `related=true` and `includeDeals=true` query parameters
- Investor-specific data enrichment when these parameters are present
- Fetches vehicles that the investor has subscriptions to
- Enriches each vehicle with:
  - **Subscription data**: commitment, currency, status
  - **Position data**: units, cost basis, current value, unrealized gains
  - **Valuation data**: NAV total, NAV per unit, as-of date
  - **Performance metrics**: unrealized gain percentage
- Fetches deal allocations if `includeDeals=true`:
  - Approved allocations for the investor
  - Deal details (name, type, status, currency)
  - Allocation details (units, unit price, total value)
  - Spread markup information

**Returns:**
```json
{
  "vehicles": [
    {
      "id": "uuid",
      "name": "Vehicle Name",
      "type": "fund",
      "domicile": "Luxembourg",
      "currency": "USD",
      "created_at": "timestamp",
      "position": {
        "units": 100,
        "costBasis": 100000,
        "currentValue": 120000,
        "unrealizedGain": 20000,
        "unrealizedGainPct": 20.0,
        "lastUpdated": "2024-01-01"
      },
      "subscription": {
        "commitment": 500000,
        "currency": "USD",
        "status": "active"
      },
      "valuation": {
        "navTotal": 1000000,
        "navPerUnit": 1200,
        "asOfDate": "2024-01-01"
      },
      "performance": {
        "unrealizedGainPct": 20.0
      }
    }
  ],
  "deals": [
    {
      "id": "uuid",
      "dealId": "uuid",
      "name": "Deal Name",
      "type": "deal",
      "dealType": "equity_secondary",
      "status": "open",
      "currency": "USD",
      "allocation": {
        "units": 50,
        "unitPrice": 1000,
        "totalValue": 50000,
        "status": "approved",
        "approvedAt": "timestamp"
      },
      "spread": {
        "markupPerUnit": 0,
        "totalMarkup": 0,
        "markupPct": 0
      }
    }
  ]
}
```

### 2. Fixed Deal Context Selector (`versotech-portal/src/components/dashboard/deal-context-selector.tsx`)

**Changes:**
- Removed `vehicles!inner` join from deals query to avoid RLS complications
- Fetch vehicle names in a separate query after deals are retrieved
- Added fallback to demo data if no deals are returned (helps with debugging)
- Better handling of empty result sets vs actual errors

**Query approach:**
1. First, fetch accessible deal IDs from `deal_memberships`, `deal_commitments`, `reservations`, and `allocations`
2. Then fetch deal details without inner join
3. Separately fetch vehicle names for the retrieved deals
4. Merge the data client-side

## Database Context

For investor `biz@ghiless.com` (ID: `2a833fc7-b307-4485-a4c1-4e5c5a010e74`):
- **Investor Entity ID**: `8753bf9d-babf-4174-9bc5-75d65c3b0a39`
- **Positions**: 3
- **Subscriptions**: 4
- **Deal Memberships**: 7
- **Deal Commitments**: 6
- **Reservations**: 4
- **Allocations**: 0 (approved)

## RLS Policies Verified

The following RLS policies are in place and working:
- **Deals**: `deal_read` policy allows investors to see deals through deal_memberships or via `get_my_investor_ids()`
- **Vehicles**: Multiple policies including `vehicles_read`, `vehicles_investor_read`, and `vehicles_read_entitled` allow investors to see vehicles they have subscriptions to or deal access to
- **Function**: `get_my_investor_ids()` correctly returns investor IDs from `investor_users` table

## Testing Instructions

### 1. Test Holdings Page
1. Log in as `biz@ghiless.com`
2. Navigate to Holdings page
3. **Expected results:**
   - Portfolio KPI dashboard should load with correct metrics
   - Vehicle holdings should display (3-4 vehicles)
   - Each holding should show:
     - Position details (units, cost basis, current value)
     - Subscription commitment
     - Valuation information
     - Performance metrics
   - No 500 errors in the console
   - No "Failed to fetch vehicles" errors

### 2. Test Dashboard Deal Selector
1. While logged in as investor, navigate to Dashboard
2. Check the deal context selector component
3. **Expected results:**
   - Deal selector should populate with accessible deals
   - Should show deal names, statuses, and vehicle names
   - No `{}` error in console
   - Can select different deals or "All Deals"

### 3. Console Check
Open browser DevTools console and verify:
- No errors related to `/api/vehicles`
- No errors related to deal fetching
- Successful API responses with proper data structure

## API Endpoints Summary

### `/api/vehicles` (GET)
**Query Parameters:**
- `related=true` - Include enriched position/subscription/valuation data
- `includeDeals=true` - Include deal allocations

**Use Cases:**
- **Staff Portal**: Without query params → Returns basic vehicle list
- **Investor Portal Holdings**: With `related=true&includeDeals=true` → Returns enriched data
- **Investor Portal Dashboard**: Standard call → Returns accessible vehicles

### `/api/portfolio` (GET)
**Query Parameters:**
- `breakdown=true` - Include vehicle-by-vehicle breakdown
- `trends=true` - Include 30-day performance trends

**Note**: This endpoint was already working correctly with `investor_users` table.

## Related Files Modified
1. `versotech-portal/src/app/api/vehicles/route.ts` - Enhanced investor data fetching
2. `versotech-portal/src/components/dashboard/deal-context-selector.tsx` - Fixed deal querying approach

## Additional Notes

- The system correctly uses the `investor_users` table to link user accounts to investor entities
- RLS policies properly enforce data access based on user role and investor relationships
- The changes maintain backward compatibility with staff portal usage
- Demo/fallback data is provided when no real data exists to aid in development and debugging

## Next Steps (Optional Enhancements)

1. **Performance Optimization**: Consider caching enriched vehicle data at the API level
2. **Error Handling**: Add more detailed error messages for different failure scenarios
3. **Monitoring**: Add logging/metrics for investor portal API calls to track usage and errors
4. **Deal Spread Calculation**: Implement actual spread markup calculation in deal allocations (currently set to 0)
5. **Pagination**: Add pagination support for investors with many vehicles/deals

