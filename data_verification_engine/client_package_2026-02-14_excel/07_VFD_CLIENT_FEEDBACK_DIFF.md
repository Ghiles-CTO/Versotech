# 07_VFD Client Feedback Diff

This report treats `07_Vehicle_Summary_Extract_Client_VFD.xlsx` as client feedback markup against `07_Vehicle_Summary_Extract_Client.xlsx`.

## Structural Changes
- Headers in `Vehicle_Summary`: old=22 cols, VFD=24 cols.
- Added headers: ['Dashboard Positions', 'Currency', 'Dashboard Notes']
- Removed headers: ['Dashboard Position Count Basis']
- Added vehicle rows with no metrics: 9 -> [('VC1', 'VC128'), ('VC1', 'VC130'), ('VC1', 'VC131'), ('VC1', 'VC132'), ('VC1', 'VC133'), ('VC1', 'VC138'), ('VC1', 'VC140'), ('VC1', 'VC141'), ('VC1', 'VC143')]

## High-Impact Value Changes (material)
| Scope | Vehicle | Field | Old | VFD | Impact |
|---|---|---:|---:|---:|---|
| IN | IN110 | Dashboard Commitment | 75 | 63.75 | -11.25 |
| IN | IN110 | Delta Commitment | 0 | =M7-L7 | type/text/formula change |
| VC1 | VC114 | Dashboard Ownership | 860000 | 530000 | -330000.0 |
| VC2 | VC206 | Dashboard Commitment | 14305532.5 | 21894162.5 | 7588630.0 |
| VC2 | VC206 | Delta Commitment | 0 | =M25-L25 | type/text/formula change |
| VC2 | VC206 | Dashboard Ownership | 29052 | 1622150 | 1593098.0 |
| VC2 | VC206 | Delta Ownership | 0 | =R25-Q25 | type/text/formula change |

## Red-Marked Cells Summary
- Total red-marked cells in `Vehicle_Summary`: 57
- Note: red marks are formatting-based feedback marks; no Excel comment objects were found.
- Red cells with value change: 54
| Cell | Old | VFD |
|---|---|---|
| O5 | OK | USD |
| O6 | OK | USD |
| L7 | 75 | 63.75 |
| N7 | 0 | =M7-L7 |
| O7 | OK | ETH |
| O8 | OK | multiple currencies - cannot be added |
| O9 | OK | USD |
| O10 | OK | USD |
| O11 | OK | USD |
| O12 | OK | USD |
| O13 | OK | USD |
| O14 | OK | USD |
| Q14 | 860000 | 530000 |
| O15 | OK | USD |
| O16 | OK | CHF |
| O17 | OK | USD |
| S17 | OK | 325000 |
| O18 | OK | USD |
| O19 | Review | GBP |
| O20 | OK | EUR |
| O21 | OK | USD |
| O22 | OK | USD |
| O23 | OK | USD |
| O24 | OK | USD |
| L25 | 14305532.5 | 21894162.5 |
| N25 | 0 | =M25-L25 |
| O25 | OK | USD |
| Q25 | 29052 | 1622150 |
| T25 | 0 | =R25-Q25 |
| O26 | OK | USD |
| O27 | OK | USD |
| O28 | OK | USD |
| O29 | OK | USD |
| O30 | OK | USD |
| O31 | OK | USD |
| O32 | OK | USD |
| A35 | None | VC1 |
| B35 | None | VC128 |
| A36 | None | VC1 |
| B36 | None | VC130 |
| A37 | None | VC1 |
| B37 | None | VC131 |
| A38 | None | VC1 |
| B38 | None | VC132 |
| A39 | None | VC1 |
| B39 | None | VC133 |
| A40 | None | VC1 |
| B40 | None | VC138 |
| A41 | None | VC1 |
| B41 | None | VC140 |
| A42 | None | VC1 |
| B42 | None | VC141 |
| A43 | None | VC1 |
| B43 | None | VC143 |

## Consistency Check
- Scope totals in VFD are internally consistent with vehicle rows: FAIL
| Scope | Metric | From Vehicle Rows | In Scope_Totals | Delta |
|---|---|---:|---:|---:|
| VC1 | dash_ownership | 15965580.0 | 16295580 | -330000.0 |
| VC2 | dash_commitment | 130005498.4 | 122416868.4 | 7588630.0 |
| VC2 | dash_ownership | 3190460.0 | 1597362 | 1593098.0 |
| IN | dash_commitment | 5889417.53 | 5889428.78 | -11.25 |

## Critical Recommendation
- Treat VFD as feedback input, not final extract.
- Accept only approved business edits after re-checking against source dashboard and engine outputs.
- Do not send VFD file directly; merge approved feedback into the clean base file and regenerate totals.