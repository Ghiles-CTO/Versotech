# VC1 Scope Audit — Independent Findings

**Auditor**: Claude (independent read-only audit)
**Date**: 2026-02-14
**Files reviewed**:
- `data_verification_engine/scopes/vc1/run_vc1_audit.py` (2117 lines)
- `data_verification_engine/scopes/vc1/rules_vc1.json` (292 lines)
- `data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-11.md` (~1243 lines)

---

## A. Check Categories — What Does the Engine Perform?

The engine performs the following distinct check categories, each described with line references:

### A1. Vehicle-Level Totals Parity (lines 1171-1213)
Compares aggregate sums per vehicle code between dashboard and DB for all configured metrics. If a metric's sum differs beyond tolerance, it is a failure. Metrics compared:
- `count`, `cost_per_share`, `commitment`, `price_per_share`, `shares`, `ownership`, `spread_per_share`, `spread_fee`, `sub_fee_percent`, `sub_fee`, `management_fee_percent`, `perf1_percent`, `perf1_threshold`, `perf2_percent`, `perf2_threshold`, `bd_fee_percent`, `bd_fee`, `finra_shares`, `finra_fee`

Certain metrics are skipped at vehicle level per `vehicle_totals_skip_metrics` (line 1193): `cost_per_share`, `ownership`, `sub_fee_percent`, `management_fee_percent`, `perf1_percent`, `perf2_percent`, `bd_fee_percent`.

### A2. Row-Level Subscription Matching (lines 1215-1419)
Multi-pass matching algorithm that pairs each dashboard row to a DB subscription record:
1. **Exact match** (line 1257-1278): Key = `(vehicle, investor_key, commitment, shares)` + contract_date alignment.
2. **Fallback 1** — loose name + amounts (lines 1360-1369): Same vehicle + loose_name_key + commitment + shares.
3. **Fallback 2** — amounts + date (lines 1372-1381): Same vehicle + commitment + shares + date (name-independent).
4. **Fallback 3** — investor + shares + date (lines 1384-1393): Allows commitment rounding drift.
5. **Fallback 4** — amounts only (lines 1396-1405): Same vehicle + commitment + shares, no date constraint.

Unmatched dashboard rows: `row_unmatched_dashboard` (line 1407-1413).
Unmatched DB rows: `row_unmatched_db` (line 1414-1419).

### A3. Row-Level Numeric Field Comparison (lines 1421-1467)
For each matched pair, compares 16 numeric fields with tolerance-aware matching. Also compares `contract_date` with optional null-tolerance (line 1444-1453).

### A4. Position Matching (lines 1475-1509)
- **Per-investor ownership parity**: Dashboard ownership vs DB positions.units aggregated per (vehicle, investor_key) (lines 1476-1490).
- **Position coverage**: Dashboard investors with ownership > 0.01 must have at least one position row in DB (lines 1492-1509).
- **Orphan DB positions**: DB positions with units > 0.01 that have no dashboard counterpart (lines 1501-1509).

### A5. Zero Ownership Exclusion Check (lines 1511-1542)
When `zero_ownership_must_not_be_loaded` is true, verifies that dashboard rows with ownership <= 0 are NOT present as DB subscriptions. Both exact (with date) and relaxed (without date) key matching is used.

### A6. Status / Funded Amount Checks (lines 1544-1556)
- `status_must_be_funded`: Every DB subscription must have status = "funded" (line 1545-1548).
- `funded_amount_equals_commitment`: DB funded_amount must equal commitment within 0.01 (lines 1549-1556).

### A7. Structural Integrity Checks (lines 1558-1618)
- **Subscription missing deal_id** (lines 1559-1561): Subscriptions with NULL deal_id.
- **Subscription-deal vehicle mismatch** (lines 1563-1569): Deal's vehicle differs from subscription's vehicle.
- **Investor identity duplicates** (lines 1571-1579): Same canonical_name_key maps to multiple investor_ids across subscriptions, positions, introductions, commissions.
- **Individual loose duplicates** (lines 1576-1579): Same first+last name (loose key) on multiple individual-type investor IDs.
- **Position zero units** (lines 1582-1584): Position rows with units near zero.
- **Position duplicates** (lines 1585-1589): Multiple position rows for same investor_id + vehicle_id.
- **Position vs dashboard ownership** (lines 1590-1594): Vehicle-level position sum vs dashboard ownership sum.
- **Commission exact duplicates** (lines 1597-1618): Same (introducer, deal, investor, introduction, basis_type, tier, rate_bps, base_amount, accrual_amount) appearing more than once.

### A8. Commission Totals (lines 1620-1667)
Per-vehicle comparison of dashboard introducer-block totals (all rows including zero-ownership) vs DB `introducer_commissions` totals, broken down by `invested_amount` and `spread` basis types. Ruled diffs allow known expected deltas to be warnings rather than failures.

### A9. Row-Level Commission Parity (lines 1669-1794)
For each key = `(vehicle, investor_key, introducer_key, basis_type)`:
- **Missing in DB** (lines 1733-1748): Dashboard has amount > 0.01, DB has 0.
- **Missing in dashboard** (lines 1750-1765): DB has amount > 0.01, dashboard has 0.
- **Amount mismatch** (lines 1767-1773): Both non-zero but differ by > 0.01.
- **Row count mismatch** (lines 1780-1786): Same key has different number of rows.
- **Split mismatch** (lines 1787-1794): Same count but individual row amounts differ.

### A10. Commission FK Check (lines 1796-1803)
Verifies every commission's `introduction_id` references an existing introduction record.

### A11. Max Introducers Per Subscription (lines 1805-1819)
Validates that no investor+deal combination has more than `max_introducers_per_subscription` (currently 3) unique introducers.

### A12. Broker / Introducer Master Checks (lines 1821-1892)
- **Broker table coverage** (lines 1822-1830): Expected brokers exist in DB.
- **Forbidden names in introducers master** (lines 1839-1842).
- **Forbidden names in introductions** (lines 1844-1849).
- **Broker-like names in commissions** (lines 1861-1880): Global and per-vehicle forbidden names.
- **Forbidden commission pairs** (lines 1882-1892): Explicit (vehicle, introducer) blacklist.

### A13. Specific Commission Assertions (lines 1894-1960)
When `specific_rule_assertions` is enabled (currently **false** for VC1), verifies documented expected commission amounts and rates.

### A14. Contacts File Checks (lines 1962-2010)
When `run_contacts_checks` is enabled (currently **false** for VC1), validates introducer names in the contacts spreadsheet against DB master lists. Red-highlighted rows are excluded.

### A15. Dashboard Column Detection (lines 488-541)
Validates that required columns exist in each dashboard sheet. Missing required columns produce a failure and the sheet is skipped.

### A16. Commission Header Drift Detection (lines 594-616)
Warns if commission column headers don't match expected patterns (e.g., reading a percentage column instead of an amount column).

---

## B. Numeric Fields Validated

### B1. Row-Level Comparisons (lines 1421-1438)
Each matched dashboard-to-DB pair is compared on these 16 fields:

| # | Dashboard Field | DB Field | Notes |
|---|----------------|----------|-------|
| 1 | `cost_per_share` | `cost_per_share` | |
| 2 | `price_per_share` | `price_per_share` | |
| 3 | `ownership` | `units` | Dashboard ownership vs DB subscription units |
| 4 | `spread_per_share` | `spread_per_share` | |
| 5 | `spread_fee` | `spread_fee` | Maps to `spread_fee_amount` in DB |
| 6 | `sub_fee_percent` | `sub_fee_percent` | Maps to `subscription_fee_percent` in DB |
| 7 | `sub_fee` | `sub_fee` | Maps to `subscription_fee_amount` in DB |
| 8 | `management_fee_percent` | `management_fee_percent` | |
| 9 | `perf1_percent` | `perf1_percent` | Maps to `performance_fee_tier1_percent` in DB |
| 10 | `perf1_threshold` | `perf1_threshold` | Maps to `performance_fee_tier1_threshold` in DB |
| 11 | `perf2_percent` | `perf2_percent` | Maps to `performance_fee_tier2_percent` in DB |
| 12 | `perf2_threshold` | `perf2_threshold` | Maps to `performance_fee_tier2_threshold` in DB |
| 13 | `bd_fee_percent` | `bd_fee_percent` | |
| 14 | `bd_fee` | `bd_fee` | Maps to `bd_fee_amount` in DB |
| 15 | `finra_shares` | `finra_shares` | |
| 16 | `finra_fee` | `finra_fee` | Maps to `finra_fee_amount` in DB |

Additional numeric comparisons:
- `commitment` (used in matching key but not in per-field comparison — it is implicit in the match key)
- `shares` (same — implicit in the match key)
- `contract_date` (compared as a string, not numeric — line 1444)
- `funded_amount` vs `commitment` (line 1549-1556)

### B2. Skipped Metrics
- `row_compare_skip_metrics` = `["ownership"]` — ownership is NOT compared at row level (line 1455). It is compared separately via positions (section A4).
- `row_blank_value_skip_metrics` = `["cost_per_share"]` — if dashboard cell is blank, skip comparison (line 1457).
- `vehicle_totals_skip_metrics` skips 7 metrics from vehicle-level totals (line 1193): `cost_per_share`, `ownership`, `sub_fee_percent`, `management_fee_percent`, `perf1_percent`, `perf2_percent`, `bd_fee_percent`.

### B3. Tolerance and Percent Normalization (lines 156-198)
- Default tolerance: 0.01 (line 166).
- `commitment` has override tolerance of 1.0 (rules line 237).
- Percent fields (`sub_fee_percent`, `management_fee_percent`, `perf1_percent`, `perf2_percent`, `bd_fee_percent`) use fraction-or-percent normalization: if a value is <= 1.0, it also checks value * 100; if >= 100, it also checks value / 100 (lines 180-197). Mode is `fraction_or_percent_strict` for all five.

### B4. Commission Numeric Fields
- `accrual_amount` is the compared amount field for commission matching (line 1037 for DB, line 825/838 for dashboard).
- Commission totals use `invested_amount` and `spread` basis types (lines 1630-1667).

---

## C. Investor Name Mapping

### C1. Normalization Pipeline
Three levels of name normalization exist:

1. **`normalize_text()`** (lines 83-90): Lowercase, strip, replace `&` with ` and `, normalize dashes, remove titles (Mr/Mrs/Ms/Dr/Sir/Madam/Mme/M), remove non-alphanumeric except spaces, collapse whitespace.

2. **`canonical_name_key()`** (lines 93-103): Applies `normalize_text()`, removes `and`/`or`, strips trailing `s` from words longer than 4 chars (crude de-pluralization), **sorts** tokens alphabetically, joins without spaces. This means "John Smith" and "Smith John" produce the same key.

3. **`compact_name_key()`** (lines 106-109): Like canonical but does NOT sort tokens — preserves order.

4. **`loose_name_key()`** (lines 139-148): Returns only first + last token after normalization. Used for fallback matching when middle names differ.

### C2. Alias Resolution (lines 126-136, 354-399)
The `name_key()` function checks three key variants (canonical, compact, loose) against the alias dictionary. The alias dictionary is built from `rules_vc1.json` `name_aliases` (lines 88-142 of JSON) by expanding each alias entry into all key variants of both source and target (lines 359-369).

There are **54 alias entries** in the rules, covering:
- Single-name introducers (e.g., "rick" -> "Altras Capital Financing Broker")
- Combined names (e.g., "Rick + Andrew" -> "Altras Capital Financing Broker")
- Name variant corrections (e.g., "mickaelryan" -> "Michael RYAN")
- Entity aliases (e.g., "terrafinancial" -> "Terra Financial & Management Services SA")

### C3. Vehicle-Specific Investor Aliases (lines 371-388, JSON lines 261-268)
The `investor_aliases_by_vehicle` mechanism allows the same name to map differently in different vehicles:
- VC111: "Zandera (Finco) Limited" -> "Michael RYAN"
- VC113: "Zandera (Finco) Limited" -> "Zandera (Holdco) Limited"

These are applied via `investor_key_for_vehicle()` (lines 417-423), which checks vehicle-scoped aliases first, then falls back to global `name_key()`.

### C4. Fallback Ruled Name Pairs (lines 389-403, JSON lines 269-291)
For cases where name normalization cannot resolve the mapping, explicit `(vehicle, dashboard_name, db_name)` tuples are defined. There are **22 entries**:
- 6 for Hedgebay Securities LLC -> individual investors (VC106)
- 6 for LEE RAND GROUP -> individual investors (VC106)
- 7 for OEP Ltd -> Julien MACHOT (across VC106, VC112, VC113, VC122, VC124, VC125, VC126)
- 1 for KARKUN (VC106)
- 1 for SUBRAMANIAN (VC106)
- 1 for HAYAT (VC106) — typo correction "Imrat" -> "Imran"
- 1 for INNOVATECH -> Anand SETHA (VC122)

### C5. Unmapped Names Are Reported
Yes. At line 1355, if a fallback match is not ruled (not in `fallback_ruled_pairs`), and the fallback mode is not "safe", a `row_mapping_unresolved` **failure** is recorded. Additionally, completely unmatched rows produce `row_unmatched_dashboard` or `row_unmatched_db` failures (lines 1407-1419).

### C6. Combined/Multi-Introducer Name Handling (lines 789-813)
Dashboard cells containing "+" or newlines are treated as combined introducer names. The engine checks if rules explicitly collapse the combined label. If not:
- `combined_introducer_name_policy` = `"fail"` (JSON line 87) -> records a **failure**.
- The commission row is then **skipped** (line 813: `continue`) — it is not added to `dash_commissions`.

---

## D. Introducer/Partner Commission Matching

### D1. Basis Types Checked
Per `commission_match_basis_types` (JSON lines 189-192):
- `invested_amount`
- `spread`

Note: `performance_fee` is **NOT** in the match basis types for VC1. This means performance fee commissions in the DB are **silently excluded** from row-level commission parity checks. They are still included in the `commission_exact_duplicate_check` (line 1597-1618) since that checks raw `db["commissions"]`.

### D2. Commission Extraction from Dashboard (lines 549-841)
Commission data is extracted from dashboard using configurable column positions:
- Dynamic slot detection enabled (`dashboard_dynamic_commission_slots`: true, JSON line 221)
- Name header candidates: "name", "names", "partner", "partners", "bi", "verso", "introducer", "introducers" (JSON lines 222-231)
- For each investor row, the engine reads: introducer name (with merged-cell carry-forward), invested_amount value, spread value
- Amounts with abs <= 0.01 are ignored (lines 814, 828)
- Introducer names are resolved through the alias system

### D3. Commission Matching Logic (lines 1669-1794)
Commissions are aggregated per key = `(vehicle, investor_key, introducer_key, basis_type)`:
- Dashboard investor_key uses the row-level investor mapping from subscription matching (line 1692)
- If no row mapping exists, `apply_ruled_fallback_investor()` is tried (line 1695)
- DB commissions filter to `basis_allow` types only (line 1706)
- Zero-amount DB rows are excluded from row-count comparisons (line 1715)

### D4. Commission Totals (lines 1620-1667)
Vehicle-level totals compare dashboard introducer block sums (from ALL rows including zero-ownership) against DB commission sums. Two separate comparisons:
1. `invested_amount` basis — with ruled diffs from `commission_total_ruled_diffs_invested_amount` (currently empty for VC1)
2. `spread` basis — with ruled diffs from `commission_total_ruled_diffs_spread` (VC106: 0.058, VC113: 0.0125, VC114: -0.4)

### D5. Forbidden / Warning-Only Introducers
- `broker_like_introducers_forbidden_global`: empty (JSON line 150)
- `broker_like_introducers_forbidden_by_vehicle`: empty (JSON line 151)
- `warnings_only_introducers`: empty (JSON line 157)

When a commission row's introducer is in the forbidden set, missing-in-DB becomes a **warning** ("commission_row_ruled_removed") instead of a failure (line 1734-1740). Warning-only introducers cause extra-in-DB to be a warning instead of failure (line 1751-1757).

---

## E. Silent Skips — Rows That Could Be Ignored Without Reporting

### E1. Zero-Ownership Dashboard Rows — Partial Skip
Dashboard rows with `ownership <= 0` are placed in the `zero` list (line 727) and excluded from the `active` list. They are:
- **Included** in `intro_totals_all_rows` (lines 751-766) — their commission columns contribute to vehicle-level commission totals.
- **Excluded** from vehicle subscription totals and row-level matching.
- **Checked** via `zero_ownership_must_not_be_loaded` (lines 1512-1542) to ensure they are NOT in the DB.

**Potential silent skip**: If `zero_ownership_must_not_be_loaded` were set to `false`, zero-ownership rows would be completely invisible. Currently it is `true` (JSON line 73), so this is covered.

### E2. Combined Introducer Names — Silent Skip on Policy "ignore"
When `combined_introducer_name_policy` is "ignore" (line 809), combined names with non-zero amounts are silently skipped. Currently the policy is `"fail"` (JSON line 87), so this is not active. However, even with "fail", the commission row is still skipped from `dash_commissions` (line 813 `continue`) — meaning the amounts are **lost from row-level commission parity** even though a failure is logged. The amounts still contribute to `intro_totals_all_rows` for totals parity.

### E3. Commission Amounts Without Introducer Name (lines 776-787)
If an introducer name cell is empty/dash but amounts are non-zero, a **warning** is emitted, and the commission row is **skipped** (`continue` at line 787). The amounts still feed into `intro_totals_all_rows`.

### E4. DB Commission Rows with Excluded Basis Types (lines 1013-1017)
Commission rows with `basis_type` not in `["invested_amount", "spread"]` (e.g., `performance_fee`) are excluded from `db_commission_rows`. They are:
- **Included** in `commission_exact_duplicate_check` (uses raw `db["commissions"]`)
- **Included** in commission FK check (uses raw `db["commissions"]`)
- **Included** in commission totals by vehicle (line 1622-1627 uses raw `db["commissions"]`)
- **Excluded** from row-level commission parity (line 1705-1707)

**This is a significant blind spot**: performance_fee commission row amounts are counted in vehicle totals but NOT validated at the individual investor/introducer level.

### E5. Zero-Amount DB Commission Rows (lines 1714-1716)
DB commission rows with `abs(amount) <= 0.01` are excluded from `db_comm_rows_by_key` for row-count/split parity. They still contribute to `db_comm_agg` (total amounts). This means if the DB has a zero-amount row and the dashboard does not, no row-count failure is raised.

### E6. Vehicles Without DB Data (lines 1145-1167)
When `restrict_to_db_vehicles_with_data` is `true` (JSON line 34), vehicles that have no subscriptions, positions, introductions, or commissions in the DB are entirely excluded from the scope. Dashboard rows for those vehicles are silently dropped (line 1162-1164). This could hide missing data imports.

### E7. Dashboard Optional Numeric Fields (JSON lines 65-71)
Fields in `dashboard_optional_numeric_fields` — `management_fee_percent`, `bd_fee_percent`, `bd_fee`, `finra_shares`, `finra_fee` — are excluded from the required-column check (line 538). If these columns are missing from a sheet, they silently default to 0.0 for all rows.

### E8. Investor Name is Empty (line 635-636)
If after parsing entity/first/middle/last name fields, the resulting name is empty, the entire row is silently skipped (`continue`). No warning or failure is raised.

### E9. Vehicle Code Not in Scope (line 624-625)
Dashboard rows whose mapped vehicle code is not in `scope_vehicle_codes` are silently skipped. This is expected behavior but could hide rows if the vehicle alias mapping is incomplete.

---

## F. Structural/Integrity Checks

### F1. Exact Commission Duplicates (lines 1597-1618)
Checks for identical `(introducer_id, deal_id, investor_id, introduction_id, basis_type, tier_number, rate_bps, base_amount, accrual_amount)` tuples. Note: `base_amount` is included as a string, so `None` vs `"None"` could cause false negatives — though in practice both come from `str(c.get("base_amount"))`.

### F2. Commission FK to Introduction (lines 1796-1803)
Every commission with a non-null `introduction_id` must reference an existing introduction. Broken FKs are failures.

### F3. Investor Identity Duplicates — Two Tiers (lines 1571-1579)
- **Tier 1 (strict)**: Uses `canonical_name_key()` (sorted tokens, de-pluralized). Flags when same key resolves to multiple `investor_id` values.
- **Tier 2 (individual loose)**: Uses `individual_loose_identity_key()` (first+last token only) but only for `type=individual` investors. Flags potential duplicates missed by tier 1.

Important: These checks use raw `canonical_name_key()` without alias resolution (line 1048), to avoid false positives from intentional transfer aliases.

### F4. Subscription-Deal Consistency (lines 1558-1569)
- Subscriptions with NULL `deal_id` are flagged.
- Subscriptions where the deal's vehicle differs from the subscription's vehicle are flagged.

### F5. Position Integrity (lines 1581-1594)
- Zero-unit position rows flagged.
- Duplicate position rows (same investor_id + vehicle_id) flagged.
- Vehicle-level position total vs dashboard ownership total.

### F6. Max Introducers Per Subscription (lines 1805-1819)
Currently capped at 3 (JSON line 82). Flags investor+deal combinations that exceed this.

---

## G. Ruled Diffs in rules_vc1.json

### G1. Commission Total Ruled Diffs — invested_amount
`commission_total_ruled_diffs_invested_amount` (JSON line 209): **Empty** `{}`.
No invested_amount ruled diffs exist for VC1.

### G2. Commission Total Ruled Diffs — spread
`commission_total_ruled_diffs_spread` (JSON lines 210-214):

| Vehicle | Ruled Delta | Explanation |
|---------|----------:|-------------|
| VC106 | +0.058 | Rounding across multiple commission rows |
| VC113 | +0.0125 | Rounding across multiple commission rows |
| VC114 | -0.4 | No commissions in DB; tiny dashboard residual |

### G3. Metric Tolerance Overrides
`metric_tolerance_overrides` (JSON lines 236-238):

| Metric | Override Tolerance |
|--------|------------------:|
| `commitment` | 1.0 |

All other metrics use the default tolerance of 0.01.

### G4. Percent Compare Rules
`percent_compare_rules` (JSON lines 239-260): All five percent fields use `fraction_or_percent_strict` mode with `allow_divide_if_abs_gte: 100`. This means 0.2 and 20 are treated as equivalent for comparison.

### G5. Fallback Ruled Name Pairs
`fallback_ruled_name_pairs` (JSON lines 269-291): 22 entries (detailed in section C4 above).

### G6. Investor Aliases By Vehicle
`investor_aliases_by_vehicle` (JSON lines 261-268): 2 entries (detailed in section C3 above).

### G7. Dashboard Sheet Overrides
- `dashboard_header_row_by_sheet`: `{"VC6": 3}` (JSON lines 215-217). VC6 has header on row 3 instead of default row 2.
- `dashboard_data_start_row_by_sheet`: `{"VC6": 4}` (JSON lines 218-220). VC6 data starts at row 4 instead of default row 3.
- `dashboard_blank_ownership_as_active_by_sheet`: `["VC22"]` (JSON lines 233-235). VC22 rows with blank ownership are treated as active.

---

## H. Vehicle-Specific Overrides

### H1. Vehicle Code Mapping
`dashboard_vehicle_alias` (JSON lines 35-63) maps 27 dashboard sheet vehicle codes (VC1-VC27) to DB vehicle codes (VC101-VC127). This is a +100 offset mapping.

### H2. Scope Sheets vs Scope Vehicle Codes
- Dashboard sheets in scope: VC2, VC6, VC11-VC14, VC18, VC21-VC26 (13 sheets)
- DB vehicle codes in scope: VC102, VC106, VC111-VC114, VC118, VC121-VC126 (13 vehicles)

Note: VC101, VC103-VC105, VC107-VC110, VC115-VC117, VC119-VC120, VC127 are NOT in scope.

### H3. VC6 Header Override
VC6 uses header row 3 and data start row 4, while all other sheets use row 2/3 respectively.

### H4. VC22 Blank Ownership Override
VC22 rows with blank ownership are treated as active rather than zero (line 702-706). This prevents legitimate blank-ownership rows from being flagged.

### H5. VC106 Performance Fee Convention
Per DB_CHANGES section 14: VC106 uses whole-number perf1 values (20=20%, 10=10%) while other vehicles use fractions (0.2=20%). The percent comparison logic (section B3) handles this via `fraction_or_percent_strict` mode.

### H6. VC113/VC111 Investor Aliases
See section C3 — Zandera (Finco) Limited resolves differently in VC111 vs VC113.

---

## I. Gaps and Blind Spots

### I1. Performance Fee Commissions Are Not Row-Level Validated
**Severity: HIGH**
`commission_match_basis_types` only includes `["invested_amount", "spread"]` (JSON lines 189-192). Performance fee (`performance_fee`) commission rows in the DB are completely excluded from row-level commission parity checks (section A9). Only the `commission_exact_duplicate_check` and commission FK check cover them. If a performance fee commission has the wrong amount, investor, or introducer, it will NOT be detected. The DB_CHANGES_CHECKPOINT section 26 confirms that performance fees are being actively managed (8 rows inserted for IN103/IN106), yet the VC1 engine would not validate these against the dashboard.

### I2. Commission Totals Include Performance Fees But Row-Level Does Not
**Severity: MEDIUM**
The vehicle-level commission totals (lines 1622-1627) sum ALL commission rows from `db["commissions"]` regardless of basis type, while row-level parity (lines 1705-1707) filters to `basis_allow`. If the dashboard introducer block columns also aggregate across all fee types, this could mask: (a) total matches but row-level distribution is wrong, or (b) performance fee amounts compensate for invested_amount/spread errors.

However, looking more carefully at the dashboard extraction (lines 768-841), the dashboard commission columns only capture `invested_amount` and `spread` amounts — so if the dashboard totals are also only these two types, this mismatch may not manifest. But the `intro_totals_all_rows` (lines 751-766) does sum the same columns, so the totals comparison should be consistent. **The real gap is still I1: no per-row performance fee validation.**

### I3. No Currency Validation
**Severity: MEDIUM**
The engine does not compare or validate the currency of subscriptions or commissions. All amounts are compared as raw numbers. If a subscription has `currency=EUR` in the DB but the dashboard shows USD amounts, no mismatch would be detected.

### I4. No Validation of `rate_bps` for invested_amount / spread Commissions
**Severity: MEDIUM**
While `rate_bps` is fetched from the DB (line 1038), it is only used in `specific_rule_assertions` (lines 1894-1941), which is **disabled** for VC1 (`"specific_rule_assertions": false`, JSON line 85). The main commission matching compares only `accrual_amount`, not the rate. A commission row could have the correct amount but a wildly wrong rate_bps and the engine would not flag it.

### I5. `to_float()` Extracts Numbers From Text Strings
**Severity: LOW-MEDIUM**
The `to_float()` function (lines 28-46) uses regex extraction as a fallback: "ETH 15.00" becomes 15.0, "USD -" becomes 0.0. This is pragmatic but could silently convert error strings like "#VALUE!" or "N/A 500" into numeric values (the 500 would be extracted). The `#VALUE!` case is handled (returns 0.0 since no digits match), but "N/A 500" would extract 500.

### I6. Canonical Name Key Strips Trailing 's' From Words > 4 Characters
**Severity: LOW**
Line 99-100: `if len(p) > 4 and p.endswith("s"): p = p[:-1]`. This crude de-pluralization could cause false matches. "Adams" (5 chars) becomes "adam", but "James" (5 chars) also becomes "jame". In practice this is mitigated by the sorted multi-token approach, but edge cases exist where different names could collide.

### I7. Empty Investor Names Are Silently Skipped
**Severity: LOW**
Line 635-636: If entity and all name parts are empty/None, the row is skipped with no trace. This could hide rows where name data was accidentally deleted from the dashboard.

### I8. No Validation of `base_amount` Field on Commissions
**Severity: LOW**
The commission matching uses `accrual_amount` exclusively. `base_amount` is only used in the exact-duplicate check key (line 1607). If `base_amount` is wrong (e.g., commission says it's based on $100K invested but investor actually invested $200K), this is not detected.

### I9. Dashboard Ownership Column Fallback to Shares
**Severity: LOW**
When `dashboard_ownership_fallback_to_shares_if_missing` is true (JSON line 64) and no ownership column exists, shares are used as ownership. This is a reasonable fallback but could produce incorrect ownership values if shares and ownership are conceptually different for some vehicles.

### I10. `argparse` Description Says "VC2 deterministic audit" (line 2091)
**Severity: COSMETIC**
The argparse description string still says "VC2 deterministic audit" instead of "VC1". This is a copy-paste artifact.

### I11. Position Ownership Uses Sub Totals Override (line 1009-1010)
**Severity: INFO**
Line 1009-1010 overrides `sub_totals[vc]["ownership"]` with position sums for every vehicle. This means the "ownership" metric in vehicle totals actually compares dashboard ownership against **positions table** units, not subscription units. This is correct for position-based ownership tracking but could be confusing if the comment "For IN scope" (line 1008) is taken literally — this code runs for all scopes including VC1.

### I12. Restrict-to-DB-Vehicles-With-Data Can Hide Missing Imports
**Severity: MEDIUM**
When `restrict_to_db_vehicles_with_data` is true (JSON line 34), if a vehicle exists in the dashboard scope but has no DB data at all, it is silently excluded. No failure is raised for a completely empty vehicle. If VC118 had zero subscriptions in the DB, the engine would simply skip it. A separate "vehicle coverage" check would be valuable.

### I13. DB Subscription Totals Include ALL Subscriptions (No Status Filter)
**Severity: LOW**
DB totals (lines 922-987) include all subscriptions regardless of status. If some subscriptions have `status=cancelled` or `status=pending`, their amounts still contribute to totals. The dashboard presumably only shows funded/active subscriptions. The `status_must_be_funded` check (line 1545) flags non-funded statuses, but the totals comparison could fail for reasons related to cancelled rows being counted.

### I14. No Validation of `funded_amount` Beyond Equality With `commitment`
**Severity: LOW**
The engine checks `funded_amount == commitment` (line 1549-1556) but does not compare funded_amount against any dashboard field. If funded_amount is the true cash amount and differs from commitment for a valid reason (partial funding), this check would produce false positives.

---

## Summary Statistics

| Dimension | Count |
|-----------|------:|
| Distinct check categories | 16 |
| Numeric fields compared per subscription row | 16 |
| Name alias entries | 54 |
| Fallback ruled name pairs | 22 |
| Vehicle-specific investor aliases | 2 |
| Commission ruled diffs (spread) | 3 |
| Commission ruled diffs (invested_amount) | 0 |
| Dashboard sheets in scope | 13 |
| DB vehicle codes in scope | 13 |
| Identified blind spots | 14 |
| Blind spots rated HIGH | 1 |
| Blind spots rated MEDIUM | 3 |
