# DB Changes Checkpoint — 2026-03-27

## Purpose

Record the production data changes made on 2026-03-27 to resolve real duplicate-investor issues that were still failing the verification engine.

## Scope

Changed in production:

- `Michael RYAN` duplicate investor cleanup
- `Anisha Bansal / Rahul KARKUN` duplicate investor cleanup

Not changed:

- `STELLATRION PARTNERS` VC215 commission split-format mismatch

## 1. Michael RYAN duplicate cleanup

Canonical investor kept:

- `ea7ec75f-d518-4cfe-a65c-70655f433a14`
- email: `mickryan@live.co.uk`

Removed duplicate investor:

- `494ada77-4fb7-4bbd-a7f1-784ecc263338`
- email: `rick@altrascapital.com`

What was changed:

1. Updated canonical `entity_investors` IN103 row to `allocation_status = funded`
   - `entity_investors.id = 338a1710-90bd-4665-95ba-5aac45df230c`

2. Moved VC133 entity link from duplicate investor to canonical investor
   - `entity_investors.id = 7a5a8c3b-9efa-4178-b761-c7198a795ac9`

3. Removed redundant duplicate IN103 entity link
   - deleted `entity_investors.id = 1fe591ef-5b7e-4e5c-8e66-21f508b2810a`

4. Cleared the bad introduction link instead of moving it to the real Michael investor
   - `introductions.id = 2447c5d7-563b-4af6-997e-cb2cb84a6a54`
   - set `prospect_investor_id = null`
   - reason: this row carried `prospect_email = rick@altrascapital.com` and was not a real Michael subscription-linked introduction

5. Deleted duplicate investor risk-profile snapshots
   - deleted `51` rows from `investor_risk_profiles` for investor `494ada77-4fb7-4bbd-a7f1-784ecc263338`

6. Deleted duplicate investor row
   - deleted investor `494ada77-4fb7-4bbd-a7f1-784ecc263338`

Result after cleanup:

- only canonical Michael row remains
- subscriptions remained on canonical row
- positions remained on canonical row
- IN engine duplicate-investor fail cleared
- VC1 duplicate-investor fail cleared

## 2. Anisha Bansal / Rahul KARKUN duplicate cleanup

Canonical investor kept:

- `a7a6b0b9-538c-44d6-b8c6-3df69b5a5212`
- legal name: `Anisha Bansal and Rahul KARKUN`

Removed duplicate investor:

- `cd551cdb-3dc3-4ab2-92a0-810326952c3c`
- legal name: `MRS ANISHA BANSAL AND MR RAHUL KARKUN`

What was changed:

1. Moved VC209 subscription to canonical investor
   - `subscriptions.id = fe3115df-aefb-4e09-999c-7aecb4377143`

2. Moved VC209 position to canonical investor
   - `positions.id = f5a02fc9-6f2c-444a-a94e-be8e6678d9d3`

3. Moved VC209 entity link to canonical investor
   - `entity_investors.id = e2057982-de83-493d-ae9f-70ac75399147`

4. Preserved active status on the kept investor row
   - updated investor `a7a6b0b9-538c-44d6-b8c6-3df69b5a5212`
   - set `status = active`

5. Deleted duplicate investor risk-profile snapshots
   - deleted `52` rows from `investor_risk_profiles` for investor `cd551cdb-3dc3-4ab2-92a0-810326952c3c`

6. Deleted duplicate investor row
   - deleted investor `cd551cdb-3dc3-4ab2-92a0-810326952c3c`

Result after cleanup:

- VC106 / VC126 / VC209 now sit under one investor row
- commissions and introductions on the original investor row were preserved
- VC2 duplicate-investor fail cleared
- VC1 duplicate-investor fail cleared

## Verification After Changes

Post-change engine runs:

- VC1: `data_verification_engine/scopes/vc1/output/run_20260327_181520`
  - `FAIL_COUNT: 0`
- VC2: `data_verification_engine/scopes/vc2/output/run_20260327_181516`
  - `FAIL_COUNT: 1`
- IN: `data_verification_engine/scopes/in/output/run_20260327_181514`
  - `FAIL_COUNT: 0`

Remaining fail after DB cleanup:

- `VC215` / `STELLATRION PARTNERS`
  - `commission_row_count_mismatch`
  - dashboard has `2` Anand spread rows
  - DB has `1` Set Cap spread row
  - total amount matches

## Summary

Production changes completed on 2026-03-27:

- `2` duplicate investor rows removed
- `2` live investor identities consolidated
- `103` risk-profile snapshot rows removed from deleted duplicate investors
- `1` orphan/bad introduction investor link cleared
- `2` scopes now fully clean (`VC1`, `IN`)
- `1` remaining fail left in `VC2`, and it is the already-known `STELLATRION` split-format case
