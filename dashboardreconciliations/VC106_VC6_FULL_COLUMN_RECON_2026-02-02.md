# VC106 Full Column Reconciliation — 2026-02-02

## Row counts
- 06 (VC106) rows: 197
- Dashboard active rows (ownership>0): 197
- DB subscriptions (VC106): 197

## Key column totals (06 vs DB vs Dashboard)
Column | 06 File | DB (subscriptions) | Dashboard (active) | Match
---|---:|---:|---:|---
Commitment | 45363968.32 | 45363968.32 | 45363968.32 | ✅
Shares | 2005322 | 2005322.0 | 2005322 | ✅
Subscription Fee Amount | 593099.8112 | 593099.8112 | 381494.38 | ⚠️
Spread Fee Amount | 10051471.41785 | 10051471.41785 | 1324624.74 | ⚠️
BD Fee Amount | 70603.09 | 70603.09 | 70603.09 | ✅
FINRA Fee Amount | 57636.98 | 57636.98 | 57636.98 | ✅

## All numeric sums — 06 file
- BD Fee (%): 50
- BD Fee Amount: 70603.09
- Commitment: 45363968.32
- Cost Per Share: 3536.58269
- Current Position: 3939958
- FINRA Fee Amount: 57636.98
- FINRA Fee Shares: 10
- Funded Amount: 0
- Performance Fee Tier 1 (%): 420
- Price Per Share: 4442.64
- Shares: 2005322
- Spread Fee Amount: 10051471.41785
- Spread Per Share: 1088.90519487
- Subscription Fee (%): 2.66
- Subscription Fee Amount: 593099.8112

## All numeric sums — DB export (/tmp/subscription_data.json)
- BD Fee (%): 50.0
- BD Fee Amount: 70603.09
- Commitment: 45363968.32
- Cost Per Share: 3536.58269
- Current Position: 3939958.0
- FINRA Fee Amount: 57636.98
- FINRA Fee Shares: 10.0
- Funded Amount: 0.0
- Performance Fee Tier 1 (%): 420.0
- Price Per Share: 4442.64
- Shares: 2005322.0
- Spread Fee Amount: 10051471.41785
- Spread Per Share: 1088.90519487
- Subscription Fee (%): 2.66
- Subscription Fee Amount: 593099.8112

## All numeric sums — Dashboard CSV (active rows only)
- Amount invested: 45363968.32
- BD Fees %: 80.00
- BD fees: 70603.09
- CHECK: 781.25
- Cost per Share: 3404.50000
- FINRA fees: 57636.98
- FINRA fees in share: 15.57560
- Final Cost per Share: 3352.394810
- Index: 20206
- Number of shares invested: 2005322
- OWNERSHIP POSITION: 1969517
- Performance fees 1: 478.75
- Price per Share: 4442.64000
- Spread PPS: 159.12300
- Spread PPS Fees: 1324624.74
- Subscription fees: 381494.38
- Subscription fees %: 132.50

## Commission totals — 05 file vs DB export
Introducer | Fee Type | 05 File | DB Export | Match
---|---|---:|---:|---
Manna Capital | spread | 40000.00 | 40000.00 | ✅
Setcap | spread | 1013655.50 | 1013655.50 | ✅
Simone | invested_amount | 0.00 | 0.00 | ✅
Simone | spread | 8196.78 | 8196.78 | ✅
Terra Financial & Management Services SA | spread | 19981.50 | 19981.50 | ✅
VERSO BI | invested_amount | 409788.94 | 409788.94 | ✅
VERSO BI | performance_fee | 0.00 | 0.00 | ✅
VERSO BI | spread | 3175841.19 | 3175841.19 | ✅
VERSO PARTNER | invested_amount | 98546.81 | 98546.81 | ✅
VERSO PARTNER | performance_fee | 0.00 | 0.00 | ✅
VERSO PARTNER | spread | 2068621.84 | 2068621.84 | ✅