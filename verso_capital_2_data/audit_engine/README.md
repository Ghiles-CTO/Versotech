# VC2 Audit Engine

Deterministic, rule-driven reconciliation for VC2 data:

- Dashboard (`VERSO DASHBOARD_V1.0.xlsx`)
- Production DB (Supabase REST with service role key)
- Contacts/roles file (`VERSO Capital 2 SCSp Emails and Contacts.xlsx`)

This audit validates:

- Subscriptions parity (count and sums by vehicle)
- Position units parity vs dashboard ownership
- Zero-ownership exclusion rule
- Status/funded rules
- Introduction and commission integrity checks
- Broker/introducer policy checks from explicit rules

## Files

- `run_vc2_audit.py` - main runner
- `rules_vc2.json` - all audit rules and policy assumptions
- `output/` - generated audit reports (JSON/CSV/Markdown)

## Run

From repository root:

```bash
python3 verso_capital_2_data/audit_engine/run_vc2_audit.py
```

Optional:

```bash
python3 verso_capital_2_data/audit_engine/run_vc2_audit.py \
  --rules verso_capital_2_data/audit_engine/rules_vc2.json \
  --outdir verso_capital_2_data/audit_engine/output
```

## Environment

Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

## Notes

- This is read-only. It does not mutate DB.
- Rules are explicit and versioned in `rules_vc2.json`.
- If rules change (naming, broker policy, split policy), update the rules file first, then rerun.
