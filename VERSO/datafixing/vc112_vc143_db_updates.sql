-- VC112 row 9 (Dan BAUMSLAG) missing subscription
insert into subscriptions (investor_id, vehicle_id, deal_id, commitment, num_shares, price_per_share, cost_per_share, contract_date, subscription_fee_percent, subscription_fee_amount, performance_fee_tier1_percent, performance_fee_tier1_threshold, performance_fee_tier2_percent, performance_fee_tier2_threshold, spread_per_share, spread_fee_amount, opportunity_name)
values ('14919d5e-50fc-4c0f-8794-e83a72b62813', 'a76af65f-d0cb-45e7-927d-5f61791d86db', 'c4a16193-8f6b-43e8-b664-caeb46d0de85', 25000.0, 16370.0, 1.5271, 1.5271, NULL, 0.0, 0, 0.1, NULL, NULL, NULL, NULL, NULL, 'BETTER BRAND');

-- VC112 row 20 (Giovanni ALBERTINI) date/fee corrections
update subscriptions set contract_date='2022-10-28', subscription_fee_percent=0.04, subscription_fee_amount=2000.0, performance_fee_tier1_percent=0.2, performance_fee_tier1_threshold=NULL where id='a3ac1c10-012e-43da-92d6-3266e03ab8f4';