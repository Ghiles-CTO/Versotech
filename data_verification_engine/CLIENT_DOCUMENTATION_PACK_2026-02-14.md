# Client Documentation Pack — Engine, Rules, Changes, Results

Date: 2026-02-14  
Prepared by: Versotech (Codex audit workflow)  
Scope: VC1 + VC2 + IN reconciliation and verification

---

## 1) Executive Summary

Data reconciliation has been completed and validated using a deterministic, rule-based engine.

Final verification status:
- VC1: `0` failures
- VC2: `0` failures
- IN: `0` failures
- Global trust gate: `PASS` (`0` findings)

This package includes:
1. How the verification engine works
2. Full rule framework applied
3. Data edits performed to complete reconciliation
4. Final run outputs and validation status

---

## 2) Verification Engine (What Was Built)

### Engine architecture
- Scope runners:
  - `data_verification_engine/scopes/vc1/run_vc1_audit.py`
  - `data_verification_engine/scopes/vc2/run_vc2_audit.py`
  - `data_verification_engine/scopes/in/run_in_audit.py`
- Global orchestrator:
  - `data_verification_engine/run_all_scopes.py`
- Strict trust validator:
  - `data_verification_engine/run_trust_pack.py`
  - `data_verification_engine/trust_pack/trust_policy.json`

### Deterministic workflow
1. Read dashboard sheets in scope
2. Normalize investor/introducer identities using alias and canonicalization rules
3. Load corresponding DB entities (subscriptions, positions, introductions, commissions)
4. Match dashboard rows to DB rows (row-by-row, identity-aware)
5. Run numeric parity checks and structural integrity checks
6. Run commission-level checks (row, totals, overrides, forbidden pairs, duplicates, FK validity)
7. Enforce trust policy (forbidden failure patterns, allowed warning categories, summary consistency)

### One-command verification
- `bash data_verification_engine/verify_all_scopes.sh`

---

## 3) Rule Framework Applied

Rules are scope-specific and versioned:
- VC1 rules: `data_verification_engine/scopes/vc1/rules_vc1.json` (`2026-02-14.3`)
- VC2 rules: `data_verification_engine/scopes/vc2/rules_vc2.json` (`2026-02-14.2`)
- IN rules: `data_verification_engine/scopes/in/rules_in.json` (`2026-02-14.2`)

### Shared rule classes across scopes
- Vehicle alias mapping (dashboard code -> DB vehicle code)
- Investor and introducer alias/name normalization
- Row-level dashboard vs DB numeric comparisons
- Zero-ownership exclusion handling
- Position parity and uniqueness checks
- Deal-link integrity checks (`subscription_deal_id_required`, deal/vehicle consistency)
- Commission duplicate checks
- Commission-to-introduction FK checks
- Commission status enforcement (`paid`)
- Currency parity checks (when dashboard currency exists)

### VC1 rule profile
- Sheets: 13
- Vehicles: 13
- Name aliases: 53
- `combined_introducer_name_policy`: `fail`
- `max_introducers_per_subscription`: `3`
- Commission row-basis matching: `invested_amount`, `spread`
- Vehicle-level ruled spread diffs configured (VC106, VC113, VC114)
- Vehicle-scoped investor aliasing includes transfer/dedup cases

### VC2 rule profile
- Sheets: 9
- Vehicles: 11 (includes VCL001/VCL002 scope handling)
- Name aliases: 35
- `combined_introducer_name_policy`: `ignore` (with ruled handling/check logic)
- `max_introducers_per_subscription`: `2`
- Commission row-basis matching:
  - `invested_amount`
  - `spread`
  - `performance_fee_tier1`
  - `performance_fee_tier2`
- `specific_commission_expectations`: 8 (documented split/override assertions)
- `forbidden_commission_pairs`: 4 (broker-removal and vehicle-specific exclusions)
- Broker/introducer rule set enforced (including forbidden global names and vehicle-specific constraints)

### IN rule profile
- Sheets: 11
- Vehicles: 9
- Name aliases: 19
- `combined_introducer_name_policy`: `ignore` (with ruled handling/check logic)
- `max_introducers_per_subscription`: `2`
- Commission row-basis matching:
  - `invested_amount`
  - `spread`
  - `performance_fee_tier1`
  - `performance_fee_tier2`
- `specific_commission_expectations`: 4

### Rule coverage matrix
- File: `data_verification_engine/ENGINE_RULE_COVERAGE_MATRIX_2026-02-14.csv`
- Current totals:
  - `IMPLEMENTED`: 67
  - `PARTIAL`: 16
  - `MISSING`: 1
  - `N/A`: 1

---

## 4) Data Changes Applied (DB + Engine)

Primary checkpoints:
- `data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-11.md`
- `data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-13.md`
- `data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-14.md`
- `data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-14B.md`

### 2026-02-11 (major reconciliation batch)
- Total documented DB changes:
  - `~165 rows updated`
  - `74 rows deleted`
  - `18 rows created`
  - `3 investor records removed`
- Covered VC2, IN, VC1 dedup/relink/fix batches and rule updates.

### 2026-02-13
- VC1 engine hardening and rules updates (fallback handling, zero-amount parity behavior, ownership/cost skip behavior)
- Targeted VC106/VC114 corrections
- Zandera Finco -> Holdco consolidation and dedup cleanup

### 2026-02-14
- Added missing VC122 commission row (LF GROUP + Pierre Paumier)

### 2026-02-14 (final hardening)
- Added engine-level:
  - commission status check
  - currency parity check
- Updated 9 VC2 commission rows from `accrued` to `paid`
- Re-ran strict trust gate to green

---

## 5) Final Validation Results

Latest strict verification run:
- Command:
  - `bash data_verification_engine/verify_all_scopes.sh`

Run artifacts:
- VC1: `data_verification_engine/scopes/vc1/output/run_20260214_224711`
- VC2: `data_verification_engine/scopes/vc2/output/run_20260214_224715`
- IN: `data_verification_engine/scopes/in/output/run_20260214_224718`
- Global: `data_verification_engine/output/global/run_20260214_214705/global_audit_report.json`
- Trust: `data_verification_engine/output/trust/run_20260214_214718/trust_pack_report.json`

Outcome:
- VC1: `FAIL_COUNT: 0`, `WARN_COUNT: 3`
- VC2: `FAIL_COUNT: 0`, `WARN_COUNT: 30`
- IN: `FAIL_COUNT: 0`, `WARN_COUNT: 7`
- Global: `TOTAL_FAIL_COUNT: 0`
- Trust: `TRUST_STATUS: PASS`, `FINDINGS_COUNT: 0`

---

## 6) Independent Audit Documentation

- Independent audit report:
  - `data_verification_engine/ENGINE_AUDIT_INDEPENDENT_2026-02-14.md`
- Rule coverage matrix:
  - `data_verification_engine/ENGINE_RULE_COVERAGE_MATRIX_2026-02-14.csv`

These files document:
- Engine behavior review
- Rule-by-rule coverage status
- Remaining partial/out-of-scope items

---

## 7) Notes / Scope Boundary

- Strikethrough formatting in historical source files remains intentionally out of engine scope for this delivery.
- All core reconciliation controls requested for deterministic dashboard-vs-DB verification are implemented and passing the strict trust gate.
