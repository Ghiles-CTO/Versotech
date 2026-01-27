# 05_Introducer_Commissions_FD comments.xlsx – Comment/Format Analysis

Source: `VERSO/datafixing/05_Introducer_Commissions_FD comments.xlsx`
Sheet: `Introducer Commissions`

## Findings
- **Red-highlighted rows:** 78 rows
- **Strikethrough rows:** 29 rows
- **Note rows (text outside table):** 2 rows

## Exports for review
- `VERSO/datafixing/05_commission_red_rows.csv`  
  Rows with any red font/fill; includes which cells are red.
- `VERSO/datafixing/05_commission_strike_rows.csv`  
  Rows with strikethrough cells; includes which cells are struck.
- `VERSO/datafixing/05_commission_notes.csv`  
  Text notes outside the data table.

## Notes found (non‑data rows)
- “What about VC112? VC143?”
- “Where did you record the management fees of VC126 and in other compartments?”

## Guidance needed
- Confirm that **all strikethrough rows should be deleted**.
- Confirm that **all red-highlighted rows represent corrected values** that must replace DB values.
