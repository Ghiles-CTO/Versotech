# VC2 End-to-End Audit

## Pass/Fail
- Active subscription rows: PASS
- Commitment sums: PASS
- Shares sums: PASS
- Ownership vs subscription units: PASS
- Ownership vs position units: PASS
- Spread fee sums: PASS
- Subscription fee sums: PASS
- BD fee sums: PASS
- FINRA fee sums: PASS
- Zero-unit subscriptions (VC2): 0
- Zero-unit positions (VC2): 0
- Non-funded subscriptions (VC2): 0

## Contacts File Row Explanation
- Contacts workbook total data rows: `127` (header is row 1, so file shows 128 rows visually).
- Red rows excluded by client instruction: `2`.
- Non-red VC2/VCL rows: `123`.
- DB subscriptions in VC2 scope: `105`.
- Delta (`18`) is expected and explained by:
  - `13` role-duplicate lines (`Introducer`/`Broker`) that do not create extra subscriptions.
  - `5` zero-ownership dashboard rows (VC206) intentionally excluded from subscriptions.

## Broker coverage
- R. F. Lafferty & Co. Inc. in brokers: YES
- Old City Securities LLC in brokers: YES

## Vehicle checks
- VC201: dash_rows=1 db_subs=1 db_pos=1 commit=372237.5 db_commit=372237.5 spread=24816.0 db_spread=24816.0 sub_fee=11512.5 db_sub_fee=11512.5 bd=0.0 db_bd=0.0 finra=0.0 db_finra=0.0 currencies=USD
- VC202: dash_rows=2 db_subs=2 db_pos=2 commit=14999751.16 db_commit=14999751.16 spread=3858224.08 db_spread=3858224.08 sub_fee=324993.78 db_sub_fee=324993.78 bd=0.0 db_bd=0.0 finra=0.0 db_finra=0.0 currencies=USD
- VC203: dash_rows=19 db_subs=19 db_pos=16 commit=25636509.24 db_commit=25636509.24 spread=4283297.81 db_spread=4283297.81 sub_fee=75235.27 db_sub_fee=75235.27 bd=0.0 db_bd=0.0 finra=400805.45 db_finra=400805.45 currencies=USD
- VC206: dash_rows=11 db_subs=11 db_pos=9 commit=14305532.5 db_commit=14305532.5 spread=1651768.5 db_spread=1651768.5 sub_fee=116680.57 db_sub_fee=116680.57 bd=2500.0 db_bd=2500.0 finra=0.0 db_finra=0.0 currencies=USD
- VC207: dash_rows=25 db_subs=25 db_pos=24 commit=12210820.0 db_commit=12210820.0 spread=859049.0 db_spread=859049.0 sub_fee=169996.2 db_sub_fee=169996.2 bd=5008.75 db_bd=5008.75 finra=0.0 db_finra=0.0 currencies=USD
- VC209: dash_rows=25 db_subs=25 db_pos=22 commit=39499896.0 db_commit=39499896.0 spread=8079471.16 db_spread=8079471.16 sub_fee=80266.66 db_sub_fee=80266.66 bd=0.0 db_bd=0.0 finra=0.0 db_finra=0.0 currencies=USD
- VC210: dash_rows=2 db_subs=2 db_pos=2 commit=45000.0 db_commit=45000.0 spread=3164.0 db_spread=3164.0 sub_fee=1350.0 db_sub_fee=1350.0 bd=0.0 db_bd=0.0 finra=0.0 db_finra=0.0 currencies=USD
- VC211: dash_rows=1 db_subs=1 db_pos=1 commit=315000.0 db_commit=315000.0 spread=16666.1 db_spread=16666.1 sub_fee=9450.0 db_sub_fee=9450.0 bd=0.0 db_bd=0.0 finra=0.0 db_finra=0.0 currencies=USD
- VC215: dash_rows=19 db_subs=19 db_pos=15 commit=15032122.0 db_commit=15032122.0 spread=2191716.76 db_spread=2191716.76 sub_fee=381503.5 db_sub_fee=381503.5 bd=25606.8 db_bd=25606.8 finra=0.0 db_finra=0.0 currencies=USD

## Introducer coverage (dashboard names vs DB introductions; alias-normalized)
- VC201: fully covered
- VC202: fully covered
- VC203: textual comparison noisy due merged/combined labels; count + amount checks pass
- VC206: textual comparison noisy due merged/combined labels; count + amount checks pass
- VC207: textual comparison noisy due short aliases (`Renbridge`, `Lafferty`); count + amount checks pass
- VC209: textual comparison noisy due short aliases (`Bright Views`, `Bromley`, `Renbridge`); count + amount checks pass
- VC210: fully covered
- VC211: alias-only (`Renaissance` vs `Renaissance Bridge Capital LLC`); count + amount checks pass
- VC215: textual comparison noisy due merged/combined labels (`Set Cap`, `Infinyte Club`, `Bromley`); count + amount checks pass
