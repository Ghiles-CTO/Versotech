# Engine Checkpoint — 2026-03-27

## Purpose

Document the engine changes made on 2026-03-27 to tighten structural validation without changing production data.

## DB Changes

- None in this checkpoint.

## Engine / Rules Changes

### 1. Duplicate-investor structural check hardened

Added a global-reference duplicate-investor failure so an investor identity now fails when duplicate investor rows still have live linked records, even if those links sit outside normal scoped subscription matching.

Covered files:

- `data_verification_engine/scopes/vc1/run_vc1_audit.py`
- `data_verification_engine/scopes/vc2/run_vc2_audit.py`
- `data_verification_engine/scopes/in/run_in_audit.py`

Effect:

- Catches `Michael RYAN` duplicate row (`rick@altrascapital.com` vs `mickryan@live.co.uk`)
- Catches split duplicate investor groups like `Anisha Bansal / Rahul KARKUN`

### 2. Duplicate-subscription check corrected

Initial strict duplicate-subscription logic was too aggressive: it failed repeated DB subscriptions even when the real dashboard repeated the same rows too.

Corrected behavior:

- fail only when DB duplicate count is greater than dashboard duplicate count
- do not fail when dashboard and DB both contain the same repeated subscription rows

Effect:

- removed false duplicate-subscription fails for:
  - `Scott FLETCHER` / VC106
  - `Eric Pascal LE SEIGNEUR` / VC106
  - `Julien MACHOT` / VC131
  - `STELLATRION PARTNERS` / VC215
  - `Michael RYAN` / IN103

### 3. VC2 alias gaps fixed

Added the missing VC2 alias rules for:

- `Keir BENBOW` -> `Keir Richard BENBOW`
- investor-only VC209 dashboard alias:
  - `BRIGHT VIEWS HOLDINGS` -> `Bright Views Holdings S.à.r.l.`

Important implementation note:

- The Bright Views fix was implemented as a dashboard-investor-only alias path in VC2 so investor matching could be fixed without rewriting commission-side introducer names.

Covered files:

- `data_verification_engine/scopes/vc2/run_vc2_audit.py`
- `data_verification_engine/scopes/vc2/rules_vc2.json`

## Current Run Status After Changes

Latest runs:

- VC1: `data_verification_engine/scopes/vc1/output/run_20260327_175400`
- VC2: `data_verification_engine/scopes/vc2/output/run_20260327_175357`
- IN: `data_verification_engine/scopes/in/output/run_20260327_175354`

Fail counts:

- VC1: `2`
- VC2: `2`
- IN: `1`

## Remaining Fails

### VC1

1. Duplicate investor identity: `Michael RYAN`
2. Duplicate investor identity: `Anisha Bansal / Rahul KARKUN`

### VC2

1. Duplicate investor identity: `Anisha Bansal / Rahul KARKUN`
2. `STELLATRION PARTNERS` spread commission row-count mismatch
   - dashboard has 2 split rows
   - DB has 1 aggregated row
   - total amount matches

### IN

1. Duplicate investor identity: `Michael RYAN`

## Notes

- `STELLATRION PARTNERS` was checked against the brokers table on 2026-03-27 and was **not** found there.
- No STELLATRION DB edits were made in this checkpoint.
