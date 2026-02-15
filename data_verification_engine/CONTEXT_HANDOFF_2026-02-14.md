# Context Handoff — 2026-02-14

Purpose: single file to recover context fast after any interruption.

## Current Verification Command

- Strict gate command:
  - `bash data_verification_engine/verify_all_scopes.sh`

## Latest Verified Status

- Trust status: `PASS`
- Findings: `0`
- Trust report:
  - `data_verification_engine/output/trust/run_20260214_201545/trust_pack_report.json`
  - `data_verification_engine/output/trust/run_20260214_201545/trust_pack_summary.md`
- Scope run folders used in that pass:
  - VC1: `data_verification_engine/scopes/vc1/output/run_20260214_211536`
  - VC2: `data_verification_engine/scopes/vc2/output/run_20260214_211541`
  - IN: `data_verification_engine/scopes/in/output/run_20260214_211545`

## Core Documentation (Read in this order)

1. `data_verification_engine/README.md`
2. `data_verification_engine/RELEASE_CHECKLIST.md`
3. `data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-11.md`
4. `data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-13.md`
5. `data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-14.md`
6. `data_verification_engine/VC2_AUDIT_ENGINE_FIX_CHECKPOINT_2026-02-11.md`
7. `data_verification_engine/scopes/vc2/VC2_RULES_COVERAGE_2026-02-11.md`

## Rule Files (Source of Engine Behavior)

- VC1 rules: `data_verification_engine/scopes/vc1/rules_vc1.json`
- VC2 rules: `data_verification_engine/scopes/vc2/rules_vc2.json`
- IN rules: `data_verification_engine/scopes/in/rules_in.json`
- Trust policy: `data_verification_engine/trust_pack/trust_policy.json`

## Important Guardrail

- If trust status is not `PASS`, do not export or deliver client files.

