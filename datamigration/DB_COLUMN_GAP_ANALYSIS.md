# DASHBOARD vs DB COLUMN GAP ANALYSIS

## DASHBOARD INTRODUCER/PARTNER COLUMNS

| # | Column | Sample Data | Extracted? |
|---|--------|-------------|------------|
| 1 | Names | "Terra", "Dan" | YES |
| 2 | Subscription fees % | 0.02 (2%) | YES (sub_fee_pct) |
| 3 | Subscription fees | 2000 | YES (sub_fee_amt) |
| 4 | Management fees | (empty in VC26) | **NO - MISSING** |
| 5 | Performance fees 1 | 0.02 (2%) | YES (perf_fee_1) |
| 6 | Threshold 1 | "0x", "1x", "2x" | YES (thresh_1) |
| 7 | Performance fees 2 | 0.05 (5%) | YES (perf_fee_2) |
| 8 | Threshold 2 | "2x", "3x" | YES (thresh_2) |
| 9 | Spread PPS | 9.36 | YES (spread_pps) |
| 10 | Spread PPS Fees | 18879.52 | YES (spread_pps_fees) |

---

## DB introducer_commissions TABLE

| Column | Type | Purpose | Dashboard Mapping |
|--------|------|---------|-------------------|
| id | uuid | PK | auto |
| introducer_id | uuid | FK to introducers | lookup from name |
| investor_id | uuid | FK to investors | **NEED MATCHING** |
| deal_id | uuid | FK to deals | lookup from vehicle |
| basis_type | text | 'invested_amount', 'performance_fee', 'spread', 'management_fee' | derived |
| rate_bps | integer | Rate in basis points | sub_fee_pct×10000, perf_fee_1×10000, etc |
| accrual_amount | numeric | Fee amount | sub_fee_amt, spread_pps_fees |
| base_amount | numeric | Investment base | amount |
| notes | text | Free text | Can store threshold |
| currency | text | 'USD' | default |
| status | text | 'accrued' | default |

---

## CRITICAL GAPS

### 1. NO THRESHOLD COLUMNS IN introducer_commissions

| Dashboard Column | DB Column | Status |
|-----------------|-----------|--------|
| Threshold 1 | **NONE** | ❌ MISSING |
| Threshold 2 | **NONE** | ❌ MISSING |

**Current workaround**: Stored in `notes` field as text (e.g., "Performance fee - 2.5%")

**subscriptions table HAS threshold columns** but those are for subscription fees, NOT introducer commissions:
- `performance_fee_tier1_threshold`
- `performance_fee_tier2_threshold`

### 2. NO TIER 2 RATE COLUMN

The DB can only store ONE rate per commission record. For tiered performance fees:
- Tier 1: 2% above 0x → Create commission record with rate_bps=200
- Tier 2: 5% above 2x → Create SEPARATE commission record with rate_bps=500

**Solution**: Create multiple commission records, one per tier.

### 3. MANAGEMENT FEES - COLUMN EXISTS IN DB

The `basis_type='management_fee'` IS supported. Dashboard has column but it's EMPTY in VC26.

---

## FEE TYPE MAPPING

| Dashboard Fee | DB basis_type | Rate Source | Amount Source |
|--------------|---------------|-------------|---------------|
| Subscription fees | `invested_amount` | sub_fee_pct×10000 | sub_fee_amt |
| Management fees | `management_fee` | (need to extract) | (need to extract) |
| Performance fees 1 | `performance_fee` | perf_fee_1×10000 | (calculated) |
| Performance fees 2 | `performance_fee` | perf_fee_2×10000 | (calculated) |
| Spread PPS Fees | `spread` | 0 (flat fee) | spread_pps_fees |

---

## WHAT NEEDS TO HAPPEN

### Option A: Use Existing Schema (Workaround)

Store thresholds in `notes` field:
```sql
INSERT INTO introducer_commissions (
  introducer_id, investor_id, deal_id, basis_type,
  rate_bps, accrual_amount, notes
) VALUES (
  'xxx', 'xxx', 'xxx', 'performance_fee',
  200, 0, 'Tier 1 - 2% above 0x threshold'
);
```

**Pros**: No schema change needed
**Cons**: Threshold not queryable, messy

### Option B: Add Threshold Columns (Migration)

```sql
ALTER TABLE introducer_commissions
ADD COLUMN threshold_multiplier numeric,
ADD COLUMN tier_number integer;
```

**Pros**: Clean, queryable
**Cons**: Requires migration

### Option C: Use fee_plans + fee_components

The `fee_components` table already has:
- `hurdle_rate_bps`
- `tier_threshold_multiplier`
- `next_tier_component_id`

But it's currently EMPTY and would require linking via `fee_plan_id`.

---

## RECOMMENDED APPROACH

1. **For now**: Use Option A (notes field for threshold)
2. **Create commission records**:
   - One record per fee type per investor
   - Performance fee tier 1 and tier 2 as separate records
3. **Store threshold in notes**: "Threshold: 0x" or "Threshold: 2x"

---

## COMMISSION RECORDS TO CREATE

For each dashboard row with non-zero fees:

| Fee Type | Records | DB Record |
|----------|---------|-----------|
| Subscription fees (invested_amount) | 292 | 1 per row |
| Performance fee tier 1 | 297 | 1 per row |
| Performance fee tier 2 | ~50? | 1 per row |
| Spread | 301 | 1 per row |
| Management | 0 | none (empty in dashboard) |

**Estimated total: ~940 commission records**

---

## EXTRACTED DATA STATUS

| Column | Extracted | Notes |
|--------|-----------|-------|
| introducer_name | ✅ | |
| sub_fee_pct | ✅ | Maps to invested_amount |
| sub_fee_amt | ✅ | |
| perf_fee_1 | ✅ | Maps to performance_fee |
| thresh_1 | ✅ | Store in notes |
| perf_fee_2 | ✅ | Sparse data |
| thresh_2 | ✅ | Sparse data |
| spread_pps | ✅ | |
| spread_pps_fees | ✅ | Maps to spread |
| management_fees | ❌ | Only VC26, empty |
| investor_identifier | ✅ | Need to match to investor_id |
| vehicle | ✅ | Maps to deal_id |
| amount | ✅ | base_amount |
