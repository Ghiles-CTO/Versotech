# IN103 (Innovatech) – Fix Log (2026-01-25)

## Source
- Dashboard: `datamigration/INNOVATECH DASHBOARD_V1.xlsx` → sheet `IN3`
- DB vehicle: `IN103` (`vehicle_id` `a03b37e2-ef65-47b1-b0a0-882ed37acd72`)
- Deal: `7c9a8651-b09c-4fa1-a92c-deaba2e8106b`

## Introducer name mapping (verified)
- Dashboard `Anand` → DB introducer `Setcap`
- Dashboard `Andrew` → DB introducer `Andrew Stewart`
- Dashboard `Altras+Andrew` → DB introducer `Altras+Andrew Stewart`

No introducer renaming issues found for IN103. DB introducers for IN103 are exactly: `Setcap`, `Andrew Stewart`, `Altras+Andrew Stewart`.

## Missing subscription found (NOT a renaming issue)
- Dashboard has **two** RYAN rows with different certificates:
  - `IN3F009` and `IN3F010` (both €500,000 / 60,446 shares / 2025‑01‑04)
- DB had only **one** matching subscription.

### Action taken
Inserted the missing RYAN subscription (second certificate) into `subscriptions`.
- New subscription id: `d4bc5768-daaf-4be8-b605-9741a00548cf`
- Auto subscription_number assigned: `717`
- Fields matched the existing RYAN subscription:
  - commitment: `500000`
  - shares: `60446`
  - contract_date: `2025-01-04`
  - price_per_share / cost_per_share: `8.2718`
  - subscription_fee_percent/amount: `0`
  - spread_per_share / spread_fee_amount: `0`
  - opportunity_name: `SC CO INVEST 1`
  - sourcing_contract_ref: `Zandera`
  - status: `funded`

### Notes
- Dashboard rows for RYAN have **no introducer/partner columns filled**, so **no introductions or commissions** were created for RYAN.
- Dashboard column **Performance fees 1 = 0.2** is **not mapped** to subscription performance fee fields for existing IN103 records, so the inserted subscription keeps those fields `NULL` to match current DB pattern.

## Post‑fix check
- Dashboard rows with ownership > 0: **7**
- DB subscriptions (IN103): **7**
- Positions already reflected total ownership (302,229 units) and were **not changed**.
