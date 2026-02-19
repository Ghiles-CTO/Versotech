# VC2 Multi-Introducer Fee Concern Investigation (Production)

Date: 2026-02-08
Scope: VC203, VC206, VC209, VC215, VCL001, VCL002 (VC2 flow)

## What was checked
1. Multi-introducer rows in client-facing export: `VC2_Subscriptions_Introducers.xlsx` (`Subscriptions_Review`).
2. Live DB for the same investor+deal pairs:
   - `subscriptions` fee fields
   - `introductions` (introducer count)
   - `introducer_commissions` (basis_type totals)

## Core result
The client concern is **real** for many multi-introducer rows.

- Multi-introducer subscription rows: **26**
- Multi-introducer rows where spread fee exists but exported introducer spread commission is zero: **21**
- Vehicles affected: **VC203, VC206, VC209, VC215**

Breakdown of the 21 rows:
- VC209: 15
- VC215: 3
- VC203: 2
- VC206: 1

## Why this happens
For those 21 rows, DB has:
- subscription `spread_fee_amount > 0`
- but `introducer_commissions` spread totals (`basis_type='spread'`) = 0 for the same deal+investor

So the export is not inventing zeros; it reflects missing/zero spread commission records in DB for those multi-introducer pairs.

## Artifacts
- Detailed affected rows: `verso_capital_2_data/vc2_multi_intro_spread_zero_rows.csv`

This CSV lists:
- sheet row
- vehicle
- investor
- spread fee amount
- introducer 1 and 2 names
- exported spread commission sum
- subscription fee amount
- exported invested commission sum

## Notes
- Not all multi-introducer rows are broken. 5 rows (in VC215) do have non-zero spread commission.
- The issue is concentrated in the specific rows listed in the CSV.
