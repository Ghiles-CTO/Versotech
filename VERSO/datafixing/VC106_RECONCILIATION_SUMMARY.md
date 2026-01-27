# VC106 (VC6) Reconciliation Summary

Date: 2026-01-24
Scope: VC106 (VC6 sheet) – subscriptions, positions, introductions, commissions, name resolution.

## Sources
- Dashboard: `datamigration/VERSO DASHBOARD_V1.0.xlsx` (sheet: `VC6`)
- Name map: `VERSO/datafixing/introducers name change.csv`
- DB (Supabase prod): `vehicles`, `deals`, `investors`, `subscriptions`, `positions`, `introductions`, `introducer_commissions`

## Rules Applied
- Dashboard is source of truth. Every dashboard row with non‑zero amounts/shares/ownership becomes a subscription.
- Partners are treated as introducers.
- Introducer name normalization via `introducers name change.csv` + aliases:
  - Anand / Anand Sethia / Set Cap → **Setcap**
  - Dan/Daniel → **Daniel Baumslag**
  - Rick / Rick+Andrew / Elevation+Rick → **Altras Capital Financing Broker**
  - Terra Financial → **Terra Financial & Management Services SA**
- Investor matching:
  - First by entity / name.
  - If name mismatch, resolve by numeric match (amount, shares, price, contract_date) against VC106 subscriptions.
- Repeated dashboard rows with same investor/entity + amount + shares are treated as separate subscriptions (1:1).
- Cost per share: use `Cost per Share` column; if missing use `Final Cost per Share`; else NULL.
- Zero ownership → no subscription/position.

## Tools / Scripts Used
- `VERSO/datafixing/extract_dashboard_introducers.py` (extracts investor + introducer rows)
- `VERSO/datafixing/prepare_vc106_subs_positions.py` (subscription/position verification)
- `VERSO/datafixing/reconcile_vc106_introducers.py` (introducer/commission reconciliation)
- `VERSO/datafixing/insert_vc106_missing_commissions.py` (REST batch insert for commissions)

## SQL/Insert Files Applied
- `VERSO/datafixing/vc106_db_updates_intro.sql` → inserted missing introductions
- `VERSO/datafixing/insert_vc106_missing_commissions.py` → inserted missing commissions (567 rows)
- `VERSO/datafixing/vc106_subs_positions_updates.sql` → updated existing subs, inserted Verso Group subscription, inserted OEP/Verso positions, updated dates, deleted extra subs/positions
- `VERSO/datafixing/vc106_missing_subscriptions_insert.sql` → inserted 7 repeated‑row subscriptions (LEE RAND, Hedgebay, LE SEIGNEUR, FLETCHER)
- `VERSO/datafixing/vc106_missing_named_investors_insert.sql` → inserted KNOPF/KARKUN/SUBRAMANIAN subscriptions
- `VERSO/datafixing/vc106_missing_winz_subscription_positions.sql` → inserted WINZ subscription + positions for KNOPF/KARKUN/SUBRAMANIAN/WINZ

## Key Data Fixes
- Inserted repeated dashboard subscriptions for:
  - LEE RAND GROUP (49,989 x2, 24,985 x1)
  - Hedgebay (24,978.24 x2, both 2021‑03‑05 and 2021‑03‑09)
  - Eric LE SEIGNEUR (100,000) – duplicate row
  - Scott FLETCHER (500,000) – duplicate row
- Inserted missing investor subscriptions:
  - Beatrice & Marcel KNOPF (50,000 / 2,220 / 2021‑01‑29)
  - Anisha Bansal & Rahul KARKUN (50,000 / 2,272 / 2021‑02‑07)
  - Nilakantan MAHESWARI & Subbiah SUBRAMANIAN (155,000 / 6,733 / 2021‑02‑12)
- Inserted WINZ subscription (100,000 / 4,440 / 2021‑02‑05) and missing positions for:
  - KNOPF (2,220), KARKUN (2,272), SUBRAMANIAN (6,733), WINZ (4,440)
- Updated cost_per_share to 14.0 for the three new KNOPF/KARKUN/SUBRAMANIAN subscriptions.

## Final Verification Results
- Subscriptions: **0 missing**, **0 extra**
- Positions: **0 missing**, **0 extra**
- Introductions: **0 missing**
- Commissions: **0 missing**

Reports:
- `VERSO/datafixing/vc106_subs_positions_report.md`
- `VERSO/datafixing/vc106_reconciliation_report.md`

## Notes
- Dashboard repeated rows are preserved as separate subscriptions.
- Any future reconciliation must keep 1:1 mapping between dashboard rows and subscriptions.
