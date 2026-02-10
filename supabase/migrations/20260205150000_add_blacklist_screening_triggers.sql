-- Blacklist screening hooks (US-006) - logging only

create or replace function public.log_blacklist_matches_for_profile(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile record;
  v_full_name text;
  v_inserted integer := 0;
begin
  if p_user_id is null then
    return 0;
  end if;

  select p.id, p.email, p.display_name, p.phone
  into v_profile
  from public.profiles p
  where p.id = p_user_id;

  if not found then
    return 0;
  end if;

  v_full_name := nullif(trim(coalesce(v_profile.display_name, '')), '');

  insert into public.blacklist_matches (
    blacklist_entry_id,
    matched_user_id,
    match_type,
    match_confidence
  )
  select m.blacklist_entry_id,
         v_profile.id,
         m.match_type,
         m.match_confidence
  from public.screen_against_blacklist(
    v_profile.email,
    v_full_name,
    null,
    v_profile.phone,
    null
  ) m;

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

create or replace function public.log_blacklist_matches_for_investor(p_investor_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv record;
  v_full_name text;
  v_entity_name text;
  v_inserted integer := 0;
begin
  if p_investor_id is null then
    return 0;
  end if;

  select
    i.id,
    i.type,
    i.legal_name,
    i.first_name,
    i.last_name,
    i.email,
    i.phone,
    i.tax_id_number
  into v_inv
  from public.investors i
  where i.id = p_investor_id;

  if not found then
    return 0;
  end if;

  if lower(coalesce(v_inv.type, '')) = 'individual' then
    v_full_name := nullif(trim(coalesce(v_inv.first_name, '') || ' ' || coalesce(v_inv.last_name, '')), '');
  else
    v_entity_name := nullif(trim(coalesce(v_inv.legal_name, '')), '');
  end if;

  insert into public.blacklist_matches (
    blacklist_entry_id,
    matched_investor_id,
    match_type,
    match_confidence
  )
  select m.blacklist_entry_id,
         v_inv.id,
         m.match_type,
         m.match_confidence
  from public.screen_against_blacklist(
    v_inv.email,
    v_full_name,
    v_inv.tax_id_number,
    v_inv.phone,
    v_entity_name
  ) m;

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

create or replace function public.handle_profile_blacklist_screening()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.log_blacklist_matches_for_profile(new.id);
  return new;
end;
$$;

create or replace function public.handle_investor_blacklist_screening()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.log_blacklist_matches_for_investor(new.id);
  return new;
end;
$$;

create or replace function public.handle_subscription_blacklist_screening()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.log_blacklist_matches_for_investor(new.investor_id);
  return new;
end;
$$;

create or replace function public.handle_submission_blacklist_screening()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.log_blacklist_matches_for_investor(new.investor_id);
  return new;
end;
$$;

-- triggers

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'profiles_blacklist_screening_trigger'
  ) then
    create trigger profiles_blacklist_screening_trigger
      after insert on public.profiles
      for each row
      execute function public.handle_profile_blacklist_screening();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'investors_blacklist_screening_trigger'
  ) then
    create trigger investors_blacklist_screening_trigger
      after insert on public.investors
      for each row
      execute function public.handle_investor_blacklist_screening();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'subscriptions_blacklist_screening_trigger'
  ) then
    create trigger subscriptions_blacklist_screening_trigger
      after insert on public.subscriptions
      for each row
      execute function public.handle_subscription_blacklist_screening();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'deal_subscription_submissions_blacklist_trigger'
  ) then
    create trigger deal_subscription_submissions_blacklist_trigger
      after insert on public.deal_subscription_submissions
      for each row
      execute function public.handle_submission_blacklist_screening();
  end if;
end $$;
