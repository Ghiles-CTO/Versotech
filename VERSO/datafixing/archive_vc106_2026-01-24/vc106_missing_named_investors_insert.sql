-- VC106 missing subscriptions for unmatched investor names
begin;
insert into subscriptions (investor_id, vehicle_id, deal_id, commitment, currency, status, contract_date, price_per_share, cost_per_share, num_shares, subscription_fee_percent, subscription_fee_amount, spread_per_share, spread_fee_amount, opportunity_name, sourcing_contract_ref)
  values
    ('5f35adc5-412a-4980-88ce-5d2b6f7fa3fc'::uuid, 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'::uuid, '07eff085-9f1d-4e02-b1e2-d717817503f1'::uuid, 50000.0, 'USD', 'funded', '2021-01-29', 22.52, NULL, 2220.0, 0.01, 500.0, 3.0, 6660.0, 'VEGINVEST', 'VEG_VC6_TR4'),
    ('a7a6b0b9-538c-44d6-b8c6-3df69b5a5212'::uuid, 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'::uuid, '07eff085-9f1d-4e02-b1e2-d717817503f1'::uuid, 50000.0, 'USD', 'funded', '2021-02-07', 22.0, NULL, 2272.0, NULL, NULL, 4.0, 9088.0, 'VEGINVEST', 'VEG_VC6_TR4'),
    ('0938fe48-c579-4031-8fba-97b348218ddf'::uuid, 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'::uuid, '07eff085-9f1d-4e02-b1e2-d717817503f1'::uuid, 155000.0, 'USD', 'funded', '2021-02-12', 23.02, NULL, 6733.0, NULL, NULL, 3.0, 20199.0, 'VEGINVEST', 'VEG_VC6_TR4');
commit;