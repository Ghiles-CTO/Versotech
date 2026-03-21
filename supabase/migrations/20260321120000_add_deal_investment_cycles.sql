-- Add canonical investment cycle records so one investor can hold
-- one live workflow at a time on a deal, while preserving sequential history.

create table if not exists public.deal_investment_cycles (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  user_id uuid null references public.profiles(id) on delete cascade,
  investor_id uuid not null references public.investors(id) on delete cascade,
  term_sheet_id uuid not null references public.deal_fee_structures(id) on delete restrict,
  role public.deal_member_role not null default 'investor',
  referred_by_entity_id uuid null,
  referred_by_entity_type text null,
  assigned_fee_plan_id uuid null references public.fee_plans(id) on delete set null,
  sequence_number integer not null default 1,
  status text not null default 'dispatched',
  created_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  dispatched_at timestamptz null,
  viewed_at timestamptz null,
  interest_confirmed_at timestamptz null,
  submission_pending_at timestamptz null,
  approved_at timestamptz null,
  pack_generated_at timestamptz null,
  pack_sent_at timestamptz null,
  signed_at timestamptz null,
  funded_at timestamptz null,
  activated_at timestamptz null,
  cancelled_at timestamptz null,
  rejected_at timestamptz null,
  rejection_reason text null,
  metadata jsonb not null default '{}'::jsonb,
  constraint deal_investment_cycles_status_check check (
    status = any (
      array[
        'dispatched'::text,
        'viewed'::text,
        'interest_confirmed'::text,
        'submission_pending_review'::text,
        'approved'::text,
        'pack_generated'::text,
        'pack_sent'::text,
        'signed'::text,
        'funded'::text,
        'active'::text,
        'cancelled'::text,
        'rejected'::text
      ]
    )
  ),
  constraint deal_investment_cycles_referrer_type_check check (
    referred_by_entity_type is null
    or referred_by_entity_type = any (array['partner'::text, 'introducer'::text, 'commercial_partner'::text])
  )
);

alter table public.deal_investment_cycles
  alter column user_id drop not null;

comment on table public.deal_investment_cycles is
  'Canonical workflow cycles for investor dispatch, subscription, funding, and activation per deal + term sheet.';

create index if not exists idx_deal_investment_cycles_deal_investor
  on public.deal_investment_cycles(deal_id, investor_id, created_at desc);

create index if not exists idx_deal_investment_cycles_term_sheet
  on public.deal_investment_cycles(term_sheet_id, status, created_at desc);

create index if not exists idx_deal_investment_cycles_user
  on public.deal_investment_cycles(user_id, created_at desc);

create unique index if not exists idx_deal_investment_cycles_live_unique
  on public.deal_investment_cycles(deal_id, investor_id)
  where status in (
    'dispatched',
    'viewed',
    'interest_confirmed',
    'submission_pending_review',
    'approved',
    'pack_generated',
    'pack_sent',
    'signed'
  );

drop trigger if exists update_deal_investment_cycles_updated_at on public.deal_investment_cycles;

create trigger update_deal_investment_cycles_updated_at
before update on public.deal_investment_cycles
for each row
execute function public.update_updated_at_column();

alter table public.deal_investment_cycles enable row level security;

drop policy if exists "dic_read" on public.deal_investment_cycles;
create policy "dic_read"
  on public.deal_investment_cycles
  for select
  using (
    user_id = auth.uid()
    or investor_id in (select public.get_my_investor_ids() as get_my_investor_ids)
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (p.role::text like 'staff_%' or p.role = 'ceo')
    )
  );

drop policy if exists "dic_manage" on public.deal_investment_cycles;
create policy "dic_manage"
  on public.deal_investment_cycles
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (p.role::text like 'staff_%' or p.role = 'ceo')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (p.role::text like 'staff_%' or p.role = 'ceo')
    )
  );

grant all on table public.deal_investment_cycles to anon;
grant all on table public.deal_investment_cycles to authenticated;
grant all on table public.deal_investment_cycles to service_role;

alter table public.deal_subscription_submissions
  add column if not exists cycle_id uuid references public.deal_investment_cycles(id) on delete set null,
  add column if not exists term_sheet_id uuid references public.deal_fee_structures(id) on delete set null;

alter table public.subscriptions
  add column if not exists cycle_id uuid references public.deal_investment_cycles(id) on delete set null,
  add column if not exists term_sheet_id uuid references public.deal_fee_structures(id) on delete set null;

create index if not exists idx_dss_cycle_id on public.deal_subscription_submissions(cycle_id);
create index if not exists idx_dss_term_sheet_id on public.deal_subscription_submissions(term_sheet_id);
create index if not exists idx_subscriptions_cycle_id on public.subscriptions(cycle_id);
create index if not exists idx_subscriptions_term_sheet_id on public.subscriptions(term_sheet_id);

alter table public.introducer_commissions
  add column if not exists subscription_id uuid references public.subscriptions(id) on delete set null;

alter table public.partner_commissions
  add column if not exists subscription_id uuid references public.subscriptions(id) on delete set null;

alter table public.commercial_partner_commissions
  add column if not exists subscription_id uuid references public.subscriptions(id) on delete set null;

create index if not exists idx_introducer_commissions_subscription
  on public.introducer_commissions(introducer_id, subscription_id)
  where subscription_id is not null;

create index if not exists idx_partner_commissions_subscription
  on public.partner_commissions(partner_id, subscription_id)
  where subscription_id is not null;

create index if not exists idx_commercial_partner_commissions_subscription
  on public.commercial_partner_commissions(commercial_partner_id, subscription_id)
  where subscription_id is not null;

with partner_commission_candidates as (
  select
    pc.id as commission_id,
    pc.partner_id,
    s.id as subscription_id,
    row_number() over (
      partition by pc.id
      order by coalesce(s.subscription_date, s.created_at), s.id
    ) as candidate_rank,
    count(*) over (partition by pc.id) as candidate_count,
    count(*) over (partition by pc.partner_id, s.id) as subscription_match_count
  from public.partner_commissions pc
  join public.subscriptions s
    on s.deal_id = pc.deal_id
   and s.investor_id = pc.investor_id
   and (pc.fee_plan_id is null or s.fee_plan_id = pc.fee_plan_id)
  where pc.subscription_id is null
),
introducer_commission_candidates as (
  select
    ic.id as commission_id,
    s.id as subscription_id,
    row_number() over (
      partition by ic.id
      order by coalesce(s.subscription_date, s.created_at), s.id
    ) as candidate_rank,
    count(*) over (partition by ic.id) as candidate_count
  from public.introducer_commissions ic
  join public.subscriptions s
    on s.deal_id = ic.deal_id
   and s.investor_id = ic.investor_id
   and (ic.fee_plan_id is null or s.fee_plan_id = ic.fee_plan_id)
   and (ic.introduction_id is null or s.introduction_id = ic.introduction_id)
   and (ic.introducer_id is null or s.introducer_id = ic.introducer_id)
  where ic.subscription_id is null
),
commercial_partner_commission_candidates as (
  select
    cpc.id as commission_id,
    s.id as subscription_id,
    row_number() over (
      partition by cpc.id
      order by coalesce(s.subscription_date, s.created_at), s.id
    ) as candidate_rank,
    count(*) over (partition by cpc.id) as candidate_count
  from public.commercial_partner_commissions cpc
  join public.subscriptions s
    on s.deal_id = cpc.deal_id
   and s.investor_id = cpc.investor_id
   and (cpc.fee_plan_id is null or s.fee_plan_id = cpc.fee_plan_id)
  where cpc.subscription_id is null
)
update public.partner_commissions pc
set subscription_id = pcc.subscription_id
from partner_commission_candidates pcc
where pc.id = pcc.commission_id
  and pcc.candidate_rank = 1
  and pcc.candidate_count = 1
  and pcc.subscription_match_count = 1
  and pc.subscription_id is null;

with introducer_commission_candidates as (
  select
    ic.id as commission_id,
    ic.introducer_id,
    s.id as subscription_id,
    row_number() over (
      partition by ic.id
      order by coalesce(s.subscription_date, s.created_at), s.id
    ) as candidate_rank,
    count(*) over (partition by ic.id) as candidate_count,
    count(*) over (partition by ic.introducer_id, s.id) as subscription_match_count
  from public.introducer_commissions ic
  join public.subscriptions s
    on s.deal_id = ic.deal_id
   and s.investor_id = ic.investor_id
   and (ic.fee_plan_id is null or s.fee_plan_id = ic.fee_plan_id)
   and (ic.introduction_id is null or s.introduction_id = ic.introduction_id)
   and (ic.introducer_id is null or s.introducer_id = ic.introducer_id)
  where ic.subscription_id is null
)
update public.introducer_commissions ic
set subscription_id = icc.subscription_id
from introducer_commission_candidates icc
where ic.id = icc.commission_id
  and icc.candidate_rank = 1
  and icc.candidate_count = 1
  and icc.subscription_match_count = 1
  and ic.subscription_id is null;

with commercial_partner_commission_candidates as (
  select
    cpc.id as commission_id,
    cpc.commercial_partner_id,
    s.id as subscription_id,
    row_number() over (
      partition by cpc.id
      order by coalesce(s.subscription_date, s.created_at), s.id
    ) as candidate_rank,
    count(*) over (partition by cpc.id) as candidate_count,
    count(*) over (partition by cpc.commercial_partner_id, s.id) as subscription_match_count
  from public.commercial_partner_commissions cpc
  join public.subscriptions s
    on s.deal_id = cpc.deal_id
   and s.investor_id = cpc.investor_id
   and (cpc.fee_plan_id is null or s.fee_plan_id = cpc.fee_plan_id)
  where cpc.subscription_id is null
)
update public.commercial_partner_commissions cpc
set subscription_id = cpcc.subscription_id
from commercial_partner_commission_candidates cpcc
where cpc.id = cpcc.commission_id
  and cpcc.candidate_rank = 1
  and cpcc.candidate_count = 1
  and cpcc.subscription_match_count = 1
  and cpc.subscription_id is null;

with ranked_introducer_links as (
  select
    id,
    row_number() over (
      partition by introducer_id, subscription_id
      order by coalesce(updated_at, created_at) desc, id desc
    ) as link_rank
  from public.introducer_commissions
  where subscription_id is not null
)
update public.introducer_commissions ic
set subscription_id = null
from ranked_introducer_links ril
where ic.id = ril.id
  and ril.link_rank > 1;

with ranked_partner_links as (
  select
    id,
    row_number() over (
      partition by partner_id, subscription_id
      order by coalesce(updated_at, created_at) desc, id desc
    ) as link_rank
  from public.partner_commissions
  where subscription_id is not null
)
update public.partner_commissions pc
set subscription_id = null
from ranked_partner_links rpl
where pc.id = rpl.id
  and rpl.link_rank > 1;

with ranked_cp_links as (
  select
    id,
    row_number() over (
      partition by commercial_partner_id, subscription_id
      order by coalesce(updated_at, created_at) desc, id desc
    ) as link_rank
  from public.commercial_partner_commissions
  where subscription_id is not null
)
update public.commercial_partner_commissions cpc
set subscription_id = null
from ranked_cp_links rcpl
where cpc.id = rcpl.id
  and rcpl.link_rank > 1;

drop index if exists public.idx_introducer_commissions_subscription;
drop index if exists public.idx_partner_commissions_subscription;
drop index if exists public.idx_commercial_partner_commissions_subscription;

create unique index if not exists idx_introducer_commissions_subscription_unique
  on public.introducer_commissions(introducer_id, subscription_id)
  where subscription_id is not null;

create unique index if not exists idx_partner_commissions_subscription_unique
  on public.partner_commissions(partner_id, subscription_id)
  where subscription_id is not null;

create unique index if not exists idx_commercial_partner_commissions_subscription_unique
  on public.commercial_partner_commissions(commercial_partner_id, subscription_id)
  where subscription_id is not null;

with subscription_source as (
  select
    s.id as subscription_id,
    s.deal_id,
    coalesce(dm.user_id, iu.user_id, s.proxy_user_id) as user_id,
    s.investor_id,
    coalesce(s.term_sheet_id, s_fp.term_sheet_id, dm.term_sheet_id) as resolved_term_sheet_id,
    coalesce(dm.role, 'investor'::public.deal_member_role) as resolved_role,
    dm.referred_by_entity_id,
    dm.referred_by_entity_type,
    coalesce(s.fee_plan_id, dm.assigned_fee_plan_id) as resolved_fee_plan_id,
    row_number() over (
      partition by s.deal_id, s.investor_id, coalesce(s.term_sheet_id, s_fp.term_sheet_id, dm.term_sheet_id)
      order by coalesce(s.subscription_date, s.created_at), s.id
    ) as sequence_number,
    case
      when s.status = 'active' then 'active'
      when s.status = 'funded' then 'funded'
      when s.status = 'partially_funded' then 'signed'
      when s.status = 'committed' then 'signed'
      when s.status = 'pending' and s.pack_sent_at is not null then 'pack_sent'
      when s.status = 'pending' and s.pack_generated_at is not null then 'pack_generated'
      when s.status = 'cancelled' then 'cancelled'
      else 'approved'
    end as resolved_status,
    coalesce(dm.dispatched_at, s.subscription_date, s.created_at) as dispatched_at,
    dm.viewed_at,
    dm.interest_confirmed_at,
    s.created_at as submission_pending_at,
    coalesce(s.subscription_date, s.created_at) as approved_at,
    s.pack_generated_at,
    s.pack_sent_at,
    s.signed_at,
    s.funded_at,
    s.activated_at,
    s.rejected_at,
    s.rejection_reason
  from public.subscriptions s
  left join lateral (
    select dm.*
    from public.deal_memberships dm
    where dm.deal_id = s.deal_id
      and dm.investor_id = s.investor_id
    order by coalesce(dm.dispatched_at, dm.viewed_at, dm.interest_confirmed_at, dm.accepted_at, dm.invited_at) desc nulls last,
             dm.user_id asc
    limit 1
  ) dm on true
  left join public.fee_plans s_fp
    on s_fp.id = s.fee_plan_id
  left join lateral (
    select iu.user_id
    from public.investor_users iu
    where iu.investor_id = s.investor_id
    order by coalesce(iu.is_primary, false) desc, iu.created_at asc
    limit 1
  ) iu on true
  where s.deal_id is not null
    and s.investor_id is not null
    and s.cycle_id is null
),
inserted_cycles as (
  insert into public.deal_investment_cycles (
    deal_id,
    user_id,
    investor_id,
    term_sheet_id,
    role,
    referred_by_entity_id,
    referred_by_entity_type,
    assigned_fee_plan_id,
    sequence_number,
    status,
    dispatched_at,
    viewed_at,
    interest_confirmed_at,
    submission_pending_at,
    approved_at,
    pack_generated_at,
    pack_sent_at,
    signed_at,
    funded_at,
    activated_at,
    rejected_at,
    rejection_reason,
    metadata
  )
  select
    src.deal_id,
    src.user_id,
    src.investor_id,
    src.resolved_term_sheet_id,
    src.resolved_role,
    src.referred_by_entity_id,
    src.referred_by_entity_type,
    src.resolved_fee_plan_id,
    src.sequence_number,
    src.resolved_status,
    src.dispatched_at,
    src.viewed_at,
    src.interest_confirmed_at,
    src.submission_pending_at,
    src.approved_at,
    src.pack_generated_at,
    src.pack_sent_at,
    src.signed_at,
    src.funded_at,
    src.activated_at,
    src.rejected_at,
    src.rejection_reason,
    jsonb_build_object('backfill_subscription_id', src.subscription_id)
  from subscription_source src
  where src.user_id is not null
    and src.resolved_term_sheet_id is not null
  returning id, metadata, term_sheet_id
)
update public.subscriptions s
set cycle_id = ic.id,
    term_sheet_id = coalesce(s.term_sheet_id, ic.term_sheet_id)
from inserted_cycles ic
where (ic.metadata ->> 'backfill_subscription_id')::uuid = s.id
  and s.cycle_id is null;

update public.deal_subscription_submissions dss
set cycle_id = s.cycle_id,
    term_sheet_id = coalesce(dss.term_sheet_id, s.term_sheet_id)
from public.subscriptions s
where dss.formal_subscription_id = s.id
  and (dss.cycle_id is null or dss.term_sheet_id is null);

with existing_sequences as (
  select
    deal_id,
    investor_id,
    term_sheet_id,
    max(sequence_number) as max_sequence
  from public.deal_investment_cycles
  group by deal_id, investor_id, term_sheet_id
),
submission_source as (
  select
    dss.id as submission_id,
    dss.deal_id,
    coalesce(dm.user_id, iu.user_id, dss.created_by) as user_id,
    dss.investor_id,
    coalesce(dss.term_sheet_id, dm_fp.term_sheet_id, dm.term_sheet_id) as resolved_term_sheet_id,
    coalesce(dm.role, 'investor'::public.deal_member_role) as resolved_role,
    dm.referred_by_entity_id,
    dm.referred_by_entity_type,
    dm.assigned_fee_plan_id,
    coalesce(es.max_sequence, 0) + row_number() over (
      partition by dss.deal_id, dss.investor_id, coalesce(dss.term_sheet_id, dm_fp.term_sheet_id, dm.term_sheet_id)
      order by dss.submitted_at, dss.id
    ) as sequence_number,
    case
      when dss.status = 'approved' then 'approved'
      when dss.status = 'rejected' then 'rejected'
      when dss.status = 'cancelled' then 'cancelled'
      else 'submission_pending_review'
    end as resolved_status,
    row_number() over (
      partition by dss.deal_id, dss.investor_id
      order by dss.submitted_at desc, dss.id desc
    ) as live_rank,
    coalesce(dm.dispatched_at, dss.submitted_at) as dispatched_at,
    dm.viewed_at,
    dm.interest_confirmed_at,
    dss.submitted_at as submission_pending_at,
    dss.approved_at,
    dss.rejected_at,
    dss.rejection_reason
  from public.deal_subscription_submissions dss
  left join lateral (
    select dm.*
    from public.deal_memberships dm
    where dm.deal_id = dss.deal_id
      and dm.investor_id = dss.investor_id
    order by coalesce(dm.dispatched_at, dm.viewed_at, dm.interest_confirmed_at, dm.accepted_at, dm.invited_at) desc nulls last,
             dm.user_id asc
    limit 1
  ) dm on true
  left join public.fee_plans dm_fp
    on dm_fp.id = dm.assigned_fee_plan_id
  left join lateral (
    select iu.user_id
    from public.investor_users iu
    where iu.investor_id = dss.investor_id
    order by coalesce(iu.is_primary, false) desc, iu.created_at asc
    limit 1
  ) iu on true
  left join existing_sequences es
    on es.deal_id = dss.deal_id
   and es.investor_id = dss.investor_id
   and es.term_sheet_id = coalesce(dss.term_sheet_id, dm_fp.term_sheet_id, dm.term_sheet_id)
  where dss.cycle_id is null
    and dss.formal_subscription_id is null
    and not exists (
      select 1
      from public.subscriptions s_existing
      where s_existing.deal_id = dss.deal_id
        and s_existing.investor_id = dss.investor_id
    )
),
inserted_submission_cycles as (
  insert into public.deal_investment_cycles (
    deal_id,
    user_id,
    investor_id,
    term_sheet_id,
    role,
    referred_by_entity_id,
    referred_by_entity_type,
    assigned_fee_plan_id,
    sequence_number,
    status,
    dispatched_at,
    viewed_at,
    interest_confirmed_at,
    submission_pending_at,
    approved_at,
    rejected_at,
    rejection_reason,
    metadata
  )
  select
    src.deal_id,
    src.user_id,
    src.investor_id,
    src.resolved_term_sheet_id,
    src.resolved_role,
    src.referred_by_entity_id,
    src.referred_by_entity_type,
    src.assigned_fee_plan_id,
    src.sequence_number,
    src.resolved_status,
    src.dispatched_at,
    src.viewed_at,
    src.interest_confirmed_at,
    src.submission_pending_at,
    src.approved_at,
    src.rejected_at,
    src.rejection_reason,
    jsonb_build_object('backfill_submission_id', src.submission_id)
  from submission_source src
  where src.user_id is not null
    and src.resolved_term_sheet_id is not null
    and (
      src.resolved_status not in ('submission_pending_review', 'approved', 'pack_generated', 'pack_sent', 'signed')
      or src.live_rank = 1
    )
  returning id, metadata, term_sheet_id
)
update public.deal_subscription_submissions dss
set cycle_id = isc.id,
    term_sheet_id = coalesce(dss.term_sheet_id, isc.term_sheet_id)
from inserted_submission_cycles isc
where (isc.metadata ->> 'backfill_submission_id')::uuid = dss.id
  and dss.cycle_id is null;

with existing_sequences as (
  select
    deal_id,
    investor_id,
    term_sheet_id,
    max(sequence_number) as max_sequence
  from public.deal_investment_cycles
  group by deal_id, investor_id, term_sheet_id
),
membership_source as (
  select *
  from (
    select
      dm.deal_id,
      dm.user_id,
      dm.investor_id,
      dm.term_sheet_id,
      dm.role,
      dm.referred_by_entity_id,
      dm.referred_by_entity_type,
      dm.assigned_fee_plan_id,
      coalesce(es.max_sequence, 0) + 1 as sequence_number,
      case
        when dm.interest_confirmed_at is not null then 'interest_confirmed'
        when dm.viewed_at is not null then 'viewed'
        else 'dispatched'
      end as resolved_status,
      dm.dispatched_at,
      dm.viewed_at,
      dm.interest_confirmed_at,
      row_number() over (
        partition by dm.deal_id, dm.investor_id
        order by coalesce(dm.dispatched_at, dm.viewed_at, dm.interest_confirmed_at, dm.accepted_at, dm.invited_at) desc nulls last,
                 dm.user_id asc
      ) as membership_rank
    from public.deal_memberships dm
    left join existing_sequences es
      on es.deal_id = dm.deal_id
     and es.investor_id = dm.investor_id
     and es.term_sheet_id = dm.term_sheet_id
    where dm.investor_id is not null
      and dm.term_sheet_id is not null
      and not exists (
        select 1
        from public.deal_investment_cycles dic
        where dic.deal_id = dm.deal_id
          and dic.investor_id = dm.investor_id
      )
  ) ranked_memberships
  where membership_rank = 1
)
insert into public.deal_investment_cycles (
  deal_id,
  user_id,
  investor_id,
  term_sheet_id,
  role,
  referred_by_entity_id,
  referred_by_entity_type,
  assigned_fee_plan_id,
  sequence_number,
  status,
  dispatched_at,
  viewed_at,
  interest_confirmed_at,
  metadata
)
select
  src.deal_id,
  src.user_id,
  src.investor_id,
  src.term_sheet_id,
  src.role,
  src.referred_by_entity_id,
  src.referred_by_entity_type,
  src.assigned_fee_plan_id,
  src.sequence_number,
  src.resolved_status,
  src.dispatched_at,
  src.viewed_at,
  src.interest_confirmed_at,
  jsonb_build_object('backfill_membership_user_id', src.user_id)
from membership_source src;
