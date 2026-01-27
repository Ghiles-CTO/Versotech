# 05 Commissions — Client Overrides Applied

Source: `VERSO/datafixing/05_Introducer_Commissions_FD comments.xlsx` (red edits)

## Client-overrides applied (even when conflicting with dashboard)
- VC122 LF GROUP SARL (Pierre Paumier): inserted invested_amount 200 bps / 1500 USD and performance_fee 500 bps / 0 USD.
- VC125 MA GROUP AG (Terra): inserted performance_fee 200 bps / 0 **EUR**.
- VC125 Eric SARASIN (Terra): inserted invested_amount 500 bps / 5000 **EUR** and performance_fee 200 bps / 0 **EUR**.
- VC125 LF GROUP SARL (Pierre Paumier): inserted invested_amount 200 bps / 2000 **EUR**.
- VC126 BSV SPV III LLC (Setcap): inserted performance_fee 0 bps / 0 USD and spread 290 bps / 31,030 USD.
- VC126 Cloudsafe (Daniel Baumslag): updated existing commissions from Setcap+Daniel to Daniel; set performance_fee 0 bps / 0 USD and **spread 1,375 bps / 12,210 USD**.
- VC133 778 WALNUT LLC (Setcap): created investor + introduction and inserted spread 8,500 bps / 2,805 USD.

## Notes on conflicts / data shape
- **Dashboard conflicts:** Several of these rows do not exist or have different values in the dashboard (VC122 LF Group, VC125 Eric Sarasin/LF Group, VC126 BSV, VC126 Cloudsafe spread, VC133 778 WALNUT). Client edits were applied per instruction.
- **Row 531 rate mismatch:** Excel shows Rate(bps)=**113.75** and Rate(%)=**13.75** with amount 12,210. DB rate_bps is integer, so stored **1375 bps** to align with 13.75% and the amount.
- **EUR rows (VC125 rows 501–504):** Currency column H is blank; EUR appears in column I. Stored **EUR**.

## Artifacts
- SQL: `VERSO/datafixing/05_commission_client_overrides.sql`
- Previous actions log updated in `VERSO/datafixing/05_commission_actions_log.md`
