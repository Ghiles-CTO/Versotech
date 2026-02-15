# VC1 Audit Engine

Deterministic, rule-driven reconciliation for VC1 scope.

Checks:
- row-by-row subscription numeric parity
- vehicle totals parity
- position parity vs dashboard ownership
- zero-ownership exclusion rule
- status/funded checks
- introduction/commission integrity

Run:

```bash
python3 data_verification_engine/scopes/vc1/run_vc1_audit.py
```

Rules:
- `data_verification_engine/scopes/vc1/rules_vc1.json`

Output:
- `data_verification_engine/scopes/vc1/output/run_<timestamp>/`
