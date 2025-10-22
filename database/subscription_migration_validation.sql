-- Validation helpers for legacy subscription migration

-- 1. Compare staged vehicle totals vs workbook summary vs live subscriptions
with latest_run as (
  select id
  from subscription_workbook_runs
  order by created_at desc
  limit 1
),
staged as (
  select vehicle_code,
         sum(coalesce(amount_converted, amount_original)) as staged_amount
  from stg_subscription_lines
  where run_id = (select id from latest_run)
  group by vehicle_code
),
live as (
  select v.name as vehicle_name,
         sum(s.commitment) as live_amount
  from subscriptions s
  join vehicles v on v.id = s.vehicle_id
  where s.acknowledgement_notes ->> 'run_id' = (select id::text from latest_run)
  group by v.name
)
select ss.vehicle_code,
       ss.vehicle_name,
       staged.staged_amount,
       live.live_amount
from stg_subscription_summary ss
left join staged on staged.vehicle_code = ss.vehicle_code
left join live on live.vehicle_name = ss.vehicle_name
where ss.run_id = (select id from latest_run)
order by ss.vehicle_code;

-- 2. Identify staging rows without mapped status or investor
select vehicle_code,
       investor_display_name,
       status_raw,
       status_mapped,
       amount_original,
       source_sheet,
       source_row
from stg_subscription_lines
where run_id = (select id from subscription_workbook_runs order by created_at desc limit 1)
  and (status_mapped is null or investor_display_name is null);

-- 3. Check investors missing allocation links after load
select s.id as subscription_id,
       s.investor_id,
       s.vehicle_id
from subscriptions s
left join entity_investors ei
  on ei.subscription_id = s.id
where s.acknowledgement_notes ->> 'run_id' = (
  select id::text from subscription_workbook_runs order by created_at desc limit 1
)
  and ei.id is null;

-- 4. Summaries per investor for reconciliation reports
select i.legal_name,
       v.name as vehicle_name,
       s.commitment,
       s.status,
       s.effective_date
from subscriptions s
join investors i on i.id = s.investor_id
join vehicles v on v.id = s.vehicle_id
where s.acknowledgement_notes ->> 'run_id' = (
  select id::text from subscription_workbook_runs order by created_at desc limit 1
)
order by i.legal_name, v.name;

