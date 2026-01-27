-- VC106 exact duplicate commissions (all fields except id/created_at)
with ranked as (
  select id,
         row_number() over (
           partition by introducer_id, deal_id, investor_id, basis_type, tier_number,
                        rate_bps, accrual_amount, currency, status, introduction_id, base_amount
           order by created_at, id
         ) as rn
  from introducer_commissions
  where deal_id = '07eff085-9f1d-4e02-b1e2-d717817503f1'::uuid
)
delete from introducer_commissions c
using ranked r
where c.id = r.id and r.rn > 1;