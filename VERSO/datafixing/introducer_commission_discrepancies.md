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
- Name mapping updated per client rules: `Anand` → `Setcap`, `Dan` → `Daniel Baumslag`, `Anand+Dan` → `Setcap+Daniel Baumslag`.
- Elevation+Rick rule enforced: only Rick (Altras) as introducer with 5% subscription fee and $150 spread for the VC133 opportunity.

Resolved
- VC106 Manna Capital: fixed missing spread commissions and reassigned CHANG from Moore & Moore to Manna. DB totals now match dashboard (spread 40,000).
- Rick + Andrew: commissions reassigned to Altras Capital Financing Broker; introducer record removed.
- VC133 ZANDERA (Elevation+Rick): sub-fee corrected to 5% ($50,000) and spread set to $150 per share (DB amount $96,750).
- VC133 subscriptions + introductions: introducer_id aligned to Rick (Altras) per rule.
- Subscription introducer alignment: for investor+vehicle pairs with a single introducer in commissions, subscriptions were updated to match.

Open discrepancies (dashboard vs DB)
- VC133: dashboard still splits totals across Elevation/Setcap/Elevation+Rick, but DB consolidates to Rick (Altras) per rule; mismatch is expected and not a data error.
- Minor rounding deltas in aggregate comparison (e.g., VC113 Setcap spread +0.0125; VC125 sub-fee +0.0012; VC126 Setcap spread -0.00776).

Commissions vs subscriptions
- 39 commission records have no matching subscription (investor+vehicle). Requires manual review against dashboard/contract refs.
- 109 commission records belong to investor+vehicle pairs with multiple introducers, so subscriptions cannot represent all introducers (single introducer_id limit).

Partner/Introducer overlap
- Partner entries are treated as introducers in this workflow; duplicate identities were merged (Dan → Daniel Baumslag, Anand → Setcap).
