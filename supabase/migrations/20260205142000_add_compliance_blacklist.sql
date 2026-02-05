-- Compliance blacklist tables + screening function (US-005)

create extension if not exists pg_trgm;

create or replace function public.normalize_blacklist_name(p_name text)
returns text
language sql
immutable
as $$
  select regexp_replace(lower(coalesce(p_name, '')), '[^a-z0-9]+', ' ', 'g');
$$;

create table if not exists public.compliance_blacklist (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  full_name text,
  entity_name text,
  tax_id text,
  reason text,
  severity text not null default 'warning',
  source text,
  reported_by uuid references public.profiles(id),
  reported_at timestamptz default now(),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  constraint compliance_blacklist_severity_check
    check (severity in ('warning', 'blocked', 'banned')),
  constraint compliance_blacklist_status_check
    check (status in ('active', 'resolved', 'false_positive'))
);

create index if not exists compliance_blacklist_email_idx
  on public.compliance_blacklist (lower(email));

create index if not exists compliance_blacklist_phone_idx
  on public.compliance_blacklist (phone);

create index if not exists compliance_blacklist_tax_id_idx
  on public.compliance_blacklist (lower(tax_id));

create index if not exists compliance_blacklist_full_name_norm_idx
  on public.compliance_blacklist (public.normalize_blacklist_name(full_name));

create index if not exists compliance_blacklist_entity_name_norm_idx
  on public.compliance_blacklist (public.normalize_blacklist_name(entity_name));

create index if not exists compliance_blacklist_full_name_trgm_idx
  on public.compliance_blacklist
  using gin (public.normalize_blacklist_name(full_name) gin_trgm_ops);

create index if not exists compliance_blacklist_entity_name_trgm_idx
  on public.compliance_blacklist
  using gin (public.normalize_blacklist_name(entity_name) gin_trgm_ops);

alter table public.compliance_blacklist enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'compliance_blacklist'
      and policyname = 'compliance_blacklist_select'
  ) then
    create policy compliance_blacklist_select
      on public.compliance_blacklist
      for select
      using (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid()));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'compliance_blacklist'
      and policyname = 'compliance_blacklist_insert'
  ) then
    create policy compliance_blacklist_insert
      on public.compliance_blacklist
      for insert
      with check (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid() and cu.role = 'admin'));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'compliance_blacklist'
      and policyname = 'compliance_blacklist_update'
  ) then
    create policy compliance_blacklist_update
      on public.compliance_blacklist
      for update
      using (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid() and cu.role = 'admin'));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'compliance_blacklist'
      and policyname = 'compliance_blacklist_delete'
  ) then
    create policy compliance_blacklist_delete
      on public.compliance_blacklist
      for delete
      using (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid() and cu.role = 'admin'));
  end if;
end $$;

create table if not exists public.blacklist_matches (
  id uuid primary key default gen_random_uuid(),
  blacklist_entry_id uuid not null references public.compliance_blacklist(id) on delete cascade,
  matched_user_id uuid references public.profiles(id),
  matched_investor_id uuid references public.investors(id),
  match_type text not null,
  match_confidence numeric(4,3) not null default 0,
  matched_at timestamptz not null default now(),
  action_taken text
);

create index if not exists blacklist_matches_entry_idx
  on public.blacklist_matches (blacklist_entry_id);

create index if not exists blacklist_matches_user_idx
  on public.blacklist_matches (matched_user_id);

create index if not exists blacklist_matches_investor_idx
  on public.blacklist_matches (matched_investor_id);

alter table public.blacklist_matches enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'blacklist_matches'
      and policyname = 'blacklist_matches_select'
  ) then
    create policy blacklist_matches_select
      on public.blacklist_matches
      for select
      using (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid()));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'blacklist_matches'
      and policyname = 'blacklist_matches_insert'
  ) then
    create policy blacklist_matches_insert
      on public.blacklist_matches
      for insert
      with check (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid() and cu.role = 'admin'));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'blacklist_matches'
      and policyname = 'blacklist_matches_update'
  ) then
    create policy blacklist_matches_update
      on public.blacklist_matches
      for update
      using (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid() and cu.role = 'admin'));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'blacklist_matches'
      and policyname = 'blacklist_matches_delete'
  ) then
    create policy blacklist_matches_delete
      on public.blacklist_matches
      for delete
      using (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid() and cu.role = 'admin'));
  end if;
end $$;

create or replace function public.screen_against_blacklist(
  p_email text default null,
  p_full_name text default null,
  p_tax_id text default null,
  p_phone text default null,
  p_entity_name text default null
)
returns table (
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
    select id as blacklist_entry_id,
           'email_exact' as match_type,
           1.000::numeric as match_confidence,
           severity,
           status
    from candidates
    where v_email is not null and lower(email) = v_email

    union all
    select id, 'phone_exact', 1.000::numeric, severity, status
    from candidates
    where v_phone is not null and phone = v_phone

    union all
    select id, 'tax_id_exact', 1.000::numeric, severity, status
    from candidates
    where v_tax_id is not null and lower(tax_id) = v_tax_id

    union all
    select id, 'name_exact', 0.980::numeric, severity, status
    from candidates
    where v_full_name_norm is not null and full_name_norm = v_full_name_norm

    union all
    select id, 'entity_name_exact', 0.980::numeric, severity, status
    from candidates
    where v_entity_name_norm is not null and entity_name_norm = v_entity_name_norm

    union all
    select id, 'name_fuzzy', round(similarity(full_name_norm, v_full_name_norm)::numeric, 3), severity, status
    from candidates
    where v_full_name_norm is not null and full_name_norm is not null
      and similarity(full_name_norm, v_full_name_norm) >= 0.90

    union all
    select id, 'entity_name_fuzzy', round(similarity(entity_name_norm, v_entity_name_norm)::numeric, 3), severity, status
    from candidates
    where v_entity_name_norm is not null and entity_name_norm is not null
      and similarity(entity_name_norm, v_entity_name_norm) >= 0.90
  )
  select distinct on (blacklist_entry_id, match_type)
    blacklist_entry_id,
    match_type,
    match_confidence,
    severity,
    status
  from matches
  order by blacklist_entry_id, match_type, match_confidence desc;
end;
$$;
