# How The Validation Was Done

## Objective

Confirm that dashboard data and database data match, investor by investor, vehicle by vehicle.

## Scope Covered

- VC1
- VC2
- IN

## What was checked (business view)

1. Subscriptions
- Commitment, share count, ownership, dates, and fee fields were compared row by row.

2. Positions
- Position units were checked against dashboard ownership totals.

3. Introducers and commissions
- Introducer names were matched using approved name conventions.
- Commission amounts and splits were checked against dashboard values.
- Duplicate commission lines were detected and treated.

4. Data structure quality
- Broken links and duplicate investor identities were checked.
- Subscription and vehicle consistency was checked.

## Important clarification

No financial value was skipped.

All monetary and numeric fields in scope were validated. Name formatting differences (for example, short names vs full legal names) were handled using approved mapping rules so the same party is compared correctly.

## Practical result

The process is repeatable and produces the same answer each run, so reconciliation quality does not depend on manual interpretation.
