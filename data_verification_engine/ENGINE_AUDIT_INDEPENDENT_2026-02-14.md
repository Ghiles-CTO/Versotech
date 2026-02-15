# Independent Engine Audit Report

**Date**: 2026-02-14
**Auditor**: Claude Opus 4.6 (automated independent audit)
**Mode**: READ-ONLY — no DB writes, no data fixes
**Engine version**: VC1 rules `2026-02-14.3`, VC2 rules `2026-02-14.2`, IN rules `2026-02-14.2`
**Trust policy version**: `2026-02-14.2`

---

## A) Executive Verdict

**CONDITIONAL PASS**

The engine is substantially complete and currently passes the trust gate with zero failures across all three scopes (VC1=0F/3W, VC2=0F/30W, IN=0F/7W). The trust pack enforces 10 forbidden patterns, cross-validates JSON/CSV consistency, and requires dashboard row counts to match DB subscription counts.

However, the audit still identifies material gaps that prevent a clean "complete to the T" verdict. The most significant are:

1. **VC1 does NOT validate performance_fee commission rows** at the row level — only `invested_amount` and `spread` are in `commission_match_basis_types`
2. **Combined introducer policy is "ignore"** in VC2 and IN — combined-name commission rows bypass per-introducer split validation
3. **`to_float()` silently converts errors to 0.0** — dashboard error values like `#VALUE!` become zero without any warning
4. **No computed-field cross-checks** — `bd_fee_amount = commitment * bd_fee_percent` and `spread_fee_amount = spread_per_share * num_shares` are not verified

**Confidence**: 87% — based on line-by-line static analysis of 5,851 lines of Python across 3 engine files, 3 rules JSON files, and 62 documented historical rules from 4 source directories.

### Post-Remediation Update (2026-02-14)

- Implemented in engine/rules:
  - Commission status validation (`commission_status_must_be_paid`)
  - Dashboard-vs-DB currency validation when dashboard currency is present (`currency_must_match_dashboard_when_present`)
- Coverage matrix now reflects these as implemented.
- Strikethrough-source rule remains intentionally out of scope as requested.
- Latest strict run no longer passes because it correctly flags real data status issues in VC2:
  - `commission_status_invalid`: 9 rows (`status=accrued`)

---

## B) Missed / Partial / Conflicting Rules

### B1. MISSING Rules (not implemented in any engine)

| # | Rule | Source | Impact |
|---|------|--------|--------|
| 1 | Strikethrough rows in source commission file should be absent from DB | historical process docs | LOW — intentionally left out of engine scope (manual source-format rule) |

### B2. PARTIAL Rules

| # | Rule | Implemented | Gap | Impact |
|---|------|------------|-----|--------|
| 1 | Performance fee commission validation (VC1) | IN/VC2 validate `performance_fee_tier1`/`tier2` | VC1 `commission_match_basis_types` only has `invested_amount` + `spread` — **zero row-level perf fee validation** | HIGH — 8 perf fee rows were just inserted for IN; VC1 has an unknown count of perf fee rows that are never checked |
| 2 | Combined introducer split validation | VC1 policy=`fail` (correct), VC2 policy=`ignore`, IN policy=`ignore` | VC2 has 16+ combined-name dashboard entries that bypass per-introducer validation | MEDIUM — 9 `commission_combined_ruled_removed` warnings in VC2 represent unvalidated splits |
| 3 | `base_amount` validation on commissions | Used only in duplicate detection key | Never compared to `funded_amount` or subscription `commitment`; CLAUDE.md rule 3 says "Commission basis is always funded_amount" | LOW |
| 4 | Stale zero-amount commission rows | Excluded from row-count parity (correct) | Not explicitly flagged as warnings — they exist silently in DB | LOW — 66 stale rows in VC106 |
| 5 | Position `cost_basis` validation | Fetched from DB (VC2 line 775, VC1 similar) | Never compared to any value — completely unused | LOW |

### B3. CONFLICTING Rules

| # | Rule | Conflict | Resolution |
|---|------|----------|------------|
| 1 | VC1 `combined_introducer_name_policy` = `fail` vs VC2/IN = `ignore` | Same engine codebase, different policy — VC1 is stricter | Not a code conflict; policy is per-scope. However, VC2 with 16+ combined entries at `ignore` is suspiciously permissive. |
| 2 | IN102 ruled diff = -74881.5498 vs IN2 empty commission slots | The ruled diff masks the fact that IN2 has no commission extraction at all (empty slot config) | By design: IN102 has no introducer commissions in DB; dashboard fee columns belong to VERSO CAPITAL/MANAGEMENT. However, the engine cannot verify this — it just accepts the delta. |

---

## C) Engine Blind Spots (Silent Skip Risks)

### C1. Critical Blind Spots

| # | Blind Spot | Scope | Risk | Source |
|---|-----------|-------|------|--------|
| 1 | **VC1 performance_fee commissions unvalidated** | VC1 | Incorrect perf fee amounts/rates would pass | `run_vc1_audit.py` line ~1706: `basis_allow` filters to `["invested_amount","spread"]` only |
| 2 | **`to_float()` garbage-in-zero-out** | All | Dashboard error values (#VALUE!, N/A, corrupt text) silently become 0.0 | All engines: `to_float()` function, lines 28-46 |
| 3 | **Empty investor name → silent row skip** | All | Dashboard rows with blank name columns are invisible to the audit | All engines: `if not investor_name: continue` |
| 4 | **`restrict_to_db_vehicles_with_data` hides missing imports** | All (enabled) | A vehicle with zero DB data is silently excluded from scope | All engines: scope narrowing logic |

### C2. Moderate Blind Spots

| # | Blind Spot | Scope | Risk | Source |
|---|-----------|-------|------|--------|
| 5 | **Combined introducer policy=ignore** | VC2, IN | Per-introducer commission attribution not validated | VC2 rules line 289, IN rules line 317 |
| 6 | **Carried introducer name** | All | If blank cells appear mid-block (not merged cells), commissions attribute to wrong introducer | All engines: `carried_intro_name_by_col` dict |
| 7 | **Performance fee rate column offsets hardcoded** | VC2, IN | Dashboard column reordering would silently read wrong values | VC2: lines 678-690, IN: lines 666-683 |
| 8 | **DB commission basis types outside allowed set silently filtered** | All | Commissions of unlisted basis types (e.g., `management_fee`) are invisible | All engines: basis type filter |
| 9 | **`sub_key_counts` dead code** | VC1, VC2, IN | Subscription duplicate detection computed but never checked | All engines: Counter built but never used |
| 10 | **Commission totals vs row-level basis type mismatch** (VC1 only) | VC1 | Totals sum ALL commissions; row-level only checks invested_amount + spread | `run_vc1_audit.py` lines 1622-1627 vs 1705-1707 |

### C3. Low-Risk Blind Spots

| # | Blind Spot | Scope |
|---|-----------|-------|
| 11 | IN104/IN107 aliased in rules but excluded from scope — no diagnostic | IN |
| 12 | Red-row detection depends on exact RGB FF0000 — theme colors or conditional formatting bypass | VC2 |
| 13 | No temporal validation (date ranges, accrual timing) | All |
| 14 | Position `cost_basis` fetched but never used | VC2 |
| 15 | No commission status validation (all should be `paid`) | All |
| 16 | `canonical_name_key()` strips trailing 's' from words >4 chars — naive depluralization could cause false collisions | All |

---

## D) False-Pass Risks

Cases where the engine may report PASS but actual data has errors:

| # | False-Pass Scenario | Scope | Likelihood | Evidence |
|---|-------------------|-------|------------|----------|
| 1 | **Wrong currency where dashboard currency is missing/blank** — no value to compare, so mismatch may pass | All | LOW | Currency check runs when dashboard currency is present |
| 2 | **VC1 performance fee rate wrong** — DB perf fee commission has 850 bps, should be 1700 bps; engine never checks | VC1 | MEDIUM | `commission_match_basis_types` excludes `performance_fee` |
| 3 | **Combined introducer commission attributed to wrong party** — dashboard shows "A+B" totaling $10K, DB has A=$8K B=$2K when it should be A=$5K B=$5K | VC2, IN | MEDIUM | Policy is `ignore`; only aggregate investor-level amounts are checked |
| 4 | **Dashboard error cell** — `#VALUE!` in a fee column becomes 0.0 in dashboard extraction, DB also has 0.0 → match | All | LOW | `to_float()` regex fallback |
| 5 | **Trust pack warning count threshold** — 30 warnings in VC2 are all allowed; if data quality degrades, 300 would also pass | VC2 | LOW | Trust policy has no per-check count threshold |

---

## E) Exact Remediation List (Code/Rules Only, No DB Changes)

### E1. HIGH Priority

| # | Change | File | Effort |
|---|--------|------|--------|
| 1 | Add `performance_fee_tier1` and `performance_fee_tier2` to VC1 `commission_match_basis_types` | `scopes/vc1/rules_vc1.json` line 189-192 | 1 line |
| 2 | Add `to_float()` error detection — if input contains known error strings (#VALUE!, #REF!, #N/A, ERROR), emit warning instead of returning 0.0 | All 3 engine files, `to_float()` function | ~10 lines per file |

### E2. MEDIUM Priority

| # | Change | File | Effort |
|---|--------|------|--------|
| 3 | Change `combined_introducer_name_policy` from `"ignore"` to `"warn"` in VC2 and IN rules | `rules_vc2.json` line 289, `rules_in.json` line 317 | 2 lines |
| 4 | Add warning count thresholds to trust policy (e.g., max 50 warnings per scope) | `trust_pack/trust_policy.json` | ~5 lines in policy, ~15 in `run_trust_pack.py` |
| 5 | Add empty investor name warning instead of silent skip | All 3 engine files, around `if not investor_name: continue` | ~3 lines per file |
| 6 | Wire up `sub_key_counts` to detect subscription key duplicates | All 3 engine files | ~10 lines per file |
| 7 | Add `require_dashboard_rows_equal_db_subscriptions` field presence check — fail if fields are missing, not skip | `run_trust_pack.py` lines 253-264 | ~5 lines |

### E3. LOW Priority

| # | Change | File | Effort |
|---|--------|------|--------|
| 8 | Add stronger currency normalization/coverage diagnostics for sheets missing currency column | All engines + rules | ~15 lines per engine |
| 9 | Add computed-field cross-checks: `bd_fee = commitment * bd_fee_percent`, `spread_fee = spread_pps * shares` | All engines | ~20 lines per engine |
| 10 | Add commission status distribution summary to report output (beyond fail-only check) | All engines | ~10 lines per engine |
| 11 | Add introduction uniqueness check per `(introducer_id, investor_id, deal_id)` | All engines | ~10 lines per engine |
| 12 | Add reverse FK check: introduction without any commission | All engines | ~10 lines per engine |
| 13 | Fix argparse description in VC1 — says "VC2 deterministic audit" | `run_vc1_audit.py` line 2091 | 1 line (cosmetic) |
| 14 | Add git commit hash and hostname to trust pack report | `run_trust_pack.py` | ~5 lines |

---

## F) Confidence Score

| Dimension | Score | Evidence |
|-----------|------:|---------|
| Engine source code analysis | 95% | All 3 engine files read line-by-line (5,851 total lines). Every check category mapped to line numbers. |
| Rules JSON analysis | 95% | All 3 rules files fully parsed. Every ruled diff, alias, override, and policy documented. |
| Historical rule mining | 80% | 62 rules extracted from 4 source directories. Some directories had 100+ files; focused on .md/.py/.json/.sql files with reconciliation/rule content. Deeply nested or renamed files may have been missed. |
| Trust pack analysis | 95% | All 4 trust pipeline files analyzed. Bypass vectors, allow-list risks, consistency checks mapped. |
| Cross-scope consistency | 90% | All 3 scopes compared for check parity, shared code patterns, and divergent policies. Combined introducer policy divergence documented. |
| **Overall confidence** | **87%** | Weighted average. Primary uncertainty is in historical rule completeness — some rules may exist in .xlsx files or Slack conversations that were not in the audited directories. |

---

## G) Trust Gate Run (Baseline Before Remediation, 2026-02-14)

```
TRUST_STATUS: PASS
FINDINGS_COUNT: 0

| Scope | Fail | Warn | CSV Rows |
|-------|-----:|-----:|--------:|
| vc1   |    0 |    3 |       3 |
| vc2   |    0 |   30 |      30 |
| in    |    0 |    7 |       7 |
```

### Warning Categories (all allow-listed)

| Scope | Warning Check | Count |
|-------|--------------|------:|
| vc1 | `commission_totals_ruled_diff_spread` | 3 |
| vc2 | `commission_totals_ruled_diff_invested_amount` | 4 |
| vc2 | `commission_combined_ruled_removed` | 9 |
| vc2 | `commission_row_ruled_dashboard_override` | 5 |
| vc2 | `commission_row_ruled_removed` | 11 |
| vc2 | `introducer_warning_only_present` | 1 |
| in | `commission_totals_ruled_diff_invested_amount` | 2 |
| in | `commission_totals_ruled_diff_spread` | 1 |
| in | `commission_row_ruled_dashboard_override` | 4 |

### Assessment

- All warning categories are in the trust policy allow-list — no unexpected warnings.
- No forbidden pattern substrings detected in any check name.
- Dashboard active rows = DB subscriptions for all scopes (VC1: 426/426, VC2: 105/105, IN: 26/26).
- CSV row counts match JSON summary counts for all scopes (consistency verified).

### Post-Remediation Strict Run (2026-02-14)

- Result: FAIL
- New failures:
  - `commission_status_invalid` on VC2: 9 rows (`status=accrued`, allowed=`paid`)

### Should Any Warning Be a Failure?

| Warning | Should be fail? | Rationale |
|---------|:-:|-----------|
| `commission_totals_ruled_diff_spread` (vc1) | NO | Rounding deltas <1.0 across multiple rows — verified individually |
| `commission_totals_ruled_diff_invested_amount` (vc2/in) | NO | Known broker exclusions (Lafferty, VERSO CAPITAL) — dashboard aggregates all fee groups, DB only stores introducer commissions |
| `commission_combined_ruled_removed` (vc2) | **REVIEW** | 9 instances where combined introducer amounts are not individually validated. Should be at minimum a warning (currently is), but the underlying split validation gap remains |
| `commission_row_ruled_removed` (vc2) | NO | 11 instances of Lafferty/Bromley rows intentionally removed from DB per broker policy |
| `commission_row_ruled_dashboard_override` (vc2/in) | NO | Specific commission expectations with verified DB amounts override dashboard discrepancies |
| `introducer_warning_only_present` (vc2) | NO | Bright Views Holdings is a known migration artifact (3 rows, $9K) |

---

## H) Appendices

### H1. Files Audited

| File | Lines | Scope |
|------|------:|-------|
| `scopes/vc1/run_vc1_audit.py` | 2,117 | VC1 |
| `scopes/vc1/rules_vc1.json` | 292 | VC1 |
| `scopes/vc2/run_vc2_audit.py` | 1,838 | VC2 |
| `scopes/vc2/rules_vc2.json` | 301 | VC2 |
| `scopes/in/run_in_audit.py` | 1,896 | IN |
| `scopes/in/rules_in.json` | 329 | IN |
| `run_all_scopes.py` | 201 | Orchestrator |
| `run_trust_pack.py` | 314 | Trust |
| `trust_pack/trust_policy.json` | 35 | Trust |
| `verify_all_scopes.sh` | 8 | Gate |

### H2. Source Directories Mined

| Directory | Files examined | Rules extracted |
|-----------|---------------:|---------------:|
| `datafixing/` | ~15 | 18 |
| `datamigration/` | ~8 | 6 |
| `dashboardreconciliations/` | ~20 | 12 |
| `verso_capital_2_data/` | ~12 | 14 |
| `data_verification_engine/DB_CHANGES_*.md` | 3 | 12 |
| **Total** | ~58 | 62 |

### H3. Detailed Scope Findings

Full per-scope findings available in:
- `data_verification_engine/tmp_audit_vc1.md`
- `data_verification_engine/tmp_audit_vc2.md`
- `data_verification_engine/tmp_audit_in.md`
- `data_verification_engine/tmp_audit_trust.md`
- `data_verification_engine/tmp_audit_historical_rules.md`

### H4. Coverage Matrix

See: `data_verification_engine/ENGINE_RULE_COVERAGE_MATRIX_2026-02-14.csv`
