# Data Inconsistencies - Investment Amount Storage

**Last Updated**: November 22, 2025
**Status**: Known Issue - Documented for Future Resolution

---

## Overview

The VERSO platform currently has **three overlapping data storage systems** for investment amounts and terms. This creates data inconsistencies where the same information is stored in multiple tables with conflicting values.

---

## The Three Systems

### 1. Deal Metadata (`deals` table)
**Created**: Original baseline schema
**Purpose**: Simple, quick investment terms at the deal level

**Fields**:
```sql
deals:
  - minimum_investment (numeric 18,2)
  - maximum_investment (numeric 18,2)
  - target_amount (numeric 18,2)
  - offer_unit_price (numeric 18,2)
```

**Use Case**:
- Quick reference for basic deal terms
- Used in deal creation/editing forms
- Displayed when no term sheet exists
- Simple, single-source-of-truth for basic deals

**Example**: Anthropic has `minimum_investment = $100,000` in the deals table.

---

### 2. Term Sheets (`deal_fee_structures` table)
**Created**: October 2025 (migration `20251020000000_deal_workflow_phase1`)
**Purpose**: Formal, versioned term sheet documents with full legal/commercial terms

**Fields**:
```sql
deal_fee_structures:
  - status ('draft', 'published', 'archived')
  - version (integer, incremental)
  - minimum_ticket (numeric 18,2)        ← OVERLAPS with deals.minimum_investment
  - maximum_ticket (numeric 18,2)        ← OVERLAPS with deals.maximum_investment
  - allocation_up_to (numeric 18,2)      ← OVERLAPS with deals.target_amount
  - subscription_fee_percent (numeric 7,4)
  - management_fee_percent (numeric 7,4)
  - carried_interest_percent (numeric 7,4)
  - term_sheet_date, issuer, seller, structure, legal_counsel, etc.
  - term_sheet_attachment_key (PDF upload)
  - published_at, effective_at
```

**Use Case**:
- Professional investor-facing term sheets (like a formal deal prospectus)
- Versioned documents (can have multiple drafts/versions per deal)
- Full legal terms, fees, conditions, parties involved
- PDF attachment of official term sheet document
- **When published, this takes priority over deal metadata in display logic**

**Example**: OpenAI has a published term sheet with `minimum_ticket = NULL` (not filled in).

---

### 3. Fee Plans (`fee_plans` + `fee_components` tables)
**Created**: Original baseline schema
**Purpose**: Advanced, structured fee modeling system

**Fields**:
```sql
fee_plans:
  - deal_id (or vehicle_id - can apply to both)
  - name, description
  - is_default, is_active
  - effective_from / effective_until (date ranges)

fee_components:
  - kind ('subscription', 'management', 'performance', 'admin', 'incentive')
  - calc_method ('percent_of_investment', 'percent_per_annum', 'tiered', etc.)
  - rate_bps (basis points)
  - hurdle_rate_bps, has_catchup, tier_threshold_multiplier
```

**Use Case**:
- Complex fee calculations (tiered management fees, carried interest with hurdle rates, waterfalls)
- **Does NOT store min/max investment amounts** (only fee structures)
- Can model sophisticated scenarios like:
  - 2% management fee on first $50M, 1.5% above that
  - 20% carry above 8% hurdle rate with 100% catchup

**Relationship with Term Sheets**:
- Bidirectional sync system in `lib/fees/term-sheet-sync.ts`
- When term sheet is published → creates/updates default fee_plan with basic fees
- When fee_plan is updated → can optionally sync back to term sheet

---

## Current Data Conflicts

As of November 2025, the following deals have **conflicting values** between `deals` table and `deal_fee_structures` table:

| Deal Name | deals.minimum_investment | fee_structures.minimum_ticket | Difference | What Investors See |
|-----------|-------------------------|------------------------------|------------|-------------------|
| AI Startup Primary | $25,000 | $50,000 | +$25,000 | **$50,000** (term sheet) |
| Revolut Secondary 2025 | $50,000 | $25,000 | -$25,000 | **$25,000** (term sheet) |
| SaaS Platform Primary | $50,000 | $25,000 | -$25,000 | **$25,000** (term sheet) |

**Working Examples** (no conflicts):
- **Anthropic**: Has deal-level amounts ($100k-$5M), NO term sheet → Shows deal-level ✓
- **OpenAI**: Has deal-level amounts ($1M-$5M), term sheet with NULL min/max → Falls back to deal-level ✓

---

## Display Priority Logic

The frontend code prioritizes data sources in this order:

```
1. deal_fee_structures (status='published')
   ↓ (if null or doesn't exist)
2. deals table
   ↓ (if null)
3. "(Pending)"
```

**Code locations**:
- Deal cards: `versotech-portal/src/components/deals/investor-deals-list-client.tsx`
- Deal details: `versotech-portal/src/app/(investor)/versoholdings/deal/[id]/page.tsx`
- Capacity API: `versotech-portal/src/app/api/deals/[id]/capacity/route.ts`

**Example logic**:
```typescript
{feeStructure?.minimum_ticket
  ? formatCurrency(feeStructure.minimum_ticket, deal.currency)
  : deal.minimum_investment
    ? formatCurrency(deal.minimum_investment, deal.currency)
    : '(Pending)'}
```

---

## Why This Overlap Exists

### Timeline of System Evolution

1. **Original System** (baseline schema):
   - `deals` table had simple fields for min/max/target
   - `fee_plans` existed for vehicle-level and deal-level fee modeling
   - Simple and worked fine for basic deals

2. **October 2025 Enhancement** (deal workflow phase 1):
   - Added `deal_fee_structures` table for formal term sheet documents
   - Needed versioned, investor-facing documents with full legal terms
   - Duplicated min/max fields (which overlap with `deals` table)
   - **Rationale**: Term sheets are versioned documents - you might have:
     - Draft v1 with $50k min
     - Draft v2 with $25k min
     - Published v3 with $100k min (this is what investors see)

3. **Sync System Creation**:
   - Created `term-sheet-sync.ts` to keep basic fees in sync between term sheets and fee_plans
   - **However**: Did NOT sync min/max amounts back to `deals` table
   - Result: Data inconsistency between the two tables

---

## Source of Truth

### Which System Should Be Authoritative?

**For investor-facing displays**: `deal_fee_structures` (published term sheets) should be the source of truth because:
- ✓ Versioned and has approval workflow (draft → published)
- ✓ Includes PDF attachment (official document)
- ✓ Has all legal terms and conditions
- ✓ Has `published_at` timestamp (audit trail)
- ✓ Represents the "official" investor-facing document

**For internal/admin operations**: Both systems may be needed:
- Term sheets for formal investor communications
- Deal-level fields for quick reference and backwards compatibility

---

## Current Decision (November 2025)

**Status**: Keeping both systems as-is for now

**Rationale**:
- Term sheets are the authoritative source when published
- Deal-level fields serve as fallback when term sheets don't exist
- Display logic correctly prioritizes term sheets over deal-level
- Fixing the data conflicts requires business decision on correct values

---

## Recommendations for Future Cleanup

### Option A: Sync Term Sheets → Deals Table
**Approach**: When a term sheet is published, automatically update the `deals` table to match

**Pros**:
- Maintains backwards compatibility
- Both tables always in sync
- No display issues

**Cons**:
- Duplicated data (violates normalization)
- Ongoing maintenance burden

**Implementation**:
```typescript
// In api/deals/[id]/fee-structures/route.ts
if (data.status === 'published') {
  await supabase
    .from('deals')
    .update({
      minimum_investment: data.minimum_ticket,
      maximum_investment: data.maximum_ticket,
      target_amount: data.allocation_up_to
    })
    .eq('id', dealId)
}
```

---

### Option B: Deprecate Deal-Level Fields
**Approach**: Null out deal-level fields when term sheet exists, make term sheet the single source

**Pros**:
- Single source of truth (proper normalization)
- No sync issues
- Cleaner data model

**Cons**:
- Breaking change for existing code
- May break reports/queries that expect deal-level fields

**Implementation**:
- Migrate all deals to have term sheets
- Update all queries to use term sheets
- Deprecate `minimum_investment`, `maximum_investment`, `target_amount` columns

---

### Option C: Add Business Rules Layer
**Approach**: Create a view or function that returns the "effective" amounts

**Pros**:
- No data duplication
- Flexible business logic
- Easy to change rules

**Cons**:
- Query complexity
- Performance considerations

**Implementation**:
```sql
CREATE VIEW deal_effective_terms AS
SELECT
  d.id,
  d.name,
  COALESCE(dfs.minimum_ticket, d.minimum_investment) as effective_min_investment,
  COALESCE(dfs.maximum_ticket, d.maximum_investment) as effective_max_investment,
  COALESCE(dfs.allocation_up_to, d.target_amount) as effective_target
FROM deals d
LEFT JOIN deal_fee_structures dfs ON d.id = dfs.deal_id
  AND dfs.status = 'published'
  AND dfs.effective_at <= CURRENT_DATE
ORDER BY dfs.effective_at DESC
LIMIT 1;
```

---

## Data Governance Guidelines

### When Creating/Editing Deals

**If deal has NO term sheet**:
- ✓ Update `deals.minimum_investment`, `deals.maximum_investment`, `deals.target_amount`
- ✗ Do not create term sheet unless needed

**If deal HAS term sheet (draft or published)**:
- ✓ Update `deal_fee_structures.minimum_ticket`, `maximum_ticket`, `allocation_up_to`
- ✓ Consider updating deal-level fields to match (for consistency)
- ✓ Or null out deal-level fields (if using term sheet as single source)

**When publishing a term sheet**:
- ✓ Verify min/max/allocation values are correct
- ✓ Ensure they match business intent
- ✓ Consider if deal-level fields should be updated to match

---

## Migration Path (Future)

If/when this needs to be resolved:

1. **Audit current data**:
   ```sql
   SELECT
     d.name,
     d.minimum_investment,
     d.maximum_investment,
     d.target_amount,
     dfs.minimum_ticket,
     dfs.maximum_ticket,
     dfs.allocation_up_to
   FROM deals d
   LEFT JOIN deal_fee_structures dfs ON d.id = dfs.deal_id
     AND dfs.status = 'published'
   WHERE (d.minimum_investment != dfs.minimum_ticket
     OR d.maximum_investment != dfs.maximum_ticket
     OR d.target_amount != dfs.allocation_up_to)
   ```

2. **Business review**: Determine correct values for conflicting deals

3. **Choose migration strategy**: Option A, B, or C above

4. **Update code**: Modify all display logic to use chosen approach

5. **Data migration**: Run SQL updates to sync or null out fields

6. **Testing**: Verify all deal cards, details pages, APIs show correct values

---

## Related Files

**Frontend Components**:
- `versotech-portal/src/components/deals/investor-deals-list-client.tsx` - Deal cards with fallback logic
- `versotech-portal/src/app/(investor)/versoholdings/deal/[id]/page.tsx` - Deal details page
- `versotech-portal/src/components/deals/deal-details-modal.tsx` - Deal modal

**API Endpoints**:
- `versotech-portal/src/app/api/deals/[id]/fee-structures/route.ts` - Term sheet CRUD
- `versotech-portal/src/app/api/deals/[id]/capacity/route.ts` - Deal capacity calculations

**Sync System**:
- `versotech-portal/src/lib/fees/term-sheet-sync.ts` - Bidirectional sync between term sheets and fee plans

**Database Migrations**:
- `supabase/migrations/00000000000000_baseline.sql` - Original deals table schema
- `supabase/migrations/20251020000000_deal_workflow_phase1.sql` - Term sheets table creation

---

## Questions?

Contact the platform team or review the codebase documentation in `/docs/` for more context on the deal workflow system.
