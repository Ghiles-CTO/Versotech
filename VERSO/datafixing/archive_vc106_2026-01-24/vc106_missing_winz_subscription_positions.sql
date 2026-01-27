-- VC106: add WINZ subscription + missing positions (KNOPF/KARKUN/SUBRAMANIAN/WINZ)
begin;
insert into subscriptions (investor_id, vehicle_id, deal_id, commitment, currency, status, contract_date, price_per_share, cost_per_share, num_shares, subscription_fee_percent, subscription_fee_amount, spread_per_share, spread_fee_amount, opportunity_name, sourcing_contract_ref)
  values
    ('0ba0fbe1-9833-477e-9ee5-7690ef0fe97a'::uuid, 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'::uuid, '07eff085-9f1d-4e02-b1e2-d717817503f1'::uuid, 100000.0, 'USD', 'funded', '2021-02-05', 22.52, 14.0, 4440.0, 0.02, 2000.0, 8.52, 37828.8, 'VEGINVEST', NULL);

insert into positions (investor_id, vehicle_id, units)
  values
    ('5f35adc5-412a-4980-88ce-5d2b6f7fa3fc'::uuid, 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'::uuid, 2220.0),
    ('0ba0fbe1-9833-477e-9ee5-7690ef0fe97a'::uuid, 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'::uuid, 4440.0),
    ('a7a6b0b9-538c-44d6-b8c6-3df69b5a5212'::uuid, 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'::uuid, 2272.0),
    ('0938fe48-c579-4031-8fba-97b348218ddf'::uuid, 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'::uuid, 6733.0);
commit;