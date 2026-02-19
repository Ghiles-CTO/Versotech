# Set Cap + Daniel Replacement (Prod) - 2026-02-09

## Goal
Per client instruction, **replace** the combined introducer record `Setcap+Daniel Baumslag` with the single introducer `Set Cap` (Anand SETHIA).

This means:
- Keep Daniel Baumslag as his own introducer (if present separately).
- Remove the combined `Setcap+Daniel Baumslag` introducer and re-assign its commissions/introductions to `Set Cap`.

## Entities
- Canonical introducer (kept): `Set Cap`
  - `b661243f-e6b4-41f1-b239-de4b197a689a`
  - Email: `anand@set-cap.com`
- Removed introducer (deleted): `Setcap+Daniel Baumslag`
  - `ade750b8-011a-4fd2-a32c-30ba609b5643`

## What Data Existed Under the Combined Introducer
The combined introducer `ade750b8...` had:
- `introductions`: 1
- `introducer_commissions`: 1
- No other FK references (subscriptions/fee plans/etc were 0)

### Concrete rows moved
Vehicle: `VC126` (deal `e2d649da-f1e9-49ca-b426-dd8ade244f12`)
Investor: `CLOUDSAFE HOLDINGS LIMITED` (`76518678-13f1-4a8e-a050-1e0ef6a39d4c`)

- Introduction:
  - `208ea7d8-1081-44c7-ba17-b27d1f2866ff`
- Commission:
  - `8ce02fcd-fb1a-4ad7-a46a-64fc38a1242e`
  - basis_type: `spread`
  - rate_bps: `352`
  - accrual_amount: `21090.00` USD

## Changes Applied (Production DB)
1. Repointed FK references:
   - `introductions.introducer_id`: `ade750b8...` -> `b661243f...` (1 row)
   - `introducer_commissions.introducer_id`: `ade750b8...` -> `b661243f...` (1 row)
2. Hard-deleted the combined introducer record:
   - Deleted `public.introducers` row `ade750b8...`

## Verification
- `ade750b8...` no longer exists in `public.introducers`.
- There are **0** remaining FK references to `ade750b8...` across all FK tables.
- The moved introduction and commission now show `introducer = Set Cap`.

