-- Generated from zero_ownership_introductions.csv
with dashboard_rows as (
  select * from (values
    ('VC106', 'Setcap', 'JIMENEZ TRADING INC', null, null, 'JIMENEZ TRADING INC'),
    ('VC106', 'VERSO BI', 'Global Custody & Clearing Limited', null, null, 'Global Custody & Clearing Limited'),
    ('VC106', 'VERSO BI', 'GORILLA PE Inc', null, null, 'GORILLA PE Inc'),
    ('VC106', 'VERSO BI', 'GREENLEAF', null, null, 'GREENLEAF'),
    ('VC111', 'VERSO PARTNER', 'Zandera (Finco) Limited', null, null, 'Zandera (Finco) Limited'),
    ('VC111', 'Rick', 'Zandera (Finco) Limited', null, null, 'Zandera (Finco) Limited'),
    ('VC113', 'Setcap', 'Zandera (Finco) Limited', null, null, 'Zandera (Finco) Limited'),
    ('VC113', 'Rick', 'Zandera (Finco) Limited', null, null, 'Zandera (Finco) Limited'),
    ('VC113', 'Aboud Khaddam', 'PETRATECH', null, null, 'PETRATECH'),
    ('VC113', 'Setcap', 'Zandera (Holdco) Limited', null, null, 'Zandera (Holdco) Limited'),
    ('VC113', 'Rick', 'Zandera (Holdco) Limited', null, null, 'Zandera (Holdco) Limited'),
    ('VC126', 'Setcap', null, 'Scott', 'FLETCHER', 'Scott FLETCHER'),
    ('VC126', 'Giovanni SALADINO', null, 'Scott', 'FLETCHER', 'Scott FLETCHER'),
    ('VC126', 'Setcap', null, 'Julien', 'MACHOT', 'Julien MACHOT'),
    ('VC126', 'Setcap', 'OEP Ltd', null, null, 'OEP Ltd'),
    ('VC126', 'Setcap', 'ODIN (ANIM X II LP)', null, null, 'ODIN (ANIM X II LP)'),
    ('VC126', 'Simone', 'ODIN (ANIM X II LP)', null, null, 'ODIN (ANIM X II LP)'),
    ('VC126', 'Simone', null, 'Serge', 'AURIER', 'Serge AURIER'),
    ('VC126', 'Simone', null, 'John', 'BARROWMAN', 'John BARROWMAN'),
    ('VC126', 'Simone', 'DRussell Goman RD LLC', '(Dacia)', '(RUSSELL)', 'DRussell Goman RD LLC'),
    ('VC126', 'Simone', null, 'Mrs Anisha Bansal and Mr Rahul', 'KARKUN', 'Mrs Anisha Bansal and Mr Rahul KARKUN'),
    ('VC126', 'Pierre Paumier', 'LF GROUP SARL', null, null, 'LF GROUP SARL'),
    ('VC206', 'Visual Sectors', 'REDPOINT OMEGA V, L.P.', null, null, 'REDPOINT OMEGA V, L.P.'),
    ('VC206', 'Visual Sectors', 'REDPOINT OMEGA ASSOCIATES V, LLC', null, null, 'REDPOINT OMEGA ASSOCIATES V, LLC')
  ) as t(vc_code, introducer_name, investor_entity, investor_first, investor_last, investor_key)
),
dashboard_norm as (
  select
    vc_code,
    introducer_name,
    investor_key,
    regexp_replace(lower(coalesce(investor_key, '')), '[^a-z0-9]+', '', 'g') as investor_key_norm,
    regexp_replace(lower(coalesce(introducer_name, '')), '[^a-z0-9]+', '', 'g') as introducer_key_norm
  from dashboard_rows
),
introducer_lookup as (
  select distinct id as introducer_id,
    regexp_replace(lower(display_name), '[^a-z0-9]+', '', 'g') as introducer_key
  from introducers
  where display_name is not null and display_name <> ''
  union
  select distinct id as introducer_id,
    regexp_replace(lower(legal_name), '[^a-z0-9]+', '', 'g') as introducer_key
  from introducers
  where legal_name is not null and legal_name <> ''
),
investor_lookup as (
  select distinct id as investor_id,
    regexp_replace(lower(legal_name), '[^a-z0-9]+', '', 'g') as investor_key
  from investors
  where legal_name is not null and legal_name <> ''
  union
  select distinct id as investor_id,
    regexp_replace(lower(display_name), '[^a-z0-9]+', '', 'g') as investor_key
  from investors
  where display_name is not null and display_name <> ''
  union
  select distinct id as investor_id,
    regexp_replace(lower(coalesce(first_name, '') || ' ' || coalesce(last_name, '')), '[^a-z0-9]+', '', 'g') as investor_key
  from investors
  where first_name is not null or last_name is not null
),
vehicle_map as (
  select v.id as vehicle_id, v.entity_code as vc_code, min(d.id::text)::uuid as deal_id
  from vehicles v
  left join deals d on d.vehicle_id = v.id
  group by v.id, v.entity_code
),
intro_dates as (
  select v.entity_code as vc_code, max(i.introduced_at) as introduced_at
  from introductions i
  join deals d on d.id = i.deal_id
  join vehicles v on v.id = d.vehicle_id
  group by v.entity_code
),
matched as (
  select
    d.vc_code,
    d.introducer_name,
    d.investor_key,
    i.investor_id,
    u.introducer_id,
    v.vehicle_id,
    v.deal_id,
    coalesce(intro_dates.introduced_at, current_date) as introduced_at
  from dashboard_norm d
  left join investor_lookup i on i.investor_key = d.investor_key_norm
  left join introducer_lookup u on u.introducer_key = d.introducer_key_norm
  left join vehicle_map v on v.vc_code = d.vc_code
  left join intro_dates on intro_dates.vc_code = d.vc_code
),
missing as (
  select m.*
  from matched m
  where m.investor_id is not null
    and m.introducer_id is not null
    and not exists (
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
  introduced_at,
  concat('Migrated from dashboard zero ownership - ', vc_code)
from missing
returning id, introducer_id, prospect_investor_id, deal_id;
