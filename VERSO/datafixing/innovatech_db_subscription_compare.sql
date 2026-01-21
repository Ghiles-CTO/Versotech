-- Generated from innovatech_investor_summary_extracted.csv
with dashboard_rows as (
  select * from (values
    ('IN101', 'Innovatech 1', null, null, 914481.12, 38881.0, 23.52, '2021-03-23', 0.0, 0.0, 0.0, 0.0),
    ('IN102', null, 'David', 'HOLDEN', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0),
    ('IN102', '1982772 Ontario Ltd', 'Van', 'ZORBAS', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0),
    ('IN102', null, 'Albert', 'NOCCIOLINO', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0),
    ('IN102', null, 'Christopher', 'PAULSEN', 500000.0, 120.0, 4139.39, '2021-07-30', 0.03, 15000.0, 0.0, 0.0),
    ('IN102', null, 'Gary', 'HALL', 200000.0, 48.0, 4139.39, '2021-07-30', 0.03, 6000.0, 0.0, 0.0),
    ('IN102', null, 'Dan', 'BAUMSLAG', 4139.39, 1.0, 4139.39, '2021-07-30', 0.0, 0.0, 0.0, 0.0),
    ('IN102', null, 'Julien', 'MACHOT', 12418.17, 3.0, 4139.39, '2021-07-30', 0.0, 0.0, 0.0, 0.0),
    ('IN102', null, 'Benjamin', 'JONES', 296051.66, 71.0, 4139.39, '2021-08-17', 0.03, 8881.5498, 0.0, 0.0),
    ('IN103', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, '2022-01-24', 0.04, 20000.0, 4.1359, 249998.6114),
    ('IN103', 'Wymo Finance Limited', null, null, 500000.0, 120892.0, 4.1359, '2022-01-24', 0.02, 10000.0, 0.0, 0.0),
    ('IN103', 'HASSBRO Investments Limited', null, null, 500000.0, 120892.0, 4.1359, '2022-01-24', 0.02, 10000.0, 0.0, 0.0),
    ('IN103', 'N SQUARE PATEL LLC', null, null, 100000.0, 24178.0, 4.1359, '2022-01-27', 0.02, 2000.0, 0.0, 0.0),
    ('IN103', null, 'Elizabeth', 'GRACE', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0),
    ('IN103', 'Sherri Lipton Grace 2020 Irrevocable Family Trust', 'John', 'GRACE', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0),
    ('IN103', 'Zandera (Holdco) Limited', null, null, 500000.0, 60446.0, 8.2718, '2022-02-24', 0.04, 20000.0, 4.1359, 249998.6114),
    ('IN103', null, 'Jeremy', 'LOWY', 50000.0, 12089.0, 4.1359, '2022-01-27', 0.02, 1000.0, 0.0, 0.0),
    ('IN103', null, 'Michael', 'RYAN', 500000.0, 60446.0, 8.2718, '2025-01-04', 0.0, 0.0, 0.0, 0.0),
    ('IN103', null, 'Michael', 'RYAN', 500000.0, 60446.0, 8.2718, '2025-01-04', 0.0, 0.0, 0.0, 0.0),
    ('IN104', 'VERSO HOLDINGS SARL', null, null, 1.5, 150000.0, 1e-05, '2022-06-16', 0.0, 0.0, 0.0, 0.0),
    ('IN105', null, 'Tom', 'GATZ', 100000.0, 10.0, 10000.0, '2022-09-28', 0.0, 0.0, 0.0, 0.0),
    ('IN105', 'VERSO Holdings S.à r.l.', null, null, 250000.0, 25.0, 10000.0, '2022-10-20', 0.0, 0.0, 0.0, 0.0),
    ('IN105', 'Improvitae B.V.', null, null, 100000.0, 10.0, 10000.0, '2022-05-10', 0.0, 0.0, 0.0, 0.0),
    ('IN105', null, 'François-Xavier', 'GIRAUD', 50000.0, 5.0, 10000.0, '2022-11-10', 0.0, 0.0, 0.0, 0.0),
    ('IN105', 'Star of the Sea Limited', null, null, 150000.0, 15.0, 10000.0, '2022-10-27', 0.0, 0.0, 0.0, 0.0),
    ('IN105', null, 'Nicolas', 'WYDLER', 50000.0, 5.0, 10000.0, '2022-10-24', 0.0, 0.0, 0.0, 0.0),
    ('IN106', 'Wymo Finance Limited', null, null, 330000.0, 66160.0, 4.9879, '2022-11-04', 0.02, 6600.0, 0.0, 0.0),
    ('IN106', null, 'Neville', 'TATA', 10000.0, 2004.0, 4.9879, '2022-04-14', 0.0, 0.0, 0.0, 0.0),
    ('IN108', null, 'Anand', 'SETHIA', 750000.0, 750000.0, 1.0, '2022-11-22', 0.0, 0.0, 0.0, 0.0),
    ('IN108', null, 'Anand', 'SETHIA', -25000.0, -25000.0, 1.0, '2023-10-01', 0.0, 0.0, 0.0, 0.0),
    ('IN108', null, 'Anand', 'SETHIA', -225000.0, -225000.0, 1.0, '2023-03-02', 0.0, 0.0, 0.0, 0.0),
    ('IN108', null, 'Anand', 'SETHIA', -500000.0, -500000.0, 1.0, '2023-04-19', 0.0, 0.0, 0.0, 0.0),
    ('IN109', 'L1 SC Invest 6', null, null, 595000.0, 6071.0, 98.0, '2022-12-21', 0.0, 0.0, 0.0, 0.0),
    ('IN110', null, 'William', 'TOYE', null, 60000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0),
    ('IN110', null, 'Eddie', 'BEARNOT', null, 36000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0),
    ('IN110', null, 'Naweed', 'AHMED', null, 44000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0),
    ('IN110', null, 'Robin', 'DOBLE', null, 100000.0, null, '2023-06-30', 0.0, null, 0.0, 0.0),
    ('IN110', null, 'Sarah', 'DAVIES', null, 60000.0, null, '2023-06-30', 0.02, null, 0.0, 0.0),
    ('IN110', null, 'William', 'TOYE', null, -45000.0, null, '2024-03-25', 0.0, 0.0, 0.0, 0.0),
    ('IN111', null, 'Boris', 'IPPOLITOV', 75000.0, 75000.0, 1.0, '2023-12-18', 0.0, 0.0, 0.0, 0.0),
    ('IN111', null, 'Boris', 'IPPOLITOV', 29919.44, 103.0, 290.0, '2025-02-19', 0.0, 0.0, -0.48, -49.44),
    ('IN111', null, 'Boris', 'IPPOLITOV', 2344.0, 2344.0, 1.0, '2025-12-06', 0.0, 0.0, 0.0, 0.0)
  ) as t(entity_code, investor_entity, investor_first, investor_last, amount_invested, num_shares, price_per_share, contract_date, sub_fee_pct, sub_fee_amt, spread_pps, spread_fee_amt)
),
dashboard_norm as (
  select
    entity_code,
    investor_entity,
    investor_first,
    investor_last,
    amount_invested,
    num_shares,
    price_per_share,
    contract_date,
    sub_fee_pct,
    sub_fee_amt,
    spread_pps,
    spread_fee_amt,
    regexp_replace(lower(coalesce(investor_entity, investor_first || ' ' || investor_last, '')), '[^a-z0-9]+', '', 'g') as investor_key
  from dashboard_rows
),
db_rows as (
  select
    v.entity_code,
    i.legal_name,
    i.display_name,
    i.first_name,
    i.last_name,
    s.commitment,
    s.num_shares,
    s.price_per_share,
    s.contract_date,
    s.subscription_fee_percent,
    s.subscription_fee_amount,
    s.spread_per_share,
    s.spread_fee_amount,
    regexp_replace(lower(coalesce(i.legal_name, i.display_name, i.first_name || ' ' || i.last_name, '')), '[^a-z0-9]+', '', 'g') as investor_key
  from subscriptions s
  join investors i on i.id = s.investor_id
  join vehicles v on v.id = s.vehicle_id
  where v.entity_code like 'IN%'
),
dash_keys as (
  select *, round(amount_invested::numeric, 2) as amount_key from dashboard_norm
),
db_keys as (
  select *, round(commitment::numeric, 2) as amount_key from db_rows
),
matched as (
  select
    d.entity_code,
    d.investor_key,
    d.amount_invested,
    d.num_shares as dash_num_shares,
    d.price_per_share as dash_price_per_share,
    d.contract_date as dash_contract_date,
    d.sub_fee_pct as dash_sub_fee_pct,
    d.sub_fee_amt as dash_sub_fee_amt,
    d.spread_pps as dash_spread_pps,
    d.spread_fee_amt as dash_spread_fee_amt,
    b.commitment as db_commitment,
    b.num_shares as db_num_shares,
    b.price_per_share as db_price_per_share,
    b.contract_date as db_contract_date,
    b.subscription_fee_percent as db_sub_fee_pct,
    b.subscription_fee_amount as db_sub_fee_amt,
    b.spread_per_share as db_spread_pps,
    b.spread_fee_amount as db_spread_fee_amt
  from dash_keys d
  left join db_keys b
    on b.entity_code = d.entity_code
   and b.investor_key = d.investor_key
   and b.amount_key = d.amount_key
),
missing_in_db as (
  select * from matched where db_commitment is null
),
value_mismatches as (
  select * from matched
  where db_commitment is not null and (
    coalesce(db_num_shares, 0) <> coalesce(dash_num_shares, 0)
    or coalesce(db_price_per_share, 0) <> coalesce(dash_price_per_share, 0)
    or coalesce(db_contract_date::text, '') <> coalesce(dash_contract_date::text, '')
    or coalesce(db_sub_fee_pct, 0) <> coalesce(dash_sub_fee_pct, 0)
    or coalesce(db_sub_fee_amt, 0) <> coalesce(dash_sub_fee_amt, 0)
    or coalesce(db_spread_pps, 0) <> coalesce(dash_spread_pps, 0)
    or coalesce(db_spread_fee_amt, 0) <> coalesce(dash_spread_fee_amt, 0)
  )
),
db_only as (
  select b.*
  from db_keys b
  left join dash_keys d
    on b.entity_code = d.entity_code
   and b.investor_key = d.investor_key
   and b.amount_key = d.amount_key
  where d.entity_code is null
)
select 'missing_in_db' as issue, * from missing_in_db
union all
select 'value_mismatch' as issue, * from value_mismatches
union all
select 'missing_in_dashboard' as issue,
  b.entity_code,
  b.investor_key,
  b.commitment as amount_invested,
  null as dash_num_shares,
  null as dash_price_per_share,
  null as dash_contract_date,
  null as dash_sub_fee_pct,
  null as dash_sub_fee_amt,
  null as dash_spread_pps,
  null as dash_spread_fee_amt,
  b.commitment as db_commitment,
  b.num_shares as db_num_shares,
  b.price_per_share as db_price_per_share,
  b.contract_date as db_contract_date,
  b.subscription_fee_percent as db_sub_fee_pct,
  b.subscription_fee_amount as db_sub_fee_amt,
  b.spread_per_share as db_spread_pps,
  b.spread_fee_amount as db_spread_fee_amt
from db_only b
order by entity_code, investor_key, issue;
