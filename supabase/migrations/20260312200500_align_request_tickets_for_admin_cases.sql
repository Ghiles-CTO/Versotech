-- Align request_tickets with the admin cases audit view.

begin;

alter table public.request_tickets
  add column if not exists due_date timestamptz,
  add column if not exists assigned_at timestamptz,
  add column if not exists completion_note text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists closed_at timestamptz,
  add column if not exists escalated_at timestamptz,
  add column if not exists escalated_by uuid references public.profiles(id),
  add column if not exists escalation_reason text;

update public.request_tickets
set
  due_date = coalesce(
    due_date,
    coalesce(created_at, now()) +
      case priority
        when 'urgent'::public.request_priority_enum then interval '1 day'
        when 'high'::public.request_priority_enum then interval '2 days'
        when 'low'::public.request_priority_enum then interval '5 days'
        else interval '3 days'
      end
  ),
  assigned_at = coalesce(
    assigned_at,
    case
      when assigned_to is not null then coalesce(updated_at, created_at, now())
      else null
    end
  ),
  completion_note = completion_note,
  updated_at = coalesce(updated_at, created_at, now()),
  closed_at = coalesce(
    closed_at,
    case
      when status in ('closed'::public.request_status_enum, 'cancelled'::public.request_status_enum)
        then coalesce(updated_at, created_at, now())
      else null
    end
  )
where
  due_date is null
  or assigned_at is null
  or updated_at is null
  or (status in ('closed'::public.request_status_enum, 'cancelled'::public.request_status_enum) and closed_at is null);

create or replace function public.request_tickets_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists request_tickets_set_updated_at on public.request_tickets;
create trigger request_tickets_set_updated_at
  before update on public.request_tickets
  for each row
  execute function public.request_tickets_set_updated_at();

create index if not exists idx_request_tickets_created_at on public.request_tickets(created_at desc);
create index if not exists idx_request_tickets_due_date on public.request_tickets(due_date desc);
create index if not exists idx_request_tickets_assigned_status on public.request_tickets(assigned_to, status, created_at desc);
create index if not exists idx_request_tickets_escalated_at on public.request_tickets(escalated_at desc) where escalated_at is not null;

commit;
