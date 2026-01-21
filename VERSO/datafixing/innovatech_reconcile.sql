-- Innovatech reconciliation SQL (dashboard source of truth)
-- Scope IN codes: IN101, IN102, IN103, IN106, IN109, IN110, IN111


with dashboard_investors as (
  select * from (values
    ('IN101', 'Innovatech 1', null, null, 914481.12, 38881.0, 23.52, '2021-03-23', 0.0, 0.0, 0.0, 0.0, 'VEG_VC6_TR8', 'VEGINVEST', 'IN1', 'innovatech1'),
    ('IN102', null, 'David', 'HOLDEN', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'davidholden'),
    ('IN102', '1982772 Ontario Ltd', 'Van', 'ZORBAS', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', '1982772ontarioltd'),
    ('IN102', null, 'Albert', 'NOCCIOLINO', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'albertnocciolino'),
    ('IN102', null, 'Christopher', 'PAULSEN', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'christopherpaulsen'),
    ('IN102', null, 'Gary', 'HALL', 200000.0, 48.0, 4139.39, '2021-07-30', 0.03, 6000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'garyhall'),
    ('IN102', null, 'Dan', 'BAUMSLAG', 4139.39, 1.0, 4139.39, '2021-07-30', 0.0, 0.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'danielbaumslag'),
    ('IN102', null, 'Julien', 'MACHOT', 12418.17, 3.0, 4139.39, '2021-07-30', 0.0, 0.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'julienmachot'),
    ('IN102', null, 'Benjamin', 'JONES', 296051.66, 71.0, 4139.39, '2021-08-17', 0.03, 8881.5498, 0.0, 0.0, null, 'TECHMET', 'IN2', 'benjaminjones'),
    ('IN103', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, '2022-01-24', 0.04, 20000.0, 4.1359, 249998.6114, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'zanderaholdcoltd'),
    ('IN103', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, '2022-01-24', 0.02, 10000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'wymofinanceltd'),
    ('IN103', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, '2022-01-24', 0.02, 10000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'hassbroinvestmentsltd'),
    ('IN103', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, '2022-01-27', 0.02, 2000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'nsquarepatelllc'),
    ('IN103', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'elizabethgrace'),
    ('IN103', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'jeremylowy'),
    ('IN103', null, 'Michael', 'RYAN', 500000.0, 60446.0, 8.2718, '2025-01-04', 0.0, 0.0, 0.0, 0.0, 'Zandera', 'SC CO INVEST 1', 'IN3', 'michaelryan'),
    ('IN106', 'Wymo Finance Limited', null, null, 330000.0, 66160.0, 4.9879, '2022-11-04', 0.02, 6600.0, 0.0, 0.0, 'Series A Preferred', 'VOYAGE FOODS', 'IN6', 'wymofinanceltd'),
    ('IN106', null, 'Neville', 'TATA', 10000.0, 2004.0, 4.9879, '2022-04-14', 0.0, 0.0, 0.0, 0.0, 'Series A Preferred', 'VOYAGE FOODS', 'IN6', 'nevilletata'),
    ('IN109', 'L1 SC Invest 6', null, null, 595000.0, 6071.0, 98.0, '2022-12-21', 0.0, 0.0, 0.0, 0.0, null, 'SC TBC INVEST 3', 'IN9', 'l1scinvest6'),
    ('IN110', null, 'William', 'TOYE', null, 60000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'williamtoye'),
    ('IN110', null, 'Eddie', 'BEARNOT', null, 36000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'eddiebearnot'),
    ('IN110', null, 'Naweed', 'AHMED', null, 44000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'naweedahmed'),
    ('IN110', null, 'Robin', 'DOBLE', null, 100000.0, null, '2023-06-30', 0.0, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'robindoble'),
    ('IN110', null, 'Sarah', 'DAVIES', null, 60000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'sarahdavies'),
    ('IN110', null, 'William', 'TOYE', null, -45000.0, null, '2024-03-25', 0.0, 0.0, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'williamtoye'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 75000.0, 75000.0, 1.0, '2023-12-18', 0.0, 0.0, 0.0, 0.0, null, 'ANYMA IB HOLDINGS', 'IN9', 'borisippolitov'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 29919.44, 103.0, 290.0, '2025-02-19', 0.0, 0.0, -0.48, -49.44, null, 'PAPKOT H SAS, France', 'IN9', 'borisippolitov'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 2344.0, 2344.0, 1.0, '2025-12-06', 0.0, 0.0, 0.0, 0.0, null, 'PITZ TECHNOLOGIES LLC, USA', 'IN9', 'borisippolitov')
  ) as t(entity_code, investor_entity, investor_first, investor_last, amount_invested, num_shares, price_per_share, contract_date, sub_fee_pct, sub_fee_amt, spread_pps, spread_fee_amt, sourcing_contract_ref, opportunity, vehicle, investor_key)
),
dashboard_introducers as (
  select * from (values
    ('IN103', 'Setcap', 'PARTNERS', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, 0.01, 5000.0, 1.24077, 74999.58342, 'zanderaholdcoltd'),
    ('IN103', 'Altras+Andrew Stewart', 'INTRODUCERS', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, 0.03, 15000.0, 2.89513, 174999.028, 'zanderaholdcoltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'wymofinanceltd'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'wymofinanceltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'hassbroinvestmentsltd'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'hassbroinvestmentsltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, 0.01, 1000.0, 0.0, 0.0, 'nsquarepatelllc'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, 0.01, 1000.0, 0.0, 0.0, 'nsquarepatelllc'),
    ('IN103', 'Setcap', 'PARTNERS', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'elizabethgrace'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'elizabethgrace'),
    ('IN103', 'Setcap', 'PARTNERS', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', 'Setcap', 'PARTNERS', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'jeremylowy'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'jeremylowy'),
    ('IN106', 'Setcap', 'INTRODUCERS', 'Wymo Finance Limited', null, null, 330000.0, 66160.0, 4.9879, 0.01, 3300.0, 0.0, 0.0, 'wymofinanceltd')
  ) as t(entity_code, introducer_name, group_label, investor_entity, investor_first, investor_last, amount_invested, num_shares, price_per_share, sub_fee_pct, sub_fee_amt, spread_pps, spread_fee_amt, investor_key)
),
vehicle_map as (
  select v.id as vehicle_id, v.entity_code, min(d.id::text)::uuid as deal_id
  from vehicles v
  left join deals d on d.vehicle_id = v.id
  where v.entity_code in ('IN101','IN102','IN103','IN106','IN109','IN110','IN111')
  group by v.id, v.entity_code
),
db_investors as (
  select
    i.id as investor_id,
    i.legal_name,
    i.display_name,
    i.first_name,
    i.last_name,
    case
      when i.legal_name is not null and i.legal_name <> '' then regexp_replace(replace(lower(i.legal_name), 'limited', 'ltd'), '[^a-z0-9]+', '', 'g')
      when i.display_name is not null and i.display_name <> '' then regexp_replace(replace(lower(i.display_name), 'limited', 'ltd'), '[^a-z0-9]+', '', 'g')
      else regexp_replace((case when lower(coalesce(i.first_name, '')) = 'dan' then 'daniel' else lower(coalesce(i.first_name, '')) end) || lower(coalesce(i.last_name, '')), '[^a-z0-9]+', '', 'g')
    end as investor_key
  from investors i
),
db_subscriptions as (
  select s.*, v.entity_code, db_investors.investor_key
  from subscriptions s
  join vehicles v on v.id = s.vehicle_id
  join db_investors on db_investors.investor_id = s.investor_id
  where v.entity_code in ('IN101','IN102','IN103','IN106','IN109','IN110','IN111')
),
dashboard_keys as (
  select *, round(amount_invested::numeric, 2) as amount_key
  from dashboard_investors
),
db_keys as (
  select *, round(commitment::numeric, 2) as amount_key
  from db_subscriptions
),
matched as (
  select d.*, b.id as subscription_id, b.investor_id, b.vehicle_id
  from dashboard_keys d
  left join db_keys b
    on b.entity_code = d.entity_code
   and b.investor_key = d.investor_key
   and b.amount_key = d.amount_key
),
missing_in_db as (
  select * from matched where subscription_id is null
),
missing_in_dashboard as (
  select b.*
  from db_keys b
  left join dashboard_keys d
    on b.entity_code = d.entity_code
   and b.investor_key = d.investor_key
   and b.amount_key = d.amount_key
  where d.entity_code is null
)
update subscriptions s
set
  num_shares = m.num_shares,
  price_per_share = m.price_per_share,
  contract_date = m.contract_date::date,
  subscription_fee_percent = m.sub_fee_pct,
  subscription_fee_amount = m.sub_fee_amt,
  spread_per_share = m.spread_pps,
  spread_fee_amount = m.spread_fee_amt
from matched m
where s.id = m.subscription_id;


with dashboard_investors as (
  select * from (values
    ('IN101', 'Innovatech 1', null, null, 914481.12, 38881.0, 23.52, '2021-03-23', 0.0, 0.0, 0.0, 0.0, 'VEG_VC6_TR8', 'VEGINVEST', 'IN1', 'innovatech1'),
    ('IN102', null, 'David', 'HOLDEN', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'davidholden'),
    ('IN102', '1982772 Ontario Ltd', 'Van', 'ZORBAS', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', '1982772ontarioltd'),
    ('IN102', null, 'Albert', 'NOCCIOLINO', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'albertnocciolino'),
    ('IN102', null, 'Christopher', 'PAULSEN', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'christopherpaulsen'),
    ('IN102', null, 'Gary', 'HALL', 200000.0, 48.0, 4139.39, '2021-07-30', 0.03, 6000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'garyhall'),
    ('IN102', null, 'Dan', 'BAUMSLAG', 4139.39, 1.0, 4139.39, '2021-07-30', 0.0, 0.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'danielbaumslag'),
    ('IN102', null, 'Julien', 'MACHOT', 12418.17, 3.0, 4139.39, '2021-07-30', 0.0, 0.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'julienmachot'),
    ('IN102', null, 'Benjamin', 'JONES', 296051.66, 71.0, 4139.39, '2021-08-17', 0.03, 8881.5498, 0.0, 0.0, null, 'TECHMET', 'IN2', 'benjaminjones'),
    ('IN103', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, '2022-01-24', 0.04, 20000.0, 4.1359, 249998.6114, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'zanderaholdcoltd'),
    ('IN103', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, '2022-01-24', 0.02, 10000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'wymofinanceltd'),
    ('IN103', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, '2022-01-24', 0.02, 10000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'hassbroinvestmentsltd'),
    ('IN103', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, '2022-01-27', 0.02, 2000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'nsquarepatelllc'),
    ('IN103', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'elizabethgrace'),
    ('IN103', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'jeremylowy'),
    ('IN103', null, 'Michael', 'RYAN', 500000.0, 60446.0, 8.2718, '2025-01-04', 0.0, 0.0, 0.0, 0.0, 'Zandera', 'SC CO INVEST 1', 'IN3', 'michaelryan'),
    ('IN106', 'Wymo Finance Limited', null, null, 330000.0, 66160.0, 4.9879, '2022-11-04', 0.02, 6600.0, 0.0, 0.0, 'Series A Preferred', 'VOYAGE FOODS', 'IN6', 'wymofinanceltd'),
    ('IN106', null, 'Neville', 'TATA', 10000.0, 2004.0, 4.9879, '2022-04-14', 0.0, 0.0, 0.0, 0.0, 'Series A Preferred', 'VOYAGE FOODS', 'IN6', 'nevilletata'),
    ('IN109', 'L1 SC Invest 6', null, null, 595000.0, 6071.0, 98.0, '2022-12-21', 0.0, 0.0, 0.0, 0.0, null, 'SC TBC INVEST 3', 'IN9', 'l1scinvest6'),
    ('IN110', null, 'William', 'TOYE', null, 60000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'williamtoye'),
    ('IN110', null, 'Eddie', 'BEARNOT', null, 36000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'eddiebearnot'),
    ('IN110', null, 'Naweed', 'AHMED', null, 44000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'naweedahmed'),
    ('IN110', null, 'Robin', 'DOBLE', null, 100000.0, null, '2023-06-30', 0.0, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'robindoble'),
    ('IN110', null, 'Sarah', 'DAVIES', null, 60000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'sarahdavies'),
    ('IN110', null, 'William', 'TOYE', null, -45000.0, null, '2024-03-25', 0.0, 0.0, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'williamtoye'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 75000.0, 75000.0, 1.0, '2023-12-18', 0.0, 0.0, 0.0, 0.0, null, 'ANYMA IB HOLDINGS', 'IN9', 'borisippolitov'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 29919.44, 103.0, 290.0, '2025-02-19', 0.0, 0.0, -0.48, -49.44, null, 'PAPKOT H SAS, France', 'IN9', 'borisippolitov'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 2344.0, 2344.0, 1.0, '2025-12-06', 0.0, 0.0, 0.0, 0.0, null, 'PITZ TECHNOLOGIES LLC, USA', 'IN9', 'borisippolitov')
  ) as t(entity_code, investor_entity, investor_first, investor_last, amount_invested, num_shares, price_per_share, contract_date, sub_fee_pct, sub_fee_amt, spread_pps, spread_fee_amt, sourcing_contract_ref, opportunity, vehicle, investor_key)
),
dashboard_introducers as (
  select * from (values
    ('IN103', 'Setcap', 'PARTNERS', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, 0.01, 5000.0, 1.24077, 74999.58342, 'zanderaholdcoltd'),
    ('IN103', 'Altras+Andrew Stewart', 'INTRODUCERS', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, 0.03, 15000.0, 2.89513, 174999.028, 'zanderaholdcoltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'wymofinanceltd'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'wymofinanceltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'hassbroinvestmentsltd'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'hassbroinvestmentsltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, 0.01, 1000.0, 0.0, 0.0, 'nsquarepatelllc'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, 0.01, 1000.0, 0.0, 0.0, 'nsquarepatelllc'),
    ('IN103', 'Setcap', 'PARTNERS', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'elizabethgrace'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'elizabethgrace'),
    ('IN103', 'Setcap', 'PARTNERS', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', 'Setcap', 'PARTNERS', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'jeremylowy'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'jeremylowy'),
    ('IN106', 'Setcap', 'INTRODUCERS', 'Wymo Finance Limited', null, null, 330000.0, 66160.0, 4.9879, 0.01, 3300.0, 0.0, 0.0, 'wymofinanceltd')
  ) as t(entity_code, introducer_name, group_label, investor_entity, investor_first, investor_last, amount_invested, num_shares, price_per_share, sub_fee_pct, sub_fee_amt, spread_pps, spread_fee_amt, investor_key)
),
vehicle_map as (
  select v.id as vehicle_id, v.entity_code, min(d.id::text)::uuid as deal_id
  from vehicles v
  left join deals d on d.vehicle_id = v.id
  where v.entity_code in ('IN101','IN102','IN103','IN106','IN109','IN110','IN111')
  group by v.id, v.entity_code
),
db_investors as (
  select
    i.id as investor_id,
    i.legal_name,
    i.display_name,
    i.first_name,
    i.last_name,
    case
      when i.legal_name is not null and i.legal_name <> '' then regexp_replace(replace(lower(i.legal_name), 'limited', 'ltd'), '[^a-z0-9]+', '', 'g')
      when i.display_name is not null and i.display_name <> '' then regexp_replace(replace(lower(i.display_name), 'limited', 'ltd'), '[^a-z0-9]+', '', 'g')
      else regexp_replace((case when lower(coalesce(i.first_name, '')) = 'dan' then 'daniel' else lower(coalesce(i.first_name, '')) end) || lower(coalesce(i.last_name, '')), '[^a-z0-9]+', '', 'g')
    end as investor_key
  from investors i
),
db_subscriptions as (
  select s.*, v.entity_code, db_investors.investor_key
  from subscriptions s
  join vehicles v on v.id = s.vehicle_id
  join db_investors on db_investors.investor_id = s.investor_id
  where v.entity_code in ('IN101','IN102','IN103','IN106','IN109','IN110','IN111')
),
dashboard_keys as (
  select *, round(amount_invested::numeric, 2) as amount_key
  from dashboard_investors
),
db_keys as (
  select *, round(commitment::numeric, 2) as amount_key
  from db_subscriptions
),
matched as (
  select d.*, b.id as subscription_id, b.investor_id, b.vehicle_id
  from dashboard_keys d
  left join db_keys b
    on b.entity_code = d.entity_code
   and b.investor_key = d.investor_key
   and b.amount_key = d.amount_key
),
missing_in_db as (
  select * from matched where subscription_id is null
),
missing_in_dashboard as (
  select b.*
  from db_keys b
  left join dashboard_keys d
    on b.entity_code = d.entity_code
   and b.investor_key = d.investor_key
   and b.amount_key = d.amount_key
  where d.entity_code is null
)
, new_investors as (
  select distinct
    investor_entity,
    investor_first,
    investor_last,
    coalesce(nullif(trim(investor_entity), ''), trim(concat_ws(' ', investor_first, investor_last))) as legal_name,
    investor_key,
    case
      when nullif(trim(investor_entity), '') is not null then 'entity'
      else 'individual'
    end as investor_type
  from missing_in_db
),
inserted as (
  insert into investors (legal_name, display_name, type, first_name, last_name)
  select
    n.legal_name,
    n.legal_name,
    n.investor_type,
    case when n.investor_type = 'individual' then n.investor_first else null end,
    case when n.investor_type = 'individual' then n.investor_last else null end
  from new_investors n
  left join db_investors i on i.investor_key = n.investor_key
  where i.investor_id is null
  returning id, legal_name
)
select count(*) from inserted;


with dashboard_investors as (
  select * from (values
    ('IN101', 'Innovatech 1', null, null, 914481.12, 38881.0, 23.52, '2021-03-23', 0.0, 0.0, 0.0, 0.0, 'VEG_VC6_TR8', 'VEGINVEST', 'IN1', 'innovatech1'),
    ('IN102', null, 'David', 'HOLDEN', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'davidholden'),
    ('IN102', '1982772 Ontario Ltd', 'Van', 'ZORBAS', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', '1982772ontarioltd'),
    ('IN102', null, 'Albert', 'NOCCIOLINO', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'albertnocciolino'),
    ('IN102', null, 'Christopher', 'PAULSEN', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'christopherpaulsen'),
    ('IN102', null, 'Gary', 'HALL', 200000.0, 48.0, 4139.39, '2021-07-30', 0.03, 6000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'garyhall'),
    ('IN102', null, 'Dan', 'BAUMSLAG', 4139.39, 1.0, 4139.39, '2021-07-30', 0.0, 0.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'danielbaumslag'),
    ('IN102', null, 'Julien', 'MACHOT', 12418.17, 3.0, 4139.39, '2021-07-30', 0.0, 0.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'julienmachot'),
    ('IN102', null, 'Benjamin', 'JONES', 296051.66, 71.0, 4139.39, '2021-08-17', 0.03, 8881.5498, 0.0, 0.0, null, 'TECHMET', 'IN2', 'benjaminjones'),
    ('IN103', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, '2022-01-24', 0.04, 20000.0, 4.1359, 249998.6114, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'zanderaholdcoltd'),
    ('IN103', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, '2022-01-24', 0.02, 10000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'wymofinanceltd'),
    ('IN103', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, '2022-01-24', 0.02, 10000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'hassbroinvestmentsltd'),
    ('IN103', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, '2022-01-27', 0.02, 2000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'nsquarepatelllc'),
    ('IN103', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'elizabethgrace'),
    ('IN103', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'jeremylowy'),
    ('IN103', null, 'Michael', 'RYAN', 500000.0, 60446.0, 8.2718, '2025-01-04', 0.0, 0.0, 0.0, 0.0, 'Zandera', 'SC CO INVEST 1', 'IN3', 'michaelryan'),
    ('IN106', 'Wymo Finance Limited', null, null, 330000.0, 66160.0, 4.9879, '2022-11-04', 0.02, 6600.0, 0.0, 0.0, 'Series A Preferred', 'VOYAGE FOODS', 'IN6', 'wymofinanceltd'),
    ('IN106', null, 'Neville', 'TATA', 10000.0, 2004.0, 4.9879, '2022-04-14', 0.0, 0.0, 0.0, 0.0, 'Series A Preferred', 'VOYAGE FOODS', 'IN6', 'nevilletata'),
    ('IN109', 'L1 SC Invest 6', null, null, 595000.0, 6071.0, 98.0, '2022-12-21', 0.0, 0.0, 0.0, 0.0, null, 'SC TBC INVEST 3', 'IN9', 'l1scinvest6'),
    ('IN110', null, 'William', 'TOYE', null, 60000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'williamtoye'),
    ('IN110', null, 'Eddie', 'BEARNOT', null, 36000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'eddiebearnot'),
    ('IN110', null, 'Naweed', 'AHMED', null, 44000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'naweedahmed'),
    ('IN110', null, 'Robin', 'DOBLE', null, 100000.0, null, '2023-06-30', 0.0, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'robindoble'),
    ('IN110', null, 'Sarah', 'DAVIES', null, 60000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'sarahdavies'),
    ('IN110', null, 'William', 'TOYE', null, -45000.0, null, '2024-03-25', 0.0, 0.0, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'williamtoye'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 75000.0, 75000.0, 1.0, '2023-12-18', 0.0, 0.0, 0.0, 0.0, null, 'ANYMA IB HOLDINGS', 'IN9', 'borisippolitov'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 29919.44, 103.0, 290.0, '2025-02-19', 0.0, 0.0, -0.48, -49.44, null, 'PAPKOT H SAS, France', 'IN9', 'borisippolitov'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 2344.0, 2344.0, 1.0, '2025-12-06', 0.0, 0.0, 0.0, 0.0, null, 'PITZ TECHNOLOGIES LLC, USA', 'IN9', 'borisippolitov')
  ) as t(entity_code, investor_entity, investor_first, investor_last, amount_invested, num_shares, price_per_share, contract_date, sub_fee_pct, sub_fee_amt, spread_pps, spread_fee_amt, sourcing_contract_ref, opportunity, vehicle, investor_key)
),
dashboard_introducers as (
  select * from (values
    ('IN103', 'Setcap', 'PARTNERS', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, 0.01, 5000.0, 1.24077, 74999.58342, 'zanderaholdcoltd'),
    ('IN103', 'Altras+Andrew Stewart', 'INTRODUCERS', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, 0.03, 15000.0, 2.89513, 174999.028, 'zanderaholdcoltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'wymofinanceltd'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'wymofinanceltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'hassbroinvestmentsltd'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'hassbroinvestmentsltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, 0.01, 1000.0, 0.0, 0.0, 'nsquarepatelllc'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, 0.01, 1000.0, 0.0, 0.0, 'nsquarepatelllc'),
    ('IN103', 'Setcap', 'PARTNERS', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'elizabethgrace'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'elizabethgrace'),
    ('IN103', 'Setcap', 'PARTNERS', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', 'Setcap', 'PARTNERS', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'jeremylowy'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'jeremylowy'),
    ('IN106', 'Setcap', 'INTRODUCERS', 'Wymo Finance Limited', null, null, 330000.0, 66160.0, 4.9879, 0.01, 3300.0, 0.0, 0.0, 'wymofinanceltd')
  ) as t(entity_code, introducer_name, group_label, investor_entity, investor_first, investor_last, amount_invested, num_shares, price_per_share, sub_fee_pct, sub_fee_amt, spread_pps, spread_fee_amt, investor_key)
),
vehicle_map as (
  select v.id as vehicle_id, v.entity_code, min(d.id::text)::uuid as deal_id
  from vehicles v
  left join deals d on d.vehicle_id = v.id
  where v.entity_code in ('IN101','IN102','IN103','IN106','IN109','IN110','IN111')
  group by v.id, v.entity_code
),
db_investors as (
  select
    i.id as investor_id,
    i.legal_name,
    i.display_name,
    i.first_name,
    i.last_name,
    case
      when i.legal_name is not null and i.legal_name <> '' then regexp_replace(replace(lower(i.legal_name), 'limited', 'ltd'), '[^a-z0-9]+', '', 'g')
      when i.display_name is not null and i.display_name <> '' then regexp_replace(replace(lower(i.display_name), 'limited', 'ltd'), '[^a-z0-9]+', '', 'g')
      else regexp_replace((case when lower(coalesce(i.first_name, '')) = 'dan' then 'daniel' else lower(coalesce(i.first_name, '')) end) || lower(coalesce(i.last_name, '')), '[^a-z0-9]+', '', 'g')
    end as investor_key
  from investors i
),
db_subscriptions as (
  select s.*, v.entity_code, db_investors.investor_key
  from subscriptions s
  join vehicles v on v.id = s.vehicle_id
  join db_investors on db_investors.investor_id = s.investor_id
  where v.entity_code in ('IN101','IN102','IN103','IN106','IN109','IN110','IN111')
),
dashboard_keys as (
  select *, round(amount_invested::numeric, 2) as amount_key
  from dashboard_investors
),
db_keys as (
  select *, round(commitment::numeric, 2) as amount_key
  from db_subscriptions
),
matched as (
  select d.*, b.id as subscription_id, b.investor_id, b.vehicle_id
  from dashboard_keys d
  left join db_keys b
    on b.entity_code = d.entity_code
   and b.investor_key = d.investor_key
   and b.amount_key = d.amount_key
),
missing_in_db as (
  select * from matched where subscription_id is null
),
missing_in_dashboard as (
  select b.*
  from db_keys b
  left join dashboard_keys d
    on b.entity_code = d.entity_code
   and b.investor_key = d.investor_key
   and b.amount_key = d.amount_key
  where d.entity_code is null
)
, refreshed_investors as (
  select * from db_investors
  union
  select id as investor_id, legal_name, legal_name as display_name, null::text as first_name, null::text as last_name, regexp_replace(replace(lower(legal_name), 'limited', 'ltd'), '[^a-z0-9]+', '', 'g') as investor_key
  from investors
  where id in (select id from investors order by created_at desc limit 50)
),
missing_with_ids as (
  select m.*, i.investor_id, v.vehicle_id, v.deal_id
  from missing_in_db m
  join refreshed_investors i on i.investor_key = m.investor_key
  join vehicle_map v on v.entity_code = m.entity_code
)
insert into subscriptions (
  investor_id, vehicle_id, deal_id, commitment, currency, status, contract_date, subscription_date, price_per_share, num_shares, subscription_fee_percent, subscription_fee_amount, spread_per_share, spread_fee_amount, opportunity_name, sourcing_contract_ref
)
select
  investor_id,
  vehicle_id,
  deal_id,
  amount_invested,
  'USD',
  'funded',
  contract_date::date,
  contract_date::date,
  price_per_share,
  num_shares,
  sub_fee_pct,
  sub_fee_amt,
  spread_pps,
  spread_fee_amt,
  opportunity,
  sourcing_contract_ref
from missing_with_ids;


with dashboard_investors as (
  select * from (values
    ('IN101', 'Innovatech 1', null, null, 914481.12, 38881.0, 23.52, '2021-03-23', 0.0, 0.0, 0.0, 0.0, 'VEG_VC6_TR8', 'VEGINVEST', 'IN1', 'innovatech1'),
    ('IN102', null, 'David', 'HOLDEN', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'davidholden'),
    ('IN102', '1982772 Ontario Ltd', 'Van', 'ZORBAS', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', '1982772ontarioltd'),
    ('IN102', null, 'Albert', 'NOCCIOLINO', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'albertnocciolino'),
    ('IN102', null, 'Christopher', 'PAULSEN', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'christopherpaulsen'),
    ('IN102', null, 'Gary', 'HALL', 200000.0, 48.0, 4139.39, '2021-07-30', 0.03, 6000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'garyhall'),
    ('IN102', null, 'Dan', 'BAUMSLAG', 4139.39, 1.0, 4139.39, '2021-07-30', 0.0, 0.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'danielbaumslag'),
    ('IN102', null, 'Julien', 'MACHOT', 12418.17, 3.0, 4139.39, '2021-07-30', 0.0, 0.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'julienmachot'),
    ('IN102', null, 'Benjamin', 'JONES', 296051.66, 71.0, 4139.39, '2021-08-17', 0.03, 8881.5498, 0.0, 0.0, null, 'TECHMET', 'IN2', 'benjaminjones'),
    ('IN103', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, '2022-01-24', 0.04, 20000.0, 4.1359, 249998.6114, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'zanderaholdcoltd'),
    ('IN103', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, '2022-01-24', 0.02, 10000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'wymofinanceltd'),
    ('IN103', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, '2022-01-24', 0.02, 10000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'hassbroinvestmentsltd'),
    ('IN103', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, '2022-01-27', 0.02, 2000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'nsquarepatelllc'),
    ('IN103', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'elizabethgrace'),
    ('IN103', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'jeremylowy'),
    ('IN103', null, 'Michael', 'RYAN', 500000.0, 60446.0, 8.2718, '2025-01-04', 0.0, 0.0, 0.0, 0.0, 'Zandera', 'SC CO INVEST 1', 'IN3', 'michaelryan'),
    ('IN106', 'Wymo Finance Limited', null, null, 330000.0, 66160.0, 4.9879, '2022-11-04', 0.02, 6600.0, 0.0, 0.0, 'Series A Preferred', 'VOYAGE FOODS', 'IN6', 'wymofinanceltd'),
    ('IN106', null, 'Neville', 'TATA', 10000.0, 2004.0, 4.9879, '2022-04-14', 0.0, 0.0, 0.0, 0.0, 'Series A Preferred', 'VOYAGE FOODS', 'IN6', 'nevilletata'),
    ('IN109', 'L1 SC Invest 6', null, null, 595000.0, 6071.0, 98.0, '2022-12-21', 0.0, 0.0, 0.0, 0.0, null, 'SC TBC INVEST 3', 'IN9', 'l1scinvest6'),
    ('IN110', null, 'William', 'TOYE', null, 60000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'williamtoye'),
    ('IN110', null, 'Eddie', 'BEARNOT', null, 36000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'eddiebearnot'),
    ('IN110', null, 'Naweed', 'AHMED', null, 44000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'naweedahmed'),
    ('IN110', null, 'Robin', 'DOBLE', null, 100000.0, null, '2023-06-30', 0.0, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'robindoble'),
    ('IN110', null, 'Sarah', 'DAVIES', null, 60000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'sarahdavies'),
    ('IN110', null, 'William', 'TOYE', null, -45000.0, null, '2024-03-25', 0.0, 0.0, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'williamtoye'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 75000.0, 75000.0, 1.0, '2023-12-18', 0.0, 0.0, 0.0, 0.0, null, 'ANYMA IB HOLDINGS', 'IN9', 'borisippolitov'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 29919.44, 103.0, 290.0, '2025-02-19', 0.0, 0.0, -0.48, -49.44, null, 'PAPKOT H SAS, France', 'IN9', 'borisippolitov'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 2344.0, 2344.0, 1.0, '2025-12-06', 0.0, 0.0, 0.0, 0.0, null, 'PITZ TECHNOLOGIES LLC, USA', 'IN9', 'borisippolitov')
  ) as t(entity_code, investor_entity, investor_first, investor_last, amount_invested, num_shares, price_per_share, contract_date, sub_fee_pct, sub_fee_amt, spread_pps, spread_fee_amt, sourcing_contract_ref, opportunity, vehicle, investor_key)
),
dashboard_introducers as (
  select * from (values
    ('IN103', 'Setcap', 'PARTNERS', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, 0.01, 5000.0, 1.24077, 74999.58342, 'zanderaholdcoltd'),
    ('IN103', 'Altras+Andrew Stewart', 'INTRODUCERS', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, 0.03, 15000.0, 2.89513, 174999.028, 'zanderaholdcoltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'wymofinanceltd'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'wymofinanceltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'hassbroinvestmentsltd'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'hassbroinvestmentsltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, 0.01, 1000.0, 0.0, 0.0, 'nsquarepatelllc'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, 0.01, 1000.0, 0.0, 0.0, 'nsquarepatelllc'),
    ('IN103', 'Setcap', 'PARTNERS', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'elizabethgrace'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'elizabethgrace'),
    ('IN103', 'Setcap', 'PARTNERS', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', 'Setcap', 'PARTNERS', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'jeremylowy'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'jeremylowy'),
    ('IN106', 'Setcap', 'INTRODUCERS', 'Wymo Finance Limited', null, null, 330000.0, 66160.0, 4.9879, 0.01, 3300.0, 0.0, 0.0, 'wymofinanceltd')
  ) as t(entity_code, introducer_name, group_label, investor_entity, investor_first, investor_last, amount_invested, num_shares, price_per_share, sub_fee_pct, sub_fee_amt, spread_pps, spread_fee_amt, investor_key)
),
vehicle_map as (
  select v.id as vehicle_id, v.entity_code, min(d.id::text)::uuid as deal_id
  from vehicles v
  left join deals d on d.vehicle_id = v.id
  where v.entity_code in ('IN101','IN102','IN103','IN106','IN109','IN110','IN111')
  group by v.id, v.entity_code
),
db_investors as (
  select
    i.id as investor_id,
    i.legal_name,
    i.display_name,
    i.first_name,
    i.last_name,
    case
      when i.legal_name is not null and i.legal_name <> '' then regexp_replace(replace(lower(i.legal_name), 'limited', 'ltd'), '[^a-z0-9]+', '', 'g')
      when i.display_name is not null and i.display_name <> '' then regexp_replace(replace(lower(i.display_name), 'limited', 'ltd'), '[^a-z0-9]+', '', 'g')
      else regexp_replace((case when lower(coalesce(i.first_name, '')) = 'dan' then 'daniel' else lower(coalesce(i.first_name, '')) end) || lower(coalesce(i.last_name, '')), '[^a-z0-9]+', '', 'g')
    end as investor_key
  from investors i
),
db_subscriptions as (
  select s.*, v.entity_code, db_investors.investor_key
  from subscriptions s
  join vehicles v on v.id = s.vehicle_id
  join db_investors on db_investors.investor_id = s.investor_id
  where v.entity_code in ('IN101','IN102','IN103','IN106','IN109','IN110','IN111')
),
dashboard_keys as (
  select *, round(amount_invested::numeric, 2) as amount_key
  from dashboard_investors
),
db_keys as (
  select *, round(commitment::numeric, 2) as amount_key
  from db_subscriptions
),
matched as (
  select d.*, b.id as subscription_id, b.investor_id, b.vehicle_id
  from dashboard_keys d
  left join db_keys b
    on b.entity_code = d.entity_code
   and b.investor_key = d.investor_key
   and b.amount_key = d.amount_key
),
missing_in_db as (
  select * from matched where subscription_id is null
),
missing_in_dashboard as (
  select b.*
  from db_keys b
  left join dashboard_keys d
    on b.entity_code = d.entity_code
   and b.investor_key = d.investor_key
   and b.amount_key = d.amount_key
  where d.entity_code is null
)
delete from positions p
using missing_in_dashboard m
where p.investor_id = m.investor_id and p.vehicle_id = m.vehicle_id and p.units = 0;
delete from subscriptions s
using missing_in_dashboard m
where s.id = m.id;


with dashboard_investors as (
  select * from (values
    ('IN101', 'Innovatech 1', null, null, 914481.12, 38881.0, 23.52, '2021-03-23', 0.0, 0.0, 0.0, 0.0, 'VEG_VC6_TR8', 'VEGINVEST', 'IN1', 'innovatech1'),
    ('IN102', null, 'David', 'HOLDEN', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'davidholden'),
    ('IN102', '1982772 Ontario Ltd', 'Van', 'ZORBAS', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', '1982772ontarioltd'),
    ('IN102', null, 'Albert', 'NOCCIOLINO', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'albertnocciolino'),
    ('IN102', null, 'Christopher', 'PAULSEN', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'christopherpaulsen'),
    ('IN102', null, 'Gary', 'HALL', 200000.0, 48.0, 4139.39, '2021-07-30', 0.03, 6000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'garyhall'),
    ('IN102', null, 'Dan', 'BAUMSLAG', 4139.39, 1.0, 4139.39, '2021-07-30', 0.0, 0.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'danielbaumslag'),
    ('IN102', null, 'Julien', 'MACHOT', 12418.17, 3.0, 4139.39, '2021-07-30', 0.0, 0.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'julienmachot'),
    ('IN102', null, 'Benjamin', 'JONES', 296051.66, 71.0, 4139.39, '2021-08-17', 0.03, 8881.5498, 0.0, 0.0, null, 'TECHMET', 'IN2', 'benjaminjones'),
    ('IN103', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, '2022-01-24', 0.04, 20000.0, 4.1359, 249998.6114, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'zanderaholdcoltd'),
    ('IN103', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, '2022-01-24', 0.02, 10000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'wymofinanceltd'),
    ('IN103', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, '2022-01-24', 0.02, 10000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'hassbroinvestmentsltd'),
    ('IN103', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, '2022-01-27', 0.02, 2000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'nsquarepatelllc'),
    ('IN103', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'elizabethgrace'),
    ('IN103', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'jeremylowy'),
    ('IN103', null, 'Michael', 'RYAN', 500000.0, 60446.0, 8.2718, '2025-01-04', 0.0, 0.0, 0.0, 0.0, 'Zandera', 'SC CO INVEST 1', 'IN3', 'michaelryan'),
    ('IN106', 'Wymo Finance Limited', null, null, 330000.0, 66160.0, 4.9879, '2022-11-04', 0.02, 6600.0, 0.0, 0.0, 'Series A Preferred', 'VOYAGE FOODS', 'IN6', 'wymofinanceltd'),
    ('IN106', null, 'Neville', 'TATA', 10000.0, 2004.0, 4.9879, '2022-04-14', 0.0, 0.0, 0.0, 0.0, 'Series A Preferred', 'VOYAGE FOODS', 'IN6', 'nevilletata'),
    ('IN109', 'L1 SC Invest 6', null, null, 595000.0, 6071.0, 98.0, '2022-12-21', 0.0, 0.0, 0.0, 0.0, null, 'SC TBC INVEST 3', 'IN9', 'l1scinvest6'),
    ('IN110', null, 'William', 'TOYE', null, 60000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'williamtoye'),
    ('IN110', null, 'Eddie', 'BEARNOT', null, 36000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'eddiebearnot'),
    ('IN110', null, 'Naweed', 'AHMED', null, 44000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'naweedahmed'),
    ('IN110', null, 'Robin', 'DOBLE', null, 100000.0, null, '2023-06-30', 0.0, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'robindoble'),
    ('IN110', null, 'Sarah', 'DAVIES', null, 60000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'sarahdavies'),
    ('IN110', null, 'William', 'TOYE', null, -45000.0, null, '2024-03-25', 0.0, 0.0, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'williamtoye'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 75000.0, 75000.0, 1.0, '2023-12-18', 0.0, 0.0, 0.0, 0.0, null, 'ANYMA IB HOLDINGS', 'IN9', 'borisippolitov'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 29919.44, 103.0, 290.0, '2025-02-19', 0.0, 0.0, -0.48, -49.44, null, 'PAPKOT H SAS, France', 'IN9', 'borisippolitov'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 2344.0, 2344.0, 1.0, '2025-12-06', 0.0, 0.0, 0.0, 0.0, null, 'PITZ TECHNOLOGIES LLC, USA', 'IN9', 'borisippolitov')
  ) as t(entity_code, investor_entity, investor_first, investor_last, amount_invested, num_shares, price_per_share, contract_date, sub_fee_pct, sub_fee_amt, spread_pps, spread_fee_amt, sourcing_contract_ref, opportunity, vehicle, investor_key)
),
dashboard_introducers as (
  select * from (values
    ('IN103', 'Setcap', 'PARTNERS', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, 0.01, 5000.0, 1.24077, 74999.58342, 'zanderaholdcoltd'),
    ('IN103', 'Altras+Andrew Stewart', 'INTRODUCERS', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, 0.03, 15000.0, 2.89513, 174999.028, 'zanderaholdcoltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'wymofinanceltd'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'wymofinanceltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'hassbroinvestmentsltd'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'hassbroinvestmentsltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, 0.01, 1000.0, 0.0, 0.0, 'nsquarepatelllc'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, 0.01, 1000.0, 0.0, 0.0, 'nsquarepatelllc'),
    ('IN103', 'Setcap', 'PARTNERS', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'elizabethgrace'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'elizabethgrace'),
    ('IN103', 'Setcap', 'PARTNERS', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', 'Setcap', 'PARTNERS', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'jeremylowy'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'jeremylowy'),
    ('IN106', 'Setcap', 'INTRODUCERS', 'Wymo Finance Limited', null, null, 330000.0, 66160.0, 4.9879, 0.01, 3300.0, 0.0, 0.0, 'wymofinanceltd')
  ) as t(entity_code, introducer_name, group_label, investor_entity, investor_first, investor_last, amount_invested, num_shares, price_per_share, sub_fee_pct, sub_fee_amt, spread_pps, spread_fee_amt, investor_key)
),
vehicle_map as (
  select v.id as vehicle_id, v.entity_code, min(d.id::text)::uuid as deal_id
  from vehicles v
  left join deals d on d.vehicle_id = v.id
  where v.entity_code in ('IN101','IN102','IN103','IN106','IN109','IN110','IN111')
  group by v.id, v.entity_code
),
db_investors as (
  select
    i.id as investor_id,
    i.legal_name,
    i.display_name,
    i.first_name,
    i.last_name,
    case
      when i.legal_name is not null and i.legal_name <> '' then regexp_replace(replace(lower(i.legal_name), 'limited', 'ltd'), '[^a-z0-9]+', '', 'g')
      when i.display_name is not null and i.display_name <> '' then regexp_replace(replace(lower(i.display_name), 'limited', 'ltd'), '[^a-z0-9]+', '', 'g')
      else regexp_replace((case when lower(coalesce(i.first_name, '')) = 'dan' then 'daniel' else lower(coalesce(i.first_name, '')) end) || lower(coalesce(i.last_name, '')), '[^a-z0-9]+', '', 'g')
    end as investor_key
  from investors i
),
db_subscriptions as (
  select s.*, v.entity_code, db_investors.investor_key
  from subscriptions s
  join vehicles v on v.id = s.vehicle_id
  join db_investors on db_investors.investor_id = s.investor_id
  where v.entity_code in ('IN101','IN102','IN103','IN106','IN109','IN110','IN111')
),
dashboard_keys as (
  select *, round(amount_invested::numeric, 2) as amount_key
  from dashboard_investors
),
db_keys as (
  select *, round(commitment::numeric, 2) as amount_key
  from db_subscriptions
),
matched as (
  select d.*, b.id as subscription_id, b.investor_id, b.vehicle_id
  from dashboard_keys d
  left join db_keys b
    on b.entity_code = d.entity_code
   and b.investor_key = d.investor_key
   and b.amount_key = d.amount_key
),
missing_in_db as (
  select * from matched where subscription_id is null
),
missing_in_dashboard as (
  select b.*
  from db_keys b
  left join dashboard_keys d
    on b.entity_code = d.entity_code
   and b.investor_key = d.investor_key
   and b.amount_key = d.amount_key
  where d.entity_code is null
)
, intro_names as (
  select distinct introducer_name from dashboard_introducers
)
insert into introducers (display_name, legal_name)
select introducer_name, introducer_name
from intro_names n
where introducer_name is not null and introducer_name <> ''
  and not exists (
    select 1 from introducers i
    where regexp_replace(lower(coalesce(i.display_name, i.legal_name, '')), '[^a-z0-9]+', '', 'g') = regexp_replace(lower(n.introducer_name), '[^a-z0-9]+', '', 'g')
  );


with dashboard_investors as (
  select * from (values
    ('IN101', 'Innovatech 1', null, null, 914481.12, 38881.0, 23.52, '2021-03-23', 0.0, 0.0, 0.0, 0.0, 'VEG_VC6_TR8', 'VEGINVEST', 'IN1', 'innovatech1'),
    ('IN102', null, 'David', 'HOLDEN', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'davidholden'),
    ('IN102', '1982772 Ontario Ltd', 'Van', 'ZORBAS', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', '1982772ontarioltd'),
    ('IN102', null, 'Albert', 'NOCCIOLINO', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'albertnocciolino'),
    ('IN102', null, 'Christopher', 'PAULSEN', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'christopherpaulsen'),
    ('IN102', null, 'Gary', 'HALL', 200000.0, 48.0, 4139.39, '2021-07-30', 0.03, 6000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'garyhall'),
    ('IN102', null, 'Dan', 'BAUMSLAG', 4139.39, 1.0, 4139.39, '2021-07-30', 0.0, 0.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'danielbaumslag'),
    ('IN102', null, 'Julien', 'MACHOT', 12418.17, 3.0, 4139.39, '2021-07-30', 0.0, 0.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'julienmachot'),
    ('IN102', null, 'Benjamin', 'JONES', 296051.66, 71.0, 4139.39, '2021-08-17', 0.03, 8881.5498, 0.0, 0.0, null, 'TECHMET', 'IN2', 'benjaminjones'),
    ('IN103', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, '2022-01-24', 0.04, 20000.0, 4.1359, 249998.6114, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'zanderaholdcoltd'),
    ('IN103', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, '2022-01-24', 0.02, 10000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'wymofinanceltd'),
    ('IN103', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, '2022-01-24', 0.02, 10000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'hassbroinvestmentsltd'),
    ('IN103', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, '2022-01-27', 0.02, 2000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'nsquarepatelllc'),
    ('IN103', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'elizabethgrace'),
    ('IN103', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'jeremylowy'),
    ('IN103', null, 'Michael', 'RYAN', 500000.0, 60446.0, 8.2718, '2025-01-04', 0.0, 0.0, 0.0, 0.0, 'Zandera', 'SC CO INVEST 1', 'IN3', 'michaelryan'),
    ('IN106', 'Wymo Finance Limited', null, null, 330000.0, 66160.0, 4.9879, '2022-11-04', 0.02, 6600.0, 0.0, 0.0, 'Series A Preferred', 'VOYAGE FOODS', 'IN6', 'wymofinanceltd'),
    ('IN106', null, 'Neville', 'TATA', 10000.0, 2004.0, 4.9879, '2022-04-14', 0.0, 0.0, 0.0, 0.0, 'Series A Preferred', 'VOYAGE FOODS', 'IN6', 'nevilletata'),
    ('IN109', 'L1 SC Invest 6', null, null, 595000.0, 6071.0, 98.0, '2022-12-21', 0.0, 0.0, 0.0, 0.0, null, 'SC TBC INVEST 3', 'IN9', 'l1scinvest6'),
    ('IN110', null, 'William', 'TOYE', null, 60000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'williamtoye'),
    ('IN110', null, 'Eddie', 'BEARNOT', null, 36000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'eddiebearnot'),
    ('IN110', null, 'Naweed', 'AHMED', null, 44000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'naweedahmed'),
    ('IN110', null, 'Robin', 'DOBLE', null, 100000.0, null, '2023-06-30', 0.0, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'robindoble'),
    ('IN110', null, 'Sarah', 'DAVIES', null, 60000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'sarahdavies'),
    ('IN110', null, 'William', 'TOYE', null, -45000.0, null, '2024-03-25', 0.0, 0.0, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'williamtoye'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 75000.0, 75000.0, 1.0, '2023-12-18', 0.0, 0.0, 0.0, 0.0, null, 'ANYMA IB HOLDINGS', 'IN9', 'borisippolitov'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 29919.44, 103.0, 290.0, '2025-02-19', 0.0, 0.0, -0.48, -49.44, null, 'PAPKOT H SAS, France', 'IN9', 'borisippolitov'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 2344.0, 2344.0, 1.0, '2025-12-06', 0.0, 0.0, 0.0, 0.0, null, 'PITZ TECHNOLOGIES LLC, USA', 'IN9', 'borisippolitov')
  ) as t(entity_code, investor_entity, investor_first, investor_last, amount_invested, num_shares, price_per_share, contract_date, sub_fee_pct, sub_fee_amt, spread_pps, spread_fee_amt, sourcing_contract_ref, opportunity, vehicle, investor_key)
),
dashboard_introducers as (
  select * from (values
    ('IN103', 'Setcap', 'PARTNERS', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, 0.01, 5000.0, 1.24077, 74999.58342, 'zanderaholdcoltd'),
    ('IN103', 'Altras+Andrew Stewart', 'INTRODUCERS', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, 0.03, 15000.0, 2.89513, 174999.028, 'zanderaholdcoltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'wymofinanceltd'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'wymofinanceltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'hassbroinvestmentsltd'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'hassbroinvestmentsltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, 0.01, 1000.0, 0.0, 0.0, 'nsquarepatelllc'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, 0.01, 1000.0, 0.0, 0.0, 'nsquarepatelllc'),
    ('IN103', 'Setcap', 'PARTNERS', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'elizabethgrace'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'elizabethgrace'),
    ('IN103', 'Setcap', 'PARTNERS', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', 'Setcap', 'PARTNERS', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'jeremylowy'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'jeremylowy'),
    ('IN106', 'Setcap', 'INTRODUCERS', 'Wymo Finance Limited', null, null, 330000.0, 66160.0, 4.9879, 0.01, 3300.0, 0.0, 0.0, 'wymofinanceltd')
  ) as t(entity_code, introducer_name, group_label, investor_entity, investor_first, investor_last, amount_invested, num_shares, price_per_share, sub_fee_pct, sub_fee_amt, spread_pps, spread_fee_amt, investor_key)
),
vehicle_map as (
  select v.id as vehicle_id, v.entity_code, min(d.id::text)::uuid as deal_id
  from vehicles v
  left join deals d on d.vehicle_id = v.id
  where v.entity_code in ('IN101','IN102','IN103','IN106','IN109','IN110','IN111')
  group by v.id, v.entity_code
),
db_investors as (
  select
    i.id as investor_id,
    i.legal_name,
    i.display_name,
    i.first_name,
    i.last_name,
    case
      when i.legal_name is not null and i.legal_name <> '' then regexp_replace(replace(lower(i.legal_name), 'limited', 'ltd'), '[^a-z0-9]+', '', 'g')
      when i.display_name is not null and i.display_name <> '' then regexp_replace(replace(lower(i.display_name), 'limited', 'ltd'), '[^a-z0-9]+', '', 'g')
      else regexp_replace((case when lower(coalesce(i.first_name, '')) = 'dan' then 'daniel' else lower(coalesce(i.first_name, '')) end) || lower(coalesce(i.last_name, '')), '[^a-z0-9]+', '', 'g')
    end as investor_key
  from investors i
),
db_subscriptions as (
  select s.*, v.entity_code, db_investors.investor_key
  from subscriptions s
  join vehicles v on v.id = s.vehicle_id
  join db_investors on db_investors.investor_id = s.investor_id
  where v.entity_code in ('IN101','IN102','IN103','IN106','IN109','IN110','IN111')
),
dashboard_keys as (
  select *, round(amount_invested::numeric, 2) as amount_key
  from dashboard_investors
),
db_keys as (
  select *, round(commitment::numeric, 2) as amount_key
  from db_subscriptions
),
matched as (
  select d.*, b.id as subscription_id, b.investor_id, b.vehicle_id
  from dashboard_keys d
  left join db_keys b
    on b.entity_code = d.entity_code
   and b.investor_key = d.investor_key
   and b.amount_key = d.amount_key
),
missing_in_db as (
  select * from matched where subscription_id is null
),
missing_in_dashboard as (
  select b.*
  from db_keys b
  left join dashboard_keys d
    on b.entity_code = d.entity_code
   and b.investor_key = d.investor_key
   and b.amount_key = d.amount_key
  where d.entity_code is null
)
, intro_lookup as (
  select id as introducer_id, regexp_replace(lower(coalesce(display_name, legal_name, '')), '[^a-z0-9]+', '', 'g') as intro_key
  from introducers
),
intro_matches as (
  select d.*, i.investor_id, v.deal_id, l.introducer_id, inv.contract_date::date as contract_date
  from dashboard_introducers d
  join db_investors i on i.investor_key = d.investor_key
  join vehicle_map v on v.entity_code = d.entity_code
  join intro_lookup l on l.intro_key = regexp_replace(lower(d.introducer_name), '[^a-z0-9]+', '', 'g')
  left join dashboard_investors inv
    on inv.entity_code = d.entity_code
   and inv.investor_key = d.investor_key
   and round(inv.amount_invested::numeric, 2) = round(d.amount_invested::numeric, 2)
),
missing_intros as (
  select * from intro_matches m
  where not exists (
    select 1 from introductions i
    where i.introducer_id = m.introducer_id
      and i.prospect_investor_id = m.investor_id
      and ((m.deal_id is null and i.deal_id is null) or i.deal_id = m.deal_id)
  )
)
insert into introductions (introducer_id, prospect_investor_id, deal_id, status, introduced_at, notes)
select
  introducer_id,
  investor_id,
  deal_id,
  'allocated',
  coalesce(contract_date, current_date),
  'Migrated from Innovatech dashboard'
from missing_intros;


with dashboard_investors as (
  select * from (values
    ('IN101', 'Innovatech 1', null, null, 914481.12, 38881.0, 23.52, '2021-03-23', 0.0, 0.0, 0.0, 0.0, 'VEG_VC6_TR8', 'VEGINVEST', 'IN1', 'innovatech1'),
    ('IN102', null, 'David', 'HOLDEN', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'davidholden'),
    ('IN102', '1982772 Ontario Ltd', 'Van', 'ZORBAS', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', '1982772ontarioltd'),
    ('IN102', null, 'Albert', 'NOCCIOLINO', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'albertnocciolino'),
    ('IN102', null, 'Christopher', 'PAULSEN', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'christopherpaulsen'),
    ('IN102', null, 'Gary', 'HALL', 200000.0, 48.0, 4139.39, '2021-07-30', 0.03, 6000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'garyhall'),
    ('IN102', null, 'Dan', 'BAUMSLAG', 4139.39, 1.0, 4139.39, '2021-07-30', 0.0, 0.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'danielbaumslag'),
    ('IN102', null, 'Julien', 'MACHOT', 12418.17, 3.0, 4139.39, '2021-07-30', 0.0, 0.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'julienmachot'),
    ('IN102', null, 'Benjamin', 'JONES', 296051.66, 71.0, 4139.39, '2021-08-17', 0.03, 8881.5498, 0.0, 0.0, null, 'TECHMET', 'IN2', 'benjaminjones'),
    ('IN103', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, '2022-01-24', 0.04, 20000.0, 4.1359, 249998.6114, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'zanderaholdcoltd'),
    ('IN103', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, '2022-01-24', 0.02, 10000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'wymofinanceltd'),
    ('IN103', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, '2022-01-24', 0.02, 10000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'hassbroinvestmentsltd'),
    ('IN103', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, '2022-01-27', 0.02, 2000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'nsquarepatelllc'),
    ('IN103', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'elizabethgrace'),
    ('IN103', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'jeremylowy'),
    ('IN103', null, 'Michael', 'RYAN', 500000.0, 60446.0, 8.2718, '2025-01-04', 0.0, 0.0, 0.0, 0.0, 'Zandera', 'SC CO INVEST 1', 'IN3', 'michaelryan'),
    ('IN106', 'Wymo Finance Limited', null, null, 330000.0, 66160.0, 4.9879, '2022-11-04', 0.02, 6600.0, 0.0, 0.0, 'Series A Preferred', 'VOYAGE FOODS', 'IN6', 'wymofinanceltd'),
    ('IN106', null, 'Neville', 'TATA', 10000.0, 2004.0, 4.9879, '2022-04-14', 0.0, 0.0, 0.0, 0.0, 'Series A Preferred', 'VOYAGE FOODS', 'IN6', 'nevilletata'),
    ('IN109', 'L1 SC Invest 6', null, null, 595000.0, 6071.0, 98.0, '2022-12-21', 0.0, 0.0, 0.0, 0.0, null, 'SC TBC INVEST 3', 'IN9', 'l1scinvest6'),
    ('IN110', null, 'William', 'TOYE', null, 60000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'williamtoye'),
    ('IN110', null, 'Eddie', 'BEARNOT', null, 36000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'eddiebearnot'),
    ('IN110', null, 'Naweed', 'AHMED', null, 44000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'naweedahmed'),
    ('IN110', null, 'Robin', 'DOBLE', null, 100000.0, null, '2023-06-30', 0.0, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'robindoble'),
    ('IN110', null, 'Sarah', 'DAVIES', null, 60000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'sarahdavies'),
    ('IN110', null, 'William', 'TOYE', null, -45000.0, null, '2024-03-25', 0.0, 0.0, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'williamtoye'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 75000.0, 75000.0, 1.0, '2023-12-18', 0.0, 0.0, 0.0, 0.0, null, 'ANYMA IB HOLDINGS', 'IN9', 'borisippolitov'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 29919.44, 103.0, 290.0, '2025-02-19', 0.0, 0.0, -0.48, -49.44, null, 'PAPKOT H SAS, France', 'IN9', 'borisippolitov'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 2344.0, 2344.0, 1.0, '2025-12-06', 0.0, 0.0, 0.0, 0.0, null, 'PITZ TECHNOLOGIES LLC, USA', 'IN9', 'borisippolitov')
  ) as t(entity_code, investor_entity, investor_first, investor_last, amount_invested, num_shares, price_per_share, contract_date, sub_fee_pct, sub_fee_amt, spread_pps, spread_fee_amt, sourcing_contract_ref, opportunity, vehicle, investor_key)
),
dashboard_introducers as (
  select * from (values
    ('IN103', 'Setcap', 'PARTNERS', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, 0.01, 5000.0, 1.24077, 74999.58342, 'zanderaholdcoltd'),
    ('IN103', 'Altras+Andrew Stewart', 'INTRODUCERS', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, 0.03, 15000.0, 2.89513, 174999.028, 'zanderaholdcoltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'wymofinanceltd'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'wymofinanceltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'hassbroinvestmentsltd'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'hassbroinvestmentsltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, 0.01, 1000.0, 0.0, 0.0, 'nsquarepatelllc'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, 0.01, 1000.0, 0.0, 0.0, 'nsquarepatelllc'),
    ('IN103', 'Setcap', 'PARTNERS', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'elizabethgrace'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'elizabethgrace'),
    ('IN103', 'Setcap', 'PARTNERS', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', 'Setcap', 'PARTNERS', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'jeremylowy'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'jeremylowy'),
    ('IN106', 'Setcap', 'INTRODUCERS', 'Wymo Finance Limited', null, null, 330000.0, 66160.0, 4.9879, 0.01, 3300.0, 0.0, 0.0, 'wymofinanceltd')
  ) as t(entity_code, introducer_name, group_label, investor_entity, investor_first, investor_last, amount_invested, num_shares, price_per_share, sub_fee_pct, sub_fee_amt, spread_pps, spread_fee_amt, investor_key)
),
vehicle_map as (
  select v.id as vehicle_id, v.entity_code, min(d.id::text)::uuid as deal_id
  from vehicles v
  left join deals d on d.vehicle_id = v.id
  where v.entity_code in ('IN101','IN102','IN103','IN106','IN109','IN110','IN111')
  group by v.id, v.entity_code
),
db_investors as (
  select
    i.id as investor_id,
    i.legal_name,
    i.display_name,
    i.first_name,
    i.last_name,
    case
      when i.legal_name is not null and i.legal_name <> '' then regexp_replace(replace(lower(i.legal_name), 'limited', 'ltd'), '[^a-z0-9]+', '', 'g')
      when i.display_name is not null and i.display_name <> '' then regexp_replace(replace(lower(i.display_name), 'limited', 'ltd'), '[^a-z0-9]+', '', 'g')
      else regexp_replace((case when lower(coalesce(i.first_name, '')) = 'dan' then 'daniel' else lower(coalesce(i.first_name, '')) end) || lower(coalesce(i.last_name, '')), '[^a-z0-9]+', '', 'g')
    end as investor_key
  from investors i
),
db_subscriptions as (
  select s.*, v.entity_code, db_investors.investor_key
  from subscriptions s
  join vehicles v on v.id = s.vehicle_id
  join db_investors on db_investors.investor_id = s.investor_id
  where v.entity_code in ('IN101','IN102','IN103','IN106','IN109','IN110','IN111')
),
dashboard_keys as (
  select *, round(amount_invested::numeric, 2) as amount_key
  from dashboard_investors
),
db_keys as (
  select *, round(commitment::numeric, 2) as amount_key
  from db_subscriptions
),
matched as (
  select d.*, b.id as subscription_id, b.investor_id, b.vehicle_id
  from dashboard_keys d
  left join db_keys b
    on b.entity_code = d.entity_code
   and b.investor_key = d.investor_key
   and b.amount_key = d.amount_key
),
missing_in_db as (
  select * from matched where subscription_id is null
),
missing_in_dashboard as (
  select b.*
  from db_keys b
  left join dashboard_keys d
    on b.entity_code = d.entity_code
   and b.investor_key = d.investor_key
   and b.amount_key = d.amount_key
  where d.entity_code is null
)
, intro_lookup as (
  select id as introducer_id, regexp_replace(lower(coalesce(display_name, legal_name, '')), '[^a-z0-9]+', '', 'g') as intro_key
  from introducers
),
intro_matches as (
  select d.*, i.investor_id, v.deal_id, l.introducer_id
  from dashboard_introducers d
  join db_investors i on i.investor_key = d.investor_key
  join vehicle_map v on v.entity_code = d.entity_code
  join intro_lookup l on l.intro_key = regexp_replace(lower(d.introducer_name), '[^a-z0-9]+', '', 'g')
),
intro_ids as (
  select m.*, intro.id as introduction_id
  from intro_matches m
  join introductions intro
    on intro.introducer_id = m.introducer_id
   and intro.prospect_investor_id = m.investor_id
   and ((m.deal_id is null and intro.deal_id is null) or intro.deal_id = m.deal_id)
)
insert into introducer_commissions (introducer_id, deal_id, investor_id, basis_type, rate_bps, accrual_amount, currency, status, introduction_id)
select
  introducer_id,
  deal_id,
  investor_id,
  'invested_amount',
  round(coalesce(sub_fee_pct, 0) * 10000)::int,
  coalesce(sub_fee_amt, 0),
  'USD',
  'accrued',
  introduction_id
from intro_ids
where sub_fee_amt is not null
  and not exists (
    select 1 from introducer_commissions ic
    where ic.introduction_id = intro_ids.introduction_id
      and ic.basis_type = 'invested_amount'
  );


with dashboard_investors as (
  select * from (values
    ('IN101', 'Innovatech 1', null, null, 914481.12, 38881.0, 23.52, '2021-03-23', 0.0, 0.0, 0.0, 0.0, 'VEG_VC6_TR8', 'VEGINVEST', 'IN1', 'innovatech1'),
    ('IN102', null, 'David', 'HOLDEN', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'davidholden'),
    ('IN102', '1982772 Ontario Ltd', 'Van', 'ZORBAS', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', '1982772ontarioltd'),
    ('IN102', null, 'Albert', 'NOCCIOLINO', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'albertnocciolino'),
    ('IN102', null, 'Christopher', 'PAULSEN', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'christopherpaulsen'),
    ('IN102', null, 'Gary', 'HALL', 200000.0, 48.0, 4139.39, '2021-07-30', 0.03, 6000.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'garyhall'),
    ('IN102', null, 'Dan', 'BAUMSLAG', 4139.39, 1.0, 4139.39, '2021-07-30', 0.0, 0.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'danielbaumslag'),
    ('IN102', null, 'Julien', 'MACHOT', 12418.17, 3.0, 4139.39, '2021-07-30', 0.0, 0.0, 0.0, 0.0, null, 'TECHMET', 'IN2', 'julienmachot'),
    ('IN102', null, 'Benjamin', 'JONES', 296051.66, 71.0, 4139.39, '2021-08-17', 0.03, 8881.5498, 0.0, 0.0, null, 'TECHMET', 'IN2', 'benjaminjones'),
    ('IN103', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, '2022-01-24', 0.04, 20000.0, 4.1359, 249998.6114, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'zanderaholdcoltd'),
    ('IN103', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, '2022-01-24', 0.02, 10000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'wymofinanceltd'),
    ('IN103', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, '2022-01-24', 0.02, 10000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'hassbroinvestmentsltd'),
    ('IN103', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, '2022-01-27', 0.02, 2000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'nsquarepatelllc'),
    ('IN103', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'elizabethgrace'),
    ('IN103', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0, 'Series C Preferred', 'SC CO INVEST 1', 'IN3', 'jeremylowy'),
    ('IN103', null, 'Michael', 'RYAN', 500000.0, 60446.0, 8.2718, '2025-01-04', 0.0, 0.0, 0.0, 0.0, 'Zandera', 'SC CO INVEST 1', 'IN3', 'michaelryan'),
    ('IN106', 'Wymo Finance Limited', null, null, 330000.0, 66160.0, 4.9879, '2022-11-04', 0.02, 6600.0, 0.0, 0.0, 'Series A Preferred', 'VOYAGE FOODS', 'IN6', 'wymofinanceltd'),
    ('IN106', null, 'Neville', 'TATA', 10000.0, 2004.0, 4.9879, '2022-04-14', 0.0, 0.0, 0.0, 0.0, 'Series A Preferred', 'VOYAGE FOODS', 'IN6', 'nevilletata'),
    ('IN109', 'L1 SC Invest 6', null, null, 595000.0, 6071.0, 98.0, '2022-12-21', 0.0, 0.0, 0.0, 0.0, null, 'SC TBC INVEST 3', 'IN9', 'l1scinvest6'),
    ('IN110', null, 'William', 'TOYE', null, 60000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'williamtoye'),
    ('IN110', null, 'Eddie', 'BEARNOT', null, 36000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'eddiebearnot'),
    ('IN110', null, 'Naweed', 'AHMED', null, 44000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'naweedahmed'),
    ('IN110', null, 'Robin', 'DOBLE', null, 100000.0, null, '2023-06-30', 0.0, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'robindoble'),
    ('IN110', null, 'Sarah', 'DAVIES', null, 60000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'sarahdavies'),
    ('IN110', null, 'William', 'TOYE', null, -45000.0, null, '2024-03-25', 0.0, 0.0, 0.0, 0.0, null, 'ZERO DAO', 'IN10', 'williamtoye'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 75000.0, 75000.0, 1.0, '2023-12-18', 0.0, 0.0, 0.0, 0.0, null, 'ANYMA IB HOLDINGS', 'IN9', 'borisippolitov'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 29919.44, 103.0, 290.0, '2025-02-19', 0.0, 0.0, -0.48, -49.44, null, 'PAPKOT H SAS, France', 'IN9', 'borisippolitov'),
    ('IN111', null, 'Boris', 'IPPOLITOV', 2344.0, 2344.0, 1.0, '2025-12-06', 0.0, 0.0, 0.0, 0.0, null, 'PITZ TECHNOLOGIES LLC, USA', 'IN9', 'borisippolitov')
  ) as t(entity_code, investor_entity, investor_first, investor_last, amount_invested, num_shares, price_per_share, contract_date, sub_fee_pct, sub_fee_amt, spread_pps, spread_fee_amt, sourcing_contract_ref, opportunity, vehicle, investor_key)
),
dashboard_introducers as (
  select * from (values
    ('IN103', 'Setcap', 'PARTNERS', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, 0.01, 5000.0, 1.24077, 74999.58342, 'zanderaholdcoltd'),
    ('IN103', 'Altras+Andrew Stewart', 'INTRODUCERS', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, 0.03, 15000.0, 2.89513, 174999.028, 'zanderaholdcoltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'wymofinanceltd'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'wymofinanceltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'hassbroinvestmentsltd'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, 0.01, 5000.0, 0.0, 0.0, 'hassbroinvestmentsltd'),
    ('IN103', 'Setcap', 'PARTNERS', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, 0.01, 1000.0, 0.0, 0.0, 'nsquarepatelllc'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, 0.01, 1000.0, 0.0, 0.0, 'nsquarepatelllc'),
    ('IN103', 'Setcap', 'PARTNERS', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'elizabethgrace'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'elizabethgrace'),
    ('IN103', 'Setcap', 'PARTNERS', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'sherriliptongrace2020irrevocablefamilytrust'),
    ('IN103', 'Setcap', 'PARTNERS', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'jeremylowy'),
    ('IN103', 'Andrew Stewart', 'INTRODUCERS', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, 0.01, 500.0, 0.0, 0.0, 'jeremylowy'),
    ('IN106', 'Setcap', 'INTRODUCERS', 'Wymo Finance Limited', null, null, 330000.0, 66160.0, 4.9879, 0.01, 3300.0, 0.0, 0.0, 'wymofinanceltd')
  ) as t(entity_code, introducer_name, group_label, investor_entity, investor_first, investor_last, amount_invested, num_shares, price_per_share, sub_fee_pct, sub_fee_amt, spread_pps, spread_fee_amt, investor_key)
),
vehicle_map as (
  select v.id as vehicle_id, v.entity_code, min(d.id::text)::uuid as deal_id
  from vehicles v
  left join deals d on d.vehicle_id = v.id
  where v.entity_code in ('IN101','IN102','IN103','IN106','IN109','IN110','IN111')
  group by v.id, v.entity_code
),
db_investors as (
  select
    i.id as investor_id,
    i.legal_name,
    i.display_name,
    i.first_name,
    i.last_name,
    case
      when i.legal_name is not null and i.legal_name <> '' then regexp_replace(replace(lower(i.legal_name), 'limited', 'ltd'), '[^a-z0-9]+', '', 'g')
      when i.display_name is not null and i.display_name <> '' then regexp_replace(replace(lower(i.display_name), 'limited', 'ltd'), '[^a-z0-9]+', '', 'g')
      else regexp_replace((case when lower(coalesce(i.first_name, '')) = 'dan' then 'daniel' else lower(coalesce(i.first_name, '')) end) || lower(coalesce(i.last_name, '')), '[^a-z0-9]+', '', 'g')
    end as investor_key
  from investors i
),
db_subscriptions as (
  select s.*, v.entity_code, db_investors.investor_key
  from subscriptions s
  join vehicles v on v.id = s.vehicle_id
  join db_investors on db_investors.investor_id = s.investor_id
  where v.entity_code in ('IN101','IN102','IN103','IN106','IN109','IN110','IN111')
),
dashboard_keys as (
  select *, round(amount_invested::numeric, 2) as amount_key
  from dashboard_investors
),
db_keys as (
  select *, round(commitment::numeric, 2) as amount_key
  from db_subscriptions
),
matched as (
  select d.*, b.id as subscription_id, b.investor_id, b.vehicle_id
  from dashboard_keys d
  left join db_keys b
    on b.entity_code = d.entity_code
   and b.investor_key = d.investor_key
   and b.amount_key = d.amount_key
),
missing_in_db as (
  select * from matched where subscription_id is null
),
missing_in_dashboard as (
  select b.*
  from db_keys b
  left join dashboard_keys d
    on b.entity_code = d.entity_code
   and b.investor_key = d.investor_key
   and b.amount_key = d.amount_key
  where d.entity_code is null
)
, intro_lookup as (
  select id as introducer_id, regexp_replace(lower(coalesce(display_name, legal_name, '')), '[^a-z0-9]+', '', 'g') as intro_key
  from introducers
),
intro_matches as (
  select d.*, i.investor_id, v.deal_id, l.introducer_id
  from dashboard_introducers d
  join db_investors i on i.investor_key = d.investor_key
  join vehicle_map v on v.entity_code = d.entity_code
  join intro_lookup l on l.intro_key = regexp_replace(lower(d.introducer_name), '[^a-z0-9]+', '', 'g')
),
intro_ids as (
  select m.*, intro.id as introduction_id
  from intro_matches m
  join introductions intro
    on intro.introducer_id = m.introducer_id
   and intro.prospect_investor_id = m.investor_id
   and ((m.deal_id is null and intro.deal_id is null) or intro.deal_id = m.deal_id)
)
insert into introducer_commissions (introducer_id, deal_id, investor_id, basis_type, rate_bps, accrual_amount, currency, status, introduction_id)
select
  introducer_id,
  deal_id,
  investor_id,
  'spread',
  case when coalesce(price_per_share, 0) <> 0 then round(coalesce(spread_pps, 0) / price_per_share * 10000)::int else 0 end,
  coalesce(spread_fee_amt, 0),
  'USD',
  'accrued',
  introduction_id
from intro_ids
where spread_fee_amt is not null
  and not exists (
    select 1 from introducer_commissions ic
    where ic.introduction_id = intro_ids.introduction_id
      and ic.basis_type = 'spread'
  );
