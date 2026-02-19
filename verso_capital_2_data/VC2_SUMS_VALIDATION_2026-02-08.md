# VC2 Sums Validation (2026-02-08)

Scope:
- Dashboard source: `verso_capital_2_data/VERSO DASHBOARD_V1.0.xlsx`
- DB source: production DB (`vehicles/deals/subscriptions/introducer_commissions`)
- Export source: `verso_capital_2_data/VC2_Subscriptions_Introducers.xlsx` (`Subscriptions_Review`)

Method:
- Subscription sums compared as:
  - Dashboard active rows (`OWNERSHIP POSITION > 0`) vs DB subscriptions
- Introducer commission sums compared as:
  - Dashboard all rows (partner+introducer fee blocks) vs DB `introducer_commissions`
  - Export sums vs DB (from `Introducer 1/2 Commission` columns)
- VC203 handled with sheet rule:
  - Dashboard VC203 includes rows with vehicle codes `VC203`, `VCL001`, `VCL002`
  - DB comparison for VC203 sheet uses combined totals of those three vehicle codes.

## Result Summary

### Subscription fields (all VC2 sheets in scope)
All matched exactly (or rounding noise only):
- committed amount
- funded amount
- shares
- ownership units
- spread fee amount
- subscription fee amount
- BD fee amount
- FINRA fee amount

Sheets checked:
- VC201, VC202, VC203(+VCL001+VCL002), VC206, VC207, VC209, VC210, VC211, VC215

### Introducer commission fields
- Fully matching dashboard+DB:
  - VC201, VC202, VC203, VC206, VC210, VC211
- Expected rule-based differences (DB intentionally lower than dashboard):
  - VC207: -26,138.70 (broker/flow rules previously applied)
  - VC209: -207,680.50 (broker/flow rules previously applied)
  - VC215: -140,722.41 invested amount, +0.01 spread rounding (Browley 1% rule + cleanup)

### Export (`VC2_Subscriptions_Introducers.xlsx`) vs DB
- Subscription columns in export match DB.
- Introducer commissions in export match DB for rows represented in export.
- Important: export is subscription-row based, so commission rows that remain without subscriptions are not represented as extra standalone lines.

## VC206 Client Complaint Root Cause (confirmed)
- DB total introducer invested amount (VC206): `473,766.53`
- Export VC206 introducer invested amount: `62,960.28`
- Gap: `410,806.25`

Confirmed cause:
- VC206 has commission rows for investors without active subscriptions in DB export scope.
- Those orphan commission totals are exactly `410,806.25`.
- Therefore, totals differ if client compares full commission ledger vs subscription-row export.

## VC206 Export Fix Applied
- File updated: `verso_capital_2_data/VC2_Subscriptions_Introducers.xlsx`
- Added `5` `commission_only` rows in `Subscriptions_Review` for VC206 orphan commission investors.
- Post-fix verification:
  - VC206 export introducer invested total = `473,766.53`
  - VC206 DB introducer invested total = `473,766.53`
  - Delta = `0.00`

## Tobias ENSELE Check (VC203)
- Confirmed present with 2 introducers in DB and export:
  - Renaissance Bridge Capital LLC
  - Old City Securities LLC

## Browley Check (VC215)
- No `Browley` introducer rows remain in `introducer_commissions` for VC215.
- Adjusted logic remains reflected in current DB totals.

## Changes in this validation run
- No DB changes.
- No export changes.
- Read-only validation only.
