-- Investor risk profiles (US-003)

create table if not exists public.investor_risk_profiles (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid not null references public.investors(id) on delete cascade,
  country_risk_grade text references public.risk_grades(code),
  country_points integer not null default 0,
  pep_risk_points integer not null default 0,
  sanctions_risk_points integer not null default 0,
  total_risk_points integer not null default 0,
  composite_risk_grade text references public.risk_grades(code),
  calculated_at timestamptz not null default now(),
  calculation_inputs jsonb not null default '{}'::jsonb
);

create index if not exists investor_risk_profiles_investor_id_idx
  on public.investor_risk_profiles(investor_id);

create index if not exists investor_risk_profiles_calculated_at_idx
  on public.investor_risk_profiles(calculated_at desc);

alter table public.investor_risk_profiles enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'investor_risk_profiles'
      and policyname = 'investor_risk_profiles_select'
  ) then
    create policy investor_risk_profiles_select
      on public.investor_risk_profiles
      for select
      using (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid()));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'investor_risk_profiles'
      and policyname = 'investor_risk_profiles_insert'
  ) then
    create policy investor_risk_profiles_insert
      on public.investor_risk_profiles
      for insert
      with check (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid() and cu.role = 'admin'));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'investor_risk_profiles'
      and policyname = 'investor_risk_profiles_update'
  ) then
    create policy investor_risk_profiles_update
      on public.investor_risk_profiles
      for update
      using (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid() and cu.role = 'admin'));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'investor_risk_profiles'
      and policyname = 'investor_risk_profiles_delete'
  ) then
    create policy investor_risk_profiles_delete
      on public.investor_risk_profiles
      for delete
      using (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid() and cu.role = 'admin'));
  end if;
end $$;

create or replace function public.risk_grade_for_points(p_points integer)
returns text
language plpgsql
stable
as $$
declare
  v_grade text;
begin
  select rg.code
  into v_grade
  from public.risk_grades rg
  where rg.points <= p_points
  order by rg.points desc
  limit 1;

  if v_grade is null then
    select rg.code
    into v_grade
    from public.risk_grades rg
    order by rg.points asc
    limit 1;
  end if;

  return v_grade;
end;
$$;

create or replace function public.calculate_investor_risk(p_investor_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv record;
  v_country text;
  v_country_risk_grade text;
  v_country_points integer := 0;
  v_pep_points integer := 0;
  v_sanctions_points integer := 0;
  v_total_points integer := 0;
  v_composite_grade text;
  v_inputs jsonb;
  v_profile_id uuid;
begin
  select
    i.id,
    i.type,
    i.residential_country,
    i.tax_residency,
    i.country,
    i.country_of_incorporation,
    i.registered_country,
    i.is_pep,
    i.is_sanctioned
  into v_inv
  from public.investors i
  where i.id = p_investor_id;

  if not found then
    return null;
  end if;

  if lower(coalesce(v_inv.type, '')) = 'individual' then
    v_country := nullif(trim(coalesce(v_inv.residential_country, '')), '');
    if v_country is null then
      v_country := nullif(trim(coalesce(v_inv.tax_residency, '')), '');
    end if;
    if v_country is null then
      v_country := nullif(trim(coalesce(v_inv.country, '')), '');
    end if;
  else
    v_country := nullif(trim(coalesce(v_inv.country_of_incorporation, '')), '');
    if v_country is null then
      v_country := nullif(trim(coalesce(v_inv.registered_country, '')), '');
    end if;
    if v_country is null then
      v_country := nullif(trim(coalesce(v_inv.country, '')), '');
    end if;
  end if;

  select cr.country_risk_grade, rg.points
  into v_country_risk_grade, v_country_points
  from public.country_risks cr
  join public.risk_grades rg on rg.code = cr.country_risk_grade
  where lower(cr.country_code) = lower(v_country)
     or lower(cr.country_name) = lower(v_country)
  limit 1;

  if coalesce(v_inv.is_pep, false) then
    v_pep_points := 10;
  end if;

  if coalesce(v_inv.is_sanctioned, false) then
    v_sanctions_points := 20;
  end if;

  v_total_points := coalesce(v_country_points, 0) + v_pep_points + v_sanctions_points;
  v_composite_grade := public.risk_grade_for_points(v_total_points);

  v_inputs := jsonb_build_object(
    'source', 'calculate_investor_risk',
    'investor_type', v_inv.type,
    'country_input', v_country,
    'country_risk_grade', v_country_risk_grade,
    'country_points', v_country_points,
    'pep_points', v_pep_points,
    'sanctions_points', v_sanctions_points,
    'total_points', v_total_points
  );

  insert into public.investor_risk_profiles (
    investor_id,
    country_risk_grade,
    country_points,
    pep_risk_points,
    sanctions_risk_points,
    total_risk_points,
    composite_risk_grade,
    calculation_inputs
  ) values (
    v_inv.id,
    v_country_risk_grade,
    coalesce(v_country_points, 0),
    v_pep_points,
    v_sanctions_points,
    v_total_points,
    v_composite_grade,
    v_inputs
  )
  returning id into v_profile_id;

  return v_profile_id;
end;
$$;

create or replace function public.handle_investor_risk_recalc()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.calculate_investor_risk(new.id);
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'investor_risk_recalc_trigger'
  ) then
    create trigger investor_risk_recalc_trigger
      after insert or update of
        type,
        residential_country,
        tax_residency,
        country,
        country_of_incorporation,
        registered_country,
        is_pep,
        is_sanctioned
      on public.investors
      for each row
      execute function public.handle_investor_risk_recalc();
  end if;
end $$;

create or replace function public.recalculate_all_investor_risks()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.calculate_investor_risk(i.id)
  from public.investors i;
end;
$$;

create extension if not exists pg_cron;

do $$
begin
  if not exists (select 1 from cron.job where jobname = 'investor-risk-recalc') then
    perform cron.schedule(
      'investor-risk-recalc',
      '0 0 * * *',
      $cron$select public.recalculate_all_investor_risks();$cron$
    );
  end if;
end $$;

create or replace view public.investor_risk_profiles_current as
select distinct on (irp.investor_id)
  irp.id,
  irp.investor_id,
  irp.country_risk_grade,
  irp.country_points,
  irp.pep_risk_points,
  irp.sanctions_risk_points,
  irp.total_risk_points,
  irp.composite_risk_grade,
  irp.calculated_at,
  irp.calculation_inputs
from public.investor_risk_profiles irp
order by irp.investor_id, irp.calculated_at desc;
