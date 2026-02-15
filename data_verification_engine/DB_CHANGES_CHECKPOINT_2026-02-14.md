# DB Changes Checkpoint — 2026-02-14

Date: 2026-02-14  
Operator: Codex  
Environment: Production Supabase + VC1 audit engine

---

## Summary

| Scope | Table/File | Action | Rows |
|-------|------------|--------|:---:|
| Dashboard reference | `verso_capital_2_data/VERSO DASHBOARD_V1.0.xlsx` | New upload used as source of truth for VC122 row 12 introducer block | — |
| VC122 | `introducer_commissions` | INSERT missing invested commission for LF GROUP + Pierre Paumier | 1 |
| VC1 Audit | `run_vc1_audit.py` | Re-run after insert | — |

---

## 1) New Dashboard Confirmation (VC122)

In `VC22` row `12`, the updated dashboard now contains:
- Introducer name: `Pierre Paumier` (column `BG`)
- Subscription fee %: `0.02` (column `BH`)
- Subscription fee amount: `1500` (column `BI`)

This replaced the previous unresolved case where amount existed without introducer name.

---

## 2) DB Fix Applied

Inserted missing `invested_amount` commission row for:
- Vehicle: `VC122`
- Investor: `LF GROUP SARL`
- Introducer: `Pierre Paumier`
- Basis: `invested_amount`
- Rate: `200 bps`
- Base amount: `75,000`
- Accrual amount: `1,500`
- Currency: `USD`
- Status: `paid`

Created commission ID:
- `10b1ee54-5341-4c17-8606-e8f89539cd64`

Existing related row retained:
- `6ef1a552-6b56-47b5-b229-05a0f95d55a0` (`performance_fee`, amount `0.00`)

---

## 3) Audit Verification

Run:
- `data_verification_engine/scopes/vc1/output/run_20260214_011240`

Result:
- `FAIL_COUNT: 0`
- `WARN_COUNT: 3`
- Remaining warnings are ruled spread deltas only (`commission_totals_ruled_diff_spread`).

