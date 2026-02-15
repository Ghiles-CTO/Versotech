# IN Audit Engine

Deterministic, rule-driven reconciliation for IN vehicles:

- Dashboard (`INNOVATECH DASHBOARD_V1.xlsx`)
- Production DB (Supabase REST with service role key)

This audit validates:

- Subscriptions parity (count and sums by vehicle)
- Position units parity vs dashboard ownership
- Zero-ownership exclusion rule
- Status/funded rules
- Introduction and commission integrity checks
- Row-level commission matching when dashboard name+amount slots are explicit

## Files

- `run_in_audit.py` - main runner
- `rules_in.json` - all audit rules and policy assumptions
- `output/` - generated audit reports (JSON/CSV/Markdown)

## Run

From repository root:

```bash
python3 data_verification_engine/scopes/in/run_in_audit.py
```

Optional:

```bash
python3 data_verification_engine/scopes/in/run_in_audit.py \
  --rules data_verification_engine/scopes/in/rules_in.json \
  --outdir data_verification_engine/scopes/in/output
```

## Environment

Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

## Notes

- This is read-only. It does not mutate DB.
- Rules are explicit and versioned in `rules_in.json`.
- If rules change (naming, broker policy, split policy), update the rules file first, then rerun.
