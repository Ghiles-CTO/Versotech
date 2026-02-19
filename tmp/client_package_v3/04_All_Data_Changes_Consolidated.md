# VERSO Capital Data Changes Register

This file lists all documented reconciliation actions in business-readable form.

## Complete action register

| Checkpoint | Scope | Area changed | Business action | Rows |
|---|---|---|---|---:|
| 2026-02-11 | VC209 | subscriptions | UPDATE (3 fields) | 7 |
| 2026-02-11 | IN103 | subscriptions | UPDATE (1 field) | 4 |
| 2026-02-11 | IN103 | introducer_commissions | DELETE (duplicates) | 4 |
| 2026-02-11 | IN111 | subscriptions | UPDATE (1 field) | 1 |
| 2026-02-11 | IN (rules) | IN rulebook | ADD ruled diffs | — |
| 2026-02-11 | IN (engine) | IN validation engine | ADD spread ruled diff support | — |
| 2026-02-11 | VC1 Dedup | investors | DELETE (3 duplicate records) | 3 |
| 2026-02-11 | VC1 Dedup | investors | UPDATE email (1 row) | 1 |
| 2026-02-11 | VC1 Dedup | subscriptions | UPDATE investor_id | 3 |
| 2026-02-11 | VC1 Dedup | positions | UPDATE investor_id | 2 |
| 2026-02-11 | VC1 Dedup | positions | UPDATE units (merge) | 1 |
| 2026-02-11 | VC1 Dedup | positions | DELETE (merged into survivor) | 1 |
| 2026-02-11 | VC1 Dedup | introductions | UPDATE prospect_investor_id | 3 |
| 2026-02-11 | VC1 Dedup | introducer_commissions | UPDATE investor_id | 4 |
| 2026-02-11 | VC1 Dedup | entity_investors | DELETE (overlapping) | 5 |
| 2026-02-11 | VC1 Dedup | investor_risk_profiles | DELETE (discard records) | 24 |
| 2026-02-11 | VC1 | subscriptions | UPDATE deal_id (was NULL) | 12 |
| 2026-02-11 | VC126 | subscriptions | UPDATE bd_fee_amount (was = percent) | 2 |
| 2026-02-11 | VC106/VC113/VC126 | introducer_commissions | DELETE (exact duplicates) | 11 |
| 2026-02-11 | VC122 | subscriptions | UPDATE (fill NULL fields from dashboard) | 6 |
| 2026-02-11 | VC106 | subscriptions | UPDATE bd_fee_percent (was NULL, amount existed) | 8 |
| 2026-02-11 | VC106 | subscriptions | UPDATE finra_shares (was NULL) | 6 |
| 2026-02-11 | VC106 | subscriptions | UPDATE performance_fee_tier1_percent (bulk) | 96 |
| 2026-02-11 | VC126 | introducer_commissions | DELETE (stale 01-16 spread dupes) | 11 |
| 2026-02-11 | VC106 | introducer_commissions | DELETE (empty CABIAN artifact) | 1 |
| 2026-02-11 | VC1 (rules) | VC1 rulebook | ADD commission spread ruled diffs (VC113, VC114) | — |
| 2026-02-11 | VC125 | introducer_commissions | INSERT (missing commissions) | 7 |
| 2026-02-11 | VC126 | introducer_commissions | INSERT (OEP/MACHOT spread 770) | 1 |
| 2026-02-11 | VC126/VC122 | introducer_commissions | DELETE (extra rows) | 3 |
| 2026-02-11 | VC126 | introducer_commissions | DELETE (Anand spread dupes) | 3 |
| 2026-02-11 | VC106 | introducer_commissions | INSERT (LE SEIGNEUR 2nd row) | 1 |
| 2026-02-11 | VC113 | introducer_commissions | INSERT (Zandera 2nd row) | 1 |
| 2026-02-11 | VC106/VC113 | introducer_commissions | UPDATE base_amount (dedup) | 2 |
| 2026-02-11 | VC122 | subscriptions | UPDATE price_per_share → 1.0 | 3 |
| 2026-02-11 | VC111 | subscriptions | UPDATE (BAUMSLAG/FINALMA swap) | 2 |
| 2026-02-11 | VC113 | subscriptions | UPDATE (MACHOT/OEP perf1 swap) | 2 |
| 2026-02-11 | VC1 (rules) | VC1 rulebook | ADD VC106 spread ruled diff (0.058) | — |
| 2026-02-11 | IN103 | introducer_commissions | INSERT (Set Cap performance_fee tier1) | 7 |
| 2026-02-11 | IN106 | introducer_commissions | INSERT (Set Cap performance_fee tier1) | 1 |
| 2026-02-13 | VC1 Engine | VC1 validation engine | Ignore zero-amount DB commission rows in row-count/split parity checks | — |
| 2026-02-13 | VC1 Engine | VC1 validation engine | Apply ruled fallback mapping for commission rows with no subscription row-map | — |
| 2026-02-13 | VC1 Engine | VC1 validation engine | Zero-ownership check uses raw dashboard identity (no fallback alias) | — |
| 2026-02-13 | VC1 Rules | VC1 rulebook | Add ruled fallback pair `VC126 OEP Ltd -> Julien MACHOT` | — |
| 2026-02-13 | VC1 Rules | VC1 rulebook | Set `max_introducers_per_subscription` from 2 to 3 | — |
| 2026-02-13 | VC1 Rules | VC1 rulebook | Add `cost_per_share` and `ownership` to `vehicle_totals_skip_metrics` | — |
| 2026-02-13 | VC1 Rules | VC1 rulebook | Add VC113 investor alias `Zandera (Finco) Limited -> Zandera (Holdco) Limited` | — |
| 2026-02-13 | VC106 | subscriptions | Update `performance_fee_tier1_percent` to match dashboard for 5 rows | 5 |
| 2026-02-13 | VC106/VC114 | positions | Update Julien MACHOT units to dashboard ownership | 2 |
| 2026-02-13 | Zandera merge | introductions | Move Finco introductions to Holdco | 5 |
| 2026-02-13 | Zandera merge | introducer_commissions | Move Finco commissions to Holdco | 10 |
| 2026-02-13 | Zandera merge | introducer_commissions | Re-link FK from duplicate introduction IDs to kept IDs | 6 |
| 2026-02-13 | Zandera merge | introductions | Delete duplicate Holdco introduction links after merge | 3 |
| 2026-02-13 | Zandera merge | investors | Delete `Zandera (Finco) Limited` investor record | 1 |
| 2026-02-14 | Dashboard reference | verso_capital_2_data/VERSO DASHBOARD_V1.0.xlsx | New upload used as source of truth for VC122 row 12 introducer block | — |
| 2026-02-14 | VC122 | introducer_commissions | INSERT missing invested commission for LF GROUP + Pierre Paumier | 1 |
| 2026-02-14 | VC1 Audit | VC1 validation engine | Re-run after insert | — |
| 2026-02-14B | VC1 engine | VC1 validation engine | Added commission-status validation + currency parity validation | — |
| 2026-02-14B | VC2 engine | VC2 validation engine | Added commission-status validation + currency parity validation | — |
| 2026-02-14B | IN engine | IN validation engine | Added commission-status validation + currency parity validation | — |
| 2026-02-14B | VC1 rules | VC1 rulebook | Enabled `commission_status_must_be_paid` + `currency_must_match_dashboard_when_present` | — |
| 2026-02-14B | VC2 rules | VC2 rulebook | Enabled `commission_status_must_be_paid` + `currency_must_match_dashboard_when_present` | — |
| 2026-02-14B | IN rules | IN rulebook | Enabled `commission_status_must_be_paid` + `currency_must_match_dashboard_when_present` | — |
| 2026-02-14B | VC2 data | introducer_commissions | Updated non-paid commission statuses to `paid` | 9 |
| 2026-02-14B | Audit docs | Independent audit report | Updated to reflect post-remediation state | — |
| 2026-02-14B | Coverage matrix | Rule coverage register | Updated rule statuses (`R11`, `R45`) to implemented | — |


## What this register covers

- Subscription value corrections
- Position ownership corrections
- Introducer and commission cleanup, insertions, deletions, and reallocations
- Duplicate identity consolidation work
- Rulebook and validator hardening steps


## Source checkpoint records

- DB_CHANGES_CHECKPOINT_2026-02-11.md
- DB_CHANGES_CHECKPOINT_2026-02-13.md
- DB_CHANGES_CHECKPOINT_2026-02-14.md
- DB_CHANGES_CHECKPOINT_2026-02-14B.md
