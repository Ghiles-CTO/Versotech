# Introducer Cleanup Actions (Stableton+Terra, Denis, GEMERA)

## Stableton+Terra → Terra Financial & Management Services SA
Rule: when dashboard shows “Stableton+Terra”, keep **Terra** only.

Applied (via REST updates):
- Moved references from introducer `cca3a4b2-5a53-464a-8387-1ad326a168ed` (Stableton+Terra) to Terra `1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d`.
  - `introducer_commissions`: 2 rows updated
  - `introductions`: 1 row updated
  - `subscriptions`: 1 row updated
- Deleted introducer `cca3a4b2-5a53-464a-8387-1ad326a168ed`.

Evidence (dashboard): `VERSO/datafixing/VERSO DASHBOARD_V1.0.xlsx` → sheet `VC11`, row 6 shows “Stableton+Terra”.

## Denis Matthey duplicate
- Duplicate introducer `d02fa991-187d-4a20-b050-e88c28d40f29` had **0 commissions / 0 introductions / 0 subscriptions**.
- Deleted unused introducer.

## GEMERA Consulting Pte Ltd duplicate
Two introducer IDs existed:
- Old: `61e01a81-0663-4d4a-9626-fc3a6acb4d63`
- Canonical (kept): `87571ef2-b05d-4d7d-8095-2992d43b9aa8`

No overlapping deal+investor pairs between the two IDs, so safe to merge.
Actions:
- Deleted duplicate introduction with `deal_id = NULL` (id `d423b369-f80f-47ae-a51d-875384f0d586`) to avoid duplicate after merge.
- Updated references from old → canonical:
  - `introducer_commissions`: 7 rows updated
  - `introductions`: 4 rows updated
  - `subscriptions`: 5 rows updated
  - `fee_plans`: 1 row updated (`aa53b3b8-4b69-4803-a049-284a4d529e47`)
- Deleted old introducer `61e01a81-0663-4d4a-9626-fc3a6acb4d63`.

Detail file: `VERSO/datafixing/gemera_commissions_split.csv`
