# Legacy Workbook → Portal Data Mapping (JM excluded)

This guide describes how the legacy `VERSO DASHBOARD_V1.0.xlsx` workbook feeds the Supabase staging tables used by the ETL. The focus is on the tabs we are keeping (`Summary`, the vehicle sheets `VC1`–`VC43`, `VEGINVEST`, and the 2022 escrow ledgers). The `JM` tab is intentionally skipped for now.

## Summary tab (`Summary`)
- **Column B “Compartments”** → `stg_subscription_summary.vehicle_code`; drives vehicle lookups and FX hints.
- **Column C “Opportunity”** → `stg_subscription_summary.vehicle_name`; used when creating or matching `public.vehicles`.
- **Column D “Initial Stage”** → `stg_subscription_summary.stage`; carried into notes for allocations.
- **Column E “Amount Invested”** → `stg_subscription_summary.amount_invested`; reconciled against the sum of staged investor lines.
- **Column F “Total Fees”** → `stg_subscription_summary.total_fees`; surface in staging for audit only.
- **Column G “Fees ratio”** → stored inside `raw_data`; no direct target column yet.
- **Columns H–N (VERSO fees & performance fees)** → stored in `raw_data` for downstream fee automation.
- **Columns P–R (FX hints, e.g., “CHF > USD”, rate, note)** → `stg_subscription_summary.fx_rate` and `.fx_source`; feed default FX rates when vehicle config omits them.
- During the live load, the ETL multiplies each vehicle’s staged investor totals by a scaling factor (if needed) so the final commitments exactly match the “Amount Invested” figure on this tab. The factor and rounding adjustment are preserved in `subscriptions.acknowledgement_notes.vehicle_level_adjustment`.

## Vehicle tabs (`VC1` legacy layout)
- **Column C “Counterparty”** → `stg_subscription_lines.investor_display_name` (also split into first/last names).
- **Column D “Vehicle”** → `stg_subscription_lines.vehicle_code`.
- **Column E “Nominal”** → `stg_subscription_lines.nominal_amount`; used as original-currency commitment.
- **Column F “Note Price”** → `stg_subscription_lines.price_per_share`.
- **Column H “Price” / Column J “Amount”** → `stg_subscription_lines.amount_converted` and `.cash_amount`; the ETL prefers the J column for USD totals.
- **Column K “Fees %” / Column L “Fees”** → `stg_subscription_lines.fee_percent` and `.fees_amount`.
- **Columns M–O (Order / TD / SD)** → ISO dates in `order_date`, `trade_date`, `settlement_date`; earliest date is used as `subscriptions.committed_at`.
- **Column P “Trade Status”** → normalized into `stg_subscription_lines.status_raw` / `.status_mapped`, then mapped to `subscriptions.status`.
- **Columns Q–R (ISIN, Settlement at)** → audit metadata stored in staging and copied to subscription notes.
- **Column S “Comments”** (when present) → `stg_subscription_lines.comments`.

## Vehicle tabs (`VC2`+ wide layout)
- **Columns F–H (Investor Last/Middle/First)** → concatenated into `investor_display_name`, `investor_entity`.
- **Column J “Vehicle”** → vehicle code (same as tab name when populated).
- **Column K “Amount invested”** → base amount; converted using config FX into `amount_converted`.
- **Column L “Price per Share”** → `price_per_share`.
- **Column M “Number of shares invested”** → stored in `raw_data` for equity analytics; not mapped yet.
- **Column N “Ownership position”** → `ownership_percent`.
- **Column O “Contract Date”** → `order_date`.
- **Columns P–W (Spread, Subscription/Performance fees, Thresholds)** → `fee_percent`, `fees_amount`, and captured in `raw_data`.
- **Column AA “Comments” / Column AB “TO DO”** → combined and stored in `comments` / `notes` for operations follow-up.
- Additional duplicated fee columns (AL–BC, etc.) → preserved in `raw_data` for manual modelling; not dispatched to live tables.

## VEGINVEST tab
- **Column B “TRANCHES”** → `stg_subscription_tranches.tranche_name`.
- **Columns C–F (Shares sold/bought, PPS, Amount Invested)** → `stg_subscription_tranches.amount` and the soon-to-be-added `price_per_share`.
- **Columns G–L (Diff, Comments, Extra Gains)** → retained in `raw_data`; these drive quarterly reporting but are not fed to subscriptions.

## Escrow tabs (`2022 * Escrow account`)
- **Column D “Opération”** → `stg_subscription_tranches.tranche_name` (ledger entry description).
- **Columns E–G (Date, Date valeur, Date comptable)** → captured in `raw_data`; potential future enhancement to reconciliation.
- **Column H “Montant” & Column I “Devise”** → `stg_subscription_tranches.amount` and `.currency`.
- **Columns J–L (Bénéficiaire, Compte bénéficiaire, Communication)** → stored in `raw_data` for KYC/AML evidence.

## Key gaps identified
- `stg_subscription_tranches` lacks a `price_per_share` column even though the ETL inserts it; we will add this column.
- Some vehicle tabs mix currencies; ensure `config.*.fx_rate` is filled for any non-USD vehicles before running the full load.
- Investors such as “Julien Machot” appear across many tabs; confirm `subscription_migration/config.*.json` has overrides (or a DEFAULT rule) so lookups do not fail.
