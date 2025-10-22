# Subscription Migration Execution Plan (JM skipped)

This checklist captures the remaining work to load the legacy workbook into Supabase, following the latest dry-run that staged data under run `238e7ddd-eda4-46f7-a28f-a0206f1fe21d` (see `docs/subscription_migration_reconciliation.md` for variance details) and the successful import run `8715c3f2-d8be-4b87-b9c8-54be639012f2`.

## 1. Outstanding fixes before the real import
- **Vehicle sheet parsing:** ✅ Implemented — both VC1 and VC2+ layouts now stage 626 investor rows. Keep an eye on future layout changes.
- **Investor overrides:** populate `subscription_migration/config.dev.json` (or a prod copy) with overrides for high-frequency investors such as “Julien Machot”, “Bondpartners”, etc. Include a `DEFAULT` rule to auto-create missing entities.
- **Vehicle configuration:** config now lists all `VC*` codes with currencies/FX. Update the prod copy with canonical vehicle IDs and any deal mappings before go-live.
- **Data quality review:** reconcile the vehicles called out in `subscription_migration_reconciliation.md` (VC4, VC1, VC35, VC3, VC34, VC25, VC2, VC24, VC28, VC7, VC6, VC21) so investor rows match the business totals. Decide how to treat write-offs, duplicate draws, or mislabelled vehicles.
- **Escrow / VEGINVEST handling:** confirm which tranche rows should flow into `stg_subscription_tranches` versus remain as reference-only, and whether “Extra Gains for JM” merits a downstream field.

## 2. Pre-flight validation
- Rerun the dry-run after updating the parser/config.
- Verify staging counts: expect 45 summary rows, ~625 investor rows, and 80+ tranche records (depending on workbook edits).
- Check random samples:
  - `stg_subscription_lines` totals per vehicle vs. Summary `Amount Invested` (resolve variances noted in the reconciliation doc).
  - Investor names normalize cleanly (no blank strings or “nan” entries).
  - `price_per_share` populated for VEGINVEST rows after the schema change.

## 3. Production load
1. Snapshot current live tables (`subscriptions`, `entity_investors`, `investor_deal_holdings`) or export them for backup.
2. Run the ETL **without** `--dry-run`, using the updated config and workbook hash check, once reconciliation items are resolved.
3. Confirm `subscription_workbook_runs.run_state = 'loaded'` for the new run.

## 4. Post-load checks
- Totals: compare per-vehicle commitments from `subscriptions` against Summary tab figures.
- Spot-check key investors (e.g., Julien Machot) to confirm multi-vehicle commitments landed.
- Review `subscription_import_results` to ensure each staged row produced a subscription and linkage.

## 5. Rollback (if needed)
- Use the SQL block in `docs/subscription_migration_runbook.md` keyed by `run_id` to remove inserted subscriptions, entity links, and holdings.
- Delete the run record last to preserve audit history if partial rollback is required.

The JM tab stays out of scope for now; once the investor/deal view is reconciled, we can decide whether to import those rows as workflow tasks or ignore them.
- `subscription_import_results` now records 496 inserted/updated subscriptions tied to run `8715c3f2-d8be-4b87-b9c8-54be639012f2`; review this table for reconciliation or rollback.
