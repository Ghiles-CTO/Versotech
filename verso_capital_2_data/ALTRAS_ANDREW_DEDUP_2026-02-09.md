# Altras / Andrew Introducer Cleanup (Prod) - 2026-02-09

## Goal
Remove the duplicate introducer record **"Altras+Andrew Stewart"** by consolidating all its data under the canonical introducer **"Altras Capital Financing Broker"**, without losing any commissions/introductions.

This follows the client’s missing-emails/contact file where the combined name is marked as a replacement (not a distinct introducer).

## Entities Involved
- Canonical introducer (kept)
  - `55b67690-c83d-4406-a2b4-935032d22739`
  - Legal name: `Altras Capital Financing Broker`
- Duplicate introducer (deprecated)
  - `e43f7818-441a-4ca5-aa66-eb2952f7449a`
  - Legal name: `Altras+Andrew Stewart`
- Separate introducer (unchanged)
  - `dc2981a3-e822-4c17-8e62-a07962f9d18c`
  - Legal name: `Andrew Stewart`

## Pre-State (What Had Data)
Duplicate introducer `e43f...` had:
- `introductions`: 1
- `introducer_commissions`: 4
- No other FK references (subscriptions/fee_plans/etc were 0 for this introducer)

## Changes Applied (Production DB)
### 1) Repoint FK references
Updated all rows referencing `e43f...` to instead reference `55b...` in:
- `introductions` (moved 1 row)
- `introducer_commissions` (moved 4 rows)

### 2) Deprecate the duplicate introducer record (no hard delete)
Set:
- `introducers.status = 'inactive'`
- Appended a note indicating it was merged into `55b...`

### 3) Hard delete of the duplicate introducer record
After confirming `e43f...` had **0 FK references** across all tables, the `introducers` row was **physically deleted** to avoid UI/reporting confusion.

## Post-State Verification
- Duplicate introducer `e43f...` has **0** references across all FK tables:
  - `introductions`: 0
  - `introducer_commissions`: 0
  - `subscriptions`: 0
  - `fee_plans`: 0
  - and all other FK tables referencing `introducers`

- Duplicate introducer `e43f...` no longer exists in `public.introducers`.

- Canonical introducer `55b...` counts increased exactly by:
  - `introductions`: +1
  - `introducer_commissions`: +4

## Notes / Follow-Ups
- We did **not** merge `Andrew Stewart` (`dc2981a3...`) into `Altras Capital Financing Broker` as part of this change, since only `Altras+Andrew Stewart` was requested for removal in this step.
- No investor records were created/changed as part of this cleanup.
