with dashboard_names as (
  select distinct * from (values
    ('IN103', 'Setcap'),
    ('IN103', 'Altras+Andrew Stewart'),
    ('IN103', 'Setcap'),
    ('IN103', 'Andrew Stewart'),
    ('IN103', 'Setcap'),
    ('IN103', 'Andrew Stewart'),
    ('IN103', 'Setcap'),
    ('IN103', 'Andrew Stewart'),
    ('IN103', 'Setcap'),
    ('IN103', 'Andrew Stewart'),
    ('IN103', 'Setcap'),
    ('IN103', 'Andrew Stewart'),
    ('IN103', 'Setcap'),
    ('IN103', 'Altras+Andrew Stewart'),
    ('IN103', 'Setcap'),
    ('IN103', 'Andrew Stewart'),
    ('IN106', 'Setcap')
  ) as t(entity_code, introducer_name)
),
intro_lookup as (
  select distinct id, regexp_replace(lower(display_name), '[^a-z0-9]+', '', 'g') as key
  from introducers
  where display_name is not null and display_name <> ''
  union
  select distinct id, regexp_replace(lower(legal_name), '[^a-z0-9]+', '', 'g') as key
  from introducers
  where legal_name is not null and legal_name <> ''
)
select entity_code, introducer_name,
  regexp_replace(lower(introducer_name), '[^a-z0-9]+', '', 'g') as key,
  exists(select 1 from intro_lookup i where i.key = regexp_replace(lower(introducer_name), '[^a-z0-9]+', '', 'g')) as in_db
from dashboard_names
order by entity_code, introducer_name;
