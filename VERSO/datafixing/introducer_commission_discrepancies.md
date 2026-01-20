# Introducer/Partner Commission Discrepancy Report (Dashboard vs supabase_new)

Sources
- `VERSO/datafixing/VERSO DASHBOARD_V1.0.xlsx` (introducers + partners sections)
- `VERSO/datafixing/introducers name change.csv` (name/contact mapping)
- `supabase_new` (tables: introducers, introducer_commissions, subscriptions, vehicles, deals)

Method
- Extract introducer/partner sections from each VC sheet (right-side tables).
- Map names using the client-provided name-change file plus known aliases.
- Aggregate dashboard totals per VC + introducer (subscription fee amount + spread fee amount).
- Compare to supabase_new introducer_commissions totals (basis_type: invested_amount, spread).

Notes
- The left-side investor columns vary across sheets (columns shift), so per‑investor reconciliation is unreliable without manual review.
- Name mapping ambiguities: `Sandro` vs `Sandro Lang`, `Anand` vs `Anand Sethia`/`Sitcap`.
- Elevation+Rick special rule applied in DB: spread set to 150 per share for ZANDERA (VC133), so DB is intentionally lower than dashboard (dashboard still shows 175 per share).

Resolved
- VC106 Manna Capital: fixed missing spread commissions and reassigned CHANG from Moore & Moore to Manna. DB totals now match dashboard (spread 40,000).

Open discrepancies (dashboard vs DB)
- VC106 VERSO BI: sub_fee 409,788.9488 vs 404,038.90 (diff -5,750.0488); spread 3,175,841.192 vs 3,138,330.13 (diff -37,511.062).
- VC111 Julien: sub_fee 9,000 vs 11,000 (diff +2,000).
- VC111 Terra Financial & Management Services SA: sub_fee 13,300 vs 12,300 (diff -1,000).
- VC113 Altras Capital Financing Broker: sub_fee 47,200 vs 46,200 (diff -1,000).
- VC113 Terra Financial & Management Services SA: sub_fee 26,050 vs 23,050 (diff -3,000).
- VC126 Alpha Gaia: sub_fee 6,000 vs 5,000 (diff -1,000).
- VC126 Giovanni SALADINO: spread 28.09453 vs 0.
- VC126 Moore & Moore Investments Ltd: spread 27.5 vs 0.
- VC126 Simone: spread 20 vs 0.
- VC133 Altras Capital Financing Broker: spread 112,875 vs 96,750 (intentional due to 150/spread rule).
- VC133 Anand vs DB Anand Sethia: dashboard sub_fee 5,000 / spread 76,267.5 vs DB sub_fee 5,000 / spread 52,080 (mapping ambiguity + spread mismatch).
- VC113 Sandro Lang vs DB Sandro: name mapping mismatch only (DB uses display_name `Sandro`; amounts are present).

Partner/Introducer overlap
- `partners` table contains `Dan` and `Anand+Dan` while matching introducers also exist. This may be intentional but is a potential duplication risk.
