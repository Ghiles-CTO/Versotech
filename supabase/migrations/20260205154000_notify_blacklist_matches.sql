-- Notify CEO users when a blacklist match is logged (US-006)

create or replace function public.notify_blacklist_match()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entry record;
  v_match_label text;
  v_display_name text;
  v_message text;
  v_ceo record;
begin
  select
    cb.severity,
    cb.full_name,
    cb.entity_name,
    cb.email,
    cb.phone,
    cb.tax_id,
    cb.reason
  into v_entry
  from public.compliance_blacklist cb
  where cb.id = new.blacklist_entry_id;

  v_match_label := case new.match_type
    when 'email_exact' then 'Email match'
    when 'phone_exact' then 'Phone match'
    when 'tax_id_exact' then 'Tax ID match'
    when 'name_exact' then 'Name match'
    when 'entity_name_exact' then 'Entity match'
    when 'name_fuzzy' then 'Name similar'
    when 'entity_name_fuzzy' then 'Entity similar'
    else 'Match'
  end;

  v_display_name := coalesce(
    nullif(trim(coalesce(v_entry.full_name, '')), ''),
    nullif(trim(coalesce(v_entry.entity_name, '')), ''),
    nullif(trim(coalesce(v_entry.email, '')), ''),
    nullif(trim(coalesce(v_entry.phone, '')), ''),
    nullif(trim(coalesce(v_entry.tax_id, '')), ''),
    'Unknown'
  );

  v_message := format(
    'Blacklist %s: %s (%s). Review required.',
    coalesce(v_entry.severity, 'warning'),
    v_display_name,
    v_match_label
  );

  for v_ceo in select user_id from public.ceo_users loop
    insert into public.investor_notifications (
      user_id,
      investor_id,
      title,
      message,
      link,
      type,
      data,
      created_at
    ) values (
      v_ceo.user_id,
      null,
      'Compliance Alert: Blacklist match',
      v_message,
      '/versotech_admin/agents',
      'general',
      jsonb_build_object(
        'blacklist_entry_id', new.blacklist_entry_id,
        'match_type', new.match_type,
        'match_confidence', new.match_confidence,
        'severity', v_entry.severity
      ),
      now()
    );
  end loop;

  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'blacklist_match_notify_trigger'
  ) then
    create trigger blacklist_match_notify_trigger
      after insert on public.blacklist_matches
      for each row
      execute function public.notify_blacklist_match();
  end if;
end $$;
