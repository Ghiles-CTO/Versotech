-- Avoid defaulting to low risk when inputs are missing

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

  if v_country_risk_grade is null
     or v_industry_risk_grade is null
     or v_investment_risk_grade is null then
    v_composite_grade := null;
  else
    v_composite_grade := public.risk_grade_for_points(v_total_points);
  end if;

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
