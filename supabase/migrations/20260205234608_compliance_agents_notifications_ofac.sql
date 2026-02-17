create table if not exists public.ofac_screenings (
  id uuid primary key default gen_random_uuid(),
  screened_entity_type text not null,
  screened_entity_id uuid,
  screened_name text not null,
  screening_date timestamptz not null default now(),
  result text not null default 'clear',
  match_details text,
  report_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint ofac_screenings_result_check
    check (result in ('clear', 'potential_match', 'match'))
);

create index if not exists ofac_screenings_screening_date_idx
  on public.ofac_screenings (screening_date desc);

create index if not exists ofac_screenings_result_idx
  on public.ofac_screenings (result);

create index if not exists ofac_screenings_entity_idx
  on public.ofac_screenings (screened_entity_type, screened_entity_id);

alter table public.ofac_screenings enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'ofac_screenings'
      and policyname = 'ofac_screenings_select'
  ) then
    create policy ofac_screenings_select
      on public.ofac_screenings
      for select
      using (
        exists (
          select 1
          from public.ceo_users cu
          where cu.user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'ofac_screenings'
      and policyname = 'ofac_screenings_insert'
  ) then
    create policy ofac_screenings_insert
      on public.ofac_screenings
      for insert
      with check (
        exists (
          select 1
          from public.ceo_users cu
          where cu.user_id = auth.uid()
            and cu.role = 'admin'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'ofac_screenings'
      and policyname = 'ofac_screenings_update'
  ) then
    create policy ofac_screenings_update
      on public.ofac_screenings
      for update
      using (
        exists (
          select 1
          from public.ceo_users cu
          where cu.user_id = auth.uid()
            and cu.role = 'admin'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'ofac_screenings'
      and policyname = 'ofac_screenings_delete'
  ) then
    create policy ofac_screenings_delete
      on public.ofac_screenings
      for delete
      using (
        exists (
          select 1
          from public.ceo_users cu
          where cu.user_id = auth.uid()
            and cu.role = 'admin'
        )
      );
  end if;
end $$;
