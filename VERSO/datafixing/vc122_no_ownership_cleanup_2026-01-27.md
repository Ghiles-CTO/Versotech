# VC122: Removed Subscriptions With Missing Ownership (2026-01-27)

Rule applied: if dashboard ownership/shares are missing, the subscription should not exist in DB.

Deleted VC122 subscriptions (no ownership + no shares in dashboard):
- AS ADVISORY DWC LLC — 100,000 — 2022-10-28 — `5848cf6c-753a-4caa-a784-949f3b7a9d29`
- Deyan MIHOV — 75,000 — 2022-10-28 — `12fc60a8-1f50-45f9-8a41-a7e25fb5cafa`
- Sheikh Yousef AL SABAH — 50,000 — 2022-01-11 — `6a6b7c42-1e7a-4fa7-8ec9-a659d9adc955`
- VERSO CAPITAL ESTABLISHMENT — 25,000 — 2022-03-11 — `3753889e-6ea9-425a-8675-3f62bfc04e91`
- LF GROUP SARL — 75,000 — 2024-01-27 — `ad28dbe9-513d-464b-bc36-5a6d090ad523`

Reconciliation after cleanup:
- DB subscriptions: 487
- DB positions: 405
- Dashboard active rows: 487
- Unknown ownership rows: 5 (VC122; excluded from active matching)
- DB-only: 0; Dashboard-only: 0; Value mismatches: 0; Position mismatches: 0

Code rule change:
- `work/live_reconcile.py`: ownership-missing rows on sheets that *do* have an ownership column are no longer treated as active.
