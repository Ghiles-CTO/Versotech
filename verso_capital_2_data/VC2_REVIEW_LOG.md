# VC2 Review Log (Current Version)

## Scope
- Contact file: `verso_capital_2_data/VERSO Capital 2 SCSp Emails and Contacts.xlsx`
- Dashboard file: `verso_capital_2_data/VERSO DASHBOARD_V1.0.xlsx`
- VC scope: VC2xx only
- Red rows excluded
- Partners/Brokers treated as introducers
- Alias rules applied: Renbridge<->Renaissance Bridge Capital, Headwall/AGP<->Alliance Global Partners, Set Cap/Setcap/Anand

## Red Rows Ignored
- [10, 13]

## Match Counts
- Contact rows considered: 119
- Investor -> dashboard matched: 119/119
- Investor -> DB exists (strict alias-normalized): 14/119
- Introducer rows (non-empty): 69
- Introducer -> dashboard matched: 69/69
- Introducer -> DB exists (strict alias-normalized): 56/69

## By VC
- VC201: rows=1 | investor(dashboard)=1/1 | investor(DB)=0/1 | introducer(dashboard)=0/0 | introducer(DB)=0/0
- VC202: rows=2 | investor(dashboard)=2/2 | investor(DB)=0/2 | introducer(dashboard)=2/2 | introducer(DB)=2/2
- VC203: rows=19 | investor(dashboard)=19/19 | investor(DB)=2/19 | introducer(dashboard)=13/13 | introducer(DB)=10/13
- VC206: rows=18 | investor(dashboard)=18/18 | investor(DB)=1/18 | introducer(dashboard)=12/12 | introducer(DB)=11/12
- VC207: rows=25 | investor(dashboard)=25/25 | investor(DB)=3/25 | introducer(dashboard)=13/13 | introducer(DB)=13/13
- VC209: rows=27 | investor(dashboard)=27/27 | investor(DB)=3/27 | introducer(dashboard)=11/11 | introducer(DB)=8/11
- VC210: rows=2 | investor(dashboard)=2/2 | investor(DB)=0/2 | introducer(dashboard)=2/2 | introducer(DB)=2/2
- VC211: rows=1 | investor(dashboard)=1/1 | investor(DB)=0/1 | introducer(dashboard)=1/1 | introducer(DB)=1/1
- VC215: rows=24 | investor(dashboard)=24/24 | investor(DB)=5/24 | introducer(dashboard)=15/15 | introducer(DB)=9/15

## Dashboard Investor Not Found
- None

## Dashboard Introducer Not Found
- None
