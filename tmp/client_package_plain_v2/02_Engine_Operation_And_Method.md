# How The Validation Works

## Why this was done

The goal is simple: confirm that the dashboard and the database tell the same story for each investor, each vehicle, and each fee.

## Scope covered

- VC1
- VC2
- IN

## Step-by-step process

1. Collect the latest dashboard file and database records.
2. Apply approved naming rules so the same person/entity is matched correctly even when names are written differently.
3. Match records line by line between dashboard and database.
4. Compare all important values for each matched line.
5. Validate introducer and commission allocations, including split cases.
6. Check structural quality (for example: broken links, duplicate identities).
7. Produce mismatch reports.
8. Apply documented corrections.
9. Re-run validation until no unresolved mismatches remain.

## What was validated

- Subscription values (commitment, shares, ownership, dates, fee fields).
- Position values (ownership totals by investor and by vehicle).
- Introducer and commission values (amounts, splits, duplicates, status).
- Data structure consistency (links and identity consistency).

## Important clarification

All financial value columns in scope were validated.

When names differ in format, approved mapping rules are used only to match the same party correctly. Value checks still run on the matched record.

## Why this is reliable

- Repeatable process: same input gives same result.
- Rule-controlled process: documented business rules are applied consistently.
- Evidence-based process: every run produces traceable output.
