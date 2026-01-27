You are auditing Versotech data using the dashboard Excel as source of truth.

Context:
- Repo root: /Users/ghilesmoussaoui/Desktop/Versotech
- Main dashboard: datamigration/VERSO DASHBOARD_V1.0.xlsx
- Innovatech dashboard: VERSO/datafixing/INNOVATECH DASHBOARD_V1.xlsx
- Prior reconciliation outputs live in dashboardreconciliations/, but some are stale (see below).

Critical rules:
1) Dashboard is source of truth for subscriptions/positions.
2) If ownership/units = 0 in dashboard, subscription must be cancelled (or not inserted).
3) Partners = Introducers.
4) Name normalization rules in VERSO/datafixing/* and datamigration/* must be respected.
5) Do not delete or change anything unless you can fully match amounts + shares + dates + vehicle.

Known issue to fix in reconciliation logic:
- VC22/VC122 parsing was wrong. In sheet VC22, OWNERSHIP POSITION is column 17 and
  Number of shares invested is column 16. Any prior mismatches for VC22/VC122 are invalid
  until re-parsed with correct columns.

Already fixed in DB (do not re-report as issues):
- VC102: inserted 2 missing Julien 150k subscriptions; corrected existing 150k row to
  150k shares @ $1.
- VC122: re-parsed VC22 correctly; added missing rows (AS Advisory, Deyan Mihov,
  Sheikh Yousef, Verso Capital Establishment, LF Group), cancelled Julien 99,999.65
  with ownership 0, filled shares/fees and dates.

Tasks:
- Re-run full reconciliation for all VC sheets with correct parsing.
- Identify remaining mismatches (likely VC131, VC133, IN110).
- For each mismatch, show exact dashboard rows vs DB rows and explain why.
- Do NOT apply fixes. Report only.

Output format:
- List remaining mismatched vehicles with counts and totals.
- For each mismatch: candidate DB rows, dashboard rows, why they don't match.
- If anything is ambiguous, call it out.
