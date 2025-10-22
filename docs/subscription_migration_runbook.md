# Legacy Subscription Migration Runbook

This runbook describes the operational steps for migrating the legacy workbook (`docs/VERSO DASHBOARD_V1.0.xlsx`) into the Supabase database using the tooling implemented in `subscription_migration/`.

## 1. Prerequisites
- Python 3.10+ with access to `pip`.
- Ability to reach the target Supabase Postgres instance with the service-role key (or direct connection string).
- Repo migrations up to date, including `20251215090000_subscription_workbook_staging.sql`.

Install the required Python dependencies inside your virtual environment:

```bash
pip install psycopg[binary]
```

The ETL intentionally avoids heavy packages (pandas/openpyxl), so `psycopg` is the only dependency.

## 2. Configuration
Copy the example JSON and adjust it to match production IDs and FX assumptions:

```bash
cp subscription_migration/config.example.json subscription_migration/config.prod.json
```

Populate the following sections in the new file:

- `status_mapping`: Map free-form workbook statuses (e.g. `settled`, `repaid`, `work in progress`) to the Supabase enum (`pending`, `committed`, `active`, `closed`, `cancelled`).
- `fx_rates`: Provide currency conversion assumptions. Each key is the source currency; `rate` converts to the `to` currency (defaults to `default_target_currency`).
- `vehicles`: For each workbook code (`VC1`…), supply the canonical vehicle name/ID, FX notes, and optional `deal_id` if holdings should be backfilled.
- `investor_overrides`: Map normalized investor names (uppercase, alphanumeric) to existing IDs or creation instructions.

> Tip: Run a dry run first to populate the staging tables, then query `stg_subscription_lines` to help complete the overrides.

## 3. Execution

### 3.1 Dry-Run (staging only)

```bash
python -m subscription_migration.main \
  --workbook docs/VERSO\ DASHBOARD_V1.0.xlsx \
  --config subscription_migration/config.dev.json \
  --database-url "$DATABASE_URL" \
  --executed-by "your.name" \
  --dry-run
```

This command:
1. Registers a row in `subscription_workbook_runs`.
2. Loads all rows into `stg_subscription_summary`, `stg_subscription_lines`, and `stg_subscription_tranches`.
3. Leaves `run_state = 'loaded'` but skips final inserts.

### 3.2 Full Load

After verifying the staging data and updating the config, rerun without `--dry-run`:

```bash
python -m subscription_migration.main \
  --workbook docs/VERSO\ DASHBOARD_V1.0.xlsx \
  --config subscription_migration/config.prod.json \
  --database-url "$DATABASE_URL" \
  --executed-by "your.name"
```

On success:
- Subscriptions are upserted per `(investor_id, vehicle_id)`.
- `entity_investors` linkage is refreshed with allocation statuses.
- Optional `investor_deal_holdings` rows are created when `deal_id` is provided.
- `subscription_import_results` stores the generated IDs for rollback/audit.

If any error occurs, the transaction rolls back and the run is marked `failed`.

## 4. Validation Queries

Run the SQL snippets from `database/subscription_migration_validation.sql` to validate:

- Vehicle commitment totals vs. workbook summary.
- Investors missing allocations or with zero commitments.
- Residual staging rows that failed to map because of missing overrides.

Example quick checks:

```sql
-- Totals per vehicle from live subscriptions
select v.name, sum(s.commitment) as committed_usd
from public.subscriptions s
join public.vehicles v on v.id = s.vehicle_id
where s.acknowledgement_notes ->> 'run_id' = '<RUN_ID>'
group by 1
order by 1;

-- Confirm entity_investors have linked subscriptions
select vehicle_id, investor_id
from public.entity_investors
where subscription_id is null;
```

## 5. Rollback

If you need to rollback a run:

```sql
begin;
delete from public.investor_deal_holdings
 where id in (
   select investor_deal_holding_id
   from subscription_import_results
   where run_id = '<RUN_ID>' and investor_deal_holding_id is not null
 );

delete from public.entity_investors
 where id in (
   select entity_investor_id
   from subscription_import_results
   where run_id = '<RUN_ID>' and entity_investor_id is not null
 );

delete from public.subscriptions
 where id in (
   select subscription_id
   from subscription_import_results
   where run_id = '<RUN_ID>' and subscription_id is not null
 );

delete from public.subscription_import_results
 where run_id = '<RUN_ID>';

delete from public.subscription_workbook_runs
 where id = '<RUN_ID>';

commit;
```

Re-run the ETL after applying configuration fixes.

## 6. Monitoring & Handover
- Ensure the staff and investor portals render the new data (`/api/entities/[id]/investors`, investor dashboard KPIs).
- Tag the run in your ops log with the workbook hash printed by the script for audit.
- Keep the staged tables for at least one reconciliation cycle; they can be truncated once the data is certified.

