-- Deal risk profiles (US-004)

create table if not exists public.deal_risk_profiles (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  country_risk_grade text references public.risk_grades(code),
  industry_risk_grade text references public.risk_grades(code),
  investment_type_risk_grade text references public.risk_grades(code),
  total_risk_points integer not null default 0,
  composite_risk_grade text references public.risk_grades(code),
  calculated_at timestamptz not null default now()
);

create index if not exists deal_risk_profiles_deal_id_idx
  on public.deal_risk_profiles(deal_id);

create index if not exists deal_risk_profiles_calculated_at_idx
  on public.deal_risk_profiles(calculated_at desc);

alter table public.deal_risk_profiles enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'deal_risk_profiles'
      and policyname = 'deal_risk_profiles_select'
  ) then
    create policy deal_risk_profiles_select
      on public.deal_risk_profiles
      for select
      using (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid()));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'deal_risk_profiles'
      and policyname = 'deal_risk_profiles_insert'
  ) then
    create policy deal_risk_profiles_insert
      on public.deal_risk_profiles
      for insert
      with check (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid() and cu.role = 'admin'));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'deal_risk_profiles'
      and policyname = 'deal_risk_profiles_update'
  ) then
    create policy deal_risk_profiles_update
      on public.deal_risk_profiles
      for update
      using (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid() and cu.role = 'admin'));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'deal_risk_profiles'
      and policyname = 'deal_risk_profiles_delete'
  ) then
    create policy deal_risk_profiles_delete
      on public.deal_risk_profiles
      for delete
      using (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid() and cu.role = 'admin'));
  end if;
end $$;

create table if not exists public.deal_investment_type_mappings (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_value text not null,
  investment_type text not null references public.investment_type_risks(investment_type),
  notes text,
  created_at timestamptz not null default now()
);

create unique index if not exists deal_investment_type_mappings_unique_idx
  on public.deal_investment_type_mappings(source_type, source_value);

alter table public.deal_investment_type_mappings enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'deal_investment_type_mappings'
      and policyname = 'deal_investment_type_mappings_select'
  ) then
    create policy deal_investment_type_mappings_select
      on public.deal_investment_type_mappings
      for select
      using (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid()));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'deal_investment_type_mappings'
      and policyname = 'deal_investment_type_mappings_insert'
  ) then
    create policy deal_investment_type_mappings_insert
      on public.deal_investment_type_mappings
      for insert
      with check (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid() and cu.role = 'admin'));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'deal_investment_type_mappings'
      and policyname = 'deal_investment_type_mappings_update'
  ) then
    create policy deal_investment_type_mappings_update
      on public.deal_investment_type_mappings
      for update
      using (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid() and cu.role = 'admin'));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'deal_investment_type_mappings'
      and policyname = 'deal_investment_type_mappings_delete'
  ) then
    create policy deal_investment_type_mappings_delete
      on public.deal_investment_type_mappings
      for delete
      using (exists (select 1 from public.ceo_users cu where cu.user_id = auth.uid() and cu.role = 'admin'));
  end if;
end $$;

create or replace function public.calculate_deal_risk(p_deal_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deal record;
  v_vehicle_type text;
  v_location text;
  v_country_risk_grade text;
  v_country_points integer := 0;
  v_industry_risk_grade text;
  v_industry_points integer := 0;
  v_investment_type text;
  v_investment_risk_grade text;
  v_investment_points integer := 0;
  v_total_points integer := 0;
  v_composite_grade text;
  v_profile_id uuid;
begin
  select
    d.id,
    d.vehicle_id,
    d.deal_type,
    d.stock_type,
    d.sector,
    d.location
  into v_deal
  from public.deals d
  where d.id = p_deal_id;

  if not found then
    return null;
  end if;

  if v_deal.vehicle_id is not null then
    select v.type::text
    into v_vehicle_type
    from public.vehicles v
    where v.id = v_deal.vehicle_id;
  end if;

  v_location := nullif(trim(coalesce(v_deal.location, '')), '');

  select cr.country_risk_grade, rg.points
  into v_country_risk_grade, v_country_points
  from public.country_risks cr
  join public.risk_grades rg on rg.code = cr.country_risk_grade
  where lower(cr.country_code) = lower(v_location)
     or lower(cr.country_name) = lower(v_location)
  limit 1;

  select ir.risk_grade, rg.points
  into v_industry_risk_grade, v_industry_points
  from public.industry_risks ir
  join public.risk_grades rg on rg.code = ir.risk_grade
  where lower(ir.sector_code) = lower(v_deal.sector)
     or lower(ir.sector_name) = lower(v_deal.sector)
  limit 1;

  select ditm.investment_type
  into v_investment_type
  from public.deal_investment_type_mappings ditm
  where (ditm.source_type = 'vehicle_type' and lower(ditm.source_value) = lower(coalesce(v_vehicle_type, '')))
     or (ditm.source_type = 'stock_type' and lower(ditm.source_value) = lower(coalesce(v_deal.stock_type, '')))
     or (ditm.source_type = 'deal_type' and lower(ditm.source_value) = lower(coalesce(v_deal.deal_type::text, '')))
  order by case
    when ditm.source_type = 'vehicle_type' then 1
    when ditm.source_type = 'stock_type' then 2
    else 3
  end
  limit 1;

  if v_investment_type is null then
    if exists (select 1 from public.investment_type_risks itr where lower(itr.investment_type) = lower(coalesce(v_vehicle_type, ''))) then
      v_investment_type := v_vehicle_type;
    elsif exists (select 1 from public.investment_type_risks itr where lower(itr.investment_type) = lower(coalesce(v_deal.stock_type, ''))) then
      v_investment_type := v_deal.stock_type;
    elsif exists (select 1 from public.investment_type_risks itr where lower(itr.investment_type) = lower(coalesce(v_deal.deal_type::text, ''))) then
      v_investment_type := v_deal.deal_type::text;
    end if;
  end if;

  select itr.risk_grade, rg.points
  into v_investment_risk_grade, v_investment_points
  from public.investment_type_risks itr
  join public.risk_grades rg on rg.code = itr.risk_grade
  where lower(itr.investment_type) = lower(v_investment_type)
  limit 1;

  v_total_points := coalesce(v_country_points, 0) + coalesce(v_industry_points, 0) + coalesce(v_investment_points, 0);
  v_composite_grade := public.risk_grade_for_points(v_total_points);

  insert into public.deal_risk_profiles (
    deal_id,
    country_risk_grade,
    industry_risk_grade,
    investment_type_risk_grade,
    total_risk_points,
    composite_risk_grade
  ) values (
    v_deal.id,
    v_country_risk_grade,
    v_industry_risk_grade,
    v_investment_risk_grade,
    v_total_points,
    v_composite_grade
  )
  returning id into v_profile_id;

  return v_profile_id;
end;
$$;

create or replace function public.handle_deal_risk_recalc()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.calculate_deal_risk(new.id);
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'deal_risk_recalc_trigger'
  ) then
    create trigger deal_risk_recalc_trigger
      after insert or update of
        vehicle_id,
        deal_type,
        stock_type,
        sector,
        location
      on public.deals
      for each row
      execute function public.handle_deal_risk_recalc();
  end if;
end $$;
