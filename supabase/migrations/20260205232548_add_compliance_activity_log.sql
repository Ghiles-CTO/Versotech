create table if not exists public.compliance_activity_log (
  id uuid primary key default gen_random_uuid(),
  event_type text,
  description text,
  related_investor_id uuid references public.investors(id) on delete set null,
  related_deal_id uuid references public.deals(id) on delete set null,
  agent_id uuid references public.ai_agents(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists compliance_activity_log_created_at_idx
  on public.compliance_activity_log (created_at desc);

create index if not exists compliance_activity_log_event_type_idx
  on public.compliance_activity_log (event_type);

create index if not exists compliance_activity_log_related_investor_idx
  on public.compliance_activity_log (related_investor_id);

create index if not exists compliance_activity_log_related_deal_idx
  on public.compliance_activity_log (related_deal_id);

create index if not exists compliance_activity_log_agent_id_idx
  on public.compliance_activity_log (agent_id);

alter table public.compliance_activity_log enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'compliance_activity_log'
      and policyname = 'compliance_activity_log_select'
  ) then
    create policy compliance_activity_log_select
      on public.compliance_activity_log
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
      and tablename = 'compliance_activity_log'
      and policyname = 'compliance_activity_log_insert'
  ) then
    create policy compliance_activity_log_insert
      on public.compliance_activity_log
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
      and tablename = 'compliance_activity_log'
      and policyname = 'compliance_activity_log_update'
  ) then
    create policy compliance_activity_log_update
      on public.compliance_activity_log
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
      and tablename = 'compliance_activity_log'
      and policyname = 'compliance_activity_log_delete'
  ) then
    create policy compliance_activity_log_delete
      on public.compliance_activity_log
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
