# Changelog: Investor Documents Page Bug Fixes

**Date:** 2025-11-27
**Author:** Claude Code
**Scope:** Investor Portal - Documents Page

---

## Summary

Fixed multiple critical bugs affecting the investor documents page that prevented NDAs and subscription packs from being visible to investors after the n8n signature workflow completed.

---

## Problems Identified

### 1. UI Filter Blocking Subscription Packs
**File:** `src/components/documents/categorized-documents-client.tsx`
**Line:** 178 (original)

**Problem:** The UI filter was removing ALL documents with a `deal_id` unless they were type `'nda'`:
```typescript
// BROKEN CODE:
return initialDocuments.filter(doc => !doc.scope.deal || doc.type === 'nda')
```
This meant subscription packs (type `'subscription_pack'`) were hidden even when properly signed and published.

---

### 2. White Text on Light Background
**File:** `src/components/documents/document-card.tsx`

**Problem:** Document card used dark theme styling (`text-white`, `bg-white/5`, `text-gray-400`) but rendered in light theme context, making document titles invisible.

---

### 3. Badge Colors Unreadable
**File:** `src/components/documents/document-card.tsx`
**Lines:** 284, 293, 302

**Problem:** Badge text colors used very light shades (`text-blue-200`, `text-purple-200`, `text-emerald-200`) that were nearly invisible on light backgrounds.

---

### 4. Missing Holdings Filter
**File:** `src/components/documents/categorized-documents-client.tsx`

**Problem:** The `DocumentFiltersComponent` existed but was disconnected during a previous refactor. Investors had no way to filter documents by vehicle/holding.

---

### 5. Subscription Handler Missing Metadata
**File:** `src/lib/signature/handlers.ts`
**Lines:** 405-414

**Problem:** When `handleSubscriptionSignature()` updated the document after both parties signed, it was NOT setting `vehicle_id` and `owner_investor_id`, causing documents to not appear in vehicle-based queries.

---

### 6. Documents Query Excluding Committed Subscriptions
**File:** `src/lib/documents/investor-documents.ts`
**Line:** 77

**Problem:** Query only loaded vehicles from `'active'` subscriptions:
```typescript
// BROKEN CODE:
.eq('status', 'active')
```
This excluded `'committed'` subscriptions (signed but not yet funded), so documents for newly signed subscriptions weren't visible.

---

### 7. Pre-existing Build Error (Zod Validation)
**File:** `src/app/api/investors/me/kyc-status/route.ts`
**Lines:** 8-11, 69

**Problem:** Outdated Zod syntax using `errorMap` and `.errors` instead of `message` and `.issues`.

---

## Fixes Applied

### Fix 1: UI Filter - Allow Subscription Packs
**File:** `src/components/documents/categorized-documents-client.tsx`
**Lines:** 181-186

```typescript
// NEW CODE:
let docs = initialDocuments.filter(doc =>
  !doc.scope.deal ||
  doc.type === 'nda' ||
  doc.type === 'subscription_pack' ||
  doc.type === 'subscription'
)
```

---

### Fix 2: Add subscription_pack to Agreements Category
**File:** `src/components/documents/categorized-documents-client.tsx`
**Line:** 46

```typescript
types: ['Subscription', 'Agreement', 'subscription', 'agreement', 'subscription_pack']
```

---

### Fix 3: Light Theme Colors for Document Card
**File:** `src/components/documents/document-card.tsx`

| Element | Old | New |
|---------|-----|-----|
| Card background | `bg-white/5 border-white/10` | `bg-white border-gray-200` |
| Card hover | `hover:bg-white/10` | `hover:bg-gray-50 hover:border-gray-300` |
| Title | `text-white` | `text-gray-900` |
| Metadata | `text-gray-400` | `text-gray-600` |
| Icon container | `bg-white/5 border-white/10` | `bg-gray-50 border-gray-200` |
| Context menu | `bg-zinc-900 border-white/10` | `bg-white border-gray-200` |
| Menu items | `text-gray-200 focus:bg-white/10` | `text-gray-700 focus:bg-gray-100` |

---

### Fix 4: Badge Colors for Readability
**File:** `src/components/documents/document-card.tsx`
**Lines:** 284, 293, 302

| Badge | Old | New |
|-------|-----|-----|
| Vehicle | `border-blue-400/30 bg-blue-500/20 text-blue-200` | `border-blue-200 bg-blue-50 text-blue-700` |
| Folder | `border-purple-400/30 bg-purple-500/20 text-purple-200` | `border-purple-200 bg-purple-50 text-purple-700` |
| Watermark | `border-emerald-400/30 bg-emerald-500/20 text-emerald-200` | `border-emerald-200 bg-emerald-50 text-emerald-700` |

---

### Fix 5: Holdings Filter Integration
**File:** `src/components/documents/categorized-documents-client.tsx`

Added:
- Import: `DocumentFiltersComponent` and `DocumentFilters` type
- State: `const [filters, setFilters] = useState<DocumentFilters>({})`
- Filter logic for `vehicle_id`, `type`, and `search`
- `typeCounts` calculation for filter badges
- `<DocumentFiltersComponent>` UI at lines 276-282

---

### Fix 6: Subscription Handler Metadata
**File:** `src/lib/signature/handlers.ts`
**Lines:** 405-414

```typescript
// NEW CODE:
const { error: docUpdateError } = await supabase
  .from('documents')
  .update({
    file_key: docUploadData.path,
    is_published: true,
    published_at: new Date().toISOString(),
    status: 'published',                    // ADDED
    vehicle_id: subscription.vehicle_id,    // ADDED
    owner_investor_id: subscription.investor_id  // ADDED
  })
  .eq('id', document.id)
```

---

### Fix 7: Include Committed Subscriptions in Query
**File:** `src/lib/documents/investor-documents.ts`
**Line:** 79

```typescript
// NEW CODE:
.in('status', ['active', 'committed', 'partially_funded'])
```

---

### Fix 8: Zod Validation Syntax
**File:** `src/app/api/investors/me/kyc-status/route.ts`

```typescript
// Lines 8-10: Changed errorMap to message
status: z.enum(ALLOWED_INVESTOR_STATUSES, {
  message: 'Invalid status. Allowed: not_started, in_progress, submitted'
})

// Line 68: Changed .errors to .issues
const errorMessage = validation.error.issues[0]?.message || 'Invalid status'
```

---

## Code Cleanup

### Removed Unused Imports

**File:** `src/components/documents/categorized-documents-client.tsx`
- `DocumentReference` from `@/types/document-viewer.types`
- `Accordion`, `AccordionContent`, `AccordionItem`, `AccordionTrigger` from `@/components/ui/accordion`

**File:** `src/components/documents/document-card.tsx`
- `Button` from `@/components/ui/button`
- `Link2`, `Info` from `lucide-react`
- `DOCUMENT_TYPE_COLORS` from `@/lib/design-tokens`

### Removed Unused Variables/Functions

**File:** `src/components/documents/document-card.tsx`
- `isHovered` state and `onMouseEnter`/`onMouseLeave` handlers
- `investorLabel` variable
- `metadataHighlights` variable
- `colorScheme` variable
- `isNonEmptyString()` function
- `formatMetadataLabel()` function
- `extractMetadataHighlights()` function

---

## Database Changes

### Backfill: Missing Document Metadata

```sql
-- Backfilled 2 documents with missing vehicle_id and owner_investor_id
UPDATE documents d
SET
  vehicle_id = COALESCE(d.vehicle_id, s.vehicle_id),
  owner_investor_id = COALESCE(d.owner_investor_id, s.investor_id)
FROM subscriptions s
WHERE d.subscription_id = s.id
  AND d.type IN ('subscription_pack', 'subscription')
  AND (d.vehicle_id IS NULL OR d.owner_investor_id IS NULL);

-- Result: 2 rows updated
-- - VERSO CAPITAL 6 - DOC 2 - COMPLIANCE QUESTIONNAIRE - SWIP-RD executed.pdf
-- - meilenstein1 (4).pdf
```

---

## Test Results

### Build Status
```
✅ Build successful - no errors
```

### Document Visibility Test

| Document | Type | is_published | owner_investor_id | vehicle_id | Visible to Investor |
|----------|------|--------------|-------------------|------------|---------------------|
| NDA - Signed.pdf | nda | ✅ true | ✅ set | ✅ set | ✅ YES |
| VERSO CAPITAL 6... | subscription_pack | ✅ true | ✅ set | ✅ set | ✅ YES |
| meilenstein1 (4).pdf | subscription_pack | ❌ false | ✅ set | ✅ set | ❌ NO (correct - pending investor signature) |
| revolut-series-e-subscription | subscription | ✅ true | ✅ set | ❌ null | ✅ YES |

---

## n8n Workflow Flow (Verified Working)

1. **n8n generates document** → Creates document with `is_published: false`
2. **Investor signs** → Updates signature request status
3. **Admin countersigns** → Triggers `handleSubscriptionSignature()`
4. **Handler updates document**:
   - `is_published: true`
   - `published_at: <timestamp>`
   - `status: 'published'`
   - `vehicle_id: <from subscription>`
   - `owner_investor_id: <from subscription>`
5. **Document appears in investor portal** ✅

---

## Files Modified

| File | Type of Change |
|------|----------------|
| `src/components/documents/categorized-documents-client.tsx` | Bug fix + Enhancement + Cleanup |
| `src/components/documents/document-card.tsx` | Bug fix + Cleanup |
| `src/lib/signature/handlers.ts` | Bug fix |
| `src/lib/documents/investor-documents.ts` | Bug fix |
| `src/app/api/investors/me/kyc-status/route.ts` | Bug fix |

---

## Related Issues

- Subscription packs not showing in investor documents page
- NDAs missing from investor documents
- Document titles invisible (white text)
- Holdings filter removed from documents page
- Documents missing after n8n signature workflow completion

---

## Notes

- The `meilenstein1` document correctly shows `is_published: false` because the investor hasn't signed yet. This is expected behavior - documents only become visible after BOTH parties sign.
- Future documents generated through n8n will automatically have correct metadata set by the updated `handleSubscriptionSignature()` function.
