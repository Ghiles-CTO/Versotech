# IN Scope Audit Findings

**Auditor:** Independent read-only code audit agent
**Date:** 2026-02-14
**Files audited:**
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/in/run_in_audit.py` (1896 lines)
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/in/rules_in.json` (329 lines)

---

## A) Check Categories Performed

The engine performs the following distinct check categories, grouped by domain:

### A1. Vehicle-Level Totals Parity (lines 1041-1069)
Compares aggregated numeric totals per vehicle between dashboard and database across 19 metrics. This is an aggregate-level smoke test that catches gross mismatches before drilling into row-level detail.

### A2. Subscription Structural Integrity (lines 1071-1087)
- **subscription_deal_id_required** (line 1072): Every subscription must have a non-null `deal_id`.
- **subscription_deal_vehicle_consistency** (line 1076): The vehicle on the subscription must match the vehicle on its linked deal.
- **investor_identity_duplicate_check** (line 1084): Detects the same canonical investor name mapping to multiple distinct `investor_id` UUIDs across subscriptions, positions, introductions, and commissions.

### A3. Row-Level Subscription Matching (lines 1089-1188)
Two-pass matching of individual dashboard rows to database subscriptions:
- **Pass 1 (exact_date):** Match by `(vehicle, investor_key, commitment, shares, contract_date)` (lines 1120-1127).
- **Pass 2 (relaxed):** Remaining unmatched rows paired positionally after sorting (lines 1129-1134).
- Unmatched rows on either side reported as `row_unmatched_dashboard` or `row_unmatched_db`.
- For each matched pair, 16 numeric fields and contract_date are compared (lines 1150-1188).

### A4. Position (Ownership) Matching (lines 1190-1257)
- Per-investor-per-vehicle ownership parity between dashboard and positions table (lines 1191-1204).
- Vehicle-level aggregate position units vs. dashboard ownership totals (lines 1253-1257).
- Zero-unit position rows flagged (lines 1245-1247).
- Duplicate positions per investor-vehicle flagged (lines 1248-1252).

### A5. Zero Ownership Exclusion Check (lines 1206-1228)
Dashboard rows with ownership <= 0 must NOT exist as subscriptions in the database.

### A6. Status and Funded Amount Checks (lines 1230-1242)
- All subscriptions must have `status = 'funded'` (lines 1231-1234).
- `funded_amount` must equal `commitment` within 0.01 tolerance (lines 1235-1242).

### A7. Commission Aggregate Totals (lines 1283-1330)
Per-vehicle comparison of total `invested_amount` and `spread` commission amounts between dashboard introducer blocks and the database `introducer_commissions` table. Supports ruled diffs (known expected deltas) that downgrade failures to warnings.

### A8. Row-Level Commission Matching (lines 1332-1573)
Compares commission amounts by `(vehicle, investor_key, introducer_key, basis_type)` tuple. Handles:
- Combined introducer names (lines 1386-1395, 1422-1439)
- Forbidden broker-like introducers (lines 1507-1521)
- Warning-only introducers (lines 1527-1533)
- Specific commission expectations from rules (lines 1459-1481)
- Rate-only bases for performance fees (lines 1483-1505)
- Amount mismatches (lines 1543-1549)
- Rate (bps) mismatches (lines 1552-1573)

### A9. Commission Foreign Key Integrity (lines 1575-1582)
Every commission's `introduction_id` must point to an existing introduction record.

### A10. Max Introducers Per Subscription (lines 1584-1598)
Configurable cap (set to 2 for IN scope) on the number of distinct introducers per deal-investor pair.

### A11. Commission Duplicate Detection (lines 1259-1281)
Exact-match duplicate detection on the full commission tuple: `(introducer_id, deal_id, investor_id, introduction_id, basis_type, tier_number, rate_bps, base_amount, accrual_amount)`.

### A12. Broker/Introducer Structural Rules (lines 1600-1671)
- Expected brokers list validation (lines 1601-1609).
- Forbidden names in introducers master table (lines 1618-1621).
- Forbidden names in introductions (lines 1623-1628).
- Forbidden commission pairs by vehicle+introducer (lines 1662-1671).
- Commission aggregates by introducer+vehicle for forbidden/warning-only checks (lines 1630-1659).

### A13. Contacts File Validation (lines 1741-1789)
Cross-references a contacts spreadsheet against the DB introducers/brokers tables. Checks:
- Introducer names in contacts file exist in DB master (lines 1772-1780).
- Contacts with "broker" role exist in the brokers table (lines 1781-1789).
- Red rows in the contacts file are excluded from checks (lines 1760-1767).

**Note:** For IN scope, `run_contacts_checks` is `false` (rules_in.json line 132) and `run_broker_checks` is `false` (line 90), so sections A12 (broker part) and A13 are effectively disabled.

---

## B) Numeric Fields Validated

### B1. Vehicle-Level Aggregate Metrics (lines 1042-1062)
All 19 metrics compared at the vehicle totals level:

| # | Metric | Dashboard Source | DB Source |
|---|--------|-----------------|-----------|
| 1 | count | row count | subscription count |
| 2 | cost_per_share | "Cost per Share" column | `cost_per_share` |
| 3 | commitment | "Amount invested" column | `commitment` |
| 4 | price_per_share | "Price per Share" column | `price_per_share` |
| 5 | shares | "Number of shares invested" | `num_shares` |
| 6 | ownership | "OWNERSHIP POSITION" (or shares fallback) | `positions.units` (overridden at line 908-909) |
| 7 | spread_per_share | "Spread PPS" | `spread_per_share` |
| 8 | spread_fee | "Spread PPS Fees" | `spread_fee_amount` |
| 9 | sub_fee_percent | "Subscription fees %" | `subscription_fee_percent` |
| 10 | sub_fee | "Subscription fees" | `subscription_fee_amount` |
| 11 | management_fee_percent | "Management fees" | `management_fee_percent` |
| 12 | perf1_percent | "Performance fees 1" | `performance_fee_tier1_percent` |
| 13 | perf1_threshold | "Threshold 1" | `performance_fee_tier1_threshold` |
| 14 | perf2_percent | "Performance fees 2" | `performance_fee_tier2_percent` |
| 15 | perf2_threshold | "Threshold 2" | `performance_fee_tier2_threshold` |
| 16 | bd_fee_percent | "BD Fees %" | `bd_fee_percent` |
| 17 | bd_fee | "BD fees" | `bd_fee_amount` |
| 18 | finra_shares | "FINRA fees in share" | `finra_shares` |
| 19 | finra_fee | "FINRA fees" | `finra_fee_amount` |

### B2. Row-Level Metric Pairs (lines 1150-1167)
16 fields compared per matched subscription pair:

| # | Dashboard Field | DB Field | Tolerance |
|---|----------------|----------|-----------|
| 1 | cost_per_share | cost_per_share | 0.01 |
| 2 | price_per_share | price_per_share | 0.01 |
| 3 | ownership | units | **SKIPPED** (in `row_compare_skip_metrics`, rules line 306) |
| 4 | spread_per_share | spread_per_share | 0.01 |
| 5 | spread_fee | spread_fee | 0.01 |
| 6 | sub_fee_percent | sub_fee_percent | 0.01 |
| 7 | sub_fee | sub_fee | 0.01 |
| 8 | management_fee_percent | management_fee_percent | 0.01 |
| 9 | perf1_percent | perf1_percent | 0.01 |
| 10 | perf1_threshold | perf1_threshold | 0.01 |
| 11 | perf2_percent | perf2_percent | 0.01 |
| 12 | perf2_threshold | perf2_threshold | 0.01 |
| 13 | bd_fee_percent | bd_fee_percent | 0.01 |
| 14 | bd_fee | bd_fee | 0.01 |
| 15 | finra_shares | finra_shares | 0.01 |
| 16 | finra_fee | finra_fee | 0.01 |

**Important:** `ownership` is in the skip list (rules line 306), so row-level ownership is NOT compared via the metric_pairs loop. Instead, ownership is compared separately through the positions-vs-dashboard check (lines 1191-1204) which uses aggregated positions data.

### B3. Commission Amount Fields
- `invested_amount` (subscription fee amounts) -- lines 685-699
- `spread` (spread PPS fee amounts) -- lines 700-714
- `performance_fee_tier1` -- rate_bps only, amount always 0.0 (lines 715-728)
- `performance_fee_tier2` -- rate_bps only, amount always 0.0 (lines 730-744)
- `rate_bps` comparison for all non-spread bases (lines 1552-1573)

### B4. Additional Numeric Checks
- `funded_amount` vs. `commitment` per subscription (lines 1235-1242)
- Position units == 0 detection (lines 1245-1247, line 904)

---

## C) Investor Name Mapping

### C1. Normalization Pipeline
The name mapping uses a three-tier key generation system:

1. **`normalize_text(s)`** (lines 66-73): Lowercases, strips, replaces `&` with "and", normalizes dashes, removes titles (mr/mrs/ms/dr/sir/madam/mme/m), strips non-alphanumeric characters, collapses whitespace.

2. **`canonical_name_key(s)`** (lines 76-86): Normalizes, removes "and"/"or", strips trailing "s" from tokens longer than 4 chars (crude depluralization), sorts tokens alphabetically, concatenates without spaces.

3. **`compact_name_key(s)`** (lines 89-92): Normalizes, removes "and"/"or", concatenates tokens in original order (no sorting).

4. **`loose_name_key(s)`** (lines 95-102): Normalizes, removes "and"/"or", returns only first + last token concatenated. Single-token names return that token alone.

### C2. Alias Resolution (lines 129-139)
The `name_key()` function tries three key variants in order: canonical, compact, loose. For each variant, it checks the aliases dictionary. First match wins. If no alias matches, the canonical key is returned.

### C3. Alias Initialization (lines 299-309)
During `Auditor.__init__`, raw aliases from `rules_in.json` are expanded: for each alias entry `k -> v`, all key variants of both `k` and `v` are registered pointing to the canonical key of `v`. The value-side variants use `setdefault` (line 308), meaning they do not overwrite existing mappings.

### C4. Fallback Logic
If no alias matches any of the three key variants, the **canonical key** is the final fallback (line 139). There is no explicit "unmapped name" report for investor names. Unmapped names will simply use their canonical key, which may or may not collide with the correct DB canonical key.

### C5. Unmapped Name Reporting
**There is no explicit check that reports unmapped investor names.** The engine relies on matching keys; if a dashboard investor name and a DB investor name produce the same canonical key (or alias resolution), they match. If they do not, the row will surface as `row_unmatched_dashboard` or `row_unmatched_db` -- but the root cause ("name not in alias table") is not explicitly called out as a distinct check.

The same applies to introducer names: if a dashboard introducer name does not resolve to the same key as the DB introducer, the commission will appear as `commission_row_missing_in_db` or `commission_row_missing_in_dashboard`, but the cause is not specifically flagged as an alias gap.

### C6. Name Aliases Defined (rules_in.json lines 63-83)
20 alias entries covering:
- Short names: "anand" -> "Set Cap", "renbridge" -> "Renaissance Bridge Capital LLC"
- Name corrections: "mickaelryan" -> "Michael RYAN", "baumslagdan" -> "Daniel BAUMSLAG"
- Name ordering fixes: "alanchristopherpaulsen" -> "Christopher PAULSEN"
- Combined introducer mappings: "Lafferty+Visual Sectors" -> "Visual Sectors", "Anand+Dan" -> "Set Cap"
- Entity name corrections: "Old City Capital" -> "Old City Securities LLC", "Astra Global" -> "Astral Global Limited"

---

## D) Introducer/Partner Commission Matching

### D1. Basis Types Checked (rules_in.json lines 299-304)
Four basis types are validated:
1. `invested_amount` -- subscription fee commissions (amount-based)
2. `spread` -- spread PPS fee commissions (amount-based)
3. `performance_fee_tier1` -- rate_bps only (amount is always 0.0 in dashboard extraction)
4. `performance_fee_tier2` -- rate_bps only (amount is always 0.0 in dashboard extraction)

### D2. Commission Extraction from Dashboard (lines 434-744)
For each dashboard row, the engine reads commission data from up to 2 "slots" per sheet. Each slot consists of:
- A **name column** (introducer name)
- An **invested_amount column** (subscription fee amount)
- A **spread column** (spread fee amount)

The slot configuration is driven by three mechanisms in priority order:
1. **Explicit slot config** (`dashboard_commission_slots` in rules) -- used if defined for the sheet (lines 435-443).
2. **Dynamic header detection** -- scans headers for name-like columns and infers adjacent amount columns (lines 444-459). Enabled by `dashboard_dynamic_commission_slots: true`.
3. **Backward-compatible fallback** -- pairs the N rightmost amount columns with N name columns (lines 461-469).

### D3. Commission Name Carrying (line 471, 599-604)
Introducer names "carry" down rows. If a name cell is non-empty, it updates `carried_intro_name_by_col[nidx]`. Subsequent rows without a name in that column inherit the last seen name. This handles dashboard layouts where the introducer name appears once for a block of investor rows.

### D4. Performance Fee Rate Extraction (lines 666-683)
For each commission slot, the engine reads:
- Invested amount rate: column `iidx - 2` (the cell two columns to the left of the amount)
- Perf1 rate: column `iidx` (the cell immediately after the amount)
- Perf2 rate: column `iidx + 2`
- Spread rate: column `sidx - 2`

These are converted to basis points via `percent_to_bps()`.

### D5. DB Commission Normalization (lines 911-958)
DB commissions with `basis_type = 'performance_fee'` are split by `tier_number`:
- `tier_number = 2` -> `performance_fee_tier2`
- All others -> `performance_fee_tier1`

Only basis types in the allowed set are retained (line 933-934).

### D6. Combined Introducer Names (lines 619-664)
Dashboard cells containing "+" or newline in the introducer name are treated as "combined" names. The engine checks if an explicit alias collapses the combined name to a single target:
- If yes: treated as a single introducer (normal flow).
- If no: logged as warning or failure per `combined_introducer_name_policy` (set to "ignore" for IN scope, rules line 317). The commission is still recorded with `introducer_key = "__combined__"` and matched at the investor-level aggregate.

**For IN scope**, `combined_introducer_name_policy` is "ignore", meaning combined names are neither warned nor failed -- they are silently recorded and matched at the aggregate level only.

### D7. Rate Comparison Logic
- For `performance_fee_tier1` and `performance_fee_tier2`: only rate_bps is compared, amount is ignored (lines 1483-1505).
- For `invested_amount`: both amount and rate_bps are compared (lines 1543-1573).
- For `spread`: amount is compared, but rate_bps comparison is explicitly skipped (line 1552: `if basis != "spread"`).

### D8. Specific Commission Expectations (rules_in.json lines 96-124)
Four explicit commission expectations are defined, all for vehicle IN103, investor "Zandera (Holdco) Limited":
1. Altras Capital Financing Broker / invested_amount / 15000.0
2. Altras Capital Financing Broker / spread / 174999.03
3. Set Cap / invested_amount / 5000.0
4. Set Cap / spread / 74999.58

These are checked during row-level commission matching (lines 1459-1481) as overrides. If the DB matches the expected value but the dashboard differs, the mismatch is downgraded to a warning (`commission_row_ruled_dashboard_override`).

**Note:** `specific_rule_assertions` is `false` (rules line 58), so the separate specific-commission-expectations block (lines 1674-1720) does NOT run. The expectations are only used as overrides during row-level matching.

---

## E) Silent Skips Analysis

### E1. Rows with Empty Investor Name (lines 515-516)
If `investor_name` is empty after constructing from entity/first/middle/last, the row is silently skipped with `continue`. No warning or failure is emitted. This could hide data entry errors where investor identity columns are blank.

### E2. Rows Outside Scope Codes (lines 504-505)
Dashboard rows whose vehicle code (after alias mapping) is not in `scope_vehicle_codes` are silently skipped. This is by design but could miss miscategorized vehicles.

### E3. Empty Vehicle Cell (lines 500-501)
Rows with a blank vehicle cell are silently skipped.

### E4. Commission Slots with No Name (lines 605-616)
If an introducer name column resolves to empty or a dash character ("-", em dash, en dash), and there are non-zero amounts, a **warning** is emitted (`dashboard_commission_amount_without_name`). This is good -- it is not fully silent. However, it is only a warning, not a failure.

### E5. Combined Introducer Names with "ignore" Policy (lines 632-636)
For IN scope, `combined_introducer_name_policy` is "ignore". This means combined names like "Lafferty+Visual Sectors" that do NOT have an explicit alias are **silently passed through** without any warning or failure. The commission is still tracked with `__combined__` key, but no diagnostic is emitted.

### E6. Commission Basis Types Outside Allowed Set (line 933-934)
DB commissions with basis types not in `["invested_amount", "spread", "performance_fee_tier1", "performance_fee_tier2"]` are silently filtered out. No warning is emitted for unexpected basis types.

### E7. Contacts Checks Disabled (rules line 132)
`run_contacts_checks` is `false`, so the entire contacts validation block (lines 1741-1789) is skipped. This means no cross-referencing of the contacts spreadsheet against the DB.

### E8. Broker Checks Disabled (rules line 90)
`run_broker_checks` is `false`, so broker table validation (lines 1601-1609) is skipped.

### E9. Specific Rule Assertions Disabled (rules line 58)
`specific_rule_assertions` is `false`, so the detailed specific commission expectations block (lines 1674-1720) does not execute. The expectations are still used as overrides (lines 1459-1481) but not as standalone assertions.

### E10. restrict_to_db_vehicles_with_data (rules line 28)
When `true` (as it is for IN scope), vehicles in `scope_vehicle_codes` that have zero data in the DB are removed from the scope entirely (lines 1015-1037). Dashboard rows for those vehicles are also filtered out. This means if a vehicle's data was accidentally deleted from the DB, the engine would silently stop checking it rather than flagging the discrepancy.

### E11. to_float() Fallback (lines 28-46)
The `to_float()` function returns 0.0 for unparseable values, including strings like "USD -" or "#VALUE!". It attempts regex extraction of the first number. If a cell contains a formatted error value, it silently becomes 0.0 rather than being flagged.

### E12. Row-Level Ownership Skip (rules line 306)
`row_compare_skip_metrics` includes "ownership", so per-row ownership comparison is skipped in the metric_pairs loop (line 1178-1179). Ownership is only checked at the aggregate level via positions (lines 1191-1204, 1253-1257).

### E13. Vehicles IN104 and IN107 (rules lines 33-34 vs 17-26)
The `dashboard_vehicle_alias` maps IN4 -> IN104 and IN7 -> IN107, but `scope_vehicle_codes` does NOT include IN104 or IN107. This means dashboard rows from sheets IN4 and IN7 will be mapped to vehicle codes that are outside scope and silently dropped (line 504-505). This appears intentional (these vehicles may have no DB data) but is worth noting.

---

## F) Structural/Integrity Checks

### F1. Commission Exact Duplicate Detection (lines 1259-1281)
Uses a 9-field composite key: `(introducer_id, deal_id, investor_id, introduction_id, basis_type, tier_number, rate_bps, base_amount, accrual_amount)`. Any count > 1 is a failure. Only checks commissions within scope vehicles.

### F2. Commission FK Integrity (lines 1575-1582)
Verifies every commission's `introduction_id` exists in the introductions table. Orphaned foreign keys are failures.

### F3. Position Duplicate Detection (lines 1248-1252)
Counts positions per `(investor_id, vehicle_id)`. Count > 1 is a failure.

### F4. Position Zero Units (lines 1245-1247)
Positions with `abs(units) < 1e-9` are flagged as failures.

### F5. Subscription Missing deal_id (lines 1072-1074)
Subscriptions without a `deal_id` are failures.

### F6. Subscription-Deal Vehicle Consistency (lines 1076-1082)
If a subscription's vehicle does not match its deal's vehicle, it is a failure.

### F7. Investor Identity Deduplication (lines 960-985, 1084-1087)
Tracks all investor references across subscriptions, positions, introductions, and commissions. If the same canonical name key maps to multiple distinct `investor_id` values, it is flagged as a failure.

### F8. Zero Ownership Loaded in DB (lines 1206-1228)
Dashboard rows with zero ownership are cross-checked against the DB. If a matching subscription exists (either exact or relaxed match), it is a failure -- zero-ownership rows should not be in the database.

### F9. Dashboard Column Existence (lines 400-426)
Before processing a sheet, required columns are validated. Missing columns cause a failure and the sheet is skipped.

### F10. Commission Header Drift Detection (lines 473-496)
Warns if commission amount columns do not have expected header text ("Subscription fees" for invested_amount, "Spread PPS Fees" for spread). This guards against column shifts in the Excel file.

---

## G) Ruled Diffs in rules_in.json

### G1. commission_total_ruled_diffs_invested_amount (rules lines 309-313)
Known expected deltas between dashboard and DB totals for `invested_amount`:

| Vehicle | Expected Delta |
|---------|---------------|
| IN102 | -74881.5498 |
| IN103 | -20000.0 |
| IN106 | -3300.0 |

When the actual delta matches the expected delta (within 0.01), the failure is downgraded to a warning (`commission_totals_ruled_diff_invested_amount`). If the actual delta does not match, it remains a hard failure.

### G2. commission_total_ruled_diffs_spread (rules lines 314-316)
Known expected deltas for `spread`:

| Vehicle | Expected Delta |
|---------|---------------|
| IN103 | -249998.61284 |

Same downgrade logic as G1.

### G3. specific_commission_expectations (rules lines 96-124)
Four specific commission amounts that serve as override values during row-level matching (see section D8). These are not ruled diffs per se but act as "expected DB values" that override dashboard discrepancies.

### G4. row_compare_skip_metrics (rules lines 305-307)
The metric "ownership" is excluded from row-level comparison. This is a ruled skip, not a diff.

---

## H) Vehicle-Specific Overrides

### H1. Dashboard Vehicle Alias Map (rules lines 29-41)
All 11 dashboard sheets (IN1-IN11) are mapped to vehicle codes (IN101-IN111):

| Sheet | Vehicle Code |
|-------|-------------|
| IN1 | IN101 |
| IN2 | IN102 |
| IN3 | IN103 |
| IN4 | IN104 |
| IN5 | IN105 |
| IN6 | IN106 |
| IN7 | IN107 |
| IN8 | IN108 |
| IN9 | IN109 |
| IN10 | IN110 |
| IN11 | IN111 |

### H2. Sheet-Specific Alias Override (rules lines 42-44)
`dashboard_vehicle_alias_by_sheet` overrides the general alias for sheet IN11, forcing it to IN111. In the code (line 503), `alias_by_sheet` takes priority over `alias_map`, so if a sheet has an entry, ALL rows in that sheet are mapped to that vehicle code regardless of the vehicle cell value.

### H3. Scope Vehicle Codes (rules lines 17-26)
9 vehicles are in scope: IN101, IN102, IN103, IN105, IN106, IN108, IN109, IN110, IN111.
**Missing:** IN104 and IN107 are defined in the alias map but NOT in scope_vehicle_codes. Rows from IN4/IN7 sheets will be aliased to IN104/IN107 and then dropped because they are out of scope.

### H4. Ruled Diffs Per Vehicle
- IN102: invested_amount delta of -74881.5498
- IN103: invested_amount delta of -20000.0, spread delta of -249998.61284
- IN106: invested_amount delta of -3300.0

### H5. Commission Column Offsets Per Sheet
See section I below for details.

### H6. Ownership Fallback (rules line 45)
`dashboard_ownership_fallback_to_shares_if_missing: true` -- if the dashboard sheet lacks an "OWNERSHIP POSITION" column, the "Number of shares invested" value is used as the ownership value (lines 526-527).

### H7. Optional Numeric Fields (rules lines 46-48)
`management_fee_percent` is optional. If the column is missing from a sheet, processing continues without failure (lines 422-423).

### H8. Positions Override for Ownership (lines 907-909)
For IN scope specifically, ownership totals in `sub_totals` are overwritten with the sum of `positions.units` per vehicle. This means the vehicle-level ownership comparison always uses positions data, not subscription.units.

---

## I) Sheet-Specific Column Variations

### I1. Commission Columns by Sheet

The `dashboard_commission_columns` config defines which Excel columns contain commission amounts:

| Sheet | invested_amount cols | spread cols |
|-------|---------------------|-------------|
| **Default** | 35, 45, 55 | 41, 51, 61 |
| **IN2** | 36, 45, 54 | 42, 51, 60 |
| **IN3** | 37, 47, 57 | 43, 53, 63 |
| **IN5** | 41, 53, 63 | 47, 59, 69 |
| **IN6** | 36, 46, 56 | 42, 52, 62 |
| **IN10** | 36, 46, 56 | 42, 52, 62 |

Sheets IN1, IN4, IN7, IN8, IN9, IN11 use the default columns.

### I2. Commission Name Columns by Sheet

| Sheet | Name columns |
|-------|-------------|
| **Default** | 43, 53 |
| **IN2** | [] (empty -- no name columns) |
| **IN3** | 45, 55 |
| **IN5** | 51, 61 |
| **IN6** | 44, 54 |
| **IN10** | 44, 54 |

**Critical note for IN2:** The name column list is empty. This means the backward-compatible fallback (lines 461-469) will compute `n = min(0, ...)  = 0`, producing zero commission slots. No commissions will be extracted from sheet IN2 at all unless dynamic slot detection kicks in or explicit slot config is provided.

### I3. Commission Slot Config by Sheet (rules lines 234-297)

Explicit slot configurations (name_col, invested_amount_col, spread_col):

| Sheet | Slot 1 | Slot 2 |
|-------|--------|--------|
| **Default** | (43, 45, 51) | (53, 55, 61) |
| **IN2** | [] (empty -- no slots) | -- |
| **IN3** | (45, 47, 53) | (55, 57, 63) |
| **IN5** | (51, 53, 59) | (61, 63, 69) |
| **IN6** | (44, 46, 52) | (54, 56, 62) |
| **IN10** | (44, 46, 52) | (54, 56, 62) |

**IN2 has empty slot config**, confirming that no commissions are extracted from IN2. This may be intentional if IN2 (IN102) has no introducer commissions, but it should be verified.

### I4. Dynamic Commission Slot Detection (lines 444-459)
Enabled by `dashboard_dynamic_commission_slots: true` (rules line 318). Activates only when no explicit slot config exists for a sheet. Scans row 2 headers for names matching `dashboard_commission_name_header_candidates` (rules lines 319-328): "name", "names", "partner", "partners", "bi", "verso", "introducer", "introducers". Then looks for adjacent "Subscription fees" and "Spread PPS Fees" columns.

**Priority:** Explicit slot config > Dynamic detection > Backward-compatible fallback.

---

## J) Gaps and Blind Spots

### J1. No Explicit Unmapped Name Reporting
When an investor or introducer name cannot be resolved through alias lookup, the engine uses the raw canonical key. There is no diagnostic that explicitly flags "this name had no alias and may be unresolved." The only way unmapped names surface is through downstream mismatches (unmatched rows, missing commissions), which makes root cause analysis harder.

### J2. IN2 Commission Blind Spot
Sheet IN2 has empty commission slot config and empty name columns. No commissions are extracted from this sheet. If IN2 (vehicle IN102) has introducer commissions in the dashboard, they will be completely invisible to the audit. The ruled diff for IN102 (`-74881.5498`) may be a consequence of this -- commissions exist in the DB but are unreadable from the dashboard.

### J3. IN104 and IN107 Silently Excluded
Vehicles IN104 and IN107 exist in the alias map but not in scope_vehicle_codes. Any data for these vehicles in either the dashboard or DB is completely unaudited. There is no warning about this exclusion.

### J4. Combined Introducer Policy "ignore" Hides Issues
With `combined_introducer_name_policy: "ignore"`, combined names that lack alias mappings are silently processed. No warning or failure is emitted. The commissions are tracked at the aggregate investor level only, meaning individual introducer attribution is not validated.

### J5. to_float() Silently Converts Errors to 0.0
Values like "#VALUE!", "N/A", or formatted text are silently converted to 0.0 (lines 38-46). If the dashboard contains error cells, they will be treated as zero amounts without any warning.

### J6. No Currency Validation
The engine does not validate or even read currency fields. If subscription amounts are in different currencies between dashboard and DB, the numeric comparison will pass but the amounts are semantically wrong.

### J7. No Date Format Validation Warning
The `parse_date()` function (lines 49-63) tries 4 date formats and falls back to the raw string. If a date is unparseable, it returns the raw string, which will likely cause a `row_contract_date_mismatch` failure. However, the root cause (bad date format) is not specifically called out.

### J8. Depluralization Heuristic Is Crude
`canonical_name_key()` (line 82-83) strips trailing "s" from tokens longer than 4 characters. This is a very crude heuristic that could cause false collisions (e.g., "Ross" and "Ros" would become the same key) or missed matches. No fuzzy matching or Levenshtein distance is used.

### J9. No Audit of DB Data Completeness
The engine checks that dashboard rows exist in the DB and vice versa. But it does not check whether the DB has data for vehicles that the dashboard does NOT mention. With `restrict_to_db_vehicles_with_data: true`, the scope is dynamically narrowed to vehicles with existing DB data, but there is no check for "DB has vehicles with data that are NOT in any dashboard sheet."

### J10. Performance Fee Amounts Not Validated
For `performance_fee_tier1` and `performance_fee_tier2`, the amount is always extracted as 0.0 from the dashboard (lines 726, 741). Only rate_bps is compared. If the DB has non-zero accrual amounts for performance fees, they would never be caught.

### J11. Spread Rate_bps Comparison Skipped
At line 1552, rate comparison is skipped for `basis == "spread"`. The comment says "Spread uses 'Spread PPS' on the dashboard and is not a direct rate_bps mapping." This means spread commission rates in the DB are never validated against dashboard values.

### J12. No Idempotency or Rerun Safety
The engine creates timestamped output directories (line 1811) but does not check for previous runs or compare results across runs. There is no mechanism to detect regressions between audit runs.

### J13. Header Row Hardcoded to Row 2
Column headers are read from row 2 (line 373: `ws.cell(2, c).value`). Data starts at row 3 (line 498: `min_row=3`). If a sheet has a different header row, the engine will fail to find columns or read wrong data.

### J14. Max Columns Hardcoded to 120
Both header scanning (line 373) and row iteration (line 498) use `max_col=120`. If a dashboard sheet has commission columns beyond column 120 (column DQ in Excel), they will be missed.

### J15. No Validation of DB Commission Status
The engine checks subscription `status` (must be "funded"), but does not validate commission `status` (e.g., checking that commissions are in appropriate states like "accrued", "paid", etc.).

### J16. position_vs_dashboard_ownership_by_investor Uses Name Keys
The ownership-by-investor check (lines 1191-1204) compares dashboard ownership by investor_key against positions by investor_key. If two investors in the same vehicle resolve to the same name key (alias collision), their positions would be incorrectly summed together.

### J17. Sub-Key Deduplication Not Used
`sub_key_counts` is computed at line 826-869 (counting subscriptions by vehicle+commitment+shares+date) but never checked or reported. This appears to be dead code -- subscription duplicates are not flagged.

### J18. Introducer Commission Totals Include All Dashboard Rows (Including Zero Ownership)
At lines 580-595, commission amount totals (`intro_totals_all_rows`) are accumulated from ALL rows including zero-ownership rows. This is explicitly noted in the comment at line 580. However, the DB commission totals only include commissions linked to deals (which may not include zero-ownership subscriptions). This asymmetry could cause false total mismatches.

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Total check categories | 13 major categories (A1-A13) |
| Numeric fields compared (vehicle level) | 19 |
| Numeric fields compared (row level) | 15 active + 1 skipped (ownership) |
| Commission basis types checked | 4 |
| Alias entries defined | 20 |
| Ruled diffs (invested_amount) | 3 vehicles |
| Ruled diffs (spread) | 1 vehicle |
| Specific commission expectations | 4 |
| Sheets with custom column config | 5 (IN2, IN3, IN5, IN6, IN10) |
| Vehicles in scope | 9 (of 11 aliased) |
| Identified gaps/blind spots | 18 |
| Disabled checks | 3 (contacts, brokers, specific_rule_assertions) |
| Silent skip categories | 13 |
