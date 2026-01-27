-- VC133: align Setcap partner commissions per dashboard/comments
-- Setcap introducer_id: b661243f-e6b4-41f1-b239-de4b197a689a

begin;

-- Update introductions to Setcap
update introductions set introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
where id in (
  '6090f0ae-cc2f-463e-99b2-205552c4b997', -- CARTA
  '3dd9354c-02a3-48f1-963c-8dbee021c82c', -- Sahejman
  '106b140d-4391-41d8-b078-04d9d13456dc', -- Jeremy
  '137a6f3e-944f-47e9-bd6f-38f399cc84f8'  -- 777 WALNUT
);

-- Update commissions to Setcap + correct rates/amounts
update introducer_commissions
set introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a',
    rate_bps = 200,
    accrual_amount = 2000.0
where id = '7d883539-0205-4d10-9c48-55b788a8c3f1';

update introducer_commissions
set introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a',
    rate_bps = 8500,
    accrual_amount = 5610.0
where id = '7bc57935-d0ed-4cf4-87dd-01ced79b722a';

update introducer_commissions
set introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a',
    rate_bps = 200,
    accrual_amount = 1000.0
where id = '49e3ab62-5a88-4f82-9658-e4ba2d9055b8';

update introducer_commissions
set introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a',
    rate_bps = 8500,
    accrual_amount = 2805.0
where id = '233a00cc-c4d8-4eaf-872b-3b8d4eca7bbe';

update introducer_commissions
set introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a',
    rate_bps = 200,
    accrual_amount = 1000.0
where id = 'f6d4a880-12cf-4aad-a197-2b66feeaeeb1';

update introducer_commissions
set introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a',
    rate_bps = 8500,
    accrual_amount = 2805.0
where id = 'd8591720-8d6d-4e70-b67d-e972f9fc1b3e';

-- Insert missing 777 WALNUT commissions (invested_amount + spread)
insert into introducer_commissions (introducer_id, deal_id, investor_id, basis_type, rate_bps, accrual_amount, currency, status, introduction_id)
values
  ('b661243f-e6b4-41f1-b239-de4b197a689a','750e0559-a10a-48eb-9593-106329bf9f53','13b86b6c-0d42-4240-9924-a9f8cd4ce31b','invested_amount',200,1000.0,'USD','accrued','137a6f3e-944f-47e9-bd6f-38f399cc84f8'),
  ('b661243f-e6b4-41f1-b239-de4b197a689a','750e0559-a10a-48eb-9593-106329bf9f53','13b86b6c-0d42-4240-9924-a9f8cd4ce31b','spread',8500,2805.0,'USD','accrued','137a6f3e-944f-47e9-bd6f-38f399cc84f8');

-- Update subscriptions to Setcap introducer + link introductions
update subscriptions
set introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a',
    introduction_id = case investor_id
        when '31dccf8d-314a-4fa9-80af-9c02732bff31' then '6090f0ae-cc2f-463e-99b2-205552c4b997'
        when '28dc2310-81d5-477a-851d-2533e1f521df' then '3dd9354c-02a3-48f1-963c-8dbee021c82c'
        when '598aa3a7-fef2-4988-b28e-397fc40d15f6' then '106b140d-4391-41d8-b078-04d9d13456dc'
        when '13b86b6c-0d42-4240-9924-a9f8cd4ce31b' then '137a6f3e-944f-47e9-bd6f-38f399cc84f8'
        else introduction_id
    end
where deal_id = '750e0559-a10a-48eb-9593-106329bf9f53'
  and investor_id in (
    '31dccf8d-314a-4fa9-80af-9c02732bff31',
    '28dc2310-81d5-477a-851d-2533e1f521df',
    '598aa3a7-fef2-4988-b28e-397fc40d15f6',
    '13b86b6c-0d42-4240-9924-a9f8cd4ce31b'
  );

commit;
