-- VC201 staged insert (NOT APPLIED)
-- Source: dashboard VC201 row 3 + contacts row 2
with investor_resolved as (
  select id from investors
  where lower(legal_name)=lower('Infinitas Capital SPV V a series of Infinitas Capital Master LLC')
  limit 1
), investor_insert as (
  insert into investors (id, legal_name, type, contact_name, email, display_name, status, onboarding_status)
  select gen_random_uuid(), 'Infinitas Capital SPV V a series of Infinitas Capital Master LLC', 'entity', 'Robin LAUBER', 'Robin.Lauber@infinitas-capital.com', 'Infinitas Capital SPV V a series of Infinitas Capital Master LLC', 'active', 'approved'
  where not exists (select 1 from investor_resolved)
  returning id
), investor_final as (
  select id from investor_resolved
  union all
  select id from investor_insert
), sub_insert as (
  insert into subscriptions (
    id, investor_id, vehicle_id, deal_id, commitment, currency, status, funded_amount,
    cost_per_share, price_per_share, num_shares, units, contract_date,
    spread_per_share, spread_fee_amount, subscription_fee_percent, subscription_fee_amount,
    bd_fee_percent, bd_fee_amount, finra_shares, finra_fee_amount,
    performance_fee_tier1_percent, performance_fee_tier1_threshold,
    performance_fee_tier2_percent, performance_fee_tier2_threshold,
    management_fee_percent, opportunity_name, sourcing_contract_ref
  )
  select
    gen_random_uuid(), i.id, '8b7be9b5-543e-4fd8-ab44-61767139d4e5', '8b7be9b5-543e-4fd8-ab44-61767139d4e5', 372237.5, 'USD', 'funded', 372237.5,
    28.0, 30.0, 12408.0, 12408, '2025-01-14',
    2, 24816, 0.0309278350515464, 11512.5,
    0.0, 0, 0.0, 0,
    0.1, null,
    null, null,
    0.0, 'XAI', 'Series B (TRANSFORM)'
  from investor_final i
  where not exists (
    select 1 from subscriptions s
    where s.investor_id=i.id and s.vehicle_id='8b7be9b5-543e-4fd8-ab44-61767139d4e5' and s.commitment=372237.5
      and coalesce(s.num_shares,0)=12408.0 and s.contract_date='2025-01-14'
  )
  returning investor_id
)
insert into positions (id, investor_id, vehicle_id, units, cost_basis, as_of_date)
select gen_random_uuid(), i.id, '8b7be9b5-543e-4fd8-ab44-61767139d4e5', 12408, 372237.5, '2025-01-14'
from investor_final i
where not exists (select 1 from positions p where p.investor_id=i.id and p.vehicle_id='8b7be9b5-543e-4fd8-ab44-61767139d4e5');
