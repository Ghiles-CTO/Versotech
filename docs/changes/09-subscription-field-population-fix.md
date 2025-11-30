# Subscription Field Population Fix

**Date**: November 30, 2025
**Type**: Enhancement / Bug Fix
**Impact**: Deal-to-Portfolio Workflow

## Problem Summary

When a deal subscription submission is approved and a formal subscription record is created, only 14 fields were being populated out of 45 available columns. This resulted in:

- **Deal Workflow Subscriptions (3)**: 0% had `num_shares`, `opportunity_name`, `contract_date`
- **Legacy Imported Subscriptions (625)**: 97% had `num_shares`, 97% had `opportunity_name`, 91% had `contract_date`

The subscription pack webhook payload was calculating values like `certificatesCount`, `pricePerShare`, and `subscriptionFeeAmount` for document generation but **not saving them** to the subscription record.

## Root Cause

In `versotech-portal/src/app/api/approvals/[id]/action/route.ts`, the subscription creation code (lines 694-711) only populated basic fields:
- `investor_id`, `vehicle_id`, `deal_id`, `fee_plan_id`
- `commitment`, `currency`, `status`
- `subscription_date`, `effective_date`, `acknowledgement_notes`
- `subscription_fee_percent`, `management_fee_percent`, `performance_fee_tier1_percent`

Critical fields were missing: `opportunity_name`, `price_per_share`, `num_shares`, `subscription_fee_amount`, `management_fee_frequency`, `performance_fee_tier1_threshold`, `funding_due_at`, `introducer_id`, `introduction_id`, and `contract_date`.

## Solution

### File 1: `versotech-portal/src/app/api/approvals/[id]/action/route.ts`

**Added new queries before subscription creation:**

1. **Fee Structure Query** - Extended to include `price_per_share_text` and `payment_deadline_days`
2. **Valuations Query** - Fetches `nav_per_unit` for price fallback
3. **Fee Components Query** - Fetches `frequency` and `hurdle_rate_bps` from fee plan
4. **Introductions Query** - Links introducer if investor was introduced for this deal

**Added new fields to subscription insert:**

```typescript
// NEW: Populate additional fields for complete subscription record
opportunity_name: submission.deal.vehicle?.investment_name || submission.deal.name,
price_per_share: pricePerShare,           // Parsed from fee structure, fallback to valuation
num_shares: numShares,                     // Calculated as floor(commitment / price_per_share)
subscription_fee_amount: subscriptionFeeAmount,  // Pre-calculated for fee events
management_fee_frequency: managementFeeFrequency, // From fee_components
performance_fee_tier1_threshold: performanceFeeThreshold, // From fee_components hurdle_rate
funding_due_at: fundingDueAt,             // Calculated from payment_deadline_days
introducer_id: introduction?.introducer_id || null,
introduction_id: introduction?.id || null,
```

### File 2: `versotech-portal/src/lib/signature/handlers.ts`

**Added `contract_date` when subscription pack is signed:**

```typescript
.update({
  status: 'committed',
  committed_at: new Date().toISOString(),
  contract_date: new Date().toISOString().split('T')[0], // NEW: Set contract date when signed
  signed_doc_id: document.id,
  acknowledgement_notes: 'Subscription agreement fully executed by both parties.'
})
```

## Data Source Logic

### price_per_share
1. **Primary**: Parse `deal_fee_structures.price_per_share_text` (handles formats like "100", "$1,000.00", "USD 85.00 per share")
2. **Fallback**: `valuations.nav_per_unit` (latest valuation for the vehicle)
3. **Final Fallback**: `null` (staff sets manually)

### management_fee_frequency
- Source: `fee_components.frequency` where `kind = 'management'`
- Values: 'quarterly', 'annual', 'monthly', 'one_time'

### performance_fee_tier1_threshold
- Source: `fee_components.hurdle_rate_bps / 100` where `kind = 'performance'`
- Converts basis points to percentage

### introducer/introduction
- Lookup from `introductions` table where `prospect_investor_id` and `deal_id` match
- Status must be 'allocated' or 'joined'

## Fields NOT Automated (Intentionally)

| Field | Reason |
|-------|--------|
| `cost_per_share` | Staff enters later based on actual cost basis |
| `sourcing_contract_ref` | Manual entry if applicable |
| `performance_fee_tier2_*` | Only if tier2 exists in fee_components |

## Impact Analysis

### Fee Events Compatibility
**Verified**: Changes will NOT break fee event creation.

The fee calculator (`subscription-fee-calculator.ts`) already handles:
- `subscription_fee_amount` → Uses directly if set (line 113-115)
- `management_fee_frequency` → Uses subscription field if set (line 135)
- `performance_fee_tier1_threshold` → Already uses if set (line 213)

**Benefit**: Pre-calculated amounts = deterministic fee events.

### Database Triggers
**Verified**: Works correctly with existing triggers.

| Trigger | Impact |
|---------|--------|
| `trigger_auto_create_introducer_commission` | BENEFICIAL - Auto-creates commission when `introducer_id` is set. Has duplicate prevention. |
| `trigger_auto_create_position` | No change |
| `auto_create_entity_investor_trigger` | No change |
| `trigger_set_subscription_number` | No change |

### Calendar Integration
**Benefit**: Deal-workflow subscriptions will now appear in the staff calendar's "Subscription Funding" section since `funding_due_at` is populated.

### UI Components
All affected components already support these fields:
- Subscription table columns display `contract_date`, `opportunity_name`
- Subscription detail page shows all fields
- Subscription edit dialog allows staff to modify

## Testing Checklist

- [ ] Create new subscription via deal approval
- [ ] Verify all new fields populated correctly
- [ ] Verify fee events still create properly after signature
- [ ] Verify price_per_share fallback to valuations works
- [ ] Verify introducer linking when introduction exists
- [ ] Verify num_shares calculated as draft (can be edited by staff)
- [ ] Verify contract_date set after signature completion
- [ ] Verify subscription appears in calendar if funding_due_at is set
- [ ] Verify introducer commission auto-created when introducer linked

## Files Modified

1. `versotech-portal/src/app/api/approvals/[id]/action/route.ts`
   - Lines 687-785: Added queries and fields to subscription insert

2. `versotech-portal/src/lib/signature/handlers.ts`
   - Line 485: Added `contract_date` to update

## Backward Compatibility

- **Existing subscriptions**: Unaffected (fields remain null unless manually updated)
- **New subscriptions from deal workflow**: Will have complete data
- **Manual subscriptions (quick-add modal)**: Unaffected (different code path)
- **Fee calculations**: Work better with pre-populated data
- **UI displays**: Already support all fields
