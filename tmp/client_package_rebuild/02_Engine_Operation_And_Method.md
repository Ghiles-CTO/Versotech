# How The Verification Engine Works

## Purpose

The engine verifies, in a repeatable way, that dashboard data and DB data are aligned after applying approved business rules.

## Scope

- VC1 (rules version: 2026-02-14.3)
- VC2 (rules version: 2026-02-14.2)
- IN (rules version: 2026-02-14.2)

## What it checks

1. Row-level subscription parity
- Investor-by-investor comparisons of key numeric fields.
- Date and ownership consistency checks.

2. Position integrity
- Position totals and investor ownership alignment.
- Duplicate/zero-unit position protections.

3. Introduction and commission integrity
- Introducer mappings and row-level commission parity.
- Duplicate commission detection.
- Commission-to-introduction link integrity.
- Commission status validation (paid-only policy).
- Currency consistency checks (when dashboard currency is provided).

4. Structural integrity
- Deal linkage checks.
- Duplicate investor identity checks.
- Vehicle consistency checks.

5. Trust gate
- No unresolved failures allowed.
- Warning categories must be explicitly allow-listed.
- Output consistency checks enforced.

## Current scope configurations

| Scope | Sheets | Vehicles | Alias rules | Combined-introducer policy | Specific commission assertions |
|---|---:|---:|---:|---|---:|
| VC1 | 13 | 13 | 53 | fail | 0 |
| VC2 | 9 | 11 | 35 | ignore | 8 |
| IN | 11 | 9 | 19 | ignore | 4 |
