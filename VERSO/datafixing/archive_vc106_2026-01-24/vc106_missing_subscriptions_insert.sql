-- VC106 missing subscriptions (dashboard repeated rows)
begin;
insert into subscriptions (investor_id, vehicle_id, deal_id, commitment, currency, status, contract_date, price_per_share, cost_per_share, num_shares, subscription_fee_percent, subscription_fee_amount, spread_per_share, spread_fee_amount, opportunity_name, sourcing_contract_ref)
  values
    ('fa08fe4c-5b2b-4143-9518-d508537172ce'::uuid, 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'::uuid, '07eff085-9f1d-4e02-b1e2-d717817503f1'::uuid, 49989.0, 'USD', 'funded', '2021-02-16', 19.0, 14.0, 2631.0, 0.0, 0.0, 5.0, 13155.0, 'VEGINVEST', NULL),
    ('fa08fe4c-5b2b-4143-9518-d508537172ce'::uuid, 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'::uuid, '07eff085-9f1d-4e02-b1e2-d717817503f1'::uuid, 49989.0, 'USD', 'funded', '2021-02-15', 19.0, 14.0, 2631.0, 0.0, 0.0, 5.0, 13155.0, 'VEGINVEST', NULL),
    ('fa08fe4c-5b2b-4143-9518-d508537172ce'::uuid, 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'::uuid, '07eff085-9f1d-4e02-b1e2-d717817503f1'::uuid, 24985.0, 'USD', 'funded', '2021-02-16', 19.0, 14.0, 1315.0, 0.0, 0.0, 5.0, 6575.0, 'VEGINVEST', NULL),
    ('44de3ae0-0fb2-46ad-8743-c8296cd65f0e'::uuid, 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'::uuid, '07eff085-9f1d-4e02-b1e2-d717817503f1'::uuid, 24978.24, 'USD', 'funded', '2021-03-09', 23.52, 16.0, 1062.0, 0.0, 0.0, 6.81, 7232.22, 'VEGINVEST', NULL),
    ('44de3ae0-0fb2-46ad-8743-c8296cd65f0e'::uuid, 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'::uuid, '07eff085-9f1d-4e02-b1e2-d717817503f1'::uuid, 24978.24, 'USD', 'funded', '2021-03-05', 23.52, 16.0, 1062.0, 0.0, 0.0, 6.81, 7232.22, 'VEGINVEST', NULL),
    ('e78f40f3-7e17-44cd-af46-a01a2f195f3e'::uuid, 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'::uuid, '07eff085-9f1d-4e02-b1e2-d717817503f1'::uuid, 100000.0, 'USD', 'funded', '2021-04-30', 23.52, 21.0, 4251.0, 0.02, 2000.0, 4.02, 17089.02, 'VEGINVEST', NULL),
    ('69075b7c-5dfd-4bd5-b8f7-e0757fe28d64'::uuid, 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'::uuid, '07eff085-9f1d-4e02-b1e2-d717817503f1'::uuid, 500000.0, 'USD', 'funded', '2021-06-28', 23.52, 21.0, 21258.0, 0.02, 10000.0, 6.52, 138602.16, 'VEGINVEST', NULL);
commit;