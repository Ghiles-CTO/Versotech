-- Add assignee support to KYC submissions and DB-driven reviewer routing config.

alter table public.kyc_submissions
  add column if not exists assigned_to uuid references public.profiles(id);

create index if not exists idx_kyc_submissions_assigned_to
  on public.kyc_submissions(assigned_to);

create table if not exists public.kyc_routing_config (
  id uuid primary key default gen_random_uuid(),
  primary_reviewer_email text not null,
  fallback_reviewer_email text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_kyc_routing_config_active
  on public.kyc_routing_config(is_active);

-- Ensure one active routing row at a time (optional but useful safety).
create unique index if not exists idx_kyc_routing_config_single_active
  on public.kyc_routing_config((is_active))
  where is_active = true;

insert into public.kyc_routing_config (
  primary_reviewer_email,
  fallback_reviewer_email,
  is_active
)
values (
  'jmachot@versoholdings.com',
  'fdemargne@versoholdings.com',
  true
)
on conflict do nothing;
