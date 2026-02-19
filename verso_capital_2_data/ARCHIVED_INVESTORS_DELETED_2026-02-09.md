# Archived Investors Cleanup (Prod) - 2026-02-09

## Goal
Remove archived investors that have **no referenced data** in Production (to avoid UI/report confusion).

## Investors Deleted
All three had `status='archived'` and `archived_at != NULL`:
- `AEON INC.` (`4011deca-d273-4fc9-bd33-5fcec27b2d67`)
- `AS ADVISORY DWC-LLC` (`41b8b9df-623b-4b68-9a33-f8abddccf526`)
- `Julien MACHOT` (`5ee17648-dd9d-4351-a450-f57119440739`)

## Verification (Pre-delete)
We checked references across all FK tables referencing `public.investors` (and key operational tables):
- `subscriptions`, `positions`
- `introducer_commissions`, `introductions`
- `documents` (via `owner_investor_id`)
- `kyc_submissions`, `signature_requests`
- plus all other FK tables discovered via `pg_constraint`

Result: **0 references** everywhere for each of the 3 investors.

## Change Applied
Hard-deleted the 3 investor rows from `public.investors`.

## Post-delete Check
After deletion:
- No rows remain with `status='archived'`
- Investor status distribution is now:
  - `active`: 98
  - `inactive`: 355

