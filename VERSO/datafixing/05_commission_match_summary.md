# 05 commission comment reconciliation (auto match)
- Total comment rows: 576
- Marked delete (strike): 33
- Marked update (red): 46
- Matched: 63
- Unmatched: 16

Matched breakdown:
- Strict matches (introducer+investor): 54
- Relaxed matches (investor-only): 9

Unmatched reasons:
- NO_CANDIDATES: 9
- AMBIGUOUS: 6
- AMBIGUOUS_RELAXED_INVESTOR: 1

Outputs:
- VERSO/datafixing/05_commission_updates_to_apply.csv
- VERSO/datafixing/05_commission_updates_strict_matches.csv
- VERSO/datafixing/05_commission_updates_relaxed_matches.csv
- VERSO/datafixing/05_commission_unmatched_needs_review.csv
- VERSO/datafixing/05_commission_delete_duplicates_suggested.csv