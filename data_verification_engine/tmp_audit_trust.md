# Independent Audit: Trust Pack, Orchestrator & Gate Script

**Auditor**: Claude Opus 4.6 (read-only audit agent)
**Date**: 2026-02-14
**Scope**: Four files comprising the trust/verification pipeline

| File | Path |
|------|------|
| Trust pack validator | `data_verification_engine/run_trust_pack.py` (314 lines) |
| Trust policy | `data_verification_engine/trust_pack/trust_policy.json` (35 lines) |
| Global orchestrator | `data_verification_engine/run_all_scopes.py` (201 lines) |
| Gate script | `data_verification_engine/verify_all_scopes.sh` (8 lines) |

---

## A) Trust Policy -- Warning Allow-List Categories

**File**: `trust_pack/trust_policy.json`, lines 3-21

The policy defines `allowed_warning_checks_by_scope` for three scopes (`vc1`, `vc2`, `in`). The full inventory:

| Scope | Allowed Warning Check | Line |
|-------|----------------------|------|
| `vc1` | `commission_totals_ruled_diff_spread` | 6 |
| `vc2` | `dashboard_combined_introducer_name` | 8 |
| `vc2` | `commission_combined_ruled_removed` | 9 |
| `vc2` | `commission_totals_ruled_diff_invested_amount` | 10 |
| `vc2` | `commission_row_ruled_dashboard_override` | 11 |
| `vc2` | `commission_row_ruled_removed` | 12 |
| `vc2` | `introducer_warning_only_present` | 13 |
| `in` | `dashboard_combined_introducer_name` | 16 |
| `in` | `commission_totals_ruled_diff_invested_amount` | 17 |
| `in` | `commission_totals_ruled_diff_spread` | 18 |
| `in` | `commission_row_ruled_dashboard_override` | 19 |

### Suspicious Items

1. **`commission_row_ruled_removed` (vc2, line 12)**: This allows warnings for commission rows that have been "ruled removed" -- i.e., commissions that exist in one source but have been suppressed by a rule rather than flagged as a failure. This is potentially dangerous: if a legitimate commission goes missing, the rule-based removal would mask it as an allowed warning rather than surfacing it as a failure. The latest vc2 run shows 11 instances of this warning (`run_20260211_212053/audit_report.json`, line 34). That is a significant count to be silently allow-listed.

2. **`commission_combined_ruled_removed` (vc2, line 9)**: Similar concern at the totals level. If aggregate commission amounts are being "ruled removed," this could mask systematic data loss.

3. **`commission_row_ruled_dashboard_override` (vc2 line 11, in line 19)**: Allows cases where the dashboard value overrides DB value by rule. If the dashboard is wrong, this allows the error to pass silently.

4. **`introducer_warning_only_present` (vc2, line 13)**: This appears to allow a check that fires when an introducer exists only as a warning-level record. The name itself is ambiguous -- it could mean "this introducer has only warning-level issues" or "this introducer is only present in warning records." Either way, it is allow-listed, meaning a partially-missing introducer relationship would not cause a gate failure.

5. **CRITICAL GAP**: The `vc1` scope has only ONE allowed warning (`commission_totals_ruled_diff_spread`). But the latest vc1 audit run (`run_20260212_000446/audit_report.json`, lines 46-51) shows four distinct warning check types: `dashboard_commission_header_check` (10), `dashboard_combined_introducer_name` (3), `row_fallback_match_amounts_date` (1), `row_fallback_match_loose_name_amounts` (1). Three of these are NOT in the vc1 allow-list, which means the trust pack would correctly flag them as `unexpected_warning_check` findings and FAIL the gate. This is either (a) correct behavior indicating vc1 has unresolved issues, or (b) the policy is stale and needs updating after vc1 rules were revised. Either way, vc1 cannot currently pass the trust gate.

---

## B) Forbidden Patterns

**File**: `trust_pack/trust_policy.json`, lines 22-33
**Enforcement**: `run_trust_pack.py`, lines 240-251

The forbidden check substrings are:

| Pattern | Line | Purpose |
|---------|------|---------|
| `fallback` | 23 | Catches fallback matching (loose/fuzzy matches) |
| `unresolved` | 24 | Catches unresolved references |
| `missing_in_db` | 25 | Catches records in dashboard but not in DB |
| `missing_in_dashboard` | 26 | Catches records in DB but not in dashboard |
| `row_count_mismatch` | 27 | Catches row count discrepancies |
| `numeric_mismatch` | 28 | Catches numeric field discrepancies |
| `vehicle_totals_mismatch` | 29 | Catches vehicle-level total discrepancies |
| `duplicate` | 30 | Catches duplicate records |
| `zero_ownership_loaded` | 31 | Catches zero-ownership positions that were loaded |
| `max_introducers_per_subscription_exceeded` | 32 | Catches introducer count violations |

### Enforcement Logic (lines 240-251)

```python
for row in rows:
    check = str(row.get("check") or "").lower()
    for bad in forbidden_substrings:
        if bad in check:
            findings.append(...)
            break
```

The matching is **substring-based** and **case-insensitive** (line 241 lowercases the check, line 159 lowercases the patterns). This is good -- it catches variants like `commission_row_missing_in_db` because it contains `missing_in_db`.

### Issues with Forbidden Patterns

1. **Forbidden patterns apply to ALL severity levels, including warnings**: The loop at line 240 iterates over ALL `rows` (both fail and warn). This means if a warning-level issue has a check name containing a forbidden substring, it gets flagged. However, the `allowed_warning_checks_by_scope` at lines 229-238 ONLY catches unexpected warning check names -- it does NOT exempt allowed warnings from the forbidden pattern scan. This creates a CONTRADICTION: `commission_row_ruled_dashboard_override` is in the vc2/in allow-list (policy lines 11, 19), but if any warning row happened to contain a forbidden substring, it would still be caught. Currently no allowed warning names contain forbidden substrings, so this is not an active problem, but it is a latent design inconsistency.

2. **Missing forbidden patterns**: The following patterns could be considered missing:
   - `orphan` -- orphaned records (no parent relationship)
   - `stale` -- stale/outdated data
   - `negative` -- negative amounts that should not exist
   - `currency_mismatch` -- given the project has multi-currency data (per the reconciliation files in the repo)
   - `schema_mismatch` -- structural data issues
   - `null` or `empty` -- null/empty required fields

3. **The `fallback` pattern is interesting**: The latest vc1 run has warnings `row_fallback_match_amounts_date` and `row_fallback_match_loose_name_amounts` (lines 49-50 of vc1 audit report). These contain the substring `fallback`. Because these are CSV rows, the forbidden pattern check at line 241-250 WOULD fire on them, generating a `forbidden_check_pattern` finding. This means vc1 would fail on TWO separate grounds: (a) unexpected warning checks, and (b) forbidden patterns in warning rows. This is correct defensive behavior.

---

## C) Consistency Checks -- CSV vs JSON Counts

**File**: `run_trust_pack.py`, lines 165-218

The trust pack performs four distinct cross-validation checks between the JSON summary and the CSV issue rows:

### Check 1: Total fail count (lines 174-183)
Compares `summary.fail_count` (from JSON) against the count of rows with `severity=fail` in the CSV. Any mismatch produces `summary_fail_count_mismatch`.

### Check 2: Total warn count (lines 184-191)
Compares `summary.warning_count` (from JSON) against the count of rows with `severity=warn` in the CSV. Any mismatch produces `summary_warn_count_mismatch`.

### Check 3: Fail breakdown by check (lines 193-210)
Compares `summary.fail_by_check` (a dict of check_name -> count from JSON) against the same breakdown computed from CSV rows. Any mismatch produces `fail_by_check_mismatch`.

### Check 4: Warn breakdown by check (lines 211-218)
Same as above for warnings. Produces `warn_by_check_mismatch`.

### Assessment

This is a SOLID implementation. The trust pack independently re-reads and re-counts the CSV file (`read_issues_csv`, lines 55-73) rather than trusting the JSON summary. The CSV schema is validated (lines 63-66) to ensure required columns exist. The `Counter` comparison at lines 203 and 211 is exact -- it checks both the keys and the values.

**One minor gap**: The CSV is read with `csv.DictReader` (line 62), which trusts the file's structure. If a scope script produced a malformed CSV (e.g., unbalanced quotes, embedded newlines in non-quoted fields), the DictReader could silently merge or skip rows. The trust pack does not independently verify the raw line count of the CSV against the DictReader row count. However, this is a minor concern given the structured output from the audit scripts.

**Another gap**: The trust pack does NOT verify that every failure/warning in the JSON `failures` and `warnings` arrays is also present in the CSV. It only checks aggregate counts. A scope script could theoretically list different individual issues in JSON vs CSV while keeping the same counts, and the trust pack would not catch this.

---

## D) Active Row Count Matching -- DB Subscriptions vs Dashboard Rows

**File**: `trust_pack/trust_policy.json`, line 34: `"require_dashboard_rows_equal_db_subscriptions": true`
**Enforcement**: `run_trust_pack.py`, lines 253-264

```python
if require_rows_equal:
    dash_rows = summary.get("dashboard_active_rows")
    db_subs = summary.get("db_subscriptions")
    if isinstance(dash_rows, (int, float)) and isinstance(db_subs, (int, float)):
        if int(dash_rows) != int(db_subs):
            findings.append(...)
```

### Assessment

1. **The check is ENABLED** (`require_dashboard_rows_equal_db_subscriptions: true`).

2. **It reads from the scope's own summary** (line 169: `summary = report.get("summary", {})`), meaning it trusts the scope script to report these counts. The trust pack does NOT independently query the database or read the dashboard file. This is a trust-the-scope design -- the trust pack validates consistency of the scope's own outputs but does not independently source-verify.

3. **Type guard issue (line 256)**: The check `isinstance(dash_rows, (int, float))` means if a scope script omits `dashboard_active_rows` or sets it to `null`/`None`, the check silently skips. There is no finding generated for a MISSING count. This is a **significant blind spot**: a scope script could avoid this check entirely by simply not including `dashboard_active_rows` or `db_subscriptions` in its summary.

4. **Actual data shows mismatches in vc1**: The latest vc1 report (lines 19-21) shows `dashboard_active_rows: 422` vs `db_subscriptions: 426` -- a delta of 4. This would generate a `dashboard_vs_subscriptions_count_mismatch` finding, contributing to vc1's FAIL status.

5. **vc2 and in pass this check**: vc2 shows `dashboard_active_rows: 105` vs `db_subscriptions: 105` (match). `in` shows `dashboard_active_rows: 26` vs `db_subscriptions: 26` (match).

6. **int() truncation (line 257)**: Using `int()` on float values could mask small fractional differences. If a scope script reported `dashboard_active_rows: 100.5`, it would be truncated to `100`. This is unlikely but technically possible.

---

## E) Gate Script -- Does It Correctly Fail on Trust Issues?

**File**: `verify_all_scopes.sh` (8 lines)

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

python3 "$ROOT_DIR/run_trust_pack.py"

echo "Trust pack passed for all configured scopes (vc1, vc2, in)."
```

### Assessment

1. **`set -euo pipefail` (line 2)**: This is correct. `-e` causes the script to exit immediately if any command fails. `-u` treats unset variables as errors. `-o pipefail` causes a pipeline to fail if any command in it fails.

2. **Exit code propagation**: `run_trust_pack.py` returns exit code 1 if `status != "PASS"` (line 309: `return 0 if status == "PASS" else 1`). Because of `set -e`, if `run_trust_pack.py` exits with code 1, the shell script will exit immediately at line 6 and the "Trust pack passed" message on line 8 will NOT be printed. This is correct behavior.

3. **HOWEVER**: The gate script calls `run_trust_pack.py` WITHOUT the `--no-run-global` flag, which means it will invoke `run_all_scopes.py` as a subprocess (line 155 of run_trust_pack.py). The `run_all_scopes.py` script (line 195-197) only returns non-zero if `--strict` is passed AND there are failures. But `run_trust_pack.py` calls it WITHOUT `--strict` (line 31: the command is just `[sys.executable, str(global_runner), "--global-outdir", str(global_outdir)]`). This means the global runner will ALWAYS exit 0 regardless of scope failures, and the trust pack will then independently evaluate the results. This is actually fine -- the trust pack does its own analysis -- but it means the global runner's own failure detection (via `--strict`) is never exercised in the gate pipeline.

4. **The echo on line 8 is misleading**: It says "Trust pack passed for all configured scopes (vc1, vc2, in)." but it hardcodes the scope names. If a fourth scope were added to `run_all_scopes.py`'s `SCOPES` list but not mentioned here, the message would be inaccurate. This is a cosmetic issue, not a functional one.

5. **No arguments forwarded**: The gate script does not forward any arguments to `run_trust_pack.py`. This means it always uses the default policy, default output directories, and always runs a fresh global audit. This is a rigid but safe design -- no caller can override the policy path or skip checks.

---

## F) Warning Categorization -- Could Warnings Hide Real Failures?

### The Allow-List Mechanism (lines 229-238 of run_trust_pack.py)

```python
allowed_warn = set(str(x) for x in allowed_warn_by_scope.get(scope_name, []))
for check, count in sorted(csv_warn_by.items()):
    if check not in allowed_warn:
        findings.append(...)
```

### Risks

1. **The allow-list is name-based, not count-bounded**: If `commission_row_ruled_removed` is allowed for vc2, it is allowed whether there are 1 or 11,000 instances. There is no threshold mechanism. A gradually worsening data quality issue could produce thousands of "allowed" warnings without triggering a failure. **Recommendation**: Add per-check warning count thresholds to the policy.

2. **Warning checks are determined by the scope script**: The trust pack trusts whatever `check` string the scope script writes into the CSV. If a scope script were modified to reclassify a failure as a warning with an allowed check name, it would bypass the gate. For example, if a scope script changed `severity=fail, check=commission_row_missing_in_db` to `severity=warn, check=commission_row_ruled_removed`, the trust pack would see it as an allowed warning rather than a forbidden failure. The trust pack has no independent knowledge of what SHOULD be a failure vs. a warning.

3. **The `commission_row_ruled_dashboard_override` pattern is inherently risky**: It means "the dashboard value wins over the DB value by rule." If the dashboard data is incorrect, this systematically propagates dashboard errors into the verified state without any failure signal.

4. **`dashboard_combined_introducer_name` (allowed in vc2 and in)**: This fires when an introducer name in the dashboard contains combined/multiple names (e.g., "Altras+Andrew"). These are allow-listed, but they could mask cases where the wrong introducer was credited.

5. **No `info` severity level**: The system only has `fail` and `warn`. There is no `info` tier for known/accepted discrepancies that have been fully investigated. Everything that is not a failure must be a warning, and warnings can only be silenced by the allow-list. A three-tier system (fail/warn/info) would allow acknowledged items to be tracked without needing allow-list entries.

---

## G) Bypass Vectors -- Backdoors, Env Vars, Arguments

### Direct bypass via arguments

1. **`--no-run-global` flag** (`run_trust_pack.py`, line 145-148): This flag causes the trust pack to use the latest existing global report instead of running a fresh audit. An operator could run the audit once (producing a clean report), then repeatedly invoke the gate with `--no-run-global` to validate against stale, clean data while the actual database has degraded. **However**, the gate script (`verify_all_scopes.sh`) does NOT pass this flag, so this bypass is only available to manual invocations, not to the automated gate.

2. **`--policy` flag** (`run_trust_pack.py`, line 125): Allows specifying an alternative policy file. A malicious or careless operator could point to a policy with an empty forbidden list and all warnings allowed. **Again**, the gate script does not forward arguments, so this is manual-only.

3. **`--global-outdir` and `--trust-outdir` flags**: Could point to pre-prepared output directories with clean data. Manual-only.

4. **`--strict` flag** (`run_all_scopes.py`, line 157-159): This is the global runner's own strictness flag. It is NOT passed by `run_trust_pack.py` when it invokes the global runner (line 31). So the global runner always returns 0. This is not a bypass per se, but it means the global runner's own failure detection is inert in the pipeline.

### Indirect bypass via scope scripts

5. **Scope scripts are not integrity-checked**: The trust pack runs scope scripts as subprocesses (via `run_all_scopes.py`). It does not verify the hash or integrity of the scope scripts, their rules files, or their data sources. A modified scope script that suppresses failures would pass the trust gate.

6. **No policy file integrity check**: The trust policy JSON is loaded from disk without any hash verification or signature check. Modifying the policy file to allow more warnings or remove forbidden patterns would directly weaken the gate.

### Env var bypass

7. **No env var overrides found**: Neither `run_trust_pack.py` nor `run_all_scopes.py` nor `verify_all_scopes.sh` reads any environment variables that could alter behavior. This is good.

### Timestamp-based directory collision

8. **`exist_ok=False` on output directories** (line 282 of run_trust_pack.py, line 165 of run_all_scopes.py): If two runs happen within the same second, the second will fail with a FileExistsError. This is a crash, not a bypass, but it could be exploited to prevent the gate from running by pre-creating the expected directory name.

---

## H) Gaps and Blind Spots

### 1. No independent data sourcing
The trust pack validates the CONSISTENCY of scope outputs (JSON summary vs CSV rows) but never independently reads the dashboard Excel files or queries the Supabase database. It is a second-order validator: it trusts that scope scripts faithfully reported their findings, and it checks that the reports are internally consistent. A coordinated error in a scope script (reporting wrong counts in both JSON and CSV consistently) would not be detected.

### 2. No schema evolution tracking
The policy has a `version` field (`"2026-02-14.2"`, line 2) but no mechanism to ensure the policy version is compatible with the scope scripts' rules versions. The scope scripts report `rules_version` (e.g., `"2026-02-11.1"`) but the trust pack records `policy_version` without comparing it to the rules versions.

### 3. No handling of missing scopes
`run_all_scopes.py` hardcodes three scopes (lines 16-35). If a scope script file is missing or fails to execute, the error is caught as a `RuntimeError` at line 79, which crashes the entire global runner. The trust pack would then fail at line 38 of `run_trust_pack.py`. This is fail-safe but does not distinguish between "scope failed" and "scope is missing/corrupted."

### 4. CSV row content is not validated against JSON arrays
As noted in section C, the trust pack checks aggregate counts but does not verify that the SAME issues appear in both the JSON `failures`/`warnings` arrays and the CSV. A scope script could list different issues in each while keeping counts aligned.

### 5. No check for EXTRA columns in CSV
Line 65 of `run_trust_pack.py` checks for MISSING columns (`expected - actual`) but does not flag extra unexpected columns. An extra column would not cause a failure, but it could indicate schema drift in scope scripts.

### 6. No timestamp freshness check
When `--no-run-global` is used, the trust pack picks the latest report by path sort (`latest_global_report`, lines 48-52). It does not check whether the report is stale (e.g., hours or days old). An old report could be stale relative to recent data changes.

### 7. The `vc1` scope cannot currently pass the trust gate
Based on the latest vc1 audit data (`run_20260212_000446`), vc1 has:
- 388 failures (line 27 of its audit_report.json) -- generates `scope_has_failures`
- 4 warning checks, only 1 of which is allow-listed -- generates 3 `unexpected_warning_check` findings
- 2 warning rows containing forbidden substring `fallback` -- generates `forbidden_check_pattern` findings
- `dashboard_active_rows` (422) != `db_subscriptions` (426) -- generates `dashboard_vs_subscriptions_count_mismatch`

This means the trust gate CANNOT currently pass for vc1. The gate script would exit with code 1 and never print the "passed" message.

### 8. No distinction between "policy violation" and "data quality issue" in findings
All findings are flat dicts with `scope`, `code`, and `message`. There is no severity on findings themselves. A `summary_fail_count_mismatch` (indicating a corrupt scope output) is treated the same as `scope_has_failures` (indicating legitimate data quality issues). A pipeline consumer cannot distinguish "the audit engine itself is broken" from "the data has known issues."

### 9. `run_all_scopes.py` does not pass `--strict` and defaults to exit 0
At line 195-197, the global runner only returns 1 if `--strict` is passed. Without it, even with hundreds of failures across all scopes, the global runner exits 0. This is intentional (the trust pack does its own analysis), but it means the global runner alone is not a gate -- it is purely an aggregator. If anyone runs `run_all_scopes.py` directly (instead of through the trust pipeline), they get exit 0 even with massive failures unless they remember to pass `--strict`.

### 10. No logging or audit trail of WHO ran the gate
The trust pack records `generated_at_utc` but not the user, machine, or invocation context. For audit purposes, it would be valuable to log the hostname, username, git commit hash of the engine, and the full command-line arguments.

---

## Summary Verdict

| Area | Rating | Notes |
|------|--------|-------|
| CSV vs JSON consistency | STRONG | Four independent cross-checks (total counts + breakdowns) |
| Forbidden pattern enforcement | STRONG | Substring-based, case-insensitive, covers major categories |
| Warning allow-list | MODERATE | Name-based with no count thresholds; some risky entries |
| DB vs dashboard row count | MODERATE | Enabled but silently skips if fields are missing |
| Gate script fail behavior | STRONG | `set -euo pipefail` + proper exit code propagation |
| Bypass resistance | MODERATE | Safe when run through gate script; manual invocation has override vectors |
| Independent verification | WEAK | No independent data sourcing; trusts scope script outputs |
| Audit trail | WEAK | No user/machine/git context recorded |

The trust pack is a well-structured second-order validator that effectively catches internal inconsistencies in scope outputs and enforces a configurable policy. Its primary weakness is that it operates entirely within the "trust boundary" of the scope scripts -- it does not independently verify any claim against raw source data. For a production audit gate, consider adding (1) warning count thresholds, (2) a mandatory `dashboard_active_rows`/`db_subscriptions` field presence check, and (3) policy file integrity verification.
