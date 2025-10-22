# Subscription Workbook Reconciliation (Run `238e7ddd-eda4-46f7-a28f-a0206f1fe21d`)

Dry-run `python -m subscription_migration.main ... --dry-run` now stages 45 summary rows, 626 subscription line items, and 81 tranche / escrow ledger rows. The table below compares the staged investor totals with the “Amount Invested” column on the `Summary` tab for each vehicle. When the loader runs without `--dry-run`, each vehicle’s commitments are scaled automatically to match the summary total (the scale metadata is stored in `acknowledgement_notes.vehicle_level_adjustment`), but the staged raw sums are useful to spot data quality issues before the live run.

| Vehicle | Summary Amount | Rows | Raw Sum | USD Sum | Diff (summary - raw) |
|---------|----------------:|-----:|--------:|--------:|---------------------:|
| VC4 | 5,454,430.34 | 30 | 7,964,430.34 | 7,964,430.34 | -2,510,000.00 |
| VC1 | 2,216,470.26 | 9 | 1,320,000.00 | 1,397,338.80 | 896,470.26 |
| VC35 | 589,132.50 | 0 | 0.00 | 0.00 | 589,132.50 |
| VC3 | 2,341,687.47 | 31 | 2,866,687.42 | 2,866,687.42 | -524,999.95 |
| VC34 | 2,613,065.70 | 7 | 3,055,000.00 | 3,233,992.45 | -441,934.30 |
| VC25 | 3,185,886.98 | 34 | 2,792,111.35 | 2,792,111.35 | 393,775.63 |
| VC2 | 575,003.00 | 8 | 825,003.00 | 873,339.93 | -250,000.00 |
| VC24 | 722,334.07 | 12 | 611,772.70 | 816,747.15 | 110,561.37 |
| VC28 | 333,762.50 | 3 | 250,000.00 | 250,000.00 | 83,762.50 |
| VC7 | 603,942.00 | 5 | 678,942.05 | 678,942.05 | -75,000.05 |
| VC6 | 74,155,202.84 | 218 | 74,215,202.84 | 84,673,311.09 | -60,000.00 |
| VC21 | 106,534.00 | 2 | 100,000.00 | 100,000.00 | 6,534.00 |

All other vehicles reconcile to within a few dollars (or have no staged rows yet). Key observations for the outliers:

- **VC4 (`JUST WARRANTS`)** – Sheet contains 30 placements (total 7.96 M). The summary tab only carries 5.45 M, so 2.51 M appears to be written off or already repaid. Because there is no status flag in these rows, the ETL will treat them as active unless we annotate the workbook or filter specific investors.
- **VC1 (`CRANS`)** – Summary shows 2.22 M versus 1.32 M (raw) / 1.40 M (USD) staged. Manual review suggests the summary includes accrued interest adjustments that are not itemised per investor. Decide whether to load investor amounts as-is and adjust downstream KPIs or enrich the sheet with the extra cash flows.
- **VC35 (`MEYRIN ACQUISITION`)** – Summary expects 589 k, but the worksheet points column `Vehicle` to `VC34`, so those rows flow into VC34. Either fix the workbook (set the column to VC35) or teach the parser to prefer the sheet name for that tab.
- **VC3 (`NITRO COFFEE EXCHANGE`)** – Investor rows total 2.87 M. The summary is 2.34 M, suggesting that some entries (e.g. duplicate draws or advisory lines) should be dropped. Several repeated investors (Julien Machot, AURIER Serge) appear multiple times.
- **VC34 (`MEYRIN REAL ESTATE`)** – Includes the VC35 placements plus its own rows, so it overshoots the summary by ~0.44 M (or 0.62 M in USD after conversion). Resolving the VC35 labeling will shrink this gap.
- **VC25 (`UMIAMI`)** – Staged total is 3.18 M vs. 2.79 M in the investor rows. Confirm whether the extra 394 k reflects FX adjustments or investors missing from the sheet.
- **VC2 (`ISDC`)** – Summary 575 k versus 825 k staged. The extra 250 k stems from entries recorded on VC1 that reference “Vehicle = VC2”. Validate if that subscription is still active.
- **VC24, VC28, VC7, VC6, VC21** – Smaller variances (≤110 k) likely driven by FX rates, write-offs, or missing rows. Validate each before the final import. In VC6’s case the converted total overshoots the summary by ~10 M because every EUR row is converted at 1.14103; confirm that this is the intended FX basis or adjust the config per tranche.

## Recommended follow-up

1. **Vehicle-by-vehicle audit:** For the vehicles listed above, reconcile the staged investor rows with internal ledgers to decide which entries should be loaded, removed, or reclassified before the live run.
2. **Workbook corrections:** Where the sheet mislabels the `Vehicle` column (VC35 → VC34) update the workbook so the ETL need not special-case it.
3. **Status/Fee annotations:** If retired placements should be excluded, add a status value (e.g. “repaid”) so the status-mapping logic can drop them, or extend `config.dev.json` with vehicle-specific filters.
4. **FX validation:** Confirm per-vehicle FX assumptions for CHF/EUR/GBP funds to ensure the converted USD totals match the expected summary numbers.
