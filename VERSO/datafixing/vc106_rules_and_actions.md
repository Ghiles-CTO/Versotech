# VC106 (VC6) – Rules & Actions

## Sources
- `datamigration/VERSO DASHBOARD_V1.0.xlsx` (sheet: `VC6`)
- `VERSO/datafixing/introducers name change.csv` (introducer name normalization)
- Supabase prod (tables: `introducers`, `introductions`, `introducer_commissions`, `subscriptions`, `positions`, `investors`, `deals`, `vehicles`)

## Rules Applied
- **Partners are introducers**: rows under `Partner` and `BI` columns are treated as introducer rows.
- **Name normalization**: map introducer names using `introducers name change.csv` + aliases used in scripts:
  - Anand → Setcap (incl. Anand Sethia / Set Cap)
  - Dan/Daniel → Daniel Baumslag
  - Rick(+Andrew)/Elevation+Rick → Altras Capital Financing Broker
  - Terra Financial → Terra Financial & Management Services SA
- **Investor matching**: match by normalized names; if ambiguous, disambiguate using subscription numbers (amount, shares, price) + contract date.
  - Compound first names like “Heinz & Barbara” are normalized to match “Barbara and Heinz”.
- **Commission calculations**:
  - Percent columns in VC6 are **decimal fractions** (e.g., `0.02 = 2%`).
  - `rate_bps = pct * 10000`.
  - **Invested amount commission**: use `Subscription fees` amount; if missing, compute `amount_invested * pct`.
  - **Spread commission**: use `Spread PPS Fees`; if missing, compute `Spread PPS * shares`.
  - **Performance fee**: create commission rows for each tier with `accrual_amount = 0.0`, `threshold_multiplier = 0.0`.
- **Introductions**: one per unique `(introducer_id, investor_id, deal_id)`; `introduced_at = contract_date` when available; `status = allocated`.
- **Duplicates**: only treat **exact duplicates** (all commission fields identical except `id/created_at`) as erroneous.
- **Dashboard repeated rows**: treat each row as its own subscription even when the same investor/entity + amount + shares repeat. Each row must map 1:1 to a DB subscription.
- **Cost per share**: use `Cost per Share` when present; if missing use `Final Cost per Share`; otherwise `NULL`.
- **Investor matching fallback**: if name does not match, resolve investor_id by matching dashboard row numbers (amount, shares, price, contract_date) to existing VC106 subscriptions.

## Outputs
- `VERSO/datafixing/vc106_missing_introductions.csv` – missing introductions (unique pairs).
- `VERSO/datafixing/vc106_missing_commissions.csv` – missing commission rows (multiset diff vs DB).
- `VERSO/datafixing/vc106_db_updates_intro.sql` – introduction inserts (uuid casts).
- `VERSO/datafixing/vc106_db_updates_comm.sql` – commission inserts (uuid casts).
- `VERSO/datafixing/vc106_db_updates_dedupe.sql` – exact duplicate cleanup (not executed yet).
- `VERSO/datafixing/insert_vc106_missing_commissions.py` – batch insert for missing commissions via REST API.
- `VERSO/datafixing/vc106_subscriptions_prepared.csv` – VC106 subscription verification rows.
- `VERSO/datafixing/vc106_positions_prepared.csv` – VC106 aggregated positions verification rows.
- `VERSO/datafixing/vc106_subs_positions_report.md` – summary of subscription/position verification.
- `VERSO/datafixing/vc106_subscriptions_should_insert.csv` – candidate subscriptions to add (verification only).
- `VERSO/datafixing/vc106_positions_should_insert.csv` – candidate positions to add (verification only).
- `VERSO/datafixing/vc106_subscriptions_date_mismatch.csv` – legacy contract_date mismatches vs DB (superseded by date-conflict handling in report).
- `VERSO/datafixing/vc106_zero_ownership_with_db_subscription.csv` – zero-ownership rows that still have DB subscriptions.
- `VERSO/datafixing/vc106_extra_db_subscriptions.csv` – DB subscriptions not matched to dashboard.
- `VERSO/datafixing/vc106_extra_db_positions.csv` – DB positions not matched to dashboard.
- `VERSO/datafixing/vc106_missing_subscriptions_insert.sql` – inserts for missing subscriptions (repeated dashboard rows).
- `VERSO/datafixing/vc106_missing_named_investors_insert.sql` – inserts for KNOPF/KARKUN/SUBRAMANIAN subscriptions.
- `VERSO/datafixing/vc106_missing_winz_subscription_positions.sql` – inserts for WINZ subscription + positions for KNOPF/KARKUN/SUBRAMANIAN/WINZ.

## Executed
- Introductions inserted via `VERSO/datafixing/vc106_db_updates_intro.sql`.
- Missing commissions inserted via `VERSO/datafixing/insert_vc106_missing_commissions.py` (567 rows).
- Subscriptions/positions reconciliation applied via `VERSO/datafixing/vc106_subs_positions_updates.sql`:
  - Updated 4 Julien MACHOT subscriptions (commitment, shares, prices, fees, contract_date, opportunity).
  - Inserted subscriptions for Verso Group (commitment 90,940; 4,547 shares).
  - Inserted positions for OEP Ltd (11,905 units) and Verso Group (4,547 units).
  - Updated contract_date for 24 subscriptions to match dashboard.
  - Deleted 16 subscriptions not present in dashboard or with zero ownership.
  - Deleted 4 positions not present in dashboard.
- Updated Hedgebay subscription `e24a37af-...` contract_date to `2021-03-05` (mode of dashboard dates).
- Inserted 7 missing subscriptions (repeated dashboard rows) via `VERSO/datafixing/vc106_missing_subscriptions_insert.sql`.
- Inserted 3 missing subscriptions for KNOPF/KARKUN/SUBRAMANIAN via `VERSO/datafixing/vc106_missing_named_investors_insert.sql`.
- Updated cost_per_share = 14.0 for the three new subscriptions (`fa43a20f...`, `c0c757a1...`, `40a345bc...`).
- Inserted WINZ subscription + four positions (KNOPF/KARKUN/SUBRAMANIAN/WINZ) via `VERSO/datafixing/vc106_missing_winz_subscription_positions.sql`.

## Verification (subscriptions/positions)
Latest run of `VERSO/datafixing/prepare_vc106_subs_positions.py`:
- VC106 dashboard rows: 216
- Subscriptions flagged should_insert: 0
- Positions flagged should_insert: 0
- DB subscriptions not found in dashboard: 0
- DB positions not found in dashboard: 0
- Dashboard repeated rows (same investor/amount/shares) are now all mapped to unique DB subscriptions.
- All dashboard rows now map to subscriptions/positions with 0 missing and 0 extra.

## Notes
- Exact duplicate commissions currently in DB:
  - `introducer_id 98fdce26...` / `investor_id 44de3ae0...` / `basis spread` / `rate_bps 872` / `accrual 2177.1` (3 rows)
  - `introducer_id 98fdce26...` / `investor_id e78f40f3...` / `basis performance_fee` / `rate_bps 1000` / `accrual 0.0` (2 rows)
- Missing commissions count is higher when matching by full commission rows (to respect multiple subscriptions with identical values).
