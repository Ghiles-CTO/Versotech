# VC2 Migration Run Log

Date: 2026-02-07
Last verification: 2026-02-07 (live DB + dashboard recheck)

## Scope
- Source contacts: `verso_capital_2_data/VERSO Capital 2 SCSp Emails and Contacts.xlsx`
- Source dashboard: `verso_capital_2_data/VERSO DASHBOARD_V1.0.xlsx`
- Vehicles in scope: `VC201, VC202, VC203, VC206, VC207, VC209, VC210, VC211, VC215`

## Final Production State
- VC2 subscriptions loaded.
- VC2 positions loaded.
- VC2 introductions loaded.
- VC2 introducer commissions loaded.
- Broker entries synced for:
  - `R. F. Lafferty & Co. Inc.` (`Joseph Gelet`, `jgelet@vccross.com`)
  - `Old City Securities LLC` (`Eytan Feldman`, `eytan@oldcitycapital.com`)

## Hard Rules Verified
- Zero-unit subscriptions in VC2 scope: `0`
- Zero-unit positions in VC2 scope: `0`
- Non-funded subscriptions in VC2 scope: `0`
- Currencies in VC2 scope: `USD` only

## Dashboard vs DB Checks
- Active rows vs DB subscriptions: PASS
- Commitment sums: PASS
- Shares sums: PASS
- Ownership sums vs subscription units: PASS
- Ownership sums vs position units: PASS
- Spread fee sums: PASS
- Subscription fee sums: PASS
- BD fee sums: PASS
- FINRA fee sums: PASS

Reference report:
- `verso_capital_2_data/VC2_END_TO_END_AUDIT.md`
- `verso_capital_2_data/vc2_end_to_end_audit.csv`

## Vehicle-by-Vehicle Final Counts
- VC201: subs `1`, pos `1`, intros `0`, comms `0`
- VC202: subs `2`, pos `2`, intros `14`, comms `42`
- VC203: subs `19`, pos `16`, intros `20`, comms `61`
- VC206: subs `11`, pos `9`, intros `14`, comms `42`
- VC207: subs `25`, pos `24`, intros `14`, comms `42`
- VC209: subs `25`, pos `22`, intros `37`, comms `113`
- VC210: subs `2`, pos `2`, intros `2`, comms `6`
- VC211: subs `1`, pos `1`, intros `1`, comms `3`
- VC215: subs `19`, pos `15`, intros `29`, comms `87`

## Commission Basis Coverage (not ignored when spread is zero/unset)
- VC202: `invested_amount=14`, `spread=14`, `performance_fee=14`
- VC203: `invested_amount=21`, `spread=20`, `performance_fee=20`
- VC206: `invested_amount=14`, `spread=14`, `performance_fee=14`
- VC207: `invested_amount=14`, `spread=14`, `performance_fee=14`
- VC209: `invested_amount=39`, `spread=37`, `performance_fee=37`
- VC210: `invested_amount=2`, `spread=2`, `performance_fee=2`
- VC211: `invested_amount=1`, `spread=1`, `performance_fee=1`
- VC215: `invested_amount=29`, `spread=29`, `performance_fee=29`

Interpretation:
- Spread rows are present even where spread amount is `0`, so zero-spread introductions were not dropped.

## Important Note On Name Matching
- Numeric/data reconciliation is clean.
- Textual introducer-name comparison can show false mismatches due dashboard formatting patterns (merged cells and compressed labels like `Renbridge`, `Headwall / AGP`, etc.).
- Operationally, the loaded introductions/commissions were validated by vehicle counts and amount totals, not only raw text equality.

## Why Contact File Rows != DB Subscription Rows
- Contact file (`Sheet1`) data rows: `127`
- Red rows excluded by client rule: `2`
- Non-red rows: `125`
- Non-red VC2/VCL rows: `123`

Breakdown of `123` non-red VC2 rows:
- `13` rows are extra role lines (`Introducer`/`Broker`) for subscriptions that already exist as investor rows.
- `5` rows are dashboard subscriptions with ownership `0` (VC206) and are intentionally excluded from DB subscriptions.

Result:
- `123 - 13 - 5 = 105` DB subscriptions.
- This matches current DB subscriptions across VC2 scope exactly.

Exact zero-ownership rows excluded from subscriptions/positions (dashboard VC206):
- `AAF D Boral Mstr SPV LLC, Ser III OpenAI` commitment `1,176,400.00`, shares `29,410`, ownership `0`
- `Jyotsna HEDGE` commitment `1,000,000.00`, shares `2,083`, ownership `0`
- `PUTHAN N.C. MENON AND/OR SOBHA MENON RAGHAVANNAIR` commitment `5,000,000.00`, shares `10,416`, ownership `0`
- `REDPOINT OMEGA V, L.P.` commitment `7,396,512.78`, shares `0`, ownership `0`
- `REDPOINT OMEGA ASSOCIATES V, LLC` commitment `192,117.22`, shares `0`, ownership `0`

## VC215 Spread Calculation Check
- In VC215 dashboard, spread is carried in the `PARTNERS` section (7 rows), not in the `INTRODUCERS` section.
- Cached dashboard values (formula outputs) for partner spread total: `25,654.80`.
- DB commission spread total for VC215: `25,654.81` (rounding delta `0.01`).
- Therefore partner spread equations were effectively captured and loaded.

## Investor-Level Validation Artifacts
- `verso_capital_2_data/vc2_investor_subscriptions_and_commissions_compare.csv`
- `verso_capital_2_data/vc2_db_subscriptions_by_investor.csv`
- `verso_capital_2_data/vc2_db_commissions_by_investor.csv`
- `verso_capital_2_data/vc2_contacts_vs_dashboard_deltas.csv`
- `verso_capital_2_data/vc2_zero_ownership_rows.csv`

Resolved investor-name issue (applied in production):
- VC203 row signature `commitment 704,509.00 / shares 19,040 / date 2025-01-31` was misassigned to `AGP Alternative Investment QP`.
- Corrected to investor `Infinitas Capital SPV VII a series of Infinitas Capital Master LLC`.
- Subscription moved: `1b9bf971-2ad7-40ce-b8f6-5eb8ae53812f`.
- New investor created: `5bf0feb0-4dd3-471b-9fb0-84501631eee0`.
- Position split:
  - `AGP Alternative Investment QP` -> `units 211,730`, `cost_basis 9,195,433.90`
  - `Infinitas Capital SPV VII a series of Infinitas Capital Master LLC` -> `units 19,040`, `cost_basis 704,509.00`
- AGP commission alignment cleanup:
  - Removed zero-rate invested row linked to moved subscription: `45224b3a-84b2-47c6-91b2-6aaefdf2225e`
  - Updated AGP `spread` and `performance_fee` base amounts to `9,195,433.90`:
    - `e1aa236a-2687-44dd-8eac-d4ee1e1e8980`
    - `9f6ece46-634d-48d1-9535-3e7c5bc9c6ae`
