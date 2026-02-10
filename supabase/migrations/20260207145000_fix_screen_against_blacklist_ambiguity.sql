create or replace function public.screen_against_blacklist(
  p_email text default null,
  p_full_name text default null,
  p_tax_id text default null,
  p_phone text default null,
  p_entity_name text default null
)
returns table(
  blacklist_entry_id uuid,
  match_type text,
  match_confidence numeric,
  severity text,
  status text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_phone text := nullif(trim(coalesce(p_phone, '')), '');
  v_tax_id text := nullif(lower(trim(coalesce(p_tax_id, ''))), '');
  v_full_name_norm text := nullif(public.normalize_blacklist_name(p_full_name), '');
  v_entity_name_norm text := nullif(public.normalize_blacklist_name(p_entity_name), '');
begin
  return query
  with candidates as (
    select
      cb.id,
      cb.severity,
      cb.status,
      cb.email,
      cb.phone,
      cb.tax_id,
      public.normalize_blacklist_name(cb.full_name) as full_name_norm,
      public.normalize_blacklist_name(cb.entity_name) as entity_name_norm
    from public.compliance_blacklist cb
    where cb.status = 'active'
  ),
  matches as (
    select c.id as blacklist_entry_id,
           'email_exact' as match_type,
           1.000::numeric as match_confidence,
           c.severity,
           c.status
    from candidates c
    where v_email is not null and lower(c.email) = v_email

    union all
    select c.id, 'phone_exact', 1.000::numeric, c.severity, c.status
    from candidates c
    where v_phone is not null and c.phone = v_phone

    union all
    select c.id, 'tax_id_exact', 1.000::numeric, c.severity, c.status
    from candidates c
    where v_tax_id is not null and lower(c.tax_id) = v_tax_id

    union all
    select c.id, 'name_exact', 0.980::numeric, c.severity, c.status
    from candidates c
    where v_full_name_norm is not null and c.full_name_norm = v_full_name_norm

    union all
    select c.id, 'entity_name_exact', 0.980::numeric, c.severity, c.status
    from candidates c
    where v_entity_name_norm is not null and c.entity_name_norm = v_entity_name_norm

    union all
    select c.id, 'name_fuzzy', round(similarity(c.full_name_norm, v_full_name_norm)::numeric, 3), c.severity, c.status
    from candidates c
    where v_full_name_norm is not null and c.full_name_norm is not null
      and similarity(c.full_name_norm, v_full_name_norm) >= 0.90

    union all
    select c.id, 'entity_name_fuzzy', round(similarity(c.entity_name_norm, v_entity_name_norm)::numeric, 3), c.severity, c.status
    from candidates c
    where v_entity_name_norm is not null and c.entity_name_norm is not null
      and similarity(c.entity_name_norm, v_entity_name_norm) >= 0.90
  )
  select distinct on (m.blacklist_entry_id, m.match_type)
    m.blacklist_entry_id,
    m.match_type,
    m.match_confidence,
    m.severity,
    m.status
  from matches m
  order by m.blacklist_entry_id, m.match_type, m.match_confidence desc;
end;
$$;
