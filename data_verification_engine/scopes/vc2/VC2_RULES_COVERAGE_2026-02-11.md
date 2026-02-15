# VC2 Rules Coverage (2026-02-11)

Latest deterministic run:
- `verso_capital_2_data/audit_engine/output/run_20260211_175120/audit_summary.md`
- `verso_capital_2_data/audit_engine/output/run_20260211_175120/audit_issues.csv`

Rules source used:
- `verso_capital_2_data/VC2_CHECKPOINT_2026-02-10_BROKER_INTRODUCER.md`
- `verso_capital_2_data/VC2_CHECKPOINT.md` (older conflicts resolved in favor of latest checkpoint)

## Enforced checks in audit engine
- Dashboard vs DB vehicle totals: count, commitment, shares, ownership, spread_fee, subscription_fee, bd_fee, finra_fee.
- Row-key parity by `(vehicle, commitment, shares, contract_date)`.
- Row-level numeric parity by key (spread/sub/bd/finra/ownership).
- Zero-ownership rows not loaded as subscriptions.
- Subscription status must be `funded`.
- `funded_amount == commitment`.
- Positions:
  - no zero-unit rows
  - unique per `(investor, vehicle)`
  - position units total equals dashboard ownership total per vehicle.
- Commission integrity:
  - no exact duplicate commission rows
  - every commission points to an existing introduction.
- Broker/introducer policy:
  - brokers table expected names exist
  - forbidden broker-like names cannot appear in introducer commissions
  - forbidden pairs by vehicle (e.g., Bromley in VC215, Lafferty in VC203/VC207/VC209).
- Specific documented split assertions:
  - VC203 EVERLASTING: Sakal 5,000 @ 50 bps, Astral 10,000 @ 100 bps.
  - VC206 REDPOINT OMEGA V: Visual Sectors 82,000 @ 111 bps, Astral 90,000 @ 122 bps.
  - VC209 PVPL: Visual Sectors 10,000 @ 10 bps.
  - Bromley retained as introducer where documented:
    - VC202 SPLENDID HEIGHT: 80,000 @ 80 bps
    - VC206 KIWI: 30,000 @ 150 bps
    - VC209 SINO SUISSE: 18,849.42 @ 196 bps
  - VC215 Set Cap: invested_amount total must remain zero (spread-only partner).
- Contacts file sanity:
  - non-red rows only
  - broker rows must exist in `brokers`
  - intro names must exist in `introducers` or `brokers`.

## Current result
- Hard failures: `8`
- Warnings: `1`
- All hard failures are in `VC209` spread fee amounts.

### VC209 hard failures
- Vehicle spread total mismatch:
  - dashboard: `5,855,431.1565`
  - db: `8,079,471.1565`
  - delta: `+2,224,040.0`
- Row-level spread mismatches:
  - `(40,000 ; 1,000 ; 2025-03-12)`: dashboard `-35,000` vs db `5,000`
  - `(50,000 ; 649 ; 2025-11-12)`: dashboard `1,298` vs db `27,258`
  - `(100,023 ; 1,299 ; 2025-11-12)`: dashboard `2,598` vs db `54,558`
  - `(100,023 ; 1,299 ; 2025-12-16)`: dashboard `2,598` vs db `54,558`
  - `(150,000 ; 1,948 ; 2025-12-19)`: dashboard `3,896` vs db `81,816`
  - `(725,400 ; 9,300 ; 2025-12-29)`: dashboard `27,900` vs db `399,900`
  - `(2,727,208 ; 40,106 ; 2025-01-12)`: dashboard `-280,742` vs db `1,323,498`

### Warning only
- `Bright Views Holdings` still present in VC209 commissions:
  - rows: `3`
  - amount: `9,000.0`

## Conclusion
- The audit script now enforces all documented VC2 rules and special cases deterministically.
- Remaining real break is concentrated in VC209 subscription spread fee amounts (DB values do not match dashboard values on the rows above).
