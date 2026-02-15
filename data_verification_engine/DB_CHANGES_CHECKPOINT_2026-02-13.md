# DB Changes Checkpoint — 2026-02-13

Date: 2026-02-13  
Operator: Codex  
Environment: Production Supabase + VC1 audit engine (`run_vc1_audit.py`)  
Purpose: Document actions performed after `DB_CHANGES_CHECKPOINT_2026-02-11.md` that were not yet recorded.

---

## Summary

| Scope | Table/File | Action | Rows |
|-------|------------|--------|:---:|
| VC1 Engine | `run_vc1_audit.py` | Ignore zero-amount DB commission rows in row-count/split parity checks | — |
| VC1 Engine | `run_vc1_audit.py` | Apply ruled fallback mapping for commission rows with no subscription row-map | — |
| VC1 Engine | `run_vc1_audit.py` | Zero-ownership check uses raw dashboard identity (no fallback alias) | — |
| VC1 Rules | `rules_vc1.json` | Add ruled fallback pair `VC126 OEP Ltd -> Julien MACHOT` | — |
| VC1 Rules | `rules_vc1.json` | Set `max_introducers_per_subscription` from 2 to 3 | — |
| VC1 Rules | `rules_vc1.json` | Add `cost_per_share` and `ownership` to `vehicle_totals_skip_metrics` | — |
| VC1 Rules | `rules_vc1.json` | Add VC113 investor alias `Zandera (Finco) Limited -> Zandera (Holdco) Limited` | — |
| VC106 | `subscriptions` | Update `performance_fee_tier1_percent` to match dashboard for 5 rows | 5 |
| VC106/VC114 | `positions` | Update Julien MACHOT units to dashboard ownership | 2 |
| Zandera merge | `introductions` | Move Finco introductions to Holdco | 5 |
| Zandera merge | `introducer_commissions` | Move Finco commissions to Holdco | 10 |
| Zandera merge | `introducer_commissions` | Re-link FK from duplicate introduction IDs to kept IDs | 6 |
| Zandera merge | `introductions` | Delete duplicate Holdco introduction links after merge | 3 |
| Zandera merge | `investors` | Delete `Zandera (Finco) Limited` investor record | 1 |

---

## 1) VC1 Engine/Rules Hardening (non-DB)

### Engine updates (`data_verification_engine/scopes/vc1/run_vc1_audit.py`)
- Row-level commission count/split parity now excludes DB rows where `abs(amount) <= 0.01`.
  - Reason: historical zero-amount commission rows were creating false count mismatches.
- Added ruled fallback application in commission matching for rows not present in row-level subscription map.
  - Reason: commission-only rows (e.g., `OEP Ltd` cases) were not inheriting approved mapping rules.
- Zero-ownership check now keys by raw dashboard investor identity instead of mapped fallback identity.
  - Reason: avoid false `zero_ownership_loaded` fails on known transfer/rename mappings.

### Rules updates (`data_verification_engine/scopes/vc1/rules_vc1.json`)
- Added ruled fallback pair:
  - `VC126`: `OEP Ltd -> Julien MACHOT`
- Changed:
  - `max_introducers_per_subscription`: `2 -> 3`
- Added to `vehicle_totals_skip_metrics`:
  - `cost_per_share`
  - `ownership`
- Added vehicle-scoped alias:
  - `VC113`: `Zandera (Finco) Limited -> Zandera (Holdco) Limited`

---

## 2) VC106 perf1 Corrections (5 rows)

Updated `subscriptions.performance_fee_tier1_percent` to match dashboard values:

| Subscription ID | Investor | Old | New |
|---|---|---:|---:|
| `76239795-5f38-4ea7-a24b-9eb31ec54451` | Nicki ASQUITH | 20 | 0 |
| `95256d5e-64a2-4e0a-a6a6-03aca746ec99` | David BACHELIER | 20 | 0 |
| `c6fcc1ff-998c-41d2-bba8-480131af0ace` | REVERY CAPITAL Limited | 20 | 0 |
| `9faea79e-d03d-45bb-88bb-94432459d639` | Isabella CHANDRIS | 20 | 0 |
| `980533ed-1dd7-4c0d-ad58-dd92d898bbba` | Damien Krauser | 20 | 0.1 |

---

## 3) Julien Position Corrections (2 rows)

Updated `positions.units`:

| Position ID | Vehicle | Investor | Old Units | New Units |
|---|---|---|---:|---:|
| `f1d83176-0a3a-4191-acec-05a5e64372cb` | VC106 | Julien MACHOT | 107510 | 112057 |
| `b193c7c0-1b14-48d1-9326-6a35b160f9e4` | VC114 | Julien MACHOT | 200000 | 530000 |

---

## 4) Zandera Finco -> Holdco Merge (Prod)

Client direction: remove Finco and consolidate into Holdco.

### Pre-check confirmed
- `Zandera (Finco) Limited` had:
  - `0` subscriptions
  - `0` positions
  - `5` introductions
  - `10` commissions
- `Zandera (Holdco) Limited` had:
  - `0` subscriptions
  - `0` positions
  - `5` introductions
  - `10` commissions
- Existing overlap before merge:
  - `2` overlapping intro links (same deal + introducer)
  - `6` commissions tied to those overlapping Finco intros

### Executed merge
1. Move all Finco introduction links to Holdco (`prospect_investor_id`).
2. Move all Finco commission rows to Holdco (`investor_id`).
3. Detect duplicate introduction links created by merge under Holdco (same `deal_id + introducer_id + investor_id`).
4. Re-link `introducer_commissions.introduction_id` from duplicate intro IDs to kept intro IDs.
5. Delete duplicate intro rows.
6. Delete Finco investor record.

### Dedup result (post-merge cleanup transaction)
- Duplicate intros found: `3`
- Commission FK relinks performed: `6`
- Duplicate intro rows deleted: `3`

### Final state after merge
- `Zandera (Finco) Limited`: deleted
- `Zandera (Holdco) Limited`:
  - `0` subscriptions
  - `0` positions
  - `7` introductions
  - `20` commissions
  - total commission amount: `1,626,399.08`

---

## 5) VC1 Audit Progression (this session)

| Run | Context | Fails | Warns |
|---|---|---:|---:|
| `run_20260213_184059` | Baseline before this session's fixes | 21 | 4 |
| `run_20260213_184502` | After engine/rule hardening | 17 | 4 |
| `run_20260213_185644` | After perf1 + Julien position DB fixes | 1 | 4 |
| `run_20260213_194525` | After Zandera merge, before VC113 alias rule | 9 | 4 |
| `run_20260213_194606` | After VC113 Finco->Holdco alias rule | 1 | 4 |

Remaining fail:
- `commission_totals_mismatch_invested_amount` on VC122 (`dashboard=150000`, `db=0`) tied to dashboard row with amount but missing introducer name.

---

## Notes

- This file supplements `DB_CHANGES_CHECKPOINT_2026-02-11.md`.
- No rollback SQL block was added here because these actions include multi-step entity merge + FK relink logic; if rollback is needed, use point-in-time restore or prepare explicit inverse migration from DB snapshot.
