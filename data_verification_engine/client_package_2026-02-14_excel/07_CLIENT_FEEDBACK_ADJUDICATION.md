# Client Feedback Adjudication

This compares client VFD numeric edits against the same source totals the engine uses.

| Scope | Vehicle | Field | Original | Client VFD | Source Total (Engine) | Adjudication |
|---|---|---|---:|---:|---:|---|
| IN | IN110 | Dashboard Commitment | 75 | 63.75 | 75.0 | DOES_NOT_MATCH_SOURCE_TOTAL |
| VC1 | VC114 | Dashboard Ownership | 860000 | 530000 | 860000.0 | DOES_NOT_MATCH_SOURCE_TOTAL |
| VC2 | VC206 | Dashboard Commitment | 14305532.5 | 21894162.5 | 14305532.5 | DOES_NOT_MATCH_SOURCE_TOTAL |
| VC2 | VC206 | Dashboard Ownership | 29052 | 1622150 | 29052.0 | DOES_NOT_MATCH_SOURCE_TOTAL |

Conclusion: if adjudication is DOES_NOT_MATCH_SOURCE_TOTAL, do not overwrite reconciliation totals unless client explicitly confirms a different business basis.