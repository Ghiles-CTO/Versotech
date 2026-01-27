-- VC106 subscriptions + positions updates
-- Generated 2026-01-24T15:55:37.210823Z
begin;
update subscriptions set commitment = 1360000.0, num_shares = 68000.0, price_per_share = 20.0, cost_per_share = 20.0, contract_date = '2021-03-19', subscription_fee_percent = 0.0, subscription_fee_amount = 0.0, spread_per_share = 0.0, spread_fee_amount = 0.0, opportunity_name = 'CHRIS JONES' where id = '1233b82b-d872-4a8b-8711-8507101588c1';
update subscriptions set commitment = 434863.0, num_shares = 38827.0, price_per_share = 11.2, cost_per_share = 11.2, contract_date = '2021-02-09', subscription_fee_percent = 0.0, subscription_fee_amount = 0.0, spread_per_share = 0.0, spread_fee_amount = 0.0, opportunity_name = 'VEGINVEST' where id = 'be10f0ab-c76d-479f-9d1a-42d4cf547b67';
update subscriptions set commitment = 234607.0, num_shares = 20947.0, price_per_share = 11.2, cost_per_share = 11.2, contract_date = '2021-02-09', subscription_fee_percent = 0.0, subscription_fee_amount = 0.0, spread_per_share = 0.0, spread_fee_amount = 0.0, opportunity_name = 'VEGINVEST' where id = '9b4a3597-9ec7-428a-a5e1-f2a6c75b1081';
update subscriptions set commitment = 70902.0, num_shares = 3636.0, price_per_share = 19.5, cost_per_share = 19.5, contract_date = '2022-03-03', subscription_fee_percent = 0.0, subscription_fee_amount = 0.0, spread_per_share = 0.0, spread_fee_amount = 0.0, opportunity_name = 'VEGINVEST' where id = '7ad3c9e8-917c-4387-876a-bea18ebd9130';

-- Insert new subscriptions
insert into subscriptions (investor_id, vehicle_id, deal_id, commitment, currency, status, contract_date, price_per_share, cost_per_share, num_shares, subscription_fee_percent, subscription_fee_amount, spread_per_share, spread_fee_amount, opportunity_name, sourcing_contract_ref)
  values
    ('1319a62f-544e-45bf-a208-61041f9f1e34'::uuid, 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'::uuid, '07eff085-9f1d-4e02-b1e2-d717817503f1'::uuid, 90940.0, 'USD', 'funded', '2021-05-17', 20.0, 20.0, 4547.0, 0.0, 0.0, 0.0, 0.0, 'J.MACHOT', NULL);

-- Insert positions
insert into positions (investor_id, vehicle_id, units)
  values
    ('5ee17648-dd9d-4351-a450-f57119440739'::uuid, 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'::uuid, 11905.0),
    ('1319a62f-544e-45bf-a208-61041f9f1e34'::uuid, 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'::uuid, 4547.0);

-- Update contract_date mismatches
update subscriptions set contract_date = '2020-12-31' where id = '33a7d752-239a-45f0-91c5-4166f65e6d63';
update subscriptions set contract_date = '2021-01-20' where id = '6f98e114-d4f6-4422-bb5e-69299ed2aae2';
update subscriptions set contract_date = '2021-01-27' where id = '2aedb57f-20a0-4f75-8b88-cb98c1e3939d';
update subscriptions set contract_date = '2021-02-16' where id = '53aa72b9-925c-40a4-9ec4-6903ada597e5';
update subscriptions set contract_date = '2021-02-15' where id = '22d59505-fa6e-49d0-95f8-c4de03f38fef';
update subscriptions set contract_date = '2021-03-09' where id = 'e24a37af-c9ef-4fda-b6b2-ae5025754f62';
update subscriptions set contract_date = '2021-06-07' where id = '32c2722e-0801-44cb-ae21-1da7270be42f';
update subscriptions set contract_date = '2021-03-04' where id = '6a3bb89e-ed9c-4c07-97de-7dfb6558a8bc';
update subscriptions set contract_date = '2021-03-03' where id = '3ca8533f-863e-4306-b5d8-af88b7b9de80';
update subscriptions set contract_date = '2021-04-08' where id = '1e021c3d-dfbf-4839-9b89-6b22af254b3f';
update subscriptions set contract_date = '2021-04-25' where id = '0d4add8c-5e91-4656-9f28-e0419d8d05d6';
update subscriptions set contract_date = '2021-04-20' where id = '42e94441-9125-4f64-a0a2-797b37802639';
update subscriptions set contract_date = '2021-06-02' where id = 'd2241b5e-eac2-4bef-bef8-d2f5098e7e04';
update subscriptions set contract_date = '2021-04-30' where id = '2c3492c7-e21f-4f44-802a-a9b86db518a3';
update subscriptions set contract_date = '2021-04-30' where id = '60910447-1be1-4904-98b2-aeadf140293e';
update subscriptions set contract_date = '2021-05-21' where id = 'ebcb85f1-d91a-4d68-9271-367fdf82b2ea';
update subscriptions set contract_date = '2021-05-11' where id = '70e15e36-c86a-4f91-85e8-bc110ec3b12e';
update subscriptions set contract_date = '2021-05-11' where id = '1cdf5d3b-d0af-401e-9c3b-fd29b64035ab';
update subscriptions set contract_date = '2021-05-20' where id = '189bf126-15ed-4884-be73-d2b84b75b625';
update subscriptions set contract_date = '2021-06-22' where id = '38bfd93f-1d85-4216-b461-1ef35d2aaed1';
update subscriptions set contract_date = '2021-06-22' where id = '2b78803d-deec-41d6-b5fa-a311fb3afdfa';
update subscriptions set contract_date = '2021-06-22' where id = '7cd35bd7-9608-48c9-893b-c4930ec9c717';
update subscriptions set contract_date = '2021-09-07' where id = '9ceaf688-0e16-456b-be45-b3d938aa8921';
update subscriptions set contract_date = '2021-12-14' where id = 'ae12e0e0-661f-4900-900e-037896d9ce85';

-- Delete subscriptions not in dashboard or zero ownership
delete from subscriptions where id in ('198bfd0d-3603-4075-b26c-f002b401b21f'::uuid, '1c23d842-763a-43da-8d3d-5842ce54d5a2'::uuid, '54fb6a0a-0b94-4b91-b990-80ad5d7ae910'::uuid, '6a0b2e31-0f76-4ac4-bc50-eb4ff286824f'::uuid, '6ad56074-d46d-4edb-bf92-fc27203d880e'::uuid, '8833db48-e584-4bd9-a7c8-5fe8a273eb8d'::uuid, '9c253619-bfd1-4fa5-98ee-fb6198dfa3c7'::uuid, 'a2b78850-3b78-4bba-9fb8-bd2037a55727'::uuid, 'a30aa94e-4a9c-4c3e-a39b-c642b6f725ca'::uuid, 'ac376f74-55cc-43d8-913a-b8d6ccb14078'::uuid, 'ae026265-b8b8-4db2-b770-a4f8c724e027'::uuid, 'aef9aa3d-76f3-4547-a3a8-cd0398c97c91'::uuid, 'b6e90568-7e6c-4015-946e-c39090b381cb'::uuid, 'b7a13df2-3102-4d26-b60b-92678452f435'::uuid, 'b8c9e7af-1f23-4006-a4d7-85ac6d2c14cc'::uuid, 'e860d097-7724-404d-b316-1963c56a699e'::uuid);

-- Delete positions not in dashboard
delete from positions where id in ('6cb3d9ee-e0f7-4667-a5ce-f9120cb4589c'::uuid, 'bde94697-3c77-447e-9b00-be00a2c7e5ab'::uuid, 'c7f316ca-3385-458a-8367-a993074885da'::uuid, 'ea6ad48c-1dce-41cf-afb2-8d5232a47e85'::uuid);
commit;