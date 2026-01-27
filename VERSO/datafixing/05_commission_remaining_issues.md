# 05 Commission Remaining Decisions (after deep investigation)

1) VC122 / LF GROUP SARL / Pierre Paumier (rows 487–488):
- Dashboard VC22 row 12 has LF GROUP SARL (75,000) but PARTNERS/INTRODUCERS names are blank with all fees = 0.
- No dashboard support for Pierre Paumier here. This conflicts with comment rows.

2) VC125 / Eric SARASIN (rows 502–503):
- Dashboard VC25 row 9 has Sarasin (250,000) with partner Dan + introducer fees 2%/2% but introducer name is blank.
- DB subscriptions for Sarasin are currently linked to Daniel Baumslag (introducer_id).
- Comment rows say Terra as introducer → would require changing introducer linkage.

3) VC125 / MA GROUP AG (row 501) and LF GROUP SARL (row 504):
- MA GROUP: dashboard shows Terra as introducer with sub fee 358, performance fee 0; comment row says 2% performance fee 0 (rate mismatch).
- LF GROUP: dashboard row 36 has no partner/introducer names and no fees → no commission support.

4) VC126 / BSV SPV III LLC (rows 526–527):
- Dashboard VC26 row 34 has no partner/introducer names and all fees 0 → no commission support.

5) VC126 / CLOUDSAFE (row 531):
- Dashboard VC26 row 3 shows partner Anand+Dan (spread 23.75 / 21090) and introducer John (spread 27.5 / 24420).
- Comment row 531 (13.75 / 12210) conflicts → ignored to avoid discrepancy.

6) VC133 / 778 WALNUT LLC (row 554):
- Investor not in dashboard (VC33). Likely typo for 777 WALNUT, which is already fixed.

See full evidence: VERSO/datafixing/05_commission_deep_investigation.md