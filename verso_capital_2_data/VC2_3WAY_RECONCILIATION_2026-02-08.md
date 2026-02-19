# VC2 3-Way Reconciliation (Dashboard vs DB vs Export)

- Source dashboard: `verso_capital_2_data/VERSO DASHBOARD_V1.0.xlsx`
- Source export: `verso_capital_2_data/VC2_Subscriptions_Introducers.xlsx`
- DB scope: VC201, VC202, VC203(+VCL001+VCL002), VC206, VC207, VC209, VC210, VC211, VC215

- Total checks: 108
- Mismatches: 0
- Rule-based intro deltas (expected legacy logic): 3

## Rule-based intro deltas (known)
- VC207 intro_invested: dashboard=141932.1 db=115793.4 export=115793.4
- VC209 intro_invested: dashboard=704343.97 db=496663.47 export=496663.47
- VC215 intro_invested: dashboard=833678.32 db=692955.91 export=692955.91

## VC206 check
- intro_invested dashboard=473766.5375 db=473766.53 export=473766.53
