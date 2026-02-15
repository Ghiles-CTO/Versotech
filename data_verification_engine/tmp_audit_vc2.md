# VC2 Scope -- Independent Audit Findings

**Auditor**: Claude Opus 4.6 (read-only static analysis)
**Date**: 2026-02-14
**Files reviewed**:
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc2/run_vc2_audit.py` (1838 lines)
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc2/rules_vc2.json` (301 lines)
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc2/VC2_RULES_COVERAGE_2026-02-11.md` (70 lines)
- Latest run output: `run_20260214_121206/audit_report.json` (0 failures, 32 warnings)

---

## A) Check Categories Performed

The engine performs the following distinct categories of checks, invoked sequentially within `Auditor.run_checks()` (line 1010):

### A1. Vehicle-Level Aggregate Totals (lines 1017-1045)
Compares dashboard column sums against DB subscription column sums per vehicle for 19 metrics. Any delta > 0.01 (or != 0 for count) triggers a hard failure.

### A2. Structural / Integrity Checks (lines 1047-1063)
Gated by boolean flags in `rules_vc2.json["checks"]`:
- `subscription_deal_id_required` -- every subscription must have a non-null `deal_id` (line 1048-1050)
- `subscription_deal_vehicle_consistency` -- subscription's vehicle must match its deal's vehicle (lines 1052-1058)
- `investor_identity_duplicate_check` -- same canonical investor name maps to multiple `investor_id` UUIDs across subs/positions/introductions/commissions (lines 1060-1063)

### A3. Row-Level Subscription Parity (lines 1065-1161)
- Matches dashboard active rows to DB subscriptions by a relaxed composite key: `(vehicle, investor_key, commitment, shares)`.
- Within a key group, first matches by exact `contract_date`, then falls back to positional pairing (lines 1096-1110).
- Unmatched dashboard rows and unmatched DB rows are both reported as hard failures (lines 1112-1124).
- For each matched pair, compares 16 numeric fields plus contract_date (lines 1126-1161).

### A4. Zero-Ownership Exclusion (lines 1163-1185)
If `zero_ownership_must_not_be_loaded` is true: checks that dashboard rows with ownership <= 0 do not have corresponding DB subscriptions, using both exact and relaxed key matching.

### A5. Status and Funded Amount (lines 1187-1199)
- `status_must_be_funded` -- every DB subscription must have `status == "funded"` (lines 1188-1191).
- `funded_amount_equals_commitment` -- `funded_amount` must equal `commitment` within 0.01 (lines 1192-1199).

### A6. Position Checks (lines 1201-1214)
- `positions_units_no_zero_rows` -- no position row should have units == 0 (lines 1202-1204).
- `position_unique_per_investor_vehicle` -- no duplicate `(investor_id, vehicle_id)` pairs (lines 1205-1209).
- Position units total per vehicle must equal dashboard ownership total per vehicle (lines 1210-1214).

### A7. Commission Exact Duplicate Check (lines 1216-1236)
If `commission_exact_duplicate_check` is true: counts commission rows by the full composite key `(introducer_id, deal_id, investor_id, introduction_id, basis_type, tier_number, rate_bps, base_amount, accrual_amount)` and fails any count > 1.

### A8. Commission Vehicle-Level Totals (lines 1238-1273)
Compares dashboard introducer block totals (`invested_amount` and `spread`) against DB commission sums per vehicle. Supports "ruled diffs" where an expected delta is acceptable (downgraded to warning). Vehicles in `commission_totals_exclude_vehicle_codes` are skipped entirely.

### A9. Row-Level Commission Parity (lines 1275-1517)
Aggregates commissions by `(vehicle, investor_key, introducer_key, basis_type)` on both dashboard and DB side. Checks:
- Amount parity for `invested_amount` and `spread` basis types.
- Rate (bps) parity for `performance_fee_tier1` and `performance_fee_tier2` (rate-only basis types, lines 1426-1448).
- Missing-in-DB, missing-in-dashboard, amount mismatches.
- Forbidden introducer commissions are downgraded to warnings when absent in DB.
- Specific commission expectations can override dashboard values (lines 1403-1424).

### A10. Commission FK Integrity (lines 1519-1526)
If `commission_fk_introduction_check` is true: every commission's `introduction_id` must point to a valid introduction row.

### A11. Max Introducers per Subscription (lines 1528-1542)
If `max_introducers_per_subscription > 0`: checks that no `(deal_id, prospect_investor_id)` pair has more introducers than the configured maximum (currently 2).

### A12. Broker / Introducer Policy (lines 1544-1614)
- Expected broker names must exist in the `brokers` table (lines 1545-1552).
- Names in `forbidden_in_introducers_master` must not appear in the `introducers` table (lines 1561-1564).
- Names in `forbidden_in_introductions_global` must not appear in any introduction row (lines 1566-1571).
- Forbidden broker-like names (global and per-vehicle) must not have commission rows (lines 1573-1602).
- Explicit `forbidden_commission_pairs` (vehicle + introducer) must have zero rows (lines 1604-1614).

### A13. Specific Commission Assertions (lines 1616-1682)
If `specific_rule_assertions` is true:
- Checks each entry in `specific_commission_expectations` for exact amount and rate match (lines 1636-1663).
- `set_cap_vc215_spread_only_check` -- validates that Set Cap in VC215 has zero invested_amount commissions (lines 1665-1682).

### A14. Contacts File Sanity (lines 1684-1731)
- Reads the contacts Excel file and checks non-red, in-scope rows.
- Introducer names in contacts must exist in DB `introducers` or `brokers` tables (lines 1714-1722).
- Rows with role "broker" must have names present in the `brokers` table (lines 1723-1731).

---

## B) Numeric Fields Validated

### B1. Vehicle-Level Totals (19 metrics, lines 1018-1038)
| # | Metric | Dashboard source | DB source |
|---|--------|-----------------|-----------|
| 1 | `count` | row count | subscription count |
| 2 | `cost_per_share` | "Cost per Share" column | `cost_per_share` |
| 3 | `commitment` | "Amount invested" column | `commitment` |
| 4 | `price_per_share` | "Price per Share" column | `price_per_share` |
| 5 | `shares` | "Number of shares invested" | `num_shares` |
| 6 | `ownership` | "OWNERSHIP POSITION" | `units` |
| 7 | `spread_per_share` | "Spread PPS" | `spread_per_share` |
| 8 | `spread_fee` | "Spread PPS Fees" | `spread_fee_amount` |
| 9 | `sub_fee_percent` | "Subscription fees %" | `subscription_fee_percent` |
| 10 | `sub_fee` | "Subscription fees" | `subscription_fee_amount` |
| 11 | `management_fee_percent` | "Management fees" | `management_fee_percent` |
| 12 | `perf1_percent` | "Performance fees 1" | `performance_fee_tier1_percent` |
| 13 | `perf1_threshold` | "Threshold 1" | `performance_fee_tier1_threshold` |
| 14 | `perf2_percent` | "Performance fees 2" | `performance_fee_tier2_percent` |
| 15 | `perf2_threshold` | "Threshold 2" | `performance_fee_tier2_threshold` |
| 16 | `bd_fee_percent` | "BD Fees %" | `bd_fee_percent` |
| 17 | `bd_fee` | "BD fees" | `bd_fee_amount` |
| 18 | `finra_shares` | "FINRA fees in share" | `finra_shares` |
| 19 | `finra_fee` | "FINRA fees" | `finra_fee_amount` |

### B2. Row-Level Subscription Parity (16 numeric fields, lines 1126-1143)
| # | Dashboard attr | DB attr |
|---|---------------|---------|
| 1 | `cost_per_share` | `cost_per_share` |
| 2 | `price_per_share` | `price_per_share` |
| 3 | `ownership` | `units` |
| 4 | `spread_per_share` | `spread_per_share` |
| 5 | `spread_fee` | `spread_fee` |
| 6 | `sub_fee_percent` | `sub_fee_percent` |
| 7 | `sub_fee` | `sub_fee` |
| 8 | `management_fee_percent` | `management_fee_percent` |
| 9 | `perf1_percent` | `perf1_percent` |
| 10 | `perf1_threshold` | `perf1_threshold` |
| 11 | `perf2_percent` | `perf2_percent` |
| 12 | `perf2_threshold` | `perf2_threshold` |
| 13 | `bd_fee_percent` | `bd_fee_percent` |
| 14 | `bd_fee` | `bd_fee` |
| 15 | `finra_shares` | `finra_shares` |
| 16 | `finra_fee` | `finra_fee` |

Plus `contract_date` as a string comparison (line 1145).

Note: `commitment` and `shares` are used as part of the matching key and are therefore implicitly validated (if they differed, the rows would not match at all).

### B3. Commission Amounts
- `accrual_amount` compared per `(vehicle, investor, introducer, basis_type)` tuple (lines 1350-1355, 1486-1492).
- `rate_bps` compared as sets per tuple (lines 1341-1342, 1356-1357, 1496-1517).
- Performance fee rates (tier1, tier2) are rate-only checks -- no amount comparison, only bps (lines 1426-1448).

### B4. Position Units
- `units` per vehicle summed and compared to dashboard `ownership` total (lines 1210-1214).

### B5. Funded Amount
- `funded_amount` vs `commitment` per subscription (lines 1192-1199).

---

## C) Investor Name Mapping

### C1. Architecture
The name mapping system is a multi-layer pipeline:

1. **`normalize_text(s)`** (lines 59-66): lowercases, replaces `&` with `and`, strips titles (mr/mrs/ms/dr/sir/madam/mme/m), replaces all non-alphanumeric chars with spaces, collapses whitespace.

2. **`canonical_name_key(s)`** (lines 69-79): normalizes, removes `and`/`or`, strips trailing `s` from words > 4 chars (naive plural removal), sorts tokens alphabetically, concatenates.

3. **`compact_name_key(s)`** (lines 82-85): normalizes, removes `and`/`or`, concatenates tokens in original order (no sorting).

4. **`loose_name_key(s)`** (lines 88-95): normalizes, removes `and`/`or`, takes only first + last token.

5. **`alias_key_variants(s)`** (lines 98-109): returns the union of all three key forms for a given string.

6. **`name_key(s, aliases)`** (lines 123-133): computes canonical key, then tries canonical -> compact -> loose against the alias dict. Returns the alias target if found, otherwise returns the canonical key.

### C2. Alias Loading (lines 305-314)
The alias dictionary from `rules_vc2.json["name_aliases"]` is normalized at init time:
- Each raw key generates all variant keys (canonical, compact, loose) via `alias_key_variants`.
- Each raw value also generates variant keys (with `setdefault` -- value-to-value mappings won't overwrite existing entries).
- All targets are canonicalized via `canonical_name_key`.

### C3. Fallback Logic
The `name_key` function (line 123) tries three keys in order: canonical, compact, loose. If any matches an alias, the alias target is returned. If none match, the canonical key is returned as-is. This means:
- **There is fallback**: from canonical to compact to loose.
- **If no alias matches, the canonical key is the identity**.

### C4. Unmapped Names
Unmapped names are NOT explicitly reported as failures or warnings. If a dashboard investor name does not match any DB subscription investor name (after key normalization), it will surface as an **unmatched row** (check `row_unmatched_dashboard` at line 1112-1118), but the root cause (bad name mapping vs genuinely missing subscription) is not distinguished.

Similarly, for commissions, an unresolved introducer name that does not alias-match any DB introducer will silently fail to match commission rows, resulting in `commission_row_missing_in_db` or `commission_row_missing_in_dashboard` failures. There is no dedicated "unmapped name" report.

### C5. Plural Stripping Concern
The `canonical_name_key` function strips trailing `s` from words longer than 4 characters (line 76). This could cause false collisions: e.g., "Marcus" becomes "marcu", "Paris" becomes "pari". This is a known risk in fuzzy name matching but is mitigated by the alias system for known entities.

---

## D) Introducer / Partner Commission Matching

### D1. Basis Types Checked
Defined in `rules_vc2.json["commission_match_basis_types"]` (lines 273-278):
1. `invested_amount` -- dollar amount commission based on invested capital
2. `spread` -- dollar amount commission based on spread per share fees
3. `performance_fee_tier1` -- rate-only check (bps), amount is always 0.0
4. `performance_fee_tier2` -- rate-only check (bps), amount is always 0.0

### D2. Dashboard Commission Extraction
Commission data is extracted from dashboard sheets using "commission slots" -- triplets of `(name_col, invested_amount_col, spread_col)` (lines 440-475). Three slot resolution strategies exist, in priority order:
1. **Explicit slot config** (`dashboard_commission_slots.by_sheet` or `.default`) -- lines 441-449
2. **Dynamic header scanning** (`dashboard_dynamic_commission_slots: true`) -- lines 450-465
3. **Legacy fallback** pairing name columns with rightmost amount columns -- lines 466-475

The current config uses explicit slots as the primary mechanism (both `default` and `by_sheet` for VC203 are defined), but `dashboard_dynamic_commission_slots` is also `true`, meaning the dynamic path would fire for any sheet that lacks an explicit slot config. Since all sheets have a default slot config, the dynamic path currently acts as dead code for the configured sheets.

### D3. Combined Introducer Names
Dashboard cells containing `+` or `\n` in the introducer name trigger "combined introducer" logic (line 625). The system:
1. Checks if any alias maps the combined name to a single target. If yes, it resolves normally.
2. If no alias resolves it, the `combined_introducer_name_policy` in rules determines behavior:
   - `"fail"` -> hard failure
   - `"warn"` -> warning
   - `"ignore"` -> neither (current config is `"ignore"`, line 289)
3. Combined rows are still tracked in `dash_commissions` with `introducer_key="__combined__"` for investor-basis-level total checks (lines 1319-1382).

### D4. Performance Fee Rate Extraction
From the dashboard, performance fee rates are extracted at positional offsets relative to the invested_amount column:
- `perf1_pct` = column `iidx + 1` (line 679)
- `perf2_pct` = column `iidx + 3` (line 680)
- `spread_pct` = column `sidx - 1` (line 688)
- `invested_pct` = column `iidx - 1` (line 678)

These offsets are hardcoded relative to the slot column indices. This is fragile -- any column reordering in the dashboard would silently read wrong values.

### D5. Carried Introducer Name
When an introducer name cell is empty in a dashboard row, the engine carries forward the last non-empty name for that column slot (lines 604-610, via `carried_intro_name_by_col`). This is standard for merged-cell dashboards but could silently assign commissions to the wrong introducer if blank cells exist mid-block.

### D6. DB Commission Loading
DB commissions are loaded from `introducer_commissions` table (line 791). The `basis_type` field is normalized: raw `"performance_fee"` is split into `"performance_fee_tier1"` or `"performance_fee_tier2"` based on `tier_number` (lines 927-931). Only basis types in `commission_match_basis_types` are kept; others are silently dropped (line 933-934).

---

## E) Silent Skips

### E1. Out-of-Scope Sheets/Vehicles
Dashboard rows where the vehicle code (after alias mapping) is not in `scope_vehicle_codes` are silently skipped at line 510-511. No record of how many rows were skipped or which vehicles were encountered but excluded.

### E2. Empty Investor Name
Dashboard rows where the computed investor name is empty are skipped at line 521-522. No warning is emitted -- a row with data but no name is invisible to the audit.

### E3. Commission Basis Type Filtering
DB commission rows with basis types not in `commission_match_basis_types` are silently dropped at lines 933-934. If the DB contains commissions of type `"management_fee"` or any other unlisted type, they are invisible to the audit.

### E4. VCL001/VCL002 Commission Totals
Vehicles in `commission_totals_exclude_vehicle_codes` (VCL001, VCL002) are excluded from commission total checks (lines 1244, 1247-1248). However, row-level commission checks on these vehicles are also skipped (line 1327-1328), meaning ALL commission validation for VCL001 and VCL002 is disabled. These vehicles appear in `scope_vehicle_codes` but have no dashboard sheets in `scope_dashboard_sheets`, so no dashboard commission data would exist anyway. Nevertheless, DB-only commissions for these vehicles are silently ignored.

### E5. Combined Introducer with "ignore" Policy
With `combined_introducer_name_policy: "ignore"` (current config), combined introducer names generate neither failures nor warnings during extraction (line 638-641 branch is not taken). The combined amounts are tracked for aggregate investor-basis checks, but the split between introducers is never validated. This is the largest silent skip in the current configuration.

### E6. Rows with Zero Commission Amounts
Commission rows where both `invested_amount` and `spread_amount` are <= 0.01 are silently skipped for that introducer (lines 692, 707). If a dashboard row has a named introducer but zero amounts, no commission record is created, and the DB is not checked for that combination.

### E7. `to_float` Defaults to 0.0
The `to_float` function (lines 28-39) returns 0.0 for any unparseable value. This means corrupt or text-valued numeric cells are silently treated as zero rather than flagged.

### E8. `combined_basis_keys` Skip in Row-Level Commission
At line 1468-1469, if a `(vehicle, investor_key, basis_type)` tuple exists in `combined_basis_keys` (i.e., had a combined introducer entry), then DB-only commissions for that investor+basis are silently skipped rather than flagged as `commission_row_missing_in_dashboard`. This prevents false positives from combined rows but could mask genuine DB-only orphans.

---

## F) Structural / Integrity Checks

### F1. Subscription Deal ID Required (line 1048-1050)
Every subscription must have a non-null `deal_id`. Enabled: `true`.

### F2. Subscription-Deal Vehicle Consistency (lines 1052-1058)
The vehicle on the subscription must match the vehicle on its associated deal. Enabled: `true`.

### F3. Investor Identity Duplicates (lines 1060-1063)
Scans all subscriptions, positions, introductions, and commissions to detect investor names that resolve to the same canonical key but map to different `investor_id` UUIDs. This is a critical data quality check. Enabled: `true`.

### F4. Position Uniqueness (lines 1205-1209)
No `(investor_id, vehicle_id)` pair should have more than one position row. Enabled: `true`.

### F5. Commission Exact Duplicates (lines 1216-1236)
Checks for fully identical commission rows (all 9 fields). Enabled: `true`.

### F6. Commission FK to Introduction (lines 1519-1526)
Every commission's `introduction_id` must reference a valid introduction row. Enabled: `true`.

### F7. Max Introducers per Subscription (lines 1528-1542)
No subscription should have more than 2 distinct introducers. Threshold: `2`.

### F8. Broker Table Completeness (lines 1545-1552)
The 4 expected broker names must all exist in the `brokers` table. Unexpected extra brokers trigger a warning.

### F9. Forbidden Names in Master Tables (lines 1558-1564)
"R. F. Lafferty & Co. Inc." must not appear in the `introducers` master table.

### F10. Forbidden Names in Introductions (lines 1566-1571)
"R. F. Lafferty & Co. Inc." must not appear in any introduction row.

### F11. Forbidden Commission Pairs (lines 1604-1614)
4 explicit pairs that must have zero commission rows:
- VC215 + Bromley Capital Partners
- VC203 + R. F. Lafferty & Co. Inc.
- VC207 + R. F. Lafferty & Co. Inc.
- VC209 + R. F. Lafferty & Co. Inc.

---

## G) Ruled Diffs in rules_vc2.json

### G1. Commission Total Ruled Diffs (invested_amount)
`commission_total_ruled_diffs_invested_amount` (lines 283-288):

| Vehicle | Expected Delta (DB - Dashboard) |
|---------|-------------------------------|
| VC203 | -60,673.76 |
| VC207 | -26,138.70 |
| VC209 | -252,680.50 |
| VC215 | -141,572.41 |

These are expected negative deltas (DB has less than dashboard) and are downgraded from hard failures to warnings when the actual delta matches. The negative direction means broker-like commissions were intentionally excluded from the DB.

### G2. Name Aliases (lines 48-84)
24 explicit name aliases, including:
- `anandrathi` / `anand` / `Anand` / `setcapdanielbaumslag` / `Anand+Dan` -> "Set Cap"
- `renbridge` / `renaissance` / `Renaissance` -> "Renaissance Bridge Capital LLC"
- `allianceglobalpartners` / `headwallagp` / `Headwall / AGP` -> "Alliance Global Partners LLC"
- `lafferty` / `Lafferty` -> "R. F. Lafferty & Co. Inc."
- `bromleycapital` / `bromleypartners` / `Bromley Capital` / `Bromley Partners` -> "Bromley Capital Partners"
- `astragloballimited` / `Astra Global Limited` / `Astra Global` -> "Astral Global Limited"
- `aeon` / `Aeon` -> "AEON INC"
- `brightviews` / `Bright Views` -> "Bright Views Holdings"
- `robertcvogtiv` / `Robert C. VOGT IV` -> "Robert VOGT IV"
- `georgeschen` / `Georges CHEN` -> "George Guoying CHEN"
- `Old City Capital` -> "Old City Securities LLC"
- `Lafferty+Visual Sectors` / `Lafferty + Visual Sectors` -> "Visual Sectors"
- `Dimensional Advisors + Lafferty` -> "Dimensional Advisors"

### G3. Specific Commission Expectations (lines 109-173)
8 pinpoint assertions (see section A13).

### G4. Warnings-Only Introducers (lines 198-200)
- "Bright Views Holdings" -- commissions present in DB are reported as warnings, not failures.

### G5. Combined Introducer Name Policy (line 289)
Set to `"ignore"` -- combined names are neither failures nor warnings.

---

## H) Vehicle-Specific Overrides

### H1. Dashboard Vehicle Aliases (lines 30-33)
- `VCS001` -> `VC203`
- `VCS002` -> `VC203`

These map sub-series codes to their parent vehicle.

### H2. Commission Column Shifts for VC203 (lines 218-231, 239-243, 258-271)
VC203 has commission columns shifted by 1 position relative to default:
- Default: name_cols [43, 53], invested [45, 55], spread [51, 61]
- VC203: name_cols [44, 54], invested [46, 56], spread [52, 62]

### H3. Forbidden Broker by Vehicle (lines 94-98)
- VC215: Bromley Capital Partners is forbidden as an introducer.

### H4. Commission Totals Excluded Vehicles (lines 279-282)
- VCL001, VCL002 are excluded from all commission checks.

### H5. Ruled Diffs per Vehicle (section G1)
VC203, VC207, VC209, VC215 each have specific expected commission deltas.

### H6. Set Cap VC215 Spread-Only Check (lines 193-197)
Set Cap in VC215 must have zero invested_amount commissions (spread-only partner).

### H7. Forbidden Commission Pairs (section F11)
Vehicle-specific forbidden pairs for VC215, VC203, VC207, VC209.

---

## I) Gaps and Blind Spots

### I1. No Currency Validation
The engine does not validate currencies at all. If a subscription or commission is recorded in the wrong currency, it will not be detected. There is no currency field in `DashRow` or `DbSub`.

### I2. No NAV / Cost Basis Cross-Check
Position `cost_basis` is fetched from the DB (line 775) but is never compared to anything. The `cost_basis` field from positions is entirely unused in the audit logic.

### I3. No Deal-Level Checks
Deals are loaded (line 776) solely to resolve `deal_id -> vehicle` mapping. No checks are performed on deal metadata (name, status, dates, etc.).

### I4. Introducer ID Resolution Asymmetry
Dashboard commissions use name-based keys; DB commissions also resolve to name-based keys via `intro_id_to_name` (line 937). But `intro_id_to_name` is built only from the `introducers` table. If a commission references an `introducer_id` that does not exist in the `introducers` table, the name resolves to empty string, and the commission is effectively unmatched. This is not explicitly checked.

### I5. No Rate Validation for invested_amount/spread Basis Types
For `invested_amount` and `spread` basis types, rate_bps is collected (lines 1341-1342, 1356-1357) but only checked if both sides have non-zero rates AND the amounts also match (lines 1496-1517). If amounts match but rates differ, it IS caught. However, if a commission has an amount match but one side has no rate at all, the rate check at lines 1497-1510 requires at least one side to have rates (`if dash_rates or db_rates`). If both sides have empty rate sets, it passes silently.

### I6. Hardcoded Performance Fee Rate Column Offsets
Performance fee percentages are extracted at fixed offsets from the invested_amount column (lines 678-690). If the dashboard layout changes, these will silently read wrong columns. No header validation is performed for these offset columns (only the primary invested_amount and spread columns get header checks, lines 480-502).

### I7. No Temporal Checks
There is no validation of:
- Whether contract dates fall within reasonable ranges
- Whether commission accrual dates are consistent with subscription dates
- Whether position creation dates are consistent

### I8. Carried Introducer Name Risk
The `carried_intro_name_by_col` mechanism (lines 604-610) persists an introducer name across all rows until a new non-empty value is found. If the dashboard has an introducer block followed by rows belonging to a different introducer whose name cell is blank (not just merged), commissions will be attributed to the wrong introducer with no error.

### I9. VCL001/VCL002 Have No Dashboard Sheets
These two vehicles are in `scope_vehicle_codes` but have no corresponding entry in `scope_dashboard_sheets`. This means:
- No dashboard data is ever loaded for them.
- DB subscriptions for VCL001/VCL002 will appear as `row_unmatched_db` failures in the row-level check (lines 1119-1124).
- Commission checks are also skipped (section E4).
Wait -- actually they would be in `db_groups` but have no `dash_groups` entries, so they WOULD be reported as unmatched DB rows. Unless there are no DB subscriptions for these vehicles. The latest run shows 105 active dash rows and 105 DB subscriptions, suggesting they balance. This implies VCL001/VCL002 have no subscriptions in the DB either, or that the vehicle totals check passes at zero. This is a potential blind spot -- if subscriptions were added to VCL001/VCL002, the row-level check would catch them, but commission checks would not.

### I10. No Subscription De-duplication Warning
`sub_key_counts` (lines 833, 875-876) is computed but never used. The Counter of `(vehicle, commitment, shares, contract_date)` is built but never checked for duplicates. This appears to be dead code -- a planned check that was never wired up.

### I11. `dashboard_vehicle_alias_by_sheet` Not Configured
The code supports `dashboard_vehicle_alias_by_sheet` (line 343, used at line 509) but the rules file does not define this key. This means the `alias_by_sheet` dict is always empty, and the code falls through to `alias_map.get(raw_v, raw_v)`. Not a bug, but if a sheet ever needs per-sheet vehicle aliasing, it would need to be added to the rules.

### I12. `dashboard_ownership_fallback_to_shares_if_missing` Not Configured
The code supports this option (line 344) but it is not present in the rules JSON. Defaults to `False`. If any vehicle has dashboard sheets without an "OWNERSHIP POSITION" column, the audit would fail at the `required` columns check rather than falling back.

### I13. No Reconciliation of Introduction Rows to Commission Rows
The engine checks that commissions point to valid introductions (FK check), but does not check the reverse: whether every introduction has at least one commission. Orphaned introduction rows (introducer assigned but no commission generated) are invisible.

### I14. Contacts File Red Row Detection is Fragile
Red row detection (lines 1701-1708) checks only `fgColor.rgb` ending with "FF0000". If the dashboard uses a slightly different shade of red, conditional formatting, or theme colors, the row would be treated as non-red and checked against the DB, potentially generating false positives.

---

## J) Cross-Reference: VC2_RULES_COVERAGE_2026-02-11.md vs Implementation

### J1. Documented as Enforced -- CONFIRMED IN CODE

| Documented Rule | Implementation Location |
|----------------|------------------------|
| Dashboard vs DB vehicle totals: count, commitment, shares, ownership, spread_fee, sub_fee, bd_fee, finra_fee | Lines 1017-1045 -- CONFIRMED. Actually checks 19 metrics (more than documented). |
| Row-key parity by (vehicle, commitment, shares, contract_date) | Lines 1065-1110 -- CONFIRMED. Uses `(vehicle, investor_key, commitment, shares)` as key, then date matching within groups. |
| Row-level numeric parity (spread/sub/bd/finra/ownership) | Lines 1126-1161 -- CONFIRMED. Checks 16 fields (more than documented). |
| Zero-ownership rows not loaded as subscriptions | Lines 1163-1185 -- CONFIRMED. |
| Subscription status must be `funded` | Lines 1188-1191 -- CONFIRMED. |
| `funded_amount == commitment` | Lines 1192-1199 -- CONFIRMED. |
| Positions: no zero-unit rows | Lines 1202-1204 -- CONFIRMED. |
| Positions: unique per (investor, vehicle) | Lines 1205-1209 -- CONFIRMED. |
| Position units total = dashboard ownership total per vehicle | Lines 1210-1214 -- CONFIRMED. |
| No exact duplicate commission rows | Lines 1216-1236 -- CONFIRMED. |
| Every commission points to existing introduction | Lines 1519-1526 -- CONFIRMED. |
| Brokers table expected names exist | Lines 1545-1550 -- CONFIRMED. |
| Forbidden broker-like names in introducer commissions | Lines 1573-1602 -- CONFIRMED. |
| Forbidden pairs by vehicle | Lines 1604-1614 -- CONFIRMED. |
| VC203 EVERLASTING splits (Sakal 5000@50bps, Astral 10000@100bps) | `specific_commission_expectations` entries 0-1, checked at lines 1636-1663. CONFIRMED. |
| VC206 REDPOINT OMEGA V splits (Visual Sectors 82000@111bps, Astral 90000@122bps) | Entries 2-3. CONFIRMED. |
| VC209 PVPL (Visual Sectors 10000@10bps) | Entry 4. CONFIRMED. |
| Bromley retained: VC202 SPLENDID HEIGHT 80000@80bps | Entry 5. CONFIRMED. |
| Bromley retained: VC206 KIWI 30000@150bps | Entry 6. CONFIRMED. |
| Bromley retained: VC209 SINO SUISSE 18849.42@196bps | Entry 7. CONFIRMED. |
| VC215 Set Cap: invested_amount must be zero | Lines 1665-1682. CONFIRMED. |
| Contacts: non-red rows only | Lines 1700-1709. CONFIRMED. |
| Contacts: broker rows must exist in brokers | Lines 1723-1731. CONFIRMED. |
| Contacts: intro names must exist in introducers or brokers | Lines 1714-1722. CONFIRMED. |

### J2. Implemented but NOT Documented in Coverage Doc

| Undocumented Check | Location |
|-------------------|----------|
| `subscription_deal_id_required` | Lines 1048-1050 |
| `subscription_deal_vehicle_consistency` | Lines 1052-1058 |
| `investor_identity_duplicate_check` | Lines 1060-1063 |
| `max_introducers_per_subscription` (limit: 2) | Lines 1528-1542 |
| `forbidden_in_introducers_master` (Lafferty in introducers table) | Lines 1558-1564 |
| `forbidden_in_introductions_global` (Lafferty in introductions) | Lines 1566-1571 |
| Commission row-level rate_bps parity | Lines 1384-1448, 1496-1517 |
| Commission combined amount mismatch (investor-basis totals) | Lines 1365-1382 |
| `specific_commission_expectations` as row-level override | Lines 1290-1306, 1402-1424 |
| `warnings_only_introducers` (Bright Views) | Lines 1287, 1470-1476 |
| Dashboard commission header drift warnings | Lines 480-502 |
| Commission amounts without introducer name warnings | Lines 611-621 |
| `dashboard_ownership_fallback_to_shares_if_missing` support | Lines 344, 426-427, 532-533 |
| `dashboard_optional_numeric_fields` support | Lines 345, 428-429 |
| `dashboard_dynamic_commission_slots` support | Lines 358, 450-465 |

The coverage document understates the actual scope of the engine. The implementation contains 15+ checks beyond what the documentation mentions.

### J3. Documented Rules All Implemented?
**YES.** Every rule listed in the coverage document has a corresponding implementation in the Python code. There are no documented rules that are missing from the code.

---

## Summary of Risk Assessment

| Risk | Severity | Notes |
|------|----------|-------|
| Combined introducer names silently ignored | MEDIUM | Policy is `"ignore"` -- 16 combined names in latest run get no validation of per-introducer splits |
| VCL001/VCL002 commission blind spot | LOW | No dashboard sheets; commissions fully excluded |
| No currency validation | MEDIUM | Could mask cross-currency data entry errors |
| Hardcoded perf fee rate column offsets | MEDIUM | Fragile; no header validation for these columns |
| `sub_key_counts` dead code | LOW | Subscription duplicate detection computed but never checked |
| Carried introducer name could misattribute | LOW-MEDIUM | Standard for merged-cell dashboards but inherently risky |
| No introduction-to-commission reverse FK | LOW | Orphaned introductions invisible |
| `to_float` silently defaults corrupt data to 0.0 | MEDIUM | Garbage-in-zero-out; could mask data quality issues |
| Position `cost_basis` never audited | LOW | Fetched but unused |
| Red row detection depends on exact color code | LOW | Different red shades or theme colors would bypass filter |

---

*End of audit findings.*
