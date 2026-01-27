# Reconciliation Fixes — 2026-01-25

Source of truth: `datamigration/VERSO DASHBOARD_V1.0.xlsx` and `datamigration/INNOVATECH DASHBOARD_V1.xlsx`.
Rule applied: ownership = 0 rows are not active subscriptions.

## VC111
- Filled missing shares to reconcile total shares (+150,000):
  - `41dd0670-8554-45ca-9e7e-e280679e832b` (Mickael RYAN) → `num_shares=100000`, `price_per_share=5.7142857`, `cost_per_share=5.7142857`.
  - `a69bf46b-90e2-420f-9ec1-c2a7e6ea339c` (OEP LIMITED) → `num_shares=50000`, `price_per_share=1`, `cost_per_share=1`.

## VC128
- Corrected Julien 50k shares to match dashboard:
  - `c5fd421b-147a-48d4-bec5-6406ef2ad95e` → `num_shares=71428`, `price_per_share=0.7`, `cost_per_share=0.7`.

## VC131
- Dashboard has duplicate rows for Julien (same amount/date). Inserted missing duplicates:
  - 25k / 20,000 shares / 2022-02-02 → `d461ac0f-bd06-41fc-8546-85cb56c2424a`.
  - 12.5k / 12,500 shares / 2023-01-13 → `48446aa3-dbfd-46ec-9cea-ae07c42b8a0b`.

## VC133
- Inserted four missing dashboard subscriptions (EPIC GAMES / TR3, contract date 2022-12-07):
  - VERSO HOLDINGS 3,200 / 4 shares → `bb5b397c-d96f-4224-9eaf-47cde270c723`.
  - Tobias JOERN 8,970 / 6 shares → `0c53fbd6-fd76-4769-a4f6-b482ac999a3c`.
  - René ROSSDEUTSCHER 19,435 / 13 shares → `2a2aa22a-b33c-40d2-aff6-29c3f1f9b8c0`.
  - Ellen STAUDENMAYER 8,970 / 6 shares → `d75207c7-e4d1-4d03-8d3d-53b1b8703efd`.
  - Fees/spreads copied from dashboard rows (spread PPS, subscription fee %, perf fee %).

## IN110
- Cancelled negative transfer row (ownership=0):
  - `eb1f18e8-042b-4b62-997c-5ee19000b9c8` → `status='cancelled'`.
- Note: IN10 amounts are ETH strings; reconciliation requires parsing `ETH xx.xx` into numeric values.

## Post-fix reconciliation
- Re-run with ETH parsing and ownership rule applied: **MISMATCHES = 0** across all tracked VC and IN sheets.
